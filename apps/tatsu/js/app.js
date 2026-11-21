(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 860px)");
  const T = window.TatsuSearch;

  /* ---- store links: platform order, GoatCounter events ---- */
  const ua = navigator.userAgent;
  const android = /Android/i.test(ua);
  root.dataset.platform = android ? "android" : "apple";
  const STORE = {
    appstore: ["https://apps.apple.com/app/tatsu-offline-kanji/id6818216743", "App Store"],
    googleplay: ["https://play.google.com/store/apps/details?id=com.abbabon.kanjioffline", "Google Play"],
  };
  const sticky = $("#sticky");
  if (android) {
    sticky.href = STORE.googleplay[0];
    sticky.dataset.store = "googleplay";
    $("#sticky-store").textContent = STORE.googleplay[1];
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-store]");
    if (!a || !window.goatcounter || !window.goatcounter.count) return;
    const s = a.dataset.store;
    try {
      window.goatcounter.count({ event: true, path: "tatsu-click-" + s,
        title: STORE[s][1] + " click" + (a.hasAttribute("data-sticky") ? " (sticky bar)" : "") });
    } catch (_) {}
  });

  /* ---- hero cut: replay on tap, nudge on pointer ---- */
  const glyph = $("#glyph");
  const stage = $("#stage");
  stage.addEventListener("click", () => {
    glyph.classList.remove("run");
    void glyph.offsetWidth;
    if (!reduce) glyph.classList.add("run");
  });
  if (!reduce && matchMedia("(hover: hover)").matches) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      glyph.style.setProperty("--px", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(2));
      glyph.style.setProperty("--py", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(2));
    });
    stage.addEventListener("pointerleave", () => { glyph.style.setProperty("--px", 0); glyph.style.setProperty("--py", 0); });
  }

  /* ---- reveal on scroll, rules, sticky bar ---- */
  const io = "IntersectionObserver" in window && new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  $$(".reveal, .cuts-list li").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  const g2 = $("#glyph2");
  if (io && !reduce) {
    const o2 = new IntersectionObserver((es) => { if (es[0].isIntersecting) { g2.classList.add("run"); o2.disconnect(); } }, { threshold: 0.6 });
    o2.observe(g2);
  }

  let heroOut = false, getIn = false, kb = false;
  const syncSticky = () => sticky.classList.toggle("show", heroOut && !getIn && !kb);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { heroOut = !es[0].isIntersecting; syncSticky(); }).observe($(".badges"));
    new IntersectionObserver((es) => { getIn = es[0].isIntersecting; syncSticky(); }, { threshold: 0.2 }).observe($("#get"));
  }

  /* ---- screenshots: platform tabs and light/dark ---- */
  const shots = $("#shots");
  const dark = matchMedia("(prefers-color-scheme: dark)");
  let theme = dark.matches ? "dark" : "light", plat = "iphone";
  function paintShots() {
    const eff = plat === "android" ? "light" : theme;
    shots.className = "t-" + eff;
    $$("#theme button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.t === eff)); b.disabled = plat === "android"; });
    $$("#plat button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.p === plat)));
    $$(".panel", shots).forEach((p) => (p.hidden = p.id !== "p-" + plat));
  }
  $("#plat").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { plat = b.dataset.p; paintShots(); } });
  $("#plat").addEventListener("keydown", (e) => {
    const bs = $$("#plat button"), i = bs.indexOf(document.activeElement);
    if (i < 0 || !/Arrow(Left|Right)/.test(e.key)) return;
    const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length];
    n.focus(); n.click();
  });
  $("#theme").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && !b.disabled) { theme = b.dataset.t; paintShots(); } });
  dark.addEventListener && dark.addEventListener("change", (e) => { theme = e.matches ? "dark" : "light"; paintShots(); });
  if (android) plat = "android";
  paintShots();

  /* ---- demo ---- */
  const demo = $("#demo"), q = $("#q"), list = $("#list"), detail = $("#detail"), hint = $("#hint");
  const clearBtn = $("#clear"), statusEl = $("#status"), statusT = $("#status-t");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const SEED = ["水", "山", "日", "食", "語", "花"];
  const KEY = "tatsu.demo.recent";
  let searcher = null, loading = null, results = [], sel = -1, recent = loadRecent(), cached = false;

  function loadRecent() {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch (_) {}
    return SEED.slice();
  }
  function saveRecent() { try { localStorage.setItem(KEY, JSON.stringify(recent)); } catch (_) {} }
  function touchRecent(k) { recent = [k].concat(recent.filter((x) => x !== k)).slice(0, 30); saveRecent(); }

  function setStatus() {
    const off = navigator.onLine === false;
    let t = !searcher ? "Loading the dictionary…" : searcher.entries.length.toLocaleString("en-US") + " kanji loaded";
    if (searcher && off) t += " · network off, still searching";
    else if (searcher && cached) t += " · saved for offline use";
    statusEl.classList.toggle("ready", !!searcher && !off);
    statusEl.classList.toggle("off", !!searcher && off);
    statusT.textContent = t;
  }
  addEventListener("online", setStatus);
  addEventListener("offline", setStatus);

  function load() {
    if (loading) return loading;
    loading = fetch("data/kanji.json").then((r) => r.json()).then((d) => {
      searcher = new T.Searcher(d);
      setStatus();
      run();
      checkCache();
    }).catch(() => { statusT.textContent = "Could not load the dictionary. Reload to try again."; loading = null; });
    return loading;
  }
  function checkCache() {
    if (!("caches" in window)) return;
    caches.match("data/kanji.json").then((m) => { if (m) { cached = true; setStatus(); } else setTimeout(checkCache, 1500); }).catch(() => {});
  }
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  addEventListener("load", () => setTimeout(load, 300));
  setStatus();

  function rowHTML(e, i) {
    return '<button class="row" role="option" type="button" id="r' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
      '<span class="g" lang="ja">' + esc(e.k) + '</span><span class="t"><span class="m">' + esc(e.m.join(", ")) + '</span>' +
      '<span class="r" lang="ja">' + esc(e.on.concat(e.kun).join("、")) + "</span></span></button>";
  }
  function render() {
    const blank = q.value.trim() === "";
    clearBtn.classList.toggle("show", q.value !== "");
    if (!searcher) { list.innerHTML = '<p class="empty">Loading the dictionary…</p>'; return; }
    if (blank) {
      results = recent.map((k) => searcher.kanji(k)).filter(Boolean);
      list.innerHTML = results.length
        ? '<h3>Recent <button type="button" id="clr-recent">Clear</button></h3>' + results.map(rowHTML).join("")
        : '<p class="empty">Type English, hiragana, katakana, romaji, or paste kanji.</p>';
    } else {
      list.innerHTML = results.length ? results.map(rowHTML).join("") : '<p class="empty"><b>No matches.</b></p>';
    }
    q.setAttribute("aria-activedescendant", sel >= 0 && results[sel] ? "r" + sel : "");
  }
  function run() {
    if (!searcher) { render(); return; }
    const v = q.value;
    results = v.trim() === "" ? [] : searcher.search(v);
    sel = results.length && !mobile.matches && v.trim() !== "" ? 0 : -1;
    render();
    list.scrollTop = 0;
    showDetail();
  }
  function setSel(i, open) {
    if (!results.length) return;
    sel = Math.max(0, Math.min(results.length - 1, i));
    $$(".row", list).forEach((r, n) => r.setAttribute("aria-selected", String(n === sel)));
    q.setAttribute("aria-activedescendant", "r" + sel);
    const r = $("#r" + sel, list); if (r) r.scrollIntoView({ block: "nearest" });
    showDetail();
    if (open) { touchRecent(results[sel].k); openSheet(); }
  }

  function reading(k, r) {
    const p = T.readingParts(r);
    return '<span class="rd"><span class="rd-k" lang="ja">' + esc(p.kana) + '</span><span class="rd-j" lang="ja">' +
      esc(p.prefix + k + p.okurigana + p.suffix) + '</span><span class="rd-r">' + esc(T.romaji(r)) + "</span></span>";
  }
  function showDetail() {
    const e = sel >= 0 ? results[sel] : null;
    if (!e) {
      detail.innerHTML = '<div class="d-empty"><div class="big" lang="ja" aria-hidden="true">断</div><strong>Start typing to search</strong><span>English, kana, romaji, or kanji</span></div>';
      return;
    }
    const rows = (label, a) => a.length ? '<div class="d-label">' + label + '</div><div class="rds">' + a.map((r) => reading(e.k, r)).join("") + "</div>" : "";
    detail.innerHTML = '<span class="grab"></span><button class="d-close" type="button" id="d-close" aria-label="Close detail">&times;</button>' +
      '<div class="d-top"><p class="d-glyph" lang="ja">' + esc(e.k) + '</p><button class="copy" type="button" id="copy"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg><span>Copy</span></button></div>' +
      '<p class="d-mean">' + esc(e.m.join(", ")) + "</p>" + rows("On", e.on) + rows("Kun", e.kun) +
      (e.n.length ? '<div class="d-label">Names</div><p class="d-names" lang="ja">' + esc(e.n.join("、")) + "</p>" : "") +
      '<p class="d-meta">' + esc(T.metaLine(e)) + "</p>";
  }

  let lastFocus = null;
  function openSheet() {
    if (!mobile.matches) return;
    lastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : q;
    q.blur();
    demo.classList.remove("kb"); kb = false; syncSticky();
    demo.classList.add("open");
    detail.setAttribute("role", "dialog"); detail.setAttribute("aria-modal", "true");
    setTimeout(() => { const c = $("#d-close"); if (c) c.focus({ preventScroll: true }); }, 50);
  }
  function closeSheet() {
    if (!demo.classList.contains("open")) return;
    demo.classList.remove("open");
    detail.removeAttribute("role"); detail.removeAttribute("aria-modal");
    if (lastFocus && lastFocus !== q) lastFocus.focus({ preventScroll: true });
  }
  function copy() {
    const e = results[sel]; if (!e) return;
    touchRecent(e.k);
    const done = () => { const s = $("#copy span"); if (s) { s.textContent = "Copied"; setTimeout(() => { const t = $("#copy span"); if (t) t.textContent = "Copy"; }, 1400); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(e.k).then(done, fallback); else fallback();
    function fallback() {
      const t = document.createElement("textarea"); t.value = e.k; t.style.cssText = "position:fixed;opacity:0;font-size:16px";
      document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (_) {} t.remove();
    }
  }

  q.addEventListener("input", () => { hint.textContent = ""; $$(".chip").forEach((c) => c.setAttribute("aria-pressed", "false")); load(); run(); });
  q.addEventListener("focus", () => {
    load();
    if (!mobile.matches) return;
    demo.classList.add("kb"); kb = true; syncSticky();
    setTimeout(() => demo.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }), 280);
  });
  q.addEventListener("blur", () => { demo.classList.remove("kb"); kb = false; syncSticky(); });
  q.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(sel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(sel < 0 ? 0 : sel - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (results.length) setSel(sel < 0 ? 0 : sel, true); }
    else if (e.key === "Escape" && q.value) { q.value = ""; run(); }
  });
  $("#form").addEventListener("submit", (e) => e.preventDefault());
  $("#form").addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") { e.preventDefault(); q.select(); } });
  clearBtn.addEventListener("click", () => { q.value = ""; run(); q.focus(); });
  list.addEventListener("click", (e) => {
    if (e.target.closest("#clr-recent")) { recent = []; saveRecent(); sel = -1; render(); showDetail(); return; }
    const r = e.target.closest(".row"); if (r) setSel(+r.dataset.i, true);
  });
  detail.addEventListener("click", (e) => { if (e.target.closest("#copy")) copy(); else if (e.target.closest("#d-close")) closeSheet(); });
  $("#scrim").addEventListener("click", closeSheet);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
  mobile.addEventListener && mobile.addEventListener("change", () => { closeSheet(); run(); });
  $("#chips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    $$(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    q.value = c.dataset.q; hint.textContent = c.dataset.h || ""; load(); run();
    list.scrollTop = 0;
  });

  // keep the demo's height tied to the visible area while the on-screen keyboard is up
  if (window.visualViewport) {
    const upd = () => demo.style.setProperty("--vvh", visualViewport.height + "px");
    visualViewport.addEventListener("resize", upd); upd();
  }
  render(); showDetail();
})();
