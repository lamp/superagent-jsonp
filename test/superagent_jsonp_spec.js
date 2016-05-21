import jsdom from 'jsdom';
import { expect } from 'chai';
import jsonp from '../src/superagent-jsonp';

let generateDOM = () => {
  var jsdom = require('jsdom').jsdom;

  global.navigator = {
    userAgent: 'node.js'
  };

  global.window = jsdom('<html><body></body></html>');
};

let tearDownDOM = () => {
  delete global.navigator;
  delete global.document;
  delete global.window;
};

describe('SuperagentJSONP', () => {

  describe('#jsonp', () => {
    let end = 'Hello ';
    let requestMock = { end };

    context('when window is not defined', () => {

      it('does nothing', () => {
        expect(jsonp({})('hello')).to.eq('hello');
      });
    });

    context('when window is defined', () => {

      beforeEach(generateDOM);
      afterEach(tearDownDOM);

      it('sets up the request object', () => {
        let newRequest = jsonp({})(requestMock);
        expect(newRequest.end).not.to.eq(end);
        expect(typeof newRequest.end).to.eq('function')
      });
    });

  });
});
