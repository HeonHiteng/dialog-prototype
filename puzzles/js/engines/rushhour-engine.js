/* Tuk-Tuk Rush Hour engine — shared by browser + Node tools.
 * Board: 6x6 string of 36 chars, row-major. 'o' = empty, 'x' = fixed obstacle,
 * letters = vehicles ('A' = the red tuk-tuk, always horizontal on row 2).
 * A "move" = sliding one vehicle any distance (standard Rush Hour counting).
 */
(function (root) {
  var N = 6, EXIT_ROW = 2;

  function parse(board) {
    var cells = {}, walls = [];
    for (var i = 0; i < 36; i++) {
      var c = board[i];
      if (c === 'o' || c === '.') continue;
      if (c === 'x') { walls.push(i); continue; }
      (cells[c] = cells[c] || []).push(i);
    }
    var ids = Object.keys(cells).sort(function (a, b) { return a === 'A' ? -1 : b === 'A' ? 1 : a < b ? -1 : 1; });
    var vehicles = [], pos = [];
    ids.forEach(function (id) {
      var cs = cells[id], r0 = Math.floor(cs[0] / N), c0 = cs[0] % N;
      var horiz = cs.length > 1 && Math.floor(cs[1] / N) === r0;
      vehicles.push({ id: id, len: cs.length, horiz: horiz, fixed: horiz ? r0 : c0 });
      pos.push(horiz ? c0 : r0);
    });
    return { vehicles: vehicles, walls: walls, start: pos };
  }

  function cellsOf(v, p) {
    var out = [];
    for (var k = 0; k < v.len; k++) out.push(v.horiz ? v.fixed * N + p + k : (p + k) * N + v.fixed);
    return out;
  }

  function grid(puz, pos) {
    var g = new Array(36).fill(-1);
    puz.walls.forEach(function (w) { g[w] = -2; });
    puz.vehicles.forEach(function (v, i) { cellsOf(v, pos[i]).forEach(function (c) { g[c] = i; }); });
    return g;
  }

  /** Range [min,max] a vehicle can slide to given the current positions. */
  function range(puz, pos, i, g) {
    g = g || grid(puz, pos);
    var v = puz.vehicles[i], p = pos[i], lo = p, hi = p;
    function free(q) { return g[v.horiz ? v.fixed * N + q : q * N + v.fixed] === -1; }
    while (lo - 1 >= 0 && free(lo - 1)) lo--;
    while (hi + v.len < N && free(hi + v.len)) hi++;
    return [lo, hi];
  }

  function isSolved(puz, pos) { return pos[0] === N - puz.vehicles[0].len; }

  function neighbors(puz, pos) {
    var out = [], g = grid(puz, pos);
    for (var i = 0; i < puz.vehicles.length; i++) {
      var r = range(puz, pos, i, g);
      for (var q = r[0]; q <= r[1]; q++) if (q !== pos[i]) {
        var np = pos.slice(); np[i] = q; out.push(np);
      }
    }
    return out;
  }

  var key = function (pos) { return pos.join(''); };

  /** BFS: minimum number of moves to solve (null if unsolvable). */
  function solve(puz, start, cap) {
    start = start || puz.start; cap = cap || 500000;
    if (isSolved(puz, start)) return { moves: 0, path: [start] };
    var seen = new Map([[key(start), null]]), q = [start], head = 0;
    while (head < q.length) {
      var cur = q[head++];
      var nb = neighbors(puz, cur);
      for (var j = 0; j < nb.length; j++) {
        var k = key(nb[j]);
        if (seen.has(k)) continue;
        seen.set(k, cur);
        if (isSolved(puz, nb[j])) {
          var path = [nb[j]], p = cur;
          while (p) { path.unshift(p); p = seen.get(key(p)); }
          return { moves: path.length - 1, path: path };
        }
        if (seen.size > cap) return null;
        q.push(nb[j]);
      }
    }
    return null;
  }

  function serialize(puz, pos) {
    var g = new Array(36).fill('o');
    puz.walls.forEach(function (w) { g[w] = 'x'; });
    puz.vehicles.forEach(function (v, i) { cellsOf(v, pos[i]).forEach(function (c) { g[c] = v.id; }); });
    return g.join('');
  }

  var api = { N: N, EXIT_ROW: EXIT_ROW, parse: parse, cellsOf: cellsOf, grid: grid, range: range,
    isSolved: isSolved, neighbors: neighbors, solve: solve, serialize: serialize, key: key };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.DP = root.DP || {}).RushEngine = api;
})(this);
