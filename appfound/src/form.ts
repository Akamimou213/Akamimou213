import { config } from './config';
import { track } from './track';

type AppHit = { trackId: number; trackName: string; artistName: string; artworkUrl100: string; trackViewUrl: string; averageUserRating?: number; userRatingCount?: number };

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
async function searchAppStore(term: string): Promise<AppHit[]> {
  const url = `https://itunes.apple.com/search?entity=software&limit=6&term=${encodeURIComponent(term)}`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()).results as AppHit[];
  } catch {
    return new Promise((resolve) => {
      const cb = `af_cb_${Date.now()}`;
      const s = document.createElement('script');
      const done = (v: AppHit[]) => { delete (window as any)[cb]; s.remove(); resolve(v); };
      (window as any)[cb] = (data: { results: AppHit[] }) => done(data.results || []);
      s.src = `${url}&callback=${cb}`;
      s.onerror = () => done([]);
      document.head.appendChild(s);
      setTimeout(() => done([]), 6000);
    });
  }
}

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
  let hits: AppHit[] = [];
  let active = -1;
  let timer: number | undefined;
  let seq = 0;

  const closeList = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; };
  const render = () => {
    if (!hits.length) {
      list.innerHTML = `<li class="empty">No match on the App Store. Paste your store link below instead.</li>`;
    } else {
      list.innerHTML = hits.map((h, i) => `
        <li role="option" id="app-opt-${i}" aria-selected="${i === active}" data-i="${i}">
          <img src="${esc(h.artworkUrl100)}" alt="" width="40" height="40" loading="lazy" />
          <div><b>${esc(h.trackName)}</b><span>${esc(h.artistName)}${h.userRatingCount ? ` · ★ ${h.averageUserRating?.toFixed(1)} (${h.userRatingCount.toLocaleString('en-US')})` : ''}</span></div>
        </li>`).join('');
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', active >= 0 ? `app-opt-${active}` : '');
  };

  const pick = (h: AppHit) => {
    idField.value = String(h.trackId);
    iconField.value = h.artworkUrl100;
    urlField.value = h.trackViewUrl.split('?')[0];
    input.value = h.trackName;
    input.hidden = true;
    picked.hidden = false;
    picked.innerHTML = `<img src="${esc(h.artworkUrl100)}" alt="" /><div><b>${esc(h.trackName)}</b><span>${esc(h.artistName)}</span></div><button type="button">Change</button>`;
    picked.querySelector('button')!.addEventListener('click', unpick);
    closeList();
    form.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  };
  const unpick = () => {
    idField.value = iconField.value = urlField.value = '';
    picked.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  };

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    window.clearTimeout(timer);
    const q = input.value.trim();
    if (store() !== 'ios' || q.length < 2) return closeList();
    timer = window.setTimeout(async () => {
      const mine = ++seq;
      hits = await searchAppStore(q);
      if (mine !== seq) return;
      active = -1;
      render();
    }, 280);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden || !hits.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % hits.length; render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + hits.length) % hits.length; render(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(hits[active]); }
    else if (e.key === 'Escape') closeList();
  });
  list.addEventListener('mousedown', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li) { e.preventDefault(); pick(hits[Number(li.dataset.i)]); }
  });
  input.addEventListener('blur', () => setTimeout(closeList, 120));

  form.querySelectorAll<HTMLInputElement>('input[name="store"]').forEach((r) =>
    r.addEventListener('change', () => {
      if (!picked.hidden) unpick();
      closeList();
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
    const urlBad = !!url && !/^(https?:\/\/)?(apps\.apple\.com|itunes\.apple\.com|play\.google\.com)\//i.test(url);
    flag(urlField, urlBad);
    if (urlBad) errors.push('an App Store or Google Play link');
    const nameEl = form.querySelector<HTMLInputElement>('input[name="name"]');
    flag(nameEl, !name);
    if (!name) errors.push('your first name');
    const emailEl = form.querySelector<HTMLInputElement>('input[name="email"]');
    const emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    flag(emailEl, emailBad);
    if (emailBad) errors.push('a valid email');

    if (errors.length) {
      status.classList.add('is-err');
      status.textContent = `Almost there. Please add ${errors.join(', ')}.`;
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }

    const payload = {
      app_name: appName,
      store: store(),
      app_id: idField.value,
      store_url: url,
      name,
      email,
      monthly_spend: String(fd.get('spend') || ''),
      page: location.href,
      submitted_at: new Date().toISOString(),
      ...utms(),
    };
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Sending…';

    // Only non-personal fields go to ad pixels
    track('growth_plan_submit', { store: payload.store, monthly_spend: payload.monthly_spend });

    try {
      if (!config.formEndpoint) throw new Error('no-endpoint');
      const r = await fetch(config.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(String(r.status));
      status.classList.add('is-ok');
      status.textContent = `Got it, ${name}. Your Growth Plan for ${appName || 'your app'} lands in ${email} within 48 hours.`;
      form.reset();
      if (!picked.hidden) unpick();
    } catch (err) {
      // No endpoint configured (or it failed): never lose the lead. Copy the request and point to LinkedIn.
      if ((err as Error).message === 'no-endpoint') console.warn('[appfound] Set config.formEndpoint to receive Growth Plan requests.');
      const msg = `Hi Mohamed, I'd like a free Growth Plan.\nApp: ${appName || '-'} (${payload.store})\nStore link: ${url || '-'}\nName: ${name}\nEmail: ${email}\nMonthly ad spend: ${payload.monthly_spend || '-'}`;
      let copied = false;
      try { await navigator.clipboard.writeText(msg); copied = true; } catch { /* clipboard blocked */ }
      status.classList.add('is-err');
      status.innerHTML = `We couldn't send this automatically. ${copied ? 'Your request is copied.' : 'Copy the request below.'} Send it to Mohamed on <a href="${config.linkedinUrl}" target="_blank" rel="noopener">LinkedIn</a> and he'll reply within 48 hours.<pre>${esc(msg)}</pre>`;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
