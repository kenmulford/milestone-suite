# Plan — bootstrapper: provision `projectDocs` for both consumers (grounding seam, part 1/3)

**Goal:** make the bootstrapper emit a single `projectDocs` pointer (default `.project/`) into
**both** the generated `feeder.json` and `driver.json`, so the feeder and driver always resolve the
project brain from the same place and cannot drift. This is the plumbing precondition for the driver
grounding wire.

> Part of the suite grounding seam. Siblings: `milestone-driver/docs/efficiency-grounding-plan.md`
> (consume `.project/` via anchored retrieval — the GAP fix) and
> `milestone-feeder/docs/efficiency-grounding-plan.md` (shared grounding digest).
> Tracked as the held issue **bootstrapper #38**.

## Decision: no Obsidian / no vault

`.project/` stays **in-repo**. A vault would only help for conventions *shared across many repos*,
but `.project/` is project-specific by definition, and in-repo docs are versioned with the code,
reviewed in PRs, and can't drift from the repo state. The token win comes from **selective
(anchored) retrieval** (driver/feeder plans), not from where the docs live. So there is **no vault
pointer, no scaffolding-into-a-vault** — `projectDocs` simply defaults to `.project/` and points at
an in-repo directory.

## Current state

- The bootstrapper produces `.project/` (the standing docs — the per-dispatch grounding source for
  the whole suite).
- `write-feeder-config` already emits `projectDocs` into `feeder.json`.
- `write-driver-config` does **not** emit `projectDocs` — `driver.json` has no such key, so the
  driver has nothing to resolve even once it learns to read `.project/`.

## The change

- [ ] In `scripts/write-driver-config.sh` **and** its `.ps1` twin, emit `projectDocs` into the
      generated `driver.json`, mirroring exactly how `write-feeder-config` emits it (same key, same
      default `.project/`, absent-means-default semantics).
- [ ] Emit the **same value** in both `feeder.json` and `driver.json` in a single bootstrap pass so
      the two definitions never diverge (one resolved value → both files).
- [ ] If the interview/understanding step lets the user relocate the docs dir, write that one value
      to both files; otherwise default `.project/`.
- [ ] No vault logic, no new prompts — this is an additive optional key only.

## Acceptance criteria

- [ ] A fresh `bootstrapper:apply` writes `projectDocs: ".project/"` into **both** `feeder.json`
      and `driver.json`.
- [ ] If the docs dir is customized, both files carry the **identical** value.
- [ ] A repo bootstrapped before this change (no `projectDocs` in `driver.json`) still works — the
      driver consumer treats absent as `.project/` (handled in the driver plan).
- [ ] Both script twins (`.sh` / `.ps1`) emit identical output.

## Dependencies & sequence

- Safe to ship **independently** and **first** — it is an additive key the driver will start reading
  once its grounding wire (driver plan) lands. No behavior change for the feeder.
- Land via a feature branch → `develop` PR (the suite flow; only `develop` → `main` promotes).

## Risks / non-negotiables

- **Additive only** — absent `projectDocs` must keep current behavior. Never make the key required.
- Keep the `.sh` / `.ps1` twins byte-equivalent in output (the suite's deterministic-writer rule).
