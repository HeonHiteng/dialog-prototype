/* Olinda: The Grand Sweep — find the one sowing line that captures the target. */
(function () {
  var DP = window.DP, t = DP.t, E = DP.OlindaEngine;
  // scatter offsets (% of pit) for up to 12 visible seeds
  var SPOTS = [[50, 50], [32, 38], [66, 36], [40, 68], [64, 64], [50, 24], [24, 58], [76, 52], [30, 22], [72, 20], [52, 80], [20, 40]];
  var SPEED = { pick: 340, sow: 170, pasu: 520, capture: 560, end: 200 };

  function mount(root, ctx) {
    var P = ctx.puzzle, start = { pits: P.p.split('').map(Number), me: 0, them: 0 }, M = P.mv, T = P.t;
    var saved = ctx.load(), done = ctx.result();
    var line = [], states = [start], tries = saved ? saved.tries : 1, busy = false, fast = false, finished = !!done, failed = false;
    var timer = new DP.Timer(saved ? saved.ms : 0, function (ms) { timeEl.textContent = DP.fmtTime(ms); });
    (saved ? saved.line : []).forEach(function (p) { var r = E.play(states[states.length - 1], p); if (r) { states.push(r); line.push(p); } });
    if (done && done.sol) { line = []; states = [start]; done.sol.forEach(function (p) { states.push(E.play(states[states.length - 1], p)); line.push(p); }); }
    var disp = cloneState(cur());

    root.innerHTML =
      '<p class="goal">' + t('olindaGoal', { t: '<b>' + T + '</b>', m: '<b>' + M + '</b>' }) + '</p>' +
      '<div class="hud"><div><span>' + t('haul') + '</span><b data-me></b></div><div><span>' + t('movesLeft') + '</span><b data-left></b></div>' +
      '<div><span>' + t('lost') + '</span><b data-them></b></div><div><span>' + t('time') + '</span><b data-time>0:00</b></div></div>' +
      '<div class="poruwa"><div class="row-label top">' + t('theirRow') + '</div><div class="pits"></div>' +
      '<div class="hand" hidden></div></div><div class="row-label bottom">▲ ' + t('yourRow') + ' · ⟲</div>' +
      '<div class="progress-dots" data-dots></div>' +
      '<p class="msg" data-msg></p>' +
      '<div class="controls"><button class="btn" data-undo>↶ ' + t('undo') + '</button><button class="btn" data-reset>⟲ ' + t('reset') + '</button>' +
      '<button class="btn" data-skip hidden>' + t('skip') + '</button></div>' +
      '<div class="controls"><button class="btn ghost small" data-reveal hidden>' + t('reveal') + '</button></div>';
    var pitsEl = root.querySelector('.pits'), timeEl = root.querySelector('[data-time]'), msgEl = root.querySelector('[data-msg]'), handEl = root.querySelector('.hand');
    var pitEls = [];
    for (var k = 0; k < 14; k++) {
      var idx = k < 7 ? 13 - k : k - 7; // top row shows 13..7, bottom row 0..6
      var el = DP.h('<button class="pit ' + (idx < 7 ? 'mine' : 'theirs') + '" data-p="' + idx + '"><span class="seeds"></span><span class="count"></span>' + (idx < 7 ? '<span class="num">' + (idx + 1) + '</span>' : '') + '</button>');
      el.style.gridRow = k < 7 ? 1 : 2; el.style.gridColumn = (k % 7) + 1;
      pitsEl.appendChild(el); pitEls[idx] = el;
    }

    function cur() { return states[states.length - 1]; }
    function cloneState(s) { return { pits: s.pits.slice(), me: s.me, them: s.them }; }
    function drawPit(i) {
      var n = disp.pits[i], el = pitEls[i], html = '';
      for (var j = 0; j < Math.min(n, SPOTS.length); j++) html += '<i class="seed" style="left:' + SPOTS[j][0] + '%;top:' + SPOTS[j][1] + '%"></i>';
      el.querySelector('.seeds').innerHTML = html;
      el.querySelector('.count').textContent = n;
      el.classList.toggle('empty', !n);
    }
    function render() {
      for (var i = 0; i < 14; i++) drawPit(i);
      root.querySelector('[data-me]').textContent = disp.me + ' / ' + T;
      root.querySelector('[data-them]').textContent = disp.them;
      root.querySelector('[data-left]').textContent = M - line.length;
      var can = !busy && !finished && !failed && line.length < M;
      for (var p = 0; p < 7; p++) pitEls[p].disabled = !can || !cur().pits[p];
      root.querySelector('[data-undo]').disabled = busy || finished || !line.length;
      root.querySelector('[data-reset]').disabled = busy || finished || !line.length;
      root.querySelector('[data-skip]').hidden = !busy;
      root.querySelector('[data-reveal]').hidden = finished || busy || tries < 4;
      var dots = ''; for (var d = 0; d < M; d++) dots += '<i class="' + (d < line.length ? 'on' : '') + '">' + (d < line.length ? line[d] + 1 : '') + '</i>';
      root.querySelector('[data-dots]').innerHTML = dots;
    }
    function persist() { ctx.save({ line: line, tries: tries, ms: timer.ms() }); }

    function flash(i, cls, label) {
      var el = pitEls[i]; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      if (label) {
        var f = DP.h('<span class="float ' + cls + '">' + label + '</span>'); el.appendChild(f);
        setTimeout(function () { f.remove(); }, 900);
      }
    }
    function animate(events, cb) {
      busy = true; fast = false; render();
      var hand = 0, k = 0;
      (function step() {
        if (k >= events.length) { handEl.hidden = true; busy = false; return cb(); }
        var e = events[k++];
        if (e.t === 'pick') { disp.pits[e.pit] = 0; hand = e.n; flash(e.pit, 'picked'); }
        else if (e.t === 'sow') { disp.pits[e.pit]++; hand--; flash(e.pit, 'sown'); }
        else if (e.t === 'pasu') {
          disp.pits[e.pit] -= 4; if (e.who === 'me') disp.me += 4; else disp.them += 4;
          flash(e.pit, e.who === 'me' ? 'pasu' : 'pasu-lost', (e.who === 'me' ? '+4' : '−4') + ' PASU');
        } else if (e.t === 'capture') { disp.pits[e.pit] = 0; disp.me += e.n; flash(e.pit, 'captured', '+' + e.n); flash(e.gap, 'gap'); }
        if (e.pit != null) drawPit(e.pit);
        root.querySelector('[data-me]').textContent = disp.me + ' / ' + T;
        root.querySelector('[data-them]').textContent = disp.them;
        handEl.hidden = hand <= 0; handEl.textContent = '✋ ' + hand;
        if (fast) step(); else setTimeout(step, SPEED[e.t]);
      })();
    }

    function after() {
      disp = cloneState(cur());
      var s = cur(), over = line.length >= M || !E.legal(s).length;
      if (over && !finished) {
        if (s.me >= T) return win(false);
        failed = true;
        msgEl.textContent = t('olindaFail', { c: s.me, t: T });
        msgEl.className = 'msg bad';
        tries++;
      }
      render(); persist();
    }

    pitsEl.addEventListener('click', function (e) {
      var el = e.target.closest('.pit'); if (!el || el.disabled) return;
      var p = +el.dataset.p; if (p > 6 || busy || finished || failed) return;
      var r = E.play(cur(), p, true); if (!r) return;
      timer.start();
      msgEl.textContent = ''; msgEl.className = 'msg';
      states.push({ pits: r.pits, me: r.me, them: r.them }); line.push(p);
      animate(r.events, after);
    });
    root.querySelector('[data-skip]').onclick = function () { fast = true; };
    root.querySelector('[data-undo]').onclick = function () {
      if (!line.length || busy) return;
      states.pop(); line.pop(); failed = false; msgEl.textContent = ''; disp = cloneState(cur()); render(); persist();
    };
    root.querySelector('[data-reset]').onclick = function () {
      if (busy) return;
      states = [start]; line = []; failed = false; msgEl.textContent = ''; disp = cloneState(start); render(); persist();
    };
    root.querySelector('[data-reveal]').onclick = function () {
      if (busy) return;
      states = [start]; line = []; failed = false; disp = cloneState(start); render();
      var sol = P.sol.split('').map(Number), k = 0;
      (function next() {
        if (k >= sol.length) return win(true);
        var r = E.play(cur(), sol[k++], true);
        states.push({ pits: r.pits, me: r.me, them: r.them }); line.push(sol[k - 1]);
        animate(r.events, function () { disp = cloneState(cur()); render(); setTimeout(next, 250); });
      })();
    };

    function summary(r) {
      var sq = ''; for (var i = 1; i < r.tries; i++) sq += '🟥'; sq += r.revealed ? '⬛' : '🟩';
      return {
        icon: r.revealed ? '🌱' : '🔴',
        title: r.revealed ? t('revealed') : t('olindaWin'),
        sub: (r.sol || []).map(function (p) { return 'Pit ' + (p + 1); }).join(' → '),
        lines: [[t('target'), r.target], [t('tries'), r.tries], [t('time'), DP.fmtTime(r.ms)]],
        share: '🔴 Olinda #' + (ctx.day + 1) + '\n' + (r.revealed ? '🌱 Solution revealed' : '✅ ' + r.target + ' seeds in ' + r.moves + ' moves') +
          '\n' + sq + ' (' + r.tries + ' tr' + (r.tries > 1 ? 'ies' : 'y') + ')  ⏱ ' + DP.fmtTime(r.ms)
      };
    }
    function win(revealed) {
      finished = true; timer.stop(); disp = cloneState(cur()); render(); persist();
      msgEl.textContent = revealed ? t('revealed') : '🎉 ' + t('olindaWin'); msgEl.className = 'msg good';
      var r = { won: !revealed, revealed: revealed, tries: tries, ms: timer.ms(), target: T, moves: M, sol: line.slice() };
      ctx.finish(r);
      setTimeout(function () { DP.resultModal('olinda', ctx.day, summary(ctx.result())); }, 700);
    }

    render();
    if (done) {
      msgEl.textContent = done.revealed ? t('revealed') : '🎉 ' + t('olindaWin'); msgEl.className = 'msg good';
      var sb = DP.h('<button class="btn primary wide">' + t('share') + '</button>');
      sb.onclick = function () { DP.resultModal('olinda', ctx.day, summary(done)); };
      root.appendChild(sb);
    } else if (line.length >= M || (line.length && !E.legal(cur()).length)) { line.pop(); states.pop(); disp = cloneState(cur()); render(); }
    return { destroy: function () { if (!finished) persist(); timer.stop(); busy = false; fast = true; } };
  }

  DP.GAMES = DP.GAMES || {};
  DP.GAMES.olinda = { icon: '🔴', nameKey: 'olindaName', descKey: 'olindaDesc', howKey: 'olindaHow', mount: mount, howArt: function () {
    return '<div class="how-art"><div>⬅ ⬅ ⬅ ⬅ ⬅ ⬅ ⬅</div><div class="mid"><span>⬇</span><span>⬆</span></div><div>1 ➡ 2 ➡ 3 ➡ 4 ➡ 5 ➡ 6 ➡ 7</div></div>';
  } };
})();
