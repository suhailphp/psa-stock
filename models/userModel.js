const Joi = require("joi");
const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('../config/app');

let userModel = db.define('users', {

    id:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    fullName: {
        type: Sequelize.STRING(255)
    },
    userName: {
            type: Sequelize.STRING(255),
            unique: true
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
    userRole : {
        type: Sequelize.STRING(50),
        defaultValue: 'ADMIN'
    }
});


if (config.DB['SYNC']) {
    userModel.sync({force: config.DB['SYNC_FORCE']}).then(function () {
        // Table created
        return userModel.findOrCreate({
            where: {
                userName: 'suhail',
            },
            defaults: {
                fullName: 'سهيل مالايانتافيدا',
                userName: 'suhail',
                userRole: 'ADMIN'
            }
        })
            .then(function (resp, created) {
                if (created)
                    console.log('Default user created USERNAME: suhail PASSWORD: -----')
            });
    });
}



exports.userModel = userModel;

