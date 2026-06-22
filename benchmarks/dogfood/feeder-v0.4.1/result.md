# Dogfood example — milestone-feeder v0.4.1 (grounding seam)

A real run of the milestone suite on its own next version. `brief.md` is this repo's slice of the
grounding-seam plan; below is what the feeder + driver produced, with measured cost. All work was
isolated on `milestone/grounding-v0.4.1` — develop and main were never touched.

## Inputs
- **Brief:** `brief.md`
- **Repo:** kenmulford/milestone-feeder
- **Milestone:** milestone-feeder v0.4.1 — grounding seam (version provenance: explicit/verbatim) — `milestone/7`. plugin.json bumped 0.4.0 → 0.4.1.
- **Integration branch:** `milestone/grounding-v0.4.1` (off develop; driver `integrationBranch` pinned to it)

## Cost (measured by the harness)
| Metric | Value |
|---|---|
| Subagent tokens | 440,829 |
| Tool uses | 153 |
| Wall-clock | ~49.5 min (2,972,662 ms) |
| — plan phase | ~10 min |
| — create phase | ~3 min |
| — build phase | ~33 min |

## What it produced (all ✅ built + merged + closed)
| # | Issue | PR | Wave |
|---|---|---|---|
| #95 | Resolve project docs into a section-level grounding digest at Step 0 | #100 | 1 |
| #96 | Brief the architect with the Step-0 digest | #101 | 2 (dep #95) |
| #97 | Brief each issue-author with the Step-0 digest | #102 | 2 (dep #95) |
| #98 | Reframe architect "What you receive" | #103 | 3 (dep #96) |
| #99 | Reframe issue-author "What you receive" | #104 | 3 (dep #97) |
| — | v0.4.1 CHANGELOG | #105 | post-build |

Zero parked, zero blocked, zero human-decision items. Only #95 needed a review fix (one finding:
a "grep before you cite" phrase misattributed to the architect → re-dispatched, fixed, re-reviewed
clean). #96–#99 passed review first pass.

## Dispatch fan-out — nested dispatch WORKS (again)
Real sub-agents throughout, cap-4 rolling window, no inline fallback: feeder **architect + 5
issue-authors + 5 self-check triage-reviewers** (plan); driver **5 triage-reviewers (Phase 0) + 5
implementers** + review/fix re-dispatches (build).

## `--parallel` decision
**Sequential** (no `--parallel`). Within-Wave issues are dependency-independent but **not
file-level parallel-safe**: #96 and #97 both edit `skills/plan/SKILL.md`, and #96/#98, #97/#99 are
lockstep pairs. Serial was correct per the "independent AND parallel-safe" rule.

## ⚠️ CI finding (important)
This repo's CI (`.github/workflows/ci.yml`) triggers only on `pull_request` to `branches:
[main, develop]`. The milestone PRs targeted `milestone/grounding-v0.4.1`, so **GitHub ran no
checks — the PRs were vacuously mergeable**, the same effective state as the no-CI repos. The
isolated-branch strategy (chosen to contain auto-merge risk) inadvertently **also bypassed the one
real CI gate in the suite.** Mitigation: the run executed both CI scripts (`check-vocabulary.sh`,
`validate-plugin-structure.py`) **locally before every merge — all green**. Real CI will fire when
the branch is PR'd into develop.

## Caveats for review
- **CI base-branch scoping** — to make CI real on isolated milestone branches in future, the
  workflow `branches:` filter would need the milestone-branch pattern (or integrate on develop).
- **gitignore gap** — `.milestone-config/{preflight-notice,trello-notice,triage-cache.json}` show as
  untracked (`.gitignore` only covers the legacy root `.milestone-driver-*`). Left untracked; worth a
  one-line ignore rule.
- Driver `integrationBranch` still pinned to the milestone branch ("do not promote" commit) — revert
  before any real run.
- Milestone object left **open** (human-only close).
