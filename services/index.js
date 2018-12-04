
const Authentication = require('./authentication');
const Users = require('./users');


module.exports = app => {
  app
  .configure(Authentication)
  .configure(Users)
};
