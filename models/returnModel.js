const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let returnModel = db.define('return', {

    returnID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        unique: 'compositeIndex',
        primaryKey: true
    },
    type:{
        type: Sequelize.ENUM,
        values: ['department', 'staff']
    },
    departmentID: {
        type: Sequelize.INTEGER,
        allow: null
    },
    militaryNo: {
        type: Sequelize.INTEGER,
        allow: null
    },
    date: {
        type: Sequelize.DATE
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
    returnModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        date: Joi.date().required(),
        type: Joi.string().allow(''),
        departmentID: Joi.string().allow(''),
        militaryNo: Joi.string().allow(''),
        returnID: Joi.number().allow(''),
        action: Joi.string().allow(''),
        itemNo: Joi.number().allow(''),
        ItemSearch: Joi.string().allow(''),
        itemID: Joi.array().allow(''),
        itemSl: Joi.array().allow(''),
        quantity: Joi.array().allow('')
    };

    return Joi.validate(req, schema);
}

exports.returnModel = returnModel;
exports.validate = validate;

