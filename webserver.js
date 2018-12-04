
const Path = require('path');
const Express = require('@feathersjs/express');
const Favicon = require('serve-favicon');


module.exports = app => {
  app.use(Favicon(Path.join(app.get('wwwPath'), 'favicon.ico')));
  app.use('/', Express.static(app.get('wwwPath')));
};
