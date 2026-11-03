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
| `styles.css` | Design tokens at the top: two neutrals, one accent, two typefaces. |
| `app.js` | The photo viewer and the booking hand-off. `CONFIG` at the top holds the photo count, the Booking.com URL and the WhatsApp number. |
| `img/` | `pNN.webp` (1600 px) and `pNN-sm.webp` (720 px), the 30 photos from the property's public listing. |

## Rules

- Content stays in HTML so search engines and agents can read it without running JS. JS only adds behaviour.
- The booking sheet's room list is read from the room cards, so a new `<article class="room">` appears there with no other change.
- Facts come from public listings (Booking.com, danang-hotels.com, bedandbreakfast.eu). Review quotes are verbatim excerpts. Walking and driving times are approximate.
- Before going live, confirm the WhatsApp number with the host, and check which photos belong to which room type.
