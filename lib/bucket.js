/**
 * Token bucket implementation.
 *
 * @package restify-throttle
 * @author Mark Cavage <mcavage@gmail.com>
 *         Andrew Sliwinski <andrewsliwinski@acm.org>
 */

/**
 * Dependencies
 */
var assert  = require('assert-plus');

/**
 * An implementation of the Token Bucket algorithm.
 *
 * Basically, in network throttling, there are two "mainstream"
 * algorithms for throttling requests, Token Bucket and Leaky Bucket.
 * For restify, I went with Token Bucket.  For a good description of the
 * algorithm, see: http://en.wikipedia.org/wiki/Token_bucket
 *
 * In the options object, you pass in the total tokens and the fill rate.
 * Practically speaking, this means "allow `fill rate` requests/second,
 * with bursts up to `total tokens`".  Note that the bucket is initialized
 * to full.
 *
 * Also, in googling, I came across a concise python implementation, so this
 * is just a port of that. Thanks http://code.activestate.com/recipes/511490 !
 *
 * @param {Object} options contains the parameters:
 *                   - {Number} capacity the maximum burst.
 *                   - {Number} fillRate the rate to refill tokens.
 */
function Bucket (options) {
    assert.object(options, 'options');
    assert.number(options.capacity, 'options.capacity');
    assert.number(options.fillRate, 'options.fillRate');
    
    this.tokens = this.capacity = options.capacity;
    this.fillRate = options.fillRate;
    this.time = Date.now();
}

/**
 * Consume N tokens from the bucket.
 *
 * If there is not capacity, the tokens are not pulled from the bucket.
 *
 * @param {Number} tokens the number of tokens to pull out.
 * @return {Boolean} true if capacity, false otherwise.
 */
Bucket.prototype.consume = function (tokens) {
    if (tokens <= this.fill()) {
        this.tokens -= tokens;
        return true;
    }

    return false;
};

/**
 * Fills the bucket with more tokens.
 *
 * Rather than do some whacky setTimeout() deal, we just approximate refilling
 * the bucket by tracking elapsed time from the last time we touched the bucket.
 *
 * Simply, we set the bucket size to 
 * min(totalTokens, current + (fillRate * elapsed time)).
 *
 * @return {Number} the current number of tokens in the bucket.
 */
Bucket.prototype.fill = function () {
    var now = Date.now();
    if (now < this.time) {
        // Reset - account for clock drift (like DST)
        this.time = now - 1000;
    }

    if (this.tokens < this.capacity) {
        var delta = this.fillRate * ((now - this.time) / 1000);
        this.tokens = Math.min(this.capacity, this.tokens + delta);
    }
    this.time = now;

    return this.tokens;
};

/**
 * Export
 */
module.exports = Bucket;