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
