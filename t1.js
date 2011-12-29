var Hook = require('hook.io').Hook;
var hook = new Hook({ name : 'parser', 'hook-host' : '127.0.0.1', debug : true });
hook.on('hook::ready', function() {
  hook.on('*::queued', function(queue) {
   console.log('some task is added to the queue');
  });
});
hook.connect();
