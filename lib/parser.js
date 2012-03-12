var util = require("util");
var event = new require("events").EventEmitter;
var Workers = require('./workers').Workers;
var log = require('./log');
var db = require('./db').db;
var url = require('url');
var config = require('../config/config').config;

var DateUtil = require('./date').DateUtil;
var QueueMax = require('./queue_max').QueueMax;

var async = require('async');


var Parser = function(number) {
    var self = this;
    var workers = new Workers(number);
    var queue = require('queuer');
    var q_content = queue.getQueue(config.queue, 'page_content');
    var url_content = queue.getQueue(config.queue, 'url');
    var article_content = queue.getQueue(config.queue, 'article_content');
    var article_stock = queue.getQueue(config.queue, 'article_stock');
    var queue_max = new QueueMax(number*2, config.query_timeout||10);


    //处理文章时，获得任务的方法。
    function getTask(url, stock_code, title, content, meta, time, log_obj) {
        return function(callback) {
            db.addArticle(url, stock_code, title, content, meta, time, log_obj, function(error, article_id){
                if(!error) {
                    article_content.enqueue(getQueueUrl('article_content', article_id));
                    //log.debug('Add Article:'+article_id);
                    callback(null, article_id, stock_code, time, log_obj)
                }
                else {
                    callback(error);
                }
            });
        }
    }

    //通知转发队
    function addStockQueue(id,callback) {
        article_stock.enqueue(getQueueUrl('article_stock', id));
        callback(null);
    }

    //获得输出Log的对象
    function getLog(page_content_id, url) {
        return {log:function(msg){
           log.log('DL['+page_content_id+']['+url+'] ' + msg);
        }};
    }

    function parsePage(task, cb) {
        log.debug(task);


        //解析URI
        try {
            var url_info = url.parse(task.uri);
        }
        catch(e) {
            log.debug('错误的Task：' + task);

            self.emit('uri-error', e, task);
            return false;
        }

        //添加一个任务计数
        queue_max.add();

        var url_id = url_info.hash.substr(1);
        log.debug(" TIME(getInfoByPageId1):"+url_id+' '+task.uri);
        db.getInfoByPageId(url_id, function(error, info){
            log.debug(" TIME(getInfoByPageId2):"+task.uri);
            if(error) {
                //log.debug('getInfoByPageId:'+error+' '+ task.uri);
                queue_max.delete();
                self.emit('no-page-content', 'no-page-content', task);
                return;
            }

            //log.debug(content_info);
            var meta = JSON.parse(info.meta);
            //log.debug('parse url: '+'['+url_id+'] '+meta.url);
            var log_obj = getLog(url_id, meta.url);
            log_obj.log('1.0.解析完成任务信息.');

            //log.debug(" TIME(before Workers):"+task.uri);
            var date = DateUtil.formatDate('yyyyMMdd', new Date());
            workers.send({text:info.content, site:meta.site, type:meta.type, date:date}, function(error, match){
                //log.debug(" TIME(begin Workers):"+task.uri);
                log_obj.log('2.0.子进程完成解析.');
                cb();

                if(error) {
                    //log.debug('Parser Error:'+error);
                    //减少一个任务计数
                    queue_max.delete();

                    log_obj.log('3.0.子进程解析过程返回错误:'+error);
                    self.emit(error, error, task);
                }
                else {
                    log.debug(match);

                    //log.debug(" TIME(before add url):"+task.uri);
                    //log_obj.log('4.0.开始插入解析出来的详情页面。');
                    //插入URL表
                    for(var i=0;i<match.url_list.length;i++) {
                        db.addUrl(match.url_list[i].url, getTime(), info.stock_code, meta.site, match.url_list[i].type, log_obj, function(error, url_id){
                            if(!error) {
                                url_content.enqueue(getQueueUrl('url', url_id));
                                log_obj.log('5.0.插入URL成功:'+match.url_list[i].url);
                            }
                            else {
                                log_obj.log('5.0.插入URL失败:'+match.url_list[i].url + " " +error);
                            }
                        });
                    }
                    //log_obj.log('6.0.插入解析出来的详情页面完成。');

                    if(match.image_list.length>0) {
                        meta['has_images'] = true;
                    }

                    //log.debug(" TIME(before add content):"+task.uri);

                    //插入文章内容表
                    if(match.content && match.content.length>0) {
                        log.debug(info.stock_code+" : " + meta.url);
                        var flows = [getTask(meta.url, info.stock_code, match.title, match.content, meta, getTime(), log_obj), db.addArticleStockCode, addStockQueue];
                        async.waterfall( flows, function(error){
                            if(error) {
                                //log.log("Add Content Error:"+error);
                                log_obj.log('7.0.插入文章任务链错误:'+error);
                            }
                            else {
                                log_obj.log('7.0.插入文章成功。');
                            }
                        });
                    }

                    //log.debug(" TIME(before update parse time):"+task.uri);
                    log_obj.log('8.0.开始更新解析时间。');
                    //更新数据库
                    db.updateParserTime(url_id, getTime(), function(error){
                        if(error) {
                            //log.debug('updateParserTime Error:'+error);
                            log_obj.log('9.0.更新解析时间失败:'+error);
                        }
                        else {
                            log_obj.log('9.0.更新解析时间成功。');
                        }
                    });

                    //减少一个任务计数
                    queue_max.delete();

                    //log.debug(" TIME(before finish task):"+task.uri);
                    log_obj.log('10.0.任务解析完成。');
                    self.emit('task-finished', task);
                }


            });
        });
    }

    function getQueueUrl(name, id) {
        return 'mysql://'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.database+'?'+name+'#'+id;
    }

    function getTime() {
        return Math.floor(new Date().getTime()/1000);
    }

    self.on('has-task', function(){
        log.log('Check Task.');
        var func = function(){
            log.log('Workers Queue:'+workers.queueLength());
            if( workers.queueLength()>number/2 || queue_max.isFull()) {
                log.log('Workers Queue or getInfoByPageId is Full:'+workers.queueLength()+","+queue_max.length());
                return;
            }

            q_content.dequeue(function(error, task){
                //error = 'yes';
                //task = {'queue':'page_content',uri:'mysql://172.16.39.117:3306/spider?url#121'};

                if(error!='empty') {
                    log.debug('++++++++++++++++');
                    log.debug(error);
                    log.debug(task);
                    log.debug('=================');
                    parsePage(task, func);
                }
                else {
                    log.log('Check Succeed. No Task.');
                }
            });
        }
        func();
    })

    self.queueLength = function(){
        return workers.queueLength();
    }
}
util.inherits(Parser, event);

exports.Parser = Parser;
