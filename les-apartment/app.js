// Le's Apartment & Coffee: progressive enhancement only. Plan: DESIGN.md
// Content lives in index.html. This file runs the day's sky, the photo viewer,
// the date sheet and the booking hand-off. Booking patterns follow Booking.com,
// Tripadvisor, Vrbo, Agoda and Airbnb on Mobbin (see README).

const CONFIG = {
  photos: 30, // img/p01.webp … img/p30.webp (the building)
  bookingUrl: 'https://www.booking.com/hotel/vn/le-39-s-apartment-amp-coffee.html',
  phone: '84914000558', // from public listings; confirm with the host before launch
  address: '252 Dương Đình Nghệ, An Hải Bắc, Sơn Trà, Đà Nẵng',
  maxGuests: 6,
  monthsAhead: 12,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

// ---------- The day's sky ----------
const skyIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) document.body.dataset.sky = e.target.dataset.sky; });
}, { rootMargin: '-50% 0px -50% 0px' });
$$('[data-sky]').forEach((el) => skyIO.observe(el));

const bar = $('#bar');
addEventListener('scroll', () => bar.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
const dock = $('#dock');
const book = $('#book');
let pastHero = false, atBook = false;
const syncDock = () => dock.classList.toggle('is-on', pastHero && !atBook);
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; syncDock(); }).observe($('.hero__actions'));
new IntersectionObserver(([e]) => { atBook = e.isIntersecting; syncDock(); }).observe(book);

// ---------- Photo viewer (the building) ----------
const viewer = $('#viewer');
const track = $('#viewerTrack');
const count = $('#viewerCount');
const current = () => Math.round(track.scrollLeft / track.clientWidth) + 1;
const updateCount = () => { count.textContent = `${current()} of ${CONFIG.photos}`; };
function openViewer(n) {
  if (!track.children.length) {
    track.innerHTML = Array.from({ length: CONFIG.photos }, (_, i) =>
      `<img src="img/p${pad(i + 1)}.webp" alt="Photo ${i + 1} of ${CONFIG.photos} of the building" loading="lazy" decoding="async">`).join('');
  }
  viewer.showModal();
  track.scrollTo({ left: (n - 1) * track.clientWidth, behavior: 'instant' });
  updateCount();
}
track.addEventListener('scroll', updateCount, { passive: true });
viewer.addEventListener('keydown', (e) => {
  const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (d) track.scrollTo({ left: (current() - 1 + d) * track.clientWidth, behavior: 'smooth' });
});
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
$$('[data-photo]').forEach((b) => b.addEventListener('click', () => openViewer(+b.dataset.photo)));

// ---------- Booking state (one source of truth) ----------
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const nights = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const fmt = (s) => parse(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const today = iso(new Date());

const state = { in: '', out: '', guests: 2, room: '' };
try {
  const s = JSON.parse(localStorage.getItem('les-booking') || '{}');
  if (s.in >= today && s.out > s.in) { state.in = s.in; state.out = s.out; }
  if (s.guests) state.guests = Math.min(CONFIG.maxGuests, Math.max(1, +s.guests));
} catch {}
const save = () => { try { localStorage.setItem('les-booking', JSON.stringify(state)); } catch {} };

const err = $('#bookError');
function render() {
  $$('[data-show="in"]').forEach((el) => { el.textContent = state.in ? fmt(state.in) : 'Add date'; });
  $$('[data-show="out"]').forEach((el) => { el.textContent = state.out ? fmt(state.out) : 'Add date'; });
  $$('[data-show="room"]').forEach((el) => { el.hidden = !state.room; el.textContent = state.room; });
  $('#guests').textContent = state.guests;
  renderSheet();
}

// ---------- Date sheet ----------
const sheet = $('#dates');
const cal = $('#cal');
const sum = $('#sum');
const done = $('#datesDone');

function buildCalendar() {
  const start = new Date(); start.setDate(1);
  let html = '';
  for (let m = 0; m < CONFIG.monthsAhead; m++) {
    const first = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // Monday first
    html += `<section class="cal__month"><h3>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3><div class="cal__grid">`;
    html += '<span></span>'.repeat(lead);
    for (let d = 1; d <= days; d++) {
      const key = iso(new Date(first.getFullYear(), first.getMonth(), d));
      const label = parse(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      html += `<button type="button" class="cal__day${key === today ? ' is-today' : ''}" data-day="${key}" aria-label="${label}"${key < today ? ' disabled' : ''}>${d}</button>`;
    }
    html += '</div></section>';
  }
  cal.innerHTML = html;
}

function renderSheet() {
  if (!cal.children.length) return;
  $$('.cal__day', cal).forEach((b) => {
    const k = b.dataset.day;
    const isStart = k === state.in, isEnd = k === state.out;
    b.classList.toggle('is-start', isStart);
    b.classList.toggle('has-end', isStart && !!state.out);
    b.classList.toggle('is-end', isEnd);
    b.classList.toggle('is-range', !!(state.in && state.out && k > state.in && k < state.out));
    b.setAttribute('aria-pressed', String(isStart || isEnd));
  });
  if (state.in && state.out) {
    const n = nights(state.in, state.out);
    sum.innerHTML = `<b>${fmt(state.in)} to ${fmt(state.out)}</b>, ${n} night${n > 1 ? 's' : ''}${n >= 28 ? '. Ask the host for a monthly rate.' : ''}`;
  } else if (state.in) {
    sum.innerHTML = `<b>${fmt(state.in)}</b>. Now choose your check-out day.`;
  } else {
    sum.textContent = 'Choose your check-in day';
  }
  done.disabled = !(state.in && state.out);
}

cal.addEventListener('click', (e) => {
  const b = e.target.closest('.cal__day');
  if (!b || b.disabled) return;
  const k = b.dataset.day;
  if (!state.in || state.out || k <= state.in) { state.in = k; state.out = ''; }
  else state.out = k;
  err.textContent = '';
  render();
});

const nextFriday = () => { const d = new Date(); const add = (5 - d.getDay() + 7) % 7; d.setDate(d.getDate() + add); return iso(d); };
$$('[data-quick]').forEach((b) => b.addEventListener('click', () => {
  const q = b.dataset.quick;
  if (q === 'weekend') { state.in = nextFriday(); state.out = addDays(state.in, 2); }
  else {
    const from = state.in && state.in >= today ? state.in : addDays(today, 1);
    state.in = from; state.out = addDays(from, q === 'week' ? 7 : 30);
  }
  render();
  cal.querySelector(`[data-day="${state.in}"]`)?.scrollIntoView({ block: 'center' });
}));

function openDates(room) {
  if (room !== undefined) state.room = room;
  if (!cal.children.length) buildCalendar();
  render();
  sheet.showModal();
  const target = cal.querySelector(`[data-day="${state.in || today}"]`);
  target?.scrollIntoView({ block: 'center' });
}
$$('[data-open-dates]').forEach((b) => b.addEventListener('click', () => openDates()));
$$('[data-book]').forEach((b) => b.addEventListener('click', () => openDates(b.dataset.book)));
$('[data-close]', sheet).addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
$('#clearDates').addEventListener('click', () => { state.in = state.out = ''; render(); });
done.addEventListener('click', () => {
  save(); sheet.close();
  book.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('[data-go="booking"]').focus({ preventScroll: true }), 500);
});

$$('[data-step]').forEach((b) => b.addEventListener('click', () => {
  state.guests = Math.min(CONFIG.maxGuests, Math.max(1, state.guests + +b.dataset.step));
  save(); render();
}));

// ---------- Hand-off: Booking.com, WhatsApp, Zalo ----------
const open = (url) => window.open(url, '_blank', 'noopener');
const whatsapp = (text) => `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;
const zalo = () => `https://zalo.me/0${CONFIG.phone.slice(2)}`;
const MESSAGES = {
  hello: "Hello! I have a question about staying at Le's Apartment & Coffee.",
  month: "Hello! I'd like to stay at Le's Apartment & Coffee for a month. What is your monthly rate?",
};
$$('[data-chat]').forEach((b) => b.addEventListener('click', () => open(whatsapp(MESSAGES[b.dataset.chat]))));

$$('[data-go]').forEach((b) => b.addEventListener('click', () => {
  const go = b.dataset.go;
  if (go === 'zalo') { open(zalo()); return; }
  if (!state.in || !state.out) { err.textContent = 'Choose your dates first.'; openDates(); return; }
  err.textContent = '';
  save();
  const n = state.guests;
  open(go === 'whatsapp'
    ? whatsapp(`Hello! I'd like to stay at Le's Apartment & Coffee from ${state.in} to ${state.out}, ${n} guest${n > 1 ? 's' : ''}, ${state.room || 'any apartment'}. Is it available?`)
    : `${CONFIG.bookingUrl}?${new URLSearchParams({ checkin: state.in, checkout: state.out, group_adults: n, group_children: 0, no_rooms: 1 })}`);
}));

const copyBtn = $('#copyAddr');
copyBtn?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.address); copyBtn.textContent = 'Address copied'; }
  catch { copyBtn.textContent = CONFIG.address; }
});

render();
