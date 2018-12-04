
const Authentication = require('@feathersjs/authentication')
const JWT = require('@feathersjs/authentication-jwt')
const Local = require('@feathersjs/authentication-local');
const Permissions = require('./permissions');


module.exports = app => {
  app
  .configure(Authentication(app.get('authentication')))
  .configure(Local())
  .configure(JWT());

  app.configure(Permissions);

  // authentication hooks
  app.service('authentication').hooks({
    before: {
      create: [
        createHash
      ]
    },
    after: {
      create: [includeGroup]
    }
  });


  // include user group detail in response
  async function includeGroup(context) {
    context.result.group = context.params.user.group;
    context.result.username = context.params.user.username;
    return context;
  }


  // api $createHash operator
  async function createHash(hook) {
    if (hook.data.$createHash) {
      hook.data.password = hook.data.$createHash;
      await Local.hooks.hashPassword()(hook);
      hook.result = { hash: hook.data.password };
      return hook;
    }
    else {
      return Authentication.hooks.authenticate(['local', 'jwt'])(hook);
    }
  }

}
