#!/usr/bin/env python3
"""Procedural final logo: round-2 beard (recoloured grey, sliver removed) + round-4 purple invader head.
Run:  python3 build_final.py                       -> build/final-norim.png + build/final-norim-transparent.png (the shipped character)
      python3 build_final.py --rim FF79C6 --strength 0.6 --name custom   -> one extra variant
Tweakables: constants below + CLI. All coordinates are in the 1254px source space; the final canvas is 1254 with MARGIN.
"""
import os, sys, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))
R2 = D + '/src/round2-B-invader-dracula.png'; R4 = D + '/src/round4-main.png'
OUT = D + '/build'
BG = (0x28, 0x2A, 0x36); OUTLINE = np.array([0x0E, 0x0D, 0x11], float)
HEAD_SCALE = 1.10      # round-4 head scale (1.10 matches round-2's leg/notch geometry)
HEAD_BOTTOM = 640      # y of head's feet in round-2 space
MARGIN = 0.11          # empty margin around the character
# grey ramp (position 0..1 -> colour), cool-tinted Dracula tones
RAMP = [(0.0, (0x34, 0x37, 0x48)), (0.30, (0x5A, 0x60, 0x7C)), (0.62, (0x9C, 0xA3, 0xBE)), (1.0, (0xF8, 0xF8, 0xF2))]
GRADE_LO, GRADE_HI, GAMMA = 18, 82, 0.9   # beard brown luminance window stretched to the ramp
RIM_SIGMA = 24; RIM_TOP_FADE = (640, 760)  # glow width (px) and y range over which it fades in below the head

def mask_fg(im):
    rgb = im.convert('RGB').copy()
    for q in ((0, 0), (im.width-1, 0), (0, im.height-1), (im.width-1, im.height-1)):
        ImageDraw.floodfill(rgb, q, (255, 0, 255), thresh=28)
    return ~(np.asarray(rgb) == (255, 0, 255)).all(-1)

def mf(m, size, mx=True):
    f = ImageFilter.MaxFilter if mx else ImageFilter.MinFilter
    return np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(f(size))) > 0

def close_fill(m, k=9):  # close small holes
    return mf(mf(m, k), k, False)

def nn_fill(img, known):
    """propagate nearest known pixel colour into unknown pixels (8-neighbour sweeps)"""
    img = img.copy(); known = known.copy()
    for _ in range(400):
        if known.all(): break
        new = known.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == dx == 0: continue
                sk = np.roll(known, (dy, dx), (0, 1)); si = np.roll(img, (dy, dx), (0, 1))
                t = ~new & sk; img[t] = si[t]; new |= t
        if (new == known).all(): break
        known = new
    return img, known

def alpha_from_bg(a, fg):
    d = np.sqrt(((a - np.array(BG, float)) ** 2).sum(-1))
    soft = np.clip((d - 15) / 35, 0, 1) * mf(fg, 3)
    return np.where(mf(fg, 7, False), 1.0, soft)   # opaque inside, soft only on the 3px rim

def ramp(t):
    xs = [p for p, _ in RAMP]; out = np.zeros(t.shape + (3,))
    for c in range(3): out[..., c] = np.interp(t, xs, [col[c] for _, col in RAMP])
    return out


# ---- clean repaint of the band between head and beard -------------------------------------------
# The generic pipeline (45px yellow dilation + nearest-fill, 13px sliver dilation) leaves staircase edges,
# streaks and nested-diamond posterisation exactly where the new head exposes the old gold-head footprint.
# So that zone is redrawn as flat polygons with straight edges. Vertices are round-2 facet corners (1254px
# source space, right side = mirror about x=627); colours are sampled from round-2 and run through the same
# grey ramp, so the tones match the untouched beard around it.
MX = 1254
def _mir(p): return (MX - p[0], p[1])

def _col(a, x, y, r=3):
    lum = a[y-r:y+r+1, x-r:x+r+1].mean()
    t = np.clip((lum - GRADE_LO) / (GRADE_HI - GRADE_LO), 0, 1) ** GAMMA
    return ramp(np.array([t]))[0]

def _paint(rgb, alpha, poly, col, ss=4):
    m = Image.new('L', (rgb.shape[1] * ss, rgb.shape[0] * ss), 0)
    ImageDraw.Draw(m).polygon([(x * ss, y * ss) for x, y in poly], fill=255)
    c = np.asarray(m.resize((rgb.shape[1], rgb.shape[0]), Image.BOX), float)[..., None] / 255
    rgb[:] = rgb * (1 - c) + np.asarray(col, float) * c
    alpha[:] = np.maximum(alpha, c[..., 0])

def repaint_top(rgb, alpha, a):
    rgb, alpha = rgb.copy(), alpha.copy()
    Lo, Ltop, X = (272, 727), (360, 608), (338, 675)      # left shoulder facet (on the beard's outer edge)
    Ap, F1t, F1b = (457, 675), (386, 615), (382, 695)      # A = outer ridge corner, F1 = pale facet next to it
    E, C, P = (524, 693), (627, 657), (627, 596)           # ridge: lower-left corner, centre vertex, peak
    # silhouette-bound area to repaint (left outer edge extended up under the head, mirrored on the right)
    area = [(399, 560)] + [Lo, X, F1b, Ap, E, C] + [_mir(p) for p in (E, Ap, F1b, X, Lo)] + [(MX - 399, 560)]
    _paint(rgb, alpha, area, ramp(np.array([0.10]))[0])    # dark backdrop facet under the head
    for m in (lambda p: p, _mir):                          # left side, then its mirror
        for poly in ([Lo, Ltop, X], [F1t, Ap, F1b], [Ap, P, E], [P, C, E]):
            poly = [m(p) for p in poly]
            cx, cy = (sum(v) // 3 for v in zip(*poly))     # sample round-2 at the facet centroid
            _paint(rgb, alpha, poly, _col(a, cx, cy))
    # centre dark zone + the "smile" lens (round-2: L545,735  T627,718  R710,735  B627,760), no bright sliver
    Ls, Ts, Rs, Bs = (545, 735), (627, 718), (710, 735), (627, 760)
    cx, cy = 627, 739
    ex = lambda p, k=1.12: (round(cx + (p[0] - cx) * k), round(cy + (p[1] - cy) * k))
    Ls, Ts, Rs, Bs = map(ex, (Ls, Ts, Rs, Bs))
    D2 = _col(a, 627, 690)
    _paint(rgb, alpha, [E, C, _mir(E), Rs, Bs, Ls], D2)
    M = (cx, Ls[1])
    _paint(rgb, alpha, [Ls, M, Bs], _col(a, 585, 772)); _paint(rgb, alpha, [M, Rs, Bs], _col(a, 670, 772))
    return rgb, alpha

def build_beard():
    a = np.asarray(Image.open(R2).convert('RGB')).astype(float); H, W = a.shape[:2]
    fg = mask_fg(Image.open(R2)); yy, xx = np.mgrid[:H, :W]
    R, G, B = a[..., 0], a[..., 1], a[..., 2]; lum = a.mean(-1)
    yellow = fg & (R - B > 55) & (yy < 660)
    ydil = mf(yellow, 45)
    # beard silhouette x-extent just under the head feet; used to extend the beard upward under the head
    row = fg & ~ydil; xs = np.where(row[668])[0]; xl, xr = xs.min(), xs.max()
    known = row & (yy >= 585) & (((xx >= xl) & (xx <= xr)) | (yy >= 668))
    # white smile sliver -> fill from surrounding facets
    sl = (a.min(-1) > 68) & known & (yy > 690) & (yy < 800) & (xx > 480) & (xx < 800)
    sl = mf(sl, 5); known &= ~sl
    # sliver is flat-ish facet area: fill, then smooth the filled zone a little so it reads as facet tone
    fill_zone = ((yy >= 500) & (yy < 668) & (xx >= xl) & (xx <= xr) & ~known) | sl
    base = a.copy(); base[~known] = 0
    filled, _ = nn_fill(base, known)  # propagate into everything unknown
    a2 = np.where(known[..., None], a, filled)
    beard_sil = known | fill_zone
    # outline weight: dark pixels = outline (kept), others recoloured
    w = np.clip(a2.mean(-1) - 6, 0, 6) / 6          # 0 = outline, 1 = facet
    t = np.clip((a2.mean(-1) - GRADE_LO) / (GRADE_HI - GRADE_LO), 0, 1) ** GAMMA
    grey = ramp(t)
    rgb = grey * w[..., None] + OUTLINE * (1 - w[..., None])
    alpha = np.where(beard_sil, 1.0, 0.0)
    edge = alpha_from_bg(a, fg)
    # soft edge only on the real outer silhouette
    alpha = np.where(known & (yy >= 668), edge, alpha)
    rgb[alpha < 0.999] = OUTLINE
    rgb, alpha = repaint_top(rgb, alpha, a)
    # interior = recoloured facets only (drives the rim glow)
    interior = (w > 0.5) & beard_sil & (alpha > 0.99)
    return rgb, alpha, interior

def disk_dilate(m, r):
    """binary dilation with a true disk (FFT convolution; no scipy needed), float 0..1 result"""
    n = int(np.ceil(r)); yy, xx = np.mgrid[-n:n+1, -n:n+1]; k = (yy**2 + xx**2 <= r * r).astype(float)
    H, W = m.shape; sh = (H + 2*n, W + 2*n)
    f = np.fft.irfft2(np.fft.rfft2(m.astype(float), sh) * np.fft.rfft2(k, sh), sh)
    return np.clip(f[n:n+H, n:n+W], 0, 1)

OUTLINE_PX = 17.5   # round-4 outline thickness measured under the legs / notch walls (17-18px)

def build_head():
    """purple body from round-4, plus a freshly drawn uniform black outline ring.
    (round-4's own outline also contains leftovers of the beard it was drawn over -- grey rectangles and pale
    diagonal shards -- so the ring is rebuilt from the purple mask instead of being masked out of the image.)"""
    im = Image.open(R4).convert('RGB'); a = np.asarray(im).astype(float)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    purple = ((R - G > 25) & (B > R)) | ((G > 200) & (R < 120)) | ((R - G > 8) & (B - G > 18))   # last term: the very dark purple facets
    purple = close_fill(purple, 15)
    body = purple
    # square dilation keeps the outline's mitred corners; the disk bound stops it getting thicker on diagonals
    ring = mf(body, 2 * round(OUTLINE_PX) + 1) & (disk_dilate(body, OUTLINE_PX * 1.25) > 0.5)
    soft = np.asarray(Image.fromarray((ring * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))) / 255.0
    alpha = np.where(mf(ring, 3, False), 1.0, soft)
    keep = mf(body, 3, False)                       # eroded body: untouched round-4 pixels; the 1-2px edge is OUTLINE-blended
    rgb = np.where(keep[..., None], a, OUTLINE)
    edge = mf(body, 3) & ~keep
    rgb[edge] = np.where((purple[..., None] & edge[..., None])[edge], a[edge], OUTLINE)
    return rgb, alpha

def place_head(rgb, alpha):
    ys, xs = np.where(alpha > 0.5); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype('uint8'), 'RGBA').crop((x0, y0, x1 + 1, y1 + 1))
    # feet bottom of the purple body = bottom of shape's bbox minus the outline thickness
    s = HEAD_SCALE; img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', (1254, 1254), (0, 0, 0, 0))
    px = round(626.5 - img.width / 2); py = round(HEAD_BOTTOM + 14 - img.height)  # +14 ~ outline below feet
    canvas.alpha_composite(img, (px, py)); return canvas

def rim_layer(interior, alpha_total, color, strength):
    """soft coloured glow just inside the outline of the beard's outer edge (screen blend)"""
    inter = Image.fromarray((interior * 255).astype('uint8'))
    outside = 255 - np.asarray(inter)
    g = np.asarray(Image.fromarray(outside).filter(ImageFilter.GaussianBlur(RIM_SIGMA))) / 255.0
    g = np.clip(g * 2 - 0.1, 0, 1) ** 1.3 * interior
    yy = np.mgrid[:g.shape[0], :g.shape[1]][0]
    fade = np.clip((yy - RIM_TOP_FADE[0]) / (RIM_TOP_FADE[1] - RIM_TOP_FADE[0]), 0, 1) * 0.65 + 0.35
    return g * fade * strength

def assemble(beard, head, rim, color):
    rgb, alpha, _ = beard
    c = np.array(color, float) / 255
    base = rgb / 255
    out = 1 - (1 - base) * (1 - c * rim[..., None])
    layer = Image.fromarray(np.dstack([np.clip(out * 255, 0, 255), alpha * 255]).astype('uint8'), 'RGBA')
    can = Image.new('RGBA', (1254, 1254), (0, 0, 0, 0)); can.alpha_composite(layer); can.alpha_composite(head)
    return can

def fit(can):
    bb = can.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); c = can.crop(bb)
    box = 1254 * (1 - 2 * MARGIN); s = min(box / c.width, box / c.height)
    c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
    out = Image.new('RGBA', (1254, 1254), (0, 0, 0, 0)); out.alpha_composite(c, ((1254 - c.width) // 2, (1254 - c.height) // 2)); return out

def save(can, name):
    os.makedirs(OUT, exist_ok=True); can.save(f'{OUT}/{name}-transparent.png')
    flat = Image.new('RGBA', can.size, BG + (255,)); flat.alpha_composite(can); flat.convert('RGB').save(f'{OUT}/{name}.png')

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--rim'); ap.add_argument('--strength', type=float, default=0.6); ap.add_argument('--name', default='custom')
    a = ap.parse_args()
    beard = build_beard(); head = place_head(*build_head()); zero = np.zeros(beard[1].shape)
    if a.rim:
        save(fit(assemble(beard, head, rim_layer(beard[2], beard[1], hexc(a.rim), a.strength), hexc(a.rim))), a.name); sys.exit()
    save(fit(assemble(beard, head, zero, (0, 0, 0))), 'final-norim')
    t = Image.open(f'{OUT}/final-norim-transparent.png'); t.crop(t.getchannel('A').getbbox()).save(f'{OUT}/character.png')  # tight crop, what composite.py takes
    print('done')
