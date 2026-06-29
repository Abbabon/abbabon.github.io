---
name: serve
description: Run the "Master the Disaster" blog locally with Jekyll for testing/preview. Use when the user asks to serve, run, start, preview, or spin up a local/dev server for this site, or to view changes in a browser before pushing.
---

# Serve the blog locally

Starts the Beautiful Jekyll dev server so changes can be previewed in a browser.
The bare equivalent is `run_site.sh` (`bundle exec jekyll serve`); this skill adds
the setup, backgrounding, and health-check that make it reliable.

## Steps

1. **Install gems if needed** (first run, or after editing `Gemfile`/`*.gemspec`):
   ```bash
   bundle install
   ```
   This machine uses Homebrew **Ruby 3.4** (no rvm/rbenv). The `Gemfile` already
   adds the stdlib gems Ruby 3.4 dropped (`csv`, `base64`, `bigdecimal`,
   `logger`), gated to Ruby 3.4+, so a fresh install just works — no manual steps.

2. **Kill any stale server** to free the port:
   ```bash
   pkill -f "jekyll serve" 2>/dev/null; sleep 1
   ```

3. **Start the server in the background** (run via the Bash tool with
   `run_in_background: true` so work can continue), with live reload:
   ```bash
   bundle exec jekyll serve --host 127.0.0.1 --port 4000 --livereload
   ```

4. **Wait for it to come up, confirm, then hand the user the URL:**
   ```bash
   sleep 5; curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4000/
   ```
   A `200` means it's ready at <http://127.0.0.1:4000/>. If it's not up yet, wait
   a few seconds and retry (first build can take a moment).

## Notes & gotchas

- **`_config.yml` changes are NOT picked up by live reload** — kill and re-run
  the server after editing it (navbar/social/colors/excludes all live there).
- **Port already in use?** Pass a different `--port` (e.g. `4111`) and use that
  port in the health-check URL.
- **Build-only check** (no server; mirrors what CI runs):
  ```bash
  JEKYLL_ENV=production bundle exec jekyll build --future
  ```
- Serving works the same on Jekyll 3.9 or Jekyll 4.x.
- GitHub auth and the Abbabon commit-author identity for this repo are a separate
  concern — see `CLAUDE.md` before committing/pushing.
