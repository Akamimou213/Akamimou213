import csv, json, time, random, sys, os, urllib.request, urllib.error
W = os.path.dirname(os.path.abspath(__file__))
rows = [r for r in csv.DictReader(open(f'{W}/calls.csv'))]
lo, hi = 1777939200, 1792627200  # 2026-05-05 .. 2026-10-21 UTC
pool = [r for r in rows if r['kind'] == 'fresh' and r['chain'] == 'SOL' and r['ca'] and lo <= int(r['ts']) <= hi]
random.seed(42); random.shuffle(pool)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 360
outp = f'{W}/ohlcv.jsonl'
done = set()
if os.path.exists(outp):
    done = {json.loads(l)['id'] for l in open(outp)}
last = [0.0]
def get(url):
    for attempt in range(6):
        wait = 6.2 - (time.time() - last[0])
        if wait > 0: time.sleep(wait)
        last[0] = time.time()
        print(time.strftime('%H:%M:%S'), url[-90:], flush=True)
        try:
            req = urllib.request.Request(url, headers={'accept': 'application/json'})
            return json.load(urllib.request.urlopen(req, timeout=30))
        except urllib.error.HTTPError as e:
            print('HTTP', e.code, flush=True)
            if e.code == 429: time.sleep(30); continue
            if e.code in (404, 401): return {'_err': e.code}
            time.sleep(5)
        except Exception as ex:
            print('EXC', repr(ex)[:120], flush=True); time.sleep(5)
    return {'_err': 'fail'}
G = 'https://api.geckoterminal.com/api/v2/networks/solana'
out = open(outp, 'a')
for r in pool[:N]:
    cid = int(r['id'])
    if cid in done: continue
    ts = int(r['ts'])
    pl = get(f"{G}/tokens/{r['ca']}/pools?page=1")
    pools = [(p['attributes']['address'], p['relationships']['dex']['data']['id'], p['attributes']['pool_created_at'],
              float(p['attributes'].get('reserve_in_usd') or 0)) for p in pl.get('data', [])]
    def cts(p):
        return int(time.mktime(time.strptime(p[2], '%Y-%m-%dT%H:%M:%SZ'))) - time.timezone if p[2] else 0
    pf = sorted([p for p in pools if p[1] == 'pump-fun'], key=cts)[:1]
    mig = sorted([p for p in pools if p[1] in ('pumpswap', 'raydium', 'raydium-clmm', 'meteora', 'meteora-damm-v2', 'raydium-launchlab', 'meteora-dbc')
                  and cts(p) < ts + 86400], key=lambda p: -p[3])[:1]
    sel = pf + [p for p in mig if p not in pf]
    rec = dict(id=cid, ts=ts, ca=r['ca'], name=r['name'], claimed=float(r['max_mult']), pools=pools[:6], candles={}, hourly={})
    for p in sel:
        c = get(f"{G}/pools/{p[0]}/ohlcv/minute?aggregate=1&limit=1000&before_timestamp={ts + 970*60}&currency=usd&token=base")
        rec['candles'][p[0]] = c.get('data', {}).get('attributes', {}).get('ohlcv_list', c.get('_err'))
        h = get(f"{G}/pools/{p[0]}/ohlcv/hour?aggregate=1&limit=200&before_timestamp={ts + 7*86400}&currency=usd&token=base")
        rec['hourly'][p[0]] = h.get('data', {}).get('attributes', {}).get('ohlcv_list', h.get('_err'))
    out.write(json.dumps(rec) + '\n'); out.flush()
print('done')
