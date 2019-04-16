const auth = require('../middleware/auth');
const express = require('express');
const moment = require('moment');
const {issueModel} = require('../models/issueModel');
const {staffModel} = require('../models/staffModel');
const {userModel} = require('../models/userModel');
const {itemModel} = require('../models/itemModel');
const {purchaseModel} = require('../models/purchaseModel');
const {nonStockModel} = require('../models/nonStockModel');
const {departmentModel} = require('../models/departmentModel');

const router = express.Router();

router.get('/',auth,async (req,res)=>{



    let totalUser = await userModel.count();
    let totalItem = await itemModel.count();


    let totalIssues = await issueModel.count({
        where: {
            date: {
                $gte: moment().subtract(1, 'days').toDate()
            }
        }
    });


    let Purcahse = await purchaseModel.count({
        where: {
            date: {
                $gte: moment().subtract(1, 'days').toDate()
            }
        }
    });

    let nonStock = await nonStockModel.count({
        where: {
            date: {
                $gte: moment().subtract(1, 'days').toDate()
            }
        }
    });
    let totalPurchase = Purcahse+nonStock;
    res.render('index',{totalUser,totalItem,totalPurchase,totalIssues});
});

router.get('/menu',(req,res)=>{
    req.session.abc = 'testing name';
    res.render('menu-table',{layout:null});
});



module.exports = router;