var queue = require('../queue');
var _ = require('underscore');

exports.process = function(db, info, match, log_obj, cb) {
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

                db.addArticleStockCode(article_id, info.stock_code, time, match.content_key, log_obj, function(error, id){
                    //通知转发队列
                    if(!error) {
                        queue.article_stock.enqueue(queue.getQueueUrl('article_stock', id));
                    }
                });

                //插入图片
                _.each(match.image_list, function(item, key){
                    //content_key, url, article_id, time, meta, site, log_obj
                    db.addImage(match.content_key, item[0], article_id, time, {referer:meta.url, alt:item[1]}, meta.site, log_obj, function(error, image_id){
                        if(!error) {
                            queue.url.enqueue(queue.getQueueUrl('article_image', image_id));
                        }
                    });
                });
            }
            else {
                log_obj.log('11.0.插入内容失败:'+error);
            }
            cb();
        });
    }
}
