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
      $(element).find('button#crcreate').click(courseAdminCreateCourse);
      getCourseList();
      serviceListeners(settings.courseService);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#courseadmin').parent().empty();
    },
    deleteCourse: courseAdminDeleteCourse
  });


  function courseAdminCreateCourse() {
    _this.settings.courseService.create({
      name: $('input#crname').val(),
      description: $('textarea#crdescription').val()
    })
    .catch(err => { showErrors([err.message]); });
  }

  function courseAdminDeleteCourse(name) {
    if (!name || !name.length) {
      showErrors(['Name required']);
      return;
    }
    _this.settings.courseService.remove(null, { query: { name: name } })
    .catch(err => { showErrors([err.message]); });
  }

  function serviceListeners(service) {
    service
    .on('created', getCourseList)
    .on('removed', getCourseList)
    .on('patched', getCourseList)
    .on('updated', getCourseList)
  }

  function getCourseList() {
    findAll(_this.settings.courseService, { $sort: { name: 1 } })
    .then(docs => {
      $('#courselist').html('');
      $('#courselist').append('<tr><th>Name</th><th>Description</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(doc => {
        $('#courselist').append(
          '<tr><td>' + doc.name + '</td>' +
          '<td>' + doc.description + '</td>' +
          '<td><button onclick="$(this).qbit().getQbit().deleteCourse(\'' + doc.name + '\');">Delete</button></td></tr>');
      })
    })
    .catch(err => { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('courseadmin', Qbit);
})(jQuery);
