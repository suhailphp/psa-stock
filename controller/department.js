const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {departmentModel} = require('../models/departmentModel');
const curPage = 'department';

router.get('/', async (req,res)=>{
    let data = await departmentModel.findAll();
    res.render('department/list',{data:data,curPage});
});




module.exports = router;