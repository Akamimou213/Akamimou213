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

export function stoolSvg(t, color = "#8a6a4b") {
  return `<svg viewBox="0 0 130 46" fill="${color}" color="${color}" aria-hidden="true">${STOOL_SVG[t]}</svg>`;
}
