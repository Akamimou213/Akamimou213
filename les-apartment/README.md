# Le's Apartment & Coffee: concept site

An unofficial concept website for a building of six apartments above a coffee house at 252 Dương Đình Nghệ, An Hải, Đà Nẵng. It's plain HTML, CSS and JS, with no build step and no dependencies.

```sh
python3 -m http.server   # then open http://localhost:8000
```

To deploy on Vercel, set the project root to `les-apartment/`, choose framework "Other" and leave the build command empty.

**Read `DESIGN.md` first.** It is the locked design plan: subject, the one idea (a day in Đà Nẵng whose sky follows your scroll), palette, type, layout and rules.

## Files

| File | Holds |
|---|---|
| `index.html` | All content, in reading order: hero, a day from Le's, apartments, a month in An Hải, guests, directions, good to know, the booking form. Edit copy here. |
| `styles.css` | Tokens at the top (colours, sky stops, type scale, spacing), then one block per section. |
| `app.js` | The sky (any element with `data-sky` sets the page's background when it crosses the middle of the screen), the photo viewer, the booking hand-off. `CONFIG` holds the photo count, the Booking.com URL, the phone number and the address. |
| `logo.svg` | The mark: a 2×2 breeze-block lattice. |
| `img/pNN.webp` | The 30 photos of the building, from its public listings (1600px, plus `-sm` at 720px). |
| `img/dn-*.webp` | Photos of Đà Nẵng from Wikimedia Commons, each credited in the footer with its author and license. |

## How it works

- **The day's sky:** `data-sky="dawn | morning | midday | gold | night"` on a block sets `body[data-sky]`, and the CSS fades the page background to that stop. Night swaps the text to light.
- **Booking:** the form at the end sends guests to Booking.com with their dates and guest count filled in, or opens WhatsApp with a ready message (Zalo opens a chat). Every "Check dates" button selects its apartment in the form first. The apartment list is read from those buttons, so there's one source of truth.
- **Film capture:** pieces that lift in the fly-over film carry `data-layer` (mockup, button, photo, testimonial).

## Facts and sources

- Rooms, sizes, beds, policies and facilities: the listings on Booking.com, danang-hotels.com and bedandbreakfast.eu.
- Scores (9.1 overall from 48 reviews, staff 9.9, Wi-Fi 10, and so on) and the four guest quotes: Booking.com and partner sites, quoted word for word.
- Walking and driving times are approximate.
- The Đà Nẵng copy (the Dragon Bridge's fire show on Saturday and Sunday at 21:00, My Khe facing east, the 67 m Lady Buddha) is general knowledge about the city.

## Before going live

- Confirm `CONFIG.phone` (WhatsApp and Zalo) with the host. It appears on only one public listing.
- Ask the host which photos belong to which apartment. The current pairing is a best guess from what's visible.
- Ask for a photo of the coffee house itself, which would be stronger than the stock cà phê sữa đá.
- Keep the "unofficial concept" line in the footer until the owner approves the site.
