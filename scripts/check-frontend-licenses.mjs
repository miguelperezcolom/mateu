#!/usr/bin/env node
/**
 * Fails when a package that ends up in a shipped web bundle is not under an approved open-source
 * licence.
 *
 * Why: the vaadin-lit jar is Apache-2.0, and for a long time it shipped @vaadin/board and
 * @vaadin/rich-text-editor (Vaadin Commercial License) plus a Highcharts chunk — nobody had
 * checked. Licences are a property of the dependency TREE, so they are checked there: every
 * production dependency of the bundle entry packages, followed transitively through node_modules
 * (devDependencies are build tools and never reach the bundle).
 *
 * Usage: node scripts/check-frontend-licenses.mjs   (from the repo root; needs `npm ci` done in
 * frontend/web/monorepo)
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'web', 'monorepo')

// The packages whose production dependencies are bundled into what we publish.
const ENTRIES = ['apps/vaadin', 'libs/mateu']

// SPDX identifiers compatible with shipping inside an Apache-2.0 artifact.
const ALLOWED = new Set([
  'MIT', 'MIT-0', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'ISC', 'BlueOak-1.0.0',
  'CC0-1.0', 'Unlicense', 'Python-2.0', 'CC-BY-4.0', 'UPL-1.0', 'Zlib', 'MPL-2.0',
])

// Reviewed one by one: licences that are not plain SPDX but are fine to ship, and the condition
// that keeps them fine. Adding an entry here is a reviewed change.
const REVIEWED = {
  // MIT plus one condition: the bpmn.io watermark on rendered diagrams must stay visible and not be
  // overlapped. mateu-bpmn does not hide or restyle it — keep it that way.
  'bpmn-js': 'bpmn.io License (MIT + keep the bpmn.io watermark visible)',
}

// Declared as RUNTIME dependencies by a bundled package but never imported by the bundle (a
// package's sloppy dependency list): their subtree is not walked. Each one with its reason.
const NOT_BUNDLED = {
  // @vaadin-component-factory/vcf-date-range-picker lists its dev server as a dependency; the
  // picker never imports it, and Vite only bundles what is imported.
  '@web/dev-server': 'dev server listed as a runtime dependency of vcf-date-range-picker',
}

const licenceOf = (pkg) => {
  const l = pkg.license ?? pkg.licenses
  if (typeof l === 'string') return l
  if (Array.isArray(l)) return l.map((x) => (typeof x === 'string' ? x : x.type)).join(' OR ')
  if (l && typeof l === 'object') return l.type
  return 'UNKNOWN'
}

// "MIT OR Apache-2.0" passes if ANY alternative is allowed; "(A AND B)" needs all of them.
const allowed = (expr) => {
  const clean = expr.replace(/[()]/g, ' ').trim()
  return clean.split(/\s+OR\s+/).some((alt) => alt.split(/\s+AND\s+/).every((id) => ALLOWED.has(id.trim())))
}

// Node's resolution: look for node_modules/<name> from the requiring package upwards.
const resolve = (name, fromDir) => {
  let dir = fromDir
  for (;;) {
    const candidate = join(dir, 'node_modules', name, 'package.json')
    if (existsSync(candidate)) return candidate
    if (dir === root || dir === dirname(dir)) return null
    dir = dirname(dir)
  }
}

const seen = new Map()
const problems = []
const unresolved = []
const visit = (pkgJsonPath, via) => {
  if (seen.has(pkgJsonPath)) return
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
  seen.set(pkgJsonPath, pkg.name)
  const isEntry = ENTRIES.some((e) => pkgJsonPath === join(root, e, 'package.json'))
  if (NOT_BUNDLED[pkg.name]) return
  if (!isEntry) {
    const licence = licenceOf(pkg)
    if (!allowed(licence) && !REVIEWED[pkg.name]) problems.push(`${pkg.name}@${pkg.version}  ${licence}  (via ${via})`)
  }
  for (const dep of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.optionalDependencies ?? {}) })) {
    const target = resolve(dep, dirname(pkgJsonPath))
    if (target) visit(target, isEntry ? pkg.name : `${via} > ${pkg.name}`)
    // a missing install would make the check pass by seeing less; optional deps may legitimately
    // be absent (platform-specific binaries)
    else if (!(pkg.optionalDependencies ?? {})[dep]) unresolved.push(`${dep}  (required by ${pkg.name})`)
  }
}

for (const entry of ENTRIES) visit(join(root, entry, 'package.json'), entry)

if (unresolved.length) {
  console.error(`✗ ${unresolved.length} dependency(ies) not installed — run \`npm ci\` for the ${ENTRIES.join(', ')} workspaces first:\n`)
  for (const u of [...new Set(unresolved)].sort()) console.error('  ' + u)
  process.exit(2)
}
if (problems.length) {
  console.error(`✗ ${problems.length} bundled package(s) with a licence not approved for an Apache-2.0 artifact:\n`)
  for (const p of problems.sort()) console.error('  ' + p)
  console.error('\nReplace the package, or — if its licence is in fact compatible — add the SPDX id to ALLOWED in this script, in a reviewed change.')
  process.exit(1)
}
console.log(`✓ ${seen.size - ENTRIES.length} bundled packages, all under approved licences`)
