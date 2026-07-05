# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
