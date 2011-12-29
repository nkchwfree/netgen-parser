var DateUtil = require('../date').DateUtil;
var date = DateUtil.formatDate('yyyyMMdd', new Date((new Date()).getTime()-86400000*2));

var parse = function( opt, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());
    $(".datelist a").each(function(){
      var href = $(this).attr('href');

      var reg = /\/[a-z0-9]+\/(20\d+)\/\d+\.shtml$/i;
      var result = reg.exec(href);
      //console.log(result)
      if( !result || result[1]>=date ) {
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
};


exports.parse = parse;
