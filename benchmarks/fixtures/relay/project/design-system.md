<!--
  Cite as: .project/design-system.md#<section>
  [TBD] under a heading means "not specified" — tools skip it, never ground on it.
  Humans own this file; tools propose, they do not rewrite.
  Keep ## headings stable — they are citation anchors. Add new sections by appending, never renaming.
  Machine-readable tokens live in tokens.json (this file references them by name).
-->

# Design system — Relay

Angular Material 3 (M3) themed from the brand token dictionary. Every surface is built
from the shared component inventory below; bespoke one-offs are escalated, not invented.

## Design tokens

All color, type, spacing, radius, and breakpoint values come from `tokens.json` —
components reference token names, never raw values. No literal hex, px, or rem in
component styles; use the CSS custom properties generated from the token set
(`--color-*`, `--space-*`, `--radius-*`, `--type-*`). Status colors (request states,
role badges) are token-driven so a theme change never requires touching a component.
Dark theme is a token overlay, not a parallel stylesheet.

## Component inventory

Reuse these before building anything new. Each ships with its own spec.

| Component | Purpose | Notes |
| --- | --- | --- |
| `DataTable` | Tabular lists (requests, partners, members, vendors) | Sortable + filterable except the Actions column; server-side pagination at 30/page; honors Required states below |
| `EmptyState` | Zero-data placeholder | Icon + headline + one action; shared across every list |
| `StatusBadge` | Request / org / membership status | Token-driven color per status; never bare text color |
| `RequestCard` | Summary of one request in a feed | Status badge + routed-vendor + age; tap → detail |
| `RoleSwitcher` | Acting-role selector (operations + multi-org users) | Typeahead; reflects the role model in #roles--permissions |
| `InviteRedeemForm` | Accept an org invite | Reads invite token, resolves org + role, hands off to the session |
| `RequestTimeline` | Per-request status history | Append-only events: raised → triaged → routed → fulfilled → closed |
| `Toast` (`useToast`) | Transient success/error feedback | Required after every user-facing action; never silent |
| `ConfirmDialog` | Destructive / irreversible actions | Required for deactivate, archive, withdraw |

We'd rather avoid a bare native `<select>` — the Material autocomplete (typeahead) pattern
is preferred for any choice with more than a handful of options.

## Layout & responsive rules

Mobile-first; the primary breakpoints are the `--breakpoint-*` tokens (`sm`, `md`, `lg`).
The app has three independent route-group shells with no shared parent — public (`/`),
the org workspace (`/app`), and the operations console (`/admin`) — each owns its own
chrome, navigation, and guards. List → detail is the dominant pattern; detail views are
single-column on `sm`, two-column (content + side rail) from `md` up. Primary actions are
reachable without horizontal scroll at every breakpoint.

## Required states

The intent is for every user-facing surface to cover all four states (so it's not a
per-screen call):

- **Empty** — shared `EmptyState` with a relevant action (never a blank panel).
- **Loading** — skeleton placeholders matching the loaded layout (no layout shift).
- **Error** — inline error region plus a `Toast`; offer retry where the action is safe to repeat.
- **Disabled / in-flight** — the trigger control is disabled while its action is in flight,
  re-enabled on completion or failure; double-submit is impossible.

A list surface additionally distinguishes "empty because no data" from "empty because a
filter excluded everything."

## Accessibility baseline

Semantic HTML first; ARIA only to fill gaps. Every interactive control is keyboard
operable with a visible focus ring (`--color-focus`). Form fields have programmatic
labels and inline, announced error text. Color is never the sole carrier of meaning —
status pairs a token color with a label or icon. Targets meet a minimum touch size on
`sm`. Accessibility trade-offs are escalated, never decided silently in a component.

## Voice & microcopy

Plain, direct, second person. Button labels name the action (`Submit request`,
`Route to vendor`, `Withdraw`) — never `OK`/`Submit` alone. Errors say what happened and
what to do next, never blame the user. No internal jargon in user-facing copy (say
"request", not "ticket" or "work item"). Empty states are encouraging, not apologetic.

## Roles & permissions

Six roles in one model. `visitor` is the unauthenticated public; four **org roles** operate
the `/app` workspace; one platform role operates the `/admin` console. Gating is enforced
in three layers — route guards, navigation, and in-component — and **re-checked server-side**
(`design-philosophy.md#layering--boundaries`).

| Capability | visitor | member | coordinator | admin | owner | superadmin |
| --- | :--: | :--: | :--: | :--: | :--: | :--: |
| Browse public partner directory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View org's requests | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Raise a request | — | view-only | ✅ | ✅ | ✅ | — |
| Edit / withdraw a request | — | — | ✅ | ✅ | ✅ | — |
| Manage org profile | — | — | — | ✅ | ✅ | — |
| Manage org members & invites | — | — | — | ✅ | ✅ | — |
| Triage / route / fulfill any request | — | — | — | — | — | ✅ |
| Approve / deactivate partner orgs | — | — | — | — | — | ✅ |
| Manage vendor registry | — | — | — | — | — | ✅ |

Effective hierarchy on the org side: `owner` ≈ `admin` > `coordinator` > `member`;
`superadmin` is a separate platform axis (it operates `/admin`, not any org workspace). A
member holds exactly one org role; org membership and acting-role are resolved together by
the session, never inferred client-side.
