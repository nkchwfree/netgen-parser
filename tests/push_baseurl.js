var queue = require('queuer');
var config = require('../config/config').config;
var url_content = queue.getQueue(config.queue, 'url');
var argv = require('optimist').argv;

function getQueueUrl(name, id) {
    return 'mysql://'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.database+'?'+name+'#'+id;
}

function pushBaseUrl(id) {
    var url=getQueueUrl('baseurl', id);
    console.log(url);
    url_content.enqueue(url);
}

function pushAll() {
    var mysql = require('mysql');

    var client = mysql.createClient( config.mysql );

    client.query(
        "select id from baseurl",
        function(error, results, fields) {
            if (!error) {
                for(var i=0,len=results.length;i<len;i++) {
                    pushBaseUrl(results[i].id);
                    console.log(results[i]);
                }
            }
            else {
                console.log(error);
            }
        }
    );
}

//pushBaseUrl(3659); //新浪，建设银行
//pushBaseUrl(6695); //金融界，春晖股份
/*
pushBaseUrl(6732);
pushBaseUrl(7154);
pushBaseUrl(7860);
for(var i=1;i<500;i++) {
    pushBaseUrl(i);
}


//公告
pushBaseUrl(10446);

//新浪列表
pushBaseUrl(2756);


pushBaseUrl(6892);
pushBaseUrl(7402);
*/

//pushAll();
//pushBaseUrl(10601);//新浪滚动列表页

//pushBaseUrl(10602);//金融界上市公司列表页

//pushBaseUrl(10603);//新浪个股点评列表页

//pushBaseUrl(10604);//金融界个股掘金列表页

//pushBaseUrl(10605);//网易个股资讯列表页

//pushBaseUrl(10606);//网易异动点评列表页

//pushBaseUrl(10607);//网易盘面快讯列表页


//pushBaseUrl(10608);//腾讯上市公司列表页

//pushBaseUrl(10609);//腾讯个股资讯列表页

//pushBaseUrl(10610);//搜狐上市公司列表页

//pushBaseUrl(10611);//搜狐个股风云列表页

//pushBaseUrl(10612);//搜狐市场直击列表页

//pushBaseUrl(10613);//凤凰上市公司列表页

//pushBaseUrl(10614);//凤凰机构荐股列表页

//pushBaseUrl(10615);//凤凰报盘列表页

//pushBaseUrl(10616);//和讯上市公司列表页

//pushBaseUrl(10617);//东方财富网列表页
//pushBaseUrl(10618);//东方财富网列表页

//pushBaseUrl(10619);//证券时报网列表页

pushBaseUrl(argv.id);
