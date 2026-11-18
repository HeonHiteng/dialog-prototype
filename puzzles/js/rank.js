/* Ranking tracker, in the style of LinkedIn's daily games:
   - your percentile against everyone who played today ("Top 12%"), plus a playful brag line
   - a friends leaderboard (MyDialog contacts) with streaks and nudges
   - your rank in Sri Lanka and in your district
   Other players are simulated with a seeded generator, so a day's board stays the same across reloads.
   A real build would fetch these numbers from the server. English only for now. */
(function () {
  var DP = window.DP;
  var GAMES = ['rush', 'mines', 'olinda'];
  var ICON = { rush: '🛺', mines: '🚧', olinda: '🔴', all: '🏆' };
  var TAB = { all: 'All 3', rush: 'Rush', mines: 'Potholes', olinda: 'Olinda' };
  var NAME = { rush: 'Tuk-Tuk Rush', mines: 'Pothole Patrol', olinda: 'Olinda', all: 'All 3 puzzles' };
  var MED = { rush: 95e3, mines: 120e3, olinda: 150e3 };   // median solve time on a Medium day
  var DIFF = [1.4, 0.8, 0.9, 1, 1.1, 1.2, 1.4];             // by weekday, same order as t('diff')
  var BRAG = { rush: 'Faster than {p}% of tuk-tuk drivers', mines: 'Sharper than {p}% of road inspectors',
    olinda: 'Wiser than {p}% of Avurudu champions', all: 'Quicker than {p}% of office lunch-break solvers' };
  // name, colour, skill (1 = median), streak
  var FRIENDS = [['Kasun', '#ca8a04', 0.72, 12], ['Amaya', '#0891b2', 0.85, 5], ['Malli', '#7c3aed', 0.95, 2],
    ['Shanika', '#db2777', 1.0, 9], ['Dinuk', '#2563eb', 0.9, 0], ['Thaththa', '#0f766e', 1.15, 1],
    ['Amma', '#e11d48', 1.3, 3], ['Ravi', '#ea580c', 1.1, 4]];

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function phi(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2),
    p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function esc(s) { return DP.esc(s); }

  /* ---------- scoring ---------- */
  // Ranked by time, plus seconds for sloppiness, so a fast but messy solve doesn't beat a clean one.
  DP.score = function (game, r) {
    if (!r || !r.won) return null;
    if (game === 'rush') return r.ms + 5e3 * Math.max(0, r.moves - r.par);
    if (game === 'mines') return r.ms + 10e3 * (r.mistakes || 0);
    if (game === 'olinda') return r.ms + 15e3 * Math.max(0, (r.tries || 1) - 1);
    return r.ms;
  };
  function penalty(game, r) {
    if (!r || !r.won) return '';
    var W = { rush: [5, 'extra move', 'extra moves'], mines: [10, 'pothole hit', 'pothole hits'], olinda: [15, 'retry', 'retries'] }[game];
    var n = game === 'rush' ? Math.max(0, r.moves - r.par) : game === 'mines' ? (r.mistakes || 0) : Math.max(0, (r.tries || 1) - 1);
    return n ? 'incl. +' + (n * W[0]) + 's for ' + n + ' ' + (n > 1 ? W[2] : W[1]) : '';
  }
  function myScore(game, d) {
    if (game !== 'all') return DP.score(game, DP.result(game, d));
    var tot = 0;
    for (var i = 0; i < GAMES.length; i++) { var s = DP.score(GAMES[i], DP.result(GAMES[i], d)); if (s == null) return null; tot += s; }
    return tot;
  }

  /* ---------- the field ---------- */
  function median(game, d) {
    if (game === 'all') return GAMES.reduce(function (t, g) { return t + median(g, d); }, 0);
    return MED[game] * DIFF[DP.weekday(d)];
  }
  function players(game, d) { var base = 38000 + Math.floor(rng(hash('n' + d))() * 24000); return game === 'all' ? Math.round(base * 0.46) : Math.round(base * (0.8 + rng(hash(game + d))() * 0.2)); }
  function beat(game, d, ms) {
    var z = (Math.log(ms) - Math.log(median(game, d))) / (game === 'all' ? 0.32 : 0.45);
    return Math.max(1, Math.min(99, Math.round((1 - phi(z)) * 100)));
  }
  function friendTime(f, game, d) {
    if (game === 'all') {
      var tot = 0;
      for (var i = 0; i < GAMES.length; i++) { var x = friendTime(f, GAMES[i], d); if (x == null) return null; tot += x; }
      return tot;
    }
    var r = rng(hash(f[0] + game + d));
    if (r() < 0.2) return null; // hasn't played yet
    return Math.round(median(game, d) * f[2] * Math.exp(gauss(r) * 0.28));
  }
  DP.board = function (game, d) {
    var rows = FRIENDS.map(function (f) { var ms = friendTime(f, game, d); return { name: f[0], color: f[1], ms: ms, streak: ms == null ? Math.max(0, f[3] - 1) : f[3] }; });
    rows.push({ name: 'You', color: 'var(--maroon)', ms: myScore(game, d), streak: game === 'all' ? DP.metaStreak() : DP.stats(game).streak, you: true });
    var played = rows.filter(function (r) { return r.ms != null; }).sort(function (a, b) { return a.ms - b.ms; });
    played.forEach(function (r, i) { r.rank = i + 1; });
    return { played: played, waiting: rows.filter(function (r) { return r.ms == null; }) };
  };
  DP.rankInfo = function (game, d) {
    var ms = myScore(game, d); if (ms == null) return null;
    var b = DP.board(game, d), me = b.played.filter(function (r) { return r.you; })[0];
    var pct = beat(game, d, ms), n = players(game, d), dn = Math.round(n * 0.22);
    var brag = Math.max(1, Math.min(99, pct + Math.round((rng(hash('b' + game + d))() - 0.5) * 12)));
    return { ms: ms, pct: pct, top: Math.max(1, 100 - pct), n: n, natRank: Math.max(1, Math.round((1 - pct / 100) * n)),
      district: 'Colombo', dn: dn, dRank: Math.max(1, Math.round((1 - pct / 100) * dn * (0.9 + rng(hash('d' + d))() * 0.2))),
      fRank: me.rank, fTotal: b.played.length, brag: BRAG[game].replace('{p}', brag) };
  };

  /* ---------- UI ---------- */
  function avatar(r) { return '<span class="lb-av" style="background:' + r.color + '">' + (r.you ? 'You' : esc(r.name[0])) + '</span>'; }
  function medal(n) { return n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : n; }
  function row(r) {
    return '<div class="lb-row' + (r.you ? ' you' : '') + '"><span class="lb-rk">' + medal(r.rank) + '</span>' + avatar(r) +
      '<span class="lb-nm">' + esc(r.you ? 'You' : r.name) + (r.streak ? '<small>🔥 ' + r.streak + '-day streak</small>' : '') + '</span>' +
      '<b class="lb-t">' + DP.fmtTime(r.ms) + '</b></div>';
  }
  function waitRow(r) {
    return '<div class="lb-row wait">' + '<span class="lb-rk">–</span>' + avatar(r) + '<span class="lb-nm">' + esc(r.you ? 'You' : r.name) +
      '<small>' + (r.you ? 'Not solved yet' : 'Hasn’t played yet') + '</small></span>' +
      (r.you ? '' : '<button class="btn small lb-nudge" data-nudge="' + esc(r.name) + '">Nudge</button>') + '</div>';
  }

  /** Block inside the end-of-game modal. */
  DP.rankBlock = function (game, d) {
    var info = DP.rankInfo(game, d), b = DP.board(game, d);
    if (!info) return '<div class="rank"><p class="muted small">Revealed solutions aren’t ranked. Solve tomorrow’s puzzle to get on the board.</p>' +
      '<a class="btn ghost wide" href="#/leaderboard/' + game + '">🏆 See how friends did</a></div>';
    // you plus the people right around you, like LinkedIn's connections strip
    var i = b.played.findIndex(function (r) { return r.you; }), from = Math.max(0, Math.min(i - 1, b.played.length - 3));
    var near = b.played.slice(from, from + 3);
    DP.saveRankSummary(d);
    return '<div class="rank"><div class="rank-top"><b>Top ' + info.top + '%</b><span>of ' + fmt(info.n) + ' players today</span></div>' +
      '<p class="rank-brag">' + ICON[game] + ' ' + info.brag + '</p>' +
      '<div class="rank-sub"><span>#' + info.fRank + ' of ' + info.fTotal + ' friends</span><span>#' + fmt(info.dRank) + ' in ' + info.district + '</span></div>' +
      (penalty(game, DP.result(game, d)) ? '<p class="muted small">Ranked on ' + DP.fmtTime(info.ms) + ' · ' + penalty(game, DP.result(game, d)) + '</p>' : '') +
      '<div class="lb-list mini">' + near.map(row).join('') + '</div>' +
      '<a class="btn ghost wide" href="#/leaderboard/' + game + '">🏆 Full leaderboard</a></div>';
  };
  DP.rankShareLine = function (game, d) { var i = DP.rankInfo(game, d); return i ? '\n🏆 Top ' + i.top + '% today · #' + i.fRank + ' of ' + i.fTotal + ' friends' : ''; };

  /** Hub card. */
  DP.rankCard = function (d) {
    var all = DP.rankInfo('all', d), best = null;
    GAMES.forEach(function (g) { var i = DP.rankInfo(g, d); if (i && (!best || i.fRank < best.i.fRank)) best = { g: g, i: i }; });
    var line;
    if (all) line = '<b>#' + all.fRank + ' of ' + all.fTotal + ' friends</b> overall · Top ' + all.top + '% in Sri Lanka';
    else if (best) line = '<b>#' + best.i.fRank + ' of ' + best.i.fTotal + ' friends</b> on ' + NAME[best.g] + '. Finish all 3 for an overall rank.';
    else { var lead = DP.board('rush', d).played[0]; line = lead ? esc(lead.name) + ' leads Tuk-Tuk Rush in ' + DP.fmtTime(lead.ms) + '. Can you beat it?' : 'Solve a puzzle to get ranked.'; }
    return '<a class="card game-card lb-card" href="#/leaderboard/' + (all ? 'all' : best ? best.g : 'rush') + '"><div class="card-art">🏆</div><div class="card-body"><h3>Today’s leaderboard</h3><p>' + line + '</p></div><span class="btn ghost small">View</span></a>';
  };

  /** Saved for the host app's Daily Puzzles card. */
  DP.saveRankSummary = function (d) {
    var all = DP.rankInfo('all', d), any = all || GAMES.map(function (g) { return DP.rankInfo(g, d); }).filter(Boolean).sort(function (a, b) { return a.fRank - b.fRank; })[0];
    if (any) DP.store.set('rank:' + d, { fRank: any.fRank, fTotal: any.fTotal, top: any.top, all: !!all });
  };

  /** Full leaderboard page: #/leaderboard/<all|rush|mines|olinda> */
  DP.renderLeaderboard = function (app, game) {
    var d = DP.today(); if (!NAME[game]) game = 'all';
    var info = DP.rankInfo(game, d), b = DP.board(game, d);
    var tabs = ['all'].concat(GAMES).map(function (g) { return '<a class="' + (g === game ? 'on' : '') + '" href="#/leaderboard/' + g + '">' + ICON[g] + ' ' + TAB[g] + '</a>'; }).join('');
    var you = info
      ? '<section class="card lb-you"><div class="lb-big"><b>#' + info.fRank + '</b><span>of ' + info.fTotal + ' friends</span></div><div class="lb-facts">' +
        '<div><b>Top ' + info.top + '%</b><span>of ' + fmt(info.n) + ' in Sri Lanka</span></div><div><b>#' + fmt(info.dRank) + '</b><span>of ' + fmt(info.dn) + ' in ' + info.district + '</span></div>' +
        '<div><b>' + DP.fmtTime(info.ms) + '</b><span>' + (game === 'all' ? 'combined time' : 'your time') + '</span></div></div><p class="rank-brag">' + ICON[game] + ' ' + info.brag + '</p></section>'
      : '<section class="card lb-you empty"><b>' + (game === 'all' ? 'Solve all 3 puzzles to get an overall rank' : 'Solve today’s ' + NAME[game] + ' to get ranked') + '</b>' +
        '<p class="muted small">' + fmt(players(game, d)) + ' people have played today.</p>' +
        '<a class="btn primary wide" href="#/' + (game === 'all' ? (GAMES.filter(function (g) { return !DP.result(g, d); })[0] || 'rush') : game) + '">Play now</a></section>';
    app.innerHTML = '<header class="game-head"><a class="icon-btn" href="#/" aria-label="Back">‹</a><div class="title"><h1>🏆 Leaderboard</h1><p>' +
      esc(DP.dateLabel(d)) + ' · ' + DP.t('puzzleNo', { n: d + 1 }) + '</p></div><span style="width:40px"></span></header>' +
      '<main class="lb-page"><nav class="lb-tabs">' + tabs + '</nav>' + you +
      '<h3 class="lb-h">Friends <small>MyDialog contacts who play</small></h3><section class="card lb-list">' +
      b.played.map(row).join('') + b.waiting.map(waitRow).join('') + '</section>' +
      '<p class="muted small lb-note">Ranked by time. Extra moves (+5s each), pothole hits (+10s) and Olinda retries (+15s) add to your time. Revealed solutions aren’t ranked. Boards reset at midnight.</p>' +
      '<p class="countdown">' + DP.t('nextIn') + ' <b data-countdown>' + DP.fmtCountdown(DP.msToNext()) + '</b></p></main>';
    app.querySelectorAll('[data-nudge]').forEach(function (bt) {
      bt.onclick = function () { bt.disabled = true; bt.textContent = 'Nudged ✓'; DP.toast('👋 Nudge sent to ' + bt.dataset.nudge); };
    });
    if (info) DP.saveRankSummary(d);
  };
})();
