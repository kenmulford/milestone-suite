export const meta = {
  name: 'feeder-plan-scenario01-tier',
  description: 'Apples-to-apples token/wall-clock measurement: run feeder plan Steps 3-6 on the PASSING scenario 01 (clean happy-path) with the REAL installed agents. args.config = "baseline" (all-Opus, serial) | "tiered" (Sonnet mechanical + Opus architect, concurrent). Same harness = same token accounting.',
  phases: [
    { title: 'Architect' },
    { title: 'Author' },
    { title: 'Triage' },
    { title: 'Design' },
  ],
}

// ── Config: baseline (pre-optimization) vs tiered (as-shipped levers) ──────────
let _a = args
if (typeof _a === 'string') { try { _a = JSON.parse(_a) } catch (e) { _a = {} } }
const config = (_a && _a.config) === 'tiered' ? 'tiered' : 'baseline'
const MECH_MODEL = config === 'tiered' ? 'sonnet' : 'opus'   // issue-author + reviewers
const CAP = config === 'tiered' ? 4 : 1                       // Step-4/6 fan-out width (1 = serial)
const ARCH_MODEL = 'opus'                                     // architect is the constant in both
const CONFIG_LABEL = config === 'tiered'
  ? 'tiered — author+reviewers=Sonnet, architect=Opus, concurrent cap-4'
  : 'baseline — all agents=Opus, serial (pre-optimization)'

// ── Scenario 01 inputs (clean happy-path; runner runs BLIND — no expected.md) ──
const BRIEF = `goal: Add user-facing CSV export to the existing Reports page.
in-scope:
  - a backend export endpoint that streams the current report's rows as CSV
  - a "Download CSV" action on the Reports page that calls the endpoint and saves the file
  - a per-user rate limit on the export endpoint (exports are expensive)
out-of-scope: new report types or columns; scheduled or emailed exports.
surfaces: the Reports page (UI) + a backend export endpoint.`

const PROJECT_DOCS = `# .project/conventions.md — engineering conventions
- API: REST endpoints under /api/v1/; JSON or streamed bodies; auth required; errors return { "error": "..." } with the correct HTTP status.
- Rate limiting: use the shared RateLimiter middleware (token-bucket). Limited responses return 429 with a Retry-After header. Pattern: src/middleware/rate_limit.py.
- User-facing actions: show a success/error toast via the shared useToast() hook; disable the trigger control while the action is in flight.
- States: empty and error states are required on every user-facing surface.`

const SHARED_KEYS = `sourceGlobs: ["src/**"]
uiSurfaceGlobs: ["src/pages/**", "src/components/**"]
integrationBranch: "develop"
nonNegotiables: ["Python 3.11 backend; React 18 frontend"]`

const GROUND = `This is a PLANNING-ONLY run against the provided text (read-only; no GitHub writes, author no code). Ground ONLY on the brief, the project docs, and the shared keys quoted below. The target repo source is NOT available to open in this run — assess against the provided text; do not wander the filesystem.`

// ── Schemas ───────────────────────────────────────────────────────────────────
const ARCH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['candidates', 'edges', 'waves', 'product_gaps'],
  properties: {
    candidates: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['tag', 'title', 'surface', 'risk', 'sketch'],
      properties: { tag: { type: 'string' }, title: { type: 'string' },
        surface: { type: 'string', enum: ['ui', 'logic'] }, risk: { type: 'string', enum: ['light', 'heavy'] },
        sketch: { type: 'string' } } } },
    edges: { type: 'array', items: { type: 'string' } },
    waves: { type: 'array', items: { type: 'string' } },
    product_gaps: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['gap', 'why_blocked', 'brief_ref', 'blocks'],
      properties: { gap: { type: 'string' }, why_blocked: { type: 'string' }, brief_ref: { type: 'string' },
        blocks: { type: 'array', items: { type: 'string' } } } } },
  },
}
const AUTHOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['status', 'issue_tag', 'title'],
  properties: { status: { type: 'string', enum: ['AUTHORED', 'PRODUCT_GAP'] },
    issue_tag: { type: 'string' }, title: { type: 'string' },
    issue_body: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } } },
}
const GAP_ITEM = { type: 'object', additionalProperties: false,
  properties: { lens: { type: 'string' }, severity: { type: 'string' }, type: { type: 'string' },
    description: { type: 'string' }, to_clear: { type: 'string' } } }
const TRIAGE_SCHEMA = { type: 'object', additionalProperties: false, required: ['issue', 'needs_design_review', 'gaps'],
  properties: { issue: { type: 'string' }, depends_on: { type: 'array', items: { type: 'string' } },
    needs_design_review: { type: 'boolean' }, gaps: { type: 'array', items: GAP_ITEM } } }
const DESIGN_SCHEMA = { type: 'object', additionalProperties: false, required: ['issue', 'gaps'],
  properties: { issue: { type: 'string' }, gaps: { type: 'array', items: GAP_ITEM } } }

async function capped(items, fn, cap) {
  const step = Math.max(1, cap)   // guard: cap<=0 would never advance the loop (hang)
  const out = []
  for (let i = 0; i < items.length; i += step) {
    const batch = items.slice(i, i + step)
    const res = await parallel(batch.map((it, j) => () => fn(it, i + j)))
    out.push(...res)
  }
  return out
}
const isBlocker = (gaps) => (gaps || []).some(g => (g.severity || '').toLowerCase() === 'blocker')
const edgesFor = (tag, edges) => (edges || []).filter(e => e.includes(tag))

log(`CONFIG: ${CONFIG_LABEL}`)

phase('Architect')
const arch = await agent(`${GROUND}

You are the milestone-feeder ARCHITECT (Step 3 of /milestone-feeder:plan). Decompose this brief into the smallest set of independent ~1-PR candidate issues, build the dependency graph + Wave order, and separate PRODUCT gaps (no conventional default) from design decisions the project docs answer (resolve + cite those).

NORMALIZED BRIEF:
${BRIEF}

PROJECT DOCS:
${PROJECT_DOCS}

RESOLVED SHARED KEYS:
${SHARED_KEYS}

issueSize: ~1 PR each, independently buildable. productGaps carried from Step 2: none.

Return CANDIDATES (tag like #A, title, surface ui|logic, risk, sketch grounded in .project), EDGES, WAVES, PRODUCT_GAPS (blocks: [] when not candidate-specific).`,
  { agentType: 'milestone-feeder:architect', model: ARCH_MODEL, phase: 'Architect', label: 'architect', schema: ARCH_SCHEMA })

if (!arch || !(arch.candidates || []).length) { log('Architect produced no candidates — aborting.'); return { config, error: 'no candidates' } }
const candidates = arch.candidates
log(`Architect → ${candidates.length} candidates, ${(arch.product_gaps||[]).length} product gap(s).`)

phase('Author')
const waveText = (arch.waves || []).join('\n')
const authored = await capped(candidates, (c) => agent(`${GROUND}

You are the milestone-feeder ISSUE-AUTHOR (Step 4). Author ONE issue's full spec (Summary / Acceptance criteria / Design / Dependencies / Classification), engineered to pass triage clean (GAPS: none). Record every design call against the project docs and CITE it. For a UI issue enumerate happy + empty + error + disabled states, name the pattern to mirror, include a11y labels. If a required decision has no conventional default, return status PRODUCT_GAP (do not invent scope).

CANDIDATE: ${c.tag} — "${c.title}"  [surface: ${c.surface}, risk: ${c.risk}]
SKETCH: ${c.sketch}

BRIEF:
${BRIEF}

PROJECT DOCS:
${PROJECT_DOCS}

RESOLVED SHARED KEYS:
${SHARED_KEYS}

Edges naming this candidate: ${edgesFor(c.tag, arch.edges).join(' | ') || 'none'}

Return status, issue_tag, title, issue_body, labels.`,
  { agentType: 'milestone-feeder:issue-author', model: MECH_MODEL, phase: 'Author', label: `author:${c.tag}`, schema: AUTHOR_SCHEMA }), CAP)

const ok = authored.filter(Boolean).filter(a => a.status === 'AUTHORED')
const gaps = authored.filter(Boolean).filter(a => a.status === 'PRODUCT_GAP')
const droppedAuthors = candidates.length - ok.length - gaps.length
if (droppedAuthors > 0) log(`WARNING: ${droppedAuthors} author dispatch(es) returned null (skipped/died) — outcome counts won't sum to ${candidates.length}.`)
log(`Authors → ${ok.length} AUTHORED, ${gaps.length} PRODUCT_GAP (of ${candidates.length}).`)

phase('Triage')
const triaged = await capped(ok, (a) => agent(`${GROUND}

You are the milestone-driver TRIAGE-REVIEWER running the feeder self-check gate (read-only, against the generated text). Assess buildability across the five criteria (Consistency, Buildability, Completeness, Dependencies, UI-flag). Default to flagging; unsure → Blocker.

GENERATED ISSUE — ${a.issue_tag}: "${a.title}"
ISSUE BODY:
${a.issue_body || '(empty)'}

Recorded design decisions: EMPTY (no GitHub issue exists yet — do not treat the empty set as a gap).
Milestone description (Wave order): ${waveText || '(single wave)'}
Profile: sourceGlobs ["src/**"]; uiSurfaceGlobs ["src/pages/**","src/components/**"]; nonNegotiables ["Python 3.11 backend; React 18 frontend"].

Return issue, depends_on, needs_design_review (true for a UI issue), gaps (each lens/severity/type/description/to_clear; empty = GAPS: none).`,
  { agentType: 'milestone-driver:triage-reviewer', model: MECH_MODEL, phase: 'Triage', label: `triage:${a.issue_tag}`, schema: TRIAGE_SCHEMA }).then(v => ({ a, v })), CAP)

phase('Design')
const needDesign = triaged.filter(Boolean).filter(t => t.v && t.v.needs_design_review)
const designed = await capped(needDesign, (t) => agent(`${GROUND}

You are the milestone-driver DESIGN-REVIEWER running the feeder self-check gate (read-only). Assess whether this UI issue's recorded design is specified to build a correct result: names the pattern to mirror (file:line), required states (empty/loading/error/disabled), affordances, and a11y labels. Missing required state/affordance = Blocker.

GENERATED ISSUE — ${t.a.issue_tag}: "${t.a.title}"
ISSUE BODY:
${t.a.issue_body || '(empty)'}
Pointers to existing UI surfaces (uiSurfaceGlobs): ["src/pages/**","src/components/**"] (not openable here; assess against provided text).

Return issue and gaps (empty = GAPS: none).`,
  { agentType: 'milestone-driver:design-reviewer', model: MECH_MODEL, phase: 'Design', label: `design:${t.a.issue_tag}`, schema: DESIGN_SCHEMA }).then(v => ({ a: t.a, v })), CAP)

const designByTag = {}
for (const d of designed.filter(Boolean)) designByTag[d.a.issue_tag] = d.v
let passed = 0, failed = 0
for (const t of triaged.filter(Boolean)) {
  if (!t.v) { failed++; continue }   // triage returned no verdict (agent skipped/died) — not a clean pass
  const fail = isBlocker(t.v.gaps) || isBlocker(designByTag[t.a.issue_tag] && designByTag[t.a.issue_tag].gaps)
  if (fail) failed++; else passed++
}

const dispatches = { architect: 1, author: candidates.length, triage: ok.length, design: needDesign.length,
  total: 1 + candidates.length + ok.length + needDesign.length }
log(`DONE ${config} → dispatches total=${dispatches.total} (arch 1 / author ${dispatches.author} / triage ${dispatches.triage} / design ${dispatches.design}); gate PASS ${passed} / FAIL ${failed}; product-gaps ${gaps.length}.`)

return { config: CONFIG_LABEL, dispatches, outcome: { candidates: candidates.length, authored: ok.length, productGaps: gaps.length, gatePass: passed, gateFail: failed } }
