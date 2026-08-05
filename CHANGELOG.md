# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.1] - 2026-08-05

### Added

- README Install section: the one cross-plugin version floor in the suite — `milestone-coherence-reviewer` v0.5.0 confirms a string-quoting finding still resolves by way of the `resolve-citation` script shipped in `milestone-driver` v1.19.0, and states what a consumer loses without the driver installed.
- README "How to use the suite": a note that a citation can name a piece of the text it points at instead of a line number, that line-numbered citations remain valid everywhere, and that `milestone-driver`'s `skills/citation-format.md` is the single definition the other four read from.
- `docs/config-keys.md`: a suite-wide index of every `driver.json` / `feeder.json` / `designer.json` key, which plugin writes it, and a link to its owning plugin's full definition — so a setting has one place to look up regardless of which plugin owns it. Linked from the README under a new "Looking for a setting?" section.
- README: `/milestone-feeder:update` and `/milestone-driver:triage` in the walkthrough's command blocks — both are user-invocable and were the only two the suite README omitted.

## [0.3.0] - 2026-07-13

### Added

- Catalog `milestone-designer` as the suite's fifth plugin — the pre-plan design phase (brief → spec + lo-fi wireframes) (PR #55).
- README: add the designer to the pipeline diagram, install block, and walkthrough (PR #55).

### Changed

- Marketplace metadata description now names the design phase (PR #55).

## [0.2.2] - 2026-07-06

### Fixed

- scenario01-tier-run.mjs: never write a baseline JSON on zero successful reps (return the tagged error shape instead), and distinguish the architect-abort sentinel from genuine crashes — aligning both harness scripts' zero-success semantics (#44, PR #47).

## [0.2.1] - 2026-07-05

### Added

- Run `scenario01-tier-run.mjs` 3x per config with mean/spread and persist a JSON baseline to `benchmarks/after/results/` (#39, 2121701).
- Run `scenario06-run.mjs` 3x per config (point2/point3) with mean/spread and persist a JSON baseline to `benchmarks/after/results/` (#42, e31a167).
- Suite banner, icon, and social-preview assets, shown in the README (#26, b00eaaa).
- Note the `$schema` URL's aspirational (not-yet-resolvable) status in the README's Install section (#40, 158fb66).
- Audit-remediation brief recorded at `docs/briefs/2026-07-05-audit-remediation.md` (provenance).

### Changed

- Mark `BRIEF.md` as historical/superseded, pointing at `marketplace.json` and `CHANGELOG.md` for the current design (#37, f85310e).

### Fixed

- Retry transient failures in CI's CEILING repo-resolution check before warning, distinguishing a resolved-on-retry notice from a never-resolved warning (#41, 4a51acc).
- Make the README's mermaid ecosystem flowchart legible on mobile browsers (#43, a4a5af1).
- True up CHANGELOG.md to document every manifest-affecting merge, including cutting the retroactive `v0.2.0` tag (#36, e3162a2).

## [0.2.0] - 2026-07-05

### Added

- Catalog `milestone-coherence-reviewer` as the suite's fourth plugin (#18, 7b9e996).

### Changed

- Switch every plugin source from `github` (SSH clone) to `url` (HTTPS) form, so `/plugin marketplace add` no longer requires SSH access (#10, 04501f5).

### Fixed

- Remove `allowCrossMarketplaceDependenciesOn` from marketplace.json — the key broke Claude Desktop's manifest parser (#22, d8dc0ae).

## [0.1.0] - 2026-06-21

### Added

- `milestone-suite` Claude Code plugin marketplace catalog, installable as a single marketplace.
- Catalogs the three suite plugins via `github` sources: `milestone-bootstrapper`, `milestone-feeder`, and `milestone-driver`.
