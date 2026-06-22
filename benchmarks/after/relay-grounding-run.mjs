#!/usr/bin/env node
/*
 * Grounding measurement — whole-file vs anchored `.project/` retrieval.
 *
 * Quantifies the INPUT-token cost of how house docs get inlined into the feeder/driver
 * fan-out, on the rich Relay fixture (`benchmarks/fixtures/relay/`).
 *
 * This is NOT a live agent run. The grounding lever is a deterministic input-accounting
 * property: in WHOLE-FILE retrieval every grounded dispatch inlines the entire `.project/`
 * set; in ANCHORED retrieval each dispatch inlines only the `##` sections its issue cites.
 * Running live agents would measure the same delta with model-behavior noise and ~1M tokens
 * of cost while changing nothing about the delta — so we account for it directly instead.
 * (Contrast the live tiering harness `scenario01-tier-run.mjs`, where model cost on real
 * work genuinely required live dispatches.)
 *
 * Anchored slices are extracted with the driver's REAL primitive
 * (`milestone-driver/scripts/read-doc-section.sh`) — dogfooding the shipped mechanism —
 * falling back to an equivalent internal `##`-section splitter if the sibling repo is absent.
 *
 * Token figures are estimated as ceil(chars / 4). The headline RATIO (anchored vs whole-file)
 * is robust to the SCALE of any character-linear estimator — the per-character rate cancels in
 * the ratio — but NOT to a change in tokenization SHAPE (a real BPE tokenizer could shift it by
 * a comparable margin; a word-count estimator already moves it ~8.5x → ~7.6x). Swap `estTokens`
 * for a `count_tokens` call for exact, shape-faithful figures.
 *
 * Run:  node benchmarks/after/relay-grounding-run.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')
const PROJECT_DIR = join(REPO, 'benchmarks/fixtures/relay/project')
const READ_SECTION = resolve(REPO, '../milestone-driver/scripts/read-doc-section.sh')

const estTokens = (s) => Math.ceil(s.length / 4)

// ── whole-file payload: the entire .project/ doc set (every grounded dispatch inlines this) ──
// whole-file inlines the entire .project/ dir (prose docs + tokens.json); anchored cites only .md sections
const docFiles = readdirSync(PROJECT_DIR).filter((f) => /\.(md|json)$/.test(f)).sort()
const wholeText = docFiles.map((f) => readFileSync(join(PROJECT_DIR, f), 'utf8')).join('\n')
const T_whole = estTokens(wholeText)

// ── anchored extraction: prefer the driver's real primitive, else an equivalent splitter ──
const usePrimitive = existsSync(READ_SECTION)
function extractSection(doc, heading) {
  const path = join(PROJECT_DIR, doc)
  if (usePrimitive) {
    try {
      return execFileSync('bash', [READ_SECTION, path, heading], { encoding: 'utf8' })
    } catch (e) {
      console.error(`ANCHOR MISS (fail-closed) ${doc}#${heading}: ${String(e.stderr || e.message).trim()}`)
      process.exit(1)
    }
  }
  // fallback: read the matched "## <heading>" through the line before the next same/higher heading
  const lines = readFileSync(path, 'utf8').split('\n')
  const start = lines.findIndex((l) => l.replace(/^#+\s*/, '').trim() === heading && /^##\s/.test(l))
  if (start < 0) { console.error(`ANCHOR MISS (fail-closed) ${doc}#${heading}: heading not found`); process.exit(1) }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) { if (/^#{1,2}\s/.test(lines[i])) { end = i; break } }
  return lines.slice(start, end).join('\n')
}
const sliceCache = new Map()
const sliceTokens = (doc, h) => {
  const k = `${doc}#${h}`
  if (!sliceCache.has(k)) sliceCache.set(k, estTokens(extractSection(doc, h)))
  return sliceCache.get(k)
}

// ── realistic decomposition (from the fixture's expected.md): issue → surface + cited anchors ──
// Anchor heading text matches the `##` headings in the fixture docs exactly (the primitive
// matches case-sensitively and fails closed on drift).
const ISSUES = [
  { tag: 'intake-form',    surface: 'ui',    cites: [['design-system.md', 'Required states'], ['design-system.md', 'Component inventory'], ['design-system.md', 'Roles & permissions']] },
  { tag: 'request-list',   surface: 'ui',    cites: [['design-system.md', 'Component inventory'], ['design-system.md', 'Required states']] },
  { tag: 'approval-queue', surface: 'ui',    cites: [['design-system.md', 'Roles & permissions'], ['design-system.md', 'Required states'], ['design-system.md', 'Component inventory']] },
  { tag: 'role-nav',       surface: 'ui',    cites: [['design-system.md', 'Roles & permissions'], ['design-philosophy.md', 'Layering & boundaries'], ['conventions.md', 'Canonical exemplars']] },
  { tag: 'request-api',    surface: 'logic', cites: [['conventions.md', 'File & folder layout'], ['library-manifest.md', 'Approved libraries (by purpose)'], ['environment.md', 'Data stores']] },
  { tag: 'rate-limit',     surface: 'logic', cites: [['design-philosophy.md', 'Error & failure philosophy'], ['library-manifest.md', 'Approved libraries (by purpose)']] },
  { tag: 'invite-session', surface: 'logic', cites: [['environment.md', 'External services & integrations'], ['design-philosophy.md', 'One-way doors']] },
]

// grounded dispatches per issue: issue-author + triage-reviewer (+ design-reviewer for a UI surface)
const consumersOf = (surface) => 2 + (surface === 'ui' ? 1 : 0)

let wholeTotal = 0, anchoredTotal = 0, dispatchTotal = 0
const rows = ISSUES.map((it) => {
  const consumers = consumersOf(it.surface)
  const seen = new Set()
  let perDispatch = 0
  for (const [doc, h] of it.cites) { const k = `${doc}#${h}`; if (seen.has(k)) continue; seen.add(k); perDispatch += sliceTokens(doc, h) }
  wholeTotal += consumers * T_whole
  anchoredTotal += consumers * perDispatch
  dispatchTotal += consumers
  return { tag: it.tag, surface: it.surface, consumers, sections: seen.size, perDispatch }
})

const pct = (x) => `${(100 * x).toFixed(1)}%`
const cut = 1 - anchoredTotal / wholeTotal

console.log(`\nGrounding measurement — Relay fixture (${docFiles.length} docs, whole-file = ${T_whole} est-tokens)`)
console.log(`anchored extraction: ${usePrimitive ? 'milestone-driver/scripts/read-doc-section.sh (real primitive)' : 'internal fallback splitter'}`)
console.log(`token figures are est = ceil(chars/4); the cut % is robust to a char-linear estimator's scale, not its tokenization shape\n`)
console.log(`issue            surface  groundedDispatches  citedSections  anchoredTokens/dispatch`)
for (const r of rows) {
  console.log(`${r.tag.padEnd(16)} ${r.surface.padEnd(7)}  ${String(r.consumers).padEnd(18)}  ${String(r.sections).padEnd(13)}  ${r.perDispatch}`)
}
console.log(`\n— totals across ${dispatchTotal} grounded downstream dispatches (architect excluded: 1 constant dispatch that needs broad context in both modes) —`)
console.log(`whole-file grounding input:  ${wholeTotal.toLocaleString()} est-tokens  (every dispatch inlines all ${docFiles.length} docs)`)
console.log(`anchored   grounding input:  ${anchoredTotal.toLocaleString()} est-tokens  (each dispatch inlines only its cited sections)`)
console.log(`reduction:                   ${pct(cut)}  (anchored uses ${(wholeTotal / anchoredTotal).toFixed(1)}x fewer grounding-input tokens)\n`)

// machine-readable summary for downstream tooling / RESULTS capture
console.log(JSON.stringify({
  docs: docFiles.length, wholeFileTokens: T_whole, groundedDispatches: dispatchTotal,
  wholeTotal, anchoredTotal, reductionPct: Number((100 * cut).toFixed(1)),
  estimator: 'ceil(chars/4)', anchoredExtraction: usePrimitive ? 'read-doc-section.sh' : 'fallback',
}))
