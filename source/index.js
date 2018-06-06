import Joi from 'joi';

const PluginSchema = Joi.object()
  .keys({
    replyWithStack: Joi.bool()
      .optional()
      .default(false)
      .description(
        'whether to add the stack as part of external error payload',
      ),
  })
  .optional()
  .default({});

const Plugin = {
  name: 'hapi-error-logger',
  register(server, options) {
    const pluginOpts = Joi.attempt(options, PluginSchema);

    // register post response handler that logs 5xx request
    server.ext('onPreResponse', request => {
      const { response } = request;

      // isServer: convenience bool indicating status code >= 500
      if (response && response.isBoom && response.isServer) {
        const error = response.error || response.message;

        // skip logging if `error.data.skipLogs` is set
        if (!response.data || !response.data.skipLogs) {
          request.log(['error'], error);
        }

        if (pluginOpts.replyWithStack) {
          response.output.payload.stack = response.stack;
        }
      }

      return response;
    });
  },
};

export default Plugin;
