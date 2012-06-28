var exec = require('child_process').exec;
var config = require('../config/config').config;
var news_config = require("../config/news").list;
//var md5 = require('MD5');

process.on('message', function(data) {
    //子进程的内存限制默认是64M。
    var memory_limit = config[memory_limit]||64;
    if(process.memoryUsage().rss > ( memory_limit * 1024 * 1024)) {
        process.exit();
    }

    //获取tidy的处理策略
    var strategy = config.tidy_strategy[data.data.site+'.'+data.data.type] || 'default';

    //调用tidy允许使用的内存限制，默认是2M。
    var max_buffer = config.max_buffer||2;

    if(strategy === 'original.gbk') {
        var iconv = require('../lib/iconv/iconv');
        var body = iconv.convert(data.data.text);

        var parser = require('../lib/matcher/'+data.data.site+'.'+data.data.type);
        parser.parse( body, data, function( error, match ){
            //console.log(match);
            process.send( { 'key': data.key, 'data': match, 'error': error } );
            //console.log(match.url_list.length);
            //console.log(match.content);
        });
    }
    else {
        var b = new Buffer(data.data.text);
        var content = b.toString('binary');
        //console.log(md5(content)+':'+content.length);
        content = content.replace(/<\/(strong|em|i|font)>/g,'').replace(/<(strong|em|i|font)( +[^<>]*)?>/g,'');
        content = content.replace(/document.write(ln)?\('<script /g,'');

        var match;
        var encoding = "binary";
        /*if(match = content.match(/charset=(utf-8)/i)) {
            //encoding = 'utf8';//match[1];
        }*/
        //console.log(encoding);
        var buffer = new Buffer(content, encoding);


        exec(config.php+' '+__dirname+'/tidy.php '+ strategy, {maxBuffer:max_buffer*1024*1024}, function(error, body, stderr){
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
                            //console.log(data.data.site+'.'+data.data.type);
                            //通用文章页面
                            if(data.data.type=='article') {
                                var parser = require('../lib/matcher/common.article');
                                parser.parse( window, data.data, function(err, match){
                                    process.send( { 'key': data.key, 'data': match, 'error': err } );
                                });
                            }
                            else if(news_config[data.data.site+'.'+data.data.type]) {
                                //通用的列表页面
                                var param = data.data;
                                param.config = news_config[data.data.site+'.'+data.data.type];
                                var parser = require('../lib/matcher/common.list');
                                parser.parse( window, param, function(err, match){
                                    process.send( { 'key': data.key, 'data': match, 'error': err } );
                                });
                            }
                            else {
                                console.log(e);
                            }
                            //var parser = require('../lib/matcher/common.'+data.data.type);
                        }
                    }
                });
            }
            else {
                process.send( { 'key': data.key, 'error': 'tidy-error '+error } );
            }
        }).stdin.end( buffer );
    }
});
