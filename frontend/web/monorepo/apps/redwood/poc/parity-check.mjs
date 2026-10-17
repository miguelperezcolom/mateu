// CI: the Redwood row of parity.md tells the truth. See coverage.mjs.
// Usage: node parity-check.mjs           → checks (exits ≠ 0 if something does not add up)
//        node parity-check.mjs --write   → regenerates the parity.md section from coverage.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { REDWOOD_COVERAGE, coverageTable } from './coverage.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..', '..', '..', '..', '..')
const wireFile = join(repo, 'backend/shared/uidl/wire-schema.json')
const parityFile = join(repo, 'doc/src/content/docs/reference/parity.md')
const START = '<!-- redwood-coverage:start -->'
const END = '<!-- redwood-coverage:end -->'

/**
 * The wire's types, from the generated wire-schema.json: the ComponentMetadataDto discriminators,
 * split into those some server produces and the deprecated ones (registered, nobody produces them:
 * painting them is not required).
 */
export function wireTypesOf(schemaJson) {
  const defs = JSON.parse(schemaJson).$defs
  const produced = [], deprecated = []
  for (const { $ref } of defs.ComponentMetadataDto.oneOf) {
    const def = defs[$ref.split('/').pop()]
    ;(def.deprecated ? deprecated : produced).push(def.properties.type.const)
  }
  return { produced, deprecated }
}

/** The coverage problems (pure: test-pms.mjs tests it). */
export function coverageProblems({ wireTypes, deprecated = [], coverage, source, parity }) {
  const problems = []
  for (const t of wireTypes) if (!coverage[t]) problems.push(`wire type ${t} is not classified in coverage.mjs`)
  for (const t of Object.keys(coverage)) if (!wireTypes.includes(t) && !deprecated.includes(t)) problems.push(`coverage.mjs lists ${t}, which the wire does not have`)
  for (const [t, c] of Object.entries(coverage)) {
    const branch = `t === '${t}'`
    const evidence = c.via || branch
    if ((c.status === 'full' || c.status === 'partial') && !source.includes(evidence)) {
      problems.push(`${t} is claimed ${c.status} but the renderer has no ${evidence}`)
    }
    if (c.status === 'none' && source.includes(branch)) {
      problems.push(`${t} is marked none but the renderer has ${branch} — update coverage.mjs`)
    }
  }
  if (parity != null) {
    const a = parity.indexOf(START), b = parity.indexOf(END)
    if (a < 0 || b < 0) problems.push(`parity.md has no ${START} … ${END} section`)
    else if (parity.slice(a + START.length, b).trim() !== coverageTable(coverage).trim()) {
      problems.push('the Redwood coverage section of parity.md is stale — run node poc/parity-check.mjs --write')
    }
  }
  return problems
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const { produced: wireTypes, deprecated } = wireTypesOf(readFileSync(wireFile, 'utf8'))
  // the core is split by surface into core/*.mjs (reduceContexts.mjs re-exports them)
  const coreDir = join(here, 'core')
  const source = [join(here, 'reduceContexts.mjs'),
    ...readdirSync(coreDir).filter((f) => f.endsWith('.mjs')).sort().map((f) => join(coreDir, f))]
    .map((f) => readFileSync(f, 'utf8')).join('\n')
  let parity = readFileSync(parityFile, 'utf8')
  if (process.argv.includes('--write')) {
    const a = parity.indexOf(START), b = parity.indexOf(END)
    if (a < 0 || b < 0) { console.error(`parity.md needs the ${START} … ${END} markers`); process.exit(2) }
    parity = parity.slice(0, a + START.length) + '\n' + coverageTable() + '\n' + parity.slice(b)
    writeFileSync(parityFile, parity)
    console.log('parity.md: Redwood coverage section regenerated')
  }
  const problems = coverageProblems({ wireTypes, deprecated, coverage: REDWOOD_COVERAGE, source, parity })
  if (problems.length) {
    console.error(problems.map((p) => '  ✗ ' + p).join('\n'))
    process.exit(1)
  }
  console.log(`Redwood coverage OK (${wireTypes.length} produced wire types + ${deprecated.length} deprecated, parity.md in sync)`)
}
