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
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = join(dirname(fileURLToPath(import.meta.url)), '..')

// What we publish, and the packages whose production dependencies end up in it. `notBundled`:
// declared as RUNTIME dependencies by a shipped package but never part of what ships (a package's
// sloppy dependency list, or build tooling an SDK declares as a dependency): their subtree is not
// walked. Each one with its reason; adding one is a reviewed change.
const TARGETS = {
  web: {
    dir: 'frontend/web/monorepo',
    entries: ['apps/vaadin', 'libs/mateu', 'apps/visual-editor'],
    notBundled: {
      // @vaadin-component-factory/vcf-date-range-picker lists its dev server as a dependency; the
      // picker never imports it, and Vite only bundles what is imported.
      '@web/dev-server': 'dev server listed as a runtime dependency of vcf-date-range-picker',
    },
  },
  'react-native': {
    dir: 'frontend/app/react-native',
    entries: ['.'],
    notBundled: {},
  },
  'vscode-extension': {
    dir: 'frontend/app/vscode-extension',
    entries: ['.'],
    notBundled: {},
  },
}

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

const check = (name, { dir, entries, notBundled }) => {
  const root = join(repo, dir)
  // Node's resolution: look for node_modules/<dep> from the requiring package upwards.
  const resolve = (dep, fromDir) => {
    let at = fromDir
    for (;;) {
      const candidate = join(at, 'node_modules', dep, 'package.json')
      if (existsSync(candidate)) return candidate
      if (at === root || at === dirname(at)) return null
      at = dirname(at)
    }
  }
  const entryPaths = entries.map((e) => join(root, e, 'package.json'))
  const seen = new Map()
  const problems = []
  const unresolved = []
  const visit = (pkgJsonPath, via) => {
    if (seen.has(pkgJsonPath)) return
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
    seen.set(pkgJsonPath, pkg.name)
    const isEntry = entryPaths.includes(pkgJsonPath)
    if (notBundled[pkg.name]) return
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
  for (const entry of entryPaths) visit(entry, name)

  if (unresolved.length) {
    console.error(`✗ [${name}] ${unresolved.length} dependency(ies) not installed — run \`npm ci\` in ${dir} first:\n`)
    for (const u of [...new Set(unresolved)].sort((a, b) => a.localeCompare(b))) console.error('  ' + u)
    return 2
  }
  if (problems.length) {
    console.error(`✗ [${name}] ${problems.length} shipped package(s) with a licence not approved for an Apache-2.0 artifact:\n`)
    for (const p of problems.sort((a, b) => a.localeCompare(b))) console.error('  ' + p)
    console.error('\nReplace the package, or — if its licence is in fact compatible — add the SPDX id to ALLOWED (or the package to REVIEWED) in this script, in a reviewed change.')
    return 1
  }
  console.log(`✓ [${name}] ${seen.size - entryPaths.length} shipped packages, all under approved licences`)
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
