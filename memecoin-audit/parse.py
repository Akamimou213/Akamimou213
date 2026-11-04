import json, re, sys, collections, csv
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
M = d['messages']
byid = {x['id']: x for x in M}
def txt(x): return ''.join(t['text'] for t in x['text_entities'])

def mc(s):
    s = s.strip().lower().replace(',', '.')
    m = re.match(r'([\d.]+)\s*(k|m|b)?', s)
    if not m: return None
    try: v = float(m.group(1))
    except: return None
    return v * {'k':1e3,'m':1e6,'b':1e9,None:1}[m.group(2)]

UPD = re.compile(r'^\s*(?:([\d.]+)\s*x\s*(plus)?\s*,?\s*)?([\d.,]+\s*[kKmMbB])\b', re.I)
NOW = re.compile(r'now\s+([\d.,]+\s*[kKmMbB])', re.I)
SOLCA = re.compile(r'\b[1-9A-HJ-NP-Za-km-z]{32,44}\b')
EVMCA = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
HDR = re.compile(r'^\W*(prelaunch|presale|update|pinksale)?\s*([\d.]+x)?\s*\(\s*(\S*?)\s*([A-Z]+)\s*\)\s*(.*)$', re.I)

calls, updates, digests, other = {}, [], [], []
for x in M:
    t = txt(x)
    first = t.split('\n')[0]
    if 'reply_to_message_id' in x and not HDR.match(first):
        fl = first.split('now')[0]
        mm = re.match(r'^\W{0,3}[a-z]?\s*([\d.]+)\s*x', fl, re.I)
        pk = re.search(r'([\d]+(?:[.,]\d+)?)\s*([kKmMbB])k?\b', fl[mm.end():] if mm else fl)
        if mm or pk:
            n = NOW.search(t)
            try: mult = float(mm.group(1).strip('.')) if mm else 1.0
            except: mult = 1.0
            updates.append(dict(id=x['id'], date=x['date_unixtime'], to=x['reply_to_message_id'],
                mult=mult, peak=mc(pk.group(1)+pk.group(2)) if pk else None, now=mc(n.group(1)) if n else None,
                dip='dip' in t.lower(), raw=first[:80]))
        else:
            other.append(('reply', x['id'], t[:120]))
        continue
    if 'LAST 24 HOURS' in first:
        digests.append(x['id']); continue
    h = HDR.match(first)
    if not h and '(🔥' in first:
        h = re.match(r'^\W*(prelaunch|presale|update|pinksale)?\s*([\d.]+x)?\s*\(\s*(\S*?)\s*([A-Z]+)\s*(.*)$', first, re.I)
    if not h:
        other.append(('nr', x['id'], t[:120])); continue
    kind = (h.group(1) or 'fresh').lower()
    if h.group(2) and kind == 'update': kind = 'update_' + h.group(2).lower()
    if kind == 'pinksale' or kind == 'presale': kind = 'presale'
    emo = h.group(3)
    chain = h.group(4).upper()
    name = h.group(5).strip()
    evm = EVMCA.findall(t)
    links = [e.get('href', e['text']) for e in x['text_entities'] if e['type'] in ('link', 'text_link')]
    body_wo_links = t
    for l in links: body_wo_links = body_wo_links.replace(l, ' ')
    sol = [s for s in SOLCA.findall(body_wo_links) if not s.startswith('0x')]
    ca = evm[0] if evm else (sol[-1] if sol else None)
    react = sum(r['count'] for r in x.get('reactions', []))
    xl = [l for l in links if 'x.com' in l or 'twitter.com' in l]
    calls[x['id']] = dict(id=x['id'], date=x['date'], ts=int(x['date_unixtime']), kind=kind, emo=emo, chain=chain,
        name=name, ca=ca, text=t, reactions=react,
        x_tweet=any('/status/' in l for l in xl), x_comm=any('/communities/' in l for l in xl),
        x_acct=any(re.search(r'x\.com/[^/]+/?$', l.split('?')[0]) for l in xl),
        dex=any('dexscreener' in l for l in links), n_links=len(links))

# resolve each update to its root call by following reply chain
def root(mid, depth=0):
    if mid in calls: return mid
    x = byid.get(mid)
    if x is None or depth > 10: return None
    if 'reply_to_message_id' in x: return root(x['reply_to_message_id'], depth + 1)
    return None
orphan = 0
agg = collections.defaultdict(list)
for u in updates:
    r = root(u['to'])
    if r is None: orphan += 1; continue
    agg[r].append(u)

rows = []
for cid, c in calls.items():
    us = sorted(agg.get(cid, []), key=lambda u: int(u['date']))
    best = max(us, key=lambda u: u['mult']) if us else None
    first = us[0] if us else None
    def tt(u): return (int(u['date']) - c['ts']) / 3600 if u else None
    hit = lambda k: next((u for u in us if u['mult'] >= k), None)
    entry = (best['peak'] / best['mult']) if best and best['peak'] else None
    lastnow = [u['now'] for u in us if u['now']]
    r = {k: v for k, v in c.items() if k != 'text'}
    r.update(n_updates=len(us), max_mult=best['mult'] if best else 0, peak_mcap=best['peak'] if best else None,
             entry_mcap=entry, h_first=tt(first), h_peak_post=tt(best),
             h_2x=tt(hit(2)), h_3x=tt(hit(3)), h_5x=tt(hit(5)), h_10x=tt(hit(10)),
             first_mult=first['mult'] if first else None,
             retrace_low=min(lastnow) if lastnow else None,
             desc=' '.join(c['text'].split('\n')[1:])[:600].replace('\n', ' '))
    rows.append(r)
rows.sort(key=lambda r: r['ts'])
with open(out, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
json.dump(dict(n_msgs=len(M), n_calls=len(calls), n_updates=len(updates), orphan_updates=orphan,
               digests=len(digests), other=len(other)), open(out + '.meta.json', 'w'))
with open(out + '.other.txt', 'w') as f:
    for o in other: f.write(repr(o) + '\n')
print(len(calls), len(updates), orphan, len(digests), len(other))
