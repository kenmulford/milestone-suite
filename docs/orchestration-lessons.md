# Orchestration lessons — field rules for milestone-driver runs

Harvested from live driver runs 2026-06-02 → 2026-08-03 across five milestones in two consumer repos (a Rails app and a plugin-tooling repo). Numbering preserved from the retro so existing cross-references ("rule 15/16") keep meaning.

## Build-agent prompt rules (bake into `buildPrompt`)

1. **One test-suite run at a time against a shared test DB.** Concurrent suites against a single test DB deadlock (`PG::TRDeadlockDetected` under a `before(:suite)` TRUNCATE). Never launch a second run while one is in flight. Refined by rule 8: parallel builds are fine once each worker has its own DB.
2. **Don't run the full suite to diagnose mid-migration.** When replacing a pattern with many callsites, grep + migrate all callsites first, iterate on focused specs, and run the full gate exactly once at the end. Repeated full-suite diagnosis runs are the single biggest observed time sink (~14 min in one 92-min issue).
3. **Re-run `/code-review` after any post-review edit.** The commit gate blocks when code changed since the last review; an unreviewed fix-up costs a wasted commit plus a full gate re-run.
4. **"Extract shared component" issues carry 2–3× normal spec-migration surface.** Budget higher fix-iteration caps and batch the affected system specs.

## Verification gates

7. **Run the repo's CI gates locally before committing — not just the test suite.** The local gate surface (unit + E2E) is narrower than CI's (lint, static analysis/security, audits). Observed misses: `Rails/Pluck` lint twice, a Brakeman SQL-injection flag on an interpolated-but-whitelisted `Arel.sql` (fix: pre-built static literals, not a `brakeman.ignore`). Treat lint/static analysis as the implementer's blind spot and gate it at the orchestrator. Plugin-side fix proposal (discover gates from `.github/workflows/*.yml`): kenmulford/milestone-driver#56.
11. **Run the FULL suite locally before push, not unit + targeted.** A narrow local verify misses new guards breaking *existing* specs. Local multi-thread full runs are faster than a CI round-trip.
5. **(Plugin) tests-green-per-commit hooks re-run the full suite redundantly** right after a green run; narrow to changed spec dirs or stamp-skip within N minutes.

## Parallel mode and integration

8. **Per-worker isolated test DBs unlock true parallelism** on a single shared test DB: provision one DB per concurrent worker and pass each its own `DATABASE_URL` (on Windows, provision/drop via Rails tasks — `psql`/`createdb` are not on PATH; dropping needs `RAILS_ENV=test` or `EnvironmentMismatchError`).
9. **Workers build + verify + `/code-review` + commit only — no push, no PR.** The orchestrator merges committed branches, runs the full local gate, and owns the single push/PR/integration. Eliminates handback tail-drops (~37% of one wave ended on prose instead of the handback) and the hand-finish race with a still-alive worker.
10. **Wave-granularity integration (one PR per wave) suits cohesive low-risk batches** — one CI run, one combined visual review — but one red test blocks the whole wave. Merging to a non-default base doesn't fire `Closes #…`; close issues explicitly after merge.
6. **Never re-dispatch a cold prompt at an interrupted-but-complete agent.** If the branch exists and implementation is done, pass branch state ("impl done, skip to commit") or resume the thread; a cold restart duplicates the whole build.

## Worker lifecycle failure modes

13. **If the auto-mode security classifier blocks a self-merging worker, split build from merge**: worker opens the PR and stops; the orchestrator merges in-session after verifying. The classifier's objection is the unreviewed self-merge, not the build.
14. **Background subagents may have no Agent tool** — `solve-issue`'s dispatch degrades to inline implementer + inline review. Expected; flag such PRs `judgment call` and confirm ground truth from git/gh regardless.
15. **A worker's verify step must be synchronous (foreground).** A subagent that backgrounds the harness and "waits" ends its turn — which completes it — before the result arrives. Doc-only issues skip the suites entirely: verify by re-reading the diff against ACs.
16. **Any "waiting / standing by / monitor will notify me" handback is a STALL, not a completion.** Probe `git status` / `rev-list` / `gh pr list`; if the diff is present-but-uncommitted and correct, finish it yourself. Watch for the stalled worker waking later and opening a duplicate PR for already-merged content — close it as a duplicate.

## Briefing and documentation rules

17. **When lifting a rule from tool A to tool B, ask whether A's *reason* carries, not just whether the rule is correct.** Byte-identical lifting can make two gates disagree about valid input. "Each fix reveals another input shape" = you are reimplementing a parser — stop and revert. When an agent diagnoses its own error, act on the diagnosis rather than authorizing a retry of the same approach.
18. **A doc whose correctness depends on other files' line numbers is invalidated wholesale by any edit to a cited file.** Run the citation check as the LAST action; check content, not just existence (stale-by-N still resolves to a real line); prefer "every script here" over counts a future sibling falsifies; mirror an established CHANGELOG's own shape over a generic template.

## Known hook interference (user-level commit gates)

12. **User-level commit-gate hooks whose matchers use the free word "commit" false-fire on read-only commands** (case-insensitive, `.*` spans compound commands). Until the matcher is anchored to `git commit`: keep the literal word "commit" out of echo/label strings in git-inspection commands, and recognize a mid-run false fire as the matcher bug, not a real dirty-since-review state.
