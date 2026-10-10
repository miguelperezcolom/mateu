// Tests de contrato de lo que se añadió para el reto PMS (OPERA Cloud sobre Mateu + Redwood):
// cada componente o comportamiento nuevo del renderer, con fixtures de wire real capturados de
// demo/demo-vb-pms (poc/fixtures/pms/*.json) o, cuando el wire es trivial, construidos a mano
// con la MISMA forma que emite el backend (record → DTO).
// Uso: node test-pms.mjs   (npm test ejecuta test.mjs y este)

import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { planningAtomOf, planningActionOf, overlayOf, panelExpanded, setPanelExpanded } from './reduceContexts.mjs'
import { installStickyHeader } from './tables.mjs'
import { actionPanelAtomOf, shortcutHintOf } from './reduceContexts.mjs'
import { shortcutMatches, parseShortcut } from './actionPanels.mjs'
import { matrixSpecOf, matrixAtomOf, matrixSectionKey } from './reduceContexts.mjs'
import { matrixCellParams, matrixEditChanged } from './matrix.mjs'
import { coverageProblems } from './parity-check.mjs'
import { coverageTable } from './coverage.mjs'
import { mapAtomOf, mapHeightOf } from './reduceContexts.mjs'
import { mapViewPlanOf, mapMarkerParams, SINGLE_MARKER_ZOOM } from './map.mjs'
import { attrSelectorValue } from './rules.mjs'
import { wizardOf, WIZARD_DONE_STEP } from './reduceContexts.mjs'
import { safeImageSrc } from './inputs.mjs'
import { routeUnderMount, normalizeMount, baseUrlOf, routeOfPath, pathOfRoute, initMount, setMount, isPathMode, mateuBase, mateuAssetBase, urlOfRoute, currentRouteOf, currentRoutePathOf } from './mount.mjs'
import { inAppRouteOfLink } from './links.mjs'
import { chartAtomOf, metricOf, gridTrackWeights, gridColClasses, panelColClass } from './reduceContexts.mjs'
import { calendarAtomOf, calPeriod, calEventsOn, calAddDays } from './calendar.mjs'
import { notificationsOf, notificationListOf, takeUndoToasts, undoMessageOf } from './notify.mjs'
import { startPolling, actionSucceeded, setPollingRunner, timedOnLoadTriggers } from './polling.mjs'
import { onLoadTriggers } from './reduceContexts.mjs'
import { assignAccessKeys, keyHint, setShortcutContext, currentShortcutActions } from './keys.mjs'
import { hoverLinesOf } from './hover.mjs'
import { draggedIdsOf, dragTypeOfMime } from './dnd.mjs'
import { dragMimeOf, listingHeaderBlocksOf } from './reduceContexts.mjs'
import { dayIndexAtX } from './planning.mjs'
import { applyColumnPrefs, columnChooserOf, prefsFromChooser, moveChooserItem, readColumnPrefs, writeColumnPrefs, saveView, listSavedViews, defaultView, deleteView, viewRouteOf, currentViewValues, viewsMenuOf, listingScope } from './prefs.mjs'
import { listingOf, groupedRows, rowToneOf, aggregateFootersOf } from './reduceContexts.mjs'
import { reduceContexts, islandContentOf, hostContentOf, hostContentShown, summarizeHost, shellNavOf, entityHeaderOf, taskQueueOf, formSectionsOf, layoutFieldOf, HOST_ID } from './reduceContexts.mjs'
import { localMenuOptionOf, isSentinelHome } from './navTree.mjs'
import { loadMenuRouteInto, terminalMenuRouteOf, bootstrapHasApp } from './transport.mjs'
import { fileDownloadOf, triggerDownload, applyDomEffects } from './files.mjs'
import { evaluateExpression, evaluateTemplate, computeRules, fieldFlagsOf, valueChangeActionOf } from './rules.mjs'
import { describeFileValue, isImageValue, captureTexts } from './inputs.mjs'
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
  assert.equal(applyDomEffects({ downloads: [{ base64Content: 'eA==' }, {}] }, null, fakeEnv().env), 1)
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
    const applies = (src.match(/bridge\.applyDomEffects\(reg\.effects, reg\)/g) || []).length
    assert.ok(reduces > 0, rel)
    assert.equal(applies, reduces, `${rel}: ${reduces} reducciones, ${applies} applyDomEffects`)
  }
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /'files\.mjs'/)
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
  // a local dev backend on plain http, as vb-serve uses it
  assert.equal(elementModuleUrl('/pms/floor-plan.js', 'http://localhost:9005/'), 'http://localhost:9005/pms/floor-plan.js') // NOSONAR
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
  assert.match(shell, /setElementModuleBase\(assetBase\)/)
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

// ── P0 #9: consola / maestro-detalle ─────────────────────────────────────────────────────────

test('MasterDetailLayout real (consola de la operadora): lista 5/12 a la izquierda, ficha 7/12 a la derecha', () => {
  const reg = reduceContexts(empty(), fixture('telephone-console'))
  const host = reg.contexts[HOST_ID]
  // ni la cola es el «modo cola» de página, ni la ficha del elegido es la cabecera de la página
  assert.equal(taskQueueOf(host.tree), null)
  assert.equal(entityHeaderOf(host), null)
  const blocks = hostContentOf(host, null, {})
  assert.equal(blocks.length, 2)
  assert.match(blocks[0].colClass, /oj-md-5 .*mateu-split-pane/)
  assert.match(blocks[1].colClass, /oj-md-7 .*mateu-split-pane/)
  const queue = blocks[0].items.find((a) => a.isQueue)
  const card = queue.groups[0].items[0]
  assert.equal(card.actionId, 'selectGuest')
  assert.deepEqual(card.parameters, { _item: card.id })
  assert.equal(queue.groups[0].items.filter((i) => i.selected).length, 1)
  assert.ok(blocks[1].items.some((a) => a.isEntityHeader))
  assert.equal(hostContentShown(blocks, summarizeHost(reg)), true)
})

test('SplitLayout vertical o anidado: se proyecta en su sitio, sin columnas', () => {
  const pane = (text) => node({ type: 'Text', text })
  const atoms = atomsOf(node({ type: 'Page' }, [
    node({ type: 'SplitLayout', orientation: 'vertical' }, [pane('arriba'), pane('abajo')]),
  ]))
  assert.deepEqual(atoms.filter((a) => a.isText).map((a) => a.text), ['arriba', 'abajo'])
})

// ── P0 #5: tipos de campo ──────────────────────────────────────────────────────────────────────

test('tarjeta de registro real: cada estereotipo con su widget (radio, múltiple, importe, captura)', () => {
  const reg = reduceContexts(empty(), fixture('registration-card'))
  const host = reg.contexts[HOST_ID]
  const fields = formSectionsOf(host.tree, host.state, host.data).flatMap((s) => s.fields)
  const by = Object.fromEntries(fields.map((f) => [f.fieldId, f]))
  assert.ok(by.documentType.isRadio)
  assert.deepEqual(by.documentType.options.map((o) => o.value), ['PASSPORT', 'ID_CARD', 'DRIVING_LICENCE'])
  // la lista de elección múltiple es UN campo (antes, una tabla o nada) con su valor como lista
  assert.ok(by.preferences.isMultiSelect)
  assert.deepEqual(by.preferences.value, ['QUIET_ROOM'])
  assert.equal(by.preferences.options.length, 6)
  // importe: número con el conversor de moneda de JET (en Node, su especificación)
  assert.ok(by.deposit.isMoney && by.deposit.value === 150)
  assert.equal(by.deposit.converter.options.style, 'currency')
  assert.deepEqual(['documentScan', 'voucher', 'photo', 'signature'].map((id) => by[id].isCapture && by[id].captureMode),
    ['camera', 'file', 'image', 'signature'])
  // ningún widget queda con flags a undefined (la plantilla los evalúa todos)
  for (const f of fields) for (const flag of ['isRadio', 'isMultiSelect', 'isCheckboxSet', 'isMoney', 'isCapture', 'isText'])
    assert.equal(typeof f[flag], 'boolean', f.fieldId + '.' + flag)
})

test('el form layout pinta los mismos widgets nuevos; una lista sin estereotipo sigue sin ser campo', () => {
  const md = (extra) => ({ type: 'FormField', fieldId: 'x', label: 'X', ...extra })
  assert.ok(layoutFieldOf(md({ dataType: 'array', stereotype: 'checkbox', options: [{ value: 'A' }] }), { x: 'A,B' }).isCheckboxSet)
  assert.deepEqual(layoutFieldOf(md({ dataType: 'array', stereotype: 'checkbox', options: [{ value: 'A' }] }), { x: 'A,B' }).value, ['A', 'B'])
  assert.ok(layoutFieldOf(md({ dataType: 'money', stereotype: 'regular' }), { x: '12.5' }).isMoney)
  assert.equal(layoutFieldOf(md({ dataType: 'array', stereotype: 'grid' }), {}), null)
})

test('plantilla: los widgets nuevos están en cada superficie de átomos y en las 7 copias de campos', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  for (const tag of ['<oj-radioset', '<oj-select-many', '<oj-checkboxset', '<mateu-capture-field'])
    assert.equal(page.split(tag).length - 1, surfaces + 7, tag)
  // cada copia conserva SU listener de cambio
  assert.match(page, /<oj-select-many[^>]*\n[^]*?on-value-changed="\[\[ \$listeners\.mateuRowFieldChanged \]\]"/)
  const imports = JSON.parse(webApp('flows/main/pages/main-start-page.json')).imports.components
  for (const c of ['oj-radioset', 'oj-checkboxset', 'oj-select-many', 'oj-option']) assert.ok(imports[c], c)
})

test('campo de captura: lo que enseña de un fichero y cuándo un valor es imagen', () => {
  assert.equal(describeFileValue('data:application/pdf;base64,JVBERi0xLjQK'), 'application/pdf · 9 B')
  assert.ok(isImageValue('data:image/png;base64,AAAA') && isImageValue('/files/a.png'))
  assert.ok(!isImageValue('data:application/pdf;base64,AAAA'))
  assert.equal(captureTexts('es-ES').signAgain, 'Volver a firmar')
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /defineCaptureField\(\)/)
})

// ── P0 #4: reglas y campos dependientes en el navegador ─────────────────────────────────────

test('evaluador de reglas sin eval (CSP de VB): lo que escriben las expresiones de Mateu', () => {
  const scope = { state: { guarantee: 'COMPANY', vip: false, nights: 3, tags: ['a', 'b'], name: 'Ana' }, data: {} }
  const ev = (e) => evaluateExpression(e, scope)
  assert.equal(ev("state.guarantee != 'CREDIT_CARD'"), true)
  assert.equal(ev("state.guarantee == 'COMPANY' && !state.vip"), true)
  assert.equal(ev('state.nights > 2 ? "long" : "short"'), 'long')
  assert.equal(ev('state.nights * 2 + 1'), 7)
  assert.equal(ev("state.tags.includes('b')"), true)
  assert.equal(ev('state.name.length'), 3)
  assert.equal(ev("state['name'].toUpperCase()"), 'ANA')
  assert.equal(ev('state.missing.deep'), undefined) // sin romper
  assert.equal(ev('alert(1)'), undefined) // ni funciones globales…
  assert.equal(ev('state.constructor.constructor("x")()'), undefined) // …ni escapar por el prototipo
  assert.equal(evaluateTemplate('${state.nights}', scope), 3)
  assert.equal(evaluateTemplate('${state.nights} nights', scope), '3 nights')
})

test('reglas de la nueva reserva real: @Hidden/@Disabled con expresión y un RuleSupplier', () => {
  const reg = reduceContexts(empty(), fixture('new-reservation'))
  const ctx = reg.contexts[HOST_ID]
  const flagsFor = (state) => fieldFlagsOf(computeRules(ctx.tree.rules, { state: { ...ctx.state, ...state }, data: ctx.data }).data)
  assert.deepEqual(flagsFor({ guarantee: 'NONE', vip: false }),
    { company: { disabled: true }, cardNumber: { hidden: true }, vipNotes: { hidden: true } })
  assert.deepEqual(flagsFor({ guarantee: 'CREDIT_CARD', vip: true }),
    { company: { disabled: true }, cardNumber: { hidden: false }, vipNotes: { hidden: false } })
  assert.equal(flagsFor({ guarantee: 'COMPANY' }).company.disabled, false)
  // llegada/noches disparan su acción del servidor (@Trigger OnValueChange); otro campo no
  assert.equal(valueChangeActionOf(ctx, 'nights', ctx.state), 'recalculate')
  assert.equal(valueChangeActionOf(ctx, 'arrival', ctx.state), 'recalculate')
  assert.equal(valueChangeActionOf(ctx, 'guest', ctx.state), null)
})

test('reglas: SetStateValue, RunAction y Stop', () => {
  const r = computeRules([
    { filter: 'state.qty > 10', action: 'SetStateValue', fieldName: 'discount', fieldAttribute: 'none', expression: '${state.qty * 2}' },
    { filter: 'true', action: 'RunAction', actionId: 'refresh', result: 'Stop' },
    { filter: 'true', action: 'SetDataValue', fieldName: 'never', fieldAttribute: 'hidden', value: true },
  ], { state: { qty: 12 } })
  assert.deepEqual(r, { state: { discount: 24 }, data: {}, actions: ['refresh'] })
})

test('reglas: cableado — contexto tras cada reducción y tras navegar, OnValueChange en las chains', () => {
  assert.ok(/setAfterReduceHook\(\(reg\) => \{\s*setRulesContext/.test(readFileSync(join(here, 'make-amd.mjs'), 'utf8')), 'el hook de reducción fija el contexto de las reglas')
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installRules\(\)/)
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /bridge\.applyDomEffects\(null, reg\)/)
  for (const rel of ['hostInputChanged.js', 'mateuFieldEdited.js'])
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + rel), /bridge\.valueChangeActionOf\(/, rel)
})

// ── menú de tarjetas (@Menu(display = cards)) ──────────────────────────────────────────────────

test('menú de tarjetas: el grupo se proyecta como tarjetas con su popup; las entradas con hijos llevan acciones', () => {
  const nav = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', menu: [
    { label: 'Bookings', route: '/bookings', submenus: [
      { label: 'New reservation', route: '/bookings/newReservation' },
      { label: 'Quick access', route: '/bookings/quickAccess', display: 'cards', submenus: [
        { label: 'Floor plan', route: '/bookings/quickAccess/floorPlan', description: 'Rooms by status', icon: 'vaadin:building' },
        { label: 'Check in', route: '/bookings/quickAccess/checkIn', description: 'Sign', image: '/img/c.png' },
        { label: 'Billing', route: '/bookings/quickAccess/billing', description: 'Folios', submenus: [
          { label: 'Folio', route: '/bookings/quickAccess/billing/folio' },
        ] },
      ] },
    ] },
  ] } })
  const group = nav.menuTree[0].children.find((c) => c.label === 'Quick access')
  assert.ok(group.isCards && group.popupId && group.anchorId && group.popupId !== group.anchorId)
  // estable entre proyecciones (el lanzador apunta al popup por id)
  const again = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', menu: [{ label: 'Bookings', route: '/bookings', submenus: [
    { label: 'Quick access', route: '/bookings/quickAccess', display: 'cards', submenus: [{ label: 'X', route: '/bookings/quickAccess/x' }] }] }] } })
  assert.equal(again.menuTree[0].children[0].popupId, group.popupId)
  const [plan, checkIn, billing] = group.cards
  assert.deepEqual([plan.label, plan.description, plan.navigable, plan.hasIcon, plan.hasImage], ['Floor plan', 'Rooms by status', true, true, false])
  assert.ok(plan.iconClass.startsWith('oj-ux-ico'))
  assert.deepEqual([checkIn.hasImage, checkIn.image, checkIn.hasIcon], [true, '/img/c.png', false])
  assert.equal(billing.navigable, false)
  assert.deepEqual(billing.actions, [{ id: '/bookings/quickAccess/billing/folio', label: 'Folio' }])
  // un grupo normal sigue siendo un desplegable
  assert.equal(nav.menuTree[0].isCards, false)
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /\$current\.data\.hasChildren && !\$current\.data\.isCards/)
  assert.match(shell, /oj-popup :id="\[\[ \$current\.data\.popupId \]\]" class="mateu-card-popup"/)
  assert.ok(JSON.parse(webApp('pages/shell-page.json')).eventListeners.cardMenuToggle)
})

// ── P0 #1: Room Diary (PlanningBoard → oj-gantt) ──────────────────────────────────────────────

test('Room Diary real: filas con sus atributos, estancias con color, ★ VIP, resumen y fin pintado al día siguiente', () => {
  const reg = reduceContexts(empty(), fixture('room-diary'))
  const atom = hostContentOf(reg.contexts[HOST_ID], null, {}).flatMap((b) => b.items || []).find((a) => a.isPlanning)
  assert.ok(atom, 'el tape chart no se proyectó')
  assert.equal(atom.rows.length, 40)
  assert.match(atom.rows[0].label, /^101 · STD · (CL|IP|DI|PU|OS|OO)$/)
  assert.deepEqual([atom.dndMove, atom.taskResizable], ['enabled', 'enabled'])
  assert.deepEqual([atom.moveActionId, atom.resizeActionId, atom.openActionId, atom.rangeSelectActionId],
    ['moveStay', 'resizeStay', 'openStay', 'newStay'])
  const block = fixture('room-diary').fragments[0].component
  const task = atom.rows.flatMap((r) => r.tasks).find((t) => t.label.startsWith('★'))
  assert.ok(task, 'ninguna estancia VIP marcada')
  assert.match(task.shortDesc, /VIP/)
  assert.ok(task.svgStyle && task.svgStyle.fill)
  void block
  // el día de fin (inclusivo en Mateu) se pinta hasta el día siguiente
  const m = { resources: [{ id: '101', label: '101' }], blocks: [{ id: 'b', resourceId: '101', start: '2026-10-12', end: '2026-10-13' }], from: '2026-10-11', to: '2026-10-24' }
  const one = planningAtomOf(m, 'x').rows[0].tasks[0]
  assert.deepEqual([one.start, one.end], ['2026-10-12T00:00:00', '2026-10-14T00:00:00'])
  assert.equal(planningAtomOf(m, 'x').end, '2026-10-25T00:00:00')
})

test('Room Diary: los eventos de oj-gantt se traducen a la acción de Mateu (días locales, fin inclusivo)', () => {
  const atom = planningAtomOf({ moveActionId: 'move', resizeActionId: 'resize', openActionId: 'open', rangeSelectActionId: 'range', resources: [], blocks: [] }, 'x')
  const local = (y, mo, d, h) => new Date(y, mo - 1, d, h).toISOString()
  // ojMove: start/end = nuevos límites (value = instante bajo el puntero, se ignora); se redondea al día
  assert.deepEqual(planningActionOf(atom, 'move', {
    taskContexts: [{ data: { id: 'R1' } }], rowContext: { rowData: { id: '104' } },
    value: local(2026, 10, 16, 9), start: local(2026, 10, 13, 9), end: local(2026, 10, 19, 9) }),
  { actionId: 'move', parameters: { _blockId: 'R1', _resourceId: '104', _start: '2026-10-13', _end: '2026-10-18' } })
  assert.deepEqual(planningActionOf(atom, 'resize', {
    taskContexts: [{ data: { id: 'R2' }, rowData: { id: '102' } }], start: local(2026, 10, 15, 0), end: local(2026, 10, 21, 1) }),
  { actionId: 'resize', parameters: { _blockId: 'R2', _resourceId: '102', _start: '2026-10-15', _end: '2026-10-20' } })
  assert.deepEqual(planningActionOf(atom, 'open', { taskId: 'R3' }), { actionId: 'open', parameters: { _blockId: 'R3' } })
  // sin la acción declarada, nada
  assert.equal(planningActionOf(planningAtomOf({ resources: [], blocks: [] }, 'y'), 'move', { taskContexts: [{ data: { id: 'R1' } }] }), null)
})

test('Room Diary: el día bajo el puntero sale de las etiquetas reales del eje (zoom y scroll incluidos)', () => {
  const centers = [{ x: 240, index: 0 }, { x: 322, index: 1 }, { x: 404, index: 2 }]
  assert.equal(dayIndexAtX(240, centers), 0)
  assert.equal(dayIndexAtX(280, centers), 0)
  assert.equal(dayIndexAtX(285, centers), 1)
  assert.equal(dayIndexAtX(1060, centers), 10) // más allá de las etiquetas medidas: extrapola
  assert.equal(dayIndexAtX(10, []), null)
  const tpl = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
  assert.match(tpl, /<oj-gantt class="mateu-planning/)
  assert.match(tpl, /row-axis\.rendered="on"/)
  const page = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  for (const l of ['planningMoved', 'planningResized', 'planningDblClick']) assert.ok(page.eventListeners[l], l)
  assert.ok(page.imports.components['oj-gantt'])
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installPlanningRange\(\)/)
})

test('Drawer: el subtítulo del wire llega a la proyección del overlay', () => {
  const reg = reduceContexts(empty(), { fragments: [{ targetComponentId: '', action: 'Add', component: { type: 'ClientSide', id: 'd1',
    metadata: { type: 'Drawer', headerTitle: 'New reservation', subtitle: 'Room 102 · 12 oct → 14 oct', content: { type: 'ClientSide', metadata: { type: 'Text', text: 'x' } } } } }] })
  const o = overlayOf(reg)
  assert.equal(o.title, 'New reservation')
  assert.equal(o.subtitle, 'Room 102 · 12 oct → 14 oct')
})

// ── P0 #7: listados (grupos y totales, tonos, columnas, vistas, exportación) ─────────────────

const memoryStorage = () => { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) } } }

test('folio real agrupado por código: filas de grupo con subtotales y el total al pie', () => {
  let reg = empty()
  for (const inc of fixture('folio-seq')) reg = reduceContexts(reg, inc)
  const l = listingOf(reg.contexts[HOST_ID])
  const groups = l.rows.filter((r) => r._group)
  assert.equal(groups.length, 4)
  assert.match(groups[0].code, /^1000 · Accommodation \(\d+\)$/)
  assert.ok(groups[0].amount, 'el grupo lleva el subtotal de amount')
  assert.equal(groups[0]._tone, 'group')
  assert.ok(l.hasTotals && l.totals.amount && l.totals.tax)
  assert.ok(l.columns.some((c) => c.footerTemplate === 'footerTotal'))
  // la fila de grupo va ANTES de las suyas
  assert.ok(!l.rows[1]._group && l.rows[1].code === groups[0].code.replace(/ \(\d+\)$/, ''))
})

test('tonos de fila (@RowStatus): nombre, constante de enum o Status; y la plantilla los pinta', () => {
  assert.equal(rowToneOf({ t: 'warning' }, 't'), 'warning')
  assert.equal(rowToneOf({ t: 'ERROR' }, 't'), 'danger')
  assert.equal(rowToneOf({ t: { type: 'SUCCESS' } }, 't'), 'success')
  assert.equal(rowToneOf({ t: 'purple' }, 't'), null)
  assert.equal(rowToneOf({ t: 'warning' }, ''), null)
  const md = { rowStatusField: 'tone', columns: [{ metadata: { id: 'guest' } }] }
  const reg = reduceContexts(empty(), { fragments: [{ targetComponentId: '', action: 'Replace', state: {},
    data: { crud: { page: { content: [{ guest: 'A', tone: 'warning' }, { guest: 'B', tone: null }], totalElements: 2 } } },
    component: { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'Crud', ...md } }] } }] })
  const rows = listingOf(reg.contexts[HOST_ID]).rows
  assert.deepEqual(rows.map((r) => r._tone || null), ['warning', null])
  const css = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'css', 'app.css'), 'utf8')
  assert.match(css, /#mateuTable tr\.mateu-row-tone-warning > td/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installRowTones\(\)/)
})

test('selector de columnas: ocultar y reordenar, mismas claves que el renderer web, técnicas intactas', () => {
  const cols = [{ field: '_select' }, { field: 'id', headerText: 'Id' }, { field: 'guest', headerText: 'Guest' }, { field: 'room', headerText: 'Room' }, { field: 'act', template: 'cellRowActions' }]
  const store = memoryStorage()
  let items = columnChooserOf(cols, null)
  assert.deepEqual(items.map((x) => x.id), ['id', 'guest', 'room'])
  items = moveChooserItem(moveChooserItem(items, 'guest', -1), 'room', -1)
  items = items.map((x) => (x.id === 'id' ? { ...x, visible: false } : x))
  writeColumnPrefs('/r', prefsFromChooser(items), store)
  assert.deepEqual(JSON.parse(store.getItem('mateu-column-prefs'))['/r'], { hidden: ['id'], order: ['guest', 'room', 'id'] })
  assert.deepEqual(applyColumnPrefs(cols, readColumnPrefs('/r', store)).map((c) => c.field), ['_select', 'guest', 'room', 'act'])
  writeColumnPrefs('/r', null, store)
  assert.equal(readColumnPrefs('/r', store), null)
})

test('vistas guardadas: mismo formato que el web, una por defecto, se aplican por la query', () => {
  const store = memoryStorage()
  saveView('/r', { name: 'Smiths', values: currentViewValues({ status: 'IN_HOUSE' }, 'Smith') }, store)
  saveView('/r', { name: 'VIP', values: { vip: true }, isDefault: true }, store)
  assert.deepEqual(listSavedViews('/r', store).map((v) => v.name), ['Smiths', 'VIP'])
  assert.equal(defaultView('/r', store).name, 'VIP')
  assert.equal(viewRouteOf('/r?x=1', { status: 'IN_HOUSE', searchText: 'Smith', empty: '' }), '/r?status=IN_HOUSE&searchText=Smith')
  assert.deepEqual(viewsMenuOf('/r', store).map((o) => o.label), ['Smiths', '★ VIP', 'Save current view…', 'Clear filters'])
  deleteView('/r', 'VIP', store)
  assert.equal(defaultView('/r', store), null)
  assert.equal(listingScope({ hash: '#/bookings/reservations?a=1', pathname: '/' }), '/bookings/reservations')
  assert.equal(listingScope({ hash: '', pathname: '/bookings/reservations' }), '/bookings/reservations')
})

test('listado: menú de vistas con refresh, diálogos de columnas/vista y vista por defecto al abrir', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /id="mateuColumnsDialog"/)
  assert.match(page, /id="mateuSaveViewDialog"/)
  assert.match(webApp('flows/main/pages/main-start-page-chains/listingViews.js'), /menu\.refresh\(\)/)
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /bridge\.defaultView\(bridge\.listingScope\(\)\)/)
  assert.match(webApp('flows/main/pages/main-start-page-chains/mateuRowClicked.js'), /row\._group/)
})

// ── #6 paneles plegables, foldout dentro de pestaña, cabecera fija ───────────────────────────
const ctext = (t) => node({ type: 'Text', text: t })
test('AccordionLayout y Details se aplanan en átomos isCollapsible; plegar es estado de cliente', () => {
  const acc = { type: 'ClientSide', id: 'acc1', metadata: { type: 'AccordionLayout' }, children: [
    node({ type: 'AccordionPanel', label: 'Stay details', active: true }, [ctext('stay body')]),
    node({ type: 'AccordionPanel', label: 'Guest profile' }, [ctext('profile body')]),
  ] }
  let atoms = atomsOf(acc)
  const heads = atoms.filter((a) => a.isCollapsible)
  assert.deepEqual(heads.map((h) => [h.title, h.expanded]), [['Stay details', true], ['Guest profile', false]])
  assert.ok(atoms.some((a) => a.text === 'stay body'))
  assert.ok(!atoms.some((a) => a.text === 'profile body'), 'un panel cerrado no pinta su contenido')
  setPanelExpanded(heads[1].collapsibleKey, true)
  atoms = atomsOf(acc)
  assert.ok(atoms.some((a) => a.text === 'profile body'), 'abrirlo re-proyecta sin servidor')
  assert.equal(panelExpanded(heads[1].collapsibleKey, false), true)
  setPanelExpanded(heads[1].collapsibleKey, false)
  const det = node({ type: 'Details', summary: ctext('Alerts (1)'), content: ctext('VIP arriving'), opened: false })
  const d = atomsOf(det)
  assert.equal(d[0].isCollapsible, true)
  assert.equal(d[0].title, 'Alerts (1)')
  assert.ok(!d.some((a) => a.text === 'VIP arriving'))
})

test('FoldoutLayout dentro de una pestaña: overview en su sitio y paneles plegables (open respetado)', () => {
  const foldout = { type: 'ClientSide', id: 'windows', metadata: { type: 'FoldoutLayout', panels: [
    { title: 'Window 1 · Guest', open: true }, { title: 'Window 2 · Cash', open: false }] }, children: [
    { ...ctext('Folio balance'), slot: 'overview' },
    { ...ctext('w1 charges'), slot: 'panel-0' },
    { ...ctext('w2 charges'), slot: 'panel-1' },
  ] }
  const tree = { type: 'ClientSide', id: '_tabs', metadata: { type: 'TabLayout' }, children: [
    node({ type: 'Tab', label: 'Overview' }, [ctext('ov')]),
    node({ type: 'Tab', label: 'Billing', active: true }, [foldout]),
  ] }
  const atoms = atomsOf(tree)
  assert.ok(atoms.some((a) => a.text === 'Folio balance'))
  assert.deepEqual(atoms.filter((a) => a.isCollapsible).map((a) => [a.title, a.expanded]),
    [['Window 1 · Guest', true], ['Window 2 · Cash', false]])
  assert.ok(atoms.some((a) => a.text === 'w1 charges'))
  assert.ok(!atoms.some((a) => a.text === 'w2 charges'))
})

test('re-proyecciones del host (pestaña, panel) quitan el EntityHeader que ya pinta la banda', () => {
  for (const chain of ['contentTabSelected.js', 'panelToggled.js']) {
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + chain), /dropEntityHeader: !!bridge\.entityHeaderOf\(host\)/, chain)
  }
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /oj-collapsible/)
  assert.match(page, /mateuPageHeader\.bandClass/)
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /mateu-sticky-header/)
})

test('cabecera fija: body.mateu-scrolled al dejar atrás la cabecera, y sólo cuando cambia', () => {
  const listeners = {}
  const classes = new Set()
  let toggles = 0
  const win = { scrollY: 0, addEventListener: (n, f) => { listeners[n] = f },
    document: { body: { classList: { toggle: (c, on) => { toggles++; on ? classes.add(c) : classes.delete(c) } } } } }
  installStickyHeader(win)
  installStickyHeader(win)
  win.scrollY = 100; listeners.scroll()
  assert.ok(classes.has('mateu-scrolled'))
  win.scrollY = 120; listeners.scroll()
  assert.equal(toggles, 1)
  win.scrollY = 0; listeners.scroll()
  assert.ok(!classes.has('mateu-scrolled'))
})

// ── #8 «I want to…» (ActionPanel) ────────────────────────────────────────────────────────────
const apItem = (label, extra = {}) => ({ label, actionId: 'iWantTo', parameters: { what: label }, populated: false, disabled: false, ...extra })
const apWire = {
  type: 'ActionPanel', label: 'I want to…', shortcut: 'ctrl+i', maxPerCategory: 3, hideUnpopulatedToggle: true,
  categories: [
    { title: 'Modify', actions: [apItem('Check out'), apItem('Routing'), apItem('Traces', { count: 2, populated: true }), apItem('Packages'), apItem('Alerts', { count: 30, populated: true })] },
    { title: 'Create', actions: [apItem('Copy')] },
    { title: 'Empty', actions: [] },
  ],
}
test('ActionPanel: poblados primero, corte en maxPerCategory con «Show more», 25+ y columnas vacías fuera', () => {
  const a = actionPanelAtomOf(apWire, 'iWantTo')
  assert.equal(a.isActionPanel, true)
  assert.equal(a.panelId, 'mateuActionPanel-iWantTo')
  assert.equal(a.shortcut, 'ctrl+i')
  assert.equal(a.title, 'I want to…  (Ctrl+I)')
  assert.equal(a.hideToggle, true)
  assert.deepEqual(a.categories.map((c) => c.title), ['Modify', 'Create'])
  const modify = a.categories[0]
  assert.deepEqual(modify.actions.map((x) => x.label), ['Traces (2)', 'Alerts (25+)', 'Check out', 'Routing', 'Packages'])
  assert.deepEqual(modify.actions.map((x) => x.itemClass.includes('mateu-ap-extra')), [false, false, false, true, true])
  assert.ok(modify.actions[0].itemClass.includes('mateu-ap-populated'))
  assert.ok(modify.actions[2].itemClass.includes('mateu-ap-unpopulated'))
  assert.equal(modify.hasMore, true)
  assert.equal(modify.moreLabel, 'Show more (2)')
  // lo que esconde «Show more» son sólo vacías → con «ocultar vacías» también se va
  assert.ok(modify.moreClass.includes('mateu-ap-unpopulated'))
  assert.ok(a.categories[1].columnClass.includes('mateu-ap-column-unpopulated'))
  assert.deepEqual(modify.actions[0].parameters, { what: 'Traces' })
  assert.equal(actionPanelAtomOf({ categories: [] }, '').label, 'I want to…')
})

test('ActionPanel: atajo por e.key o e.code (independiente del teclado) y sin modificadores de más', () => {
  assert.deepEqual(parseShortcut('Ctrl+Shift+I'), { ctrl: true, alt: false, shift: true, meta: false, key: 'i' })
  assert.equal(shortcutMatches('ctrl+i', { ctrlKey: true, key: 'i', code: 'KeyI' }), true)
  assert.equal(shortcutMatches('ctrl+i', { ctrlKey: true, key: '¡', code: 'KeyI' }), true)
  assert.equal(shortcutMatches('ctrl+i', { ctrlKey: true, shiftKey: true, key: 'I', code: 'KeyI' }), false)
  assert.equal(shortcutMatches('ctrl+i', { key: 'i', code: 'KeyI' }), false)
  assert.equal(shortcutMatches('alt+1', { altKey: true, key: '¡', code: 'Digit1' }), true)
  assert.equal(shortcutHintOf('ctrl+shift+i'), 'Ctrl+Shift+I')
})

test('ActionPanel: la plantilla usa oj-dialog + oj-switch de JET y el atajo se instala desde la shell', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /isActionPanel/)
  assert.match(page, /<oj-dialog :id="\[\[ \$current\.data\.panelId \]\]"/)
  assert.match(page, /oj-switch data-ap-hide="true"[^>]*label-edge="inside"/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installActionPanels\(\)/)
  const css = webApp('resources/css/app.css')
  assert.match(css, /\.mateu-ap-column:not\(\.mateu-ap-showall\) \.mateu-ap-extra \{ display: none; \}/)
})

// ── #10 MatrixGrid → oj-data-grid ────────────────────────────────────────────────────────────
const mxCell = (value, extra = {}) => ({ value, tone: null, link: false, ...extra })
const mxWire = {
  type: 'MatrixGrid', rowHeaderLabel: 'Room type', cellActionId: 'openDay', editActionId: 'setOverbooking',
  columns: [
    { id: '2026-10-17', label: 'Sat 17', group: 'Oct 2026', tone: 'neutral' },
    { id: '2026-10-31', label: 'Sat 31', group: 'Oct 2026', tone: null },
    { id: '2026-11-01', label: 'Sun 1', group: 'Nov 2026', tone: null },
  ],
  sections: [
    { id: 'house', title: 'House', collapsed: false, rows: [
      { id: 'available', label: 'Available', emphasis: true, editable: false,
        cells: [mxCell('12', { link: true }), mxCell('-1', { tone: 'danger', link: true }), mxCell('4')] }] },
    { id: 'controls', title: 'Controls', collapsed: true, rows: [
      { id: 'ob', label: 'Overbooking', emphasis: false, editable: true, cells: [mxCell('0'), mxCell('2'), mxCell('')] }] },
    { id: 'loose', title: null, collapsed: false, rows: [
      { id: 'note', label: 'Note', emphasis: false, editable: false, cells: [mxCell('a'), mxCell('b'), mxCell('c')] }] },
  ],
}
test('MatrixGrid: árbol de secciones (nodos §), columnas c0..cN, grupos de mes en dos niveles', () => {
  const spec = matrixSpecOf(mxWire, 'availability')
  assert.equal(spec.gridId, 'availability')
  assert.deepEqual(spec.columnKeys, ['c0', 'c1', 'c2'])
  assert.deepEqual(spec.data.map((r) => r.id), ['§house', '§controls', 'loose/note'])
  assert.deepEqual(spec.data[0].children.map((r) => r.id), ['house/available'])
  // abierta la que no viene plegada; la plegada, cerrada
  assert.deepEqual(spec.expanded, ['§house'])
  assert.deepEqual(spec.columnHeaders, [
    { data: 'Oct 2026', children: [{ data: 'Sat 17' }, { data: 'Sat 31' }] },
    { data: 'Nov 2026', children: [{ data: 'Sun 1' }] },
  ])
  const available = spec.data[0].children[0]
  assert.equal(available.c1.v, '-1')
  assert.equal(available.c1.link, true)
  assert.match(available.c1.cls, /mateu-matrix-danger/)
  assert.match(available.c0.cls, /mateu-matrix-neutral/, 'el tono de la columna (fin de semana) tiñe la celda')
  assert.match(available.c0.cls, /mateu-matrix-emphasis/)
  assert.equal(available.c0.rowId, 'available')
  assert.equal(available.c0.columnId, '2026-10-17')
  const ob = spec.data[1].children[0]
  assert.equal(ob.c0.editable, true)
  assert.equal(available.c0.editable, false)
})

test('MatrixGrid: sin cellActionId no hay enlaces, sin editActionId no hay edición; sin grupos, cabecera plana', () => {
  const spec = matrixSpecOf({ ...mxWire, cellActionId: null, editActionId: null, columns: mxWire.columns.map((c) => ({ ...c, group: null })) }, 'g')
  assert.equal(spec.data[0].children[0].c0.link, false)
  assert.equal(spec.data[1].children[0].c0.editable, false)
  assert.deepEqual(spec.columnHeaders, ['Sat 17', 'Sat 31', 'Sun 1'])
})

test('MatrixGrid: plegar es estado de cliente que sobrevive a re-proyectar; clase y edición por celda', () => {
  setPanelExpanded(matrixSectionKey('availability', 'controls'), true)
  setPanelExpanded(matrixSectionKey('availability', 'house'), false)
  const a = matrixAtomOf(mxWire, 'availability')
  assert.deepEqual(a.spec.expanded, ['§controls'])
  setPanelExpanded(matrixSectionKey('availability', 'controls'), false)
  setPanelExpanded(matrixSectionKey('availability', 'house'), true)
  assert.equal(a.isMatrix, true)
  assert.equal(a.gridId, 'mateuMatrix-availability')
  assert.equal(typeof a.gridStyle, 'object', 'el :style de JET quiere un objeto')
  const ctx = (d) => ({ data: { data: d } })
  const cell = a.spec.data[0].children[0].c1
  assert.match(a.cellClassName(ctx(cell)), /mateu-matrix-danger/)
  assert.equal(a.cellEditable(ctx(cell)), 'disable')
  assert.equal(a.cellEditable(ctx(matrixAtomOf(mxWire, 'availability').spec.data[0].children[0].c0)), 'disable')
  assert.deepEqual(matrixCellParams('ob', '2026-10-17', '3'), { _rowId: 'ob', _columnId: '2026-10-17', _value: '3' })
  assert.equal(matrixEditChanged('0', '0'), false)
  assert.equal(matrixEditChanged('0', '3'), true)
})

test('MatrixGrid: la plantilla usa oj-data-grid con cell.editable/cell.class-name y la shell instala el comportamiento', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /<oj-data-grid class="mateu-matrix/)
  assert.match(page, /cell\.editable="\[\[ \$current\.data\.cellEditable \]\]"/)
  assert.match(page, /cell\.class-name="\[\[ \$current\.data\.cellClassName \]\]"/)
  assert.match(webApp('flows/main/pages/main-start-page.json'), /"oj-data-grid": \{\s*"path": "ojs\/ojdatagrid"/)
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.installMatrixGrids\(\)/)
  assert.match(shell, /bridge\.setMatrixActionSink\(runPageAction\)/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /new RowDataGridProvider\.RowDataGridProvider\(flat/)
})

// ── #11 parity.md dice la verdad ─────────────────────────────────────────────────────────────
test('parity-check: detecta tipos sin clasificar, promesas sin rama, ramas sin promesa y tabla rancia', () => {
  const coverage = { Text: { status: 'full' }, Kanban: { status: 'none' }, Chart: { status: 'partial', via: "findByType(panel, 'Chart')" } }
  const source = "if (t === 'Text') {} findByType(panel, 'Chart')"
  const ok = { wireTypes: ['Text', 'Kanban', 'Chart'], coverage, source, parity: '<!-- redwood-coverage:start -->\n' + coverageTable(coverage) + '\n<!-- redwood-coverage:end -->' }
  assert.deepEqual(coverageProblems(ok), [])
  assert.match(coverageProblems({ ...ok, wireTypes: [...ok.wireTypes, 'Map'] })[0], /Map is not classified/)
  assert.match(coverageProblems({ ...ok, wireTypes: ['Text', 'Kanban'] })[0], /lists Chart, which the wire does not have/)
  assert.match(coverageProblems({ ...ok, source: "findByType(panel, 'Chart')" }).join(), /Text is claimed full but the renderer has no t === 'Text'/)
  assert.match(coverageProblems({ ...ok, source: source + " t === 'Kanban'" }).join(), /Kanban is marked none but the renderer has/)
  assert.match(coverageProblems({ ...ok, parity: '<!-- redwood-coverage:start -->\nold\n<!-- redwood-coverage:end -->' }).join(), /stale/)
})

// ── P1 #13 dashboard y gráficos en cualquier página ──────────────────────────────────────────
test('dashboard real (/home/dashboard): KPIs en una banda a todo el ancho y paneles con su colSpan', () => {
  const reg = fixture('dashboard').reduce((r, inc) => reduceContexts(r, inc), empty())
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: 'Dashboard' })
  const kpis = blocks[0].items.find((a) => a.isScoreboard)
  assert.ok(kpis, 'la banda de KPIs')
  assert.deepEqual(kpis.metrics.map((x) => x.title), ['Arrivals today', 'In house', 'Departures today', 'Occupancy tonight'])
  assert.equal(kpis.metrics[1].actionId, 'openInHouse')
  assert.match(blocks[0].blockClass, /oj-md-12/)
  const panels = blocks.slice(1)
  assert.deepEqual(panels.map((b) => (b.blockClass.match(/oj-md-(\d+)/) || [])[1]), ['8', '4', '8', '4'])
  assert.ok(panels.every((b) => b.isCard && b.items.some((a) => a.isChart)))
  const charts = panels.map((b) => b.items.find((a) => a.isChart))
  assert.deepEqual(charts.map((c) => c.chartType), ['line', 'pie', 'bar', 'pie'])
  assert.equal(charts[1].innerRadius, 0.55, 'doughnut = tarta con hueco')
  assert.equal(charts[0].legend, 'on', 'dos series → leyenda')
})

test('Chart → items de oj-chart: varias series; en tarta cada etiqueta es una porción; polar y dispersión', () => {
  const m = { chartType: 'bar', chartData: { labels: ['STD', 'SUP'], datasets: [{ label: 'Room', data: [10, 20] }, { label: 'Extras', data: [1, 2] }] } }
  const a = chartAtomOf(m, 'Chart')
  assert.deepEqual(a.items.map((i) => [i.series, i.group, i.value]), [['Room', 'STD', 10], ['Room', 'SUP', 20], ['Extras', 'STD', 1], ['Extras', 'SUP', 2]])
  assert.deepEqual(a.items.map((i) => i._rowNumber), [0, 1, 2, 3], 'clave del ArrayDataProvider')
  const pie = chartAtomOf({ ...m, chartType: 'pie', chartData: { labels: ['a', 'b'], datasets: [{ label: 'X', data: [1, 3] }] } }, 'Chart')
  assert.deepEqual(pie.items.map((i) => [i.series, i.group]), [['a', 'X'], ['b', 'X']])
  assert.equal(chartAtomOf({ ...m, chartType: 'radar' }, 'Chart').coordinateSystem, 'polar')
  assert.equal(chartAtomOf({ ...m, chartType: 'scatter' }, 'Chart').lineType, 'none')
  const trend = chartAtomOf({ title: 'Occ', values: [1, 2], labels: ['d1', 'd2'], area: true }, 'TrendChart')
  assert.equal(trend.chartType, 'area')
  assert.equal(trend.title, 'Occ')
  assert.equal(typeof trend.chartStyle, 'object')
})

test('MetricCard: tendencia con flecha y color; ResponsiveGrid: pesos de pista y auto-colocación', () => {
  const k = metricOf({ title: 'Occ', value: 53, unit: '%', trend: 'down', trendLabel: 'vs LW', actionId: 'x' })
  assert.equal(k.value, '53')
  assert.equal(k.trendText, '▼ vs LW')
  assert.match(k.trendClass, /mateu-trend-down/)
  assert.deepEqual(gridTrackWeights('repeat(3, minmax(0, 1fr))'), [1, 1, 1])
  assert.deepEqual(gridTrackWeights('64fr 36fr'), [64, 36])
  assert.deepEqual(gridTrackWeights('62% 38%'), [62, 38], 'las zonas de @Zones viajan en %')
  assert.deepEqual(gridTrackWeights('repeat(auto-fill, minmax(16rem, 1fr))'), [], 'auto-fill: lo decide el ancho, se apila')
  assert.deepEqual(gridColClasses('64fr 36fr', [], 2).map((c) => c.match(/oj-md-(\d+)/)[1]), ['8', '4'])
  // span 2 + span 2 en 3 pistas: el segundo no cabe → fila nueva
  assert.deepEqual(gridColClasses('1fr 1fr 1fr', [2, 2, 1], 3).map((c) => c.match(/oj-md-(\d+)/)[1]), ['8', '8', '4'])
  assert.equal(gridColClasses('1fr', [], 2), null)
  assert.match(panelColClass(2, 3), /oj-md-8/)
})

// ── P1 #12 calendario: mes, semana, día, lista; celdas por fecha; fechas que actúan ─────────
const calWire = {
  type: 'Calendar', month: '2026-10-28', view: 'month', views: ['month', 'week', 'day', 'list'], dayActionId: 'openCalendarDay',
  days: [{ date: '2026-10-30', label: 'Avail 3', tone: 'danger' }],
  events: [
    { id: 'conv', title: 'Convention', date: '2026-10-29', endDate: '2026-10-31', startTime: '09:00', endTime: '18:00', color: '#2c6e8f', actionId: 'openCalendarEvent' },
    { id: 'gala', title: 'Gala', date: '2026-11-01', startTime: '20:00' },
    { id: 'early', title: 'Breakfast', date: '2026-10-30', startTime: '07:30' },
  ],
}
test('calendario: periodos por vista y eventos de varios días en cada día, por hora', () => {
  assert.deepEqual(calPeriod('week', '2026-10-28'), { from: '2026-10-26', to: '2026-11-01' })
  assert.deepEqual(calPeriod('list', '2026-02-10'), { from: '2026-02-01', to: '2026-02-28' })
  assert.equal(calAddDays('2026-03-29', 1), '2026-03-30', 'sin saltos de horario de verano')
  assert.deepEqual(calEventsOn(calWire.events, '2026-10-30').map((e) => e.id), ['early', 'conv'])
})

test('calendario: el átomo trae las cuatro vistas precomputadas, celdas con etiqueta y tono, y chips', () => {
  const a = calendarAtomOf(calWire, 'cal', '2026-10-28')
  assert.equal(a.isCalendar, true)
  assert.equal(a.view, 'month')
  assert.equal(a.hasSwitcher, true)
  assert.deepEqual(a.viewOptions.map((o) => o.label), ['Month', 'Week', 'Day', 'List'])
  assert.equal(a.monthCells.length % 7, 0)
  assert.equal(a.monthCells.filter((c) => c.blank).length, 3 + 1, 'octubre 2026: empieza en jueves y acaba en sábado')
  const d30 = a.monthCells.find((c) => c.date === '2026-10-30')
  assert.equal(d30.label, 'Avail 3')
  assert.match(d30.cls, /mateu-cal-danger/)
  assert.match(d30.cls, /mateu-cal-clickable/)
  assert.deepEqual(d30.events.map((e) => e.title), ['Breakfast', 'Convention'])
  assert.equal(d30.ariaLabel, 'Friday, October 30, Avail 3, 2 events')
  assert.deepEqual(a.weekHeads, ['Mon 26', 'Tue 27', 'Wed 28', 'Thu 29', 'Fri 30', 'Sat 31', 'Sun 1'])
  assert.equal(a.weekCells[3].events[0].text, '09:00–18:00 Convention')
  assert.deepEqual(a.weekCells[3].events[0].style, { borderLeftColor: '#2c6e8f' }, ':style de JET: objeto')
  assert.equal(a.weekCells[3].events[0].clickable, 'true')
  assert.equal(a.dayHead, 'Wednesday, October 28')
  assert.deepEqual(a.agenda.map((d) => d.date), ['2026-10-29', '2026-10-30', '2026-10-31'])
  assert.equal(a.titles.week, 'Oct 26 – Nov 1, 2026')
  assert.match(a.monthCells.find((c) => c.date === '2026-10-28').cls, /mateu-cal-today/)
})

test('calendario: la plantilla pinta las vistas por data-cal-shown, con oj-buttonset-one, y la shell lo instala', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /<oj-buttonset-one data-cal-switch="true"/)
  assert.match(page, /:data-cal-shown="\[\[ \$current\.data\.view \]\]"/)
  assert.match(webApp('flows/main/pages/main-start-page.json'), /"oj-buttonset-one": \{\s*"path": "ojs\/ojbutton"/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installCalendars\(\)/)
  assert.match(webApp('resources/css/app.css'), /\.mateu-cal\[data-cal-shown="week"\] \.mateu-cal-view\[data-for="week"\]/)
})

// ── P1 #17 campana de notificaciones y toasts con deshacer ───────────────────────────────────
test('campana: la lista de la respuesta Data, no leídas en negrita, insignia y etiqueta accesible', () => {
  const inc = { fragments: [{ targetComponentId: '', data: { _notifications: [
    { id: 'vip', title: 'VIP arriving', text: 'Room 106', route: '/bookings/reservation', unread: true, when: '08:12' },
    { id: 'eod', title: 'End of day', text: 'Done', route: '', unread: false },
  ] } }] }
  const list = notificationListOf(inc)
  assert.equal(list.length, 2)
  const m = notificationsOf(list)
  assert.equal(m.unread, 1)
  assert.equal(m.badge, '1')
  assert.equal(m.label, 'Notifications, 1 unread')
  assert.match(m.items[0].titleClass, /oj-typography-bold/)
  assert.doesNotMatch(m.items[1].titleClass, /bold/)
  assert.equal(notificationsOf(Array.from({ length: 12 }, (_, i) => ({ id: i, title: 't' }))).badge, '9+')
  assert.equal(notificationsOf([]).empty, true)
  assert.equal(notificationListOf({ fragments: [] }), null)
})

test('deshacer: el reducer guarda los campos undo; applyDomEffects los saca de los toasts normales', () => {
  const reg = reduceContexts(empty(), { messages: [
    { text: 'Moved', variant: 'success', undoActionId: 'undoMove', undoLabel: 'Undo', undoParameters: { _blockId: 'R1' } },
    { text: 'Saved', variant: 'info' },
  ], fragments: [], commands: [] })
  const toasts = reg.effects.toasts
  assert.equal(toasts[0].undoActionId, 'undoMove')
  assert.deepEqual(toasts[0].undoParameters, { _blockId: 'R1' })
  const same = toasts
  const undo = takeUndoToasts(reg.effects)
  assert.equal(undo.length, 1)
  assert.equal(reg.effects.toasts, same, 'la MISMA lista: las chains la leen después')
  assert.deepEqual(reg.effects.toasts.map((t) => t.text), ['Saved'])
  assert.deepEqual(undoMessageOf(undo[0]), { severity: 'confirmation', summary: 'Moved', autoTimeout: 10000, closeAffordance: 'defaults' })
})

test('campana y deshacer: la shell pinta la campana con oj-list-view y su chain; JET oj-message lleva el Undo', () => {
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /id="mateuBellButton"/)
  assert.match(shell, /<oj-list-view id="mateuBellList"[^>]*on-oj-item-action="\[\[ \$listeners\.bellItemAction \]\]"/)
  const json = webApp('pages/shell-page.json')
  assert.match(json, /"oj-list-view": \{\s*"path": "ojs\/ojlistview"/)
  assert.match(json, /"oj-list-item-layout": \{\s*"path": "ojs\/ojlistitemlayout"/)
  assert.match(webApp('pages/shell-page-chains/mateuBell.js'), /_notifications|fetchNotifications/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.setUndoSink\(runPageAction\)/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /slot', 'detail'/)
})

// ── P1 #16 refresco periódico (OnLoad con espera + OnSuccess) ────────────────────────────────
test('polling: los OnLoad con espera se programan (no se lanzan ya) y cada éxito programa la siguiente vuelta', () => {
  const pending = []
  const timer = (fn, ms) => { pending.push({ fn, ms }); return pending.length }
  const ran = []
  setPollingRunner((actionId, params, opts) => ran.push([actionId, opts.background]))
  const host = { tree: { serverSideType: 'FloorPlan', triggers: [
    { type: 'OnLoad', actionId: 'search' },
    { type: 'OnLoad', actionId: 'refreshRooms', timeoutMillis: 10000, background: true },
    { type: 'OnSuccess', actionId: 'refreshRooms', calledActionId: 'refreshRooms', timeoutMillis: 10000, background: true },
  ] } }
  assert.deepEqual(onLoadTriggers(host), ['search'], 'el inmediato sigue su camino; el de espera, no')
  assert.deepEqual(timedOnLoadTriggers(host).map((t) => t.actionId), ['refreshRooms'])
  startPolling(host, timer)
  assert.equal(pending.length, 1)
  assert.equal(pending[0].ms, 10000)
  pending[0].fn()
  assert.deepEqual(ran, [['refreshRooms', true]])
  // la vuelta terminó bien → la siguiente
  assert.equal(actionSucceeded(host, 'refreshRooms', timer), 1)
  assert.equal(pending.length, 2)
  // otra acción no reprograma nada; otra pantalla tampoco
  assert.equal(actionSucceeded(host, 'save', timer), 0)
  assert.equal(actionSucceeded({ tree: { serverSideType: 'Other', triggers: host.tree.triggers } }, 'refreshRooms', timer), 0)
  // se navega a otra pantalla: lo programado para la anterior vence sin ejecutarse
  startPolling({ tree: { serverSideType: 'Dashboard', triggers: [] } }, timer)
  pending[1].fn()
  assert.equal(ran.length, 1, 'una pantalla que ya no se ve deja de preguntar')
  setPollingRunner(null)
})

test('polling: dos éxitos seguidos del mismo trigger dejan UNA vuelta pendiente, no dos bucles', () => {
  const pending = []
  const timer = (fn, ms) => { const h = { fn, ms }; pending.push(h); return h }
  const ran = []
  setPollingRunner((actionId) => ran.push(actionId))
  const host = { tree: { serverSideType: 'Board', triggers: [
    { type: 'OnSuccess', actionId: 'search', calledActionId: 'search', timeoutMillis: 15000, background: true },
  ] } }
  startPolling(host, timer)
  actionSucceeded(host, 'search', timer)
  actionSucceeded(host, 'search', timer) // el OnLoad relanzado al repintar el host
  pending.forEach((p) => p.fn())
  assert.deepEqual(ran, ['search'], 'sólo la última vuelta programada corre')
  setPollingRunner(null)
})

test('polling: la shell lo arranca al navegar y el transporte avisa de cada éxito', () => {
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /bridge\.startPolling\(reg\.contexts\[bridge\.HOST_ID\]\)/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.setPollingRunner\(runPageAction\)/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /if \(inc\) actionSucceeded\(source, actionId\)/)
})

// ── P1 #15 atajos y teclas de acceso ─────────────────────────────────────────────────────────
test('teclas de acceso: iniciales primero, sin repetir, saltando las reservadas; luego letras y cifras', () => {
  assert.deepEqual(assignAccessKeys(['Reservations', 'Room diary', 'Property availability', 'New reservation'], ['n']), ['r', 'd', 'p', 'e'])
  assert.deepEqual(assignAccessKeys(['aa', 'a', 'a']), ['a', '1', '2'])
  assert.equal(assignAccessKeys(Array.from({ length: 40 }, () => 'x')).filter(Boolean).length, 11)
  assert.equal(keyHint('ctrl+alt+7'), 'Ctrl+Alt+7')
})

test('atajos: sólo las acciones de la pantalla con modificador; las pestañas llevan el suyo al DOM', () => {
  setShortcutContext({ tree: { actions: [
    { id: 'days7', shortcut: 'ctrl+alt+7' }, { id: 'search', shortcut: 'enter' }, { id: 'save', shortcut: 'Ctrl+S' }, { id: 'x' },
  ] } })
  assert.deepEqual(currentShortcutActions(), [{ id: 'days7', shortcut: 'ctrl+alt+7' }, { id: 'save', shortcut: 'ctrl+s' }])
  setShortcutContext(null)
  assert.deepEqual(currentShortcutActions(), [])
  const tabs = { type: 'ClientSide', id: '_tabs', metadata: { type: 'TabLayout' }, children: [
    node({ type: 'Tab', label: 'Overview', shortcut: 'Alt+1' }, [node({ type: 'Text', text: 'a' })]),
    node({ type: 'Tab', label: 'Billing', shortcut: 'alt+2' }, [node({ type: 'Text', text: 'b' })]),
  ] }
  const bar = atomsOf(tabs).find((a) => a.isTabs)
  assert.deepEqual(bar.tabs.map((t) => t.shortcut), ['alt+1', 'alt+2'])
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /<li :id="\[\[ \$current\.data\.id \]\]" :data-shortcut="\[\[ \$current\.data\.shortcut \]\]">/)
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.installKeys\(\)/)
  assert.match(shell, /bridge\.setAccessKeysEnabled\(/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /setShortcutContext\(reg\.contexts\[HOST_ID\]\)/)
})

// ── P1 #18 ventanas flotantes al pasar el ratón ──────────────────────────────────────────────
test('popover: hover → texto para la ventana flotante; click → al pulsar; lo envuelto, como disparador', () => {
  const pop = (trigger) => node({ type: 'Popover', trigger,
    wrapped: node({ type: 'Text', text: 'Rate information' }),
    content: node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'BAR · 2 nights' }), node({ type: 'Text', text: 'Sat 10 · 149 €' })]) })
  const hover = atomsOf(pop('hover')).find((a) => a.isPopover)
  assert.equal(hover.label, 'Rate information')
  assert.equal(hover.hoverText, 'BAR · 2 nights\nSat 10 · 149 €')
  assert.equal(hover.clickText, '')
  const click = atomsOf(pop('click')).find((a) => a.isPopover)
  assert.equal(click.hoverText, '')
  assert.equal(click.clickText, 'BAR · 2 nights\nSat 10 · 149 €')
  assert.deepEqual(hoverLinesOf('a\n\n b \n'), ['a', 'b'])
})

test('@Tooltip: la celda de la tarifa lleva el desglose para la ventana flotante (no el title)', () => {
  const l = listingOf({ tree: { type: 'ServerSide', id: 's', serverSideType: 'X', children: [node({ type: 'Crud',
    columns: [node({ type: 'GridColumn', id: 'rate', label: 'Rate', dataType: 'number', tooltipPath: 'rateBreakdown' })] })] },
  data: { crud: { page: { content: [{ id: '1', rate: 123, rateBreakdown: 'CORP · 2 nights\nWed 7 · 123 €' }], totalElements: 1 } } }, state: {} })
  if (l) {
    const cell = l.rows[0]['rate__clipCell']
    assert.equal(cell.hover, 'CORP · 2 nights\nWed 7 · 123 €')
    assert.equal(cell.title, '')
  }
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.equal((page.match(/:data-mateu-hover="\[\[ \(\$current\.data && \$current\.data\.hover\) \|\| '' \]\]"/g) || []).length, 2, 'las dos plantillas cellClip')
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installHover\(\)/)
})

// ── P1 #14 arrastrar filas a un destino (@DragRows + DropZone) ───────────────────────────────
test('arrastre: el tipo viaja como MIME; los ids se leen de filas, {data,key} o ids sueltos', () => {
  assert.equal(dragMimeOf('charge'), 'application/x-mateu-charge')
  assert.equal(dragMimeOf('Folio Charge'), 'application/x-mateu-folio-charge')
  assert.equal(dragTypeOfMime('application/x-mateu-charge'), 'charge')
  assert.deepEqual(draggedIdsOf('[{"id":"C1"},{"data":{"id":"C2"}},{"key":3},"C4"]'), ['C1', 'C2', '3', 'C4'])
  assert.deepEqual(draggedIdsOf('nope'), [])
})

test('arrastre: el listado @DragRows da su tipo al oj-table; el DropZone es un átomo con su acción', () => {
  const ctx = { state: {}, data: { crud: { page: { content: [{ id: 'C1', amount: 10 }], totalElements: 1 } } },
    tree: { type: 'ServerSide', id: 's', serverSideType: 'FolioWindows', children: [
      node({ type: 'Page', title: 'Folio windows', header: [
        node({ type: 'DropZone', accept: 'charge', actionId: 'moveCharges', parameters: { window: 2 }, title: 'Window 2', subtitle: 'Guest (cash)' },
          [node({ type: 'Text', text: '13.20 € · 1 charges' })]),
      ] }, [node({ type: 'Crud', dragType: 'charge', columns: [node({ type: 'GridColumn', id: 'id', label: 'Id' })] })]),
    ] } }
  const l = listingOf(ctx)
  assert.equal(l.dragType, 'charge')
  assert.deepEqual(l.dragTypes, ['application/x-mateu-charge'])
  const zone = listingHeaderBlocksOf(ctx).flatMap((b) => b.items).find((a) => a.isDropZone)
  assert.ok(zone, 'los componentes de cabecera de la página del listado se pintan (HeaderSupplier)')
  assert.equal(zone.accept, 'application/x-mateu-charge')
  assert.equal(zone.actionId, 'moveCharges')
  assert.deepEqual(JSON.parse(zone.params), { window: 2 })
  assert.deepEqual(zone.lines, ['13.20 € · 1 charges'])
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /dnd\.drag\.rows\.data-types="\[\[ \$application\.variables\.mateuListing\.dragTypes \|\| \[\] \]\]"/)
  assert.match(page, /mateuListing\.headerBlocks/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installDragAndDrop\(\)/)
  // una acción que repinta el host vuelve a pedir su carga OnLoad (el listado no queda vacío)
  assert.match(webApp('flows/main/pages/main-start-page-chains/runMateuAction.js'), /hostNow\.tree\.id !== host\.tree\.id/)
})

import { ganttAtomOf, itemOverviewOf, generalOverviewOf, isRichAtom } from './reduceContexts.mjs'
import { sanitizeHtml, markdownToHtml } from './richtext.mjs'

test('Markdown: con su formato — HTML saneado que installRichText vuelca en su contenedor', () => {
  assert.equal(markdownToHtml('# Title\n\nSome **bold**, *it* and `code`,\nsame paragraph.\n\n- one\n- [two](https://x.org)\n\n1. first\n\n> quoted'),
    '<h1>Title</h1><p>Some <strong>bold</strong>, <em>it</em> and <code>code</code>, same paragraph.</p>'
    + '<ul><li>one</li><li><a href="https://x.org" target="_blank" rel="noopener noreferrer">two</a></li></ul><ol><li>first</li></ol>'
    + '<blockquote><p>quoted</p></blockquote>')
  assert.equal(markdownToHtml('```\n<b>raw</b>\n```'), '<pre><code>&lt;b&gt;raw&lt;/b&gt;</code></pre>')
  const [md] = atomsOf(node({ type: 'Markdown', markdown: '# H\n\ntext' }))
  assert.ok(md.isRichText)
  assert.equal(md.html, '<h1>H</h1><p>text</p>')
  assert.ok(isRichAtom(md), 'un átomo nuevo va en RICH_ATOM_FLAGS')
})

test('HTML saneado por lista blanca: sin scripts, manejadores, estilos ni enlaces javascript:', () => {
  assert.equal(sanitizeHtml('<p onclick="x()" style="color:red">Hi <b>there</b><script>alert(1)</script><style>p{}</style>'
    + '<a href="javascript:alert(1)">x</a><a href="https://oracle.com?a=1&amp;b=2">o</a><img src=x onerror=alert(1)><iframe src="//e"></iframe></p>'),
  '<p>Hi <b>there</b><a>x</a><a href="https://oracle.com?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">o</a></p>')
  assert.equal(sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a> 1 < 2'), '<a>x</a> 1 &lt; 2')
})

test('campos richText / html / markdown: con formato en sólo lectura; editables, un text area', () => {
  const ro = atomsOf(node({ type: 'FormLayout' }, [
    node({ type: 'FormField', fieldId: 'notes', dataType: 'string', stereotype: 'richText', readOnly: true, label: 'Notes' }),
    node({ type: 'FormField', fieldId: 'policy', dataType: 'string', stereotype: 'markdown', readOnly: true, label: 'Policy' }),
  ]), { notes: '<p>VIP <b>guest</b><script>x</script></p>', policy: '**No** pets' })
  assert.deepEqual(ro.map((a) => [a.label, a.html]), [['Notes', '<p>VIP <b>guest</b></p>'], ['Policy', '<p><strong>No</strong> pets</p>']])
  const [layout] = atomsOf(node({ type: 'FormLayout' }, [node({ type: 'FormField', fieldId: 'notes', dataType: 'string', stereotype: 'richText', label: 'Notes' })]), { notes: '<p>x</p>' })
  assert.ok(layout.isFormLayout)
  assert.ok(layout.fields[0].isTextArea, 'JET no trae editor de texto enriquecido')
  assert.match(webApp('flows/main/pages/main-start-page.html'), /:data-mateu-html="\[\[ \$current\.data\.html \]\]"/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installRichText\(\)/)
})

test('Gantt: una fila por tarea sobre oj-gantt, avance 0..1, selección → _clickedTaskId', () => {
  const g = ganttAtomOf({ onTaskSelectionActionId: 'selectGanttTask', tasks: [
    { id: 't1', title: 'Design', start: '2026-01-05', end: '2026-01-20', progress: 50 },
    { id: 't2', title: 'Build', start: '2026-01-21', end: '2026-04-30', progress: 150 },
    { id: 'tx', title: 'No dates' },
  ] }, 'plan')
  assert.ok(g.isGantt)
  assert.equal(g.rows.length, 2, 'las tareas sin fechas no se pintan')
  const prog = Object.fromEntries(g.rows.flatMap((r) => r.tasks).map((t) => [t.id, t.progress.value]))
  assert.deepEqual(prog, { t1: 0.5, t2: 1 })
  assert.equal(g.majorScale, 'months', 'un plan de meses se lee por meses')
  assert.deepEqual(planningActionOf(g, 'select', { value: ['t1'] }) || planningActionOf(g, 'select', { taskId: 't1' }),
    { actionId: 'selectGanttTask', parameters: { _clickedTaskId: 't1' } })
  assert.ok(atomsOf(node({ type: 'Gantt', tasks: [{ id: 'a', start: '2026-01-01', end: '2026-01-02' }] }))[0].isGantt)
  assert.match(webApp('flows/main/pages/main-start-page.html'), /on-selection-changed/)
})

test('Grid fluido: oj-table de sus columnas hoja (grupos aplanados) y sus filas', () => {
  const [g] = atomsOf(node({ type: 'Grid', content: [
    { type: 'GridColumn', id: 'name', label: 'Name' },
    { type: 'GridGroupColumn', columns: [{ type: 'GridColumn', id: 'qty', label: 'Qty' }] },
  ], page: { content: [{ name: 'A', qty: 1 }] } }))
  assert.ok(g.isGrid)
  assert.deepEqual(g.columns.map((c) => c.field), ['name', 'qty'])
  assert.equal(g.rows[0]._rowNumber, 0)
  assert.equal(g.isEmpty, false)
})

test('Item Overview y General Overview: el contenido de tarjetas y pestañas viaja como átomos', () => {
  const io = itemOverviewOf({ state: {}, data: {}, tree: node({ type: 'HorizontalLayout' }, [
    node({ type: 'Card', title: node({ type: 'Text', text: 'Chair' }), content: [node({ type: 'Markdown', markdown: '- 4D armrests' })] }),
    node({ type: 'TabLayout' }, [node({ type: 'Tab', label: 'Specs' }, [node({ type: 'Markdown', markdown: '## Size' })])]),
  ]) })
  assert.equal(io.key.title, 'Chair')
  assert.equal(io.key.items[0].html, '<ul><li>4D armrests</li></ul>')
  assert.equal(io.tabs[0].items[0].html, '<h2>Size</h2>')
  const go = generalOverviewOf({ state: {}, data: {}, tree: node({ type: 'VerticalLayout' }, [
    node({ type: 'FormField', fieldId: 'record', dataType: 'string', options: [{ value: '1', label: 'One' }] }),
    node({ type: 'EntityHeader', title: 'One' }),
    node({ type: 'Card', title: node({ type: 'Text', text: 'Notes' }), content: [node({ type: 'Markdown', markdown: 'hello' })] }),
  ]) })
  const card = go.cards.find((c) => c.title === 'Notes')
  assert.equal(card.items[0].html, '<p>hello</p>')
})

import { withInitialValues } from './reduceContexts.mjs'

test('FormField.initialValue siembra el estado cuando la clave falta (como el renderer web), sin pisar lo que llega', () => {
  const tree = node({ type: 'Form' }, [
    node({ type: 'FormField', fieldId: 'rooms', initialValue: '101, 103' }),
    node({ type: 'FormField', fieldId: 'status', initialValue: 'CL' }),
    node({ type: 'FormField', fieldId: 'notes' }),
  ])
  assert.deepEqual(withInitialValues(tree, { status: 'DI' }), { status: 'DI', rooms: '101, 103' })
})

test('el refresco se arma ANTES de los OnLoad inmediatos: el primer search de un listado ya arranca su OnSuccess', () => {
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  assert.ok(nav.indexOf('bridge.startPolling(') > 0)
  assert.ok(nav.indexOf('bridge.startPolling(') < nav.indexOf('bridge.onLoadTriggers(loaded)'))
})

import { bannerNotificationOf } from './notify.mjs'

test('mensajes: error y aviso van al banner de la shell (vbNotification); el toast de Redwood sólo confirma', () => {
  assert.deepEqual(bannerNotificationOf({ text: 'Close the cashiers', variant: 'error' }), { summary: 'Close the cashiers', type: 'error', displayMode: 'persist' })
  assert.equal(bannerNotificationOf({ text: 'Saved', variant: 'success' }), null)
  assert.equal(bannerNotificationOf({ text: 'x' }), null)
  const chain = webApp('flows/main/pages/main-start-page-chains/runMateuAction.js')
  assert.match(chain, /const notification = bridge\.bannerNotificationOf\(toast\);\n\s*if \(notification\) \{ await Actions\.fireNotificationEvent\(context, notification\); continue; \}/)
  assert.doesNotMatch(webApp('flows/main/pages/main-start-page.html'), /mateuToast"[^>]*type=|type="[^"]*"[^>]*id="mateuToast"/)
})

test('@BulletedList en un campo: su rótulo y sus valores como viñetas (antes desaparecía)', () => {
  const atoms = atomsOf(node({ type: 'FormLayout' }, [node({ type: 'FormField', fieldId: 'pending', dataType: 'array', stereotype: 'bulletedList', label: 'Still due in' })]),
    { pending: ['A · room 1', 'B · room 2'] })
  assert.equal(atoms[0].text, 'Still due in')
  assert.deepEqual(atoms[1].items, ['A · room 1', 'B · room 2'])
})

test('proceso guiado: ni el contador del RAIL ni el pie Back + completar se duplican en el contenido', () => {
  const tree = node({ type: 'VerticalLayout' }, [
    node({ type: 'Text', text: '3 | 3' }),
    node({ type: 'Text', text: 'Close the cashiers' }),
    node({ type: 'HorizontalLayout' }, [node({ type: 'Button', label: 'Back', actionId: 'back' }), node({ type: 'Button', label: 'Run end of day', actionId: 'run' })]),
  ])
  const items = (hostContentOf({ tree, state: {}, data: {} }, [], { forWizard: true }) || []).flatMap((b) => b.items)
  assert.deepEqual(items.filter((a) => a.isText).map((a) => a.text), ['Close the cashiers'])
  assert.equal(items.filter((a) => a.isButtons).length, 0)
})

import { setElementModuleBase } from './elements.mjs'

test('P2 #20 imagen, avatares y galería: <img> del backend, oj-avatar con +N, oj-film-strip si todo son imágenes', () => {
  setElementModuleBase('http://localhost:9005')
  const [img] = atomsOf(node({ type: 'Image', src: '/pms/rooms/std-1.svg' }))
  assert.ok(img.isImage)
  assert.equal(img.src, 'http://localhost:9005/pms/rooms/std-1.svg', 'una ruta relativa la sirve el backend')
  const [group] = atomsOf(node({ type: 'AvatarGroup', maxItemsVisible: 2, avatars: [{ name: 'Lucía Martín' }, { name: 'Tomás Ruiz', abbreviation: 'TR' }, { name: 'Ana' }] }))
  assert.deepEqual(group.avatars.map((a) => a.initials), ['LM', 'TR'])
  assert.equal(group.overflow, '+1')
  const [gallery] = atomsOf(node({ type: 'CarouselLayout', loop: true }, [node({ type: 'Image', src: 'https://x/a.png' }), node({ type: 'Image', src: 'https://x/b.png' })]))
  assert.ok(gallery.isGallery)
  assert.deepEqual(gallery.images.map((i) => i.src), ['https://x/a.png', 'https://x/b.png'])
  assert.equal(gallery.looping, 'page')
  // un carrusel de contenido arbitrario sigue apilando
  assert.ok(atomsOf(node({ type: 'CarouselLayout' }, [node({ type: 'Text', text: 'slide' })])).some((a) => a.isText))
  // el título de un Card fluido es un componente Text
  const cardAtoms = atomsOf(node({ type: 'Card', title: node({ type: 'Text', text: 'Suite' }), content: node({ type: 'Image', src: 'https://x/c.png' }) }))
  assert.equal(cardAtoms[0].text, 'Suite')
  assert.match(webApp('flows/main/pages/main-start-page.html'), /<oj-film-strip class="mateu-atom-gallery/)
  setElementModuleBase('')
})

import { orderedTileIndices, moveTile, moveTileBy, writeTileOrder, tileScopeOf } from './prefs.mjs'

test('P2 #22 tiles reordenables: el orden guardado del usuario manda; cada bloque lleva su clave y su ámbito', () => {
  assert.deepEqual(orderedTileIndices(['a', 'b', 'c'], ['c', 'gone']), [2, 0, 1])
  assert.deepEqual(moveTile(['a', 'b', 'c', 'd'], 'd', 'b'), ['a', 'd', 'b', 'c'])
  assert.deepEqual(moveTileBy(['a', 'b', 'c'], 'a', -1), ['a', 'b', 'c'])
  const store = {}
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v } }
  const grid = (reorderable) => ({ type: 'ClientSide', id: 'dash', metadata: { type: 'ResponsiveGrid', gridTemplateColumns: '1fr 1fr 1fr', reorderable }, children: [
    node({ type: 'DashboardPanel', id: 'arrivals', title: 'Arrivals' }, [node({ type: 'Text', text: '12' })]),
    node({ type: 'DashboardPanel', id: 'departures', title: 'Departures' }, [node({ type: 'Text', text: '9' })]),
  ] })
  writeTileOrder(tileScopeOf('dash'), ['departures', 'arrivals'])
  const blocks = hostContentOf({ tree: grid(true), state: {}, data: {} }, []) || []
  assert.deepEqual(blocks.map((b) => b.tileKey), ['departures', 'arrivals'])
  assert.ok(blocks.every((b) => b.tileScope === tileScopeOf('dash')))
  // sin reorderable: el orden del servidor y sin marcas
  assert.ok((hostContentOf({ tree: grid(false), state: {}, data: {} }, []) || []).every((b) => !b.tileKey))
  delete globalThis.localStorage
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /:data-mateu-tile="\[\[ \$current\.data\.tileKey \]\]"/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installTileReorder\(\)/)
})

test('P2 #21 mapa: Leaflet con marcadores, encuadre y la acción de un marcador', () => {
  const palma = { id: 'PMI01', latitude: 39.5715, longitude: 2.649, label: 'Palma Centre', description: '22 free', color: '#508223' }
  const port = { id: 'PMI03', latitude: 39.558, longitude: 2.6735, label: 'Portixol' }
  const tree = { type: 'ClientSide', id: 'properties', style: 'height: 34rem;', metadata: { type: 'Map', zoom: '', markers: [palma, port], markerActionId: 'openProperty' }, children: [] }
  const blocks = hostContentOf({ tree, state: {}, data: {} }, []) || []
  const map = blocks.flatMap((b) => (b.items ? b.items : [b])).find((a) => a && a.isMap) || blocks.find((b) => b.isMap)
  assert.ok(map, 'the Map becomes an isMap atom')
  assert.equal(map.mapId, 'mateuMap-properties')
  assert.deepEqual(map.mapStyle, { width: '100%', height: '34rem' })
  const spec = JSON.parse(map.mapSpec)
  assert.equal(spec.markerActionId, 'openProperty')
  assert.deepEqual(spec.markers.map((m) => m.id), ['PMI01', 'PMI03'])
  assert.equal(spec.markers[1].color, '')
  // altura por defecto, como el <mateu-map> del web
  assert.equal(mapHeightOf(''), '25rem')
  assert.equal(mapAtomOf({ markers: [] }, 'm', 'width: 100%').mapStyle.height, '25rem')
  // la vista: posición explícita > marcadores (uno centrado, varios encuadrados) > mundo
  assert.deepEqual(mapViewPlanOf({ position: '40.4, -3.7', zoom: '9', markers: [palma, port] }), { kind: 'center', center: { lat: 40.4, lon: -3.7 }, zoom: 9 })
  assert.deepEqual(mapViewPlanOf({ markers: [palma] }), { kind: 'center', center: { lat: 39.5715, lon: 2.649 }, zoom: SINGLE_MARKER_ZOOM })
  assert.deepEqual(mapViewPlanOf(spec), { kind: 'fit', min: { lat: 39.558, lon: 2.649 }, max: { lat: 39.5715, lon: 2.6735 } })
  assert.deepEqual(mapViewPlanOf({ markers: [] }), { kind: 'center', center: { lat: 0, lon: 0 }, zoom: 3 })
  assert.deepEqual(mapMarkerParams('PMI03'), { _markerId: 'PMI03' })
  // cableado: plantilla con el contenedor, shell que lo instala
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /:data-map-spec="\[\[ \$current\.data\.mapSpec \]\]"/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installMaps\(\)/)
})

test('seguridad: el selector de una regla escapa comillas y barras; una imagen sólo carga data:image, http(s) o rutas relativas', () => {
  assert.equal(attrSelectorValue('a"b\\c'), 'a\\"b\\\\c')
  assert.equal(safeImageSrc('data:image/png;base64,AA'), 'data:image/png;base64,AA')
  assert.equal(safeImageSrc('https://x/y.png'), 'https://x/y.png')
  assert.equal(safeImageSrc('/img/a.png'), '/img/a.png')
  assert.equal(safeImageSrc('javascript:alert(1)'), '')
  assert.equal(safeImageSrc('data:text/html,<b>x</b>'), '')
})

test('proceso guiado terminado: un paso final «Completed» actual (título correcto) y la marca completed (sin pie)', () => {
  const tree = (statuses) => ({ type: 'ClientSide', id: 'w', metadata: { type: 'VerticalLayout' }, children: [
    { type: 'ClientSide', id: 'p', metadata: { type: 'ProgressSteps', vertical: true,
      steps: statuses.map((st, i) => ({ id: 's' + i, title: 'Step ' + i, status: st })) }, children: [] }] })
  const running = wizardOf({ tree: tree(['done', 'current', 'upcoming']) })
  assert.equal(running.completed, false)
  assert.equal(running.currentStep, 's1')
  assert.equal(running.steps.length, 3)
  const done = wizardOf({ tree: tree(['done', 'done', 'done']) })
  assert.equal(done.completed, true)
  assert.equal(done.currentStep, WIZARD_DONE_STEP)
  assert.equal(done.currentLabel, 'Completed')
  assert.equal(done.steps.length, 4)
  assert.ok(done.steps.every((st) => st.status === 'success'))
  assert.equal(done.resumeStepId, '')
  assert.match(webApp('flows/main/pages/main-start-page.html'), /mateuWizard\.completed \? 'mateu-wizard-completed'/)
})

test('mount: the packaged app serves an @UI at any path — API base and routes come from <mateu-ui baseUrl>', () => {
  assert.equal(normalizeMount(''), '')
  assert.equal(normalizeMount('/'), '')
  assert.equal(normalizeMount('console/'), '/console')
  assert.equal(normalizeMount('/a/b//'), '/a/b')
  // the base: the mount when the controller injected <mateu-ui>, the dev constant otherwise
  assert.equal(baseUrlOf(null, 'http://localhost:9005'), 'http://localhost:9005')
  assert.equal(baseUrlOf({ baseUrl: '' }, 'http://localhost:9005'), '')
  assert.equal(baseUrlOf({ baseUrl: '/console' }, 'http://x'), '/console')
  assert.equal(baseUrlOf({ baseurl: '/console/' }, 'http://x'), '/console')
  // browser path → Mateu route: relative to the mount, the mount itself is the home
  assert.equal(routeOfPath('/console', '/console'), '')
  assert.equal(routeOfPath('/console/', '/console'), '')
  assert.equal(routeOfPath('/console/products/3', '/console'), '/products/3')
  assert.equal(routeOfPath('/', ''), '')
  assert.equal(routeOfPath('/products', ''), '/products')
  // a path that merely starts like the mount is not under it
  assert.equal(routeOfPath('/consoles/x', '/console'), '/consoles/x')
  // Mateu route → browser path
  assert.equal(pathOfRoute('', '/console'), '/console')
  assert.equal(pathOfRoute('/', '/console'), '/console')
  assert.equal(pathOfRoute('/products?status=open', '/console'), '/console/products?status=open')
  assert.equal(pathOfRoute('products', '/console'), '/console/products')
  assert.equal(pathOfRoute('', ''), '/')
  assert.equal(pathOfRoute('/products', ''), '/products')
  assert.equal(pathOfRoute('?q=1', '/console'), '/console?q=1')
  assert.equal(pathOfRoute('?q=1', ''), '/?q=1')
  // a crud's inner route already carries the crud's path (@UI("/products") → '/products/new')
  assert.equal(pathOfRoute('/products/new', '/products'), '/products/new')
  assert.equal(pathOfRoute('/products', '/products'), '/products')
  // round trip
  for (const r of ['', '/a', '/a/b']) assert.equal(routeOfPath(pathOfRoute(r, '/m'), '/m'), r)
})

test('mount: read once at boot — path mode under a mount, hash mode without <mateu-ui>', () => {
  const doc = (attrs) => ({ querySelector: (sel) => (sel === 'mateu-ui' && attrs
    ? { getAttribute: (n) => (n in attrs ? attrs[n] : null) } : null) })
  assert.equal(initMount(doc({ baseUrl: '/console' })), '/console')
  assert.equal(isPathMode(), true)
  assert.equal(mateuBase('http://localhost:9005'), '/console')
  // static things stay at the backend root, as on the Vaadin renderer
  assert.equal(mateuAssetBase('http://localhost:9005'), '')
  assert.equal(urlOfRoute(''), '/console')
  assert.equal(urlOfRoute('/orders?x=1'), '/console/orders?x=1')
  assert.equal(currentRouteOf({ pathname: '/console/orders', search: '?x=1', hash: '' }), '/orders?x=1')
  assert.equal(currentRoutePathOf({ pathname: '/console/orders', search: '?x=1', hash: '' }), '/orders')
  assert.equal(currentRouteOf({ pathname: '/console', search: '', hash: '' }), '')
  // an App's homeRoute comes in full: the route is the part under the mount
  assert.equal(routeUnderMount('/console/home'), '/home')
  assert.equal(routeUnderMount('/console/home?x=1'), '/home?x=1')
  assert.equal(routeUnderMount('/console'), '')
  assert.equal(routeUnderMount('section1'), 'section1')
  assert.equal(routeUnderMount(''), '')
  // the root mount: today's behaviour
  assert.equal(initMount(doc({ baseUrl: '' })), '')
  assert.equal(mateuBase('http://localhost:9005'), '')
  assert.equal(urlOfRoute(''), '/')
  assert.equal(currentRouteOf({ pathname: '/', search: '', hash: '' }), '')
  // vb-serve / VB hosted: no <mateu-ui> → hash routes and the dev constant
  assert.equal(initMount(doc(null)), null)
  assert.equal(isPathMode(), false)
  assert.equal(mateuBase('http://localhost:9005'), 'http://localhost:9005')
  assert.equal(mateuAssetBase('http://localhost:9005'), 'http://localhost:9005')
  assert.equal(urlOfRoute('/orders'), '#/orders')
  assert.equal(currentRouteOf({ pathname: '/', search: '', hash: '#/orders?x=1' }), '/orders?x=1')
  assert.equal(currentRoutePathOf({ pathname: '/', search: '', hash: '#/orders?x=1' }), '/orders')
  setMount(null)
})

test('mount: an in-content link is a screen of the app only below the mount, and its route drops the mount', () => {
  const loc = { href: 'https://h/console/a', origin: 'https://h', pathname: '/console/a', search: '' }
  const a = (href) => ({ getAttribute: (n) => (n === 'href' ? href : null) })
  const route = (href) => inAppRouteOfLink(a(href), { button: 0 }, loc, false, '/console')
  assert.equal(route('/console/orders/3?x=1'), '/orders/3?x=1')
  assert.equal(route('/console'), '/')
  assert.equal(route('/other/app'), null)
  assert.equal(route('/console/_inbox'), null)
  // the chains use the bridge, not window.location.pathname, as the route
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.initMount\(document\)/)
  assert.match(shell, /bridge\.currentRouteOf\(window\.location\)/)
  assert.match(shell, /bridge\.currentMount\(\)/)
  for (const chain of ['pages/shell-page-chains/onMateuNavigate.js', 'pages/shell-page-chains/loadMateuShell.js',
    'flows/main/pages/main-start-page-chains/runMateuAction.js', 'flows/main/pages/main-start-page-chains/runMateuSearch.js']) {
    assert.doesNotMatch(webApp(chain).replace(/bridge\.mateu(Asset)?Base\(\$application\.constants\.mateuBaseUrl\)/g, ''),
      /\$application\.constants\.mateuBaseUrl/, chain + ' reads the base without the mount')
  }
})

test('mount: an @UI that is not an App (a page, a crud) boots as a fresh load of the mount', () => {
  // what demo-vb's @UI("/hello") HelloPage answers to the bootstrap (components/_/action)
  const page = { fragments: [{ targetComponentId: null, component: { type: 'ServerSide', id: 'x',
    serverSideType: 'io.mateu.mdd.demovb.infra.in.ui.HelloPage', route: '_empty',
    children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'Hola' } }] } }] }
  assert.equal(bootstrapHasApp(page), false)
  // and @UI("/products") ProductsCrud: an error, no fragments
  assert.equal(bootstrapHasApp({ messages: [{ variant: 'error', text: '__load__ not supported by ProductsCrud' }], fragments: [] }), false)
  // an App (the root of a console) keeps the menu's home
  assert.equal(bootstrapHasApp({ fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', menu: [] } } }] }), true)
  assert.equal(bootstrapHasApp({ fragments: [{ component: { type: 'ServerSide', serverSideType: 'X',
    children: [{ type: 'ClientSide', metadata: { type: 'App' } }] } }] }), true)
  assert.equal(bootstrapHasApp(null), false)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.setMountWithoutApp\(withoutApp\)/)
  assert.match(readFileSync(join(here, 'transport.mjs'), 'utf8'), /consumedRoute: '_empty'/)
})

for (const [name, fn] of pending) { await fn(); console.log(`  ✓ ${name}`); pass++ }
console.log(`\n${pass} tests PMS OK`)
void HOST_ID
