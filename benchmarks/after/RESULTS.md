# After-benchmark — feeder `plan`, scenario 06, the attribution ladder

The "after" numbers for the 0.4.0 efficiency work, measured on the **same** scenario the
baseline used (`06-cross-cutting-consistency`).

**Headline:** the benchmark **confirms #87's early-park is a large, clean win**, shows a **real
wall-clock speedup**, and — importantly — surfaced that **scenario 06 cannot cleanly isolate the
model-tiering token win**, plus a **measurement-method gap vs the old baseline**. The trustworthy
axes are wall-clock, dispatch count, and the within-harness (#87 on vs off) token delta — **not**
the raw token comparison against the old baseline.

## What changed since the handoff (why this is a ladder, not one run)

The handoff assumed 0.4.0 **excluded** #87, so the "after" run would isolate model-tiering +
concurrency. That premise changed: **PR #92 ("issue 87") merged `develop`→`main` after the
release**, so the shipped/installed feeder (still labeled 0.4.0) now includes #87's Step-3.5
early-park. Scenario 06 is park-heavy by design (the per-entity column sets have no conventional
default), so #87 early-parks most candidates *before* the fan-out — hence three points, each
isolating a lever.

## Method

Faithful re-run of `plan` **Steps 3–6** on scenario 06, dispatching the **real installed agents**
(`milestone-feeder:architect`/`:issue-author`, `milestone-driver:triage-reviewer`/`:design-reviewer`)
at explicit model tiers, via a workflow so the framework's own token/duration report is the metric
(`../HARNESS.md`). Harness script: `scenario06-run.mjs`.

- **Why orchestration is re-implemented (not the installed skill run directly):** the ladder needs
  #87's Step-3.5 toggled on/off, which the installed skill can't do. The *agents* are the real
  shipped ones (real contracts, real model pins); only the Steps 3–6 routing is re-encoded. The
  architect is Opus in **all** points (a constant), so only the author + reviewer tiers move.
- **Blind run:** `expected.md` was never read or passed to any agent.
- **Grounding:** agents ground on the provided brief + `project/design-system.md` + shared keys;
  read-only, no GitHub writes.

## The ladder (measured)

| Point | Config | Dispatches (arch / author / triage / design = total) | Subagent tokens | Wall-clock | Outcome |
|---|---|---|---|---|---|
| 1 — baseline | Opus / serial / no-#87 | 1 / 10 / 9 / 9 = **29** | ~165.6K ¹ | ~846s (~14m) | 9 parked, 1 clean |
| 2a — tiering + concurrency | Sonnet / concurrent / no-#87 | 1 / 11 / 1 / 1 = **14** | 404.7K | 302s | 10 authors→PRODUCT_GAP, 1 clean |
| 2b — tiering + concurrency (re-run) | Sonnet / concurrent / no-#87 | 1 / 10 / 0 / 0 = **11** | 315.8K | 171s | 10 authors→PRODUCT_GAP, 0 clean |
| 3 — as-shipped | Sonnet / concurrent / **+#87** | 1 / 1 / 1 / 1 = **4** | 124.4K | 228s | 10 pre-parked, 1 built clean (#A) |

¹ The baseline's `~165.6K subagent-tokens` was captured by the prior session's method (leaner,
likely output-only); rows 2–3 are the workflow framework's **full** totals (input + thinking +
output + cache). The two are **not directly comparable** — see the gaps below. Points 2a/2b are two
runs of the *same* config, kept to show run-to-run variance.

## What the ladder shows (trustworthy)

1. **#87 early-park is a large, clean win here.** Point 3 vs point 2: dispatches **4 vs 11–14**,
   tokens **124K vs 316–405K (~−65%)**, same method/env so the delta is real. The architect
   detects the shared "per-entity columns undefined" gap blocking the 10 entity-page candidates and
   pre-parks them *before* the author/review fan-out — instead of paying for 10 doomed author
   dispatches (which in point 2 each returned `PRODUCT_GAP` anyway). It does **not** over-park:
   candidate **#A** (buildable without per-entity columns) is still authored, reviewed, and clears
   the gate. Same parked end-state as point 2, reached without the wasted fan-out.
2. **Wall-clock dropped sharply:** ~846s → ~170–300s (**~2.8–4.9× faster**). This blends three
   effects (concurrency + Sonnet's lower latency + fewer dispatches) — read it as the *combined
   shipped speedup*, not concurrency alone.

## What the ladder cannot show (the honest gaps)

3. **Model-tiering's token win is NOT isolable on this scenario**, for two reasons:
   - **Measurement-method mismatch** (footnote ¹): point 2 reading *higher* than the baseline
     (316–405K vs 166K) is almost certainly accounting, not a regression.
   - **Scenario 06 parks by design:** authors immediately return `PRODUCT_GAP`, so the
     author/review fan-out that Sonnet tiering would cheapen barely runs — little tiering surface
     to measure.
4. **High nondeterminism:** the architect emitted 10–11 candidates and 0–1 authored; point-2 totals
   swung 11↔14 dispatches and 316↔405K tokens. Single runs are noisy — exactly the harness's
   "single runs lie, run 3×" warning.

## To get a trustworthy token ladder (recommended next)

- **Re-measure the baseline through THIS harness** (Opus / serial / no-#87 — same workflow, env,
  accounting). Then point 1 ↔ point 2 isolates tiering + concurrency on equal terms.
- **Add a mostly-PASSING scenario** (handoff NEXT #2): scenario 06 parks, so it can't exercise the
  fan-out. A passing scenario is the right vehicle for the tiering/concurrency token win.
- **3× per config**, report mean + spread (the variance above demands it).

## Releases tagged this session (context)

- milestone-driver **v1.11.0**, milestone-feeder **v0.4.0** (includes #87) — created at `main` HEAD,
  now with curated release notes. CHANGELOG entries merged to `develop` and promoted to `main` via
  develop→main PRs.
- milestone-bootstrapper v0.1.0 — already released 2026-06-20.
