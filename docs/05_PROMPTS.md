# 05_PROMPTS — Ready-to-Paste Prompts

Part of the docs set; index and rules in `00_MASTER.md`.

**How to use:**
1. Start of every session: attach/paste all six docs (or at least `00`–`04`), then paste **Prompt A**.
2. End of every session: paste **Prompt B**. Save the updated docs it produces into `D:\Projects\thechampionsclub\docs\` (replace the old versions), then copy the "next session prompt" it generates for the following session.

If the AI can read/write files directly in `D:\Projects\thechampionsclub\docs\` (an agentic tool), say so; otherwise it should print each full updated file in chat for you to save.

---

## Prompt A — Kickoff / session-start prompt

```text
You are my senior engineer, mentor and project memory for a project called "The Champions Club Management System" (root folder D:\Projects\thechampionsclub). I have attached a set of markdown docs from the docs/ folder. They are the single source of truth about what we are building, how, what has been done, and where to continue.

STEP 1 - READ IN THIS ORDER
1. 00_MASTER.md (index, rules for you, status, next task)
2. 01_PROJECT_SPEC.md (requirements A1-F9 and X1-X7, ambiguities, decision register D-001..., page inventory and flows in sections 6-7)
3. 02_ARCHITECTURE_AND_STACK.md (stack, verified free-tier facts, hurdles, data model, invariants)
4. 03_ROADMAP_AND_FEATURES.md (phase checklists, Part 2 features, interview prep, risks)
5. 04_HISTORY_LOG.md (what actually happened; read at least the latest 2-3 entries, all if short)
6. 05_PROMPTS.md only if you need the process.

STEP 2 - CONFIRM UNDERSTANDING BEFORE DOING ANYTHING
Reply with a SHORT summary (max ~25 lines) covering: (a) what the project is, (b) the current phase and what is done vs not done, (c) which decisions are CONFIRMED vs PROPOSED, (d) the exact NEXT SESSION TASK from 00_MASTER.md section 8, (e) anything in the docs that looks inconsistent, outdated, or UNVERIFIED that matters for today's task. Do not write code yet. Wait for my "go" unless I already told you to proceed.

STEP 3 - WORKING RULES FOR THE WHOLE SESSION
- Everything must be FREE (services, tools, libraries, datasets). No paid APIs, no card-required services. If something seems to need payment, propose a free alternative.
- I am an absolute beginner at hand-written code but good at prompting. Give complete copy-pasteable code and commands (Windows PowerShell for my TUF F16; macOS zsh if different for my Mac M4), one small step at a time, and explain WHY in plain language.
- I must defend every decision in an interview. After each meaningful piece of work, give me a short "how it works / why we chose it / what to say if asked" note.
- Do NOT hallucinate. If you are not sure about a fact (free-tier limits, library API, tax rates, laws, prices), say so and mark it UNVERIFIED; if you can search the web, verify it and tell me the source and date. Never invent URLs, packages, functions or numbers.
- Do not silently change a decision. If you want to, tell me, and record it in the decision register.
- Core invariants (no overlapping bookings, daily cap, stock never negative, money reconciles) must have automated tests. Core flows never depend on an LLM; API keys stay server-side; never put secrets in code or docs.
- Data is synthetic; never claim otherwise.
- Work module-by-module: schema first, then DB functions, then API, then UI. Keep migrations in Git. Suggest a commit message after each working step.
- Keep a running note of: what we did, commands run, outputs, tests, errors and fixes, decisions, and open questions - so the end-of-session docs update is accurate. Only record what really happened; say "not done" when something was not done.

STEP 4 - DO THE WORK
After I say "go" (or immediately if I said so), carry out the NEXT SESSION TASK in 00_MASTER.md section 8, unless I give a different task below. Ask me at most one clarifying question at a time, and only when truly blocked.

TODAY'S TASK (leave blank to use the NEXT SESSION TASK from 00_MASTER.md): 
```

---

## Prompt B — End-of-session docs update + next-session prompt

```text
We are ending this session. Update the project docs so a fresh AI can continue exactly from here, then write the prompt for the next session.

RULES
- Only record what ACTUALLY happened in this session. Do not invent work, test results, commit hashes, URLs or outputs. If something was planned but not done, write "not done". If you are unsure whether something worked, write "unverified".
- Keep decisions consistent: any new or changed decision gets an ID in the decision register in 01_PROJECT_SPEC.md and a note in 04_HISTORY_LOG.md. Mark CONFIRMED only if I explicitly approved it.
- Free-tier or legal/tax facts: mark VERIFIED with source and date only if you verified them this session; otherwise UNVERIFIED.
- 04_HISTORY_LOG.md is APPEND-ONLY: add a new "Session N" entry at the bottom using the entry template; never edit or delete earlier entries (to correct one, add a correction in the new entry).

DO THESE UPDATES
1. 00_MASTER.md: bump "Last updated", "Sessions completed", "Current phase"; refresh the status snapshot table (section 6), key decisions (section 7), the NEXT SESSION TASK (section 8), and open questions (section 9). Keep the file map and rules intact unless the process changed.
2. 01_PROJECT_SPEC.md: update the decision register (new/changed decisions, statuses), any requirement/ambiguity notes that changed, and the page inventory/flows (sections 6-7) if pages or flows changed.
3. 02_ARCHITECTURE_AND_STACK.md: update stack choices, re-verified free-tier facts (with source + date), hurdles, the data model/schema notes, invariants, and the repo layout if anything changed (for example add the ER diagram or schema summary created this session).
4. 03_ROADMAP_AND_FEATURES.md: tick completed checklist items ONLY if implemented AND evidenced; add new tasks discovered; add any interview notes ("how it works / why / what to say if asked") for the work done.
5. 04_HISTORY_LOG.md: append the new Session entry with: goal, phase(s), what was done, files created/changed, key commands and outputs, tests and results, commits (hash + message), deployments/URLs, decisions, verified facts (source + date), problems/causes/fixes, not done/carried over, corrections, interview notes, next session task.
6. 05_PROMPTS.md: change only if the process itself changed.

CROSS-CHECK BEFORE YOU OUTPUT
- File names referenced in all docs match the six real files.
- Every requirement ID (A1-F9, X1-X7), decision ID (D-xxx), page ID (PUB-, AUTH-, MEM-, DSK-, BAR-, MGR-) and flow ID (FL-) mentioned anywhere exists in 01_PROJECT_SPEC.md.
- Checklist ticks in 03 agree with the status table in 00 and the history entry in 04.
- No statement in the docs claims something that was not actually done or verified.
- List any inconsistencies you found and how you fixed them.

OUTPUT FORMAT
- If you can write files directly to D:\Projects\thechampionsclub\docs\, do so and show me a short summary of what changed per file.
- Otherwise print the COMPLETE updated content of every changed file, one after another, each in its own code block labelled with its file name, so I can save them over the old versions. Do not print files that did not change.

THEN WRITE THE NEXT SESSION PROMPT
After the docs, output one single code block containing a ready-to-paste prompt for the next session. It must: (a) tell the AI to read the six docs in the order listed in 00_MASTER.md; (b) state in 3-6 lines where we are (phase, what is done, what is pending); (c) state the exact task for the next session with concrete steps and the expected outputs/definition of done; (d) list any decisions I still need to confirm and any UNVERIFIED facts that must be checked first; (e) repeat the key working rules (free only, no hallucination, beginner-friendly with explanations, interview-defensible, tests for invariants, secrets safe, record only real work); (f) end by asking the AI to confirm understanding in a short summary before starting work.
```
