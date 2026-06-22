# Dogfood — the milestone suite builds its own next version

On 2026-06-22 the suite was pointed at itself: each plugin's grounding-seam plan was fed through
**milestone-feeder** (`plan` → `create`) to produce a patch-bump milestone, then built by
**milestone-driver** (`solve-milestone`) — one autonomous subagent per repo, all three in parallel.
Every run was isolated on a `milestone/grounding-*` branch; **develop and main were never touched.**
This folder is the worked-example record: each `*/brief.md` is the real input, each `*/result.md` is
what the suite produced + measured cost.

## Result: full success, 3/3 repos

| Repo | Milestone | Issues | PRs | Subagent tokens | Tool uses | Wall-clock | Parked/blocked |
|---|---|---|---|---|---|---|---|
| [bootstrapper](bootstrapper-v0.1.1/result.md) | v0.1.1 | 2 ✅ | 3 | 329,554 | 96 | ~37 min | 0 |
| [feeder](feeder-v0.4.1/result.md) | v0.4.1 | 5 ✅ | 6 | 440,829 | 153 | ~50 min | 0 |
| [driver](driver-v1.11.1/result.md) | v1.11.1 | 7 ✅ | 8 | 317,082 | 139 | ~55 min | 0 |
| **total** | — | **14** | **17** | **~1.09M** | **388** | **~55 min** (parallel) | **0** |

14 issues planned, built, reviewed, merged, and closed across three repos with **zero human-decision
blocks** — the suite planned and shipped its own grounding-seam release onto isolated branches.

## What the grounding seam now does (built on the three milestone branches)

- **bootstrapper** emits `projectDocs` (default `.project/`) into *both* `feeder.json` and
  `driver.json` so they resolve the project brain identically.
- **driver** gains a `read-doc-section` fail-loud primitive + reads `.project/` via **anchored
  (section-level) retrieval** in the implementer + both reviewers — closing the grounding GAP without
  whole-file token blowup.
- **feeder** resolves a **section-level digest once** at Step 0 and threads it into the architect +
  issue-author briefs, dropping the N+1 whole-file re-reads.

(In-repo `.project/` only — Obsidian/vault was evaluated and rejected; the token lever is selective
retrieval, not where the docs live.)

## Key learnings

1. **The suite can autonomously plan AND build its own next version.** Full feeder→driver loop
   (plan → self-check gate → create → triage → implement → code-review → merge → close) ran
   end-to-end on 14 issues with no human-decision blocks.
2. **Nested agent dispatch works** — a dispatched subagent successfully fanned out to
   architect/issue-author/triage-reviewer/implementer sub-subagents (cap-4 rolling window) on all
   three runs. (This was the open feasibility question — answered yes.)
3. **Isolated branches bypass real CI.** GitHub CI is scoped to PRs against `main`/`develop`; the
   feeder repo's `ci.yml` therefore ran **no checks** on milestone-branch PRs (vacuously mergeable —
   same effective state as the no-CI repos). The feeder run backstopped by executing the CI scripts
   locally (green). Real CI fires when a milestone branch is promoted to develop. **Decision for you:**
   widen the CI `branches:` filter to cover milestone branches, or accept local-validation + real-CI-
   at-promotion.
4. **Subagent cwd inheritance** — dispatched agents inherit the *session* cwd, not the target repo;
   driving repo B from a session rooted in repo A needs absolute paths baked into briefs (the driver
   run hit + fixed this). Recorded as a lesson.
5. **`--parallel` correctly declined on all three** — every milestone had either a dependency chain
   or same-Wave issues editing overlapping files (not file-level parallel-safe). Validates the
   driver's conservative gating; these particular plans had no parallel-safe Wave.
6. **Scratch/gitignore gaps** — `git add -A` swept a brief + `.milestone-feeder/`/`.milestone-config/`
   scratch into a PR (reverted); both feeder and driver runs flagged untracked scratch. Worth a
   one-line `.gitignore` rule per repo.

## Your move (per repo)

1. Review the `milestone/grounding-v*` branch.
2. **Revert the dogfood `integrationBranch` pin** (a labeled "do not promote" commit) before any real run.
3. Merge the branch → `develop` (real CI runs there for feeder) → `main` per your flow.
4. Close the GitHub milestone object (the driver never closes it) and tag/release the patch version
   (the CHANGELOG entry doubles as the release body).
5. Specific items: bootstrapper **PR #42** (an accepted judgment-call finding); decide the CI
   base-branch scoping (#3 above); add the `.gitignore` one-liners.

## Still open from the grounding plans

The plans call for a **rich-`.project/` token re-measurement** (whole-file vs anchored) + a
**re-baseline through the after-benchmark harness** to put a real number on the selective-retrieval
win. Do that **after** the seam code is promoted and live — the current fixtures are too small to show
it (see `../after/RESULTS.md`).
