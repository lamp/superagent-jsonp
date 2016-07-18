let serialise = function(obj) {
  if (typeof obj != 'object') return obj;
  let pairs = [];
  for (let key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

let jsonp = function(requestOrConfig) {
	var reqFunc = function(request) {
		// In case this is in nodejs, run without modifying request
		if (typeof window == 'undefined') return request;

		request.end = end.bind(request)(requestOrConfig);
		return request;
	};
	// if requestOrConfig is request
	if(typeof requestOrConfig.end == 'function') {
		return reqFunc(requestOrConfig);
	} else {
		return reqFunc;
	}
};

jsonp.callbackWrapper = function(data) {
	let err = null;
	let res = {
		body: data
	};
  clearTimeout(this._jsonp.timeout);

	this._jsonp.callback.call(this, err, res);
};

jsonp.errorWrapper = function() {
  const err = new Error('404 NotFound');
  this._jsonp.callback.call(this, err, null);
};

let end = function(config = { timeout: 1000 }) {
	return function(callback) {

    let timeout = setTimeout(
      jsonp.errorWrapper.bind(this),
      config.timeout
    );

		this._jsonp = {
			callbackParam: config.callbackParam || 'callback',
			callbackName:  config.callbackName || 'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000),
			callback:				callback,
      timeout:        timeout
		};

		window[this._jsonp.callbackName] = jsonp.callbackWrapper.bind(this);

		let params = {
			[this._jsonp.callbackParam]: this._jsonp.callbackName
		};

		this._query.push(serialise(params));
		let queryString = this._query.join('&');

		let s = document.createElement('script');
		let separator = (this.url.indexOf('?') > -1) ? '&': '?';
		let url = this.url + separator + queryString;

		s.src = url;
		document.getElementsByTagName('head')[0].appendChild(s);

		return this;
	}
};

// Prefer node/browserify style requires
if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = jsonp;
}  else if (typeof window !== 'undefined'){
  window.superagentJSONP = jsonp;
}
