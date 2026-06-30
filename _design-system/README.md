# Handoff: "Master the Disaster" — Modern Blog Redesign

A redesign of **abbabon.github.io** (Amit Netanel's Unity/gamedev blog) that keeps the Dracula identity but modernizes it — codename **"Dracula, after dark."** This bundle is the spec + reference for porting that look into the **real Jekyll / Beautiful-Jekyll site**.

---

## Overview

The current blog runs the **Beautiful Jekyll** theme with the Dracula palette. This redesign keeps the palette, fonts and voice, and layers on: an aurora-lit dark canvas, animated gradient display headings, a "terminal" hero card, depth-y post cards that lift and glow on hover, glass chrome, a real tags archive, and a subscribe modal.

**Home page now also includes** (added after the original handoff): a hero subtitle ("Amit Netanel's Dev Log") and a row of colored **jump-to pills** under the title, a **Podcast** section, a **Projects** section, a **Let's talk** contact CTA band, an **expanded multi-column footer** (home only), an **animal-crossing-style drifting background**, and **scroll-triggered entrance reveals**. See "Home page sections (updated)" below.

The target is **a Jekyll (GitHub Pages) site** — Liquid templates + CSS, **not** React.

## About the design files

Everything in `reference/` is a **design reference built in HTML/React**, not production code to paste in. The blueprint file (`ModernApp.jsx.txt`) is the **behavioral reference** (routing, interactions, state) — read it, don't run it; the CSS files are **directly reusable** in Jekyll. The fully interactive prototype lives in the design-system project at `ui_kits/blog-modern/index.html` — open that to click through every view. Your job is to **recreate these designs in the Jekyll codebase** using its existing conventions: CSS in `assets/css/`, markup in `_layouts/` + `_includes/` with Liquid, and the existing front-matter/`_posts` content. Do **not** introduce React — translate the JSX structure into Liquid.

## Fidelity

**High-fidelity.** Exact colors, typography, spacing, radii, shadows and interactions are specified below and present in the CSS. Recreate pixel-faithfully; the `.mtd-*` classes in `reference/modern.css` can be used essentially as-is.

---

## How it maps onto the Jekyll site

| Design view | Jekyll file to create/modify | Notes |
|---|---|---|
| Global tokens + base | `assets/css/dracula-tokens.css` (new) | Concatenate the files in `reference/tokens/`. Load before everything. |
| Modern treatment layer | `assets/css/modern.css` (new) | Copy `reference/modern.css` verbatim. Holds all `.mtd-*` classes. |
| Site chrome (nav, aurora, drift, footer) | `_includes/head.html`, `_layouts/base.html` (or theme equivalent) | Aurora + vignette + drift divs go just inside `<body>`; nav is the existing `_includes/nav` restyled. **Nav order (updated): Blog / Podcast / Projects / About / Contact / Tags / Subscribe** — Blog/Podcast/Projects smooth-scroll to home sections (`#mtd-writing`, `#mtd-podcast`, `#mtd-projects`); the Resources dropdown was removed. |
| Home (hero + featured + grid + podcast + projects + CTA) | `_layouts/home.html` | The hero is static markup; featured = `site.posts.first`; grid = `site.posts` loop (offset by 1). Podcast/Projects data → new `_data/podcasts.yml` + `_data/projects.yml` (mirrors `reference/data.js.txt`). CTA is static. See "Home page sections (updated)". |
| Single post page | `_layouts/post.html` | Gradient title, meta, hero image (`page.thumbnail`/`page.image`), `{{ content }}`, tag row, prev/next pager. Code blocks **wrap by default** with a per-block wrap toggle (see Interactions). |
| Tags archive | `tags.html` (page) + small JS, **or** Liquid group-by | Beautiful Jekyll already ships a tags page — restyle it with the tag-cloud treatment below. |
| About / standalone pages | `_layouts/page.html` | Same hero treatment, single content column. Port `about.md` content verbatim (bullets + green resource links + inline しかし). |
| Contact | `contact.md` (uses `page` layout) | Port `contact.md` verbatim: intro, itch.io link, the "service bot" callout (`NotificationBox` note), and the HAL 9000 image. |
| Resources (dropdown) | `_config.yml` `navbar-links` → sub-items | Already a real dropdown in the theme: **Unity Assets** (`/assets` page) + **Learn markdown** (external). Restyle the dropdown with the glass-menu treatment. |
| Subscribe | `_includes/subscribe-modal.html` + tiny JS | Modal triggered by the nav "Subscribe" button. **RSS-only** — no email backend planned: show the `feed.xml` URL with a copy button + "Open feed" link. (Beautiful Jekyll already generates `feed.xml`.) |

> The Liquid loops replace `window.MTD_POSTS` in the React reference. Each card reads `post.title`, `post.date | date: "%B %-d, %Y"`, `post.tags`, `post.thumbnail`, and an excerpt (`post.excerpt | strip_html | truncatewords: 32`).

> ⚠️ **Required — footer attribution.** Beautiful Jekyll's license requires the **“Powered by Beautiful Jekyll”** credit to stay in the footer. Keep it (styled as a muted mono line under the social row), e.g. `Powered by <a href="https://beautifuljekyll.com">Beautiful Jekyll</a>`. The prototype footer already includes it.

---

## Design tokens

All tokens live in `reference/tokens/`. Key values:

### Color — Dracula
| Token | Hex | Use |
|---|---|---|
| `--surface-page` | `#282a36` | page background |
| `--surface-card` | `#44475a` | cards, nav, footer |
| `--surface-raised` | `#2f313f` | top of card gradient |
| `--surface-inset` | `#21232e` | code blocks, inputs |
| `--text-body` | `#f8f8f2` | body text |
| `--text-heading` | `#8be9fd` (cyan) | headings |
| `--text-muted` | `#6272a4` | meta, comments |
| `--text-subtle` | `#9aa0c4` | secondary body |
| `--link` | `#50fa7b` (green) | links |
| `--link-hover` | `#ffb86c` (orange) | link hover |
| `--link-footer` | `#bd93f9` (purple) | footer/social |
| `--accent-tertiary` | `#ff79c6` (pink) | featured meta |
| `--quote` | `#f1fa8c` (yellow) | emphasis/italics |
| `--status-error` | `#ff5555` (red) | danger |

### Gradients & glow (modern layer)
- `--grad-display`: `linear-gradient(100deg,#8be9fd 0%,#50fa7b 38%,#bd93f9 72%,#ff79c6 100%)` — the animated headline fill (`.mtd-gradient-text`, 8s pan).
- `--grad-aurora`: three radial glows (purple/cyan/pink, 14–20% alpha) — the fixed background field (`.mtd-aurora`, 22s drift).
- `--glow-purple`: `0 0 0 1px rgba(189,147,249,.30), 0 18px 44px -12px rgba(189,147,249,.38)` — card hover glow.
- `--glow-cyan`: cyan equivalent — featured-card hover.
- `--glass-bg` `rgba(40,42,54,.62)` + `--glass-blur` `saturate(160%) blur(14px)` — nav/footer/modal.

### Typography
- **Headings / UI:** Open Sans **800**, uppercase + `letter-spacing:.06em` for nav/buttons. Cyan.
- **Body:** Lora serif, 18px (`1.125rem`), line-height 1.5–1.7.
- **Mono:** Source Code Pro — eyebrows, dates, terminal, tag pills.
- All three are Google Fonts (already linked via `reference/tokens/fonts.css`).
- Scale: `--fs-base 1.125rem`, `--fs-lg 1.5rem`, `--fs-2xl 1.875rem`, `--fs-3xl 2.25rem`; hero uses `clamp(2.6rem,6vw,4.6rem)`.

### Spacing, radii, motion
- Spacing rhythm: 5 / 10 / 15 / 20 / 30 / 35 / 50 / 80 px (`--space-1`…`--space-8`). Content max-width `76rem` (home) / `46–50rem` (post/about).
- Radii: `--radius-md` 4px (buttons/code), `--radius-xl` 14px (cards), `--radius-2xl` 20px (hero image/modal), `--radius-pill` for tags.
- Easing: `--ease-out-soft` `cubic-bezier(.22,.61,.36,1)`; hover lift `translateY(-6px)`; durations 0.2s (color) / 0.5s (image) / 0.7s (entrance).
- Images: feed thumbnails sit at `grayscale(40%)` (`--img-grayscale`), animate to full color + `scale(1.05)` on card hover.

---

## Screens / views

### 1. Navbar (`.mtd-glass`, sticky)
- Sticky top, glass blur, gains `--elev-2` shadow after 24px scroll.
- Left: 38px circular avatar with `--glow-purple`, wordmark "Master the Disaster" + mono subline `~/abbabon · gamedev notes`.
- Right: uppercase links **Blog / Podcast / Projects / About / Contact / Tags** (active = cyan, hover = orange) and a ghost **Subscribe** button. Blog/Podcast/Projects smooth-scroll to the matching home section; the old Resources dropdown was removed.

### 2. Home — Hero
- Two-column grid (`minmax(0,1.15fr) minmax(0,.85fr)`), collapses to 1 col ≤860px.
- Left: mono eyebrow with a gradient lead-in rule (`~/blog · refactoring dumpster fires`); **gradient H1** "Master the Disaster" (`.mtd-gradient-text`, one line, `clamp(2.3rem,5vw,3.8rem)`, `text-wrap:balance`); a **subtitle** "<span cyan>Amit Netanel's</span> Dev Log" (Open Sans 700, `clamp(1.05rem,2vw,1.4rem)`); Lora tagline ("seen some things" in yellow `--quote` italic); then an **action row**: a primary **Read the blog** button followed by three **jump-to pills** — outlined buttons sharing the exact button idiom (Open Sans 800 uppercase, `--tracking-btn`, `--radius-md`, `0.75rem 1.4rem` padding) but each outlined in its own Dracula hue, filling on hover: **Podcasts** (pink `--dr-pink`), **Projects** (purple `--dr-purple`), **Let's talk** (orange `--dr-orange`). Each pill smooth-scrolls to its section.
- Right: **terminal card** — glass panel, traffic-light dots, mono lines with Dracula-colored tokens (`whoami` → `# 8 mechanical keyboards`, `cat topics.txt`, `npm publish unity-shell`) and a blinking cursor (`.mtd-blink`). blog", ghost "About me"); stat row (6 posts / 4+ years / ∞ refactors).
- Right: **terminal card** — glass panel, traffic-light dots, mono lines with Dracula-colored tokens (`whoami`, `cat topics.txt`, `npm publish unity-shell`) and a blinking cursor (`.mtd-blink`).

### 3. Home — Featured ("Latest dispatch")
- Section head: heavy title + mono `// pinned` + gradient hairline rule.
- Card (`.mtd-card .mtd-feature`): 2-col, image left with a left-to-right fade into `--surface-card`; right = pink mono meta, cyan 2rem title, italic orange subtitle, excerpt, tag pill, green "Read →". Hover → cyan glow + lift.

### 4. Home — Grid ("Latest writing")
- `repeat(auto-fill, minmax(17rem,1fr))`, 1.4rem gap.
- Card: 16:9 image (grayscale→color on hover) with bottom gradient + cyan mono `#tag` overlay; body = mono date, cyan title, 3-line clamped excerpt, green "Read →". Hover → purple glow + `translateY(-6px)`.

### 4b. Home page sections (updated)
These were added after the original handoff. All sit in `_layouts/home.html` after the writing grid, each wrapped in an anchor id used by the nav + hero pills.

**Podcast** (`#mtd-podcast`, head `// on the mic` · "Podcast"): two-column grid (`minmax(0,1.15fr) minmax(0,.85fr)`, collapses ≤860px). Left = a **featured episode card** (`.mtd-card .mtd-feature`): cyan/purple radial-glow panel with a mic chip, show·episode mono label, and an **animated waveform** (`.mtd-wave` — 11 bars, `mtd-bar` 1.1s alternate, staggered delays); right pane = date·duration, heavy title, blurb, a primary **Listen** button + Spotify/Apple/YouTube icon links. Right column = a stack of **episode rows** (`.mtd-ep-row` — play chip, title, show·ep·duration mono, `→`; slides right + cyan border on hover). Data: `window.MTD_PODCASTS` → `_data/podcasts.yml`.

**Projects** (`#mtd-projects`, head `// shipped & open-source` · "Projects"): `repeat(2, minmax(0,1fr))` grid (1 col ≤860px). Each is a `.mtd-card` with a 16:9 thumb (bottom gradient + cyan mono `// category` overlay), heavy cyan title, mono org line, and a green `{cta} →` footer. Click opens the linked post (internal) or external URL (e.g. itch.io). Data: `window.MTD_PROJECTS` → `_data/projects.yml`.

**Let's talk — Contact CTA** (`#mtd-contact`, head `// say hi` · "Let's talk"): a single `.mtd-cta` band — rounded `--radius-2xl`, dual purple/cyan radial glows + `--glow-purple`. Left = mono eyebrow `~/contact · open inbox`, a two-line **gradient headline**, Lora blurb. Right = primary **Say hi** + ghost **Play my games** buttons, and a row of social icon links (GitHub / itch.io / Twitter / Email) that lift on hover. "Say hi" routes to the contact page.

**Expanded footer (home only):** see "How it maps" + the footer note. On the home page the footer renders a 4-column layout (brand blurb + socials, then **Explore / Connect / Elsewhere** link columns); on every inner page it stays the original compact one-row footer. Both keep the required Beautiful Jekyll credit.

### 5. Single post page
- Centered header (max 52rem): mono "← back" eyebrow, **gradient H1 title**, italic subtitle, mono `By {author} · {date}`.
- Hero image full-width, `--radius-2xl`, `--glow-purple`.
- Body (max **52rem**, Lora 1.15rem/1.7): paragraphs, cyan section `h2`, figures with caption, **code blocks** (left cyan bar, Dracula tokens, **wrap on by default** + a small mono `wrap: on/off` toggle top-right of each block), and callout boxes (note/info/warning/success — 5px colored left border + tinted fill).
- Tag pills, gradient rule, then **prev/next pager** (bordered buttons: mono "← Older / Newer →" label + post title, hover cyan).

### 6. Tags archive
- Mono eyebrow `~/tags · N topics · M posts`, gradient "Tags" H1.
- **Tag cloud:** pill per tag, each in a rotating Dracula hue, showing count; the active pill is filled. Click selects.
- Below: `#tag — N posts` heading, then a list of post rows (56px grayscale thumb, title, date, "→") that slide right + cyan border on hover. Click → post.

### 7. Subscribe modal (RSS-only)
- Full-screen scrim (`rgba(20,21,28,.66)` + blur). Centered glass panel, `--radius-2xl`, `--glow-purple`.
- Mono eyebrow `~/subscribe`, gradient "Follow via RSS" title, Lora blurb ("No newsletter, no tracking — just an honest feed…"), then a read-only mono field showing the feed URL (`https://abbabon.github.io/feed.xml`) + primary **Copy** button (label flips to `Copied ✓` for ~1.8s). Footer row: orange RSS icon + "Open feed.xml" link.
- **No email capture / no backend.** Closes on ✕, backdrop click, or **Esc**.

### 8. Contact page
- Single column (max 46rem). Mono eyebrow `~/contact · say hi`, gradient "Contact" H1.
- Lora body (from `contact.md`): intro about social links in the footer; "play my games on itch.io" (green link); the "don't try to sell me stuff / KeyCult" line.
- A **note callout** (`NotificationBox` variant `note`, title "re: contact forms") with the ICQ / service-bot joke, then the **HAL 9000 image** (`assets/img/hal9000.jpg`, `--radius-xl`, caption "Hello, Human.").

### 9. Resources page
- Reached from the nav **Resources → Unity Assets** dropdown item (the `/assets` page). Single column (max 50rem). Mono eyebrow `~/resources · assets & tools`, gradient "Resources" H1, one-line intro.
- A stack of **link cards** (`.mtd-card`, hover lift + glow): name (cyan heavy), description (Lora), a `#tag` pill, and a `↗` external arrow. (In this prototype the items point at the real GitHub/itch.io/markdown-tutorial URLs; swap in the true `/assets` page content when porting.)

---

## Interactions & behavior
- **Routing (React ref → Liquid):** in React these are view swaps; in Jekyll they're real pages/links (`/`, `/<post-url>`, `/tags`, `/about`, `/contact`, `/assets`). Wire nav + cards to those URLs.
- **Resources dropdown:** opens on hover (and click) — a glass menu anchored under the nav item; closes on mouse-leave. In Jekyll, Beautiful Jekyll's navbar already renders this from `navbar-links`; just apply the glass styling.
- **Code-block wrap toggle:** each code block defaults to `white-space: pre-wrap; word-break: break-word` so long lines fit the column; a small mono button top-right toggles to `pre` + `overflow-x:auto` (horizontal scroll). ~10 lines of vanilla JS per page (one delegated click handler that flips a class on the nearest `pre`).
- **Subscribe modal:** the only piece needing JS in Jekyll — toggle an `.is-open` class on `#subscribe-modal`; copy-to-clipboard for the feed URL; close on ✕/backdrop/Esc. ~20 lines of vanilla JS. No backend.
- **Tags filtering:** either pre-render every tag's list with Liquid and toggle visibility with a few lines of JS, or use Beautiful Jekyll's existing tag-page mechanism and just restyle.
- **Hover states:** all pure CSS (`.mtd-card:hover`, aurora/gradient animations). Respect `prefers-reduced-motion` — the media query is already in `modern.css`.
- **Entrance reveal (updated):** elements with `.mtd-reveal` start **visible**; a small scroll handler adds `.mtd-revealing` (a one-shot `mtd-reveal-in` fade-up, ~0.58s, per-row stagger via `animationDelay`) as each enters the viewport, then removes the class on a timer. Resting state is visible so nothing can get stuck hidden (and reduced-motion / no-JS shows everything). In Jekyll, port the ~25-line handler from `ModernApp.jsx.txt` (`useReveal`) as vanilla JS, or drop it entirely and ship the content static.
- **Drifting background (new):** `.mtd-drift` is a fixed full-viewport layer of ~20 soft Dracula "diamonds" (`.mtd-diamond`) rising forever (`diamond-rise`, randomized size/duration/hue/drift), plus gentle scroll parallax on `.mtd-aurora` and `.mtd-drift` driven by a `--mtd-scroll` CSS var set on scroll. Purely decorative, `pointer-events:none`, behind everything (z-index 0); disabled under reduced-motion and under the `.mtd-no-motion` toggle. In Jekyll, generate the diamonds with a tiny JS loop (see `DriftField` in the reference) or omit.

## State (Jekyll equivalents)
- No client state except: subscribe modal open/closed, copy-confirmation flash, and (if interactive) the active tag. Everything else is server-rendered by Liquid from `_posts`.

## Assets
All imagery already exists in the repo under `assets/img/` — reuse it:
- `assets/img/avatar-icon.png` — brand avatar (nav, footer).
- `assets/img/path.jpg` — hero background option.
- `assets/img/posts/*` — per-post thumbnails (`rmrf.png`, `academit-thumb-rect.png`, `Gradient-1.png`, book covers, `SceneNavigation/…`).
- **Icons:** Font Awesome 6 (CDN) for social + RSS. Beautiful Jekyll already bundles Font Awesome — reuse that include rather than adding the CDN twice.

## Files in this bundle
```
reference/
  ModernApp.jsx.txt     Behavioral reference (read, don't run) — routing, hero (+jump pills), featured, grid, podcast, projects, contact CTA, footer, post, tags, RSS modal
  modern.css            The .mtd-* treatment layer — copy into assets/css/ as-is (incl. drift, reveal, podcast, CTA styles)
  data.js.txt           Sample data: MTD_POSTS, MTD_PODCASTS, MTD_PROJECTS — mirror into _data/*.yml
  tokens/
    colors.css          Dracula palette + semantic aliases
    typography.css      scale, weights, tracking
    spacing.css         rem rhythm + layout widths
    effects.css         radii, borders, shadows, motion, image filter
    modern-tokens.css   gradients, glass, glow, springy easings
    fonts.css           Google Fonts @import (Lora / Open Sans / Source Code Pro)
    code.css            inline code + Dracula syntax-highlight classes
```

### Suggested build order
1. Concatenate `tokens/*.css` → `assets/css/dracula-tokens.css`; add `modern.css`. Link both in `_includes/head.html` after the theme CSS (or replace the theme's color CSS).
2. Restyle `_layouts/base.html` + nav; add the aurora/vignette divs and glass nav.
3. Rebuild `_layouts/home.html` (hero + featured + grid) against `site.posts`.
4. Rebuild `_layouts/post.html` (gradient header + body + pager).
5. Restyle the tags page and `_layouts/page.html`.
6. Add the subscribe modal include + JS — **RSS-only** (feed URL + copy button); no backend.
7. Verify against the live prototype (`ui_kits/blog-modern/index.html` in the design-system project) side-by-side.

> Open the live prototype and click through every view — it's the source of truth for spacing, motion and copy. The `ModernApp.jsx.txt` blueprint documents the same structure for reading.
