#!/usr/bin/env python3
"""Was it the keyword, or just too little data? Grades each Apple Ads keyword against a reference keyword.

Input: a keyword (or search-term) report exported from Apple Ads (Reports > Keywords > Download CSV),
or search_terms.csv from apple_ads_research.py. Column names are matched loosely
(Keyword / Search Term, Impressions, Taps, Installs or Conversions, Spend).

  python3 evaluate_keywords.py export.csv --reference "poop tracker"

For each keyword it prints TTR, CR (installs per tap), CPT, CPI and a verdict:
  NOT ENOUGH DATA   fewer than --min-taps taps; zero installs here proves nothing.
  WORSE (real)      CR is significantly below the reference keyword (one-sided binomial p < 0.05).
  NO DIFFERENCE     enough taps, not significantly different from the reference.
  LOW TTR           people see the ad but don't tap: an intent or creative mismatch, not a conversion problem.
"""
import argparse, csv, math, re, sys


def num(v):
    v = re.sub(r'[^0-9.\-]', '', str(v or ''))
    return float(v) if v not in ('', '-', '.') else 0.0


def pick(row, *names):
    keys = {re.sub(r'[^a-z]', '', k.lower()): k for k in row}
    for n in names:
        k = keys.get(re.sub(r'[^a-z]', '', n.lower()))
        if k is not None:
            return row[k]
    return None


def binom_cdf(k, n, p):
    """P(X <= k) for X ~ Binomial(n, p)."""
    return sum(math.comb(n, i) * p ** i * (1 - p) ** (n - i) for i in range(0, int(k) + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('csv')
    ap.add_argument('--reference', default='poop tracker')
    ap.add_argument('--min-taps', type=int, default=30)
    ap.add_argument('--low-ttr', type=float, default=0.04, help='TTR below this = mismatch (H&F median ~7.5%%)')
    a = ap.parse_args()

    agg = {}
    for row in csv.DictReader(open(a.csv, encoding='utf-8-sig')):
        kw = (pick(row, 'keyword', 'keyword.text', 'keywordText', 'searchTermText', 'search term') or '').strip().lower()
        if not kw:
            continue
        m = agg.setdefault(kw, [0.0, 0.0, 0.0, 0.0])
        m[0] += num(pick(row, 'impressions'))
        m[1] += num(pick(row, 'taps'))
        m[2] += num(pick(row, 'installs', 'totalInstalls', 'conversions', 'tapInstalls'))
        m[3] += num(pick(row, 'spend', 'localSpend.amount', 'localSpend'))

    if a.reference not in agg:
        sys.exit(f'Reference keyword "{a.reference}" not found. Keywords seen: {", ".join(sorted(agg)[:20])}...')
    ri, rt, rn, rs = agg[a.reference]
    ref_cr = rn / rt if rt else 0
    print(f'Reference "{a.reference}": {int(rt)} taps, {int(rn)} installs, CR {ref_cr:.1%}\n')
    print(f'{"keyword":32s} {"impr":>7s} {"taps":>5s} {"inst":>5s} {"TTR":>6s} {"CR":>6s} {"CPT":>6s} {"CPI":>7s}  verdict')
    for kw, (imp, taps, inst, spend) in sorted(agg.items(), key=lambda x: -x[1][1]):
        ttr = taps / imp if imp else 0
        cr = inst / taps if taps else 0
        cpt = spend / taps if taps else 0
        cpi = spend / inst if inst else float('inf')
        if kw == a.reference:
            verdict = 'REFERENCE'
        elif imp >= 200 and ttr < a.low_ttr:
            verdict = 'LOW TTR (intent/creative mismatch)'
        elif taps < a.min_taps:
            need = a.min_taps - int(taps)
            verdict = f'NOT ENOUGH DATA (~{need} more taps)'
        else:
            p = binom_cdf(inst, int(taps), ref_cr) if ref_cr else 1.0
            verdict = f'WORSE (real, p={p:.3f})' if p < 0.05 else f'NO DIFFERENCE (p={p:.2f})'
        cpi_s = f'${cpi:,.2f}' if cpi != float('inf') else '—'
        print(f'{kw[:32]:32s} {int(imp):7d} {int(taps):5d} {int(inst):5d} {ttr:6.1%} {cr:6.1%} ${cpt:5.2f} {cpi_s:>7s}  {verdict}')
    print('\nJudge on cost per trial / paid user, not CPI, once trial data is joined in (RevenueCat or your MMP).')


if __name__ == '__main__':
    main()
