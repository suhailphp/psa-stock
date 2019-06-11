const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {purchaseModel,validate} = require('../models/purchaseModel');
const {nonStockModel} = require('../models/nonStockModel');
const {purchaseItemModel} = require('../models/purchaseItemModel');
const {unitModel} = require('../models/unitModel');
const {userModel} = require('../models/userModel');
const {stockModel,stockAdjust} = require('../models/stockModel');
const {supplierModel} = require('../models/supplierModel');
const {warehouseModel} = require('../models/warehouseModel');
const {itemModel} = require('../models/itemModel');
const curPage = 'purchase';

router.use(upload());

router.get('/',auth,async (req,res)=>{
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:false,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    res.render('purchase/list',{purchases:purchases,curPage});
});

router.get('/finished',auth,async (req,res)=>{
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    purchaseModel.belongsTo(userModel, {foreignKey: 'financeUserID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:true,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true},{model:userModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    res.render('purchase/finished',{purchases:purchases,curPage});
});

router.get('/add', auth, async (req,res)=>{
    let suppliers = await supplierModel.findAll();
    let warehouses = await warehouseModel.findAll();

    //last reference number
    let lastPurchase = await purchaseModel.findOne({
        order: [ [ 'purchaseID', 'DESC' ]]
    });

    //last reference number
    let lastNonStock = await nonStockModel.findOne({
        order: [ [ 'nonStockID', 'DESC' ]]
    });

    let referenceNoPurchase = (lastPurchase && lastPurchase.referenceNo)?lastPurchase.referenceNo+1:1;
    let referenceNoNonStock = (lastNonStock && lastNonStock.referenceNo)?lastNonStock.referenceNo+1:1;

    let referenceNo = (referenceNoPurchase >= referenceNoNonStock)?referenceNoNonStock:referenceNoNonStock;

    let data = {date : new Date(),LPODate: new Date(),referenceNo: referenceNo};

    res.render('purchase/add',{suppliers:suppliers,curPage,data,warehouses});
});

router.post('/', auth,async (req,res)=> {


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
        purchase.itemNo = req.body.itemNo;
        purchase.LPONo = req.body.LPONo;
        purchase.LPODate = req.body.LPODate;
        purchase.warehouseID = req.body.warehouseID;
        purchase.totalAmount = req.body.totalAmount;
        purchase.userID = req.session.user.userID;
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

            if(req.body.itemID.constructor === Array){
                let items = req.body.itemID.keys();
                for (let key of items) {
                    let itemModel = {
                        purchaseID: purchase.purchaseID,
                        itemID: req.body.itemID[key],
                        unitID: req.body.unitID[key],
                        itemSl: req.body.itemSl[key],
                        quantity: req.body.quantity[key],
                    }
                    let purchaseItem = await purchaseItemModel.create(itemModel);
                    if (purchaseItem) {
                        await stockAdjust(purchaseItem.itemID, purchaseItem.quantity);
                    }
                }
            }
            else {
                let itemModel = {
                    purchaseID: purchase.purchaseID,
                    itemID: req.body.itemID,
                    unitID: req.body.unitID,
                    itemSl: req.body.itemSl,
                    quantity: req.body.quantity,
                }
                let purchaseItem = await purchaseItemModel.create(itemModel);
                if (purchaseItem) {
                    await stockAdjust(purchaseItem.itemID, purchaseItem.quantity);
                }
            }



            //checking the attachments
            if(req.files.attachment){
                let file = req.files.attachment,
                    name = file.name,
                    type = file.mimetype;
                let uploadpath =  'public/purchaseFiles/' + purchase.purchaseID+'_'+name;
                file.mv(uploadpath,async function(err){
                    if(err){
                        console.log("File Upload Failed",name,err);
                    }
                    else {
                        //delete current file
                        if(purchase.attachment != ''){
                            fs.unlink('public/'+purchase.attachment,function (err) {
                                if(err) return console.log(err);
                            });
                        }

                        purchase.attachment = 'purchaseFiles/' +  purchase.purchaseID+'_'+name;
                        await purchase.save();
                    }
                });
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
        //console.log(req.body.itemID);exit;
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
            LPONo : req.body.LPONo,
            LPODate : req.body.LPODate,
            warehouseID : req.body.warehouseID,
            totalAmount : req.body.totalAmount,
            userID : req.session.user.userID,
            itemNo : req.body.itemNo

        }

        let purchase = await  purchaseModel.create(model);
        if(purchase){

            if(req.body.itemID.constructor === Array){
                let items = req.body.itemID.keys();
                for (let key of items) {
                    let itemModel = {
                        purchaseID: purchase.purchaseID,
                        itemID: req.body.itemID[key],
                        unitID: req.body.unitID[key],
                        itemSl: req.body.itemSl[key],
                        quantity: req.body.quantity[key],
                    }
                    let purchaseItem = await purchaseItemModel.create(itemModel);
                    if(purchaseItem){
                        await stockAdjust(purchaseItem.itemID,purchaseItem.quantity);
                    }
                }
            }
            else {
                let itemModel = {
                    purchaseID: purchase.purchaseID,
                    itemID: req.body.itemID,
                    unitID: req.body.unitID,
                    itemSl: req.body.itemSl,
                    quantity: req.body.quantity,
                }
                let purchaseItem = await purchaseItemModel.create(itemModel);
                if(purchaseItem){
                    await stockAdjust(purchaseItem.itemID,purchaseItem.quantity);
                }
            }



            //checking the attachments
            if(req.files.attachment){
                let file = req.files.attachment,
                    name = file.name,
                    type = file.mimetype;
                let uploadpath =  'public/purchaseFiles/' + purchase.purchaseID+'_'+name;
                file.mv(uploadpath,async function(err){
                    if(err){
                        console.log("File Upload Failed",name,err);
                    }
                    else {
                        purchase.attachment = 'purchaseFiles/' +  purchase.purchaseID+'_'+name;
                        await purchase.save();
                    }
                });
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

    //check the store sign is finished
    if(data.storeSign){
        req.session.infoMsg = {code:'error',title:'تحرير غير ممكن',content:'بعد تحرير التوقيع غير ممكن'};
        res.redirect('/purchase/finished')
    }
    else{
        purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
        purchaseItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
        let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.purchaseID },
            include:[{model:itemModel,required:true},{model:unitModel,required:true}]});
        let suppliers = await supplierModel.findAll();
        let warehouses = await warehouseModel.findAll();
        res.render('purchase/add',{data,suppliers,purchaseItems,curPage,editData:true,warehouses});
    }


});


router.get('/view_pop/:purchaseID', auth,async (req,res)=>{
    purchaseModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    purchaseModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID },
        include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
    purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    purchaseItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.purchaseID },
        include:[{model:itemModel,required:true},{model:unitModel,required:true}]});

    var financeUserName = "";
    if(data.financeSign){
        var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
        financeUserName = financeUser.userName;
    }

    res.render('purchase/view_pop',{data,purchaseItems,financeUserName});
});

router.get('/view/:purchaseID', auth,async (req,res)=>{
    purchaseModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    purchaseModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID },
        include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
    purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    purchaseItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.purchaseID },
        include:[{model:itemModel,required:true},{model:unitModel,required:true}]});
    let totalRecords =  await purchaseItemModel.findAndCountAll({ where: {purchaseID: req.params.purchaseID }});
    let totalPage = Math.ceil(totalRecords.count/7);
    let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

    var financeUserName = "";
    if(data.financeSign){
        var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
        financeUserName = financeUser.userName;
    }

    res.render('purchase/view',{data,purchaseItems,totalPage,financeUsers,financeUserName});
});


router.get('/doFinanceSign/:purchaseID/', auth,async (req,res)=>{
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID }});
    data.financeSign = true;
    await data.save();
    res.redirect('/purchase/view/'+req.params.purchaseID);

});

router.get('/doSign/:purchaseID/:financeUserID', auth,async (req,res)=>{
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID }});
    data.financeUserID = req.params.financeUserID;
    data.storeSign = true;
    await data.save();
    res.redirect('/purchase/view/'+req.params.purchaseID);

});

router.get('/checkSign/:purchaseID', auth,async (req,res)=>{
    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.purchaseID }});
    if(data.storeSign){
        res.send(true)
    }
    else {
        res.send(false)
    }

});

router.get('/search_item/:barcode',  async (req,res)=>{
    itemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let data = await itemModel.findOne({ where: {barcode: req.params.barcode },
             include:[{model:unitModel,required:true}]});
    res.send(data);
});



router.get('/search_item_det/:search',  async (req,res)=>{
    itemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let data = await itemModel.findAll(
        {   where: {
                $or : [{barcode:{$like:'%'+req.params.search+'%'} },
                        {name:{$like:'%'+req.params.search+'%'}}]
                 },
            include:[{model:unitModel,required:true}]
        });
        //console.log(data);
    res.send(data);
});


router.delete('/:id',async(req,res)=>{

    let data = await purchaseModel.findOne({ where: {purchaseID: req.params.id }});
    if(data.attachment != ''){
        fs.unlink('public/'+data.attachment,function (err) {
            if(err) return console.error(err);
        });
    }

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