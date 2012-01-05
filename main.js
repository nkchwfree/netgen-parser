var config = require('./config/config').config;
var log = require('./lib/log');

var Parser = require('./lib/parser').Parser;

var parser = new Parser( config.worker_number );


var hook = require('devent').createDEvent('convertor');

parser.on('task-finished', function(task){
  try {
    hook.emit('task-finished', task);
  }
  catch(e) {
    log.debug('Task Finished Error.');
    log.debug(e);
  }
});

var report_task_error = function(task) {
  try {
    if(task.retry<=3) {
      hook.emit('task-error', task);
    }
    else {
      hook.emit('task-finished', task);
    }
  }
  catch(e) {
    log.debug('Task-Error Error.');
    log.debug(e);
  }
}
parser.on('tidy-error', report_task_error);

parser.on('uri-error', report_task_error);

parser.on('no-page-content', report_task_error);

hook.on('queued', function( queue ){
  log.debug(queue);
  if(queue=='page_content') {
    log.debug('emit event.');
    parser.emit('has-task');
  }
});

var func = function(){
  parser.emit('has-task');
  setTimeout(func, config.interval);
}

func.call();


