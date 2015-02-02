/**
 * MIT license
 */

// Callback index.
var count = 0;

/**
 * JSONP handler
 *
 * Options:
 * - prefix {String} callback prefix (defaults to `__jp`)
 * - param {String} qs parameter (defaults to `callback`)
 * - timeout {Number} how long after the request until a timeout error
 *   is emitted (defaults to `15000`)
 *
 * @param {String} url
 * @param {Object} options optional options
 * @return {Object} Returns a response promise and a cancel handler.
 */
var jsonp = (url, options) => {
    options = options || {};

    var prefix = options.prefix || '__jp';
    var param = options.param || 'callback';
    var timeout = options.timeout ? options.timeout : 15000;
    var target = document.getElementsByTagName('script')[0] || document.head;
    var script;
    var timer;
    var cleanup;
    var cancel;
    var promise;
    var noop = () => {};

    // Generate a unique id for the request.
    var id = prefix + (count++);

    cleanup = () => {
        // Remove the script tag.
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }

        window[id] = noop;

        if (timer) {
            clearTimeout(timer);
        }
    };

    cancel = () => {
        if (window[id]) {
            cleanup();
            promise = null;
        }
    };

    promise = new Promise((resolve, reject) => {
        if (timeout) {
            timer = setTimeout(() => {
                cleanup();
                reject(new Error('Timeout'));
            }, timeout);
        }

        window[id] = (data) => {
            cleanup();
            resolve(data);
        };

        // Add querystring component
        url += (~url.indexOf('?') ? '&' : '?') + param + '=' + encodeURIComponent(id);
        url = url.replace('?&', '?');

        // Create script.
        script = document.createElement('script');
        script.src = url;
        target.parentNode.insertBefore(script, target);
    });

    return {
        promise: promise,
        cancel: cancel
    };
};

export default jsonp;

