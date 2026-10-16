# Procedural pixel-art space, Dracula colours only. Writes separate transparent layers + plate.
import numpy as np, random, sys
from PIL import Image
H=lambda s:tuple(int(s[i:i+2],16) for i in (1,3,5))+(255,)
BG,DEEP=H('#191A21'),H('#21222C'); LINE,FG,CMT=H('#44475A'),H('#F8F8F2'),H('#6272A4')
CY,PU,PK,YE,OR=H('#8BE9FD'),H('#BD93F9'),H('#FF79C6'),H('#F1FA8C'),H('#FFB86C')
B4=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16.0  # Bayer dither
SCALE=8
def up(a): return Image.fromarray(a,'RGBA').resize((a.shape[1]*SCALE,a.shape[0]*SCALE),Image.NEAREST)
def noise(w,h,rng,sc):
    g=rng.random((h//sc+2,w//sc+2)); im=Image.fromarray((g*255).astype('uint8')).resize((w,h),Image.BICUBIC)
    return np.asarray(im)/255.0
def build(name,w,h,seed,planet,nebs):
    rng=np.random.default_rng(seed); random.seed(seed)
    yy,xx=np.mgrid[0:h,0:w]
    # nebula: dithered bands in 2 dark-ish tones (comment/line + purple tint), very sparse
    neb=np.zeros((h,w,4),np.uint8)
    for (cx,cy,rx,ry,col,thr) in nebs:
        d=1-np.sqrt(((xx-cx)/rx)**2+((yy-cy)/ry)**2)+(noise(w,h,rng,6)-.5)*.7
        m=d>(thr+(B4[yy%4,xx%4]-.5)*.25)
        neb[m]=col
    # stars
    st=np.zeros((h,w,4),np.uint8)
    for _ in range(w*h//70):
        x,y=rng.integers(0,w),rng.integers(0,h); st[y,x]=random.choice([CMT,CMT,LINE,FG,CY,PU])
    for _ in range(w*h//1100):
        x,y=int(rng.integers(2,w-2)),int(rng.integers(2,h-2)); c=random.choice([FG,YE,CY,PK])
        for dx,dy in((0,0),(1,0),(-1,0),(0,1),(0,-1)): st[y+dy,x+dx]=c if (dx,dy)==(0,0) else CMT
    # planet: dithered shaded sphere, orange/pink/purple
    pl=np.zeros((h,w,4),np.uint8)
    if planet:
        cx,cy,r=planet; d=np.sqrt((xx-cx)**2+(yy-cy)**2); m=d<=r
        lit=((xx-cx)*-.6+(yy-cy)*-.6)/r  # light from top-left, -1..1 inverted
        t=np.clip(0.5-lit*.5,0,1)+(B4[yy%4,xx%4]-.5)*.22+ (np.sin((yy-cy)/r*9+noise(w,h,rng,5)*3)*.04)
        pal=[OR,PK,PU,CMT,LINE]  # light->dark
        idx=np.clip((t*len(pal)).astype(int),0,len(pal)-1)
        for i,c in enumerate(pal): pl[m&(idx==i)]=c
        ring=(d>=r)&(d<r+1.0); pl[ring]=BG
    layers=dict(stars=up(st),nebula=up(neb),planet=up(pl))
    plate=Image.new('RGBA',(w*SCALE,h*SCALE),DEEP)
    for k in('nebula','planet','stars'): plate.alpha_composite(layers[k])
    # draw order: nebula, stars, planet (planet occludes stars)
    plate=Image.new('RGBA',(w*SCALE,h*SCALE),DEEP)
    for k in('nebula','stars','planet'): plate.alpha_composite(layers[k])
    plate.save(f'assets/bg-{name}.png')
    for k,v in layers.items(): v.save(f'assets/{name}-layer-{k}.png')
build('square',128,128,7,(100,104,13),[(30,100,40,22,LINE,.4),(110,20,36,20,LINE,.45)])
build('banner',192,64,11,(165,22,14),[(60,50,60,18,LINE,.4),(125,12,45,14,LINE,.45)])
