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
  var queue = require('queuer');
  var q_content = queue.getQueue(config.queue, 'page_content');
  var url_content = queue.getQueue(config.queue, 'url');
  var article_content = queue.getQueue(config.queue, 'article_content');
  var queue_max = new QueueMax(number, config.query_timeout||10);

  function parsePage(task, cb) {
    log.debug(task);
    //添加一个任务计数
    queue_max.add();

    //解析URI
    try {
      var url_info = url.parse(task.uri);
    }
    catch(e) {
      log.debug('错误的Task：' + task);

      queue_max.delete();
      self.emit('uri-error', task);
      return false;
    }

    var url_id = url_info.hash.substr(1);
    db.getInfoByPageId(url_id, function(error, info){
      if(error) {
        //log.debug('getInfoByPageId:'+error+' '+ task.uri);
        queue_max.delete();
        self.emit('no-page-content', task);
        return;
      }

      //log.debug(content_info);
      var meta = JSON.parse(info.meta);
      log.debug('parse url: '+'['+url_id+'] '+meta.url);

      var date = DateUtil.formatDate('yyyyMMdd', new Date()));
      workers.send({text:info.content, site:meta.site, type:meta.type, date:date}, function(error, match){
        cb();

        if(error) {
          log.debug('Parser Error:'+error);
          self.emit(error, task);
        }
        else {
          log.debug(match);

          //插入URL表
          for(var i=0;i<match.url_list.length;i++) {
            db.addUrl(match.url_list[i].url, getTime(), info.stock_code, meta.site, match.url_list[i].type, function(error, url_id){
              if(!error) {
                url_content.enqueue(getQueueUrl('url', url_id));
              }
            });
          }

          if(match.image_list.length>0) {
            meta['has_images'] = true;
          }

          //插入文章内容表
          if(match.content && match.content.length>0) {
            db.addArticle(meta.url, info.stock_code, match.title, match.content, meta, getTime(), function(error, article_id){
              if(!error) {
                article_content.enqueue(getQueueUrl('article_content', article_id));
                log.debug('Add Article:'+article_id);
              }
            });
          }

          //更新数据库
          db.updateParserTime(url_id, getTime(), function(error){
            if(error) {
              log.debug('updateParserTime Error:'+error);
            }
          });

          self.emit('task-finished', task);
        }

        //减少一个任务计数
        queue_max.delete();
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
