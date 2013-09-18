var http        = require('http'),
    test        = require('tap').test,
    client      = require('../fixtures/client.js'),
    throttle    = require('../../index.js');

var server = http.createServer(function (req, res) {
    req.username = 'testuser';

    throttle({
        burst:      50,
        rate:       50,
        username:   true
    })(req, res, function (err) {
        var code = (!err) ? 200 : 429;
        res.writeHead(code, {'Content-Type': 'text/plain'});
        res.end('\n');
    });
}).listen(8881);

client(100, function (err) {
    test('client', function (t) {
        t.equal(err, 429, 'error object of expected value');
        t.end();
    });
});

setTimeout(process.exit, 1200);