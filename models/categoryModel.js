const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let categoryModel = db.define('categories', {

    categoryID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        unique: 'compositeIndex',
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
    categoryModel.sync({force: config.DB['SYNC_FORCE']});
}

function validate(req){
    const schema = {
        name: Joi.string().min(5).required(),
        categoryID: Joi.string().allow(''),
        action: Joi.string().allow('')
    };

    return Joi.validate(req, schema);
}

exports.categoryModel = categoryModel;
exports.validate = validate;

