var http        = require('http'),
    test        = require('tap').test,
    client      = require('../fixtures/client.js'),
    throttle    = require('../../index.js');

var server = http.createServer(function (req, res) {
    throttle({
        burst:  100,
        rate:   100,
        ip:     true
    })(req, res, function (err) {
        var code = (!err) ? 200 : 429;
        res.writeHead(code, {'Content-Type': 'text/plain'});
        res.end('\n');
    });
}).listen(8881);

client(100, function (err) {
    test('client', function (t) {
        t.equal(err, null, 'error object of expected value');
        t.end();
    });
});

setTimeout(process.exit, 1200);