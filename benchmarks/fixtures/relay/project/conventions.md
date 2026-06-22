<!--
  Cite as: .project/conventions.md#<section>
  [TBD] under a heading means "not specified" — tools skip it, never ground on it.
  Humans own this file; tools propose, they do not rewrite.
  Keep ## headings stable — they are citation anchors. Add new sections by appending, never renaming.
-->

# Conventions — Relay

## Naming

- **Web:** kebab-case file names; PascalCase types; camelCase members. Components named by
  role and co-located (`role-switcher.ts` / `.html` / `.css` / `.spec.ts`); small components
  inline template + styles. Signal stores end in `.store.ts`; route guards in `.guard.ts`.
- **API:** vertical-slice folders named by feature (`Features/Requests/`); request/response
  DTOs suffixed `Request`/`Response`; endpoints under `/api/v1/<resource>`.
- Avoid abbreviations in public names; spell out domain terms (`request`, not `req`).

## File & folder layout

Configs and house docs live at the **project root**, even though both apps are nested
under `siteroot/` (team convention — see the note below):

```
<repo-root>/
  .project/                       # house docs (this set)
  .milestone-config/              # driver.json + feeder.json
  siteroot/
    web/                          # Angular app  → Cloudflare Pages
      src/app/{auth,data,identity,ui,app-shell,public,app-area,admin-area,faux-idp}/
      src/app/<area>/pages/       # one folder per page
    api/                          # ASP.NET Core  → Azure App Services
      src/Features/<Feature>/     # vertical slices (endpoint + handler + DTOs + validation)
      src/Infrastructure/         # EF Core context, migrations, cross-cutting
```

Three sibling route groups in the web app — public (`/`), org workspace (`/app`),
operations console (`/admin`) — with **no shared parent**, so each shell owns its chrome
and guards independently. Static route paths precede `:param` paths; a wildcard catch-all
is last.

> Tooling note: `sourceGlobs`/`uiSurfaceGlobs`/`projectDocs` are currently written
> relative to the config location, so with configs at the root they carry the `siteroot/`
> prefix (`siteroot/web/**`, `siteroot/api/**`). First-class relative-to-app-root support
> is tracked as a tooling enhancement (driver #203 / feeder #112 / bootstrapper #49).

## Test patterns

- TDD red → green via the milestone-driver where a test layer exists.
- **Web:** co-located Vitest `*.spec.ts` per component, store, and guard; guards written
  to be testable before their target routes exist; Playwright render-smoke over every
  public route as a regression gate.
- **API:** xUnit slice tests exercise an endpoint end-to-end against an ephemeral Postgres
  (Testcontainers); validation and authorization are asserted at the boundary.

## Canonical exemplars

Patterns we'd want mirrored once these surfaces are built — the locations below are the
intended homes, not existing files:

| Pattern | Intended home |
| --- | --- |
| Abstract-token auth seam | `siteroot/web/src/app/auth/auth.service.ts` |
| Functional route guard returning `UrlTree` | `siteroot/web/src/app/auth/auth.guard.ts` |
| Signal store (readonly state + selectors + mutators) | `siteroot/web/src/app/data/requests.store.ts` |
| Reusable list surface with all required states | `siteroot/web/src/app/ui/data-table/data-table.ts` |
| API vertical slice (endpoint + handler + DTOs) | `siteroot/api/src/Features/Requests/RaiseRequest/` |
| Boundary validation + problem-details error | `siteroot/api/src/Features/Requests/RaiseRequest/RaiseRequestValidator.cs` |

## Commits & PRs

Git Flow: `main` (production) / `develop` (integration) / `feature/*`. The driver opens
PRs into **`develop`, never `main`**; promotion to `main` is a human-reviewed merge.
Conventional-commit subjects; squash on merge; PR description states what changed and how
it was verified.

## Versioning

The application is continuously delivered and not independently semver-versioned. Database
migrations are **forward-only**, timestamped, and named for their change; the intent is not to edit a migration after it ships.
