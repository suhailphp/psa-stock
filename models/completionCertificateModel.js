const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let completionCertificateModel = db.define('completionCertificate', {

    completionCertificateID:{
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

    amount: {
        type: Sequelize.STRING(255)
    },

    customerName: {
        type: Sequelize.STRING(255)
    },

    about: {
        type: Sequelize.STRING(500)
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
    completionCertificateModel.sync({force: config.DB['SYNC_FORCE']});
}


exports.completionCertificateModel = completionCertificateModel;


