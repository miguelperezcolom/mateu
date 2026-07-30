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
const repoRoot = join(rendererRoot, '..', '..', '..', '..')
const moduleResources = join(repoRoot, 'backend', 'shared', 'frontend', 'redwood', 'src', 'main', 'resources')
const dests = [join(moduleResources, 'META-INF', 'resources'), join(moduleResources, 'static')]

const DEV_BASE_URL = 'http://localhost:8595'
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.map', '.css'])

if (!existsSync(join(src, 'index.html'))) {
  console.error(`No existe ${src}/index.html — ejecuta antes: npm run build`)
  process.exit(1)
}

const transform = (file) => {
  if (!TEXT_EXTENSIONS.has(extname(file))) return
  const original = readFileSync(file, 'utf8')
  let content = original.split(DEV_BASE_URL).join('')
  if (file.endsWith('index.html')) {
    content = content
      .replace('<title>Oracle Applications</title>', '<title>AQUIELTITULODELAPAGINA</title>')
      .replace('</head>', '    <style>mateu-ui { display: none !important; }</style>\n  </head>')
      .replace('</body>', '    <!-- AQUIUI --><!-- HASTAAQUIUI -->\n  </body>')
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
