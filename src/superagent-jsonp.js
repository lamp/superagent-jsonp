const removeCallback = function ({ script, callbackName } = {}) {
  script && script.parentNode && script.parentNode.removeChild(script);
  delete window[callbackName];
};

let jsonp = function(requestOrConfig) {
	var reqFunc = function(request) {
		// In case this is in nodejs, run without modifying request
		if (typeof window == 'undefined') return request;

		request.end = end.call(request, requestOrConfig);
		return request;
	};

	// if requestOrConfig is request
	if (typeof requestOrConfig.end == 'function') {
		return reqFunc(requestOrConfig);
	} else {
		return reqFunc;
	}
};

jsonp.callbackWrapper = function (body) {
	const err = null;
  const res = { body };

  clearTimeout(this._jsonp.timeout);

  this._jsonp.callback.call(this, err, res);

  removeCallback(this._jsonp);
};

jsonp.errorWrapper = function () {
	let err = new Error('404 NotFound');

  this._jsonp.callback.call(this, err, null);

  removeCallback(this._jsonp);
};

let end = function(config = {}) {
	return function(callback) {
		const callbackParam = config.callbackParam || 'callback';
    const callbackName = config.callbackName || `superagentCallback${new Date().valueOf() + parseInt(Math.random() * 1000)}`;
    const timeoutLimit = config.timeout || 1000;

    const timeout = setTimeout(jsonp.errorWrapper.bind(this), timeoutLimit);

    this._jsonp = {
      callbackName,
			callback,
			timeout,
    };

		window[callbackName] = jsonp.callbackWrapper.bind(this);

		this._query.push(`${encodeURIComponent(callbackParam)}=${encodeURIComponent(callbackName)}`);
		let queryString = this._query.join('&');

		let s = document.createElement('script');
		{
			let separator = (this.url.indexOf('?') > -1) ? '&': '?';
			let url = this.url + separator + queryString;

			s.src = url;
		}

		document.head.appendChild(s);
		this._jsonp.script = s;

		return this;
	}
};

// Prefer node/browserify style requires
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = jsonp;
} else if (typeof define === "function" && define.amd) {
	define([],function() { return { jsonp }; });
} else if (typeof window !== 'undefined') {
	window.superagentJSONP = jsonp;
}
