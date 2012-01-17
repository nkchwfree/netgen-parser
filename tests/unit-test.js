var assert = require('assert');
var fs =  require('fs');
var vows = require('vows');

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
};

var parser = vows.describe('Parser');

var parsePage = [
	['解析新浪文章页面一','sina.article.1','sina.article'，'去年汽车销量增幅创13年新低 政策退潮致销量下滑'],
	['解析新浪文章页面二','sina.article.2','sina.article'，'182万名银行职工人均年薪或超12万元'],
	['解析金融界文章页面一','jrj.article.1','jrj.article'，'永泰能源：受益于产量大幅增长业绩超预期 买入']
];

var parseList = [
	['解析新浪列表页面一','sina.list.1','sina.list','20120114','13','http://finance.sina.com.cn/stock/s/20120116/165911214269.shtml','12','http://finance.sina.com.cn/stock/hkstock/ggscyd/20120114/012311201102.shtml'],
	['解析新浪列表页面二','sina.list.1','sina.list','20120115','9','http://finance.sina.com.cn/stock/s/20120116/165911214269.shtml','8','http://finance.sina.com.cn/stock/s/20120115/232211206581.shtml'],
	['解析金融界列表页面一','jrj.list.1','jrj.list','20120114','20','http://stock.jrj.com.cn/invest/2012/01/16154012064463.shtml','19','http://stock.jrj.com.cn/hotstock/2012/01/14010312052930.shtml'],
	['解析金融界列表页面二','jrj.list.1','jrj.list','20120116','15','','14','http://stock.jrj.com.cn/hotstock/2012/01/16014512057440.shtml']
];

for(var i=0;i<parsePage.length;i++){
	(function(ix){
		parser.addBatch({
	    parsePage[ix][0]:{
	        topic:function(){
	            parse_one_page(__dirname+'/resources/'+parsePage[ix][1]+'.htm', this.callback);
	        },
	        '解析内容':function(window){
	            fs.readFile(__dirname+'/resources/'+parsePage[ix][1]+'.txt', function (err, data) {
	                if(err) {
	                    throw err;
	                }
	                //console.log(parser_result);
	                var parser = require('./../lib/matcher/'+parsePage[ix][2]);
	                parser.parse( window, {}, function( error, match ){
	                    if(error) {
	                        throw error;
	                    }
	
	                    assert.equal(match.content, data.toString());
	                    assert.equal(match.title, parsePage[ix][3]);
	                });
	            });
	        }
	     }
	   })
	 })(i);
};

for(var i=0;i<parsePage.length;i++){
	(function(ix){
		parser.addBatch({
	    parsePage[ix][0]:{
        topic:function(){
            parse_one_page(__dirname+'/resources/'+parsePage[ix][1]+'.htm', this.callback);
        },
        '解析内容正确':function(window){
            var parser = require('./../lib/matcher/'+parsePage[ix][2]);
            parser.parse( window, {date:parsePage[ix][3]}, function( error, match ){
                if(error) {
                    console.log(error);
                    return;
                }
                //console.log(match);

                assert.equal(match.url_list.length, parseInt(parsePage[ix][4]));
                if(parsePage[ix][5]!='') assert.equal(match.url_list[0].url, parsePage[ix][5]);
                if(parsePage[ix][7]!='') assert.equal(match.url_list[parseInt(parsePage[ix][6])].url, parsePage[ix][7]);
            });
        }
     }
	  })
	})(i);
}

parser.export(module);

