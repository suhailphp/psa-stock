const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let taxInvoiceModel = db.define('taxInvoice', {

    taxInvoiceID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    referenceNo: {
        type: Sequelize.INTEGER
    },
    date: {
        type: Sequelize.DATE
    },
    customer: {
        type: Sequelize.STRING(255)
    },
    title: {
        type: Sequelize.STRING(500)
    },
    customerTRN: {
        type: Sequelize.STRING(255)
    },
    note: {
        type: Sequelize.STRING(500)
    },
    totalAmount: {
        type: Sequelize.FLOAT
    },
    tax: {
        type: Sequelize.FLOAT
    },
    grandTotal: {
        type: Sequelize.FLOAT
    },

    userID: {
        type: Sequelize.INTEGER
    },

    itemNo: {
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
    taxInvoiceModel.sync({force: config.DB['SYNC_FORCE']});
}

exports.taxInvoiceModel = taxInvoiceModel;


