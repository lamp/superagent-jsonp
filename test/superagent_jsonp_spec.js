// TODO: Move all of this setup into test helper
import chai from 'chai';
import sinonChai from 'sinon-chai';
import jsdom from 'jsdom';
import sinon from 'sinon';
import { expect } from 'chai';
import jsonp from '../src/superagent-jsonp';

chai.use(sinonChai);

let generateDOM = () => {
  var jsdom = require('jsdom').jsdom;

  global.navigator = {
    userAgent: 'node.js'
  };

  global.window = jsdom('<html><body></body></html>');
  global.document = window;
};

let tearDownDOM = () => {
  delete global.navigator;
  delete global.document;
  delete global.window;
};

describe('SuperagentJSONP', () => {
  let sandbox, clock;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    sandbox.restore();
  });

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

    context('when the url returns a 404', () => {

      const superagentMock = {
        _query: [],
        url: 'http://test.com'
      };

      beforeEach(generateDOM);
      afterEach(tearDownDOM);

      it('calls the error handler', () => {
        const callbackSpy = sandbox.spy();
        sinon.spy(jsonp, 'errorWrapper');

        const newRequest = jsonp({ timeout: 100 })(superagentMock).end(callbackSpy);

        clock.tick(110);

        expect(jsonp.errorWrapper).to.have.been.called;
        expect(callbackSpy).to.have.been.calledWith(new Error('404 NotFound'), null);
      });
    });
  });
});
