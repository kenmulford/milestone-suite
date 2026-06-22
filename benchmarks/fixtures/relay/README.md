# Relay — rich `.project/` grounding fixture

A populated, multi-file project-docs set for the **grounding** token measurement
(whole-file vs anchored `.project/` retrieval). The existing scenario fixtures each carry
one short single-section doc, so whole-file ≈ anchored — there's no "rest of the doc" to
leave behind. This fixture is the rich substrate that makes the difference measurable.

## What it models

A fictional invite-gated, two-sided request platform ("Relay"): partner orgs raise
requests on behalf of the people they serve; a central operations team triages and routes
each one; the only unauthenticated surface is a public partner directory. It carries the
features the measurement wants exercised — **auth (a swap-ready provider seam), OIDC
(Microsoft Entra ID / Azure AD B2C), and RBAC (a six-role model)** — plus a realistic
stack and conventions.

**Modeled repo layout** (the docs describe this; the fixture itself is just the docs):

```
<repo-root>/
  .project/            # the doc set (here: project/, dotless, so it isn't hidden)
  .milestone-config/   # driver.json + feeder.json live at the project root
  siteroot/
    web/               # Angular 22 → Cloudflare Pages
    api/               # ASP.NET Core + EF Core on PostgreSQL → Azure App Services
```

## How it exercises the grounding lever

- **`project/`** — the full canonical doc set (`design-philosophy`, `design-system` +
  `tokens.json`, `library-manifest`, `conventions`, `environment`), every `##` section
  filled, ~5–8K tokens across six files, using the bootstrapper's stable anchor names.
- **`brief.md`** — a multi-feature build that decomposes into ~6–8 issues and
  deliberately does **not** restate the directives, forcing real grounding.
- **`expected.md`** (grader-only) — records which `.project/` sections each issue should
  ground on.

The contrast: a single issue cites a couple of `##` sections, so **anchored** retrieval
pulls just those slices, while **whole-file** retrieval inlines all six docs into *every*
one of the N dispatches. The waste is (one or two sections) vs (the whole set) × N — which
is what the measurement quantifies.

## Files

| File | Role |
| --- | --- |
| `brief.md` | The feature brief — the run's only task input besides the procedure. |
| `project/` | The rich `.project/`-style doc set the run grounds on. |
| `feeder-env.md` | The config the run assumes (globs, `projectDocs`, shared keys). |
| `expected.md` | Grader-only behavioral contract, incl. per-issue grounding anchors. |

## Notes

- **Fully abstracted.** The domain, names, places, and any client-specific detail are
  fictional; there are no dollar figures. Nothing here is a real client's data.
- **Intent, not contract.** The docs read as forward-looking intent (what we'd build
  toward), not rules enforced against an existing codebase — there is no codebase.
- **Config-path caveat.** Configs sit at the project root while the apps are nested under
  `siteroot/`, so the globs carry a `siteroot/` prefix. First-class relative-to-app-root
  support is a tracked tooling enhancement: milestone-driver #203, milestone-feeder #112,
  milestone-bootstrapper #49.
- The grounding **harness** (an anchored-vs-whole-file measurement that consumes this set)
  is the follow-on step; this fixture is its input.
