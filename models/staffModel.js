const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let staffModel = db.define('staff', {

    militaryNo:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        unique: 'compositeIndex',
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255)
    },
    rank: {
        type: Sequelize.STRING(255)
    },
    departmentID: {
        type: Sequelize.INTEGER
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
    staffModel.sync({force: config.DB['SYNC_FORCE']});
}


exports.staffModel = staffModel;

