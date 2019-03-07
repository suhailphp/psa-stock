const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let nonStockItemModel = db.define('nonStock_item', {

    nonStockItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    nonStockID:{
        type: Sequelize.INTEGER
    },
    itemName: {
        type: Sequelize.STRING(255)
    },
    unitID: {
        type: Sequelize.INTEGER
    },
    barcode: {
        type: Sequelize.STRING(255)
    },
    quantity: {
        type: Sequelize.FLOAT
    },
    itemSl:{
        type: Sequelize.INTEGER
    }


});


if (config.DB['SYNC']) {
    nonStockItemModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.nonStockItemModel = nonStockItemModel;



