window.Site = window.Site || {};

window.Site.main = (function () {
  'use strict';

  var U = window.Site.utils;
  var S = window.Site;
  var FALLBACK_PHOTO = 'assets/img/photos/placeholder.svg';

  function data() {
    return S.data && typeof S.data === 'object' ? S.data : null;
  }

  function fillProfile() {
    var D = data();
    if (!D) return;

    var profile = D.profile || {};
    var hero = profile.hero || {};
    var sections = profile.sections || {};

    U.text('[data-brand-title]', profile.name || 'Para você');
    U.text('[data-hero="eyebrow"]', hero.eyebrow || '');
    U.text('[data-hero="title"]', hero.title || profile.name || '');
    U.text('[data-hero="lead"]', hero.lead || '');
    U.text('[data-footer-text]', profile.footer || '');

    Object.keys(sections).forEach(function (key) {
      U.text('[data-section-lead="' + key + '"]', sections[key] || '');
    });

    var badgeHost = U.qs('.hero__badges');
    if (badgeHost && Array.isArray(hero.badges)) {
      badgeHost.textContent = '';
      hero.badges.filter(Boolean).forEach(function (label) {
        badgeHost.appendChild(U.el('li', 'chip', { textContent: label }));
      });
    }

    var photo = hero.photo || {};
    var img = U.qs('[data-hero-photo]');
    if (img) {
      img.src = photo.src || FALLBACK_PHOTO;
      img.alt = photo.alt || '';
      U.guardImage(img, FALLBACK_PHOTO);
    }
    U.text('[data-hero-caption]', photo.caption || '');
  }

  function setupHeader() {
    var header = U.qs('[data-header]');
    if (!header) return;

    var pending = false;

    function update() {
      pending = false;
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function setupNav() {
    var links = U.qsa('.nav__link[data-nav]');
    var targets = links
      .map(function (link) { return document.getElementById(link.dataset.nav); })
      .filter(Boolean);

    if (!links.length || !targets.length) return;

    if (!('IntersectionObserver' in window)) {
      links[0].classList.add('is-active');
      return;
    }

    var ratios = new Map();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var bestId = null;
      var bestRatio = 0;
      ratios.forEach(function (ratio, id) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      links.forEach(function (link) {
        link.classList.toggle('is-active', bestRatio > 0 && link.dataset.nav === bestId);
      });
    }, { rootMargin: '-30% 0px -45% 0px', threshold: [0, 0.2, 0.5, 0.8, 1] });

    targets.forEach(function (target) { observer.observe(target); });
  }

  function setupMusic() {
    var D = data();
    var button = U.qs('[data-music]');
    if (!button || !D || !D.music) return;

    var audio = new Audio();
    audio.src = D.music;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.32;
    button.hidden = false;

    button.addEventListener('click', function () {
      if (audio.paused) {
        var attempt = audio.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            button.hidden = true;
            U.toast('Não consegui tocar o áudio. Confira o arquivo em assets/audio/.');
          });
        }
        button.setAttribute('aria-pressed', 'true');
        button.setAttribute('aria-label', 'Pausar música de fundo');
      } else {
        audio.pause();
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', 'Tocar música de fundo');
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && !audio.paused) audio.pause();
    });
  }

  function reportMissingData() {
    var main = U.qs('main');
    if (main) {
      var notice = U.el('p', 'noscript', {
        textContent: 'Não consegui carregar o conteúdo do site. O arquivo assets/js/data.js pode estar com erro de sintaxe.'
      });
      main.appendChild(notice);
    }
  }

  function boot() {
    if (!data()) {
      reportMissingData();
      return;
    }

    S.reveal = U.revealObserver();

    U.run('perfil', fillProfile);
    U.run('galeria', function () {
      S.gallery.render('photos', U.qs('[data-gallery="photos"]'));
      S.gallery.mount();
    });
    U.run('poemas', function () {
      S.poems.render(U.qs('[data-poems]'));
    });
    U.run('quebra-cabeça', function () {
      S.puzzle.init();
    });
    U.run('segredos', function () {
      S.secrets.init();
    });
    U.run('cabeçalho', setupHeader);
    U.run('navegação', setupNav);
    U.run('música', setupMusic);
    U.run('fundo', function () {
      S.heartstorm.ambient(U.qs('[data-ambient]'));
    });

    U.text('[data-year]', String(new Date().getFullYear()));
    S.reveal.observe(document);
  }

  U.onReady(boot);

  return { boot: boot };
})();
