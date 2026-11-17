/* Tuk-Tuk Rush — 6x6 sliding-block puzzle. */
(function () {
  var DP = window.DP, t = DP.t, E = DP.RushEngine, N = 6;
  var CAR_COLORS = ['#2E86DE', '#10AC84', '#F368E0', '#5F27CD', '#FF9F43', '#00A8B5', '#8395A7', '#B33771', '#3B3B98', '#6AB04C'];
  var BUS_COLORS = [['#1565C0', '#FFC107'], ['#2E7D32', '#FFEB3B'], ['#6A1B9A', '#00E5FF'], ['#AD1457', '#FFFFFF']];

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  /** Top-down vehicle drawn facing right in a (len*100 x 100) box. */
  function vehicleSVG(v, day) {
    var L = v.len * 100, h = hash(v.id + day), inner;
    if (v.id === 'A') {
      inner = '<rect x="28" y="4" width="22" height="14" rx="4" fill="#222"/><rect x="28" y="82" width="22" height="14" rx="4" fill="#222"/>' +
        '<path d="M14 18 Q14 12 22 12 H140 Q176 14 190 42 V58 Q176 86 140 88 H22 Q14 88 14 82 Z" fill="#E53935" stroke="#8E0000" stroke-width="4"/>' +
        '<path d="M22 20 H128 Q134 50 128 80 H22 Z" fill="#212121"/><path d="M30 28 H118 M30 50 H120 M30 72 H118" stroke="#424242" stroke-width="4"/>' +
        '<path d="M136 22 Q156 50 136 78 Q148 50 136 22" fill="#90CAF9" stroke="#90CAF9" stroke-width="10" stroke-linejoin="round"/>' +
        '<circle cx="182" cy="50" r="6" fill="#FFF59D"/><rect x="140" y="47" width="40" height="6" rx="3" fill="#B71C1C"/>';
    } else if (v.len === 3 && h % 2 === 0) { // private bus
      var bc = BUS_COLORS[h % BUS_COLORS.length];
      inner = '<rect x="6" y="8" width="288" height="84" rx="14" fill="' + bc[0] + '" stroke="rgba(0,0,0,.35)" stroke-width="4"/>' +
        '<rect x="6" y="40" width="288" height="20" fill="' + bc[1] + '" opacity=".9"/>' +
        '<rect x="70" y="18" width="70" height="64" rx="6" fill="rgba(255,255,255,.25)"/><rect x="160" y="18" width="40" height="64" rx="6" fill="rgba(255,255,255,.25)"/>' +
        '<rect x="262" y="14" width="22" height="72" rx="6" fill="#B3E5FC"/><rect x="12" y="16" width="10" height="68" rx="4" fill="rgba(0,0,0,.25)"/>';
    } else if (v.len === 3) { // lorry with container
      var lc = ['#F57C00', '#C62828', '#00897B', '#FBC02D'][h % 4];
      inner = '<rect x="6" y="8" width="206" height="84" rx="6" fill="#B0BEC5" stroke="#546E7A" stroke-width="4"/>' +
        '<path d="M30 12 V88 M60 12 V88 M90 12 V88 M120 12 V88 M150 12 V88 M180 12 V88" stroke="#78909C" stroke-width="5"/>' +
        '<rect x="220" y="12" width="74" height="76" rx="12" fill="' + lc + '" stroke="rgba(0,0,0,.35)" stroke-width="4"/>' +
        '<rect x="266" y="20" width="18" height="60" rx="5" fill="#B3E5FC"/>';
    } else { // car / van
      var cc = CAR_COLORS[h % CAR_COLORS.length];
      inner = '<rect x="8" y="12" width="184" height="76" rx="22" fill="' + cc + '" stroke="rgba(0,0,0,.35)" stroke-width="4"/>' +
        '<path d="M132 22 Q150 50 132 78 H118 V22 Z" fill="#B3E5FC"/><path d="M42 24 V76 H56 Q48 50 56 24 Z" fill="#B3E5FC"/>' +
        '<rect x="62" y="22" width="52" height="56" rx="10" fill="rgba(255,255,255,.22)"/>';
    }
    var vb = v.horiz ? '0 0 ' + L + ' 100' : '0 0 100 ' + L;
    var g = v.horiz ? inner : '<g transform="translate(100 0) rotate(90)">' + inner + '</g>';
    return '<svg viewBox="' + vb + '" preserveAspectRatio="none" aria-hidden="true">' + g + '</svg>';
  }

  function mount(root, ctx) {
    var puz = E.parse(ctx.puzzle.b), par = ctx.puzzle.par;
    var saved = ctx.load(), done = ctx.result();
    var pos = saved ? saved.pos.slice() : puz.start.slice(), hist = saved ? saved.hist.slice() : [];
    var timer = new DP.Timer(saved ? saved.ms : 0, function (ms) { timeEl.textContent = DP.fmtTime(ms); });
    var finished = !!done || E.isSolved(puz, pos);

    root.innerHTML =
      '<div class="hud"><div><span>' + t('moves') + '</span><b data-moves>0</b></div><div><span>' + t('par') + '</span><b>' + par + '</b></div>' +
      '<div><span>' + t('time') + '</span><b data-time>0:00</b></div></div>' +
      '<div class="rush-wrap"><div class="rush-board" style="--n:' + N + '"><div class="lane"></div>' +
      '<div class="exit"><span>' + t('rushExit') + '</span>›</div></div></div>' +
      '<div class="controls"><button class="btn" data-undo>↶ ' + t('undo') + '</button><button class="btn" data-reset>⟲ ' + t('reset') + '</button></div>';
    var board = root.querySelector('.rush-board'), movesEl = root.querySelector('[data-moves]'), timeEl = root.querySelector('[data-time]');
    for (var i = 0; i < 36; i++) board.insertAdjacentHTML('beforeend', '<div class="cell" style="--r:' + Math.floor(i / N) + ';--c:' + (i % N) + '"></div>');
    puz.walls.forEach(function (w) {
      board.insertAdjacentHTML('beforeend', '<div class="obstacle" style="--r:' + Math.floor(w / N) + ';--c:' + (w % N) + '" title="Cow">🐄</div>');
    });
    var els = puz.vehicles.map(function (v, i) {
      var el = DP.h('<div class="veh' + (v.id === 'A' ? ' hero' : '') + '" data-i="' + i + '">' + vehicleSVG(v, ctx.day) + '</div>');
      el.style.setProperty('--len', v.len);
      el.classList.add(v.horiz ? 'h' : 'v');
      board.appendChild(el);
      return el;
    });

    function place(i, p) {
      var v = puz.vehicles[i], el = els[i];
      el.style.setProperty('--r', v.horiz ? v.fixed : p);
      el.style.setProperty('--c', v.horiz ? p : v.fixed);
    }
    function render() {
      puz.vehicles.forEach(function (v, i) { place(i, pos[i]); });
      movesEl.textContent = hist.length;
      timeEl.textContent = DP.fmtTime(timer.ms());
      root.querySelector('[data-undo]').disabled = finished || !hist.length;
      root.querySelector('[data-reset]').disabled = finished || !hist.length;
    }
    function persist() { ctx.save({ pos: pos, hist: hist, ms: timer.ms() }); }

    // dragging
    var drag = null;
    board.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.veh'); if (!el || finished) return;
      var i = +el.dataset.i, cell = board.getBoundingClientRect().width / N;
      drag = { i: i, el: el, x: e.clientX, y: e.clientY, p0: pos[i], range: E.range(puz, pos, i), cell: cell, id: e.pointerId };
      el.setPointerCapture(e.pointerId); el.classList.add('drag');
      timer.start();
    });
    board.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var v = puz.vehicles[drag.i], d = (v.horiz ? e.clientX - drag.x : e.clientY - drag.y) / drag.cell;
      var p = Math.max(drag.range[0], Math.min(drag.range[1], drag.p0 + d));
      drag.el.style.setProperty(v.horiz ? '--c' : '--r', p);
      drag.p = p;
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var i = drag.i, p = Math.round(drag.p == null ? drag.p0 : drag.p);
      drag.el.classList.remove('drag');
      drag = null;
      if (p !== pos[i]) { hist.push(pos.slice()); pos[i] = p; }
      render(); persist();
      if (E.isSolved(puz, pos)) win();
    }
    board.addEventListener('pointerup', end);
    board.addEventListener('pointercancel', end);

    root.querySelector('[data-undo]').onclick = function () { if (hist.length) { pos = hist.pop(); render(); persist(); } };
    root.querySelector('[data-reset]').onclick = function () { if (hist.length) { pos = puz.start.slice(); hist = []; render(); persist(); } };

    function stars(m) { return m <= par ? 3 : m <= par + Math.max(3, Math.round(par * 0.25)) ? 2 : 1; }
    function summary(r) {
      var st = '⭐'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
      return {
        title: t('rushWin'), sub: st,
        lines: [[t('moves'), r.moves], [t('par'), r.par], [t('time'), DP.fmtTime(r.ms)]],
        share: '🛺 Tuk-Tuk Rush #' + (ctx.day + 1) + '\n' + st + '  ' + r.moves + ' moves (par ' + r.par + ')\n⏱ ' + DP.fmtTime(r.ms)
      };
    }
    function win() {
      finished = true; timer.stop(); render();
      els[0].classList.add('leaving');
      var r = { won: true, moves: hist.length, par: par, ms: timer.ms(), stars: stars(hist.length) };
      ctx.finish(r);
      setTimeout(function () { DP.resultModal('rush', ctx.day, summary(ctx.result())); }, 900);
    }

    render();
    if (done) {
      els[0].classList.add('gone');
      var sb = DP.h('<button class="btn primary wide">' + t('share') + '</button>');
      sb.onclick = function () { DP.resultModal('rush', ctx.day, summary(done)); };
      root.appendChild(sb);
    }
    return { destroy: function () { if (!finished) persist(); timer.stop(); } };
  }

  DP.GAMES = DP.GAMES || {};
  DP.GAMES.rush = { icon: '🛺', nameKey: 'rushName', descKey: 'rushDesc', howKey: 'rushHow', mount: mount };
})();
