var DateUtil = require('./lib/date').DateUtil;
var reg = /\/stock\/[a-z0-9]+\/(20\d+)\/\d+\.shtml$/i;
var url ="http://finance.sina.com.cn/stock/s/20111002/071010922236.shtml";
result = reg.exec(url);
if(result != null) {
  console.log(result)
  //var date = new Date(parseInt(result[1].substr(0,4)), parseInt(result[1].substr(4,2)), parseInt(result[1].substr(6,2)),0,0,0,0);
  //var date = new Date(2011,11,5);
  var date = new Date();
  console.log( [date.getFullYear(),date.getMonth(),date.getDay() ]);

  console.log([result[1].substr(0,4), result[1].substr(4,2), result[1].substr(6,2)-3]);
  console.log(DateUtil.formatDate('yyyyMMdd', new Date((new Date()).getTime()-86400000*2)));
  //console.log((new Date()).getTime())
}


console.log(DateUtil.formatDate('yyyyMMdd', new Date()))