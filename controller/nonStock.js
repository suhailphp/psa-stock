const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {nonStockModel,validate} = require('../models/nonStockModel');
const {purchaseModel} = require('../models/purchaseModel');
const {nonStockItemModel} = require('../models/nonStockItemModel');
const {unitModel} = require('../models/unitModel');
const {userModel} = require('../models/userModel');
const {supplierModel} = require('../models/supplierModel');
const {warehouseModel} = require('../models/warehouseModel');
const {tempItemModel} = require('../models/tempItemModel');
const curPage = 'nonStock';

router.use(upload());

router.get('/',auth,async (req,res)=>{

    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    let purchases = await nonStockModel.findAll({where:{storeSign:false,userID:req.session.user.userID},include:[{model:supplierModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});
    //for sign
    let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

    res.render('nonStock/list',{purchases:purchases,curPage,financeUsers});
});

router.get('/finished',auth,async (req,res)=>{

    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    nonStockModel.belongsTo(userModel, {foreignKey: 'financeUserID'});
    let purchases = await nonStockModel.findAll({where:{storeSign:true,userID:req.session.user.userID},
                    include:[{model:supplierModel,required:true},{model:userModel,required:true}],order: [ [ 'nonStockID', 'DESC' ]]});
    //for sign
    let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

    res.render('nonStock/finished',{purchases:purchases,curPage,financeUsers});
});

router.get('/add',  auth,async (req,res)=>{
    let suppliers = await supplierModel.findAll();
    let warehouses = await warehouseModel.findAll();
    let units = await unitModel.findAll();

    //last reference number
    let lastPurchase = await purchaseModel.findOne({
        order: [ [ 'purchaseID', 'DESC' ]]
    });

    //last nonStock number
    let lastNonStock = await nonStockModel.findOne({
        order: [ [ 'nonStockID', 'DESC' ]]
    });

    let referenceNoPurchase = (lastPurchase && lastPurchase.referenceNo)?lastPurchase.referenceNo+1:1;
    let referenceNoNonStock = (lastNonStock && lastNonStock.referenceNo)?lastNonStock.referenceNo+1:1;
    let referenceNo = (referenceNoPurchase >= referenceNoNonStock)?referenceNoNonStock:referenceNoNonStock;

    let data = {date : new Date(),LPODate: new Date(),referenceNo: referenceNo};

    res.render('nonStock/add',{suppliers:suppliers,curPage,data,warehouses,units});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){
      let { error } = validate(req.body);
      if (error){
          let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
          req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
          return res.redirect('/nonStock/edit/'+req.body.nonStockID);
      }

     // console.log(req.body);exit;
      let purchase = await nonStockModel.findOne({where:{nonStockID:req.body.nonStockID}});

      purchase.referenceNo = req.body.referenceNo;
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

          //remove all purchase items
          nonStockItemModel.destroy({where: {nonStockID: purchase.nonStockID}});


          if(req.body.itemName.constructor === Array)
          {
              let items = req.body.itemName.keys();
              for (let key of items) {
                  let itemModel = {
                      nonStockID  :   purchase.nonStockID,
                      itemName  :   req.body.itemName[key],
                      unitID  :   req.body.unitID[key],
                      barcode  :   req.body.barcode[key],
                      quantity  :   req.body.quantity[key],
                      itemSl  :   req.body.itemSl[key]
                  }
                  await nonStockItemModel.create(itemModel);

              }
          }
          else{
              let itemModel = {
                  nonStockID  :   purchase.nonStockID,
                  itemName  :   req.body.itemName,
                  unitID  :   req.body.unitID,
                  barcode  :   req.body.barcode,
                  quantity  :   req.body.quantity,
                  itemSl  :   req.body.itemSl
              }
              await nonStockItemModel.create(itemModel);
          }

          //checking the attachments
          if(req.files.attachment){
              let file = req.files.attachment,
                  name = file.name,
                  type = file.mimetype;
              let uploadpath =  'public/nonStockFiles/' + purchase.nonStockID+'_'+name;
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

                      //add new file
                      purchase.attachment = 'nonStockFiles/' +  purchase.nonStockID+'_'+name;
                      await purchase.save();
                  }
              });
          }



          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/nonStock');
      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/nonStock');
      }



  }
  else
  {
      let { error } = validate(req.body);
      if (error){
          let ErrMessage = error.details[0].message.replace(/['"]+/g, '');
          req.session.infoMsg = {code:'error',title:'خطأ',content:ErrMessage}
          return res.redirect('/nonStock/add');
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

      let purchase = await  nonStockModel.create(model);
      if(purchase){

          if(req.body.itemName.constructor === Array)
          {
              let items = req.body.itemName.keys();
              for (let key of items) {
                  let itemModel = {
                      nonStockID  :   purchase.nonStockID,
                      itemName  :   req.body.itemName[key],
                      unitID  :   req.body.unitID[key],
                      barcode  :   req.body.barcode[key],
                      quantity  :   req.body.quantity[key],
                      itemSl  :   req.body.itemSl[key]
                  }
                  await nonStockItemModel.create(itemModel);

              }
          }
          else{
              let itemModel = {
                  nonStockID  :   purchase.nonStockID,
                  itemName  :   req.body.itemName,
                  unitID  :   req.body.unitID,
                  barcode  :   req.body.barcode,
                  quantity  :   req.body.quantity,
                  itemSl  :   req.body.itemSl
              }
              await nonStockItemModel.create(itemModel);
          }


          //checking the attachments
          if(req.files.attachment){
              let file = req.files.attachment,
                  name = file.name,
                  type = file.mimetype;
              let uploadpath =  'public/nonStockFiles/' + purchase.nonStockID+'_'+name;
              file.mv(uploadpath,async function(err){
                  if(err){
                      console.log("File Upload Failed",name,err);
                  }
                  else {
                      purchase.attachment = 'nonStockFiles/' +  purchase.nonStockID+'_'+name;
                      await purchase.save();
                  }
              });
          }


          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/nonStock');



      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/nonStock');
      }
  }
});

router.get('/edit/:nonStockID', async (req,res)=>{


  let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID }});

  nonStockItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
  let purchaseItems = await nonStockItemModel.findAll({ where: {nonStockID: req.params.nonStockID },
                          include:[{model:unitModel,required:true}]});
  let suppliers = await supplierModel.findAll();
  let warehouses = await warehouseModel.findAll();
  let units = await unitModel.findAll();
  res.render('nonStock/add',{data,suppliers,purchaseItems,curPage,editData:true,warehouses,units});
});

router.get('/view_pop/:nonStockID', async (req,res)=>{
  nonStockModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
  nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
  nonStockModel.belongsTo(userModel, {foreignKey: 'userID'});
  let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID },
      include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
  nonStockItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
  let purchaseItems = await nonStockItemModel.findAll({ where: {nonStockID: req.params.nonStockID },
      include:[{model:unitModel,required:true}]});


  var financeUserName = "";
  if(data.financeSign){
      var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
      financeUserName = financeUser.userName;
  }


  res.render('nonStock/view_pop',{data,purchaseItems,financeUserName});
});

router.get('/view/:nonStockID', async (req,res)=>{
    nonStockModel.belongsTo(warehouseModel, {foreignKey: 'warehouseID'});
    nonStockModel.belongsTo(supplierModel, {foreignKey: 'supplierID'});
    nonStockModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID },
        include:[{model:warehouseModel,required:true},{model:supplierModel,required:true},{model:userModel,required:true}]});
    nonStockItemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
    let purchaseItems = await nonStockItemModel.findAll({ where: {nonStockID: req.params.nonStockID },
        include:[{model:unitModel,required:true}]});
    let totalRecords =  await nonStockItemModel.findAndCountAll({ where: {nonStockID: req.params.nonStockID }});
    let totalPage = Math.ceil(totalRecords.count/7);
    let financeUsers = await userModel.findAll({where:{userRole:'Finance'}});

    var financeUserName = "";
    if(data.financeSign){
        var financeUser = await userModel.findOne({where:{userID:data.financeUserID}});
        financeUserName = financeUser.userName;
    }


    res.render('nonStock/view',{data,purchaseItems,totalPage,financeUsers,financeUserName});
});

router.get('/doFinanceSign/:nonStockID/', auth,async (req,res)=>{
    let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID }});
    data.financeSign = true;
    await data.save();
    res.redirect('/nonStock/view/'+req.params.nonStockID);

});

router.get('/doSign/:nonStockID/:financeUserID', auth,async (req,res)=>{
    let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID }});
    data.financeUserID = req.params.financeUserID;
    data.storeSign = true;
    await data.save();
    res.redirect('/nonStock/view/'+req.params.nonStockID);

});

router.get('/search_item/:barcode',  async (req,res)=>{
  itemModel.belongsTo(unitModel, {foreignKey: 'unitID'});
  let data = await itemModel.findOne({ where: {barcode: req.params.barcode },
           include:[{model:unitModel,required:true}]});
  res.send(data);
});

router.get('/checkSign/:nonStockID', auth,async (req,res)=>{
    let data = await nonStockModel.findOne({ where: {nonStockID: req.params.nonStockID }});
    if(data.storeSign){
        res.send(true)
    }
    else {
        res.send(false)
    }

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

    let data = await nonStockModel.findOne({ where: {nonStockID: req.params.id }});
    if(data.attachment != ''){
        fs.unlink('public/'+data.attachment,function (err) {
            if(err) return console.log(err);
        });
    }

      //remove all purchase items
      nonStockItemModel.destroy({where: {nonStockID: req.params.id}});

      let result = await nonStockModel.destroy({where:{nonStockID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;