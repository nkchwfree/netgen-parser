var exec = require('child_process').exec;
var config = require('../config/config').config;

process.on('message', function(data) {
  if(process.memoryUsage().rss > (60 * 1024 * 1024)) {
    process.exit();
  }

  exec(config.php+' '+__dirname+'/tidy.php', function(error, body, stderr){
    if ( !error ) {
      var jsdom = require('jsdom');
      jsdom.env(body, [__dirname+'/jquery-1.7.1.min.js'], function(errors, window) {
        if( errors ){
          process.send( { 'key': data.key, 'error': errors } );
        } else {
          window.__stopAllTimers();
          var parser = require('../lib/matcher/'+data.data.site+'.'+data.data.type);
          parser.parse( window, data.data, function( error, match ){
            process.send( { 'key': data.key, 'data': match, 'error': error } );
          });
        }
      });
    }
    else {
      process.send( { 'key': data.key, 'error': 'tidy-error '+error } );
    }
  }).stdin.end( data.data.text, 'binary' );
});
