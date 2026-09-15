---
name: humanize-post
description: Rewrite a "Master the Disaster" post so it reads like Amit, not like a language model, without changing what it says. Run it after drafting or substantially editing any post in _posts/ or drafts/, and whenever the user asks to humanize, de-AI, voice-check, or "make it sound like me". Pass a file path; add `review` to report without editing.
---

# Humanize a post

Remove AI writing patterns from a blog post while keeping every fact and the
author's voice. The generic pattern list comes from blader/humanizer (Wikipedia's
"Signs of AI writing") and rcarmo's technical-docs guide; the voice comes from
`STYLE.md` and the hand-written posts. **When the two disagree, the voice wins.**

## Inputs

- Target: the path given, else the newest file in `_posts/`, else `drafts/`.
- Mode: default edits the file in place (prose only). `review` prints the report
  and touches nothing.

## Steps

1. **Load the voice.** Read `STYLE.md`, then skim two hand-written samples:
   `_posts/2022-04-15-unity-shell-package.md` and
   `_posts/2020-11-09-serializing-transforms.md`. Note sentence length, the
   spaced ` - ` dash (about 5 per post, never `—`), the asides in parentheses,
   the loose "So ..." openers, the one-off fragment. Match that. Do not copy
   its typos.
2. **Read the whole post once** and mark tells, strongest first, at sentence
   *and* paragraph scale: a contrast split across sentences, the same closer
   after several sections, three parallel examples, an echo ending.
3. **Run the scanner** for the mechanical list:
   ```bash
   python3 .claude/skills/humanize-post/scan.py <post.md>
   ```
   It reports STRONG hits, watch words, dash count vs. budget, bold-label
   bullets, and one-line paragraphs. It never edits. Treat its output as
   candidates, not verdicts.
4. **Rewrite the prose.** Keep every supported claim, name, number, date, quote,
   link and link target. Add nothing: no new fact, anecdote, or citation. If a
   sentence needs a detail you do not have, write the simpler sentence. You may
   merge, split, shorten and reorder paragraphs. State each point plainly
   instead of patching flagged phrases one by one; if a sentence stays awkward,
   rewrite the paragraph around its main point.
5. **Leave untouched:** YAML front matter, `<div class="mtd-…">`, `<figure>`,
   `<video>`, `<iframe>` and other HTML blocks, `{% highlight %}` and fenced
   code, indented code, inline code, image and link paths, Liquid tags.
   Figcaptions are prose and may be edited, but keep their facts.
6. **Check.** Re-run the scanner. Then read the result in the author's voice and
   look for the five tells that most often survive: a not-X-but-Y, a one-line
   closer, a dash over budget, a triad, a bold label. Confirm no fact was added
   or dropped (shape edits under triads, qualifiers and lists drop them most).
7. **Report** (in both modes): a short table of tells by section, what changed,
   what was kept on purpose as voice, and the dash count before/after. Do not
   commit; the user reviews with `git diff`.

## Patterns

Numbered strongest first. Groups A and E justify an edit on one sighting. The
rest need company from other tells in the same passage. Every "after" here is
in blog voice, not manual voice.

### A. Staging instead of stating (act on one sighting)

1. **Not X but Y.** "not X but Y", "not just/only/merely X", "it's not X, it's
   Y", the flipped closer ("Not a workflow I'd recommend. Very much a workflow
   I'd do again."), the split form ("This one wasn't bad. It just wasn't the
   bet."). The negative half names nothing anyone claimed. State the point.
   Keep a contrast only when the negative half corrects a belief the reader
   actually holds.
   *Before:* "It's not a tiny thing. It's the thing that gives the hand weight."
   *After:* "That shadow is what gives a hand of cards weight."
2. **One-line closers and echo endings.** A one-sentence paragraph restating
   the one before; "If you take one thing from this post, take that."; "That's
   the whole payoff."; a rhymed or mirrored send-off ("I had a blast. But it's
   in the past."; "The game has been frozen for years. The chat never was.").
   One short sentence can carry emphasis if it carries a new fact. Cut the
   restatement; merge the fragments into a sentence with a claim.
3. **Sayings that sound deep.** "the real question is", "at its core", "X is
   the Y of Z", "the game is what you lost, the people are what you keep".
   Replace the aphorism with the specific claim.
4. **Staged run-up.** "Here's the thing", "Here's what nobody tells you",
   "Let's dive in", "Honestly?" as a standalone opener, "Look,". Remove the
   run-up, then make the point. "Honestly" inside a casual sentence is fine.
5. **Staged Q&A pairs.** "Is it X? Not really. Was it Y? Absolutely." A single
   rhetorical question is the author's habit (see STYLE.md); the tell is the
   scripted pair with one-word answers. Turn it into a sentence with the
   opinion in it.
6. **Arguing with no one.** "I'm not saying", "I don't say this with
   bitterness", "To be clear", "Some might say... but". Remove the defense
   unless the objection appears in the text; if it holds a claim, state the
   claim.

### B. Rhythm by rule (need company)

7. **Forced triads and repeated openers.** Three parallel examples or three
   sentences opening with the same word ("Chili deserved... Chili deserved...
   Chili got..."). Keep three items only when the meaning has three parts.
   Merge, develop the strongest one, or vary the structure.
8. **Dashes over budget.** The author uses a spaced hyphen ` - ` about five
   times per post and never `—`. A draft with fifteen is reaching for the dash
   to avoid choosing how two clauses relate. Replace the extras with a period,
   comma, colon or parentheses. Never introduce `—` or `–`. Dashes inside code,
   paths and URLs do not count.
9. **Rows of fragments and ALL. CAPS. drama.** "No aesthetic prior. No
   nostalgia." Merge into a sentence. One fragment per post ("That's it.") is
   voice; a row of them is a tell.
10. **Stacked qualifiers.** "could potentially possibly". Keep a hedge only when
    real doubt exists. "Perhaps" and "tends to" are human.
11. **Passive voice and missing subjects.** Name who acted when it clarifies.
12. **Hyphenated pairs after the noun.** "the report is high-quality" → "high
    quality". Keep the hyphen before a noun.

### C. Inflation and borrowed authority

13. **Watch words.** additionally, align with, bolster, crucial, deep dive,
    delve, enduring, enhance, foster, garner, highlight (verb), interplay,
    intricate, landscape, meticulous, pivotal, quietly, robust (figurative),
    showcase, tapestry, testament, underscore, vibrant, seamless,
    game-changing, revolutionary, transformative, holistic, comprehensive,
    powerful, elevate, unlock, paradigm, synergy, ecosystem, leverage, utilise,
    prior to, in order to, it is worth noting, importantly, notably,
    interestingly, that said, "for once" as a sigh. A formal word outside this
    list is not a tell by itself.
14. **Inflated significance and send-offs.** "marked a turning point", "the
    future looks bright", a closing paragraph that promises a legacy. Keep the
    fact, drop the significance. End on the last concrete detail or on the
    author's usual sign-off (a half-promise about a future post, "Cheers!",
    "Stay tuned", one emoji).
15. **-ing riders.** ", highlighting its importance", ", reflecting broader
    trends". Cut the rider or say the actual consequence.
16. **Sales language.** boasts, nestled, stunning, breathtaking, "the works".
    Say what the thing is.
17. **Borrowed authority.** "experts say", "observers note". Name the source or
    cut the claim. Never invent one.
18. **Avoiding is / are / has.** "serves as", "stands as", "features",
    "boasts" → "is", "are", "has".

### D. Formatting by rule

19. **Bold as decoration.** Bold on every list item, or a bold phrase in every
    paragraph. STYLE.md allows bold for key terms and one dramatic beat; the
    tell is bold applied by rule. A list whose bold labels are a real inventory
    (the domains list in Card Kings) stays.
20. **Decorative headings.** Title Case On Every Word, emoji in headings, a
    `---` between every section. The blog's own `---` after the TL;DR stays.
21. **Curly quotes** where the file uses straight ones. Weak alone.

### E. Leftovers (remove outright)

22. **Chat residue.** "Great question", "I hope this helps", "Want me to".
23. **Knowledge-limit disclaimers and guesses.** "presumably" used twice to
    pad a joke is voice; "it is believed that" is not.
24. **Heading repeated in the first sentence.**
25. **Writing about the previous draft** ("this replaces the earlier version").

## What to keep (the voice)

These read as tells in a manual and as Amit in a post. See STYLE.md for the
full list.

- `TL;DR -` opener and the `---` divider after it; `Or -` subtitles.
- One rhetorical question, one fragment, one ALL-CAPS joke, one burst of
  enthusiasm per post.
- Parenthetical asides, self-deprecating remarks about the blog's posting rate,
  half-promises about future posts.
- Bold on real key terms; British-ish spellings ("organise", "colour").
- A spaced ` - ` dash, within budget.
- Emoji at the very end. Never in headings.
- A specific odd detail, a mixed feeling, a dated reference, a first-person
  choice the author can explain.

## When not to act

Leave a watched phrase alone inside a quotation, a title, a proper name, code,
or a passage discussing the phrase. Posts dated before 2025 are hand-written;
do not run this on them. Several tells together are the safeguard; one weak
tell in an otherwise human paragraph is not worth an edit.
