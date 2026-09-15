#!/usr/bin/env python3
"""Mechanical AI-tell scanner for Master the Disaster posts.

Usage: python3 scan.py <post.md> [--dash-budget N]

Reports, never edits. Skips YAML front matter, fenced/indented code,
{% highlight %} blocks, HTML blocks and headings. The judgment calls
(is this triad deliberate? is that closer earning its line?) stay with
the reader; this script only lists candidates.
"""
import re
import sys

DASH_BUDGET = 5  # measured on the hand-written posts (2020-2024): ~5 per post

STRONG = {
    "not-X-but-Y": re.compile(
        r"\b(not|isn't|wasn't|aren't|weren't|isn’t|wasn’t)\b[^.;:!?]{0,60}\b(but|it's|it’s)\b"
        r"|\bnot (just|only|merely)\b",
        re.I),
    "split not-X. Y. contrast": re.compile(
        r"(?:^|[.!?]\s+)(Not a|Not the|Not because|It's not|It wasn't|This (?:one )?wasn't|It isn't)\b[^.!?]{0,60}[.!?]\s+"
        r"(?:It|That|This|Very|Just|Only|It's|It was)\b[^.!?]{0,60}[.!?]", re.I),
    "staged run-up": re.compile(
        r"\b(here's the thing|here is the thing|the thing is|let's dive|let's be honest|"
        r"real talk|without further ado|here's what you need|let's break|let's unpack|"
        r"here's the kicker|here's where it gets|what most people miss|what nobody tells you|"
        r"nobody tells you)\b", re.I),
    "sincerity/opener": re.compile(
        r"(^|[.!?]\s+)(honestly|to be honest|truth be told|look|actually)[,.]", re.I),
    "aphorism": re.compile(
        r"\b(the real question|at its core|what really matters|the heart of the matter|"
        r"the deeper issue|is the language of|is the currency of|is the architecture of|"
        r"becomes a trap|is what you lost|is what you keep)\b", re.I),
    "arguing with no one": re.compile(
        r"\b(i'm not saying|i don't say this|to be clear|don't get me wrong|this is not to say|"
        r"some might say|you might think|one might be tempted|it would be easy to)\b", re.I),
    "chat residue": re.compile(
        r"\b(great question|i hope this helps|let me know if|want me to|would you like|certainly!|of course!)",
        re.I),
    "staged Q&A pair": re.compile(
        r"\?\s+(not really|absolutely|yes|no|nope|yep|of course|definitely)[.!]", re.I),
    "closer echo": re.compile(
        r"\b(read that again|let that sink in|that is the real win|that's the whole (point|payoff|game)|"
        r"if you take one thing|take that\.|and that's (it|that)\.)", re.I),
}

WATCH_WORDS = re.compile(
    r"\b(additionally|align with|bolster(ed|s)?|crucial|deep dive|delve|emphasi[sz]ing|enduring|"
    r"enhance[sd]?|foster(ing|s)?|garner(ed|s)?|highlight(s|ed|ing)?|interplay|intricate|intricacies|"
    r"landscape|meticulous(ly)?|pivotal|quietly|robust|showcas(e|es|ing)|tapestry|testament|"
    r"underscore[sd]?|underscoring|vibrant|seamless|game-changing|revolutionary|transformative|"
    r"holistic|comprehensive|powerful|elevate|unlock|paradigm|synergy|ecosystem|leverage|"
    r"utili[sz]e|prior to|in order to|it is worth noting|it's worth noting|importantly|notably|"
    r"interestingly|that said|serves as|stands as|functions as|boasts|nestled|stunning|"
    r"breathtaking|groundbreaking|for once|rather than)\b", re.I)

RIDERS = re.compile(
    r",\s*(highlighting|underscoring|emphasi[sz]ing|ensuring|reflecting|symboli[sz]ing|"
    r"contributing to|cultivating|fostering|encompassing|showcasing)\b", re.I)

SPACED_DASH = re.compile(r"\s-\s|—|–|\s--\s")
BOLD_LABEL_BULLET = re.compile(r"^\s*[-*]\s+\*\*[^*]+\*\*[:.]?\s")
FRAGMENT_ROW = re.compile(r"(?:^|[.!?]\s+)(?:[A-Z][^.!?]{0,25}\.\s+){3,}")


def strip_blocks(lines):
    """Yield (lineno, text) for prose lines only."""
    in_front = False
    in_fence = False
    in_highlight = False
    in_html = False
    for i, line in enumerate(lines, 1):
        s = line.strip()
        if i == 1 and s == "---":
            in_front = True
            continue
        if in_front:
            if s == "---":
                in_front = False
            continue
        if s.startswith("```") or s.startswith("~~~"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if "{% highlight" in s:
            in_highlight = True
            continue
        if "{% endhighlight" in s:
            in_highlight = False
            continue
        if in_highlight:
            continue
        if re.match(r"^<(div|figure|video|iframe|p|table|script)\b", s):
            in_html = True
        if in_html:
            if re.match(r"^</(div|figure|table|script|p)>", s) or s.endswith("</figure>") or s.endswith("</div>") or s.endswith("</p>"):
                # captions inside figures are prose, but keep it simple: skip whole block
                in_html = bool(re.match(r"^<(div)\b", s)) and not s.startswith("</div>")
            continue
        if line.startswith("    ") or line.startswith("\t"):
            continue
        if s.startswith("#"):
            continue
        yield i, line.rstrip("\n")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    path = sys.argv[1]
    budget = DASH_BUDGET
    if "--dash-budget" in sys.argv:
        budget = int(sys.argv[sys.argv.index("--dash-budget") + 1])

    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    prose = list(strip_blocks(lines))
    findings = []
    dash_total = 0
    one_liners = []
    prev_opener = None
    same_opener_run = 0

    for ln, text in prose:
        # skip inline code spans and link targets when matching words
        clean = re.sub(r"`[^`]*`", "", text)
        clean = re.sub(r"\]\([^)]*\)", "]", clean)
        if not clean.strip():
            prev_opener = None
            same_opener_run = 0
            continue

        n = len(SPACED_DASH.findall(clean))
        dash_total += n
        if "—" in clean or "–" in clean:
            findings.append((ln, "em/en dash (author uses ' - ')", clean.strip()[:90]))

        for name, rx in STRONG.items():
            for m in rx.finditer(clean):
                findings.append((ln, "STRONG " + name, m.group(0)))
        for m in WATCH_WORDS.finditer(clean):
            findings.append((ln, "watch word", m.group(0)))
        for m in RIDERS.finditer(clean):
            findings.append((ln, "-ing rider", m.group(0)))
        if BOLD_LABEL_BULLET.match(text):
            findings.append((ln, "bold-label bullet (ok if list is a real inventory)", clean.strip()[:60]))
        if FRAGMENT_ROW.search(clean):
            findings.append((ln, "row of short fragments", FRAGMENT_ROW.search(clean).group(0)[:90]))

        # one-line paragraphs (a sentence alone on a line, short, not a list item)
        stripped = clean.strip()
        if (not stripped.startswith(("-", "*", ">", "!", "<", "|", "TL;DR"))
                and len(stripped) < 80 and stripped.count(".") + stripped.count("!") + stripped.count("?") <= 2
                and not stripped.startswith("[") and not re.match(r"^\d+[.)]", stripped)):
            one_liners.append((ln, stripped))

        # repeated sentence openers within a line
        sents = re.split(r"(?<=[.!?])\s+", stripped)
        openers = [re.match(r"[A-Za-z']+", s.lstrip("*_(\"")) for s in sents]
        openers = [o.group(0).lower() for o in openers if o]
        run = 1
        for a, b in zip(openers, openers[1:]):
            run = run + 1 if a == b else 1
            if run == 3:
                findings.append((ln, "3+ sentences opening with the same word", a))

    findings.sort(key=lambda t: (0 if t[1].startswith("STRONG") else 1, t[0]))
    print(f"== {path}")
    print(f"prose lines: {len([1 for _, t in prose if t.strip()])}")
    print(f"spaced/em dashes: {dash_total}  (budget ~{budget})"
          + ("  <-- over budget" if dash_total > budget else ""))
    print()
    if findings:
        print("findings (STRONG first):")
        for ln, kind, snip in findings:
            print(f"  L{ln:<4} {kind:<48} {snip}")
    else:
        print("no pattern hits")
    if one_liners:
        print()
        print("one-line paragraphs (check each earns its line; a closer that restates is a tell):")
        for ln, s in one_liners:
            print(f"  L{ln:<4} {s}")


if __name__ == "__main__":
    main()
