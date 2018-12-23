
module.exports = app => {
  const Card = app.service('card')

  Card.hooks({
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
      else if (context.params.user && context.params.user.group === ['operator'] && context.params.method === 'find') {
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
