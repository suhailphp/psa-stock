const auth = require('../middleware/auth');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const activeDirectory = require('activedirectory');
const {userModel} = require('../models/userModel');
const curPage = 'user';
const Config = require('../config/app');

router.get('/' ,async (req,res)=>{
    let users = await userModel.findAll();
    res.render('user/list',{data:users,curPage});
});

router.get('/add' ,async (req,res)=>{

    let data;
   // console.log(Config.DOMAIN);
    let ad = new activeDirectory(Config.DOMAIN);


    var query = '(mail=*psa*)';
    ad.findUsers(query,  function(err, users) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }

        if ((! users) || (users.length == 0)) console.log('No users found.');
        else {
            if(req.session.reqBody){
                data = req.session.reqBody;
                req.session.reqBody = {};
            }
            res.render('user/add',{data,curPage,users});
        }
    });



});

router.get('/edit/:id' ,async (req,res)=>{
    let data = await userModel.findOne({ where: {userID: req.params.id }});
    let ad = new activeDirectory(Config.DOMAIN);


    var query = '(mail=*psa*)';
    ad.findUsers(query,  function(err, users) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }

        if ((! users) || (users.length == 0)) console.log('No users found.');
        else {
            if(req.session.reqBody){
                data = req.session.reqBody;
                req.session.reqBody = {};
            }
            res.render('user/add',{data,curPage,editData:true,users});
        }
    });

});

router.post('/',async (req,res)=>{

    let ad = new activeDirectory(Config.DOMAIN);

    //for update
    if(req.body.action == 'edit'){

        let user = await userModel.findOne({ where: {userName: req.body.userName , id :{ $ne:req.body.id }} });
        if(user){
            req.session.infoMsg = {code:'error',title:'User name taken',content:'please chose other username'}
            req.session.reqBody = req.body;
            return res.redirect('/user/edit/'+req.body.id);
        }

        ad.findUser(req.body.userName, async function(err, adUser) {
            if (err) {
                console.log('ERROR: ' +JSON.stringify(err));
                return;
            }

            if (! adUser) {
                console.log('User: ' + req.body.userName + ' not found.');
            }
            else {
                user = await userModel.findOne({ where: {id: req.body.id } });
                user.fullName = adUser.description;
                user.userName = req.body.userName;
                user.userRole = req.body.userRole;
                let result = await user.save();
                if(result){
                    req.session.infoMsg = {code:'success',title:'User updated',content:'new user updated successfully'};
                    res.redirect('/user');
                }
                else{
                    req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
                    res.redirect('/user');
                }
            }
        });



    }
    //for insert
    else {


        let user = await userModel.findOne({ where: {userName: req.body.userName }});
        if(user){
            req.session.infoMsg = {code:'error',title:'User name taken',content:'please chose other username'}
            req.session.reqBody = req.body;
            return res.redirect('/user/add');
        }

        ad.findUser(req.body.userName, async function(err, adUser) {
            if (err) {
                console.log('ERROR: ' +JSON.stringify(err));
                return;
            }

            if (! adUser) {
                console.log('User: ' + req.body.userName + ' not found.');
            }
            else {
                let model = {
                    fullName : adUser.description,
                    userName : req.body.userName,
                    userRole : req.body.userRole
                }
                let result = await  userModel.create(model);
                if(result){
                    req.session.infoMsg = {code:'success',title:'User created',content:'new user created successfully'};
                    res.redirect('/user');
                }
                else{
                    req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
                    res.redirect('/user');
                }
            }
        });



    }

});

router.delete('/:id' ,async(req,res)=>{

    const result = await userModel.destroy({where:{id:req.params.id}});
    if (!result) return res.send(false);
    res.send(true);


});


module.exports = router;