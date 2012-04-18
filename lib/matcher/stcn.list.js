var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};

    $("#mainlist li a").each(function(){
      var href = $(this).attr('href');

      var reg = /\/(20\d{2}-\d{2}\/\d{2})\/content_\d+\.htm$/i;
      var result = reg.exec(href);
      //console.log(result)
      if( result && result[1].replace(/[-\/]/gi,'')>=data.date ) {
        out.url_list.push( {type:'article',url:'http://kuaixun.stcn.com/'+href} );
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
