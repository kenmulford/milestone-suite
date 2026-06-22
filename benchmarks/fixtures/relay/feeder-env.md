# Test environment — Relay rich-grounding fixture

The config a run against this fixture assumes. Models a repo where the apps are nested
under `siteroot/` (`siteroot/web` frontend, `siteroot/api` backend) while the configs and
house docs live at the **project root** — so the globs carry the `siteroot/` prefix
(see the tooling caveat in `README.md`).

- **`.milestone-config/feeder.json`**: `projectDocs: "project/"` (this fixture uses the
  dotless `project/` so the docs aren't hidden; the runtime default is `.project/`),
  `reviewer: "milestone-driver"`.
- **Driver shared keys** (`.milestone-config/driver.json`):
  - `sourceGlobs: ["siteroot/web/**", "siteroot/api/**"]`
  - `uiSurfaceGlobs: ["siteroot/web/**"]`  — the Angular frontend is the UI surface; the
    API is logic. This is what makes the frontend issues classify UI (design-lens review +
    visual sign-off) and the API issues classify logic.
  - `integrationBranch: "develop"`, `protectedBranch: "main"`
  - `nonNegotiables: ["Angular 22 frontend (Cloudflare Pages); .NET ASP.NET Core API + EF Core on PostgreSQL (Azure App Services); Microsoft Entra ID / Azure AD B2C for identity"]`
