var fs = require('fs');
var exec = require('child_process').exec;

var fff = "";
fs.readFile(__dirname+'/2.txt', function (err, data) {
  if (err) throw err;

  exec('/usr/local/php/bin/php '+__dirname+'/script/tidy.php', function(error, body, stderr){
    console.log(body);
  }).stdin.end( data,'binary');
});