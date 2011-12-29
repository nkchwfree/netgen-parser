var Workers = require('./lib/workers').Workers;

var workers = new Workers( 'cninfo_lastest', 5 );
workers.send("<html><head></head><body><div id='hello'>Hello World.</div></body></html>", function(error, output){
    console.log(output);
});


/*
//测试读取本地文件
var fs = require('fs');


fs.readFile('f:/k.log', function (err, data) {
  if (err) throw err;
  console.log(data.toString());
  console.log({a:'a'});
});
*/

/*
var mysql = require('mysql');
var TEST_DATABASE = 'baidu';
var TEST_TABLE = 'b_space';
var client = mysql.createClient({
  user: 'root',
  password: 'develop',
});


// If no callback is provided, any errors will be emitted as `'error'`
// events by the client
client.query('USE '+TEST_DATABASE);

client.query(
  'SELECT * FROM '+TEST_TABLE,
  function selectCb(err, results, fields) {
    if (err) {
      throw err;
    }

    console.log(results);
    console.log(fields);
    client.end();
  }
);*/


/*
var Hook = require('hook.io').Hook;


var hook = new Hook( {
    name: 'weibo-tester',   // 根据模块进行修改
    'hook-host': '172.16.39.116',
    debug: true
});


var queue = 'sending';


hook.on('hook::ready', function(){
  hook.on('*::queued', function( queue ){
    console.log( queue + "有内容");
  });
  hook.emit('task-finished',{queue: queue, uri:'12345'});
  hook.emit('task-error',{queue: queue, uri:'12345'});
});
*/
