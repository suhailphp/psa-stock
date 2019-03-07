const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let tempItemModel = db.define('items', {

    tempItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },

    name: {
        type: Sequelize.STRING(255)
    }
});


if (config.DB['SYNC']) {
    tempItemModel.sync({force: config.DB['SYNC_FORCE']});
}


exports.tempItemModel = tempItemModel;


