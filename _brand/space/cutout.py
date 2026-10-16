# usage: cutout.py in.png out.png  — flood-fill flat #282A36 bg from the corners to transparent, crop to bbox
import sys,numpy as np
from PIL import Image,ImageDraw,ImageFilter
im=Image.open(sys.argv[1]).convert('RGBA'); rgb=im.convert('RGB'); MK=(255,0,255)
for p in((0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)): ImageDraw.floodfill(rgb,p,MK,thresh=28)
m=(np.asarray(rgb)==MK).all(-1)
m=np.asarray(Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)))>0  # eat 1px fringe (outline is thick, safe)
out=np.asarray(im).copy(); out[m,3]=0; o=Image.fromarray(out); o.crop(o.getchannel('A').getbbox()).save(sys.argv[2])
