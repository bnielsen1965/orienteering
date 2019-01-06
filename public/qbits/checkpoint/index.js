// example Qbit
(function ($) {
  var defaults = {
    minimumCourseMinutes: 5
  };
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
      getCheckpointList();
      _this.settings.updateCourseStatus = setInterval(function () { updateCourseStatus(_this); }, 1000);
      serviceListeners(settings.courseService);
      settings.smartcardService.on('card_uid', checkpointCardUID);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      clearInterval(_this.settings.updateCourseStatus);
      $('#checkpoint').parent().empty();
      _this.settings.courseService.removeAllListeners('created');
      _this.settings.courseService.removeAllListeners('removed');
      _this.settings.courseService.removeAllListeners('patched');
      _this.settings.courseService.removeAllListeners('updated');
      _this.settings.smartcardService.removeAllListeners('card_uid');
    }
  });


  function checkpointCardUID(uid) {
    let course;
    showErrors([]);
    getParticipantCourse(uid)
    .then(function (c) {
      course = c;
      let participant = course.participants.reduce(function (f, p) {
        return p.card.uid === uid ? p : f;
      }, null);
      if (!participant.starttime) {
        return setParticipantStarttime(course, uid);
      }
      else if (!participant.endtime) {
        return setParticipantEndTime(course, uid);
      }
    })
    .then(function () {
      updateCourseLastCheck(course, uid);
      chime(_this.settings.chimeSuccess);
    })
    .catch(function (err) {
      showErrors([err.message]);
      chime(_this.settings.chimeFail);
    });
  }

  async function getParticipantCourse(uid) {
    var result = await _this.settings.courseService.find({ query: {
      participants: {
        $elemMatch: {
          "card.uid": uid,
          $or: [
            { "starttime": { $exists: false } },
            { "endtime" : { $exists: false } }
          ]
        }
      }
    } });
    if (!result.total) {
      throw new Error('Card not active in a course.');
    }
    return result.data[0];
  }

  async function setParticipantEndTime(course, uid) {
    // find the array index for the participant
    var pi = course.participants.reduce(function (acc, row, rowi) {
      return (row.card.uid === uid ? rowi : acc);
    }, -1);
    // check that end is not too soon
    let starttime = new Date(course.participants[pi].starttime || 0);
    if (Date.now() - starttime.getTime() < _this.settings.minimumCourseMinutes * 60 * 1000) {
      throw new Error('Course end too soon, minimum run time is ' + _this.settings.minimumCourseMinutes + ' minutes.');
    }
    // build query and set objects
    var query = {
      _id: course._id.toString()
    };
    query['participants.' + pi + '.card.uid'] = uid;
    var endtime = new Date();
    course.participants[pi].endtime = endtime;
    var set = {};
    set['participants.' + pi + '.endtime'] = endtime;
    // try patching
    var docs = await _this.settings.courseService.patch(
      null,
      { $set: set },
      { query: query }
    );
    if (!docs.length) {
      throw new Error('Check in failed on course ' + course.name + '.');
    }
    return;
  }

  async function setParticipantStarttime(course, uid) {
    // find the array index for the participant
    var pi = course.participants.reduce(function (acc, row, rowi) {
      return (row.card.uid === uid ? rowi : acc);
    }, -1);
    // check that next check out is ready
    let laststarttime = new Date(course.laststarttime || 0);
    if (Date.now() - laststarttime.getTime() < course.delay * 60 * 1000) {
      throw new Error('Wait until course ' + course.name + ' is ready.');
    }
    // build query and set objects
    var query = {
      _id: course._id.toString()
    };
    query['participants.' + pi + '.card.uid'] = uid;
    var starttime = new Date();
    course.participants[pi].starttime = starttime;
    var set = { laststarttime: starttime };
    set['participants.' + pi + '.starttime'] = starttime;
    // try patching
    var docs = await _this.settings.courseService.patch(
      null,
      { $set: set },
      { query: query }
    );
    if (!docs.length) {
      throw new Error('Check out failed on course ' + course.name + '.');
    }
    return;
  }

  function chime(url) {
    $('#chime').remove();
    var audio = $('<audio id="chime" src="' + url + '">');
    $(_this.settings.element).append(audio);
    $('#chime')[0].oncanplay = function () { this.play(); };
  }

// TODO add listener in case some other process changes course participants
  function serviceListeners(service) {
    service
    .on('created', updateCheckpointCourse)
    .on('removed', updateCheckpointCourse)
    .on('patched', updateCheckpointCourse)
    .on('updated', updateCheckpointCourse)
  }

  function updateCheckpointCourse(course) {
    $(_this.settings.element).find('#checkpointlist > #' + course._id.toString()).data('course', course);
  }

  function updateCourseLastCheck(course, uid) {
    let participant = course.participants.reduce(function (f, p) {
      return p.card.uid === uid ? p : f;
    }, null);
    let lastcheck = participant.participant.lastname + ', ' + participant.participant.firstname;
    lastcheck += ' :: ' + (!participant.endtime ? 'Check Out' : 'Check In');
    lastcheck += ' :: ' + (!participant.endtime ? new Date(participant.starttime).toLocaleTimeString() : new Date(participant.endtime).toLocaleTimeString());
    $(_this.settings.element).find('#checkpointlist > #' + course._id.toString()).find('.lastcheck').html(lastcheck);
  }

  function getCheckpointList() {
    findAll(_this.settings.courseService, { $sort: { name: 1 } })
    .then(function (courses) {
      $('#checkpointlist').html('');
      courses.forEach(function (course) {
        let row = $('<div>').addClass('row box courserow').prop('id', course._id.toString());
        row.data('course', course);
        row.html(
          '<div class="row"><div class="left">Course:&nbsp;</div>' +
          '<div class="left coursename">' + course.name + ' ::&nbsp</div><div class="left coursestate"></div>' +
          '</div>' +
          '<div class="row">' +
          '<div class="left">Last Check:&nbsp;</div>' +
          '<div class="left lastcheck"></div>' +
          '</div>'
        );
        $('#checkpointlist').append(row);
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function updateCourseStatus() {
    $(_this.settings.element).find('.courserow').each(function () { updateCountdown(this); });
  }

  function updateCountdown(courserow) {
    let course = $(courserow).data('course');
    let laststarttime = new Date(course.laststarttime || 0);
    if (Date.now() - laststarttime.getTime() < course.delay * 60 * 1000) {
      nextDelayed(courserow, course.laststarttime, (course.delay * 60 * 1000) - (Date.now() - laststarttime.getTime()));
    }
    else {
      nextReady(courserow);
    }
  }

  function nextDelayed(courserow, laststarttime, delay) {
    var min = Math.floor(delay / 60000);
    var sec = Math.floor(delay % 60000 / 1000);
    $(courserow).find('.coursestate')
    .html((min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec)
    .removeClass('ready')
    .addClass('delay');
  }

  function nextReady(courserow) {
    $(courserow).find('.coursestate')
    .html('Ready')
    .removeClass('delay')
    .addClass('ready');
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('checkpoint', Qbit);
})(jQuery);
