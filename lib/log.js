var config = require('../config/config').config;

exports.log = function(message) {
  console.log('['+(new Date)+']: ' + message);
}

exports.debug = function(message) {
  if(config.debug == true) {
    console.log( '['+(new Date)+']: ' + message );
  }
}