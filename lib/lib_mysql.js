var config = require('../config/config').config.mysql;
var mysql = require('mysql-libmysqlclient');

exports.newClient = function(callback) {
    var conn = mysql.createConnectionSync();
    conn.connectSync(config.host, config.user, config.password, config.database);

    if (!conn.connectedSync()) {
      console.log("Connection error " + conn.connectErrno + ": " + conn.connectError);
      process.exit(1);
    }
    conn.query("set charset "+config.charset);

    callback({
        fetchAll:function(sql, cb) {
            conn.query(sql, function (err, res) {
                if(err) {
                    cb(err);
                    return;
                }

                res.fetchAll(function (err, rows) {
                    cb(err, rows);
                });
            });
        },

        isConnected:function() {
            return conn.connectedSync();
        }
    });
}