// Copia el build optimizado de la app VB al módulo Maven backend/shared/frontend/redwood,
// que lo empaqueta como jar de renderer (igual que vaadin-lit para el renderer Vaadin).
//
// Flujo: npm run build   (grunt vb-build --no-optimize=true --force; OJO: puede abortar al
//                         final en una subtarea de red — build/optimized queda bien generado,
//                         no fiarse del exit code)
//        npm run copy    (este script)
//        commit de backend/shared/frontend/redwood/src/main/resources
//
// Transformaciones al copiar:
//  - index.html → _index.html (lo sirve el controller generado por el AP en la ruta del @UI,
//    default indexHtmlPath = /static/_index.html) con el marcador AQUIELTITULODELAPAGINA en el
//    <title> para que el controller estampe el título de la app, y el par de marcadores
//    <!-- AQUIUI --> / <!-- HASTAAQUIUI --> que el controller EXIGE (corta ese tramo y lo
//    sustituye por un <mateu-ui baseUrl="...">). En la página VB ese elemento es un custom
//    element desconocido — se neutraliza con display:none y queda como PORTADOR del baseUrl
//    del @UI (legible por el bridge para UIs fuera de la raíz).
//  - mateuBaseUrl: el default de desarrollo (http://localhost:8595) se sustituye por '' en
//    todos los ficheros de texto → el bridge llama a /mateu/v3/... del MISMO origen que sirve
//    el jar. (Limitación v1: la app VB empaquetada asume el @UI en la ruta raíz "".)
//
// El resto se copia byte a byte: los componentes JET/oj-sp/visual-runtime se cargan del CDN de
// Oracle en runtime (ver NOTICE.md — nada de static.oracle.com se vendoriza en el jar).

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const rendererRoot = join(here, '..')
const src = join(rendererRoot, 'build', 'optimized', 'webApps', 'vbredwoodapp')
const repoRoot = join(rendererRoot, '..', '..', '..', '..', '..')
const moduleResources = join(repoRoot, 'backend', 'shared', 'frontend', 'redwood', 'src', 'main', 'resources')
const dests = [join(moduleResources, 'META-INF', 'resources'), join(moduleResources, 'static')]

const DEV_BASE_URL = 'http://localhost:8595'
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.map', '.css'])

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

for (const dest of dests) {
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  walk(dest, transform)
  renameSync(join(dest, 'index.html'), join(dest, '_index.html'))
  console.log(`Copiado ${src} → ${dest}`)
}
