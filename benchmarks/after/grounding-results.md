# Grounding measurement — whole-file vs anchored `.project/` retrieval

The measured grounding-lever data point the scenario-06 ladder and `discovery-map.md` asked
for. Those only had **estimates** ("~2–4× for a lean set; unbounded for a large vault") with
no populated example. This measures it on the rich **Relay** fixture
(`benchmarks/fixtures/relay/`). Harness: `relay-grounding-run.mjs`.

## What it measures

The input-token cost of how `.project/` house docs get inlined into the feeder/driver
fan-out:

- **whole-file** — every grounded dispatch inlines the *entire* `.project/` set.
- **anchored** — each dispatch inlines only the `##` sections its issue cites (extracted
  with the driver's real `read-doc-section.sh` primitive).

This is a **deterministic accounting, not a live agent run.** The grounding lever is an
input-accounting property: whole-file vs anchored doesn't change agent behavior or output,
only how many doc tokens ride along in each dispatch's prompt. A live two-mode fan-out
would reproduce the same delta with model-behavior noise and ~1M tokens of cost — so we
account for it directly. (Contrast the live tiering harness `scenario01-tier-run.mjs`,
where real model cost on real work genuinely needed live dispatches.)

## Method

- **Fixture:** the 6-file Relay `.project/` set (~5.7K est-tokens whole-file).
- **Dispatch model:** the brief decomposes into 7 issues; each grounds an issue-author +
  a triage-reviewer, and each UI issue also a design-reviewer — **18 grounded downstream
  dispatches** (4 UI × 3 + 3 logic × 2). The architect (1 dispatch) is excluded — it needs
  broad context in both modes, so counting it either way would muddy the lever (see caveats).
- **Citation map:** each issue's cited anchors, taken from the fixture's `expected.md`.
- **Tokens:** estimated as `ceil(chars/4)`; the headline is a ratio.

## Result

| issue | surface | grounded dispatches | anchored tokens / dispatch |
|---|---|--:|--:|
| intake-form | ui | 3 | 834 |
| request-list | ui | 3 | 514 |
| approval-queue | ui | 3 | 834 |
| role-nav | ui | 3 | 810 |
| request-api | logic | 2 | 683 |
| rate-limit | logic | 2 | 381 |
| invite-session | logic | 2 | 447 |

Across the 18 grounded dispatches:

- **whole-file grounding input: ~101,952 est-tokens** (each inlines all 6 docs ≈ 5.7K)
- **anchored grounding input: ~11,998 est-tokens** (each inlines only its cited sections)
- **reduction: ~88% — anchored uses ~8.5× fewer grounding-input tokens.**

The lever scales with the fan-out: the per-dispatch waste (whole set − cited slice) is paid
once per dispatch, so a wider milestone (more issues, more reviewers) widens the gap.

## Caveats (so the number isn't read for more than it is)

- **Estimator:** `ceil(chars/4)`. The ratio is robust to the *scale* of any character-linear
  estimator (the per-char rate cancels), but **not to tokenization *shape***. A word-count
  estimator already moves it ~8.5× → ~7.6×; a real BPE tokenizer could shift it a comparable
  amount. Swap `estTokens` for `count_tokens` for exact, shape-faithful figures.
- **Architect exclusion direction:** excluding the architect isolates the lever but yields a
  *higher* headline than folding it in as a shared whole-file constant — **~88% (lever-isolated)
  vs ~84% (architect folded in)**. The reported number is the lever-isolated one.
- **`tokens.json`:** included in whole-file (faithful — whole-file inlines the whole dir) but
  never cited by anchored. Dropping it gives ~87.4% instead of ~88.2%; it is not what drives
  the win.
- **Dispatch model** (author + triage + design-for-UI) is a stand-in for a real fan-out; the
  *shape* of the lever (per-dispatch whole-set vs cited-slice × N) is what matters, not the
  exact dispatch count.

## Reproduce

```
node benchmarks/after/relay-grounding-run.mjs
```

Prints the table, the totals, and a machine-readable JSON summary. Uses
`milestone-driver/scripts/read-doc-section.sh` when the sibling repo is present (and says so),
falling back to an equivalent internal `##`-section splitter otherwise.
