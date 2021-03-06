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
      $(element).find('button#crcreate').click(cardAdminCreateCard);
      getCardList();
      serviceListeners(settings.cardService);
      settings.smartcardService.on('card_uid', cardAdminCardUID);
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#cardadmin').parent().empty();
      _this.settings.smartcardService.removeAllListeners('card_uid');
    },
    deleteCard: cardAdminDeleteCard
  });


  function cardAdminCardUID(uid) {
    $('input#cruid').val(uid);
  }

  function cardAdminCreateCard() {
    _this.settings.cardService.create({
      name: $('input#crname').val(),
      uid: $('input#cruid').val()
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  function cardAdminDeleteCard(name) {
    if (!name || !name.length) {
      showErrors(['Name required']);
      return;
    }
    _this.settings.cardService.remove(null, { query: { name: name } })
    .catch(function (err) { showErrors([err.message]); });
  }

  function serviceListeners(service) {
    service
    .on('created', getCardList)
    .on('removed', getCardList)
    .on('patched', getCardList)
    .on('updated', getCardList)
  }

  function getCardList() {
    findAll(_this.settings.cardService, { $sort: { name: 1 } })
    .then(function (docs) {
      $('#cardlist').html('');
      $('#cardlist').append('<tr><th>Name</th><th>UID</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(function (doc) {
        $('#cardlist').append(
          '<tr><td>' + doc.name + '</td>' +
          '<td>' + doc.uid + '</td>' +
          '<td><button onclick="$(this).qbit().getQbit().deleteCard(\'' + doc.name + '\');">Delete</button></td></tr>');
      })
    })
    .catch(function (err) { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('cardadmin', Qbit);
})(jQuery);
