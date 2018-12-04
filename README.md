# feathersjs-accounts

Sample feathersjs local user account & authentication.

The application provides a [feathersjs](https://feathersjs.com/) based API and
hosts a web page that can be loaded in a browser to test the user account
features. [NeDB](https://github.com/louischatriot/nedb) is used as the
database so an additional database server is not required to use the sample
application.


## build

Building the application only requires downloading the project and using npm
to install the dependencies.

> NOTE: I've only tested with node.js 8.11

```shell
git clone https://github.com/bnielsen1965/feathersjs-accounts
cd feathersjs-accounts
npm install
```


## initialize

After building the application it is necessary to initialize the new database
with the first administrative user. Executing the application with the *init*
argument will create the user's defined in /config/localusers.json.

```shell
node index.js init
```

Once the database is initialized the init argument will not be needed the next
time you run the application.


## testing accounts

After starting up the application you must use a web browser to open the web
page that is hosted by the application. In the browser address bar enter the
address http://localhost:3030/

> NOTE: The default administrative username and password are *admin* and *admin*.


## TODO
- Add session storage.
- Implement channels to listen for changes to database.
- Validate user input.
- Make data store configurable to simplify implementing other databases.
- Add throttling to authentication service to prevent brute force attack.
