import json, os, html, numpy as np, pandas as pd
W = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(W), 'gambles-audit.html')
S = json.load(open(f'{W}/summary.json'))
N = json.load(open(f'{W}/now_summary.json'))
X = json.load(open(f'{W}/sim2_summary.json'))
sim = pd.read_csv(f'{W}/sim.csv'); sim = sim[sim.ok == True]
s2 = pd.read_csv(f'{W}/sim2.csv')
meta = json.load(open(f'{W}/calls.csv.meta.json'))

def pct(v, d=0): return f'{v*100:.{d}f}%'
def sgn(v, d=1): return f'{"+" if v >= 0 else "−"}{abs(v)*100:.{d}f}%'
NS = len(s2)

# ---------- chart 1: claimed vs on-chain funnel ----------
thr = [2, 3, 5, 10]
claimed = [S['funnel'][str(t)] for t in thr]
oc_call = [(sim.mx_call_7d >= t).mean() for t in thr]
oc_f1 = [(sim.mx1_7d.dropna() >= t).mean() for t in thr]
def funnel_svg():
    w, h, l, b, top = 640, 300, 44, 40, 16
    gw = (w - l - 10) / len(thr); bw = gw / 4.4
    y = lambda v: top + (h - top - b) * (1 - v)
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Share of calls reaching each multiple: channel claim versus on-chain">']
    for g in [0, .25, .5, .75, 1]:
        out.append(f'<line x1="{l}" x2="{w-10}" y1="{y(g):.1f}" y2="{y(g):.1f}" class="grid"/><text x="{l-8}" y="{y(g)+4:.1f}" class="ax" text-anchor="end">{int(g*100)}%</text>')
    series = [(claimed, 'c-claim'), (oc_call, 'c-chain'), (oc_f1, 'c-follow')]
    for i, t in enumerate(thr):
        x0 = l + i * gw + gw * .14
        for j, (vals, cls) in enumerate(series):
            v = vals[i]; x = x0 + j * (bw + 3)
            out.append(f'<rect x="{x:.1f}" y="{y(v):.1f}" width="{bw:.1f}" height="{(h-b)-y(v):.1f}" class="{cls}"/>')
            out.append(f'<text x="{x+bw/2:.1f}" y="{y(v)-5:.1f}" class="val" text-anchor="middle">{v*100:.0f}</text>')
        out.append(f'<text x="{x0 + 1.5*(bw+3):.1f}" y="{h-b+20}" class="ax" text-anchor="middle">≥ {t}x</text>')
    out.append('</svg>')
    return ''.join(out)

# ---------- chart 2: when the peak update lands ----------
d = pd.read_csv(f'{W}/calls.csv'); d['dtu'] = pd.to_datetime(d.ts, unit='s')
fr = d[(d.kind == 'fresh') & (d.dtu < '2026-10-22')]
bk = pd.cut(fr.h_peak_post * 60, [0, 5, 15, 60, 240, 1440, 1e9], labels=['≤ 5 min', '5–15 min', '15–60 min', '1–4 h', '4–24 h', '> 24 h'])
peak_dist = bk.value_counts(normalize=True).sort_index()
def peak_svg():
    w, h, l, top, b = 640, 230, 10, 22, 34
    n = len(peak_dist); gw = (w - 2 * l) / n; mx = peak_dist.max()
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Distribution of time from call to peak update">']
    cum = 0
    for i, (lab, v) in enumerate(peak_dist.items()):
        cum += v
        bh = (h - top - b) * v / mx; x = l + i * gw + 8
        cls = 'c-claim' if i < 3 else 'c-muted'
        out.append(f'<rect x="{x:.1f}" y="{h-b-bh:.1f}" width="{gw-16:.1f}" height="{bh:.1f}" class="{cls}"/>')
        out.append(f'<text x="{x+(gw-16)/2:.1f}" y="{h-b-bh-6:.1f}" class="val" text-anchor="middle">{v*100:.0f}%</text>')
        out.append(f'<text x="{x+(gw-16)/2:.1f}" y="{h-b+18}" class="ax" text-anchor="middle">{lab}</text>')
    out.append('</svg>')
    return ''.join(out)

# ---------- chart 3: strategy EV with 90% CI ----------
strategies = [
    ('Buy +1 min, hold 7 days', 'd1_hold7d'),
    ('Buy +1 min, hold 16 h', 'd1_hold16h'),
    ('Buy +1 min, TP 5x / SL −50%', 'd1_tp5_sl0.5'),
    ('Buy +1 min, TP 3x / SL −50%', 'd1_tp3_sl0.5'),
    ('Buy +1 min, TP 2x / SL −50%', 'd1_tp2_sl0.5'),
    ('Buy +1 min, 75% at 2x + trailed moonbag', 'd1_moonbag'),
    ('Buy +1 min, TP 1.5x / SL −30%', 'd1_tp1.5_sl0.7'),
    ('Buy +1 min, TP 2x / SL −40% / 15-min time stop', 'd1_tp2_sl0.6_t15'),
    ('Buy +5 min, TP 1.5x / SL −30%', 'd5_tp1.5_sl0.7'),
    ('Dip limit at 0.7× call price, TP 2x / SL −50%', 'dip0.7_tp2_sl0.5'),
    ('Dip limit at 0.7× call price, TP 1.5x / SL −40%', 'dip0.7_tp1.5_sl0.6'),
    ('Dip limit at 0.5× call price, TP 1.5x / SL −40%', 'dip0.5_tp1.5_sl0.6'),
]
strategies = [(a, k) for a, k in strategies if X.get(k)]
def ev_svg():
    lo_ax, hi_ax = -0.9, 0.5
    w, rh, lab_w, top = 700, 30, 300, 24
    h = top + rh * len(strategies) + 30
    x = lambda v: lab_w + (w - lab_w - 20) * (v - lo_ax) / (hi_ax - lo_ax)
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Expected return per trade after fees, with 90% bootstrap interval">']
    for g in [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4]:
        out.append(f'<line x1="{x(g):.1f}" x2="{x(g):.1f}" y1="{top-6}" y2="{h-26}" class="{"zero" if g == 0 else "grid"}"/>'
                   f'<text x="{x(g):.1f}" y="{h-8}" class="ax" text-anchor="middle">{"+" if g > 0 else ""}{int(round(g*100))}%</text>')
    for i, (lab, k) in enumerate(strategies):
        r = X[k]; cy = top + i * rh + rh / 2
        cls = 'c-gain' if r['lo'] > 0 else ('c-loss' if r['hi'] < 0 else 'c-mid')
        out.append(f'<text x="{lab_w-10}" y="{cy+4:.1f}" class="lab" text-anchor="end">{html.escape(lab)}</text>')
        out.append(f'<line x1="{x(max(r["lo"], lo_ax)):.1f}" x2="{x(min(r["hi"], hi_ax)):.1f}" y1="{cy:.1f}" y2="{cy:.1f}" class="ci {cls}s"/>')
        out.append(f'<circle cx="{x(max(min(r["ev"], hi_ax), lo_ax)):.1f}" cy="{cy:.1f}" r="5" class="{cls}"/>')
        out.append(f'<text x="{w-4}" y="{cy+4:.1f}" class="val" text-anchor="end">{sgn(r["ev"])}</text>')
    out.append('</svg>')
    return ''.join(out)

# ---------- chart 4: feature effects (≥5x rate vs base) ----------
feats = sorted(S['features'], key=lambda r: r['ge5'])
def feat_svg():
    w, rh, lab_w, top = 700, 26, 250, 20
    h = top + rh * len(feats) + 30
    lo_ax, hi_ax = 0.1, 0.5
    x = lambda v: lab_w + (w - lab_w - 70) * (v - lo_ax) / (hi_ax - lo_ax)
    base = S['base']['ge5']
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Share of calls reaching 5x by call attribute">']
    for g in [.1, .2, .3, .4, .5]:
        out.append(f'<line x1="{x(g):.1f}" x2="{x(g):.1f}" y1="{top-6}" y2="{h-26}" class="grid"/><text x="{x(g):.1f}" y="{h-8}" class="ax" text-anchor="middle">{int(g*100)}%</text>')
    out.append(f'<line x1="{x(base):.1f}" x2="{x(base):.1f}" y1="{top-10}" y2="{h-26}" class="zero"/><text x="{x(base)+4:.1f}" y="{top-10}" class="ax">all calls {base*100:.0f}%</text>')
    for i, r in enumerate(feats):
        cy = top + i * rh + rh / 2
        sig = abs(r['z5']) >= 2.6
        cls = ('c-gain' if r['ge5'] > base else 'c-loss') if sig else 'c-muted'
        out.append(f'<text x="{lab_w-10}" y="{cy+4:.1f}" class="lab" text-anchor="end">{html.escape(r["label"])}</text>')
        out.append(f'<line x1="{x(base):.1f}" x2="{x(r["ge5"]):.1f}" y1="{cy:.1f}" y2="{cy:.1f}" class="stem {cls}s"/>')
        out.append(f'<circle cx="{x(r["ge5"]):.1f}" cy="{cy:.1f}" r="5" class="{cls}"/>')
        out.append(f'<text x="{w-4}" y="{cy+4:.1f}" class="val" text-anchor="end">n={r["n"]:,} · z {r["z5"]:+.1f}</text>')
    out.append('</svg>')
    return ''.join(out)

def kv(k): return X.get(k) or dict(ev=float('nan'), lo=float('nan'), hi=float('nan'), win=float('nan'), n=0)
best_call = kv('d1_tp2_sl0.5'); dip = kv('dip0.7_tp2_sl0.5'); dip15 = kv('dip0.7_tp1.5_sl0.6'); hold = kv('d1_hold7d')
moon = kv('d1_moonbag'); g50 = kv('F_mcap_ge_50k_d1_tp2_sl0.5'); l50 = kv('F_mcap_lt_50k_d1_tp2_sl0.5'); ts15 = kv('d1_tp2_sl0.6_t15')
med = lambda c: float(sim[c].dropna().median())
ratio_q = X['claim_base_ratio_q']

ctx = dict(
    NMSG=f"{meta['n_msgs']:,}", NCALLS=f"{meta['n_calls']:,}", NUPD=f"{meta['n_updates']:,}", NFRESH=f"{S['n_fresh']:,}",
    CPD=S['all_calls_per_day'], FPD=S['calls_per_day'],
    C2=pct(S['funnel']['2']), C3=pct(S['funnel']['3']), C5=pct(S['funnel']['5']), C10=pct(S['funnel']['10']), C100=pct(S['funnel']['100'], 1),
    T2X=f"{S['t2x_min']['0.5']:.0f}", T2X25=f"{S['t2x_min']['0.25']:.0f}", PK15=pct(S['peak_post_min'] and float((fr.h_peak_post*60 <= 15).mean())),
    PK60=pct(float((fr.h_peak_post*60 <= 60).mean())), RETR=pct(S['retrace_median']),
    NS=NS, OC2=pct(oc_call[0]), OC5=pct(oc_call[2]), OC10=pct(oc_call[3]), OF2=pct(oc_f1[0]), OF5=pct(oc_f1[2]), OF10=pct(oc_f1[3]),
    M15=f"{med('mx_call_15m'):.2f}x", M1H=f"{med('mx_call_1h'):.2f}x", M16=f"{med('mx_call_16h'):.2f}x", M7D=f"{med('mx_call_7d'):.2f}x",
    CLM=f"{float(sim.claimed.median()):.1f}x", RQ=f"{ratio_q[1]:.2f}", RQ25=f"{ratio_q[0]:.2f}", RQ75=f"{ratio_q[2]:.2f}",
    NOWN=f"{N['n']:,}", LISTED=pct(N['listed']), MC100=pct(N['mc100k'], 1), MC1M=pct(N['mc1m'], 1), ABOVE=pct(N['above_entry'], 1), VOL1K=pct(N['vol1k'], 1),
    MISSING='3,422', JL=f"${S['jl_entry_med'][0]/1e3:.0f}k", NJL=f"${S['jl_entry_med'][1]/1e3:.0f}k",
    BC_EV=sgn(best_call['ev']), BC_LO=sgn(best_call['lo']), BC_HI=sgn(best_call['hi']), BC_WIN=pct(best_call['win']),
    DIP_EV=sgn(dip['ev']), DIP_LO=sgn(dip['lo']), DIP_HI=sgn(dip['hi']), DIP_WIN=pct(dip['win']), DIP_N=dip['n'], DIP_FILL=pct(X.get('dip0.7_fillrate', 0)),
    DIP15_EV=sgn(dip15['ev']), DIP15_LO=sgn(dip15['lo']), DIP15_HI=sgn(dip15['hi']),
    G50_EV=sgn(g50['ev']), G50_LO=sgn(g50['lo']), G50_HI=sgn(g50['hi']), G50_N=g50['n'], L50_EV=sgn(l50['ev']), L50_LO=sgn(l50['lo']), L50_HI=sgn(l50['hi']), L50_N=l50['n'],
    HOLD_EV=sgn(hold['ev']), MOON_EV=sgn(moon['ev']), TS15_EV=sgn(ts15['ev']),
    L23=pct(S['ladder']['2->3']), L510=pct(S['ladder']['5->10']), L1020=pct(S['ladder']['10->20']),
    F_FUNNEL=funnel_svg(), F_PEAK=peak_svg(), F_EV=ev_svg(), F_FEAT=feat_svg(),
)
tpl = open(f'{W}/report_tpl.html').read()
for k, v in ctx.items(): tpl = tpl.replace('{{' + k + '}}', str(v))
assert '{{' not in tpl, [l for l in tpl.split('\n') if '{{' in l][:5]
open(OUT, 'w').write(tpl)
print('wrote', OUT, len(tpl))
