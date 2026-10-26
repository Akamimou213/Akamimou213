import json,sys,collections,re
R=json.load(open(sys.argv[1])); B='https://www.getregular.com'
P=lambda u:u[len(B):] or '/'
print('== title/desc lengths & dups')
tc=collections.Counter(r['title'] for r in R); dc=collections.Counter(r['desc'] for r in R)
for r in R:
    t=r['title'];d=r['desc'] or ''
    flags=[]
    if len(t)>60: flags.append(f'title{len(t)}')
    if len(t)<25: flags.append(f'titleShort{len(t)}')
    if not d: flags.append('NODESC')
    elif len(d)>160: flags.append(f'desc{len(d)}')
    elif len(d)<70: flags.append(f'descShort{len(d)}')
    if tc[t]>1: flags.append('DUPTITLE')
    if d and dc[d]>1: flags.append('DUPDESC')
    if r['robots']: flags.append('robots='+r['robots'])
    if r['xrobots']: flags.append('xrobots='+r['xrobots'])
    if not r['og_title'] or r['og_title']==R[0]['og_title'] and r is not R[0]: flags.append('OG_INHERIT' if r['og_title'] else 'NO_OG')
    if not r['og_url']: flags.append('no_og_url')
    if r['hidden_inline']: flags.append(f'opacity0x{r["hidden_inline"]}')
    if flags: print(P(r['url']),flags)
print('== title length dist', collections.Counter(min(len(r['title'])//10*10,90) for r in R))
print('== sample titles'); [print(' ',len(r['title']),r['title'],'|',(r['desc'] or '')[:100]) for r in R[:30]]
print('== og images', collections.Counter(r['og_image'] for r in R).most_common(8))
print('== itunes', collections.Counter(r['itunes'] for r in R))
print('== tw card', collections.Counter(r['tw_card'] for r in R))
print('== ld types by section')
sec=collections.defaultdict(collections.Counter)
for r in R:
    s='/'.join(P(r['url']).split('/')[:2]) + ('/*' if P(r['url']).count('/')>2 else '')
    sec[s][tuple(sorted(set(r['ld_types'])))]+=1
    if r['ld_err']: print('LD PARSE ERR',P(r['url']))
for s,c in sec.items(): print(s,dict(c))
