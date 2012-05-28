var _ = require('underscore');
function SZBulletinParser() {
    var _self = this;
    var _title;
    var _stock_code;
    var _content = [];
    var _result = [];

    function _matchTitle(p) {
        var pattern1 = /^(一|二|三|四|五|六|七|八|九|十|百|零)+、\((\d+)(?:、\d+)?\)(.+：.+?)$/;
        var pattern2 = /^(一|二|三|四|五|六|七|八|九|十|百|零)+、\s*（(\d+)(?:、\d+)?）(.+?) +召开股东大会$/;
        var pattern3 = /^(一|二|三|四|五|六|七|八|九|十|百|零)+、深圳证券交易所\d+年\d+月\d+日停复牌公告$/;

        var match;
        if(match=p.match(pattern1)) {
            return {
                title : match[3],
                stock_code : match[2]
            }
        }
        else if(match=p.match(pattern2)) {
            return {
                title : match[3]+'：召开股东大会',
                stock_code : match[2]
            }
        }
        else if(match = p.match(pattern3)) {
            return {
                title : '',
                stock_code : ''
            }
        }
        return null;
    }

    _self.push = function(p) {
        var pattern = /^（(\d+)）(.+?)\s+(\d{4}年\d+月\d+日.+?)\s+([^\s]+)$/;

        var info,match;
        if(info=_matchTitle(p) ) {
            //console.log(info);
            if(_title && _title!="") {
                _result.push({
                    stock_code:_stock_code,
                    title:_title,
                    content: _content.join("\r\n")
                });
            }

            _title = info.title;
            _stock_code = info.stock_code;
            _content = [];
        }
        else if(match=p.match(pattern)) {
            _result.push({
                stock_code:match[1],
                title:match[2]+'：停牌公告',
                content: match[3].replace(/\s+/g, '，')
            });
        }
        else if(_title && _title!="") {
            _content.push(p);
        }
        //console.log('+'+p+'+');
    }

    _self.getResult = function() {
        if(_title!="" && !_title) {
            _result.push({
                stock_code:_stock_code,
                title:_title,
                content: _content.join("\r\n").trim()
            });
            _title = "";
        }
        return _result;
    }
}


var parse = function( content, data, cb ){
  try{
    //console.log(content.replace(/\r/g,'').split(/\n/));
    //预处理
    var arr = content.replace(/\r/g,'').split('深圳上市公司信息公告摘要');

    var list = arr[1].replace(/\r/g,'').split(/\n/);
    var parser = new SZBulletinParser();
    _.each(list, function(item){
        parser.push(item);
    })

    //console.log(parser.getResult());
    //return;

    cb( undefined, {bulletins:parser.getResult()} );
  }catch(e){
    cb( e );
  }
};


exports.parse = parse;
