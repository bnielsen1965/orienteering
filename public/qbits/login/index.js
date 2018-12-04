// example Qbit
(function ($) {
  var defaults = {};

  // Qbit constructor
  var Qbit = function (element, jqbit) {
    // build settings from defaults and arguments passed to the jQuery qbit
    var settings = this.settings = $.extend({}, defaults, jqbit.args);
    // use jQuery qbit to load the Qbit HTML
    jqbit.loadHTML(function () {
      // actions to take after Qbit HTML is loaded
      $('button#login').click(function () {
        jqbit.args.authenticate($('input#username').val(), $('input#password').val());
      });
      $('#loginform, .input').keypress(function (e) {
        if (e.which === 13 && $('input#username').val().length && $('input#password').val().length) {
          jqbit.args.authenticate($('input#username').val(), $('input#password').val());
          return false;
        }
      });
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#login').parent().empty();
    }
  });

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('login', Qbit);
})(jQuery);
