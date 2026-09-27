window.Site = window.Site || {};

window.Site.utils = (function () {
  'use strict';

  var root = document.documentElement;
  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function el(tag, className, props) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (props) Object.keys(props).forEach(function (key) { node[key] = props[key]; });
    return node;
  }

  function text(selector, value, scope) {
    qsa(selector, scope).forEach(function (node) {
      if (value != null) node.textContent = value;
    });
    return value;
  }

  function setToggle(selector, value, scope) {
    qsa(selector, scope).forEach(function (node) {
      node.setAttribute('aria-pressed', value ? 'true' : 'false');
    });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function prefersReducedMotion() {
    return reducedQuery.matches;
  }

  function onReducedMotionChange(handler) {
    if (typeof reducedQuery.addEventListener === 'function') {
      reducedQuery.addEventListener('change', handler);
    } else if (typeof reducedQuery.addListener === 'function') {
      reducedQuery.addListener(handler);
    }
  }

  function once(node, type, handler, options) {
    function wrapped(event) {
      node.removeEventListener(type, wrapped, options);
      handler(event);
    }
    node.addEventListener(type, wrapped, options);
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Falha ao carregar a imagem: ' + src)); };
      img.src = src;
    });
  }

  function guardImage(img, fallbackSrc) {
    img.addEventListener('error', function () {
      if (img.dataset.fallbackApplied === 'true' || img.src.endsWith(fallbackSrc)) return;
      img.dataset.fallbackApplied = 'true';
      img.src = fallbackSrc;
    });
  }

  var toastHost = null;

  function toast(message, duration) {
    if (!toastHost) {
      toastHost = qs('[data-toasts]');
      if (!toastHost) return;
    }
    var node = el('p', 'toast', { textContent: message, role: 'status' });
    toastHost.appendChild(node);
    var life = duration || 3600;
    window.setTimeout(function () {
      node.classList.add('is-leaving');
      window.setTimeout(function () { node.remove(); }, 450);
    }, life);
  }

  function revealObserver() {
    if (!('IntersectionObserver' in window)) {
      qsa('[data-reveal]').forEach(function (node) { node.classList.add('is-visible'); });
      return { observe: function () {}, disconnect: function () {} };
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    function observe(scope) {
      qsa('[data-reveal]', scope).forEach(function (node) {
        if (node.classList.contains('is-visible')) return;
        observer.observe(node);
      });
    }

    return { observe: observe, disconnect: function () { observer.disconnect(); } };
  }

  function setRevealDelay(node, milliseconds) {
    node.style.setProperty('--reveal-delay', milliseconds + 'ms');
  }

  function focusables(scope) {
    return qsa(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      scope
    ).filter(function (node) {
      return node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement;
    });
  }

  function trapFocus(container, event) {
    var items = focusables(container);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function run(label, task) {
    try {
      task();
    } catch (error) {
      if (window.console && window.console.error) {
        window.console.error('[site] falha em ' + label + ':', error);
      }
    }
  }

  function onReady(task) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', task, { once: true });
    } else {
      task();
    }
  }

  root.classList.add('js');

  return {
    qs: qs,
    qsa: qsa,
    el: el,
    text: text,
    setToggle: setToggle,
    clamp: clamp,
    shuffle: shuffle,
    random: random,
    prefersReducedMotion: prefersReducedMotion,
    onReducedMotionChange: onReducedMotionChange,
    once: once,
    loadImage: loadImage,
    guardImage: guardImage,
    toast: toast,
    revealObserver: revealObserver,
    setRevealDelay: setRevealDelay,
    focusables: focusables,
    trapFocus: trapFocus,
    run: run,
    onReady: onReady,
    root: root
  };
})();
