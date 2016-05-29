[![CircleCI](https://circleci.com/gh/lamp/superagent-jsonp/tree/master.svg?style=svg)](https://circleci.com/gh/lamp/superagent-jsonp/tree/master)
[![bitHound Dev
Dependencies](https://www.bithound.io/github/lamp/superagent-jsonp/badges/devDependencies.svg)](https://www.bithound.io/github/lamp/superagent-jsonp/master/dependencies/npm)
# superagent-jsonp
Adds jsonp behaviour to superagent.

## To use with browserify

First install with npm

``` npm i superagent-jsonp --save ```

Then use like so;

```js
var superagent = require('superagent');

let jsonp = require('superagent-jsonp');

superagent.get('http://example.com/foo.json').use(jsonp).end(function(err, res){
  // everything is as normal
});

```

## To use with bower

First install:

``` bower i superagent-jsonp --save```

Include it from your bower components in the usual way

Then use pretty much as you do above

```js
superagent.get('http://example.com/foo.json').use(superagentJSONP).end(function(err, res){
  // everything is as normal
});
```



