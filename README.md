# orienteering

Orienteering is an application used to assist in managing an orienteering competition.


# requirements

- Laptop or workstation
- Smartcard reader
- Smartcards


## build

Building the application only requires downloading the project and using npm
to install the dependencies.

> NOTE: I've only tested with node.js 8.11

```shell
git clone https://github.com/bnielsen1965/orienteering
cd orienteering
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


## running the application

Run the application in a terminal then use a web browser to open the application page.
 http://localhost:3030/

> NOTE: The default administrative username and password are *admin* and *admin*.
