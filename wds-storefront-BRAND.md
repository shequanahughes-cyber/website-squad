# BRAND.md — Web Design Squad Storefront

Design reference for Claude Code. Apply these tokens across the storefront, order flow, and client/staff dashboards.

## Palette

| Role | Hex | Use |
|---|---|---|
| Background (page) | `#F7F2EA` | Cream base, all pages |
| Card / surface | `#FFFFFF` | Cards, sidebar, dashboard panels |
| Muted panel | `#F1EAE0` | Pricing card header, subtle section fills |
| Headline / primary text | `#1B2340` | Navy — all headings, nav, prices |
| Body text | `#5B6472` | Descriptions, supporting copy |
| Muted text | `#9B8F7E` | Timestamps, fine print, disabled steps |
| Accent | `#C97B84` | Buttons, links, active status dots, checkboxes |
| Accent text-on-tint | `#A85560` | Text sitting on light accent fills (badges, eyebrow labels) |
| Accent tint | `#F5DEDD` | Icon badge backgrounds, status pill backgrounds |
| Border | `#E4DED3` | Hairline borders throughout |

## Typography

- **Display / headlines:** Georgia (or a similar serif — Playfair Display works if self-hosted) — used for page titles and card headers only.
- **Body / UI:** system sans-serif (existing Tailwind default stack) for everything else — nav, buttons, form labels, body copy.
- **Eyebrow labels** (small text above headlines, e.g. "The complete build"): 11px, uppercase, letter-spacing 0.06–0.08em, accent-text color or navy, weight 500.

## Layout patterns

- **Order page:** two-column — left column is the offer detail (checklist grid, add-ons), right column is a sticky pricing card with deposit/balance breakdown, delivery estimate, terms checkbox, and CTA button.
- **Checklist items:** small circular icon badge (accent tint background, accent-text icon) + bold 13px title + 12px muted description, in a 2-column grid.
- **Dashboard status tracker:** horizontal step row — completed steps solid accent-filled circles with a check icon, current step accent-filled with a light ring, future steps muted panel-colored with a gray icon. Connector lines solid accent between completed steps, muted border color ahead of current step.
- **Cards:** 12–14px border radius, 0.5px hairline border in `--border`, white background, no shadows.
- **Buttons:** primary = solid accent fill, white text, 8px radius. Secondary = white fill, navy text, hairline border.

## Voice

- Sentence case everywhere — no title case, no all-caps in real copy (the small-caps *look* on eyebrow labels is a CSS text-transform treatment, not literal shouting text).
- Plain, direct, warm — describe what the client gets and what happens next, not sales language.
- Status labels are short and literal: "Awaiting your review," not "Exciting update!"

## Reuse

Apply this file the same way `archway-project-brief.md` and prior `BRAND.md` files were used — commit it to the project repo root and reference it directly when prompting Claude Code for each page.
