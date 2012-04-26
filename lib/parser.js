var util = require("util");
var event = new require("events").EventEmitter;
var Workers = require('./workers').Workers;
var log = require('./log');
var db = require('./db').db;
var url = require('url');
var config = require('../config/config').config;

var DateUtil = require('./date').DateUtil;
var QueueMax = require('./queue_max').QueueMax;


var Parser = function(number) {
    var self = this;
    var workers = new Workers(number);
    var q_content = require('./queue').page_content;
    var queue_max = new QueueMax(number*2, config.query_timeout||10);

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

            var meta = JSON.parse(info.meta);
            var log_obj = getLog(url_id, meta.url);
            log_obj.log('1.0.解析完成任务信息.');


            var date = DateUtil.formatDate('yyyyMMdd', new Date());
            workers.send({text:info.content, site:meta.site, type:meta.type, date:date, url:meta.url}, function(error, match){
                log_obj.log('2.0.子进程完成解析.');


                if(error) {
                    //log.debug('Parser Error:'+error);
                    //减少一个任务计数
                    queue_max.delete();

                    log_obj.log('3.0.子进程解析过程返回错误:'+error);
                    self.emit(error, error, task);

                    cb();
                }
                else {
                    log.debug(match);

                    //进行数据库更新，插入，通知队列等逻辑处理
                    var process;
                    try {
                        process = require("./process/"+meta.site+'.'+meta.type).process;
                    }
                    catch(e) {
                        console.log(e);
                        //减少一个任务计数
                        queue_max.delete();
                    }

                    process(db, info, match, log_obj, function(error){
                        log_obj.log('8.0.开始更新解析时间。');
                        //更新数据库
                        db.updateParserTime(url_id, getTime(), function(error){
                            if(error) {
                                log_obj.log('9.0.更新解析时间失败:'+error);
                            }
                            else {
                                log_obj.log('9.0.更新解析时间成功。');
                            }
                        });

                        //减少一个任务计数
                        queue_max.delete();

                        log_obj.log('10.0.任务解析完成。');
                        self.emit('task-finished', task);

                        cb();
                    });
                }
            });
        });
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
                    log.debug(task);
                    log.debug('=================');

                    //如果重试超过3次，则直接完成任务。
                    if(task.retry>3) {
                        self.emit('retry_too_many_times', 'retry_too_many_times', task);
                        func();
                    }
                    else {
                        parsePage(task, func);
                    }
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
