var parse = function( opt, cb ){
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
      $("#artibody >p").each(function(){
        var html = $(this).html().replace(/<a\s+onmouseover="WeiboCard\.show[^>]+>\(微博\)<\/a>/g, '');
        //console.log(html.indexOf('style="font-family: KaiTi_GB2312;"'));
        if(html.indexOf('style="font-family: KaiTi_GB2312;"')<0) {
          lines.push($('<p>'+html+'</p>').text().replace(/\r?\n +/g,''));
        }
      });
      lines.pop();
      out.content = lines.join("\r\n");

      out.title = $('#artibodyTitle').text();

      $("#artibody .img_wrapper img").each(function(){
        out.image_list.push([$(this).attr('src'), $(this).attr('alt')]);
      });
    }

    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};

exports.parse = parse;
