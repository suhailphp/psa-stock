const Sequelize = require('sequelize');
const db = require('../startup/db');
const config = require('config');


let stockModel = db.define('stocks', {

    stockID:{
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    itemID:{
        type: Sequelize.INTEGER
    },
    quantity: {
        type: Sequelize.FLOAT
    }
});


if (config.DB['SYNC']) {
    stockModel.sync({force: config.DB['SYNC_FORCE']});
}

let stockAdjust = async (itemID,quantity,mode = 'add')=>{
    let stock = await stockModel.findOne({where : {itemID:itemID}});
    if(stock && mode == 'delete'){
        stock.quantity = parseInt(stock.quantity) - parseInt(quantity);
        stock.save();
    }
    else if(stock){
        stock.quantity = parseInt(stock.quantity) + parseInt(quantity);
        stock.save();
    }

}



exports.stockModel = stockModel;
exports.stockAdjust = stockAdjust;


