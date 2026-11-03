// Le's Apartment & Coffee: progressive enhancement only.
// Content lives in index.html; this file adds the photo viewer and the booking hand-off.

const CONFIG = {
  photos: 30, // img/p01.webp … img/p30.webp
  bookingUrl: 'https://www.booking.com/hotel/vn/le-39-s-apartment-amp-coffee.html',
  whatsapp: '84914000558', // from public listings; confirm with the host before launch
  maxGuests: 6,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

// Close any dialog when its backdrop is clicked.
$$('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

// ---------- Gallery counter (phone swipe) ----------
const gallery = $('#gallery');
gallery.addEventListener('scroll', () => {
  $('#galleryCount').textContent = Math.round(gallery.scrollLeft / gallery.clientWidth) + 1;
}, { passive: true });

// ---------- Photo viewer ----------
const viewer = $('#viewer');
const track = $('#viewerTrack');
const count = $('#viewerCount');

function openViewer(n) {
  if (!track.children.length) {
    track.innerHTML = Array.from({ length: CONFIG.photos }, (_, i) =>
      `<img src="img/p${pad(i + 1)}.webp" alt="Photo ${i + 1} of ${CONFIG.photos}" loading="lazy" decoding="async">`).join('');
  }
  viewer.showModal();
  track.scrollTo({ left: (n - 1) * track.clientWidth, behavior: 'instant' });
  updateCount();
}
const current = () => Math.round(track.scrollLeft / track.clientWidth) + 1;
const updateCount = () => { count.textContent = `${current()} / ${CONFIG.photos}`; };
const go = (d) => track.scrollTo({ left: (current() - 1 + d) * track.clientWidth, behavior: 'smooth' });

track.addEventListener('scroll', updateCount, { passive: true });
viewer.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft') go(-1);
});
$$('[data-photo]').forEach((b) => b.addEventListener('click', () => openViewer(+b.dataset.photo)));

// ---------- Booking ----------
const book = $('#book');
const form = $('#bookForm');
const f = form.elements;
const today = new Date().toISOString().slice(0, 10);
f.in.min = today;
f.out.min = today;

// Room options come straight from the room headings, so there is one source of truth.
$$('.room [data-book]').forEach((b) => f.room.add(new Option(b.dataset.book, b.dataset.book)));

// Restore the last search (per-browser convenience only).
try {
  const saved = JSON.parse(localStorage.getItem('les-booking') || '{}');
  if (saved.in >= today) f.in.value = saved.in;
  if (saved.out > (saved.in || today)) f.out.value = saved.out;
  if (saved.guests) f.guests.value = saved.guests;
} catch {}

f.in.addEventListener('change', () => {
  f.out.min = f.in.value;
  if (f.out.value <= f.in.value) {
    const d = new Date(f.in.value); d.setDate(d.getDate() + 1);
    f.out.value = d.toISOString().slice(0, 10);
  }
});

$$('[data-step]').forEach((b) => b.addEventListener('click', () => {
  f.guests.value = Math.min(CONFIG.maxGuests, Math.max(1, +f.guests.value + +b.dataset.step));
}));

$$('[data-book]').forEach((b) => b.addEventListener('click', () => {
  f.room.value = b.dataset.book || '';
  book.showModal();
}));

form.addEventListener('submit', (e) => {
  const action = e.submitter?.value;
  if (action === 'close') return;
  if (!form.reportValidity()) { e.preventDefault(); return; }

  const { value: checkin } = f.in;
  const { value: checkout } = f.out;
  const guests = f.guests.value;
  try { localStorage.setItem('les-booking', JSON.stringify({ in: checkin, out: checkout, guests })); } catch {}

  let url;
  if (action === 'booking') {
    url = `${CONFIG.bookingUrl}?${new URLSearchParams({ checkin, checkout, group_adults: guests, group_children: 0, no_rooms: 1 })}`;
  } else {
    const room = f.room.value || 'any room';
    const text = `Hello! I'd like to stay at Le's Apartment & Coffee from ${checkin} to ${checkout}, ${guests} guest${guests > 1 ? 's' : ''}, ${room}. Is it available?`;
    url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  window.open(url, '_blank', 'noopener');
});
