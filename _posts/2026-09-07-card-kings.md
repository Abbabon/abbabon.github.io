---
layout: post
title: Card Kings - the game that was almost there
subtitle: Or - a year, three game directors, one pandemic, and a cryo-chamber
tags: [unity, game-dev, mobile, architecture, jelly-button, postmortem, card-kings]
cover-img: /assets/img/posts/CardKings/cover.jpg
share-img: /assets/img/posts/CardKings/cover.jpg
share-img-twitter: /assets/img/posts/CardKings/cover.jpg
comments: true
---

TL;DR - Card Kings: Magical Journey was a mobile game I spent close to a year on at Jelly Button, from 2020 into 2021. It was my first "big" project there, the first one we built on dependency injection and a domain-based architecture from day one, and it was *this* close to launching. Then, in a single day, it was cryo-frozen. It never came back. There are gameplay clips below, because the internet has never seen this game, and I think it deserves eight seconds of your time.

---

Every developer has a game in the drawer: something that was real, that people played, that had a name and a logo and a dragon, and that never shipped. This is mine. I'm writing it down mostly so I can stop retelling it at dinner parties, and partly because future posts will lean on things we did here and I'd rather link than repeat myself.

# What it was

Card Kings was a social-casual game in the Coin Master family (collect, build, attack, raid, repeat) with one twist of our own: instead of spinning a slot machine, you **drew a hand of cards**.

Four cards, four suits. A hand of coins pays out. A hand of bows sends you to the Loot Drop, a little shooting gallery where crates dangle from bunches of balloons and you have ten arrows to bring them down. And a hand of the right suit sends you to raid a sleeping dragon's hoard, eight picks at a time, while another player's fortune sits there snoring.

<div class="mtd-video-row">
  <figure class="mtd-video mtd-video-portrait">
    <video src="/assets/video/card-kings-hand-and-loot-drop.mp4" width="416" height="832"
           poster="/assets/img/posts/CardKings/poster-hand.jpg"
           controls loop muted playsinline preload="metadata"></video>
    <figcaption>A hand of bows, and straight into the Loot Drop.</figcaption>
  </figure>
  <figure class="mtd-video mtd-video-portrait">
    <video src="/assets/video/card-kings-coins.mp4" width="320" height="560"
           poster="/assets/img/posts/CardKings/poster-coins.jpg"
           controls loop muted playsinline preload="metadata"></video>
    <figcaption>Four coin cards. Somebody named Matan is the Cash King and I am not.</figcaption>
  </figure>
</div>

Everything you earned went into your kingdom: islands you built up plot by plot, world after world, from a green meadow to a frozen fortress with a gate made of ice. The king on the cover art was your patron, the princess lived in the tower, and the little white villagers fished all day. The villagers had the right idea.

<div class="mtd-video-row">
  <figure class="mtd-video mtd-video-portrait">
    <video src="/assets/video/card-kings-build-snow.mp4" width="480" height="848"
           poster="/assets/img/posts/CardKings/poster-build.jpg"
           controls loop muted playsinline preload="metadata"></video>
    <figcaption>The snow world, being built one hammer at a time. Chili is down there in the corner, supervising.</figcaption>
  </figure>
  <figure class="mtd-video mtd-video-portrait">
    <video src="/assets/video/card-kings-raid.mp4" width="320" height="560"
           poster="/assets/img/posts/CardKings/poster-raid.jpg"
           controls loop muted playsinline preload="metadata"></video>
    <figcaption>The raid. Eight picks, one very sleepy dragon, one million coins that aren't yours. Yet.</figcaption>
  </figure>
</div>

I wouldn't play this genre for fun, but it was a joy to build. There's a lot of craft hiding under "casual", and this project is where I learned most of it.

# First of its kind, for us

Card Kings was the first project at Jelly Button I started from a blank Unity project: no legacy, no inherited scene with four thousand objects in it, no "don't touch that, nobody knows what it does". So we got to make the structural decisions properly.

Two of them defined the whole codebase: **dependency injection from the first commit** (Zenject, for the curious), and a **domain-based project structure** instead of the usual "Scripts, Prefabs, Materials, Sprites, cry". Gal Bartouv, who was on the team with me, later wrote the approach up properly in [Fighting Entropy in Unity, Structure based on Domains](https://bartouv.github.io/articles/fighting-entropy-in-unity-structure-based-on-domains.html). Go read it; it's five minutes and it will save you months. The essentials, for the impatient:

- **Organise the project by domain, not by asset type.** A folder is a feature. Inside it, sure, group by type, but the top level of the tree should read like a list of what the game *does*.
- **Three tiers, dependencies only point down.** *Company Core* holds systems you'd reuse in any game (an input lock, say). *Game Core* holds this game's shared services and the interfaces everything else talks through. Below that come the actual features (the map, the shop, the loot minigame), each in its own domain, each allowed to depend only on the two tiers above it.
- **Siblings never talk directly.** Two feature domains communicate through interfaces that live in Game Core, and commands keep the control flow one-directional. The XP domain doesn't know the level-up popup exists; it fires a command and moves on with its life.
- **Enforce it with assembly definitions.** One asmdef per domain. A script in the map domain that references something in the shop domain doesn't compile, so nobody has to catch it in code review.
- **"Smurf-name" your assets.** `Shop_ButtonBackground`, `Map_IslandMaterial`. It looks silly for a week, and then you can grep by feature forever, and write a script that yells when an asset wanders out of its domain.
- **Deleting a feature is deleting a folder.** Sharing a system with the next game is copying Company Core. That payoff alone justifies the setup.

I've carried this structure into every project I've had a say in since. When a later post mentions "domains" or "the Card Kings structure", this is what it means.

# Throw the first one away

The best decision we made that year, and one I'd repeat on any project: out of the twelve months we had, we spent the first **three on a prototype we then threw away**, on purpose. It existed to answer three questions: is the card-hand loop fun, does Zenject hold up as the DI framework under a real feature load, and does the domain structure survive a team of people who all need to commit at the same time.

It answered all three before any of the code was precious. When we started the real project we knew which abstractions had earned their keep and which only looked good on a whiteboard. We shipped none of the prototype's code, and I'd still call those three months the most productive of the year.

# Tech art, pre-LLM

I also got to do something I rarely get to do: tech art. Look at the cards in the clips above. Each card **casts a soft shadow onto itself and its neighbours** as the hand fans out and flips, which is what makes a hand of cards feel like it has *weight*. It took real effort in an era when the answer wasn't one prompt away: Shader Graph, a lot of squinting, a lot of "why is it inside out now". I was very proud of it, and I still am.

The trick needed the cards to **write to the Z-buffer and read stencil values back out of it**, and Shader Graph, to this day, has no node for either. So the "Shader Graph" shader was a Shader Graph shader for about ten minutes, until I opened the ShaderLab code it generates underneath, hand-edited the depth and stencil passes into it, and never touched the graph again for fear of it regenerating over my work. I wouldn't recommend that workflow to anyone, and I'd do it again tomorrow.

And then there were the characters: the king with the heart in his crown, the princess in the tower, the villagers, and **Chili the dragon** - the best thing the art team made, in my humble and completely biased opinion. Chili deserved a plushie, maybe a whole merch line, and instead got a build that nobody outside the company ever installed. I'm still a little upset about that.

# A year of weather

We started in 2020, which tells you most of what you need to know. A few weeks in, COVID sent everyone home, and a team that had just learned to work together in one room had to learn to do it over Zoom (well, Teams, but you get the idea) overnight. We adapted, like everyone did that year, but building a team's habits twice costs something.

Then the product side went through **three game directors in a single year**. Each arrived with a different read on what the game should be, reasonable in isolation, and each read meant reshaping features, economies and flows we'd already built. My favourite casualty: for a while there was going to be an **airship**, Final Fantasy style, ferrying you between worlds. I loved it. It also had nothing to do with the actual gameplay, so it was cut, and that was the right call. This, by the way, is where the domains architecture paid for itself: when a feature got cut, it got cut cleanly, folder and all, and the rest of the game didn't notice.

Despite the weather, we got there. The game was **almost ready to launch**, with soft-launch builds and a live economy, and we were counting down.

# Cryo-frozen

Then, in one day, Jelly Button management moved our team to work on Merge Stories.

Merge Stories was its own beast and deserves its own post. The cost of that decision is the part that belongs in this one: a year of work, one meeting, and Card Kings went into the freezer "for another time". Anyone who has worked in this industry knows that "another time" is a polite way of saying never. The build is still on a server somewhere, presumably, with Chili inside it, presumably still supervising.

Companies make bets, and that one didn't include us. I get it. But games die like this far more often than they die from being bad, and this one died because the bet went elsewhere.

# What stays

The part that didn't go into the freezer was the team. The friendships from that group outlived the project, outlived Jelly Button, and in a few cases outlived the decade. Some of those people still work with me today, and Yuri - who was in the trenches with me on this one - has been [podcasting](/#mtd-podcast) and making things with me ever since. There is, to this day, an active WhatsApp group called "CardKings" with the core development team in it, and it has been busier than the game for years. That's a better outcome than most shipped games get.

The Merge Stories post is coming, at this blog's usual pace. Go build your kingdom. 🐉👑
