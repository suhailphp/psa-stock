const session = require("express-session");

module.exports = function(req,res,next){
    //req.session.infoMsg = {code:'success',title:'Testing',content:'Testing content'};
    if(req.session.infoMsg){

        res.locals.infoMsg = JSON.stringify(req.session.infoMsg);
        req.session.infoMsg = null;
    }

    //for display user info in header
    if(req.session.user){
        res.locals.user = req.session.user;
    }

    next();
}

