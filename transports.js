
const Express = require('@feathersjs/express');
const Socketio = require('@feathersjs/socketio');


module.exports = app => {

  // REST transport...
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));
  app.configure(Express.rest());

  // collect connection details to use in fingerprint
  app.use('/', (req, res, next) => {
    req.feathers.remoteAddress = req.connection.remoteAddress;
    req.feathers.userAgent = req.headers['user-agent'];
    next();
  });


  // WebSocket transport...
  let socketioSettings = {};
  let socketPath = app.get('socketPath');
  if (socketPath) {
    // use a defined socket path in place of the default socketio path
    socketioSettings.path = socketPath;
  }
  app.configure(Socketio(socketioSettings, io => {
    // collect connection details to use in fingerprint
    io.use((socket, next) => {
      socket.feathers.remoteAddress = socket.client.conn.remoteAddress;
      socket.feathers.userAgent = socket.request.headers['user-agent'];
      next();
    });
  }));

}
