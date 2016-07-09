[![CircleCI](https://circleci.com/gh/lamp/superagent-jsonp/tree/master.svg?style=svg)](https://circleci.com/gh/lamp/superagent-jsonp/tree/master)
[![bitHound Overall Score](https://www.bithound.io/github/lamp/superagent-jsonp/badges/score.svg)](https://www.bithound.io/github/lamp/superagent-jsonp)
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

## Available options for the jsonp function

- callbackName: The name of the query parameter that contains the
  function name to call defaults to `callback`
- timeout: How long to wait until this is considered to be an
  unsuccessful request.
    - Note: all unsuccessful requests are currently treated as 404s

### Usage
  ```
  superagent
    .get('http://example.com/obviously_404.json').use(jsonp({
      timeout: 3000,
      callbackName: 'someOtherName'
      })).end((err, response) => {
        // response => {}
        // err => new Error('404 NotFound')
      });
  ```


