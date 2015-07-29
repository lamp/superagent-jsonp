
var serialise = function(obj) {
  if (typeof obj != 'object') return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

// Prefer node/browserify style requires
if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
  module.exports = function(superagent) {
    var Request = superagent.Request;

    Request.prototype.jsonp = jsonp;
    Request.prototype.end = end;

    return superagent;
  };
} else if (typeof window !== 'undefined'){
  window.superagentJSONP = jsonp;
}

var jsonp = function(options){
	this.callbackParam = options.callbackParam || 'callback';
	this.callbackName = 'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000);
	window[this.callbackName] = callbackWrapper.bind(this);
	return this;
};

var callbackWrapper = function(data) {
	var err = null;
	var res = {
		body: data
	};

	this.callback.apply(this, [err, res]);
};

var end = function(callback){
	this.callback = callback;

	var dict = {};
	dict[this.callbackParam] = this.callbackName;
	this._query.push(serialise(dict));
	var queryString = this._query.join('&');

	var s = document.createElement('script');
	var separator = (this.url.indexOf('?') > -1) ? '&': '?';
	var url = this.url + separator + queryString;

	s.src = url;

	document.getElementsByTagName('head')[0].appendChild(s);
};
