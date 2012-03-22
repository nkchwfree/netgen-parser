
var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[]};
        //console.log($('.datelist').html());
        $(".newlist li").each(function(){
            var li = $(this);
            var href = li.find('a').attr('href');
            var news_date = li.find('i').text().substr(0,10).replace(/-/g,'');

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
