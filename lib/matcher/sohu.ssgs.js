var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());
    $(".main .f14list a").each(function(){
      var href = $(this).attr('href');

      var reg = /\/(20\d+)\/[\d_a-z]+\.s?html$/i;
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
};


exports.parse = parse;
