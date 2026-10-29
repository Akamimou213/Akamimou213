#!/usr/bin/env python3
"""Add Get Regular's negative keywords to Apple Ads campaigns (Apple Ads Platform API v1, bulk-create).

Reads getregular/apple-ads/negative-keywords.csv (scope, text, matchType, reason) and adds each
negative at campaign level to the campaigns its scope covers:

  ALL             every campaign you pass
  NON_COMPETITOR  brand + category + discovery   (competitor campaign keeps "poop map", "cara care"...)
  NON_BRAND       category + competitor + discovery (brand terms only serve in the Brand campaign)
  DISCOVERY       discovery only (exact copies of your exact keywords, so Discovery finds new queries)

Credentials: the same AA_* environment variables as apple_ads_research.py.

  # 1. find your campaign ids
  python3 apply_negatives.py --list-campaigns

  # 2. preview what will be added (no changes)
  python3 apply_negatives.py --brand 111 --category 222 333 --competitor 444 --discovery 555

  # 3. apply
  python3 apply_negatives.py --brand 111 --category 222 333 --competitor 444 --discovery 555 --apply

Re-running is safe: duplicates come back as per-item errors and everything else is still created
(allowPartialSuccess). Negatives are text- and match-type immutable; delete and re-add to change one.
"""
import argparse, csv, json, os, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apple_ads_research import API, access_token  # noqa: E402

CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'apple-ads', 'negative-keywords.csv')
BATCH = 100


def call(token, path, body):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(), method='POST', headers={
        'Authorization': f'Bearer {token}', 'Content-Type': 'application/json',
        'X-AP-Context': f"adAccountId={os.environ['AA_AD_ACCOUNT_ID']}"})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=60).read())
    except urllib.error.HTTPError as e:
        sys.exit(f'{path} -> HTTP {e.code}: {e.read().decode(errors="ignore")[:800]}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--csv', default=CSV)
    ap.add_argument('--brand', nargs='*', type=int, default=[])
    ap.add_argument('--category', nargs='*', type=int, default=[], help='all non-brand, non-competitor search campaigns')
    ap.add_argument('--competitor', nargs='*', type=int, default=[])
    ap.add_argument('--discovery', nargs='*', type=int, default=[])
    ap.add_argument('--list-campaigns', action='store_true')
    ap.add_argument('--apply', action='store_true', help='without this flag nothing is sent')
    a = ap.parse_args()

    if a.list_campaigns:
        res = call(access_token(), '/campaigns/query', {'pagination': {'offset': 0, 'pageSize': 1000}})
        for c in res.get('result', []):
            print(f"{c.get('id')}\t{c.get('status')}\t{c.get('name')}")
        return

    scope_to = {
        'ALL': a.brand + a.category + a.competitor + a.discovery,
        'NON_COMPETITOR': a.brand + a.category + a.discovery,
        'NON_BRAND': a.category + a.competitor + a.discovery,
        'DISCOVERY': a.discovery,
    }
    if not scope_to['ALL']:
        sys.exit('Pass at least one campaign id (see --list-campaigns).')

    items = []
    for r in csv.DictReader(open(a.csv)):
        for cid in scope_to[r['scope']]:
            items.append({'correlationId': len(items), 'data': {
                'campaignId': cid, 'text': r['text'], 'matchType': r['matchType'], 'status': 'ENABLED'}})

    per_campaign = {}
    for it in items:
        per_campaign.setdefault(it['data']['campaignId'], []).append(it['data']['matchType'])
    for cid, m in per_campaign.items():
        print(f'campaign {cid}: {len(m)} negatives ({m.count("EXACT")} exact, {m.count("BROAD")} broad)')
    if not a.apply:
        print(f'\nPreview only. {len(items)} negatives total. Re-run with --apply to add them.')
        return

    token = access_token()
    ok = dup = failed = 0
    for i in range(0, len(items), BATCH):
        res = call(token, '/negative-keywords/bulk-create',
                   {'allowPartialSuccess': True, 'items': items[i:i + BATCH]})
        for r in res.get('result', []):
            if r.get('success'):
                ok += 1
            else:
                msg = json.dumps(r.get('error') or r.get('errors') or r)
                if 'DUPLICATE' in msg.upper() or 'ALREADY' in msg.upper():
                    dup += 1
                else:
                    failed += 1
                    d = items[r.get('correlationId', 0)]['data']
                    print(f"  ! {d['campaignId']} '{d['text']}' {d['matchType']}: {msg[:200]}")
    print(f'\nAdded {ok}, already existed {dup}, failed {failed}.')


if __name__ == '__main__':
    main()
