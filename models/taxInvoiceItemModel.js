const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let taxInvoiceItemModel = db.define('taxInvoice_items', {

    taxInvoiceItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    taxInvoiceID:{
        type: Sequelize.INTEGER
    },
    itemSl:{
        type: Sequelize.INTEGER
    },
    itemName: {
        type: Sequelize.STRING(255)
    },
    quantity: {
        type: Sequelize.FLOAT
    },
    price: {
        type: Sequelize.FLOAT
    },
    amount: {
        type: Sequelize.FLOAT
    }


});


if (config.DB['SYNC']) {
    taxInvoiceItemModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.taxInvoiceItemModel = taxInvoiceItemModel;



