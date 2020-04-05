const session = require("express-session");
const exphbr = require("express-handlebars");
const http = require('http');
const {userModel} = require('../models/userModel');

module.exports = async function(req,res,next){
    //console.log(req.session);


    try{
        if(req.session.user)
            next()
        else
        if(req.session.UserName){


            let user = await userModel.findOne({ where: {userName: req.session.UserName,active: true }});

            if(user){
                req.session.user = {userID:user.userID,userName:user.userName,name:user.fullName,userRole:user.userRole};
                req.session.infoMsg = {code:'success',title:'مرحبا بعودتك',content:'مرحباً بالسيد '+req.session.user.name};
                user.lastLoggedIn = new Date;
                user.save();
                return res.redirect('/');
            }
            else{
                req.session.infoMsg = {code:'warning',title:'No permission',content:'You dont have permission to access this application'};
                return res.redirect('/login');

            }

        }
        else if(!req.session.user){
            req.session.infoMsg = {code:'warning',title:'Please Login',content:'Must be login to use the application'};

            return res.redirect('/login');
        }




    }
    catch (e) {
        console.log(e)
    }

}