var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};

    $(".mainFrame .mainCont ul li a").each(function(){
      var href = $(this).attr('href');

      var reg = /\/\d+,(20\d{2}\d{2}\d{2})[\d_a-z]+\.html$/i;
      var result = reg.exec(href);
      //console.log(result)
      if( result && result[1]>=data.date ) {
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
