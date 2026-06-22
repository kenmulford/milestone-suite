# Phase 2 — efficiency analysis (static)

From a 6-angle multi-agent profiling run: 41 agents, 34 findings, each adversarially verified, then ranked. Numbers are static estimates — the Phase 1 live harness confirms them. The suite has no token instrumentation today, so measure before trusting any dollar figure.

## Summary

The three highest-leverage wins are all low-cost, high-confidence model-tiering edits: replacing the incidental uniform `model: inherit` with explicit per-agent pins (architect + implementer stay strong, the three mechanical/verify agents — issue-author, triage-reviewer, design-reviewer — drop to Sonnet) cuts roughly 0.6x off the highest-fan-out dispatch volume (~20x triage-reviewer, ~17x design-reviewer, N issue-authors) for the price of five one-line frontmatter changes. Right behind it sit two free wall-clock levers that ship code that already exists: making the driver's fully-built, field-validated cap-4 worktree fleet (`--parallel`) discoverable/default-on for parallel-safe repos, and flipping `integrationGranularity:wave` to collapse CI runs from O(issues) toward O(logic-waves). The single biggest quality risk to watch is the reviewer downshift: triage-reviewer and design-reviewer ARE the suite's load-bearing honesty gate (their own spec says "err toward flagging; a missed Blocker costs a mid-flight rewrite"), so the reviewer tier change must be gated on a Blocker-recall A/B against the feeder RESULTS.md scenarios before locking — issue-author downshift is the safe, clean half. The one finding most worth a live Phase 1 measurement is the per-role token share underlying every model-tiering and grounding estimate: the suite has ZERO token instrumentation today, so the "40-60% of dispatch tokens in mechanical/verify roles" assumption (and the orchestrator's actual tier — "likely Opus" is unverified) must be measured before any dollar figure is trusted. Note that prompt-caching, cited as the headline lever in several grounding findings, is NOT plugin-actionable (these are Markdown skills with no `cache_control` surface) — only selective/anchored section retrieval and shared digests are author-controllable, so those are the real grounding levers.

## Ranked opportunities (30)

**1. [cross] Replace incidental model:inherit with explicit per-agent pins (2 strong, 3 Sonnet)**
- save: ~20-35% off total agent spend (order-of-magnitude, contingent on reviewer downshift surviving Phase-1 quality check; issue-author downshift is the clean, safe portion). $ lever only — token/wall-clock unchanged.
- cost: low  |  risk: medium-pending-validation — strong steps stay strong; only checklist/transcription steps downshift, but reviewers are the load-bearing gate so the reviewer pins must pass a Blocker-recall A/B first  |  confidence: high  |  umbrella: cross
- do: Pin architect+implementer to opus and issue-author+triage-reviewer+design-reviewer to sonnet (5 one-line frontmatter edits); ship issue-author now, gate the reviewer pins on a RESULTS.md Blocker-recall A/B.

**2. [feeder] issue-author (feeder): downshift to Sonnet — structured transcription against a pre-vetted breakdown**
- save: ~40% off the issue-author line item per run (Opus 4.8 -> Sonnet 4.6 = 0.6x in/out), multiplied by N authors; conditional on an Opus orchestrator.
- cost: low  |  risk: low — architect owns all real design/edges/waves; the driver triage-reviewer is a downstream GAPS gate that catches a thin spec  |  confidence: medium  |  umbrella: feeder#79
- do: Pin issue-author to sonnet now — it is the safe, clean tiering win since it transcribes a vetted breakdown into the fixed template; re-validate on RESULTS.md scenarios.

**3. [cross] triage-reviewer (driver) + feeder self-check: downshift to Sonnet — five-criteria checklist verification**
- save: ~40% off the triage-reviewer line item across both plugins (0.6x rate, conservative floor); absolute magnitude unmeasured but it is the highest-count reviewer (~20x across 4 feeder scenarios + per-MISS driver triage).
- cost: low  |  risk: low — keep Sonnet (not Haiku) for the source-reading dependency check and preserve the 'unsure->Blocker' fail-safe; verify on RESULTS scenarios first  |  confidence: high  |  umbrella: cross
- do: Pin triage-reviewer to sonnet after a Blocker-recall A/B confirms verdicts hold; never Haiku (the dependency-edge check requires reading source).

**4. [cross] design-reviewer (driver) + feeder self-check: downshift to Sonnet — UI spec-sufficiency checklist**
- save: ~40% off the design-reviewer line item across both plugins (0.6x rate); ~17x dispatches across 4 feeder scenarios + per-UI-issue driver triage.
- cost: low  |  risk: low — keep Sonnet floor for the pattern-consistency/scalability surface reads and the 'unsure->Blocker' fail-safe; verify on RESULTS UI scenarios first  |  confidence: high  |  umbrella: cross
- do: Pin design-reviewer to sonnet after the UI-scenario A/B; keep it off Haiku for the neighboring-surface reads.

**5. [driver] integrationGranularity:wave trades O(issues) CI runs for O(logic-waves) — default off**
- save: ~2-4x fewer CI runs depending on logic/UI mix (UI issues stay per-issue; an all-logic milestone hits the ~4x upper bound); wall-clock win scales with per-CI fixed setup/queue cost. Zero token change.
- cost: low  |  risk: low — only safe for repos with strong local gates (one red wave PR blocks the whole Wave); keep opt-in and gated on local-gate presence, do NOT default-on for weak-gate repos  |  confidence: high  |  umbrella: driver#171
- do: Surface integrationGranularity:wave as a discoverable profile knob and recommend it for strong-local-gate repos; keep default 'issue' for safety.

**6. [driver] Driver --parallel worktree fleet is fully built (cap 4) but OFF by default**
- save: ~1.2-1.8x end-to-end on a typical multi-wave milestone (narrow waves + serial merge/E2E tail dominate); up to ~3x only on genuinely wide (K>=4) independent waves with light deferred gates. Zero token change.
- cost: low  |  risk: none — the serial verified merge tail re-checks every increment against accumulated state and defers port-contending gates; do NOT weaken the merge tail or cross-wave barrier to gain speed  |  confidence: high  |  umbrella: driver#171
- do: Make --parallel discoverable/default-on for repos whose gates are parallel-safe; the machinery is built and field-validated, only the opt-in gates it.

**7. [feeder] Feeder Step 4 author fan-out is declared parallelizable but never orchestrated**
- save: Step-4 author batch ~2-3x faster at N=6-10 with cap W=4; end-to-end plan ~1.3-1.8x (Step 3 architect + Step 6 reviewers + retry rounds stay serial). Zero token change.
- cost: low  |  risk: none — stateless authors return text and share no state; only dispatch timing changes  |  confidence: high  |  umbrella: feeder#79
- do: Add an explicit 'dispatch all N authors concurrently, cap W=4' instruction mirroring the driver's rolling window; permissive prose alone is not orchestration.

**8. [feeder] Feeder Step 6 self-check reviewer fan-out has ZERO concurrency language**
- save: First-pass reviewer batch ~1.5-3x faster scaling with plan size at W=4 (two dependent stages: N triage, then U design); retry rounds stay serial. Zero token change.
- cost: low  |  risk: none — reviewers are pure read-only verdict functions over provided text; keep the within-issue triage->design ordering and between-pass retry serialization  |  confidence: high  |  umbrella: feeder#79
- do: Add concurrent-batch language to Step 6 (batch all N triage, then the U design reviews) preserving the staged ordering; it is the densest serial phase in a feeder run.

**9. [cross] Section-level (anchored) retrieval of project docs instead of whole-file inlining**
- save: ~2-4x reduction in grounding input PER dispatch for a lean .project/ set (netting out the overlapping caching lever); unbounded-vs-naive for a large Obsidian vault. Magnitude rests on unmeasured doc sizes.
- cost: medium  |  risk: low — risk is under-retrieval; mitigate by selecting a superset of plausibly-relevant anchored sections and letting agents pull more anchors on demand (they keep Read). Never trade grounding completeness for tokens  |  confidence: medium  |  umbrella: cross
- do: Resolve which ## anchors an issue touches and inline only those cited sections into briefs; the citation-anchor discipline already exists, exploit it to bound input regardless of vault size.

**10. [feeder] Feeder grounding tax scales O(N): project docs re-read as both brief AND independent re-read**
- save: ~one duplicate doc-payload copy per architect + author brief = order N x doc-size (low tens of thousands of input tokens/run at a populated set, O(N)); reviewers are pointer-briefed not double-charged, so smaller than the original 10-15x framing.
- cost: medium  |  risk: medium — a digest that under-captures silently degrades grounding; make it a SUPERSET and keep targeted file:line reads allowed (rigor gates mandate citation verification). Never replace, only supplement  |  confidence: high  |  umbrella: feeder#79
- do: Pass the orchestrator's resolved doc sections as the sole grounding in architect + issue-author briefs and drop the agents' license to independently re-read whole files, while keeping on-demand grep for citation verification.

**11. [feeder] Feeder plan cost is N-linear in issue count — author + reviewer fan-out dominates**
- save: ~20% of input tokens at N=8 (re-read of identical docs+source is paid N+1+reviewers times); the actionable cut is the shared grounding digest (see rank 10), not the dispatch count itself.
- cost: medium  |  risk: none for measuring; medium if re-reads were naively dropped — a shared digest must preserve the file:line citations the rigor gates require  |  confidence: medium  |  umbrella: feeder#79
- do: Treat as the cost-profile backbone for feeder#79: the N-linear author+reviewer fan-out is the dominant term, attack it via shared grounding (rank 10) + parallelism (ranks 7-8), not by cutting dispatches.

**12. [driver] Driver grounding GAP: implementer + reviewers never read the project docs**
- save: NET COST, not a saving (~+5-12K input tokens per clean issue with whole-file inlining — quote as the do-NOT-do ceiling); realizes value only via selective/anchored retrieval. Primary value is QUALITY/consistency.
- cost: medium  |  risk: none — this RAISES consistency (the suite's stated design intent that both plugins ground in the brain); the only risk is the token cost, mitigated by selective retrieval. Do NOT skip closing it to save tokens  |  confidence: high  |  umbrella: driver#171
- do: Wire the implementer + triage-reviewer + design-reviewer to consume the cited .project/ sections via anchored retrieval (never whole-file inlining); this is a consistency fix, ship it only paired with rank 9.

**13. [driver] Add a projectDocs key to driver.json and provision the vault pointer for both plugins from the bootstrapper**
- save: ~0 direct tokens (enabling plumbing); value is divergence-prevention — one vault/docs pointer provisioned for both plugins in one bootstrap pass instead of two drifting definitions. All real savings attribute to the driver grounding read (rank 12).
- cost: low  |  risk: none — additive optional key, absent-means-default (.project/) preserves current behavior; pointing at a vault is opt-in  |  confidence: high  |  umbrella: bootstrapper#37
- do: Add projectDocs (default .project/) to driver schema mirroring feeder and emit it from write-driver-config alongside write-feeder-config; the precondition for rank 12.

**14. [cross] Static .project/ brain re-inlined per dispatch — doc size multiplies across grounding reads**
- save: Single-digit-to-low-double-digit % of grounding INPUT cost from the author-controllable half (extend the architect's existing section-filtering to issue-author + reviewer briefs); the prompt-cache half is NOT plugin-actionable.
- cost: medium  |  risk: none — passing only implicated sections does not change what grounding the agent sees; the feeder already filters to filled sections  |  confidence: high  |  umbrella: cross
- do: Extend the architect brief's existing 'only the sections that exist' filtering to the looser issue-author and reviewer briefs; drop the prompt-caching framing as it is harness-controlled.

**15. [cross] Project-docs size multiplies every grounding read; a richer vault scales the redundant-read tax linearly**
- save: Magnitude-only multiplier on the grounding levers (a payload-slice ~40-70% of doc tokens per dispatch for a 7K populated set), not additive run-level savings; the unbounded-vault case is the solid core. Driver half is forward-looking.
- cost: medium  |  risk: medium — selective retrieval can drop a section an agent needed; select a superset and allow on-demand named-section pulls. Never trade grounding completeness for tokens  |  confidence: high  |  umbrella: cross
- do: Bound the per-dispatch grounding at relevant-sections size regardless of total (Obsidian) vault size; treat as the design constraint that makes ranks 9/12 affordable, not an independent saver.

**16. [driver] Driver solve-milestone: cost is the solve-issue loop x(issues); triage runs once up front**
- save: Profile only (no committed number). The 20K-tok solve-milestone body is one-time; the K-multiplied solve-issue loop (each carrying its ~15K body in a fresh context) dominates for K>2. Actionable low-risk trim = compress the inline re-embedded Phase-0 triage block (a few hundred tok x K).
- cost: medium  |  risk: none — the inline re-embed is structurally required (background agents do not inherit memory); compressing it must preserve every field Branch A reads  |  confidence: high  |  umbrella: driver#171
- do: Treat as the driver#171 milestone-cost backbone; the real recurring lever is fewer/cheaper dispatches (ranks 1,3,4) plus a bounded triage-block trim — do not count the one-time 20K body in the recurring lever.

**17. [driver] Driver solve-issue: cost is the per-issue gate loop — implementer (1-2x) + /code-review (1-2x)**
- save: Profile only. Cost attribution is correct (implementer-dispatch loop + /code-review dominate; ~12-15K-tok body is a real fixed per-issue overhead). Body-caching would save only ~3-8% of total per-issue cost and is harness-controlled, not plugin-actionable — measure-first.
- cost: low  |  risk: none — the <=2-per-gate caps are quality floors; do not lower them to save tokens  |  confidence: high  |  umbrella: driver#171
- do: Use as the per-issue cost backbone; do not pursue body-caching as a plugin edit (harness-controlled). Phase-1 token instrumentation needed before any per-issue dollar claim.

**18. [cross] Pass one shared grounding digest into briefs + lean on prompt caching of static docs**
- save: Single-digit percent net; the digest half is the credible, cheap core (resolve-once-pass-values, the house style at architect.md:38). The caching half is speculative on this uninstrumented Markdown-skill architecture. Overlaps rank 9.
- cost: medium  |  risk: low — a digest must not silently drop a needed convention; keep raw .project/ readable so an agent can pull the full section on demand  |  confidence: high  |  umbrella: cross
- do: Extend the existing resolved-values pattern from shared profile keys to project-docs sections; treat caching as harness-dependent, not a shippable plugin edit.

**19. [cross] Prefer an on-demand section-retrieval primitive (script) over whole-vault inlining for large vaults**
- save: Conditional/relative: bounds each grounding read to one anchor (~0.3-1.5K tok) independent of vault size — meaningful only for a large-vault consumer AND only once the driver grounding seam exists. A mechanism refinement of rank 9, not independent savings.
- cost: low  |  risk: low — the primitive must fail loud on an unmatched anchor (the writer already exits 3) so a drifted heading surfaces rather than returning empty grounding  |  confidence: medium  |  umbrella: cross
- do: Build a dependency-free .sh/.ps1 'read section under ## anchor' primitive reusing the existing anchor-walk code; reserve an MCP for a future cross-session need. Gated on ranks 9/12.

**20. [cross] Cross-plugin uniform model:inherit — model tier attribution (Angle A cost profile)**
- save: ~40-55% off feeder dispatch $ (2N+U mechanical agents are ~92% of feeder dispatches), but only ~10-20% off driver dispatch $ (the unmovable implementer dominates). Suite-wide cut is meaningful but uneven, NOT uniform.
- cost: low  |  risk: medium-gated-on-A/B — issue-author does grounded senior authoring and the reviewers ARE the quality gate; never an unconditional downshift  |  confidence: high  |  umbrella: cross
- do: Use as the cost-attribution evidence behind ranks 1-4 and 24; the actionable change is the per-agent pins, validated in Phase 1, with feeder benefiting far more than driver.

**21. [cross] Both plugins lack a profile knob for concurrency width — cap 4 hardcoded (driver), unspecified (feeder)**
- save: No standalone savings; an enabler that makes the parallelism levers (ranks 6-8) tunable. The optional 4->5 cap raise is worth at most ~25% wider batch and only when --parallel is on AND a Wave has >4 independent issues — near-zero in the median run.
- cost: medium  |  risk: low — a conservative default-4 knob is inert unless raised; the merge-tail/deferred-gate serialization (driver) and read-only independence (feeder) bound quality regardless of width  |  confidence: high  |  umbrella: cross
- do: Lift cap 4 to a shared maxParallelWorkers profile key (default 4) and give the feeder an explicit concurrent-batch instruction; ergonomics enabler for ranks 6-8, not a saver on its own.

**22. [bootstrapper] Bootstrapper: zero subagent fan-out — its OUTPUT (the .project/ docs) is the recurring suite tax**
- save: Near-zero for bootstrapper's own run (no fan-out, no N-multiplier, correct by construction). Keeping populated docs lean (e.g. a backend-only set omitting design-system.md + tokens.json) trims ~30-35% of per-grounding-read doc tokens DOWNSTREAM — accrues to feeder/driver, not bootstrapper.
- cost: low  |  risk: none — describing existing structure; no change that trades quality  |  confidence: high  |  umbrella: bootstrapper#37
- do: Keep the bootstrapper's output (the populated .project/ set) as lean as the project warrants — its single biggest cost lever is the doc size it produces, paid by the whole downstream suite.

**23. [cross] Cross-plugin byte-identical static prose duplicated across driver orchestrator skills**
- save: Pure de-dup of the two byte-identical blocks saves ~330 tokens (not 1-1.5K), and only when both skills are co-resident (~0.5-1% of a milestone run's fixed orchestrator-body overhead). The adjacent body-caching is harness-controlled and not double-counted here.
- cost: low  |  risk: none — a single shared source preserves the byte-identical invariant the KEEP-BYTE-IDENTICAL comments enforce  |  confidence: high  |  umbrella: driver#171
- do: Lowest-priority cleanup; de-dup the notice + icon-legend to a single shared source if convenient, but expect only ~330 tok — not a real efficiency lever.

**24. [driver] Driver: issue body + comments re-loaded >=3x per issue; Phase-0 triage result re-embedded inline**
- save: Real but narrow: eliminate 1 'gh issue view' round-trip per issue on the SYNCHRONOUS reuse path (latency + low-thousands tokens). On the DEFAULT async path the token win evaporates — embedding the snapshot in the brief just relocates the cost into the orchestrator. Triage handback schema must be extended to carry body+comments.
- cost: medium  |  risk: low — threading a snapshot risks staleness; keep a comment-freshness re-fetch (solve-issue Step 1 is the live build-time read where design-cleared comments land), fall to a fresh fetch when the snapshot is absent  |  confidence: high  |  umbrella: driver#171
- do: Limit to a sync-path-only round-trip elimination guarded by a comment-freshness re-fetch; do not claim a token win on the async default. Low priority.

**25. [driver] Phase-0 triage result re-embedded inline in every per-issue dispatch brief**
- save: ~N x 20-60 tokens (the block is ~30-150 tok, paid ~1x per issue, NOT per re-dispatch — gate re-dispatches carry only issue/plan/profile + a risk token). Compressing advisories to count+severity saves ~20-60 tok/issue. Small, bounded, not a top lever.
- cost: low  |  risk: low — keep the load-bearing fields Branch A reads (blockers/label/risk/edges) verbatim; only compress free-text advisories  |  confidence: high  |  umbrella: driver#171
- do: Compress the inline triage block's advisories to count+severity while preserving blockers/label/risk/edges; minor, bounded, deprioritize.

**26. [cross] No prompt-caching of large static instruction bodies + project docs**
- save: Largely unrealizable from the plugin layer: these are Markdown skills/agents dispatched via the Task tool with NO cache_control surface (grep clean across all repos). Possibly already captured by the harness, or an Anthropic-harness request — not shippable here. Quality risk genuinely none.
- cost: high  |  risk: none — caching changes only billing/latency of identical bytes, not content; risk is purely realization risk (harness support), not a quality trade  |  confidence: high  |  umbrella: cross
- do: Do NOT pursue as a per-plugin edit; file as a harness/SDK observation for Phase 1 to confirm whether Claude Code already caches subagent system prompts. The architect dispatches once, so the '~100% hit-rate on all 5 agents' framing is wrong for 1 of 5.

**27. [cross] Cross-plugin: project-docs + source re-grounded independently by every dispatch (+ driver GAP)**
- save: ~3-10% of feeder input tokens (smaller than the 25-40% headline — the orchestrator already pre-threads docs into briefs, and prompt-caching is absent and not plugin-actionable). The DRIVER GAP is the valuable half — a quality fix that ADDS tokens.
- cost: medium  |  risk: none-to-positive — sharing a digest holds feeder quality if it preserves citations; wiring the driver to the docs IMPROVES quality. Risk only if a digest drops citations  |  confidence: high  |  umbrella: cross
- do: Suppress the agents' optional independent re-reads on the feeder side for a small trim; treat the driver-GAP half as the real prize, pursued via ranks 12/13.

**28. [driver] Driver does not read .project/ at all — the 'both plugins ground in the brain' design intent is unbuilt**
- save: No independent token saving — net COST if done naively (~+2K tok for the template brain, scaling to ~4.5-7K populated, x each implementer/triage/design dispatch). Realizes a net win only as the precondition for the digest handoff + selective retrieval + caching. Primary value is QUALITY.
- cost: high  |  risk: none — adding grounding can only raise consistency; the token risk (not quality) is the per-dispatch multiplier, mitigated by caching/selective retrieval, never by dropping grounding  |  confidence: high  |  umbrella: driver#171
- do: Treat as the enabler behind ranks 12/13 — close the GAP only with selective/anchored retrieval from day one, never whole-file inlining.

**29. [feeder] architect (feeder): keep on STRONG tier — do NOT downshift**
- save: ~$0 (explicitly NOT a savings target; pinning opus could marginally increase spend if the orchestrator ran on Sonnet). The architect runs x1/run, so absolute share is small and downshift would multiply downstream fan-out.
- cost: low  |  risk: high — downshifting risks worse issue splits / missed dependency edges that multiply downstream cost; keep strong  |  confidence: high  |  umbrella: feeder#79
- do: Pin architect to opus explicitly as a quality-protection action (intentional, not incidental inherit); never downshift it.

**30. [driver] implementer (driver): keep on STRONG tier — do NOT downshift**
- save: ~$0 (explicitly NOT a savings target). Downshifting would nominally trim ~40% of the largest line item but raises re-dispatch rate against the <=2x4 gate cap — each failed pass burns a full implementer dispatch + a /code-review run — so expected cost likely RISES while quality falls.
- cost: low  |  risk: high — this agent writes the actual code and tests; downshifting trades quality for tokens and likely backfires on cost. Keep strong  |  confidence: high  |  umbrella: driver#171
- do: Pin implementer to opus explicitly; it is the one place the strong tier most clearly pays for itself, never economize here.

## Proposed child issues (11)

### [milestone-feeder] Pin issue-author to model: sonnet (downshift the mechanical transcription agent)
WHAT: Change `model: inherit` to `model: sonnet` in milestone-feeder/agents/issue-author.md:26. WHY: issue-author runs N times per plan (one per candidate) and is the highest-multiplicity generative agent, but it does structured transcription against a pre-vetted breakdown — the architect already owns design/edges/waves (issue-author.md:37,53), and its rigor gate is verification-shaped (grep-before-cite, issue-author.md:100), not open design. Opus 4.8 -> Sonnet 4.6 is 0.6x on input and output, ~40% off this line item. ANCHOR: milestone-feeder/agents/issue-author.md:26. Hold quality constant: re-validate acceptance-criteria completeness against the RESULTS.md scenarios before locking; the downstream driver triage-reviewer GAPS gate backstops a thin spec.

### [milestone-driver] Pin triage-reviewer + design-reviewer to model: sonnet, gated on a Blocker-recall A/B
WHAT: Change `model: inherit` to `model: sonnet` in milestone-driver/agents/triage-reviewer.md:26 and design-reviewer.md:26 (these same agents also serve the feeder self-check). WHY: both are read-only verification against five fixed criteria returning a small structured block — the canonical checklist-verify profile that downshifts safely, and the suite's highest-fan-out reviewers (~20x triage, ~17x design across the 4 feeder RESULTS.md scenarios). ~40% off each line item at the 0.6x rate. ANCHOR: triage-reviewer.md:26, design-reviewer.md:26. Hold quality constant: these ARE the load-bearing honesty gate — keep the 'genuinely unsure -> escalate to Blocker' fail-safe (triage-reviewer.md:83), keep Sonnet (NOT Haiku) for the source-reading dependency/pattern checks, and adopt only if a Blocker-recall A/B against RESULTS.md leaves verdicts unchanged.

### [milestone-feeder] Pin architect to model: opus (explicit strong-tier, do NOT downshift)
WHAT: Change `model: inherit` to `model: opus` in milestone-feeder/agents/architect.md:26 to make the strong tier intentional rather than incidental. WHY: the architect is the suite's hardest reasoning step (decompose -> dependency graph -> topological Wave sort -> classification, all grounded), runs exactly x1/plan so its absolute token share is small, and its decomposition quality is upstream of every downstream fan-out cost. ANCHOR: milestone-feeder/agents/architect.md:26,30,53. Quality protection only (~$0 savings); never downshift this agent.

### [milestone-driver] Pin implementer to model: opus (explicit strong-tier, do NOT downshift)
WHAT: Change `model: inherit` to `model: opus` in milestone-driver/agents/implementer.md:26. WHY: the implementer is the only agent that writes production + test code (TDD red->green, version-correct citations, architecture-lock STOP-and-resurface). Downshifting would raise the re-dispatch rate against the <=2-per-gate x 4-gate cap (solve-issue/SKILL.md:119,128,147,155) — each failed pass burns a full implementer dispatch + a /code-review run — so cost likely RISES while quality falls. ANCHOR: milestone-driver/agents/implementer.md:26,51-53. Quality protection only (~$0 savings); never downshift.

### [milestone-driver] Surface integrationGranularity:wave as a discoverable, gated CI-cost knob
WHAT: Make the existing integrationGranularity ('issue' default | 'wave') knob discoverable in setup/docs and recommend 'wave' for repos with strong local gates. WHY: 'wave' granularity assembles a Wave's logic branches into one wave PR and auto-merges on ONE green CI run, collapsing per-issue CI runs from O(issues) toward O(logic-waves) (~2-4x fewer depending on logic/UI mix; UI issues stay per-issue). ANCHOR: milestone-driver/skills/solve-milestone/SKILL.md:337,339,344-345,349,353. Hold quality constant: keep default 'issue' and gate the recommendation on local-gate presence — one red wave PR blocks the whole Wave, so it is unsafe for weak-gate repos.

### [milestone-driver] Make --parallel worktree fleet discoverable / default-on for parallel-safe repos
WHAT: Surface the fully-built, field-validated cap-4 worktree fleet (`--parallel`) in setup and default it on for repos whose gates are parallel-safe (the machinery already exists; only the opt-in gates it). WHY: absent --parallel the sequential loop runs byte-unchanged, so consumers get serial issue-by-issue builds and miss a free ~1.2-1.8x (up to ~3x on wide independent waves) wall-clock win, zero token change. ANCHOR: milestone-driver/skills/solve-milestone/SKILL.md:13,268,274; README:75. Hold quality constant: do NOT weaken the serial verified merge tail (re-checks each increment against accumulated state) or the cross-wave barrier; keep the cap conservative.

### [milestone-feeder] Add explicit concurrent-batch orchestration to Step 4 author fan-out
WHAT: Replace the permissive 'parallelizable when supported' prose with an explicit 'dispatch all N issue-authors concurrently, cap W=4, join at Step 5' instruction mirroring the driver's rolling window. WHY: Step 4 declares parallelism but ships no mechanism (grep finds only the one prose line — no run_in_background/barrier/cap), so authors almost certainly run serially and wall-clock scales O(N) instead of O(ceil(N/4)) — a ~2-3x speedup on the author segment, zero token change. ANCHOR: milestone-feeder/skills/plan/SKILL.md:132-134,159-161. Hold quality constant: authors are stateless and write no shared state, so concurrency cannot change any issue body.

### [milestone-feeder] Add concurrent-batch language to Step 6 self-check reviewer fan-out
WHAT: Add a concurrent-batch instruction to Step 6 — batch all N triage-reviewers, then the U design-reviews triggered by NEEDS_DESIGN_REVIEW:yes — preserving the within-issue triage->design ordering and the between-pass retry serialization. WHY: Step 6 is the densest dispatch phase (~20x triage + ~17x design across 4 RESULTS.md scenarios) yet carries ZERO concurrency wording, reading as strictly serial; reviewers are read-only verdict functions over provided text (make no gh calls), so a single pass batches safely for ~1.5-3x. ANCHOR: milestone-feeder/skills/plan/SKILL.md:200-202,210,233. Hold quality constant: keep the staged ordering and the per-pass retry/re-render serialization so the gate logic is unchanged.

### [milestone-feeder] Thread one shared grounding digest into architect + issue-author briefs (drop redundant whole-file re-reads)
WHAT: Have the orchestrator (which already reads project docs at Step 0) extract the relevant doc sections + cited sibling file:line snippets ONCE into a compact digest and pass it as the sole grounding in the architect and per-candidate issue-author briefs, dropping each agent's license to independently re-read whole files. WHY: today the same static docs are re-read as both brief tokens AND independent re-reads by the architect and each of N authors (architect.md:41, issue-author.md:41), an O(N) duplicate doc-payload tax. ANCHOR: milestone-feeder/skills/plan/SKILL.md:34,91,139; architect.md:41; issue-author.md:41. Hold quality constant: the digest MUST be a superset and keep on-demand grep/file:line reads allowed (the rigor gates mandate citation verification, issue-author.md:100) — supplement, never replace.

### [milestone-driver] Wire implementer + reviewers to consume .project/ via anchored section retrieval (close the grounding GAP)
WHAT: Add a projectDocs seam to the driver and wire the implementer + triage-reviewer + design-reviewer to consume the cited .project/ sections via anchored (## heading) retrieval — never whole-file inlining. WHY: grep shows the driver reads ZERO project docs today (the plugin that writes the code does not read the project brain), contradicting the suite's stated intent that both plugins ground in it; closing it is a consistency WIN. ANCHOR: milestone-driver/agents/implementer.md:38; milestone-driver/skills/solve-issue/SKILL.md:98-99; milestone-bootstrapper/BRIEF.md:11. Hold quality constant: this RAISES consistency — the only risk is the token cost, mitigated by selective/anchored retrieval (resolve which sections an issue touches, agents keep Read for on-demand pulls); never close the gap by dropping grounding.

### [milestone-bootstrapper] Add projectDocs key to driver.json schema and emit it from write-driver-config
WHAT: Add projectDocs (default .project/, absent-means-default) to the driver profile schema mirroring the feeder's key, and have the bootstrapper's write-driver-config writer emit it alongside write-feeder-config so one vault/docs pointer is provisioned for both plugins in a single bootstrap pass. WHY: the feeder has projectDocs as a first-class key but the driver has none, so the pointer would otherwise be defined in two drifting places; this is the precondition for wiring the driver's grounding read. ANCHOR: milestone-feeder/docs/profile-schema.md:46; milestone-driver/docs/profile-schema.md:91-113; milestone-bootstrapper/scripts/write-driver-config.sh (jq emitter ~176-214). Hold quality constant: additive optional key, absent-means-default preserves current behavior; ~0 direct tokens — value is divergence-prevention, all real savings attribute to the driver grounding read.

