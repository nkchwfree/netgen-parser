
exports.parse_list_163 = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]};
        //console.log($('.datelist').html());
        $(".area ul.newsList li").each(function(){
            var li = $(this);
            var href = li.find('a').attr('href');

            //获取日期字符串
            var li_text = li.find('.atime').text().trim();

            var news_date = li_text.substr(1,10).replace(/[-\/]/g,'');

            var reg = /\/[a-z0-9]+\/(20\d+)\/\d+\.shtml$/i;
            if( news_date>=data.date ) {
                var href_key = href.replace(/(-\d+)?\.shtml$/, "");
                out.url_list.push( {type:'article', url:href} );
            }
        });
        cb( undefined, out );
    }catch(e){
        cb( e.toString() );
    }
}

exports.parse_list_qq = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());
    $(".newslist li a").each(function(){
      var href = $(this).attr('href');

      var reg = /a\/(20\d+)\/[\d_a-z]+\.htm$/i;
      var result = reg.exec(href);
      //console.log(result)
      if( !result || result[1]>=data.date ) {
        out.url_list.push( {type:'article',url:href} );
      }
      else {
        //console.log('Skip: '+href);
      }
    });
    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
}

