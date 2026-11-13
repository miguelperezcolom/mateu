#!/usr/bin/env node
/**
 * Fails when a package that ends up in something we ship is not under an approved open-source
 * licence.
 *
 * Why: the vaadin-lit jar is Apache-2.0, and for a long time it shipped @vaadin/board and
 * @vaadin/rich-text-editor (Vaadin Commercial License) plus a Highcharts chunk — nobody had
 * checked. Licences are a property of the dependency TREE, so they are checked there: every
 * production dependency of the shipped entry packages, followed transitively through node_modules
 * (devDependencies are build tools and never reach what we ship).
 *
 * Usage: node scripts/check-frontend-licenses.mjs [target…]   (from the repo root; default = every
 * target). Each target needs its dependencies installed first (`npm ci`):
 *   web               frontend/web/monorepo — the vaadin-lit jar (apps/vaadin + libs/mateu) and the
 *                     visual editor bundled into the IntelliJ plugin and the VS Code extension
 *   react-native      frontend/app/react-native — the iOS/Android/web app
 *   vscode-extension  frontend/app/vscode-extension — the .vsix (vsce adds its production node_modules)
 * The Redwood renderer has no production npm dependency (JET/Spectra come from Oracle's CDN at
 * runtime, nothing is vendored — apps/redwood/NOTICE.md), so it has no target.
 */
import { TARGETS, licenceOf, walk } from './frontend-deps.mjs'

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
  'bpmn-js': { licence: 'SEE LICENSE IN LICENSE', why: 'bpmn.io License (MIT + keep the bpmn.io watermark visible)' },
}

/** Whether `pkg` is reviewed for the licence it declares NOW (a release with another licence fails again). */
const reviewedFor = (pkg, licence, reviewed = REVIEWED) => {
  const entry = reviewed[pkg.name]
  return !!entry && entry.licence === licence
}

// "MIT OR Apache-2.0" passes if ANY alternative is allowed; "(A AND B)" needs all of them.
const allowed = (expr) => {
  const clean = expr.replace(/[()]/g, ' ').trim()
  return clean.split(/\s+OR\s+/).some((alt) => alt.split(/\s+AND\s+/).every((id) => ALLOWED.has(id.trim())))
}

const check = (name, target) => {
  const { dir } = target
  const { packages, unresolved } = walk(target)
  const problems = []
  for (const { pkg, via } of packages) {
    const licence = licenceOf(pkg)
    if (!allowed(licence) && !reviewedFor(pkg, licence)) problems.push(`${pkg.name}@${pkg.version}  ${licence}  (via ${via})`)
  }
  if (unresolved.length) {
    console.error(`✗ [${name}] ${unresolved.length} dependency(ies) not installed — run \`npm ci\` in ${dir} first:\n`)
    for (const u of unresolved) console.error('  ' + u)
    return 2
  }
  if (problems.length) {
    console.error(`✗ [${name}] ${problems.length} shipped package(s) with a licence not approved for an Apache-2.0 artifact:\n`)
    for (const p of problems.sort((a, b) => a.localeCompare(b))) console.error('  ' + p)
    console.error('\nReplace the package, or — if its licence is in fact compatible — add the SPDX id to ALLOWED (or the package to REVIEWED) in this script, in a reviewed change.')
    return 1
  }
  console.log(`✓ [${name}] ${packages.length} shipped packages, all under approved licences`)
  return 0
}

const requested = process.argv.slice(2)
const unknown = requested.filter((t) => !TARGETS[t])
if (unknown.length) {
  console.error(`Unknown target(s): ${unknown.join(', ')} — known: ${Object.keys(TARGETS).join(', ')}`)
  process.exit(2)
}
const codes = (requested.length ? requested : Object.keys(TARGETS)).map((t) => check(t, TARGETS[t]))
process.exit(Math.max(0, ...codes))
