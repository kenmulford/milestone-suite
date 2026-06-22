<!--
  Cite as: .project/design-philosophy.md#<section>
  [TBD] under a heading means "not specified" — tools skip it, never ground on it.
  Humans own this file; tools propose, they do not rewrite.
  Keep ## headings stable — they are citation anchors. Add new sections by appending, never renaming.
-->

# Design philosophy — Relay

Relay is an invite-gated, two-sided request platform. Partner organizations raise
requests on behalf of the people they serve; a central operations team triages each
request, routes it to a vetted vendor, and tracks it to fulfillment. The only
unauthenticated surface is a public directory of active partner organizations.

## Architectural stance

A thin SPA over a server-authoritative API. The Angular client renders state and
collects input; it never holds business rules, authorization decisions, or secrets.
A .NET backend-for-frontend (BFF) owns the session, brokers identity, and exposes a
task-shaped API. Treat the client as untrusted: every gate the UI shows is
re-enforced server-side. State that matters lives in Postgres behind the API, not in
the browser.

## Layering & boundaries

Three tiers, one direction of dependency:

1. **Web** (`siteroot/web`, Angular → Cloudflare Pages) — presentation only.
2. **BFF/API** (`siteroot/api`, ASP.NET Core → Azure App Services) — session,
   authorization, orchestration, validation. The BFF terminates the user session as
   an HTTP-only cookie and exchanges it for downstream API calls.
3. **Data** (PostgreSQL, Azure) — reached only through the API via EF Core.

The web tier never talks to the database and never sees a downstream token. Cross-tier
contracts are explicit DTOs; the intent is for the API shape to lead and the client to follow it.
Authorization is a server concern: the client may *hide* an action it can't perform,
but the API *rejects* it regardless of what the client sent.

Swap-ready seams are a first-class boundary: anything expected to change (the identity
provider, the notification transport, the vendor-routing rule) sits behind an interface
resolved by dependency injection, so swapping the implementation touches no call site.
Throwaway scaffolding is isolated behind a greppable marker and a deletable module so it
can be removed in one cut.

## What we optimize for

- **Trust and least privilege** — invite-gated access, role-scoped data, no broad reads.
- **Data minimization** — the platform stores only what a request needs; the people
  being served never hold accounts and their personal data is never exposed publicly.
- **Time-to-correct over time-to-first-render** — a correct, fully-stated request beats
  a fast but ambiguous one; the workflow is built to reduce back-and-forth.
- **Reuse over reinvention** — shared components and conventions before bespoke ones.

## One-way doors

Decisions that are expensive to reverse, so they are made deliberately and rarely:

- **Identity provider** — Microsoft Entra ID / Azure AD B2C, brokered by the BFF. The
  app depends on an abstract session contract, not the provider SDK, so a future
  provider change is contained — but the user-pool/tenant model itself is a one-way door.
- **The role model** — the fixed role set in `#layering--boundaries` and
  `design-system.md#roles--permissions` is a contract many surfaces depend on; adding a
  role is cheap, changing the meaning of an existing one is not.
- **Deployment split** — web on Cloudflare Pages, API on Azure App Services. The
  cross-origin boundary (CORS, cookie domain, auth callback URLs) is baked into the
  auth design; collapsing it later would be a rework, not a config change.
- **Data residency / store** — PostgreSQL on Azure is assumed by the data layer and the
  migration strategy.

## Error & failure philosophy

Authorization fails **closed**: an unresolved role, an unknown org, or a missing claim
is denied, never defaulted to allow. User-facing errors are typed problem responses
(RFC 7807 `application/problem+json`) the client maps to a friendly message — never a
raw stack trace. Rate-limited responses return `429` with a `Retry-After` header. The
client surfaces every server error as a non-blocking toast plus an inline error state;
it never silently swallows a failure. Validation runs at the boundary (the API), and the
client mirrors it for fast feedback only — the API remains the source of truth.

## Testing philosophy

Application code is built test-first via the milestone-driver (red → green). The web
tier co-locates a spec per component, store, and guard; route-level render-smoke runs as
a regression gate over every public route. The API tier tests vertical slices end-to-end
against an ephemeral Postgres. The intent is for guards and authorization rules to be
testable before the routes they protect exist, and for changes to come with a test
where a test layer exists.
