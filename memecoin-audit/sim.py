import json, sys, os, numpy as np, pandas as pd
W = os.path.dirname(os.path.abspath(__file__))
recs = [json.loads(l) for l in open(f'{W}/ohlcv.jsonl')]
def merged(rec, key):
    # per timestamp keep candle from the pool with highest volume
    best = {}
    for p, lst in rec[key].items():
        if not isinstance(lst, list): continue
        for t, o, h, l, c, v in lst:
            if t not in best or v > best[t][5]: best[t] = (t, o, h, l, c, v)
    return sorted(best.values())
out = []
for r in recs:
    m = merged(r, 'candles'); hrs = merged(r, 'hourly'); ts = r['ts']
    if not m: out.append(dict(id=r['id'], ok=False)); continue
    pre = [c for c in m if c[0] <= ts]   # candle containing / before post
    post = [c for c in m if c[0] > ts - 60]
    if not pre or not post or ts - pre[-1][0] > 600: out.append(dict(id=r['id'], ok=False, reason='nocandle_at_call')); continue
    p_call = pre[-1][4]   # last traded price at post time (caller-like reference)
    row = dict(id=r['id'], name=r['name'], ok=True, claimed=r['claimed'], p_call=p_call)
    after = [c for c in m if c[0] >= ts]
    def first_after(sec):
        cs = [c for c in m if c[0] >= ts + sec - 59]
        return cs[0] if cs else None
    # max high within windows relative to call price (caller view)
    for lab, mins in [('15m', 15), ('1h', 60), ('16h', 960)]:
        hs = [c[2] for c in m if ts - 60 < c[0] <= ts + mins * 60]
        row['mx_call_' + lab] = max(hs) / p_call if hs else np.nan
    h7 = [c[2] for c in hrs if ts - 3600 < c[0] <= ts + 7 * 86400]
    row['mx_call_7d'] = max(h7 + [c[2] for c in m if c[0] > ts - 60]) / p_call if h7 else row['mx_call_16h']
    # follower entries: buy at open of candle starting delay later; pay worst of open/high? use (open+high)/2 as slippage proxy
    for dl in (1, 2, 5):
        c = first_after(dl * 60)
        if not c: continue
        entry = (c[1] + c[2]) / 2
        row[f'entry{dl}_vs_call'] = entry / p_call
        fut = [x for x in m if x[0] >= c[0]]
        fut_h = [x for x in hrs if x[0] > fut[-1][0]] if fut else []
        row[f'mx{dl}_16h'] = max(x[2] for x in fut) / entry
        row[f'mx{dl}_7d'] = max([x[2] for x in fut] + [x[2] for x in fut_h]) / entry
        # last price at end of fetched window (~16h) and after 7d
        row[f'end{dl}_16h'] = fut[-1][4] / entry
        row[f'end{dl}_7d'] = (fut_h[-1][4] if fut_h else fut[-1][4]) / entry
        # strategy sims on minute path (+hourly tail). Conservative intrabar: stop checked before TP.
        path = fut + fut_h
        for tp, sl in [(2, .5), (3, .5), (2, .7), (1.5, .7), (5, .5)]:
            res = None
            for x in path:
                if x[3] <= entry * sl: res = sl; break
                if x[2] >= entry * tp: res = tp; break
            if res is None: res = path[-1][4] / entry
            row[f's{dl}_tp{tp}_sl{sl}'] = res
        # scale out: sell 50% at 2x, rest trail: exit if drops 50% from post-2x peak, stop -50% before
        res = None; half = False; pk = 0
        for x in path:
            if not half:
                if x[3] <= entry * .5: res = .5; break
                if x[2] >= entry * 2: half = True; pk = x[2]
            else:
                pk = max(pk, x[2])
                if x[3] <= pk * .5: res = .5 * 2 + .5 * max(pk * .5 / entry, x[3]/entry if False else pk*.5/entry); break
        if res is None: res = (.5 * 2 + .5 * path[-1][4] / entry) if half else path[-1][4] / entry
        row[f's{dl}_half2x_trail50'] = res
    out.append(row)
df = pd.DataFrame(out); df.to_csv(f'{W}/sim.csv', index=False)
ok = df[df.ok == True]
print('records', len(df), 'usable', len(ok))
if len(ok):
    print(ok[['claimed', 'mx_call_15m', 'mx_call_1h', 'mx_call_16h', 'mx_call_7d', 'entry1_vs_call', 'entry2_vs_call', 'entry5_vs_call']].describe(percentiles=[.25, .5, .75]).round(2).T)
