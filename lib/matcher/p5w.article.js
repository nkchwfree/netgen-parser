var md5 = require('MD5');
var BodyFormater = require('../body_formater').BodyFormater;

var parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {url_list:[], content:null, image_list:[]};

        $("td.14more table").remove();
        var formater = new BodyFormater($('td.14more').text());
        out.content = formater.format().toString();

        out.title = $('div.toutiao').text();

        cb( null, out );
    }catch(e){
        cb( e.toString() );
    }
};

exports.parse = parse;
