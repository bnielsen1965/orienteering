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
      $(element).find('select#selcoursename').change(getCheckoutList);
      getCourses();
      serviceListeners(settings.courseService);
      settings.smartcardService.on('card_uid', checkoutCardUID);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#checkout').parent().empty();
      _this.settings.smartcardService.removeAllListeners('card_uid');
//      _this.settings.courseService.removeAllListeners('patch');
    }
  });


  function checkoutCardUID(uid) {
    var courseName = $(_this.settings.element).find('select#selcoursename').val();
    if (!courseName.length) {
      showErrors(['Select course for check out']);
      return;
    }
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Failed to find course ' + courseName);
      }
      return _this.settings.courseService.patch(
        null,
        { $set: { "participants.$.starttime": new Date() } },
        { query: { _id: result.data[0]._id.toString(), "participants.card.uid": uid, "participants.starttime": { $exists: false } } }
      );
    })
    .then(function (docs) {
      if (docs.length) {
        var row = docs[0].participants.reduce(function (acc, row) {
          return row.card.uid === uid ? row : acc;
        }, null);
        var co = new Date(row.starttime);
        $('#currentcheckout').html(row.participant.lastname + ', ' + row.participant.firstname + ' :: ' + co.toLocaleTimeString());
      }
    })
    .catch(function (err) { showErrors([err.message]); });
  }

// TODO add listener in case some other process changes course participants
  function serviceListeners(service) {
    service
    .on('created', getCheckoutList)
    .on('removed', getCheckoutList)
    .on('patched', getCheckoutList)
    .on('updated', getCheckoutList)
  }

  function getCourses() {
    findAll(_this.settings.courseService, {})
    .then(function (courses) {
      $(_this.settings.element).find('select#selcoursename').html('<option value="">...</option>');
      courses.forEach(function (course) {
        $(_this.settings.element).find('select#selcoursename').append('<option value="' + course.name + '">' + course.name + '</option>');
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function getCheckoutList() {
    var courseName = $(_this.settings.element).find('select#selcoursename').val();
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Failed to find course ' + courseName);
      }
      $('#checkoutlist').html('');
      $('#checkoutlist').append('<tr><th colspan="3">' + courseName + '</th></tr>');
      $('#checkoutlist').append('<tr><th>Name</th><th>Card</th><th>Start Time</th></tr>');
      result.data[0].participants.forEach(function (row) {
        $('#checkoutlist').append(
          '<tr><td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
          '<td>' + row.card.name + '</td>' +
          '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td></tr>');
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('checkout', Qbit);
})(jQuery);
