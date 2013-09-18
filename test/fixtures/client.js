var async   = require('async'),
    http    = require('http');

module.exports = function (rate, callback) {
    var queue = async.queue(function (task, callback) {
        http.get('http://localhost:8881/' + task, function (res) {
            var response = (res.statusCode === 200) ? null : res.statusCode;
            callback(response);
        }).on('error', function (err) {
            callback(err);
        });
    }, 2);

    for (var i = 0; i < rate; i++) {
        queue.push(i, function (err) {
            if (err) return callback(err);
        });
    }

    queue.drain = function (err) {
        if (err) return callback(err);
        callback(null);
    };
};