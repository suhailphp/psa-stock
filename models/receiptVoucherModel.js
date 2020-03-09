const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let receiptVoucherModel = db.define('receiptVoucher', {

    receiptVoucherID:{
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
    sumOfDhm:{
        type: Sequelize.STRING(500)
    },
    cash:{
        type: Sequelize.STRING(500)
    },
    chequeNo: {
        type: Sequelize.STRING(100)
    },
    bank: {
        type: Sequelize.STRING(100)
    },
    chequeDate: {
       type: Sequelize.DATE
    },

    statement: {
        type: Sequelize.STRING(500)
    },

    grandTotal: {
        type: Sequelize.FLOAT
    },

    userID: {
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
    receiptVoucherModel.sync({force: config.DB['SYNC_FORCE']});
}

exports.receiptVoucherModel = receiptVoucherModel;


