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

    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: function () {
      $('#home').parent().empty();
    }
  });

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('home', Qbit);
})(jQuery);
