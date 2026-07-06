# Brief: audit remediation — milestone-suite (umbrella/marketplace repo)

**Goal.** Make the suite's public record trustworthy again — the CHANGELOG is stuck at a factually wrong 0.1.0 entry, the BRIEF describes a twice-reverted design as current, and no release has a git tag — and give the benchmark harness the self-verifying loop shape its own results say it needs. This repo has no skills/agents, so there is no token work here; it's all record-keeping and harness quality.

**Constraints:**
- marketplace.json is the load-bearing artifact users install from — every change to it stays FLOOR-validated by the existing CI before merge.
- Keep the FLOOR (blocking, structural) vs CEILING (best-effort, network) CI split exactly as designed.

---

## 1. CHANGELOG truth-up + release tags

**Evidence:** CHANGELOG.md's only entry (0.1.0, 2026-06-21) says it "catalogs the four suite plugins" — wrong for its own date, since coherence-reviewer was added by PR #18 on 2026-06-24. Three substantive manifest changes have no entry: the coherence-reviewer addition (7b9e996), the SSH→HTTPS source-form fix (04501f5, #10), and the allowCrossMarketplaceDependenciesOn removal that fixed a Claude Desktop parser break (d8dc0ae, #22). `git tag -l` is empty.

**Work:** Add a 0.2.0 entry covering the three changes (or honestly amend 0.1.0's scope + date), and cut a matching git tag. Adopt the repo's own `claude plugin tag` convention going forward if it fits.

**Acceptance:** CHANGELOG covers every manifest-affecting merge to date; at least one release tag exists and matches the manifest state it names.

## 2. Mark BRIEF.md as historical

**Evidence:** BRIEF.md:36-38 records the `github` (SSH) source form and :58 the `allowCrossMarketplaceDependenciesOn` key — both deliberately reverted in the shipped marketplace.json (url/HTTPS form, no such key). It reads as current spec but describes a superseded design.

**Work:** Add a banner at the top: superseded — see marketplace.json + CHANGELOG for the shipped design; kept for provenance. (Or delete it; the milestone it seeded is closed.)

**Acceptance:** no doc in the repo presents the SSH form or the removed key as current.

## 3. Close the .gitignore gap the dogfood run flagged and nobody actioned

**Evidence:** feeder-v0.4.1's dogfood result (benchmarks/dogfood/, result.md:59-61) flagged that `.milestone-config/` scratch files aren't ignored; the repo's .gitignore still doesn't cover `.milestone-config/{preflight-notice,trello-notice,triage-cache.json}` (only a legacy `.milestone-driver-*` pattern), even though `.milestone-config/.gitignore` exists.

**Work:** Add the ignore rules; sweep the other dogfood "Caveats for review" items across the three result.md files (revert the dogfood integrationBranch pin, CI branch-scoping decision) into real GitHub issues so they stop living as prose a human must remember across three files.

**Acceptance:** `git status` after a driver run shows no `.milestone-config` scratch noise; each open dogfood caveat is an issue or explicitly closed.

## 4. Benchmark harness: measure in a loop, persist machine-readable results

**Evidence:** benchmarks/after/RESULTS.md documents two runs of the same config landing 316K vs 405K tokens (~28% swing) that had to be manually re-run, and itself says "single runs lie — run 3x". Each benchmark point is a manual one-shot with results hand-transcribed into markdown tables.

**Work:** Extend the harness scripts (scenario01-tier-run.mjs, scenario06-run.mjs) to run N=3 reps per config, compute mean + spread in-script, flag >20% variance as "needs more reps," and persist a JSON results file per config so future runs diff against a machine-readable baseline instead of a human re-reading prose tables.

**Acceptance:** one command produces a 3-rep result with spread; a JSON baseline exists per measured config; the markdown tables are generated or clearly derived from the JSON.

## 5. CI CEILING check: retry transients, distinguish them from real failures

**Evidence:** validate-marketplace.yml's CEILING step (lines 108-138) curls each cataloged repo once and emits a uniform warning on any failure — a rate-limit blip is indistinguishable from a genuinely broken repo reference without reading Actions logs.

**Work:** Retry 2–3 times with backoff before warning; emit distinct annotations for "resolved on retry N" vs "never resolved" so the warning is diagnostic.

**Acceptance:** a transient failure produces no warning (or a resolved-on-retry note); a hard failure produces the never-resolved annotation.

## 6. One-line note on the aspirational $schema URL

**Evidence:** marketplace.json's $schema points at a URL that doesn't resolve to a schema (CI comments this honestly at validate-marketplace.yml:93-96; verified live → 301). README/BRIEF never mention it, so a newcomer assumes a live contract.

**Work:** One comment/README line: the $schema field is for tooling discovery; the URL isn't a resolvable schema yet, and CI's FLOOR performs the actual structural validation.

**Acceptance:** the note exists near where a reader would first encounter the field.

---

**Out of scope:** any plugin code (lives in the four plugin repos — each has its own remediation brief at docs/briefs/2026-07-05-audit-remediation.md); README rework (it audited clean against the writing-for-humans standard).

**Build-order hint:** 1–3 and 6 are independent record fixes (wave 1); 4 and 5 independent harness/CI work (wave 2).
