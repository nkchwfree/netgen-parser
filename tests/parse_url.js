var request = require('request');
var argv = require('optimist').argv;


var Workers = require('../lib/workers').Workers;
var workers = new Workers(1);
var redis = require('../lib/redis').redis;

request({ 'url' : argv.url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
    if (error) {
        console.log(error);
    } else {
        var params = {text:body, site:argv.site, type:argv.type, date:argv.date, url:argv.url};
        workers.send(params, function(error, match){
            if(error) {
                console.log(error);
            }
            else {
                console.log(match);

                //增加到测试用例库
                if(argv.add=='1') {
                    var data = {
                        url:argv.url,
                        match:match,
                        params:params
                    };

                    redis.HMSET("parser_test", argv.url, JSON.stringify(data));
                    redis.quit();

                    console.log('添加测试用例成功。');
                }
            }
        });
    }
});













