
const Local = require('@feathersjs/authentication-local');

module.exports = app => {
  const Users = app.service('users')

  Users.hooks({
    before: {
      all: [checkPermissions],
      create: [createValidation, createWithHash],
      patch: [createWithHash],
      remove: [removeValidation]
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


  function createValidation(context) {
    if (!context.data.username) {
      throw new Error('username required');
    }
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

  function removeValidation(context) {
    if (!context.params.query.username) {
      throw new Error('Must specify username');
    }

    if (context.params.provider && context.params.user.username === context.params.query.username) {
      throw new Error('Cannot delete self');
    }
  }

};
