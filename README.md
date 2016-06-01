# hapi-error-logger

[![Build Status](https://travis-ci.org/blogfoster/hapi-error-logger.svg?branch=master)](https://travis-ci.org/blogfoster/hapi-error-logger)
[![Dependency Status](https://david-dm.org/blogfoster/hapi-error-logger.svg)](https://david-dm.org/blogfoster/hapi-error-logger)

This is a Hapi plugin to log all your response errors automatically using the `request.log` interface.

## usage

- just register the plugin

```javascript
import HapiErrorLogger from 'hapi-error-logger';

server.register([
  {
    register: HapiErrorLogger,
    options: {
      replyWithStack: true
    }
  }
]).then(() => {
  // errors are now logged automatically via:
  //
  //    request.log([ 'error' ], error);
})
```

## plugin api

- `replyWithStack` *optional*, default: `false`, if set your response will have an error stack attached if available.

## development

- npm

```bash
npm prune && npm install
npm test
```
