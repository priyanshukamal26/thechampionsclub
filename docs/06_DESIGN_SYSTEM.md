# 06_DESIGN_SYSTEM — "Clubhouse Ledger"

> Authoritative visual + UI contract for every screen in this app. Read before touching UI.
> Established in the redesign session (2026-11-21). The old obsidian-lime theme is retired.

## 1. Direction

A warm, printed-matter sports club: **paper, ink, clay, court green, scoreboard mono**.
Think a members' club annual report / tournament programme, not a crypto dashboard.
Design is carried by **structure** (rules, numbered sections, asymmetric grids), **typography**
(display grotesk + editorial serif italic + tabular mono), and **texture** (paper grain, court-line
diagrams, hard offset shadows). Decoration never replaces information.

**Banned:** neon lime (#CCFF00) backgrounds, blurred glow blobs, purple/blue gradient SaaS look,
emoji used as UI icons, three identical rounded cards in a row, pill chips on every line,
glassmorphism, gradient text, "AI startup" marketing tone.

## 2. Colour tokens (defined in `src/app/globals.css`)

| Token | Hex | Use |
|---|---|---|
| `paper` | #f2ecdf | page background |
| `paper-deep` | #e8dfcd | alternate section background |
| `paper-soft` | #f7f2e8 | inset panels |
| `chalk` | #fbf7ee | cards on paper, text on ink |
| `ink` | #17150f | primary text, dark sections, sidebar |
| `ink-soft` | #29251b | dark surfaces |
| `ink-line` | #3b3629 | borders on dark |
| `clay` | #c4502b | primary action / accent (terracotta) |
| `clay-deep` | #9c3c1d | hover / danger text |
| `clay-soft` | #e9b79f | accent on dark |
| `court` | #1e4433 | success, court-green panels |
| `court-soft` | #2b5c46 | hover |
| `sage` | #a9b49b | muted olive hints |
| `gold` | #b2872c | warning |
| `muted` | #6e6555 | secondary text on paper |
| `line` / `line-soft` / `line-inverse` | rgba | hairlines |

Usage: Tailwind classes `bg-paper`, `text-ink`, `border-line`, `bg-clay`, `text-chalk`, `bg-court/10`, etc.
**Never** hard-code new hex colours; use tokens or existing palette. Data = mono + tabular numerals.

## 3. Type scale

- `.u-display` — Space Grotesk 700, uppercase, tight. Hero: `text-[clamp(2.4rem,6vw,5rem)]`; page title `clamp(1.7rem,3.2vw,2.6rem)`; card title ~`text-xl`.
- `.u-serif` — Instrument Serif. Use *sparingly* for one emotional word in a heading, pull quotes, or a large number annotation.
- `.u-eyebrow` — IBM-style mono 10.5px, uppercase, 0.22em tracking. Every section/page gets one.
- `.u-value` — mono, tabular-nums, 600. All money, counts, times, scores.
- body — Inter 12.5–14px, `text-muted` for secondary.
- `.u-link` — underline that retracts on hover.

## 4. Components

All in `@/components/ui/kit` unless noted. Do not duplicate them; do not edit them.

```tsx
import { SectionIntro, PageHeader, Panel, Stat, StatusPill, EmptyState, Avatar, Meter, Grain, Ticker, Stamp, CourtLines, Rule } from "@/components/ui/kit";
import { Modal, Drawer, Segmented, Tabs } from "@/components/ui/overlay";

<SectionIntro index="03" kicker="Membership" title={<>Choose your <span className="u-serif italic text-clay">standing</span></>} description="..." tone="paper|ink" align="left|center" />
<PageHeader eyebrow="..." title="..." description="..." actions={...} meta={...} />
<Panel tone="paper|deep|ink|court|clay" padded> ... </Panel>
<Stat label="Today" value="₹48,200" unit="gross" note="+12% vs yesterday" tone="paper|ink|court|clay" />
<StatusPill tone="success|warn|danger|info|neutral|clay">Confirmed</StatusPill>
<EmptyState title="..." description="..." action={<button className="btn btn-ink btn-sm">…</button>} />
<Meter value={72} tone="clay|court|ink|gold" />
<Segmented options={[{value:"x",label:"X",count:3}]} value={v} onChange={setV} />
<Tabs tabs={[{value:"a",label:"A",icon:Icon}]} value={v} onChange={setV} />
<Modal open onClose title eyebrow footer>...</Modal>
<Drawer open onClose title eyebrow footer side="right">...</Drawer>
```

CSS helper classes (globals.css):
`.btn .btn-clay .btn-ink .btn-chalk .btn-court .btn-outline .btn-outline-inv .btn-sm .btn-block`
`.card .card-hard .panel-ink .panel-court .panel-clay`
`.chip .chip-clay .chip-court .chip-ink .chip-inv .chip-solid`
`.u-label .input .input-ink`
`.u-table` (th/td already styled), `.u-rule .u-rule-inverse .u-court-grid .u-court-grid-inv .u-dashed .u-notch`
`.u-mono .u-eyebrow .u-display .u-serif .u-value .u-link`

Rules: buttons/inputs are `.btn` and `.input` — no one-off button styling. Radii: 16px cards, 10px inputs,
999px buttons/chips. Shadows: paper cards flat with hairline border; featured card `.card-hard`; never glow.

## 5. Page composition

### Public landing
Alternating bands: `paper` → `chalk` → `paper-deep` → `ink` (max two dark sections per page).
Each section: numbered eyebrow (`01 — Sports`), display headline with one serif-italic word,
generous vertical rhythm (`py-20 md:py-28`), max-width `max-w-[1240px] px-5 sm:px-8`.

### Dashboard (all /dashboard/*)
- Shell: ink sidebar, paper workspace. Content wrapper: `mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8`.
- Open with `PageHeader`. Then a row of `Stat` (2×2 mobile, 4 desktop).
- Group work into `Panel`s with an `u-eyebrow` heading row and a `Rule`/hairline between rows.
- Tables: `.u-table`; numbers right-aligned mono; statuses `StatusPill`.
- Sticky action bars for confirmation flows: `bg-chalk/95 backdrop-blur border-t border-line`.
- No decorative background blobs. If a page needs atmosphere, use `u-court-grid` at low contrast or a `CourtLines` SVG.

## 6. Copy tone

Plain, specific, clubhouse-confident. Numbers over adjectives. Sentence case in prose; uppercase only in
display/eyebrows. Avoid "seamlessly", "revolutionary", "unleash", "elevate", "world-class" repeated everywhere.
One short editorial line per section is enough.

## 7. Engineering guardrails

- **Do not edit** `globals.css`, `src/components/ui/*`, `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`
  unless your task explicitly owns them.
- Preserve every existing route, handler, state, localStorage key and business rule. Redesign = same behaviour.
- All pages are client components already; keep `"use client"`.
- Every interactive control must remain keyboard-focusable and have an accessible label.
- `lucide-react` for icons; size 14–18 inside controls, 20–24 in feature headers.
- Currency via `inr()` / `toLocaleString("en-IN")`; dates via `Intl` with `en-IN`; IST times as `HH:MM`.
- Mobile-first: nothing may overflow horizontally at 360px. Tables scroll inside `overflow-x-auto`.

## 8. Ownership map (redesign session)

| Area | Files | Owner |
|---|---|---|
| Design system, landing, navbar, footer, auth shell | globals.css, app/layout, components/landing/*, app/page.tsx | Lead |
| Dashboard shell + overview + pass + settings | app/dashboard/layout.tsx, page.tsx, pass/*, settings/* | shell agent |
| Courts + Friday social + cancellation | app/dashboard/courts/*, social/*, lib/bookings.ts | courts agent |
| Shop + bar + POS + kitchen | app/dashboard/shop/*, bar/*, pos/*, kitchen/*, lib/orders.ts | commerce agent |
| Owner finance/ops console | app/dashboard/owner/*, lib/finance.ts | owner agent |
| Front desk + leads pipeline | app/dashboard/desk/*, lib/leads.ts | desk agent |
| Auth screens + registration wizard | app/login, register, reset-password, pending-consent, components/register/* | auth agent |
| PWA | public/manifest.webmanifest, public/sw.js, components/pwa/* | lead |
