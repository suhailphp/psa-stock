'use strict'

let dot_conf = {silent: true};
if (process.env.NODE_ENV == 'production') {
    dot_conf.path = process.env.ENV_FILE
    let fs = require('fs');
    if (!fs.existsSync(dot_conf.path)) {
        console.log('ENV file doesnt exist on : ', dot_conf.path)
        process.exit()
    }
}

require('dotenv').config(dot_conf);
let port = process.env.PORT
let env = process.env.NODE_ENV

if (typeof env == 'undefined' || !env) {
    console.error(new Error('ENV File not provided'));
    process.exit()
}

module.exports = {
    PORT: port,
    ENV: env,
    APP_NAME: process.env.APP_NAME,
    HOST_URL: process.env.HOST_URL,
    BASE_URL: process.env.HOST_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DB: {
        DIALECT: process.env.DB_DIALECT,
        DATABASE: process.env.DB_NAME,
        USERNAME: process.env.DB_USER,
        PASSWORD: process.env.DB_PASS,
        HOST: process.env.DB_HOST,
        PORT: parseInt(process.env.DB_PORT),
        SYNC: true,        //: "Do not use this Unless you want to starts from zero",
        ALTER: false,        //: Alter tables when sync if there is any change to make.
        QUERY_LOG: false,
        SYNC_FORCE: false    //: "Do not use this Unless you want to set default values",
    },

    DOMAIN: {
        url: process.env.AD_URL,
        baseDN: process.env.AD_BASE_DN,
        username: process.env.AD_USERNAME,
        password: process.env.AD_PASSWORD
    }

}