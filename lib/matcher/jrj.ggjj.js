
var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]};
        //console.log($('.datelist').html());
        $(".jrj-wrap ul.jrj-f14 li").each(function(){
            var li = $(this);
            var href = li.find('a').attr('href');

            //获取日期字符串
            var li_text = li.text().trim();

            var news_date = li_text.substr(0,10).replace(/[-\/]/g,'');
console.log(news_date);
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
};


exports.parse = parse;
