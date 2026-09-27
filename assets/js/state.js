window.Site = window.Site || {};

window.Site.state = (function () {
  'use strict';

  var KEY = 'site.state.v1';

  var defaults = {
    puzzleSolved: false,
    difficulty: null,
    musicOn: false
  };

  var memoryOnly = false;
  var values = Object.assign({}, defaults, read());

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      memoryOnly = true;
      return {};
    }
  }

  function write() {
    if (memoryOnly) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(values));
    } catch (error) {
      memoryOnly = true;
    }
  }

  return {
    get: function (key) {
      return values[key];
    },
    set: function (key, value) {
      values[key] = value;
      write();
    },
    snapshot: function () {
      return Object.assign({}, values);
    },
    reset: function () {
      values = Object.assign({}, defaults);
      write();
    }
  };
})();
