"""Full-body characters with changing expressions: each expression bust's head (ChatGPT sheet) is laid over the
full-body figure. Scale: hair width. Position: the NECK — the bust's neck (narrowest band of skin under the chin)
lands on the body's neck, so turned or tilted faces still sit on the shoulders. Only the head is kept (ellipse mask,
feathered just below the neck).   usage: python3 -I src/tools/compose_full.py <piece dir>"""
import sys; from PIL import Image; import numpy as np
root = sys.argv[1]
def skin(a): r, g, b = a[..., 0], a[..., 1], a[..., 2]; return (r > 190) & (g > 110) & (g < 185) & (b > 60) & (b < 150) & (r - b > 70)
def hairspan(m, top, h):
    best = (0, 0, 0)
    for y in range(top, top + h):
        xs = np.where(m[y])[0]
        if len(xs) and xs.max() - xs.min() > best[0]: best = (xs.max() - xs.min(), xs.min(), xs.max())
    return best
def neck(a, y0, y1):   # the narrowest band of skin between rows y0..y1 -> (row, centre x)
    sk = skin(a) & (a[..., 3] > 128); best = None
    for y in range(y0, y1):
        xs = np.where(sk[y])[0]
        if len(xs) >= 8 and (best is None or len(xs) < best[0]): best = (len(xs), y, xs.mean())
    return best[1], best[2]
def compose(body, bneck, busts, out, win):
    B = Image.open(f'{root}/assets/{body}.png'); ba = np.asarray(B).astype(int); bm = ba[..., 3] > 128
    btop = np.where(bm.any(1))[0][0]; bw, _, _ = hairspan(bm, btop, 120); by, bx = neck(ba, *bneck)
    for mood, name in busts.items():
        H = Image.open(f'{root}/assets/{name}.png'); ha = np.asarray(H).astype(int); hm = ha[..., 3] > 128
        htop = np.where(hm.any(1))[0][0]; hw, hx0, hx1 = hairspan(hm, htop, int(H.height * 0.62))
        ny, nx = neck(ha, int(H.height * win[0]), int(H.height * win[1]))
        sc = bw / hw * 1.04; Hs = H.resize((round(H.width * sc), round(H.height * sc)), Image.LANCZOS)
        al = np.asarray(Hs)[..., 3].astype(float); yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]
        cut = ny * sc + 6; al *= np.clip((cut + 8 - yy) / 8, 0, 1)                      # keep down to just under the neck
        cx, cy = (hx0 + hx1) / 2 * sc, (htop * sc + cut) / 2; rx, ry = hw * sc * 0.56, (cut - htop * sc) * 0.62
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2); al *= np.clip((1.08 - d) / 0.08, 0, 1)
        Hs.putalpha(Image.fromarray(al.astype(np.uint8)))
        ox, oy = round(bx - nx * sc), round(by - ny * sc)
        # the body's own head goes first (everything above its neck, faded over 6px), so only the new head shows
        body = np.asarray(B).copy(); fade = np.clip((np.arange(body.shape[0]) - (by - 4)) / 6, 0, 1)[:, None]
        body[..., 3] = (body[..., 3] * fade).astype(np.uint8); canvas = Image.fromarray(body, 'RGBA'); canvas.alpha_composite(Hs, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
        canvas.save(f'{root}/assets/{out}{mood}.png'); print(out + mood, 'scale', round(sc, 3), 'neck', (round(nx), ny), '->', (round(bx), by))
compose('mayaBodyC', (100, 135), {'smile': 'mayaA', 'worried': 'mayaB', 'unsure': 'mayaC', 'content': 'mayaE', 'happy': 'mayaF'}, 'mayaFull_', (0.6, 0.8))
compose('docBody', (110, 140), {'focus': 'docA', 'smile': 'docB', 'happy': 'docC'}, 'docFull_', (0.55, 0.68))
