/**
 * The production dependency tree of what Mateu ships from npm packages, walked the way Node resolves
 * it. Shared by scripts/check-frontend-licenses.mjs (are the licences approved?) and
 * scripts/third-party-notices.mjs (the notices that must travel with the shipped bundle).
 *
 * Every production dependency of the entry packages, followed transitively through node_modules
 * (devDependencies are build tools and never reach what we ship). Our own workspace packages
 * (libs/mateu and friends) are walked through but not reported: they are Mateu code.
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repo = join(dirname(fileURLToPath(import.meta.url)), '..')

// @vaadin-component-factory/vcf-date-range-picker lists its dev server as a dependency; the picker
// never imports it, and Vite only bundles what is imported. Skipped ONLY under that package: the same
// name required by anything else is walked like any dependency.
const VCF_DEV_SERVER = {
  '@web/dev-server': { via: '@vaadin-component-factory/vcf-date-range-picker',
    why: 'dev server listed as a runtime dependency of vcf-date-range-picker' },
}

/** Whether `pkgName`, required by `parentName`, is outside what ships (its `notBundled` entry names that parent). */
export const notBundledUnder = (pkgName, parentName, notBundled) => {
  const entry = notBundled[pkgName]
  return !!entry && entry.via === parentName
}

// What we publish, and the packages whose production dependencies end up in it. `notBundled`:
// declared as RUNTIME dependencies by a shipped package but never part of what ships (a package's
// sloppy dependency list, or build tooling an SDK declares as a dependency): their subtree is not
// walked. Each one with its reason; adding one is a reviewed change.
export const TARGETS = {
  // the licence guard's targets (check-frontend-licenses.mjs runs these by default)
  web: {
    dir: 'frontend/web/monorepo',
    entries: ['apps/vaadin', 'libs/mateu', 'apps/visual-editor'],
    notBundled: VCF_DEV_SERVER,
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

// One shipped bundle each: the notices file that travels inside it (third-party-notices.mjs).
export const BUNDLES = {
  // the io.mateu:mateu-vaadin jar, the mateu-vaadin npm package and the static sites' assets
  vaadin: {
    dir: 'frontend/web/monorepo',
    entries: ['apps/vaadin', 'libs/mateu'],
    notBundled: VCF_DEV_SERVER,
  },
  // the visual editor inside the IntelliJ plugin (and the desktop app) and the VS Code extension
  'visual-editor': {
    dir: 'frontend/web/monorepo',
    entries: ['apps/visual-editor', 'libs/mateu'],
    notBundled: VCF_DEV_SERVER,
  },
}

export const licenceOf = (pkg) => {
  const l = pkg.license ?? pkg.licenses
  if (typeof l === 'string') return l
  if (Array.isArray(l)) return l.map((x) => (typeof x === 'string' ? x : x.type)).join(' OR ')
  if (l && typeof l === 'object') return l.type
  return 'UNKNOWN'
}

/**
 * Walks a target. Returns `packages` (every third-party package reached, once, sorted by name and
 * version: `{ pkg, dir, via }`) and `unresolved` (required dependencies that are not installed — a
 * missing install would make a check pass by seeing less).
 */
export const walk = ({ dir, entries, notBundled }) => {
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
  const real = (p) => realpathSync(p)
  const entryPaths = new Set(entries.map((e) => real(join(root, e, 'package.json'))))
  const seen = new Set()
  const packages = []
  const unresolved = new Set()
  const visit = (pkgJsonPath, via, parentName) => {
    const path = real(pkgJsonPath)
    if (seen.has(path)) return
    const pkg = JSON.parse(readFileSync(path, 'utf8'))
    // not bundled UNDER the parent its entry names — checked before it counts as seen, so the same
    // package reached through another parent is still walked
    if (notBundledUnder(pkg.name, parentName, notBundled)) return
    seen.add(path)
    // a workspace package (reached through its node_modules symlink) is our own code
    const ours = entryPaths.has(path) || !path.includes(`${sep}node_modules${sep}`)
    if (!ours) packages.push({ pkg, dir: dirname(path), via })
    for (const dep of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.optionalDependencies ?? {}) })) {
      const target = resolve(dep, dirname(path))
      if (target) visit(target, ours ? pkg.name : `${via} > ${pkg.name}`, pkg.name)
      // optional deps may legitimately be absent (platform-specific binaries)
      else if (!(pkg.optionalDependencies ?? {})[dep]) unresolved.add(`${dep}  (required by ${pkg.name})`)
    }
  }
  for (const entry of entries) visit(join(root, entry, 'package.json'), entry)
  packages.sort((a, b) => a.pkg.name.localeCompare(b.pkg.name) || String(a.pkg.version).localeCompare(String(b.pkg.version)))
  return { packages, unresolved: [...unresolved].sort((a, b) => a.localeCompare(b)) }
}
