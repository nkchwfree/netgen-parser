var assert = require('assert');
var fs =  require('fs');



var vows = require('vows');
vows.describe('Receiver').addBatch({
    "正常情况":{
        topic:function(){
            var callback = this.callback;
            fs.readFile(__dirname+'/resources/sina.article.1.htm', function (err, data) {
                if(err) {
                    throw err;
                }
                var exec = require('child_process').exec;
                var config = require('../config/config').config;

                exec(config.php+' '+__dirname+'/../script/tidy.php', function(error, body, stderr){
                    if ( !error ) {
                        var jsdom = require('jsdom');
                        jsdom.env(body, [__dirname+'/../script/jquery-1.7.1.min.js'], function(errors, window) {
                            if( errors ){
                                throw errors;
                            } else {
                                window.__stopAllTimers();
                                //console.log('Index:1');
                                callback(null, window);
                            }
                        });
                    }
                    else {
                        //process.send( { 'key': data.key, 'error': 'tidy-error' } );
                        throw error;
                    }
                }).stdin.end( data, 'binary' );
            });
        },
        '解析内容正确':function(window){
            fs.readFile(__dirname+'/resources/sina.article.1.txt', function (err, data) {
                if(err) {
                    throw err;
                }
                //console.log(parser_result);
                var parser = require('./../lib/matcher/sina.article');
                parser.parse( window, function( error, match ){
                    if(error) {
                        throw error;
                    }
                    //console.log(match);
                    assert.equal(match.content, data.toString());
                });
            });
        },
        '解析标题正确':function(window){
            fs.readFile(__dirname+'/resources/sina.article.1.txt', function (err, data) {
                if(err) {
                    throw err;
                }
                //console.log(parser_result);
                var parser = require('./../lib/matcher/sina.article');
                parser.parse( window, function( error, match ){
                    if(error) {
                        throw error;
                    }
                    //console.log(match);
                    assert.equal(match.title, '去年汽车销量增幅创13年新低 政策退潮致销量下滑');
                });
            });
        }
     },
     "股票代码为空":{
        topic:function(){
            return {name:"tom"}
        },
        "发送请求回调":function(data){
            assert.equal(data.name, 'tom');
        }
     }
}).export(module);
