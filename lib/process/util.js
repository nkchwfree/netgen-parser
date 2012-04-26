var _ = require('underscore');
var queue = require('../queue');
var async = require('async');

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
exports.list_save = exports.process;

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

exports.article_save_pages = function(db, info, match, log_obj, cb) {
    function getTask(db, info, match, time, log_obj) {
        return function(callback) {
            callback(null, db, info, match, time, log_obj);
        }
    }

    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

    if(match.image_list.length>0) {
        meta['has_images'] = true;
    }

    if(match.total_page>1) {
        log_obj.log("15.0 开始处理多页面。");
        var flows = [
            getTask(db, info, match, time, log_obj),//插入content_key和stock_code的对应关系
            function(db, info, match, time, log_obj, callback){//插入内容说明
                log_obj.log("第二步。");
                if(match.page==1) {
                    var meta = JSON.parse(info.meta);
                    db.addContentKey(meta.url, match.title, info.meta, info.stock_code, meta.site, time, match.total_page, match.content_key, log_obj, function(){
                        callback(null, db, info, match, time, log_obj);
                    });
                }
                else {
                    callback(null, db, info, match, time, log_obj);
                }
            },
            function(db, info, match, time, log_obj, callback) {//插入分页
                log_obj.log("第三步。");
                db.addContentPage(match.content_key, match.page, match.content, time, log_obj, function(){
                    callback(null, db, info, match, time, log_obj);
                });
            },
            function(db, info, match, time, log_obj, callback) {//插入图片
                /*
                _.each(match.image_list, function(item, key){
                    //content_key, url, article_id, time, meta, site, log_obj
                    db.addImage(match.content_key, item[0], 0, time, {referer:meta.url, alt:item[1]}, meta.site, log_obj, function(error, image_id){
                        if(!error) {
                            queue.url.enqueue(queue.getQueueUrl('article_image', image_id));
                        }
                    });
                });*/
                callback(null, db, info, match, time, log_obj);
            },
            function(db, info, match, time, log_obj, callback) {//检查是否所有页面都抓取完毕
                log_obj.log("第四步。");
                db.checkAppPageFinished(match.content_key, log_obj, function(article_id){
                    //暂时先不抓图
                    //queue.article_content.enqueue(queue.getQueueUrl('article_content', article_id));
                });
            }
        ];

        async.waterfall( flows, function(error){
            if(error) {
                log_obj.log("15.99 处理多页面失败");
            }
            else {
                log_obj.log("15.99 处理多页面成功。");
            }
        });

        //插入分页的url到队列
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
    else {
        //如果没有分页，则直接处理
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
                                queue.url.enqueue(queue.getQueueUrl('article_image', image_id));
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
        else {
            cb();
        }
    }
}

exports.bulletin_save = function(db, info, match, log_obj, cb) {
    //插入公告列表
    var meta = JSON.parse(info.meta);
    var time = Math.floor(new Date().getTime()/1000);

    db.addBulletin(meta.url, match.stock_code, match.title, match.content, meta, time, log_obj, function(error, id){
        if(!error) {
            log_obj.log('11.0.插入公告成功。');

            //通知转换微博队列
            //queue.bulletin.enqueue(queue.getQueueUrl('bulletin', id));
        }
        else {
            log_obj.log('11.0.插入公告失败:'+error);
        }
        cb();
    });
}