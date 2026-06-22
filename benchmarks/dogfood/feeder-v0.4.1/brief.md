# Plan — feeder: shared grounding digest, drop the duplicate re-reads (grounding seam, part 3/3)

**Goal:** stop paying the O(N) duplicate-doc tax. The orchestrator already reads `.project/` once at
Step 0; have it resolve the relevant sections **once** into a compact digest and pass that into the
architect + every issue-author brief, dropping each agent's independent **whole-file re-read** of the
same docs.

> Part of the suite grounding seam. Siblings: `milestone-bootstrapper/docs/efficiency-grounding-plan.md`
> (emit `projectDocs`) and `milestone-driver/docs/efficiency-grounding-plan.md` (close the driver GAP
> with the same anchored approach). Tracked as the held issue **feeder #84** (ranks #10/#18/#27 in
> `milestone-suite/benchmarks/analysis-report.md`).

## Current state

The feeder already grounds in `.project/` (the `projectDocs` key, default `.project/`). But the same
static docs are paid **N+1 times** per run: the orchestrator reads them at Step 0 **and** the
architect re-reads them itself **and** each of the N issue-authors re-reads them itself
(`agents/architect.md` and `agents/issue-author.md` both "re-read project docs"). On a populated
`.project/` that's a low-tens-of-thousands-of-tokens duplicate per run, scaling O(N).

## The change

- [ ] **Resolve once.** Extend the Step-0 read (and the architect brief's existing "only the sections
      that exist" filtering) so the orchestrator produces a compact **grounding digest** — the
      relevant `.project/<doc>#<section>` slices the brief implicates — rather than handing agents a
      directory to re-read.
- [ ] **Pass the digest as the sole grounding** in the architect brief (`skills/plan/SKILL.md`
      Step 3) and in each issue-author brief (Step 4), and **drop the agents' license to
      independently re-read whole files** in `agents/architect.md` / `agents/issue-author.md`
      ("What you receive").
- [ ] **Keep on-demand reads.** Agents retain `Read`/grep for **citation verification** (the rigor
      gates mandate verifying a `.project/<doc>#<section>` or sibling `file:line` before citing it) —
      the digest **supplements, never replaces** that. This is the guardrail against under-grounding.
- [ ] **Use section-level slices** (the same anchored approach as the driver plan), so a richer
      `.project/` doesn't re-inflate the per-brief grounding.

## Acceptance criteria

- [ ] The architect + issue-author briefs carry the resolved section digest; the agents no longer
      whole-file re-read `.project/` (verify: briefs contain the slices; agents still *can* grep to
      verify a citation).
- [ ] Generated issue bodies and their `.project/` citations are **unchanged** vs the pre-change run
      (the digest is a superset — quality held constant; the self-check gate still passes
      `GAPS: none`).
- [ ] On a realistic `.project/`, per-run grounding input is **lower** than the current N+1
      whole-file re-reads.

## Dependencies & sequence

- **Independent** of the bootstrapper and driver changes — the feeder already reads `.project/`, so
  this can ship anytime (in parallel). Land via feature branch → `develop` PR.

## Risks / non-negotiables

- **A digest that under-captures silently degrades grounding** — make it a **superset** and keep the
  on-demand `Read`/grep path open. **Supplement, never replace.**
- Preserve every `file:line` / `.project/<doc>#<section>` citation the rigor gates require — the
  digest must carry enough for the architect/author to cite accurately without a whole-file re-read.
- **Prompt-caching is NOT plugin-actionable** (Markdown skills, no `cache_control`) — the real lever
  is resolve-once + section-level slices, not caching.
