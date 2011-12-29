var Hook = require('hook.io').Hook;

var hookA = new Hook({
  name: "a"
});

hookA.on('*::sup', function(data){
  // outputs b::sup::dog
  console.log('hookA -> '+this.event + ': ' + data);
});
hookA.on('hook::ready', function(){
  hookA.emit('sup', 'kill');
})

// Hook.start defaults to localhost
// it can accept dnode constructor options ( for remote connections )
// these hooks can be started on diffirent machines / networks / devices
hookA.start();

var hookB = new Hook({
  name: "b"
});
hookB.on('*::sup', function(data){
  // outputs b::sup::dog
  console.log('hookB -> '+this.event + ': ' + data);
});

hookB.on('hook::ready', function(){
  hookB.emit('sup', 'dog');
});

hookB.start();


var hookC = new Hook({
  name: "c"
});

hookC.on('*::sup', function(data){
  // outputs b::sup::dog
  console.log('hookC -> '+this.event + ': ' + data);
});
hookC.on('hook::ready', function(){
  hookC.emit('sup', 'dog');
});

hookC.start();
