
const Authentication = require('@feathersjs/authentication')

// TODO add hook to throttle authentication to thwart brute force attacks

module.exports = app => {
  app.hooks({
    before: {
      all: [
        // force jwt authentication on all services except authentication
        async hook => {
          if (hook.path !== 'authentication') {
            await Authentication.hooks.authenticate('jwt')(hook);
          }
          return hook;
        }
      ]
    }
  });
};
