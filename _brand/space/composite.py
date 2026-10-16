#!/usr/bin/env python3
# Build composites from chosen layers.
#   composite.py [NEW_CHARACTER.png] [--layers a,b,c] [--without x,y] [--out SUFFIX] [--list]
# Layers draw bottom->top in ORDER below; character always on top. Default = DEFAULT set.
# Passing a character PNG (flat #282A36 bg or already transparent) replaces assets/character.png (round-4 swap).
import sys,os,subprocess,argparse
from PIL import Image,ImageFilter
D=os.path.dirname(os.path.abspath(__file__)); A=D+'/assets'; C=D+'/combined'
ORDER=['nebula','nebula-color','stars','planet','ringmoon','asteroids','comet','ship-trail','ship']  # 'nebula' = old grey blobs
DEFAULT=[l for l in ORDER if l!='nebula']
ap=argparse.ArgumentParser(); ap.add_argument('char',nargs='?'); ap.add_argument('--layers'); ap.add_argument('--without')
ap.add_argument('--out',default=''); ap.add_argument('--list',action='store_true'); a=ap.parse_args()
if a.list: print('layers:',*ORDER,'\ndefault:',*DEFAULT); sys.exit()
if a.char:
    if Image.open(a.char).convert('RGBA').getpixel((0,0))[3]>0: subprocess.check_call([sys.executable,D+'/cutout.py',a.char,A+'/character.png'])
    else: Image.open(a.char).convert('RGBA').save(A+'/character.png')
want=a.layers.split(',') if a.layers else DEFAULT
if a.without: want=[l for l in want if l not in a.without.split(',')]
ch=Image.open(A+'/character.png').convert('RGBA')
def build(fmt,cx,cy,height):
    p=Image.new('RGBA',(1024,1024) if fmt=='square' else (1536,512),(0x21,0x22,0x2C,255))
    for l in ORDER:
        if l in want: p.alpha_composite(Image.open(f'{A}/{fmt}-layer-{l}.png').convert('RGBA'))
    c=ch.resize((round(ch.width*height/ch.height),height),Image.LANCZOS)
    sh=Image.new('RGBA',p.size,(0,0,0,0)); sh.paste((25,26,33,150),(round(cx-c.width/2),round(cy-c.height/2)+10),c.getchannel('A'))
    p.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14))); p.alpha_composite(c,(round(cx-c.width/2),round(cy-c.height/2))); return p
os.makedirs(C,exist_ok=True)
sq=build('square',512,530,760); sq.save(f'{C}/square{a.out}.png'); sq.resize((64,64),Image.LANCZOS).save(f'{C}/square-64{a.out}.png')  # cy>512: wide head + tapering beard, so center the visual mass, not the bbox
build('banner',420,256,440).save(f'{C}/banner{a.out}.png')  # left-weighted; right free for text
print('built with:',*want)
