"""Full-body characters with changing expressions: each expression bust's head (from the ChatGPT sheet) is laid over
the full-body figure, aligned by hair top and hair centre, scaled to the hair width, and masked to the head only.
usage: python3 -I src/tools/compose_full.py <piece dir> [cut offset]"""
import sys; from PIL import Image; import numpy as np
root=sys.argv[1]; OFF=int(sys.argv[2]) if len(sys.argv)>2 else -10
def hairspan(m, top, h):
    best=(0,0,0)
    for y in range(top, top+h):
        xs=np.where(m[y])[0]
        if len(xs) and xs.max()-xs.min()>best[0]: best=(xs.max()-xs.min(), xs.min(), xs.max())
    return best
def compose(body, busts, out, neckRow, headRows):
    B=Image.open(f'{root}/assets/{body}.png'); bm=np.asarray(B)[...,3]>128
    btop=np.where(bm.any(1))[0][0]; bw,bx0,bx1=hairspan(bm,btop,headRows); bcx=(bx0+bx1)/2
    for mood,name in busts.items():
        H=Image.open(f'{root}/assets/{name}.png'); hm=np.asarray(H)[...,3]>128; htop=np.where(hm.any(1))[0][0]
        hw,hx0,hx1=hairspan(hm,htop,int(H.height*0.62)); hcx=(hx0+hx1)/2; sc=bw/hw*1.04
        Hs=H.resize((round(H.width*sc),round(H.height*sc)), Image.LANCZOS)
        cut=(neckRow-btop)+OFF; feather=8
        al=np.asarray(Hs)[...,3].astype(float); yy,xx=np.mgrid[0:al.shape[0],0:al.shape[1]]
        al*=np.clip((htop*sc+cut+feather-yy)/feather,0,1)
        cx,cy=hcx*sc, htop*sc+cut*0.46; rx,ry=hw*sc*0.55, cut*0.62
        d=np.sqrt(((xx-cx)/rx)**2+((yy-cy)/ry)**2); al*=np.clip((1.08-d)/0.08,0,1)
        Hs.putalpha(Image.fromarray(al.astype(np.uint8)))
        canvas=B.copy(); ox=round(bcx-hcx*sc); oy=round(btop-htop*sc)
        canvas.alpha_composite(Hs,(max(ox,0),max(oy,0)),(max(-ox,0),max(-oy,0)))
        canvas.save(f'{root}/assets/{out}{mood}.png')
compose('mayaBodyC', {'smile':'mayaA','worried':'mayaB','unsure':'mayaC','down':'mayaD','content':'mayaE','happy':'mayaF'}, 'mayaFull_', 130, 120)
compose('docBody', {'focus':'docA','smile':'docB','happy':'docC'}, 'docFull_', 138, 125)
