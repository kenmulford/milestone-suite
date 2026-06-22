export const meta = {
  name: 'feeder-plan-scenario06-after',
  description: 'After-benchmark: run feeder plan Steps 3-6 on scenario 06 with the REAL installed agents at explicit tiers; measure dispatches. args.earlyPark toggles #87 Step-3.5.',
  phases: [
    { title: 'Architect', detail: 'milestone-feeder:architect @ opus (x1)' },
    { title: 'Author', detail: 'milestone-feeder:issue-author @ sonnet (cap-4)' },
    { title: 'Triage', detail: 'milestone-driver:triage-reviewer @ sonnet (cap-4)' },
    { title: 'Design', detail: 'milestone-driver:design-reviewer @ sonnet (cap-4)' },
  ],
}

// ── Config toggle: point 2 (no #87) vs point 3 (#87 early-park) ────────────────
// args may arrive as an object OR a JSON string (the Workflow harness can stringify it).
let _args = args
if (typeof _args === 'string') { try { _args = JSON.parse(_args) } catch (e) { _args = {} } }
const earlyPark = !!(_args && _args.earlyPark === true)
const CONFIG = earlyPark
  ? 'point3 — as-shipped (Sonnet + concurrency + #87 Step-3.5 early-park)'
  : 'point2 — tiering + concurrency, NO #87 (Step-3.5 disabled)'

// ── Scenario 06 inputs (faithful to the fixture; runner runs BLIND — no expected.md) ──
const BRIEF = `goal: Build the admin list pages — one table page per entity, each showing that entity's records with the standard columns for that entity, plus row actions (view / edit / delete).
in-scope: the 10 list pages — Users, Orders, Products, Invoices, Shipments, Refunds, Coupons, Reviews, Support Tickets, Audit Log.
out-of-scope: the detail / edit pages behind the row actions (a separate milestone).
surfaces: 10 admin list pages (UI).`

const PROJECT_DOCS = `# .project/design-system.md — data tables (standing convention)

Every data table in the admin app MUST follow these rules:
- Sortable + filterable columns: every column is sortable and has a column filter, EXCEPT the row-actions column (no sort, no filter on Actions).
- Pagination: server-side pagination at 30 rows per page, with a page-size control defaulting to 30.
- Empty state: when there are no rows, show the shared EmptyState illustration plus a primary CTA relevant to the entity.
- Loading state: skeleton rows while the page loads.
- Reuse the shared DataTable component (src/components/DataTable.tsx) — do not hand-roll tables.`

const SHARED_KEYS = `sourceGlobs: ["src/**"]
uiSurfaceGlobs: ["src/pages/**", "src/components/**"]   (set → page issues classify UI; design-reviewer engages)
integrationBranch: "develop"
nonNegotiables: ["React 18 + TypeScript"]`

const GROUND = `This is a PLANNING-ONLY run against the provided text (read-only; produce no GitHub writes, author no code). Ground ONLY on the brief, the project docs, and the shared keys quoted below. The target repository source (e.g. src/components/DataTable.tsx) is NOT available to open in this run — assess against the provided issue text and project docs; do not wander the surrounding filesystem.`

// ── Schemas (force the agents' native return blocks into structured form) ───────
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
    issue_body: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } },
    product_gap_what: { type: 'string' }, product_gap_why: { type: 'string' } },
}
const GAP_ITEM = { type: 'object', additionalProperties: false,
  properties: { lens: { type: 'string' }, severity: { type: 'string' }, type: { type: 'string' },
    description: { type: 'string' }, to_clear: { type: 'string' } } }
const TRIAGE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['issue', 'needs_design_review', 'gaps'],
  properties: { issue: { type: 'string' }, depends_on: { type: 'array', items: { type: 'string' } },
    needs_design_review: { type: 'boolean' }, gaps: { type: 'array', items: GAP_ITEM } },
}
const DESIGN_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['issue', 'gaps'],
  properties: { issue: { type: 'string' }, gaps: { type: 'array', items: GAP_ITEM } },
}

// ── cap-4 batched fan-out (faithful to the skill's "rolling window / batches", cap W=4) ──
async function capped(items, fn, cap) {
  const out = []
  for (let i = 0; i < items.length; i += cap) {
    const batch = items.slice(i, i + cap)
    const res = await parallel(batch.map((it, j) => () => fn(it, i + j)))
    out.push(...res)
  }
  return out
}
const isBlocker = (gaps) => (gaps || []).some(g => (g.severity || '').toLowerCase() === 'blocker')
const edgesFor = (tag, edges) => (edges || []).filter(e => e.includes(tag))

log(`CONFIG: ${CONFIG}`)

// ── Step 3 — architect (x1, opus) ─────────────────────────────────────────────
phase('Architect')
const arch = await agent(`${GROUND}

You are the milestone-feeder ARCHITECT (Step 3 of /milestone-feeder:plan). Decompose this brief into the smallest set of independent ~1-PR candidate issues, build the dependency graph + Wave order, and separate PRODUCT gaps (a decision with NO conventional default that the project docs / a stated convention cannot answer — never guessed) from design decisions the project docs DO answer (resolve + cite those).

NORMALIZED BRIEF:
${BRIEF}

PROJECT DOCS (the standing conventions to ground on):
${PROJECT_DOCS}

RESOLVED SHARED KEYS:
${SHARED_KEYS}

issueSize: ~1 PR each, independently buildable.
productGaps carried from Step 2: none.

Return CANDIDATES (tag like #A, title, surface ui|logic, risk light|heavy, sketch with the .project ref grounding its design), EDGES, WAVES, and PRODUCT_GAPS. For each PRODUCT_GAP set blocks: to the candidate tags that gap blocks (or [] if it is a broad decision tied to no specific candidate).`,
  { agentType: 'milestone-feeder:architect', model: 'opus', phase: 'Architect', label: 'architect', schema: ARCH_SCHEMA })

if (!arch || !arch.candidates || arch.candidates.length === 0) {
  log('Architect returned no candidates — aborting run.')
  return { config: CONFIG, error: 'architect produced no candidates', arch }
}
const allCandidates = arch.candidates
const productGaps = arch.product_gaps || []

// ── Step 3.5 — early park (point 3 only) ──────────────────────────────────────
const parked = new Set()
if (earlyPark) {
  for (const g of productGaps) for (const t of (g.blocks || [])) parked.add(t)
  // drop transitive dependents of a pre-parked candidate (a dependent of a parked issue cannot build)
  let changed = true
  while (changed) {
    changed = false
    for (const e of (arch.edges || [])) {
      // edge form: "#B depends_on #A — reason"
      const m = e.match(/(#\w+)\s+depends_on\s+(#\w+)/i)
      if (m && parked.has(m[2]) && !parked.has(m[1])) { parked.add(m[1]); changed = true }
    }
  }
}
const fanCandidates = allCandidates.filter(c => !parked.has(c.tag))
log(`Architect → ${allCandidates.length} candidates, ${productGaps.length} product gap(s). earlyPark=${earlyPark} → ${parked.size} pre-parked, fan out over ${fanCandidates.length}.`)

// ── Step 4 — issue-author per candidate (sonnet, cap-4) ───────────────────────
phase('Author')
const waveText = (arch.waves || []).join('\n')
const authored = await capped(fanCandidates, (c) => agent(`${GROUND}

You are the milestone-feeder ISSUE-AUTHOR (Step 4). Author ONE issue's full specification (Summary / Acceptance criteria / Design / Dependencies / Classification), engineered to pass the driver's triage clean (GAPS: none). Record every design call against the project docs and CITE it (.project/design-system.md#<section> or a sibling file:line). For a UI issue enumerate happy + empty + error/failure + disabled states, name the existing pattern to mirror, and include accessibility labels. If a decision the acceptance criteria require has NO conventional default and the project docs / a stated convention cannot answer it, return status PRODUCT_GAP — do NOT invent scope.

CANDIDATE: ${c.tag} — "${c.title}"  [surface: ${c.surface}, risk: ${c.risk}]
SKETCH: ${c.sketch}

BRIEF:
${BRIEF}

PROJECT DOCS:
${PROJECT_DOCS}

RESOLVED SHARED KEYS:
${SHARED_KEYS}

Edges naming this candidate: ${edgesFor(c.tag, arch.edges).join(' | ') || 'none'}

Return status (AUTHORED|PRODUCT_GAP), issue_tag, title, issue_body, labels (and product_gap_what / product_gap_why when PRODUCT_GAP).`,
  { agentType: 'milestone-feeder:issue-author', model: 'sonnet', phase: 'Author', label: `author:${c.tag}`, schema: AUTHOR_SCHEMA }), 4)

const authoredOk = authored.filter(Boolean).filter(a => a.status === 'AUTHORED')
const authorGaps = authored.filter(Boolean).filter(a => a.status === 'PRODUCT_GAP')
log(`Authors → ${authoredOk.length} AUTHORED, ${authorGaps.length} returned PRODUCT_GAP (of ${fanCandidates.length} dispatched).`)

// ── Step 6 Pass 1 — triage-reviewer per generated issue (sonnet, cap-4) ────────
phase('Triage')
const triaged = await capped(authoredOk, (a) => agent(`${GROUND}

You are the milestone-driver TRIAGE-REVIEWER running the feeder self-check gate (read-only, against the provided generated issue text — make no gh call). Assess whether this generated issue is buildable as written, across the five criteria (Consistency, Buildability, Completeness, Dependencies, UI-flag). Default to flagging: a genuinely unsure call escalates to a Blocker.

GENERATED ISSUE — ${a.issue_tag}: "${a.title}"
ISSUE BODY:
${a.issue_body || '(empty)'}

Recorded design decisions: EMPTY (no GitHub issue exists yet — there are no comments / design-cleared notes; do not treat the empty set as a gap in itself).

Milestone description (Wave order, local slugs — the dependency context):
${waveText || '(single wave)'}

Profile: sourceGlobs ["src/**"]; uiSurfaceGlobs ["src/pages/**","src/components/**"]; nonNegotiables ["React 18 + TypeScript"].

Return issue, depends_on, needs_design_review (true when this is a UI issue under uiSurfaceGlobs), and gaps (each: lens, severity Blocker|Advisory, type, description, to_clear). Empty gaps array = GAPS: none.`,
  { agentType: 'milestone-driver:triage-reviewer', model: 'sonnet', phase: 'Triage', label: `triage:${a.issue_tag}`, schema: TRIAGE_SCHEMA }).then(v => ({ a, v })), 4)

// ── Step 6 Pass 2 — design-reviewer for NEEDS_DESIGN_REVIEW: yes (sonnet, cap-4) ─
phase('Design')
const needDesign = triaged.filter(Boolean).filter(t => t.v && t.v.needs_design_review)
const designed = await capped(needDesign, (t) => agent(`${GROUND}

You are the milestone-driver DESIGN-REVIEWER running the feeder self-check gate (read-only, against the provided generated issue text). Assess whether this UI issue's recorded design is specified well enough to build a correct, acceptable result: does it name the existing pattern to mirror (file:line), the required states (empty/loading/error/disabled), the affordances (e.g. confirm dialog for a destructive op like delete), and accessibility labels? "Will produce a poor result" or a missing required state/affordance is a Blocker.

GENERATED ISSUE — ${t.a.issue_tag}: "${t.a.title}"
ISSUE BODY:
${t.a.issue_body || '(empty)'}

Pointers to existing UI surfaces (uiSurfaceGlobs): ["src/pages/**","src/components/**"] (e.g. the shared src/components/DataTable.tsx named in the project docs — not openable in this run; assess against the provided text).

Return issue and gaps (each: lens, severity Blocker|Advisory, type, description, to_clear). Empty gaps array = GAPS: none.`,
  { agentType: 'milestone-driver:design-reviewer', model: 'sonnet', phase: 'Design', label: `design:${t.a.issue_tag}`, schema: DESIGN_SCHEMA }).then(v => ({ a: t.a, v })), 4)

// ── Aggregate the gate verdict per issue ──────────────────────────────────────
const designByTag = {}
for (const d of designed.filter(Boolean)) designByTag[d.a.issue_tag] = d.v
let passed = 0, failed = 0
for (const t of triaged.filter(Boolean)) {
  const dg = designByTag[t.a.issue_tag]
  const fail = isBlocker(t.v && t.v.gaps) || isBlocker(dg && dg.gaps)
  if (fail) failed++; else passed++
}

const dispatches = {
  architect: 1,
  author: fanCandidates.length,
  triage: authoredOk.length,
  design: needDesign.length,
  total: 1 + fanCandidates.length + authoredOk.length + needDesign.length,
}
log(`DONE ${CONFIG} → dispatches total=${dispatches.total} (arch ${dispatches.architect} / author ${dispatches.author} / triage ${dispatches.triage} / design ${dispatches.design}); gate PASS ${passed} / FAIL ${failed}; pre-parked ${parked.size}; author-product-gaps ${authorGaps.length}.`)

return {
  config: CONFIG,
  earlyPark,
  dispatches,
  outcome: {
    candidates: allCandidates.length,
    productGaps: productGaps.length,
    preParked: parked.size,
    authored: authoredOk.length,
    authorProductGaps: authorGaps.length,
    gatePass: passed,
    gateFail: failed,
  },
  architectGaps: productGaps.map(g => ({ gap: g.gap, blocks: g.blocks })),
}
