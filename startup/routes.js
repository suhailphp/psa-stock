const express = require("express");
const bodyParser = require('body-parser');

const infoMsg = require("../middleware/infoMsg");
const login = require("../controller/login");
const logout = require("../controller/logout");
const index = require("../controller/index");
const user = require("../controller/user");
const item = require("../controller/item");
const category = require("../controller/category");
const department = require("../controller/department");
const supplier = require("../controller/supplier");
const purchase = require("../controller/purchase");
const issue = require("../controller/issue");
const staff = require("../controller/staff");
const syncHrDb = require("../controller/syncHrDb");
const returnCn = require("../controller/return");



module.exports = function(app){

    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(infoMsg);
    app.use('/login', login);
    app.use('/logout', logout);
    app.use('/', index);
    app.use('/user', user);
    app.use('/item', item);
    app.use('/category', category);
    app.use('/department', department);
    app.use('/supplier', supplier);
    app.use('/purchase', purchase);
    app.use('/issue', issue);
    app.use('/staff', staff);
    app.use('/syncHrDb', syncHrDb);
    app.use('/return', returnCn);




}