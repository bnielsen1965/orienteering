
// declare global variables
var client;
var apiURL = window.location.href;
var credentials = {};
var loggedIn;
var title = 'Orienteering';

var menuLabels = [
  { label: "Home" },
  { label: "Check Out" },
  { label: "Check In" },
  { label: "Course Admin", groups: ['admin', 'manager'] },
  { label: "User Admin", groups: ['admin'] },
  { label: "Logout" }
];

// once the page is loaded
$(document).ready(function() {
  showBusy($('#main')); // indicate main is loading

  // create socket and client for the API
  var socket = io(apiURL);
  client = feathers();
  client.configure(feathers.socketio(socket));
  client.configure(feathers.authentication());

  // once connected to the API load the login qbit
  socket.on('connect', function () {
    $('#main').qbit('login', { authenticate: authenticate, title: title });
  });

  // if client logs out then load the login qbit again
  client.on('logout', function () {
    if (loggedIn) {
      $('#main').qbit('login', { authenticate: authenticate, title: title });
      loggedIn = false;
    }
  });
});


// user authentication method
function authenticate(username, password) {
  showErrors();
  var auth ={
    strategy: 'local',
    username: username,
    password: password
  };

  client.authenticate(auth)
  .then(response => {
    credentials = response;
    authenticated(credentials);
  })
  .catch(err => {
    showErrors([err.message]);
  });
}

// call when a user is authenticated
function authenticated(credentials) {
  console.log('CR', credentials)
  loggedIn = true;
  showBusy($('#main')); // busy loading main

  // build navigation menu
  var menu = menuLabels.filter(function (label) {
    return !label.groups || -1 !== label.groups.indexOf(credentials.group);
  });

  // add application content containers
  $('#main').html('<div id="menu"></div><div id="content"></div>');
  showBusy($('#main #content')); // busy loading content
  $('#menu').qbit('menu', {
    menu: menu,
    menuChanged: menuChanged,
    readyCallback: function () {
      // load main content
      $('#menu').qbit().getQbit().setActive('Home');
      loadContent('Home');
    }
  });
}

function menuChanged(label) {
  if (label === 'Logout') {
    client.logout();
  }
  else {
    loadContent(label);
  }
}

function loadContent(name) {
  name = name.toLowerCase().replace(/\s/g, '');
  $('#main #content').qbit(name);
}

// show busy indicator inside an element
function showBusy(jqElem) {
  jqElem.html('<div class="busybox container center"><div class="busy"><img src="img/spinner1.gif"></div></div>');
}

// display the query progress
function progress(current, total) {
  $('#progress').html(Math.round(current / total * 100) + '%')
}

// show error messages
function showErrors(errors) {
  errors = errors || [];
  $('#errors').html('');
  errors.forEach(function (error) {
    $('#errors').append(error + '<br>');
  });
}
