const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {unitModel,validate} = require('../models/unitModel');
const curPage = 'unit';

router.get('/', async (req,res)=>{
    let data = await unitModel.findAll();
    res.render('unit/list',{data:data,curPage});
});

router.get('/add', (req,res)=>{
    let data;
    if(req.session.reqBody){
        data = req.session.reqBody;
        req.session.reqBody = {};
    }
    res.render('unit/add',{data:data,curPage});
});


router.get('/edit/:unitID' ,async (req,res)=>{
    let data = await unitModel.findOne({ where: {unitID: req.params.unitID }});
    res.render('unit/add',{data:data,editData:true,curPage});
});


router.post('/', async (req,res)=>{
    //for update
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/unit/edit/'+req.body.unitID);
        }

        let data = await unitModel.findOne({ where: {unitID: req.body.unitID } });
        data.name = req.body.name;
        let result = await data.save();
        if(result){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
            res.redirect('/unit');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/unit');
        }


    }
    //for insert
    else {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            req.session.reqBody = req.body;
            return res.redirect('/unit/add');
        }

        let model = {
            name : req.body.name
        }
        let data = await  unitModel.create(model);
        if(data){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
            res.redirect('/unit');

        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/unit');
        }

    }
});


router.delete('/:unitID',async(req,res)=>{

    let result = await unitModel.destroy({where:{unitID:req.params.unitID}});
    if (!result) return res.send(false);
    res.send(true);

});





module.exports = router;