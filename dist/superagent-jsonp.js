'use strict';

var removeCallback = function removeCallback() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      script = _ref.script,
      callbackName = _ref.callbackName,
      timeout = _ref.timeout;

  if (script && script.parentNode) script.parentNode.removeChild(script);
  delete window[callbackName];

  clearTimeout(timeout); // clear timeout (for onerror event listener)
};

var jsonp = function jsonp(requestOrConfig) {
  var end = function end() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return function handler(callback) {
      var _this = this;

      var callbackParam = config.callbackParam || 'callback';
      var callbackName = config.callbackName || 'superagentCallback' + (new Date().valueOf() + parseInt(Math.random() * 1000, 10));
      var timeoutLimit = config.timeout || 1000;

      var timeout = setTimeout(jsonp.errorWrapper.bind(this), timeoutLimit);

      this._jsonp = {
        callbackName: callbackName,
        callback: callback,
        timeout: timeout
      };

      window[callbackName] = jsonp.callbackWrapper.bind(this);

      this._query.push(encodeURIComponent(callbackParam) + '=' + encodeURIComponent(callbackName));
      var queryString = this._query.join('&');

      var s = document.createElement('script');
      {
        var separator = this.url.indexOf('?') > -1 ? '&' : '?';
        var url = this.url + separator + queryString;

        s.src = url;

        // Handle script load error #27
        s.onerror = function (e) {
          jsonp.errorWrapper.call(_this, e);
        };
      }

      document.head.appendChild(s);
      this._jsonp.script = s;

      return this;
    };
  };

  var reqFunc = function reqFunc(request) {
    // In case this is in nodejs, run without modifying request
    if (typeof window === 'undefined') return request;

    request.end = end.call(request, requestOrConfig);
    return request;
  };

  // if requestOrConfig is request
  if (typeof requestOrConfig.end === 'function') {
    return reqFunc(requestOrConfig);
  }

  return reqFunc;
};

jsonp.callbackWrapper = function callbackWrapper(body) {
  var err = null;
  var res = { body: body };

  this._jsonp.callback.call(this, err, res);

  removeCallback(this._jsonp);
};

jsonp.errorWrapper = function errorWrapper(error) {
  var err = new Error('404 Not found');
  if (error && error instanceof Event && error.type === 'error') {
    err = new Error('Connection issue');
  }

  this._jsonp.callback.call(this, err, null);

  removeCallback(this._jsonp);
};

// Prefer node/browserify style requires
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = jsonp;
} else if (typeof define === 'function' && define.amd) {
  define([], function () {
    return { jsonp: jsonp };
  });
} else if (typeof window !== 'undefined') {
  window.superagentJSONP = jsonp;
}