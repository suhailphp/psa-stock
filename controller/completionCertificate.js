const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {completionCertificateModel} = require('../models/completionCertificateModel');
const {userModel} = require('../models/userModel');
const {staffModel} = require('../models/staffModel');

const curPage = 'completionCertificate';

router.use(upload());

router.get('/',auth,async (req,res)=>{
    let invoices = await completionCertificateModel.findAll({order: [ [ 'completionCertificateID', 'DESC' ]]});
    res.render('completionCertificate/list',{invoices:invoices,curPage});
});



router.get('/add',  auth,async (req,res)=>{


    //last reference number
    let lastInvoice = await completionCertificateModel.findOne({
        order: [ [ 'completionCertificateID', 'DESC' ]]
    });


    let referenceNo = (lastInvoice && lastInvoice.referenceNo)?lastInvoice.referenceNo+1:1;

    let data = {date : new Date(),referenceNo: referenceNo};

    res.render('completionCertificate/add',{curPage,data});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){


     // console.log(req.body);exit;
      let invoice = await completionCertificateModel.findOne({where:{completionCertificateID:req.body.completionCertificateID}});

      invoice.referenceNo = req.body.referenceNo;
      invoice.date = req.body.date;
      invoice.amount = req.body.amount;
      invoice.customerName = req.body.customerName;
      invoice.about = req.body.about;
      invoice.notes = req.body.notes;


      let result = await invoice.save();
      if(result) {

          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/completionCertificate');

      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/completionCertificate');
      }

  }
  else
  {

     let model = {
         referenceNo : req.body.referenceNo,
         date : req.body.date,
         amount : req.body.amount,
         customerName : req.body.customerName,
         about : req.body.about,
         notes : req.body.notes,
         userID : req.session.user.userID

  }

      let invoice = await completionCertificateModel.create(model);
      if(invoice){

          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/completionCertificate');

      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/completionCertificate');
      }
  }
});

router.get('/edit/:completionCertificateID', async (req,res)=>{


  let data = await completionCertificateModel.findOne({ where: {completionCertificateID: req.params.completionCertificateID }});
  res.render('completionCertificate/add',{data,curPage,editData:true});
});


router.get('/view/:completionCertificateID', async (req,res)=>{

    completionCertificateModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await completionCertificateModel.findOne({ where: {completionCertificateID: req.params.completionCertificateID },
        include:[{model:userModel,required:true}]});


    res.render('completionCertificate/view',{data});
});

router.delete('/:id',async(req,res)=>{

     let result = await completionCertificateModel.destroy({where:{completionCertificateID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;