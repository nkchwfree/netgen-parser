var util = require('./util');
var _ = require('underscore');
var queue = require('../queue');
var md5 = require('MD5');

exports.process = function(db, info, match, log_obj, cb) {
    //插入公告列表
    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

    _.each(match.bulletins, function(item, key){
        var key_code = md5(item.stock_code + item.title + item.content);
        db.addBulletin(key_code, item.stock_code, item.title, item.content, meta, time, log_obj, function(error, id){
            if(!error) {
                log_obj.log('11.0.插入公告成功。');

                //通知转换微博队列
                //queue.bulletin.enqueue(queue.getQueueUrl('bulletin', id));
            }
            else {
                log_obj.log('11.0.插入公告失败:'+error);
            }
        });
    });

    _.each(match.url_list, function(item, key){
        db.addUrl(item.url, time, info.stock_code, meta.site, item.type, log_obj, function(error, url_id){
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