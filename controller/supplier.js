const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {supplierModel,validate} = require('../models/supplierModel');
const curPage = 'supplier';

router.get('/', async (req,res)=>{
    let data = await supplierModel.findAll();
    res.render('supplier/list',{data:data,curPage});
});

router.get('/add', (req,res)=>{
    let data;
    if(req.session.reqBody){
        data = req.session.reqBody;
        req.session.reqBody = {};
    }
    res.render('supplier/add',{data:data,curPage});
});


router.get('/edit/:supplierID' ,async (req,res)=>{
    let data = await supplierModel.findOne({ where: {supplierID: req.params.supplierID }});
    res.render('supplier/add',{data:data,editData:true,curPage});
});


router.post('/', async (req,res)=>{
    //for update
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/supplier/edit/'+req.body.supplierID);
        }

        let data = await supplierModel.findOne({ where: {supplierID: req.body.supplierID } });
        data.name = req.body.name;
        data.mobile = req.body.mobile;
        data.email = req.body.email;
        data.address = req.body.address;
        let result = await data.save();
        if(result){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
            res.redirect('/supplier');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/supplier');
        }


    }
    //for insert
    else {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            req.session.reqBody = req.body;
            return res.redirect('/supplier/add');
        }

        let model = {
            name : req.body.name,
            mobile : req.body.mobile,
            email : req.body.email,
            address : req.body.address
        }
        let data = await  supplierModel.create(model);
        if(data){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
            res.redirect('/supplier');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/supplier');
        }

    }
});

router.post('/ajax', async (req,res)=>{


        let model = {
            name : req.body.name,
            address : req.body.address
        }
        let data = await  supplierModel.create(model);
        if(data){
            res.send(data)
        }

});


router.delete('/:supplierID',async(req,res)=>{

    let result = await supplierModel.destroy({where:{supplierID:req.params.supplierID}});
    if (!result) return res.send(false);
    res.send(true);

});





module.exports = router;