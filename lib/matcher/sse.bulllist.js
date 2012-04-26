var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());

    var date = $("span.date").text().replace(/-/g,'');
    if(date>=data.date) {
        $("td.content a").each(function(){
            var self = $(this);
            var href = self.attr('onclick');

            var reg = /^sse_popup\('([^']+?)'\)$/;
            var result = reg.exec(href);
            //console.log(result)
            //console.log(self.text());
            if( result ) {
                out.url_list.push( {type:'bulldetail',url:'http://www.sse.com.cn'+result[1]} );
            }
            else if(self.text()=='下一页') {
                out.url_list.push( {type:'bulllist',url:'http://www.sse.com.cn'+self.attr('href')} );
            }
        });
    }

    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};


exports.parse = parse;
