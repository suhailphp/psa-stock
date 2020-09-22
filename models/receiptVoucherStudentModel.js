const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let receiptVoucherStudentModel = db.define('receiptVoucherStudent', {

    receiptVoucherStudentID:{
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
    studentNumber: {
        type: Sequelize.STRING(255)
    },
    name: {
        type: Sequelize.STRING(255)
    },
    grade: {
        type: Sequelize.STRING(500)
    },


    mobile: {
        type: Sequelize.STRING(500)
    },

    email: {
        type: Sequelize.STRING(500)
    },

    courseType:{
        type: Sequelize.STRING(500)
    },

    courseName: {
        type: Sequelize.STRING(500)
    },

    reason: {
        type: Sequelize.STRING(500)
    },



    sumOfDhm:{
        type: Sequelize.STRING(500)
    },
    cash:{
        type: Sequelize.STRING(500)
    },
    chequeNo: {
        type: Sequelize.STRING(100)
    },
    bank: {
        type: Sequelize.STRING(100)
    },
    chequeDate: {
       type: Sequelize.DATE
    },




    statement: {
        type: Sequelize.STRING(500)
    },

    grandTotal: {
        type: Sequelize.FLOAT
    },

    userID: {
        type: Sequelize.INTEGER
    },

    studentSign:{
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
    receiptVoucherStudentModel.sync({force: config.DB['SYNC_FORCE']});
}


exports.receiptVoucherStudentModel = receiptVoucherStudentModel;


