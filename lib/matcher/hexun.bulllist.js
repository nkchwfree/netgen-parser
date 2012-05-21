
var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {bulletins:[],url_list:[]};
    //console.log($('body').html());

    var match = $("body").html().match(/<strong>公告日期：(\d+)年(\d+)月(\d+)日<\/strong>/);

    if(match && match[1].concat(match[2], match[3])>=data.date) {
        var list = $("div.add12,div.add13").each(function(){
            var self = $(this);

            var stock_code = self.find('span:first').text();
            self.find('a,span').remove();
            //console.log(self.html());
            var match = self.html().match(/^\(\s*\)([^<>]+?)<br>(.+?)$/m);
            //console.log(match);
            out.bulletins.push({
                stock_code:stock_code,
                title:match[1],
                content:match[2]
            });
        });

        //分析是否有下一页
        var next_page = $("img[src='/2008/img/xyy.gif']").parent().attr('href');
        if(next_page) {
            out.url_list.push({
                url : "http://stockdata.stock.hexun.com"+next_page + '&'+data.date,
                type : 'bulllist'
            });
        }
    }

    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};


exports.parse = parse;
