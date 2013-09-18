var test    = require('tap').test,
    Bucket  = require('../../lib/bucket.js');

test('table', function (t) {
    var bucket = new Bucket({
        capacity: 10,
        fillRate: 10
    });

    t.ok(bucket.consume(2), 'is true');
    t.ok(bucket.consume(8), 'is true');
    t.notOk(bucket.consume(1), 'is false');

    setTimeout(function () {
        t.ok(bucket.consume(1), 'is true');
        t.ok(bucket.consume(1), 'is true');
        t.ok(bucket.consume(1), 'is true');
        t.ok(bucket.consume(1), 'is true');
        t.notOk(bucket.consume(10), 'is false');        
        t.end();
    }, 1000);
});