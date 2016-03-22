function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var serialise = function serialise(obj) {
  if (typeof obj != 'object') return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
};

let jsonp = function(request) {
  var config = request;
  var reqFunc = function(requestObj) {
    // In case this is in nodejs, run without modifying request
    if (typeof window == 'undefined') return request;

    requestObj.end = end.bind(requestObj)(config);
    return request;
  };
  if(typeof request.end == 'function') {
    return reqFunc(request);
  } else {
    return reqFunc;
  }
};

var callbackWrapper = function callbackWrapper(data) {
  var err = null;
  var res = {
    body: data
  };

  this._jsonp.callback.call(this, err, res);
};

var end = function end(config) {
  return function(callback) {
    this._jsonp = {
      callbackParam: config.callbackParam || 'callback',
      callbackName: 'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000),
      callback: callback
    };

    window[this._jsonp.callbackName] = callbackWrapper.bind(this);

    var params = _defineProperty({}, this._jsonp.callbackParam, this._jsonp.callbackName);

    this._query.push(serialise(params));
    var queryString = this._query.join('&');

    var s = document.createElement('script');
    var separator = this.url.indexOf('?') > -1 ? '&' : '?';
    var url = this.url + separator + queryString;

    s.src = url;
    document.getElementsByTagName('head')[0].appendChild(s);

    return this;
  }
};

// Prefer node/browserify style requires
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = jsonp;
} else if (typeof window !== 'undefined') {
  window.superagentJSONP = jsonp;
}
