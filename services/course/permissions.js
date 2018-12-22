
const Local = require('@feathersjs/authentication-local');

module.exports = app => {
  const Users = app.service('users')

  Users.hooks({
    before: {
      create: [checkPermissions, validate],
      patch: [checkPermissions, validate],
      remove: [checkPermissions, validate]
    },
    after: {}
  });


  function checkPermissions(context) {
    if (context.params.provider) {
      if (context.params.user && -1 !== ['admin', 'manager'].indexOf(context.params.user.group)) {
        return;
      }
      else {
        throw new Error('Permission denied.');
      }
    }
    return context;
  }

  function validate(context) {

  }
};
