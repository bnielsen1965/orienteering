// example Qbit
(function ($) {
  var defaults = {};
  var _this;
  // Qbit constructor
  var Qbit = function (element, jqbit) {
    _this = this;
    // build settings from defaults and arguments passed to the jQuery qbit
    var settings = this.settings = $.extend({ element }, defaults, jqbit.args);
    jqbit.loadCSS();
    // use jQuery qbit to load the Qbit HTML
    jqbit.loadHTML(function () {
      // actions to take after Qbit HTML is loaded
      $(element).find('button#crcreate').click(createUser);
      getUserList();
      serviceListeners(settings.userService);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#useradmin').parent().empty();
    },
    deleteUser: deleteUser
  });


  function createUser() {
    _this.settings.userService.create({
      strategy: 'local',
      username: $('input#crusername').val(),
      password: $('input#crpassword').val(),
      group: $('select#crgroup').val()
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function deleteUser(username) {
    if (!username || !username.length) {
      showErrors(['Username required']);
      return;
    }
    _this.settings.userService.remove(null, { query: { username: username } })
    .catch(function (err) { showErrors([err.message]); });
  }

  function serviceListeners(service) {
    service
    .on('created', getUserList)
    .on('removed', getUserList)
    .on('patched', getUserList)
    .on('updated', getUserList)
  }


  function getUserList() {
    findAll(_this.settings.userService, { $sort: { username: 1 } })
    .then(function (docs) {
      $('#userlist').html('');
      $('#userlist').append('<tr><th>Username</th><th>Group</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(function (doc) {
        $('#userlist').append(
          '<tr><td>' + doc.username + '</td>' +
          '<td>' + doc.group + '</td>' +
          '<td><button onclick="$(this).qbit().getQbit().deleteUser(\'' + doc.username + '\');">Delete</button></td></tr>'
        );
      })
    })
    .catch(function (err) { showErrors([err.message]); });
  }


  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('useradmin', Qbit);
})(jQuery);
