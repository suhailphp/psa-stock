const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {itemModel,validate} = require('../models/itemModel');
const {stockModel} = require('../models/stockModel');
const {issueStockModel} = require('../models/issueStockModel');
const {categoryModel} = require('../models/categoryModel');
const curPage = 'item';


router.get('/', async (req,res)=>{
    itemModel.belongsTo(stockModel, {foreignKey: 'itemID'});
    itemModel.belongsTo(categoryModel, {foreignKey: 'categoryID'});
    let item = await itemModel.findAll({include:[{model:stockModel,required:true},
            {model:categoryModel,required:true}]});
    //console.log(item);
    res.render('item/list',{data:item,curPage});
});

router.get('/:categoryID', async (req,res)=>{
    itemModel.belongsTo(stockModel, {foreignKey: 'itemID'});
    itemModel.belongsTo(categoryModel, {foreignKey: 'categoryID'});
    let item = await itemModel.findAll({where:{categoryID:req.params.categoryID},include:[{model:stockModel,required:true},
            {model:categoryModel,required:true}]});
    //console.log(item);
    let category =  await categoryModel.findOne({where:{categoryID:req.params.categoryID}});
    let catTitle = '('+category.name+')';
    res.render('item/list',{data:item,curPage,catTitle});
});



router.get('/add',auth,  async (req,res)=>{
    let data;
    if(req.session.reqBody){
        data = req.session.reqBody;
        req.session.reqBody = {};
    }
    let categories = await categoryModel.findAll();
    res.render('item/add',{data:data,categories:categories,curPage});
});


router.get('/edit/:itemID', auth,async (req,res)=>{
    let data = await itemModel.findOne({ where: {itemID: req.params.itemID }});
    let categories = await categoryModel.findAll();
    res.render('item/add',{data:data,editData:true,categories:categories,curPage});
});


router.post('/', auth, async (req,res)=>{
    //for update
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/item/edit/'+req.body.itemID);
        }

        let item = await itemModel.findOne({ where: {itemID: req.body.itemID } });
        let oldOB  = parseInt(item.openingStock);
        item.barcode = req.body.barcode;
        item.name = req.body.name;
        item.desctiption = req.body.desctiption;
        item.categoryID = req.body.categoryID;
        item.amount = req.body.amount;
        item.openingStock = req.body.openingStock;
        let result = await item.save();
        if(result){
            let stock = await stockModel.findOne({ where: {itemID: req.body.itemID } });
            stock.quantity = (parseInt(stock.quantity)-oldOB) +parseInt(item.openingStock);
            if(stock.save()){
                req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
                res.redirect('/item');
            }
            else{
                req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
                res.redirect('/item');
            }

        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/item');
        }


    }
    //for insert
    else {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            req.session.reqBody = req.body;
            return res.redirect('/item/add');
        }

        let model = {
            barcode : req.body.barcode,
            name : req.body.name,
            description : req.body.description,
            categoryID : req.body.categoryID,
            amount : req.body.amount,
            openingStock : req.body.openingStock
        }
        let item = await  itemModel.create(model);
        if(item){
            let modelS = {
                itemID : item.itemID,
                quantity : item.openingStock
            }
            let stock = await  stockModel.create(modelS);
            if(stock){
                req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
                res.redirect('/item');
            }
            else{
                req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
                res.redirect('/item');
            }

        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/item');
        }

    }
});


router.delete('/:id',async(req,res)=>{

    let result = await itemModel.destroy({where:{itemID:req.params.id}});
    await stockModel.destroy({where:{itemID:req.params.id}});
    await issueStockModel.destroy({where:{itemID:req.params.id}});
    if (!result) return res.send(false);
    res.send(true);


});





module.exports = router;