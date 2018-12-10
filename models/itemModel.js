const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let itemModel = db.define('items', {

    itemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    barcode: {
        type: Sequelize.STRING(255)
    },
    name: {
        type: Sequelize.STRING(255)
    },
    description: {
      type: Sequelize.STRING(1000)
    },
    categoryID: {
        type: Sequelize.INTEGER
    },
    amount: {
        type: Sequelize.FLOAT
    },
    openingStock: {
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
    itemModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        barcode: Joi.string().required(),
        name: Joi.string().min(3).required(),
        description: Joi.string().allow(''),
        amount: Joi.number().allow(0),
        categoryID: Joi.number().allow(0),
        openingStock: Joi.number().allow(0),
        itemID: Joi.string().allow(''),
        action: Joi.string().allow('')
    };

    return Joi.validate(req, schema);
}

exports.itemModel = itemModel;
exports.validate = validate;

