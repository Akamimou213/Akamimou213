import sys, json, re, os, hashlib, subprocess, concurrent.futures as cf
from html.parser import HTMLParser
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
out=sys.argv[1]; urls=[u.strip() for u in open(sys.argv[2]) if u.strip()]
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.title='';s.it=False;s.metas=[];s.links=[];s.a=[];s.ca=None;s.h=[];s.ch=None;s.imgs=[];s.ld=[];s.cs=None;s.skip=0;s.text=[];s.lang=None;s.styles_hidden=0
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=='html': s.lang=a.get('lang')
        if t=='title': s.it=True
        if t=='meta': s.metas.append(a)
        if t=='link': s.links.append(a)
        if t=='a': s.ca={'href':a.get('href'),'t':'','target':a.get('target'),'rel':a.get('rel')}
        if t in('h1','h2','h3'): s.ch=[t,'']
        if t=='img': s.imgs.append(a)
        if 'style' in a and a['style'] and re.search(r'opacity:\s*0(?![.\d])',a['style']): s.styles_hidden+=1
        if t=='script': s.cs={'type':a.get('type'),'b':''}; s.skip+=1
        if t in('style','noscript'): s.skip+=1
    def handle_endtag(s,t):
        if t=='title': s.it=False
        if t=='a' and s.ca: s.a.append(s.ca); s.ca=None
        if t in('h1','h2','h3') and s.ch: s.h.append((s.ch[0],re.sub(r'\s+',' ',s.ch[1]).strip())); s.ch=None
        if t=='script' and s.cs is not None:
            if s.cs['type']=='application/ld+json': s.ld.append(s.cs['b'])
            s.cs=None; s.skip-=1
        if t in('style','noscript'): s.skip-=1
    def handle_data(s,d):
        if s.it: s.title+=d
        if s.cs is not None: s.cs['b']+=d; return
        if s.skip: return
        if s.ca: s.ca['t']+=d
        if s.ch: s.ch[1]+=d+' '
        s.text.append(d)
def types(o,acc):
    if isinstance(o,dict):
        t=o.get('@type')
        if t: acc.extend(t if isinstance(t,list) else [t])
        for v in o.values(): types(v,acc)
    elif isinstance(o,list):
        for v in o: types(v,acc)
def get(u):
    r=subprocess.run(['curl','-sS','-A',UA,'-D','-','-o','/dev/stdout','-w','\n@@%{http_code} %{num_redirects} %{url_effective} %{time_total}',u],capture_output=True)
    raw=r.stdout.decode('utf-8','replace')
    head,_,rest=raw.partition('\r\n\r\n')
    while rest.startswith('HTTP/'): head,_,rest=rest.partition('\r\n\r\n')
    body,_,tail=rest.rpartition('\n@@')
    code,nr,eff,tt=tail.split()
    return int(code),head,body,eff,float(tt)
def one(u):
    code,head,body,eff,tt=get(u)
    p=P(); p.feed(body)
    m={(x.get('name') or x.get('property') or '').lower():x.get('content') for x in p.metas if x.get('name') or x.get('property')}
    ld=[];lderr=0;ldt=[]
    for b in p.ld:
        try: o=json.loads(b); ld.append(o); types(o,ldt)
        except Exception: lderr+=1
    text=re.sub(r'\s+',' ',' '.join(p.text))
    fn=re.sub(r'[^a-z0-9]+','_',u.split('.com',1)[1] or 'home').strip('_') or 'home'
    open(f'{out}/pages/{fn}.html','w').write(body)
    hdr={k.lower():v for k,v in (l.split(': ',1) for l in head.split('\r\n')[1:] if ': ' in l)}
    return {'url':u,'code':code,'eff':eff,'t':tt,'bytes':len(body),'xrobots':hdr.get('x-robots-tag'),'cache':hdr.get('x-vercel-cache'),'prerender':hdr.get('x-nextjs-prerender'),
     'title':p.title.strip(),'desc':m.get('description'),'robots':m.get('robots'),'canonical':[l.get('href') for l in p.links if l.get('rel')=='canonical'],
     'og_title':m.get('og:title'),'og_desc':m.get('og:description'),'og_url':m.get('og:url'),'og_image':m.get('og:image'),'og_type':m.get('og:type'),'tw_card':m.get('twitter:card'),
     'itunes':m.get('apple-itunes-app'),'h':p.h,'h1':[x[1] for x in p.h if x[0]=='h1'],'words':len(re.findall(r"[A-Za-z0-9'’]+",text)),
     'links':[(a['href'],re.sub(r'\s+',' ',a['t']).strip()[:60],a['target'],a['rel']) for a in p.a],'imgs':p.imgs,'ld_types':ldt,'ld_err':lderr,'ld':ld,'hidden_inline':p.styles_hidden,'lang':p.lang,'text':text[:60000]}
with cf.ThreadPoolExecutor(8) as ex: res=list(ex.map(one,urls))
json.dump(res,open(f'{out}/crawl.json','w'),indent=0,ensure_ascii=False)
for r in res: print(r['code'],r['bytes'],r['words'],len(r['h1']),'canon' if r['canonical'] else 'NOCANON',r['canonical'][0] if r['canonical'] else '','|',r['url'][len('https://www.getregular.com'):] or '/')
