# Le's Apartment & Coffee: design plan

The locked brief for this site. Read it before changing the page (people and agents alike).

## Subject, audience, job

- **Subject:** Le's Apartment & Coffee, an owner-run building of six apartments above a coffee house at 252 Dương Đình Nghệ, An Hải, Đà Nẵng. It sits between the Han River (10 min walk) and My Khe Beach (19 min walk).
- **Audience:** independent travellers, couples and remote workers comparing it with other stays on Booking.com and Agoda, mostly on a phone.
- **Job:** get a booking (check rates, or message the host), by first letting them picture their days in Đà Nẵng from this front door.

## The one idea

**A day from Le's.** The middle of the page is one day in Đà Nẵng, told in the order it happens: sunrise at My Khe, coffee downstairs, mì Quảng, Sơn Trà, the afternoon in your apartment, the Han River at golden hour, the Dragon Bridge at night. As you scroll, the page's background moves through that day's sky, from dawn coral to river-night navy. That's the memorable thing. Everything else stays quiet.

## Palette

| Name | Hex | Role |
|---|---|---|
| Rice paper | `#F3F5F2` | Base surface: cool and neutral, not cream |
| Han River ink | `#10242C` | Text |
| My Khe sea | `#0E6E73` | Links, marks, map water |
| Sunrise coral | `#E4572E` | The one action colour: Book |
| Dragon gold | `#E6AE3F` | Night chapters only |
| River night | `#0B1C24` | Night chapters and footer |

Sky stops for the day: dawn `#F6DCCB`, morning `#E3EFEA`, midday `#F3F5F2`, gold `#F4E1C1`, dusk `#2B4152`, night `#0B1C24`.

## Type

One family: **Be Vietnam Pro**, designed in Vietnam, with complete Vietnamese diacritics.
- Display at weight 300, large and airy, tracking −0.03em, line height 1.04 so stacked diacritics never collide.
- Body at 400, 17px/1.6. UI at 500.
- Scale: 14 · 17 · 20 · 26 · 34 · 52 · 80 · 112.
- Sentence case everywhere. No all-caps labels, no eyebrows, no middle-dot strings, no arrows glued to buttons.

## Layout

Left-aligned, editorial and asymmetric, as in the KOBU and The Palms references. Photographs are big (at least half the width) and offset. Type-only sections sit between photo sections so the page never reads as a gallery.

```
HERO        [ Le's Apartment & Coffee            ][ tall terrace photo ]
            [ one sentence                       ][                    ]
            [ Check availability ] [ WhatsApp ]   [                    ]
            [ 9.1 from 48 guests. Pay at the property. ]

A DAY       05:30  [ photo ........ ]  Sunrise at My Khe        (bg: dawn)
FROM LE'S          Coffee downstairs  [ ....... photo ]  07:00  (bg: morning)
            ...                                                  (bg: … night)

APARTMENTS  six photos with name, size, beds, best for, Check dates
LONGER      type-only: a month in An Hải, facts as a table
GUESTS      one large quote + score table
DIRECTIONS  schematic map + walking times + address
KNOW        check-in/out + questions
BOOK        the form (dates, guests, apartment) → Booking.com / WhatsApp / Zalo
FOOTER      giant LE'S wordmark, address, photo credits
```

## Principles

1. Show the real place. Every photo is the building or Đà Nẵng itself, openly licensed and credited in the footer. Nothing is drawn where a photograph exists.
2. One moving idea: the sky behind the day. No fade-up on every section and no hover lift on every card. Motion otherwise only answers an action (the guest counter, opening the photo viewer).
3. Numbers only where the content is a sequence: the times of the day.
4. Every fact is sourced (see README). No invented prices, scores or quotes.
5. The page ends on its job: the booking form.
