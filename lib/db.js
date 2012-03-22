var config = require('../config/config').config;

var mysql = require('mysql');

var client = mysql.createClient( config.mysql );
//client.query('USE stock_radar');
//client.query('set charset utf8');

var Db = function() {
    var self = this;

    self.getInfoByPageId = function(page_id, cb) {
        client.query(
            'SELECT * FROM page_content WHERE id='+page_id,
            function(error, results, fields) {
                if (error) {
                    throw error;
                }

                if(results.length==0) {
                    cb('empty', undefined);
                }
                else {
                    cb(undefined, results[0]);
                }
            }
        );
    }
}


Db.prototype.addUrl = function(url, in_time, stock_code, site, type, log_obj, cb) {
    log_obj.log("4.1 检查URL是否已经抓取过:"+url);
    client.query('SELECT * FROM url WHERE url=? AND stock_code = ? ', [url,stock_code], function(error, results, fields) {
        if (error) {
            cb(error, undefined);
            return;
        }

        if(results.length>0) {
            cb('url_stock_exist', undefined);
            return;
        }
        else {
            log_obj.log("4.2 插入新的URL:"+url);
            client.query('INSERT INTO url SET url = ?, in_time = ?, stock_code = ?, site = ?, type = ?', [ url, in_time, stock_code, site, type ], function(err, results) {
                if (err) {
                    cb(err, undefined);
                }
                else {
                    cb(undefined, results.insertId);
                }
            });
        }
    });
}

Db.prototype.addArticle = function(url, stock_code, title, content, meta, in_time, log_obj, cb) {
    log_obj.log('6.1 开始检查文章已经存在。');
    client.query('SELECT id FROM article_content WHERE url=?', [url], function(error, results, fields) {
        if (error) {
            log_obj.log('6.2 检查文章报错:'+error);
            cb(error, undefined);
            return;
        }

        //如果已经存在记录
        if(results.length>0) {
            log_obj.log('6.2 文章已经存在.');
            cb(undefined, results[0].id);
            return;
        }
        else {
            log_obj.log('6.2 开始插入文章.');
            client.query('INSERT INTO article_content SET source=?, url = ?, title = ?, in_time = ?, stock_code = ?, content = ?, meta = ?', [ meta.site, url, title, in_time, stock_code, content, JSON.stringify(meta) ], function(err, results) {
                if (err) {
                    log_obj.log('6.3 插入文章失败:'+err);
                    cb(err, undefined);
                }
                else {
                    log_obj.log('6.3 插入文章成功.');
                    cb(undefined, results.insertId);
                }
            });
        }
    });
}

Db.prototype.addArticleStockCode = function(article_id, stock_code, in_time, content_key, log_obj, cb) {
    log_obj.log('7.1 开始检查文章对应股票是否存在。');
    client.query('INSERT INTO article_stock SET article_id=?, stock_code = ?, in_time = ?, content_key = ?', [ article_id, stock_code, in_time, content_key ], function(err, results) {
        if (err) {
            log_obj.log('7.2 文章对应股票添加失败'+err);
            cb(err);
        }
        else {
            log_obj.log('7.2 文章对应股票添加成功。');
            cb(null, results.insertId);
        }
    });
}

Db.prototype.updateParserTime = function(url_id, parser_time, cb) {
    client.query('UPDATE page_content set parse_time=? WHERE id=?', [parser_time,url_id], function(error, results, fields) {
        if (error) {
            cb(error);
            return;
        }

        cb(undefined);
    });
}

exports.db = new Db();