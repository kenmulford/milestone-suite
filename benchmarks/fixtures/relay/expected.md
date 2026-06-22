# Expected — Relay rich-grounding fixture

Grader-only. The runner never sees this file. It states what a good plan looks like and,
above all, **which `.project/` sections each issue should ground on** — the grounding
behavior this fixture exists to exercise.

## MUST

- Decompose into roughly **6–8 independently buildable issues** covering: request-intake
  form, org request list, operations approval/triage queue, role-aware nav + acting-role
  resolution, the request API (raise / list-scoped-to-org / route), the per-user rate
  limit, and invite-redemption → session.
- Order respects real dependencies: the request API and the session/acting-role resolution
  land before the surfaces that depend on them; intake and list can follow in a later wave.
- Each issue **grounds on the docs and cites the section it used** (citation form
  `.project/<doc>.md#<section>`), rather than restating or inventing. Expected anchors:
  - **Intake form / request list** → `design-system.md#required-states`,
    `design-system.md#component-inventory`, `design-system.md#roles--permissions`
    (only `coordinator`+ may raise; `member` is view-only).
  - **Operations approval queue** → `design-system.md#roles--permissions` (`superadmin`
    only), plus `design-system.md#required-states` / `#component-inventory`.
  - **Role-aware nav + acting-role** → `design-system.md#roles--permissions`,
    `design-philosophy.md#layering--boundaries` (server re-checks the gate), and the
    auth seam under `conventions.md#canonical-exemplars`.
  - **Request API** → `conventions.md#file--folder-layout` (vertical slice under
    `siteroot/api/src/Features/`), `library-manifest.md#approved-libraries-by-purpose`
    (EF Core / FluentValidation), `environment.md#data-stores`.
  - **Rate limit** → `design-philosophy.md#error--failure-philosophy` (429 + Retry-After),
    `library-manifest.md#approved-libraries-by-purpose`.
  - **Invite redemption → session** → `environment.md#external-services--integrations`
    (Entra ID / Azure AD B2C, the resolved-session claims), `design-philosophy.md#one-way-doors`.
- UI-surface issues (the three `/app` and `/admin` screens) carry the design detail the
  design-lens review checks: the four required states, the pattern to mirror, a11y labels.

## SHOULD

- Convention citations point at the **provided** `project/` docs (real grounding), not
  invented conventions.
- The intake form and the approval queue reuse the shared components named in
  `design-system.md#component-inventory` (`DataTable`, `EmptyState`, `StatusBadge`,
  `RequestTimeline`) rather than bespoke equivalents.
- The API issues sit under `siteroot/api/**` and classify as logic; the screen issues sit
  under `siteroot/web/**` and classify as UI (per the `uiSurfaceGlobs` in `feeder-env.md`).

## FAIL if

- It **restates** a directive (required states, the role matrix, the stack) that a doc
  already answers, instead of grounding on and citing the doc.
- It **invents** scope a doc doesn't support — e.g. a different identity provider than the
  Entra ID / Azure AD B2C named in `environment.md#external-services--integrations`, an
  in-app payment step, or a role outside `design-system.md#roles--permissions`.
- It misses the RBAC gate on raising a request (lets `member`/`visitor` raise), or the
  server-side re-check (`design-philosophy.md#layering--boundaries`).
- It misses a dependency edge (e.g. an intake screen ahead of the request API or the
  session resolution).
- It parks something the docs answer.
