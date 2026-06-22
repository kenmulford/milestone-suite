<!--
  Cite as: .project/library-manifest.md#<section>
  [TBD] under a heading means "not specified" — tools skip it, never ground on it.
  Humans own this file; tools propose, they do not rewrite.
  Keep ## headings stable — they are citation anchors. Add new sections by appending, never renaming.
-->

# Library manifest — Relay

The technology set we intend to build with, and how we'd like to change it. Reach for
what's listed; bring anything else through #adding-a-dependency-the-gate.

## Runtime & frameworks

- **Web** (`siteroot/web`): Angular 22 (standalone components, signals, `OnPush`,
  `@if`/`@for` control flow), TypeScript 6, Node 24 (pinned via Volta + `engines`).
  Deploys to **Cloudflare Pages**.
- **API** (`siteroot/api`): .NET 10 ASP.NET Core, organized as vertical feature slices;
  EF Core 10 over **PostgreSQL 16**. Deploys to **Azure App Services**.
- Identity: **Microsoft Entra ID / Azure AD B2C** (OIDC), brokered by the API as a BFF.
- All dependencies are exact-pinned (no `^`/`~`); the lockfile is committed.

## Approved libraries (by purpose)

| Purpose | Web (`siteroot/web`) | API (`siteroot/api`) |
| --- | --- | --- |
| UI components | Angular Material 22 + CDK (M3) | — |
| App state | Angular signals (`signal`/`computed`/`effect`) | — |
| HTTP | Angular `HttpClient` + a typed API client | — |
| Forms / validation | Angular reactive forms + shared validators | FluentValidation at the boundary |
| AuthN/Z | MSAL Angular (public client) | Microsoft.Identity.Web (token validation, BFF) |
| Data access | — | EF Core 10 + Npgsql; explicit `Include`, no lazy-load |
| DTO mapping | explicit hand-written mapping | explicit hand-written mapping (no reflection mapper) |
| Logging | console (dev) | Serilog → Azure diagnostics |
| Unit / component tests | Vitest 4 + jsdom | xUnit |
| Integration / e2e | Playwright (render-smoke + screenshots) | xUnit + Testcontainers (ephemeral Postgres) |

## Adding a dependency (the gate)

A new runtime dependency requires, recorded on the issue before it lands: (1) a one-line
justification of why the framework/stdlib can't do it, (2) a license check (permissive
only), (3) a transitive-weight glance (reject micro-libs that drag large trees), and
(4) sign-off. Dev-only tooling is lower-bar but still pinned. We'd rather extend a shared
utility than add a dependency, and one that skips this is worth flagging in review.

## Avoid / banned

- **Client-side secrets/tokens** — the SPA never holds a downstream token or secret;
  the BFF does (`design-philosophy.md#layering--boundaries`).
- **Bare native `<select>`** — use the Material autocomplete (typeahead) pattern.
- **Raw hex / px / rem in components** — use the design tokens (`tokens.json`).
- **RxJS for application state** — use signals; RxJS only where an Angular API requires it.
- **Reflection-based object mappers** (AutoMapper-style) — map explicitly.
- **EF Core lazy-loading** — load with explicit `Include`.
- **Lazy-loaded routes** — eager for now; revisit only if the bundle budget tightens.
