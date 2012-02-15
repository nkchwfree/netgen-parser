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


Db.prototype.addUrl = function(url, in_time, stock_code, site, type, cb) {
    client.query('SELECT * FROM url WHERE url=? AND stock_code = ? ', [url,stock_code], function(error, results, fields) {
        if (error) {
            cb(error, undefined);
            return;
        }

        if(results.length>0) {
            cb('no_result', undefined);
            return;
        }
        else {
            client.query('INSERT INTO url SET url = ?, in_time = ?, stock_code = ?, site = ?, type = ?', [ url, in_time, stock_code, site, type ], function(err, results) {
                if (err) {
                    //console.log(err);
                    cb(err, undefined);
                }
                else {
                    cb(undefined, results.insertId);
                }
            });
        }
    });
}

Db.prototype.addArticle = function(url, stock_code, title, content, meta, in_time, cb) {
    client.query('SELECT id FROM article_content WHERE url=?', [url], function(error, results, fields) {
        if (error) {
            cb(error, undefined);
            return;
        }

        //如果已经存在记录
        if(results.length>0) {
            cb(undefined, results[0].id);
            return;
        }
        else {
            client.query('INSERT INTO article_content SET source=?, url = ?, title = ?, in_time = ?, stock_code = ?, content = ?, meta = ?', [ meta.site, url, title, in_time, stock_code, content, JSON.stringify(meta) ], function(err, results) {
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

Db.prototype.addArticleStockCode = function(article_id, stock_code, in_time, cb) {
    client.query('SELECT id FROM article_stock WHERE article_id=? and stock_code=?', [article_id, stock_code], function(error, results, fields) {
        if (error) {
            cb(error);
            return;
        }

        //如果已经存在记录
        if(results.length>0) {
            cb(null, results[0].id);
            return;
        }
        else {
            client.query('INSERT INTO article_stock SET article_id=?, stock_code = ?, in_time = ?', [ article_id, stock_code, in_time ], function(err, results) {
                if (err) {
                    cb(err);
                }
                else {
                    cb(null, results.insertId);
                }
            });
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