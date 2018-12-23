
const Authentication = require('./authentication');
const Users = require('./users');
const Course = require('./course');
const Card = require('./card');
const SmartCard = require('./smartcard');


module.exports = app => {
  app
  .configure(Authentication)
  .configure(Users)
  .configure(Course)
  .configure(Card)
  .configure(SmartCard)
};
