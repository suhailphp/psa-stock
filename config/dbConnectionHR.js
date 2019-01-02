
let Config = require('./app')
var Sequelize = require('sequelize');
// var Config = require('./config');

var dbName = Config.DB['DATABASE'] || 'PSAHR';
var dbUsername = Config.DB['USERNAME'] || 'testhr';
var dbPassword = Config.DB['PASSWORD'] || 'psahr';
var db = Config.DB['DIALECT'] || 'mssql';
var dbHost = Config.DB['HOST'] || '172.16.1.29'; //ip srv-db .29 src-prod1 .23
var dbPort = Config.DB['PORT'] || 1433;

var db = new Sequelize(dbName, dbUsername, dbPassword, {
    host: dbHost,
    dialect: db,
    port: dbPort,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        encrypt: true
    },
    logging: Config.DB['QUERY_LOG'],
    operatorsAliases: {}
});
//ID=testhr;Password=psahr;"

//var db = new Sequelize('mysql://localhost/psa?characterEncoding=UTF-8&useUnicode=yes');

// test connection
db.authenticate()
    .then(function (err) {
        console.log('srv-prd1 DB ' + dbName + 'Connection has been established successfully.');
    })
    .catch(function (err) {
        console.error('Unable to connect to the srv-db database:', err);
    });

module.exports = db;