const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let departmentModel = db.define('departments', {

    departmentID:{
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
    departmentModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.departmentModel = departmentModel;


