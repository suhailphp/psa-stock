const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let completionCertificateCompanyModel = db.define('completionCertificateCompany', {

    completionCertificateCompanyID:{
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

    inform: {
        type: Sequelize.STRING(255)
    },

    invoiceNo: {
        type: Sequelize.STRING(255)
    },

    invoiceDate: {
        type: Sequelize.STRING(255)
    },

    amount: {
        type: Sequelize.STRING(255)
    },

    statement: {
        type: Sequelize.STRING(255)
    },


    notes: {
        type: Sequelize.STRING(1000)
    },

    userID: {
        type: Sequelize.INTEGER
    },

    signature:{
        type: Sequelize.TEXT
    },

    rating: {
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
    completionCertificateCompanyModel.sync({force: config.DB['SYNC_FORCE']});
}


exports.completionCertificateCompanyModel = completionCertificateCompanyModel;


