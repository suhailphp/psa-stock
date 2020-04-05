const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {taxInvoiceModel} = require('../models/taxInvoiceModel');
const {taxInvoiceItemModel} = require('../models/taxInvoiceItemModel');
const {userModel} = require('../models/userModel');
const {staffModel} = require('../models/staffModel');

const curPage = 'taxInvoice';

router.use(upload());

router.get('/',auth,async (req,res)=>{

    let invoices = await taxInvoiceModel.findAll({order: [ [ 'taxInvoiceID', 'DESC' ]]});
    res.render('taxInvoice/list',{invoices:invoices,curPage});
});



router.get('/add',  auth,async (req,res)=>{


    //last reference number
    let lastInvoice = await taxInvoiceModel.findOne({
        order: [ [ 'taxInvoiceID', 'DESC' ]]
    });


    let referenceNo = (lastInvoice && lastInvoice.referenceNo)?lastInvoice.referenceNo+1:1;


    let data = {date : new Date(),referenceNo: referenceNo};

    res.render('taxInvoice/add',{curPage,data});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){


     // console.log(req.body);exit;
      let invoice = await taxInvoiceModel.findOne({where:{taxInvoiceID:req.body.taxInvoiceID}});

      invoice.referenceNo = req.body.referenceNo;
      invoice.date = req.body.date;
      invoice.customer = req.body.customer;
      invoice.title = req.body.title;
      invoice.customerTRN = req.body.customerTRN;
      invoice.note = req.body.note;
      invoice.userID = req.session.user.userID;
      invoice.totalAmount = req.body.totalAmount;
      invoice.tax = req.body.tax;
      invoice.grandTotal = req.body.grandTotal;
      invoice.itemNo = req.body.itemNo;

      let result = await invoice.save();
      if(result) {

          //remove all purchase items
          await taxInvoiceItemModel.destroy({where: {taxInvoiceID: invoice.taxInvoiceID}});


          if(req.body.itemName.constructor === Array)
          {
              let items = req.body.itemName.keys();
              for (let key of items) {
                  let itemModel = {
                      taxInvoiceID  :   invoice.taxInvoiceID,
                      itemName  :   req.body.itemName[key],
                      quantity  :   req.body.quantity[key],
                      price  :   req.body.price[key],
                      amount  :   req.body.amount[key],
                      itemSl  :   req.body.itemSl[key]
                  }
                  await taxInvoiceItemModel.create(itemModel);
              }
          }
          else{
              let itemModel = {
                  taxInvoiceID  :   invoice.taxInvoiceID,
                  itemName  :   req.body.itemName,
                  quantity  :   req.body.quantity,
                  price  :   req.body.price,
                  amount  :   req.body.amount,
                  itemSl  :   req.body.itemSl

              }
              await taxInvoiceItemModel.create(itemModel);
          }


          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/taxInvoice');
      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/taxInvoice');
      }



  }
  else
  {

     let model = {
          referenceNo : req.body.referenceNo,
          date : req.body.date,
          customer : req.body.customer,
          title : req.body.title,
          customerTRN : req.body.customerTRN,
          note : req.body.note,
         userID : req.session.user.userID,
         totalAmount : req.body.totalAmount,
         tax : req.body.tax,
         grandTotal : req.body.grandTotal,
         itemNo : req.body.itemNo



  }

      let invoice = await taxInvoiceModel.create(model);
      if(invoice){

          if(req.body.itemName.constructor === Array)
          {
              let items = req.body.itemName.keys();
              for (let key of items) {
                  let itemModel = {
                      taxInvoiceID  :   invoice.taxInvoiceID,
                      itemName  :   req.body.itemName[key],
                      quantity  :   req.body.quantity[key],
                      price  :   req.body.price[key],
                      amount  :   req.body.amount[key],
                      itemSl  :   req.body.itemSl[key]
                  }
                  await taxInvoiceItemModel.create(itemModel);

              }
          }
          else{
              let itemModel = {
                  taxInvoiceID  :   invoice.taxInvoiceID,
                  itemName  :   req.body.itemName,
                  quantity  :   req.body.quantity,
                  price  :   req.body.price,
                  amount  :   req.body.amount,
                  itemSl  :   req.body.itemSl


              }
              await taxInvoiceItemModel.create(itemModel);
          }


          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/taxInvoice');

      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/taxInvoice');
      }
  }
});

router.get('/edit/:taxInvoiceID', async (req,res)=>{


  let data = await taxInvoiceModel.findOne({ where: {taxInvoiceID: req.params.taxInvoiceID }});

  let invoiceItems = await taxInvoiceItemModel.findAll({ where: {taxInvoiceID: req.params.taxInvoiceID }});

  res.render('taxInvoice/add',{data,invoiceItems,curPage,editData:true});
});


router.get('/view/:taxInvoiceID', async (req,res)=>{

    taxInvoiceModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await taxInvoiceModel.findOne({ where: {taxInvoiceID: req.params.taxInvoiceID },
        include:[{model:userModel,required:true}]});


    let invoiceItems = await taxInvoiceItemModel.findAll({ where: {taxInvoiceID: req.params.taxInvoiceID }});
    let totalRecords =  await taxInvoiceItemModel.findAndCountAll({ where: {taxInvoiceID: req.params.taxInvoiceID }});
    let totalPage = Math.ceil(totalRecords.count/7);

    res.render('taxInvoice/view',{data,invoiceItems,totalPage});
});






router.delete('/:id',async(req,res)=>{

     //remove all purchase items
      taxInvoiceItemModel.destroy({where: {taxInvoiceID: req.params.id}});

      let result = await taxInvoiceModel.destroy({where:{taxInvoiceID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;