# Where does this setting live?

The suite's four plugins share two config files — `.milestone-config/driver.json`
and `.milestone-config/feeder.json` — but no single plugin owns every key in
either file. `milestone-bootstrapper` writes some keys for you when you run
`apply`; `milestone-driver` and `milestone-feeder` each write a few more keys of
their own, directly into the same files, through their own setup steps.

If you're trying to remember a setting's name, or which file it goes in, that
split makes it easy to look in the wrong plugin's docs. This page is the one
place that lists every key in both files and tells you which plugin actually
owns it — so you know which repo's docs to open next.

## `.milestone-config/driver.json`

| Key | Set by | Full definition |
|---|---|---|
| `integrationBranch` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `protectedBranch` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `sourceGlobs` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `projectDocs` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `uiSurfaceGlobs` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `unitTestCmd` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `preflightCmd` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `e2eEnv` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `domainSkills` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `nonNegotiables` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `versioning` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `stack` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `stackVersionFile` | `milestone-bootstrapper` | [driver-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/driver-config-keys.md) |
| `parallel` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — how many issues it builds at once |
| `maxParallelWorkers` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — the concurrency cap |
| `integrationGranularity` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — one PR per issue, or one per batch |
| `ciWorkflow` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) |
| `e2eTestCmd` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) |
| `visualCapture` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — screenshot capture for UI review |
| `integrations.trello` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — optional Trello board sync |
| `implementerAgent` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — default-filled, rarely set |
| `triageAgent` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — default-filled, rarely set |
| `designReviewAgent` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — default-filled, rarely set |
| `coherenceReviewAgent` | `milestone-driver` | [profile-schema.md](https://github.com/kenmulford/milestone-driver/blob/main/docs/profile-schema.md) — default-filled, rarely set |

## `.milestone-config/feeder.json`

| Key | Set by | Full definition |
|---|---|---|
| `projectDocs` | `milestone-bootstrapper` | [feeder-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/feeder-config-keys.md) |
| `versioning` | `milestone-bootstrapper` | [feeder-config-keys.md](https://github.com/kenmulford/milestone-bootstrapper/blob/main/docs/feeder-config-keys.md) |
| `autoHandoff` | `milestone-feeder` | [profile-schema.md](https://github.com/kenmulford/milestone-feeder/blob/main/docs/profile-schema.md) — hand a finished milestone straight to `milestone-driver`? |
| `architectAgent` | `milestone-feeder` | [profile-schema.md](https://github.com/kenmulford/milestone-feeder/blob/main/docs/profile-schema.md) — default-filled, rarely set |
| `issueAuthorAgent` | `milestone-feeder` | [profile-schema.md](https://github.com/kenmulford/milestone-feeder/blob/main/docs/profile-schema.md) — default-filled, rarely set |
| `issueSize` | `milestone-feeder` | [profile-schema.md](https://github.com/kenmulford/milestone-feeder/blob/main/docs/profile-schema.md) — optional issue-sizing rule |
| `sourceGlobs` | `milestone-feeder` | [profile-schema.md](https://github.com/kenmulford/milestone-feeder/blob/main/docs/profile-schema.md) — self-protection only, for `milestone-feeder`'s own repo |

## Keeping this page honest

This page only maps **key → owning plugin → where the full definition lives**.
It never restates what a key does in detail — that lives in exactly one place
(the owning plugin's docs), so a key's behavior can change there without this
index going stale. This page only needs an update when a key is **added,
renamed, or moves to a different owner** — not when its behavior changes.
