import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import 'lenis/dist/lenis.css';
import './styles.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = () => window.matchMedia('(min-width: 1101px)').matches;

/* ───────────── Number formatting ───────────── */
function formatNum(el: HTMLElement, v: number) {
  const d = Number(el.dataset.decimals ?? 0);
  const body = v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  el.textContent = `${el.dataset.prefix ?? ''}${body}${el.dataset.suffix ?? ''}`;
}

function countTween(el: HTMLElement, duration = 1.6) {
  const target = Number(el.dataset.count);
  const state = { v: 0 };
  formatNum(el, 0);
  return gsap.to(state, {
    v: target,
    duration,
    ease: 'expo.out',
    onUpdate: () => formatNum(el, state.v),
    onComplete: () => formatNum(el, target),
  });
}

/* ───────────── Smooth scroll ───────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, anchors: { offset: -72 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ───────────── Nav ───────────── */
function initNav() {
  const nav = $('[data-nav]')!;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 12);
    if (y > 480 && y > last + 1) nav.classList.add('is-hidden');
    else if (y < last - 1 || y <= 480) nav.classList.remove('is-hidden');
    document.documentElement.classList.toggle('nav-hidden', nav.classList.contains('is-hidden'));
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$<HTMLAnchorElement>('.nav__links a');
  links.forEach((a) => {
    const target = $(a.getAttribute('href')!);
    if (!target) return;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 40%',
      end: 'bottom 40%',
      onToggle: (self) => a.classList.toggle('is-active', self.isActive),
    });
  });
}

/* ───────────── Hero ───────────── */
function tracePath() {
  const svg = $<SVGSVGElement>('[data-trace]');
  const start = $('[data-trace-start]');
  const end = $('[data-trace-end]');
  const ledger = $('.ledger');
  if (!svg || !start || !end || !ledger) return null;
  const path = svg.querySelector('path')!;
  if (!desktop()) {
    path.setAttribute('d', '');
    return null;
  }
  const host = svg.getBoundingClientRect();
  const s = start.getBoundingClientRect();
  const l = ledger.getBoundingClientRect();
  const e = end.getBoundingClientRect();
  const sx = s.right - host.left - 1;
  const sy = s.top + s.height / 2 - host.top;
  const ex = l.left - host.left + 1;
  const ey = e.top + e.height * 0.5 - host.top;
  // The full stop runs out along the baseline, then bends into the ledger's result row.
  const bend = Math.max(40, (ex - sx) * 0.45);
  path.setAttribute('d', `M${sx},${sy} L${ex - bend - 60},${sy} C${ex - bend + 20},${sy} ${ex - 70},${ey} ${ex},${ey}`);
  return path;
}

function initHero() {
  const lines = $$('.hero__title .line > span');
  const rows = $$('[data-ledger-row]');
  const nums = $$('.ledger [data-count]');
  const rule = $('.ledger__rule');
  const path = tracePath();
  document.documentElement.classList.add('is-ready');

  if (reduced) return;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__meta > span', { y: 14, opacity: 0, duration: 0.8, stagger: 0.05 }, 0);
  lines.forEach((el, i) => {
    const fromLeft = el.parentElement!.dataset.from !== 'right';
    tl.from(el, { yPercent: 108, x: fromLeft ? '-6vw' : '6vw', duration: 1.25 }, 0.08 + i * 0.09);
  });
  tl.from('.hero__copy > *', { y: 24, opacity: 0, duration: 1, stagger: 0.07 }, 0.55);
  tl.from('.ledger', { y: 40, opacity: 0, duration: 1.1 }, 0.6);
  tl.from('.ledger__head', { opacity: 0, duration: 0.6 }, 0.85);
  rows.forEach((row, i) => {
    const at = 0.95 + i * 0.32;
    tl.from(row, { y: 18, opacity: 0, duration: 0.8 }, at);
    tl.add(countTween(nums[i], i === 2 ? 1.1 : 1.4), at);
    if (i === 1 && rule) tl.from(rule, { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }, at + 0.25);
  });
  tl.from('.ledger__foot', { opacity: 0, duration: 0.8 }, 2.1);
  tl.add(() => ledgerCycle?.(0, false), 2.6);
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(path, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 1.15);
  }

  let resizeT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      const p = tracePath();
      if (p) gsap.set(p, { strokeDasharray: 'none', strokeDashoffset: 0 });
    }, 120);
  });
}

/* ───────────── Rotating hero ledger ───────────── */
type Num = { v: number; prefix?: string; suffix?: string; decimals?: number };
type Slide = { title: string; a: Num; aLabel: string; b: Num; bLabel: string; r: Num; rLabel: string; foot: string };

const SLIDES: Slide[] = [
  { title: 'Super app · North Africa · 2025',
    a: { v: 211, prefix: '$', suffix: 'K' }, aLabel: 'acquisition spend',
    b: { v: 116464 }, bLabel: 'first deliveries',
    r: { v: 1.81, prefix: '$', decimals: 2 }, rLabel: 'per first delivery',
    foot: 'Optimized to first orders, the event that pays.' },
  { title: 'D2C · wellness equipment · Meta',
    a: { v: 114150, prefix: '$' }, aLabel: 'purchase value',
    b: { v: 11462, prefix: '$' }, bLabel: 'ad spend',
    r: { v: 9.96, suffix: '×', decimals: 2 }, rLabel: 'ROAS (platform)',
    foot: 'Four Advantage+ campaigns, February 2026.' },
  { title: 'Local · house painting · Google Ads',
    a: { v: 207, prefix: 'CA$', suffix: 'K' }, aLabel: 'ad spend',
    b: { v: 4460 }, bLabel: 'conversions',
    r: { v: 46.44, prefix: 'CA$', decimals: 2 }, rLabel: 'per conversion',
    foot: 'Search and Performance Max, free-estimate offers.' },
];

function setNum(el: HTMLElement, n: Num) {
  el.dataset.count = String(n.v);
  el.dataset.prefix = n.prefix ?? '';
  el.dataset.suffix = n.suffix ?? '';
  el.dataset.decimals = String(n.decimals ?? 0);
}

let ledgerCycle: ((i: number, animate: boolean) => void) | null = null;

function initLedgerRotation() {
  const found = $('[data-ledger]');
  if (!found) return;
  const ledger: HTMLElement = found;
  const nums = $$('.ledger__num', ledger);
  const labels = $$('[data-l]', ledger);
  const title = $('[data-ledger-title]', ledger)!;
  const foot = $('[data-ledger-foot]', ledger)!;
  const tabs = $$<HTMLButtonElement>('[data-ledger-tab]', ledger);
  const progress = $('[data-ledger-progress]', ledger)!;
  const HOLD = 6.5;
  let current = 0;
  let paused = false;
  const timer = gsap.to(progress, { scaleX: 1, duration: HOLD, ease: 'none', paused: true, onComplete: () => show((current + 1) % SLIDES.length, true) });

  const fill = (i: number) => {
    const s = SLIDES[i];
    title.textContent = s.title;
    [s.a, s.b, s.r].forEach((n, k) => { setNum(nums[k], n); formatNum(nums[k], n.v); });
    [s.aLabel, s.bLabel, s.rLabel].forEach((t, k) => { labels[k].textContent = t; });
    foot.textContent = s.foot;
    tabs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-pressed', String(k === i)); });
  };

  function show(i: number, animate: boolean) {
    current = i;
    if (!animate || reduced) { fill(i); return restart(); }
    const rows = $$('[data-ledger-row], .ledger__foot, [data-ledger-title]', ledger);
    gsap.timeline()
      .to(rows, { y: -10, opacity: 0, duration: 0.3, ease: 'power3.in', stagger: 0.03 })
      .add(() => fill(i))
      .to(rows, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 })
      .add(() => { nums.forEach((n, k) => countTween(n, k === 2 ? 1.1 : 1.3)); }, '<');
    restart();
  }

  function restart() {
    timer.pause(0);
    gsap.set(progress, { scaleX: 0 });
    if (!reduced && !paused) timer.restart();
  }

  tabs.forEach((t, k) => t.addEventListener('click', () => show(k, true)));
  ledger.addEventListener('mouseenter', () => { paused = true; timer.pause(); });
  ledger.addEventListener('mouseleave', () => { paused = false; timer.resume(); });
  ledger.addEventListener('focusin', () => { paused = true; timer.pause(); });
  ledger.addEventListener('focusout', () => { paused = false; timer.resume(); });
  // Stop rotating once the hero is off screen; resume when it comes back.
  ScrollTrigger.create({ trigger: ledger, start: 'top bottom', end: 'bottom top',
    onLeave: () => timer.pause(), onLeaveBack: () => timer.pause(),
    onEnter: () => !paused && timer.resume(), onEnterBack: () => !paused && timer.resume() });

  ledgerCycle = show;
}

/* ───────────── Tapes (scroll-velocity marquee) ───────────── */
function initTapes() {
  $$('[data-tape]').forEach((tape) => {
    const track = $('.tape__track', tape)!;
    const dir = Number(tape.dataset.tape);
    const original = track.innerHTML;
    track.innerHTML = original + original + original + original;
    if (reduced) return;
    let x = 0;
    let boost = 0;
    lenis?.on('scroll', (l: Lenis) => { boost = gsap.utils.clamp(-8, 8, l.velocity * 0.4); });
    gsap.ticker.add((_t, dt) => {
      const unit = track.scrollWidth / 4;
      const speed = (0.9 + Math.abs(boost)) * dir * (boost < 0 ? -1 : 1);
      x -= speed * (dt / 16.67);
      if (x <= -unit) x += unit;
      if (x > 0) x -= unit;
      track.style.transform = `translate3d(${x}px,0,0)`;
      boost *= 0.94;
    });
  });
}

/* ───────────── Leaks ───────────── */
function initLeaks() {
  $$('[data-leak]').forEach((leak) => {
    if (reduced) {
      leak.style.setProperty('--strike', '100%');
      leak.style.setProperty('--fix', '1');
      leak.classList.add('is-struck');
      return;
    }
    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: leak, start: 'top 82%', end: 'top 52%', scrub: 0.6 },
      onUpdate: () => {
        leak.style.setProperty('--strike', `${state.p * 100}%`);
        leak.style.setProperty('--fix', `${gsap.utils.clamp(0, 1, (state.p - 0.7) / 0.3)}`);
        leak.classList.toggle('is-struck', state.p > 0.98);
      },
    });
  });
}

/* ───────────── System ───────────── */
type Viz = (root: HTMLElement) => gsap.core.Timeline;

const vizBuilders: Record<string, Viz> = {
  plan(root) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from($$('.plan__name', root), { x: -12, opacity: 0, duration: 0.7, stagger: 0.07 }, 0)
      .from($$('.plan__bar', root), { scaleX: 0, duration: 1.1, stagger: 0.12 }, 0.15)
      .from($$('.plan__chips span', root), { y: 10, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.7);
    return tl;
  },
  track(root) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    const pipes = $$('.track__pipe i', root);
    tl.from($$('.track__node', root), { y: 16, opacity: 0, duration: 0.7, stagger: 0.12 }, 0)
      .from($$('.track__events li', root), { y: 10, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.5)
      .from($$('.track__events em', root), { scale: 0, duration: 0.45, stagger: 0.12, ease: 'back.out(3)' }, 0.8);
    // Packets keep flowing once the pipeline is "live".
    tl.add(() => {
      pipes.forEach((dot, i) => {
        const vertical = !window.matchMedia('(min-width: 761px)').matches;
        gsap.fromTo(dot,
          vertical ? { top: '0%', left: '50%', opacity: 1 } : { left: '0%', top: '50%', opacity: 1 },
          { ...(vertical ? { top: '100%' } : { left: '100%' }), opacity: 0.2, duration: 1.1, ease: 'power2.in', repeat: -1, delay: i * 0.25, repeatDelay: 0.4 });
      });
    }, 0.6);
    return tl;
  },
  create(root) {
    const cells = $$('.cell', root);
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from($$('.create__inputs span', root), { y: 10, opacity: 0, duration: 0.6, stagger: 0.08 }, 0)
      .from(cells, { scale: 0.85, opacity: 0, duration: 0.6, stagger: { each: 0.05, grid: [3, 3], from: 'start' } }, 0.2);
    // A deterministic test cycle: brief → live → read.
    const order = [0, 4, 8, 1, 5, 6, 2, 3, 7];
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });
    order.forEach((ci, k) => {
      loop.call(() => { cells[ci].className = 'cell is-brief'; }, [], k * 0.22);
      loop.call(() => { cells[ci].className = 'cell is-live'; }, [], k * 0.22 + 0.9);
      if (k % 3 !== 2) loop.call(() => { cells[ci].className = 'cell is-read'; }, [], k * 0.22 + 2.2);
    });
    loop.call(() => cells.forEach((c) => (c.className = 'cell')), [], 5.2);
    tl.add(() => { loop.play(0); }, 0.9);
    return tl;
  },
  launch(root) {
    const bars = $$('.launch__bar i', root);
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    bars.forEach((b, i) => {
      const [a] = (b.dataset.w ?? '0.5').split(',').map(Number);
      tl.to(b, { scaleX: a, duration: 1.2 }, 0.1 + i * 0.08);
    });
    tl.from($('.launch__note', root), { opacity: 0, duration: 0.6 }, 0.8);
    tl.add(() => {
      const loop = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.6 });
      bars.forEach((b) => {
        const [, z] = (b.dataset.w ?? '0.5,0.5').split(',').map(Number);
        loop.to(b, { scaleX: z, duration: 1.4, ease: 'power3.inOut' }, 0);
      });
    }, 1.8);
    return tl;
  },
  analyze(root) {
    const svg = $('.analyze__chart', root)!;
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.fromTo(svg, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, 0)
      .from($('.analyze__gap', root), { opacity: 0, duration: 0.8 }, 1.2)
      .from($$('.analyze__legend span', root), { y: 8, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.4)
      .from($('.analyze__callout', root), { y: 12, opacity: 0, duration: 0.9 }, 1.5);
    return tl;
  },
  found(root) {
    const rows = $$('.found__serp li', root);
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from($('.found__q', root), { y: 14, opacity: 0, duration: 0.7 }, 0)
      .from($$('.found__line:not(.found__line--brand)', root), { scaleX: 0, duration: 0.9, stagger: 0.12 }, 0.35)
      .from($('.found__chip', root), { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(2.2)' }, 0.75)
      .from(rows, { opacity: 0, duration: 0.4, stagger: 0.06 }, 0.3);
    tl.add(() => {
      const h = rows[0].offsetHeight + 8;
      gsap.fromTo(rows[0], { y: h * 2 }, { y: 0, duration: 1.1, ease: 'expo.inOut' });
      gsap.fromTo(rows.slice(1), { y: -h }, { y: 0, duration: 1.1, ease: 'expo.inOut' });
    }, 0.9);
    return tl;
  },
};

function initSystem() {
  const levers = $$('[data-lever]');
  const items = $$('[data-rail-item]');
  const digits = $('[data-rail-digits]')!;
  const fill = $('[data-rail-fill]')!;

  const setActive = (i: number) => {
    digits.style.transform = `translateY(${-i * 0.86}em)`;
    items.forEach((el, k) => {
      el.classList.toggle('is-active', k === i);
      el.classList.toggle('is-done', k < i);
    });
  };
  digits.style.transition = 'transform .8s cubic-bezier(0.16, 1, 0.3, 1)';
  setActive(0);

  levers.forEach((lever, i) => {
    ScrollTrigger.create({
      trigger: lever,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && setActive(i),
      onLeaveBack: () => i === 0 && setActive(0),
    });

    const viz = $('[data-viz]', lever)!;
    const builder = vizBuilders[viz.dataset.viz!];
    if (reduced || !builder) return;
    const tl = builder(viz);
    ScrollTrigger.create({ trigger: viz, start: 'top 78%', once: true, onEnter: () => tl.play() });

    gsap.from($$('.lever__head > *, .lever__body > *', lever), {
      y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: lever, start: 'top 80%', once: true },
    });
  });

  if (reduced) {
    $$('.launch__bar i').forEach((b) => { b.style.transform = `scaleX(${(b.dataset.w ?? '0.5').split(',')[0]})`; });
    return;
  }

  gsap.to(fill, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.system__levers', start: 'top 55%', end: 'bottom 55%', scrub: true },
  });
}

/* ───────────── Results ───────────── */
function initResults() {
  if (reduced) return;
  $$('[data-case]').forEach((card) => {
    const nums = $$('[data-count]', card);
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.from(card, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out' });
        const steps = $$('.funnel li', card);
        if (steps.length) gsap.fromTo(steps, { '--grow': 0 }, { '--grow': 1, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.3 });
        nums.forEach((n, i) => countTween(n, i === 0 ? 2 : 1.5).delay(0.15 + i * 0.08));
      },
    });
  });
}

function playPanel(panel: HTMLElement) {
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0);
  const big = $('.case__big[data-count]', panel);
  if (big) tl.add(countTween(big, 1.6), 0.05);
  const rows = $$('.receipt tbody tr, .receipt tfoot tr', panel);
  tl.fromTo(rows, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.06 }, 0.25);
  tl.fromTo($$('.redact', panel), { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.3);
  const segs = $$('.seg i', panel);
  if (segs.length) tl.fromTo(segs, { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.1 }, 0.5);
  tl.fromTo($$('.case__stats > div, .mini', panel), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, 0.2);
}

function labelReceipts() {
  // Copy column headers onto cells so mobile can show rows as labelled cards.
  $$<HTMLTableElement>('.receipt table').forEach((t) => {
    const heads = $$('thead th', t).map((th) => th.textContent?.trim() ?? '');
    $$<HTMLTableRowElement>('tbody tr, tfoot tr', t).forEach((tr) => {
      Array.from(tr.cells).forEach((td, i) => { if (heads[i]) td.dataset.l = heads[i]; });
    });
  });
}

function initTabs() {
  const tabs = $$<HTMLButtonElement>('[role="tab"]');
  const panels = $$('[data-panel]');
  if (!tabs.length) return;
  const select = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    const panel = panels.find((p) => !p.hidden)!;
    if (focus) tab.focus();
    playPanel(panel);
    ScrollTrigger.refresh();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { if (!tab.classList.contains('is-on')) select(tab); });
    tab.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  // First panel plays when the results section scrolls into view.
  ScrollTrigger.create({
    trigger: '.tabs', start: 'top 80%', once: true,
    onEnter: () => playPanel(panels.find((p) => !p.hidden)!),
  });
}

/* ───────────── Principles stack ───────────── */
function initPrinciples() {
  const cards = $$('[data-pcard]');
  cards.forEach((c, i) => c.style.setProperty('--i', String(i)));
  if (reduced) return;
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.93 + i * 0.01,
      filter: 'brightness(0.86)',
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
    });
  });
}

/* ───────────── Offer, phases, about ───────────── */
function initReveals() {
  if (reduced) return;
  gsap.from('.offer__row .y', {
    opacity: 0, scale: 0.6, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.03,
    scrollTrigger: { trigger: '.offer__table', start: 'top 75%', once: true },
  });
  gsap.from('.phases li', {
    y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.phases', start: 'top 85%', once: true },
  });
  gsap.from('.xp__row', {
    y: 18, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06,
    scrollTrigger: { trigger: '.xp', start: 'top 85%', once: true },
  });
  $$('.section-head, .system__intro, .about__intro, .faq__grid > div:first-child').forEach((el) => {
    gsap.from(el.children, {
      y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  // Closing headline: lines arrive from opposite sides, like the hero.
  const ctaLines = $$('.cta__title .line > span');
  gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } })
    .from(ctaLines, {
      yPercent: 108, x: (i: number) => (i % 2 ? '8vw' : '-8vw'), duration: 1.25, ease: 'expo.out', stagger: 0.1,
    })
    .from('.cta__row > *', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.5);
}

/* ───────────── Boot ───────────── */
initNav();
// The hero waits for fonts so the trace line is measured against final glyph positions.
let heroStarted = false;
const startHero = () => { if (!heroStarted) { heroStarted = true; initLedgerRotation(); initHero(); if (reduced) ledgerCycle?.(0, false); } };
document.fonts?.ready.then(startHero);
setTimeout(startHero, 900);
initTapes();
initLeaks();
initSystem();
initResults();
labelReceipts();
initTabs();
initPrinciples();
initReveals();

document.fonts?.ready.then(() => ScrollTrigger.refresh());
