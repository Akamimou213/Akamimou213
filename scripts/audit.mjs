// Scores the built landing page against the goal in GOAL.md and prints one PASS/FAIL line per check.
// Usage: npm run audit            (builds, serves dist/ on a local port, audits, exits 1 if any check fails)
//        npm run audit -- --json  (also writes audit/report.json)
// Screenshots land in audit/shots/. Needs Chromium: set CHROME_PATH, or it uses Playwright's.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const require = createRequire(import.meta.url);
const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'audit');
const SHOTS = join(OUT, 'shots');
const CHROME = process.env.CHROME_PATH
  ?? ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync)
  ?? chromium.executablePath();

// ─── Targets. Change these only on purpose: they are the definition of "done". ───
const T = {
  lighthouse: { mobile: { performance: 90, accessibility: 100, 'best-practices': 100, seo: 100 },
                desktop: { performance: 95, accessibility: 100, 'best-practices': 100, seo: 100 } },
  lcpMs: 2500, cls: 0.1, tbtMs: 200,
  heroCtaFoldPx: 844,          // primary CTA fully visible without scrolling on a 390×844 phone
  tapPx: 44,                   // minimum tap target on mobile
  viewports: [360, 390, 768, 1024, 1440],
};

const results = [];
const check = (id, pass, detail) => results.push({ id, pass: Boolean(pass), detail });

// ─── Build + static server ───
function run(cmd, args) {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
    p.on('exit', (c) => (c === 0 ? ok() : fail(new Error(`${cmd} ${args.join(' ')} exited ${c}`))));
  });
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2',
  '.webp': 'image/webp', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml' };
function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(dir, path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      const long = path.startsWith('/assets/');
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
        'cache-control': long ? 'public, max-age=31536000, immutable' : 'no-cache' });
      res.end(body);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// ─── Lighthouse ───
async function runLighthouse(url, formFactor) {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const desktop = formFactor === 'desktop';
    const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' }, {
      extends: 'lighthouse:default',
      settings: desktop
        ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
            throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
        : { formFactor: 'mobile' },
    });
    return lhr;
  } finally { await chrome.kill(); }
}

const revealAll = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 1500));
});

// ─── Page checks (Playwright) ───
async function pageChecks(browser, url) {
  const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
  mkdirSync(SHOTS, { recursive: true });

  for (const width of T.viewports) {
    const height = width <= 400 ? 844 : 900;
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 800, isMobile: width < 800 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // hero intro timeline
    await page.screenshot({ path: join(SHOTS, `fold-${width}.png`) });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no-horizontal-scroll@${width}`, overflow <= 0, overflow > 0 ? `page is ${overflow}px wider than viewport` : 'ok');

    // Primary CTA must be on screen at first paint of the hero.
    const cta = await page.evaluate(() => {
      const a = document.querySelector('.hero__ctas a');
      if (!a) return null;
      const r = a.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), visible: r.bottom <= window.innerHeight && r.top >= 0 };
    });
    if (width === 390) check('hero-cta-above-fold@390', cta?.visible, cta ? `CTA bottom at ${cta.bottom}px of ${height}px` : 'no hero CTA');
    if (width === 1440) check('hero-cta-above-fold@1440', cta?.visible, cta ? `CTA bottom at ${cta.bottom}px of ${height}px` : 'no hero CTA');

    if (width === 390) {
      // Booking CTA reachable at every scroll depth on mobile (sticky bar or nav button).
      const reach = await page.evaluate(async () => {
        const misses = [];
        const max = document.documentElement.scrollHeight - innerHeight;
        for (let y = 0; y <= max; y += Math.round(max / 12)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 650));
          const visible = [...document.querySelectorAll('a[href*="calendly.com"]')].some((a) => {
            const r = a.getBoundingClientRect();
            const s = getComputedStyle(a);
            return r.width > 0 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && Number(s.opacity) > 0.5;
          });
          if (!visible) misses.push(y);
        }
        window.scrollTo(0, 0);
        return { misses, steps: 13 };
      });
      check('booking-cta-always-reachable@390', reach.misses.length === 0,
        reach.misses.length ? `no booking link on screen at scrollY ${reach.misses.join(', ')}` : 'ok at all 13 depths');

      // Tap targets
      const small = await page.evaluate((min) => [...document.querySelectorAll('a, button, summary')]
        .filter((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
          return r.width > 0 && s.visibility !== 'hidden' && !el.closest('[hidden]') && (r.height < min && r.width < min * 4) && !el.classList.contains('skip'); })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className || ''} "${el.textContent.trim().slice(0, 24)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`), T.tapPx);
      check('tap-targets-44px@390', small.length === 0, small.length ? small.slice(0, 6).join(' | ') : 'ok');

      // Full-page screenshot for the reviewer
      await revealAll(page);
      await page.screenshot({ path: join(SHOTS, 'full-390.png'), fullPage: true });
    }

    if (width === 1440) {
      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(async () => {
        // Reveal everything so axe sees final colours, not mid-animation opacity.
        document.querySelectorAll('[hidden]').forEach((el) => el.removeAttribute('hidden'));
        const r = await window.axe.run(document, { resultTypes: ['violations'] });
        return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
      });
      check('axe-zero-violations@1440', axe.length === 0, axe.length ? axe.join(' | ') : 'ok');
      await revealAll(page);
      await page.screenshot({ path: join(SHOTS, 'full-1440.png'), fullPage: true });
    }

    check(`console-clean@${width}`, errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : 'ok');
    await ctx.close();
  }

  // Reduced motion: every section's content must be visible without animation.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const invisible = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main p, main a.btn')]
    .filter((el) => !el.closest('[hidden]') && Number(getComputedStyle(el).opacity) < 0.99).map((el) => el.textContent.trim().slice(0, 30)));
  check('reduced-motion-content-visible', invisible.length === 0, invisible.length ? invisible.slice(0, 5).join(' | ') : 'ok');
  await ctx.close();
}

// ─── Content / SEO integrity (reads the built HTML, no browser) ───
async function contentChecks() {
  const html = await readFile(join(ROOT, 'dist/index.html'), 'utf8');
  const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  const h1 = html.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
  check('single-h1', h1.length === 1, `${h1.length} h1`);

  const title = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  check('title-length', title.length >= 30 && title.length <= 65, `${title.length} chars: "${title}"`);
  const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
  check('meta-description-length', desc.length >= 120 && desc.length <= 160, `${desc.length} chars`);

  // Visible FAQ and FAQPage JSON-LD must say the same thing (Google requires schema to match visible content).
  const visible = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [text(m[1]), text(m[2])]);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = ld.find((j) => j['@type'] === 'FAQPage');
  const qs = faq?.mainEntity ?? [];
  const mismatched = qs.filter((q) => { const v = visible.find(([s]) => s === q.name); return !v || v[1] !== q.acceptedAnswer.text; }).map((q) => q.name);
  check('faq-schema-matches-visible', faq && qs.length === visible.length && mismatched.length === 0,
    `${qs.length} in schema vs ${visible.length} visible${mismatched.length ? `; differs: ${mismatched.join(' | ')}` : ''}`);

  // Every external link opened in a new tab carries rel=noopener.
  const blank = [...html.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].filter((m) => !/rel="[^"]*noopener/.test(m[0]));
  check('external-links-noopener', blank.length === 0, `${blank.length} missing`);

  // In-page anchors resolve.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const broken = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id));
  check('anchors-resolve', broken.length === 0, broken.length ? broken.join(', ') : 'ok');

  // Booking links: one URL everywhere, with UTM-free consistency, and a contact fallback that is a real link.
  const cal = new Set([...html.matchAll(/href="(https:\/\/calendly\.com[^"]*)"/g)].map((m) => m[1].split('?')[0]));
  check('one-booking-url', cal.size === 1, [...cal].join(', '));
  check('email-is-mailto', /href="mailto:[^"]+"/.test(html), 'contact email should be a mailto: link');

  // Every result chip/tag states how it was measured.
  const caseCards = html.match(/<article class="case"[\s\S]*?<\/article>/g) ?? [];
  const unlabelled = caseCards.filter((c) => !/class="chip[^"]*"/.test(c)).length;
  check('results-labelled-by-source', unlabelled === 0, `${unlabelled} result cards without a measurement label`);
}

// ─── Main ───
const json = process.argv.includes('--json');
mkdirSync(OUT, { recursive: true });
if (!process.argv.includes('--no-build')) await run('npm', ['run', 'build']);
const server = await serve(join(ROOT, 'dist'));
const url = `http://127.0.0.1:${server.address().port}/`;

try {
  await contentChecks();
  const browser = await chromium.launch({ executablePath: CHROME });
  try { await pageChecks(browser, url); } finally { await browser.close(); }

  for (const ff of ['mobile', 'desktop']) {
    const lhr = await runLighthouse(url, ff);
    writeFileSync(join(OUT, `lighthouse-${ff}.json`), JSON.stringify(lhr));
    for (const [cat, min] of Object.entries(T.lighthouse[ff])) {
      const score = Math.round(lhr.categories[cat].score * 100);
      const failing = score < min ? Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable'
          && lhr.categories[cat].auditRefs.some((r) => r.id === a.id && r.weight > 0))
        .map((a) => a.id).slice(0, 6).join(', ') : '';
      check(`lighthouse-${ff}-${cat}>=${min}`, score >= min, `${score}${failing ? ` · failing: ${failing}` : ''}`);
    }
    if (ff === 'mobile') {
      const lcp = lhr.audits['largest-contentful-paint'].numericValue;
      const cls = lhr.audits['cumulative-layout-shift'].numericValue;
      const tbt = lhr.audits['total-blocking-time'].numericValue;
      check(`mobile-LCP<=${T.lcpMs}ms`, lcp <= T.lcpMs, `${Math.round(lcp)}ms`);
      check(`mobile-CLS<=${T.cls}`, cls <= T.cls, cls.toFixed(3));
      check(`mobile-TBT<=${T.tbtMs}ms`, tbt <= T.tbtMs, `${Math.round(tbt)}ms`);
    }
  }
} finally { server.close(); }

const passed = results.filter((r) => r.pass).length;
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id.padEnd(40)} ${r.detail}`);
console.log(`\nSCORE ${passed}/${results.length} checks passing${passed === results.length ? ' — GOAL MET' : ''}`);
if (json) writeFileSync(join(OUT, 'report.json'), JSON.stringify({ passed, total: results.length, results }, null, 2));
process.exit(passed === results.length ? 0 : 1);
