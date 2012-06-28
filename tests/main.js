var assert = require('assert');
var vows = require('vows');
var config = require('../config/config').config;
var redis = require('../lib/redis').redis;

var Workers = require('../lib/workers').Workers;
var workers = new Workers(3);
var fs = require('fs');

var parser = vows.describe('Parser');

redis.hvals("parser_test", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        //console.log("    " + i + ": " + reply);
        var row = JSON.parse(reply);
        //console.log(i);

        var obj = {};
        obj[row.url] = {
	        topic:function(){
	            //fs.writeFileSync(__dirname+'/'+i+'.txt', row.params.text, 'UTF-8');
	            //var md5 = require('MD5');
	            //console.log(md5(row.params.text)+':'+row.params.text.length);

	            row.params.text = new Buffer(row.params.text, 'binary');
	            //console.log(row.params.text.toString());
	            workers.send(row.params, this.callback);
	        },
	        'content':function(error, match){
	            //console.log(match);
	            //console.log(row.match);
	            assert.equal(JSON.stringify(match), JSON.stringify(row.match));
	        }
	    };
        parser.addBatch(obj);
    });
    parser.export(module);
    redis.quit();
});
