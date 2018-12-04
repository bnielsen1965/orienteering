
const Path = require('path');
const Local = require('@feathersjs/authentication-local')
const NeDB = require('nedb');
const Service = require('feathers-nedb');
const Permissions = require('./permissions');

module.exports = app => {
  // Create a NeDB instance
  const Model = new NeDB({
    filename: Path.join(app.get('database').path, 'users.db'),
    autoload: true
  });
  Model.ensureIndex({ fieldName: 'username', unique: true }, err => {
    if (err) {
      console.log(err.message);
    }
  });

  app.use('/users', Service({
    Model,
    paginate: {
      default: 5,
      max: 25
    }
  }));
  app.configure(Permissions);
}
