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
      $(element).find('button#crcreate').click(userAdminCreateUser);
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
    deleteUser: userAdminDeleteUser
  });


  function userAdminCreateUser() {
    _this.settings.createUser($('input#crusername').val(), $('input#crpassword').val(), $('select#crgroup').val());
  }

  function userAdminDeleteUser(username) {
    _this.settings.deleteUser(username);
  }

  function serviceListeners(service) {
    service
    .on('created', getUserList)
    .on('removed', getUserList)
    .on('patched', getUserList)
    .on('updated', getUserList)
  }


  function getUserList() {
    _this.settings.getUserList()
    .then(docs => {
      $('#userlist').html('');
      $('#userlist').append('<tr><th>Username</th><th>Group</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(doc => {
        $('#userlist').append(
          '<tr><td>' + doc.username + '</td>' +
          '<td>' + doc.group + '</td>' +
          '<td><button onclick="console.log($(this).qbit().getQbit().deleteUser(\'' + doc.username + '\'));">Delete</button></td></tr>');
      })
    })
    .catch(err => { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('useradmin', Qbit);
})(jQuery);
