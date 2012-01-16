var assert = require('assert');
var fs =  require('fs');


var parse_one_page = function(filename, cb){
    fs.readFile(filename, function (err, data) {
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
                        cb(null, window);
                    }
                });
            }
            else {
                //process.send( { 'key': data.key, 'error': 'tidy-error' } );
                throw error;
            }
        }).stdin.end( data, 'binary' );
    });
}


var vows = require('vows');
vows.describe('Parser').addBatch({
    "解析新浪文章页面一":{
        topic:function(){
            parse_one_page(__dirname+'/resources/sina.article.1.htm', this.callback);
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
                    //console.log(match.content);
                    //console.log(data.toString());
                    assert.equal(match.content, data.toString());
                    assert.equal(match.title, '去年汽车销量增幅创13年新低 政策退潮致销量下滑');
                });
            });
        }
     },

    "解析新浪文章页面二":{
        topic:function(){
            parse_one_page(__dirname+'/resources/sina.article.2.htm', this.callback);
        },
        '解析内容正确':function(window){
            fs.readFile(__dirname+'/resources/sina.article.2.txt', function (err, data) {
                if(err) {
                    throw err;
                }

                //console.log(parser_result);
                var parser = require('./../lib/matcher/sina.article');
                parser.parse( window, function( error, match ){
                    if(error) {
                        console.log(error);
                        return;
                    }
                    //console.log(match);
                    //console.log(match.content);
                    //console.log(data.toString());

                    assert.equal(data.toString(), match.content);
                    //assert.equal(match.title, '去年汽车销量增幅创13年新低 政策退潮致销量下滑');
                });
            });
        },
        '解析内容正确dd':function(window){
            fs.readFile(__dirname+'/resources/sina.article.2.txt', function (err, data) {
                if(err) {
                    throw err;
                }

                //console.log(parser_result);
                var parser = require('./../lib/matcher/sina.article');
                parser.parse( window, function( error, match ){
                    if(error) {
                        console.log(error);
                        return;
                    }
                    //console.log(match);
                    //console.log(match.content);
                    //console.log(data.toString());

                    assert.equal(data.toString(), match.content);
                    assert.equal(match.title, '182万名银行职工人均年薪或超12万元l');
                });
            });
        },
     },

}).export(module);
