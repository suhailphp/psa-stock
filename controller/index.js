const auth = require('../middleware/auth');
const express = require('express');
const {issueModel} = require('../models/issueModel');
const {staffModel} = require('../models/staffModel');
const {departmentModel} = require('../models/departmentModel');

const router = express.Router();

router.get('/',async (req,res)=>{
    issueModel.belongsTo(staffModel, {foreignKey: 'militaryNo'});
    issueModel.belongsTo(departmentModel, {foreignKey: 'departmentID'});
    let issues = await issueModel.findAll({include:[{model:staffModel},{model:departmentModel}],limit: 5,
        order: [
            ['createdOn', 'desc']
        ] });
    res.render('index',{issues});
});
router.get('/menu',(req,res)=>{
    req.session.abc = 'testing name';
    res.render('menu-table',{layout:null});
});



module.exports = router;