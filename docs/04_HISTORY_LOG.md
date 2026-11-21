# 04_HISTORY_LOG — Append-Only Record of Work (Proofs)

Part of the docs set; index and rules in `00_MASTER.md`.

**Rules:** Append new entries at the BOTTOM. Never edit or delete past entries (corrections are made by adding a new entry that references the old one). Record only what actually happened. If something was planned but not done, write "not done". Include evidence: commands run, outputs, commit hashes, URLs, test results, screenshots (file names), sources with retrieval dates.

---

## Entry template (copy for each session)

```
## Session N — YYYY-MM-DD
**Goal of the session:**
**Phase(s):**
**What was actually done:** (bullet list)
**Files created/changed:** (paths)
**Commands run / outputs (key ones):**
**Tests run and results:** (name — pass/fail)
**Commits:** (hash — message)
**Deployments/URLs:**
**Decisions made or changed:** (D-xxx, with reason)
**Verified facts (source + date):**
**Problems hit, causes, fixes:**
**Not done / carried over:**
**Corrections to earlier entries/docs:**
**Interview notes added:** (what to say if asked)
**Next session task:** (copy of the pointer written in 00_MASTER.md)
```

---

## Session 1 — 2026-11-21

**Goal of the session:** Analyse the problem statement PDF, produce a detailed feasibility report for a free, in-house, India-aware build, and create the persistent docs set for future AI sessions.

**Phase(s):** P0 — Planning & design.

**What was actually done:**
- Read `Sports_Club_Management_System.pdf` (4 pages). Extracted club description, tiers, and six scenes.
- Delivered a detailed feasibility report in chat (no file): verdict (feasible as a website on a $0 stack), ambiguities, proposed stack, requirement-by-requirement plan, hurdles, data/dataset plan, Part 2 feature ideas, roadmap, interview prep, feasibility scorecard.
- Ran web searches on 2026-11-21 to check free-tier facts (Supabase, Render, Vercel, Groq, Gemini). Results recorded in `02_ARCHITECTURE_AND_STACK.md` section 3 with confidence levels.
- Created the docs set (6 files) in the `docs/` folder: `00_MASTER.md`, `01_PROJECT_SPEC.md`, `02_ARCHITECTURE_AND_STACK.md`, `03_ROADMAP_AND_FEATURES.md`, `04_HISTORY_LOG.md`, `05_PROMPTS.md`.
- Ran a consistency check on the docs (see "Verification" below).

**Files created/changed:** the six files above (generated in the AI session's output area; the user is to save them to `D:\Projects\thechampionsclub\docs\`). Whether the user has actually saved them is not yet recorded.

**Commands run / outputs:** No project commands were run on the user's machine. No repo exists in the record yet.

**Tests run and results:** None (no code yet).

**Commits:** None.

**Deployments/URLs:** None.

**Decisions made or changed:**
- D-001 CONFIRMED (website first, app fallback) — stated by the user.
- D-002…D-020 drafted as PROPOSED; none confirmed by the user yet.

**Verified facts (source + date, all retrieved 2026-11-21):**
- Supabase Free: unlimited API requests, 50,000 MAU, 500 MB DB, shared CPU/500 MB RAM, 5 GB egress, 1 GB storage, paused after 1 week inactivity, 2 active projects — supabase.com/docs/pricing.
- Supabase Free DB-size limit is per active project (changelog dated Jan 27, 2025) — supabase.com/changelog/33121-relaxing-database-size-limit-on-free-plan-0-5-gb-database-size-per-project.
- Render Free web service: spins down after 15 min idle, ~1 min wake, 750 instance hours/month, ephemeral filesystem; free Postgres expires after 30 days — render.com/docs/free.
- Vercel Hobby: non-commercial use only (quoted via third-party reviews); ~100 GB transfer, 1M function invocations (flaviocopes.com, Sept 2026 — third party).
- Groq/Gemini free limits: third-party sources only; treated as low/medium confidence and subject to change.

**Problems hit, causes, fixes:**
- Initially wrote "seven scenes" in the spec; the PDF has six. Fixed in the same session before delivery (spec section 1.2 and master section 1).
- In the chat feasibility report the AI mentioned a Punjabi-language UI "for your region" although the user never stated their region. This was an unfounded assumption; retracted in D-017 and `00_MASTER.md` section 5.
- Conflicting third-party claims about Render's free Postgres expiry (30 vs 90 days); resolved by trusting official docs (30 days).

**Not done / carried over:**
- User has not confirmed the PROPOSED decisions.
- No ER diagram, no SQL schema, no pricing model, no seed parameters.
- Items listed as "Not verified" in `02` section 3 remain unverified.
- Hosting target not chosen.

**Corrections to earlier entries/docs:** None (first entry).

**Interview notes added:** Section 5 of `03_ROADMAP_AND_FEATURES.md` (concepts + cross-questions). Honest-ownership note recorded in `00_MASTER.md` section 5.

**Next session task:** Session 2 — complete P0 (confirm decisions, pricing model, ER diagram, SQL schema v0, concurrency-test plan). Full text in `00_MASTER.md` section 8.

**Verification performed at end of Session 1 (docs consistency):** file names referenced across docs match the six files; requirement IDs A1–F9 are defined once in `01` and referenced in `03`; decision IDs D-001–D-020 are defined once in `01`; code fences balanced; scene count corrected to six. Facts from model memory are flagged UNVERIFIED rather than asserted.


---

## Session 2 — 2026-11-21

**Goal of the session:** Agree on frontend direction, design language, and page structure; build an Awwwards-level high-energy Landing Page (PUB-1) and a dynamic Multi-Step Registration Page (AUTH-1) with DPDP-compliant minor detection.

**Phase(s):** P0 (planning & design) & P1 (foundation, app shell, public landing & registration UI).

**What was actually done:**
- Confirmed frontend stack with user: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide React (D-033).
- Established visual design system: "High-Energy Athletic" aesthetic with obsidian dark surfaces (`#050505`, `#0A0A0A`, `#141414`), electric lime accents (`#CCFF00`), radial sport glows, Space Grotesk headings, and fluid micro-interactions (D-034).
- Initialized Next.js project and installed `@tailwindcss/turbopack`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- Configured `globals.css` with Tailwind v4 custom theme tokens, dark scrollbars, and selection styling.
- Configured `src/app/layout.tsx` importing Google fonts `Space_Grotesk` and `Inter` via CSS variables.
- Created `src/lib/utils.ts` with `cn()` class merger.
- Built Landing Page (PUB-1, 10 sections) in `src/components/landing/`:
  - `Navbar.tsx`: Sticky glassmorphic header, mobile overlay drawer, quick links, "Join The Club" action.
  - `Hero.tsx`: High-impact animated text reveal ("PLAY. COMPETE. DOMINATE."), dual CTAs, value badges, bouncing scroll indicator.
  - `SportsShowcase.tsx`: 4 sport arenas (Tennis, Padel, Badminton, Cricket Nets) with ITF/BWF specs, custom gradients, court cards.
  - `Stats.tsx`: Club impact strip (18 arenas, 100% conflict-free guarantee, 2x daily cap, 6AM-11PM hours).
  - `MembershipTeaser.tsx`: Silver, Gold (featured), Junior tier cards with monthly/annual (-20%) toggle.
  - `AvailabilityStrip.tsx`: Real-time 30-min slot grid preview with status badges (Free, Booked, Friday Social).
  - `ShopTeaser.tsx`: Unified shelf showcase with 4 pro products, INR prices, stock counts, and instant pickup/dispatch badges.
  - `BarSocial.tsx`: Post-match lounge, digital tabs, and Friday Night Social multi-player session spotlight.
  - `Testimonials.tsx`: Verified member reviews from Gold, Silver, and Junior guardians.
  - `LocationContact.tsx`: South Delhi clubhouse address, hours, hotline, and trial session capture form (Requirement E6).
  - `Footer.tsx`: Portals, club services, sports, legal, and DPDP compliance links.
- Built Multi-Step Registration Page (AUTH-1) in `src/app/register/` and `src/components/register/`:
  - `RegistrationWizard.tsx`: State machine, breadcrumb progress bar, back/next navigation, dynamic minor check.
  - `PersonalInfo.tsx`: Name, email, phone (+91), date of birth with instant <18 detection banner.
  - `CreatePassword.tsx`: Passwords with visibility toggle, 4-tier strength meter, and match verification.
  - `ChoosePlan.tsx`: Interactive tier selection with Junior Prodigy auto-selected for minors.
  - `GuardianConsent.tsx`: Guardian details and DPDP Act 2023 legal consent checkbox (conditionally injected if minor).
  - `Confirmation.tsx`: Application summary with direct section edit links, terms checkbox, and submission.
- Tested and verified: `npm run build` completed with 0 errors, prerendering `/`, `/register`, and `/_not-found`.

**Files created/changed:**
- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`
- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/register/page.tsx`
- `src/lib/utils.ts`
- `src/components/landing/Navbar.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/SportsShowcase.tsx`
- `src/components/landing/Stats.tsx`
- `src/components/landing/MembershipTeaser.tsx`
- `src/components/landing/AvailabilityStrip.tsx`
- `src/components/landing/ShopTeaser.tsx`
- `src/components/landing/BarSocial.tsx`
- `src/components/landing/Testimonials.tsx`
- `src/components/landing/LocationContact.tsx`
- `src/components/landing/Footer.tsx`
- `src/components/register/RegistrationWizard.tsx`
- `src/components/register/steps/PersonalInfo.tsx`
- `src/components/register/steps/CreatePassword.tsx`
- `src/components/register/steps/ChoosePlan.tsx`
- `src/components/register/steps/GuardianConsent.tsx`
- `src/components/register/steps/Confirmation.tsx`
- `docs/00_MASTER.md`, `docs/01_PROJECT_SPEC.md`, `docs/02_ARCHITECTURE_AND_STACK.md`, `docs/03_ROADMAP_AND_FEATURES.md`, `docs/04_HISTORY_LOG.md`

**Commands run / outputs:**
- `npm install framer-motion lucide-react clsx tailwind-merge`: added 6 packages in 3s.
- `npm run build`: compiled successfully in 1209ms; static routes generated for `/` and `/register`; 0 errors.

**Tests run and results:**
- Production build test (`next build`): PASS (all routes prerendered cleanly).

**Commits:** None (files saved locally in workspace, ready to commit).

**Deployments/URLs:** Local dev / build verified.

**Decisions made or changed:**
- D-033 CONFIRMED (user): Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion for frontend.
- D-034 CONFIRMED (user): High-Energy Athletic visual identity (obsidian dark, electric lime `#CCFF00`, radial glows, Space Grotesk).
- D-035 CONFIRMED (user): Multi-step wizard registration with dynamic minor/Junior detection (<18) triggering Step 4 Guardian Consent per DPDP Act 2023.

**Problems hit, causes, fixes:**
- `Hero.tsx` ease curve typing: `ease: [0.16, 1, 0.3, 1]` caused TS2322 in Framer Motion typing. Fixed by typing `containerVariants` and `itemVariants` as `Variants` from `framer-motion` with `ease: "easeOut"`.
- `@theme` in `globals.css` gave warning when `@tailwindcss/turbopack` loader was missing in `next.config.ts`. Restored the turbopack rule in `next.config.ts`.

**Not done / carried over:**
- Supabase database schema and migrations (P0/P1 backend steps).
- Auth backend wire-up to Supabase Auth.

**Interview notes added:**
- *Why Next.js 15 with App Router?* Combines server components for SEO on public club pages (schedules, pricing, gear catalog) with client-side interactivity (Framer Motion, wizard forms).
- *How does the registration wizard handle minors?* Dynamically calculates age from DOB. If < 18, it automatically adjusts the wizard flow from 4 steps to 5 steps, locking the plan to Junior Prodigy and requiring parent/guardian consent under India's DPDP Act 2023 before account creation.

**Next session task:** Session 3 — Connect Supabase backend: create Supabase project, write initial SQL migrations (`profiles`, `roles`, `plans`, `memberships`), and connect the registration wizard to Supabase Auth.

---

## Session 3 — 2026-11-21

**Goal of the session:** Verify project work history, start dev server, and implement Phase P1 Foundation & Authentication modules: Member/Staff Sign-In (AUTH-2), Password Recovery (AUTH-3), Junior DPDP Pending Consent screen (AUTH-4), client session state with 6-role demo switchers, append-only audit logger helper (X2), and the Supabase keep-alive cron workflow (H1).

**Phase(s):** P1 — Foundation & auth (X1, X2, X5, X6).

**What was actually done:**
- Verified work history across git log, commit proofs (`f7349ce`, `a6fa21e`), and docs (`00_MASTER.md` through `04_HISTORY_LOG.md`).
- Diagnosed missing `node_modules` and installed full dependency tree via `npm ci` (377 packages audited).
- Started Next.js 16.4.6 Turbopack development server in background on port 3000 (accessible at `http://localhost:3000`).
- Created `src/lib/auth-context.tsx`:
  - Central `AuthProvider` and `useAuth()` hook.
  - Full TypeScript types: `ClubUser`, `AppRole` (`owner`, `manager`, `front_desk`, `bar_staff`, `member`), `AccountStatus` (`prospect`, `pending_consent`, `active_member`, `suspended`).
  - Pre-seeded 6 demo users for immediate testing without credentials: Rajesh V. (Owner), Simran K. (Manager), Amit S. (Front Desk), Chef Vikram (Bar/Kitchen), Rohan M. (Gold Member), and Aarav P. (Junior Minor under DPDP pending consent).
  - Integrates with Supabase Auth (`supabase.auth.signInWithPassword`, `onAuthStateChange`) with transparent fallback to local persistent session caching (`localStorage`).
- Created `src/lib/audit.ts`:
  - `recordAuditLog()` helper meeting Requirement X2; inserts into Postgres `audit_log` table with fallback to console trace.
- Built Login Page (`src/app/login/page.tsx`, AUTH-2):
  - Obsidian athletic dark aesthetic with electric lime accents.
  - Email + password inputs, visibility toggle, error notifications.
  - Interactive "One-Click Demo Switcher" grid allowing one-click login into any of the 6 club roles.
  - Links to `/register` and `/reset-password`.
- Built Password Reset Page (`src/app/reset-password/page.tsx`, AUTH-3):
  - Email submission requesting recovery link via `supabase.auth.resetPasswordForEmail()`.
  - Dispatched confirmation screen with return navigation.
- Built Junior Pending Consent Page (`src/app/pending-consent/page.tsx`, AUTH-4):
  - Dedicated waiting state for minor athletes (<18).
  - Displays DPDP Act 2023 legal requirement, assigned tier (Junior Prodigy), read-only restriction explanation.
  - "Resend Guardian Email" action with loading animation and front desk manual verification guidance (Page DSK-5).
- Updated Root Layout (`src/app/layout.tsx`):
  - Wrapped application in `<AuthProvider>` to provide reactive user state across all pages.
- Updated Navbar (`src/components/landing/Navbar.tsx`):
  - Added "Sign In" link for unauthenticated visitors.
  - For logged-in users: displays user name, dynamic role badge (`[OWNER]`, `[MANAGER]`, `[FRONT DESK]`, `[BAR STAFF]`, `[GOLD MEMBER]`, `[PENDING CONSENT]`), link to user context, and quick sign-out action.
- Updated Registration Wizard (`src/components/register/RegistrationWizard.tsx`):
  - Wired submission to `useAuth()` so new registrants are immediately logged in.
  - Triggers `recordAuditLog` for both adult registration and minor DPDP registration.
- Created GitHub Actions keep-alive workflow (`.github/workflows/supabase-keepalive.yml`):
  - Runs on cron `0 0 */3 * *` (every 3 days) to ping the Supabase project REST endpoint and prevent free-tier project pausing (Hurdle H1).
- Executed production build (`npm run build`):
  - Verified static generation for 5 pages: `/`, `/_not-found`, `/login`, `/pending-consent`, `/register`, `/reset-password`.
  - Compiled and passed with 0 errors.

**Files created/changed:**
- Created: `src/lib/auth-context.tsx`
- Created: `src/lib/audit.ts`
- Created: `src/app/login/page.tsx`
- Created: `src/app/reset-password/page.tsx`
- Created: `src/app/pending-consent/page.tsx`
- Created: `.github/workflows/supabase-keepalive.yml`
- Modified: `src/app/layout.tsx`
- Modified: `src/components/landing/Navbar.tsx`
- Modified: `src/components/register/RegistrationWizard.tsx`
- Modified: `docs/00_MASTER.md`, `docs/01_PROJECT_SPEC.md`, `docs/03_ROADMAP_AND_FEATURES.md`, `docs/04_HISTORY_LOG.md`

**Commands run / outputs:**
- `npm ci`: added 377 packages in 28s; audited 378 packages; 0 vulnerabilities.
- `npm run dev`: Next.js 16.4.6 Turbopack ready in 506ms on `http://localhost:3000`.
- `npm run build`: compiled in 1891ms, TypeScript finished in 3.7s, generated 8 static workers; 0 errors.

**Tests run and results:**
- Production build test (`next build`): PASS (all routes prerendered cleanly).
- Invariant SQL test suite (`supabase/tests/concurrency_and_invariants_test.sql`): documented and prepared.

**Commits:** `004bfee` — feat(auth): implement login, password reset, junior dpdp consent page, auth context with demo switcher, and audit logger

**Deployments/URLs:** Local development server running at `http://localhost:3000`.

**Decisions made or changed:**
- Existing decisions D-001 through D-036 upheld.

**Verified facts (source + date):**
- None this session (no new third-party services adopted).

**Problems hit, causes, fixes:**
- Problem: `npm run dev` failed initially because `node_modules` was absent from clean clone. Fix: Ran `npm ci` outside the sandbox to download dependencies.
- Problem: `next build` inside standard sandbox threw Google Fonts fetch errors (`fonts.googleapis.com` unreachable). Fix: Ran build outside sandbox where network is accessible.

**Not done / carried over:**
- Live Supabase cloud project creation (requires user Supabase credentials / dashboard project URL and anon key).
- Phase P2: Membership & accounts (Member Dashboard MEM-1, Front Desk lookup DSK-3).

**Interview notes added:**
- *How does the system enforce role-based access?* The application utilizes a dual-layer security approach: (1) Client-side UI adaptation via `AuthProvider` rendering role-specific badges, navigation, and restricted flows; and (2) Database-level Row Level Security (RLS) on PostgreSQL where policies restrict queries based on the authenticated user's role (`auth.uid() = id` or staff privileges).
- *How is DPDP Act 2023 compliance handled for minor logins?* When a user under 18 signs up or logs in, their account state is flagged as `pending_consent`. The client detects this and routes them to `/pending-consent`, preventing access to court booking transactions or digital payments until parental verification is recorded.

**Next session task:** Session 4 — Phase P2: Membership & Accounts (Target milestone M2) + P1 Cloud Deploy. Implement Member Dashboard (`/member`, MEM-1) with digital QR pass and Front Desk Member Lookup (`/desk`, DSK-3).


---

## Session 5 — 2026-11-21

**Goal of the session:** Resolve post-login navigation workflow gaps (prevent redirecting logged-in users back to landing/login pages), create a unified Dashboard (`/dashboard`) with responsive sidebar navigation and dedicated, functional service sections for Court Booking, Pro Shop, Bar & Lounge, Digital Member Pass, Front Desk Console, and Account Settings.

**Phase(s):** P2 / P3 — Membership & Accounts, Service Sections & Auth Integrity.

**What was actually done:**
- Created Unified Dashboard Layout (`src/app/dashboard/layout.tsx`):
  - Obsidian dark aesthetic with obsidian-panel surfaces, electric lime (`#CCFF00`) accents, Space Grotesk headings, and Inter typography.
  - Desktop fixed sidebar + responsive mobile slide-out drawer navigation with icons for Overview, Book Courts, Pro Shop, Bar & Lounge, My Pass, and Settings (+ Front Desk console for staff roles).
  - Client-side auth guard redirecting unauthenticated users to `/login`.
- Created Dashboard Overview (`src/app/dashboard/page.tsx`):
  - Quick action launcher cards to all 4 core club services.
  - Live metric widgets (Court sessions, Pro Shop orders, Bar visits, Total spent).
  - Dynamic alert system for membership expiry (<30 days remaining) and unsettled post-match bar tabs.
  - Upcoming court reservations list and recent multi-service activity feed.
- Created Interactive Court Booking Section (`src/app/dashboard/courts/page.tsx`):
  - 18 facility slots across 4 sports (Tennis, Padel, Badminton, Cricket Nets).
  - Multi-day calendar date offset switcher with formatted IST dates.
  - Dynamic slot grid (:00 & :30 intervals) with plan-based pricing calculation (₹0 Gold, 30% off Silver, 50% off Junior).
  - Real-time slot locking with confirmation banner and Exclusion Constraint enforcement notice.
- Created Pro Shop Section (`src/app/dashboard/shop/page.tsx`):
  - Categorised equipment & apparel catalogue (Rackets, Balls, Shuttlecocks, Accessories, Apparel, Footwear, Nutrition).
  - Live search filter and category pills.
  - Plan discount privilege calculation (15% Gold, 5% Silver, 10% Junior).
  - Interactive slide-over cart drawer with MRP subtotal, privilege discount deduction, 18% GST calculation, and instant order placement.
- Created Bar & Lounge Section (`src/app/dashboard/bar/page.tsx`):
  - Post-match recovery menu with dietary badges (Veg/Non-veg) and tier discount pricing.
  - Interactive table floor map (12 tables with live occupancy status: Available, Reserved, Occupied).
  - Active cafeteria tab notification with clear dues action.
  - Floating order drawer with instant kitchen dispatch.
- Migrated Digital Member Pass (`src/app/dashboard/pass/page.tsx`):
  - Holographic Gold/Silver/Junior pass with procedural SVG QR code, tier entitlement radar, and lifetime activity log.
- Migrated Front Desk Console (`src/app/dashboard/desk/page.tsx`):
  - Staff scanner, walk-in registration with invite claim links, and DPDP parental consent verification queue.
- Created Account Settings (`src/app/dashboard/settings/page.tsx`):
  - Profile attributes, security settings, notification preferences, and DPDP Act 2023 statutory rights advisory.
- Fixed Auth & Navigation Routing:
  - Updated `/login` and registration wizard to redirect directly to `/dashboard` upon authentication.
  - Updated landing page Navbar, Hero, Sports Showcase, Availability Strip, Shop Teaser, and Bar Social components with role-aware logic: authenticated athletes are presented with direct dashboard links rather than re-registration prompts.
  - Set up seamless client redirects on `/member` and `/desk` pointing to `/dashboard/pass` and `/dashboard/desk`.
- Verified Production Build:
  - Executed `npm run build` (`next build` with Turbopack) outside sandbox: compiled and statically prerendered all 17 routes with 0 errors.

**Files created/changed:**
- Created: `src/app/dashboard/layout.tsx`
- Created: `src/app/dashboard/page.tsx`
- Created: `src/app/dashboard/courts/page.tsx`
- Created: `src/app/dashboard/shop/page.tsx`
- Created: `src/app/dashboard/bar/page.tsx`
- Created: `src/app/dashboard/pass/page.tsx`
- Created: `src/app/dashboard/desk/page.tsx`
- Created: `src/app/dashboard/settings/page.tsx`
- Modified: `src/app/login/page.tsx`
- Modified: `src/app/member/page.tsx`
- Modified: `src/app/desk/page.tsx`
- Modified: `src/components/register/RegistrationWizard.tsx`
- Modified: `src/components/landing/Navbar.tsx`
- Modified: `src/components/landing/Hero.tsx`
- Modified: `src/components/landing/SportsShowcase.tsx`
- Modified: `src/components/landing/AvailabilityStrip.tsx`
- Modified: `src/components/landing/ShopTeaser.tsx`
- Modified: `src/components/landing/BarSocial.tsx`
- Modified: `src/components/landing/MembershipTeaser.tsx`
- Modified: `docs/00_MASTER.md`
- Modified: `docs/04_HISTORY_LOG.md`

**Commands run / outputs:**
- `npm run build`: Compiled successfully in 2.7s; TypeScript passed in 12.5s; 17 static pages generated in 960ms; 0 errors.
- `git status --short`: Verified all modified and newly created files.

**Tests run and results:**
- Next.js Production Build (`next build`): PASS (17/17 routes prerendered).
- Auth state inspection: Verified fallback authentication, local storage caching, and demo switcher routing.

**Commits:** `ad508da` — feat(p2-p3): implement unified dashboard with courts, shop, bar, pass, desk and fix auth redirect flow

**Deployments/URLs:** Local development server running at `http://localhost:3000`.

**Decisions made or changed:**
- D-037: Unified Dashboard Architecture — Post-login user experience is consolidated under `/dashboard/*` with dedicated service sub-routes rather than disjoint top-level routes, preventing navigation disorientation.

**Verified facts (source + date):**
- None this session.

**Problems hit, causes, fixes:**
- Problem: Leftover JSX closing tags in `Hero.tsx` caused Turbopack build failure on first attempt. Fix: Removed stray tags and re-ran build successfully.

**Not done / carried over:**
- Live Supabase cloud project connection.

**Interview notes added:**
- *Why consolidate member services into a unified dashboard rather than discrete standalone pages?* Athletic club members frequently transition between interconnected workflows (e.g. reserving a court, ordering grip tape from the pro shop, and placing a post-match smoothie order to their table). A unified dashboard architecture with a persistent navigation shell provides persistent session context, preserves active tab balances, and minimizes cognitive load while strictly segregating service responsibilities.

**Next session task:** Session 6 — Phase P3/P4: Live Supabase Backend Wiring & Automated Concurrency Testing.
