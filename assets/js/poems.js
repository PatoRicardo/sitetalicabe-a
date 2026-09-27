window.Site = window.Site || {};

window.Site.poems = (function () {
  'use strict';

  var U = window.Site.utils;
  var D = window.Site.data;

  function render(host) {
    if (!host) return 0;
    var list = D && Array.isArray(D.poems) ? D.poems : [];
    host.textContent = '';

    list.forEach(function (poem) {
      var article = U.el('article', 'poem');

      var head = U.el('div', 'poem__head');
      var title = U.el('h3', 'poem__title', { textContent: poem.title || '' });
      head.appendChild(title);

      if (poem.date) {
        head.appendChild(U.el('p', 'poem__date', { textContent: poem.date }));
      }

      var body = U.el('p', 'poem__body', { textContent: poem.body || '' });
      article.appendChild(head);
      article.appendChild(body);

      if (poem.author) {
        article.appendChild(U.el('p', 'poem__author', { textContent: poem.author }));
      }

      host.appendChild(article);
    });

    return list.length;
  }

  return { render: render };
})();
