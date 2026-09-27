window.Site = window.Site || {};

window.Site.heartstorm = (function () {
  'use strict';

  var U = window.Site.utils;
  var SYMBOLS = ['\u2665', '\u2764', '\u2666', '\u2605', '\u266A'];
  var MAX_PARTICLES = 44;
  var AMBIENT_COUNT = 12;

  function particle(character) {
    var node = U.el('span', 'heart-particle', { textContent: character });
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function burst(origin, count) {
    if (U.prefersReducedMotion()) return;

    var rect = origin && origin.getBoundingClientRect
      ? origin.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;
    var total = Math.min(count || 26, MAX_PARTICLES);
    var layer = U.el('div', 'heart-layer');
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    for (var i = 0; i < total; i++) {
      var angle = U.random(-Math.PI, Math.PI);
      var distance = U.random(70, 320);
      var size = U.random(0.85, 1.9);
      var node = particle(SYMBOLS[i % SYMBOLS.length]);

      node.style.fontSize = size + 'rem';
      node.style.translate = originX + 'px ' + originY + 'px';
      layer.appendChild(node);

      var animation = node.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 1, offset: 0.22 },
          { transform: 'translate(calc(-50% + ' + Math.cos(angle) * distance + 'px), calc(-50% + ' + Math.sin(angle) * distance + 'px + 90px)) scale(0.6)', opacity: 0 }
        ],
        {
          duration: U.random(1400, 2500),
          easing: 'cubic-bezier(0.18, 0.7, 0.35, 1)',
          delay: i * U.random(0, 130),
          fill: 'forwards'
        }
      );

      animation.onfinish = (function (node) {
        return function () { node.remove(); };
      })(node);
    }

    window.setTimeout(function () { layer.remove(); }, 4000);
  }

  function ambient(host) {
    if (!host || U.prefersReducedMotion()) return;
    if (host.childElementCount) return;

    for (var i = 0; i < AMBIENT_COUNT; i++) {
      var node = particle(SYMBOLS[i % SYMBOLS.length]);
      node.className = 'ambient__heart';
      node.style.left = U.random(0, 96) + 'vw';
      node.style.setProperty('--size', U.random(0.7, 1.5).toFixed(2) + 'rem');
      node.style.setProperty('--dur', U.random(19, 38).toFixed(1) + 's');
      node.style.setProperty('--delay', (-U.random(0, 30)).toFixed(1) + 's');
      node.style.setProperty('--drift', U.random(-5, 5).toFixed(1) + 'rem');
      node.style.setProperty('--spin', U.random(-260, 260).toFixed(0) + 'deg');
      host.appendChild(node);
    }
  }

  return { burst: burst, ambient: ambient };
})();
