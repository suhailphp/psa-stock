const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let departmentModel = db.define('departments', {

    departmentID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        unique: 'compositeIndex',
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
    departmentModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.departmentModel = departmentModel;


