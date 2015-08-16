# superagent-jsonp
Adds jsonp behaviour to superagent.

## To use with browserify

First install with npm

``` npm i superagent-jsonp --save ```

Then use like so;

```js
var superagent = require('superagent');

require('superagent-jsonp')(superagent);

superagent.get('http://example.com/foo.json').jsonp().end(function(){
  // everything is as normal
});

```

## Options

The jsonp function takes an optional object which currently only allows
to change the callback name used in the query string.

- callbackParam: This will change the default query string callback
  parameter (defaults to callback)


## To use with bower

First install:

``` bower i superagent-jsonp --save```

Include it from your bower components in the usual way

Then use pretty much as you do above

```js
superagentJSONP(superagent);

superagent.get('http://example.com/foo.json').jsonp().end(function(){
  // everything is as normal
});
```



