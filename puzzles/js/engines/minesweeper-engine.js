/* Safe Sweep (no-guess Minesweeper) engine — shared by browser + Node tools.
 * A board is logically solvable from its fixed opening => its hidden layout is
 * the single answer consistent with the clues (no guessing ever required).
 */
(function (root) {
  function make(w, h, mineList) {
    var mines = new Array(w * h).fill(false);
    mineList.forEach(function (i) { mines[i] = true; });
    var nums = mines.map(function (m, i) {
      return m ? -1 : nbrs(w, h, i).filter(function (j) { return mines[j]; }).length;
    });
    return { w: w, h: h, mines: mines, nums: nums, count: mineList.length };
  }

  function nbrs(w, h, i) {
    var r = Math.floor(i / w), c = i % w, out = [];
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      var rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < h && cc >= 0 && cc < w) out.push(rr * w + cc);
    }
    return out;
  }

  /** Reveal a safe cell with flood fill of zeros. Mutates `revealed`; returns newly revealed list. */
  function flood(b, revealed, start) {
    var out = [], stack = [start];
    while (stack.length) {
      var i = stack.pop();
      if (revealed[i] || b.mines[i]) continue;
      revealed[i] = true; out.push(i);
      if (b.nums[i] === 0) nbrs(b.w, b.h, i).forEach(function (j) { if (!revealed[j]) stack.push(j); });
    }
    return out;
  }

  /** Logical solver. Returns {solved, level, steps} — level 1 = single-cell rules,
   *  2 = subset (pair) reasoning, 3 = full frontier enumeration incl. mine count. */
  function solve(b, startIdx) {
    var n = b.w * b.h, revealed = new Array(n).fill(false), flagged = new Array(n).fill(false);
    flood(b, revealed, startIdx);
    var level = 1, rounds = 0, safeTotal = n - b.count;
    function revealedCount() { return revealed.filter(Boolean).length; }

    function constraints() {
      var cs = [];
      for (var i = 0; i < n; i++) {
        if (!revealed[i] || b.nums[i] <= 0) continue;
        var unk = [], f = 0;
        nbrs(b.w, b.h, i).forEach(function (j) {
          if (flagged[j]) f++; else if (!revealed[j]) unk.push(j);
        });
        if (unk.length) cs.push({ cells: unk, mines: b.nums[i] - f });
      }
      return cs;
    }
    function apply(safe, mine) {
      var prog = false;
      mine.forEach(function (j) { if (!flagged[j]) { flagged[j] = true; prog = true; } });
      safe.forEach(function (j) {
        if (b.mines[j]) throw new Error('solver contradiction');
        if (!revealed[j]) { flood(b, revealed, j); prog = true; }
      });
      return prog;
    }

    while (revealedCount() < safeTotal) {
      if (++rounds > 2000) break;
      var cs = constraints(), safe = [], mine = [];
      // Level 1
      cs.forEach(function (c) {
        if (c.mines === 0) safe.push.apply(safe, c.cells);
        else if (c.mines === c.cells.length) mine.push.apply(mine, c.cells);
      });
      if (apply(safe, mine)) continue;
      // Level 2: subset rule
      for (var a = 0; a < cs.length && !safe.length && !mine.length; a++) {
        for (var bb = 0; bb < cs.length; bb++) {
          if (a === bb) continue;
          var A = cs[a], B = cs[bb];
          if (A.cells.length >= B.cells.length) continue;
          if (!A.cells.every(function (x) { return B.cells.indexOf(x) >= 0; })) continue;
          var diff = B.cells.filter(function (x) { return A.cells.indexOf(x) < 0; }), dm = B.mines - A.mines;
          if (dm === 0) safe.push.apply(safe, diff);
          else if (dm === diff.length) mine.push.apply(mine, diff);
        }
      }
      if (apply(safe, mine)) { level = Math.max(level, 2); continue; }
      // Level 3: enumerate all consistent frontier assignments (+ global mine count)
      var res = enumerate(b, revealed, flagged, cs);
      if (!res) break;
      if (apply(res.safe, res.mine)) { level = 3; continue; }
      break;
    }
    return { solved: revealedCount() === safeTotal, level: level };
  }

  function enumerate(b, revealed, flagged, cs) {
    var n = b.w * b.h, front = [], idx = {};
    cs.forEach(function (c) { c.cells.forEach(function (x) { if (!(x in idx)) { idx[x] = front.length; front.push(x); } }); });
    var others = [];
    for (var i = 0; i < n; i++) if (!revealed[i] && !flagged[i] && !(i in idx)) others.push(i);
    var flaggedCount = flagged.filter(Boolean).length, remaining = b.count - flaggedCount;
    var cellCons = front.map(function () { return []; });
    cs.forEach(function (c, ci) { c.cells.forEach(function (x) { cellCons[idx[x]].push(ci); }); });
    var assign = new Array(front.length).fill(-1), placed = cs.map(function () { return 0; }), open = cs.map(function (c) { return c.cells.length; });
    var mineHits = new Array(front.length).fill(0), safeHits = new Array(front.length).fill(0);
    var sols = 0, otherMineSol = 0, otherSafeSol = 0, nodes = 0, LIMIT = 300000, aborted = false;
    function rec(k, m) {
      if (++nodes > LIMIT) { aborted = true; return; }
      if (m > remaining) return;
      if (k === front.length) {
        var rest = remaining - m;
        if (rest < 0 || rest > others.length) return;
        sols++;
        for (var t = 0; t < front.length; t++) assign[t] ? mineHits[t]++ : safeHits[t]++;
        if (rest === others.length) otherMineSol++;
        if (rest === 0) otherSafeSol++;
        return;
      }
      for (var v = 0; v <= 1 && !aborted; v++) {
        var ok = true, list = cellCons[k];
        for (var q = 0; q < list.length; q++) {
          var c = cs[list[q]], np = placed[list[q]] + v, no = open[list[q]] - 1;
          if (np > c.mines || np + no < c.mines) { ok = false; break; }
        }
        if (!ok) continue;
        assign[k] = v;
        list.forEach(function (ci) { placed[ci] += v; open[ci]--; });
        rec(k + 1, m + v);
        list.forEach(function (ci) { placed[ci] -= v; open[ci]++; });
      }
      assign[k] = -1;
    }
    rec(0, 0);
    if (aborted || !sols) return null;
    var safe = [], mine = [];
    front.forEach(function (x, t) { if (!mineHits[t]) safe.push(x); else if (!safeHits[t]) mine.push(x); });
    if (others.length) {
      if (otherSafeSol === sols) safe.push.apply(safe, others);
      else if (otherMineSol === sols) mine.push.apply(mine, others);
    }
    return { safe: safe, mine: mine };
  }

  function encode(b) {
    var bits = b.mines.map(function (m) { return m ? 1 : 0; });
    while (bits.length % 4) bits.push(0);
    var s = '';
    for (var i = 0; i < bits.length; i += 4) s += (bits[i] * 8 + bits[i + 1] * 4 + bits[i + 2] * 2 + bits[i + 3]).toString(16);
    return s;
  }
  function decode(w, h, hex) {
    var list = [];
    for (var i = 0; i < w * h; i++) {
      var d = parseInt(hex[i >> 2], 16);
      if (d & (8 >> (i & 3))) list.push(i);
    }
    return make(w, h, list);
  }

  var api = { make: make, nbrs: nbrs, flood: flood, solve: solve, encode: encode, decode: decode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.DP = root.DP || {}).MineEngine = api;
})(this);
