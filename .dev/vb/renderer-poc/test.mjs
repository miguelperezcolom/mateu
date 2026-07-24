// Batería de tests del renderer — corre en Node, SIN VB.
// v3: valida el reducer contra increments REALES (fixtures/real/*.json, capturados con
// capture.mjs contra demo/demo-vb :9005) — son tests de CONTRATO del wire, no sintéticos.
// Regenerar fixtures: arrancar demo/demo-vb (mvn spring-boot:run, :9005) y `node capture.mjs`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { composeInnerRoute } from './transport.mjs'
import {
  reduceContexts, collectFields, collectActions, collectIslands, mediatorOf, HOST_ID,
  dynFormMetadataOf, actionsOf, summarizeHost, listingOf, onLoadTriggers,
  overlayOf, eventTriggersOf, shellNavOf, foldoutOf, wizardOf,
} from './reduceContexts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))
const empty = () => ({ contexts: {}, stack: [], shell: null })
const fieldIds = (tree) => [...new Set(collectFields(tree).map((f) => f.fieldId))]

let pass = 0
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }

// 1) Bootstrap: el App configura la shell (menú→navigator) y no crea contexto de contenido.
test('bootstrap App → shell con menú; ningún contexto de contenido', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('app'))
  assert.equal(Object.keys(contexts).length, 0)
  assert.equal(shell.title, 'VB Demo')
  assert.deepEqual(shell.menu.map((m) => m.route), ['/hello', '/products', '/gestion'])
})

// 2) Carga de un form: target '' → host; el contexto guarda tree + state del fragment.
test('load-form registra el host: tree, state del fragment, pageType, docTitle', () => {
  const { contexts, stack, effects } = reduceContexts(empty(), fx('load-form'))
  assert.equal(stack.length, 0)
  const c = contexts[HOST_ID]
  assert.equal(c.kind, 'host')
  assert.equal(c.tree.type, 'ServerSide')
  assert.equal(c.pageType, 'form')
  assert.deepEqual(fieldIds(c.tree), ['name', 'age'])
  assert.equal(c.state.name, 'Ada')
  assert.ok(collectActions(c.tree).some((a) => a.actionId === 'save'))
  assert.equal(effects.docTitle, 'Person')
})

// 3) Save: fragment State-only cuyo target es el ECO del initiator (aquí, el uuid del árbol)
//    → merge de estado conservando el árbol; el toast sale como efecto.
test('save-form: State-only por eco de id → merge sin perder el árbol + toast', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const treeRef = reg.contexts[HOST_ID].tree
  reg = reduceContexts(reg, fx('save-form'))
  const c = reg.contexts[HOST_ID]
  assert.equal(c.state.name, 'Grace')
  assert.equal(c.state.age, 41)
  assert.equal(c.tree, treeRef) // árbol conservado (misma ref: structural sharing)
  assert.deepEqual(reg.effects.toasts, [{ text: 'Saved Grace', variant: 'success' }])
})

// 4) NavigateTo interno → efecto route; el registro no se toca.
test('navigate produce efecto route sin tocar el registro', () => {
  const before = reduceContexts(empty(), fx('load-form'))
  const { effects, contexts } = reduceContexts(before, fx('navigate'))
  assert.deepEqual(effects.navigate, { route: '/products' })
  assert.ok(contexts[HOST_ID])
})

// 5) Crud: llega como MEDIADOR (ServerSide → child App chromeless) direccionado al initiator;
//    mediatorOf da la info para la segunda carga (contenido).
test('load-listing: mediador registrado por eco del initiator; mediatorOf → rootRoute/SST', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('load-listing'))
  const c = contexts['crud1']
  assert.ok(c, 'contexto crud1 (eco del initiator)')
  assert.equal(c.kind, 'island')
  assert.equal(shell, null) // un App de mediador NO configura la shell
  const info = mediatorOf(c)
  assert.equal(info.rootRoute, '/products')
  assert.match(info.serverSideType, /ProductsCrud$/)
})

// 6) La segunda carga (contenido del mediador) REEMPLAZA el contexto del mediador por el
//    listado; el host de al lado no cambia de ref (re-render quirúrgico).
test('load-listing-content reemplaza crud1 con el listado sin tocar otros contextos', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const hostRef = () => reg.contexts[HOST_ID]
  const hostBefore = hostRef()
  reg = reduceContexts(reg, fx('load-listing'))
  reg = reduceContexts(reg, fx('load-listing-content'))
  const c = reg.contexts['crud1']
  assert.equal(mediatorOf(c), null) // ya no es el mediador: es el contenido
  assert.equal(c.tree.children[0].metadata.type, 'Page')
  assert.equal(hostBefore, hostRef()) // host intacto, MISMA ref
})

// 7) Add → drawer apilado; el estado inicial del drawer viene de metadata.initialData.
test('open-drawer apila un overlay con initialData y anatomía del Drawer', () => {
  let reg = reduceContexts(empty(), fx('load-listing'))
  reg = reduceContexts(reg, fx('open-drawer'))
  assert.equal(reg.stack.length, 1)
  const ov = reg.contexts[reg.stack[0]]
  assert.equal(ov.kind, 'drawer')
  assert.equal(ov.tree.metadata.type, 'Drawer')
  assert.equal(ov.title, 'New')
  assert.equal(ov.position, 'end')
  assert.equal(ov.width, '36rem')
  assert.deepEqual(ov.state, { id: null, name: null, price: 0, active: false })
})

// 8) Guardar-en-drawer: CloseModal cierra por puro estado Y emite el evento del bus con el
//    que el listado suscrito se refresca; MarkAsClean sin target aplica al initiator.
test('save-in-drawer: pop del stack + evento mateu-crud:saved-in-drawer + toast', () => {
  let reg = reduceContexts(empty(), fx('load-listing'))
  reg = reduceContexts(reg, fx('open-drawer'))
  const drawerId = reg.stack[0]
  reg = reduceContexts(reg, fx('save-in-drawer'), { initiator: drawerId })
  assert.deepEqual(reg.stack, [])
  assert.equal(reg.contexts[drawerId], undefined)
  assert.deepEqual(reg.effects.events, [{ name: 'mateu-crud:saved-in-drawer', detail: null }])
  assert.equal(reg.effects.toasts[0].variant, 'success')
})

// 9) Host con isla embebida: la frontera es un ServerSide interior con id de campo y los
//    marcadores en initialData — el dispatcher monta ahí un mateu-node anidado.
test('island-host: collectIslands encuentra la frontera _guestNote con sus marcadores', () => {
  const { contexts } = reduceContexts(empty(), fx('island-host'))
  const islands = collectIslands(contexts[HOST_ID].tree)
  assert.equal(islands.length, 1)
  assert.equal(islands[0].id, '_guestNote')
  assert.match(islands[0].route, /_embeddedMediator=1/)
  assert.equal(islands[0].initialData._embeddedMediator, true)
})

// 10) Ciclo de la isla: mediador → contenido → edit → save, SIEMPRE direccionado a
//     '_guestNote' por el eco del initiator; el host nunca cambia de ref.
test('ciclo de isla: cada paso repinta solo _guestNote; host misma ref todo el tiempo', () => {
  let reg = reduceContexts(empty(), fx('island-host'))
  const hostRef = reg.contexts[HOST_ID]
  for (const step of ['island-load', 'island-content', 'island-edit', 'island-save']) {
    reg = reduceContexts(reg, fx(step))
    assert.ok(reg.contexts['_guestNote'], `contexto _guestNote tras ${step}`)
    assert.equal(reg.contexts[HOST_ID], hostRef, `host intacto tras ${step}`)
  }
  assert.equal(mediatorOf({ tree: fx('island-load').fragments[0].component }) != null, true)
  assert.deepEqual(fieldIds(reg.contexts['_guestNote'].tree), ['paxName', 'note'])
})

// 11) State-only sobre una isla: MERGE conservando el árbol (un push del host no borra la isla).
test('State-only sobre la isla fusiona estado sin perder el árbol', () => {
  let reg = reduceContexts(empty(), fx('island-host'))
  reg = reduceContexts(reg, fx('island-content'))
  const treeRef = reg.contexts['_guestNote'].tree
  reg = reduceContexts(reg, {
    fragments: [{ targetComponentId: '_guestNote', state: { note: 'cambiada' } }],
  })
  assert.equal(reg.contexts['_guestNote'].tree, treeRef)
  assert.equal(reg.contexts['_guestNote'].state.note, 'cambiada')
})

// 12) Rama FormLayout (Fase 3): campos → metadata de oj-dyn-form; botones → acciones.
test('dynFormMetadataOf/actionsOf proyectan el form de /person para oj-dyn-form', () => {
  const { contexts } = reduceContexts(empty(), fx('load-form'))
  const tree = contexts[HOST_ID].tree
  const md = dynFormMetadataOf(tree)
  assert.deepEqual(md.name, { type: 'string', displayName: 'Name', required: true, readonly: false })
  assert.equal(md.age.type, 'number')
  const actions = actionsOf(tree)
  assert.deepEqual(actions.map((a) => a.actionId).sort(), ['goToProducts', 'save'])
  assert.equal(actions.find((a) => a.actionId === 'save').style, 'primary')
})

// 13) summarizeHost: form → título + form spec; listado (sin título de Page) → caption del menú.
test('summarizeHost proyecta form y cae al caption del menú en un listado', () => {
  let reg = reduceContexts(empty(), fx('app'))
  reg = reduceContexts(reg, fx('load-form'))
  const form = summarizeHost(reg, '/person')
  assert.equal(form.title, 'Person')
  assert.equal(form.formValue.name, 'Ada')
  // el listado aterriza como contexto del initiator (crud1); simulamos su llegada al host
  const listing = fx('load-listing-content')
  listing.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, listing)
  const summary = summarizeHost(reg, '/products')
  assert.equal(summary.title, 'Products') // Page sin título → caption del menú
  assert.equal(summary.formMetadata, null) // pageType collection: sus FormFields son columnas
})

// 14) Listing (Fase 4): el trigger OnLoad pide 'search'; la respuesta es un fragmento
//     DATA-ONLY que mergea en ctx.data sin tocar el árbol; listingOf proyecta columnas+filas.
test('listing: OnLoad→search, data-only mergea, listingOf proyecta columnas y filas', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = '' // simula la llegada al host
  let reg = reduceContexts(empty(), content)
  const host = () => reg.contexts[HOST_ID]
  assert.deepEqual(onLoadTriggers(host()), ['search'])
  const before = listingOf(host())
  assert.equal(before.title, 'Products')
  assert.deepEqual(before.columns.map((c) => c.field), ['id', 'name', 'price', 'active'])
  assert.equal(before.isEmpty, true) // aún sin filas: el search no ha corrido
  const treeRef = host().tree
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, search)
  assert.equal(host().tree, treeRef) // data-only: árbol intacto
  const after = listingOf(host())
  assert.deepEqual(after.rows.map((r) => r.name), ['Laptop', 'Mouse', 'Keyboard'])
  assert.equal(after.total, 3)
  assert.equal(after.isEmpty, false)
  assert.ok(after.toolbar.some((b) => b.label === 'New'))
})

// 15) CRUD en drawer (Fase 5): new→Add proyectable; view→drawer Edit con la fila;
//     save→CloseModal(eventName) y el trigger OnCustomEvent del listing pide 'search'.
test('drawer del crud: overlayOf proyecta New/Edit; el cierre dispara el refresco suscrito', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  reg = reduceContexts(reg, fx('open-drawer'))
  let overlay = overlayOf(reg)
  assert.equal(overlay.title, 'New')
  assert.deepEqual(overlay.fields.map((f) => f.fieldId), ['id', 'name', 'price', 'active'])
  assert.ok(overlay.fields.find((f) => f.fieldId === 'price').isNumber)
  assert.deepEqual(overlay.actions.map((a) => a.actionId), ['cancel-new', 'create'])
  // guardar: cierra por estado y emite el evento del bus…
  reg = reduceContexts(reg, fx('save-in-drawer'))
  assert.equal(overlayOf(reg), null)
  const eventName = reg.effects.events[0].name
  assert.equal(eventName, 'mateu-crud:saved-in-drawer')
  // …que el listing tiene suscrito a 'search' (el refresco viaja EN el wire)
  assert.deepEqual(eventTriggersOf(reg.contexts[HOST_ID], eventName), ['search'])
  // edit: el clic de fila (view + parameters=fila) abre el drawer con la fila cargada
  reg = reduceContexts(reg, fx('open-edit-drawer'))
  overlay = overlayOf(reg)
  assert.equal(overlay.title, 'Edit')
  assert.equal(overlay.state.name, 'Laptop')
  assert.deepEqual(overlay.actions.map((a) => a.actionId).sort(), ['cancel-edit', 'delete', 'save'].filter((x) => overlay.actions.some((a) => a.actionId === x)))
})

// 16) Shell compleja (Fase 6): grupos con hijos por ruta TERMINAL, selectores @AppContext
//     y acciones de cabecera (dropdown con hijos) proyectados para bindings simples.
test('shellNavOf: grupos con rutas terminales + selectores de contexto + header actions', () => {
  const { shell } = reduceContexts(empty(), fx('app'))
  const nav = shellNavOf({ shell })
  assert.deepEqual(nav.items.map((i) => i.id), ['/hello', '/products', '/gestion'])
  // HAMBURGUER_MENU (explícito en el demo) → drawer izquierdo con oj-navigation-list
  assert.equal(nav.mode, 'drawer')
  const group = nav.menuTree.find((m) => m.hasChildren)
  assert.equal(group.label, 'Gestion')
  // la ruta compuesta (/gestion/person) NO resuelve por sync → se navega por la terminal
  assert.deepEqual(group.children.map((c) => c.id), ['/person', '/island-host'])
  assert.equal(nav.selectors[0].fieldName, 'hotel')
  assert.deepEqual(nav.selectors[0].options.map((o) => o.value), ['Playa', 'Centro'])
  const menu = nav.headerActions.find((a) => a.hasChildren)
  assert.deepEqual(menu.children.map((c) => c.actionId), ['exportPdf', 'exportExcel'])
  assert.match(nav.serverSideType, /VbHome$/)
})

// 17) Foldout (Fase 7): cabeceras en metadata.panels, contenido slotted overview/panel-N.
test('foldoutOf proyecta overview + paneles (título/subtítulo/open) con sus textos', () => {
  const { contexts } = reduceContexts(empty(), fx('load-foldout'))
  const foldout = foldoutOf(contexts[HOST_ID])
  assert.equal(foldout.overview.texts.length, 6)
  assert.match(foldout.overview.texts[0], /Jane Smith/)
  assert.deepEqual(foldout.panels.map((p) => p.title), ['Payments', 'Guest profile', 'Notes'])
  assert.equal(foldout.panels[0].subtitle, 'Charges and refunds')
  assert.equal(foldout.panels[2].open, false) // Notes arranca plegado
  assert.deepEqual(foldout.panels[0].texts, ['02/05 · Deposit · 620 €', '12/08 · Balance · pending'])
})

// 18) Wizard (Fase 8): ProgressSteps del wire → tren del guided-process; el paso actual
//     viaja como status 'current' y los campos/botones del paso van por las ramas existentes.
test('wizardOf proyecta los pasos y el paso actual; el form del paso fluye como form normal', () => {
  const { contexts } = reduceContexts(empty(), fx('load-wizard'))
  const host = contexts[HOST_ID]
  const wizard = wizardOf(host)
  assert.deepEqual(wizard.steps.map((s) => s.id), ['cliente', 'envio', 'pago'])
  assert.equal(wizard.currentStep, 'cliente')
  assert.equal(host.pageType, 'process')
  // el paso actual es un form normal para el switch widgetFor…
  const metadata = dynFormMetadataOf(host.tree)
  assert.deepEqual(Object.keys(metadata), ['name', 'email'])
  // …y los botones de navegación son acciones normales
  assert.deepEqual(actionsOf(host.tree).map((a) => a.actionId).sort(), ['back', 'next'])
})

// 19) Fronteras (Fase 9): los campos/acciones de una ISLA no se cuelan en el form del host.
test('el host de una isla no ve los campos ni las acciones del otro lado de la frontera', () => {
  const { contexts } = reduceContexts(empty(), fx('island-host'))
  const host = contexts[HOST_ID]
  const metadata = dynFormMetadataOf(host.tree)
  assert.deepEqual(Object.keys(metadata), ['room', 'status']) // sin paxName/note (de la isla)
  assert.ok(!actionsOf(host.tree).some((a) => a.actionId === 'edit')) // el Edit es de la isla
})

// 20) Route-flip de mediador/isla: la ruta interna conserva los marcadores query.
test('composeInnerRoute: base + flip + marcadores (?_embeddedMediator sigue viajando)', () => {
  assert.equal(
    composeInnerRoute('/guest-note?_embeddedMediator=1&_inline=1', '/edit'),
    '/guest-note/edit?_embeddedMediator=1&_inline=1')
  assert.equal(composeInnerRoute('/products', '/new'), '/products/new')
  assert.equal(composeInnerRoute('/x?m=1', '/'), '/x?m=1')
})

console.log(`\n${pass} tests OK (contrato de wire real)`)
