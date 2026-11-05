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
- **Booking:** every Book and Check availability button opens one date sheet (`#dates`, a native `<dialog>`). One `state` object in `app.js` feeds the sheet, the booking card and the hand-off. The card at the end sends guests to Booking.com with their dates and guest count filled in, or opens WhatsApp with a ready message (Zalo opens a chat). Every "Check dates" button on an apartment opens the same sheet with that apartment noted, and it carries through to the WhatsApp message.
- **Film capture:** pieces that lift in the fly-over film carry `data-layer` (mockup, button, photo, testimonial).

## Mobbin references

The booking and layout patterns come from these screens and sections on Mobbin:

| Pattern on the page | Reference |
|---|---|
| Hero: name, one sentence, action on the left, tall photo on the right | [KOBU, Innit Lombok hero](https://mobbin.com/sites/sections/79b3c5a4-83c8-46f4-a63a-fcd4697964cd) |
| "What to know" with every answer open in two columns | [KOBU, What to Know](https://mobbin.com/sites/sections/cc63048b-341e-420d-a687-5d5c17aacf3c) |
| Apartments in a staggered photo grid | [KOBU, Hotels grid](https://mobbin.com/sites/sections/7dce8910-52a7-47da-9de4-21bc9456292a) |
| Giant wordmark footer | [KOBU footer](https://mobbin.com/sites/sections/d07ad815-77af-4cab-a6ff-c35761c7b2a6) |
| Booking card on a coloured panel | [Mews, booking engine](https://mobbin.com/sites/sections/7c52f949-dd92-40d5-85a2-583b2b38b9a8) |
| Phone bottom bar with "From" price and one action | [Viator](https://mobbin.com/screens/6914fe52-575b-40ae-8928-46c417f338a9), [Agoda](https://mobbin.com/screens/34d6195b-f686-4b97-ae01-befa03c112ff), [Airbnb](https://mobbin.com/screens/32e6070e-74e7-4d1c-aae1-c7cc9ec48450) |
| "What this place offers" icon list | [Airbnb](https://mobbin.com/screens/32e6070e-74e7-4d1c-aae1-c7cc9ec48450) |
| Photo count on the hero photo | [Expedia](https://mobbin.com/screens/e700efeb-e0c5-4a5e-957a-a6cd007f8253) |
| Date sheet: month list, range highlight, summary and action at the bottom | [Booking.com](https://mobbin.com/screens/b4e846b0-924b-4eb6-bb3e-2fe5d35dc9f9) |
| Quick picks above the calendar | [Tripadvisor](https://mobbin.com/screens/2ac4b8e9-d7ef-40d0-9bd0-f04ee1cb37a4) ("Tonight, This weekend") and [Vrbo](https://mobbin.com/screens/bca186e6-379d-402f-b25a-c18fc8608c6e) (stay length, here "A week" and "A month") |

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
