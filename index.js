if(typeof _ === 'undefined'){
  var _ = require('underscore');
}

var serialise = function(obj) {
  if (!_.isObject(obj)) return obj;
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
	var options = options || {};
	this.options = _.defaults(options, { callbackName : 'cb' });
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

	this._query.push(serialise({ callback : this.callbackName }));
	var queryString = this._query.join('&');

	var s = document.createElement('script');
	var url = this.url + '?' + queryString;

	s.src = url;

	document.getElementsByTagName('head')[0].appendChild(s);
};
