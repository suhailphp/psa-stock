const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let warehouseModel = db.define('warehouses', {

    warehouseID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    name: {
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
    warehouseModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        name: Joi.string().min(5).required(),
        warehouseID: Joi.number().allow(''),
        action: Joi.string().allow('')
    };

    return Joi.validate(req, schema);
}

exports.warehouseModel = warehouseModel;
exports.validate = validate;

