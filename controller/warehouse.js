const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {warehouseModel,validate} = require('../models/warehouseModel');
const curPage = 'warehouse';

router.get('/', async (req,res)=>{
    let data = await warehouseModel.findAll();
    res.render('warehouse/list',{data:data,curPage});
});

router.get('/add', (req,res)=>{
    let data;
    if(req.session.reqBody){
        data = req.session.reqBody;
        req.session.reqBody = {};
    }
    res.render('warehouse/add',{data:data,curPage});
});


router.get('/edit/:warehouseID' ,async (req,res)=>{
    let data = await warehouseModel.findOne({ where: {warehouseID: req.params.warehouseID }});
    res.render('warehouse/add',{data:data,editData:true,curPage});
});


router.post('/', async (req,res)=>{
    //for update
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/warehouse/edit/'+req.body.warehouseID);
        }

        let data = await warehouseModel.findOne({ where: {warehouseID: req.body.warehouseID } });
        data.name = req.body.name;
        let result = await data.save();
        if(result){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
            res.redirect('/warehouse');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/warehouse');
        }


    }
    //for insert
    else {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            req.session.reqBody = req.body;
            return res.redirect('/warehouse/add');
        }

        let model = {
            name : req.body.name
        }
        let data = await  warehouseModel.create(model);
        if(data){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
            res.redirect('/warehouse');

        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/warehouse');
        }

    }
});


router.delete('/:warehouseID',async(req,res)=>{

    let result = await warehouseModel.destroy({where:{warehouseID:req.params.warehouseID}});
    if (!result) return res.send(false);
    res.send(true);

});





module.exports = router;