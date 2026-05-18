# FoodHub Design Tokens (Tailwind & Figma-ready)

This file lists the color, typography, spacing, and component tokens for FoodHub and maps them to Tailwind names and CSS variables.

## Colors

- `--fh-bg`: #0D0D0F — Tailwind: `fh-bg`
- `--fh-card`: #161618 — Tailwind: `fh-card`
- `--fh-elevated`: #1F1F22 — Tailwind: `fh-elevated`
- `--fh-border`: #2A2A2D — Tailwind: `fh-border`
- `--fh-text`: #E8E6E0 — Tailwind: `fh-text`
- `--fh-muted`: #888580 — Tailwind: `fh-muted`
- `--fh-accent`: #F5A623 — Tailwind: `fh-accent` (CTAs only)
- `--fh-danger`: #E24B4A — Tailwind: `fh-danger`
- `--fh-success`: #3B6D11 — Tailwind: `fh-success`

Notes: Use `fh-accent` only for primary CTAs and active states. Do not use it for decorative elements.

## Typography

- Headline font-family: `Satoshi, Cabinet Grotesk, Inter, sans-serif` — Tailwind: `font-heading`
- Body font-family: `Inter, DM Sans, system-ui` — Tailwind: `font-body`

Scale & weights:

- Hero H1: 76px, 800, line-height 1.05, letter-spacing -0.02em
- H2: 40–48px, 700
- H3: 20–24px, 600
- Body: 16px, 400, line-height 1.7
- Labels/Badges: 11px, 600, uppercase, letter-spacing 0.08em

Tailwind examples:

- Hero H1: `text-[76px] leading-[1.05] font-extrabold tracking-[-0.02em] font-heading`
- Body: `text-base leading-[1.7] font-normal font-body`

## Radii & Spacing

- Border radius (cards): 16px — `rounded-[16px]` / `rounded-2xl`
- Rounded pill: `rounded-full`
- Component padding: 24px — `p-6`
- Section shell max width: `max-w-7xl` (keeps centered content)

## Shadows, Borders & Elevation

- Card border: `1px solid var(--fh-border)`
- Card bg: `var(--fh-card)`
- Elevated surface bg: `var(--fh-elevated)`
- Focus ring (inputs/CTAs): `outline: 3px solid rgba(245,166,35,0.14)`

## Interaction Duration

- Default transitions: `duration-200 ease-out` (Tailwind: `duration-200 ease-out`)

## Tailwind Token Mapping (example usage)

- Background: `bg-[var(--fh-bg)]` or `bg-fh-bg`
- Card: `bg-[var(--fh-card)]` or `bg-fh-card`
- Border: `border-[var(--fh-border)]` or `border-fh-border`
- Accent button: `bg-[var(--fh-accent)] text-[var(--fh-bg)]`

## Accessibility guidance

- Always ensure contrast between `--fh-text` and background is WCAG AA compliant. If any specific element falls short, increase text weight or background contrast.

## Figma tokens

Use keys identical to CSS var names (e.g., `fh-bg`, `fh-accent`) as color tokens in Figma. Include typography tokens for `hero-h1`, `h2`, `body`, and `label` with sizes/weights above.

---

Generated: May 15, 2026
