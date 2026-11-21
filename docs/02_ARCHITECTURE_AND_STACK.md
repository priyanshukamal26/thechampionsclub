# 02_ARCHITECTURE_AND_STACK — Stack, Free-Tier Facts, Hurdles, Data Model

Part of the docs set; index and rules in `00_MASTER.md`. Decisions referenced as D-xxx live in `01_PROJECT_SPEC.md`.
Last updated: 2026-11-21 (Session 1, extended). Everything here is PROPOSED unless marked otherwise. Frontend framework/visual design is DEFERRED (D-032).

---

## 1. Hardware reality

- Machines: Asus TUF F16 (Intel Core 5 210H, RTX 4050 6GB) and a Mac M4 (stated by user). Both are far more than enough: the stack is web + managed Postgres; nothing needs a local GPU.
- Colab: optional and only for a small Part 2 ML experiment (D-018).
- Recommendation: use the cloud Supabase project directly during development instead of running Supabase locally in Docker (saves RAM and setup). Local Docker Supabase is optional.

## 2. Proposed stack

| Layer | Choice | Status | Notes |
|---|---|---|---|
| Frontend | **DEFERRED (D-032)**. One responsive web app (D-021), installable PWA. Next.js + Tailwind + shadcn/ui was only an initial suggestion | TBD (gate G1) | Public pages need SEO, which favours server-rendered output; decide after the user chooses direction |
| Backend/DB | Supabase: Postgres, Auth, Realtime, Storage, Row Level Security, scheduled jobs, Edge Functions | PROPOSED | Business rules as DB constraints/functions |
| Auth | Supabase Auth, email + password only (D-024) | CONFIRMED (method) | Email delivery limits for verification/reset on the free plan are UNVERIFIED — check in P1.4 |
| Frontend hosting | Cloudflare (Pages/Workers) **or** Vercel | **TBD in P1** | Re-verify terms and Next.js compatibility first. Vercel Hobby is non-commercial only (see section 3) |
| Cron/keep-alive | GitHub Actions scheduled workflow | UNVERIFIED limits | Intended to ping the DB to avoid free-tier pause |
| AI inference | Groq → Gemini → OpenRouter, server-side wrapper `callLLM()` | PROPOSED (D-011) | Owner already has Groq and Gemini experience |
| Notifications | Telegram Bot API; a free transactional-email tier; `wa.me` share links | UNVERIFIED | WhatsApp Business API is not assumed free |
| PDFs | React-based PDF renderer or server-side HTML→PDF | TBD | Invoices, payslips, quotes |
| Maps | Leaflet + OpenStreetMap | UNVERIFIED terms | No API key |
| Weather | Open-Meteo | UNVERIFIED terms | Said to be free without a key for non-commercial use; confirm |
| Testing | Vitest/Jest for logic; SQL tests or scripted concurrency test for DB rules | TBD | |
| Source control | Git + GitHub (public repo enables free Actions — UNVERIFIED) | TBD | |

## 3. Free-tier facts (re-verify before depending on them)

All rows below were checked via web search on **2026-11-21** unless marked otherwise. Third-party blog sources are weaker than official docs; where possible confirm on the official page.

| Service | Fact | Source type | Confidence |
|---|---|---|---|
| Supabase Free | Unlimited API requests; 50,000 monthly active users; 500 MB database; shared CPU, 500 MB RAM; 5 GB egress; 1 GB file storage; free projects paused after 1 week of inactivity; limit of 2 active projects | Official pricing page (supabase.com/docs/pricing) | High |
| Supabase Free | The 500 MB database limit applies per active project (changed Jan 2025); paused/deleted projects do not count | Official changelog (supabase.com/changelog/33121-…) | High |
| Supabase Free | Realtime: 2 million messages per month (256 KB max size) | Third-party (cloudzero.com blog, "as of Aug 2026") | Medium |
| Render Free (web service) | Spins down after 15 min without inbound traffic; spin-up takes up to ~1 minute; 750 free instance hours/workspace/month; ephemeral filesystem | Official docs (render.com/docs/free) | High |
| Render Free (Postgres) | Official docs say free Postgres **expires 30 days after creation**. Some blogs say 90 days — conflicting; trust official docs and avoid reliance | Official + third-party | High (30 days) |
| Vercel Hobby | Personal, non-commercial use only; ~100 GB transfer, 1M edge requests, 1M function invocations/month | Third-party summary (flaviocopes.com, Sept 2026) + quote of Vercel docs on non-commercial | Medium |
| Groq Free | Roughly 30 requests/min and ~1K requests/day per model; additional token-per-minute/day ceilings exist (one report: 12K TPM / 100K TPD on a 70B model) | Third-party (freelm package page; community discussion) | Medium-Low |
| Gemini API Free | Limits apply per project (not per key); Pro models have no free quota; exact RPM/token numbers change often (an April 2026 blog listed 15 RPM / 1M tokens/day for a Flash model) | Third-party | Low-Medium |
| Gemini CLI | A third-party list (June 2026) reported a free tier of ~1,500 requests/day on a Flash model | Third-party | Low |
| OpenRouter free models | Rotating `:free` models; low daily caps (third-party: ~50 req/day under $10 credit) | Third-party | Low |

**Not verified this session (from model memory — verify before use):** Cloudflare Pages/Workers free-plan terms and Next.js support; GitHub Actions free minutes and scheduled-workflow behaviour; Telegram Bot API limits; Razorpay/Cashfree test-mode availability without KYC; free email-API tier limits; Open-Meteo terms; Leaflet/OSM tile usage policy; Python `holidays` package India coverage; Faker `en_IN` locale; Supabase `btree_gist` extension availability and `pg_cron` availability on the free plan.

## 4. Hurdles and fool-proof plans

| # | Hurdle | Plan |
|---|---|---|
| H1 | Supabase free project pauses after a week of inactivity | A scheduled GitHub Actions job pings a lightweight endpoint every 2–3 days; open the app the day before any demo; keep SQL migrations + seed script in Git to rebuild in minutes |
| H2 | Render free spin-down / ephemeral disk / expiring Postgres | Avoid Render for stateful needs (D-016). Use serverless functions + Supabase |
| H3 | Free LLM limits/outages/model retirements | One `callLLM()` wrapper: provider order Groq → Gemini → OpenRouter, response caching, per-user throttle, model names in config (not code), deterministic fallback when all fail. AI is never on the critical path (D-011) |
| H4 | Privacy of free-tier LLM calls | Only synthetic/non-sensitive data goes to LLMs; check provider terms (free tiers may log prompts — UNVERIFIED) |
| H5 | Hosting licence (Vercel Hobby non-commercial) | Fine for an interview/assessment project; choose another host if the app is pitched commercially (decision TBD in P1) |
| H6 | Real payments need KYC | Payment adapter (Cash, Mock, gateway test mode), idempotency keys (D-010) |
| H7 | No real club data | Synthetic data + simulator (D-012) |
| H8 | GST/payroll accuracy | Rates and statutory deductions are configurable data; verify on official sources; label payroll as "simplified" (D-013) |
| H9 | Beginner can't debug complex SQL alone | One module per session; schema first; tests for invariants; every migration committed; explanations recorded for interview |
| H10 | Race conditions (double booking, oversold stock) | DB-level guarantees (exclusion constraint, atomic conditional stock update) + concurrency tests |
| H11 | Free tier DB size 500 MB | Synthetic year of data is small (estimate only, UNVERIFIED); avoid storing images in DB, use Storage with size limits |
| H12 | Timezone bugs | `timestamptz`, IST display, no DST in India (D-015) |
| H13 | Email + password needs email delivery for verification and reset; the default sender's free limits are UNVERIFIED and may be very low | In P1.4 verify the limits; options to evaluate: custom SMTP via a free email-service tier (UNVERIFIED), or disable email confirmation for the demo and keep a staff-assisted password reset; log the decision |
| H14 | Public enquiry form invites spam/bots (D-025) | Rate limiting per IP, hidden honeypot field, server-side validation, optional free CAPTCHA (UNVERIFIED), leads marked `unverified` until staff review |
| H15 | Junior consent must be credible (D-026/D-027) | Store DOB, guardian details, consent text version and timestamp; `pending_consent` state until verified by desk or guardian link; legal specifics UNVERIFIED — re-check DPDP Act wording before claiming compliance |
| H16 | Frontend undecided (D-032) | Backend-first: schema, rules, RLS and tests independent of the UI; plain functional screens; gate G1 before P1.5 and before P8 styling |

## 5. Data model outline (v0 — to be turned into SQL in Session 2+)

Naming: snake_case tables. All tables get `id`, `created_at`, and where relevant `updated_at`. Money stored as integer paise (or `numeric(12,2)`) — decide in schema v0 and log it as a decision.

**Identity & access:** `profiles` (links Supabase auth user to role and `account_state`: prospect / pending_consent / active_member / staff / suspended), `roles`/role enum, `account_invites` (for desk-registered members, X7), `audit_log`.

**Membership (A):** `plans` (Gold/Silver/Junior), `plan_benefits` (court rate multiplier, shop discount %, bar discount %, free hours, daily cap), `members` (name, phone, email, DOB, guardian fields, consent record), `memberships` (member, plan, start, end, status), `member_notes`. Add `guardian_consents` (member, guardian name/contact, consent text version, consented_at, verified_by, verified_at, status).

**Facilities & booking (B):** `sports` (tennis, padel, badminton, cricket nets — D-028), `facilities`/`courts` (sport, name, type court/net, active), `opening_hours`, `pricing_rules` (base rate, peak windows, walk-in rate), `bookings` (court, start_at, end_at, status: held/confirmed/cancelled/completed/no_show/expired, member nullable for walk-ins, price snapshot, source: member/walk-in/phone/online), `cancellation_policies`, `waitlist`, `social_sessions` (court, time range, capacity), `session_participants`.

**Shop (C):** `products`, `product_variants` (size/colour, SKU, HSN code), `stock_movements` (append-only ledger), stock view/column with reorder level, `online_orders`, `online_order_lines`, delivery fields (`fulfilment`: pickup/delivery, status, OTP). Add `addresses` (member saved delivery addresses) and delivery settings (`delivery_fee`, `min_order_value`, values TBD).

**Bar (D):** `menu_items`, `tables`, `tabs`, `bar_orders` (with `channel`: counter/table and nullable `table_id`), `bar_order_lines` (with kitchen status), `shifts`, `attendance`.

**Payments & ledger (F1–F2):** `payments` (method: cash/card/upi/online, status, idempotency key, reference), `transactions` (unified revenue ledger: source = court/shop/bar/membership/other, GST fields), `invoices`, `invoice_lines`.

**Leads (E):** `leads` (source, status pipeline, assigned staff, follow-up date), `quotes`.

**Finance/HR (F3–F7):** `vendors`, `vendor_bills`, `employees`, `leave_requests`, `payroll_runs`, `payslips`, `tax_config` (GST rates/HSN/SAC).

### 5.1 Key invariants (each needs an automated test)

1. No two active bookings (status in held, confirmed) overlap on the same court.
2. A member has at most 2 non-cancelled bookings per IST day (D-006).
3. Social-session participants never exceed capacity; no normal booking overlaps a social session on that court.
4. Stock never goes negative; counter and online orders use the same reservation function.
5. Bar tab total = sum of line totals after automatic plan discount.
6. `transactions` totals reconcile with bookings, orders, bar tabs and membership invoices.
7. Booking price snapshot never changes after confirmation.

### 5.2 Booking constraint sketch (to validate in the real database)

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status IN ('held','confirmed'));
```

Notes: `tstzrange` default bounds are `[)` so a booking ending at 19:00 and another starting at 19:00 do not conflict. The constraint cannot reference `now()`; expired holds must be moved to status `expired` by a scheduled job or by cleanup at insert time (D-009). Social sessions need either to live in the same table (as an exclusive row with a type) or to be covered by a second constraint — decide in schema v0.

### 5.3 Stock reservation sketch

```sql
-- inside one transaction / function
UPDATE product_variants
   SET qty_on_hand = qty_on_hand - :n
 WHERE id = :variant_id AND qty_on_hand >= :n;
-- if 0 rows were updated, reject: insufficient stock
-- also INSERT a row into stock_movements for the audit ledger
```

## 6. Security model (D-020)

- Roles: Owner, Manager, Front Desk, Bar/Kitchen Staff, Member, anonymous visitor.
- Enforce with Row Level Security. Members see only their own rows. The public site reads only specially-built views (e.g. free/busy by court and time, product catalogue, plan prices) that contain no personal data.
- Service-role keys live only on the server. `NEXT_PUBLIC_*` variables must never hold secrets.
- Audit log for sensitive actions (price changes, refunds, payroll runs, role changes).
- Junior data: guardian consent recorded (D-014, D-026); `pending_consent` accounts cannot book or pay (D-027).
- Account states: `prospect` (D-031: trial booking only) → `active_member` when staff assign a plan; staff accounts are created by the Owner/Manager only (no public staff sign-up).
- Public enquiry endpoint is the only write open to anonymous users and is rate limited (D-025).

## 7. AI architecture (D-011)

- `callLLM(task, input)` server-side wrapper: provider chain, caching, throttling, timeouts, config-driven model names, structured-output validation.
- Natural-language booking agent: the LLM may only call whitelisted functions (`check_availability`, `quote_price`, `book_slot`) that go through the same database rules as the UI.
- "Ask your club" analytics: LLM may only query a set of read-only SQL views; the generated SQL is shown to the owner; no raw table access; no writes.
- Fallbacks: when every provider fails, the UI falls back to the normal forms/reports.

## 8. Payments architecture (D-010)

- Interface `PaymentProvider` with implementations: `CashProvider`, `MockProvider`, `GatewayTestProvider` (UNVERIFIED availability).
- UPI: generate `upi://pay?pa=<test VPA>&am=<amount>&tn=<note>` as QR; staff mark received. Do not claim real settlement.
- Idempotency key per payment attempt; webhook handler (when a gateway test mode is used) verifies signatures.

## 9. Data and datasets plan

| Need | Plan | Status |
|---|---|---|
| Members/staff/leads | Python Faker with `en_IN` locale | UNVERIFIED locale coverage — test |
| Booking history | Own simulator: weekday evening peaks, busier weekends, Friday social nights, a seasonal dip, ~10–15% cancellations (parameters PROPOSED, editable) | TBD |
| Weather | Open-Meteo historical + forecast | UNVERIFIED terms |
| Holidays | Python `holidays` package (India) | UNVERIFIED coverage; hand-verify local holidays |
| GST/HSN | Official GST portal for rates; HSN chapters believed to be 95 (sports articles), 64 (footwear), 61/62 (apparel) — **verify**; slabs were restructured in 2025 — **verify current** | UNVERIFIED |
| Images/icons | Free-licence sources (Unsplash/Pexels, Lucide icons) — check each licence | UNVERIFIED |
| Product/price realism | Manual look at Indian retailer price ranges; no scraping | TBD |

Principle: no external dataset is required for Part 1. The data is synthetic and must be disclosed as synthetic.

## 10. Proposed repository layout (not yet created)

```
thechampionsclub/
  docs/                  <- this doc set
  supabase/
    migrations/          <- SQL migrations (source of truth for schema)
    seed/                <- seed + simulator scripts
    tests/               <- DB invariant tests
  src/ (or app/)         <- frontend app (framework TBD, D-032)
  scripts/               <- helper scripts (e.g. simulator, keep-alive)
  .env.example           <- variable NAMES only
```

Environment variable NAMES to expect (values never in docs): Supabase URL, Supabase anon key, Supabase service-role key (server only), `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, Telegram bot token + chat id, payment-gateway test keys (if used).

## 11. Deployment plan (draft)

1. Create Supabase project (free) → run migrations → seed.
2. Deploy frontend on the chosen free host with env vars set in the host dashboard.
3. Add the keep-alive scheduled workflow.
4. Smoke test the public site, a booking, a shop order, a bar order, the dashboard.
5. Record URLs and evidence in `04_HISTORY_LOG.md`.
