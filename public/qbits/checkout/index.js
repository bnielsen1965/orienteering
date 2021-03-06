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
      $(element).find('select#selcoursename').change(function () {
        showErrors([]);
        getCheckoutList();
      });
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
    }
  });


  function chime(url) {
    $('#chime').remove();
    var audio = $('<audio id="chime" src="' + url + '">');
    $(_this.settings.element).append(audio);
    $('#chime')[0].oncanplay = function () { this.play(); };
  }

  async function getParticipantCourse(uid) {
    var courseName = $(_this.settings.element).find('select#selcoursename').val();
    if (!courseName.length) {
      throw new Error('Select a course.');
    }
    var result = await _this.settings.courseService.find({
      query: {
        name: courseName,
        participants: {
          $elemMatch: { "card.uid": uid, "starttime": { $exists: false } }
        }
      }
    });
    if (!result.data.length) {
      throw new Error('Check out failed. Already checked out or not participating in course.');
    }
    return result.data[0];
  }

  async function setParticipantStarttime(course, uid) {
    // find the array index for the participant
    var pi = course.participants.reduce(function (acc, row, rowi) {
      return (row.card.uid === uid ? rowi : acc);
    }, -1);
    // build query and set objects
    var query = {
      _id: course._id.toString()
    };
    query['participants.' + pi + '.card.uid'] = uid;
    var starttime = new Date();
    var set = { laststarttime: starttime };
    set['participants.' + pi + '.starttime'] = starttime;
    // try patching
    var docs = await _this.settings.courseService.patch(
      null,
      { $set: set },
      { query: query }
    );
    if (!docs.length) {
      throw new Error('Check out failed.');
    }
    return docs[0];
  }

  function checkoutCardUID(uid) {
    showErrors([]);
    var d = $(_this.settings.element).find('#nextdelay').data('delay');
    if (d) {
      showErrors(['Wait until ready.']);
      chime(_this.settings.chimeFail);
      return;
    }
    getParticipantCourse(uid)
    .then(function (course) {
      return setParticipantStarttime(course, uid);
    })
    .then(function (doc) {
      if (!doc) {
        throw new Error('Check out failed.');
      }
      var row = doc.participants.reduce(function (acc, row) {
        return row.card.uid === uid ? row : acc;
      }, null);
      var co = new Date(row.starttime);
      $('#currentcheckout').html(row.participant.lastname + ', ' + row.participant.firstname + ' :: ' + co.toLocaleTimeString());
      chime(_this.settings.chimeSuccess);
    })
    .catch(function (err) {
      showErrors([err.message]);
      chime(_this.settings.chimeFail);
    });
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
    findAll(_this.settings.courseService, { $sort: { name: 1 } })
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
      $('#checkoutlist').append('<tr><th class="title" colspan="3">' + courseName + '</th></tr>');
      $('#checkoutlist').append('<tr><th>Name</th><th>Card</th><th>Start Time</th></tr>');
      result.data[0].participants.forEach(function (row) {
        $('#checkoutlist').append(
          '<tr><td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
          '<td>' + row.card.name + '</td>' +
          '<td>' + (row.starttime ? new Date(row.starttime).toLocaleTimeString() : 'Waiting') + '</td></tr>');
      });
      setCountdown(result.data[0].laststarttime, result.data[0].delay);
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function setCountdown(starttime, delay) {
    starttime = new Date(starttime || 0);
    if (Date.now() - starttime.getTime() < delay * 60 * 1000) {
      nextDelayed(starttime, delay);
    }
    else {
      nextReady();
    }
  }

  function nextDelayed(starttime, delay) {
    $(_this.settings.element).find('#nextdelay')
    .html('')
    .removeClass('ready')
    .addClass('delay')
    .data('delay', (delay * 60 * 1000) - (Date.now() - starttime.getTime()));
    countDown();
  }

  function nextReady() {
    $(_this.settings.element).find('#nextdelay')
    .html('Ready')
    .removeClass('delay')
    .addClass('ready')
    .data('delay', 0);
  }

  function countDown() {
    var cd = $(_this.settings.element).find('#nextdelay').data('delay');
    var min = Math.floor(cd / 60000);
    var sec = Math.floor(cd % 60000 / 1000);
    $(_this.settings.element).find('#nextdelay').html((min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec);
    setTimeout(function () {
      cd -= 1000;
      $(_this.settings.element).find('#nextdelay').data('delay', cd);
      if (cd > 0) {
        countDown();
      }
      else {
        nextReady();
      }
    }, 1000);
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('checkout', Qbit);
})(jQuery);
