// Copies the optimized build of the VB app into the Maven module backend/shared/frontend/redwood,
// which packages it as a renderer jar (just like vaadin-lit for the Vaadin renderer).
//
// Flow:  npm run build   (grunt vb-build --no-optimize=true --force; CAREFUL: it may abort at
//                         the end in a network subtask — build/optimized is generated fine,
//                         do not trust the exit code)
//        npm run copy    (this script)
//        commit of backend/shared/frontend/redwood/src/main/resources
//
// Layout of the jar (2026-10-10 — it used to be a fresh version_<timestamp>/ per build, written
// TWICE, to META-INF/resources and static, plus the unminified bundles/plain and every source map:
// ~20 MB of new files in git on every rebuild, even of unchanged sources):
//   static/_index.html             the page the generated controller serves (indexHtmlPath default)
//   static/_redwood/...            the VB app, ONE location, a STABLE name. Spring Boot, Micronaut
//                                  (classpath:static) and Helidon (/static) serve it from here; the
//                                  module's pom copies it to META-INF/resources/_redwood at build
//                                  time for Quarkus (git keeps one copy, the jar both).
//   static/mateu-build-info.json   { sourceHash }: the hash of the sources it was built from
//                                  (scripts/source-hash.mjs) - check-bundle-freshness.sh compares it.
// Cache busting no longer rides on the directory name: every module require.js loads from the app
// (and app.css) carries ?v=<sourceHash>, and Mateu's Spring handlers serve /_redwood/** with
// no-cache + ETag (StaticAssetCaching.REVALIDATE_FOLDERS). Same sources -> same output.
//
// The page: the build's index.html is NOT shipped. static/_index.html is Mateu's own page
// (index-page.mjs), which reads off the build output only the facts it needs (CDN urls, the
// runtime settings, the module bundle map) — see the markers it carries and why there. So the jar
// redistributes no markup of the VB tooling or of its starter template (NOTICE.md).
//
// Transformations while copying the rest:
//  - mateuBaseUrl: the development default (app-flow.json) is replaced by '' in every
//    text file (in path mode the bridge uses the mount, not this constant).
//  - the VB host's env placeholders the build leaves (fillVbEnvPlaceholders below).
//
// The rest is copied byte for byte: the JET/oj-sp/visual-runtime components are loaded from
// Oracle's CDN at runtime (see NOTICE.md — nothing from static.oracle.com is vendored in the jar).

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceHash } from './source-hash.mjs'
import { indexPage, readBuildFacts } from './index-page.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const rendererRoot = join(here, '..')
const src = join(rendererRoot, 'build', 'optimized', 'webApps', 'vbredwoodapp')
const repoRoot = join(rendererRoot, '..', '..', '..', '..', '..')
const moduleResources = join(repoRoot, 'backend', 'shared', 'frontend', 'redwood', 'src', 'main', 'resources')
const dest = join(moduleResources, 'static')
// the directory of the VB app inside the jar: stable, so a rebuild modifies files in place
export const APP_DIR = '_redwood'

// The backend development URL is read from app-flow.json itself (constant mateuBaseUrl) instead
// of repeating it here: when someone changed it there (8595 → 9005) and not here, the jar was
// published with the development one hard-wired and every app other than demo-vb called someone
// else's backend.
const DEV_BASE_URL = JSON.parse(
  readFileSync(join(rendererRoot, 'webApps', 'vbredwoodapp', 'app-flow.json'), 'utf8'),
).constants.mateuBaseUrl.defaultValue
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.css'])
const SOURCE_HASH = sourceHash()

if (!existsSync(join(src, 'index.html'))) {
  console.error(`No existe ${src}/index.html — ejecuta antes: npm run build`)
  process.exit(1)
}


/**
 * The VB build leaves `services/catalog.json` (and the security provider's configuration) as
 * placeholders (`"#{env.catalogJson}#"`, `%{env.userProfileUrl}%`) that only a Visual Builder host
 * substitutes. Served by Mateu nothing does, so the runtime's catalog registry
 * choked on it on EVERY page load (a console error + a 400). The app declares no service catalog:
 * an empty one is the truth.
 */
export const fillVbEnvPlaceholders = (content) => content
  .split('"\\"#{env.catalogJson}#\\""').join('"{}"')
  .split('"#{env.catalogJson}#"').join('{}')
  // …and the build fills the security provider's configuration with the same kind of placeholders
  // (the user-profile url among them): served by Mateu the runtime FETCHED `%{env.userProfileUrl}%`
  // — the 400 on every page load. Mateu authenticates nothing here (the host framework does): the
  // provider reads a static anonymous user the jar ships (ANONYMOUS_USER below). Without a url it
  // asks `<base>_currentuser`, which the server answers with the index page — a JSON parse error.
  .replace(/(\\?"configuration\\?":)\{((?:[^{}]|[#%]\{env\.[^{}]*\})*)\}/g,
    (whole, key, inner) => {
      if (!/[#%]\{env\./.test(inner)) return whole
      // the app's own `configuration` (a VB profile id): simply empty, as authored
      if (!/userProfileUrl/.test(inner)) return key + '{}'
      const q = key.startsWith('\\') ? '\\"' : '"'
      return key + '{' + q + 'url' + q + ':' + q + ANONYMOUS_USER_URL + q + '}'
    })

/** Where the jar serves the anonymous user the VB security provider reads (see above). */
export const ANONYMOUS_USER_URL = '/_redwood/resources/mateu-anonymous-user.json' // root: the jar's assets live at /_redwood whatever the page's path
const ANONYMOUS_USER = { userId: 'anonymous', longId: 'anonymous', fullName: '', email: '', roles: [],
  permissions: [], isAdmin: false, isAuthenticated: false }

const transform = (file) => {
  if (!TEXT_EXTENSIONS.has(extname(file))) return
  const original = readFileSync(file, 'utf8')
  let content = fillVbEnvPlaceholders(original.split(DEV_BASE_URL).join(''))
  if (content !== original) writeFileSync(file, content)
}

const walk = (dir, fn) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, fn)
    else fn(path)
  }
}

// what the build leaves that the jar must not carry: the unminified bundle (only reachable with
// ?vb.bundles=plain), source maps, and VB's own build-info.json (its build TIME made every build
// differ; nothing reads it at runtime) — and the build's index.html: the jar ships its own page
const dropped = (rel) => rel === 'build-info.json' || rel === 'index.html' || /(^|\/)bundles\/plain(\/|$)/.test(rel) || rel.endsWith('.map')

const versionDir = readdirSync(src).find((e) => /^version_\d+$/.test(e))
if (!versionDir) {
  console.error(`No version_<n>/ in ${src} - did the VB build change its layout?`)
  process.exit(1)
}

// the old layout goes too: version_<ts>/ dirs, and the META-INF/resources copy (the pom makes it)
rmSync(join(moduleResources, 'META-INF'), { recursive: true, force: true })
rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
const copyTree = (from, to, rel = '') => {
  for (const entry of readdirSync(from)) {
    const r = rel ? rel + '/' + entry : entry
    if (dropped(r)) continue
    const path = join(from, entry)
    const target = join(to, entry === versionDir && !rel ? APP_DIR : entry)
    if (statSync(path).isDirectory()) {
      mkdirSync(target, { recursive: true })
      copyTree(path, target, r)
    } else cpSync(path, target)
  }
}
copyTree(src, dest)
walk(dest, transform)
writeFileSync(join(dest, '_index.html'),
  indexPage(readBuildFacts(readFileSync(join(src, 'index.html'), 'utf8')), { appDir: APP_DIR, hash: SOURCE_HASH }))
writeFileSync(join(dest, APP_DIR, 'resources', 'mateu-anonymous-user.json'), JSON.stringify(ANONYMOUS_USER) + '\n')
writeFileSync(join(dest, 'mateu-build-info.json'), JSON.stringify({ sourceHash: SOURCE_HASH }, null, 2) + '\n')
console.log(`Copiado ${src} -> ${dest} (${APP_DIR}/, sourceHash ${SOURCE_HASH})`)
