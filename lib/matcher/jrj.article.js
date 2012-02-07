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

      out.title = $('.newsConTit >h1').text().trim();

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
