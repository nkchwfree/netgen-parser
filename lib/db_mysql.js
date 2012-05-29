var mysql = require('db-mysql');
var config = require('../config/config').config;

exports.newClient = function(callback){
    new mysql.Database({
        hostname: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        charset: config.mysql.charset
    }).connect(function(error) {
        if (error) {
            return console.log('CONNECTION error: ' + error);
        }
        callback(this);
    });
}

