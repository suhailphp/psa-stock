const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let idaraModel = db.define('idara', {

    idaraID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255)
    },
    createdOn: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedOn: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});


if (config.DB['SYNC']) {
    idaraModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.idaraModel = idaraModel;

