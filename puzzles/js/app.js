/* App shell: daily puzzle selection, storage/streaks, modals, sharing, SuperApp bridge, routing. */
(function () {
  var DP = window.DP, t = DP.t;
  var EPOCH = Date.UTC(2026, 0, 1), DAY = 864e5, TZ = 5.5 * 3600e3; // puzzles roll over at midnight Sri Lanka time
  var REWARD_DAYS = 7;

  /* ---------- time ---------- */
  var override = new URLSearchParams(location.search).get('date'); // ?date=2026-12-01 for QA
  DP.today = function () {
    if (override && !isNaN(Date.parse(override + 'T00:00:00Z'))) return Math.floor((Date.parse(override + 'T00:00:00Z') - EPOCH) / DAY);
    return Math.floor((Date.now() + TZ - EPOCH) / DAY);
  };
  DP.weekday = function (d) { return new Date(EPOCH + d * DAY).getUTCDay(); };
  DP.dateLabel = function (d) {
    return new Date(EPOCH + d * DAY).toLocaleDateString(DP.lang === 'en' ? 'en-GB' : DP.lang + '-LK',
      { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  };
  DP.msToNext = function () { return DAY - ((Date.now() + TZ - EPOCH) % DAY); };
  DP.fmtTime = function (ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
  DP.fmtCountdown = function (ms) {
    var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + (s % 60)).slice(-2) + 's';
  };
  DP.puzzleFor = function (game, d) {
    var tier = DP.PUZZLES[game][DP.weekday(d)], k = Math.floor(d / 7);
    return tier[((k % tier.length) + tier.length) % tier.length];
  };

  /* ---------- storage ---------- */
  var mem = {};
  DP.store = {
    get: function (k, dflt) { try { var v = localStorage.getItem('dp:' + k); return v == null ? dflt : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : dflt; } },
    set: function (k, v) { try { localStorage.setItem('dp:' + k, JSON.stringify(v)); } catch (e) { mem[k] = v; } },
    del: function (k) { try { localStorage.removeItem('dp:' + k); } catch (e) { delete mem[k]; } }
  };
  DP.result = function (game, d) { return DP.store.get('res:' + game + ':' + d, null); };
  DP.stats = function (game) {
    var s = DP.store.get('stats:' + game, { played: 0, won: 0, streak: 0, best: 0, last: null });
    if (s.last != null && s.last < DP.today() - 1) s.streak = 0; // streak broken by a missed day
    return s;
  };
  DP.recordResult = function (game, d, res) {
    if (DP.result(game, d)) return; // first completion of the day is the one that counts
    DP.store.set('res:' + game + ':' + d, res);
    var s = DP.stats(game);
    s.played++;
    if (res.won) { s.won++; s.streak = s.last === d - 1 ? s.streak + 1 : 1; } else s.streak = 0;
    s.best = Math.max(s.best, s.streak); s.last = d;
    DP.store.set('stats:' + game, s);
    DP.bridge.emit('puzzle_complete', { game: game, day: d, puzzle: d + 1, result: res, streak: s.streak });
    var m = DP.metaStreak();
    if (DP.GAME_IDS.every(function (g) { return DP.result(g, d); })) {
      DP.bridge.emit('daily_set_complete', { day: d, metaStreak: m });
      if (m > 0 && m % REWARD_DAYS === 0) DP.bridge.emit('streak_milestone', { days: m });
    }
  };
  /** Consecutive days (ending today, or yesterday if today isn't finished yet) with all games completed. */
  DP.metaStreak = function () {
    var d = DP.today(), n = 0;
    var full = function (x) { return DP.GAME_IDS.every(function (g) { return DP.result(g, x); }); };
    if (!full(d)) d--;
    while (full(d)) { n++; d--; }
    return n;
  };

  /* ---------- SuperApp bridge ---------- */
  DP.bridge = {
    emit: function (name, payload) {
      var msg = JSON.stringify({ source: 'daily-puzzles', event: name, payload: payload });
      try {
        if (window.SuperAppBridge && window.SuperAppBridge.postMessage) window.SuperAppBridge.postMessage(msg); // Android JS interface
        else if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.superapp) window.webkit.messageHandlers.superapp.postMessage(msg);
        else if (window.parent !== window) window.parent.postMessage(msg, '*');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('dp:event', { detail: { event: name, payload: payload } }));
    }
  };

  /* ---------- UI helpers ---------- */
  DP.h = function (html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
  DP.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  DP.toast = function (msg) {
    var el = DP.h('<div class="toast">' + DP.esc(msg) + '</div>');
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 300); }, 1800);
  };
  DP.modal = function (inner, opts) {
    opts = opts || {};
    var el = DP.h('<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true"><button class="modal-x" aria-label="' + t('close') + '">×</button></div></div>');
    var box = el.firstChild;
    if (typeof inner === 'string') box.insertAdjacentHTML('beforeend', inner); else box.appendChild(inner);
    function close() { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 200); if (opts.onClose) opts.onClose(); }
    el.addEventListener('click', function (e) { if (e.target === el || e.target.classList.contains('modal-x') || e.target.hasAttribute('data-close')) close(); });
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    return { el: box, close: close };
  };
  DP.howTo = function (game) {
    var g = DP.GAMES[game];
    var html = '<h2>' + g.icon + ' ' + t(g.nameKey) + '</h2><h3>' + t('howTo') + '</h3><ol class="howto">' +
      t(g.howKey).map(function (x) { return '<li>' + DP.esc(x) + '</li>'; }).join('') + '</ol>' +
      (g.howArt ? g.howArt() : '') + '<button class="btn primary wide" data-close>' + t('gotIt') + '</button>';
    DP.store.set('seenHelp:' + game, true);
    return DP.modal(html);
  };

  DP.share = function (text) {
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
    DP.copy(text);
  };
  DP.copy = function (text) {
    var done = function () { DP.toast(t('copied')); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
  };
  DP.whatsapp = function (text) { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); };

  /** Shared end-of-game modal. lines = [[label, value], ...] */
  DP.resultModal = function (game, d, o) {
    var s = DP.stats(game), g = DP.GAMES[game];
    if (DP.rankShareLine) o.share += DP.rankShareLine(game, d);
    var html = '<div class="result"><div class="result-icon">' + (o.icon || g.icon) + '</div><h2>' + DP.esc(o.title) + '</h2>' +
      (o.sub ? '<p class="muted">' + DP.esc(o.sub) + '</p>' : '') +
      '<div class="stat-row">' + o.lines.map(function (l) { return '<div class="stat"><b>' + DP.esc(l[1]) + '</b><span>' + DP.esc(l[0]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="stat-row small">' +
      '<div class="stat"><b>' + s.played + '</b><span>' + t('played') + '</span></div>' +
      '<div class="stat"><b>🔥 ' + s.streak + '</b><span>' + t('streak') + '</span></div>' +
      '<div class="stat"><b>' + s.best + '</b><span>' + t('best') + '</span></div></div>' +
      (DP.rankBlock ? DP.rankBlock(game, d) : '') +
      '<pre class="share-preview">' + DP.esc(o.share) + '</pre>' +
      '<div class="btn-row"><button class="btn primary" data-act="share">' + t('share') + '</button>' +
      '<button class="btn wa" data-act="wa">' + t('whatsapp') + '</button></div>' +
      '<p class="countdown">' + t('nextIn') + ' <b data-countdown></b></p>' +
      '<a class="btn ghost wide" href="#/" data-close>' + t('back') + '</a></div>';
    var m = DP.modal(html);
    m.el.querySelector('[data-act=share]').onclick = function () { DP.share(o.share); };
    m.el.querySelector('[data-act=wa]').onclick = function () { DP.whatsapp(o.share); };
    return m;
  };
  setInterval(function () {
    document.querySelectorAll('[data-countdown]').forEach(function (el) { el.textContent = DP.fmtCountdown(DP.msToNext()); });
  }, 1000);

  /** A timer that only runs while the page is visible. */
  DP.Timer = function (initial, onTick) {
    var acc = initial || 0, since = null, iv = null, self = this;
    function vis() { if (document.hidden) self.pause(); else if (self.running) self.resume(); }
    this.running = false;
    this.start = function () { if (this.running) return; this.running = true; this.resume(); };
    this.resume = function () { if (since == null) since = Date.now(); if (!iv) iv = setInterval(function () { onTick && onTick(self.ms()); }, 500); };
    this.pause = function () { if (since != null) { acc += Date.now() - since; since = null; } clearInterval(iv); iv = null; };
    this.stop = function () { this.pause(); this.running = false; document.removeEventListener('visibilitychange', vis); };
    this.add = function (ms) { acc += ms; onTick && onTick(self.ms()); };
    this.ms = function () { return acc + (since != null ? Date.now() - since : 0); };
    document.addEventListener('visibilitychange', vis);
  };

  /* ---------- hub + routing ---------- */
  var app = document.getElementById('app'), current = null;

  function renderHub() {
    var d = DP.today(), wd = DP.weekday(d), meta = DP.metaStreak();
    var langs = Object.keys(DP.LANGS).map(function (l) { return '<button class="lang' + (l === DP.lang ? ' on' : '') + '" data-lang="' + l + '">' + DP.LANGS[l] + '</button>'; }).join('');
    var cards = DP.GAME_IDS.map(function (id) {
      var g = DP.GAMES[id], res = DP.result(id, d), prog = DP.store.get('prog:' + id + ':' + d, null), s = DP.stats(id);
      var status = res ? '<span class="badge done">✓ ' + t('solved') + '</span>' : '';
      return '<a class="card game-card ' + id + '" href="#/' + id + '"><div class="card-art">' + g.icon + '</div><div class="card-body">' +
        '<h3>' + t(g.nameKey) + '</h3><p>' + t(g.descKey) + '</p><div class="card-meta"><span class="badge">' + t('diff')[wd] + '</span>' +
        (s.streak ? '<span class="badge">🔥 ' + s.streak + '</span>' : '') + status + '</div></div>' +
        '<span class="btn ' + (res ? 'ghost' : 'primary') + ' small">' + (res ? t('share') : prog ? t('continue') : t('play')) + '</span></a>';
    }).join('');
    var allDone = DP.GAME_IDS.every(function (g) { return DP.result(g, d); });
    var shown = Math.min(meta % REWARD_DAYS || (meta ? REWARD_DAYS : 0), REWARD_DAYS);
    var dots = ''; for (var i = 0; i < REWARD_DAYS; i++) dots += '<i class="' + (i < shown ? 'on' : '') + '"></i>';
    app.innerHTML = '<header class="hub-head"><div class="langs">' + langs + '</div><h1>' + t('appTitle') + '</h1>' +
      '<p class="date">' + DP.esc(DP.dateLabel(d)) + ' · ' + t('puzzleNo', { n: d + 1 }) + '</p><p class="muted">' + t('tagline') + '</p></header>' +
      '<main class="hub">' + cards + (DP.rankCard ? DP.rankCard(d) : '') +
      '<section class="card reward"><div><h3>🎁 ' + t('rewardTitle') + ' · 🔥 ' + meta + '</h3><p>' + t('rewardBody', { n: REWARD_DAYS }) + '</p>' +
      '<div class="dots">' + dots + '</div><p class="muted small">' + t('rewardDays', { d: shown, n: REWARD_DAYS }) + '</p></div></section>' +
      (allDone ? '<p class="all-done">' + t('allDone') + '</p>' : '') +
      '<p class="countdown">' + t('nextIn') + ' <b data-countdown>' + DP.fmtCountdown(DP.msToNext()) + '</b></p></main>';
    app.querySelectorAll('[data-lang]').forEach(function (b) { b.onclick = function () { DP.setLang(b.dataset.lang); route(); }; });
  }

  function renderGame(id) {
    var g = DP.GAMES[id], d = DP.today();
    app.innerHTML = '<header class="game-head"><a class="icon-btn" href="#/" aria-label="' + t('back') + '">‹</a>' +
      '<div class="title"><h1>' + g.icon + ' ' + t(g.nameKey) + '</h1><p>' + t('puzzleNo', { n: d + 1 }) + ' · ' + t('diff')[DP.weekday(d)] + '</p></div>' +
      '<button class="icon-btn" data-help aria-label="' + t('howTo') + '">?</button></header><main class="game ' + id + '"></main>';
    app.querySelector('[data-help]').onclick = function () { DP.howTo(id); };
    var ctx = {
      day: d, puzzle: DP.puzzleFor(id, d),
      load: function () { return DP.store.get('prog:' + id + ':' + d, null); },
      save: function (p) { DP.store.set('prog:' + id + ':' + d, p); },
      result: function () { return DP.result(id, d); },
      finish: function (res) { DP.recordResult(id, d, res); }
    };
    current = g.mount(app.querySelector('main'), ctx) || null;
    if (!DP.store.get('seenHelp:' + id, false)) DP.howTo(id);
  }

  function route() {
    if (current && current.destroy) current.destroy();
    current = null;
    document.querySelectorAll('.modal-bg').forEach(function (m) { m.remove(); });
    var m = location.hash.match(/^#\/(\w+)(?:\/(\w+))?/) || [], id = m[1];
    window.scrollTo(0, 0);
    if (id === 'leaderboard' && DP.renderLeaderboard) { document.body.dataset.view = 'leaderboard'; DP.renderLeaderboard(app, m[2]); return; }
    document.body.dataset.view = DP.GAMES[id] ? id : 'hub';
    if (DP.GAMES[id]) renderGame(id); else renderHub();
  }

  DP.GAME_IDS = ['rush', 'mines', 'olinda'];
  DP.start = function () { document.documentElement.lang = DP.lang; window.addEventListener('hashchange', route); route(); };
})();
