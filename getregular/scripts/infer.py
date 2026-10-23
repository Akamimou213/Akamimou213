import json,sys,re,csv,collections
from urllib.parse import urlparse
data={r['domain']:r['urls'] for r in json.load(open(sys.argv[1]))}
NAME={'nervaibs.com':'nervahealth.com'}
SKIP_PREFIX=('/au/','/eu/','/clinician-directory','/es/','/fr/','/ja/','/ko/','/zh/','/nl/','/de','/it/','/en-gb','/en-ie','/en-au','/en-nz','/en-us','/nl','/privacy','/terms','/legal','/cookie','/author','/category','/blog/topic','/poopcheck-blog/category','/dwqa-answer','/events','/online-training')
JUNK={'html','the','a','an','and','of','to','for','in','your','you','what','it','is','are','do','does','with','on','my','why','how','when','its','that','this','can','we','from','or','about','all','need','know','everything','complete','guide','ultimate','explained','means','mean','actually','really','says','science','research','evidence','behind','understanding','2019','2020','2021','2022','2023','2024','2025','2026','2027','new','post','blog','article','learn','en','2','which','here','s','t','one','makes','sense','work','works','tell','trying','should','worry','1','3','10','15','20','7','5'}
CL=[ # (cluster, regex) order matters
 ('App comparisons, alternatives & best-app listicles', r'/compare/|alternative-to|alternatives|best-.*(apps|trackers|therapeutics)|(nerva|zoe|daily30|monash)-[a-z-]*vs|vs-(the-calm|curable|cronometer|myfitnesspal|others)|app-vs'),
 ('Tools / calculators / quizzes', r'\b(quiz|checker|calculator|tool|tools|test-do-i-need|demo)\b'),
 ('Stool: Bristol scale', r'bristol'),
 ('Stool: color', r'(color|colour|green|black|yellow|orange|red|pale|white|clay)[-/].*(stool|poop|poo)|(stool|poop)-colou?r|baby-poop'),
 ('Stool: form/smell/mucus/float etc.', r'(floating|float|mucus|undigested|pencil|sticky|smell|stool|poop|bowel-movement|incomplete|morning-poop|perfect-stool|pooping|poops|period-poops)'),
 ('Constipation', r'constipat|prune|psyllium|laxative|fiber-supplement|haven-t-pooped'),
 ('Diarrhea', r'diarrh'),
 ('Bloating & gas', r'bloat|gas\b|gassy|burp|fart'),
 ('IBS', r'\bibs\b|irritable|reizdarm|spastic-colon|visceral'),
 ('FODMAP & elimination diets', r'fodmap|elimination'),
 ('Other GI conditions (SIBO, IBD, celiac, GERD, gastritis)', r'sibo|ibd|crohn|colitis|celiac|coeliac|gerd|reflux|gastritis|dyspepsia|heartburn|calprotectin|lactoferrin|colon-cancer|colorectal|leaky-gut|histamine|lactose|sorbitol|intoleran|omeprazole|pantoprazole|nexium|humira|colonoscopy|roemheld|rumination|diverticul|hemorrhoid'),
 ('GLP-1 / medications & gut', r'glp|ozempic|semaglutide|wegovy|medication|antibiotic'),
 ('Microbiome, probiotics & supplements', r'microbio|probiotic|prebiotic|postbiotic|ferment|kefir|kombucha|akkermansia|butyrate|supplement|magnesium|enzyme|colostrum|bacteria|flora'),
 ('Gut-brain, stress & sleep', r'gut-brain|brain|stress|anxiety|sleep|vagus|hypno|cbt|mind|mood|nervous|depress|polyvagal'),
 ('Women\'s gut health / life stages', r'women|menopause|period|pregnan|hormone|perimenopause|endometriosis'),
 ('Food & nutrition for gut health', r'food|diet|eat|fiber|fibre|recipe|coffee|alcohol|sugar|sweetener|protein|vinegar|yogurt|banana|turmeric|ginger|flaxseed|hydration|water|mediterranean|snack|meal|nutrition|ultra-processed|polyphenol|plant'),
 ('Gut health general', r'gut-health|gut|digest|motility|transit'),
]
def infer(path):
    segs=[s for s in path.strip('/').split('/') if s]
    slug=segs[-1] if segs else ''
    slug=re.sub(r'\.html?$','',slug)
    words=[w for w in re.split(r'[-_]+',slug.lower()) if w and w not in JUNK and not re.fullmatch(r'\d+',w)]
    return ' '.join(words[:7])
def cluster(path):
    p=path.lower()
    for name,rx in CL:
        if re.search(rx,p): return name
    return None
def ptype(path):
    p=path.lower()
    if re.search(r'/compare/|alternatives|(nerva|zoe|daily30|monash)-[a-z-]*vs|vs-(the-calm|curable|cronometer|myfitnesspal|others)',p): return 'comparison (app vs app)'
    if re.search(r'-vs-|versus',p): return 'X vs Y explainer'
    if re.search(r'best-.*(app|tracker|therapeutic)',p): return 'listicle (best apps)'
    if re.search(r'/tools?/|quiz|checker|demo',p): return 'tool'
    if re.search(r'/bristol/type|/locations/|/clinician-directory/|/recipe/',p): return 'programmatic'
    if re.search(r'/features?/|/programs?/|pricing|download|/business',p): return 'product/feature'
    if re.search(r'chart|list|guide|knowledge-base|/guides/',p): return 'hub/reference'
    if re.search(r'changelog',p): return 'changelog'
    if re.search(r'^/(blog|post|article|learn|poopcheck-blog|en/blog)/',p): return 'article'
    return 'page'
def intent(path,kw):
    p=path.lower()
    if re.search(r'compare|-vs-|alternative|best-|apps?\b',p): return 'commercial'
    if re.search(r'pricing|download|get-started|buy',p): return 'transactional'
    return 'informational'
rows=[]
for dom,urls in data.items():
    for u in urls:
        path=urlparse(u).path or '/'
        if path.startswith(SKIP_PREFIX) and not path.startswith('/en/'): continue
        if dom=='cara.care' and not path.startswith('/en/'): continue
        if dom=='monashfodmap.com' and path.startswith('/recipe/'): 
            rows.append([NAME.get(dom,dom),u,infer(path),'FODMAP & elimination diets','programmatic','informational']); continue
        kw=infer(path); c=cluster(path)
        if dom=='zoe.com' and path.startswith('/learn/') and c in (None,'Food & nutrition for gut health') and not re.search(r'gut|digest|fib|ferment|bloat|poop|stool|ibs|microbio',path): c='(general nutrition — not gut)'
        rows.append([NAME.get(dom,dom),u,kw,c or '(brand/other)',ptype(path),intent(path,kw)])
with open(sys.argv[2],'w',newline='') as f:
    w=csv.writer(f); w.writerow(['domain','url','inferred_keyword','topic_cluster','page_type','intent']); w.writerows(rows)
# matrix
doms=[NAME.get(d,d) for d in data if data[d]]
clusters=[c for c,_ in CL]+['(general nutrition — not gut)','(brand/other)']
m=collections.defaultdict(collections.Counter)
for r in rows: m[r[3]][r[0]]+=1
print('cluster|'+'|'.join(doms))
for c in clusters: print(c+'|'+'|'.join(str(m[c][d]) for d in doms))
pt=collections.defaultdict(collections.Counter)
for r in rows: pt[r[4]][r[0]]+=1
print('\npage_type|'+'|'.join(doms))
for t in sorted(pt): print(t+'|'+'|'.join(str(pt[t][d]) for d in doms))
