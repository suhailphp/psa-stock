const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let purchaseModel = db.define('purchase', {

    purchaseID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    referenceNo: {
        type: Sequelize.INTEGER
    },
    billNo: {
        type: Sequelize.STRING(255)
    },
    LPONo: {
        type: Sequelize.STRING(255)
    },
    supplierID: {
        type: Sequelize.INTEGER
    },
    date: {
        type: Sequelize.DATE
    },
    LPODate: {
        type: Sequelize.DATE
    },
    warehouseID: {
        type: Sequelize.INTEGER
    },
    itemNo: {
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
    purchaseModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        referenceNo: Joi.string().required(),
        billNo: Joi.string().required(),
        LPONo: Joi.string().required(),
        supplierID: Joi.number().required(),
        warehouseID: Joi.number().required(),
        date: Joi.date().required(),
        LPODate: Joi.date().required(),
        purchaseID: Joi.number().allow(''),
        action: Joi.string().allow(''),
        itemNo: Joi.number().allow(''),
        ItemSearch: Joi.string().allow(''),
        itemID: Joi.array().allow(''),
        unitID: Joi.array().allow(''),
        itemSl: Joi.array().allow(''),
        quantity: Joi.array().allow('')
    };

    return Joi.validate(req, schema);
}

exports.purchaseModel = purchaseModel;
exports.validate = validate;

