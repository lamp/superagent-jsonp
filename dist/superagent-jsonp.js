'use strict';

var removeCallback = function removeCallback() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    script = _ref.script,
	    callbackName = _ref.callbackName;

	script && script.parentNode && script.parentNode.removeChild(script);
	delete window[callbackName];
};

var jsonp = function jsonp(requestOrConfig) {
	var reqFunc = function reqFunc(request) {
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
	var err = null;
	var res = { body: body };

	clearTimeout(this._jsonp.timeout);

	this._jsonp.callback.call(this, err, res);

	removeCallback(this._jsonp);
};

jsonp.errorWrapper = function () {
	var err = new Error('404 NotFound');

	this._jsonp.callback.call(this, err, null);

	removeCallback(this._jsonp);
};

var end = function end() {
	var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return function (callback) {
		var callbackParam = config.callbackParam || 'callback';
		var callbackName = config.callbackName || 'superagentCallback' + (new Date().valueOf() + parseInt(Math.random() * 1000));
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
		}

		document.head.appendChild(s);
		this._jsonp.script = s;

		return this;
	};
};

// Prefer node/browserify style requires
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = jsonp;
} else if (typeof define === "function" && define.amd) {
	define([], function () {
		return { jsonp: jsonp };
	});
} else if (typeof window !== 'undefined') {
	window.superagentJSONP = jsonp;
}