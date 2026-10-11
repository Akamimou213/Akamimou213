import { attachAppSearch, esc, isEmail, isStoreUrl, prefillApp, sendLead, type AppHit } from './form';
import { config } from './config';
import { track } from './track';

/* ─────────────────────────────────────────────────────────────
   Hero lead capture in two fields: find the app, then the email.
   ───────────────────────────────────────────────────────────── */
export function initQuickstart() {
  const form = document.querySelector<HTMLFormElement>('[data-quickstart]');
  if (!form) return;
  const appStep = form.querySelector<HTMLElement>('[data-qs-step="app"]')!;
  const mailStep = form.querySelector<HTMLElement>('[data-qs-step="email"]')!;
  const appInput = form.querySelector<HTMLInputElement>('#quick-app')!;
  const urlInput = form.querySelector<HTMLInputElement>('#quick-url')!;
  const pasteBtn = form.querySelector<HTMLButtonElement>('[data-qs-paste]')!;
  const chip = form.querySelector<HTMLElement>('[data-qs-app]')!;
  const email = form.querySelector<HTMLInputElement>('#quick-email')!;
  const btn = form.querySelector<HTMLButtonElement>('[data-qs-btn]')!;
  const status = form.querySelector<HTMLElement>('[data-qs-status]')!;
  const btnLabel = btn.innerHTML;

  let app: { name: string; id: string; url: string; icon: string; dev: string; store: string } | null = null;

  const say = (msg: string, kind: 'err' | 'ok' | '' = '') => {
    status.className = `qs__status${kind ? ` is-${kind}` : ''}`;
    status.innerHTML = msg;
  };
  const toEmail = () => {
    if (!app) return;
    chip.innerHTML = `${app.icon ? `<img src="${esc(app.icon)}" alt="" width="40" height="40" />` : '<span class="qs__ph" aria-hidden="true">★</span>'}<div><b>${esc(app.name)}</b><span>${esc(app.dev)}</span></div><button type="button" data-qs-change>Change</button>`;
    chip.querySelector('[data-qs-change]')!.addEventListener('click', toApp);
    appStep.hidden = true;
    mailStep.hidden = false;
    btn.innerHTML = 'Send my free Growth Plan <span aria-hidden="true">→</span>';
    say('');
    email.focus();
  };
  const toApp = () => {
    app = null;
    mailStep.hidden = true;
    appStep.hidden = false;
    btn.innerHTML = btnLabel;
    appInput.focus();
    appInput.select();
  };

  attachAppSearch(appInput, form.querySelector<HTMLUListElement>('#quick-results')!, (h: AppHit) => {
    appInput.value = h.trackName;
    app = { name: h.trackName, id: String(h.trackId), url: h.trackViewUrl.split('?')[0], icon: h.artworkUrl100, dev: h.artistName, store: 'ios' };
    prefillApp(h); // the long form below shows the same app if they scroll
    track('hero_app_picked', { app: h.trackName });
    toEmail();
  });

  pasteBtn.addEventListener('click', () => {
    urlInput.hidden = !urlInput.hidden;
    if (!urlInput.hidden) urlInput.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!app) {
      const url = urlInput.value.trim();
      if (url && isStoreUrl(url)) {
        const android = /play\.google\.com/i.test(url);
        const id = android ? (url.match(/id=([\w.]+)/)?.[1] ?? '') : (url.match(/id(\d+)/)?.[1] ?? '');
        app = { name: appInput.value.trim() || (android ? id : 'Your app'), id, url, icon: '', dev: android ? 'Google Play' : 'App Store', store: android ? 'android' : 'ios' };
        return toEmail();
      }
      if (url) return say('That link should start with apps.apple.com or play.google.com.', 'err');
      say(appInput.value.trim() ? 'Pick your app from the list, or paste your store link.' : 'Type your app\'s name to find it.', 'err');
      appInput.focus();
      appInput.dispatchEvent(new Event('input'));
      return;
    }
    const mail = email.value.trim();
    if (!isEmail(mail)) {
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      return say('Add a valid email so we know where to send it.', 'err');
    }
    email.removeAttribute('aria-invalid');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    const res = await sendLead({ app_name: app.name, store: app.store, app_id: app.id, store_url: app.url, name: '', email: mail, monthly_spend: '', source: 'hero' });
    btn.disabled = false;
    if (res.ok) {
      form.classList.add('is-done');
      say(`<b>Done.</b> Your Growth Plan for ${esc(app.name)} lands in ${esc(mail)} within 48 hours. Want it sooner? <a href="${config.calendlyUrl}" target="_blank" rel="noopener">Book a 30-min call</a>.`, 'ok');
      btn.hidden = true;
      mailStep.hidden = true;
    } else {
      btn.innerHTML = 'Send my free Growth Plan <span aria-hidden="true">→</span>';
      say(res.html, 'err');
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   Funnel flow: users stream from ad to paying. Some drop at the
   store, onboarding and paywall; survivors turn lime and land.
   ───────────────────────────────────────────────────────────── */
const BLUE = '#ffffff', LIME = '#D6FF3D', CORAL = '#FF5B2E';
const DROP = [0, 0.32, 0.28, 0.42, 0]; // chance to leave at each stage
type Dot = { t: number; v: number; stage: number; x: number; y: number; vx: number; vy: number; falling: boolean; life: number; pay: boolean };

export function initPipe(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-pipe]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-pipe-canvas]');
  if (!root || !canvas) return;
  const ctx = canvas.getContext('2d')!;
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.pipe__stage'));
  let W = 0, H = 0, dpr = 1, vertical = false;
  let nodes: { x: number; y: number }[] = [];
  let segLen: number[] = [], total = 0;
  const pulses = new Array(cards.length).fill(0);
  let dots: Dot[] = [];
  let raf = 0, visible = false, last = 0, spawnAcc = 0;

  const layout = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = root.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    vertical = W < 700;
    nodes = cards.map((c) => {
      const b = c.getBoundingClientRect();
      return vertical ? { x: b.left - r.left - 14, y: b.top - r.top + 22 } : { x: b.left - r.left + b.width / 2, y: b.top - r.top - 18 };
    });
    const start = vertical ? { x: nodes[0].x, y: nodes[0].y - 40 } : { x: nodes[0].x - 120, y: nodes[0].y };
    nodes = [start, ...nodes];
    segLen = []; total = 0;
    for (let i = 1; i < nodes.length; i++) { const l = Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y); segLen.push(l); total += l; }
    if (reduced) draw();
  };

  const pointAt = (d: number) => {
    let acc = 0;
    for (let i = 0; i < segLen.length; i++) {
      if (d <= acc + segLen[i]) { const k = (d - acc) / segLen[i]; return { x: nodes[i].x + (nodes[i + 1].x - nodes[i].x) * k, y: nodes[i].y + (nodes[i + 1].y - nodes[i].y) * k, seg: i }; }
      acc += segLen[i];
    }
    const n = nodes[nodes.length - 1];
    return { x: n.x, y: n.y, seg: segLen.length };
  };
  const nodeDist = (i: number) => segLen.slice(0, i).reduce((a, b) => a + b, 0); // distance to nodes[i]

  const step = (dt: number) => {
    spawnAcc += dt;
    while (spawnAcc > 0.16) { spawnAcc -= 0.16; dots.push({ t: 0, v: 150 + Math.random() * 60, stage: 0, x: 0, y: 0, vx: 0, vy: 0, falling: false, life: 1, pay: false }); }
    for (const d of dots) {
      if (d.falling) {
        d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * 1.4;
        continue;
      }
      d.t += d.v * dt;
      // crossing a stage node (nodes[1..5] are the cards)
      const next = d.stage + 1;
      if (next < nodes.length && d.t >= nodeDist(next)) {
        d.stage = next;
        pulses[next - 1] = 1;
        if (Math.random() < DROP[next - 1]) {
          const p = nodes[next];
          Object.assign(d, { falling: true, x: p.x, y: p.y, vx: (Math.random() - 0.5) * 60 + (vertical ? -80 : 0), vy: vertical ? 0 : -40 - Math.random() * 60 });
        } else if (next - 1 >= 3) d.pay = true;
        if (next === nodes.length - 1 && !d.falling) d.life = 0; // landed in "paying"
      }
      const p = pointAt(Math.min(d.t, total));
      d.x = p.x; d.y = p.y;
    }
    dots = dots.filter((d) => d.life > 0 && d.y < H + 40);
    for (let i = 0; i < pulses.length; i++) pulses[i] = Math.max(0, pulses[i] - dt * 2.2);
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // track
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    nodes.forEach((n, i) => (i ? ctx.lineTo(n.x, n.y) : ctx.moveTo(n.x, n.y)));
    ctx.stroke();
    ctx.setLineDash([]);
    // nodes + pulses
    nodes.slice(1).forEach((n, i) => {
      const pay = i === nodes.length - 2;
      if (pulses[i] > 0) {
        ctx.strokeStyle = `rgba(214,255,61,${pulses[i] * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.x, n.y, 7 + (1 - pulses[i]) * 12, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = pay ? LIME : '#fff';
      ctx.beginPath(); ctx.arc(n.x, n.y, pay ? 7 : 5, 0, Math.PI * 2); ctx.fill();
    });
    // dots
    for (const d of dots) {
      ctx.globalAlpha = Math.max(0, Math.min(1, d.life));
      ctx.fillStyle = d.falling ? CORAL : d.pay ? LIME : BLUE;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.pay ? 4.2 : 3.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    step(dt);
    draw();
    raf = visible ? requestAnimationFrame(loop) : 0;
  };

  new ResizeObserver(layout).observe(root);
  window.addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  layout();
  if (reduced) return draw();
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = 0; raf = requestAnimationFrame(loop); }
  }).observe(root);
}
