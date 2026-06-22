# Baseline — feeder `plan`, scenario 06-cross-cutting-consistency

The "before" number, captured by a faithful read-only `plan` run at the current (inherited)
model, before any optimization. Re-run this same scenario after the changes for the delta.

- **Scenario:** `06-cross-cutting-consistency` (10 candidates, all UI — heaviest reviewer fan-out).
- **Dispatches (29 total):** architect ×1, issue-author ×10, triage-reviewer ×9,
  design-reviewer ×9, author retries ×0.
- **Outcome:** PARKED — 9 parked as genuine product gaps (per-entity column sets had no
  conventional default), 1 survived gate-clean (#F). (This is the scenario behaving correctly,
  not a perf issue; what we measured is the dispatch/token pattern.)
- **Cost:** ~165.6K subagent-tokens, 46 tool-uses, ~846s (~14 min). Model: inherited (baseline).
- **Caveat:** the fixture's `.project/` docs are small, so absolute tokens are low. The
  **structure** is the real signal.

## Headline finding (sizes the model-tiering lever, with real counts)
**28 of the 29 dispatches are the writing/checking roles** (10 issue-author + 9 triage + 9
design) — exactly the agents the analysis moves to Sonnet. Only the architect (1) stays strong.
So the model-tiering win lands on ~97% of feeder-plan dispatches by count. Confirmed against
real dispatch counts, not estimates.
