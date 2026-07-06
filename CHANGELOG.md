# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.1] - 2026-07-05

### Added

- Run `scenario01-tier-run.mjs` 3x per config with mean/spread and persist a JSON baseline to `benchmarks/after/results/` (#39, 2121701).
- Run `scenario06-run.mjs` 3x per config (point2/point3) with mean/spread and persist a JSON baseline to `benchmarks/after/results/` (#42, e31a167).
- Suite banner, icon, and social-preview assets, shown in the README (#26, b00eaaa).
- Note the `$schema` URL's aspirational (not-yet-resolvable) status in the README's Install section (#40, 158fb66).

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
