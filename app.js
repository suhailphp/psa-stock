const fs = require('fs');
const express = require("express");
const morgan = require('morgan')
const path = require("path");
const session = require("express-session");
var redisStore = require('connect-redis')(session);
const exphbr = require("express-handlebars");
const helper = require('./utilities/helper');
const bodyParser = require('body-parser');
const infoMsg = require("./middleware/infomsg");
let config = require('./config/app.js')

const ENV = config.ENV

const app = express();



app.use('', express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json', limit: '50mb'}));

//session
app.set('trust proxy', 1) // trust first proxy
/**
 *
 *   Session Config
 *   Stores in Redis
 *
 */
const redis = require('redis')
let client = redis.createClient()
app.use(session({
    name: 'PSA-STORE',
    resave: false,
    saveUninitialized: false, // don't create session until something stored
    secret: 'sdfdsfds&^%*&^%*dsfdsfdsf&',
    cookie: {maxAge: 7 * 24 * 60 * 1000}, // Default 1 Day , On Remember me 7 Days
    store: new redisStore({prefix: 'PSA-STORE-SESS:', client}),
    expires: true
}));


//auth
const strategy = require('./middleware/strategy');
app.use(strategy({
    authServerURL: config.AUTH.SERVER_URL,
    hostURL: config.HOST_URL,
    clientID: config.AUTH.CLIENT_ID,
    clientSecret: config.AUTH.CLIENT_SECRET,
    sessionKey: 'UserName',
    failureRedirect: '/login?error=1'
}))



//handle bars
let hbs = exphbr.create({
    defaultLayout: 'main',
    extname      : '.html',
    partialsDir: [
        'views/includes/',
    ],
    helpers: helper
});
app.engine('.html', hbs.engine);
app.set('view engine', '.html');



//for info messages
app.use(infoMsg);


/**
 *
 *  set requests logs
 *
 */


morgan.token('realclfdate', function (req, res) {
    const clfmonth = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const pad2 = function (num) {
        const str = String(num);

        return (str.length === 1 ? '0' : '')
            + str;
    };
    const dateTime = new Date();
    const date = dateTime.getDate();
    const hour = dateTime.getHours();
    const mins = dateTime.getMinutes();
    const secs = dateTime.getSeconds();
    const year = dateTime.getFullYear();
    let timezoneofset = dateTime.getTimezoneOffset();
    const sign = timezoneofset > 0 ? '-' : '+';
    timezoneofset = parseInt(Math.abs(timezoneofset) / 60);
    const month = clfmonth[dateTime.getUTCMonth()];

    return pad2(hour) + ':' + pad2(mins) + ':' + pad2(secs)
        + ' ' + sign + pad2(timezoneofset) + '00' + ' : ' +
        pad2(date) + '/' + month + '/' + year;
});
morgan.token('ip', function (req, res) {
    return req.header('x-forwarded-for') || req.ip;
});
morgan.token('userName', function (req, res) {
    return req.User ? req.User.UserName : '';
});
app.use(morgan((ENV === "production" ?
    ':status :method :response-time ms ' +
    'Time | :realclfdate ' +
    'User | :userName ' +
    'Content_Length | :req[content-length] -> :res[content-length] URL | :url  ' +
    'IP |  :ip - :remote-user ' +
    'Agent |   ":referrer" ":user-agent"' :
    'dev'), {
    skip: function (req, res) {
        return res.statusCode == 304 ||
            req.originalUrl.startsWith("/pages/") ||
            req.originalUrl.startsWith("/assets/") ||
            req.originalUrl.startsWith("/plugins/") ||
            req.originalUrl.startsWith("/browser-sync/")
    }
}));


//adding controllers
fs.readdirSync(__dirname + '/controller/').forEach(function (file) {
    if (file.substr(-3) == '.js') {
        app.use(
            (
                file.replace('.js', '') === 'index'
                    ?
                    '/'
                    :
                    path.join('/', file.replace('.js', ''))
            )
            ,
            require(__dirname + '/controller/' + file)
        );
    }
});

//morgan






app.set('port', config.PORT);

module.exports = app