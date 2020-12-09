const fs = require('fs');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const {completionCertificateCompanyModel} = require('../models/completionCertificateCompanyModel');
const {userModel} = require('../models/userModel');
const {staffModel} = require('../models/staffModel');

const curPage = 'completionCertificateCompany';

router.use(upload());

router.get('/',auth,async (req,res)=>{
    let invoices = await completionCertificateCompanyModel.findAll({order: [ [ 'completionCertificateCompanyID', 'DESC' ]]});
    res.render('completionCertificateCompany/list',{invoices:invoices,curPage});
});



router.get('/add',  auth,async (req,res)=>{


    //last reference number
    let lastInvoice = await completionCertificateCompanyModel.findOne({
        order: [ [ 'completionCertificateCompanyID', 'DESC' ]]
    });


    let referenceNo = (lastInvoice && lastInvoice.referenceNo)?lastInvoice.referenceNo+1:1;

    let data = {date : new Date(),referenceNo: referenceNo};

    res.render('completionCertificateCompany/add',{curPage,data});
});

router.post('/',auth,async (req,res)=> {


  if(req.body.action == 'edit'){


     // console.log(req.body);exit;
      let invoice = await completionCertificateCompanyModel.findOne({where:{completionCertificateCompanyID:req.body.completionCertificateCompanyID}});

      invoice.referenceNo = req.body.referenceNo;
      invoice.date = req.body.date;
      invoice.amount = req.body.amount;
      invoice.customerName = req.body.customerName;
      invoice.about = req.body.about;
      invoice.notes = req.body.notes;


      let result = await invoice.save();
      if(result) {

          req.session.infoMsg = {code:'success',title:'مبروك',content:'تم تحديث العنصر بنجاح'};
          res.redirect('/completionCertificateCompany');

      }
      else{
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/completionCertificateCompany');
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

      let invoice = await completionCertificateCompanyModel.create(model);
      if(invoice){

          req.session.infoMsg = {code:'success',title:'مبروك',content:'بند جديد تم إنشاؤه'};
          res.redirect('/completionCertificateCompany');

      }
      else {
          req.session.infoMsg = {code:'error',title:'Something went wrong',content:'something went wrong'};
          res.redirect('/completionCertificateCompany');
      }
  }
});

router.get('/edit/:completionCertificateCompanyID', async (req,res)=>{


  let data = await completionCertificateCompanyModel.findOne({ where: {completionCertificateCompanyID: req.params.completionCertificateCompanyID }});
  res.render('completionCertificateCompany/add',{data,curPage,editData:true});
});


router.get('/view/:completionCertificateCompanyID', async (req,res)=>{

    completionCertificateCompanyModel.belongsTo(userModel, {foreignKey: 'userID'});
    let data = await completionCertificateCompanyModel.findOne({ where: {completionCertificateCompanyID: req.params.completionCertificateCompanyID },
        include:[{model:userModel,required:true}]});


    res.render('completionCertificateCompany/view',{data});
});

router.get('/view_sign/:completionCertificateCompanyID', async (req,res)=>{
    res.render('completionCertificateCompany/sign',{completionCertificateCompanyID:req.params.completionCertificateCompanyID});
});

router.post('/do_sign/:completionCertificateCompanyID', async (req,res)=>{
    let invoice = await completionCertificateCompanyModel.findOne({where:{completionCertificateCompanyID:req.params.completionCertificateCompanyID}});
    invoice.signature = req.body.data
    let result = await invoice.save();
    if(result){
        res.send(true)
    }
    else{
        res.send(false)
    }
});

router.post('/feedback/:completionCertificateCompanyID', async (req,res)=>{
    let invoice = await completionCertificateCompanyModel.findOne({where:{completionCertificateCompanyID:req.params.completionCertificateCompanyID}});
    invoice.rating = req.body.data
    let result = await invoice.save();
    if(result){
        res.send(true)
    }
    else{
        res.send(false)
    }
});

router.delete('/:id',async(req,res)=>{

     let result = await completionCertificateCompanyModel.destroy({where:{completionCertificateCompanyID:req.params.id}});
      if (!result) return res.send(false);
      res.send(true);

});


module.exports = router;