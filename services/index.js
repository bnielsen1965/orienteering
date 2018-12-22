
const Authentication = require('./authentication');
const Users = require('./users');
const Course = require('./course');


module.exports = app => {
  app
  .configure(Authentication)
  .configure(Users)
  .configure(Course)
};
