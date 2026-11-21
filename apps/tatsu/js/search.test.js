// Self-check for the ported engine: node apps/tatsu/js/search.test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Searcher, romaji, toHira, metaLine } = require("./search.js");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/kanji.json"), "utf8"));
const s = new Searcher(data);
const first = (q) => (s.search(q)[0] || {}).k;
const top3 = (q) => s.search(q).slice(0, 3).map((e) => e.k);
const keys = (q) => s.search(q).map((e) => e.k);

assert(data.length > 10000);
assert.strictEqual(romaji("きょう"), "kyou");
assert.strictEqual(romaji("ニチ"), "nichi");
assert.strictEqual(romaji("た.べる"), "taberu");
assert.strictEqual(romaji("まっちゃ"), "matcha");
assert.strictEqual(romaji("がっこう"), "gakkou");
assert.strictEqual(romaji("じゅう"), "juu");
assert.strictEqual(romaji("あっ"), "a");
assert.strictEqual(toHira("ミズ"), "みず");
for (const [q, k] of [["water", "水"], ["みず", "水"], ["ミズ", "水"], ["mizu", "水"], ["sun", "日"],
  ["nichi", "日"], ["taberu", "食"], ["WATER", "水"]]) assert.strictEqual(first(q), k, q);
assert(top3("watr").includes("水"));
assert(top3("mountian").includes("山"));
assert.deepStrictEqual(keys("日本語"), ["日", "本", "語"]);
assert.deepStrictEqual(keys("日日本"), ["日", "本"]);
assert.deepStrictEqual(keys("日本 water"), ["日", "本"]);
for (const q of ["", "   ", "　", "🍣", "〇〇"]) assert.deepStrictEqual(keys(q), [], JSON.stringify(q));
assert(s.search("a", 5).length <= 5);
assert(s.kanji("水").m.includes("water") && s.kanji("x") === undefined);
assert.strictEqual(metaLine(s.kanji("水")), "4 strokes · grade 1 · JLPT 4 · #223 freq");
console.log("search self-check: ok (" + data.length + " kanji)");
