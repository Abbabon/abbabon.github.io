/* Quick Study landing page: search demo, tilt + foil cards, clips, trailer, share, analytics events. */
(function () {
  'use strict';
  var STORE = 'https://apps.apple.com/app/mtg-quick-study/id6792768370?mt=12';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduced = mq('(prefers-reduced-motion: reduce)');
  var saveData = !!(navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || '')));
  var narrow = function () { return mq('(max-width: 900px)'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cardImg = function (id) { return 'img/cards/' + id + '.webp'; };

  /* ---------- analytics (GoatCounter) ---------- */
  function gc(path, title) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ event: true, path: path, title: title }); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-gc]');
    if (a) gc('appstore-click-' + a.getAttribute('data-gc'), 'Mac App Store badge click');
  });

  /* ---------- toast + share ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  $$('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var data = { title: 'Quick Study for Mac', text: 'Free Magic: The Gathering card search for your Mac.', url: STORE };
      if (navigator.share) {
        navigator.share(data).then(function () { gc('share-native', 'Send to my Mac'); }).catch(function () {});
        return;
      }
      var done = function () { gc('share-copy', 'Send to my Mac'); toast('Link copied. Open it on your Mac.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(STORE).then(done, function () { window.prompt('Copy this link:', STORE); });
      } else { window.prompt('Copy this link:', STORE); }
    });
  });

  /* ---------- tilt + foil ---------- */
  var tilts = [], raf = 0;
  function Tilt(el) {
    this.el = el; this.cx = 0; this.cy = 0; this.ca = 0; this.tx = 0; this.ty = 0; this.ta = 0;
    this.hover = false; this.visible = false; this.sway = el.hasAttribute('data-sway');
    this.phase = Math.random() * 6; this.rel = 0;
    var self = this;
    function pos(e) {
      var r = el.getBoundingClientRect();
      self.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      self.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      self.ta = 1; self.hover = true; clearTimeout(self.rel); kick();
    }
    function leave(e) {
      var touch = e && e.pointerType && e.pointerType !== 'mouse';
      clearTimeout(self.rel);
      self.rel = setTimeout(function () { self.hover = false; kick(); }, touch ? 900 : 0);
    }
    el.addEventListener('pointerenter', pos);
    el.addEventListener('pointermove', pos);
    el.addEventListener('pointerdown', pos);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerup', leave);
    el.addEventListener('pointercancel', leave);
    tilts.push(this);
    if ('IntersectionObserver' in window) io.observe(el); else this.visible = true;
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var t = tilts.filter(function (x) { return x.el === en.target; })[0];
      if (t) { t.visible = en.isIntersecting; if (t.visible) kick(); }
    });
  }, { rootMargin: '80px' }) : null;

  function apply(t) {
    var s = t.el.style, sx = 50 + (t.cx * 0.8 + t.cy * 0.6) * 46;
    s.setProperty('--px', t.cx.toFixed(3)); s.setProperty('--py', t.cy.toFixed(3));
    s.setProperty('--mx', (50 + t.cx * 50).toFixed(1) + '%'); s.setProperty('--my', (50 + t.cy * 50).toFixed(1) + '%');
    s.setProperty('--sx', sx.toFixed(1) + '%'); s.setProperty('--act', t.ca.toFixed(3));
  }
  function tick(now) {
    raf = 0; var busy = false;
    tilts.forEach(function (t) {
      if (!t.visible) return;
      var tx = t.tx, ty = t.ty, ta = t.ta;
      if (!t.hover) {
        if (t.sway && !reduced) { tx = Math.sin(now / 1900 + t.phase) * 0.55; ty = Math.cos(now / 2500 + t.phase) * 0.4; ta = 0.45; busy = true; }
        else { tx = 0; ty = 0; ta = 0; }
      } else busy = true;
      var k = t.hover ? 0.2 : 0.07;
      var nx = t.cx + (tx - t.cx) * k, ny = t.cy + (ty - t.cy) * k, na = t.ca + (ta - t.ca) * k;
      if (Math.abs(nx - t.cx) + Math.abs(ny - t.cy) + Math.abs(na - t.ca) > 0.0004) { t.cx = nx; t.cy = ny; t.ca = na; apply(t); busy = true; }
    });
    if (busy) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  function buildCard(el, card, big) {
    el.innerHTML = '<div class="tilt-in"><img alt="" decoding="async" draggable="false"><i class="fx fx-a"></i><i class="fx fx-b"></i><i class="fx fx-sheen"></i></div>';
    var img = $('img', el);
    img.alt = card.n + ' (Magic card)';
    if (!big && !el.closest('.hero')) img.loading = 'lazy';
    img.src = cardImg(card.id);
    if (!el.hasAttribute('data-foil')) el.setAttribute('data-foil', 'none');
    return new Tilt(el);
  }
  function wireSeg(seg, tiltEl) {
    var btns = $$('button', seg);
    function pick(b, focus) {
      btns.forEach(function (x) { var on = x === b; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
      tiltEl.setAttribute('data-foil', b.getAttribute('data-foil'));
      if (focus) b.focus();
    }
    btns.forEach(function (b, i) {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); pick(btns[(i + d + btns.length) % btns.length], true); }
      });
    });
  }

  /* ---------- search demo ---------- */
  function initDemo(data, byName) {
    var ix = new window.QSEngine.Index(data), icons = {};
    data.icons.forEach(function (c) { icons[c] = 1; });
    var input = $('#qs-input'), list = $('#qs-list'), prev = $('#qs-prev'), count = $('#qs-count'), clear = $('#qs-clear'), win = $('#qs');
    var chips = $$('.chip', win);
    var hits = [], sel = 0, shownId = null, touched = false;

    // persistent preview shell: card + foil picker, and an info column
    prev.innerHTML = '<div class="prev-card"><div class="tilt" data-tilt data-foil="none"></div>' +
      '<div class="seg" role="radiogroup" aria-label="Foil style">' +
      ['none', 'holo', 'etched', 'galaxy', 'surge'].map(function (f) { return '<button type="button" role="radio" aria-checked="' + (f === 'none') + '" data-foil="' + f + '">' + f[0].toUpperCase() + f.slice(1) + '</button>'; }).join('') +
      '</div></div><div class="prev-info"></div>';
    var prevTilt = $('.tilt', prev), prevImg, info = $('.prev-info', prev);
    buildCard(prevTilt, byName['Quick Study']);
    prevImg = $('img', prevTilt);
    wireSeg($('.seg', prev), prevTilt);

    function pips(m, cls) {
      return (m.match(/\{[^}]+\}/g) || []).map(function (s) {
        var k = s.slice(1, -1), c = /^[WUBRGC]$/.test(k) ? k : '';
        return '<span class="pip ' + c + (cls ? ' ' + cls : '') + '">' + esc(k) + '</span>';
      }).join('');
    }
    function topRarity(c) {
      var order = ['mythic', 'rare', 'uncommon', 'common'];
      for (var i = 0; i < order.length; i++) if (c.rs.indexOf(order[i]) >= 0) return order[i];
      return c.r;
    }
    function badge(c) {
      var r = topRarity(c), k = ['common', 'uncommon', 'rare', 'mythic'].indexOf(r) >= 0 ? r : 'other';
      return '<span class="rar ' + k + '" title="' + esc(r) + '">' + esc((r || '?')[0].toUpperCase()) + '</span>';
    }
    function showCard(c) {
      if (!c || shownId === c.id) return;
      shownId = c.id; prevImg.src = cardImg(c.id); prevImg.alt = c.n + ' (Magic card)';
      var oracle = esc(c.o).replace(/\{([^}]+)\}/g, function (_, k) { return '<span class="pip sm ' + (/^[WUBRGC]$/.test(k) ? k : '') + '">' + k + '</span>'; });
      var pr = c.p.map(function (p) {
        return '<li>' + (icons[p[0]] ? '<i class="si" style="--ic:url(../img/sets/' + encodeURIComponent(p[0]) + '.svg)"></i>' : '<i></i>') + '<span class="sn">' + esc(p[1]) + ' <i>(' + esc(p[0]) + ')</i></span><span class="yr">' + esc(p[2]) + '</span><span class="rr">' + esc(p[3][0].toUpperCase() + p[3].slice(1)) + '</span></li>';
      }).join('');
      if (c.pc > c.p.length) pr += '<li class="more"><span></span><span>+' + (c.pc - c.p.length) + ' more</span></li>';
      info.innerHTML = '<h3>' + esc(c.n) + '</h3>' + (c.m ? '<div class="pips" aria-label="Mana cost ' + esc(c.m.replace(/[{}]/g, ' ').trim()) + '">' + pips(c.m) + '</div>' : '') +
        '<p class="prev-type">' + esc(c.t) + '</p><p class="prev-oracle">' + oracle + '</p>' + (c.pt ? '<p class="prev-pt">' + esc(c.pt) + '</p>' : '') +
        (c.pc ? '<h4>Printings (' + c.pc + ')</h4><ul class="prints">' + pr + '</ul>' : '');
    }

    function mark(name, q) {
      if (!q) return esc(name);
      var i = name.toLowerCase().indexOf(q);
      if (i < 0) return esc(name);
      return esc(name.slice(0, i)) + '<b>' + esc(name.slice(i, i + q.length)) + '</b>' + esc(name.slice(i + q.length));
    }
    function render() {
      var q = input.value, res = ix.search(q, 20);
      hits = res.hits; if (sel >= hits.length) sel = 0;
      clear.hidden = !q;
      var nm = (res.name || '').toLowerCase().trim();
      if (!hits.length) {
        list.innerHTML = '<li class="qs-empty" role="presentation">' + (q.trim() ? 'No match in this demo. It holds about a hundred cards; the app has them all.' : 'Type part of a card name, or tap a filter above.') + '</li>';
        count.textContent = q.trim() ? '0 results' : data.cards.length + ' cards in this demo';
        input.removeAttribute('aria-activedescendant');
        if (!q.trim()) { sel = 0; showCard(byName['Quick Study']); }
      } else {
        list.innerHTML = hits.map(function (c, i) {
          return '<li role="option" id="qs-o' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '"><img src="' + cardImg(c.id) + '" alt="" width="34" height="46" loading="lazy"><span class="nm">' + mark(c.n, nm) + '</span>' + badge(c) + '</li>';
        }).join('');
        count.textContent = res.total > hits.length ? 'Top ' + hits.length + ' of ' + res.total + ' results' : res.total + (res.total === 1 ? ' result' : ' results');
        input.setAttribute('aria-activedescendant', 'qs-o' + sel);
        showCard(hits[sel]);
      }
      var toks = tokens(q);
      chips.forEach(function (c) { c.setAttribute('aria-pressed', toks.indexOf(c.getAttribute('data-f')) >= 0); });
    }
    function tokens(s) {
      var out = [], cur = '', inq = false;
      for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        if (ch === '"') { inq = !inq; cur += ch; } else if (ch === ' ' && !inq) { if (cur) out.push(cur); cur = ''; } else cur += ch;
      }
      if (cur) out.push(cur); return out;
    }
    function move(d) {
      if (!hits.length) return;
      sel = (sel + d + hits.length) % hits.length;
      $$('li[role=option]', list).forEach(function (li, i) { li.setAttribute('aria-selected', i === sel); });
      input.setAttribute('aria-activedescendant', 'qs-o' + sel);
      var li = $('#qs-o' + sel, list); if (li) li.scrollIntoView({ block: 'nearest' });
      showCard(hits[sel]);
    }
    function userInput() { touched = true; sel = 0; render(); }

    input.addEventListener('input', userInput);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { input.value = ''; userInput(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (narrow()) { input.blur(); prev.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); } }
    });
    input.addEventListener('focus', function () {
      touched = true;
      if (narrow()) setTimeout(function () { win.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); }, 280);
    });
    clear.addEventListener('click', function () { input.value = ''; userInput(); if (!narrow()) input.focus(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[role=option]'); if (!li) return;
      sel = +li.getAttribute('data-i');
      $$('li[role=option]', list).forEach(function (x, i) { x.setAttribute('aria-selected', i === sel); });
      input.setAttribute('aria-activedescendant', 'qs-o' + sel);
      showCard(hits[sel]);
      if (narrow()) { input.blur(); prev.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }
    });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f'), toks = tokens(input.value), i = toks.indexOf(f);
        if (i >= 0) toks.splice(i, 1); else toks.push(f);
        input.value = toks.join(' ') + (toks.length && i < 0 ? ' ' : '');
        userInput(); gc('demo-chip', 'Demo filter chip');
        if (!narrow()) input.focus();
      });
    });
    $$('.eg').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.textContent; userInput(); gc('demo-example', 'Demo example'); });
    });

    render();
    // one gentle auto-type the first time the demo scrolls into view, abandoned on any interaction
    if (!reduced && 'IntersectionObserver' in window) {
      var once = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; once.disconnect();
        var s = 'lightnig', i = 0;
        (function step() {
          if (touched || i >= s.length) return;
          input.value = s.slice(0, ++i); sel = 0; render(); setTimeout(step, 150);
        })();
      }, { threshold: 0.55 });
      once.observe(win);
    }
  }

  /* ---------- clips + trailer ---------- */
  function initVideos() {
    var clips = $$('video.clip');
    var auto = !reduced && !saveData;
    function load(v) { if (!v.src && v.dataset.src) { v.src = v.dataset.src; } }
    if (!auto) clips.forEach(function (v) { v.controls = true; });
    var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { load(v); if (auto) { var p = v.play(); if (p && p.catch) p.catch(function () { v.controls = true; }); } }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.35, rootMargin: '120px' }) : null;
    clips.forEach(function (v) {
      if (vio) vio.observe(v);
      v.addEventListener('click', function () { load(v); if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    });
    var tv = $('#trailer-video'), pl = $('#player'), pb = $('#play');
    pb.addEventListener('click', function () {
      tv.src = 'media/trailer.mp4'; tv.controls = true; pl.classList.add('on');
      var p = tv.play(); if (p && p.catch) p.catch(function () {});
      gc('trailer-play', 'Trailer play');
      tv.focus && tv.focus();
    });
  }

  /* ---------- backdrop drift ---------- */
  if (!reduced) {
    var sraf = 0;
    window.addEventListener('scroll', function () {
      if (sraf) return;
      sraf = requestAnimationFrame(function () {
        sraf = 0;
        var h = document.documentElement.scrollHeight - innerHeight;
        document.body.style.setProperty('--scroll', (h > 0 ? scrollY / h * 0.7 : 0).toFixed(3));
      });
    }, { passive: true });
  }

  /* ---------- boot ---------- */
  initVideos();
  wireSeg($('#foil-seg'), $('#foil-card'));
  fetch('data/cards.json').then(function (r) { return r.json(); }).then(function (data) {
    var byName = {};
    data.cards.forEach(function (c) { byName[c.n] = c; });
    $$('[data-card]').forEach(function (el) { buildCard(el, byName[el.getAttribute('data-card')], el.hasAttribute('data-big')); });
    initDemo(data, byName);
  }).catch(function () {
    $('#qs-count').textContent = 'The demo could not load its card data.';
  });
})();
