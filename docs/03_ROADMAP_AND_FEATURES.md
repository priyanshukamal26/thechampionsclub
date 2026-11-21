# 03_ROADMAP_AND_FEATURES — Phases, Checklists, Part 2 Features, Interview Prep, Risks

Part of the docs set; index and rules in `00_MASTER.md`. Requirement IDs (A1…F9) and decisions (D-xxx) are defined in `01_PROJECT_SPEC.md`. Stack and invariants are in `02_ARCHITECTURE_AND_STACK.md`.
Last updated: 2026-11-21 (Session 1, extended: phases restructured into backend-first milestones). Tick a box ONLY when the item is implemented AND its test/evidence is recorded in `04_HISTORY_LOG.md`.

---

## 1. Phases, tasks and milestones (Part 1 — compulsory)

**Approach (D-032):** backend-first. Schema, rules, RLS and tests come before any visual design; screens are plain and functional until the user describes how each section should look (P8). Page IDs (PUB-, AUTH-, MEM-, DSK-, BAR-, MGR-) and flow IDs (FL-) are defined in `01_PROJECT_SPEC.md` sections 6–7.

**Conventions:** task IDs are `P<phase>.<n>`. Tick a task ONLY when it is implemented AND its evidence (test result, commit, URL, screenshot name) is recorded in `04_HISTORY_LOG.md`. A milestone is reached only when all its tasks are ticked and its definition of done (DoD) holds.

**Gate G1 — frontend direction:** the user decides the frontend framework (technical) before P1.5, and supplies the look of each section before P8. Until then screens stay plain.

### P0 — Planning & design  *(in progress)*
- [x] P0.1 Digest the problem statement (Session 1)
- [x] P0.2 Feasibility report delivered in chat (Session 1)
- [x] P0.3 Free-tier limits checked by web search (Session 1; see `02` section 3)
- [x] P0.4 Docs set created (Session 1)
- [x] P0.5 Pages, sections and flows agreed (`01` sections 6–7) (Session 1)
- [x] P0.6 User decisions recorded: D-021…D-026, D-028…D-030, D-032 (Session 1)
- [x] P0.7 User confirms decisions (D-002 backend, D-003…D-020, D-027, D-031, D-036)
- [x] P0.8 Pricing-rule model and seed price values agreed and drafted in seed.sql
- [x] P0.9 Seed parameters: 18 facilities (4 Tennis, 4 Padel, 6 Badminton, 4 Cricket Nets), 6AM-11PM hours, Friday social scope (20 cap, ₹400 guest fee)
- [x] P0.10 ER diagram (Mermaid) added to `02_ARCHITECTURE_AND_STACK.md`
- [x] P0.11 SQL schema v0 (`supabase/migrations/20261121000001_core_schema.sql`) with exclusion constraint and daily-cap trigger
- [x] P0.12 Invariant/concurrency test plan written (`supabase/tests/concurrency_and_invariants_test.sql`)
- **Milestone M0 — Design frozen.** DoD: all decisions CONFIRMED; ER + schema v0 drafted and documented; invariant test suite created.

### P1 — Foundation & auth (X1, X2, X5, X6)
- [x] P1.1 Git repo cloned and tracking remote origin; package.json and dependencies initialized (Session 2)
- [ ] P1.2 Hosting target chosen after re-verifying free terms (UNVERIFIED items in `02` section 3)
- [x] P1.3 Supabase migration structure set up (`supabase/migrations/20261121000001_core_schema.sql`) with enums, profiles, and RLS policies
- [x] P1.4 Email + password auth (sign-up, login, reset); check email-delivery limits (H13) and record the policy (Session 3: built `/login` AUTH-2, `/reset-password` AUTH-3, AuthContext with 6-role demo switcher)
- [x] P1.5 Frontend framework decided (gate G1: Next.js 15, Tailwind v4, Framer Motion) and app shell created (Session 2)
- [ ] P1.6 Roles + RLS skeleton with tests (a member cannot read another member's rows)
- [x] P1.7 Role-based navigation and protected routes (Session 3: Navbar integrates dynamic user profile, role badge pill, and sign-out)
- [x] P1.8 Sign-up Multi-step Wizard with DOB; Junior branch stores guardian + consent record; `pending_consent` state (AUTH-1, AUTH-4, FL-2) (Session 2 UI, Session 3 auth & audit wire-up)
- [x] P1.9 `audit_log` table + helper (`src/lib/audit.ts`) (Session 3)
- [ ] P1.10 Deploy the skeleton to the free host
- [x] P1.11 Keep-alive scheduled job (H1) (`.github/workflows/supabase-keepalive.yml`) (Session 3)
- **Milestone M1 — Skeleton live.** DoD: a person can sign up, log in and reset a password on the deployed URL; roles gate pages; RLS test passes.

### P2 — Membership & accounts (A1–A6, X6, X7)
- [x] P2.1 `plans` + `plan_benefits`; seed Gold/Silver/Junior with exact entitlements (Session 4)
- [x] P2.2 `members` + `memberships`; desk registration (DSK-4) for A1/A2 (Session 4)
- [x] P2.3 Account invite + claim flow (AUTH-5, FL-8, X7) with claim link generator (Session 4)
- [x] P2.4 Pending-consent queue and verification action (DSK-5, D-027) with in-person front desk approval (Session 4)
- [x] P2.5 Entitlement lookup function (A3) rendering court multipliers and shop/bar discounts (Session 4)
- [x] P2.6 Expiry tracking, validity countdowns, and renewal alerts (A4, FL-11) (Session 4)
- [x] P2.7 Signed QR pass + member lookup/scan screen (A5, DSK-3, MEM-1) (Session 4)
- [x] P2.8 Member history view (A6) with past court bookings, gear purchases, and unsettled cafeteria tabs (Session 4)
- [ ] P2.9 Junior-turns-18 prompt
- [x] P2.10 Tests: plan assignment, expiry flags, consent gating, and production build verification (Session 4)
- **Milestone M2 — Members work.** DoD: desk registers an adult and a Junior; Junior blocked until consent verified; member claims account; expiry alert flags a test membership; build verified.

### P3 — Facilities, payments adapter & booking engine (B1–B9, F1/F2 start)
- [ ] P3.1 `sports`, `facilities` (tennis, padel, badminton, cricket nets), opening hours (D-028)
- [ ] P3.2 `pricing_rules` + `quote_price()` + tests (B4)
- [ ] P3.3 `bookings` + exclusion constraint + **concurrency test: N simultaneous attempts, exactly 1 wins** (B8)
- [ ] P3.4 Slot generation / availability view at :00 and :30 with 60-minute sessions (B1, B2)
- [ ] P3.5 Daily cap function + test (B3, D-006)
- [ ] P3.6 Slot holds + expiry job (D-009)
- [ ] P3.7 Payment adapter: Cash + Mock; `payments` + `transactions` ledger rows (D-010, D-023)
- [ ] P3.8 Cancellation policy, cancel flow, basic waitlist (B6)
- [ ] P3.9 Plan-change behaviour + price-snapshot test (B5, D-008)
- [ ] P3.10 Social sessions + capacity + test (B7, D-007)
- [ ] P3.11 Plain member screens: Book a Court, My Bookings, Social Play (MEM-2, MEM-3, MEM-4)
- [ ] P3.12 Plain desk screens: Today Board, Quick Booking, Social Session Manager (DSK-1, DSK-2, DSK-6; B9)
- [ ] P3.13 Prospect trial-only booking rule (D-031)
- **Milestone M3 — Booking engine proven.** DoD: invariants 1, 2, 3 and 7 in `02` section 5.1 pass automated tests; member and desk can book, cancel and pay (mock) end to end.

### P4 — Gear shop (C1–C6)
- [ ] P4.1 Products, variants, categories, HSN field (C1)
- [ ] P4.2 Stock ledger + `reserve_stock()` + concurrent-purchase test (C2, C6)
- [ ] P4.3 Low-stock alert (C3)
- [ ] P4.4 Member catalogue, cart, checkout (MEM-5)
- [ ] P4.5 Saved addresses; pickup/delivery fulfilment; statuses; handover OTP (D-030, MEM-6)
- [ ] P4.6 Counter POS (DSK-7, C4)
- [ ] P4.7 Order queue (DSK-8)
- [ ] P4.8 Automatic plan discount on shop purchases
- [ ] P4.9 Payments + ledger rows for shop sales
- **Milestone M4 — One shelf.** DoD: counter and online purchases decrement the same stock; the last unit cannot be sold twice; delivery handover needs the OTP.

### P5 — Bar & kitchen (D1–D8)
- [ ] P5.1 Menu items and tables
- [ ] P5.2 Orders with channel (counter/table) and lines (D-029, D1)
- [ ] P5.3 Kitchen display with realtime updates (D2, BAR-5)
- [ ] P5.4 Tabs + automatic member discount (D3, D4)
- [ ] P5.5 Payments: cash, card, UPI QR, split (D5)
- [ ] P5.6 Shifts + attendance (D6)
- [ ] P5.7 Table map and waiter order screen (D7, BAR-1, BAR-2)
- [ ] P5.8 Closing report / Z-report (D8)
- [ ] P5.9 Member-facing bar menu, pre-order and tab view (MEM-7)
- **Milestone M5 — Bar runs.** DoD: invariant 5 (tab total = sum of discounted lines) passes; closing report matches ledger for a test day.

### P6 — Public site & leads (E1–E10)
- [ ] P6.1 Privacy-safe public views (availability, catalogue, plans)
- [ ] P6.2 Public pages (PUB-1…PUB-5, PUB-7) (E1–E4)
- [ ] P6.3 Public enquiry form, rate-limited, bot protection → lead + staff alert (PUB-6, E6, E7, D-025)
- [ ] P6.4 Trial booking gated by login → lead + prospect account (E5, FL-1)
- [ ] P6.5 Leads pipeline screen + follow-up reminders (E8, MGR-8)
- [ ] P6.6 Quote generation (E9)
- [ ] P6.7 Convert lead → member (E10)
- [ ] P6.8 SEO basics (sitemap, metadata, structured data)
- **Milestone M6 — Visitor to member.** DoD: FL-1 and FL-9 work end to end on the deployed site.

### P7 — Owner finance & HR (F1–F9)
- [ ] P7.1 Unified ledger views by source and payment mode (F1, F2)
- [ ] P7.2 Dashboard today/week/month (F8, MGR-1)
- [ ] P7.3 Payables: vendor bills, salaries, GST payable (F3)
- [ ] P7.4 GST invoicing for memberships and business clients (F4)
- [ ] P7.5 Employees, leave workflow, payroll and payslips (F5, F6)
- [ ] P7.6 Tax config + GST summary export (F7)
- [ ] P7.7 Exports and expiring share links (F9)
- [ ] P7.8 Configuration screens: plans, pricing, facilities/hours, menu, products, delivery, tax (MGR-6)
- [ ] P7.9 Reconciliation test: ledger totals = sources (invariant 6)
- [ ] P7.10 RLS and audit-log review (X1, X2, X3)
- **Milestone M7 — Part 1 functionally complete.** DoD: every requirement ID in `01` section 2 is implemented and demonstrable; reconciliation test passes.

### P8 — UI design & hardening (starts after the user supplies the look of sections)
- [ ] P8.1 User describes each section's look (page IDs in `01` section 6)
- [ ] P8.2 Design tokens / component set
- [ ] P8.3 Restyle all pages
- [ ] P8.4 Tablet/phone checks for staff screens (X4)
- [ ] P8.5 PWA install support
- [ ] P8.6 Empty/loading/error states
- **Milestone M8 — Looks finished.** DoD: all pages styled and checked on phone, tablet and desktop.

### P9 — Seed, deploy, demo
- [ ] P9.1 Seed script (Faker `en_IN`, UNVERIFIED locale coverage)
- [ ] P9.2 Booking-history simulator
- [ ] P9.3 All invariant tests green
- [ ] P9.4 Production deploy; URLs recorded in the history log
- [ ] P9.5 10-minute demo script rehearsed
- [ ] P9.6 Interview Q&A reviewed (section 5)
- **Milestone M9 — Part 1 delivered.** DoD: acceptance criteria 1–5 in `01` section 5 hold.

### P10+ — Part 2
Features listed in section 2 below, started only after M9.

**Part 1 is complete only when M0–M9 are reached.**

---

## 2. Part 2 — Unique features (start only after Part 1)

Ranked by impact vs effort. All are PROPOSED. Each must be free-stack-compatible and degrade gracefully.

**Tier 1**
1. **Conversational booking agent** — natural-language (optionally voice via the browser's speech API) booking; LLM calls whitelisted functions that use the same DB rules.
2. **Racket-emergency flow** — "string snapped" → looks at the member's next booking → offers a stringing job with an ETA before the slot, or a loaner/new racket; ties shop to booking.
3. **Post-match pre-order** — shortly before a booking ends, offer "your usual?"; order reaches the kitchen screen in advance.
4. **Rain-aware courts** — weather forecast badge and one-tap reschedule/credit for outdoor courts.
5. **Smart waitlist & slot-filling** — cancellations auto-offered to waitlisted members with a claim window; suggested off-peak discounts.
6. **Owner "Ask your club"** — natural-language questions over read-only views with shown SQL; daily digest via Telegram.

**Tier 2**
7. Find-a-partner + skill rating/ladder for social nights.
8. Member health/churn score (rule-based first; ML optional, disclosed as trained on synthetic data).
9. Auto-drafted purchase orders from low-stock + sales velocity.
10. Offline-tolerant front-desk PWA with sync (conflicts still resolved by DB constraint).
11. Bilingual UI (English + Hindi first; others TBD).
12. Receipts/invoices with UPI QR, shareable via `wa.me` links.

**Avoid:** blockchain, face recognition, anything needing paid APIs.

---

## 3. Vibe-coding method (for the beginner owner)

1. **Schema first**, then DB functions, then API, then UI.
2. **One module per session**; finish and test before moving on.
3. Always request **tests for the invariants** in `02` section 5.1.
4. Keep **migrations in Git**; commit after every working step; write meaningful commit messages (they serve as proof in `04_HISTORY_LOG.md`).
5. Ask the AI to **explain each piece in plain language** and add a "what to say in an interview" note.
6. Never paste secrets into chats or commits.
7. When something fails, record the error, the cause and the fix in the history log (these become interview stories).

## 4. Demo script outline (draft)

1. Public site → plans, prices, free slots → trial booking → lead appears for staff.
2. Convert lead → member → QR pass.
3. Front desk: busy-evening grid; book member, walk-in, phone caller; show two people cannot take the same court.
4. Friday social session with capacity.
5. Shop: counter sale and online order draw from the same stock; low-stock alert.
6. Bar: tab, kitchen screen, auto-discount, payment, closing report.
7. Owner dashboard: revenue by source and mode, payables, payroll, GST export, share link.
8. Part 2 highlights.

## 5. Interview defence prep

**Concepts to learn until teachable:** transactions/ACID; exclusion constraints; Row Level Security; idempotency; append-only ledgers; JWT and signed QR tokens; UTC vs IST storage; cron/scheduled jobs; indexes; why LLMs only call whitelisted functions; the payment-adapter pattern.

**Likely cross-questions (short answers):**
- *Two people click the same slot at the same millisecond?* The database exclusion constraint rejects one; a concurrency test proves exactly one wins.
- *How do you avoid selling the last pair of shoes twice?* An atomic conditional update inside one function used by counter and online channels.
- *What if the LLM hallucinates?* It can only call validated functions/views; core flows never depend on it.
- *Why is the data fake?* The club does not exist; schema and logic are data-agnostic; a simulator mimics realistic patterns; the data is disclosed as synthetic.
- *What breaks at 10× scale?* Free-tier limits (database size, pausing, rate limits); the design holds and would move to paid tiers.
- *Why not hard-code prices or GST?* They change; they are data with effective dates.
- *How do you handle plan changes?* Price is snapshotted at booking time; future bookings use the new plan.
- *Is the payment real?* No: adapter with cash/mock/test modes; going live needs KYC and configuration.
- *How do you handle minors' data?* Junior accounts record DOB, guardian details and a consent version/timestamp; the account stays `pending_consent` until verified, and cannot book or pay.
- *Why email + password only?* Phone OTP normally needs a paid SMS service; the choice keeps the stack free.
- *Did you use AI to build this?* Answer honestly: AI coding tools were used and directed by you; you own the design decisions, data model, rules and tests.

## 6. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Booking logic bugs | High | DB constraint + concurrency tests |
| Free-tier changes | Medium | Re-verify; config-driven; keep-alive; rebuildable from migrations |
| LLM limits/outages | Low–Medium | Fallback chain; AI off critical path |
| Tax/payroll inaccuracies | Medium | Configurable data; "simplified" label; verify sources |
| Scope too large | High | Phase order; Part 1 first; Part 2 only after |
| Beginner can't explain code | High | Explanations per module; interview prep section; tests as evidence |
| Hosting licence mismatch | Low–Medium | Decide host in P1; note non-commercial restriction |
| Data/privacy claims | Medium | Synthetic data only; no sensitive data to free LLMs |
| Email delivery limits block verification/reset (H13) | Medium | Check in P1.4; custom SMTP or demo-mode policy |
| Frontend undecided delays visible progress (H16) | Medium | Backend-first with plain screens; gate G1 |
| Spam on public enquiry form (H14) | Low | Rate limit, honeypot, review queue |
