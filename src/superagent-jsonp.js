const removeCallback = function ({ script, callbackName, timeout } = {}) {
  if (script && script.parentNode) script.parentNode.removeChild(script);
  delete window[callbackName];

  clearTimeout(timeout); // clear timeout (for onerror event listener)
};

const jsonp = function (requestOrConfig) {
  const end = function (config = {}) {
    return function handler(callback) {
      const callbackParam = config.callbackParam || 'callback';
      const callbackName = config.callbackName || `superagentCallback${new Date().valueOf() + parseInt(Math.random() * 1000, 10)}`;
      const timeoutLimit = config.timeout || 1000;

      const timeout = setTimeout(jsonp.errorWrapper.bind(this), timeoutLimit);

      this._jsonp = {
        callbackName,
        callback,
        timeout,
      };

      window[callbackName] = jsonp.callbackWrapper.bind(this);

      this._query.push(`${encodeURIComponent(callbackParam)}=${encodeURIComponent(callbackName)}`);
      const queryString = this._query.join('&');

      const s = document.createElement('script');
      {
        const separator = (this.url.indexOf('?') > -1) ? '&' : '?';
        const url = this.url + separator + queryString;

        s.src = url;

        // Handle script load error #27
        s.onerror = (e) => {
          jsonp.errorWrapper.call(this, e);
        };
      }

      document.head.appendChild(s);
      this._jsonp.script = s;

      return this;
    };
  };

  const reqFunc = function (request) {
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
  const err = null;
  const res = { body };

  this._jsonp.callback.call(this, err, res);

  removeCallback(this._jsonp);
};

jsonp.errorWrapper = function errorWrapper(error) {
  let err = new Error('404 Not found');
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
  define([], () => ({ jsonp }));
} else if (typeof window !== 'undefined') {
  window.superagentJSONP = jsonp;
}
