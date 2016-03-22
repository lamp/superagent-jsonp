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

let callbackWrapper = function(data) {
  let err = null;
  let res = {
    body: data
  };

  this._jsonp.callback.call(this, err, res);
};

let end = function(config) {
  return function(callback) {
    this._jsonp = {
      callbackParam: config.callbackParam || 'callback',
      callbackName:  'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000),
      callback:       callback
    };

    window[this._jsonp.callbackName] = callbackWrapper.bind(this);

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
