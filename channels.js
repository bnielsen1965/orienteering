
const ServicesList = [
  { serviceName: 'users', groups: [] },
  { serviceName: 'card', groups: [] },
  { serviceName: 'course', groups: [] },
  { serviceName: 'participant', groups: [] },
  { serviceName: 'smartcard', groups: [] }
];

module.exports = app => {
  ServicesList.forEach(service => {
    app.service(service.serviceName).publish((data, context) => {
      return app.channel('changes').filter(connection => {
        // TODO check connection.user.group against service.groups
        return true;
      });
    });
  });

  app.on('login', (payload, { connection }) => {
    if(connection) {
      app.channel('changes').join(connection);
    }
  });

};
