var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]}, lines=[];

        var refresh = $('meta[http-equiv=Refresh]').attr('content');
        //console.log($('meta[http-equiv]'));
        if(refresh) {
            if( (result=/\d+;url=(.+?)$/i.exec(refresh))!=null ) {
                out.url_list.push( {type:'article',url:result[1]} );
            }
        }
        else {
            $("#IDNewsDtail >p[class!='page']").each(function(){
                var p = $(this);
                var html = p.html();
                var text = p.text().trim();

                //console.log(p.text().trim());
                //console.log(p.find('a').text());
                //段落内容都是链接文本，丢弃
                if(text==p.find('a').text().trim()) {
                    return;
                }

                if(text.match(/^【.+?】(：)?$/)!=null) {
                    return ;
                }

                lines.push($('<p>'+html+'</p>').text().replace(/\r?\n +/g,''));
            });
            out.content = lines.join("\r\n");

            //如果内容解析不出来，则再用第二个规则来解析内容
            if($.trim(out.content).length==0) {
                $("#IDNewsDtail table").remove();
                $("#IDNewsDtail p[class='page']").remove();
                out.content = $("#IDNewsDtail").text().replace(/\r?\n +/g,"\n").replace(/\n+/g,"\n").replace(/\n$/g,"").replace(/^\n/g,"");
            }

            out.title = $('.newsConTit >h1').text().trim();

            $("#artibody .img_wrapper img").each(function(){
                out.image_list.push([$(this).attr('src'), $(this).attr('alt')]);
            });
        }

        //如果文章内容都是空白字符，则内容为空。
        if(out.content.match(/^([\r\n\t ]|　)+$/)) {
            out.content = "";
        }

        cb( undefined, out );
    }
    catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
