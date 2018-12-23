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
      $(element).find('button#crcreate').click(createParticipant);
      getParticpantList();
      serviceListeners(settings.participantService);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#participantadmin').parent().empty();
    },
    deleteParticipant: deleteParticipant
  });


  function createParticipant() {
    _this.settings.participantService.create({
      firstname: $('input#crfirstname').val(),
      lastname: $('input#crlastname').val()
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function deleteParticipant(firstname, lastname) {
    if (!firstname || !firstname.length || !lastname || !lastname.length) {
      showErrors(['First and last name required']);
      return;
    }
    _this.settings.participantService.remove(null, { query: { firstname: firstname, lastname: lastname } })
    .catch(function (err) { showErrors([err.message]); });
  }

  function serviceListeners(service) {
    service
    .on('created', getParticpantList)
    .on('removed', getParticpantList)
    .on('patched', getParticpantList)
    .on('updated', getParticpantList)
  }


  function getParticpantList() {
    findAll(_this.settings.participantService, { $sort: { lastname: 1, firstname: 1 } })
    .then(function (docs) {
      $('#participantlist').html('');
      $('#participantlist').append('<tr><th>Last Name</th><th>First Name</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(function (doc) {
        $('#participantlist').append(
          '<tr><td>' + doc.lastname + '</td>' +
          '<td>' + doc.firstname + '</td>' +
          '<td><button onclick="$(this).qbit().getQbit().deleteParticipant(\'' + doc.firstname + '\', \'' + doc.lastname + '\');">Delete</button></td></tr>'
        );
      })
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('participantadmin', Qbit);
})(jQuery);
