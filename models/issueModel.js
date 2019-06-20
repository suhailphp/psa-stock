const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let issueModel = db.define('issue', {

    issueID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true,
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
    },
    userID: {
        type: Sequelize.INTEGER
    },
    warehouseID: {
        type: Sequelize.INTEGER
    },
    idaraID: {
        type: Sequelize.INTEGER
    },
    traslNO: {
        type: Sequelize.STRING(255)
    },
    description:{
        type: Sequelize.STRING(255)
    }
});


if (config.DB['SYNC']) {
    issueModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        date: Joi.date().required(),
        type: Joi.string().allow(''),
        departmentID: Joi.string().allow(''),
        militaryNo: Joi.string().allow(''),
        issueID: Joi.number().allow(''),
        action: Joi.string().allow(''),
        itemNo: Joi.number().allow(''),
        ItemSearch: Joi.string().allow(''),
        itemID: Joi.array().allow(''),
        itemSl: Joi.array().allow(''),
        quantity: Joi.array().allow(''),
        idaraID: Joi.string().allow(''),
        traslNO: Joi.string().allow(''),
        description: Joi.string().allow('')
    };

    return Joi.validate(req, schema);
}

exports.issueModel = issueModel;
exports.validate = validate;

