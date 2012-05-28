var fs =  require('fs');

console.log(__dirname);

var con = fs.readFileSync(__dirname+'/gb2312-utf8.table', 'ascii');

var map = {};

con.split("\n").forEach(function(row){
  var _map = row.split(',');
  map[parseInt(_map[0], 16)] = parseInt(_map[1], 16);
});


var iconv = exports.convert = function(buf){
  if(typeof buf === 'string')  buf = new Buffer(buf, 'binary');
  if(!Buffer.isBuffer(buf)) return '';
  var ret = [];
  for(i=0,j=buf.length;i<j;i++){
  	var charCode = buf[i];
    if(charCode<128){
    	ret.push(charCode);
    }else if(charCode & 0x80){
      charCode = ((charCode<<8)+buf[++i]) - 0x8080;
      ret.push( map[charCode] );
    }else{
    	console.log(['error'], charCode);
    }
  }
  return String.fromCharCode.apply(null, ret);
};