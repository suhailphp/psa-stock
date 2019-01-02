const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let returnItemModel = db.define('return_item', {

    returnItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    returnID:{
        type: Sequelize.INTEGER
    },
    itemID: {
        type: Sequelize.INTEGER
    },
    itemSl: {
        type: Sequelize.INTEGER
    },
    quantity: {
        type: Sequelize.FLOAT
    }


});


if (config.DB['SYNC']) {
    returnItemModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.returnItemModel = returnItemModel;



