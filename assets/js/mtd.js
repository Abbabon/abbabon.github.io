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

  /* ---- Entrance reveal: add .is-in as elements scroll into view ----
     CSS animates .mtd-reveal on mount and always ends visible, so this is a
     progressive enhancement only. */
  var reveals = document.querySelectorAll(".mtd-reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
