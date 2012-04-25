var parse = function( opt, data, cb ){
  try{
    var $ = opt.window.$;
    var out = {url_list:[], content:undefined, image_list:[]};
    //console.log($('.datelist').html());
    var pattern = /(http:\/\/www\.p5w\.net\/stock\/news\/[a-z]+\/(?:\d+)\/[a-z0-9]+\.htm)(\d+)－(\d+) \d+:\d+&lt;/gmi;
    var match,text=$('body').html(),year=data.date.toString().substr(0,4);
    console.log(data.date);
    while( (match = pattern.exec(text))!=null ) {
        console.log(year.concat(match[2], match[3]));

        if(year.concat(match[2], match[3])>=data.date) {
            out.url_list.push({type:'article',url:match[1]});
        }
    }


    cb( undefined, out );
  }catch(e){
    cb( e.toString() );
  }
};


exports.parse = parse;
