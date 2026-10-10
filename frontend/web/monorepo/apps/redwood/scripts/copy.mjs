// Copia el build optimizado de la app VB al módulo Maven backend/shared/frontend/redwood,
// que lo empaqueta como jar de renderer (igual que vaadin-lit para el renderer Vaadin).
//
// Flujo: npm run build   (grunt vb-build --no-optimize=true --force; OJO: puede abortar al
//                         final en una subtarea de red — build/optimized queda bien generado,
//                         no fiarse del exit code)
//        npm run copy    (este script)
//        commit de backend/shared/frontend/redwood/src/main/resources
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
// Transformaciones al copiar:
//  - index.html -> _index.html (lo sirve el controller generado por el AP en la ruta del @UI,
//    default indexHtmlPath = /static/_index.html) con el marcador AQUIELTITULODELAPAGINA en el
//    <title> para que el controller estampe el titulo de la app, y el par de marcadores
//    <!-- AQUIUI --> / <!-- HASTAAQUIUI --> que el controller EXIGE (corta ese tramo y lo
//    sustituye por un <mateu-ui baseUrl="...">). En la pagina VB ese elemento es un custom
//    element desconocido - se neutraliza con display:none y queda como PORTADOR del montaje
//    del @UI: el bridge lo lee (poc/mount.mjs) para llamar a <montaje>/mateu/v3/... y para
//    leer las rutas relativas a el, asi que la app empaquetada sirve un @UI en cualquier ruta.
//  - mateuBaseUrl: el default de desarrollo (app-flow.json) se sustituye por '' en todos los
//    ficheros de texto (en modo path el bridge usa el montaje, no esta constante).
//
// El resto se copia byte a byte: los componentes JET/oj-sp/visual-runtime se cargan del CDN de
// Oracle en runtime (ver NOTICE.md — nada de static.oracle.com se vendoriza en el jar).

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

// La URL de desarrollo del backend se lee del propio app-flow.json (constante mateuBaseUrl) en vez
// de repetirla aquí: cuando alguien la cambió allí (8595 → 9005) y no aquí, el jar se publicó con
// la de desarrollo cableada y toda app que no fuera demo-vb llamaba a un backend ajeno.
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
 * Aplaza los scripts de arranque de la app de Visual Builder.
 *
 * <p>Cada `<script>` marcado pasa a `type="text/mateu-deferred"`, que ningún navegador ejecuta, y
 * el tramo entero queda entre AQUIJS/HASTAAQUIJS para que el controlador generado sepa que esta
 * página aplaza su propio arranque en vez de exponer un módulo único como hacen las de Vite.
 *
 * <p>El `src` se guarda en `data-src` porque un `<script>` con `src` y un `type` desconocido no se
 * descarga siquiera — que es justo lo que queremos hasta tener token — y el reproductor lo
 * restaura al reinyectarlo.
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

const transform = (file) => {
  if (!TEXT_EXTENSIONS.has(extname(file))) return
  const original = readFileSync(file, 'utf8')
  let content = original.split(DEV_BASE_URL).join('')
  if (file.endsWith('index.html')) {
    content = content
      // servida en rutas profundas (/checkin/3) los assets relativos (version_.../...)
      // resolverían contra la ruta — la base ancla toda resolución relativa a la raíz
      .replace('<head>', '<head>\n    <base href="/">')
      // ...pero el visual-runtime deriva la base de MÓDULOS de location.pathname (ignora
      // <base>): vbInitConfig.BASE_URL absoluto gana sobre ese fallback y ancla los
      // bundles a /version_<ts>/ desde cualquier ruta
      .replace(/BASE_URL_TOKEN: '([^']+)'/, "BASE_URL: '/$1/',\n        BASE_URL_TOKEN: '$1'")
      .replace('<title>Oracle Applications</title>', '<title>AQUIELTITULODELAPAGINA</title>')
      // El idioma de JET (los textos de sus componentes: el Empezar/Continuar/Cancelar del
      // guided process, el «Introduzca un valor.» de un obligatorio, los formatos de fecha) es
      // el del NAVEGADOR, como en el renderer Vaadin — no el `lang="en"` fijo de la plantilla
      .replace('window.vbInitParams.locale = html.lang;',
               "html.lang = (navigator.languages && navigator.languages[0]) || navigator.language || html.lang;\n"
               + '      window.vbInitParams.locale = html.lang;')
      .replace('</head>', '    <style>mateu-ui { display: none !important; }</style>\n  </head>')
      .replace('</body>', '    <!-- AQUIUI --><!-- HASTAAQUIUI -->\n  </body>')
      // El marcador donde el controlador generado inyecta el script que obtiene el token.
      // Sin él, un @UI @KeycloakSecured que dependa de este artefacto se NIEGA a servirse — y
      // hace bien: servir la página sin ese script publicaría una consola sin autenticar.
      .replace('<base href="/">', '<base href="/">\n    <!-- AQUIKEYCLOAK -->')
      // Y el arranque de Visual Builder, aplazado hasta que ese token exista.
      //
      // Esta app no arranca como las de Vite: no hay un módulo único, son siete scripts con
      // dependencias entre ellos (require.js → bundles-config → third-party → visual-runtime).
      // Dejarlos correr antes de autenticar es una carrera que se pierde en cada recarga: el
      // runtime pide datos a Mateu antes de que Keycloak haya resuelto, y esa petición sale sin
      // token. Así que se marcan como diferidos y el script inyectado los reproduce EN ORDEN
      // cuando ya hay sesión — ver defer() más abajo.
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
writeFileSync(join(dest, 'mateu-build-info.json'), JSON.stringify({ sourceHash: SOURCE_HASH }, null, 2) + '\n')
console.log(`Copiado ${src} -> ${dest} (${APP_DIR}/, sourceHash ${SOURCE_HASH})`)
