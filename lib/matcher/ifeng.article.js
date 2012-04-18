var md5 = require('MD5');

var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]}, lines=[];

        $("#artical #artical_real >p.pictext").remove();

        var img = $("#artical #artical_real >p img:first");
        if(img && img.attr('src').match(/^http/)) {
            out.image_list.push([img.attr('src'), img.attr('alt')]);
            img.parent().remove();
        }


        $("#artical #artical_real >p").each(function(){
            lines.push($(this).text().replace(/\r?\n +/g,''));
        });
        out.content = lines.join("\r\n");

        out.title = $('#artical #artical_topic').text();

        //获取分页信息
        out.total_page = 1;
        out.page = 1;

        //内容的标识
        var href_key = data.url.replace(/(-\d+)?\.shtm$/, "");
        out.content_key = md5(href_key);

        cb( undefined, out );
    }catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
