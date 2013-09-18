var test    = require('tap').test,
    xor     = require('../../lib/xor.js');

var suite   = [
    xor(true, false, false),
    xor(false, false, false),
];

test('xor', function (t) {
    t.ok(suite[0], 'returns true');
    t.notOk(suite[1], 'returns false');
    t.end();
});