const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let issueItemModel = db.define('issue_item', {

    issueItemID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        unique: 'compositeIndex',
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



