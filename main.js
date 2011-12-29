var Parser = require('./lib/parser').Parser;

var parser = new Parser(2);


//Hook
var Hook = require('hook.io').Hook;
var hook = new Hook( {
    name: 'parser',   // 根据模块进行修改
    'hook-host': '127.0.0.1',
    debug: true
});

hook.on('hook::ready', function(){
  console.log('Hook Ready.');
  parser.on('task-finished', function(task){
    hook.emit('task-finished', task);
  });

  parser.on('tidy-error', function(task){
    hook.emit('task-error', task);
  });

  parser.on('uri-error', function(task){
    hook.emit('task-error', task);
  });

  parser.on('no-page-content', function(task){
    hook.emit('task-error', task);
  });

  hook.on('*::queued', function( task ){
    if(task.queue=='page_content') {
      console.log('emit event.');
      parser.emit('has-task');
    }
  });

  var func = function(){
    parser.emit('has-task');
    setTimeout(func, 10000);
  }

  func.call();
});


hook.connect();