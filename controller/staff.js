const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {staffModel} = require('../models/staffModel');
const curPage = 'staff';

router.get('/', async (req,res)=>{
    let data = await staffModel.findAll();
    res.render('staff/list',{data:data,curPage});
});


module.exports = router;