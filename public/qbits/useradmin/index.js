// example Qbit
(function ($) {
  var defaults = {};

  // Qbit constructor
  var Qbit = function (element, jqbit) {
    // build settings from defaults and arguments passed to the jQuery qbit
    var settings = this.settings = $.extend({}, defaults, jqbit.args);
    // use jQuery qbit to load the Qbit HTML
    jqbit.loadHTML(function () {
      // actions to take after Qbit HTML is loaded
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


  function getUserList() {
    findAll(client.service('users'))
    .then(docs => {
      $('#userlist').html('');
      $('#userlist').append('<tr><th>Username</th><th>Group</th><th></th></tr>');
      docs.forEach(doc => {
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
