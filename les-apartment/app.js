// Le's Apartment & Coffee: progressive enhancement only. Plan: DESIGN.md
// Content lives in index.html. This file runs the day's sky, the photo viewer and the booking hand-off.

const CONFIG = {
  photos: 30, // img/p01.webp … img/p30.webp (the building)
  bookingUrl: 'https://www.booking.com/hotel/vn/le-39-s-apartment-amp-coffee.html',
  phone: '84914000558', // from public listings; confirm with the host before launch
  address: '252 Dương Đình Nghệ, An Hải Bắc, Sơn Trà, Đà Nẵng',
  maxGuests: 6,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

// ---------- The day's sky ----------
// Whichever [data-sky] block crosses the middle of the screen sets the page's sky.
const skyIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) document.body.dataset.sky = e.target.dataset.sky; });
}, { rootMargin: '-50% 0px -50% 0px' });
$$('[data-sky]').forEach((el) => skyIO.observe(el));

// Header hairline once the page moves; the phone's Book bar once the hero has gone.
const bar = $('#bar');
addEventListener('scroll', () => bar.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
const dock = $('#dock');
const book = $('#book');
let pastHero = false, atForm = false;
const syncDock = () => dock.classList.toggle('is-on', pastHero && !atForm);
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; syncDock(); }).observe($('.hero__actions'));
new IntersectionObserver(([e]) => { atForm = e.isIntersecting; syncDock(); }).observe(book);

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

// ---------- Messaging and the address ----------
const open = (url) => window.open(url, '_blank', 'noopener');
const whatsapp = (text) => `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;
const zalo = () => `https://zalo.me/0${CONFIG.phone.slice(2)}`;
const MESSAGES = {
  hello: "Hello! I have a question about staying at Le's Apartment & Coffee.",
  month: "Hello! I'd like to stay at Le's Apartment & Coffee for a month. What is your monthly rate?",
};
$$('[data-chat]').forEach((b) => b.addEventListener('click', () => open(whatsapp(MESSAGES[b.dataset.chat]))));

const copyBtn = $('#copyAddr');
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.address); copyBtn.textContent = 'Address copied'; }
  catch { copyBtn.textContent = CONFIG.address; }
});

// ---------- Booking ----------
const f = book.elements;
const err = $('#bookError');
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
  err.textContent = '';
  f.out.min = f.in.value;
  if (f.out.value <= f.in.value) {
    const d = new Date(f.in.value); d.setDate(d.getDate() + 1);
    f.out.value = d.toISOString().slice(0, 10);
  }
});
f.out.addEventListener('change', () => { err.textContent = ''; });

$$('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const next = Math.min(CONFIG.maxGuests, Math.max(1, +f.guests.value + +b.dataset.step));
  if (next === +f.guests.value) return;
  f.guests.value = next;
  f.guests.classList.remove('changed'); void f.guests.offsetWidth; f.guests.classList.add('changed');
}));

// "Check dates" on an apartment: choose it, then go to the form.
$$('[data-book]').forEach((b) => b.addEventListener('click', () => {
  f.room.value = b.dataset.book;
  book.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { if (!f.in.value) f.in.focus({ preventScroll: true }); }, 600);
}));

book.addEventListener('submit', (e) => {
  e.preventDefault();
  const action = e.submitter?.value || 'booking';
  if (action === 'zalo') { open(zalo()); return; }
  const checkin = f.in.value, checkout = f.out.value, guests = f.guests.value;
  if (!checkin || !checkout) { err.textContent = 'Choose a check-in and a check-out date first.'; (checkin ? f.out : f.in).focus(); return; }
  if (checkout <= checkin) { err.textContent = 'Check-out needs to be after check-in.'; f.out.focus(); return; }
  err.textContent = '';
  try { localStorage.setItem('les-booking', JSON.stringify({ in: checkin, out: checkout, guests })); } catch {}
  const room = f.room.value || 'any apartment';
  open(action === 'whatsapp'
    ? whatsapp(`Hello! I'd like to stay at Le's Apartment & Coffee from ${checkin} to ${checkout}, ${guests} guest${guests > 1 ? 's' : ''}, ${room}. Is it available?`)
    : `${CONFIG.bookingUrl}?${new URLSearchParams({ checkin, checkout, group_adults: guests, group_children: 0, no_rooms: 1 })}`);
});
