const fs = require('fs')
const express = require("express");
const path = require("path");
const config = require('config');
const session = require("express-session");
const exphbr = require("express-handlebars");
const helper = require('./utilities/helper');
const bodyParser = require('body-parser');
const infoMsg = require("./middleware/infoMsg");

const app = express();



app.use('', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


//session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));



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

//for listen
const port = config.PORT;
app.listen(port, ()=>{
    console.log('Application running on port '+port);
});

//console.log(config.BASE_URL);