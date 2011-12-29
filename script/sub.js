var argv = require('optimist').argv;

process.on('message', function(data) {
  if(process.memoryUsage().rss > (150 * 1024 * 1024)) {
    process.exit();
  }
  //console.log(__dirname+'/jquery-1.7.1.min.js');
  var jsdom = require('jsdom');
  //console.log(data);

  jsdom.env(data.data.text, [__dirname+'/jquery-1.7.1.min.js'], function(errors, window) {
    if( errors ){
      process.send( { 'key': data.key, 'error': errors } );
      //console.log("sub.js error "+errors);
    } else {
      window.__stopAllTimers();
      var parser = require('../lib/matcher/'+data.data.site+'.'+data.data.type);
      parser.parse( window, function( error, out ){
        process.send( { 'key': data.key, 'data': out, 'error': error } );
      } );
    }
  });
});
