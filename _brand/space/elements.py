# Extra pixel-art elements (Dracula only), each a full-canvas transparent layer per format: assets/<fmt>-layer-<name>.png
import numpy as np
from PIL import Image
H=lambda s:tuple(int(s[i:i+2],16) for i in (1,3,5))+(255,)
BG,DEEP,LINE,FG,CMT=H('#191A21'),H('#21222C'),H('#44475A'),H('#F8F8F2'),H('#6272A4')
CY,PU,PK,YE,OR,RD,GR=H('#8BE9FD'),H('#BD93F9'),H('#FF79C6'),H('#F1FA8C'),H('#FFB86C'),H('#FF5555'),H('#50FA7B')
B4=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16.0
S=8
def save(a,fmt,name): Image.fromarray(a,'RGBA').resize((a.shape[1]*S,a.shape[0]*S),Image.NEAREST).save(f'assets/{fmt}-layer-{name}.png')
def blit(a,rows,x,y,leg):
    for j,r in enumerate(rows):
        for i,ch in enumerate(r):
            if ch in leg and 0<=y+j<a.shape[0] and 0<=x+i<a.shape[1]: a[y+j,x+i]=leg[ch]
def noise(w,h,rng,sc):
    g=rng.random((h//sc+2,w//sc+2)); return np.asarray(Image.fromarray((g*255).astype('uint8')).resize((w,h),Image.BICUBIC))/255.0
# original ship: arrow-winged dart w/ cyan canopy, nose right
half=["......RR........",".....RRFF.......","..LLFFFFFFFF....",".OLFFFFFFFFFFF.."]
mid= "OOLFFFFFCCCCFFFF"
SHIP=half+[mid]+[r.replace('F','M') if False else r for r in half[::-1]]
SHIP_LEG=dict(R=RD,F=FG,L=CMT,O=OR,C=CY)
def ship(w,h,x,y):
    a=np.zeros((h,w,4),np.uint8); blit(a,SHIP,x,y,SHIP_LEG)
    for j in range(5,9):   # lower half shaded for volume
        for i in range(16):
            if a[y+j,x+i].tolist()==list(FG): a[y+j,x+i]=PU
    return a
def trail(w,h,x,y,n=14):  # engine flame to the left of ship nose-row y+4
    a=np.zeros((h,w,4),np.uint8); cy=y+4
    for k in range(n):
        spread=1 if k<n*.35 else (0 if k<n*.7 else 0)
        col=YE if k<3 else OR if k<6 else PK if k<10 else PU
        for dy in range(-spread,spread+1):
            if (k+dy)%2==0 or k<6: 
                if 0<=x-1-k<w: a[cy+dy,x-1-k]=col
    return a
def comet(w,h,hx,hy,L=22,dx=-1,dy=-1):
    a=np.zeros((h,w,4),np.uint8)
    for k in range(L):
        t=k/L; col=CY if t<.25 else PU if t<.55 else CMT if t<.8 else LINE
        for o in((0,0),(1,0)) if t<.5 else((0,0),):
            x,y=hx-dx*0+k*dx*-1*-1+o[0],hy+k*dy*-1*-1+o[1]
        # tail goes opposite to travel: travel is (-dx,-dy) reversed; simple diagonal
        x,y=hx+k*dx,hy+k*dy
        if (k+ (x%2))%2==0 or t<.5:
            if 0<=x<w and 0<=y<h: a[y,x]=col
            if t<.45 and 0<=x+1<w: a[y,x+1]=col
    blit(a,["CFF","FFF","CFF"],hx-1,hy-1,dict(C=CY,F=FG))
    return a
def asteroids(w,h,spots):
    a=np.zeros((h,w,4),np.uint8)
    A=[[".LLL.","LCCLL","LCCCL",".LLL."],["LLL.","LCCL","LCLL",".LL."],[".LL","LCL","LLL"]]
    for k,(x,y) in enumerate(spots):
        s=A[k%3]; blit(a,s,x,y,dict(L=LINE,C=CMT))
        a[y+1,x+1]=PU if k%2 else CMT
    return a
def ringmoon(w,h,cx,cy,r=5):
    a=np.zeros((h,w,4),np.uint8); yy,xx=np.mgrid[0:h,0:w]
    for back in(True,False):
        # ring: tilted ellipse, back half drawn first
        ex,ey=(xx-cx)/(r*2.0),(yy-cy+(xx-cx)*.35)/(r*.55); d=ex**2+ey**2
        ring=(d>.55)&(d<1.0)
        if back: a[ring&(yy<cy+(xx-cx)*-.35)]=PK
        else:
            dd=np.sqrt((xx-cx)**2+(yy-cy)**2); m=dd<=r
            t=np.clip(.5+((xx-cx)+(yy-cy))/(2*r)*.5,0,1)+(B4[yy%4,xx%4]-.5)*.25
            pal=[CY,PU,CMT,LINE]; idx=np.clip((t*4).astype(int),0,3)
            for i,c in enumerate(pal): a[m&(idx==i)]=c
            a[ring&(yy>=cy+(xx-cx)*-.35)]=PK
    return a
def nebula(w,h,seed,pts,width,phase=0):
    # structured gas: a curved ridge (bezier-ish through pts) with filaments, tiered by density -> dithered Dracula tones
    rng=np.random.default_rng(seed); yy,xx=np.mgrid[0:h,0:w].astype(float)
    P=np.array(pts,float); t=np.linspace(0,1,300)
    curve=((1-t)**2)[:,None]*P[0]+(2*(1-t)*t)[:,None]*P[1]+(t**2)[:,None]*P[2]
    d=np.full((h,w),1e9); along=np.zeros((h,w)); side=np.zeros((h,w))
    for i,(cx,cy) in enumerate(curve):
        dd=np.hypot(xx-cx,yy-cy); m=dd<d; d[m]=dd[m]; along[m]=t[i]
        nx,ny=(P[2]-P[0])/np.linalg.norm(P[2]-P[0]); side[m]=((xx-cx)*-ny+(yy-cy)*nx)[m]
    wid=width*(.45+.9*np.sin(np.pi*along)**.8)
    fil=noise(w,h,rng,5)*.6+noise(w,h,rng,2)*.4
    dens=np.exp(-(d/wid)**2)*(.55+.9*fil)-.08
    dens+=0.0
    out=np.zeros((h,w,4),np.uint8); D=B4[np.mgrid[0:h,0:w][0]%4,np.mgrid[0:h,0:w][1]%4]-.5
    v=dens+D*.16
    out[v>.12]=LINE; out[v>.30]=CMT; out[v>.48]=PU
    core=v>.66
    # colour by side of the ridge: pink core/one edge, cyan highlight on the other
    out[core&(side>=0)]=PK; out[core&(side<0)]=PU
    cyan=(v>.40)&(v<.52)&(side<-width*.25)&(fil>.55)
    out[cyan]=CY
    pk=(v>.48)&(v<.58)&(side>width*.25)&(fil>.5); out[pk]=PK
    # dust lanes: dark gaps cut through the gas for structure
    pass  # dust lanes tried, looked like scribbles
    return out
def make(fmt,w,h,L):
    save(nebula(w,h,L['seed'],L['neb'],L['nw']),fmt,'nebula-color')
    save(ship(w,h,*L['ship']),fmt,'ship'); save(trail(w,h,*L['ship']),fmt,'ship-trail')
    save(comet(w,h,*L['comet']),fmt,'comet'); save(asteroids(w,h,L['ast']),fmt,'asteroids')
    save(ringmoon(w,h,*L['ring']),fmt,'ringmoon')
make('square',128,128,dict(seed=3,neb=[(0,118),(40,70),(128,14)],nw=11,ship=(100,8),comet=(24,30,22,-1,-1),ast=[(116,68),(118,80),(5,50)],ring=(112,46)))
make('banner',192,64,dict(seed=5,neb=[(30,62),(75,20),(150,40)],nw=9,ship=(128,40),comet=(122,20,18,-1,-1),ast=[(100,50),(176,52),(186,10)],ring=(142,14)))
