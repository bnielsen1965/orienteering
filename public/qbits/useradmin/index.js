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
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#useradmin').parent().empty();
    }
  });


  function createUser() {
    var username = $('input#crusername').val();
    var group = $('select#crgroup').val();
    var password = $('input#crpassword').val();
    console.log('CU', {
      strategy: 'local',
      username: username,
      group: group,
      password: password
    })
    client.service('users').create({
      strategy: 'local',
      username: username,
      group: group,
      password: password
    })
    .then(doc => {
      getUserList();
    })
    .catch(err => { showErrors([err.message]); });
  }


  function getUserList() {
    findAll(client.service('users'))
    .then(docs => {
      $('#userlist').html('');
      $('#userlist').append('<tr><th>Username</th><th>Group</th><th></th></tr>');
      console.log('_THIS', _this)
      if (_this && _this.settings && _this.settings.element) {
      console.log('EL', _this.settings.element.toString());
    }
      docs.forEach(doc => {
//        var deleteMethod = '$('#menu').qbit().getQbit()'
        $('#userlist').append(
          '<tr><td>' + doc.username + '</td>' +
          '<td>' + doc.group + '</td>' +
          '<td><button onclick="deleteUser(\'' + doc.username + '\')">Delete</button></td></tr>');
      })
    })
    .catch(err => { showErrors([err.message]); });
  }


  async function findAll(service, query, skip) {
    query = query || {};
    skip = skip || 0;
    let response = await service.find({ query: query, $skip: skip });
    if (response.total > response.data.length + response.data.skip) {
      return response.data.concat(await findAll(service, query, response.skip + response.limit));
    }
    else {
      return response.data;
    }
  }


  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('useradmin', Qbit);
})(jQuery);
