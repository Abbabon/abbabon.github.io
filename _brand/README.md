# MezookanGames logo

This is MezookanGames' new logo. It replaces the old red-beard + pixel-crown mark.

## What it is

A PS1-style low-poly Space-Invader head (purple, with two green pixel eyes) sitting on a salt-and-pepper grey low-poly beard. Flat-shaded facets with straight edges, one continuous near-black outline.

## Why

- **The name.** "Mezookan" comes from the Hebrew מזוקן ("bearded"), which is why the mark has a beard.
- **PS1-style games.** Flat-shaded low-poly facets and chunky pixel silhouettes are the look MezookanGames builds toward.
- **The author is not a redhead.** The old logo had a red beard. The real one is salt-and-pepper grey.
- **The blog's Dracula theme.** Purple, green and the `#282A36` background come straight from the Dracula palette used in `_config.yml`.

## Palette

| Role | Hex |
| --- | --- |
| Background (flat) | `#282A36` |
| Space plate (logo / cover bg) | `#21222C` |
| Outline | `#0E0D11` |
| Head purple (light to deep) | `#E1C2FE`, `#C796FC`, `#BA7DFD`, shaded facets darker |
| Eyes | `#50FA7B` |
| Beard grey ramp (dark to light) | `#343748`, `#5A607C`, `#9CA3BE`, `#F8F8F2` |
| Space accents (pixel art) | Dracula pink `#FF79C6`, cyan `#8BE9FD`, purple `#BD93F9`, orange `#FFB86C` |

The grey ramp and outline are exact constants in `build_final.py`; the head purples are sampled from the shipped art.

## Usage rules

- **Logo = the character on the plain starfield only** (`logo/`). This is what goes on avatars, favicons and profile pictures. Never add planets, ships, nebulae or comets to it.
- **Cover images / banners = the full scene** with all space elements (`cover/`). Square for social cards, 3:1 for banners. The banner keeps the character left-weighted so text fits on the right.
- Use `character-transparent.png` or `character-flat-282a36.png` when placing the character on your own background. Keep it on dark backgrounds; the outline is near-black.
- **Minimum size:** 32 px for the full logo (favicon-32). Below that (16 px) it is a smudge of purple on top of grey; use it only as a tab icon.
- **Clear space:** keep at least 10% of the logo's width free around the character (about the width of one head "leg"), and never crop into the outline. The character already sits inside a ~11% margin in the square logo, so for circular avatars the square can be used as is: the farthest points (ear tips, beard tip) are well inside the inscribed circle.
- Don't recolour the beard (no red or brown) and don't rotate or stretch.

## File map: `assets/img/brand/`

```
logo/
  logo-1024.png, logo-512.png, logo-256.png, logo-64.png   character on plain starfield (square)
  character-transparent.png                                 character only, transparent, tight crop
  character-flat-282a36.png                                 character only, flat #282A36
cover/
  cover-square-1024.png                                     full scene, square
  cover-banner-3x1.png                                      full scene, 1536x512 banner
favicon/
  favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180)   (root favicon.ico is the same logo)
space/
  layers/   square-*.png and banner-*.png: every element as a full-canvas transparent layer
            (stars, nebula-color, planet, ringmoon, asteroids, comet, ship-trail, ship)
  sprites/  ship, ship-trail, comet, asteroids, ringmoon: cropped, individually usable
```

Wired into the site: `avatar` and `share-img` in `_config.yml`, favicon links in `_includes/head.html`.

## Sources: `_brand/`

Underscore prefix, so Jekyll never builds it.

```
build_final.py   builds the character (beard + head) -> build/
export.py        copies deliverables into assets/img/brand/
src/             round2-B-invader-dracula.png (beard), round4-main.png (purple head)
space/           composite.py, elements.py, make_space.py, cutout.py, assets/ (layers)
build/           build outputs (character.png, final-norim*.png)
history/         one overview sheet per design round, plus the artifact before/after
```

How the character is built: round-2's beard is recoloured brown to grey, the round-4 purple head is pasted on top (scale 1.10) with a freshly drawn uniform outline, and the band where head meets beard is redrawn as flat polygons (`repaint_top`) so there are no streaks or jagged shards.

## Regenerate everything

Needs Python 3 with `numpy` and `Pillow`. From the repo root:

```bash
cd _brand
python3 build_final.py                                              # -> build/character.png (+ final-norim*.png)
cd space
python3 composite.py ../build/character.png --layers stars --out=-logo   # logo: plain starfield
python3 composite.py --out=-cover                                         # cover: full scene
cd ..
python3 export.py                                                   # -> ../assets/img/brand/
```

`composite.py --list` shows the layer names; `--layers a,b` / `--without x` pick elements. To rebuild the element layers themselves (this overwrites `space/assets/*-layer-*.png`): `cd _brand/space && python3 make_space.py && python3 elements.py`. The `favicon.ico` at the repo root is made from `logo-1024.png`:

```bash
python3 -c "from PIL import Image; Image.open('assets/img/brand/logo/logo-1024.png').convert('RGBA').save('favicon.ico', sizes=[(16,16),(32,32),(48,48)])"
```
