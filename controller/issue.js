const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {issueModel,validate} = require('../models/issueModel');
const {issueItemModel} = require('../models/issueItemModel');
const {stockAdjust} = require('../models/stockModel');
const {issueStockAdjust,issueStockDelete} = require('../models/issueStockModel');
const {staffModel} = require('../models/staffModel');
const {userModel} = require('../models/userModel');
const {departmentModel} = require('../models/departmentModel');
const {itemModel} = require('../models/itemModel');
const {unitModel} = require('../models/unitModel');
const {warehouseModel} = require('../models/warehouseModel');
const {idaraModel} = require('../models/idaraModel');
const curPage = 'issue';


router.get('/',auth, async (req,res)=>{
    issueModel.belongsTo(staffModel, {foreignKey: 'militaryNo'});
    issueModel.belongsTo(departmentModel, {foreignKey: 'departmentID'});
    let issues = await issueModel.findAll({include:[{model:staffModel},{model:departmentModel}]});
    res.render('issue/list',{curPage,issues});
});

router.get('/add',auth, async (req,res)=>{
    let departments = await departmentModel.findAll();
    let idara = await idaraModel.findAll();
    let staffs = await staffModel.findAll();
    let data = {date : new Date()};
    res.render('issue/add',{curPage,departments,idara,staffs,data});
});

router.get('/edit/:issueID',auth, async (req,res)=>{
   let data = await issueModel.findOne({where:{issueID: req.params.issueID}});
    issueItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    let issueItems = await issueItemModel.findAll({ where: {issueID: req.params.issueID },
                         include:[{model:itemModel,required:true}]});
   let departments = await departmentModel.findAll();
    let idara = await idaraModel.findAll();
    let staffs = await staffModel.findAll();
   res.render('issue/add',{curPage,data,departments,staffs,issueItems,idara,editData:true});
});


router.get('/view/:issueID', auth,async (req,res)=>{
    issueModel.belongsTo(staffModel, {foreignKey: 'militaryNo'});
    issueModel.belongsTo(departmentModel, {foreignKey: 'departmentID'});
    issueModel.belongsTo(userModel, {foreignKey: 'userID'});
    issueModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
    issueModel.belongsTo(idaraModel, {foreignKey: 'idaraID'});
    let data = await issueModel.findOne({ where: {issueID: req.params.issueID },
        include:[{model:staffModel,required:false},{model:departmentModel,required:false},{model:userModel,required:true},{model:warehouseModel,required:false},{model:idaraModel,required:false}]});

    issueItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    issueItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let issueItems = await issueItemModel.findAll({ where: {issueID: req.params.issueID },
        include:[{model:itemModel,required:true},{model:unitModel,required:true}]});
    let totalRecords =  await issueItemModel.findAndCountAll({ where: {issueID: req.params.issueID }});
    let totalPage = Math.ceil(totalRecords.count/7);

    //console.log(data)
    res.render('issue/view',{data,issueItems,totalPage});
});

router.post('/',async (req,res)=>{
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/issue/edit/'+req.body.issueID);
        }
        //old isssue for delete old stock
        let oldIssue = await issueModel.findOne({where:{issueID:req.body.issueID}});
        let issue = await issueModel.findOne({where:{issueID:req.body.issueID}});

        issue.type = req.body.type;
        issue.departmentID = (req.body.type == 'department')?req.body.departmentID:null;
        issue.militaryNo = (req.body.type == 'staff')?req.body.militaryNo:null;
        issue.date = req.body.date;
        issue.itemNo = req.body.itemNo;
        issue.idaraID = req.body.idaraID;
        issue.traslNO = req.body.traslNO;
        issue.description = req.body.description;
        issue.userID = req.session.user.userID;
        issue.warehouseID = 1;
        let result = await issue.save();
        if(result) {
            let oldItems = await issueItemModel.findAll({where: {issueID: issue.issueID}});
            oldItems.forEach( async(element) => {
                //add quantity from stock
                await stockAdjust(element.itemID, element.quantity, 'add');
                //removing quantity from issue stock
                await issueStockAdjust(element.itemID,oldIssue.type,oldIssue.militaryNo,oldIssue.departmentID, element.quantity, 'delete');
            });
            //remove all purchase items
            issueItemModel.destroy({where: {issueID: issue.issueID}});
            //add purchase items again
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    issueID: issue.issueID,
                    itemID: req.body.itemID[key],
                    itemSl: req.body.itemSl[key],
                    quantity: req.body.quantity[key],
                    unitID: 1
                }
                let issueItem = await issueItemModel.create(itemModel);
                if (issueItem) {
                    await stockAdjust(issueItem.itemID, issueItem.quantity,'delete');
                    //adding quantity to issue stock
                    await issueStockAdjust(issueItem.itemID,issue.type,issue.militaryNo,issue.departmentID, issueItem.quantity, 'add');

                }

            }
            req.session.infoMsg = {code:'success',title:'مبروك',content:'issue data updated'};
            res.redirect('/issue');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/issue');
        }


    }
    else
    {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/issue/add');
        }


        let model = {
            type : req.body.type,
            departmentID : (req.body.departmentID == '')?null:req.body.departmentID,
            militaryNo : (req.body.militaryNo == '')?null:req.body.militaryNo,
            date : req.body.date,
            itemNo : req.body.itemNo,
            idaraID : req.body.idaraID,
            traslNO : req.body.traslNO,
            description : req.body.description,
            userID : req.session.user.userID,
            warehouseID : 1
        }

        let issue = await  issueModel.create(model);
        if(issue){
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    issueID  :   issue.issueID,
                    itemID  :   req.body.itemID[key],
                    itemSl  :   req.body.itemSl[key],
                    quantity  :   req.body.quantity[key],
                    unitID : 1
                }
                let issueItem = await issueItemModel.create(itemModel);
                if(issueItem){
                    await stockAdjust(issueItem.itemID,issueItem.quantity,'delete');
                    await issueStockAdjust(issueItem.itemID,issue.type,issue.militaryNo,issue.departmentID, issueItem.quantity, 'add');
                }

            }
            let cont = ' تم إصدار البند إلى '+ issue.militaryNo ;
            req.session.infoMsg = {code:'success',title:'مبروك',content:cont};
            res.redirect('/issue');

        }
        else {
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/issue');
        }
    }
});

router.delete('/:id',async(req,res)=>{
    let issue = await issueModel.findOne({where:{issueID:req.params.id}});
    let oldItems = await issueItemModel.findAll({where: {issueID: req.params.id}});
    oldItems.forEach(async (element) => {
        //add quantity from stock
        await stockAdjust(element.itemID, element.quantity, 'add');
        //remove quantity from issue stock
        await issueStockAdjust(element.itemID,issue.type,issue.militaryNo,issue.departmentID, element.quantity, 'delete');
        //delete if stock is zero
        await issueStockDelete();

    });
    //remove all purchase items
    issueItemModel.destroy({where: {issueID: req.params.id}});

    let result = await issueModel.destroy({where:{issueID:req.params.id}});
    if (!result) return res.send(false);
    res.send(true);

});

module.exports = router;