/**
 * XOR helper.
 *
 * @package restify-throttle
 * @author Mark Cavage <mcavage@gmail.com>
 *         Andrew Sliwinski <andrewsliwinski@acm.org>
 */

/**
 * Export
 */
module.exports = function () {
    var x = false;
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] && !x) {
            x = true;
        } else if (arguments[i] && x) {
            return false;
        }
    }
    return x;
};