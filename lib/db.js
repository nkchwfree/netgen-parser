var config = require('../config/config').config;

var mysql = require('mysql');

config.mysql.charset = "UTF8";
var client = mysql.createConnection( config.mysql );
//client.query('USE stock_radar');
//client.query('set charset utf8');
var newClient = require('../lib/db_mysql').newClient;

var db_client;

function _getInfoByPageId(client, page_id, cb) {
    client.query('SELECT * FROM page_content WHERE id='+page_id).execute(function(error, rows, cols) {
        if (error) {
            console.log('getInfoByPageId:'+error);
            cb(error);
            return;
        }

        if(rows.length==0) {
            cb('empty');
        }
        else {
            rows[0].content = rows[0].content.toString();
            cb(null, rows[0]);
        }
    });
}


var Db = function() {
    var self = this;

    self.getInfoByPageId = function(page_id, cb) {
        if(db_client) {
            _getInfoByPageId(db_client, page_id, cb);
        }
        else {
            newClient(function(client){
                db_client = client;
                _getInfoByPageId(db_client, page_id, cb);
            });
        }
    }
}


Db.prototype.addUrl = function(url, in_time, stock_code, site, type, log_obj, cb) {
    log_obj.log("4.1 检查URL是否已经抓取过:"+url);
    console.log('SELECT * FROM url WHERE url = '+ client.escape(url));
    var sql = 'SELECT * FROM url WHERE url = '+ client.escape(url);
    client.query(sql, function(error, results, fields) {
        if (error) {
            cb(error, null);
            return;
        }

        if(results.length>0) {
            cb('url_exist', null);
            return;
        }
        else {
            log_obj.log("4.2 插入新的URL:"+url);
            client.query('INSERT INTO url SET url = ?, in_time = ?, stock_code = ?, site = ?, type = ?', [ url, in_time, stock_code, site, type ], function(err, results) {
                if (err) {
                    cb(err, null);
                }
                else {
                    cb(null, results.insertId);
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

Db.prototype.updateParserTime = function(url_id, parser_time, cb) {
    client.query('UPDATE page_content set parse_time=? WHERE id=?', [parser_time,url_id], function(error, results, fields) {
        if (error) {
            cb(error);
            return;
        }

        cb(undefined);
    });
}

Db.prototype.getContentInfoByKey = function(content_key, cb) {
    client.query('SELECT * FROM article_content_info WHERE content_key=?', [content_key], function(error, results, fields) {
        if (error) {
            //log_obj.log('6.2 检查文章报错:'+error);
            cb(error);
            return;
        }
        else {
            if(results.length>0) {
                cb(null, results[0]);
            }
            else {
                cb('no-info');
            }
        }
    });
}

Db.prototype.addContentKey = function(url, title, meta, stock_code, source, in_time, total_page, content_key, log_obj, cb) {
    log_obj.log('21.1 开始插入content_key信息。');
    client.query('INSERT INTO article_content_info SET url=?, title = ?, meta = ?, stock_code = ?, source = ?, in_time = ?, total_page = ?, content_key = ?', [ url, title, meta, stock_code, source, in_time, total_page, content_key ], function(err, results) {
        if (err) {
            log_obj.log('21.2 插入content_key信息'+err);
            cb(err);
        }
        else {
            log_obj.log('21.2 插入content_key信息成功。');
            cb(null, results.insertId);
        }
    });
}

Db.prototype.addContentPage = function(content_key, page, content, time, log_obj, cb) {
    log_obj.log('22.1 开始插入content_page信息。');
    client.query('INSERT INTO article_content_page SET content_key=?, page = ?, content = ?, in_time = ?', [ content_key, page, content, time ], function(err, results) {
        if (err) {
            log_obj.log('22.2 插入content_page信息失败:'+err);
        }
        else {
            log_obj.log('22.2 插入content_page信息成功:');
        }
        cb();
    });
}

Db.prototype.checkAppPageFinished = function(content_key, log_obj, cb){
    var _self = this;
    log_obj.log('23.1 开始检查所有页面是否抓取完毕。');
    client.query('SELECT * FROM article_content_page where content_key=?', [content_key], function(err,results,fields){
        if(err) {
            log_obj.log('23.2 开始检查所有页面是否抓取完毕错误:'+err);
            return;
        }

        client.query('SELECT * FROM article_content_info WHERE content_key=?', [content_key], function(error, info, fields) {
            if (err) {
                log_obj.log('23.3 开始检查所有页面是否抓取完毕错误:'+err);
                return;
            }
            else {
                //如果已经抓全
                if(!err && info.length>0 && results.length==info[0].total_page && info[0].article_id==0) {
                    log_obj.log('23.4 所有页面已经抓取完毕。');
                    var arr = [];
                    for(var i=0;i<results.length;i++) {
                        arr.push( results[i].content );
                    }
                    var content = arr.join("\r\n");

                    var meta = JSON.parse(info[0].meta);
                    _self.addArticle(info[0].url, info[0].stock_code, info[0].title, content, meta, info[0].in_time, log_obj, function(err,article_id){
                        log_obj.log('23.5 添加合并后的页面。');
                        client.query('UPDATE article_content_info SET article_id=? where content_key = ?', [ article_id, content_key ]);
                        client.query('UPDATE article_image SET article_id=? where content_key = ?', [ article_id, content_key ]);
                    });
                }
            }
        });
    });
}

Db.prototype.addImage = function(content_key, url, article_id, time, meta, site, log_obj, cb) {
    log_obj.log('24.1 开始插入content_image信息。');
    client.query('INSERT INTO article_image SET content_key=?, url = ?, article_id = ?, in_time = ?, meta = ?, site = ?', [ content_key, url, article_id, time, JSON.stringify(meta), site ], function(err, results) {
        if (err) {
            log_obj.log('24.2 插入content_image信息失败:'+err);
        }
        else {
            cb(null, results.insertId);
            log_obj.log('24.2 插入content_image信息成功:');
        }

    });
}

Db.prototype.addBulletin = function(key_code, stock_code, title, content, meta, in_time, log_obj, cb) {
    log_obj.log('6.1 开始检查公告是否已经存在。');
    client.query('SELECT id FROM bulletin WHERE key_code=?', [key_code], function(error, results, fields) {
        if (error) {
            log_obj.log('6.2 检查公告报错:'+error);
            cb(error, undefined);
            return;
        }

        //如果已经存在记录
        if(results.length>0) {
            log_obj.log('6.2 公告已经存在.');
            cb(undefined, results[0].id);
            return;
        }
        else {
            log_obj.log('6.2 开始插入公告.');
            client.query('INSERT INTO bulletin SET site = ?, key_code = ?, title = ?, in_time = ?, stock_code = ?, content = ?, meta = ?', [ meta.site, key_code, title, in_time, stock_code, content, JSON.stringify(meta) ], function(err, results) {
                if (err) {
                    log_obj.log('6.3 插入公告失败:'+err);
                    cb(err, undefined);
                }
                else {
                    log_obj.log('6.3 插入公告成功.');
                    cb(undefined, results.insertId);
                }
            });
        }
    });
}

exports.db = new Db();