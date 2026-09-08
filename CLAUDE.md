# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal blog ("Master the Disaster", by Amit Netanel) hosted at `abbabon.github.io` via GitHub Pages. It is built on the **Beautiful Jekyll** theme (by Dean Attali) — the theme's full source lives in this repo (it doubles as the theme gem, see `beautiful-jekyll-theme.gemspec`). Most files come from the upstream theme; day-to-day work is editing content and `_config.yml`, not theme internals.

## Commands

```bash
./run_site.sh          # bundle exec jekyll serve — local dev server with live reload
bundle install         # install gem dependencies after touching the Gemfile/gemspec
```

Ruby setup (one-time, RVM-based) is in `install_ruby.sh`; the theme targets Ruby ~2.7. There is no test/lint suite — this is a static content site. Deployment is automatic: pushing to `master` triggers GitHub Pages to build and publish.

## Content model

- **Published posts** live in `_posts/` named `YYYY-MM-DD-title.md`. Permalinks are `/:year-:month-:day-:title/` (set in `_config.yml`). Each post starts with YAML front matter: `layout: post`, `title`, `tags: [...]`, optional `cover-img` / `share-img` / `share-img-twitter`, `comments: true`. Markdown is GFM (kramdown + rouge highlighter).
- **Drafts** in `drafts/` are works-in-progress not yet published — move a file to `_posts/` with a dated filename to publish it.
- **`archive/`** holds the theme's original demo posts. They are not the author's content; leave them unless explicitly asked.
- **Projects** live in `_projects/` (a Jekyll collection, permalink `/projects/:name/`). Each is a card on the home page's Projects section plus its own `layout: project` landing page. Front matter: `title`, `org`, `category`, `image`, optional `link` (point the card at a blog post instead of the generated page), optional action links `play_url` / `watch_url` / `repo_url` / `site_url`, `cta`, `order`.
- **Consultation work** lives in `_consulting/` — same card shape and same `layout: project`, but rendered under its own "Consultation Work" header after Projects (permalink `/consulting/:name/`). `_consulting/_TEMPLATE.md` documents the front matter; files starting with `_` are ignored by Jekyll, so the template never builds. The section, its nav link, hero pill and footer link all disappear when the collection is empty. Both sections share `_includes/mtd-card-grid.html` — edit that, not the two thin wrappers (`mtd-projects.html`, `mtd-consulting.html`).
- **`_reference/`** holds internal study notes used when drafting posts (e.g. `domains-architecture.md`, a study of Gal Bartouv's domain-based Unity structure that several posts cite). It is an underscore directory that is not a collection, so Jekyll never builds it. Read the relevant note before writing a post that touches its topic; add a new note there when a post studies an external source future posts will reference.
- **Standalone pages** (`about.md`, `contact.md`, `assets.md`, `tags.html`) use `layout: page` by default (set via `defaults` in `_config.yml`).
- **`privacy/`** contains privacy-policy pages for the author's mobile apps (e.g. AraratFM, ocdisocdat). Each sets an explicit `permalink` and is unrelated to the blog itself — treat them as independent landing pages.
- Images go in `assets/img/` (post images under `assets/img/posts/`).
- **`STYLE.md` is the voice guide.** Read it before drafting a post. After drafting or substantially editing any post, run the `humanize-post` skill (`.claude/skills/humanize-post/`) on the file before committing; it strips LLM writing tells while keeping the author's voice, and its scanner (`scan.py`) gives a mechanical first pass.

## Theme structure (rarely edited)

- `_layouts/` — page templates; `post.html`, `page.html`, `home.html` extend `base.html`.
- `_includes/` — reusable HTML partials pulled into layouts.
- `_data/ui-text.yml` — translatable UI strings.
- `_config.yml` — site-wide settings: navbar links, social links, analytics, comments (Disqus), and the custom Dracula color palette (the author overrides many theme color variables here). Changes to `_config.yml` require restarting the Jekyll server to take effect.

## GitHub authentication

This repo belongs to the **Abbabon** GitHub account. ALWAYS authenticate as Abbabon for **every** GitHub operation here — both `gh` commands (PRs, etc.) and plain `git push`/`git fetch`. The machine also has an `amitnglaive` account — do not use it here.

The remote is HTTPS (`https://github.com/Abbabon/abbabon.github.io.git`). Before any push or `gh` command, make Abbabon the active account, and route git's HTTPS credentials through `gh` so plain `git push` uses the same account:

```bash
gh auth switch --user Abbabon   # make Abbabon the active gh account
gh auth setup-git               # make git use the active gh account for HTTPS (one-time per machine)
```

Note: the machine's `osxkeychain` credential helper can otherwise serve a different cached token to `git push` regardless of the active `gh` account, so always verify with `gh auth status` (active account must be Abbabon) before pushing.

### Commit author identity (separate from auth!)

Authenticating as Abbabon controls who *pushes*; it does NOT control who *authored* a commit — that comes from `git config user.name`/`user.email`. The machine's global git identity is the glaive/`amitnglaive` account (`amit@glaivegames.com`), so commits made without overriding it get mis-attributed to that account. Before committing in this repo, set the repo-local identity to Abbabon (one-time per clone):

```bash
git config user.name "Amit Netanel"
git config user.email "1280330+Abbabon@users.noreply.github.com"   # Abbabon's GitHub noreply (account id 1280330)
```

Then verify with `git log -1 --format='%an <%ae>'` that new commits show the Abbabon noreply email, never `amit@glaivegames.com`. The noreply address attributes the commit to the Abbabon account on GitHub and can't be blocked by email-privacy push protection.

## Conventions

- The site is excluded from production for `README.md`, `CHANGELOG.md`, `Gemfile`, `LICENSE`, `screenshot.png` (see `exclude:` in `_config.yml`) — these are theme/repo docs, not site content.
- Pagination is 8 posts per page (`jekyll-paginate`, `paginate_path: /posts/page:num/`); a sitemap is generated by `jekyll-sitemap`.
- **Home sections are capped, with a "see all" page behind each.** Posts: the featured one + 8 in the grid, rest at `/posts/` (`_layouts/archive.html`, paginated). Projects and consulting: 8 cards each, rest at `/projects/` and `/consulting/` (`_layouts/card-archive.html`, not paginated — set `collection:` in the page's front matter to pick which collection it lists).
- **The mobile cap is CSS, not Liquid.** Jekyll can't know the viewport, so grids ship the full desktop set and `.mtd-mobile-cap` hides everything past the 2nd card at ≤860px (see the RESPONSIVE block in `modern-blog.css`). Callers opt in with `mobile_cap=true` on `mtd-post-grid.html` / `mtd-card-grid.html`; card images carry `loading="lazy"` so the hidden ones are never fetched. The same breakpoint hides the hero terminal. Consequence to keep in mind: any "N more…" copy next to a capped grid is a desktop-only count, so it lives in `.mtd-more-note` and is hidden on mobile — and a "see all" link must render whenever the collection has more than 2 items, not just when the desktop cap trimmed something.

## Git Commit Authorship

**All commits in this repository must be authored and committed by the `Abbabon` GitHub user.**

- Name: `Abbabon`
- Email: `1280330+Abbabon@users.noreply.github.com`

This identity is set in the repo-local git config (`.git/config`), so normal `git commit`
calls pick it up automatically. Do **not** override it with `--author`, `-c user.name=...`,
or `-c user.email=...`.

Before committing, verify the identity is still correct:

```bash
git config user.name    # -> Abbabon
git config user.email   # -> 1280330+Abbabon@users.noreply.github.com
```

If it is not, restore it with:

```bash
git config --local user.name "Abbabon"
git config --local user.email "1280330+Abbabon@users.noreply.github.com"
```

Pushes and PRs go through `gh`, whose active account is machine-wide. Check it before
pushing:

```bash
gh auth status                                    # -> Abbabon active
gh auth switch --hostname github.com --user Abbabon
```

If any commit ever lands with a different author or committer, rewrite history so that
`Abbabon` is the only author/committer:

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --env-filter '
export GIT_AUTHOR_NAME="Abbabon"
export GIT_AUTHOR_EMAIL="1280330+Abbabon@users.noreply.github.com"
export GIT_COMMITTER_NAME="Abbabon"
export GIT_COMMITTER_EMAIL="1280330+Abbabon@users.noreply.github.com"
' --tag-name-filter cat -- --all
```

Do not add co-author trailers (`Co-Authored-By:`) or any other trailer that attributes the
commit to a different person or tool.
