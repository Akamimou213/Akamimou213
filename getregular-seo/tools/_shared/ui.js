/*
 * Shared helpers for Get Regular tools (browser + Node-safe at import time).
 *
 * Privacy rules every tool follows (tools/README.md):
 *  - Answers stay in the browser. Nothing leaves the page unless the user
 *    opts in to email, after ticking the health-data consent box.
 *  - track() sends event names only, to first-party analytics. Never answers,
 *    results or tool-specific health labels. No ad pixels on tool pages.
 */

export const APP_STORE = "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690";
// App Store Custom Product Page IDs, filled in once approved in App Store Connect.
export const PPIDS = {};
// [CONFIRM] Email endpoint (Kit form or first-party route with double opt-in).
export const EMAIL_ENDPOINT = "";
export const CONSENT_TEXT_VERSION = "2026-10-20";

export function track(name, props = {}) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer || []).push({ event: name, ...props });
}

export function appStoreUrl({ cpp = "default", ct }) {
  const u = new URL(APP_STORE);
  if (PPIDS[cpp]) u.searchParams.set("ppid", PPIDS[cpp]);
  u.searchParams.set("pt", "PROVIDER_TOKEN"); // [CONFIRM] App Store Connect provider token
  u.searchParams.set("ct", ct);
  u.searchParams.set("mt", "8");
  return u.toString();
}

/* Point every .js-appstore link at the App Store with its CPP + campaign token. */
export function wireAppStore(tool) {
  if (typeof document === "undefined") return;
  document.querySelectorAll(".js-appstore").forEach((a) => {
    a.href = appStoreUrl({ cpp: a.dataset.cpp || "default", ct: a.dataset.ct || tool });
    a.rel = "noopener";
    a.addEventListener("click", () => track("app_store_click", { tool, placement: a.dataset.ct }));
  });
}

/* Line icons in the style of the brand creatives (1.3px strokes). */
export const ICONS = {
  meals: '<svg viewBox="0 0 24 24"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 0-3 2.2-3 5s1.3 4 3 4v9M16 3v18"/></svg>',
  stool: '<svg viewBox="0 0 24 24"><path d="M12 4c1.6 1.2 2 2.4 1.4 3.5 2.3.2 3.6 1.6 3.4 3.4 2 .5 3.2 2 3.2 3.8 0 2.4-2.4 4.3-8 4.3s-8-1.9-8-4.3c0-1.8 1.2-3.3 3.2-3.8-.2-1.8 1.1-3.2 3.4-3.4C10 6.4 10.6 5 12 4z"/></svg>',
  checkins: '<svg viewBox="0 0 24 24"><path d="M5 20v-5M10 20V10M15 20v-8M20 20V5"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.4 6 7.6 6 10.5A6 6 0 0 1 6 13.5C6 10.6 8.5 7.4 12 3z"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19c3-4 6-6.5 9.5-8.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  palette: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.2-1-1.5-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg>',
  wave: '<svg viewBox="0 0 24 24"><path d="M3 13c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 3 3M3 18c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 3 3"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
};

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function sourceLinks(keys, SOURCES) {
  return keys.map((k) => `<a href="${esc(SOURCES[k].url)}">${esc(SOURCES[k].label)}</a>`).join(" · ");
}

/* Wire an optional, consented email form. getPayload() returns the
 * tool-specific fields; health fields are only sent because the user ticked
 * the consent box, and only to our email endpoint. */
export function wireEmail(form, { tool, getPayload }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type=email]").value.trim();
    const health = form.querySelector("[name=consentHealth]");
    const news = form.querySelector("[name=consentNews]");
    const msg = form.querySelector("[role=status]");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = "Please enter a valid email."; return; }
    if (health && !health.checked) { msg.textContent = "Please tick the consent box so we can store your answers to send them to you."; return; }
    const payload = { email, tool, consent_health: !!health?.checked, consent_marketing: !!news?.checked,
      consent_text_version: CONSENT_TEXT_VERSION, ...getPayload() };
    if (!EMAIL_ENDPOINT) { msg.textContent = "Prototype: no email endpoint configured. Payload logged to the console."; console.log(payload); return; }
    try {
      const res = await fetch(EMAIL_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      msg.textContent = "Check your inbox to confirm, then it's on the way.";
      track("email_submit", { tool, marketing_opt_in: payload.consent_marketing });
    } catch { msg.textContent = "Something went wrong. Please try again."; }
  });
}

/* Original stool drawings (not the licensed BSFS/Norgine artwork).
 * Shapes use fill="url(#G)" / stroke="url(#G)"; stoolSvg() swaps G for a
 * per-drawing gradient so they read as soft, shaded forms. */
const SH = (cx, w) => `<ellipse cx="${cx}" cy="41" rx="${w}" ry="2.6" fill="#000" opacity=".28"/>`;
const HL = 'fill="none" stroke="#fff" stroke-linecap="round" opacity=".32"';
const CR = 'fill="none" stroke="#000" stroke-linecap="round" opacity=".22"';
export const STOOL_SVG = {
  1: SH(64, 54) +
     '<path fill="url(#G)" d="M9 27c-1-6 3-11 9-11s10 5 9 11-4 9-9 9-8-3-9-9z"/>' +
     '<path fill="url(#G)" d="M33 24c0-5 4-8 8-8s8 3 8 8-3 9-8 9-8-4-8-9z"/>' +
     '<path fill="url(#G)" d="M54 28c-1-6 4-10 10-10s9 5 9 10-4 8-9 8-9-2-10-8z"/>' +
     '<path fill="url(#G)" d="M79 25c0-5 3-8 7-8s8 3 8 8-4 8-8 8-7-3-7-8z"/>' +
     '<path fill="url(#G)" d="M100 28c0-6 4-10 10-9s9 5 8 10-5 8-10 7-8-3-8-8z"/>' +
     `<path ${HL} stroke-width="2" d="M13 21q4-3 8-1M37 20q3-2 6 0M58 22q4-2 8 0M82 21q3-2 6 0M104 23q4-2 8 0"/>`,
  2: SH(64, 56) +
     '<path fill="url(#G)" d="M9 27c-1-8 6-12 13-10 3-6 12-7 17-2 5-5 13-5 18 0 5-5 14-4 18 1 5-4 14-3 18 3 7-2 15 2 15 9 0 7-7 11-14 9-4 6-13 7-18 2-5 5-14 5-19 0-5 5-13 5-18 0-6 5-14 4-17-2-7 1-12-3-13-10z"/>' +
     `<path ${CR} stroke-width="1.6" d="M39 17q-2 9 1 17M57 16q-2 9 1 18M75 16q-2 10 1 18M93 18q-2 8 1 16"/>` +
     `<path ${HL} stroke-width="2.2" d="M18 19q6-3 12-1M44 17q5-2 10 0M62 17q5-2 10 0M80 17q5-2 10 0M96 21q4-2 7 0"/>`,
  3: SH(65, 56) +
     '<path fill="url(#G)" d="M14 22c2-6 9-9 18-9h66c11 0 19 4 20 11s-7 12-19 12H31c-11 0-19-6-17-14z"/>' +
     `<path ${CR} stroke-width="1.7" d="M34 14l2 4-2 3M55 35l1-4 3-3M76 14l1 4-2 4M97 35l1-4 2-3"/>` +
     `<path ${HL} stroke-width="2.4" d="M28 17q30-4 64-2"/>`,
  4: SH(66, 56) +
     '<path fill="none" stroke="url(#G)" stroke-width="15" stroke-linecap="round" d="M12 28c13-14 31-15 50-6s38 10 56-4"/>' +
     `<path ${HL} stroke-width="2.6" d="M18 23c12-10 27-11 43-4M76 25c13 4 26 2 37-5"/>`,
  5: SH(66, 56) +
     '<path fill="url(#G)" d="M9 26c0-6 6-9 13-9s13 3 13 9-6 9-13 9-13-3-13-9z"/>' +
     '<path fill="url(#G)" d="M41 22c0-6 6-9 13-9s14 3 14 9-7 9-14 9-13-3-13-9z"/>' +
     '<path fill="url(#G)" d="M75 27c0-5 6-8 13-8s12 3 12 8-5 8-12 8-13-3-13-8z"/>' +
     '<path fill="url(#G)" d="M105 22c0-4 4-7 9-7s9 3 9 7-4 7-9 7-9-3-9-7z"/>' +
     `<path ${HL} stroke-width="2" d="M15 21q6-2 12 0M47 17q6-2 12 0M81 23q6-2 12 0M109 18q4-1 8 0"/>`,
  6: SH(65, 58) +
     '<path fill="url(#G)" d="M8 33c1-7 6-8 9-12 2 4 6 2 8-2 3 4 8 0 10-4 2 5 8 2 11-1 2 5 7 4 10 0 2 4 8 4 11 0 2 5 8 3 10-1 3 5 9 4 12 1 2 5 8 4 11 2 3 5 9 5 10 12 1 4-3 6-8 6l-6-2-6 3-7-2-7 3-7-3-8 3-7-3-7 2-7-3-7 3-7-2-6 2c-5 0-8-2-7-5z"/>' +
     `<path ${CR} stroke-width="1.4" d="M28 27q3 2 6 0M52 25q3 2 6 0M76 26q3 2 6 0M99 27q3 2 6 0"/>` +
     `<path ${HL} stroke-width="1.8" d="M20 25q4-3 8-2M44 22q5-3 9-1M68 22q4-3 9-1M92 23q4-3 8-1"/>`,
  7: '<path fill="url(#G)" opacity=".85" d="M10 33c4-5 13-4 20-6 6-2 12-6 21-4 7 2 12 1 19-1 9-2 16 2 24 2 7 0 14-2 20 1 6 3 7 8 2 10-8 3-18 2-27 3-10 1-20 1-30 1-11 0-22 1-31-1-8-1-21-1-18-5z"/>' +
     `<path ${HL} stroke-width="2" d="M30 30q10-3 20-3M66 28q12-2 22 0M98 30q6 0 10 2"/>` +
     '<ellipse cx="22" cy="23" rx="3" ry="2.4" fill="url(#G)" opacity=".7"/><ellipse cx="112" cy="24" rx="2.4" ry="2" fill="url(#G)" opacity=".7"/>',
};

const SHADES = { "#e3c9a0": ["#f3e2c4", "#e3c9a0", "#b4925f"], "#6b4f35": ["#8f6c4b", "#6b4f35", "#4a3524"] };
let gid = 0;
export function stoolSvg(t, color = "#e3c9a0") {
  const [hi, mid, lo] = SHADES[color] || [color, color, color];
  const id = `gst${++gid}`;
  return `<svg viewBox="0 0 130 46" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>${STOOL_SVG[t].replaceAll("url(#G)", `url(#${id})`)}</svg>`;
}

/*
 * One-question-at-a-time stepper shared by the question-based tools.
 * questions: array, or (answers) => array for branching. Single-choice
 * questions auto-advance; multi-choice ones use Next. Options may set
 * `exclusive` (e.g. "None of these").
 */
/* questions may include { fact: true, ... } screens; renderFact(q) returns their HTML. */
const ADVANCE_MS = 650;
export function createStepper({ questions, els, artFor, renderFact, onDone, onStep, onChange, tool, history: useHistory = false }) {
  const answers = {};
  let i = 0, pending = null;
  const list = () => (typeof questions === "function" ? questions(answers) : questions);
  const $ = (k) => els[k];
  function dots(n, cur) {
    $("dots").innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < cur ? "done" : k === cur ? "now" : ""}"></i>`).join("");
  }
  function render() {
    const qs = list(); const q = qs[i];
    dots(qs.length, i);
    const real = qs.filter((x) => !x.fact), n = qs.slice(0, i + 1).filter((x) => !x.fact).length;
    $("stepTxt").textContent = q.fact ? "Did you know" : `${n} / ${real.length}`;
    $("title").textContent = q.title;
    $("help").textContent = q.help || ""; $("help").hidden = !q.help;
    const box = $("opts");
    if (!pending) box.classList.remove("locked");
    if (q.fact) {
      box.className = "opts fact-box"; box.removeAttribute("aria-label");
      box.innerHTML = renderFact ? renderFact(q) : "";
      const v = $("view"); v.classList.remove("enter"); void v.offsetWidth; v.classList.add("enter");
      $("back").style.visibility = "visible";
      $("next").disabled = false; $("next").textContent = "Continue";
      return;
    }
    box.className = "opts" + (q.tiles ? " tiles" : "") + (pending ? " locked" : "");
    box.setAttribute("aria-label", q.title);
    box.innerHTML = "";
    for (const o of q.options) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt";
      b.setAttribute("aria-pressed", String(q.multi ? (answers[q.id] || []).includes(o.v) : answers[q.id] === o.v));
      b.innerHTML = (artFor ? artFor(q, o) : "") + `<span class="t">${esc(o.label)}</span>` + (o.desc ? `<span class="d">${esc(o.desc)}</span>` : "");
      b.onclick = () => choose(q, o);
      box.appendChild(b);
    }
    const v = $("view"); v.classList.remove("enter"); void v.offsetWidth; v.classList.add("enter");
    $("back").style.visibility = i === 0 ? "hidden" : "visible";
    $("next").disabled = q.multi ? !(answers[q.id] || []).length : answers[q.id] === undefined;
    $("next").textContent = i === qs.length - 1 ? "See my result" : "Next";
  }
  function choose(q, o) {
    if (q.multi) {
      let cur = answers[q.id] || [];
      cur = o.exclusive ? (cur.includes(o.v) ? [] : [o.v]) : (cur.includes(o.v) ? cur.filter((x) => x !== o.v) : [...cur.filter((x) => x !== "none"), o.v]);
      answers[q.id] = cur; onChange && onChange(answers); render();
    } else {
      // Show the choice for a moment, then move on. Taps during the pause are
      // ignored, so a double tap can't skip the next question.
      if (pending) return;
      answers[q.id] = o.v; onChange && onChange(answers); render();
      $("opts").classList.add("locked");
      pending = setTimeout(() => { pending = null; next(); }, ADVANCE_MS);
    }
  }
  function next() {
    const qs = list();
    if (i < qs.length - 1) {
      i++; onStep && onStep(i); track("quiz_step", { tool, step: i });
      if (useHistory) try { window.history.pushState({ step: i }, ""); } catch {}
      render();
    }
    else { dots(qs.length, 99); $("stepTxt").textContent = "Your result"; onDone(answers); }
  }
  $("next").onclick = next;
  $("back").onclick = () => { if (pending) { clearTimeout(pending); pending = null; } if (i > 0) { if (useHistory) { window.history.back(); } else { i--; render(); } } };
  if (useHistory) window.addEventListener("popstate", (e) => { const s = e.state && typeof e.state.step === "number" ? e.state.step : 0; if (s < i) { i = s; render(); } });
  return { answers, render, get step() { return i; }, reset() { for (const k in answers) delete answers[k]; i = 0; render(); } };
}


/* ---------- Browser storage that never breaks the page ---------- */
export const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

/* ---------- Seamless handoff to the app ----------
 * iPhone/iPad: App Store button (+ the native Smart App Banner from <head>).
 * Desktop/Android: a QR code to open the listing on an iPhone, because nobody
 * installs an iOS app from a laptop. Needs qrcode-generator (cdnjs) on the page. */
export const isIOS = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent || "") ;
export const isDesktop = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;

export function qrSvg(text, size = 132) {
  if (typeof qrcode === "undefined") return "";
  const q = qrcode(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(), c = size / (n + 8);
  let d = "";
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) d += `M${((k + 4) * c).toFixed(2)} ${((r + 4) * c).toFixed(2)}h${c.toFixed(2)}v${c.toFixed(2)}h-${c.toFixed(2)}z`;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR code to open Get Regular on the App Store"><rect width="${size}" height="${size}" rx="14" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}

const APPLE = '<svg class="apple" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.37 1.43c0 1.14-.42 2.2-1.1 2.98-.82.95-2.04 1.6-3.07 1.52-.13-1.1.42-2.26 1.1-3 .77-.85 2.08-1.5 3.07-1.5zM20.5 17.3c-.55 1.27-.82 1.84-1.53 2.97-1 1.56-2.4 3.5-4.13 3.51-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.06-1.77-4.06-3.33C-.12 16.1-.42 11 1.33 8.3c1.24-1.93 3.2-3.05 5.04-3.05 1.87 0 3.05 1.02 4.6 1.02 1.5 0 2.42-1.02 4.58-1.02 1.64 0 3.38.9 4.62 2.44-4.06 2.22-3.4 8.02.33 9.6z"/></svg>';

export function renderHandoff(el, { cpp = "default", ct, title, body, cta = "Continue in the app" }) {
  // Always a direct App Store button: most searchers are already on their phone.
  const url = appStoreUrl({ cpp, ct });
  el.innerHTML = `<div class="handoff">
    <div class="handoff-copy"><p class="h3" style="margin:0 0 6px">${esc(title)}</p><p class="muted small" style="margin:0">${esc(body)}</p></div>
    <a class="btn btn-white" href="${url}" rel="noopener">${APPLE}${esc(cta)}</a>
  </div>`;
  el.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => track("app_store_click", { placement: ct })));
}

/* Sticky bottom bar on phones, shown once the visitor has engaged. */
export function showStickyBar({ cpp = "default", ct, text }) {
  if (typeof document === "undefined" || isDesktop()) return;
  let bar = document.getElementById("stickyBar");
  if (!bar) {
    bar = document.createElement("div"); bar.id = "stickyBar"; bar.className = "sticky-bar no-print";
    document.body.appendChild(bar);
  }
  bar.innerHTML = `<span>${esc(text)}</span><a class="btn btn-white btn-sm" href="${appStoreUrl({ cpp, ct })}" rel="noopener">${APPLE}Get the app</a>`;
  bar.querySelector("a").addEventListener("click", () => track("app_store_click", { placement: ct }));
  document.body.classList.add("has-sticky");
  requestAnimationFrame(() => bar.classList.add("on"));
}
