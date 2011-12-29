var parse = function( opt, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());
    $(".datelist a").each(function(){
    out.url_list.push( {type:'article',url:$(this).attr('href')} );
    });
    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};

exports.parse = parse;
