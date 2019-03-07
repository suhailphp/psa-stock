const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let nonStockModel = db.define('nonStock', {

    nonStockID:{
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
    attachment:{
        type: Sequelize.STRING(255)
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
    nonStockModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = Joi.object({
        referenceNo: Joi.string().required(),
        billNo: Joi.string().required(),
        LPONo: Joi.string().required(),
        supplierID: Joi.number().required(),
        warehouseID: Joi.number().required(),
        date: Joi.date().required(),
        LPODate: Joi.date().required(),
    }).unknown();

    return Joi.validate(req, schema);
}

exports.nonStockModel = nonStockModel;
exports.validate = validate;

