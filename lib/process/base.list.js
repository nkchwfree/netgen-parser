var util = require('./util');
var _ = require('underscore');
var queue = require('../queue');

exports.process = function(db, info, match, log_obj, cb) {
    //插入URL列表
    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

    _.each(match.url_list, function(item, key){
        db.addUrl(item.url, time, info.stock_code, item.site, item.type, log_obj, function(error, url_id){
            if(!error) {
                queue.url.enqueue(queue.getQueueUrl('url', url_id));
                log_obj.log('5.0.插入URL成功:'+item.url);
            }
            else {
                log_obj.log('5.0.插入URL失败:'+item.url + " " +error);
            }
        });
    });
    cb();
}