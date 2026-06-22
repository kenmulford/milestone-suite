# Dogfood example — milestone-bootstrapper v0.1.1 (grounding seam)

A real run of the milestone suite on its own next version. `brief.md` is this repo's slice of the
grounding-seam plan; below is what the feeder + driver produced from it, with measured cost. All work
was isolated on `milestone/grounding-v0.1.1` — develop and main were never touched.

## Inputs
- **Brief:** `brief.md`
- **Repo:** kenmulford/milestone-bootstrapper
- **Milestone:** milestone-bootstrapper v0.1.1 — grounding seam (version provenance: explicit/verbatim) — `milestone/3`
- **Integration branch:** `milestone/grounding-v0.1.1` (off develop; driver `integrationBranch` pinned to it)

## Cost (measured by the harness)
| Metric | Value |
|---|---|
| Subagent tokens | 329,554 |
| Tool uses | 96 |
| Wall-clock | ~36.7 min (2,203,489 ms) |
| — plan phase | ~11 min |
| — create phase | ~3 min |
| — build phase | ~18 min |

## What it produced
| # | Issue | Wave | Outcome | PR |
|---|---|---|---|---|
| #40 | Emit `projectDocs` from both `write-driver-config` twins (.sh + .ps1) | 1 | built + merged to branch | #42 (judgment call) |
| #41 | Wire `apply`'s Configs step to pass `projectDocs` to the driver writer | 2 (deps #40) | built + merged to branch | #43 |
| — | auto CHANGELOG entry | — | merged to branch | #44 |

Zero parked, zero blocked, zero held. `--parallel` **not** used (the dependency put the two issues in
separate Waves, so no Wave had ≥2 independent issues).

## Dispatch fan-out — nested dispatch WORKS
Real sub-agents fanned out at every layer (no inline fallback): feeder **architect ×1**,
**issue-author ×2 (+1 retry)**, **triage-reviewer ×3** (incl. re-triage); driver **implementer ×2**.
(Code-review was run inline on the small diffs — proportionate to 77-line / 3-line changes.)

## Decisions resolved autonomously (flagged for review)
1. Feeder self-check FAILed the first authoring (undeclared cross-repo dependency on the sibling
   driver schema + over-stated Summary) → re-authored scoped to this repo only; cleared on retry 1/2.
2. Code-review on #40 flagged a cross-twin asymmetry on the explicit-empty `-ProjectDocs ''` input →
   **accepted with rationale** (mirrors existing feeder-twin behavior; unreachable via `apply`'s
   resolved-value path). Marked as a judgment call on PR #42.
3. The destructive-command hook blocked an `rm -rf` cleanup → switched to `mktemp -d`.

## Caveats for review
- **PR #42** — confirm or adjust the accepted judgment-call finding.
- The `.ps1` twin's byte-equivalence was **reasoned, not executed** (`pwsh` not installed in the run).
- The driver `integrationBranch` is still pinned to `milestone/grounding-v0.1.1` (a labeled
  "do not promote" commit) — **revert before any real run** on this repo.
- The GitHub milestone object was left **open** (human-only close).
