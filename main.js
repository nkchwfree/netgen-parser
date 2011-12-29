var config = require('config/config').config;

var Parser = require('./lib/parser').Parser;

var parser = new Parser( config.worker_number );


var hook = require('devent').createDEvent('convertor');

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
  console.log('task-error');
});

hook.on('queued', function( queue ){
  console.log(queue);
  if(queue=='page_content') {
    console.log('emit event.');
    parser.emit('has-task');
  }
});

var func = function(){
  parser.emit('has-task');
  setTimeout(func, config.interval);
}

func.call();


