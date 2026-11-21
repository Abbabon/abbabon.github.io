// Port of apple/Tatsu/Search.swift (kanji-offline). Same normalisation, romaji table and score ladder.
// Works as a browser global (TatsuSearch) and as a CommonJS module for the node self-check.
(function (root) {
  "use strict";

  // Katakana (ァ-ヶ) to hiragana; everything else unchanged.
  function toHira(s) {
    let out = "";
    for (const c of s) {
      const v = c.codePointAt(0);
      out += v >= 0x30a1 && v <= 0x30f6 ? String.fromCodePoint(v - 0x60) : c;
    }
    return out;
  }

  // kana -> wapuro romaji. Digraphs are looked up first so they win.
  const ROMA = (() => {
    const table =
      "きゃkya きゅkyu きょkyo しゃsha しゅshu しょsho ちゃcha ちゅchu ちょcho にゃnya にゅnyu にょnyo " +
      "ひゃhya ひゅhyu ひょhyo みゃmya みゅmyu みょmyo りゃrya りゅryu りょryo ぎゃgya ぎゅgyu ぎょgyo " +
      "じゃja じゅju じょjo ぢゃja ぢゅju ぢょjo びゃbya びゅbyu びょbyo ぴゃpya ぴゅpyu ぴょpyo " +
      "あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto " +
      "なna にni ぬnu ねne のno はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya ゆyu よyo " +
      "らra りri るru れre ろro わwa ゐwi ゑwe をwo んn がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo " +
      "だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo ぁa ぃi ぅu ぇe ぉo ゔvu";
    const out = new Map();
    for (const token of table.split(" ")) {
      const m = token.match(/^([^a-z]+)([a-z]+)$/);
      out.set(m[1], m[2]);
    }
    return out;
  })();

  function romaji(kana) {
    const k = Array.from(toHira(kana)).filter((c) => c !== "." && c !== "-" && c !== "ー");
    let out = "";
    let i = 0;
    while (i < k.length) {
      if (k[i] === "っ") {
        // small tsu doubles the next consonant ("tch" for ch)
        const rest = romaji(k.slice(i + 1).join(""));
        const f = rest[0];
        const dbl = f === undefined ? "" : "aeiou".includes(f) ? "" : f === "c" ? "t" : f;
        return out + dbl + rest;
      }
      const two = i + 1 < k.length ? ROMA.get(k[i] + k[i + 1]) : undefined;
      if (two !== undefined) {
        out += two;
        i += 2;
      } else {
        out += ROMA.get(k[i]) ?? k[i];
        i += 1;
      }
    }
    return out;
  }

  // Edit distance <= 1 (insert, delete, substitute, or swap two neighbours).
  function within1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, used = false;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (used) return false;
      used = true;
      if (a.length === b.length && i + 1 < a.length && j + 1 < b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) {
        i += 2; j += 2; continue;
      }
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else { i++; j++; }
    }
    return true;
  }

  // True if all of q's characters appear in s, in order.
  function subseq(q, s) {
    const qa = Array.from(q);
    let w = 0;
    for (const c of s) if (w < qa.length && c === qa[w]) w++;
    return w === qa.length;
  }

  function score(q, s, qLen, qChars) {
    if (s === q) return 100;
    if (s.startsWith(q)) return 80;
    if ((" " + s).includes(" " + q)) return 70;
    if (s.includes(q)) return 55;
    if (qLen >= 4 && s.split(" ").some((w) => within1(qChars, Array.from(w)))) return 50;
    if (qLen >= 3 && subseq(q, s)) return 30;
    return 0;
  }

  const isWs = (c) => /\s/.test(c);
  const trim = (s) => s.replace(/^[\s　]+|[\s　]+$/g, "");

  // In-memory index over all kanji. Build once; ~10k entries scanned linearly per query.
  function Searcher(list) {
    const strip = (s) => toHira(s).replace(/[.-]/g, "");
    this.entries = list.map((e) => {
      const kana = e.on.concat(e.kun).map(strip);
      return { kanji: e, meanings: e.m.map((m) => m.toLowerCase()), kana, roma: kana.map(romaji) };
    });
    this.byKanji = new Map();
    for (const e of list) if (!this.byKanji.has(e.k)) this.byKanji.set(e.k, e);
  }

  Searcher.prototype.kanji = function (c) { return this.byKanji.get(c); };

  Searcher.prototype.search = function (query, limit = 60) {
    const q = toHira(trim(query).toLowerCase());
    if (q === "") return [];

    // any known kanji in the input: list those, in order, once each
    const seen = new Set();
    const listed = [];
    for (const c of q) {
      const e = this.byKanji.get(c);
      if (e && !seen.has(c)) { seen.add(c); listed.push(e); }
    }
    if (listed.length) return listed;

    const isKana = Array.from(q).every((c) => { const v = c.codePointAt(0); return v >= 0x3041 && v <= 0x309f; });
    const qChars = Array.from(q);
    const qLen = qChars.length;
    const hits = [];
    for (let index = 0; index < this.entries.length; index++) {
      const e = this.entries[index];
      let best = 0;
      const fields = isKana ? e.kana : e.meanings.concat(e.roma);
      for (const f of fields) {
        best = Math.max(best, score(q, f, qLen, qChars));
        if (best === 100) break;
      }
      if (best > 0) hits.push({ score: best, index, kanji: e.kanji });
    }
    // higher score, then more frequent (unranked last), then data order
    const rank = (f) => (f === 0 ? 9999 : f);
    hits.sort((a, b) =>
      a.score !== b.score ? b.score - a.score
      : rank(a.kanji.f) !== rank(b.kanji.f) ? rank(a.kanji.f) - rank(b.kanji.f)
      : a.index - b.index);
    return hits.slice(0, limit).map((h) => h.kanji);
  };

  // "た.べる" -> kana た (shown over the kanji), okurigana べる after it; "-" marks prefix/suffix.
  function readingParts(reading) {
    const dot = reading.indexOf(".");
    let stem = dot < 0 ? reading : reading.slice(0, dot);
    const okurigana = dot < 0 ? "" : reading.slice(dot + 1);
    const prefix = stem.startsWith("-") ? "-" : "";
    if (prefix) stem = stem.slice(1);
    const suffix = stem.endsWith("-") ? "-" : "";
    if (suffix) stem = stem.slice(0, -1);
    return { prefix, kana: stem, okurigana, suffix };
  }

  function gradeLabel(g) { return g <= 6 ? "grade " + g : g === 8 ? "jōyō (secondary)" : "jinmeiyō"; }

  function metaLine(e) {
    const p = [e.s + " strokes"];
    if (e.g > 0) p.push(gradeLabel(e.g));
    if (e.j > 0) p.push("JLPT " + e.j);
    if (e.f > 0) p.push("#" + e.f + " freq");
    return p.join(" · ");
  }

  const api = { toHira, romaji, Searcher, readingParts, metaLine };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TatsuSearch = api;
})(typeof self !== "undefined" ? self : this);
