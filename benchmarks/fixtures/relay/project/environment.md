<!--
  Cite as: .project/environment.md#<section>
  [TBD] under a heading means "not specified" — tools skip it, never ground on it.
  Humans own this file; tools propose, they do not rewrite.
  Keep ## headings stable — they are citation anchors. Add new sections by appending, never renaming.
-->

# Environment — Relay

How we intend to run Relay. The split deploy (web on Cloudflare Pages, API on Azure App
Services) shapes most of what follows.

## Environments

Three intended environments: **dev** (local), **staging**, **prod**. The plan is for the
web app to publish to Cloudflare Pages with a per-branch preview deploy on feature
branches, and for the API to deploy to an Azure App Services staging slot that swaps into
prod after verification. The web app's API base URL is environment config (build-time for
the SPA, app settings for the API), never hard-coded.

## Data stores

PostgreSQL on Azure is the system of record, reached only through the API via EF Core.
Schema changes go through forward-only, named migrations applied on deploy. We intend to
store only what a request needs through its lifecycle; the people a partner org serves do
not hold accounts, and their personal data is never part of the public surface. Retention
follows the request lifecycle rather than being kept indefinitely.

## Caching

The public partner directory is the main caching opportunity — a short-TTL response cache
fronted by Cloudflare's CDN. Reference data (role set, status values) can sit in an in-API
memory cache. Authorized per-org data is **not** cached across users; a cache key that
crosses an org or role boundary is a bug, not an optimization.

## Async & messaging

Notifications (email) are intended to be queued and sent out-of-band so the request-submit
path never blocks on a third party. Request status changes emit domain events that
downstream concerns (notifications, audit) subscribe to. The submit path itself stays
synchronous and fast: validate, persist, acknowledge.

## External services & integrations

- **Identity — Microsoft Entra ID / Azure AD B2C** (OIDC, authorization-code + PKCE),
  brokered by the API as a BFF. The config we expect to carry: the B2C tenant/authority,
  the SPA client id, the API app-registration scope, the redirect/callback URI(s), the
  requested scopes (`openid profile email` + the API scope), and the custom claims
  (`role`, `orgId`) the BFF maps into the session. The app depends on an abstract session
  contract, so the provider choice is contained (`design-philosophy.md#one-way-doors`).
- **Transactional email** — an email provider for invites and request-status notices,
  called from the async path above.
- **External partner portal** — an outbound deep-link passthrough only (we send the user
  out to a partner-facing portal); no data is exchanged across that boundary.

## Runtime & hosting

The intended topology is cross-origin: the web app served from Cloudflare Pages (e.g.
`app.<domain>`) talking to the API on Azure App Services (e.g. `api.<domain>`). The plan
for the session is an HTTP-only, `Secure`, `SameSite=None` cookie the BFF issues, scoped
to the shared parent domain; CORS on the API allows the web origin with credentials. The
Entra B2C redirect/callback URIs are registered for both the web origin (the SPA) and the
BFF callback, including a pattern for Cloudflare preview deploys. The API exposes health
and readiness endpoints for the App Services probes.
