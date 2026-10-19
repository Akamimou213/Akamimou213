import json,sys
for f in sys.argv[1:]:
    d=json.load(open(f)); a=d['audits']
    print('=====',f.split('/')[-1], d['finalDisplayedUrl'], d['configSettings']['formFactor'], 'LH',d['lighthouseVersion'], 'warnings',d.get('runWarnings'))
    print(' scores', {k:round(v['score']*100) if v['score'] is not None else None for k,v in d['categories'].items()})
    for k in ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive','server-response-time','total-byte-weight','dom-size','bootup-time','mainthread-work-breakdown']:
        if k in a: print(f'  {k}: {a[k].get("displayValue")} score={a[k].get("score")}')
    el=a.get('largest-contentful-paint-element',{}).get('details',{})
    try:
        for it in el['items'][0]['items']: print('  LCP el:', it.get('node',{}).get('snippet','')[:200], it.get('node',{}).get('nodeLabel','')[:80])
        for it in el['items'][1]['items']: print('  LCP phase:', it)
    except Exception as e: print('  lcp el err',e)
    for k in ['render-blocking-resources','render-blocking-insight','unused-javascript','unused-css-rules','uses-responsive-images','modern-image-formats','uses-optimized-images','offscreen-images','efficient-animated-content','unsized-images','font-display','font-display-insight','legacy-javascript','legacy-javascript-insight','duplicated-javascript','uses-long-cache-ttl','cache-insight','image-delivery-insight','lcp-discovery-insight','network-dependency-tree-insight','third-party-summary','layout-shifts','cls-culprits-insight','long-tasks','prioritize-lcp-image','uses-text-compression','viewport','document-title','meta-description','is-crawlable','link-text','crawlable-anchors','robots-txt','canonical','hreflang','structured-data','image-alt','color-contrast','heading-order','label','link-name','button-name','tap-targets','target-size','errors-in-console','inspector-issues','valid-source-maps','csp-xss','has-hsts','origin-isolation','clickjacking-mitigation','identical-links-same-purpose','landmark-one-main','image-size-responsive','image-aspect-ratio']:
        if k not in a: continue
        x=a[k]; det=x.get('details') or {}
        items=det.get('items') or []
        print(f'  [{k}] score={x.get("score")} {x.get("displayValue","") or ""} {(x.get("title") or "")[:70]}')
        for it in items[:6]:
            if isinstance(it,dict):
                s={kk:(str(vv)[:110]) for kk,vv in it.items() if kk in('url','totalBytes','wastedBytes','wastedMs','transferSize','blockingTime','mainThreadTime','node','description','score','source','entity','cacheLifetimeMs','label','value')}
                if 'node' in it: s['node']=str(it['node'].get('snippet'))[:120]
                print('     ',s)
