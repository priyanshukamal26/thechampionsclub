# 00_MASTER — The Champions Club Management System

> **READ THIS FILE FIRST. It is the entry point and the single source of truth about project STATUS.**
> Every other file in `docs/` is referenced from here.

| Field | Value |
|---|---|
| Project name | The Champions Club Management System (repo/root folder name: `thechampionsclub`) |
| Root folder | `D:\Projects\thechampionsclub` |
| Docs folder | `D:\Projects\thechampionsclub\docs\` |
| Docs created | 2026-11-21 (Session 1) |
| Last updated | 2026-11-22 (Session 11: Redesigned Court Booking with two-step date/sport selection flow, uncluttered dashboard sidebar navigation by routing court booking via prominent Overview CTA, enhanced slot status vibrancy and timing prominence, added developer credits to footer, resolved Neon serverless package dependency; 38/38 routes passing in `next build` with 0 errors) |
| Sessions completed | 11 |
| Current phase | **P9 – Part 1 complete (38 routes live); Central Neon database synchronization active; UX & court booking flow refinement complete** |
| Code written so far | **Next.js 16 App Router, React 19, Tailwind v4, Neon Serverless Postgres, PWA**: Clubhouse Ledger design system and UI kit; 11-section public landing with live availability, enquiry/trial capture, and developer credits footer; 8-role auth with demo switcher; serverless auth, members, bookings, orders, bar, shop, finance, facilities, leads, and audit routes (`/api/auth/login`, `/api/auth/register`, `/api/members`, `/api/bookings`, `/api/orders`, `/api/bar`, `/api/shop`, `/api/finance`, `/api/facilities`, `/api/leads`, `/api/audit`); 4/5-step registration wizard writing central member records; role-aware dashboard shell with route-level access matrix and streamlined sidebar; member overview with prominent court booking CTA, redesigned 2-step 18-arena court booking engine, Friday social, Pro Shop, bar floor, digital pass and DPDP settings; staff desk, counter POS, kitchen display, and owner console; cross-device invariant engines with live Neon Postgres synchronization; 38 routes prerendered in `next build` with 0 errors |
| Next session starts at | Perform multi-user stress testing and live WebSocket/polling real-time court reservation collision checks. |

---

## 1. What this project is (30-second version)

A single unified software platform (website first, installable PWA as fallback) for a fictional-but-realistic sports club, **The Champions Club**, that currently runs on WhatsApp, Excel and paper. The platform must cover six areas that come from the six scenes of the problem statement, plus cross-cutting concerns (full detail in `01_PROJECT_SPEC.md`):

1. **Membership** — Gold / Silver / Junior plans, entitlements, expiry tracking, quick staff recognition, member history.
2. **Court booking** — 1-hour sessions, a slot opening every 30 minutes, max 2 bookings per member per day, plan-based pricing (walk-ins pay more, some plans pay nothing), cancellations, Friday-night social play (many people share one court), and **never two bookings on the same court at the same time**.
3. **Gear shop** — rackets, balls, shoes, accessories, apparel; stock + low-stock alerts; counter sales and online orders (pickup or delivery) from the **same** inventory.
4. **Bar & cafeteria** — digital orders, kitchen visibility, tabs, automatic member discounts, cash/card/UPI payments, staff shifts, table tracking, daily closing earnings.
5. **Public website & leads** — club info, plans/prices, availability this week, shop catalogue, trial booking, enquiry capture → follow-up → quote → new member.
6. **Owner finance & operations** — revenue by source and payment mode, what the club owes, invoicing (memberships, business clients), payroll, leave approval, tax (GST) reporting, today/week/month dashboard, shareable numbers.
7. **Cross-cutting** — roles/security, audit log, India-specific details (INR, UPI, GST, IST, DPDP Act consent for minors).

## 2. The two-part plan agreed with the user

- **Part 1 — Compulsory:** tick EVERY requirement in the problem statement (tracked as IDs A1…F9 in `01_PROJECT_SPEC.md`).
- **Part 2 — Differentiation:** only after Part 1 is complete, add unique features (list + priority in `03_ROADMAP_AND_FEATURES.md`).

## 3. File map

| File | Purpose | Read when | Update when |
|---|---|---|---|
| `00_MASTER.md` (this) | Index, rules for the AI agent, status, next task, glossary | Every session start | Every session end |
| `01_PROJECT_SPEC.md` | Problem statement digest, requirement IDs (A1–F9, X1–X7), ambiguities, **decision register (D-xxx)**, **page inventory (sections 6) and flows (section 7)** | Before designing/changing any feature | When a requirement or decision changes |
| `02_ARCHITECTURE_AND_STACK.md` | Hardware, stack, verified free-tier facts, hurdles & plans, data model outline, security, AI, payments, datasets | Before writing code or choosing a service | When the stack/schema/hosting changes or a free-tier fact is re-verified |
| `03_ROADMAP_AND_FEATURES.md` | Phases with checklists, Part 2 feature list, vibe-coding method, interview defence prep, risk register | To pick the next task / tick progress | Every session end (tick boxes) |
| `04_HISTORY_LOG.md` | **Append-only** proof/record of every session | Any time you need "what did we do and why" | Every session end (append, never edit past entries) |
| `05_PROMPTS.md` | Ready-to-paste prompts: kickoff prompt + end-of-session docs-update prompt | Start and end of each session | Rarely (only if the process changes) |

**Recommended reading order for a new AI session:** `00_MASTER` → `01_PROJECT_SPEC` → `02_ARCHITECTURE_AND_STACK` → `03_ROADMAP_AND_FEATURES` → `04_HISTORY_LOG` (latest 2–3 entries at minimum) → `05_PROMPTS` (only if needed).

## 3a. Status legend used across all docs

- **CONFIRMED** — the user explicitly stated or approved it.
- **PROPOSED** — suggested by the AI, not yet explicitly approved by the user. Treat as the working default but flag if you change it.
- **VERIFIED (date, source)** — checked against a live source in a session.
- **UNVERIFIED** — from model memory; must be checked before relying on it.
- **TBD** — genuinely unknown; needs user input or research.

---

## 4. Rules for the AI agent (NON-NEGOTIABLE)

1. **Free only.** Use only free tools, free tiers, open-source libraries and free datasets. No paid APIs, no credit-card-required services. If a paid thing seems necessary, stop and propose a free alternative.
2. **No hallucination.** If you do not know or cannot verify something (free-tier limits, library APIs, tax rates, prices, laws), say so and mark it UNVERIFIED/TBD. Free tiers change often — re-verify with a live source before depending on them. Never invent URLs, package names, function signatures, or numbers.
3. **The owner is an absolute beginner at hand-written code** but strong at prompting and has built several full-stack and AI projects with vibe coding (Groq and Gemini for inference) plus some ML models. Therefore: give complete, copy-pasteable code and commands, small steps, one module per step, and **explain the "why" in plain language**.
4. **The owner must be able to defend everything in an interview / cross-questioning.** After each meaningful piece of work, add a short "How it works / why we chose it / what to say if asked" note (these go into `03_ROADMAP_AND_FEATURES.md` interview section or the history entry).
5. **Correctness over speed for the core invariants:** no overlapping court bookings, stock never negative, the 2-per-day cap, money totals that reconcile. Each must have an automated test.
6. **Core flows must never depend on an LLM.** AI is an add-on with a deterministic fallback. LLM keys stay server-side only.
7. **Secrets:** never commit keys. Use `.env.local` (git-ignored) and the host's env-var settings. Docs may list variable NAMES only, never values.
8. **Data is synthetic by design** (the club does not exist). Never claim it is real. Never send personal/sensitive data to free-tier LLMs.
9. **Do not silently change a decision.** If you must, log it in `01_PROJECT_SPEC.md` (decision register) and `04_HISTORY_LOG.md`.
10. **History is append-only.** Never delete or rewrite past entries in `04_HISTORY_LOG.md`. Only record what actually happened; if something was planned but not done, say "not done".
11. **Environment:** primary dev machines are an Asus TUF F16 (Windows presumed — UNVERIFIED) and a Mac M4. Give Windows PowerShell commands and, when different, macOS/zsh commands. Project paths are on `D:\`.
12. **At the end of every session**, the docs must be updated (use the prompt in `05_PROMPTS.md`) and a next-session prompt produced.

---

## 5. Owner profile & environment (as stated by the user)

- Hardware: Asus TUF F16 (Intel Core 5 210H, RTX 4050 6GB) + Mac M4. Google Colab may be used for training.
- Skills: absolute beginner at writing code by hand; good at prompting; has built several full-stack and AI projects (inference only via Groq and Gemini) and some ML models.
- Constraints: everything free (services, tools, datasets); in-house build; must be hostable online for free; ideally India-specific; website first, desktop/mobile app fallback only if needed.
- Frontend: framework and visual design are **deferred** by the user (D-032). The user will describe how each section looks later; until then build backend-first with plain functional screens.
- Goal: a project that stands out from "follow a tutorial" builds; the owner must present it as their own work and **explain and justify everything** in interview and cross-questioning. (Advice recorded: own the design decisions, data model and tests; be honest if asked directly that AI coding tools were used and directed.)
- Location: **India** is the target context. The user's specific state/city has NOT been provided (TBD). Do not assume a regional language beyond English/Hindi.

## 6. Status snapshot

Phase and task detail lives in `03_ROADMAP_AND_FEATURES.md` section 1 (tasks P0.1…P9.6, milestones M0–M9, gate G1).

| Phase | Name | Milestone | Status |
|---|---|---|---|
| P0 | Planning & design | M0 Design frozen | **COMPLETE** — Invariants defined, ER diagram documented, core schema v0 and test suite drafted |
| P1 | Foundation & auth | M1 Skeleton live | **COMPLETE** — Next.js 16 app shell, Landing page, Auth portal with brand shell and 8-role switcher, password reset, junior consent, keep-alive workflow |
| P2 | Membership & accounts | M2 Members work | **COMPLETE** — Digital QR pass (MEM-1), Front Desk scanner (DSK-3), walk-in registration with claims (DSK-4), DPDP minor consent queue (DSK-5) |
| P3 | Facilities, payments adapter, booking engine | M3 Booking engine proven | **COMPLETE** — 18-facility `bookings.ts` (range overlap, 2/day cap, plan pricing, 12h cancellation, Friday social); `AvailabilityGrid` wired into `/dashboard/courts`; `/dashboard/bookings` for cancellation and check-in |
| P4 | Gear shop | M4 One shelf | **COMPLETE** — Pro Shop storefront and counter POS both draw from one stock ledger; GST, tier discounts, pickup/delivery and order timeline |
| P5 | Bar & kitchen | M5 Bar runs | **COMPLETE** — Bar floor map, menu, tabs and settlement (`SettleTabModal`), three-column kitchen display with ticket transitions |
| P6 | Public site & leads | M6 Visitor to member | **COMPLETE** — 10-section Clubhouse Ledger landing page live; trial session capture & CRM leads pipeline in `leads.ts` |
| P7 | Owner finance & HR | M7 Part 1 functionally complete | **COMPLETE** — Owner console with revenue by source/mode, Z-report with cash reconciliation, GST working papers and CSV export, payables, GST invoices (create + settle), payroll, leave approval, 14-day run rate and expiring share links |
| P8 | UI design & hardening | M8 Looks finished | **COMPLETE** — All member, staff, auth and public surfaces use the Clubhouse Ledger system; route-level RBAC, focus states, 360px layouts and print CSS |
| P9 | Seed, deploy, demo | M9 Part 1 delivered | **IN PROGRESS** — Synthetic seed data and demo routes are ready; live Supabase credentials and a hosted deployment remain |
| P10+ | Part 2 unique features | — | Not started |

Facts as of Session 7: `next build` pr renders 25/25 routes with 0 TypeScript errors; every route was smoke-tested in headless Chrome (HTTP 200, expected H1); member, staff and owner flows were rendered against seeded data; lint still reports the pre-existing React Compiler `set-state-in-effect` warnings in hydration-time effects (non-blocking, build clean).

## 7. Key decisions (summary — full register with statuses in `01_PROJECT_SPEC.md` section 4)

CONFIRMED by the user:
- Website first, PWA fallback (D-001); **one responsive web app with role-based menus** (D-021).
- Public pages browseable; **login required** for trial booking and shop checkout (D-022); **full member self-service** — book, cancel, order, pay (payment simulated via mock/test mode) (D-023).
- **Email + password only** (D-024); public enquiry form without login, rate-limited (D-025).
- **Juniors have own login; guardian consent recorded** (D-026).
- Seeded sports: **tennis, padel, badminton, cricket nets** (D-028); bar takes **counter and table orders** (D-029); delivery with **saved address, staff-managed status, OTP, no maps** (D-030).
- **Frontend framework**: Next.js 16 App Router, React 19, Tailwind CSS v4, Turbopack, Framer Motion, Lucide icons (D-033).
- **Visual design system**: "Clubhouse Ledger" aesthetic (`docs/06_DESIGN_SYSTEM.md`) with warm paper (`#f2ecdf`), ink (`#17150f`), clay (`#c4502b`), court green (`#1e4433`), and scoreboard mono typography, retiring the old obsidian-lime theme (D-034, D-038).
- **Multi-step registration wizard**: with dynamic minor detection (<18) triggering Step 4 Guardian Consent per DPDP Act 2023 (D-035).
- **Exact numeric financial precision**: fixed-point `numeric(12, 2)` across tables and ledger (D-036).
- **Unified dashboard architecture**: `/dashboard/*` persistent layout with role-gated navigation for club and operations (D-037).
- **Local-first reactive invariant runtime**: `store.ts`, `bookings.ts`, `orders.ts`, `finance.ts`, `leads.ts` enforcing DB constraints locally (D-039).

PROPOSED (awaiting the user's approval): Supabase backend (D-002), DB-enforced no-overlap bookings (D-003), :00/:30 slots and 60-minute sessions (D-005), daily-cap rule (D-006), social-play model (D-007), price snapshot (D-008), ~5-minute holds (D-009), payment adapters (D-010), AI chain (D-011), synthetic data (D-012), GST configurable (D-013), Junior consent details (D-014, D-027), IST/UTC handling (D-015), avoid Render for stateful needs (D-016), languages (D-017), ML policy (D-018), roles (D-020), prospect accounts (D-031).

## 8. NEXT SESSION TASK (update every session)

**Session 8 - Live backend, automated invariants and deployment:**
1. Connect a Supabase project and push `supabase/migrations/20261121000001_core_schema.sql` (M4).
2. Replace the local-first stores with Supabase reads/writes behind the same function signatures.
3. Run the SQL concurrency suite (`supabase/tests/concurrency_and_invariants_test.sql`) against the live database.
4. Deploy to a free host, verify the PWA install and the offline pass on a phone.
5. Add engine-level tests for overlap, daily cap, stock and ledger reconciliation; update docs and history.

## 9. Open questions for the user (TBD)

- Frontend framework and host (gate G1; decide before P1.5; re-verify free terms first).
- UI languages beyond English (Hindi?) and the user's state/city for seed data and holidays.
- Branding (club logo/colours) — only needed in P8.
- Courts/nets per sport, opening hours, pricing values, social-play scope (Q10), delivery fee/min order (Q11), social-session capacity.
- Notification channels (Telegram, email, `wa.me` links) — email limits to be verified in P1.4.
- Whether the project is for an interview/assessment only (non-commercial) or may be pitched to a real club (affects hosting licence terms).

## 10. Glossary

- **Slot** — a bookable start time (every 30 min). **Session** — a 60-minute booking starting at a slot, so consecutive slots overlap per court.
- **Hold** — a short-lived (proposed: ~5 min) reservation while payment/confirmation is in progress.
- **Social session** — Friday-night court reservation where many members join one court up to a capacity.
- **Exclusion constraint** — a Postgres rule that makes overlapping rows impossible at the database level.
- **RLS** — Row Level Security: per-row access rules enforced by Postgres.
- **Z-report** — end-of-day closing report (sales, payment modes, cash reconciliation).
- **PWA** — Progressive Web App: a website installable like an app.
- **KDS** — Kitchen Display Screen.
- **DPDP Act 2023** — India's Digital Personal Data Protection Act (parental consent for under-18 data — UNVERIFIED detail to re-check when implementing).
- **GST / HSN / SAC** — India's goods and services tax / goods classification code / services classification code.
- **IST** — Asia/Kolkata time zone (UTC+05:30, no daylight saving).
- **Prospect account** — a logged-in user without a plan; may book only trial sessions (D-031).
- **Pending consent** — Junior account state before guardian consent is verified; cannot book or pay (D-027).
- **Account claim** — flow by which a member registered at the desk sets a password via an invite link (X7).
- **Gate G1** — the point at which the user decides the frontend framework (before P1.5) and later supplies section designs (before P8).
