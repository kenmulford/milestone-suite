# milestone-suite

A single Claude Code plugin **marketplace** that catalogs the milestone dev-tools suite — [`milestone-bootstrapper`](https://github.com/kenmulford/milestone-bootstrapper), [`milestone-feeder`](https://github.com/kenmulford/milestone-feeder), and [`milestone-driver`](https://github.com/kenmulford/milestone-driver) — so you add **one** marketplace and install the whole suite. The plugins live in their own repos; this repo is just the catalog.

Status: **planning.** The build is specified as a feeder brief — [BRIEF.md](BRIEF.md) — meant to be handed to `/milestone-feeder:plan` (dogfooding: the suite builds its own marketplace). Part of the [dev-tools](../dev-tools) suite; this is the suite-linkage deferred in dev-tools DECISIONS D1.

Once built, install will be:

```
/plugin marketplace add kenmulford/milestone-suite
/plugin install milestone-bootstrapper@milestone-suite
/plugin install milestone-feeder@milestone-suite
/plugin install milestone-driver@milestone-suite
```

Each plugin also remains individually installable from its own repo.
