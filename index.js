/**
 * Token bucket based HTTP request throttle for Node.js.
 *
 * @package micron-throttle
 * @author Mark Cavage <mcavage@gmail.com>
 *         Andrew Sliwinski <andrewsliwinski@acm.org>
 */

/**
 * Dependencies
 */
var _               = require('lodash'),
    assert          = require('assert-plus'),
    sprintf         = require('util').format;

var TokenBucket     = require('./lib/bucket.js'),
    TokenTable      = require('./lib/table.js');

var MESSAGE         = 'You have exceeded your request rate of %s r/s.';

function Throttle () {
    var self = this;

    self.burst      = 25;
    self.rate       = 10;
    self.ip         = false;
    self.xff        = false;
    self.headerName = null;
    self.username   = false;
    self.overrides  = null;
    self.table      = new TokenTable({
        size: 10000
    });

    var rateLimit   = function (req, res, next) {
        var attr;
        if (self.xff && !self.headerName) {
            self.headerName = 'x-forwarded-for';
        }
        
        if (self.ip) {
            attr = req.connection.remoteAddress;
        } else if (self.headerName) {
            attr = req.headers[self.headerName];
        } else if (self.username) {
            attr = req.username;
        } else {
            return next();
        }

        // Before bothering with overrides, see if this request
        // even matches
        if (!attr) return next();

        // Check the overrides
        var burst = self.burst;
        var rate = self.rate;
        if (self.overrides &&
            self.overrides[attr] &&
            self.overrides[attr].burst !== undefined &&
            self.overrides[attr].rate !== undefined) {
                burst = self.overrides[attr].burst;
                rate = self.overrides[attr].rate;
        }

        // Check if bucket exists, else create new
        var bucket = self.table.get(attr);

        if (!bucket) {
            bucket = new TokenBucket({
                capacity: burst,
                fillRate: rate
            });
            self.table.set(attr, bucket);
        }

        // Throttle request
        if (!bucket.consume(1)) {
            // Until https://github.com/joyent/node/pull/2371 is in
            var msg = sprintf(MESSAGE, rate);
            res.writeHead(429, 'application/json');
            res.end('{"error":"' + msg + '"}');
            return;
        }

        return next();
    };

    /**
     * Creates an API rate limiter that can be plugged into the standard
     * request handling pipeline.
     *
     * This throttle gives you three options on which to throttle:
     * username, IP address and 'X-Forwarded-For'. IP/XFF is a /32 match,
     * so keep that in mind if using it.  Username takes the user specified
     * on req.username (which gets automagically set for supported Authorization
     * types; otherwise set it yourself with a filter that runs before this).
     *
     * In both cases, you can set a `burst` and a `rate` (in requests/seconds),
     * as an integer/float.  Those really translate to the `TokenBucket`
     * algorithm, so read up on that (or see the comments above...).
     *
     * In either case, the top level options burst/rate set a blanket throttling
     * rate, and then you can pass in an `overrides` object with rates for
     * specific users/IPs.  You should use overrides sparingly, as we make a new
     * TokenBucket to track each.
     *
     * An example options object with overrides:
     *
     *  {
     *      burst: 10,  // Max 10 concurrent requests (if tokens)
     *      rate: 0.5,  // Steady state: 1 request / 2 seconds
     *      ip: true,   // throttle per IP
     *      overrides: {
     *          '192.168.1.1': {
     *              burst: 0,
     *              rate: 0    // unlimited
     *      }
     *  }
     *
     *
     * @param {Object} options required options with:
     *                   - {Number} burst (required).
     *                   - {Number} rate (required).
     *                   - {Boolean} ip (optional).
     *                   - {Boolean} username (optional).
     *                   - {Boolean} xff (optional).
     *                   - {Object} overrides (optional).
     *                   - {Object} tokensTable: a storage engine this plugin 
     *                              will use to store throttling keys -> bucket 
     *                              mappings. If you don't specify this, the 
     *                              default is to use an in-memory O(1) LRU, 
     *                              with 10k distinct keys.  Any implementation
     *                              just needs to support set/get.
     *                   - {Number} maxKeys: If using the default 
     *                              implementation, you can specify how large 
     *                              you want the table to be.  Default is 10000.
     * @return {Function} of type f(req, res, next) to be plugged into a route.
     * @throws {TypeError} on bad input.
     */
    return function (options) {
        // Apply options to instance
        _.extend(self, options);

        // Validate options
        assert.number(self.burst, 'options.burst');
        assert.number(self.rate, 'options.rate');

        // Return middleware
        return rateLimit;
    };
}

module.exports = new Throttle();