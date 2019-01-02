const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let supplierModel = db.define('supplier', {

    supplierID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255)
    },
    mobile: {
        type: Sequelize.STRING(255)
    },
    email: {
        type: Sequelize.STRING(255)
    },
    address: {
        type: Sequelize.STRING(500)
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
    supplierModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        name: Joi.string().min(3).required(),
        mobile: Joi.number().min(10).required(),
        email: Joi.string().allow(''),
        address: Joi.string().allow(''),
        supplierID: Joi.string().allow(''),
        action: Joi.string().allow('')
    };

    return Joi.validate(req, schema);
}

exports.supplierModel = supplierModel;
exports.validate = validate;

