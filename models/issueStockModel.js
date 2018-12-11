const Sequelize = require('sequelize');
const db = require('../config/dbConnection');
const config = require('config');


let issueStockModel = db.define('issue_stock', {

    issueStockID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    type:{
        type: Sequelize.ENUM,
        values: ['department', 'staff']
    },
    departmentID: {
        type: Sequelize.INTEGER,
        allow: null
    },
    militaryNo: {
        type: Sequelize.INTEGER,
        allow: null
    },
    itemID:{
        type: Sequelize.INTEGER
    },
    quantity: {
        type: Sequelize.FLOAT
    }
});


if (config.DB['SYNC']) {
    issueStockModel.sync({force: config.DB['SYNC_FORCE']});
}

let issueStockAdjust = async (itemID,type,militaryNo,departmentID,quantity,mode = 'add')=>{
   // console.log(militaryNo+', '+quantity+' '+mode);
    if(type == 'staff'){
        let stock = await issueStockModel.findOne({where : {itemID:itemID,type:type,militaryNo: militaryNo}});
        if(stock){
            if(mode == 'delete'){

                stock.quantity = parseInt(stock.quantity) - parseInt(quantity);
            }
            else {
                stock.quantity = parseInt(stock.quantity) + parseInt(quantity);

            }
            await stock.save();
        }
        else{
            quantity = (mode == 'delete')?(0-quantity):quantity;

            let modelS = {
                itemID : itemID,
                type:type,
                militaryNo:militaryNo,
                quantity : quantity
            }
            await issueStockModel.create(modelS);
        }
    }
    else{
        let stock = await issueStockModel.findOne({where : {itemID:itemID,type:type,departmentID: departmentID}});
        if(stock){
            if(stock){
                if(mode == 'delete'){

                    stock.quantity = parseInt(stock.quantity) - parseInt(quantity);
                }
                else {
                    stock.quantity = parseInt(stock.quantity) + parseInt(quantity);
                }
                await stock.save();

            }
        }
        else{
            quantity = (mode == 'delete')?(0-quantity):quantity;
            let modelS = {
                itemID : itemID,
                type:type,
                departmentID:departmentID,
                quantity : quantity
            }
            await issueStockModel.create(modelS);
        }
    }
}

let issueStockDelete = async ()=>{
    await issueStockModel.destroy({where : {quantity:0}});
}



exports.issueStockModel = issueStockModel;
exports.issueStockAdjust = issueStockAdjust;
exports.issueStockDelete = issueStockDelete;



