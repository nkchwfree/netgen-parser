var config = require('../config/config').config;

var redis = require("redis");
var client = redis.createClient(config.redis.port, config.redis.host, {detect_buffers: true});
client.select(config.redis.db);
client.on('ready', function() {
    client.select(config.redis.db);
});

/*
function Redis() {
}


Redis.Connect = function(){
    var client;
    var ready = false;

    return {
        connect : function(callback){
            if(ready===true) {
                callback(redis);
                return;
            }
            else {
                client = redis.createClient(config.redis.host, config.redis.port, {detect_buffers: true});
            }
        }
    };
}();


Redis.prototype.hset = function(hast_key, key, value) {
    var redis =
}*/

exports.redis = client;