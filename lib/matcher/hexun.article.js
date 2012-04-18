var md5 = require('MD5');

var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]}, lines=[];

        $("#artibody >p a").each(function(){
            var text = $(this).text();
            if(text == "股吧" || text.match(/^\d{6}$/)) {
                $(this).remove()
            }
        });

        $("#artibody >p").each(function(){
            var html = $(this).html().replace(/\(\s*,\s*\)/gi, '');
            lines.push($('<p>'+html+'</p>').text().replace(/\r?\n +/g,''));
        });
        out.content = lines.join("\r\n");

        out.title = $('#artibodyTitle h1').text().trim();

        $("#artibody img").each(function(){
            if($(this).attr('src').match(/^http/)) {
                out.image_list.push([$(this).attr('src'), $(this).attr('alt')]);
            }
        });

        //获取分页信息
        out.total_page = 1;
        out.page = 1;

        //内容的标识
        var href_key = data.url.replace(/(-\d+)?\.html$/, "");
        out.content_key = md5(href_key);

        cb( undefined, out );
    }catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
