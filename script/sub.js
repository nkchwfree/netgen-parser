var exec = require('child_process').exec;
var config = require('../config/config').config;

process.on('message', function(data) {
    //子进程的内存限制默认是64M。
    var memory_limit = config[memory_limit]||64;
    if(process.memoryUsage().rss > ( memory_limit * 1024 * 1024)) {
        process.exit();
    }

    //调用tidy允许使用的内存限制，默认是2M。
    var max_buffer = config.max_buffer||2;
    exec(config.php+' '+__dirname+'/tidy.php', {maxBuffer:max_buffer*1024*1024}, function(error, body, stderr){
        if ( !error ) {
            var jsdom = require('jsdom');
            jsdom.env(body, [__dirname+'/jquery-1.7.1.min.js'], function(errors, window) {
                if( errors ){
                    process.send( { 'key': data.key, 'error': errors } );
                } else {
                    window.__stopAllTimers();

                    try {
                        var parser = require('../lib/matcher/'+data.data.site+'.'+data.data.type);
                        parser.parse( window, data.data, function( error, match ){
                            process.send( { 'key': data.key, 'data': match, 'error': error } );
                        });
                    }
                    catch(e) {
                        console.log(e);
                    }
                }
            });
        }
        else {
            process.send( { 'key': data.key, 'error': 'tidy-error '+error } );
        }
    }).stdin.end( data.data.text, 'binary' );
});
