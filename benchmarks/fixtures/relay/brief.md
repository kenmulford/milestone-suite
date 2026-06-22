# Brief: stand up partner-request intake and the operations approval workflow

Build the first end-to-end slice of Relay: a partner-org user can raise a request, see
their org's requests, and the operations team can triage and route each one.

## In scope

- A **request-intake form** in the org workspace (`/app`) for raising a new request.
- An **org request list** showing that org's requests with their current status.
- An **operations approval queue** in the console (`/admin`) where the operations team
  triages a request and routes it to a vendor.
- **Role-aware workspace navigation** and acting-role resolution so each signed-in user
  lands on the right surface for their role.
- The **request API** behind these surfaces: raise, list (scoped to the caller's org),
  and route.
- A **per-user rate limit** on the raise endpoint (raising is comparatively expensive).
- **Invite redemption → session**: a partner-org user accepts an invite and ends up
  signed in with their org and role resolved.

## Out of scope

- Vendor-facing surfaces; vendor self-service.
- The public partner directory (covered separately).
- Email notification delivery (the events are emitted; the transport is a later slice).
- Reporting / exports.

## Notes

Relay is invite-gated and two-sided: partner orgs raise requests on behalf of the people
they serve; the operations team triages and routes. Ground the design and the build on
the project's standing docs — don't restate them here, and don't invent where a doc
already answers it.
