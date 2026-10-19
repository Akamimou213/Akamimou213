import sys, json, re
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.title=''; s.in_title=False; s.metas=[]; s.links=[]; s.a=[]; s.cur_a=None; s.heads=[]; s.cur_h=None; s.imgs=[]; s.scripts=[]; s.cur_script=None; s.text=[]; s.skip=0; s.html_attrs={}; s.jsonld=[]
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=='html': s.html_attrs=a
        if t=='title': s.in_title=True
        if t=='meta': s.metas.append(a)
        if t=='link': s.links.append(a)
        if t=='a': s.cur_a={'attrs':a,'text':''}
        if t in('h1','h2','h3','h4'): s.cur_h=[t,'']
        if t in ('img','source'): s.imgs.append((t,a))
        if t=='script':
            s.cur_script={'attrs':a,'body':''}; s.skip+=1
        if t in('style','noscript'): s.skip+=1
    def handle_endtag(s,t):
        if t=='title': s.in_title=False
        if t=='a' and s.cur_a: s.a.append(s.cur_a); s.cur_a=None
        if t in('h1','h2','h3','h4') and s.cur_h: s.heads.append((s.cur_h[0],re.sub(r'\s+',' ',s.cur_h[1]).strip())); s.cur_h=None
        if t=='script' and s.cur_script is not None:
            s.scripts.append(s.cur_script); s.cur_script=None; s.skip-=1
        if t in('style','noscript'): s.skip-=1
    def handle_data(s,d):
        if s.in_title: s.title+=d
        if s.cur_script is not None: s.cur_script['body']+=d; return
        if s.skip: return
        if s.cur_a: s.cur_a['text']+=d
        if s.cur_h: s.cur_h[1]+=d+' '
        s.text.append(d)
html=open(sys.argv[1],encoding='utf-8',errors='replace').read()
p=P(); p.feed(html)
words=len(re.findall(r"[A-Za-z0-9'’]+",' '.join(p.text)))
out={'bytes':len(html),'lang':p.html_attrs.get('lang'),'title':p.title.strip(),
'meta':[m for m in p.metas if 'name' in m or 'property' in m],
'canonical':[l.get('href') for l in p.links if 'canonical' in (l.get('rel') or '')],
'alternate':[l for l in p.links if 'alternate' in (l.get('rel') or '')],
'icons':[l for l in p.links if 'icon' in (l.get('rel') or '')],
'preloads':[l for l in p.links if (l.get('rel') or '') in('preload','modulepreload','stylesheet')],
'headings':p.heads,
'links':[{'href':x['attrs'].get('href'),'text':re.sub(r'\s+',' ',x['text']).strip()[:80],'rel':x['attrs'].get('rel'),'target':x['attrs'].get('target'),'aria':x['attrs'].get('aria-label')} for x in p.a],
'imgs':[{'tag':t,**{k:v for k,v in a.items() if k in('src','alt','width','height','loading','fetchpriority','srcset','decoding','type','sizes')}} for t,a in p.imgs],
'scripts_ext':[s['attrs'].get('src') for s in p.scripts if s['attrs'].get('src')],
'jsonld':[s['body'] for s in p.scripts if s['attrs'].get('type')=='application/ld+json'],
'inline_script_bytes':sum(len(s['body']) for s in p.scripts if not s['attrs'].get('src')),
'word_count':words,
'text_sample':re.sub(r'\s+',' ',' '.join(p.text))[:20000]}
json.dump(out,sys.stdout,indent=1,ensure_ascii=False)
