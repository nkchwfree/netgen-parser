var queue = require('../queue');

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
            }
            else {
                log_obj.log('11.0.插入内容失败:'+error);
            }
            cb();
        });
    }
}
