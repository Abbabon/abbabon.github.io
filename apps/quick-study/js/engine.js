/* Port of Quick Study's engine/src/query.rs + search.rs (released filter keys only: r, c, t, mv, o, s).
   Same layers and scores as the app: 1000 exact, 800 prefix, 600 token start, 500 set code,
   450 set name exact, 400 substring, 350 set name prefix/token, 200-spread subsequence.
   The app's byte-level fast path is an optimisation of the same scoring, so only the reference
   ("slow") scorer is ported. Runs over the small bundled set, so no index tricks are needed. */
(function (root) {
  'use strict';
  var FIELDS = { r: 'rarity', rarity: 'rarity', c: 'color', color: 'color', t: 'type', type: 'type',
    mv: 'mv', cmc: 'mv', o: 'oracle', oracle: 'oracle', s: 'set', set: 'set' };
  var BLANK = /^[\t    -   　]+|[\t    -   　]+$/g;
  var NO_COLORS = 0x80;

  function lower(s) { return s.toLowerCase(); }

  function unquote(s) {
    return s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"' ? s.slice(1, -1) : s;
  }

  function tokenize(s) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < s.length; i++) {
      var g = s[i];
      if (g === '"') { q = !q; cur += g; }
      else if (g === ' ' && !q) { if (cur) { out.push(cur); cur = ''; } }
      else cur += g;
    }
    if (cur) out.push(cur);
    return out;
  }

  function parseFilter(token) {
    var i = 0, negated = token[0] === '-';
    if (negated) i = 1;
    var k = i;
    while (k < token.length && /\p{L}/u.test(token[k])) k++;
    if (k === i) return null;
    var field = FIELDS[lower(token.slice(i, k))];
    if (!field) return null;
    var rest = token.slice(k), op, skip;
    if (rest.startsWith('>=')) { op = 'ge'; skip = 2; }
    else if (rest.startsWith('<=')) { op = 'le'; skip = 2; }
    else if (rest[0] === '>') { op = 'gt'; skip = 1; }
    else if (rest[0] === '<') { op = 'lt'; skip = 1; }
    else if (rest[0] === '=' || rest[0] === ':') { op = 'eq'; skip = 1; }
    else return null;
    var value = lower(unquote(rest.slice(skip)));
    if (!value) return null;
    return { field: field, op: op, value: value, negated: negated };
  }

  function parse(raw) {
    var tokens = tokenize(raw), parsed = tokens.map(parseFilter), name = [], filters = [];
    tokens.forEach(function (t, i) {
      var l = lower(t);
      var between = i > 0 && parsed[i - 1] && parsed[i + 1];
      if (l === '&' || l === '&&' || (l === 'and' && between)) return;
      if (parsed[i]) filters.push(parsed[i]); else name.push(unquote(t));
    });
    return { name: name.join(' ').replace(BLANK, ''), filters: filters };
  }

  // ---- scoring ----
  function bonus(n) { return Math.max(0, 100 - n.length); }
  function words(s) { return s.split(' ').filter(Boolean); }

  function tokenStart(q, n) {
    var toks = words(n);
    if (q.indexOf(' ') < 0) {
      return toks.some(function (t) { return t.startsWith(q); }) && !(toks[0] || '').startsWith(q);
    }
    var qw = words(q);
    if (qw.length > toks.length) return false;
    for (var s = 0; s <= toks.length - qw.length; s++) {
      if (qw.every(function (w, i) { return toks[s + i].startsWith(w); })) return true;
    }
    return false;
  }

  function score(q, n) {
    var b = bonus(n);
    if (n === q) return 1000 + b;
    if (n.startsWith(q)) return 800 + b;
    if (tokenStart(q, n)) return 600 + b;
    if (n.indexOf(q) >= 0) return 400 + b;
    var qi = 0, first = -1, last = -1;
    for (var i = 0; i < n.length; i++) {
      if (qi < q.length && n[i] === q[qi]) { if (first < 0) first = i; last = i; qi++; }
    }
    return qi === q.length ? 200 - (last - first) : null;
  }

  function setNameBase(q, n) {
    if (n === q) return 450;
    return n.startsWith(q) || tokenStart(q, n) ? 350 : null;
  }

  // ---- filters ----
  var BITS = { w: 1, u: 2, b: 4, r: 8, g: 16 };
  var COLOR_WORDS = { white: 1, blue: 2, black: 4, red: 8, green: 16, colorless: 0 };
  function colorWant(v) {
    if (v in COLOR_WORDS) return COLOR_WORDS[v];
    var m = 0;
    for (var i = 0; i < v.length; i++) {
      var ch = v[i];
      if (ch === 'c') return 0;
      if (BITS[ch]) m |= BITS[ch];
    }
    return m;
  }
  var RANK = { common: 0, uncommon: 1, rare: 2, mythic: 3 };
  var CANON = { c: 'common', u: 'uncommon', r: 'rare', m: 'mythic', 'mythic rare': 'mythic' };
  function matchesRarity(f, rarities) {
    var target = CANON[f.value] || f.value, tr = RANK[target];
    if (tr === undefined || f.op === 'eq') return rarities.indexOf(target) >= 0;
    return rarities.some(function (r) {
      var k = RANK[r]; if (k === undefined) return false;
      return f.op === 'gt' ? k > tr : f.op === 'ge' ? k >= tr : f.op === 'lt' ? k < tr : k <= tr;
    });
  }
  function matchesMv(op, cmc, t) {
    if (cmc == null || isNaN(t)) return false;
    return op === 'eq' ? cmc === t : op === 'gt' ? cmc > t : op === 'ge' ? cmc >= t : op === 'lt' ? cmc < t : cmc <= t;
  }

  function Index(data) {
    var self = this;
    this.cards = data.cards.map(function (c) {
      var mask = 0;
      c.c.forEach(function (x) { mask |= BITS[x.toLowerCase()] || 0; });
      return { c: c, nl: lower(c.n), mask: c.c.length ? mask : NO_COLORS, tl: lower(c.t), ol: lower(c.o),
        rar: c.rs.map(lower) };
    });
    var sorted = this.cards.slice().sort(function (a, b) { return a.nl < b.nl ? -1 : a.nl > b.nl ? 1 : a.c.id < b.c.id ? -1 : 1; });
    sorted.forEach(function (x, i) { x.rank = i; });
    this.byId = {};
    this.cards.forEach(function (x) { self.byId[x.c.id] = x; });
    this.sets = Object.keys(data.sets).map(function (code) {
      return { code: lower(code), name: lower(data.sets[code].n), ids: data.sets[code].ids };
    });
    this.setByCode = {};
    this.sets.forEach(function (s) { (self.setByCode[s.code] = self.setByCode[s.code] || {}); s.ids.forEach(function (id) { self.setByCode[s.code][id] = 1; }); });
  }

  Index.prototype.passes = function (x, fs) {
    var self = this;
    return fs.every(function (f) {
      var raw;
      switch (f.field) {
        case 'rarity': raw = matchesRarity(f, x.rar); break;
        case 'color': { var w = colorWant(f.value); raw = w === 0 ? x.mask === NO_COLORS : (x.mask & w) === w; break; }
        case 'type': raw = x.tl.indexOf(f.value) >= 0; break;
        case 'oracle': raw = x.ol.indexOf(f.value) >= 0; break;
        case 'mv': raw = matchesMv(f.op, x.c.cmc, parseFloat(f.value)); break;
        case 'set': raw = lower(x.c.sc) === f.value || !!(self.setByCode[f.value] && self.setByCode[f.value][x.c.id]); break;
      }
      return raw !== f.negated;
    });
  };

  Index.prototype.search = function (query, limit) {
    limit = limit || 20;
    var p = parse(query), q = lower(p.name.replace(BLANK, '')), self = this, fs = p.filters, cands = [];
    if (!q) {
      if (!fs.length) return { hits: [], total: 0 };
      this.cards.forEach(function (x) { if (self.passes(x, fs)) cands.push([bonus(x.nl), x]); });
    } else {
      var best = {};
      this.cards.forEach(function (x) {
        var s = score(q, x.nl);
        if (s !== null) best[x.c.id] = s;
      });
      this.sets.forEach(function (s) {
        var base = q === s.code ? 500 : null, nb = setNameBase(q, s.name);
        if (nb !== null) base = base === null ? nb : Math.max(base, nb);
        if (base === null) return;
        s.ids.forEach(function (id) {
          var cand = base + bonus(self.byId[id].nl);
          if (best[id] === undefined || cand > best[id]) best[id] = cand;
        });
      });
      Object.keys(best).forEach(function (id) {
        var x = self.byId[id];
        if (!fs.length || self.passes(x, fs)) cands.push([best[id], x]);
      });
    }
    cands.sort(function (a, b) { return a[0] !== b[0] ? b[0] - a[0] : a[1].rank - b[1].rank; });
    return { hits: cands.slice(0, limit).map(function (c) { return c[1].c; }), total: cands.length, filters: fs, name: p.name };
  };

  var api = { Index: Index, parse: parse };
  if (typeof module !== 'undefined') module.exports = api; else root.QSEngine = api;
})(this);
