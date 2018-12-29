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
      $(element).find('select#rptcoursename').change(getReportList);
      getCourses();
      serviceListeners(settings.courseService);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#home').parent().empty();
    }
  });


// TODO add listener in case some other process changes course participants
  function serviceListeners(service) {
    service
    .on('created', getReportList)
    .on('removed', getReportList)
    .on('patched', getReportList)
    .on('updated', getReportList)
  }

  function getCourses() {
    findAll(_this.settings.courseService, { $sort: { name: 1 } })
    .then(function (courses) {
      $(_this.settings.element).find('select#rptcoursename').html('<option value="">...</option>');
      courses.forEach(function (course) {
        $(_this.settings.element).find('select#rptcoursename').append('<option value="' + course.name + '">' + course.name + '</option>');
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function getReportList() {
    var courseName = $(_this.settings.element).find('select#rptcoursename').val();
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Failed to find course ' + courseName);
      }
      $('#reportlist').html('');
      $('#reportlist').append('<tr><th colspan="4">' + courseName + '</th></tr>');
      $('#reportlist').append('<tr><th>Name</th><th>Card</th><th>Start Time</th><th>End Time</th></tr>');
      result.data[0].participants.forEach(function (row) {
        $('#reportlist').append(
          '<tr><td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
          '<td>' + row.card.name + '</td>' +
          '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td>' +
          '<td>' + (row.endtime ? new Date(row.endtime).toLocaleTimeString() : 'Waiting') + '</td></tr>'
        );
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('home', Qbit);
})(jQuery);
