var cp = require('child_process');

var Worker = function( queue ){
  var self = this;
  self.cb = {};
  self.writable = false;
  self.count = 0;
  var obj;

  var onWritable = function(){
    if( self.writable && (obj = queue.shift()) != undefined ) {
      self.send( obj.data, obj.cb );
    } else {
      setTimeout(onWritable, 100);
    }
  };

  var onMessage = function( data ){
    obj = undefined;
    var key = data.key;
    if( key != undefined && self.cb[ key ] ) {
      var cb = self.cb[ key ];
      //console.log(data);
      cb( data.error, data.data );
      delete self.cb[ key ];
      self.writable = true;
      onWritable();
    }
  };

  var onExit = function(){
    if(obj) queue.unshift(obj);
    obj = undefined;
    self.writable = false;
    self.worker = cp.fork(__dirname + '/../script/sub.js');
    self.worker.on('message', onMessage);
    self.worker.on('exit', onExit);
    self.writable = true;
    onWritable();
  };

  onExit();
};

Worker.prototype.send = function( data, cb ){
  this.writable = false;
  var key = this.count++;
  if( typeof cb == 'function' ) {
    this.cb[ key ] = cb;
  }
  this.worker.send( { key: key, data: data } );
};

var Workers = function( num ){
  var count = 0;
  var workers = [];
  this.queue = [];
  while(num-->0){
    workers.push(new Worker( this.queue ));
  }
};

Workers.prototype.send = function( data, cb ){
  this.queue.push( { data: data, cb: cb } );
}

Workers.prototype.queueLength = function(){
  return this.queue.length;
}

function Factory() {
    var table = {};

    this.getWorkers = function(site, type) {
        var key = site+'.'+type;
        if(!table[key]) {
          table[key] = new Workers(key, 5);
        }
        return table[key];
    }
}

exports.Workers = Workers;
