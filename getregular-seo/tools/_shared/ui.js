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

/* Original stool drawings (not the licensed BSFS/Norgine artwork). */
export const STOOL_SVG = {
  1: '<circle cx="18" cy="24" r="8"/><circle cx="40" cy="20" r="7"/><circle cx="60" cy="27" r="8"/><circle cx="82" cy="21" r="7"/><circle cx="104" cy="26" r="8"/>',
  2: '<path d="M10 24c0-9 9-12 16-10 5-6 14-6 19 0 5-5 14-5 19 1 6-5 15-4 19 2 7-2 15 2 15 9s-8 11-15 9c-4 6-13 7-19 2-5 5-14 5-19 0-5 6-14 6-19 0-7 2-16-1-16-13z"/>',
  3: '<rect x="8" y="13" width="114" height="22" rx="11"/><path d="M30 14v8M52 26v8M74 14v7M96 27v7" stroke="#f7f5f2" stroke-width="2.5" stroke-linecap="round"/>',
  4: '<path d="M8 26c14-16 34-16 54-6s40 10 60-4" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="round"/>',
  5: '<ellipse cx="22" cy="25" rx="13" ry="9"/><ellipse cx="54" cy="21" rx="14" ry="9"/><ellipse cx="88" cy="27" rx="13" ry="8"/><ellipse cx="113" cy="21" rx="9" ry="7"/>',
  6: '<path d="M10 28c3-10 12-8 16-13 3 6 11 1 14 7 5-6 13-2 16 3 5-5 12-3 15 2 4-5 13-2 15 4 5-3 14 0 14 7-5 4-12 2-16 5-6-3-11 3-17 0-6 4-12-1-18 1-6-3-12 3-18-1-7 3-13-3-21-15z"/>',
  7: '<path d="M8 30c10-8 22 2 34-3s20-6 32 0 24 4 34-2c6 4 6 10 0 12-34 6-70 6-100 0-4-2-4-5 0-7z" opacity=".75"/>',
  mixed: '<circle cx="22" cy="24" r="8"/><circle cx="42" cy="22" r="7"/><path d="M62 30c6-8 16 2 26-3s16-4 28 1c4 3 4 7 0 9-18 4-38 4-54 0-3-2-3-5 0-7z" opacity=".75"/>',
};

export function stoolSvg(t, color = "#e3c9a0") {
  return `<svg viewBox="0 0 130 46" fill="${color}" color="${color}" aria-hidden="true">${STOOL_SVG[t]}</svg>`;
}

/*
 * One-question-at-a-time stepper shared by the question-based tools.
 * questions: array, or (answers) => array for branching. Single-choice
 * questions auto-advance; multi-choice ones use Next. Options may set
 * `exclusive` (e.g. "None of these").
 */
export function createStepper({ questions, els, artFor, onDone, onStep, tool }) {
  const answers = {};
  let i = 0;
  const list = () => (typeof questions === "function" ? questions(answers) : questions);
  const $ = (k) => els[k];
  function dots(n, cur) {
    $("dots").innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < cur ? "done" : k === cur ? "now" : ""}"></i>`).join("");
  }
  function render() {
    const qs = list(); const q = qs[i];
    dots(qs.length, i);
    $("stepTxt").textContent = `${i + 1} / ${qs.length}`;
    $("title").textContent = q.title;
    $("help").textContent = q.help || ""; $("help").hidden = !q.help;
    const box = $("opts");
    box.className = "opts" + (q.tiles ? " tiles" : "");
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
      answers[q.id] = cur; render();
    } else { answers[q.id] = o.v; render(); setTimeout(next, 260); }
  }
  function next() {
    const qs = list();
    if (i < qs.length - 1) { i++; onStep && onStep(i); track("quiz_step", { tool, step: i }); render(); }
    else { dots(qs.length, 99); $("stepTxt").textContent = "Your result"; onDone(answers); }
  }
  $("next").onclick = next;
  $("back").onclick = () => { if (i > 0) { i--; render(); } };
  return { answers, render, reset() { for (const k in answers) delete answers[k]; i = 0; render(); } };
}
