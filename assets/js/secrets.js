window.Site = window.Site || {};

window.Site.secrets = (function () {
  'use strict';

  var U = window.Site.utils;
  var S = window.Site;
  var config = (S.data && S.data.secrets) || {};

  var section = null;
  var lockNode = null;
  var contentNode = null;
  var envelopeHost = null;
  var letterDialog = null;
  var navLink = null;
  var celebrated = false;
  var applied = false;
  var unlocked = false;

  function letters() {
    return Array.isArray(config.letters) ? config.letters : [];
  }

  function fillLetter(letter, trigger) {
    if (!letterDialog) return;

    U.text('[data-letter-title]', letter.title || '', letterDialog);
    U.text('[data-letter-meta]', letter.meta || '', letterDialog);
    U.text('[data-letter-sign]', letter.sign || '', letterDialog);

    var bodyHost = U.qs('[data-letter-body]', letterDialog);
    if (bodyHost) {
      bodyHost.textContent = '';
      String(letter.body || '')
        .split(/\n{2,}/)
        .forEach(function (chunk) {
          bodyHost.appendChild(U.el('p', null, { textContent: chunk }));
        });
    }

    if (!letterDialog.open) {
      letterDialog.__trigger = trigger || null;
      if (typeof letterDialog.showModal === 'function') {
        letterDialog.showModal();
      } else {
        letterDialog.setAttribute('open', '');
      }
    }

    var close = U.qs('[data-letter-close]', letterDialog);
    if (close) close.focus();
  }

  function buildEnvelopes() {
    if (!envelopeHost) return;
    envelopeHost.textContent = '';

    letters().forEach(function (letter, index) {
      var button = U.el('button', 'envelope');
      button.type = 'button';
      button.appendChild(U.el('span', 'envelope__flap', { textContent: '\u2709' }));
      button.appendChild(U.el('span', 'envelope__title', { textContent: letter.title || 'Carta ' + (index + 1) }));
      button.appendChild(U.el('span', 'envelope__cta', { textContent: 'abrir' }));
      button.setAttribute('aria-label', 'Abrir a carta: ' + (letter.title || 'carta ' + (index + 1)));
      U.setRevealDelay(button, index * 140);
      button.addEventListener('click', function () { fillLetter(letter, button); });
      envelopeHost.appendChild(button);
    });
  }

  function buildHiddenGallery() {
    var host = U.qs('[data-gallery="hiddenPhotos"]');
    if (!host || host.dataset.rendered === 'true') return;
    S.gallery.render('hiddenPhotos', host);
    host.dataset.rendered = 'true';
  }

  function buildFinale() {
    var finale = config.finale || {};
    U.text('[data-finale]', finale.text || '', section);
    U.text('[data-finale-sign]', finale.sign || '', section);
  }

  function updateNav(isUnlocked, animate) {
    if (!navLink) return;
    navLink.dataset.locked = isUnlocked ? 'false' : 'true';
    navLink.setAttribute('aria-label', isUnlocked ? 'Segredos, liberado' : 'Segredos, bloqueado');

    if (!animate || !isUnlocked) return;

    navLink.classList.add('is-unlocked');
    U.once(navLink, 'animationend', function () {
      navLink.classList.remove('is-unlocked');
    });
  }

  function celebrate() {
    if (celebrated || !section) return;
    celebrated = true;
    S.heartstorm.burst(section, 22);
  }

  function watchForCelebration() {
    if (!section || !('IntersectionObserver' in window)) {
      celebrate();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        celebrate();
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  }

  function reveal(animate) {
    if (lockNode) lockNode.hidden = true;
    if (contentNode) contentNode.hidden = false;

    buildEnvelopes();
    buildHiddenGallery();
    buildFinale();

    if (S.reveal) S.reveal.observe(contentNode);
    if (animate) watchForCelebration();
  }

  function lock() {
    if (lockNode) lockNode.hidden = false;
    if (contentNode) contentNode.hidden = true;
    if (letterDialog && letterDialog.open) letterDialog.close();
  }

  function apply(animate) {
    var isUnlocked = !!S.state.get('puzzleSolved');
    if (applied && isUnlocked === unlocked) return;

    applied = true;
    unlocked = isUnlocked;

    if (section) section.dataset.state = isUnlocked ? 'open' : 'locked';
    updateNav(isUnlocked, animate);

    if (isUnlocked) reveal(animate);
    else lock();
  }

  function init() {
    section = U.qs('[data-secrets]');
    if (!section) return;

    lockNode = U.qs('[data-lock]', section);
    contentNode = U.qs('[data-secrets-content]', section);
    envelopeHost = U.qs('[data-envelopes]', section);
    letterDialog = U.qs('[data-letter-dialog]');
    navLink = U.qs('[data-nav="segredos"]');

    if (letterDialog) {
      U.qs('[data-letter-close]', letterDialog).addEventListener('click', function () {
        letterDialog.close();
      });
      letterDialog.addEventListener('keydown', function (event) {
        if (event.key === 'Tab') U.trapFocus(letterDialog, event);
      });
      letterDialog.addEventListener('click', function (event) {
        if (event.target !== letterDialog) return;
        letterDialog.close();
      });
    }

    document.addEventListener('site:unlock', function () {
      apply(true);
    });

    apply(false);
  }

  return { init: init, apply: apply, isUnlocked: function () { return unlocked; } };
})();
