var md5 = require('MD5');

var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]}, lines=[];
        //console.log($('body').html());
        out.content = $("span.content_gg").text().replace('仅供参考，请查阅当日公告全文。', '').trim().replace(/\r?\n +/g,"\r\n");

        var title_match = $('span.content').text().match(/^\((\d{6})[^\)]*\)(.+?)$/);

        out.title = title_match[2];
        out.stock_code = 'sh'+title_match[1];


        cb( undefined, out );
    }catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
