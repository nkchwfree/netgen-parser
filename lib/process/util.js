var _ = require('underscore');
var queue = require('../queue');

exports.process = function(db, info, match, log_obj, cb) {
    //插入URL列表
    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

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

exports.article_save = function(db, info, match, log_obj, cb) {
    //插入公告列表
    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

    if(match.image_list.length>0) {
        meta['has_images'] = true;
    }

    if(match.content && match.content.length>0) {
        db.addArticle(meta.url, info.stock_code, match.title, match.content, meta, time, log_obj, function(error, article_id){
            if(!error) {
                log_obj.log('11.0.插入内容成功。');

                //通知转换微博队列
                queue.article_content.enqueue(queue.getQueueUrl('article_content', article_id));

                /*//插入图片
                _.each(match.image_list, function(item, key){
                    //content_key, url, article_id, time, meta, site, log_obj
                    db.addImage(match.content_key, item[0], article_id, time, {referer:meta.url, alt:item[1]}, meta.site, log_obj, function(error, image_id){
                        if(!error) {
                            //暂时先不抓图
                            //queue.url.enqueue(queue.getQueueUrl('article_image', image_id));
                        }
                    });
                });*/
            }
            else {
                log_obj.log('11.0.插入内容失败:'+error);
            }
            cb();
        });
    }
}