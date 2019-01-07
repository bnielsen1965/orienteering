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
//      $(element).find('#printable').click(printableReport);
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
/*
  function printableReport() {
    var courseName = $(_this.settings.element).find('select#rptcoursename').val();
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Failed to find course ' + courseName);
      }
      let rows = result.data[0].participants.map(function (row) {
        row.duration = (row.starttime && row.endtime ? new Date(row.endtime).getTime() - new Date(row.starttime).getTime() : null);
        return row;
      });
      rows.sort(function (a, b) {
        if (a.duration === b.duration) {
          return 0;
        }
        if (a.duration === null) {
          return 1;
        }
        if (b.duration === null) {
          return -1;
        }
        return (a.duration > b.duration ? 1 : -1);
      });
      let html =
    	'<div class="container">' +
  		'<div id="main">' +
      '<div class="container">' +
      '<div class="left box">' +
      '<div class="row">' +
      '<table id="reportlist">' +
      '<tr><th class="title" colspan="6">' + courseName + '</th></tr>' +
      '<tr><th>Place</th><th>Name</th><th>Card</th><th>Start Time</th><th>End Time</th><th>Time</tr>';

      rows.forEach(function (row, ri) {
        let rowhtml = '<tr>' +
        '<td>' + (row.duration ? (ri + 1): '') + '</td>' +
        '<td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
        '<td>' + row.card.name + '</td>' +
        '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td>' +
        '<td>' + (row.endtime ? new Date(row.endtime).toLocaleTimeString() : 'Waiting') + '</td>' +
        '<td>' + (row.duration ? formatTime(row.duration) : '') + '</td>' +
        '</tr>';
        html += rowhtml;
      });

      html += '</table>' +
      '</div>' +
      '</div>' +
      '</div>' +
    	'</div>';

      var newWindow = window.open('http://localhost:3030/report.html?body=' + encodeURIComponent(html));
      if (!newWindow) {
        throw new Error('Failed to open new window. Blocked by browser?');
      }
      newWindow.document.body.innerHTML = html;
    })
    .catch(function (err) { showErrors([err.message]); });
  }
*/
  function getReportList() {
    var courseName = $(_this.settings.element).find('select#rptcoursename').val();
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Failed to find course ' + courseName);
      }
      let rows = result.data[0].participants.map(function (row) {
        row.duration = (row.starttime && row.endtime ? new Date(row.endtime).getTime() - new Date(row.starttime).getTime() : null);
        return row;
      });
      rows.sort(function (a, b) {
        if (a.duration === b.duration) {
          return 0;
        }
        if (a.duration === null) {
          return 1;
        }
        if (b.duration === null) {
          return -1;
        }
        return (a.duration > b.duration ? 1 : -1);
      });

      $('#reportlist').html('');
      $('#reportlist').append('<tr><th class="title" colspan="6">' + courseName + '</th></tr>');
      $('#reportlist').append('<tr><th>Place</th><th>Name</th><th>Card</th><th>Start Time</th><th>End Time</th><th>Time</tr>');

      $('#reportlist-description').html('<pre>' + result.data[0].description + '</pre>');
      $('#reportlist-printable').html('');
      $('#reportlist-printable').append('<tr><th class="title" colspan="6">' + courseName + '</th></tr>');
      $('#reportlist-printable').append('<tr><th>Place</th><th>Name</th><th>Start Time</th><th>End Time</th><th>Time</tr>');

      rows.forEach(function (row, ri) {
        $('#reportlist').append(
          '<tr>' +
          '<td>' + (row.duration ? (ri + 1): '') + '</td>' +
          '<td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
          '<td>' + row.card.name + '</td>' +
          '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td>' +
          '<td>' + (row.endtime ? new Date(row.endtime).toLocaleTimeString() : 'Waiting') + '</td>' +
          '<td>' + (row.duration ? formatTime(row.duration) : '') + '</td>' +
          '</tr>'
        );

        $('#reportlist-printable').append(
          '<tr>' +
          '<td>' + (row.duration ? (ri + 1): '') + '</td>' +
          '<td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
          '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td>' +
          '<td>' + (row.endtime ? new Date(row.endtime).toLocaleTimeString() : 'Waiting') + '</td>' +
          '<td>' + (row.duration ? formatTime(row.duration) : '') + '</td>' +
          '</tr>'
        );
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function formatTime(t) {
    let h = 0;
    let m = 0;
    let s = 0;
    h = Math.floor(t / (60 * 60 * 1000));
    if (h) {
      t = t % (h * 60 * 60 * 1000);
    }

    m = Math.floor(t / (60 * 1000));
    if (m) {
      t = t % (m * 60 * 1000);
    }
    s = Math.floor(t / 1000);
    if (s) {
      t = t % (s * 1000);
    }
    return zpad(h) + ':' + zpad(m) + ':' + zpad(s) + '.' + zpad(t, 3);
  }

  function zpad(n, z) {
    z = z || 2;
    let p = new Array(z + 1).join('0');
    let l = ('' + n).length;
    return p.slice(0, z - l) + n;
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('home', Qbit);
})(jQuery);
