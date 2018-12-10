const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {categoryModel,validate} = require('../models/categoryModel');
const curPage = 'category';

router.get('/', async (req,res)=>{
    let data = await categoryModel.findAll();
    res.render('category/list',{data:data,curPage});
});

router.get('/add', (req,res)=>{
    let data;
    if(req.session.reqBody){
        data = req.session.reqBody;
        req.session.reqBody = {};
    }
    res.render('category/add',{data:data,curPage});
});


router.get('/edit/:categoryID' ,async (req,res)=>{
    let data = await categoryModel.findOne({ where: {categoryID: req.params.categoryID }});
    res.render('category/add',{data:data,editData:true,curPage});
});


router.post('/', async (req,res)=>{
    //for update
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/category/edit/'+req.body.categoryID);
        }

        let data = await categoryModel.findOne({ where: {categoryID: req.body.categoryID } });
        data.name = req.body.name;
        let result = await data.save();
        if(result){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
            res.redirect('/category');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/category');
        }


    }
    //for insert
    else {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            req.session.reqBody = req.body;
            return res.redirect('/category/add');
        }

        let model = {
            name : req.body.name
        }
        let data = await  categoryModel.create(model);
        if(data){
            req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
            res.redirect('/category');

        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/category');
        }

    }
});


router.delete('/:categoryID',async(req,res)=>{

    let result = await categoryModel.destroy({where:{categoryID:req.params.categoryID}});
    if (!result) return res.send(false);
    res.send(true);

});





module.exports = router;