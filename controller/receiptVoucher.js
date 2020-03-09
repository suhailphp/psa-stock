const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {receiptVoucherModel} = require('../models/receiptVoucherModel');
const {userModel} = require('../models/userModel');
const {staffModel} = require('../models/staffModel');

const curPage = 'receiptVoucher';

router.use(upload());

router.get('/',auth,async (req,res)=>{
    let invoices = await receiptVoucherModel.findAll({order: [ [ 'receiptVoucherID', 'DESC' ]]});
    res.render('receiptVoucher/list',{invoices:invoices,curPage});
});



router.get('/add',  auth,async (req,res)=>{


    //last reference number
    let lastInvoice = await receiptVoucherModel.findOne({
        order: [ [ 'receiptVoucherID', 'DESC' ]]
    });


    let referenceNo = (lastInvoice && lastInvoice.referenceNo)?lastInvoice.referenceNo+1:1;


    let data = {date : new Date(),chequeDate : new Date(),referenceNo: referenceNo};

    res.render('receiptVoucher/add',{curPage,data});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){


     // console.log(req.body);exit;
      let invoice = await receiptVoucherModel.findOne({where:{receiptVoucherID:req.body.receiptVoucherID}});

      invoice.referenceNo = req.body.referenceNo;
      invoice.date = req.body.date;
      invoice.grandTotal = req.body.grandTotal;
      invoice.customer = req.body.customer;
      invoice.title = req.body.title;
      invoice.sumOfDhm = req.body.sumOfDhm;
      invoice.cash = req.body.cash;
      invoice.chequeNo = req.body.chequeNo;
      invoice.bank = req.body.bank;
      invoice.chequeDate = req.body.chequeDate;
      invoice.statement = req.body.statement;


      let result = await invoice.save();
      if(result) {

          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/receiptVoucher');

      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/receiptVoucher');
      }

  }
  else
  {

     let model = {
         referenceNo : req.body.referenceNo,
         date : req.body.date,
         grandTotal : req.body.grandTotal,
         customer : req.body.customer,
         title : req.body.title,
         sumOfDhm : req.body.sumOfDhm,
         cash : req.body.cash,
         chequeNo : req.body.chequeNo,
         bank : req.body.bank,
         chequeDate : req.body.chequeDate,
         statement : req.body.statement,
         userID : req.session.user.userID

  }

      let invoice = await receiptVoucherModel.create(model);
      if(invoice){

          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/receiptVoucher');

      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/receiptVoucher');
      }
  }
});

router.get('/edit/:receiptVoucherID', async (req,res)=>{


  let data = await receiptVoucherModel.findOne({ where: {receiptVoucherID: req.params.receiptVoucherID }});
  res.render('receiptVoucher/add',{data,curPage,editData:true});
});


router.get('/view/:receiptVoucherID', async (req,res)=>{

    receiptVoucherModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await receiptVoucherModel.findOne({ where: {receiptVoucherID: req.params.receiptVoucherID },
        include:[{model:userModel,required:true}]});


    res.render('receiptVoucher/view',{data});
});

router.delete('/:id',async(req,res)=>{

     let result = await receiptVoucherModel.destroy({where:{receiptVoucherID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;