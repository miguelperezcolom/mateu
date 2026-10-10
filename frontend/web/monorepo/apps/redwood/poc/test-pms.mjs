// Tests de contrato de lo que se añadió para el reto PMS (OPERA Cloud sobre Mateu + Redwood):
// cada componente o comportamiento nuevo del renderer, con fixtures de wire real capturados de
// demo/demo-vb-pms (poc/fixtures/pms/*.json) o, cuando el wire es trivial, construidos a mano
// con la MISMA forma que emite el backend (record → DTO).
// Uso: node test-pms.mjs   (npm test ejecuta test.mjs y este)

import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reduceContexts, islandContentOf, hostContentOf, hostContentShown, summarizeHost, shellNavOf, HOST_ID } from './reduceContexts.mjs'
import { localMenuOptionOf, isSentinelHome } from './navTree.mjs'
import { loadMenuRouteInto, terminalMenuRouteOf } from './transport.mjs'
import { fileDownloadOf, triggerDownload, applyDomEffects } from './files.mjs'
import { wireElementEvents, serializeElementEvent, setElementEventSink, elementModuleUrl } from './elements.mjs'

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

// ── P0 #3: Element, la vía de escape, entera ─────────────────────────────────────────────────

test('Element (/floor-plan real): el átomo lleva `on`, un id propio y su módulo; dentro de pestañas', () => {
  const reg = reduceContexts(empty(), fixture('floor-plan'))
  const items = hostContentOf(reg.contexts[HOST_ID], null, {}).flatMap((b) => b.items || [])
  assert.ok(items.some((a) => a.isTabs), 'la barra de plantas')
  const el = items.find((a) => a.isElement)
  assert.ok(el, 'el plano de la planta activa no se proyectó')
  assert.deepEqual(el.on, { 'room-selected': 'roomSelected' })
  assert.equal(el.importUrl, '/pms/floor-plan.js')
  assert.notEqual(el.elementId, 'fieldId', 'el id de relleno del servidor no puede ser el hueco')
  assert.ok(JSON.parse(el.attributes.rooms).length === 10)
})

test('Element: dos sin id en la misma pantalla tienen huecos distintos', () => {
  const el = (n) => node({ type: 'Element', name: 'x-chart', attributes: { n }, on: {} })
  const atoms = atomsOf(node({ type: 'Page' }, [{ ...el('1'), id: 'fieldId' }, { ...el('2'), id: 'fieldId' }]))
    .filter((a) => a.isElement)
  assert.equal(atoms.length, 2)
  assert.notEqual(atoms[0].elementId, atoms[1].elementId)
})

test('Element: el evento viaja al servidor como parámetro `event` con la acción del ÚLTIMO render', () => {
  const listeners = {}
  const element = { addEventListener: (n, fn) => { (listeners[n] = listeners[n] || []).push(fn) } }
  const sent = []
  setElementEventSink((actionId, parameters, atom) => sent.push({ actionId, parameters, nested: !!atom.fromNested }))
  wireElementEvents(element, { on: { 'room-selected': 'roomSelected' } })
  // un re-render con otra acción NO añade otro listener: cambia la acción que se lanza
  wireElementEvents(element, { on: { 'room-selected': 'openRoom' }, fromNested: true })
  assert.equal(listeners['room-selected'].length, 1)
  listeners['room-selected'][0]({ detail: { room: '104' }, constructor: { name: 'CustomEvent' } })
  assert.deepEqual(sent, [{ actionId: 'openRoom', parameters: { event: { room: '104' } }, nested: true }])
  // un evento que no es CustomEvent viaja con sus propiedades primitivas
  assert.deepEqual(serializeElementEvent({ clientX: 3, key: 'a', target: {}, fn() {} }), { clientX: 3, key: 'a' })
  setElementEventSink(null)
})

test('Element: un import relativo se carga del BACKEND (VB alojado/vb-serve son otro origen)', () => {
  assert.equal(elementModuleUrl('/pms/floor-plan.js', 'http://localhost:9005/'), 'http://localhost:9005/pms/floor-plan.js')
  assert.equal(elementModuleUrl('/pms/floor-plan.js', ''), '/pms/floor-plan.js')
  assert.equal(elementModuleUrl('https://cdn.example/x.js', 'http://b'), 'https://cdn.example/x.js')
})

test('Element: contenido HTML con `${…}` se marca para sanearlo al montarlo', () => {
  const [a, b] = atomsOf(node({ type: 'Page' }, [
    node({ type: 'Element', name: 'div', content: '<b>${state.name}</b>', html: true }),
    node({ type: 'Element', name: 'div', content: '<b>fijo</b>', html: true }),
  ]), { name: '<img src=x onerror=alert(1)>' }).filter((x) => x.isElement)
  assert.equal(a.dataInContent, true)
  assert.equal(b.dataInContent, false)
})

test('Element: la shell cablea módulo y sumidero ANTES de navegar; la página escucha el evento de aplicación', () => {
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.ok(shell.indexOf('setElementEventSink') < shell.indexOf("chain: 'onMateuNavigate'"))
  assert.match(shell, /setElementModuleBase\(base\)/)
  const page = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  // los eventos de aplicación se escuchan con el prefijo `application:` (sin él no llegan nunca)
  assert.ok(page.eventListeners['application:mateuElementEvent'])
  assert.ok(page.eventListeners['application:mateuRetryAction'])
  assert.ok(!page.eventListeners.mateuRetryAction && !page.eventListeners.mateuElementEvent)
  for (const rel of ['runMateuIslandAction.js', 'runMateuNestedAction.js'])
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + rel), /mountElementsSoon/, rel)
})

// ── shell tipo OPERA (HAMBURGER_SECTIONS con secciones anidadas) ──────────────────────────────

test('shell PMS real: sin home declarada arranca en la primera pantalla de la primera sección', () => {
  const reg = reduceContexts(empty(), fixture('shell'))
  assert.equal(reg.shell.homeRoute, '_no_home_route') // lo que manda el servidor
  const nav = shellNavOf(reg)
  assert.equal(nav.mode, 'sections')
  assert.equal(nav.homeRoute, '/inventory/floorPlan')
  assert.ok(isSentinelHome('_no_home_route') && isSentinelHome('/x/_page') && isSentinelHome(''))
  assert.ok(!isSentinelHome('/welcome'))
})

test('shell PMS real: una ruta del menú se carga con el serverSideType del app que la declara', () => {
  const menu = reduceContexts(empty(), fixture('shell')).shell.menu
  assert.equal(localMenuOptionOf(menu, '/inventory/floorPlan').serverSideType, 'io.mateu.mdd.demovbpms.infra.in.ui.PmsHome')
  // una sub-ruta (el detalle de un crud del menú) también es del app; una ruta que no es del menú, no
  assert.equal(localMenuOptionOf(menu, '/financials/billing/R1001?x=1').route, '/financials/billing')
  assert.equal(localMenuOptionOf(menu, '/floor-plan'), null)
  assert.equal(localMenuOptionOf(menu, '/inventoryX'), null)
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  assert.match(nav, /bridge\.loadMenuRouteInto\(/)
})

atest('loadMenuRouteInto: compuesta + SST del app; un RouteLink de grupo cae a su terminal', async () => {
  const shell = { serverSideType: 'app.Home', menu: [
    { label: 'Gestion', route: '/gestion', serverSideType: 'app.Home', submenus: [
      { label: 'Person', route: '/gestion/person', serverSideType: 'app.Home' },
      { label: 'Island', route: '/gestion/island-host', serverSideType: 'app.Home' },
    ] },
  ] }
  assert.equal(terminalMenuRouteOf(shell.menu, '/gestion/island-host?x=1'), '/island-host?x=1')
  const notFound = { fragments: [{ targetComponentId: '', action: 'Replace', component: { type: 'ClientSide', metadata: { type: 'Text', text: 'Not found.' } } }] }
  const page = (sst) => ({ fragments: [{ targetComponentId: '', action: 'Replace', state: {}, component: { type: 'ServerSide', id: 'p', serverSideType: sst, children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [] }] } }] })
  const sent = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    sent.push({ url: String(url), route: body.route, sst: body.serverSideType })
    const answer = body.route === '/gestion/person' ? page('app.Person')
      : body.route === '/gestion/island-host' ? notFound
        : body.route === '/island-host' ? page('app.Island') : notFound
    return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => answer, text: async () => JSON.stringify(answer) }
  }
  try {
    const reg0 = { contexts: {}, stack: [], shell }
    const a = await loadMenuRouteInto('', reg0, '/gestion/person')
    assert.equal(a.contexts[HOST_ID].tree.serverSideType, 'app.Person')
    assert.deepEqual(sent.map((x) => [x.route, x.sst]), [['/gestion/person', 'app.Home']])
    sent.length = 0
    const b = await loadMenuRouteInto('', reg0, '/gestion/island-host')
    assert.equal(b.contexts[HOST_ID].tree.serverSideType, 'app.Island')
    assert.deepEqual(sent.map((x) => [x.route, x.sst]), [['/gestion/island-host', 'app.Home'], ['/island-host', undefined]])
  } finally { globalThis.fetch = original }
})

for (const [name, fn] of pending) { await fn(); console.log(`  ✓ ${name}`); pass++ }
console.log(`\n${pass} tests PMS OK`)
void HOST_ID
