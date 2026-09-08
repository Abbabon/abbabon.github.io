# STYLE.md — Writing style guide for "Master the Disaster"

A distillation of the blog's voice, based on the published posts (Scene Navigation, Unity Shell, Shader Graph Gradient, Private UPM Repository, Teaching Unity, book reviews). Use this when drafting new posts so they sound like Amit, not like a press release.

## Voice & Persona

- **First-person practitioner.** Posts are written from the trenches: "For the last two years I've been using...", "So recently I found myself...". The author is a working Unity developer sharing what he actually built and why, never lecturing from an ivory tower.
- **Self-deprecating and self-aware.** The blog jokes about its own posting frequency and half-kept promises: *"(and my 'might' promises are of course worth a lot judging by the history of this blog)"*. Failed intentions become punchlines, not apologies.
- **Opinionated, with receipts.** Strong takes on clean code, packages, open source, and the `UnityEditor` namespace ("It is rightly dreaded", "backwards, like most of the UnityEditor namespace TBH"). Opinions come with practical justifications, not just hot air.
- **Playful nerd humor.** Nicknames and running bits: developers unfamiliar with the shell are "Muggles", Odin is "your new one-eyed best friend", ALL-CAPS declarations like **THE GRAVE SINS OF OPEN SOURCE REPOSITORIES**. Pop-culture and mythology references are welcome; corporate marketing speak is not.
- **Bursts of enthusiasm.** Occasional exclamations: "AMAZING!", "Hurrah!", "Wicked.", "Gotta love dictionaries." Use sparingly — one or two per post, at moments of genuine payoff.

## Structure

1. **Front matter** (Beautiful Jekyll):
   ```yaml
   ---
   layout: post
   title: <Plain descriptive title>
   subtitle: <Or - a joke / alternate title. Often starts with "Or -" or "yet another...">
   tags: [unity, tools, package, ...]   # lowercase, existing tags where possible
   cover-img: /assets/img/posts/<...>
   share-img: /assets/img/posts/<...>
   comments: true
   ---
   ```
2. **TL;DR first.** Open with a one-line `TL;DR - ` giving the link/payoff immediately, often followed by a `---` divider. Readers who just want the repo link should get it in line one.
3. **The one-word cold open.** A signature move: start the body with the subject as a single word and a short declaration. *"Gradients. They are everywhere."*, *"Scenes. Most of us are not using enough of them."*
4. **Story before solution.** A few paragraphs of context: the pain, the day job anecdote, the failed alternatives — then the tool/technique as the answer.
5. **Practical middle.** Headers per step or per concept (`## SceneId.cs`, `## Running shell commands... NOT from code!`). Headers can be sentences, questions, or jokes. Code in `{% highlight csharp linenos %}` blocks, screenshots inline with `![alt](/assets/img/posts/...)`.
6. **"Next Steps" / future promises ending.** Close with ideas for expansion, half-promises about future posts (self-awarely), and a sign-off like "Cheers!" or "Stay tuned! 🚀".

## Formatting conventions

- Images live in `assets/img/posts/<PostName>/` (or flat in `assets/img/posts/`) and are referenced with absolute paths.
- Embeds used before: GitHub repo cards (`gh-card.dev`), Asset Store link-maker iframes, YouTube thumbnail links.
- Lists are used generously — numbered for sequences and sins, bulleted for reasons and takeaways.
- Bold for **key terms and dramatic emphasis**, italics rarely.
- Emoji appear occasionally in later posts (🚀, 👾, 🎓) — fine in moderation, mostly near the end or in list headers.

## Sentence-level tics (use, don't overuse)

- Direct address and rhetorical questions: "Why is it so hard, Unity?", "And what shall we do with all that space...."
- Parenthetical asides for honesty and jokes: "(like most of the UnityEditor namespace TBH)", "(I really have to get to writing that post sometime...)".
- Short dramatic fragments: "That's it.", "Simple enough.", "Ship it. Use it. Pull-Request it."
- Casual contractions and mild slang; British-ish spellings sneak in ("colour", "realise") — don't force either way.
- Sign-post honesty about scope: "this is a topic for another post later on".

## What to avoid

- Marketing voice: no "revolutionary", "seamless", "game-changing", no feature-matrix bullet dumps copied from a README.
- Excessive emoji or hashtag noise.
- Long intros about "in today's fast-paced world of game development". Get to the pain point.
- Pretending everything is polished — the blog's charm is honesty about trade-offs, hacks, and unfinished edges.

## Tells to hunt after drafting (and what not to touch)

Drafts written with an LLM keep a few habits that the posts above never had.
After drafting or substantially editing a post, run the `humanize-post` skill
(`.claude/skills/humanize-post/`); this section is the blog-specific part of
its rules.

**Kill on sight**

- "Not X but Y" in any form, including the flipped closer ("Not a workflow I'd recommend. Very much one I'd do again.") and the split form ("It wasn't bad. It just wasn't the bet.").
- One-line closers that restate the paragraph, and mirrored send-offs ("The game froze. The chat never did.").
- Aphorisms dressed as the point ("the game is what you lost, the people are what you keep").
- Run-ups: "Here's the thing", "what nobody tells you", "Honestly?" as an opener.
- Scripted Q&A pairs: "Is it X? Not really. Was it Y? Absolutely."
- Arguing with no one: "I don't say this with bitterness", "To be clear".
- Triads with the same opener three times ("Chili deserved… Chili deserved… Chili got…").
- The words: quietly, pivotal, testament, landscape, robust, seamless, crucial, delve, "for once" as a sigh.

**Budget, don't ban**

- Spaced ` - ` dashes: about 5 per post, the rate of the hand-written ones. Never `—`.
- One rhetorical question, one fragment ("That's it."), one ALL-CAPS joke, one exclamation per post.
- Bold: key terms and one dramatic beat, not every list item. A list whose bold labels are a real inventory (steps, sins, the domains rules) is fine.

**Leave alone**

Everything in "Voice & Persona" and "Sentence-level tics" above. The TL;DR line, the `Or -` subtitle, parentheses, British spellings, self-deprecation about posting frequency, and the emoji sign-off are the voice, not tells. Posts dated before 2025 are hand-written; never run the skill on them.
