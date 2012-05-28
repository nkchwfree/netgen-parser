var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log(data);
    //console.log(data.date.toString().substring(2,8))

    //深交所公告
    out.url_list.push({site:'szse', type:'bulllist', url:'http://www.szse.cn/szseWeb/common/szse/files/text/gs/gs'+data.date.toString().substr(2,6)+'.txt?randnum=0.23981350637041032'});

    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};


exports.parse = parse;
