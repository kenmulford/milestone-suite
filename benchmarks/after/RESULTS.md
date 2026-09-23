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

## Scenario 01 — apples-to-apples (isolating the tiering + concurrency win)

This is the trustworthy token/cost ladder the scenario-06 section called for: the **same harness**,
a **passing** scenario (clean CSV-export brief — not park-by-design), the **baseline re-measured
through this harness** (not the old leaner accounting), and **3× per config** with mean + spread.
Harness script: `scenario01-tier-run.mjs`.

Two configs, 3× each, run **sequentially** (clean wall-clock):
- **baseline** — all agents Opus, serial (cap 1): pre-optimization.
- **tiered** — architect Opus, author + reviewers Sonnet, concurrent (cap 4): as-shipped.

On a passing scenario, #87's early-park is a **no-op** (nothing parks), so this cleanly isolates
**model-tiering + concurrency** with nothing else moving.

### Measured (3× each)

| Config | tokens (mean, range) ¹ | dispatches | wall-clock (mean, range) | cost/run ² |
|---|---|---|---|---|
| baseline (Opus / serial) | 203.7K (202.9–205.0K) | 7 (1/3/2/1) | ~4.86 min (4.27–5.17) | **$3.03** |
| tiered (Sonnet / concurrent) | 211.3K (200.3–230.3K) | 7–8 (1/3/2–3/1) | ~2.63 min (2.42–3.03) | **$1.84** |

¹ `subagent_tokens` from the framework report = **input + output only** (it does **not** count cache).
True billed volume per run is ~4× larger (cache read + cache write dominate — e.g. one tiered run:
193K input + 12K output but 389K cache-read + 218K cache-write). See the cost note.
² Cache-aware blended dollar cost, computed from the per-agent input/output/cache-read/cache-write
breakdown in each run's transcript, priced at current list: Opus 4.8 $5/$25 per MTok, Sonnet 4.6
$3/$15; cache write 1.25× input, cache read 0.1× input. Baseline cost is the mean of the 2 reps whose
transcripts were available this session (rep 1 ran in a prior session; both available reps landed at
$3.02–$3.03); token + wall-clock means use all 3 baseline reps.

### What it shows

1. **Raw token COUNT is model-independent — ~flat.** Baseline ~204K, tiered ~211K. Switching 6–7 of
   the 7–8 agents from Opus to Sonnet does **not** reduce the *number* of tokens produced — same task,
   similar output length. The tiered mean is even nudged *up* by rep 3, which authored all 3
   candidates (8 dispatches vs 7) — that's the architect's run-to-run variance in how many candidates
   reach the fan-out, not a model effect. **Token count tracks how much fan-out work happened, not
   which model did it.**
2. **Wall-clock dropped ~46%** (~4.86 → ~2.63 min, ~1.85× faster), from cap-4 concurrency plus
   Sonnet's lower per-token latency. Token count is flat and concurrency cannot change tokens, so this
   axis is purely tier-latency + parallelism.
3. **Dollar cost dropped ~35–39% — this is where the model-tiering lever lives.** Pricing the same
   work with 6–7 agents on Sonnet instead of Opus: **$3.03 → $1.84 per run actual (−39%)**. Holding
   token volume exactly constant (price the *tiered* runs' own tokens both ways, all-Opus vs mixed):
   **−35%**. The two bracket the real saving; the gap is run-to-run volume noise. The architect
   staying on Opus caps the ceiling — it's the single heaviest agent (reads the whole brief + docs,
   carries the largest cache-read at ~141K vs ~28–68K for the others), so the Opus share of the bill
   is larger than 1/8.

### Why cost, not token count, is the right headline for tiering

The scenario-06 section worried it "cannot isolate the model-tiering token win." This run resolves
that — with a correction: **there is no token-*count* win to isolate.** Sonnet and Opus tokenize and
generate near-identically for the same task, so a count comparison always reads ~flat between tiers.
The model-tiering lever is a **price** lever — fewer dollars for the same tokens — visible only via a
cache-aware, per-model dollar calculation (the framework's input+output token figure both ignores
cache and is blind to which agent ran which model). Measured properly: a **~35–39% cost cut per
planning run, on top of the ~46% wall-clock cut.**

### Caveats

- **Outcome varied run-to-run** (product gaps 0–1, gate fails 0–2 of 2–3 reviewed): the architect's
  candidate split and the reviewers' verdicts are nondeterministic. This does **not** affect the
  token/cost/wall-clock comparison — the same architect→author→triage(→design) fan-out runs in every
  rep and consumes tokens regardless of verdict; tiered just runs that structure on Sonnet.
- **Dispatch count is ~equal across configs** (7–8 either way) — confirming #87 is a no-op on a
  passing scenario, the property that makes this a clean tier + concurrency isolation.

## Scenario 01 — 2026-07-07 re-run: the tiering leg, measured for real

The section above priced "tiering" from a run whose model overrides were silently ignored — a
later re-run (results: `results/scenario01-tiered-concurrency-only.json`) confirmed that leg had
run **all-Opus** and measured **concurrency only**. On 2026-07-07, after a probe verified the
Workflow runtime honors model overrides (`sonnet` → `claude-sonnet-5`, sharing Opus 4.8's
tokenizer), the tiered config was re-run with tiering actually executing: **3 architects on
Opus 4.8, 19 mechanical agents on Sonnet 5**, verified per-agent from transcripts. Same adapted
harness, 3 sequential reps per config, cache-aware costing. Results of record:
`results/scenario01-baseline.json`, `results/scenario01-tiered.json`.

### The three-point ladder (3× each, same harness/day)

| Config | cost/run (mean) | wall-clock (mean) | dispatches |
|---|---|---|---|
| baseline — all Opus, serial | $3.88 (3.58–4.20) | 6.74 min | 7 |
| concurrency only — all Opus, cap-4 | $3.00 (2.66–3.36) | 4.43 min | 7 |
| **tiered — Sonnet 5 mechanical + Opus architect, cap-4** | **$2.19** (1.79–2.96) | **4.24 min** | 7–8 |

### What it shows

1. **The −44% total cost cut decomposes cleanly.** Concurrency alone: −23% (driven by cache
   warmth — concurrent dispatches land inside the 5-min cache TTL). Model tiering on top:
   a further **−27%** with wall-clock ~flat (266s → 254s) — the price lever isolated, with
   nothing else moving. Warm-cache tiered reps landed at **$1.79–1.81/run (−53% vs baseline)**;
   the tiered rep-1 $2.96 is cold-cache (542K cache-write).
2. **Wall-clock (−37% vs baseline) is concurrency's win, not tiering's.** Confirms the earlier
   conclusion: at this scale, tiering is a **price** lever — not a token-count or latency lever.
3. **Caveats** (recorded in the JSON): costs priced at Sonnet 5 **list** rates ($3/$15/MTok;
   intro pricing through 2026-08-31 makes actual bills ~1/3 lower on the Sonnet share), and the
   run's `ioTokens` is not comparable to the baseline's — the accounting split between plain
   input and cache-write moved, so compare configs on cost and wall-clock only.

## Scenario 01 + 06 — 2026-07-08 full-suite re-run (through the hardened Workflow runtime)

Re-ran the whole after-benchmark suite — scenario 01 (baseline, tiered) and scenario 06 (point2,
point3), 3× each — queued **sequentially in one orchestrator workflow**. The Workflow runtime had
tightened since the 07-07 runs: it now forbids `Date`, `node:fs`, and static `import`, and requires
`export const meta` to be the first statement. Both harness scripts were adapted to **compute-and-return**
— they no longer persist in-script; the main thread writes `results/*.json`, and wall-clock / tokens /
cost are recovered from the per-agent workflow transcripts (joining tokens+cost, which were already
transcript-recovered). 116 agents, 0 errors.

### Measured (3× each; cost cache-aware from transcripts)

| Config | dispatches (mean, range) | billed tok/run | wall-clock/run | $/run (mean, range) |
|---|---|---|---|---|
| s01 baseline — Opus, serial | 7 (7–7) | 333K | 6.7 min | $1.57 (1.30–1.94) |
| s01 tiered — Sonnet+Opus, cap-4 | 7.3 (7–8) | 387K | 5.0 min | $1.48 (1.32–1.70) |
| s06 point2 — no #87 | 17.7 (11–21) | 1000K | 12.0 min | $3.65 (1.70–4.70) |
| s06 point3 — as-shipped (+#87) | 6.7 (1–13) | 391K | 6.1 min | $1.73 (0.53–3.04) |

Billed = input + output + cache-read + cache-write, summed per-agent from the workflow transcripts and
bucketed by config (via `startedAt` order; the baseline bucket being **all-Opus** cross-checks the
attribution). The billed total (6.33M) reconciles with the framework's own `subagent_tokens` (5.68M)
within ~11% — the residual is multi-turn cache-read, billed on every call but snapshot-counted by the
framework. Cost priced at Opus 4.8 $5/$25, Sonnet 5 $3/$15 per MTok; cache-write 1.25×, cache-read 0.1×
input.

### What holds

- **#87 early-park is the robust win.** point3 vs point2: dispatches **6.7 vs 17.7**, billed **391K vs
  1000K**, wall-clock **6.1 vs 12.0 min**, cost **$1.73 vs $3.65 (−53%)**. point2 does ~2.5× the work
  (full 10-author fan-out + review vs mostly pre-parked), so the win is **structural** — it survives even
  though run-order handed point2 the warmer cache.
- **Scenario 01 is stable on dispatch/outcome** (baseline 0% variance; tiered 7–8), reconfirming #87 is a
  no-op on a passing scenario.

### The honest caveat — cross-config cache confound

Running all four configs back-to-back in one workflow lets cache warmth bleed across them, so **the
baseline↔tiered cost delta here is NOT a clean tiering measurement.** baseline ran second (cold
scenario-01 cache, right after the scenario-06 point3 canary) at **64% cache / 121K io**; tiered ran
third (warm — same scenario-01 prompts) at **89% cache / 42K io**. Tiered lands only ~−6% cheaper /
−25% faster, but part of that is warm-cache ordering, not Sonnet tiering. **The 07-07 three-point ladder
above (which controlled cache state) remains the trustworthy tiering isolation** (−27% tiering / −53%
warm-tiered). To re-isolate tiering under this restructured harness, run baseline and tiered in separate
workflows (or a cache-neutralizing order), not chained.

### Variance

Both scenario-06 configs flagged `needsMoreReps` (dispatch spread >20%): point3 swung 1→13→6 and point2
11→21→21 — the architect's park-count nondeterminism on the park-by-design scenario. Three reps is too
few for a stable s06 mean; the s01 configs (0% / 14%) are within threshold.

## Releases tagged this session (context)

- milestone-driver **v1.11.0**, milestone-feeder **v0.4.0** (includes #87) — created at `main` HEAD,
  now with curated release notes. CHANGELOG entries merged to `develop` and promoted to `main` via
  develop→main PRs.
- milestone-bootstrapper v0.1.0 — already released 2026-06-20.
