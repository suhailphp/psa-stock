const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const _ = require('underscore');
const {itemModel} = require('../models/itemModel');
const {purchaseItemModel} = require('../models/purchaseItemModel');
const {purchaseModel} = require('../models/purchaseModel');
const {nonStockModel} = require('../models/nonStockModel');
const {issueItemModel} = require('../models/issueItemModel');
const {issueModel} = require('../models/issueModel');
const {returnItemModel} = require('../models/returnItemModel');
const {returnModel} = require('../models/returnModel');
const {supplierModel} = require('../models/supplierModel');
const {staffModel} = require('../models/staffModel');
const {departmentModel} = require('../models/departmentModel');
const {stockModel} = require('../models/stockModel');
const helper = require('../utilities/helper');

const curPage = 'report';

router.get('/item', auth, async (req,res)=>{
    let items = await itemModel.findAll();
    res.render('report/item',{curPage,items});
});


router.get('/item_report/:itemID', async (req,res)=>{

    let resArray = [];
    let vendor = '';

    //for getting opening stock
    let item = await itemModel.findOne({where:{itemID:req.params.itemID}})
    resArray.push({"date": helper.dateToDMY(item.createdOn),"createdOn":item, "description": "كمية الافتتاح",
        "quantity":item.openingStock,"vendor":'--',"style":"success"});

    purchaseItemModel.belongsTo(purchaseModel, {foreignKey: 'purchaseID'});
    let purchases = await purchaseItemModel.findAll({where: {itemID: req.params.itemID },include:[{model:purchaseModel,required:true}]});
    for(let element of purchases){
        let supplier =  await supplierModel.findOne({ where: {supplierID: element.purchase.supplierID }});
        vendor = supplier.name;
        resArray.push({"date": helper.dateToDMY(element.purchase.date),"createdOn":element.purchase.createdOn, "description": "سند ايراد",
            "quantity":element.quantity,"vendor":vendor,"style":"success"});
    }

    issueItemModel.belongsTo(issueModel, {foreignKey: 'issueID'});
    let issues = await issueItemModel.findAll({where: {itemID: req.params.itemID },include:[{model:issueModel,required:true}]});
    for(let element of issues){
        if(element.issue.type  === 'staff'){
            let staff =  await staffModel.findOne({ where: {militaryNo: element.issue.militaryNo }});
            vendor = staff.name;
        }
        else{
            let department =  await departmentModel.findOne({ where: {departmentID: element.issue.departmentID }});
            vendor = department.name;
        }
        resArray.push({"date": helper.dateToDMY(element.issue.date),"createdO n":element.issue.createdOn, "description": "سند صرف ",
            "quantity":element.quantity,"vendor":vendor,"style":"danger"});
    }

    returnItemModel.belongsTo(returnModel, {foreignKey: 'returnID'});
    let returns = await returnItemModel.findAll({where: {itemID: req.params.itemID },include:[{model:returnModel,required:true}]});
    for(let element of returns){
        if(element.return.type  === 'staff'){
            let staff =  await staffModel.findOne({ where: {militaryNo: element.return.militaryNo }});
            vendor = staff.name;
        }
        else{
            let department =  await departmentModel.findOne({ where: {departmentID: element.return.departmentID }});
            vendor = department.name;
        }

        resArray.push({"date": helper.dateToDMY(element.return.date),"createdOn":element.return.createdOn, "description": "سند ارجاع",
            "quantity":element.quantity,"vendor":vendor,"style":"success"});
    }
    //console.log(resArray)
   // resArray = _.sortBy(resArray,'createdOn').reverse();
    res.send(resArray);
});


router.get('/purchase', auth,async (req,res)=>{


    var where = '';

    if(req.session.user.userRole == 'AllStore'){
        where = {warehouseID:'1'};
    }
    else {
        where = {userID:req.session.userID};
    }





    purchaseModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await purchaseModel.findAll({where,
        include:[{model:supplierModel,required:true}],order: [ [ 'purchaseID', 'DESC' ]]});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let nonStocks = await nonStockModel.findAll({where,
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
        element.attachment =value.attachment;
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
        element.attachment =value.attachment;

        data.push(element);
    }
    res.render('report/purchase',{curPage,data,totalPurchase:data.length});
});



router.get('/item_stock/:itemID', async (req,res)=>{
    let stock = await stockModel.findOne({ where: {itemID: req.params.itemID }});
    res.send(''+stock.quantity);
});


module.exports = router;