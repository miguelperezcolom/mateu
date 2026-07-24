// Fase 0 — captura de increments REALES contra un backend Mateu vivo.
// POST /{base}/mateu/v3/components/_/action con el RunActionRqDto y vuelca la respuesta
// (UIIncrementDto) a fixtures/real/<name>.json. Fija el contrato de wire real para que los
// tests del reducer dejen de correr contra fixtures sintéticos.
//
// Uso:
//   node tools/capture.mjs --base http://localhost:8595
//   node tools/capture.mjs --base http://localhost:8595 --only load-landing,load-dashboard
//
// Cada entrada del LOTE es un paso: { name, route, actionId, componentState, appState,
// parameters, from }. `from` (opcional) encadena: usa el componentState/route del increment
// ya capturado con ese name (para acciones que dependen del load previo, p.ej. abrir un drawer).

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'fixtures', 'real')

const arg = (k, def) => {
  const i = process.argv.indexOf(k)
  return i >= 0 ? process.argv[i + 1] : def
}
const BASE = arg('--base', 'http://localhost:8595').replace(/\/$/, '')
const ONLY = (arg('--only', '') || '').split(',').filter(Boolean)

// Lote: superficies representativas del roadmap (load de cada tipo de página).
// Las acciones de 2 pasos (abrir drawer, guardar) se añaden cuando el load esté fijado.
// Rutas REALES del explorer (io.mateu.explorer) servido en :8595 con el renderer redwood.
const BATCH = [
  { name: 'load-landing', route: '', actionId: '__load__' }, // WelcomePage (landing)
  { name: 'load-dashboard', route: '/dashboard', actionId: '__load__' },
  { name: 'load-foldout', route: '/foldout', actionId: '__load__' },
  { name: 'load-general-overview', route: '/general-overview', actionId: '__load__' },
  { name: 'load-products-crud', route: '/products', actionId: '__load__' }, // listing/CRUD
  { name: 'load-tabs', route: '/tabs', actionId: '__load__' },
  { name: 'load-wizard', route: '/wizard', actionId: '__load__' }, // guided process
  { name: 'load-dialog', route: '/dialog-demo', actionId: '__load__' },
  { name: 'load-section-empty', route: '/section-empty', actionId: '__load__' },
  // Los tres modos de pageWidth (puerta 1.6)
  { name: 'load-width-fixed', route: '/width-fixed', actionId: '__load__' },
  { name: 'load-width-full', route: '/width-full', actionId: '__load__' },
  { name: 'load-width-edge', route: '/width-edge', actionId: '__load__' },
  // Variantes de shell (App metadata → Fase 2/6)
  { name: 'load-shell-menu', route: '/shell-menu', actionId: '__load__' },
  { name: 'load-shell-tabs', route: '/shell-tabs', actionId: '__load__' },
]

const captured = {}

function bodyFor(step) {
  const src = step.from ? captured[step.from] : null
  const srcCtx = src?.fragments?.[0]?.component
  return {
    route: step.route ?? srcCtx?.route ?? '',
    actionId: step.actionId ?? '__load__',
    componentState: step.componentState ?? srcCtx?.initialData ?? {},
    appState: step.appState ?? {},
    parameters: step.parameters ?? {},
    initiatorComponentId: step.initiatorComponentId ?? srcCtx?.id ?? null,
    consumedRoute: step.consumedRoute ?? srcCtx?.consumedRoute ?? null,
    serverSideType: step.serverSideType ?? srcCtx?.serverSideType ?? null,
    serverSideComponentRoute: step.serverSideComponentRoute ?? null,
  }
}

async function run() {
  mkdirSync(outDir, { recursive: true })
  const steps = ONLY.length ? BATCH.filter((s) => ONLY.includes(s.name)) : BATCH
  let ok = 0
  for (const step of steps) {
    const url = `${BASE}/mateu/v3/components/_/action`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyFor(step)),
      })
      if (!res.ok) {
        console.log(`  ✗ ${step.name}  (${step.route || '/'})  http=${res.status}`)
        continue
      }
      const inc = await res.json()
      captured[step.name] = inc
      writeFileSync(join(outDir, `${step.name}.json`), JSON.stringify(inc, null, 2))
      const c = inc.fragments?.[0]?.component
      console.log(
        `  ✓ ${step.name.padEnd(22)} type=${c?.type ?? '?'} sst=${(c?.serverSideType ?? '').split('.').pop()} pageType=${c?.pageType ?? '-'} children=${c?.children?.length ?? 0}`,
      )
      ok++
    } catch (e) {
      console.log(`  ✗ ${step.name}  ${e.message}`)
    }
  }
  console.log(`\n${ok}/${steps.length} capturados en fixtures/real/  (base=${BASE})`)
}

run()
