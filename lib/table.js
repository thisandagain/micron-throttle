/**
 * LRU table prototype.
 *
 * @package micron-throttle
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var assert  = require('assert-plus'),
    LRU     = require('lru-cache');

/**
 * Constructor
 */
function Table (options) {
    assert.object(options, 'options');
    this.table = new LRU(options.size || 10000);
}

Table.prototype.get = function (key) {
    return this.table.get(key);
};

Table.prototype.set = function (key, value) {
    return this.table.set(key, value);
};

/**
 * Export
 */
module.exports = Table;