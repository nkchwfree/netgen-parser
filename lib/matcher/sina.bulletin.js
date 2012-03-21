var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:undefined, image_list:[], bulletin_list:[]};
        var date_list = $('.datelist').text().match(/20\d{2}-(?:0[1-9]|1[0-2])-[0-3]\d/g);
        var link_list = $(".datelist a");
        //console.log(date_list);

        for(var i=0; i<date_list.length; i++) {
            if(date_list[i].replace(/-/g,'')>=data.date) {
                var href = $(link_list[i]).attr('href');

                out.bulletin_list.push( {url:'http://money.finance.sina.com.cn'+href, text:$(link_list[i]).text()} );
            }
        }

        cb( undefined, out );
    }catch(e){
        cb( e.toString() );
    }
};


exports.parse = parse;
