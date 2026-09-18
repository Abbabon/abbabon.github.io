---
layout: post
title: Previously On - a recap of your own game, built in an hour
subtitle: Or - what I made at the Claude Build Day in Tel Aviv, and how scope nearly ate me alive
tags: [ai, claude, tools, python, hackathon, side-project, previously-on]
cover-img: /assets/img/posts/PreviouslyOn/narrator.jpg
share-img: /assets/img/posts/PreviouslyOn/narrator.jpg
share-img-twitter: /assets/img/posts/PreviouslyOn/narrator.jpg
comments: true
---

TL;DR - Previously On watches your gameplay footage, figures out what you did, and the next time you sit down it plays you a narrated "Previously on…" cut from your own clips, with a drawn narrator and a static site holding the full record. I built it in the one-hour contest at the Claude Build Day in Tel Aviv. The code is on [GitHub](https://github.com/Abbabon/previously-on), the recap video is below, and the site it generated is hosted right here on this blog at [/previously-on/](/previously-on/).

---

LOST. Say what you will about the ending, the "Previously on LOST" segments were perfect. Forty seconds, and you were back on the island with every thread in your head, whether you'd watched last week or last year.

I need that for video games. Between parenthood, the day job, teaching and the podcast, my fancy AAA games get played maybe once a week, on a good week. I come back to 007 First Light and I have no idea who the man in the orange jumpsuit was, why I'm holding a rocket launcher serial number in my head, or which container I was supposed to open. The game's own journal is a list of objectives, which is no help at all with the story. So I load a save, wander for ten minutes trying to remember what I was doing, and the session is half over.

So I wondered: can you condense a play session into a tight one-minute recap, in the tone of the game, from the footage itself?

Apparently you can.

<figure class="mtd-video">
  <video src="/previously-on/media/recaps/20260917-194549/recap-dossier.mp4"
         poster="/assets/img/posts/PreviouslyOn/poster-dossier.jpg"
         controls playsinline preload="metadata"></video>
  <figcaption>"The Empty Cradle": thirty minutes of 007 First Light in a little over two minutes, in the dossier pack, narrated by an elder who has clearly seen things.</figcaption>
</figure>

# The event

The [Claude Code Fable 5.1 Build Day](https://luma.com/claude-8cca) was on the 17th of September at the Island offices on HaMered street, put together by Natali Shtulman and Tali Despins for Claude Community Events, with Island hosting and feeding us. Doors at five, talks and demos from folks at EON and Island at six, and then the main course: a **one-hour build contest** at seven, two-minute demos at eight, judging at half past. Three tracks to pick from, Delight, Breakthrough and Everyday, and a hundred dollars of API credits in every seat.

One hour. I have spent longer than that arguing with a Unity import setting.

# A confession about the hour

A confession: I did not walk in cold. In the days before, I had a remote Claude session running on the idea, poking at the hard parts. Can ffmpeg cut clips out of an AV1 webm quickly? How do you pick frames from a 3D game without a model?

What came out of that was not code. It was a **prompt**: 570 lines, about 6,300 words, with a data model, a build order, and eighteen numbered constraints that read like scar tissue. "Ken Burns must run on an upscaled frame or it jitters." "Every concat segment needs an identically encoded audio track or the bed silently disappears." "Assert on every string patch." The prompt and the product were then built at the event, in the hour, with Fable 5.1, and the hour would not have been close to enough without the homework.

# Scope, or how I almost didn't make it

The prompt opens with "I am on the clock, so build in this order and keep each stage runnable before starting the next." That line saved the demo.

The order was: ingest a video into frames, select the frames worth keeping, observe them with Claude, write the recap script, narrate it, render a video with real clips, generate the site, and only then the fancy stuff - the drawn narrator, the live screen capture, the YouTube ingest. Each stage had to produce something I could show before the next one started.

<div class="mermaid">
%%{init: {"theme": "base", "flowchart": {"htmlLabels": false, "padding": 12}, "themeVariables": {"background": "#282a36", "primaryColor": "#44475a", "primaryTextColor": "#f8f8f2", "primaryBorderColor": "#bd93f9", "lineColor": "#8be9fd", "secondaryColor": "#6272a4", "tertiaryColor": "#282a36", "edgeLabelBackground": "#282a36", "fontFamily": "Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif", "fontSize": "15px"}}}%%
flowchart TB
  ingest["ingest&lt;br/&gt;video file, YouTube clip or live capture"]
  ingest -- "1 fps frames" --> select["select&lt;br/&gt;histograms + edge density, no model"]
  select -- "~10% kept, epoch-named" --> observe["observe&lt;br/&gt;Claude, batches of six + running save-state"]
  brief["brief&lt;br/&gt;one web lookup per game"] --> observe
  observe -- "events + save-state" --> recap["recap&lt;br/&gt;script, style pack, chosen frames"]
  recap --> tts["ElevenLabs&lt;br/&gt;narration + sentence timings"]
  tts --> render["render&lt;br/&gt;real clips, music bed, narrator or captions"]
  recap --> render
  render -- "recap-pack.mp4" --> site["site&lt;br/&gt;one index.html + media/"]
  observe -. "every call" .-> cost[("cost ledger")]
  recap -.-> cost
  tts -.-> cost
</div>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: false }); document.fonts.ready.then(function () { mermaid.run(); });</script>
<style>.mermaid svg, .mermaid svg text, .mermaid svg tspan { font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }</style>

Here is how the hour actually went. The recap folder is stamped 19:45, the two rendered videos landed at 19:54, and the first commit went in at 19:58:45. Demos started at 20:00. Only the first half of the test footage ever got observed; the second session is still sitting there, unwatched, and the live `capture` command was built but never run, because it needs a screen recording permission I wasn't going to fight macOS over with six minutes left.

If I had let it build the narrator or the site before the pipeline, I would have stood up with a folder of JPEGs. In a one-hour contest scope decides everything, and the only way I know to hold it is to write the order down before the clock starts and refuse to reorder it under pressure.

# Which frames are vital

This was the part I found most interesting to think through, and the part the remote session earned its keep on.

A thirty-minute session at one frame per second is 1,800 frames. Sending them all to a vision model is about twenty times more expensive than sending every twentieth one, and most of them are the same corridor. But if you sample every 12 to 20 seconds instead, you miss the two-second item popup, or the one line of dialogue where someone finally says a name. Those are exactly the frames the recap needs.

So the selector samples at 1 fps and decides **locally, with numpy and no model**, which frames to keep. Four reasons a frame survives:

- **cut**: the colour histogram is far enough from the last kept frame that the scene changed. Kept even if it's within the minimum gap.
- **drift**: the histogram distance between consecutive frames has been accumulating since the last keep, and it crossed a threshold. Slow pans and long walks still get a frame now and then.
- **ui**: edge density jumped. This is the popup detector, and it's measured in bands (bottom strip, top strip, centre) rather than across the whole frame, because a banner is diluted by the scenery around it. Banding roughly tripled how many popups it caught.
- **beat**: nothing kept for 25 seconds, take one anyway.

Difference hashing, the obvious first choice, does not work for this: its median between neighbouring frames is about 0.34 in Dark Souls and 0.08 in Animal Crossing, so no single threshold survives two games. Accumulated histogram distance self-normalises, so one setting covers every game.

The result on the Bond footage: 151 frames kept out of about 1,800 for the first half, 243 for the second. Roughly a tenth. Those go to Claude in batches of six, each with its timestamp and the gap from the previous frame (the frames are selected, not evenly spaced, so the gap is information), plus the running save-state and a one-time game brief from a single web lookup. The model returns the events it saw and the full updated state in one call, so there is no merge logic anywhere. One rule I'm particularly fond of: **a person is only named once the game has shown the name on screen**. The pilot was "the pilot" for six batches, and then he was Bond.

When the recap script is written, the model picks the frames that carry the beats, and because every frame's filename is an epoch second and the session knows where in the footage it started, `video_time = clip_start + (epoch - started)` maps each frame back to its moment in the source. Render cuts a real clip around each one instead of showing a still, and that one line of arithmetic is what makes it a recap.

# What it cost

The model chose the "dossier" style pack for the video above out of the five available (grim, cozy, hype, dossier, storybook), wrote the script in second person, and ended on the cliffhanger: open the keypad door in container G9, then find B4. I did not know about B4. I do now.

The whole thing, for thirty minutes of gameplay, cost $9.30 in model and voice calls, which the built-in ledger helpfully translates to $18.61 per hour of play. Most of it is the observe stage on Fable 5.1. That is a lot for a hobby and I want it lower. At least I know the number, because the cost ledger was stage one of the build order and every call has written into it since the first.

![The save card at the end of the recap](/assets/img/posts/PreviouslyOn/save-card.jpg)

# Ask for a system

The thing I'm proudest of is a side effect of how the prompt was written. I did not ask for "a video recap". I asked for a **system**: a data model with sessions, states, briefs and recaps as folders on disk, a command-line tool with thirteen subcommands, prompts as plain markdown files, style packs as TOML, config in one place and secrets in another.

So when stage six said "build a site", the site fell out of the data model with almost no extra thought. It's one self-contained `index.html` with the JSON inlined and hash routing, no build step, plus a `media/` folder of frames, videos and save cards. Every game gets a page with the latest recap video, the spoken script, a chapter slideshow with the frames, a quest board with the open threads first, the full account, and the people and things it has met. Every session gets a timeline of batches with a frame strip. Rebuilt after every recap.

![The game page on the generated site](/assets/img/posts/PreviouslyOn/site-game.jpg)

And because it's static and relative-pathed, I could drop the whole folder into this blog's repo, and it just works: [abbabon.github.io/previously-on/](/previously-on/). We cracked hosting video on GitHub Pages a few posts back, and the two recaps are re-encoded to 720p so the repo doesn't hate me. Go click around the quest board. It knows more about my Bond save than I do.

Focusing the prompt on the system is what paid off. The video is one output; the CMS, the ledger, the resumable observe step, the `ask` command that answers a spoken question from your history, all came out of the same shape.

# Claude can't do it all

Two parts of this were not Claude.

The **voice** is ElevenLabs, which has become my new generative obsession over the last few weeks (there is a post about that coming, and my "coming" promises are, as regular readers know, worth roughly their weight in gold). Alongside the script, the recap prompt writes a per-sentence emotion track, and ElevenLabs returns sentence timings, so the speech bubble text and the narrator's face are both driven by data the pipeline already had. Its mouth follows the audio envelope, and nobody animated anything.

![The elder's expression sheet](/assets/img/posts/PreviouslyOn/elder-sheet.jpg)

The **art** is gpt-image through the Codex CLI, and it ate a chunk of my ChatGPT subscription doing it. A full-body reference first, then a strict five-by-two expression sheet drawn from that reference, chroma-keyed, aligned by body rather than bounding box (silhouettes change between expressions, so the box moves even when the figure doesn't). gpt-image 2.5 is sick. Only the bubble's tail is drawn in code, with the outline weight and paper colour read off the body art, and that particular detail was fixed the morning after, because at 19:54 it was good enough for a demo and not good enough for a blog post.

A pack whose character hasn't been generated yet renders with burned captions instead, which is what the cozy version of the same recap looks like.

![Captions in the cozy pack](/assets/img/posts/PreviouslyOn/captions-cozy.jpg)

# Thank you

To Natali, Tali, the Claude Community Events crew and everyone at Island who opened their offices and fed us: thank you. It was fun, it was engaging, and the part I did not expect was how inspiring the other demos were. Two minutes each, a room full of people who had all just spent the same hour under the same clock, and the range of what came out of it was humbling.

# Next steps

- Run `capture` on an actual session of mine, with the screen recording permission sorted out beforehand this time, and see if a real week away feels the way I hope it does.
- Observe the second half of the Bond footage, which has been sitting there patiently since 19:45.
- Get the per-hour cost down. Haiku for the observe step and Fable for the recap is the obvious experiment.
- The ElevenLabs post. And a LinkedIn version of this one, which is also apparently a thing I do now.

Previously on Master the Disaster: a man built a thing in an hour and then wrote about it for three. Next time, hopefully, less of the second part. 🎬
