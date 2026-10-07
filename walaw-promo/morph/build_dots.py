import sys, json, math, os
import numpy as np
from matplotlib.path import Path
G, OUT = sys.argv[1], sys.argv[2]
R = 6371.0
p1, p2, p0, l0 = map(math.radians, (60, 46, 44, -68.5))     # Québec Lambert (EPSG:32198) parameters, spherical
n = math.log(math.cos(p1) / math.cos(p2)) / math.log(math.tan(math.pi / 4 + p2 / 2) / math.tan(math.pi / 4 + p1 / 2))
F = math.cos(p1) * math.tan(math.pi / 4 + p1 / 2) ** n / n
rho0 = R * F / math.tan(math.pi / 4 + p0 / 2) ** n
def proj(lon, lat):
    lon, lat = np.radians(np.asarray(lon, float)), np.radians(np.asarray(lat, float))
    rho = R * F / np.tan(np.pi / 4 + lat / 2) ** n
    th = n * (lon - l0)
    return rho * np.sin(th), rho0 - rho * np.cos(th)
regions = json.load(open(f'{G}/regions.json'))
paths = {k: [Path(np.stack(proj(np.array(r)[:, 0], np.array(r)[:, 1]), 1)) for r in rings if len(r) > 2] for k, rings in regions.items()}
qv = np.concatenate([p.vertices for p in paths['Québec']]); x0, y0 = qv.min(0); x1, y1 = qv.max(0)
def grid(sp, box):
    X, Y = np.meshgrid(np.arange(box[0], box[1], sp), np.arange(box[2], box[3], sp)); pts = np.stack([X.ravel(), Y.ravel()], 1)
    cls = np.full(len(pts), -1)
    for name, ps in paths.items():
        inside = np.zeros(len(pts), bool)
        for p in ps:
            e = p.get_extents(); m = (pts[:, 0] >= e.x0) & (pts[:, 0] <= e.x1) & (pts[:, 1] >= e.y0) & (pts[:, 1] <= e.y1)
            if m.any(): inside[m] ^= p.contains_points(pts[m])
        cls[(cls == -1) & inside] = 1 if name == 'Québec' else 0
    k = cls >= 0
    return np.round(pts[k], 1).tolist(), cls[k].tolist()
coarse, cc = grid(15.0, (x0 - 250, x1 + 250, y0 - 250, y1 + 120))
sx, sy = proj([-77.5, -64.0], [44.6, 49.6])
fine, fc = grid(7.0, (sx.min(), sx.max(), sy.min(), sy.max()))
pts = json.load(open(sys.argv[3])) if len(sys.argv) > 3 and os.path.exists(sys.argv[3]) else []
for c in pts:
    x, y = proj([c['lon']], [c['lat']]); c['x'], c['y'] = round(float(x[0]), 1), round(float(y[0]), 1)
json.dump(dict(bbox=[float(x0), float(x1), float(y0), float(y1)], coarse=coarse, coarseCls=cc, fine=fine, fineCls=fc,
               south=[float(sx.min()), float(sx.max()), float(sy.min()), float(sy.max())], clinics=pts),
          open(f'{OUT}/quebec-dots.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('coarse', len(coarse), 'qc', sum(cc), '| fine', len(fine), 'qc', sum(fc), '| clinics', len(pts), '| KB', os.path.getsize(f'{OUT}/quebec-dots.json') // 1024)
