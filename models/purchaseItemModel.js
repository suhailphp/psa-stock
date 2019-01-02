const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let purchaseItemModel = db.define('purchase_item', {

    purchaseItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    purchaseID:{
        type: Sequelize.INTEGER
    },
    itemID: {
        type: Sequelize.INTEGER
    },
    itemSl: {
        type: Sequelize.INTEGER
    },
    amount: {
        type: Sequelize.FLOAT
    },
    quantity: {
        type: Sequelize.FLOAT
    },
    price: {
        type: Sequelize.FLOAT
    }


});


if (config.DB['SYNC']) {
    purchaseItemModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.purchaseItemModel = purchaseItemModel;



