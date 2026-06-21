# milestone-suite

A single Claude Code plugin **marketplace** that catalogs the milestone dev-tools suite — [`milestone-bootstrapper`](https://github.com/kenmulford/milestone-bootstrapper), [`milestone-feeder`](https://github.com/kenmulford/milestone-feeder), and [`milestone-driver`](https://github.com/kenmulford/milestone-driver) — so you add **one** marketplace and install the whole suite. The plugins live in their own repos; this repo is just the catalog.

## Plugins

- **[milestone-bootstrapper](https://github.com/kenmulford/milestone-bootstrapper)** — bootstrap a repo's project brain (standing docs).
- **[milestone-feeder](https://github.com/kenmulford/milestone-feeder)** — plan features into milestones of well-formed issues.
- **[milestone-driver](https://github.com/kenmulford/milestone-driver)** — drive milestone issues to merged PRs.

## Install

Install the whole suite:

```
/plugin marketplace add kenmulford/milestone-suite
/plugin install milestone-bootstrapper@milestone-suite
/plugin install milestone-feeder@milestone-suite
/plugin install milestone-driver@milestone-suite
```

Each plugin also remains individually installable from its own repo.
