import json,sys,collections,re
from urllib.parse import urljoin,urlparse
R=json.load(open(sys.argv[1])); B='https://www.getregular.com'
sm={r['url'].rstrip('/') for r in R}
inl=collections.Counter(); internal=set(); ext=collections.Counter(); blanks=collections.Counter(); targets=collections.Counter()
for r in R:
    seen=set()
    for h,t,tg,rel in r['links']:
        if not h: continue
        u=urljoin(r['url'],h); p=urlparse(u)
        if p.scheme not in('http','https'): ext[p.scheme+':'+h[:60]]+=1; continue
        if p.netloc in('www.getregular.com','getregular.com'):
            v=(B+p.path).rstrip('/') or B
            if p.netloc=='getregular.com': print('APEX LINK',r['url'],h)
            internal.add(v)
            if v not in seen and v!=r['url'].rstrip('/'): inl[v]+=1; seen.add(v)
            if tg=='_blank': blanks[p.path]+=1
            if p.query: targets['query:'+h]+=1
        else:
            ext[p.netloc+p.path[:70]]+=1
print('internal targets not in sitemap:'); [print(' ',u) for u in sorted(internal-sm)]
print('sitemap pages w/ <=2 inbound:'); [print(' ',inl[u],u) for u in sorted(sm,key=lambda u:inl[u]) if inl[u]<=2]
print('inbound distribution:',sorted(collections.Counter(min(inl[u]//5*5,50) for u in sm).items()))
print('target=_blank internal:',blanks.most_common(5))
print('query links',targets.most_common(5))
print('top external:'); [print(' ',c,k) for k,c in ext.most_common(40)]
