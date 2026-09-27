window.Site = window.Site || {};

window.Site.puzzle = (function () {
  'use strict';

  var U = window.Site.utils;
  var S = window.Site;
  var config = (S.data && S.data.puzzle) || {};
  var words = config.status || {};
  var MAX_DIFFICULTY = 4;
  var DRAG_THRESHOLD = 5;
  var HINT_CLEANUP = 3200;

  var host = null;
  var board = null;
  var loading = null;
  var statusNode = null;
  var progress = null;
  var barNode = null;
  var valueNode = null;
  var totalNode = null;
  var hintButton = null;
  var hintsLeftNode = null;
  var shuffleButton = null;
  var difficultyGroup = null;
  var controls = null;
  var winPanel = null;

  var cells = [];
  var layout = [];
  var slots = [];
  var size = 3;
  var selected = -1;
  var hintsLeft = 3;
  var solved = false;
  var locked = false;
  var ready = false;
  var gesture = null;
  var ghost = null;
  var dropTarget = -1;
  var pointerConsumed = false;

  function setStatus(message) {
    if (statusNode && message) statusNode.textContent = message;
  }

  function normalizeSize(value) {
    return U.clamp(parseInt(value, 10) || config.defaultSize || 3, 2, MAX_DIFFICULTY);
  }

  function correctCount() {
    var total = 0;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i] === i) total++;
    }
    return total;
  }

  function isSolved() {
    return correctCount() === slots.length;
  }

  function pieceFor(pieceIndex) {
    var col = pieceIndex % size;
    var row = Math.floor(pieceIndex / size);
    return { index: pieceIndex, col: col, row: row };
  }

  function slotLabel(slot, pieceIndex) {
    var col = (pieceIndex % size) + 1;
    var row = Math.floor(pieceIndex / size) + 1;
    var place = 'linha ' + row + ', coluna ' + col;
    return 'Peça da ' + place + (pieceIndex === slot ? ', no lugar certo' : ', fora do lugar');
  }

  function buildLayer(photo) {
    var layer = U.el('span', 'piece__layer');
    layer.style.backgroundImage = 'url("' + photo.src + '")';
    return layer;
  }

  function buildCell(slot) {
    var cell = U.el('button', 'piece');
    cell.type = 'button';
    cell.dataset.slot = String(slot);
    cell.appendChild(buildLayer(config.photo || {}));
    cell.appendChild(U.el('span', 'piece__mark', { textContent: '\u2665' }));
    cell.addEventListener('keydown', onCellKey);
    return cell;
  }

  function paint(slot) {
    var cell = cells[slot];
    if (!cell) return;
    var pieceIndex = slots[slot];
    var piece = pieceFor(pieceIndex);
    var correct = pieceIndex === slot;

    cell.style.setProperty('--c', piece.col);
    cell.style.setProperty('--r', piece.row);
    cell.dataset.piece = String(pieceIndex);
    cell.classList.toggle('is-placed', correct);
    cell.classList.remove('is-selected', 'is-source', 'is-target', 'is-hinted', 'is-target-hinted');
    cell.setAttribute('aria-label', slotLabel(slot, pieceIndex));
    cell.setAttribute('aria-pressed', selected === slot ? 'true' : 'false');
  }

  function buildSlots(presetSolved) {
    var total = size * size;
    var identity = [];
    for (var i = 0; i < total; i++) identity.push(i);

    if (presetSolved) {
      slots = identity;
      return;
    }

    var attempt = 0;
    do {
      slots = U.shuffle(identity);
      attempt++;
    } while (attempt < 24 && correctCount() === total);

    if (correctCount() === total) {
      var a = 0;
      var b = total - 1;
      var swap = slots[a];
      slots[a] = slots[b];
      slots[b] = swap;
    }
  }

  function render(presetSolved) {
    clearGhost();
    gesture = null;
    dropTarget = -1;

    cells = [];
    slots = [];

    board.style.setProperty('--cols', size);
    board.textContent = '';
    if (loading) board.appendChild(loading);
    board.setAttribute('aria-rowcount', String(size));
    board.setAttribute('aria-colcount', String(size));

    for (var slot = 0; slot < size * size; slot++) {
      var cell = buildCell(slot);
      cells.push(cell);
      board.appendChild(cell);
    }

    buildSlots(presetSolved);
    cells.forEach(function (_, slot) { paint(slot); });

    selected = -1;
    progress.hidden = false;
    if (totalNode) totalNode.textContent = String(size * size);
    updateProgress();
    syncDifficultyButtons();
  }

  function updateProgress() {
    var correct = correctCount();
    var percent = size * size ? (correct / (size * size)) * 100 : 0;
    if (barNode) barNode.style.width = percent.toFixed(1) + '%';
    if (valueNode) valueNode.textContent = String(correct);
    if (progress) progress.setAttribute('aria-valuenow', String(correct));
    if (progress) progress.setAttribute('aria-valuemax', String(size * size));
    if (progress) progress.setAttribute('aria-valuetext', correct + ' de ' + (size * size) + ' peças no lugar');
    return correct;
  }

  function clearGhost() {
    if (!ghost) return;
    ghost.remove();
    ghost = null;
  }

  function afterMove() {
    var correct = updateProgress();
    if (!solved && correct === size * size) {
      solve();
      return;
    }
    if (correct === size * size) {
      setStatus(words.full || '');
    } else if (selected === -1) {
      setStatus(words.start || '');
    } else {
      setStatus(words.selected || '');
    }
  }

  function select(slot) {
    if (locked || solved || !cells[slot]) return;

    if (selected === slot) {
      clearSelection();
      return;
    }

    if (selected === -1) {
      selected = slot;
      cells[slot].classList.add('is-selected');
      cells[slot].setAttribute('aria-pressed', 'true');
      setStatus(words.selected || '');
      return;
    }

    swap(selected, slot);
  }

  function swap(a, b) {
    if (a === b || a < 0 || b < 0) return;
    var temp = slots[a];
    slots[a] = slots[b];
    slots[b] = temp;
    selected = -1;
    paint(a);
    paint(b);
    afterMove();
  }

  function solve() {
    solved = true;
    locked = true;
    S.state.set('puzzleSolved', true);

    if (controls) controls.hidden = true;
    if (winPanel) winPanel.hidden = false;

    board.classList.add('is-solved');

    S.heartstorm.burst(board, 34);
    setStatus(words.solved || '');
    document.dispatchEvent(new CustomEvent('site:unlock', { detail: { source: 'puzzle' } }));
  }

  function newGame(options) {
    var presetSolved = !!(options && options.presetSolved);
    solved = presetSolved;
    locked = presetSolved;
    hintsLeft = config.hintsPerGame || 3;

    if (presetSolved) {
      if (controls) controls.hidden = true;
      if (winPanel) winPanel.hidden = false;
    } else {
      if (controls) controls.hidden = false;
      if (winPanel) winPanel.hidden = true;
    }

    board.classList.remove('is-solved');
    render(presetSolved);

    if (presetSolved) {
      board.classList.add('is-solved');
      setStatus(words.solved || '');
    } else {
      setStatus(words.start || '');
    }

    if (hintsLeftNode) hintsLeftNode.textContent = String(hintsLeft);
    if (hintButton) hintButton.disabled = false;
  }

  function applyDifficulty(next) {
    size = normalizeSize(next);
    S.state.set('difficulty', size);

    var wasSolved = !!S.state.get('puzzleSolved');
    newGame({ presetSolved: wasSolved });

    if (!wasSolved) {
      U.toast('Tabuleiro de ' + size + '×' + size + ' embaralhado.');
    }
  }

  function syncDifficultyButtons() {
    if (!difficultyGroup) return;
    U.qsa('[data-size]', difficultyGroup).forEach(function (button) {
      button.setAttribute('aria-pressed', normalizeSize(button.dataset.size) === size ? 'true' : 'false');
    });
  }

  function giveHint() {
    if (locked || solved || hintsLeft <= 0) return;

    var misplaced = [];
    for (var i = 0; i < slots.length; i++) {
      if (slots[i] !== i) misplaced.push(i);
    }
    if (!misplaced.length) return;

    var source = misplaced[Math.floor(Math.random() * misplaced.length)];
    var target = slots[source];

    cells.forEach(function (cell) { cell.classList.remove('is-hinted', 'is-target-hinted'); });

    var sourceCell = cells[source];
    var targetCell = cells[target];
    if (sourceCell) sourceCell.classList.add('is-hinted');
    if (targetCell) targetCell.classList.add('is-target-hinted');

    hintsLeft--;
    if (hintsLeftNode) hintsLeftNode.textContent = String(hintsLeft);
    setStatus('A peça que está no lugar ' + (source + 1) + ' pertence ao lugar ' + (target + 1) + '.');

    window.setTimeout(function () {
      if (sourceCell) sourceCell.classList.remove('is-hinted');
      if (targetCell) targetCell.classList.remove('is-target-hinted');
    }, HINT_CLEANUP);

    if (hintsLeft === 0 && hintButton) {
      window.setTimeout(function () { hintButton.disabled = true; }, HINT_CLEANUP);
    }
  }

  function boardSlotAt(clientX, clientY) {
    var rect = board.getBoundingClientRect();
    if (!rect.width || !rect.height) return -1;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return -1;
    var col = U.clamp(Math.floor(((clientX - rect.left) / rect.width) * size), 0, size - 1);
    var row = U.clamp(Math.floor(((clientY - rect.top) / rect.height) * size), 0, size - 1);
    return row * size + col;
  }

  function markDropTarget(slot) {
    if (dropTarget === slot) return;
    if (dropTarget >= 0 && cells[dropTarget]) cells[dropTarget].classList.remove('is-target');
    dropTarget = slot;
    if (dropTarget >= 0 && cells[dropTarget]) cells[dropTarget].classList.add('is-target');
  }

  function onPointerDown(event) {
    if (locked || solved) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    var cell = event.target.closest ? event.target.closest('.piece') : null;
    if (!cell) return;

    gesture = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      slot: Number(cell.dataset.slot),
      startX: event.clientX,
      startY: event.clientY,
      active: false
    };
    pointerConsumed = false;

    if (typeof cell.setPointerCapture === 'function') {
      try {
        cell.setPointerCapture(event.pointerId);
      } catch (error) {
        gesture.pointerId = null;
      }
    }
  }

  function onPointerMove(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    var dx = event.clientX - gesture.startX;
    var dy = event.clientY - gesture.startY;

    if (!gesture.active) {
      if (gesture.pointerType !== 'mouse') return;
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      startDrag(event);
    }

    if (ghost) {
      ghost.style.translate = event.clientX + 'px ' + event.clientY + 'px';
    }
    markDropTarget(boardSlotAt(event.clientX, event.clientY));
  }

  function startDrag(event) {
    gesture.active = true;
    pointerConsumed = true;

    var source = cells[gesture.slot];
    if (!source) return;

    var rect = source.getBoundingClientRect();
    ghost = source.cloneNode(true);
    ghost.classList.add('piece--ghost');
    ghost.classList.remove('is-selected', 'is-hinted', 'is-target-hinted');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.translate = event.clientX + 'px ' + event.clientY + 'px';
    document.body.appendChild(ghost);

    source.classList.add('is-source');
    document.body.classList.add('is-dragging-piece');
  }

  function endDrag() {
    if (gesture) {
      var cell = cells[gesture.slot];
      if (cell && cell.hasPointerCapture && cell.hasPointerCapture(gesture.pointerId)) {
        try {
          cell.releasePointerCapture(gesture.pointerId);
        } catch {
          gesture.pointerId = null;
        }
      }
    }

    var source = gesture ? gesture.slot : -1;
    if (source >= 0 && cells[source]) cells[source].classList.remove('is-source');
    document.body.classList.remove('is-dragging-piece');

    clearGhost();
    markDropTarget(-1);
  }

  function onPointerUp(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    var active = gesture.active;
    var source = gesture.slot;
    var target = active ? boardSlotAt(event.clientX, event.clientY) : -1;

    endDrag();
    gesture = null;

    if (active) {
      if (target >= 0 && target !== source) {
        pointerConsumed = true;
        swap(source, target);
      } else {
        setStatus(selected === -1 ? (words.start || '') : (words.selected || ''));
      }
      return;
    }

    select(source);
  }

  function onPointerCancel(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    endDrag();
    gesture = null;
  }

  function onCellKey(event) {
    var cell = event.currentTarget;
    var slot = Number(cell.dataset.slot);
    var col = slot % size;
    var row = Math.floor(slot / size);
    var next = null;

    switch (event.key) {
      case 'ArrowRight': next = col < size - 1 ? slot + 1 : null; break;
      case 'ArrowLeft': next = col > 0 ? slot - 1 : null; break;
      case 'ArrowDown': next = row < size - 1 ? slot + size : null; break;
      case 'ArrowUp': next = row > 0 ? slot - size : null; break;
      case 'Escape': if (selected >= 0) { clearSelection(); event.preventDefault(); } return;
      default: return;
    }

    if (next === null) return;
    event.preventDefault();
    if (cells[next]) cells[next].focus();
  }

  function clearSelection() {
    if (selected >= 0 && cells[selected]) {
      cells[selected].classList.remove('is-selected');
      cells[selected].setAttribute('aria-pressed', 'false');
    }
    selected = -1;
    setStatus(words.start || '');
  }

  function onCellClick(event) {
    if (event.detail > 0) return;
    var cell = event.target.closest ? event.target.closest('.piece') : null;
    if (!cell || !board.contains(cell)) return;
    if (locked || solved) return;
    select(Number(cell.dataset.slot));
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape') return;
    if (ghost) {
      endDrag();
      gesture = null;
    } else if (selected >= 0) {
      clearSelection();
    }
  }

  function prime(images) {
    if (!ready) return;
    layout = images || [];
    board.dataset.ready = 'true';
  }

  function configureAspect(image) {
    if (!image) return;
    var width = image.naturalWidth;
    var height = image.naturalHeight;
    if (!width || !height) return;

    if (config.ratio) {
      board.style.setProperty('--board-ratio', config.ratio);
    } else {
      board.style.setProperty('--board-ratio', width + ' / ' + height);
    }
  }

  function preload() {
    var sources = [(config.photo || {}).src].filter(Boolean);

    if (!sources.length) {
      board.dataset.ready = 'true';
      return Promise.resolve(null);
    }

    return Promise.all(sources.map(function (src) {
      return U.loadImage(src).catch(function () { return null; });
    })).then(function (images) {
      var loaded = images.filter(Boolean);
      board.dataset.ready = 'true';
      if (!loaded.length) {
        setStatus('Não consegui carregar as peças. Confira os arquivos em assets/img/puzzle/.');
        return null;
      }
      configureAspect(loaded[0]);
      return loaded;
    });
  }

  function init() {
    host = U.qs('[data-puzzle]');
    if (!host) return;

    board = U.qs('[data-board]', host);
    loading = U.qs('[data-board-loading]', host);
    statusNode = U.qs('[data-status]', host);
    progress = U.qs('[data-progress]', host);
    barNode = U.qs('[data-progress-bar]', host);
    valueNode = U.qs('[data-progress-value]', host);
    totalNode = U.qs('[data-progress-total]', host);
    hintButton = U.qs('[data-hint]', host);
    hintsLeftNode = U.qs('[data-hints-left]', host);
    shuffleButton = U.qs('[data-shuffle]', host);
    difficultyGroup = U.qs('[data-difficulty]', host);
    controls = U.qs('[data-controls]', host);
    winPanel = U.qs('[data-win]', host);

    if (!board) return;

    if (config.photo && config.photo.alt) board.setAttribute('aria-label', config.photo.alt);
    if (loading) loading.textContent = 'preparando as peças…';
    if (progress) progress.setAttribute('role', 'progressbar');
    if (progress) progress.setAttribute('aria-label', 'Peças no lugar certo');
    U.text('[data-tip]', config.tip || '', host);

    size = normalizeSize(S.state.get('difficulty') || config.defaultSize);
    hintsLeft = config.hintsPerGame || 3;

    render(false);
    if (hintsLeftNode) hintsLeftNode.textContent = String(hintsLeft);

    preload().then(function (images) {
      ready = true;
      prime(images);
    });

    board.addEventListener('pointerdown', onPointerDown);
    board.addEventListener('pointermove', onPointerMove);
    board.addEventListener('pointerup', onPointerUp);
    board.addEventListener('pointercancel', onPointerCancel);
    board.addEventListener('click', onCellClick);
    board.addEventListener('contextmenu', function (event) {
      if (ghost) event.preventDefault();
    });
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', function () {
      if (gesture) {
        endDrag();
        gesture = null;
      }
    });

    if (shuffleButton) {
      shuffleButton.addEventListener('click', function () {
        if (solved) {
          U.toast('Você já montou tudo. Segue a vida!');
          return;
        }
        newGame({ presetSolved: false });
        setStatus('Embaralhei de novo. Boa sorte!');
      });
    }

    if (hintButton) {
      hintButton.addEventListener('click', function () {
        if (solved) {
          U.toast('Acabou: não tem mais o que descobrir.');
          return;
        }
        giveHint();
      });
    }

    if (difficultyGroup) {
      difficultyGroup.addEventListener('click', function (event) {
        var button = event.target.closest('[data-size]');
        if (!button || !difficultyGroup.contains(button)) return;
        applyDifficulty(button.dataset.size);
      });
    }

    if (S.state.get('puzzleSolved')) {
      newGame({ presetSolved: true });
    }

    window.addEventListener('resize', function () {
      if (!ready) return;
      var images = layout;
      if (!images || !images.length) return;
      configureAspect(images[0]);
    });
  }

  return {
    init: init,
    reset: function () {
      newGame({ presetSolved: !!S.state.get('puzzleSolved') });
    },
    isSolved: function () { return solved; }
  };
})();
