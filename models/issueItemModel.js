const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');


let issueItemModel = db.define('issue_item', {

    issueItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    issueID:{
        type: Sequelize.INTEGER
    },
    itemID: {
        type: Sequelize.INTEGER
    },
    itemSl: {
        type: Sequelize.INTEGER
    },
    quantity: {
        type: Sequelize.FLOAT
    }


});


if (config.DB['SYNC']) {
    issueItemModel.sync({force: config.DB['SYNC_FORCE']});
}



exports.issueItemModel = issueItemModel;



