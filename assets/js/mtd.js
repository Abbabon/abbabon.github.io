/* "Dracula, after dark" — modern blog interactions.
   Vanilla JS, no dependencies. Covers: nav scroll shadow, subscribe modal
   (open/close/Esc/backdrop + copy-to-clipboard), tag filtering, entrance reveal. */
(function () {
  "use strict";

  /* ---- Nav: gain elevation shadow after 24px scroll ---- */
  var nav = document.querySelector(".mtd-nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Subscribe modal (RSS-only) ---- */
  var modal = document.getElementById("mtd-subscribe");
  if (modal) {
    var openers = document.querySelectorAll("[data-mtd-subscribe-open]");
    var closeEls = modal.querySelectorAll("[data-mtd-subscribe-close]");

    var open = function () {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      modal.hidden = true;
      document.body.style.overflow = "";
    };

    openers.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });
    closeEls.forEach(function (el) {
      el.addEventListener("click", close);
    });
    // backdrop click (only when the scrim itself is clicked)
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });

    // copy-to-clipboard for the feed URL
    var copyBtn = modal.querySelector("[data-mtd-copy]");
    if (copyBtn) {
      var input = modal.querySelector(".mtd-modal-input");
      var original = copyBtn.textContent;
      copyBtn.addEventListener("click", function () {
        var url = input ? input.value : copyBtn.getAttribute("data-mtd-copy");
        var done = function () {
          copyBtn.textContent = "Copied ✓";
          setTimeout(function () { copyBtn.textContent = original; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () {
            if (input) { input.select(); document.execCommand("copy"); done(); }
          });
        } else if (input) {
          input.select();
          document.execCommand("copy");
          done();
        }
      });
    }
  }

  /* ---- Tags page: cloud filtering ---- */
  var chips = document.querySelectorAll(".mtd-tag-chip");
  if (chips.length) {
    var groups = document.querySelectorAll(".mtd-tag-group");
    var heading = document.querySelector(".mtd-tag-heading");

    var select = function (tag) {
      chips.forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-tag") === tag);
      });
      groups.forEach(function (g) {
        g.hidden = g.getAttribute("data-tag") !== tag;
      });
      if (heading) {
        var active = document.querySelector('.mtd-tag-group[data-tag="' + tag + '"]');
        var count = active ? active.getAttribute("data-count") : "0";
        heading.innerHTML =
          '<span class="name">#' + tag + "</span> — " +
          count + " post" + (count === "1" ? "" : "s");
      }
    };

    chips.forEach(function (c) {
      c.addEventListener("click", function () { select(c.getAttribute("data-tag")); });
    });

    // honor #tag in the URL, else select the first (most-used) tag
    var initial = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
    var match = initial && document.querySelector('.mtd-tag-chip[data-tag="' + initial + '"]');
    select(match ? initial : chips[0].getAttribute("data-tag"));
  }

  /* ---- Post code blocks: wrap on by default, per-block wrap toggle ---- */
  var codeBlocks = document.querySelectorAll(".mtd-post-body pre");
  codeBlocks.forEach(function (pre) {
    if (pre.closest(".mtd-codeblock")) return;
    var wrapper = document.createElement("div");
    wrapper.className = "mtd-codeblock";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mtd-wrap-toggle";
    btn.title = "Toggle line wrapping";
    var sync = function () {
      var off = pre.classList.contains("is-nowrap");
      btn.textContent = off ? "→ wrap: off" : "↩ wrap: on";
      btn.classList.toggle("is-off", off);
    };
    btn.addEventListener("click", function () {
      pre.classList.toggle("is-nowrap");
      sync();
    });
    sync();
    wrapper.appendChild(btn);
  });

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Entrance reveal: one-shot .mtd-revealing as elements scroll in ----
     Resting state of .mtd-reveal is VISIBLE (CSS), so content is never stuck
     hidden — this is a progressive enhancement that adds a staggered fade-up
     as each row enters the viewport, then removes the class on a timer. */
  (function () {
    if (reduceMotion) return; // already visible, no animation
    var root = document.querySelector(".mtd-modern") || document.body;
    var raf = 0;
    var reveal = function () {
      raf = 0;
      var vh = window.innerHeight || 800;
      var els = root.querySelectorAll(".mtd-reveal:not([data-seen])");
      Array.prototype.forEach.call(els, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > -80) {
          el.setAttribute("data-seen", "1");
          var sibs = el.parentElement
            ? Array.prototype.filter.call(el.parentElement.children, function (c) {
                return c.classList.contains("mtd-reveal");
              })
            : [el];
          var delay = Math.min(Math.max(0, sibs.indexOf(el)), 6) * 55;
          el.style.animationDelay = delay + "ms";
          el.classList.add("mtd-revealing");
          setTimeout(function () {
            el.classList.remove("mtd-revealing");
            el.style.animationDelay = "";
          }, 640 + delay);
        }
      });
    };
    var onScroll = function () {
      if (!raf) raf = requestAnimationFrame(reveal);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    requestAnimationFrame(reveal);
    setTimeout(reveal, 250);
  })();

  /* ---- Animal-crossing drift field — soft Dracula diamonds rising forever ----
     Purely decorative; populated into an empty .mtd-drift container so no-JS
     visitors simply see nothing extra. Disabled under reduced motion. */
  (function () {
    var field = document.querySelector(".mtd-drift");
    if (!field || reduceMotion) return;
    var hues = [
      "var(--dr-purple)", "var(--dr-cyan)", "var(--dr-pink)",
      "var(--dr-green)", "var(--dr-purple)", "var(--dr-cyan)"
    ];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 20; i++) {
      var op = 0.05 + Math.random() * 0.11;
      var size = 8 + Math.random() * 26;
      var d = document.createElement("span");
      d.className = "mtd-diamond";
      d.style.left = Math.random() * 100 + "%";
      d.style.width = size + "px";
      d.style.height = size + "px";
      d.style.background = hues[i % hues.length];
      d.style.animationDuration = 26 + Math.random() * 30 + "s";
      d.style.animationDelay = -Math.random() * 50 + "s";
      d.style.setProperty("--drift", (Math.random() * 2 - 1) * 60 + "px");
      d.style.setProperty("--rot", Math.random() * 90 + "deg");
      d.style.setProperty("--op", op);
      d.style.opacity = op;
      frag.appendChild(d);
    }
    field.appendChild(frag);
  })();

  /* ---- Gentle scroll parallax: expose scrollY to the background layers ---- */
  (function () {
    var raf = 0;
    var onScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        document.documentElement.style.setProperty("--mtd-scroll", String(window.scrollY));
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
})();
