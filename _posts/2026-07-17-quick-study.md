---
layout: post
title: Quick Study - an offline Magic card index for your menu bar
subtitle: Or - the train has no WiFi and it makes me sad
tags: [macos, tools, mtg, swift, offline-first]
cover-img: /assets/img/posts/QuickStudy/quick-study-search.png
share-img: /assets/img/posts/QuickStudy/quick-study-search.png
share-img-twitter: /assets/img/posts/QuickStudy/quick-study-search.png
comments: true
---

TL;DR - I built [Quick Study](https://github.com/Abbabon/quick-study), a small Spotlight-style macOS menu-bar app for looking up Magic: The Gathering cards. Global hotkey, type a name, see the card - fully offline after a single sync. Free, open source, installs with one `brew` command.

---

Magic. I can pivot from any topic to Magic: The Gathering in two sentences - challenge proposed. But after triumphant losses at two recent pre-releases at my local game store, I had to face the music: I love the game, and I suck at actually playing it.

The book everyone points at is Reid Duke's *Level One*. It reads less like a strategy guide and more like a deliberate-practice manual: tempo, card advantage, mulligans, sequencing. The catch - you can't really read a chapter on removal without twenty removal spells in front of you.

My main reading time is the commute, on a train route that, charmingly, has no working WiFi. Phone signal is hit-or-miss. So the book opens; the cards don't. [Scryfall](https://scryfall.com) is online-first. The official app is online-first. Browser tabs are online-first. The closest thing I had was ManaBox (my favorite collection tracker), but it ships card text only as a fallback - no images - and frankly, it doesn't spark joy.

So I built the thing.

# What it is

A small macOS menu-bar app, Spotlight-style: press a global hotkey (**⌥⌘M** by default), a panel opens, type a partial name, see the card - full image, oracle text with inline mana symbols, and every printing it ever had. Fully offline after a single sync: it pulls Scryfall's free bulk card data and images once, then never asks the network again.

![Quick Study in action](/assets/img/posts/QuickStudy/quick-study-demo.gif)

Search is instant because the index is local - sub-millisecond fuzzy ranking over ~25k cards, held in memory. That matters more than it sounds when you're flipping between book and screen every few seconds. The ranking is layered (exact → prefix → word-start → substring → initials), so short exact names win on ambiguous queries, and you can narrow things down with Scryfall-style inline filters right in the search box: `r:rare`, `t:creature`, `o:"draw a card"`, or `goblin t:creature -t:legendary` if you're feeling fancy.

A few things grew around the core lookup, because side projects are where scope goes to creep:

* **Card lists** - build a wishlist or a deck shell in a collapsible side column.
* **Recently Added** - freshly-spoiled cards surface as soon as they hit your local database, newest first.
* **Play mode** - two endless-survival games built from the artwork you've already cached: *Guess the Card* and *Guess the Artist*. Three lives. I am not proud of my best streak.

<p align="center"><img src="/assets/img/posts/QuickStudy/quick-study-play.png" alt="Guess the Card in progress" width="440"></p>

# The name

For the MTG readers: [Quick Study](https://scryfall.com/search?q=%21%22Quick+Study%22) is a blue Strixhaven instant. Two cards for three CMC, both card advantage and spell advantage, great with spell mastery, flashback, and assorted shenanigans. A simple little card. The app is the same energy.

# The parts I actually care about

Building a small, single-purpose tool for a single-person problem is still worth doing, and it's easier than ever. Yes, I vibed the whole thing - it's Swift and SwiftUI, and the bar for "worth shipping" has drifted upward over the years, and it shouldn't have.

**Offline-first isn't nostalgia; it's a discipline.** It forces honest answers about what data you actually need, and when. Here the answer turned out to be: one bulk fetch from Scryfall's API into a local SQLite database, an on-disk image cache (~4 GB if you want every card image, optional), and a background check that quietly ingests new spoilers when you *do* have a connection. Everything else - search, preview, printings, even the games - runs off that local copy. No accounts, no telemetry, no spinner on a moving train.

# Installation

On an Apple Silicon Mac:

{% highlight bash %}
brew install --cask Abbabon/quick-study/quick-study
{% endhighlight %}

Grant Accessibility permission on first launch (that's what makes the global hotkey work), let it download the card database once, and you're set. Building from source is a single script away - details in the README.

<p align="center"><a href="https://github.com/abbabon/quick-study"><img src="https://gh-card.dev/repos/abbabon/quick-study.svg" /></a></p>

# It's not really about Magic

It's MTG today, but the shape - bulk-fetch, local DB, menu-bar search - generalizes. Any reference corpus you want at your fingertips offline could live in this skeleton: another card game, a rules glossary, a different study domain entirely. [PRs are very welcome](https://github.com/Abbabon/quick-study) if you want to extend it; if you just want to use it, the install is the one-liner above.

This isn't the only offline tool I've built lately, but the others can wait for another post (and we all know what my "another post" promises are worth).

Cheers! 🚂
