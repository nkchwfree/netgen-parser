var exec = require('child_process').exec;
var request = require('request');
var config = require('../config/config').config;
var argv = require('optimist').argv;

var site,type,url,data={};

site = argv.site;//'sohu';
type = argv.type;//'ggfy';
if(site=='sina') {
    if(type=='article') {
        data={}
        url = "http://finance.sina.com.cn/g/20120109/155711159525.shtml";
        url = "http://finance.sina.com.cn/money/fund/20111230/175411104784.shtml";
        url="http://finance.sina.com.cn/g/20111229/012511087361.shtml";
        url="http://finance.sina.com.cn/g/20111230/133511103081.shtml";
        url="http://finance.sina.com.cn/stock/s/20120112/033911182091.shtml";
        url="http://finance.sina.com.cn/stock/jsy/20120117/145011223125.shtml";
        url="http://finance.sina.com.cn/stock/s/20120327/095911687759.shtml";//图片
        url="http://finance.sina.com.cn/stock/s/20120417/082411842915.shtml";//滚动页面url
        data.url = url;
    }
    else if('list'==type) {
        data={date:'20120222'};
        url="http://money.finance.sina.com.cn/corp/go.php/vCB_AllBulletin/stockid/300026.phtml";
    }
    else if('bulletin' == type) {
        data={date:'20120222'}
        url="http://money.finance.sina.com.cn/corp/go.php/vCB_AllBulletin/stockid/300026.phtml";
    }
    else if('roll' == type) {
        data={date:'20120417'}
        url="http://roll.finance.sina.com.cn/finance/zq1/ssgs/index.shtml";
    }
    else if('ggdp' == type) {
        data={date:'20120417'}
        url="http://finance.sina.com.cn/column/ggdp.shtml";
    }
}
else if ('jrj' == site) {
    if('list' == type) {
        url="http://stock.jrj.com.cn/share,600157,ggxw.shtml";
        data={date:20120116}
    }
    else if('article' == type ) {
        //金融界文章页
        url="http://stock.jrj.com.cn/invest/2012/01/10142012016945.shtml";
        url="http://stock.jrj.com.cn/hotstock/2012/01/16131512062703.shtml";
        url="http://stock.jrj.com.cn/hotstock/2012/02/03170012167215.shtml";
        url="http://stock.jrj.com.cn/hotstock/2012/01/18174312087847.shtml";
        url="http://stock.jrj.com.cn/hotstock/2012/02/07132812187048.shtml";
        url="http://stock.jrj.com.cn/invest/2012/03/09133212448307.shtml"

        url="http://stock.jrj.com.cn/hotstock/2012/03/21002212536909.shtml";//分页第一页
        url="http://stock.jrj.com.cn/hotstock/2012/03/21144412544353-6.shtml";
        url="http://stock.jrj.com.cn/invest/2012/03/22150012554537.shtml"
        url="http://stock.jrj.com.cn/invest/2012/03/22150012554537-1.shtml";
        url="http://stock.jrj.com.cn/2012/03/27134512589073.shtml";//金融界，图片
        url="http://stock.jrj.com.cn/hotstock/2012/03/29152512616231.shtml";
        data.url = url;
    }
    else if('ssgs' == type ) {
        data={date:20120116}
        url = "http://stock.jrj.com/list/stockssgs.shtml";
    }
    else if('ggjj' == type ) {
        data={date:20120417}
        url = "http://stock.jrj.com.cn/hotstock/ggjj-2.shtml";
    }
}
else if ( '163' == site) {
    if( 'ggzx' == type ) {
        data={date:20120417}
        url = "http://money.163.com/special/00251LR5/gptj_02.html";
    }
    else if( 'article' == type ) {
        url='http://money.163.com/12/0417/08/7V9EITKF00253B0H.html';
        data.url = url;
    }
    else if( 'yddp' == type ) {
        data={date:20120417}
        url = "http://money.163.com/special/00254IU5/ydgdianping.html";
    }
    else if( 'pmkx' == type ) {
        data={date:20120417}
        url = "http://money.163.com/special/00251LHQ/pmkx_03.html";
    }
}
else if ( 'qq' == site) {
    if( 'ssgs' == type ) {
        data={date:20120418}
        url = "http://finance.qq.com/l/stock/ggjj/index.htm";
    }
    else if( 'article' == type ) {
        url='http://finance.qq.com/a/20120417/008448.htm';
        data.url = url;
    }
}
else if ( 'sohu' == site) {
    if( 'ssgs' == type ) {
        data={date:20120418}
        url = "http://stock.sohu.com/gsdt/index.shtml";
        url="http://stock.sohu.com/panmianzhiji/";

    }
    else if( 'article' == type ) {
        url='http://stock.sohu.com/20120418/n340853097.shtml';
        url="http://stock.sohu.com/20120418/n340853088.shtml";
        //url="http://stock.sohu.com/20120418/n340894364.shtml";
        data.url = url;
    }
    else if( 'ggfy' == type ) {
        data={date:20120418}
        url="http://stock.sohu.com/gegufengyun/";
    }
    else if( 'sczj' == type ) {
        data={date:20120418}
        url="http://stock.sohu.com/panmianzhiji/";
    }
}

if(argv.url) {
    url = argv.url;
    data.url = argv.url
}

if(argv.date) {
    data.date =argv.date;
}



request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
    if (error) {
        console.log(error);
    } else {
        var strategy = config.tidy_strategy[site+'.'+type] || 'default';

        if(strategy === 'original.gbk') {
            var iconv = require('../lib/iconv/iconv');
            body = iconv.convert(body);

            var parser = require('../lib/matcher/'+site+'.'+type);
            parser.parse( body, data, function( error, match ){
                console.log(match);
                //console.log(match.url_list.length);
                //console.log(match.content);
            });
        }
        else {
            exec(config.php+' '+__dirname+'/../script/tidy.php '+strategy, {maxBuffer:1024*1024},function(error, body, stderr){
                if ( !error ) {
                    console.log(body);
                    var jsdom = require('jsdom');
                    jsdom.env(body, [__dirname+'/../script/jquery-1.7.1.min.js'], function(errors, window) {
                        if( errors ){
                            console.log('jsdom-error:'+errors);
                        } else {
                            window.__stopAllTimers();
                            var parser = require('../lib/matcher/'+site+'.'+type);
                            parser.parse( window, data, function( error, match ){
                                console.log(match);
                                //console.log(match.url_list.length);
                                //console.log(match.content);
                            });
                        }
                    });
                }
                else {
                  console.log('tidy-error:'+error);
                }
            }).stdin.end( body, 'binary' );
        }
    }
});













