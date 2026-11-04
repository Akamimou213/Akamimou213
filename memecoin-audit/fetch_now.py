import csv, json, time, urllib.request, os
W = os.path.dirname(os.path.abspath(__file__))
rows = [r for r in csv.DictReader(open(f'{W}/calls.csv')) if r['ca']]
chainmap = {'SOL': 'solana', 'ETH': 'ethereum', 'BSC': 'bsc', 'BASE': 'base'}
by = {}
for r in rows:
    ch = chainmap.get(r['chain'])
    if ch: by.setdefault(ch, set()).add(r['ca'])
res = {}
for ch, cas in by.items():
    cas = sorted(cas)
    for i in range(0, len(cas), 30):
        b = cas[i:i+30]
        for a in range(4):
            try:
                d = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.dexscreener.com/tokens/v1/{ch}/{','.join(b)}", headers={"User-Agent": "curl/8.5.0", "accept": "application/json"}), timeout=30)); break
            except Exception as e:
                time.sleep(5 * (a + 1)); d = []
        best = {}
        for p in d or []:
            ca = p['baseToken']['address']
            liq = (p.get('liquidity') or {}).get('usd') or 0
            if ca not in best or liq > best[ca]['liq']:
                best[ca] = dict(liq=liq, mcap=p.get('marketCap') or p.get('fdv'), vol24=(p.get('volume') or {}).get('h24'), dex=p.get('dexId'), created=p.get('pairCreatedAt'))
        for ca in b:
            hit = best.get(ca) or next((v for k, v in best.items() if k.lower() == ca.lower()), None)
            res[ca] = hit
        time.sleep(0.3)
json.dump(res, open(f'{W}/now.json', 'w'))
print(len(res), sum(1 for v in res.values() if v))
