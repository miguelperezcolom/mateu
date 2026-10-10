// Tests de contrato de lo que se añadió para el reto PMS (OPERA Cloud sobre Mateu + Redwood):
// cada componente o comportamiento nuevo del renderer, con fixtures de wire real capturados de
// demo/demo-vb-pms (poc/fixtures/pms/*.json) o, cuando el wire es trivial, construidos a mano
// con la MISMA forma que emite el backend (record → DTO).
// Uso: node test-pms.mjs   (npm test ejecuta test.mjs y este)

import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reduceContexts, islandContentOf, hostContentOf, hostContentShown, summarizeHost, HOST_ID } from './reduceContexts.mjs'
import { fileDownloadOf, triggerDownload, applyDomEffects } from './files.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let pass = 0
const pending = []
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }
const atest = (name, fn) => pending.push([name, fn])

export const fixture = (name) => {
  const f = join(here, 'fixtures', 'pms', name + '.json')
  if (!existsSync(f)) throw new Error(`falta el fixture ${f} (node capture-pms.mjs con demo-vb-pms en marcha)`)
  return JSON.parse(readFileSync(f, 'utf8'))
}
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
const empty = () => ({ contexts: {}, stack: [], shell: null })
/** Átomos que la plantilla pinta para un árbol (todas las superficies usan la misma proyección). */
export const atomsOf = (tree, state = {}, data = {}, opts = {}) =>
  (islandContentOf({ tree, state, data }, opts) || []).flatMap((b) => b.items || [])
const node = (metadata, children = []) => ({ type: 'ClientSide', id: metadata.id || '', metadata, children })

// ── P0 #2: descargas y enlaces ─────────────────────────────────────────────────────────────────

/** Un DOM mínimo que registra lo que se hace con él. */
const fakeEnv = () => {
  const log = []
  const env = {
    atob: (b) => Buffer.from(b, 'base64').toString('binary'),
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts.type } },
    URL: { createObjectURL: (b) => { log.push(['url', b.type]); return 'blob:x' }, revokeObjectURL: (u) => log.push(['revoke', u]) },
    setTimeout: (fn) => fn(),
    document: {
      body: { appendChild: (a) => log.push(['append', a.download]) },
      createElement: () => ({ style: {}, click() { log.push(['click', this.download, this.href]) }, remove() { log.push(['remove']) } }),
    },
  }
  return { env, log }
}

test('DownloadFile: el reducer acumula TODOS los ficheros del increment', () => {
  const file = (n) => ({ type: 'DownloadFile', data: { filename: n, mimeType: 'text/csv', base64Content: 'YSxiCjEsMg==' } })
  const reg = reduceContexts(empty(), { commands: [file('a.csv'), file('b.csv')] })
  assert.deepEqual(reg.effects.downloads.map((d) => d.filename), ['a.csv', 'b.csv'])
  assert.equal(reg.effects.download.filename, 'b.csv') // compat: el último
})

test('DownloadFile: se descarga como Blob con su nombre y tipo; sin contenido no hace nada', () => {
  const { env, log } = fakeEnv()
  assert.equal(triggerDownload({ filename: 'folio.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=' }, env), true)
  assert.deepEqual(log, [['url', 'application/pdf'], ['append', 'folio.pdf'], ['click', 'folio.pdf', 'blob:x'], ['remove'], ['revoke', 'blob:x']])
  assert.equal(fileDownloadOf({ filename: 'x' }), null)
  assert.equal(fileDownloadOf({ base64Content: 'eA==' }).filename, 'export')
  assert.equal(applyDomEffects({ downloads: [{ base64Content: 'eA==' }, {}] }, fakeEnv().env), 1)
})

test('DownloadFile: TODAS las chains que reducen un increment aplican sus efectos de DOM', () => {
  for (const rel of [
    'flows/main/pages/main-start-page-chains/runMateuAction.js',
    'flows/main/pages/main-start-page-chains/runMateuIslandAction.js',
    'flows/main/pages/main-start-page-chains/runMateuNestedAction.js',
    'flows/main/pages/main-start-page-chains/runMateuSearch.js',
    'pages/shell-page-chains/onMateuNavigate.js',
    'pages/shell-page-chains/runMateuHeaderAction.js',
  ]) {
    const src = webApp(rel)
    const reduces = (src.match(/reg = bridge\.reduceContexts\(/g) || []).length
    const applies = (src.match(/bridge\.applyDomEffects\(reg\.effects\)/g) || []).length
    assert.ok(reduces > 0, rel)
    assert.equal(applies, reduces, `${rel}: ${reduces} reducciones, ${applies} applyDomEffects`)
  }
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /strip\('files\.mjs'\)/)
})

test('Anchor: enlace real; _blank abre otra pestaña con noopener; la url se interpola', () => {
  const atoms = atomsOf(node({ type: 'Page' }, [
    node({ type: 'Anchor', text: 'Folio en PDF', url: '/files/folio-${state.id}.pdf', target: '_blank' }),
    node({ type: 'Anchor', text: 'Reserva', url: '/reservations/${state.id}' }),
    node({ type: 'Anchor', text: 'sin url', url: '' }),
    // un Anchor declarado como CAMPO de un formulario llega envuelto en un CustomField (children)
    node({ type: 'CustomField' }, [node({ type: 'Anchor', text: 'Guía', url: 'https://docs.example', target: '_blank' })]),
  ]), { id: 'R1' })
  const links = atoms.filter((a) => a.isAnchor)
  assert.equal(links.length, 3)
  assert.equal(links[2].href, 'https://docs.example')
  assert.deepEqual(links[0], { isAnchor: true, text: 'Folio en PDF', href: '/files/folio-R1.pdf', target: '_blank', rel: 'noopener noreferrer' })
  assert.equal(links[1].target, '_self')
  assert.equal(links[1].href, '/reservations/R1')
})

test('Anchor en un formulario real (/billing): se pinta el contenido rico, no el formulario genérico', () => {
  const reg = reduceContexts(empty(), fixture('billing'))
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, {})
  const items = blocks.flatMap((b) => b.items || [])
  assert.ok(items.some((a) => a.isAnchor), 'el Anchor no se proyectó')
  assert.ok(items.some((a) => a.isFormLayout), 'los campos tienen que seguir en el oj-form-layout')
  assert.equal(hostContentShown(blocks, summarizeHost(reg)), true)
})

test('plantilla: el átomo isAnchor está en la plantilla única y expandido en todas las superficies', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  assert.equal((page.match(/\$current\.data\.isAnchor \]\]/g) || []).length, surfaces)
})

for (const [name, fn] of pending) { await fn(); console.log(`  ✓ ${name}`); pass++ }
console.log(`\n${pass} tests PMS OK`)
void HOST_ID
