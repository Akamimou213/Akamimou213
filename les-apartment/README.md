# Le's Apartment & Coffee: concept site

An unofficial concept website for a six-apartment aparthotel at 252 Dương Đình Nghệ, Sơn Trà, Da Nang. It is plain HTML, CSS and JS, with no build step and no dependencies.

```sh
python3 -m http.server   # then open http://localhost:8000
```

To deploy on Vercel, set the project root to `les-apartment/`, choose framework "Other" and leave the build command empty.

## Files

| File | Holds |
|---|---|
| `index.html` | All content: rooms, location, reviews, details. Edit copy here. |
| `styles.css` | Design tokens at the top: Đà Nẵng palette (sea, espresso, sand, lacquer red), one spring curve, one typeface (Be Vietnam Pro). Colour bands get a scalloped bông gió top edge from the `.band` class. |
| `logo.svg` | The mark: a 2×2 breeze-block lattice. |
| `app.js` | Scroll reveals, the photo viewer and the booking hand-off. `CONFIG` at the top holds the photo count, the Booking.com URL and the WhatsApp number. |
| `img/` | `pNN.webp` (1600 px) and `pNN-sm.webp` (720 px), the 30 photos from the property's public listing. |

## Rules

- Pieces that lift in the fly-over film carry `data-layer` (mockup, button, chip, photo, card, testimonial).
- Content stays in HTML so search engines and agents can read it without running JS. JS only adds behaviour.
- The booking sheet's room list is read from the room cards, so a new `<article class="room">` appears there with no other change.
- Facts come from public listings (Booking.com, danang-hotels.com, bedandbreakfast.eu). Review quotes are verbatim excerpts. Walking and driving times are approximate.
- The hero sky follows the hour in Đà Nẵng (dawn 5–7, day 7–16, gold 16–19, night). Force one with `?sky=dawn|day|gold|night`, which is useful for screenshots and the film capture.
- "From 690.000₫ / night" comes from the Booking.com search you shared (4–5 Nov 2026, 2 adults). Update it in `index.html` when rates change.
- WhatsApp and Zalo both use `CONFIG.phone`.
- Before going live, confirm the WhatsApp number with the host, and check which photos belong to which room type.
