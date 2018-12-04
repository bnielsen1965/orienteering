const FS = require('fs');

let app = require('./app');
let server;
let sslKeyFile = app.get('sslKeyFile');
let sslCertificateFile = app.get('sslCertificateFile');

if (sslKeyFile && sslCertificateFile) {
  // setup HTTPS server
  try {
    let sslKey  = FS.readFileSync(sslKeyFile, 'utf8');
    let sslCertificate = FS.readFileSync(sslCertificateFile, 'utf8');
    if (!sslKey || !sslCertificate) {
      throw new Error('Missing credentials for https.');
    }

    server = require('https').createServer({key: sslKey, cert: sslCertificate}, app).listen(app.get('port'), app.get('host'));
    app.setup(server);
  }
  catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
else {
  // setup HTTP server
  server = app.listen(app.get('port'));
}

// setup server listeners
if (server) {
  server
  .on('error', (err) => {
    if (err.code && err.code === 'EADDRINUSE') {
      console.log('Port ' + app.get('port') + ' already in use.');
      process.exit(1);
    }
  })
  .on('listening', () => {
    console.log('Server up.', 'http://' + app.get('host') + ':' + app.get('port'));
  });
}
