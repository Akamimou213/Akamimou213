import { config } from './config';
import { track } from './track';

export type AppHit = { trackId: number; trackName: string; artistName: string; artworkUrl100: string; trackViewUrl: string; averageUserRating?: number; userRatingCount?: number };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* Keep the first-touch UTMs for the session so the lead carries its source */
function utms(): Record<string, string> {
  const KEY = 'af_utm';
  try {
    const params = new URLSearchParams(location.search);
    const found: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid'].forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v;
    });
    if (Object.keys(found).length) {
      found.referrer = document.referrer;
      sessionStorage.setItem(KEY, JSON.stringify(found));
      return found;
    }
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/* iTunes Search API: try CORS fetch, fall back to JSONP */
async function searchAppStore(term: string): Promise<AppHit[] | null> {
  const local = (window as unknown as { __AF_APPS__?: AppHit[] }).__AF_APPS__;
  if (local) {
    const q = term.toLowerCase();
    const hits = local.filter((a) => a.trackName.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q));
    hits.sort((a, b) => Number(!a.trackName.toLowerCase().startsWith(q)) - Number(!b.trackName.toLowerCase().startsWith(q)));
    if (hits.length) return hits.slice(0, 6);
  }
  const url = `https://itunes.apple.com/search?entity=software&limit=6&term=${encodeURIComponent(term)}`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()).results as AppHit[];
  } catch {
    return new Promise<AppHit[] | null>((resolve) => {
      const cb = `af_cb_${Date.now()}`;
      const s = document.createElement('script');
      const done = (v: AppHit[] | null) => { delete (window as any)[cb]; s.remove(); resolve(v); };
      (window as any)[cb] = (data: { results: AppHit[] }) => done(data.results || []);
      s.src = `${url}&callback=${cb}`;
      s.onerror = () => done(null);
      document.head.appendChild(s);
      setTimeout(() => done(null), 6000);
    });
  }
}

/* Accessible App Store autocomplete, used by the hero and the main form */
export function attachAppSearch(input: HTMLInputElement, list: HTMLUListElement, onPick: (h: AppHit) => void, enabled: () => boolean = () => true) {
  let hits: AppHit[] = [];
  let offline = false;
  let active = -1;
  let timer: number | undefined;
  let seq = 0;
  const optId = (i: number) => `${list.id}-opt-${i}`;

  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; };
  const render = () => {
    list.innerHTML = hits.length
      ? hits.map((h, i) => `
        <li role="option" id="${optId(i)}" aria-selected="${i === active}" data-i="${i}">
          <img src="${esc(h.artworkUrl100)}" alt="" width="40" height="40" loading="lazy" />
          <div><b>${esc(h.trackName)}</b><span>${esc(h.artistName)}${h.userRatingCount ? ` · ★ ${h.averageUserRating?.toFixed(1)} (${h.userRatingCount.toLocaleString('en-US')})` : ''}</span></div>
        </li>`).join('')
      : `<li class="empty">${offline ? "Couldn't reach the App Store from here. Paste your store link instead." : 'No match on the App Store. You can paste your store link instead.'}</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', active >= 0 ? optId(active) : '');
  };
  const pick = (h: AppHit) => { close(); onPick(h); };

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    window.clearTimeout(timer);
    const q = input.value.trim();
    if (!enabled() || q.length < 2) return close();
    timer = window.setTimeout(async () => {
      if (document.activeElement !== input) return;
      const mine = ++seq;
      const res = await searchAppStore(q);
      if (mine !== seq || document.activeElement !== input) return;
      offline = res === null;
      hits = res ?? [];
      active = -1;
      render();
    }, 180);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden || !hits.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % hits.length; render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + hits.length) % hits.length; render(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(hits[active]); }
    else if (e.key === 'Escape') close();
  });
  list.addEventListener('mousedown', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li) { e.preventDefault(); pick(hits[Number(li.dataset.i)]); }
  });
  input.addEventListener('blur', () => setTimeout(close, 150));
  return { close, search: () => input.dispatchEvent(new Event('input')) };
}

export type Lead = { app_name: string; store: string; app_id: string; store_url: string; name: string; email: string; monthly_spend: string; source: string };

/** Sends a Growth Report request. Resolves 'ok', or 'fallback' with copy-paste HTML when no endpoint is set or it fails. */
export async function sendLead(lead: Lead): Promise<{ ok: true } | { ok: false; html: string }> {
  const spend = lead.monthly_spend ? ` · spend ${lead.monthly_spend}` : '';
  // _subject sets the notification email's subject in Formspree; replies go to the `email` field
  const payload = { _subject: `Growth Report request: ${lead.app_name || lead.store_url || 'new app'}${spend}`, ...lead, page: location.href, submitted_at: new Date().toISOString(), ...utms() };
  track('growth_plan_submit', { store: lead.store, monthly_spend: lead.monthly_spend, source: lead.source });
  try {
    if (!config.formEndpoint) throw new Error('no-endpoint');
    const r = await fetch(config.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(String(r.status));
    return { ok: true };
  } catch (err) {
    if ((err as Error).message === 'no-endpoint') console.warn('[appfound] Set config.formEndpoint to receive Growth Report requests.');
    const msg = `Hi Mohamed, I'd like a free Growth Report.\nApp: ${lead.app_name || '-'} (${lead.store})\nStore link: ${lead.store_url || '-'}\nName: ${lead.name || '-'}\nEmail: ${lead.email}\nMonthly ad spend: ${lead.monthly_spend || '-'}`;
    let copied = false;
    try { await navigator.clipboard.writeText(msg); copied = true; } catch { /* clipboard blocked */ }
    return { ok: false, html: `We couldn't send this automatically. ${copied ? 'Your request is copied.' : 'Copy the request below.'} Send it to Mohamed on <a href="${config.linkedinUrl}" target="_blank" rel="noopener">LinkedIn</a> and he'll reply within 48 hours.<pre>${esc(msg)}</pre>` };
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isStoreUrl = (v: string) => /^(https?:\/\/)?(apps\.apple\.com|itunes\.apple\.com|play\.google\.com)\//i.test(v);
export { esc };

let prefill: ((h: AppHit) => void) | null = null;
/** Lets the hero hand a picked app to the main form */
export const prefillApp = (h: AppHit) => prefill?.(h);

export function initGrowthForm() {
  utms();
  const form = document.querySelector<HTMLFormElement>('[data-gform]');
  if (!form) return;
  const input = form.querySelector<HTMLInputElement>('#app-search')!;
  const list = form.querySelector<HTMLUListElement>('#app-results')!;
  const picked = form.querySelector<HTMLElement>('[data-picked]')!;
  const urlField = form.querySelector<HTMLInputElement>('[data-url]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const idField = form.elements.namedItem('app_id') as HTMLInputElement;
  const iconField = form.elements.namedItem('app_icon') as HTMLInputElement;
  const store = () => (form.querySelector<HTMLInputElement>('input[name="store"]:checked')?.value ?? 'ios') as 'ios' | 'android';

  const pick = (h: AppHit, focusNext = true) => {
    idField.value = String(h.trackId);
    iconField.value = h.artworkUrl100;
    urlField.value = h.trackViewUrl.split('?')[0];
    input.value = h.trackName;
    input.hidden = true;
    picked.hidden = false;
    picked.innerHTML = `<img src="${esc(h.artworkUrl100)}" alt="" /><div><b>${esc(h.trackName)}</b><span>${esc(h.artistName)}</span></div><button type="button">Change</button>`;
    picked.querySelector('button')!.addEventListener('click', unpick);
    if (focusNext) form.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true });
  };
  const unpick = () => {
    idField.value = iconField.value = urlField.value = '';
    picked.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  };
  prefill = (h) => {
    const ios = form.querySelector<HTMLInputElement>('input[name="store"][value="ios"]')!;
    ios.checked = true;
    pick(h, false);
  };

  attachAppSearch(input, list, (h) => pick(h), () => store() === 'ios');

  form.querySelectorAll<HTMLInputElement>('input[name="store"]').forEach((r) =>
    r.addEventListener('change', () => {
      if (!picked.hidden) unpick();
      const android = store() === 'android';
      input.placeholder = android ? "Your app's name" : 'Search your app by name';
      urlField.placeholder = android ? 'Paste your Google Play link (recommended)' : 'Or paste your store link';
    }),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'gform__status';
    status.textContent = '';
    const fd = new FormData(form);
    if ((fd.get('company_website') as string)?.length) return; // bot

    const appName = input.value.trim();
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const url = urlField.value.trim();
    const errors: string[] = [];
    const flag = (el: HTMLInputElement | null, bad: boolean) => el?.setAttribute('aria-invalid', String(bad));

    flag(input, !appName && !url);
    if (!appName && !url) errors.push('your app (name or store link)');
    const urlBad = !!url && !isStoreUrl(url);
    flag(urlField, urlBad);
    if (urlBad) errors.push('an App Store or Google Play link');
    const emailEl = form.querySelector<HTMLInputElement>('input[name="email"]');
    const emailBad = !isEmail(email);
    flag(emailEl, emailBad);
    if (emailBad) errors.push('a valid email');

    if (errors.length) {
      status.classList.add('is-err');
      status.textContent = `Almost there. Please add ${errors.join(', ')}.`;
      (form.querySelector('[aria-invalid="true"]:not([hidden])') as HTMLElement | null)?.focus();
      return;
    }

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Sending…';
    try {
      const res = await sendLead({ app_name: appName, store: store(), app_id: idField.value, store_url: url, name, email, monthly_spend: String(fd.get('spend') || ''), source: 'form' });
      if (res.ok) {
        status.classList.add('is-ok');
        status.innerHTML = `<b>Done${name ? `, ${esc(name)}` : ''}.</b> Your Growth Report for ${esc(appName || 'your app')} lands in ${esc(email)} within 48 hours. Want it sooner? <a href="${config.calendlyUrl}" target="_blank" rel="noopener">Book a 30-min call</a>.`;
        form.reset();
        if (!picked.hidden) unpick();
      } else {
        status.classList.add('is-err');
        status.innerHTML = res.html;
      }
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
