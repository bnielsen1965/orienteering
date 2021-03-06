
module.exports = app => {
  const Course = app.service('course')

  Course.hooks({
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
