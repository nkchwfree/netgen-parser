var config = require('../config/config').config;

exports.log = function(message) {
  console.log('['+(new Date)+']: ' + message);
}

exports.debug = function(message) {
  if(config.debug == true) {
    if(typeof message =='object') {
        console.log(message);
    }
    else {
        console.log( '['+(new Date)+']: ' + message );
    }
  }
}