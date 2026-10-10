// Tests de contrato de lo que se añadió para el reto PMS (OPERA Cloud sobre Mateu + Redwood):
// cada componente o comportamiento nuevo del renderer, con fixtures de wire real capturados de
// demo/demo-vb-pms (poc/fixtures/pms/*.json) o, cuando el wire es trivial, construidos a mano
// con la MISMA forma que emite el backend (record → DTO).
// Uso: node test-pms.mjs   (npm test ejecuta test.mjs y este)

import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { planningAtomOf, planningActionOf, overlayOf } from './reduceContexts.mjs'
import { dayIndexAtX } from './planning.mjs'
import { reduceContexts, islandContentOf, hostContentOf, hostContentShown, summarizeHost, shellNavOf, entityHeaderOf, taskQueueOf, formSectionsOf, layoutFieldOf, HOST_ID } from './reduceContexts.mjs'
import { localMenuOptionOf, isSentinelHome } from './navTree.mjs'
import { loadMenuRouteInto, terminalMenuRouteOf } from './transport.mjs'
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

test('plantilla: los widgets nuevos están en las 15 superficies de átomos y en las 7 copias de campos', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  for (const tag of ['<oj-radioset', '<oj-select-many', '<oj-checkboxset', '<mateu-capture-field'])
    assert.equal(page.split(tag).length - 1, 22, tag)
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
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /setAfterReduceHook\(\(reg\) => setRulesContext/)
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

for (const [name, fn] of pending) { await fn(); console.log(`  ✓ ${name}`); pass++ }
console.log(`\n${pass} tests PMS OK`)
void HOST_ID
