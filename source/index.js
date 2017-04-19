const Joi = require('joi');

const internals = {};


internals.PluginScheme = Joi.object()
  .keys({
    replyWithStack: Joi.bool()
      .optional()
      .default(false)
      .description('whether to add the stack as part of external error payload')
  })
  .optional()
  .default({});


internals.plugin = {
  register(server, options, next) {
    const pluginOpts = Joi.attempt(options, internals.PluginScheme);

    // register post respose handler that logs 5xx request
    server.ext('onPreResponse', (request, reply) => {
      const { response } = request;

      // isServer: convenience bool indicating status code >= 500
      if (response && response.isBoom && response.isServer) {
        const error = response.error || response.message;

        request.log([ 'error' ], error);

        if (pluginOpts.replyWithStack) {
          response.output.payload.stack = response.stack;
        }
      }

      return reply.continue(response);
    });

    return next();
  }
};


internals.plugin.register.attributes = {
  name: 'hapi-error-logger'
};


module.exports = internals.plugin;
