
const Path = require('path');
const NeDB = require('nedb-core');
const Service = require('feathers-nedb');
const Permissions = require('./permissions');

module.exports = app => {
  // Create a NeDB instance
  const Model = new NeDB({
    filename: Path.join(app.get('database').path, 'course.db'),
    autoload: true
  });
  Model.ensureIndex({ fieldName: 'name', unique: true }, err => {
    if (err) {
      console.log(err.message);
    }
  });

  app.use('/course', Service({
    Model,
    paginate: {
      default: 5,
      max: 25
    }
  }));
  app.configure(Permissions);
}
