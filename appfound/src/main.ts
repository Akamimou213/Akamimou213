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
import { config } from './config';
import { initBucket } from './bucket';
import { initGrowthForm } from './form';
import { track } from './track';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => window.matchMedia('(max-width: 760px)').matches;

/* ───────────── Smooth scroll ───────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, anchors: { offset: -80 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export function scrollToEl(el: Element) {
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

/* ───────────── Counters ───────────── */
function formatNum(el: HTMLElement, v: number) {
  const d = Number(el.dataset.decimals ?? 0);
  const body = v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  el.textContent = `${el.dataset.prefix ?? ''}${body}${el.dataset.suffix ?? ''}`;
}
function countUp(el: HTMLElement, duration = 1.6) {
  const target = Number(el.dataset.count);
  const state = { v: 0 };
  formatNum(el, 0);
  gsap.to(state, { v: target, duration, ease: 'expo.out', onUpdate: () => formatNum(el, state.v), onComplete: () => formatNum(el, target) });
}
function initCounters() {
  if (reduced) return;
  $$('[data-count]').forEach((el) => {
    if (el.closest('.hero')) return; // hero counts on intro
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => countUp(el, el.closest('.results__num') ? 2.2 : 1.6) });
  });
}

/* ───────────── Nav + menu ───────────── */
function initNav() {
  const nav = $('[data-nav]')!;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > last + 2 && !menu.classList.contains('is-open'));
    if (y < last - 2) nav.classList.remove('is-hidden');
    last = y;
  };
  const menu = $('[data-menu]')!;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const openBtn = $<HTMLButtonElement>('[data-menu-open]')!;
  let lastFocus: HTMLElement | null = null;
  const open = () => {
    lastFocus = document.activeElement as HTMLElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    openBtn.setAttribute('aria-expanded', 'true');
    lenis?.stop();
    setTimeout(() => $<HTMLElement>('.menu__main a', menu)?.focus(), 80);
  };
  const close = (restore = true) => {
    menu.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    lenis?.start();
    setTimeout(() => (menu.hidden = true), 450);
    if (restore) lastFocus?.focus();
  };
  openBtn.addEventListener('click', open);
  $$('[data-menu-close]', menu).forEach((b) => b.addEventListener('click', () => close()));
  $$<HTMLAnchorElement>('[data-menu-link]', menu).forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.hash ? $(a.hash) : null;
      if (!target) return;
      e.preventDefault();
      close(false);
      setTimeout(() => scrollToEl(target), 120);
    }),
  );
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = $$<HTMLElement>('a, button', menu).filter((x) => x.offsetParent);
      const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ───────────── Links from config ───────────── */
function initLinks() {
  $$<HTMLAnchorElement>('[data-calendly]').forEach((a) => (a.href = config.calendlyUrl));
  $$<HTMLAnchorElement>('[data-linkedin]').forEach((a) => (a.href = config.linkedinUrl));

  const site = config.siteUrl ? ` (${config.siteUrl})` : '';
  const prompt = `What does Appfound${site}, the growth partner for consumer apps run by Mohamed Barkat, do? Is it a good fit for a subscription app spending a few thousand dollars a month on ads?`;
  const q = encodeURIComponent(prompt);
  const targets: [string, string][] = [
    ['ChatGPT', `https://chatgpt.com/?q=${q}`],
    ['Claude', `https://claude.ai/new?q=${q}`],
    ['Perplexity', `https://www.perplexity.ai/search/new?q=${q}`],
  ];
  const box = $('[data-askai]');
  if (box) box.innerHTML = targets.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join('');

  // Conversion events for GTM / Meta / TikTok if their tags are installed
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
    if (el && el.tagName === 'A') track(el.dataset.track!);
  });
}

/* ───────────── Hero ───────────── */
function initHero() {
  const lines = $$('.hero__title .line > span');
  const card = $('.hero__card');
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(lines, { yPercent: 105, duration: 1.1, stagger: 0.09 })
    .from('.hero__meta span', { opacity: 0, y: 10, stagger: 0.05, duration: 0.6 }, 0.1)
    .from(card, { y: 40, rotate: -2, opacity: 0, duration: 1 }, 0.35)
    .from('.hero__tag', { opacity: 0, duration: 0.8 }, 0.5)
    .from(['.hero__sub', '.hero__form', '.hero__micro', '.hero__foot'], { y: 18, opacity: 0, stagger: 0.07, duration: 0.8 }, 0.55)
    .add(() => $$('.hero [data-count]').forEach((el) => countUp(el, 1.8)), 0.6);

  // Quick-start: carry the app name into the full form
  const quick = $<HTMLFormElement>('[data-quickstart]')!;
  quick.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (new FormData(quick).get('app') as string).trim();
    const search = $<HTMLInputElement>('#app-search')!;
    if (name) {
      search.value = name;
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    track('cta_hero', { app: name });
    scrollToEl($('#plan')!);
    setTimeout(() => (name ? $<HTMLInputElement>('.gform input[name="name"]') : search)?.focus({ preventScroll: true }), 900);
  });
}

/* ───────────── Marquee ───────────── */
function initMarquee() {
  const track = $('[data-marquee]');
  if (!track || reduced) return;
  track.innerHTML += track.innerHTML;
  track.lastElementChild && $$(':scope > span', track).slice(track.children.length / 2).forEach((s) => s.setAttribute('aria-hidden', 'true'));
}

/* ───────────── Reveals ───────────── */
function initReveals() {
  if (reduced) return;
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }),
  });
  // Panels slide up subtly
  $$('.step, .case, .scale > *, .anchor, .plan, .founder__copy, .founder__photo').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}

/* ───────────── Promise list (Patch scroll highlight) ───────────── */
function initPromise() {
  const items = $$('.promise__list li');
  const ills = $$('[data-ill]');
  const count = $('[data-ill-count]');
  const set = (i: number) => {
    items.forEach((li, j) => li.classList.toggle('is-on', j === i));
    ills.forEach((s, j) => s.classList.toggle('is-on', j === i));
    if (count) count.textContent = String(i + 1).padStart(2, '0');
  };
  items.forEach((li, i) => {
    ScrollTrigger.create({
      trigger: li,
      start: 'top 58%',
      end: 'bottom 58%',
      onToggle: (self) => self.isActive && set(i),
    });
  });
}

/* ───────────── System steps → bucket state ───────────── */
function initSystem() {
  const canvas = $<HTMLCanvasElement>('[data-bucket]');
  if (!canvas) return;
  const label = $('[data-bucket-state]')!;
  const names = ['Step 01 · Leaking', 'Step 02 · Plugged & filling', 'Step 03 · Overflowing'];
  const bucket = initBucket(canvas, reduced);
  const set = (i: number) => {
    bucket.setState(i);
    label.textContent = names[i];
    $$('.step').forEach((s, j) => s.classList.toggle('is-active', j === i));
  };
  let auto: number | undefined;
  ScrollTrigger.matchMedia({
    '(min-width: 1101px)': () => {
      $$('.step').forEach((step, i) => {
        ScrollTrigger.create({ trigger: step, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && set(i) });
      });
    },
    '(max-width: 1100px)': () => {
      // Bucket sits above the steps here, so cycle through the states while it's on screen
      let i = 0;
      const st = ScrollTrigger.create({
        trigger: canvas,
        start: 'top 85%',
        end: 'bottom 10%',
        onToggle: (s) => {
          window.clearInterval(auto);
          if (s.isActive) { set(i); auto = window.setInterval(() => set((i = (i + 1) % 3)), 4200); }
        },
      });
      return () => { st.kill(); window.clearInterval(auto); };
    },
  });
}

/* ───────────── Tabs (Tines) ───────────── */
function initTabs() {
  const root = $('[data-tabs]');
  if (!root) return;
  const tabs = $$<HTMLButtonElement>('[role="tab"]', root);
  const select = (t: HTMLButtonElement, focus = false) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $(`#${x.getAttribute('aria-controls')}`)!.hidden = !on;
    });
    if (focus) t.focus();
    const panel = $(`#${t.getAttribute('aria-controls')}`)!;
    if (!reduced) gsap.from(panel.querySelectorAll('.tp__copy > *, .mock'), { y: 16, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
    feed.toggle(panel.id === 'panel-track');
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      let n = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') n = 0;
      if (k === 'End') n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); select(tabs[n], true); }
    });
  });
}

/* Simulated tracking feed for the Tracking tab mockup */
const feed = (() => {
  const box = $('[data-feed]');
  const events = [
    ['app_install', 'Install'],
    ['sign_up', 'Signup'],
    ['tutorial_complete', 'Onboarding done'],
    ['start_trial', 'Trial started'],
    ['sign_up', 'Signup'],
    ['purchase', 'Purchase · $59.99/yr'],
  ];
  let timer: number | undefined;
  let n = 0;
  const add = () => {
    if (!box) return;
    const [code, label] = events[n++ % events.length];
    const d = new Date();
    const row = document.createElement('div');
    row.className = 'feed__row' + (code === 'purchase' ? ' is-pay' : '');
    row.innerHTML = `<span class="t">${d.toTimeString().slice(0, 8)}</span><span class="ev">${label} <span class="t">${code}</span></span><span class="ok">Meta ✓ TikTok ✓ Google ✓</span>`;
    box.prepend(row);
    while (box.children.length > 8) box.lastElementChild!.remove();
  };
  return {
    toggle(on: boolean) {
      window.clearInterval(timer);
      if (!on || !box) return;
      if (!box.children.length) for (let i = 0; i < 5; i++) add();
      if (!reduced) timer = window.setInterval(add, 1400);
    },
  };
})();

/* ───────────── Closing word ───────────── */
function initClosing() {
  if (reduced) return;
  gsap.from('.closing__word span', {
    yPercent: 60, opacity: 0, rotate: (i) => (i % 2 ? 6 : -6), stagger: 0.05, ease: 'back.out(1.6)', duration: 1,
    scrollTrigger: { trigger: '.closing', start: 'top 75%', once: true },
  });
}

/* ───────────── Mobile sticky CTA ───────────── */
function initMobileBar() {
  const bar = $('[data-mbar]');
  if (!bar) return;
  let pastHero = false, atForm = false;
  const sync = () => bar.classList.toggle('is-on', pastHero && !atForm);
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 30%', onToggle: () => {}, onEnter: () => { pastHero = true; sync(); }, onLeaveBack: () => { pastHero = false; sync(); } });
  ScrollTrigger.create({ trigger: '#plan', start: 'top 90%', end: 'bottom 10%', onToggle: (s) => { atForm = s.isActive; sync(); } });
  ScrollTrigger.create({ trigger: '.closing', start: 'top 90%', onToggle: (s) => { if (s.isActive) { atForm = true; sync(); } } });
}

/* ───────────── In-page anchors through Lenis ───────────── */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hasAttribute('data-menu-link')) return;
    const id = a.getAttribute('href')!;
    if (id === '#') return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    if (id === '#plan' && !mobile()) setTimeout(() => $<HTMLInputElement>('#app-search')?.focus({ preventScroll: true }), 900);
  });
}

initLinks();
initNav();
initHero();
initMarquee();
initPromise();
initSystem();
initTabs();
initCounters();
initReveals();
initClosing();
initMobileBar();
initAnchors();
initGrowthForm();

document.fonts?.ready.then(() => ScrollTrigger.refresh());
