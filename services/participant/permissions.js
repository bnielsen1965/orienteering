
module.exports = app => {
  const Participant = app.service('participant')

  Participant.hooks({
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

  async function validate(context) {
    if (context.method === 'create') {
      let match = await app.service('participant').find({ query: { firstname: context.data.firstname, lastname: context.data.lastname } })
      if (match.data.length) {
        throw new Error('Participant name must be unique.');
      }
    }
    return context;
  }
};
