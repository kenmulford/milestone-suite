# Measurement harness (Phase 1) — design

Turn the Phase 2 static estimates into real, repeatable numbers — tokens and wall-clock per
run and per dispatch — so each optimization can be compared against a baseline, with quality
held constant.

## What we measure
- Tokens: input / output (and cache-read/write where exposed) per run and per dispatch.
- Wall-clock per phase and end-to-end.
- Subagent dispatch count, tool-call count.
- Derived $ from token mix × model rates.

## How we capture it (nothing is instrumented today)
- **Primary:** run a scenario as a workflow and read the framework's own usage report. It
  already reports per-run totals — the Phase 2 run came back with 41 agents, 2.6M tokens,
  466 tool-uses, 765s. That's enough for run-level baselines and before/after diffs.
- **Finer detail:** parse the session transcript files (`agent-*.jsonl`) for per-dispatch
  token usage when we need to attribute cost to a single agent/tier.

## Fixtures
- A small, version-pinned fixture set so every run is comparable:
  - feeder: a brief of known size → known-shape milestone (mix of ui/logic). Start from the
    feeder's existing `tests/scenarios/` (already shipped).
  - driver: a seeded milestone of a few issues, run end-to-end.
- Two project-docs variants — lean `.project/` vs a rich (Obsidian-style) set — to measure
  the marginal cost of richer docs and whole-file vs section-level retrieval.

## Repeatability
- Pin the model; run each scenario 3×; report mean + spread (single runs lie — the work is
  nondeterministic).

## Quality gate (held constant — never traded for tokens)
- feeder issues still pass triage `GAPS: none`; driver still yields green-CI PRs;
  bootstrapper docs still populate. An optimization that fails the gate is rejected
  regardless of savings.

## First measured slice (already running)
- The reviewer-tier A/B (`reviewer-tier-ab` workflow) produces the first hard numbers — the
  Blocker-recall of each model tier — which both gates the held reviewer-downshift issue and
  measures that lever.

## Status
Scaffolding. Next: a baseline run over the feeder's run-now scenarios, captured via the
framework usage report.
