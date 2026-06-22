# Milestone Suite — cost-attribution map (Phase 0 discovery)

*Source of truth for the Phase 2 static profiling analysis. Built from direct reads of
the skills/agents/docs across the four repos. Token figures are order-of-magnitude
estimates from prompt/doc byte counts — they get replaced by measured numbers once the
Phase 1 live harness runs.*

Status: **complete** (a few sizes are estimates, flagged below).

---

## 1. Per-plugin dispatch & context model

### bootstrapper — no agent fan-out
- Skills: `plan` 227 L, `apply` 253 L, `update` 306 L. **Zero subagent dispatches** — every
  write is done by deterministic `scripts/*.sh|.ps1` twins, "never by a dispatched agent"
  (`apply/SKILL.md:12`; `update/SKILL.md:306`). `plan` is an interactive interview + script
  detection.
- Output: the `.project/` standing docs — the **per-dispatch context tax for the whole
  downstream suite**. Templates ship near-empty (~2.3K tokens total across 6 files); a
  **populated** set is the real cost: **~4.5K–7K tokens** (full UI set) / **~3.5K–5K
  tokens** (backend-only, omits `design-system.md` + `tokens.json`). *Estimate — no
  populated examples are committed; extrapolated from `docs/write-project-docs.md`.*

### feeder `plan` — fan-out scales with issue count N
Pipeline (`skills/plan/SKILL.md`, body ~412 L):
- Step 0: orchestrator reads `feeder.json` + project docs + driver config (docs read **once**
  here).
- Step 3: **architect ×1** — heavy reasoning. Briefed with normalized brief + project-docs
  sections + shared keys; **also re-reads repo + project docs itself** (`architect.md:41`).
- Step 4: **issue-author ×N** (one per candidate, parallelizable). Each briefed with
  candidate + brief + project docs + shared keys; **each re-reads project docs + sibling
  source itself** (`issue-author.md:41`).
- Step 6 self-check: **triage-reviewer ×N** (+ **design-reviewer ×U** for the U UI issues),
  each reading implicated source itself; **≤2 issue-author re-dispatches per gated issue**.

**Feeder cost ≈ architect(1) + N×author + N×triage-reviewer + U×design-reviewer + retries**,
and the project-docs + repo grounding is paid **1 (orchestrator) + 1 (architect) + N
(authors) + reviewers** times in one run. RESULTS.md records real fan-out on the test
scenarios: ~20× triage-reviewer, ~17× design-reviewer (hand-counted).

### driver — per-issue gate loop + milestone loop
Skills: `solve-issue` 411 L, `solve-milestone` 701 L, `triage` 397 L (large instruction
bodies loaded into orchestrator context; `solve-issue`/`solve-milestone` carry a
**byte-identical** preflight-notice + icon-legend block each).

- **triage**: `triage-reviewer ×1 per cache-MISS issue` + `design-reviewer ×1` for MISS UI
  issues. A **triage cache** (Step 2.5, GraphQL timestamp keys) skips both for cache HITs.
  Reviewers briefed with issue text/comments **inline**; they re-read source via pointers.
- **solve-issue** (one issue): clean = **1 implementer** + 1 `/code-review` run; typical =
  **2 implementer** (build + one review-fix) + 2 `/code-review` runs. Four gates (unit, E2E,
  code-review, preflight) each allow **≤2 implementer re-dispatches** independently.
- **solve-milestone**: runs **triage once across the whole milestone** (Phase 0), then loops
  issues Wave-by-Wave, dispatching `solve-issue` per issue (Branch A reuses the Phase-0
  triage result — no re-triage).

### driver `--parallel` (opt-in, default off)
Buildable ∧ mutually-independent issues in a Wave run concurrently, **capped at 4**
(hardcoded, not a profile key), each in a git worktree under `.milestone-config/worktrees/`.
Workers run unit + `/code-review` + **static** preflight. Serializes in a **verified merge
tail** (Phase 2): E2E, port-binding preflight, and UI screenshot capture are deferred there
(concurrent workers would contend for one port). `integrationGranularity: issue|wave`
trades CI-run count (O(issues) vs O(waves)). Wall-clock lever, not a token lever.

---

## 2. Token hot spots (ranked hypotheses for Phase 2)

| # | Hot spot | Evidence | Lever |
|---|---|---|---|
| 1 | **Uniform `model: inherit`** — all 5 agents (architect, issue-author, implementer, triage-reviewer, design-reviewer) inherit the orchestrator's (likely Opus) tier; none downshift. | all `agents/*.md:26` | Pin mechanical/verify agents (issue-author, reviewers) to a cheaper tier; keep architect + implementer strong. Biggest, simplest $ lever. |
| 2 | **Redundant project-docs + source re-reads** — architect + every issue-author + every reviewer + implementer each re-ground from the same `.project/` docs + repo source. | `architect.md:41`, `issue-author.md:41`, `triage:141,164`, `solve-issue:99` | Pass a shared grounding digest into briefs instead of N independent full re-reads; exploit prompt caching of the static docs. |
| 3 | **Issue body+comments re-read ≥3× per issue** in a milestone run (triage fetch → solve-issue Step 1 → reviewer inline brief). | `triage:56-72`, `solve-issue:76`, `triage:138-140` | Thread the already-fetched issue payload through instead of re-fetching. |
| 4 | **Phase-0 triage result re-embedded inline in every dispatch brief** (background contexts don't inherit orchestrator memory) — once per dispatch + per re-dispatch. | `solve-milestone:139,151` | Inherent to background dispatch; bound it / compress the embedded block. |
| 5 | **Milestone description re-read 4×**; **profile re-parsed by every skill + every hook fire**. | `triage:43-49`, `solve-milestone:70,78-80,521`; `profile-schema.md:195-201` | Small each, but constant; cache within a run. |
| 6 | **`.project/` size multiplies every grounding read** (hot spot #2 × doc size). A richer (Obsidian) doc set scales this linearly across all dispatches. | §1 bootstrapper sizing | Selective retrieval, not whole-vault inlining — see §4. |
| 7 | **Duplicated static prose** — byte-identical preflight-notice + icon-legend in both driver orchestrator skills; large skill bodies always in context. | `solve-issue:18-34` ≡ `solve-milestone:22-38` | Minor; de-dupe / trim. |

---

## 3. Config surface & the Obsidian seam — the driver project-docs GAP

- **feeder** has `projectDocs` (default `.project/`) — the doc-path seam. An Obsidian vault
  dir could be pointed at here (`feeder.json`) today. Docs are read **whole-file**, best-effort.
- **driver is not wired to consume the `.project/` project knowledge — the grounding gap.**
  The two directories are distinct by design: **`.milestone-config/`** holds the config files
  (`driver.json`, `feeder.json`) — the driver reads its config here — while **`.project/`**
  holds the project scaffold / instruction / knowledge (the standing docs the bootstrapper
  populates). The driver reads the former but **not** the latter: no skill/agent reads
  `conventions.md` / `design-philosophy.md` / `environment.md`; the implementer + reviewers
  ground only via `domainSkills` (skill *IDs*), `nonNegotiables`, repo patterns, and the
  feeder-baked issue body, so the project brain **never reaches the implementer directly**
  (clean grep: zero `.project/` references in the driver's source). The feeder, by contrast,
  reads `.project/` via its `projectDocs` key (default `.project/`).
- **This contradicts the suite's own design intent.** The bootstrapper builds `.project/` as
  the consistency mechanism for the WHOLE suite — both feeder *and* driver are meant to
  "ground every issue and every line of code" in it (`bootstrapper/BRIEF.md:11,17,41`).
  As-built, only the feeder does. **The driver — the plugin that writes the actual code — is
  the one not reading the project brain.**
- **No guard blocks out-of-repo reads** — no `Read` matcher / path-confinement hook; the
  `*/Obsidian/*` strings (`force-subagent.sh:31`, `no-source-edit.sh:59`) only exempt Obsidian
  paths from the *write*-blocking gate.

**Implication for the Obsidian angle (the crux, not a footnote):** the goal is for **both**
driver and feeder to point at the project docs — which can be a vault. The feeder has the
`projectDocs` seam today; the **driver needs that seam added AND its implementer + reviewers
wired to consume it.** Because grounding adds per-dispatch context, this MUST be paired with
selective retrieval + prompt-caching (levers #2/#6) so "both ground in the docs" doesn't
multiply the token tax. Phase 2 angle F designs + measures this across all three plugins
(bootstrapper produces, feeder + driver consume).

### Driver `driver.json` keys (required ✅)
`integrationBranch`✅ · `protectedBranch`✅ · `sourceGlobs`✅ · `implementerAgent` ·
`triageAgent` · `designReviewAgent` · `unitTestCmd` · `e2eTestCmd` · `e2eEnv` ·
`preflightCmd` (+`ciWorkflow`) · `integrationGranularity` · `uiSurfaceGlobs` · `versioning` ·
`domainSkills` · `nonNegotiables` · `integrations.trello.*`. (`docs/profile-schema.md:93-113`)

### Feeder `feeder.json` keys
`projectDocs` · `reviewer` (`milestone-driver|internal|false`) · `architectAgent` ·
`issueAuthorAgent` · `issueSize` · `versioning` (`semver|none|absent`) · `sourceGlobs`
(self-protection). Shared keys (`uiSurfaceGlobs`, `integrationBranch`, consumer `sourceGlobs`,
`nonNegotiables`) are read from `driver.json`, not duplicated. (`feeder/docs/profile-schema.md`)

---

## 4. Instrumentation & test surface (what we build ON)

- **Instrumentation: NONE.** No OTEL, no telemetry, no token counting, no timing anywhere in
  the four repos. → Phase 1 must build metric capture from scratch (parse session transcript
  JSONL, or enable OTEL).
- **No `package.json` / test runner anywhere.** Tests are two kinds:
  - **driver `tests/`** — shell golden-matrix unit tests of the two helper scripts
    (`extract-version`, `ci-preflight-steps`); run each `.test.sh` directly; **not**
    end-to-end. Fixture mini-repos under `tests/fixtures/ci-preflight/`.
  - **feeder `tests/`** — a **behavioral "credibility harness"**: 9 scenarios
    (`scenarios/NN-*/` with `brief.md`, `project/`, `feeder-env.md`, `expected.md`), **the
    only end-to-end skill execution in the suite** — a runner agent follows `plan` Steps 0–6
    and dispatches the **real** architect/issue-author + real driver reviewers. **No
    automated runner**; results hand-recorded in `RESULTS.md`. **← the natural prototype for
    the benchmark harness.**
- **Existing "caching" seams** (skip-optimizations, not token instrumentation): driver
  `tests-green` hook (skips re-running the unit suite via a `branch:treeSHA` stamp) and the
  triage cache (Step 2.5). Worth measuring as already-present wins.
- **Only external MCP seam:** Trello (driver `solve-milestone/trello-sync.md`, best-effort,
  graceful-degrade). No `.mcp.json` in any repo.

---

## 5. Stated design goals re: cost (for context)
Performance language is **exclusively wall-clock / CI-run count**, never token/context cost:
`--parallel` worktree fleet (driver 1.5.0, cap 4), `integrationGranularity` (O(waves) vs
O(issues) CI), `tests-green`/triage caches. **No token-budget or context-tax goal is stated
anywhere** — the `.project/` re-read tax (#2/#6) and uniform `model: inherit` (#1) are the two
largest *unaddressed* token surfaces.

---

## 6. Open items / caveats
- Populated `.project/` token figures are estimates (no committed examples) — confirm by
  measuring a real populated repo in Phase 1.
- Per-issue driver dispatch counts assume the typical path; the ≤2-per-gate × 4-gate cap sets
  the worst case.
- All token numbers here are static estimates; the Phase 1 live harness replaces them with
  measured input/output/cache-split tokens.
