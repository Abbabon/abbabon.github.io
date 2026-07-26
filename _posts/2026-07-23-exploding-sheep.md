---
layout: post
title: Exploding Sheep - Minesweeper, but the mines are woolly and the numbers lie a little
subtitle: Or - what happens when a shepherd, a dog named Wilson, and a can of beans walk into a minefield
tags: [unity, game-dev, puzzle, itch, side-project]
cover-img: /assets/img/posts/ExplodingSheep/cover.jpg
share-img: /assets/img/posts/ExplodingSheep/cover.jpg
share-img-twitter: /assets/img/posts/ExplodingSheep/cover.jpg
comments: true
---

TL;DR - [Exploding Sheep](https://abbabon.itch.io/exploding-sheep) is a free, browser-playable puzzle game where you guide a shepherd through a minefield, using sheep as shields and Minesweeper logic that has been gently bent to be *fun*. There's a [trailer](https://www.youtube.com/watch?v=jxmDywDyvJY) too, and it plays in your browser right now, no install.

---

Sheep. They explode. That was more or less the entire pitch when [Moshe Gilboa](https://medium.com/@moshegilboa) first described it to me - and an idea that good, plus the pull of building something a little bit silly, was all it took to get me writing code for it after hours. You don't need much of an excuse to work on the fun thing.

Exploding Sheep is Moshe's concept: he designed it, wrote it, drew half of it, and named the hero after his grandfather. I started building it out alongside him, and over time more hands joined - other developers, an artist, a trio of composers, some patient QA. This post is about what it turned into, and the one small decision the whole game balances on.

<div class="mtd-post-cta">
  <a class="mtd-btn mtd-btn-primary" href="https://abbabon.itch.io/exploding-sheep" target="_blank" rel="noreferrer">🐑 Play Exploding Sheep in your browser</a>
</div>

# What it is

<figure class="mtd-shot mtd-shot-portrait mtd-shot-right">
  <img src="/assets/img/posts/ExplodingSheep/screenshot-2.png" alt="The minefield, the exit, and a sheep mid-detonation" />
  <figcaption>The board: numbers, mines, sheep, and a very desirable EXIT.</figcaption>
</figure>

You play Uncle Moses, a shepherd who has wandered into a minefield and would very much like to reach the **EXIT** sign without turning into a cloud of wool. It looks like Minesweeper, and it plays like Minesweeper's easygoing cousin who took up hyper-casual games and never looked back.

The numbers on the field tell you how many mines are adjacent - but here's the one design decision that makes the whole thing tick: **they only count mines directly up, down, left, and right. Not diagonals.** In real Minesweeper that diagonal ambiguity is exactly the part that makes you sweat. Cutting it out sounds like it would gut the puzzle... and it nearly does, which is the point. It leaves *just* enough thinking that puzzle players don't feel insulted, while leaving enough headroom to pile fun mechanics on top. That single tweak is the seam the entire game is built along.

And the sheep aren't decoration - they're your lives, your shields, and your ammunition all at once. Collect them, and you can spend one to safely detonate a mine you'd rather not step on. Suddenly the death spiral of classic Minesweeper ("one wrong click, game over") becomes a resource you manage. You're not just surviving the board; you're deciding how much wool a shortcut is worth.

# The parts that surprised me

<figure class="mtd-shot mtd-shot-portrait mtd-shot-left">
  <img src="/assets/img/posts/ExplodingSheep/screenshot-3.png" alt="A later, snow-covered world" />
  <figcaption>A later world - same rules, colder palette.</figcaption>
</figure>

A few things about this project stuck with me long after the last commit:

**It started as cardboard.** Before a single line of Unity, Moshe prototyped it physically - a grid drawn out, paperclips for flags, friends shuffling pieces around a table. When we later debated a big structural change, the tie-breaker wasn't a design-doc argument; it was *play the paper version and see*. Watching people's hands tells you things a Figma mockup never will.

**It became a roguelike halfway through.** The early build was small, self-contained puzzles on a little grid. After a session with veteran designer Yotam Wilson (yes - the in-game guide dog is also named Wilson; we took this as a sign it was meant to be), the whole flow shifted: you now *keep* the sheep you collect across levels, journeying through themed worlds - snowy Russia, a WWII-flavoured stretch - with your flock as persistent progress. Skill compounds instead of resetting.

**The humour is deeply committed.** There's a gate character named Mahmoud who won't let you pass without paying sheep. There's a "BeansCan" power-up whose effect is exactly the gastric event the name implies. There's a Bo Peep who doubles your reward if you clear a world flawlessly. It is a game unafraid of a fart joke, and it wears that proudly.

<figure class="mtd-shot mtd-shot-wide">
  <img src="/assets/img/posts/ExplodingSheep/screenshot-1.png" alt="Uncle Moses, Wilson the dog, and a sheep about to get sheared" />
  <figcaption>Uncle Moses, Wilson the dog, and a sheep about to have a very bad haircut.</figcaption>
</figure>

# What I took from it

The lesson here wasn't technical - it was watching a good designer protect one idea. Moshe knew the game lived or died on that "numbers ignore diagonals" call, and every mechanic after it was in service of keeping the core approachable while giving it depth. My job, on the code side, was mostly to *not* over-engineer around a decision that was already right - the same restraint I try (and often fail) to apply to my own [Unity tooling](/2021-01-24-scene-navigation-tool/).

It was also just a lovely reminder that games are made by people. This one had developers writing it after their day jobs, an artist, three composers, and a couple of QA folks who found the bugs I swore weren't there. Shipping something silly with your friends is one of the better uses of an evening.

# Go play it

It's free, it runs in your browser, and it will not judge you for spending sheep recklessly:

<div class="mtd-post-cta">
  <a class="mtd-btn mtd-btn-primary" href="https://abbabon.itch.io/exploding-sheep" target="_blank" rel="noreferrer">🐑 Play Exploding Sheep in your browser</a>
</div>

If you'd rather watch first, [here's the trailer](https://www.youtube.com/watch?v=jxmDywDyvJY). And if you want the full origin story - the cardboard, the pivots, the grandfather - Moshe wrote two proper making-of posts that are worth your time: [Part I](https://medium.com/@moshegilboa/exploding-sheep-making-of-part-i-b45ef5aaa93) and [Part II](https://medium.com/@moshegilboa/exploding-sheep-making-of-part-ii-4c1b2641dafa).

**Full credits** (because they earned it): created by Moshe Gilboa; programming by Amit Netanel, Ido Adler, Itamar Ashkenazi, Eli Broide, and Yotam Wilson; art by Larisa Kerzhner and Moshe Gilboa; music by Yuval Vilner, Tal Perets, and Daniel Shemer; QA by Poli Fofankov and Nitsots Saranga.

Go blow up some sheep. 🐑💥
