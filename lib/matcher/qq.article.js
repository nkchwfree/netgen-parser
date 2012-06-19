var md5 = require('MD5');
var _ = require('underscore');

var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:null, image_list:[]}, lines=[];
        $('script').remove();

        $("#Cnt-Main-Article-QQ p").each(function(){
            lines.push( $(this).text().replace(/\r?\n +/g,'') );
        });
        out.content = lines.join("\r\n");

        out.title = $('#C-Main-Article-QQ .hd h1').text();
/*
        $("#artibody .img_wrapper img").each(function(){
            if($(this).attr('src').match(/^http/)) {
                out.image_list.push([$(this).attr('src'), $(this).attr('alt')]);
            }
        });

        $("#artibody .ct_hqimg img").each(function(){
            if($(this).attr('src').match(/^http/)) {
                out.image_list.push([$(this).attr('src'), $(this).attr('alt')]);
            }
        });
*/
        //获取分页信息
        var pages = $("#ArtPLink li a");
        //console.log(data.url);
        if(pages.length>0) {
            //解析页码
            var result;
            if(result = data.url.match(/_(\d+)?\.htm$/)) {
                out.page = parseInt(result[1])+1;
            }
            else {
                out.page = 1;
            }


            var hash = {};
            var href_head = data.url.replace(/^(http:\/\/[^\/]+).+?$/, "$1");
            //console.log(href_head);
            $(pages).each(function(i,item){
                var href = $(item).attr('href');
                if(href!="") {
                    hash[href_head+href] = 1;
                }
                //console.log(href);
            });

            out.url_list = _.map(hash, function(item, key){
                return {type:'article', url:key};
            });
            out.total_page = out.url_list.length+1;

            //内容的标识
            var href_key = data.url.replace(/(_\d+)?\.htm$/, "");
            out.content_key = md5(href_key);
        }

        cb( null, out );
    }catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
