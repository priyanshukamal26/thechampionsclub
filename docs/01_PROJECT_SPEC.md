# 01_PROJECT_SPEC — Requirements, Ambiguities, Decision Register

Part of the docs set; index and rules are in `00_MASTER.md`.
Last updated: 2026-11-21 (Session 1, extended: user decisions D-021…D-032 added; page inventory and flows added in sections 6–7).

---

## 1. Source document

Source: `Sports_Club_Management_System.pdf` (uploaded by the user in Session 1; 4 pages). Title: "Sports Club Management System — Build the digital backbone of a club that has outgrown WhatsApp and Excel."

The task, in the document's words in essence: build ONE unified platform that solves the day-to-day operational problems of a modern sports club; the "scenes" describe things that happen in an ordinary week and the system must make each easy.

### 1.1 The club (as described in the PDF)

- **The Champions Club**: a busy sports club.
- Section 1 ("The Challenge") says the club is a **tennis, padel and badminton** club.
- Section 2 ("Meet The Champions Club") says it has **tennis and cricket courts**, a **gear shop** (rackets, balls, shoes, accessories), and a **bar and cafeteria** (food and drinks after matches).
- Three member tiers: **Gold** (premium, full access), **Silver** (standard), **Junior** (under 18, discounted).
- A **front desk** handles walk-ins, phone calls and staff schedules.
- Current state: bookings on WhatsApp; member lists in Excel; bar receipts on paper; court availability by phone calls; no revenue/operations visibility.

### 1.2 The six scenes ("A Week at the Club")

1. A new member walks in.
2. Booking a court on a busy evening.
3. Gearing up before a match.
4. After the match, at the bar.
5. A stranger finds the club online.
6. The owner, at the end of the month.

Requirement groups A–F in section 2 map one-to-one to these six scenes. Cross-cutting concerns (roles, audit, India specifics) are added by us.

---

## 2. Requirement register (Part 1 — compulsory)

Each ID must be ticked in `03_ROADMAP_AND_FEATURES.md` when done and tested. "Source" = the scene in the PDF it derives from. Items marked *(derived)* are not literal PDF text but are needed to satisfy the scene.

### A. New member (scene 1)

| ID | Requirement | Notes |
|---|---|---|
| A1 | Register a new member at the front desk; know who they are | identity + contact; Junior needs DOB + guardian (derived); members can also self sign-up (D-021/D-024) |
| A2 | Assign a plan: Gold / Silver / Junior | |
| A3 | Plan defines entitlements: court rates, shop discount, bar discount | stored as data, not code |
| A4 | Track membership expiry; nobody should have to remember | automated flags/reminders (derived: scheduled job) |
| A5 | Any staff member can recognise a member quickly | search + QR pass (derived) |
| A6 | See the member's history with the club | bookings, purchases, tabs, notes |

### B. Court booking (scene 2)

| ID | Requirement | Notes |
|---|---|---|
| B1 | Sessions last one hour | |
| B2 | A new slot opens every half hour | so sessions overlap per court |
| B3 | Each member can play at most twice a day | definition in D-006 |
| B4 | Members pay less than walk-ins, or nothing, depending on plan | pricing engine |
| B5 | Plans change | pricing and history behaviour in D-008 |
| B6 | People cancel | cancellation policy + slot freed |
| B7 | Friday night social play: many people share one court | model in D-007 |
| B8 | Two people must never be on the same court at the same time | DB-enforced, D-003 |
| B9 | Front desk serves messages, a walk-in at the counter and phone enquiries about what is free | fast availability grid (derived) |

### C. Gear (scene 3)

| ID | Requirement | Notes |
|---|---|---|
| C1 | Sell rackets, balls, shoes, accessories and apparel | categories |
| C2 | Always know what is in stock | |
| C3 | Know when something is running low | reorder level alert |
| C4 | Counter purchases | POS |
| C5 | Online order with pickup at the club **or** delivery | |
| C6 | Counter and online orders draw from the **same** shelf/inventory | single stock source |

### D. Bar and cafeteria (scene 4)

| ID | Requirement | Notes |
|---|---|---|
| D1 | Digital orders (replace paper scribbles) for bursts of ~20 people | |
| D2 | Kitchen can see who ordered what | KDS |
| D3 | Members can run a tab and settle before leaving | |
| D4 | Member discount applied automatically | from plan |
| D5 | Guests pay by cash, card or UPI | |
| D6 | Staff work in shifts | shifts/attendance |
| D7 | Tables are tracked | |
| D8 | At closing, owner sees what the bar earned that day | Z-report |

### E. Online presence and enquiries (scene 5)

| ID | Requirement | Notes |
|---|---|---|
| E1 | Public website so strangers can find the club | SEO |
| E2 | Show plans and prices | |
| E3 | Show what is free this week | availability without exposing member data |
| E4 | Show what the shop sells | |
| E5 | Let a visitor book a trial session | login required (D-022); creates/uses a prospect account (D-031) |
| E6 | Enquiries must not vanish (captured) | leads table; public enquiry form without login (D-025); trial sign-ups also create leads |
| E7 | Someone at the club hears about each enquiry | notification |
| E8 | Follow up the enquiry | status pipeline + reminders |
| E9 | Send a quote | quote PDF/message |
| E10 | Welcome a new member (convert lead to member) | one-click convert |

### F. Owner, month-end (scene 6)

| ID | Requirement | Notes |
|---|---|---|
| F1 | See how much was earned and from where (courts, shop, bar) | unified ledger |
| F2 | See money by payment mode (cash, card, online) | |
| F3 | See what the club owes | payables |
| F4 | Invoice memberships and business clients | GST invoices |
| F5 | Pay employees | payroll |
| F6 | Approve leave | workflow |
| F7 | Report taxes | GST summary/exports |
| F8 | See how the club is doing today, this week, this month | dashboard |
| F9 | Share the numbers when needed | PDF/CSV/expiring read-only link |

Cross-cutting (derived, not literal PDF):

| ID | Requirement |
|---|---|
| X1 | Roles and permissions (Row Level Security) |
| X2 | Audit log for sensitive actions |
| X3 | India specifics: INR, UPI, GST, IST, DPDP-style consent for minors |
| X4 | Responsive layouts usable on phones/tablets; installable PWA |
| X5 | Authentication: email + password sign-up, login, password reset (D-024) |
| X6 | Junior consent: guardian details + recorded consent; pending-consent state and verification (D-026, D-027) |
| X7 | Account claim/invite so members registered at the desk can get online access |

---

## 3. Ambiguities and inconsistencies found in the PDF

| # | Finding | Handling |
|---|---|---|
| Q1 | Section 1 says tennis, padel, badminton; section 2 says tennis and cricket | Facilities/sports are data (D-004) |
| Q2 | "A new slot opens every half hour" with one-hour sessions | Overlapping sessions per court; overlap checks are range-based (D-005) |
| Q3 | "Play at most twice a day" — day boundary, cancelled bookings, social play, walk-ins unspecified | D-006 |
| Q4 | "Members pay less than walk-ins, or nothing at all" — no prices given | Pricing rules are data; seed values TBD with the user (D-008) |
| Q5 | "Friday night … many people share one court" — capacity unspecified | D-007 |
| Q6 | "Taxes to report" — jurisdiction unspecified | India/GST assumed (D-013) since user wants India-specific |
| Q7 | "Delivered" gear — no logistics detail | Staff-managed local delivery (D-019) |
| Q8 | "Online payment" mentioned as money source ("card, cash and online") | Gateway adapter; mock/test mode (D-010) |
| Q9 | Cricket "courts" — cricket is played on nets/pitches | Facility type config (court/net); all four sports seeded (D-028) |
| Q10 | Does Friday social play apply to every sport or only some? | TBD with the user (affects seed and the social-session model) |
| Q11 | Delivery fee, minimum order, serviceable area — not specified | Configurable settings; values TBD (D-030) |

---

## 4. Decision register

Statuses: CONFIRMED (user said so) / PROPOSED (AI suggested, awaiting approval). Any change must be logged here and in `04_HISTORY_LOG.md`.

| ID | Decision | Status | Why / notes |
|---|---|---|---|
| D-001 | Website first; installable PWA as fallback; native/desktop app only if essential | CONFIRMED (user's stated aim) | |
| D-002 | Backend: Supabase (Postgres, Auth, Realtime, Storage, RLS, scheduled jobs, edge functions). Frontend framework and visual design are DEFERRED by the user (D-032); Next.js + Tailwind + shadcn/ui was an initial suggestion only and is NOT decided | Backend PROPOSED; frontend DEFERRED | Less hand-written backend; rules live in DB. Hosting target decided in P1 after re-verifying terms. Public pages need SEO, which will influence the framework choice |
| D-003 | No-overlap booking guarantee via a Postgres exclusion constraint on (court, time range) for active bookings | PROPOSED | Race-condition-proof; explainable in interview |
| D-004 | Sports/facilities are configurable table data | PROPOSED | Resolves Q1/Q9 |
| D-005 | Slot starts at :00 and :30; session = 60 minutes; ranges are half-open `[start, end)` so back-to-back sessions do not conflict | PROPOSED | |
| D-006 | Daily cap = max 2 non-cancelled bookings per member per IST calendar day; a social-session join counts as one; walk-ins (no member ID) are uncapped | PROPOSED | Enforced in a DB function inside the booking transaction |
| D-007 | Social play = a court-level exclusive reservation row + participant rows with a capacity cap checked under lock; normal bookings cannot overlap it | PROPOSED | Capacity value TBD |
| D-008 | Price is computed by a pricing function from rules (base × peak/off-peak × plan multiplier, optional free hours); the price is **snapshotted** on the booking at booking time | PROPOSED | Past bookings never change retroactively; seed values TBD |
| D-009 | Slot holds of about 5 minutes, released by a scheduled job or cleaned lazily before insert | PROPOSED | The exclusion constraint cannot use `now()`, so expired holds must be set to a non-active status by job/cleanup |
| D-010 | Payments through an adapter interface: Cash, Mock gateway, and a gateway test mode (e.g. Razorpay/Cashfree test mode — UNVERIFIED availability); UPI QR via `upi://pay` intent with manual confirm; idempotency keys on payment creation | PROPOSED | No real money without KYC |
| D-011 | AI calls only from the server; fallback chain Groq → Gemini → OpenRouter with caching and throttling; core flows never depend on AI; LLM may only call whitelisted functions/views | PROPOSED | |
| D-012 | Data is synthetic: Faker `en_IN` + a booking-history simulator | PROPOSED | |
| D-013 | GST: rates and HSN/SAC codes are configurable data; verify current slabs on the official GST portal before seeding | PROPOSED | UNVERIFIED rates; do not hard-code |
| D-014 | Junior members: store DOB and guardian; record parental consent (DPDP Act 2023) | PROPOSED | Re-verify legal detail |
| D-015 | Store timestamps as `timestamptz` (UTC), display in Asia/Kolkata | PROPOSED | |
| D-016 | Do not use Render's free tier for the database or any stateful need | PROPOSED | Official docs: free Postgres expires after 30 days; filesystem is ephemeral; services spin down |
| D-017 | UI languages: English first; Hindi optional later; any other language TBD with the user | PROPOSED | Earlier mention of Punjabi was an unfounded assumption and is retracted |
| D-018 | ML only if it adds honest value; otherwise rely on LLM function-calling and rule-based scoring; any model trained on synthetic data must be disclosed as such | PROPOSED | |
| D-019 | Delivery = staff-managed local delivery with status tracking and handover OTP | PROPOSED; refined and confirmed in D-030 | |
| D-020 | Roles: Owner, Manager, Front Desk, Bar/Kitchen Staff, Member (plus anonymous public visitor) with RLS | PROPOSED | |
| D-021 | One responsive web app: public pages, member area and staff consoles in a single codebase/deploy, with role-based menus; staff screens must work on tablets/phones | CONFIRMED (user, Session 1) | |
| D-022 | Public pages (plans, prices, availability, catalogue) browseable without login; **login required** for trial booking and shop checkout | CONFIRMED (user, Session 1) | |
| D-023 | Members have full self-service online: book, cancel, order, pay; payment uses the D-010 adapters (mock / gateway test mode) | CONFIRMED (user, Session 1) | Demo must state payments are simulated |
| D-024 | Login method: email + password only (no phone OTP, no social login). Email verification and password-reset delivery limits on the free plan must be checked in P1 | CONFIRMED (method) | Supabase default email sender limits UNVERIFIED |
| D-025 | A public 'contact us' enquiry form without login stays, protected by rate limiting and bot protection (method TBD) | CONFIRMED (user, Session 1) | Keeps E6 satisfied |
| D-026 | Juniors (under 18) have their own login; guardian details and consent are recorded (timestamp + consent-text version) | CONFIRMED (user, Session 1) | |
| D-027 | A Junior account stays in state `pending_consent` (cannot book or pay) until the front desk or a guardian email link verifies consent | PROPOSED | Stronger than a tick-box; DPDP detail UNVERIFIED |
| D-028 | Seeded sports: tennis, padel, badminton and cricket nets; facilities carry a sport and a type (court/net) | CONFIRMED (user, Session 1) | |
| D-029 | Bar/cafeteria accepts counter orders and table orders: each order has a channel and an optional table; waiter tablet view; both channels feed one kitchen display | CONFIRMED (user, Session 1) | |
| D-030 | Gear delivery: member saves addresses; staff-managed status flow; handover OTP; no maps/routing; delivery fee and minimum order are configurable (values TBD) | CONFIRMED (approach) | |
| D-031 | Sign-up creates a `prospect` account that can book only trial sessions and create leads; it becomes a member when staff assign a plan | PROPOSED | Mechanics of D-022 |
| D-032 | Frontend framework and visual design deferred; build backend-first with plain functional screens; the user will describe how each section looks later; gate G1 (frontend direction) must be passed before P1.5 and again before the P8 styling pass | CONFIRMED (user, Session 1) | Superseded for Landing & Registration by D-033/D-034 |
| D-033 | Frontend framework selected: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, and Lucide React icons | CONFIRMED (user, Session 2) | Delivers SSR/SEO for public club pages, smooth award-level interactive animations, and responsive performance |
| D-034 | Visual design language: "High-Energy Athletic" aesthetic with obsidian dark surfaces (`#050505`, `#0A0A0A`, `#141414`), electric lime accents (`#CCFF00`), radial sport glows, bold Space Grotesk typography, and fluid micro-interactions | CONFIRMED (user, Session 2) | Custom-tailored for high-end modern sports clubs |
| D-035 | Multi-step registration wizard structure with dynamic minor/Junior detection (<18 years DOB) that dynamically injects Step 4 (Guardian Consent per India DPDP Act 2023) | CONFIRMED (user, Session 2) | Enforces compliance without friction for adult athletes |
| D-036 | Financial currency representation: exact fixed-point `numeric(12, 2)` across all financial tables, avoiding floating-point inaccuracies while maintaining clean compatibility with standard Indian accounting, GST invoices, and payment gateways | CONFIRMED (Session 2) | Eliminates rounding errors, fully supported by PostgreSQL |
| D-037 | Unified Dashboard Architecture: Consolidate all authenticated post-login workflows under `/dashboard/*` with persistent role-gated navigation for both "The Club" (Overview, Courts, Social, Shop, Bar, Pass) and "Operations" (Owner, Desk, POS, Kitchen) | CONFIRMED (Session 5) | Prevents routing fragmentation, maintains active tab state across services |
| D-038 | Visual Design System Pivot ("Clubhouse Ledger"): Retire the obsidian dark & neon lime aesthetic (`#CCFF00`) in favour of an editorial, warm sports club identity (`docs/06_DESIGN_SYSTEM.md`) using paper (`#f2ecdf`), ink (`#17150f`), clay (`#c4502b`), court green (`#1e4433`), and tabular scoreboard typography | CONFIRMED (Session 6) | High-trust, editorial, printed-matter sports club aesthetic with strict UI kit tokens (`@/components/ui/kit`) |
| D-039 | Local-First Invariant-Enforcing Runtime: Build reactive TypeScript engines (`store.ts`, `bookings.ts`, `orders.ts`, `finance.ts`, `leads.ts`) backed by `localStorage` that strictly mirror PostgreSQL schema invariants (18 facilities, exclusion logic, 2/day daily cap, plan discounts, inventory decrements, and GST ledger reconciliation) | CONFIRMED (Session 6) | Enables full end-to-end simulation, rapid manual testing, and reliable offline operation without cloud dependency during development |

## 5. Acceptance criteria for "Part 1 complete"

1. Every ID in section 2 is implemented and demonstrable in the deployed app.
2. Automated tests pass for: no overlapping bookings under concurrency (e.g. 50 simultaneous attempts → exactly 1 succeeds); daily cap; stock never negative under concurrent purchases; bar tab total = sum of lines after discounts; ledger totals reconcile with source tables.
3. App deployed on free hosting, reachable by URL, seeded with synthetic data.
4. Docs updated; history log has an entry per session with proofs.
5. Every page in section 6 exists and works for its role (visual polish is separate, P8); every flow in section 7 can be demonstrated end to end.

---

## 6. Page inventory (sections only — visual design to be supplied by the user later, D-032)

One responsive web app (D-021). Page IDs are for reference in tasks and tests. "Req" lists the requirement IDs the page serves.

### 6.1 Public (no login)

| ID | Page | Sections | Req |
|---|---|---|---|
| PUB-1 | Home (Implemented) | 1. Sticky Navbar (blur backdrop, links, Join CTA, responsive drawer)<br>2. Hero (animated typography "PLAY. COMPETE. DOMINATE.", dual CTAs, glowing radial orbs, value badges, scroll bounce)<br>3. Sports Showcase (Tennis, Padel, Badminton, Cricket Nets cards with specs & court features)<br>4. Live Stats (18 arenas, 100% conflict-free guarantee, 2x cap, 6AM-11PM)<br>5. Membership Teaser (Silver, Gold featured, Junior, monthly/annual toggle with -20% badge)<br>6. Availability Strip (interactive 30-min slot engine with live status)<br>7. Pro Shop Teaser (unified inventory cards, INR prices, stock alerts)<br>8. Bar & Lounge + Friday Social Night spotlight (kitchen display, open tabs, social sessions)<br>9. Testimonials (member quotes, ratings, sports tags)<br>10. Clubhouse Location & Trial Session Request form (address, hotline, enquiry capture)<br>11. Footer (sports, plans, portal links, legal, DPDP) | E1, E2, E3, E4, E6 |
| PUB-2 | Plans & Pricing | Tier cards (Gold/Silver/Junior); entitlement table; member vs walk-in rates per sport; Join / Book-trial buttons (login prompt) | E2 |
| PUB-3 | Facilities & Availability | Sport tabs; week free/busy grid per facility (no personal data); Book prompt (login) | E3 |
| PUB-4 | Shop Catalogue | Category filters; product cards; stock status | E4 |
| PUB-5 | Product Detail | Images, variants, price, stock, Add-to-cart (login prompt) | E4 |
| PUB-6 | Contact / Enquiry (Implemented) | Enquiry form (rate-limited); location & timings; developer credits (Priyanshu Kamal, Aditya Kumar, Somya Vishnoi) with GitHub and LinkedIn connection links; contact links | E6, E7 |
| PUB-7 | About (Implemented) | Club story, 18 arenas, rules of play, Clubhouse Ledger ethos | E1 |

### 6.2 Auth

| ID | Page | Sections | Req |
|---|---|---|---|
| AUTH-1 | Sign-up (Implemented) | Multi-step Wizard with dynamic minor detection:<br>• Step 1: Personal Info (Full Name, Email, Phone +91, DOB with under-18 alert)<br>• Step 2: Account Security (Password with 4-level strength meter, confirm password match check, toggle visibility)<br>• Step 3: Choose Plan (Interactive Gold, Silver, Junior selection cards)<br>• Step 4 (Conditional if <18): Guardian Consent (Guardian name, email, phone, DPDP Act 2023 legal consent checkbox)<br>• Step 5: Review Application (Summary review with Edit jumps, Terms agreement, and submission) | X5, X6 |
| AUTH-2 | Login (Implemented) | Obsidian athletic card, email + password, visibility toggle, 6-role one-click quick demo switcher (Owner, Manager, Front Desk, Bar Staff, Gold Member, Junior Minor), forgot password link, registration link | X5 |
| AUTH-3 | Reset Password (Implemented) | Email password reset request form, recovery instructions status screen, back to login navigation | X5 |
| AUTH-4 | Pending Consent (Implemented) | DPDP Act 2023 minor waiting screen, guardian details and consent text version record, permission restrictions explanation, resend guardian email button, front desk verification notice | X6 |
| AUTH-5 | Account Claim (Implemented) | Invite link landing for desk-registered members; set password; claim access via `/share/[token]` or desk flow | X7 |

### 6.3 Member

| ID | Page | Sections | Req |
|---|---|---|---|
| MEM-1 | Dashboard (Implemented) | Digital membership card with cryptographic QR pass; validity banner & countdown; tier entitlements radar (court rates, shop discount, bar discount, Friday social privilege); active cafeteria tab dues alert; lifetime bookings/orders history record; prominent "Book a Court" hero CTA button | A3–A6 |
| MEM-2 | Book a Court (Implemented) | Redesigned 2-step booking flow: Step 1 interactive date card picker (7 days) + sport selector (Tennis, Padel, Badminton, Cricket, All) with court counts -> Step 2 18-arena availability grid with vibrant status badges (green=free, clay=booked, gold=social), prominent hour headers, price preview, daily-cap enforcement; accessible from Overview hero CTA (uncluttered from sidebar) | B1–B4, B8 |
| MEM-3 | My Bookings (Implemented) | Upcoming/past list; cancellation with 12-hour refund policy calculation; check-in status; Neon DB live sync | B6 |
| MEM-4 | Social Play (Implemented) | Friday sessions; live capacity meter (20 max); deterministic rotating doubles pairings; join/leave draw | B7 |
| MEM-5 | Shop (Implemented) | Catalogue; category filter; cart drawer; checkout (pickup or delivery; saved address; OTP handover; pay) | C1, C5, C6 |
| MEM-6 | My Orders (Implemented) | Live order timeline; kitchen/shop status tracking; delivery OTP and pickup code badges | C5 |
| MEM-7 | Bar (Implemented) | Menu with calorie/dietary tags; pre-order; open tab tracking; floor seating status; settle modal | D1, D3, D4 |
| MEM-8 | Billing (Implemented) | Invoices; payment receipts; transaction history; membership renewal | F4 |
| MEM-9 | Profile & Settings (Implemented) | Account details; emergency contacts; DPDP Act consent status; role switcher | A1, X6 |

### 6.4 Front desk

| ID | Page | Sections | Req |
|---|---|---|---|
| DSK-1 | Today Board (Implemented) | Courts × time grid for all 18 facilities; live occupancy; check-in actions; date filters | B9 |
| DSK-2 | Quick Booking (Implemented) | Member search or walk-in/phone booking; slot selection; price quote; immediate payment or plan allocation | B2–B4, B9 |
| DSK-3 | Member Lookup / Scan (Implemented) | Search + QR scan; profile card; plan + validity countdown; dues pending badge; staff internal notes; past visit history | A5, A6 |
| DSK-4 | Register Member (Implemented) | Walk-in registration; plan assignment; dynamic minor check with guardian verification; account claim invite link generation | A1, A2, X6, X7 |
| DSK-5 | Pending-Consent Queue (Implemented) | Real-time queue of junior athlete sign-ups awaiting DPDP Act 2023 parental consent; in-person verification button | X6 |
| DSK-6 | Social Session Manager (Implemented) | Friday Night Social roster overview; guest pass payments; capacity management; rotating doubles draw | B7 |
| DSK-7 | Counter POS (shop) (Implemented) | Dedicated POS console at `/dashboard/pos`; barcode/SKU quick lookup; cart with member discounts; cash/card/UPI tender | C4 |
| DSK-8 | Order Queue (Implemented) | Order fulfillment queues for shop & cafeteria; mark ready; verify OTP for delivery; pickup completion | C5 |

### 6.5 Bar & kitchen

| ID | Page | Sections | Req |
|---|---|---|---|
| BAR-1 | Table Map (Implemented) | 12-table interactive floor plan; live table states (free, occupied, reserved); table-assigned tabs | D7 |
| BAR-2 | Order Entry (Implemented) | Counter or table channel; menu categories; modifiers; send to kitchen ticket pass | D1 |
| BAR-3 | Tabs (Implemented) | Active member tabs with automatic tier discount; add items; itemized ledger breakdown; dues warnings | D3, D4 |
| BAR-4 | Payment & Split (Implemented) | Settle tab modal; Cash/Card/UPI QR split tender; instant transaction ledger logging | D5 |
| BAR-5 | Kitchen Display (Implemented) | Realtime KDS at `/dashboard/kitchen`; active ticket pass sorted by station; cooking/ready state toggles | D2 |
| BAR-6 | Shift & Closing (Implemented) | Cash drawer reconciliation; Z-report snapshot with expected vs actual count; daily financial close | D6, D8 |

### 6.6 Manager / Owner

| ID | Page | Sections | Req |
|---|---|---|---|
| MGR-1 | Dashboard (Implemented) | Executive overview at `/dashboard/owner`; today/week/month revenue by source and mode; Z-report snapshot; active department consoles | F1, F2, F8 |
| MGR-2 | Revenue & Ledger (Implemented) | Comprehensive 156+ transaction ledger filterable by date, department (courts, shop, bar, social), and payment mode | F1, F2 |
| MGR-3 | Payables (Implemented) | Vendor invoices; coach fees; utility bills; salary payables with due date flags | F3 |
| MGR-4 | Invoices (Implemented) | B2B corporate and membership tax invoices; SAC/HSN codes; GST calculation; printable PDF views | F4 |
| MGR-5 | Inventory & Reorders (Implemented) | Unified gear stock ledger; low-stock reorder thresholds; multi-channel inventory protection | C2, C3 |
| MGR-6 | Configuration (Implemented) | Membership plans; court pricing multipliers; facility lighting and surfaces; operating hours | A3, B4, F7 |
| MGR-7 | Members Admin (Implemented) | Member directory; plan status; DPDP consent status; dues and activity histories | A1–A6 |
| MGR-8 | Leads Pipeline & Quotes (Implemented) | CRM enquiries pipeline; follow-up status tracking; trial conversion to full membership | E6–E10 |
| MGR-9 | HR & Payroll (Implemented) | Staff roster; shift assignments; leave approval log; monthly payroll calculation | F5, F6, D6 |
| MGR-10 | Reports & Tax Export (Implemented) | GST GSTR-1 summary export; Z-report daily close; expiring cryptographic share links at `/share/[token]` | F7, F9 |
| MGR-11 | Audit Log & Settings (Implemented) | Immutable audit log capturing security, auth, and ledger modifications with actor/role metadata | X1, X2 |
| MGR-12 | Purchase Orders (Part 2) | Auto-drafted from low stock | Part 2 |

Cross-cutting UI: notification bell, role-based navigation, responsive layout, empty/loading/error states.

---

## 7. Core flows

- **FL-1 Visitor → member:** browse public pages → sign up (prospect account; Junior branch if under 18) → book trial (lead created, staff alerted) → staff follow-up → quote → staff assign plan → member; QR pass available.
- **FL-2 Junior sign-up:** DOB under 18 → guardian details + consent → state `pending_consent` → front desk or guardian email link verifies → state active (D-027).
- **FL-3 Member booking:** choose sport/date → slot grid → price preview → hold (~5 min) → pay (mock/test) → confirmed → ledger row. Cancel → slot freed → waitlist notified.
- **FL-4 Walk-in / phone booking:** desk picks a slot → full price → pay → booked.
- **FL-5 Friday social play:** manager creates a session with capacity → members join until full → no normal bookings overlap it.
- **FL-6 Shop order:** browse → cart → stock reserved → pay → pickup: packed → ready → collected; delivery: packed → out for delivery → OTP handover → delivered.
- **FL-7 Bar:** counter or table order → kitchen display → tab (member discount) or immediate payment → shift close → Z-report.
- **FL-8 Desk-registered member:** desk registers → invite link → account claim → online access.
- **FL-9 Enquiry:** public form → lead → staff alert → follow-up → quote → convert.
- **FL-10 Month-end:** dashboard → ledger → payables → payroll → GST export → share link.
- **FL-11 Membership expiry:** daily job flags expiring/expired → reminders → renew/upgrade.
