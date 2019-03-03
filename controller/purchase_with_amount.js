const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {purchaseModel,validate} = require('../models/purchaseModel');
const {purchaseItemModel} = require('../models/purchaseItemModel');
const {stockModel,stockAdjust} = require('../models/stockModel');
const {supplierModel} = require('../models/supplierModel');
const {itemModel} = require('../models/itemModel');
const curPage = 'purchase';


router.get('/', async (req,res)=>{
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({include:[{model:supplierModel,required:true}]});
    res.render('purchase/list',{purchases:purchases,curPage});
});

router.get('/add',  async (req,res)=>{
    let suppliers = await supplierModel.findAll();
    let data = {date : new Date()};
    res.render('purchase/add',{suppliers:suppliers,curPage,data});
});

router.post('/',async (req,res)=> {
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/purchase/edit/'+req.body.purchaseID);
        }

        let purchase = await purchaseModel.findOne({where:{purchaseID:req.body.purchaseID}});

        purchase.reference = req.body.referenceNo;
        purchase.billNo = req.body.billNo;
        purchase.supplierID = req.body.supplierID;
        purchase.date = req.body.date;
        purchase.total = req.body.total;
        purchase.taxRate = req.body.taxRate;
        purchase.taxAmount = (req.body.taxAmount == '')?0:req.body.taxAmount;
        purchase.discount = (req.body.discount == '')?0:req.body.discount;
        purchase.totalAmount = req.body.totalAmount;
        purchase.itemNo = req.body.itemNo;
        let result = await purchase.save();
        if(result) {
            let oldItems = await purchaseItemModel.findAll({where: {purchaseID: purchase.purchaseID}});
            oldItems.forEach((element) => {
                //remove quantity from stock
                stockAdjust(element.itemID, element.quantity, 'delete');
            });
            //remove all purchase items
            purchaseItemModel.destroy({where: {purchaseID: purchase.purchaseID}});
            //add purchase items again
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    purchaseID: purchase.purchaseID,
                    itemID: req.body.itemID[key],
                    itemSl: req.body.itemSl[key],
                    amount: req.body.amount[key],
                    quantity: req.body.quantity[key],
                    price: req.body.price[key]
                }
                let purchaseItem = await purchaseItemModel.create(itemModel);
                if (purchaseItem) {
                    await stockAdjust(purchaseItem.itemID, purchaseItem.quantity);
                }

            }
            req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
            res.redirect('/purchase');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/purchase');
        }



    }
    else
    {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/purchase/add');
        }


        let model = {
            referenceNo : req.body.referenceNo,
            billNo : req.body.billNo,
            supplierID : req.body.supplierID,
            date : req.body.date,
            total : req.body.total,
            taxRate : req.body.taxRate,
            taxAmount : (req.body.taxAmount == '')?0:req.body.taxAmount,
            discount : (req.body.discount == '')?0:req.body.discount,
            totalAmount : req.body.totalAmount,
            itemNo : req.body.itemNo
        }

        let purchase = await  purchaseModel.create(model);
        if(purchase){
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    purchaseID  :   purchase.purchaseID,
                    itemID  :   req.body.itemID[key],
                    itemSl  :   req.body.itemSl[key],
                    amount  :   req.body.amount[key],
                    quantity  :   req.body.quantity[key],
                    price  :   req.body.price[key]
                }
                let purchaseItem = await purchaseItemModel.create(itemModel);
                if(purchaseItem){
                     await stockAdjust(purchaseItem.itemID,purchaseItem.quantity);
                }

            }
            req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
            res.redirect('/purchase');

        }
        else {
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/purchase');
        }
    }
});

router.get('/edit/:purchaseID', async (req,res)=>{
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID }});
    purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.purchaseID },
                            include:[{model:itemModel,required:true}]});
    let suppliers = await supplierModel.findAll();
    res.render('purchase/add',{data,suppliers,purchaseItems,curPage,editData:true});
});

router.get('/view/:purchaseID', async (req,res)=>{
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID }});
    purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.purchaseID },
        include:[{model:itemModel,required:true}]});
    res.render('purchase/view',{data,purchaseItems});
});

router.get('/search_item/:barcode',  async (req,res)=>{
    let data = await itemModel.findOne({ where: {barcode: req.params.barcode }});
    res.send(data);
});



router.get('/search_item_det/:search',  async (req,res)=>{
    let data = await itemModel.findAll(
        {   where: {
                $or : [{barcode:{$like:'%'+req.params.search+'%'} },
                        {name:{$like:'%'+req.params.search+'%'}}]
                 }
        });
        //console.log(data);
    res.send(data);
});


router.delete('/:id',async(req,res)=>{

    let oldItems = await purchaseItemModel.findAll({where: {purchaseID: req.params.id}});
    oldItems.forEach((element) => {
        //remove quantity from stock
        stockAdjust(element.itemID, element.quantity, 'delete');
    });
    //remove all purchase items
    purchaseItemModel.destroy({where: {purchaseID: req.params.id}});

    let result = await purchaseModel.destroy({where:{purchaseID:req.params.id}});
    if (!result) return res.send(false);
    res.send(true);

});


module.exports = router;