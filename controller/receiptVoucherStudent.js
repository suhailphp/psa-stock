const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {receiptVoucherStudentModel} = require('../models/receiptVoucherStudentModel');
const {userModel} = require('../models/userModel');
const {staffModel} = require('../models/staffModel');

const curPage = 'receiptVoucherStudent';

router.use(upload());

router.get('/',auth,async (req,res)=>{
    let invoices = await receiptVoucherStudentModel.findAll({order: [ [ 'receiptVoucherStudentID', 'DESC' ]]});
    res.render('receiptVoucherStudent/list',{invoices:invoices,curPage});
});



router.get('/add',  auth,async (req,res)=>{


    //last reference number
    let lastInvoice = await receiptVoucherStudentModel.findOne({
        order: [ [ 'receiptVoucherStudentID', 'DESC' ]]
    });


    let referenceNo = (lastInvoice && lastInvoice.referenceNo)?lastInvoice.referenceNo+1:1;


    let data = {date : new Date(),chequeDate : new Date(),referenceNo: referenceNo};

    res.render('receiptVoucherStudent/add',{curPage,data});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){


     // console.log(req.body);exit;
      let invoice = await receiptVoucherStudentModel.findOne({where:{receiptVoucherStudentID:req.body.receiptVoucherStudentID}});

      invoice.referenceNo = req.body.referenceNo;
      invoice.date = req.body.date;
      invoice.studentNumber = req.body.studentNumber;
      invoice.name = req.body.name;
      invoice.grade = req.body.grade;
      invoice.mobile = req.body.mobile;
      invoice.email = req.body.email;
      invoice.courseType = req.body.courseType;
      invoice.courseName = req.body.courseName;
      invoice.reason = (req.body.courseType == 'PHD')?req.body.reason2:req.body.reason1;
      invoice.sumOfDhm = req.body.sumOfDhm;
      invoice.cash = req.body.cash;
      invoice.chequeNo = req.body.chequeNo;
      invoice.bank = req.body.bank;
      invoice.chequeDate = req.body.chequeDate;
      invoice.statement = req.body.statement;


      let result = await invoice.save();
      if(result) {

          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/receiptVoucherStudent');

      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/receiptVoucherStudent');
      }

  }
  else
  {

     let model = {
         referenceNo : req.body.referenceNo,
         date : req.body.date,
         studentNumber : req.body.studentNumber,
         name : req.body.name,
         grade : req.body.grade,
         mobile : req.body.mobile,
         email : req.body.email,
         courseType : req.body.courseType,
         courseName : req.body.courseName,
         reason : (req.body.courseType == 'PHD')?req.body.reason2:req.body.reason1,
         sumOfDhm : req.body.sumOfDhm,
         cash : req.body.cash,
         chequeNo : req.body.chequeNo,
         bank : req.body.bank,
         chequeDate : req.body.chequeDate,
         statement : req.body.statement,
         userID : req.session.user.userID

  }

      let invoice = await receiptVoucherStudentModel.create(model);
      if(invoice){

          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/receiptVoucherStudent');

      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/receiptVoucherStudent');
      }
  }
});

router.get('/edit/:receiptVoucherStudentID', async (req,res)=>{


  let data = await receiptVoucherStudentModel.findOne({ where: {receiptVoucherStudentID: req.params.receiptVoucherStudentID }});
  res.render('receiptVoucherStudent/add',{data,curPage,editData:true});
});


router.get('/view/:receiptVoucherStudentID', async (req,res)=>{

    receiptVoucherStudentModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await receiptVoucherStudentModel.findOne({ where: {receiptVoucherStudentID: req.params.receiptVoucherStudentID },
        include:[{model:userModel,required:true}]});


    res.render('receiptVoucherStudent/view',{data});
});

router.delete('/:id',async(req,res)=>{

     let result = await receiptVoucherStudentModel.destroy({where:{receiptVoucherStudentID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;