/* Pothole Patrol — no-guess daily Minesweeper. (Potholes + cones instead of mines: no landmine imagery.) */
(function () {
  var DP = window.DP, t = DP.t, E = DP.MineEngine, W = 9, H = 9, PENALTY = 30000;

  function mount(root, ctx) {
    var b = E.decode(W, H, ctx.puzzle.m), n = W * H, start = ctx.puzzle.s;
    var saved = ctx.load(), done = ctx.result();
    var revealed = new Array(n).fill(false), flags = new Array(n).fill(false), hit = new Array(n).fill(false), mistakes = 0;
    if (saved) { saved.r.forEach(function (i) { revealed[i] = true; }); saved.f.forEach(function (i) { flags[i] = true; }); saved.x.forEach(function (i) { hit[i] = true; }); mistakes = saved.x.length; }
    else E.flood(b, revealed, start);
    var flagMode = false, finished = !!done;
    var timer = new DP.Timer(saved ? saved.ms : 0, function (ms) { timeEl.textContent = DP.fmtTime(ms); });

    root.innerHTML =
      '<div class="hud"><div><span>' + t('minesLeft') + '</span><b data-left></b></div><div><span>' + t('mistakes') + '</span><b data-mis>0</b></div>' +
      '<div><span>' + t('time') + '</span><b data-time>0:00</b></div></div>' +
      '<div class="mine-board" style="--w:' + W + '"></div>' +
      '<div class="controls"><div class="seg" role="group"><button class="on" data-mode="dig">🔍 ' + t('modeDig') + '</button>' +
      '<button data-mode="flag">🚧 ' + t('modeFlag') + '</button></div></div>';
    var grid = root.querySelector('.mine-board'), timeEl = root.querySelector('[data-time]');
    var cells = [];
    for (var i = 0; i < n; i++) { var c = DP.h('<button class="mc" data-i="' + i + '"></button>'); grid.appendChild(c); cells.push(c); }

    function render(winAnim) {
      var left = b.count;
      for (var i = 0; i < n; i++) {
        var c = cells[i], cls = 'mc';
        if (flags[i] || hit[i]) left--;
        if (hit[i]) { cls += ' hit'; c.textContent = ''; }
        else if (revealed[i]) { cls += ' open n' + b.nums[i]; c.textContent = b.nums[i] || ''; }
        else if (flags[i]) { cls += ' flag'; c.textContent = '🚧'; }
        else if (finished && b.mines[i]) { cls += ' flag'; c.textContent = '🚧'; }
        else c.textContent = '';
        if (winAnim && revealed[i]) { cls += ' wave'; c.style.animationDelay = ((i % W) + Math.floor(i / W)) * 25 + 'ms'; }
        c.className = cls;
      }
      root.querySelector('[data-left]').textContent = left;
      root.querySelector('[data-mis]').textContent = mistakes;
      timeEl.textContent = DP.fmtTime(timer.ms());
    }
    function persist() {
      var pick = function (a) { var o = []; a.forEach(function (v, i) { if (v) o.push(i); }); return o; };
      ctx.save({ r: pick(revealed), f: pick(flags), x: pick(hit), ms: timer.ms() });
    }
    function safeLeft() { for (var i = 0; i < n; i++) if (!b.mines[i] && !revealed[i]) return true; return false; }

    function open(i) {
      if (revealed[i] || flags[i] || hit[i]) return;
      if (b.mines[i]) {
        hit[i] = true; mistakes++; timer.add(PENALTY);
        cells[i].classList.add('shake');
        if (navigator.vibrate) navigator.vibrate(120);
        DP.toast(t('penalty'));
        return;
      }
      E.flood(b, revealed, i);
      revealed.forEach(function (r, j) { if (r) flags[j] = false; });
    }
    function chord(i) {
      var nb = E.nbrs(W, H, i), f = nb.filter(function (j) { return flags[j] || hit[j]; }).length;
      if (f === b.nums[i]) nb.forEach(open);
    }
    function act(i, asFlag) {
      if (finished) return;
      timer.start();
      if (revealed[i]) { if (b.nums[i] > 0) chord(i); }
      else if (asFlag) { if (!hit[i]) flags[i] = !flags[i]; }
      else open(i);
      if (!safeLeft()) return win();
      render(); persist();
    }

    // tap = mode action, long-press = flag
    var press = null;
    grid.addEventListener('pointerdown', function (e) {
      var c = e.target.closest('.mc'); if (!c) return;
      var i = +c.dataset.i;
      press = { i: i, long: false, tm: setTimeout(function () { press.long = true; act(i, true); if (navigator.vibrate) navigator.vibrate(25); }, 380) };
    });
    function cancel() { if (press) { clearTimeout(press.tm); } }
    grid.addEventListener('pointerup', function (e) {
      if (!press) return; cancel();
      var c = e.target.closest('.mc');
      if (!press.long && c && +c.dataset.i === press.i) act(press.i, flagMode);
      press = null;
    });
    grid.addEventListener('pointercancel', function () { cancel(); press = null; });
    grid.addEventListener('pointerleave', function () { cancel(); press = null; });
    grid.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    root.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.onclick = function () {
        flagMode = btn.dataset.mode === 'flag';
        root.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.toggle('on', x === btn); });
      };
    });

    function summary(r) {
      var st = r.mistakes === 0 ? '🟩🟩🟩' : r.mistakes === 1 ? '🟩🟩🟥' : r.mistakes === 2 ? '🟩🟥🟥' : '🟥🟥🟥';
      return {
        title: t('minesWin'), sub: r.mistakes === 0 ? '✨ Flawless' : '',
        lines: [[t('time'), DP.fmtTime(r.ms)], [t('mistakes'), r.mistakes]],
        share: '🚧 Pothole Patrol #' + (ctx.day + 1) + '\n⏱ ' + DP.fmtTime(r.ms) + (r.mistakes ? '  (' + r.mistakes + ' pothole' + (r.mistakes > 1 ? 's' : '') + ' hit)' : '  · flawless') + '\n' + st
      };
    }
    function win() {
      finished = true; timer.stop();
      render(true); persist();
      var r = { won: true, ms: timer.ms(), mistakes: mistakes };
      ctx.finish(r);
      setTimeout(function () { DP.resultModal('mines', ctx.day, summary(ctx.result())); }, 900);
    }

    render();
    if (done) {
      var sb = DP.h('<button class="btn primary wide">' + t('share') + '</button>');
      sb.onclick = function () { DP.resultModal('mines', ctx.day, summary(done)); };
      root.appendChild(sb);
    }
    return { destroy: function () { if (!finished) persist(); timer.stop(); } };
  }

  DP.GAMES = DP.GAMES || {};
  DP.GAMES.mines = { icon: '🚧', nameKey: 'minesName', descKey: 'minesDesc', howKey: 'minesHow', mount: mount };
})();
