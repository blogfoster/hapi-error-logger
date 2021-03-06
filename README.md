# hapi-error-logger

[![Build Status](https://travis-ci.org/blogfoster/hapi-error-logger.svg?branch=master)](https://travis-ci.org/blogfoster/hapi-error-logger)
[![Dependency Status](https://david-dm.org/blogfoster/hapi-error-logger.svg)](https://david-dm.org/blogfoster/hapi-error-logger)

This is a Hapi plugin to log all your response errors automatically using the `request.log` interface.

## usage

- just register the plugin

```javascript
import HapiErrorLogger from 'hapi-error-logger';

server
  .register([
    {
      plugin: HapiErrorLogger,
      options: {
        replyWithStack: true,
      },
    },
  ])
  .then(() => {
    // errors are now logged automatically via:
    //
    //    request.log([ 'error' ], error);
  });
```

## plugin api

- `replyWithStack` _optional_, default: `false`, if set your response will have an error stack attached if available.

## error api

- `error.data.skipLogs` _optional_, default: `false`, if set this error response will not be logged

```js
const Boom = require('boom');

// this is a handler definition
const handler = request => {
  const err = Boom.badGateway('could not reach server XXX', {
    skipLogs: true,
  });

  return err;
};
```

## development

- npm

```bash
npm prune && npm install
npm test
```
