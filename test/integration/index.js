import expect from 'expect';
import Hapi from 'hapi';
import Sinon from 'sinon';
import Boom from 'boom';
import rp from 'request-promise';
import nock from 'nock';

import HapiErrorLogger from '../../source';

describe('[integration/plugin]', function () {
  let server;
  let requestStub;
  let requestErrorStub;
  const error = Boom.badImplementation('what should i say');

  before('create a hapi server', function () {
    server = new Hapi.Server();
    server.connection({ host: '127.0.0.1', port: 8080 });
    return server.register([
      // hapi-error-logger plugin integration
      {
        register: HapiErrorLogger,
        options: {
          replyWithStack: true
        }
      }
    ]);
  });

  before('register a route that fails', function () {
    return server.route({
      method: 'GET',
      path: '/fail',
      handler(request, reply) {
        requestStub = Sinon.stub(request, 'log');

        return reply(error);
      }
    });
  });

  before('register a route with an external http call', function () {
    return server.route({
      method: 'GET',
      path: '/request-error',
      handler(request, reply) {
        requestErrorStub = Sinon.stub(request, 'log');

        return rp({
          method: 'GET',
          uri: 'http://test.com/stuff',
          json: true
        })
        .then(reply)
        .catch(reply);
      }
    });
  });

  before('init hapi server', function () {
    return server.initialize();
  });

  after('stop hapi server', function () {
    return server.stop();
  });

  describe('internal error', function () {
    let response;
    let payload;

    before('call failing route', function () {
      return server.inject({
        method: 'GET',
        url: '/fail'
      })
      .then((resp) => {
        response = resp;
      });
    });

    before(function () {
      payload = JSON.parse(response.payload);
    });

    it('should log the error', function () {
      expect(requestStub.calledWith([ 'error' ], 'what should i say')).toEqual(true);
    });

    it('should respond with the stack if configured', function () {
      expect(payload.stack).toExist();
    });
  });

  describe('request error', function () {
    let response;
    let payload;

    before('nock', function () {
      return nock('http://test.com')
        .get('/stuff')
        .reply(500, { error: 'internal server error' });
    });

    before('call failing route', function () {
      return server.inject({
        method: 'GET',
        url: '/request-error'
      })
      .then((resp) => {
        response = resp;
      });
    });

    before(function () {
      payload = JSON.parse(response.payload);
    });

    it('should log the error', function () {
      expect(requestErrorStub.calledWith([ 'error' ], { error: 'internal server error' })).toEqual(true);
    });

    it('should respond with the stack if configured', function () {
      expect(payload.stack).toExist();
    });
  });
});
