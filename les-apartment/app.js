// Le's Apartment & Coffee: progressive enhancement only.
// Content lives in index.html. This file adds the live Đà Nẵng clock, motion, the photo viewer and the booking hand-off.

const CONFIG = {
  photos: 30, // img/p01.webp … img/p30.webp
  bookingUrl: 'https://www.booking.com/hotel/vn/le-39-s-apartment-amp-coffee.html',
  phone: '84914000558', // from public listings; confirm with the host before launch
  maxGuests: 6,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

// ---------- Live clock: "Now in Đà Nẵng · 16:48" ----------
const clock = $('#localTime');
const tick = () => {
  const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  clock.textContent = `Now in Đà Nẵng · ${t}`;
};
tick(); setInterval(tick, 30_000);

// ---------- Motion ----------
$$('[data-split]').forEach((el) => {
  el.innerHTML = el.innerHTML.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
});

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px' });
$$('[data-reveal]').forEach((el) => io.observe(el));

const bar = $('#bar');
const dock = $('#dock');
const book = $('#book');
const solid = () => bar.classList.toggle('is-solid', scrollY > 24);
addEventListener('scroll', solid, { passive: true }); solid();
new IntersectionObserver(([e]) => dock.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(book);

// ---------- Photo viewer ----------
const viewer = $('#viewer');
const track = $('#viewerTrack');
const count = $('#viewerCount');
const current = () => Math.round(track.scrollLeft / track.clientWidth) + 1;
const updateCount = () => { count.textContent = `${current()} / ${CONFIG.photos}`; };
function openViewer(n) {
  if (!track.children.length) {
    track.innerHTML = Array.from({ length: CONFIG.photos }, (_, i) =>
      `<img src="img/p${pad(i + 1)}.webp" alt="Photo ${i + 1} of ${CONFIG.photos}" loading="lazy" decoding="async">`).join('');
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

// ---------- Messaging (WhatsApp / Zalo) ----------
const chatUrl = (app, text) => app === 'zalo'
  ? `https://zalo.me/0${CONFIG.phone.slice(2)}`
  : `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;
const MESSAGES = {
  month: "Hello! I'd like to stay at Le's Apartment & Coffee for a month. What is your monthly rate?",
  hello: "Hello! I have a question about staying at Le's Apartment & Coffee.",
};
$$('[data-chat]').forEach((b) => b.addEventListener('click', () => window.open(chatUrl('whatsapp', MESSAGES[b.dataset.chat]), '_blank', 'noopener')));

// ---------- Booking ----------
const f = book.elements;
const today = new Date().toISOString().slice(0, 10);
f.in.min = f.out.min = today;
$$('[data-book]').forEach((b) => f.room.add(new Option(b.dataset.book, b.dataset.book)));

try {
  const s = JSON.parse(localStorage.getItem('les-booking') || '{}');
  if (s.in >= today) f.in.value = s.in;
  if (s.out > (s.in || today)) f.out.value = s.out;
  if (s.guests) f.guests.value = s.guests;
} catch {}

f.in.addEventListener('change', () => {
  f.out.min = f.in.value;
  if (f.out.value <= f.in.value) {
    const d = new Date(f.in.value); d.setDate(d.getDate() + 1);
    f.out.value = d.toISOString().slice(0, 10);
  }
});

$$('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const next = Math.min(CONFIG.maxGuests, Math.max(1, +f.guests.value + +b.dataset.step));
  if (next === +f.guests.value) return;
  f.guests.value = next;
  f.guests.classList.remove('tick'); void f.guests.offsetWidth; f.guests.classList.add('tick');
}));

$$('[data-book]').forEach((b) => b.addEventListener('click', () => {
  f.room.value = b.dataset.book;
  book.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { if (!f.in.value) f.in.focus({ preventScroll: true }); }, 600);
}));

book.addEventListener('submit', (e) => {
  e.preventDefault();
  const action = e.submitter?.value || 'booking';
  if (action === 'zalo') { window.open(chatUrl('zalo'), '_blank', 'noopener'); return; }
  if (!book.reportValidity()) return;
  const checkin = f.in.value, checkout = f.out.value, guests = f.guests.value;
  try { localStorage.setItem('les-booking', JSON.stringify({ in: checkin, out: checkout, guests })); } catch {}
  const url = action === 'whatsapp'
    ? chatUrl('whatsapp', `Hello! I'd like to stay at Le's Apartment & Coffee from ${checkin} to ${checkout}, ${guests} guest${guests > 1 ? 's' : ''}, ${f.room.value || 'any apartment'}. Is it available?`)
    : `${CONFIG.bookingUrl}?${new URLSearchParams({ checkin, checkout, group_adults: guests, group_children: 0, no_rooms: 1 })}`;
  window.open(url, '_blank', 'noopener');
});
