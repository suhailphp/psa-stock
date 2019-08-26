const Joi = require("joi");
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const {userModel} = require('../models/userModel');
const activeDirectory = require('activedirectory');
const Config = require('../config/app');

router.get('/',(req,res)=>{

    res.render('login');
});

router.post('/',async(req,res)=>{

    let userName = req.body.userName;
    let password = req.body.password;


    let user = await userModel.findOne({ where: {userName: userName,active: true }});

    if(!user){
        req.session.infoMsg = {code:'error',title:'Login Error',content:'User name or password not matching'}
        return res.redirect('/login');
    }

    let ad = new activeDirectory(Config.DOMAIN);
    ad.authenticate(userName+'@psa.local', password, function (err, auth) {
          if (auth) {
            req.session.user = {userID:user.userID,userName:user.userName,name:user.fullName,userRole:user.userRole};
            req.session.infoMsg = {code:'success',title:'مرحبا بعودتك',content:'مرحباً بالسيد '+req.session.user.name};
            user.lastLoggedIn = new Date;
            user.save();
            return res.redirect('/');

        } else if (!auth || err.message == 'InvalidCredentialsError') {

            req.session.infoMsg = {code:'error',title:'Login Error',content:'User name or password not matching'}
            return res.redirect('/login');

        }
        else {

            req.session.infoMsg = {code:'error',title:'Login Error',content:'User name or password not matching'}
            return res.redirect('/login');
        }
    });




});



module.exports = router;