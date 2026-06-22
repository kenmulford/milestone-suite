# Dogfood example — milestone-driver v1.11.1 (grounding seam)

A real run of the milestone suite on its own next version. `brief.md` is this repo's slice of the
grounding-seam plan; below is what the feeder + driver produced, with measured cost. All work was
isolated on `milestone/grounding-v1.11.1` — develop (`1e733b8`) and main were never touched.

## Inputs
- **Brief:** `brief.md`
- **Repo:** kenmulford/milestone-driver
- **Milestone:** milestone-driver v1.11.1 — grounding seam (version provenance: explicit/verbatim) — `milestone/20`
- **Integration branch:** `milestone/grounding-v1.11.1` (off develop; driver `integrationBranch` pinned to it)

## Cost (measured by the harness)
| Metric | Value |
|---|---|
| Subagent tokens | 317,082 |
| Tool uses | 139 |
| Wall-clock | ~55 min (3,304,758 ms) |
| — plan phase | ~14.5 min |
| — create phase | ~5 min |
| — build phase | ~33.5 min |

## What it produced (all ✅ built + merged + closed)
| Wave | # | Issue | Deps | PR |
|---|---|---|---|---|
| 1 | #183 | Add `projectDocs` profile key | — | #190 |
| 1 | #184 | `read-doc-section` primitive (fail-loud) | — | #191 |
| 2 | #185 | `solve-issue` resolve-once | #184 (+#183) | #192 |
| 2 | #186 | `triage` resolve-once | #184 (+#183) | #193 |
| 3 | #187 | wire implementer | #185 | #194 |
| 3 | #188 | wire triage-reviewer | #186 | #195 |
| 3 | #189 | wire design-reviewer | #186 | #196 |
| — | v1.11.1 CHANGELOG | — | — | #197 |

7/7 merged, 0 parked, 0 blocked, 0 held. All 7 PASS the self-check gate (3 Advisory-only); driver
Phase-0 triage re-confirmed `GAPS: none` on all 7.

## Dispatch fan-out — nested dispatch WORKS
Real sub-agents throughout (cap-4 fan-out), no inline fallback: feeder architect + issue-authors +
self-check triage-reviewers (plan); driver Phase-0 triage-reviewers + implementers + review/fix
re-dispatches (build).

## `--parallel` decision
**Sequential.** The dependency chain dominates (schema/primitive → orchestrator resolve-once → agent
wiring) and same-Wave siblings edit neighboring files → no parallel-safe Wave.

## Findings (both fixed, contained to the branch — recorded as lessons)
1. **Subagent cwd inheritance.** Dispatched agents inherit the *session's* cwd (`milestone-suite`),
   not the target repo (`milestone-driver`) — the first issue-author batch parked on "files not
   found" until absolute repo paths were baked into every brief. Real friction when driving repo B
   from a session rooted in repo A.
2. **`git add -A` over-staging.** Building #183 swept the input brief + `.milestone-feeder/` scratch
   into PR #190; reverted (commit `757bc6c`), both untracked + `.milestone-feeder/` gitignored.
   Remaining issues staged only in-scope files. Brief never persisted to git.
   (Both → `~/Obsidian/NPM/Lessons/milestone-suite-dogfood.md`.)

## Caveats for review
- Driver `integrationBranch` still pinned to the milestone branch ("do not promote" commit) — revert
  before any real run.
- Milestone object left **open** (human-only close).
- No CI/test commands in this repo → gates were vacuously green (expected, contained to the branch).
