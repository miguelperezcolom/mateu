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
// Transformations while copying:
//  - index.html -> _index.html (served by the AP-generated controller at the @UI route,
//    default indexHtmlPath = /static/_index.html) with the AQUIELTITULODELAPAGINA marker in the
//    <title> so the controller stamps the app title, and the pair of markers
//    <!-- AQUIUI --> / <!-- HASTAAQUIUI --> that the controller REQUIRES (it cuts that span and
//    replaces it with a <mateu-ui baseUrl="...">). In the VB page that element is an unknown
//    custom element - it is neutralized with display:none and remains as the CARRIER of the
//    @UI mount: the bridge reads it (poc/mount.mjs) to call <mount>/mateu/v3/... and to
//    read routes relative to it, so the packaged app serves a @UI at any route.
//  - mateuBaseUrl: the development default (app-flow.json) is replaced by '' in every
//    text file (in path mode the bridge uses the mount, not this constant).
//
// The rest is copied byte for byte: the JET/oj-sp/visual-runtime components are loaded from
// Oracle's CDN at runtime (see NOTICE.md — nothing from static.oracle.com is vendored in the jar).

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceHash } from './source-hash.mjs'

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
 * Defers the startup scripts of the Visual Builder app.
 *
 * <p>Each marked `<script>` becomes `type="text/mateu-deferred"`, which no browser runs, and
 * the whole span sits between AQUIJS/HASTAAQUIJS so the generated controller knows this
 * page defers its own startup instead of exposing a single module as the Vite ones do.
 *
 * <p>The `src` is kept in `data-src` because a `<script>` with `src` and an unknown `type` is not
 * even downloaded — which is exactly what we want until there is a token — and the replayer
 * restores it when re-injecting it.
 */
const deferBootScripts = (html) => {
  const deferred = html.replace(/<script\b([^>]*)\sdata-mateu-defer([^>]*)>/g, (_m, before, after) => {
    const attrs = (before + after)
      .replace(/\stype=(["'])[^"']*\1/g, '')
      .replace(/\ssrc=(["'])([^"']*)\1/g, ' data-src=$1$2$1')
    return `<script type="text/mateu-deferred"${attrs}>`
  })
  const first = deferred.indexOf('<script type="text/mateu-deferred"')
  if (first < 0) return deferred
  const closing = '</script>'
  const last = deferred.lastIndexOf('<script type="text/mateu-deferred"')
  const end = deferred.indexOf(closing, last) + closing.length
  return deferred.slice(0, first) + '<!-- AQUIJS -->\n'
       + deferred.slice(first, end)
       + '\n<!-- HASTAAQUIJS -->' + deferred.slice(end)
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
  if (file.endsWith('index.html')) {
    content = content
      // served at deep routes (/checkin/3) the relative assets (version_.../...)
      // would resolve against the route — the base anchors all relative resolution to the root
      .replace('<head>', '<head>\n    <base href="/">')
      // ...but the visual-runtime derives the MODULE base from location.pathname (it ignores
      // <base>): an absolute vbInitConfig.BASE_URL wins over that fallback and anchors the
      // bundles to /version_<ts>/ from any route
      .replace(/BASE_URL_TOKEN: '([^']+)'/, "BASE_URL: '/$1/',\n        BASE_URL_TOKEN: '$1'")
      .replace('<title>Oracle Applications</title>', '<title>AQUIELTITULODELAPAGINA</title>')
      // JET's language (the texts of its components: the Start/Continue/Cancel of the
      // guided process, the «Introduzca un valor.» of a required field, the date formats) is
      // the BROWSER's, as in the Vaadin renderer — not the template's fixed `lang="en"`
      .replace('window.vbInitParams.locale = html.lang;',
               "html.lang = (navigator.languages && navigator.languages[0]) || navigator.language || html.lang;\n"
               + '      window.vbInitParams.locale = html.lang;')
      .replace('</head>', '    <style>mateu-ui { display: none !important; }</style>\n  </head>')
      .replace('</body>', '    <!-- AQUIUI --><!-- HASTAAQUIUI -->\n  </body>')
      // The marker where the generated controller injects the script that obtains the token.
      // Without it, a @UI @KeycloakSecured depending on this artifact REFUSES to be served — and
      // rightly so: serving the page without that script would publish an unauthenticated console.
      .replace('<base href="/">', '<base href="/">\n    <!-- AQUIKEYCLOAK -->')
      // And the Visual Builder startup, deferred until that token exists.
      //
      // This app does not start like the Vite ones: there is no single module, there are seven
      // scripts with dependencies between them (require.js → bundles-config → third-party →
      // visual-runtime). Letting them run before authenticating is a race lost on every reload:
      // the runtime asks Mateu for data before Keycloak has resolved, and that request goes out
      // without a token. So they are marked as deferred and the injected script replays them IN
      // ORDER once there is a session — see defer() below.
      .replace(/(<script\b(?![^>]*\btype=(["'])(?:module|text\/mateu-deferred)\2))/g,
               '$1 data-mateu-defer')
  }
  if (file.endsWith('index.html')) {
    content = deferBootScripts(content)
  }
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
// differ; nothing reads it at runtime)
const dropped = (rel) => rel === 'build-info.json' || /(^|\/)bundles\/plain(\/|$)/.test(rel) || rel.endsWith('.map')

/** The VB build's version_<timestamp>/ -> _redwood/, and the cache-busting query on what loads it. */
export const restamp = (html, versionDir, hash) => html
  .split(versionDir + '/').join(APP_DIR + '/')
  .split("'" + versionDir + "'").join("'" + APP_DIR + "'")
  // the build time: the only thing that would make two builds of the same sources differ
  .replace(/(<!-- application built by grunt-vb-build version \S+) at \S+ -->/, '$1 -->')
  .replace(`href="${APP_DIR}/resources/css/app.css"`, `href="${APP_DIR}/resources/css/app.css?v=${hash}"`)
  // every module of the app require.js loads (and text!/css! resources, which go through
  // require.toUrl) gets ?v=<sourceHash>; the CDN ones (absolute URLs) are left alone
  .replace('const getBundlesType = (url) =>',
    "require.config({ urlArgs: (id, url) => (/^(https?:)?\\/\\//.test(url) ? '' : (url.indexOf('?') < 0 ? '?' : '&') + 'v=" + hash + "') });\n        const getBundlesType = (url) =>")

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
const indexFile = join(dest, 'index.html')
writeFileSync(indexFile, restamp(readFileSync(indexFile, 'utf8'), versionDir, SOURCE_HASH))
renameSync(indexFile, join(dest, '_index.html'))
writeFileSync(join(dest, APP_DIR, 'resources', 'mateu-anonymous-user.json'), JSON.stringify(ANONYMOUS_USER) + '\n')
writeFileSync(join(dest, 'mateu-build-info.json'), JSON.stringify({ sourceHash: SOURCE_HASH }, null, 2) + '\n')
console.log(`Copiado ${src} -> ${dest} (${APP_DIR}/, sourceHash ${SOURCE_HASH})`)
