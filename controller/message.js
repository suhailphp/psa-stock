const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {purchaseModel} = require('../models/purchaseModel');
const {nonStockModel} = require('../models/nonStockModel');
const {purchaseItemModel} = require('../models/purchaseItemModel');
const {nonStockItemModel} = require('../models/nonStockItemModel');
const {unitModel} = require('../models/unitModel');
const {userModel} = require('../models/userModel');
const {stockModel,stockAdjust} = require('../models/stockModel');
const {supplierModel} = require('../models/supplierModel');
const {warehouseModel} = require('../models/warehouseModel');
const {itemModel} = require('../models/itemModel');
const curPage = 'message';

router.use(upload());


router.get('/sendItem',auth,async (req,res)=>{
    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:true,financeSign:false,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let nonStocks = await nonStockModel.findAll({where:{storeSign:true,financeSign:false,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});

    var data = [];

    for (const key in purchases) {
        let element = {};
        let value = purchases[key];
        element.id= value.purchaseID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='purchase';
        data.push(element);
    }

    for (const key in nonStocks) {
        let element = {};
        let value = nonStocks[key];
        element.id= value.nonStockID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='nonStock';

        data.push(element);
    }




    //res.send(data)

    res.render('message/list',{purchases:data,curPage});
});

router.get('/finished',auth,async (req,res)=>{

    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:true,financeSign:true,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let nonStocks = await nonStockModel.findAll({where:{storeSign:true,financeSign:true,userID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});

    var data = [];

    for (const key in purchases) {
        let element = {};
        let value = purchases[key];
        element.id= value.purchaseID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='purchase';
        data.push(element);
    }

    for (const key in nonStocks) {
        let element = {};
        let value = nonStocks[key];
        element.id= value.nonStockID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='nonStock';

        data.push(element);
    }

    res.render('message/list',{purchases:data,curPage});
});

router.get('/finInbox',auth,async (req,res)=>{

    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:true,financeSign:false,financeUserID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let nonStocks = await nonStockModel.findAll({where:{storeSign:true,financeSign:false,financeUserID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});

    var data = [];

    for (const key in purchases) {
        let element = {};
        let value = purchases[key];
        element.id= value.purchaseID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='purchase';
        data.push(element);
    }

    for (const key in nonStocks) {
        let element = {};
        let value = nonStocks[key];
        element.id= value.nonStockID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='nonStock';

        data.push(element);
    }

   // res.send(data);
   // res.send(nonStocks);

   res.render('message/list',{purchases:data,curPage});
});

router.get('/finFinished',auth,async (req,res)=>{

    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where:{storeSign:true,financeSign:true,financeUserID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let nonStocks = await nonStockModel.findAll({where:{storeSign:true,financeSign:true,financeUserID:req.session.user.userID},
        include:[{model:supplierModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});

    var data = [];

    for (const key in purchases) {
        let element = {};
        let value = purchases[key];
        element.id= value.purchaseID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='purchase';
        data.push(element);
    }

    for (const key in nonStocks) {
        let element = {};
        let value = nonStocks[key];
        element.id= value.nonStockID;
        element.referenceNo= value.referenceNo;
        element.billNo= value.billNo;
        element.date= value.date;
        element.supplierName= value.supplier.name;
        element.type='nonStock';

        data.push(element);
    }

    res.render('message/list',{purchases:data,curPage});
});





router.get('/doFinanceSign/:id/:type', auth,async (req,res)=>{

    if(req.params.type == 'purchase'){
        let data = await purchaseModel.findOne({ where: {purchaseID: req.params.id }});
        data.financeSign = true;
        await data.save();
    }
    else{
        let data = await nonStockModel.findOne({ where: {nonStockID: req.params.id }});
        data.financeSign = true;
        await data.save();
    }
    res.redirect('/message/view/'+req.params.id+'/'+req.params.type);



});


router.get('/view_pop/:id/:type',auth, async (req,res)=>{
    if(req.params.type == 'purchase'){
        purchaseModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
        purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
        purchaseModel.belongsTo(userModel, {foreignKey: 'userID'});
        let data = await purchaseModel.findOne({ where: {purchaseID: req.params.id },
            include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
        purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
        purchaseItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
        let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.id },
            include:[{model:itemModel,required:true},{model:unitModel,required:true}]});

        var financeUserName = "";
        if(data.financeSign){
            var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
            financeUserName = financeUser.userName;
        }

        res.render('message/view_pop',{data,purchaseItems,financeUserName,type:req.params.type});
    }
    else{
        nonStockModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
        nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
        nonStockModel.belongsTo(userModel, {foreignKey: 'userID'});
        let data = await nonStockModel.findOne({ where: {nonStockID: req.params.id },
            include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
        nonStockItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
        let purchaseItems = await nonStockItemModel.findAll({ where: {nonStockID: req.params.id },
            include:[{model:unitModel,required:true}]});


        var financeUserName = "";
        if(data.financeSign){
            var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
            financeUserName = financeUser.userName;
        }

        res.render('message/view_pop',{data,purchaseItems,financeUserName,type:req.params.type});
    }




});

router.get('/view/:id/:type', async (req,res)=>{

    if(req.params.type == 'purchase'){
        purchaseModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
        purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
        purchaseModel.belongsTo(userModel, {foreignKey: 'userID'});
        let data = await purchaseModel.findOne({ where: {purchaseID: req.params.id },
            include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
        purchaseItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
        purchaseItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
        let purchaseItems = await purchaseItemModel.findAll({ where: {purchaseID: req.params.id },
            include:[{model:itemModel,required:true},{model:unitModel,required:true}]});
        let totalRecords =  await purchaseItemModel.findAndCountAll({ where: {purchaseID: req.params.id }});
        let totalPage = Math.ceil(totalRecords.count/7);
        let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

        var financeUserName = "";
        if(data.financeSign){
            var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
            financeUserName = financeUser.userName;
        }
        res.render('message/view',{data,purchaseItems,totalPage,financeUsers,financeUserName,type:req.params.type});
    }
    else{
        nonStockModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
        nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
        nonStockModel.belongsTo(userModel, {foreignKey: 'userID'});
        let data = await nonStockModel.findOne({ where: {nonStockID: req.params.id },
            include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
        nonStockItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
        let purchaseItems = await nonStockItemModel.findAll({ where: {nonStockID: req.params.id },
            include:[{model:unitModel,required:true}]});
        let totalRecords =  await nonStockItemModel.findAndCountAll({ where: {nonStockID: req.params.id }});
        let totalPage = Math.ceil(totalRecords.count/7);
        let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

        var financeUserName = "";
        if(data.financeSign){
            var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
            financeUserName = financeUser.userName;
        }


        res.render('message/view',{data,purchaseItems,totalPage,financeUsers,financeUserName,type:req.params.type});
    }

});




module.exports = router;