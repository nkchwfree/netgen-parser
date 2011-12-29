var util = require("util");
var event = new require("events").EventEmitter;
var exec = require('child_process').exec;
var url = require('url');
var db = require('./db').db;
var Workers = require('./workers').Workers;
var output = require('./log').log;


var Parser = function(number) {
  var self = this;
  var workers = new Workers(number);
  var queue = require('../../queuer/lib/queue');
  var q_content = queue.getQueue('http://127.0.0.1:3000/queue', 'page_content');
  var url_content = queue.getQueue('http://127.0.0.1:3000/queue', 'url');
  var article_content = queue.getQueue('http://127.0.0.1:3000/queue', 'article_content');

  function parsePage(task) {
    console.log(task);

    //解析URI
    try {
      var url_info = url.parse(task.uri);
    }
    catch(e) {
      console.log('错误的Task：' + task);
      //hook.emit('task-finished', task);
      self.emit('uri-error',task);
      return false;
    }

    db.getInfoByPageId(url_info.hash.substr(1), function(error, info){
      if(error!='good') {
        console.log('getInfoByPageId:'+error+' '+ task.uri);
        self.emit('no-page-content',task);
        return;
      }

      //console.log(content_info);
      var meta = JSON.parse(info.meta);
      //console.log(meta);

      var content = info.content;
      //content = "<div id='hello'>Hello World.</div>";

      //require('fs').writeFile(__dirname+'/page.txt', content, function(){});

      exec('/usr/local/php/bin/php '+__dirname+'/../script/tidy.php', function(error, body, stderr){
        if ( !error ) {
          //console.log(body);
          require('fs').writeFile(__dirname+'/page.txt', body+"\r\n"+meta.url, function(){});

          workers.send({text:body,site:meta.site,type:meta.type}, function(error, match){
            //console.log('Parse result is:');
            //console.log(meta.url);
            //console.log(match);

            //插入URL表
            for(var i=0;i<match.url_list.length;i++) {
              db.addUrl(match.url_list[i].url, getTime(), info.stock_code, meta.site, match.url_list[i].type, function(url_id){
                if(url_id>0) {
                  url_content.enqueue('mysql://172.16.33.237:3306/stock_radar?url#'+url_id);
                }
              });
            }

            if(match.image_list.length>0) {
              meta['has_images'] = true;
            }

            //插入文章内容表
            if(match.content) {
              db.addArticle(meta.url, info.stock_code, match.title, match.content, meta, getTime(), function(article_id){
                if(article_id>0) {
                  article_content.enqueue('mysql://172.16.33.237:3306/stock_radar?article_content#'+article_id);
                  console.log('Add Article:'+article_id);
                }
                else {
                  console.log('Skip Article:'+article_id);
                }
              });
            }

            self.emit('task-finished', task);
          });
        }
        else {
          console.log('tidy error:');
          console.log(error);
          self.emit('tidy-error', task);
        }
      }).stdin.end( content, 'binary' );
    });
  }

  function getTime() {
    return Math.floor(new Date().getTime()/1000);
  }

  self.on('has-task', function(){
    output('Check Task.');
    var func = function(){
      console.log('Workers Queue:'+workers.queueLength());
      if( workers.queueLength()>number/2) {
        console.log('Workers Queue is Full:'+workers.queueLength());
        return;
      }

      q_content.dequeue(function(error, task){
        //error = 'yes';
        //task = {'queue':'page_content',uri:'mysql://172.16.39.117:3306/spider?url#121'};
        if(error!='empty') {
          parsePage(task);
          func.call();
        }
        else {
          output('Check Succeed. No Task.');
        }
      });
    }
    func.call();
  })

  self.queueLength = function(){
    return workers.queueLength();
  }
}
util.inherits(Parser, event);



exports.Parser = Parser;