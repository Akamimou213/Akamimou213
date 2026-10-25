import json, os, numpy as np, pandas as pd
W = os.path.dirname(os.path.abspath(__file__))
FEE = float(os.environ.get("FEE", "0.03"))
recs = [json.loads(l) for l in open(f'{W}/ohlcv.jsonl')]
def merged(rec, key):
    best = {}
    for p, lst in rec[key].items():
        if not isinstance(lst, list): continue
        for t, o, h, l, c, v in lst:
            if t not in best or v > best[t][5]: best[t] = (t, o, h, l, c, v)
    return sorted(best.values())
def run(path, entry, tp, sl, tmax=None, t0=None, stop_first=True):
    for x in path:
        if tmax and x[0] - t0 > tmax:
            return x[1] / entry
        hit_sl = x[3] <= entry * sl; hit_tp = x[2] >= entry * tp
        if hit_sl and hit_tp: return sl if stop_first else tp
        if hit_sl: return min(sl, x[1] / entry)   # gap-through: fill at open if it opened below stop
        if hit_tp: return tp
    return path[-1][4] / entry
rows = []
calls = pd.read_csv(f'{W}/calls.csv').set_index('id')
for r in recs:
    m = merged(r, 'candles'); hrs = merged(r, 'hourly'); ts = r['ts']
    pre = [c for c in m if c[0] <= ts]
    if not m or not pre or ts - pre[-1][0] > 600: continue
    p_call = pre[-1][4]
    tail_h = lambda last_t: [x for x in hrs if x[0] > last_t]
    row = dict(id=r['id'], p_call=p_call, claimed=r['claimed'])
    c0 = calls.loc[r['id']]
    row['desc'] = str(c0['desc']).lower(); row['entry_mcap_ch'] = c0['entry_mcap']; row['hr'] = pd.to_datetime(ts, unit='s').hour
    row['mcap_call'] = p_call * 1e9
    row['ratio_claim_base'] = (c0['entry_mcap'] / (p_call * 1e9)) if c0['entry_mcap'] == c0['entry_mcap'] else np.nan
    for dl in (1, 2, 5):
        fut = [x for x in m if x[0] >= ts + dl * 60 - 59]
        if not fut: continue
        entry = (fut[0][1] + fut[0][2]) / 2
        path = fut + tail_h(fut[-1][0])
        for tp, sl in [(1.5, .7), (2, .5), (2, .7), (3, .5), (5, .5)]:
            row[f'd{dl}_tp{tp}_sl{sl}'] = run(path, entry, tp, sl) * (1 - FEE)
            row[f'd{dl}_tp{tp}_sl{sl}_opt'] = run(path, entry, tp, sl, stop_first=False) * (1 - FEE)
        for tmin in (15, 60):
            row[f'd{dl}_tp2_sl0.6_t{tmin}'] = run(path, entry, 2, .6, tmax=tmin * 60, t0=fut[0][0]) * (1 - FEE)
        # moonbag: stop -50% before 2x; at 2x sell 75%, ride 25% with a 60% trailing stop to end of 7d window
        res, pk = None, None
        for x in path:
            if pk is None:
                if x[3] <= entry * .5: res = .5; break
                if x[2] >= entry * 2: pk = x[2]
            else:
                if x[3] <= pk * .4: res = .75 * 2 + .25 * (pk * .4 / entry); break
                pk = max(pk, x[2])
        if res is None: res = (.75 * 2 + .25 * path[-1][4] / entry) if pk else path[-1][4] / entry
        row[f'd{dl}_moonbag'] = res * (1 - FEE)
        row[f'd{dl}_hold16h'] = fut[-1][4] / entry * (1 - FEE)
        row[f'd{dl}_hold7d'] = path[-1][4] / entry * (1 - FEE)
    # dip-buy: after the call, limit buy at k * call price within 6h; then tp/sl on that entry
    for k in (0.7, 0.5):
        win = [x for x in m if ts <= x[0] <= ts + 6 * 3600]
        fill = next((i for i, x in enumerate(win) if x[3] <= p_call * k), None)
        key = f'dip{k}'
        if fill is None: row[key + '_filled'] = 0; continue
        row[key + '_filled'] = 1
        entry = p_call * k
        rest = [x for x in m if x[0] > win[fill][0]]
        path = rest + tail_h(rest[-1][0] if rest else win[fill][0])
        if not path: row[key + '_filled'] = 0; continue
        row[key + '_tp2_sl0.5'] = run(path, entry, 2, .5) * (1 - FEE)
        row[key + '_tp1.5_sl0.6'] = run(path, entry, 1.5, .6) * (1 - FEE)
    rows.append(row)
df = pd.DataFrame(rows); df.to_csv(f'{W}/sim2' + os.environ.get('SUFFIX', '') + '.csv', index=False)
print('usable', len(df))
def summ(c, sub=None):
    s = (sub if sub is not None else df)[c].dropna()
    if not len(s): return None
    b = np.random.default_rng(0).choice(s.values, (2000, len(s))).mean(1)
    return dict(n=len(s), ev=round(s.mean() - 1, 3), lo=round(np.percentile(b, 5) - 1, 3), hi=round(np.percentile(b, 95) - 1, 3),
                win=round((s > 1).mean(), 2), med=round(s.median() - 1, 2))
out = {}
for c in [c for c in df.columns if c.startswith(('d1_', 'd2_', 'd5_', 'dip')) and not c.endswith('_filled')]:
    out[c] = summ(c)
for k in (0.7, 0.5): out[f'dip{k}_fillrate'] = round(df[f'dip{k}_filled'].mean(), 3)
# filters
jl = df.desc.str.contains(r'just launch|new launch|low ?cap')
for name, mask in {'not_jl': ~jl, 'jl': jl, 'mcap_ge_50k': df.mcap_call >= 5e4, 'mcap_lt_50k': df.mcap_call < 5e4,
                   'utc0_8': df.hr < 8}.items():
    out['F_' + name + '_d1_tp2_sl0.5'] = summ('d1_tp2_sl0.5', df[mask])
    out['F_' + name + '_d1_tp1.5_sl0.7'] = summ('d1_tp1.5_sl0.7', df[mask])
out['claim_base_ratio_q'] = df.ratio_claim_base.quantile([.25, .5, .75]).round(2).tolist()
json.dump(out, open(f'{W}/sim2_summary' + os.environ.get('SUFFIX', '') + '.json', 'w'), indent=1)
for k, v in out.items(): print(k, v)
