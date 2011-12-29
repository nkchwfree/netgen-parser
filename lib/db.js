var mysql = require('mysql');

var client = mysql.createClient( {
    user: 'root'
});
client.query('USE stock_radar');
//client.query('set charset utf8');

var Db = function() {
    var self = this;

    self.getInfoByPageId = function(page_id, cb) {
      client.query(
        'select * from page_content where id='+page_id,
        function(error, results, fields) {
          if (error) {
            throw error;
          }

          if(results.length==0) {
            cb('empty', undefined);
          }
          else {
            cb('good', results[0]);
          }
        }
      );
    }
}


Db.prototype.addUrl = function(url, in_time, stock_code, site, type, cb) {
  client.query('select * from url where url=? and stock_code = ? ', [url,stock_code], function(error, results, fields) {
      if (error) {
        cb(-2);
      }

      if(results.length>0) {
        cb(-1);
      }
      else {
        client.query('INSERT INTO url ' + 'SET url = ?, in_time = ?, stock_code = ?, site = ?, type = ?', [ url, in_time, stock_code, site, type ], function(err, results) {
          if (err) {
            console.log(err);
            cb(0);
          }
          else {
            cb(results.insertId);
          }
        });
      }
    }
  );
}

Db.prototype.addArticle = function(url, stock_code, title, content, meta, in_time, cb) {
  client.query('select * from article_content where url=? and stock_code=?', [url,stock_code], function(error, results, fields) {
      if (error) {
        cb(-2);
      }

      if(results.length>0) {
        cb(-1);
      }
      else {
        client.query('INSERT INTO article_content ' + 'SET url = ?, title = ?, in_time = ?, stock_code = ?, content = ?, meta = ?', [ url, title, in_time, stock_code, content, JSON.stringify(meta) ], function(err, results) {
          if (err) {
            console.log(err);
            cb(0);
          }
          else {
            cb(results.insertId);
          }
        });
      }
    }
  );
}

exports.db = new Db();