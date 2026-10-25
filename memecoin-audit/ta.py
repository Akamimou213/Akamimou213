import json, os, numpy as np, pandas as pd, calendar, time
W = os.path.dirname(os.path.abspath(__file__))
recs = {json.loads(l)['id']: json.loads(l) for l in open(f'{W}/ohlcv.jsonl')}
s2 = pd.read_csv(f'{W}/sim2.csv')
def merged(rec, key):
    best = {}
    for p, lst in rec[key].items():
        if not isinstance(lst, list): continue
        for t, o, h, l, c, v in lst:
            if t not in best or v > best[t][5]: best[t] = (t, o, h, l, c, v)
    return sorted(best.values())
def pts(s): return calendar.timegm(time.strptime(s, '%Y-%m-%dT%H:%M:%SZ')) if s else None
rows = []
for _, r in s2.iterrows():
    rec = recs[r.id]; ts = rec['ts']; m = merged(rec, 'candles')
    pre30 = [c for c in m if ts - 1800 <= c[0] < ts]
    pre60 = [c for c in m if ts - 3600 <= c[0] < ts]
    p30 = next((c[1] for c in m if c[0] >= ts - 1800), None)
    pools = rec['pools']
    created = [pts(p[2]) for p in pools if p[2]]
    pf = [pts(p[2]) for p in pools if p[1] == 'pump-fun' and p[2]]
    mig = [pts(p[2]) for p in pools if p[1] == 'pumpswap' and p[2]]
    age = (ts - min(pf or created)) / 3600 if (pf or created) else np.nan
    bonded = int(bool(mig) and min(mig) <= ts)
    buys = None
    rows.append(dict(id=r.id, ev=r['d1_tp2_sl0.5'], hr=r.hr, mcap=r.mcap_call, age_h=age, bonded=bonded,
                     runup30=(r.p_call / p30) if p30 else np.nan,
                     vol30=sum(c[5] for c in pre30), vol60=sum(c[5] for c in pre60),
                     green30=np.mean([c[4] >= c[1] for c in pre30]) if pre30 else np.nan,
                     dd_from_hi60=(r.p_call / max(c[2] for c in pre60)) if pre60 else np.nan))
d = pd.DataFrame(rows)
d['vol_to_mcap'] = d.vol60 / d.mcap
def bs(v):
    v = v.dropna().values
    if len(v) < 8: return None
    b = np.random.default_rng(2).choice(v, (3000, len(v))).mean(1)
    return f'n={len(v):3d} ev={v.mean()-1:+.3f} [{np.percentile(b,5)-1:+.3f},{np.percentile(b,95)-1:+.3f}] win={(v>1).mean():.2f}'
out = {}
for col in ['age_h', 'runup30', 'vol30', 'vol_to_mcap', 'green30', 'dd_from_hi60', 'mcap']:
    q = d[col].quantile([1/3, 2/3]).values
    for lab, m in [('low', d[col] <= q[0]), ('mid', (d[col] > q[0]) & (d[col] <= q[1])), ('high', d[col] > q[1])]:
        res = bs(d[m].ev); print(f'{col:13s} {lab:4s} (<= {q[0]:.3g} | <= {q[1]:.3g}) {res}')
        out[f'{col}_{lab}'] = res
for b in (0, 1): print('bonded', b, bs(d[d.bonded == b].ev))
d.to_csv(f'{W}/ta.csv', index=False)
print(d[['age_h','runup30','vol_to_mcap','dd_from_hi60']].describe().round(2))
