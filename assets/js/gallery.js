window.Site = window.Site || {};

window.Site.gallery = (function () {
  'use strict';

  var U = window.Site.utils;
  var D = window.Site.data;
  var FALLBACK = 'assets/img/photos/placeholder.svg';
  var SWIPE_THRESHOLD = 48;

  var dialog = null;
  var stage = null;
  var image = null;
  var caption = null;
  var counter = null;
  var items = [];
  var index = 0;
  var pointerStart = null;

  function photos(key) {
    return D && Array.isArray(D[key]) ? D[key] : [];
  }

  function zoomIcon() {
    // o span e o que o CSS posiciona no canto; o svg sozinho ocuparia o card inteiro
    var badge = document.createElement('span');
    badge.className = 'photo__zoom';
    badge.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35M11 8v6M8 11h6');
    svg.appendChild(path);
    badge.appendChild(svg);
    return badge;
  }

  function card(photo, key, position) {
    var figure = U.el('figure', 'photo');
    var button = U.el('button', 'photo__btn');
    var img = U.el('img', 'photo__img');

    button.type = 'button';
    img.src = photo.src;
    img.alt = photo.alt || '';
    img.decoding = 'async';
    img.loading = 'lazy';
    if (photo.ratio) img.style.setProperty('--ratio', photo.ratio);
    U.guardImage(img, FALLBACK);

    button.appendChild(img);
    button.appendChild(zoomIcon());
    button.setAttribute('aria-label', 'Ampliar foto: ' + (photo.caption || photo.alt || 'foto ' + (position + 1)));
    button.addEventListener('click', function () { open(key, position, button); });

    figure.appendChild(button);

    if (photo.caption) {
      var figcaption = U.el('figcaption', 'photo__caption', { textContent: photo.caption });
      figure.appendChild(figcaption);
    }

    return figure;
  }

  function render(key, host) {
    if (!host) return [];
    var list = photos(key);
    host.textContent = '';
    list.forEach(function (photo, position) {
      host.appendChild(card(photo, key, position));
    });
    return list;
  }

  function mount() {
    if (dialog) return;
    dialog = U.qs('[data-lightbox]');
    if (!dialog) return;

    stage = U.qs('[data-lb-stage]', dialog);
    image = U.qs('[data-lb-img]', dialog);
    caption = U.qs('[data-lb-caption]', dialog);
    counter = U.qs('[data-lb-counter]', dialog);

    U.qs('[data-lb-close]', dialog).addEventListener('click', function () { dialog.close(); });
    U.qs('[data-lb-prev]', dialog).addEventListener('click', function () { step(-1); });
    U.qs('[data-lb-next]', dialog).addEventListener('click', function () { step(1); });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'Tab') {
        U.trapFocus(dialog, event);
      }
    });

    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var outside =
        event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });

    stage.addEventListener('pointerdown', function (event) {
      pointerStart = event.clientX;
    }, { passive: true });

    stage.addEventListener('pointerup', function (event) {
      if (pointerStart === null) return;
      var delta = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      step(delta < 0 ? 1 : -1);
    }, { passive: true });

    stage.addEventListener('pointercancel', function () { pointerStart = null; }, { passive: true });
  }

  function paint() {
    var photo = items[index];
    if (!photo) return;

    image.src = photo.src;
    image.alt = photo.alt || '';
    caption.textContent = photo.caption || '';
    counter.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
    U.guardImage(image, FALLBACK);

    var single = items.length < 2;
    U.qs('[data-lb-prev]', dialog).disabled = single;
    U.qs('[data-lb-next]', dialog).disabled = single;
  }

  function step(direction) {
    if (items.length < 2) return;
    index = (index + direction + items.length) % items.length;
    paint();
  }

  function open(key, position, trigger) {
    mount();
    if (!dialog) return;

    items = photos(key);
    if (!items.length) return;

    index = U.clamp(position, 0, items.length - 1);
    trigger = trigger || null;

    if (!dialog.open) {
      if (trigger) {
        dialog.__trigger = trigger;
      }
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    paint();
    var close = U.qs('[data-lb-close]', dialog);
    if (close) close.focus();
  }

  function close() {
    if (dialog && dialog.open) dialog.close();
  }

  return { render: render, open: open, close: close, mount: mount };
})();
