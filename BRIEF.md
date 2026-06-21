# milestone-suite — feeder brief

> **How to use this doc.** This is a feature brief for `milestone-feeder`. Run `/milestone-feeder:plan BRIEF.md` in this repo; the feeder will decompose it into a milestone of small, well-formed issues, which `milestone-driver` then builds. Intent + recorded decisions are below so the feeder grounds rather than parks; it is deliberately **not** pre-broken into issues.
>
> Suggested milestone line: `Milestone: milestone-suite v0.1.0`.

## What it is

`milestone-suite` is a single Claude Code plugin **marketplace** that catalogs the three suite plugins — `milestone-bootstrapper`, `milestone-feeder`, `milestone-driver` — each sourced from its own repo. A user adds **one** marketplace and installs the whole suite from it, instead of adding three separate marketplaces. The plugins keep living in their own repos; this repo is only the catalog.

This is the suite-linkage deferred in the dev-tools decision log (D1), now actionable because all three plugins are built and public.

## Why

Today, installing the suite is six commands across three marketplaces (three `marketplace add` + three `install`). This collapses the discovery surface to one marketplace and gives the suite a single place to update from. It changes nothing about how the plugins work.

## What to build (capability scope)

1. **The marketplace manifest** — `.claude-plugin/marketplace.json` cataloging the three plugins via `github` sources. This is the load-bearing artifact; the exact target is recorded below so it isn't guessed.
2. **README** — what the suite is, the one-marketplace install flow, a one-line description and repo link for each of the three plugins, and a note that each plugin also remains individually installable from its own repo.
3. **Marketplace validation (CI)** — a lightweight GitHub Actions workflow that validates `marketplace.json` is well-formed JSON and conforms to the marketplace schema (and, if feasible, that each referenced `repo` resolves). Keep it minimal — this repo has no application code or test suite.
4. **Repo hygiene** — `LICENSE` (MIT), `.gitignore`, and a `CHANGELOG.md` seeded at the first release.

### Recorded design — the target `marketplace.json`

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "milestone-suite",
  "owner": { "name": "Ken Mulford", "email": "ken@kenmulford.com" },
  "metadata": {
    "description": "The milestone dev-tools suite: bootstrap a repo's project brain, plan features into milestones, and drive them to merged PRs."
  },
  "allowCrossMarketplaceDependenciesOn": ["claude-plugins-official"],
  "plugins": [
    { "name": "milestone-bootstrapper", "source": { "source": "github", "repo": "kenmulford/milestone-bootstrapper" } },
    { "name": "milestone-feeder",       "source": { "source": "github", "repo": "kenmulford/milestone-feeder" } },
    { "name": "milestone-driver",       "source": { "source": "github", "repo": "kenmulford/milestone-driver" } }
  ]
}
```

The install flow it enables:

```
/plugin marketplace add kenmulford/milestone-suite
/plugin install milestone-bootstrapper@milestone-suite
/plugin install milestone-feeder@milestone-suite
/plugin install milestone-driver@milestone-suite
```

## Recorded decisions (grounding — so the feeder doesn't invent these)

- **Name `milestone-suite`** (repo `kenmulford/milestone-suite`; marketplace `name` is `milestone-suite`).
- **One catalog repo; plugins stay in their own repos** via `github` sources. A repo hosts exactly one `marketplace.json` (at `.claude-plugin/marketplace.json`), so the catalog needs this dedicated repo — it does not and cannot live inside a plugin repo that already has its own marketplace file.
- **Track each plugin's default branch by default** (users get latest). Structure the entries so a per-plugin `ref` tag-pin can be added later without restructuring. (Pinning is a future option, not v1.)
- **Keep the per-repo marketplaces** — each plugin stays individually installable from its own repo too. Additive, zero cost.
- **`allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]`** because all three plugins declare a `superpowers` dependency from the official marketplace.
- **Version-free repo** — it's a catalog, not a versioned plugin; no per-PR version bump (driver `versioning: false`).

## Non-goals (what it refuses)

- **Does not modify the three plugin repos.** Updating each plugin's own README to mention the suite-install path is a useful **manual follow-up**, listed for the human — not part of this milestone (the build runs in this repo only).
- **Not a plugin itself** — no skills, agents, or hooks; it is a marketplace catalog.
- Does not change how any plugin works, and does not re-host or fork plugin code.

## Constraints / non-negotiables

- `marketplace.json` must validate against the Claude Code marketplace schema; plugin sources use the `github` type with `owner/repo`.
- The repo must be public so it is installable.
- Honor the suite's concise output/doc style.

## Sequencing hints (for the architect's wave order)

- `marketplace.json` is the core and lands first.
- README and the validation CI both depend on `marketplace.json` existing.
- Repo hygiene (LICENSE/.gitignore) is foundational and can land first or alongside.

## Definition of done

A public `kenmulford/milestone-suite` repo whose `.claude-plugin/marketplace.json` catalogs all three plugins via `github` sources, such that `/plugin marketplace add kenmulford/milestone-suite` followed by `/plugin install <name>@milestone-suite` installs each of the three — verified to resolve and install. The per-repo marketplaces still work unchanged.
