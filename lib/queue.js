var config = require('../config/config').config;
var queue = require('queuer');

exports.page_content = queue.getQueue(config.queue, 'page_content');
exports.url = queue.getQueue(config.queue, 'url');
exports.article_content = queue.getQueue(config.queue, 'article_content');
exports.article_stock = queue.getQueue(config.queue, 'article_stock');

exports.getQueueUrl = function getQueueUrl(name, id) {
    return 'mysql://'+config.mysql.host+':'+config.mysql.port+'/'+config.mysql.database+'?'+name+'#'+id;
}