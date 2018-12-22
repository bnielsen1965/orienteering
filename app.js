
const Express = require('@feathersjs/express');
const Feathers = require('@feathersjs/feathers');
const Configuration = require('@feathersjs/configuration');
const Transports = require('./transports');
const Services = require('./services');
const Channels = require('./channels');
const Webserver = require('./webserver');

let app = Express(Feathers());

app.configure(Configuration());

app.configure(Transports);
app.configure(Services);
app.configure(Channels);
app.configure(Webserver);

if (process.argv.length > 2 && process.argv[2] === 'init') {
  init()
  .catch(err => { console.log('INIT ERROR', err.message); });
}

app.use(Express.errorHandler());


async function init() {
  let service = app.service('users');
  let localUsers = require('./config/localusers.json');
  for (let ui = 0; ui < localUsers.length; ui++) {
    await service.remove(null, { query: { username: localUsers[ui].username }});
    await service.create(localUsers[ui]);
  }
}


module.exports = app
