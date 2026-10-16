#!/usr/bin/env python3
"""Copy the built brand images into ../assets/img/brand/ (run after build_final.py and both composite.py calls)."""
import os, shutil
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); O = D + '/../assets/img/brand'; C = D + '/space/combined'; A = D + '/space/assets'
for d in ('logo', 'cover', 'space/layers', 'space/sprites', 'favicon'): os.makedirs(f'{O}/{d}', exist_ok=True)
logo = Image.open(f'{C}/square-logo.png').convert('RGB')           # 1024, character on plain starfield
logo.save(f'{O}/logo/logo-1024.png')
for s in (512, 256, 64): logo.resize((s, s), Image.LANCZOS).save(f'{O}/logo/logo-{s}.png')
shutil.copy(f'{D}/build/character.png', f'{O}/logo/character-transparent.png')
ch = Image.open(f'{D}/build/character.png'); flat = Image.new('RGBA', ch.size, (0x28, 0x2A, 0x36, 255)); flat.alpha_composite(ch)
flat.convert('RGB').save(f'{O}/logo/character-flat-282a36.png')
shutil.copy(f'{C}/square-cover.png', f'{O}/cover/cover-square-1024.png')
shutil.copy(f'{C}/banner-cover.png', f'{O}/cover/cover-banner-3x1.png')
for f in os.listdir(A):
    if f.endswith('.png') and '-layer-' in f and 'layer-nebula.png' not in f: shutil.copy(f'{A}/{f}', f'{O}/space/layers/{f.replace("-layer-", "-")}')
for f in os.listdir(A + '/sprites'): shutil.copy(f'{A}/sprites/{f}', f'{O}/space/sprites/{f}')
# favicons: the logo is a starfield square; 32px keeps the character readable
logo.resize((32, 32), Image.LANCZOS).save(f'{O}/favicon/favicon-32x32.png')
logo.resize((16, 16), Image.LANCZOS).save(f'{O}/favicon/favicon-16x16.png')
logo.resize((180, 180), Image.LANCZOS).save(f'{O}/favicon/apple-touch-icon.png')
print('exported to', os.path.abspath(O))
