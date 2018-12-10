/*
* Copyright (C) 2018 Bryan Nielsen - All Rights Reserved
*
* Author: Bryan Nielsen <bnielsen1965@gmail.com>
*
*
* This file is part of the qbit jQuery plugin.
* qbit is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* qbit is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this application.  If not, see <http://www.gnu.org/licenses/>.
*/
;
(function ($, window, document, undefined) {
  "use strict";


  // Create the defaults once
  var pluginName = "qbit";
  var pluginDataName = "plugin_" + pluginName;
  var defaults = {
    path: 'qbits/'
  };

  var qbits = {};
  var queue = [];
  var queueRunning = false;

  // The plugin constructor
  function Plugin(element, options, comArgs) {
    options = options || {};
    if (typeof options === 'string' || options instanceof String) {
      options = { qbit: options };
    }
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.args = comArgs; // qbit arguments
    this.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    // Initialize this instance of the plugin.
    init: function () {

    },

    // destroy the qbit for ths plugin instance
    destroy: function () {
      var qbit = this.getQbit();
      if (qbit && qbit.destroy) {
        qbit.destroy();
      }
      qbit = null;
      // remove the qbit from the element
      $.removeData(this.element, "qbit_" + this.settings.qbit);
    },

    // get the qbit instance for this plugin instance
    getQbit: function () {
      var data = $(this.element).data();
      if (!data) {
        return null;
      }
      var keys = Object.keys(data);
      for (var ki = 0; ki < keys.length; ki++) {
        if (/^qbit_.+/.test(keys[ki])) {
          return data[keys[ki]];
        }
      }
      return null;
    },

    getQbitPath: function () {
      return this.settings.path;
    },

    // load qbit file into plugin
    loadQbit: function (name) {
      if (qbits[name] === false) {
        // already in loading process
        return;
      }
      qbits[name] = false; // prevent additional loads
      $.getScript(this.getQbitPath().replace(/\/$/, '') + '/' + name + '/index.js', function() {
  			// load complete
  		})
  		.fail(function (jqxhr, settings, exception) {
  			console.log('Error loading qbit ' + name + ', ' + exception);
  		});
    },

    // queue a qbit for execution
    queueQbit: function (name, element) {
      queue.push({ name: name, element: element });
      this.startQueue();
    },

    // start queue processing qbits
    startQueue: function () {
      if (queueRunning) {
        return;
      }
      this.runQueue();
    },

    // process the queue qbits
    runQueue: function () {
      var _this = this;
      queueRunning = true;
      var doneList = [];
      // process each queued qbit
      queue.forEach(function (c, i) {
        // check to see if qbit is loaded
        if (qbits[c.name]) {
          // qbit ready to run
          doneList.push(i);
          // get a reference to the jquery qbit plugin instance
          var jqbit = $.data(c.element, pluginDataName);
          // add qbit to element and call constructor with element and jquery qbits instance
          $.data(c.element, "qbit_" + c.name, new qbits[c.name](c.element, jqbit));
        }
      });
      // filter out queued qbits that are done
      queue = queue.filter(function (c, i) {
        return -1 === doneList.indexOf(i);
      });
      if (queue.length) {
        // continue if qbits waiting in queue
        setTimeout(function () { _this.runQueue(); }, 50);
      }
      else {
        queueRunning = false;
      }
    },

    // load the HTML file associated with the qbit
    loadHTML: function (callback) {
      $(this.element).load(this.getQbitPath().replace(/\/$/, '') + '/' + this.settings.qbit + '/index.html' , function() {
        if (callback) {
          callback();
        }
      });
    },

    loadCSS: function () {
      $('head').append('<link rel="stylesheet" type="text/css" href="' + this.getQbitPath().replace(/\/$/, '') + '/' + this.settings.qbit + '/index.css?_=' + Date.now() + '" />');
    }
  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  function PluginWrapper(options, comArgs) {
    if (this.length === 1 && !options && !comArgs) {
      // requested the plugin instance for this element
      return $(this).data(pluginDataName);
    }
    else {
      return this.each(function () {
        // if element already has a qbit then destroy
        var oldPlugin = $.data(this, pluginDataName);
        if (oldPlugin) {
          oldPlugin.destroy();
          $.removeData(this, pluginDataName);
        }

        // add jquery qbit plugin instance to element
        var newPlugin = new Plugin(this, options, comArgs);
        $.data(this, pluginDataName, newPlugin);
        newPlugin.queueQbit(newPlugin.settings.qbit, newPlugin.element);
        newPlugin.loadQbit(newPlugin.settings.qbit);
      });
    }
  }

  // extend wrapper methods
  $.extend(PluginWrapper, {
    // method called by compnents after they load to add them to plugin's list of qbits
    addQbitToList: function (name, qbit) {
      if (qbits[name]) {
        console.warn('Qbit "' + name + '" already loaded, overwrite prevented.');
        return;
      }
      else {
        qbits[name] = qbit;
      }
    }

  });

  $.fn[pluginName] = PluginWrapper;

})(jQuery, window, document);
