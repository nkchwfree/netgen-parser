var db = require('../lib/db').db;
var queue = require('../lib/queue');
var argv = require('optimist').argv;

var config = require('../config/config').config;

function getTime() {
    return Math.floor(new Date().getTime()/1000);
}

function getLog(page_content_id, url) {
    return {log:function(msg){
       console.log('DL['+page_content_id+']['+url+'] ' + msg);
    }};
}

function pushUrl(url, stock_code, site, type) {
    db.addUrl(url, getTime(), stock_code, site, type, getLog('test',url), function(error, url_id){
        if(!error) {
            queue.url.enqueue(queue.getQueueUrl('url', url_id));
            console.log(queue.getQueueUrl('url', url_id));
        }
        else {
            console.log(error);
        }

        //process.exit(0);
    });
}


pushUrl(argv.url, '000000', argv.site, argv.type);
console.log("push:" + argv.url+"\n");



