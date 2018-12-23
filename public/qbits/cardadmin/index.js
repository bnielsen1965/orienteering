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
    deleteCard: cardAdminDeleteCard,
    cardUID: cardAdminCardUID
  });


  function cardAdminCardUID(uid) {
    $('input#cruid').val(uid);
  }

  function cardAdminCreateCard() {
    _this.settings.createCard($('input#crname').val(), $('input#cruid').val());
  }

  function cardAdminDeleteCard(name) {
    _this.settings.deleteCard(name);
  }

  function serviceListeners(service) {
    service
    .on('created', getCardList)
    .on('removed', getCardList)
    .on('patched', getCardList)
    .on('updated', getCardList)
  }

  function getCardList() {
    _this.settings.getCardList()
    .then(docs => {
      $('#cardlist').html('');
      $('#cardlist').append('<tr><th>Name</th><th>UID</th><th></th></tr>');
      if (_this && _this.settings && _this.settings.element) {
    }
      docs.forEach(doc => {
        $('#cardlist').append(
          '<tr><td>' + doc.name + '</td>' +
          '<td>' + doc.uid + '</td>' +
          '<td><button onclick="$(this).qbit().getQbit().deleteCard(\'' + doc.name + '\');">Delete</button></td></tr>');
      })
    })
    .catch(err => { showErrors([err.message]); });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('cardadmin', Qbit);
})(jQuery);
