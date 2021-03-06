
(function ($) {
  var defaults = {};
  var _this;
  // Qbit constructor
  var Qbit = function (element, jqbit) {
    _this = this;
    // build settings from defaults and arguments passed to the jQuery qbit
    var settings = this.settings = $.extend({}, defaults, jqbit.args);
    settings.element = element;
    jqbit.loadCSS();
    // use jQuery qbit to load the Qbit HTML
    jqbit.loadHTML(function () {
      // actions to take after Qbit HTML is loaded
      jqbit.args.menu.forEach(function (menuItem) {
        var li = $('<li>').html(menuItem.label);
        li.data('menu', menuItem);
        if (menuItem.active) {
          li.addClass('active');
        }
        $(li).click(function () {
          $(element).find('ul.menu li.active').removeClass('active');
          $(this).addClass('active');
          jqbit.args.menuChanged($(this).data('menu'));
        });
        $(element).find('ul.menu').append(li);
      });
      if (jqbit.args.readyCallback) {
        jqbit.args.readyCallback();
      }
    });
  }

  // Qbit methods
  $.extend(Qbit.prototype, {
    // additional methods attached to new instances of this Qbit
    destroy: destroy,
    getActive: getActive,
    setActive: setActive
  });

  function destroy() {
    $(this.settings.element).empty();
  }

  function getActive() {
    var ae = $(this.settings.element).find('li.active')[0];
    if (ae) {
      return $(ae).data('menu');
    }
    return '';
  }

  function setActive(label) {
    $(this.settings.element).find('ul.menu li').each(function (i, e) {
      var menuItem = $(e).data('menu');
      if (menuItem && menuItem.label === label) {
        $(e).addClass('active');
        _this.settings.menuChanged(menuItem);
      }
    });
  }

  // add Qbit qbit plugin list
  $.fn.qbit.addQbitToList('menu', Qbit);
})(jQuery);
