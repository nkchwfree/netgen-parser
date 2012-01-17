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
                parser.parse( window, {}, function( error, match ){
                    if(error) {
                        throw error;
                    }

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
                parser.parse( window, {}, function( error, match ){
                    if(error) {
                        console.log(error);
                        return;
                    }

                    assert.equal(data.toString(), match.content);
                    assert.equal(match.title, '182万名银行职工人均年薪或超12万元');
                });
            });
        }
     },

     "解析新浪列表页面一":{
        topic:function(){
            parse_one_page(__dirname+'/resources/sina.list.1.htm', this.callback);
        },
        '解析内容正确':function(window){
            var parser = require('./../lib/matcher/sina.list');
            parser.parse( window, {date:'20120114'}, function( error, match ){
                if(error) {
                    console.log(error);
                    return;
                }
                //console.log(match);

                assert.equal(match.url_list.length, 13);
                assert.equal(match.url_list[0].url, 'http://finance.sina.com.cn/stock/s/20120116/165911214269.shtml');
                assert.equal(match.url_list[12].url, 'http://finance.sina.com.cn/stock/hkstock/ggscyd/20120114/012311201102.shtml');
            });
        }
     },

     "解析新浪列表页面二":{
        topic:function(){
            parse_one_page(__dirname+'/resources/sina.list.1.htm', this.callback);
        },
        '解析内容正确':function(window){
            var parser = require('./../lib/matcher/sina.list');
            parser.parse( window, {date:'20120115'}, function( error, match ){
                if(error) {
                    console.log(error);
                    return;
                }
                //console.log(match);

                assert.equal(match.url_list.length, 9);
                assert.equal(match.url_list[0].url, 'http://finance.sina.com.cn/stock/s/20120116/165911214269.shtml');
                assert.equal(match.url_list[8].url, 'http://finance.sina.com.cn/stock/s/20120115/232211206581.shtml');
            });
        }
     },

     "解析金融界文章页面一":{
        topic:function(){
            parse_one_page(__dirname+'/resources/jrj.article.1.htm', this.callback);
        },
        '解析内容正确':function(window){
            fs.readFile(__dirname+'/resources/jrj.article.1.txt', function (err, data) {
                if(err) {
                    throw err;
                }
                //console.log(parser_result);
                var parser = require('./../lib/matcher/jrj.article');
                parser.parse( window, {}, function( error, match ){
                    if(error) {
                        throw error;
                    }

                    assert.equal(match.content, data.toString());
                    assert.equal(match.title, '永泰能源：受益于产量大幅增长业绩超预期 买入');
                });
            });
        }
     },

     "解析金融界列表页面一":{
        topic:function(){
            parse_one_page(__dirname+'/resources/jrj.list.1.htm', this.callback);
        },
        '解析内容正确':function(window){
            var parser = require('./../lib/matcher/jrj.list');
            parser.parse( window, {date:'20120114'}, function( error, match ){
                if(error) {
                    console.log(error);
                    return;
                }
                //console.log(match);

                assert.equal(match.url_list.length, 20);
                assert.equal(match.url_list[0].url, 'http://stock.jrj.com.cn/invest/2012/01/16154012064463.shtml');
                assert.equal(match.url_list[19].url, 'http://stock.jrj.com.cn/hotstock/2012/01/14010312052930.shtml');
            });
        }
     },

     "解析金融界列表页面二":{
        topic:function(){
            parse_one_page(__dirname+'/resources/jrj.list.1.htm', this.callback);
        },
        '解析内容正确':function(window){
            var parser = require('./../lib/matcher/jrj.list');
            parser.parse( window, {date:'20120116'}, function( error, match ){
                if(error) {
                    console.log(error);
                    return;
                }
                //console.log(match);

                assert.equal(match.url_list.length, 15);
                assert.equal(match.url_list[14].url, 'http://stock.jrj.com.cn/hotstock/2012/01/16014512057440.shtml');
            });
        }
     }
}).export(module);
