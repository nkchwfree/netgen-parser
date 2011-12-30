var config = require('./config/config').config;

var Parser = require('./lib/parser').Parser;

var parser = new Parser( config.worker_number );


var hook = require('devent').createDEvent('convertor');

parser.on('task-finished', function(task){
  try {
    hook.emit('task-finished', task);
  }
  catch(e) {
    console.log('Task Finished Error.');
    console.log(e);
  }
});

var report_task_error = function(task) {
  try {
    hook.emit('task-error', task);
  }
  catch(e) {
    console.log('Task-Error Error.');
    console.log(e);
  }
}
parser.on('tidy-error', report_task_error);

parser.on('uri-error', report_task_error);

parser.on('no-page-content', report_task_error);

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


