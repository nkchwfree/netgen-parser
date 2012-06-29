var _ = require('underscore');

exports.parse = function( opt, data, cb ){
    //delete data.content;
    //console.log(data);
    try{
        //url������
        var filter = data.config.url_filter || function(){
            return true;
        }

        var $ = opt.window.$;
        var list = [];
        setTimeout(function(){
            $("script,style,iframe,NOSCRIPT,input,textarea,select,label").remove();

            $(data.config.path).each(function(){
                var dom = $(this);
                //console.log(dom.attr('href'));

                var href = dom.attr('href');
                if(href && filter(href, data.date)==true) {
                    list.push(href);
                }
            });
            //console.log($('#d_list').html());


            cb( null, {list:_.uniq(list)} );
        },2000);
    }catch(e){
        console.log(e);
        cb( e.toString() );
    }
};
