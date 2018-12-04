
const Local = require('@feathersjs/authentication-local');

module.exports = app => {
  const Users = app.service('users')

  Users.hooks({
    before: {
      all: [checkPermissions],
      create: [createWithHash],
      patch: [createWithHash]
    },
    after: {
      all: [
        Local.hooks.protect('password')
      ]
    }
  });


  function checkPermissions(context) {
    if (context.params.provider) {
      // request is not internal
      if (context.params.user && context.params.user.group === 'admin') {
        return;
      }
      else if (context.method === 'patch' && Object.keys(context.data).length === 1 && context.data['password']) {
        context.params.query.username = context.params.user.username;
        return;
      }
      else {
        throw new Error('Permission denied.');
      }
    }
    return context;
  }


  // use provided password hash or create the password hash
  function createWithHash(context) {
    if (context.data.hash) {
      // user provided password hash
      context.data.password = context.data.hash;
      delete context.data.hash;
      return Promise.resolve(context);
    }
    else {
      // hash the provided password
      return Local.hooks.hashPassword()(context);
    }
  }

};
