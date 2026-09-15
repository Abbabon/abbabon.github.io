---
# `published: false` keeps this file out of the collection — it is a reference
# for the front matter a consultation-work item supports, not a real entry.
# To add one: copy this file to `_consulting/<slug>.md`, drop the `published`
# line, and fill in whatever applies. Everything except `title` is optional.
published: false

title: Client / Engagement Name
org: Client name, or "Under NDA"
category: unity · tooling            # the little "// ..." label on the card
image: "/assets/img/posts/<Something>/cover.jpg"

# Where the card's title and "Read more" link point. Use a blog-post permalink
# if you wrote one about the engagement; omit it entirely and the card links to
# this item's own generated page (/consulting/<slug>/).
link: /2026-01-01-some-post/

# Optional direct action links, rendered as buttons on the card and the page:
site_url: "https://example.com"
site_label: Visit the client
repo_url: "https://github.com/Abbabon/something"
watch_url: "https://www.youtube.com/watch?v=..."
play_url: "https://abbabon.itch.io/something"

cta: Read the post                   # label for the card's bottom link
accent: green
order: 0                             # cards are sorted by this, ascending
---

A short paragraph describing the engagement: what was broken, what you built,
what it changed. This body is also what shows (truncated) on the card if no
`description` is set.
