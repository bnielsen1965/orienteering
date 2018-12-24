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
      $(element).find('button#crcreate').click(createCourse);
      getCourseList();
      serviceListeners(settings.courseService);
      settings.smartcardService.on('card_uid', courseCardUID);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#courseadmin').parent().empty();
      _this.settings.smartcardService.removeAllListeners('card_uid');
    },
    deleteCourse: deleteCourse,
    courseParticipants: courseParticipants,
    addParticipant: addParticipant,
    removeParticipant: removeParticipant
  });


  function createCourse() {
    _this.settings.courseService.create({
      name: $('input#crname').val(),
      description: $('textarea#crdescription').val(),
      participants: []
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function deleteCourse(name) {
    if (!name || !name.length) {
      showErrors(['Name required']);
      return;
    }
    _this.settings.courseService.remove(null, { query: { name: name } })
    .catch(function (err) { showErrors([err.message]); });
  }

  function courseCardUID(uid) {
    $(_this.settings.element).find('select#addcard').val(uid);
  }

  function courseParticipants(name) {
    $('#courseparticipants').html(
      '<div class="row center" id="coursename">' + name + '</div>' +
      '<div class="row" id="participantform">...</div>' +
      '<div class="row" id="participants">...</div>'
    );

    var participants, cards;
    findAll(_this.settings.participantService, { $sort: { lastname: 1, firstname: 1 } })
    .then(function (result) {
      participants = result;
      return findAll(_this.settings.cardService, { $sort: { name: 1 } });
    })
    .then(function (result) {
      cards = result;
      var formHTML = '<label>Participant </label><select id="addparticipant"><option value="">...</option>';
      participants.forEach(function (participant) {
        formHTML += '<option value="' + participant._id.toString() + '">' + participant.lastname + ', ' + participant.firstname + '</option>';
      });
      formHTML += '</select><br>';

      formHTML += '<label>Card </label><select id="addcard"><option value="">...</option>';
      cards.forEach(function (card) {
        formHTML += '<option value="' + card.uid + '">' + card.name + '</option>';
      });
      formHTML += '</select><br>';

      formHTML += '<label> </label><button id="addtocourse" onclick="$(this).qbit().getQbit().addParticipant();">Add</button><br>';

      $('#participantform').html(formHTML);

      return _this.settings.courseService.find({ query: { name: name } });
    })
    .then(function (result) {
      if (result.data.length) {
        if (result.data[0].participants.length) {
          showParticipantList(result.data[0].participants);
        }
        else {
          $(_this.settings.element).find('#participants').html('No participants.');
        }
      }
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function showParticipantList(participants) {
    $('#participants').html('<table id="courseparticipantslist">');
    $('#courseparticipantslist').append('<tr><th>Name</th><th>Card</th><th></th></tr>');
    participants.forEach(function (row) {
      $('#courseparticipantslist').append(
        '<tr><td>' + row.participant.lastname + ', ' + row.participant.firstname + '</td>' +
        '<td>' + row.card.name + '</td>' +
        '<td>' +
        '<button onclick="$(this).qbit().getQbit().removeParticipant(\'' + row.participant._id.toString() + '\');">Remove</button>' +
        '</td></tr>'
      );
    });
    $('#courseparticipantslist').append('</table>');
  }

  function addParticipant() {
    var participantID = $(_this.settings.element).find('select#addparticipant').val();
    var cardUID = $(_this.settings.element).find('select#addcard').val();
    var courseName = $(_this.settings.element).find('#coursename').text();
    if (!participantID.length || !cardUID.length) {
      showErrors(['Must select participant and card.']);
      return;
    }
    var addParticipant = {};
    _this.settings.participantService.get(participantID)
    .then(function (doc) {
      addParticipant.participant = doc;
      return _this.settings.cardService.find({ query: { uid: cardUID } });
    })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Card not found. ' + cardUID);
      }
      addParticipant.card = result.data[0];
      return _this.settings.courseService.find({ query: { name: courseName } });
    })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Course not found. ' + courseName);
      }
      if (result.data[0].participants.reduce(function (acc, row) { return row.card.uid === cardUID ? true : acc; }, false)) {
        throw new Error('Participant with that card already in list.');
      }
      if (result.data[0].participants.reduce(function (acc, row) { return row.participant._id.toString() === participantID ? true : acc; }, false)) {
        throw new Error('Participant already in list.');
      }
      return _this.settings.courseService.patch(result.data[0]._id.toString(), { $addToSet: { participants: addParticipant } });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function removeParticipant(participantID) {
    var courseName = $(_this.settings.element).find('#coursename').text();
    _this.settings.courseService.find({ query: { name: courseName } })
    .then(function (result) {
      if (!result.data.length) {
        throw new Error('Course not found. ' + courseName);
      }
      var row = result.data[0].participants.reduce(function (acc, row) {
        return row.participant._id === participantID ? row : acc;
      }, null);
      return _this.settings.courseService.patch(result.data[0]._id.toString(), { $pull: { participants: row } });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function serviceListeners(service) {
    service
    .on('created', getCourseList)
    .on('removed', getCourseList)
    .on('patched', getCourseList)
    .on('updated', getCourseList)
  }

  function getCourseList() {
    var courseName = $(_this.settings.element).find('#coursename').text();
    findAll(_this.settings.courseService, { $sort: { name: 1 } })
    .then(function (docs) {
      $('#courselist').html('');
      $('#courselist').append('<tr><th>Name</th><th>Description</th><th></th></tr>');
      docs.forEach(function (doc) {
        $('#courselist').append(
          '<tr><td>' + doc.name + '</td>' +
          '<td>' + doc.description + '</td>' +
          '<td>' +
          '<button onclick="$(this).qbit().getQbit().deleteCourse(\'' + doc.name + '\');">Delete</button>' +
          '<button onclick="$(this).qbit().getQbit().courseParticipants(\'' + doc.name + '\');">Participants</button>' +
          '</td></tr>'
        );
        if (doc.name === courseName) {
          showParticipantList(doc.participants);
        }
      });
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('courseadmin', Qbit);
})(jQuery);
