#!/usr/bin/env python3
"""Pull Apple's own keyword data for Get Regular from the Apple Ads Platform API (v1).

What it writes (CSV, into --out):
  phrase_popularity.csv     Apple popularity (0-100) for every keyword + competitor name we care about.
                            Uses POST /v1/suggestions/phrases/query, queryType=SEARCH (no bidding needed).
  phrase_suggestions.csv    Phrases Apple itself suggests for the Get Regular app (queryType=SUGGESTION).
  genre_popularity.csv      Top Health & Fitness search terms in the US containing our seed words
                            (POST /v1/insights/apps/search-term-popularity/query), with rank in genre.
  search_terms.csv          What people actually typed when your ads showed, with taps/installs/spend,
                            for every campaign, last 90 days (POST /v1/reports/apps/searchterms/query).
  impression_share.csv      Your share of impressions per search term + Apple's 1-5 popularity
                            (POST /v1/insights/apps/impression-share/query), last 4 full weeks.

Setup (once, ~10 minutes; see Apple's "Implementing OAuth for the Apple Ads Platform API"):
  1. Apple Ads > Account Settings > User Management: invite yourself with an API role.
  2. openssl ecparam -genkey -name prime256v1 -noout -out private-key.pem
     openssl ec -in private-key.pem -pubout -out public-key.pem
  3. Apple Ads > Account Settings > API: paste public-key.pem, save, copy clientId / teamId / keyId.
  4. pip install pyjwt cryptography
  5. export AA_CLIENT_ID=SEARCHADS.xxx AA_TEAM_ID=SEARCHADS.xxx AA_KEY_ID=xxx \
            AA_PRIVATE_KEY=private-key.pem AA_AD_ACCOUNT_ID=<your ad account id>
     python3 apple_ads_research.py --out apple-ads-data

  --dry-run prints the request bodies without calling Apple (no credentials needed).
"""
import argparse, csv, datetime as dt, json, os, sys, time, urllib.error, urllib.parse, urllib.request

API = 'https://api.ads.apple.com/v1'
APP_ID = '6749188690'  # Get Regular

# Keywords from getregular/apple-ads/keyword-universe.csv plus competitor brand names.
KEYWORDS = [
    'poop tracker', 'poop tracker free', 'poop log', 'poop diary', 'poop journal', 'poop calendar',
    'poop and pee tracker', 'poo tracker', 'poo diary', 'stool tracker', 'stool diary', 'bowel movement tracker',
    'bowel tracker', 'bowel diary', 'track bowel movement', 'bristol stool chart', 'bristol stool scale',
    'poop scanner', 'poop scan', 'poop analyzer', 'poop check', 'stool checker', 'stool analysis', 'stool scan',
    'ai poop tracker', 'poop counter', 'poop app', 'ibs tracker', 'ibs app', 'ibs food tracker', 'ibs log',
    'ibs diary', 'ibs symptom tracker', 'food diary ibs', 'bloating', 'bloat tracker', 'bloating tracker',
    'constipation', 'constipation tracker', 'constipation diary', 'gut health', 'gut health tracker',
    'gut health app', 'gut tracker', 'digestive tracker', 'digestion tracker', 'food symptom tracker',
    'food sensitivity tracker', 'food intolerance tracker', 'fodmap tracker', 'fiber tracker', 'fiber counter',
    'symptom tracker', 'food diary', 'fodmap', 'low fodmap', 'ibd tracker', 'sibo', 'gerd tracker',
]
COMPETITORS = [
    'poop map', 'happy poop', 'nerva', 'nerva app', 'monash fodmap', 'monash', 'cara care', 'mysymptoms',
    'bowelle', 'plop', 'plop poop tracker', 'balloon poop tracker', 'poopcheck', 'flush poop', 'poopid',
    'zoe health', 'zoe app', 'fig app', 'fig food scanner', 'flarecare', 'unbloated', 'gutly', 'dieta',
    'poop analyzer', 'pcal', 'poopie', 'colonbroom', 'bearable', 'fast fodmap', 'get regular', 'getregular',
]
SEEDS = ['poop', 'stool', 'bowel', 'gut', 'ibs', 'bloat', 'constipation', 'digest', 'fodmap', 'fiber', 'symptom']


def client_secret():
    import jwt  # PyJWT
    now = int(time.time())
    key = open(os.environ['AA_PRIVATE_KEY']).read()
    return jwt.encode(
        {'sub': os.environ['AA_CLIENT_ID'], 'aud': 'https://appleid.apple.com', 'iat': now,
         'exp': now + 86400 * 180, 'iss': os.environ['AA_TEAM_ID']},
        key, algorithm='ES256', headers={'kid': os.environ['AA_KEY_ID']})


def access_token():
    q = urllib.parse.urlencode({'grant_type': 'client_credentials', 'client_id': os.environ['AA_CLIENT_ID'],
                                'client_secret': client_secret(), 'scope': 'searchadsorg'})
    req = urllib.request.Request('https://appleid.apple.com/auth/oauth2/token?' + q, method='POST',
                                 headers={'Content-Type': 'application/x-www-form-urlencoded'})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())['access_token']


class Api:
    def __init__(self, dry):
        self.dry = dry
        self.token = None if dry else access_token()

    def post(self, path, body):
        if self.dry:
            print(f'\nPOST {API}{path}\n{json.dumps(body, indent=1)}')
            return {'result': []}
        req = urllib.request.Request(API + path, data=json.dumps(body).encode(), method='POST', headers={
            'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json',
            'X-AP-Context': f"adAccountId={os.environ['AA_AD_ACCOUNT_ID']}"})
        for attempt in range(4):
            try:
                return json.loads(urllib.request.urlopen(req, timeout=60).read())
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < 3:
                    time.sleep(5 * (attempt + 1))
                    continue
                print(f'! {path} -> HTTP {e.code}: {e.read().decode(errors="ignore")[:600]}', file=sys.stderr)
                return {'result': []}

    def paged(self, path, body, page=1000):
        rows, offset = [], 0
        while True:
            body['pagination'] = {'offset': offset, 'pageSize': page}
            res = self.post(path, body).get('result', [])
            # list endpoints return a list; some insights endpoints wrap rows in an object
            if isinstance(res, dict):
                res = res.get('rows') or res.get('data') or res.get('result') or []
            rows += res
            if self.dry or len(res) < page:
                return rows
            offset += page


def f(field, op, value):
    return {'field': field, 'operator': op, 'value': value if isinstance(value, list) else [value]}


def write(path, rows):
    if not rows:
        print(f'  {os.path.basename(path)}: no rows')
        return
    flat = []
    for r in rows:  # flatten one level of nested objects (e.g. keyword / metrics)
        o = {}
        for k, v in r.items():
            if isinstance(v, dict):
                o.update({f'{k}.{kk}': vv for kk, vv in v.items() if not isinstance(vv, (dict, list))})
            elif not isinstance(v, list):
                o[k] = v
        flat.append(o)
    cols = sorted({k for o in flat for k in o})
    with open(path, 'w', newline='') as fh:
        w = csv.DictWriter(fh, cols)
        w.writeheader()
        w.writerows(flat)
    print(f'  {os.path.basename(path)}: {len(flat)} rows')


def last_sunday(d):
    return d - dt.timedelta(days=(d.weekday() + 1) % 7)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='apple-ads-data')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    api = Api(a.dry_run)
    today = dt.date.today()

    # 1. Apple popularity (0-100) for specific phrases: keywords + competitor names. No bidding needed.
    pop = []
    terms = sorted(set(KEYWORDS + COMPETITORS))
    for i in range(0, len(terms), 50):
        pop += api.paged('/suggestions/phrases/query', {'filters': [
            f('queryType', 'EQUALS', 'SEARCH'), f('phrase', 'IN', terms[i:i + 50])]}, page=100)
    write(os.path.join(a.out, 'phrase_popularity.csv'), pop)

    # 2. Phrases Apple suggests for Get Regular itself.
    write(os.path.join(a.out, 'phrase_suggestions.csv'), api.paged('/suggestions/phrases/query', {'filters': [
        f('queryType', 'EQUALS', 'SUGGESTION'), f('promotedObjectId', 'EQUALS', APP_ID),
        f('promotedObjectType', 'EQUALS', 'APPSTORE_APP')],
        'sorting': [{'field': 'popularity', 'order': 'DESC'}]}, page=100))

    # 3. Top Health & Fitness search terms (US) containing our seed words, last full month.
    first = today.replace(day=1)
    prev_month = (first - dt.timedelta(days=1)).replace(day=1)
    genre = []
    for seed in SEEDS:
        genre += api.paged('/insights/apps/search-term-popularity/query', {
            'timeRange': {'start': prev_month.isoformat(), 'end': (first - dt.timedelta(days=1)).isoformat(),
                          'timeZone': 'UTC', 'granularity': 'MONTHLY'},
            'filters': [f('countryOrRegion', 'EQUALS', 'US'), f('genre', 'EQUALS', 'HEALTH_FITNESS'),
                        f('searchTerm', 'CONTAINS', seed)],
            'fields': ['rankInGenre', 'searchPopularityInGenre', 'searchPopularity1to100', 'searchPopularity1to5'],
        })
    write(os.path.join(a.out, 'genre_popularity.csv'), genre)

    # 4. Search terms report for every campaign, last 90 days.
    camps = api.paged('/campaigns/query', {'filters': []}, page=1000)
    st = []
    for c in camps:
        rows = api.paged('/reports/apps/searchterms/query', {
            'timeRange': {'start': (today - dt.timedelta(days=89)).isoformat(), 'end': today.isoformat(),
                          'timeZone': 'ORTZ'},
            'filters': [f('campaignId', 'EQUALS', c.get('id'))],
        }, page=1000)
        for r in rows:
            r['campaignName'] = c.get('name')
        st += rows
    write(os.path.join(a.out, 'search_terms.csv'), st)

    # 5. Impression share + Apple 1-5 popularity per search term, last 4 full Sunday-Saturday weeks.
    end = last_sunday(today) - dt.timedelta(days=1)
    write(os.path.join(a.out, 'impression_share.csv'), api.paged('/insights/apps/impression-share/query', {
        'timeRange': {'start': (end - dt.timedelta(days=27)).isoformat(), 'end': end.isoformat(),
                      'timeZone': 'UTC', 'granularity': 'WEEKLY_SUN_SAT'},
        'filters': [f('promotedObjectId', 'IN', APP_ID), f('countryOrRegion', 'EQUALS', 'US')],
        'options': {'impressionShareReportType': 'ALL_SLOTS'},
    }))


if __name__ == '__main__':
    main()
