const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let purchaseModel = db.define('purchase', {

    purchaseID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    referenceNo: {
        type: Sequelize.STRING(255)
    },
    supplierID: {
        type: Sequelize.INTEGER
    },
    date: {
        type: Sequelize.DATE
    },
    total: {
        type: Sequelize.FLOAT
    },
    taxRate: {
        type: Sequelize.FLOAT
    },
    taxAmount: {
        type: Sequelize.FLOAT
    },
    discount: {
        type: Sequelize.FLOAT,
        defaultValue : 0
    },
    totalAmount: {
        type: Sequelize.FLOAT
    },
    itemNo: {
        type: Sequelize.FLOAT
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
    purchaseModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        referenceNo: Joi.string().required(),
        supplierID: Joi.number().required(),
        date: Joi.date().required(),
        total: Joi.number().allow(0),
        taxRate: Joi.string().allow(0),
        taxAmount: Joi.string().allow(0),
        discount: Joi.string().allow(''),
        totalAmount: Joi.number().allow(0),
        purchaseID: Joi.number().allow(''),
        action: Joi.string().allow(''),
        itemNo: Joi.number().allow(''),
        ItemSearch: Joi.string().allow(''),
        itemID: Joi.array().allow(''),
        itemSl: Joi.array().allow(''),
        price: Joi.array().allow(''),
        amount: Joi.array().allow(''),
        quantity: Joi.array().allow('')
    };

    return Joi.validate(req, schema);
}

exports.purchaseModel = purchaseModel;
exports.validate = validate;

