var test    = require('tap').test,
    Table   = require('../../lib/table.js');

test('table', function (t) {
    var table = new Table({size:100});

    var set = table.set('127.0.0.1', {hello: 'world'});
    var get = table.get('127.0.0.1');

    t.equal(set, true, 'returns expected value');
    t.deepEqual(get, {hello: 'world'}, 'returns expected value');
    t.end();
});