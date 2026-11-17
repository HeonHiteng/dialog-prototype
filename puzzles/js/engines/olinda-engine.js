/* Olinda: The Grand Sweep — engine shared by browser + Node tools.
 * Olinda Keliya / Pallanguzhi-style relay sowing on a 2x7 board (14 pits).
 *
 * Pit indices run counter-clockwise: 0..6 = YOUR row (bottom, left->right),
 * 7..13 = the other row (top, right->left). Opposite of pit i is 13 - i.
 *
 * A move:
 *  1. Pick up every seed from one of your non-empty pits.
 *  2. Sow one seed into each following pit (counter-clockwise).
 *  3. PASU: whenever a dropped seed makes a pit hold exactly 4, those 4 seeds go
 *     to the owner of that row (yours if bottom, lost to the other side if top).
 *  4. When your hand is empty, look at the NEXT pit:
 *       - has seeds  -> scoop them up and keep sowing (relay);
 *       - is empty   -> you capture the pit AFTER it (the Sweep). If the pit after
 *                       that is empty too and the one beyond has seeds, sweep again.
 *       - two empty pits in a row -> turn ends.
 */
(function (root) {
  var P = 14, STEP_CAP = 400;

  function owner(i) { return i < 7 ? 'me' : 'them'; }

  /** Returns {pits, me, them, events} or null if pit illegal / move never terminates. */
  function play(state, pit, wantEvents) {
    if (pit < 0 || pit > 6 || !state.pits[pit]) return null;
    var pits = state.pits.slice(), me = state.me, them = state.them, ev = wantEvents ? [] : null, steps = 0;
    var hand = pits[pit], at = pit; pits[pit] = 0;
    if (ev) ev.push({ t: 'pick', pit: pit, n: hand });
    while (true) {
      while (hand > 0) {
        at = (at + 1) % P; pits[at]++; hand--;
        if (ev) ev.push({ t: 'sow', pit: at });
        if (pits[at] === 4) {
          if (owner(at) === 'me') me += 4; else them += 4;
          pits[at] = 0;
          if (ev) ev.push({ t: 'pasu', pit: at, who: owner(at) });
        }
        if (++steps > STEP_CAP) return null;
      }
      var next = (at + 1) % P;
      if (pits[next] > 0) {
        hand = pits[next]; pits[next] = 0; at = next;
        if (ev) ev.push({ t: 'pick', pit: next, n: hand, relay: true });
        continue;
      }
      // next is empty -> sweep chain
      var gap = next;
      while (true) {
        var target = (gap + 1) % P;
        if (!pits[target]) break;
        me += pits[target];
        if (ev) ev.push({ t: 'capture', pit: target, n: pits[target], gap: gap });
        pits[target] = 0;
        gap = (target + 1) % P;
        if (pits[gap]) break; // chain continues only across another empty pit
      }
      if (ev) ev.push({ t: 'end' });
      break;
    }
    return { pits: pits, me: me, them: them, events: ev };
  }

  function legal(state) {
    var out = [];
    for (var i = 0; i < 7; i++) if (state.pits[i]) out.push(i);
    return out;
  }

  /** Enumerate every line of play up to `moves` moves (stopping early if you have no seeds). */
  function allLines(state, moves) {
    var lines = [], broken = false;
    (function rec(s, seq) {
      var opts = seq.length < moves ? legal(s) : [];
      if (!opts.length) { lines.push({ seq: seq, me: s.me - state.me, them: s.them - state.them, left: sum(s.pits) }); return; }
      opts.forEach(function (p) {
        var r = play(s, p);
        if (!r) { broken = true; return; }
        rec(r, seq.concat(p));
      });
    })(state, []);
    return broken ? null : lines;
  }

  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  var api = { P: P, play: play, legal: legal, allLines: allLines, sum: sum, owner: owner };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.DP = root.DP || {}).OlindaEngine = api;
})(this);
