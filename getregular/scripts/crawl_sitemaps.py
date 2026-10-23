import sys, re, gzip, json, urllib.request, ssl
from concurrent.futures import ThreadPoolExecutor
UA={'User-Agent':'Mozilla/5.0 (compatible; sitemap-audit)'}
def get(u):
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=25)
        b=r.read()
        if b[:2]==b'\x1f\x8b': b=gzip.decompress(b)
        return r.status,b.decode('utf-8','ignore')
    except Exception as e:
        return getattr(e,'code',0),''
def crawl(domain, seeds, cap=20000, maxmaps=80):
    seen=set(); urls=[]; queue=list(seeds); maps=0
    while queue and maps<maxmaps and len(urls)<cap:
        sm=queue.pop(0)
        if sm in seen: continue
        seen.add(sm); st,t=get(sm); maps+=1
        if not t or '<' not in t[:200]: continue
        locs=re.findall(r'<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</loc>',t,re.S)
        if '<sitemapindex' in t: queue+=locs
        else: urls+=locs
    return {'domain':domain,'sitemaps_read':maps,'urls':sorted(set(u.strip() for u in urls))}
if __name__=='__main__':
    cfg=json.load(open(sys.argv[1])); out=sys.argv[2]
    def job(d):
        seeds=cfg[d]
        for s in seeds:
            st,t=get(s)
            if t and ('<urlset' in t or '<sitemapindex' in t):
                return crawl(d,[s])
        return {'domain':d,'sitemaps_read':0,'urls':[]}
    with ThreadPoolExecutor(8) as ex: res=list(ex.map(job,cfg))
    json.dump(res,open(out,'w'),indent=0)
    for r in res: print(r['domain'],r['sitemaps_read'],len(r['urls']))
