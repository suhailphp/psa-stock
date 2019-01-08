const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const _ = require('underscore');
const {itemModel} = require('../models/itemModel');
const {purchaseItemModel} = require('../models/purchaseItemModel');
const {purchaseModel} = require('../models/purchaseModel');
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

router.get('/item', async (req,res)=>{
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
        if(element.issue.type  == 'staff'){
            let staff =  await staffModel.findOne({ where: {militaryNo: element.issue.militaryNo }});
            vendor = staff.name;
        }
        else{
            let department =  await departmentModel.findOne({ where: {departmentID: element.issue.departmentID }});
            vendor = department.name;
        }
        resArray.push({"date": helper.dateToDMY(element.issue.date),"createdOn":element.issue.createdOn, "description": "سند صرف ",
            "quantity":element.quantity,"vendor":vendor,"style":"danger"});
    }

    returnItemModel.belongsTo(returnModel, {foreignKey: 'returnID'});
    let returns = await returnItemModel.findAll({where: {itemID: req.params.itemID },include:[{model:returnModel,required:true}]});
    for(let element of returns){
        if(element.return.type  == 'staff'){
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
    resArray = _.sortBy(resArray,'createdOn').reverse();
    res.send(resArray);
});



router.get('/item_stock/:itemID', async (req,res)=>{
    let stock = await stockModel.findOne({ where: {itemID: req.params.itemID }});
    res.send(''+stock.quantity);
});


module.exports = router;