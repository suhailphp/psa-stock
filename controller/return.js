const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {returnModel,validate} = require('../models/returnModel');
const {returnItemModel} = require('../models/returnItemModel');
const {stockAdjust} = require('../models/stockModel');
const {issueStockAdjust,issueStockDelete} = require('../models/issueStockModel');
const {staffModel} = require('../models/staffModel');
const {departmentModel} = require('../models/departmentModel');
const {itemModel} = require('../models/itemModel');
const curPage = 'return';


router.get('/', async (req,res)=>{
    let returns = await returnModel.findAll();
    res.render('return/list',{curPage,returns});
});

router.get('/add', async (req,res)=>{
    let departments = await departmentModel.findAll();
    let staffs = await staffModel.findAll();
    let data = {date : new Date()};
    res.render('return/add',{curPage,departments,staffs,data});
});

router.get('/edit/:returnID', async (req,res)=>{
    let data = await returnModel.findOne({where:{returnID: req.params.returnID}});
    returnItemModel.belongsTo(itemModel, {foreignKey: 'itemID'});
    let returnItems = await returnItemModel.findAll({ where: {returnID: req.params.returnID },
        include:[{model:itemModel,required:true}]});
    let departments = await departmentModel.findAll();
    let staffs = await staffModel.findAll();
    res.render('return/add',{curPage,data,departments,staffs,returnItems,editData:true});
});

router.post('/',async (req,res)=>{
    if(req.body.action == 'edit'){
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/return/edit/'+req.body.returnID);
        }
        //old isssue for delete old stock
        let oldReturn = await returnModel.findOne({where:{returnID:req.body.returnID}});
        let returns = await returnModel.findOne({where:{returnID:req.body.returnID}});

        returns.type = req.body.type;
        returns.departmentID = (req.body.type == 'department')?req.body.departmentID:null;
        returns.militaryNo = (req.body.type == 'staff')?req.body.militaryNo:null;
        returns.date = req.body.date;
        returns.itemNo = req.body.itemNo;
        let result = await returns.save();
        if(result) {
            let oldItems = await returnItemModel.findAll({where: {returnID: returns.returnID}});
            oldItems.forEach( async(element) => {
                //add quantity from stock
                await stockAdjust(element.itemID, element.quantity, 'delete');
                //removing quantity from issue stock
                await issueStockAdjust(element.itemID,oldReturn.type,oldReturn.militaryNo,oldReturn.departmentID, element.quantity, 'add');
            });
            //remove all purchase items
            returnItemModel.destroy({where: {returnID: returns.returnID}});
            //add purchase items again
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    returnID: returns.returnID,
                    itemID: req.body.itemID[key],
                    itemSl: req.body.itemSl[key],
                    quantity: req.body.quantity[key],
                    notes: req.body.notes[key]
                }
                let returnItem = await returnItemModel.create(itemModel);
                if (returnItem) {
                    await stockAdjust(returnItem.itemID, returnItem.quantity,'add');
                    //adding quantity to issue stock
                    await issueStockAdjust(returnItem.itemID,returns.type,returns.militaryNo,returns.departmentID, returnItem.quantity, 'delete');

                }

            }
            req.session.infoMsg = {code:'success',title:'مبروك',content:'return data updated'};
            res.redirect('/return');
        }
        else{
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/return');
        }


    }
    else
    {
        let { error } = validate(req.body);
        if (error){
            let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
            req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
            return res.redirect('/return/add');
        }


        let model = {
            type : req.body.type,
            departmentID : (req.body.departmentID == '')?null:req.body.departmentID,
            militaryNo : (req.body.militaryNo == '')?null:req.body.militaryNo,
            date : req.body.date,
            itemNo : req.body.itemNo
        }

        let returns = await  returnModel.create(model);
        if(returns){
            let items = req.body.itemID.keys();
            for (let key of items) {
                let itemModel = {
                    returnID  :   returns.returnID,
                    itemID  :   req.body.itemID[key],
                    itemSl  :   req.body.itemSl[key],
                    quantity  :   req.body.quantity[key],
                    notes: req.body.notes[key]
                }
                let returnItem = await returnItemModel.create(itemModel);
                if(returnItem){
                    await stockAdjust(returnItem.itemID,returnItem.quantity,'add');
                    await issueStockAdjust(returnItem.itemID,returns.type,returns.militaryNo,returns.departmentID, returnItem.quantity, 'delete');
                }

            }
            let cont = ' تم إصدار البند إلى '+ returns.militaryNo ;
            req.session.infoMsg = {code:'success',title:'مبروك',content:cont};
            res.redirect('/return');

        }
        else {
            req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
            res.redirect('/return');
        }
    }
});

router.delete('/:id',async(req,res)=>{
    let issue = await returnModel.findOne({where:{returnID:req.params.id}});
    let oldItems = await returnItemModel.findAll({where: {returnID: req.params.id}});
    oldItems.forEach(async (element) => {
        //add quantity from stock
        await stockAdjust(element.itemID, element.quantity, 'delete');
        //remove quantity from issue stock
        await issueStockAdjust(element.itemID,issue.type,issue.militaryNo,issue.departmentID, element.quantity, 'add');
        //delete if stock is zero
        await issueStockDelete();

    });
    //remove all purchase items
    returnItemModel.destroy({where: {returnID: req.params.id}});

    let result = await returnModel.destroy({where:{returnID:req.params.id}});
    if (!result) return res.send(false);
    res.send(true);

});

module.exports = router;