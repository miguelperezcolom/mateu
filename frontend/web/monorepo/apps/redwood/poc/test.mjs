// Batería de tests del renderer — corre en Node, SIN VB.
// v3: valida el reducer contra increments REALES (fixtures/real/*.json, capturados con
// capture.mjs contra demo/demo-vb :9005) — son tests de CONTRATO del wire, no sintéticos.
// Regenerar fixtures: arrancar demo/demo-vb (mvn spring-boot:run, :9005) y `node capture.mjs`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { composeInnerRoute, loadRoute, bootstrapShell } from './transport.mjs'
import {
  toSyncPath, loadBundleManifest, hasBundle, getBundledIncrement, matchBundledTemplate,
  bundledIncrementFor, __setBundleForTests,
} from './bundle.mjs'
import {
  classifyRequestFailure, isIdempotentAction, shouldRetry, retryDelayMs, MAX_RETRIES,
  connectivity, pendingActions, fetchWithPolicy, setTransportHooks,
} from './resilience.mjs'
import {
  reduceContexts, collectFields, collectActions, collectIslands, mediatorOf, HOST_ID,
  dynFormMetadataOf, actionsOf, summarizeHost, listingOf, onLoadTriggers,
  overlayOf, eventTriggersOf, shellNavOf, foldoutOf, wizardOf, bannersOf, pageStyleOf,
  welcomeOf, generalOverviewOf, itemOverviewOf, taskQueueOf, emptyStateOf,
  islandContentOf, collectIslands as collectIslandsFn, mergeNestedContent, hostContentOf, longTaskWatcher,
  entityHeaderOf, itemOverviewPageOf,
} from './reduceContexts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))
const empty = () => ({ contexts: {}, stack: [], shell: null })
const fieldIds = (tree) => [...new Set(collectFields(tree).map((f) => f.fieldId))]

let pass = 0
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }

// Los tests del transporte son async y SUSTITUYEN globalThis.fetch por un doble. Tienen que
// correr en SERIE: lanzados a la vez, el doble de uno reemplaza al del anterior mientras éste
// sigue en vuelo, y el reintento del primero acaba hablando con el doble del segundo (me pasó).
let queue = Promise.resolve()
const atest = (name, fn) => {
  queue = queue.then(async () => { await fn(); console.log(`  ✓ ${name}`); pass++ })
}

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
  assert.deepEqual(md.name, { type: 'string', displayName: 'Name', required: true, readonly: false, stereotype: 'regular' })
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

// 21) Puertas 1.3/1.6: banners de página y anatomía pageWidth.
test('bannersOf mapea Page.banners al messages-banner; pageStyleOf aplica la anatomía RDS', () => {
  const { contexts } = reduceContexts(empty(), fx('load-form'))
  // load-form (Person) no lleva banners
  assert.deepEqual(bannersOf(contexts[HOST_ID]), [])
  // anatomía: person (sin pageWidth) → fixed; foldout → edgeToEdge
  assert.equal(pageStyleOf(contexts[HOST_ID]).maxWidth, '1408px')
  const foldout = reduceContexts(empty(), fx('load-foldout')).contexts[HOST_ID]
  assert.equal(foldout.pageWidth, 'edgeToEdge')
  assert.deepEqual(pageStyleOf(foldout), { maxWidth: 'none', margin: '0', padding: '0' })
})

// 22) Arquetipos compuestos: welcome, general overview e item overview se proyectan del núcleo.
test('welcomeOf/generalOverviewOf/itemOverviewOf proyectan los tres arquetipos', () => {
  const welcome = welcomeOf(reduceContexts(empty(), fx('load-welcome')).contexts[HOST_ID])
  assert.equal(welcome.title, 'VB Demo front desk')
  assert.equal(welcome.primaryCta.label, 'Start checkout')
  assert.equal(welcome.secondaryCtaId, 'goProducts')
  assert.deepEqual(welcome.tiles.map((t) => t.title), ['1 · Browse the catalog', '2 · Guided checkout', '3 · Track the booking'])
  const overview = generalOverviewOf(reduceContexts(empty(), fx('load-requisitions')).contexts[HOST_ID])
  assert.equal(overview.title, 'Requisition 204')
  assert.match(overview.subtitle, /Processing/)
  assert.equal(overview.switcherField, 'record')
  assert.equal(overview.switcherValue, 'r1')
  assert.equal(overview.facts.find((f) => f.label === 'Amount').value.includes('12.480'), true)
  assert.deepEqual(overview.cards.map((c) => c.title), ['Details', 'Approval'])
  const item = itemOverviewOf(reduceContexts(empty(), fx('load-chair')).contexts[HOST_ID])
  assert.equal(item.key.texts.length, 5)
  assert.deepEqual(item.tabs.map((t) => t.label), ['Specifications', 'Reviews'])
  assert.match(item.tabs[1].texts[0], /4.6/)
})

// 23) Edición inline (@InlineEditing): columnas editable → grid + plantillas de editor por
// tipo; el commit es update-row + parameters._editedRow y responde SOLO un toast success
// (sin fragments — el valor editado ya está en el cliente).
test('inline editing: plantillas por editorType y update-row = toast sin fragments', () => {
  const stock = fx('load-stock') // contenido del mediador; se simula su llegada al host
  stock.fragments[0].targetComponentId = ''
  const listing = listingOf(reduceContexts(empty(), stock).contexts[HOST_ID])
  assert.equal(listing.display, 'grid')
  assert.equal(listing.editable, true)
  const byField = Object.fromEntries(listing.columns.map((c) => [c.field, c.template]))
  assert.equal(byField.id, undefined) // @ReadOnly → sin editor
  assert.equal(byField.product, 'cellEditText')
  assert.equal(byField.units, 'cellEditNumber')
  assert.equal(byField.price, 'cellEditNumber')
  assert.equal(byField.active, 'cellEditBoolean')
  const inc = fx('update-row')
  assert.equal((inc.fragments || []).length, 0)
  assert.equal(inc.messages.length, 1)
  assert.equal(inc.messages[0].variant, 'success')
})

// 24) Front-office: los "listados" de check-in/out/en-casa son TaskQueue con los datos
// INLINE en la metadata (grupos → cards con badges); el EmptyState del panel de detalle
// se proyecta aparte. Contrato del clic: actionId con parameters._item = id.
test('front-office: taskQueueOf proyecta grupos/cards/badges y emptyStateOf el placeholder', () => {
  const reg = reduceContexts(empty(), fx('fo-load-checkin'))
  const queue = taskQueueOf(reg.contexts[HOST_ID].tree)
  assert.equal(queue.actionId, 'openGuest')
  assert.equal(queue.groups.length, 1)
  assert.match(queue.groups[0].label, /Llegadas hoy/)
  const first = queue.groups[0].items[0]
  assert.equal(first.id, 'st-maria')
  assert.equal(first.title, 'María Fernández')
  assert.match(first.badges[0].badgeClass, /oj-badge/)
  const placeholder = emptyStateOf(reg.contexts[HOST_ID].tree)
  assert.match(placeholder.title, /Selecciona un huésped/)
})

// 25) Front-office: el detalle del TaskQueue es una isla-mediador de sabor App (nodo
// ClientSide App MEDIATOR con id estable y homeRoute/homeConsumedRoute/homeServerSideType
// en su metadata) y su contenido (el CheckInWizard embebido) se proyecta como BLOQUES
// display precomputados (flags is*, textos ${state.x} interpolados).
test('front-office: isla-App detectada e islandContentOf proyecta el wizard embebido', () => {
  const island = fx('fo-island-wizard')
  const blocks = islandContentOf(island)
  const atoms = blocks.flatMap((b) => b.items)
  assert.ok(atoms.some((a) => a.isProgress && a.steps.length === 4))
  const header = atoms.find((a) => a.isEntityHeader)
  assert.equal(header.title, 'María Fernández')
  const notice = atoms.find((a) => a.isNotice && a.buttons.length === 2)
  assert.equal(notice.buttons[0].actionId, 'selectPax')
  assert.deepEqual(notice.buttons[0].parameters, { paxIndex: 1 })
  assert.ok(blocks.some((b) => b.isCard))
  assert.ok(atoms.every((a) => !a.isText || !a.text.includes('${'))) // interpolación hecha
  assert.ok(atoms.some((a) => a.isButtons && a.buttons.some((btn) => btn.actionId === 'next')))
})

// 26) Front-office: átomos de negocio — ResourceGrid/OfferCard (habitación), AddOnPicker/
// StatusList (extras/confirmar), Ledger/PaymentPicker (check-out), Meter/Stat (en casa).
// Contratos de despacho = los del renderer web compartido (_item / _method / _added+_total).
test('front-office: átomos ResourceGrid/AddOns/Ledger/Payment/Meter proyectan del wire real', () => {
  const atomsOf = (name) => islandContentOf(fx(name)).flatMap((b) => b.items)
  const conf = atomsOf('fo-island-step-last')
  const statusList = conf.find((a) => a.isStatusList)
  assert.equal(statusList.items[0].title, 'María Fernández')
  assert.match(statusList.items[0].statusClass, /success/)
  const checkout = atomsOf('fo-island-checkout')
  const ledger = checkout.find((a) => a.isLedger)
  assert.equal(ledger.totalText, '€ 1.710,50')
  assert.equal(ledger.lines[1].amountText, 'Incluido')
  assert.match(ledger.lines.find((l) => l.concept.includes('Descuento')).amountClass, /success/)
  const payment = checkout.find((a) => a.isPayment)
  assert.equal(payment.methods.length, 3)
  assert.equal(payment.methods[0].chroming, 'callToAction') // card = selected
  assert.deepEqual(payment.confirmParameters, { _method: 'card' })
  const casa = atomsOf('fo-island-encasa')
  const meter = casa.find((a) => a.isMeter)
  assert.equal(meter.max, 1800)
  assert.match(meter.valueText, /1.710,50/)
  assert.ok(casa.some((a) => a.isStat))
})

// 27) Isla ANIDADA (el documento del check-in): collectIslands detecta el nodo App con su
// initialData (el SEED del host: stayId/paxIndex — debe viajar como componentState en la
// carga Y en cada acción, el server no lo eca); mergeNestedContent fusiona sus átomos en
// el bloque de la isla madre MARCADOS fromNested (leer $application.variables en templates
// profundos no re-liga los contextos en el evaluador CSP de VB).
test('isla anidada: seed en collectIslands y fusión fromNested en la isla madre', () => {
  const wizard = fx('fo-island-wizard')
  const nestedInfo = collectIslandsFn(wizard.tree)[0]
  assert.equal(nestedInfo.id, 'island_checkin_st_maria_documento')
  assert.equal(nestedInfo.initialData.stayId, 'st-maria')
  assert.equal(nestedInfo.initialData.paxIndex, 1)
  const nestedBlocks = islandContentOf(fx('fo-nested-doc'))
  const atoms = nestedBlocks.flatMap((b) => b.items)
  assert.ok(atoms.some((a) => a.isNotice))
  const merged = mergeNestedContent(islandContentOf(wizard), nestedBlocks)
  const nestedCard = merged.find((b) => b.isCard && b.items.some((a) => a.fromNested))
  assert.ok(nestedCard, 'la card del documento lleva los átomos fusionados')
  const btn = nestedCard.items.find((a) => a.isButtons)
  assert.equal(btn.buttons[0].fromNested, true) // enruta a runMateuNestedAction
})

// 28) Checklist de operaciones de check-in (Reserva 360, estado por-llegar): el banner
// TaskProgress proyecta N-de-M precomputado (el CSP de VB no compara) y el StatusList
// lleva las acciones rápidas por operación (Crear wifi / Grabar llave → {_item}).
test('checklist check-in: TaskProgress N-de-M + StatusList con acciones por operación', () => {
  const atoms = islandContentOf(fx('fo-reserva-arriving')).flatMap((b) => b.items)
  const tp = atoms.find((a) => a.isTaskProgress)
  assert.equal(tp.label, 'Operaciones de check-in')
  assert.equal(tp.max, 7)
  assert.equal(tp.valueText, tp.value + ' de 7')
  assert.match(tp.panelClass, /oj-panel/)
  const ops = atoms.filter((a) => a.isStatusList)
      .find((sl) => sl.items.some((i) => i.title === 'Tarjeta wifi'))
  // columns=3 → grid responsive: wrapper oj-flex + cada fila oj-flex-item oj-md-4
  assert.match(ops.wrapClass, /oj-flex/)
  assert.equal(ops.items[0].gridCell, true)
  assert.match(ops.items[0].cellClass, /mateu-grid-cell/) // rejilla fija del cockpit (22rem)
  assert.match(ops.wrapClass, /mateu-grid/)
  const huespedes = atoms.filter((a) => a.isStatusList)
      .find((sl) => sl.items.some((i) => i.title === 'Klaus Hoffmann'))
  // lista de UNA columna con acciones → rama APILADA (h3 sin avatar), no tarjetas
  assert.equal(huespedes.wrapClass, '')
  assert.ok(!huespedes.items[0].gridCell)
  assert.equal(huespedes.items[0].hasActions, true)
  const wifi = ops.items.find((i) => i.title === 'Tarjeta wifi')
  assert.equal(wifi.actions.length, 1)
  assert.equal(wifi.actions[0].label, 'Crear')
  assert.equal(wifi.actions[0].actionId, 'opWifi')
  assert.deepEqual(wifi.actions[0].parameters, { _item: 'wifi' })
  // filas de pax: DOS acciones (escanear / a mano) y proyección APILADA (hasActions)
  const paxRow = huespedes.items.find((i) => i.title === 'Acompañante 2')
  assert.equal(paxRow.hasActions, true)
  assert.deepEqual(paxRow.actions.map((a) => a.actionId), ['escanearPax', 'rellenarPax'])
  assert.deepEqual(paxRow.actions[0].parameters, { _item: '2' })
})

// 29) Fila zonada (@Zones 36/64 de la Reserva 360): el HorizontalLayout de columnas
// flex-calc se proyecta como bloques-columna (colClass en doceavos: 36→4, 64→8) y
// hostContentOf estampa blockClass (los no zonados van a oj-sm-12).
test('zonas: huéspedes md-4 a la izquierda y operativa md-8 a la derecha', () => {
  const ctx = fx('fo-reserva-arriving')
  const blocks = hostContentOf(ctx, null, { dropEntityHeader: true })
  const zoned = blocks.filter((b) => /oj-md-/.test(b.blockClass))
  assert.equal(zoned.length, 2)
  assert.match(zoned[0].blockClass, /oj-md-4/) // 36% → 4/12 (huéspedes, card)
  assert.ok(zoned[0].isCard)
  assert.match(zoned[1].blockClass, /oj-md-8/) // 64% → 8/12 (operativa)
  assert.ok(zoned[1].items.some((a) => a.isTaskProgress))
  assert.ok(blocks.every((b) => b.blockClass))
})

// 30) Diálogo de progreso de un LongTask (SSE del host: escanearPax de la 360): el vigía
// consume el Add del Dialog-con-ProgressBar y los state-only dirigidos a su id; el último
// increment trae _closeAfterMillis + los commands del refresco en rest.
test('longTaskWatcher: open → 4 progress → cierre con rest.commands (dispatchEvent)', () => {
  const stream = fx('fo-sse-scan-stream')
  const watcher = longTaskWatcher()
  const events = stream.map((inc) => watcher.consume(inc))
  assert.ok(events.every(Boolean), 'todos los increments del LongTask se consumen')
  assert.equal(events[0].kind, 'open')
  assert.match(events[0].title, /Escaneando el documento/)
  assert.equal(events[0].value, 0)
  assert.equal(events.filter((e) => e.kind === 'progress').length, 5)
  assert.equal(events[1].value, 0.25)
  assert.match(events[1].text, /Encendiendo el escáner/)
  const last = events[events.length - 1]
  assert.equal(last.title, 'Documento verificado')
  assert.equal(watcher.closeAfter, 1000)
  assert.equal(last.rest.commands.length, 1)
  assert.equal(last.rest.fragments.length, 0) // el fragment del diálogo NO se reduce
})

// 31) ITEM OVERVIEW nativo: página de entidad con la zona ESTRECHA primero (panel de
// datos clave + main ancho) → oj-sp-item-overview-page; la ancha primero sigue siendo
// general overview (null aquí). El EntityHeader pasa al oj-sp-item-overview (badge del
// primer Chip, subtítulo SIN badges) y "Volver…" del toolbar a la flecha goToParent.
test('item overview: zona estrecha primero → panel clave + main; ancha primero → null', () => {
  const ctx = fx('fo-reserva-arriving')
  const entity = entityHeaderOf(ctx)
  // la página de entidad pura son SOLO las dos zonas (el fixture arriving lleva además
  // una banda de cabecera oj-sm-12; el detector exige exactamente dos bloques, como el gop)
  const blocks = hostContentOf(ctx, null, { dropEntityHeader: true })
    .filter((b) => /oj-md-/.test(b.blockClass))
  const toolbar = [
    { actionId: 'volverReserva', label: 'Volver a la reserva', chroming: 'outlined' },
    { actionId: 'otra', label: 'Otra acción', chroming: 'outlined' },
  ]
  const iop = itemOverviewPageOf(entity, blocks, toolbar)
  assert.ok(iop && iop.on)
  assert.ok(entity.title.length > 0)
  assert.equal(iop.overview.title, entity.title)
  assert.equal(iop.overview.subtitle, entity.subtitlePlain) // sin los badges concatenados
  assert.ok(iop.overview.badge, 'el primer Chip del EntityHeader es el badge del panel')
  assert.equal(iop.overview.badge.status, 'neutral') // color contrast → neutral
  assert.equal(iop.overview.blocks.length, 1)
  assert.match(iop.overview.blocks[0].blockClass, /oj-sm-12/) // a ancho completo del slot
  assert.equal(iop.main.blocks.length, 1)
  assert.ok(iop.main.blocks[0].items.some((a) => a.isTaskProgress)) // la operativa es el main
  assert.ok(iop.back.show)
  assert.equal(iop.back.actionId, 'volverReserva')
  assert.equal(iop.back.label, 'Volver a la reserva') // la etiqueta viaja a translations.goToParent
  assert.equal(iop.secondary.length, 1)
  assert.equal(iop.secondary[0].id, 'otra')
  // la ancha primero (anatomía general overview) NO es item overview
  assert.equal(itemOverviewPageOf(entity, [blocks[1], blocks[0]].map((b) => b), toolbar), null)
})

// 32) Modal de decisión (Dialog): TODOS los botones del contenido pasan al pie CON sus
// parameters — el modal del check-in de grupo ofrece "Check-in de <nombre>" (con _item)
// además de "Volver al listado" (en un drawer, los botones con parameters se quedan en
// el contenido: son listas de opciones).
test('overlay Dialog: los botones con parameters van al pie del modal', () => {
  const dialogCtx = {
    id: 'dlg1',
    title: 'Check-in completado',
    tree: {
      type: 'ServerSide',
      metadata: { type: 'Dialog' },
      children: [{
        type: 'VerticalLayout', metadata: {},
        children: [
          { type: 'Text', metadata: { text: '¿Seguimos con su check-in?' }, children: [] },
          { type: 'Button', metadata: { label: 'Check-in de Ana', actionId: 'siguienteReserva', buttonStyle: 'primary', parameters: { _item: 'st-ana' } }, children: [] },
          { type: 'Button', metadata: { label: 'Volver al listado', actionId: 'volverListado' }, children: [] },
        ],
      }],
    },
    state: {},
  }
  const reg = { contexts: { dlg1: dialogCtx }, stack: ['dlg1'], shell: null }
  const overlay = overlayOf(reg)
  assert.ok(overlay.isDialog)
  const ids = overlay.actions.map((a) => a.actionId)
  assert.ok(ids.includes('siguienteReserva'), 'el botón con parameters está en el pie')
  assert.ok(ids.includes('volverListado'))
  const siguiente = overlay.actions.find((a) => a.actionId === 'siguienteReserva')
  assert.equal(siguiente.parameters._item, 'st-ana') // el _item viaja con la acción
  assert.equal(siguiente.chroming, 'callToAction')
  // y el contenido ya NO lleva botones (irían duplicados)
  assert.ok(!overlay.content.some((b) => b.items.some((a) => a.isButtons)))
})


// ── resiliencia del transporte ───────────────────────────────────────────────────────────
// Este core no comparte nada con libs/mateu, así que las mismas garantías se testean aquí
// otra vez. Lo que cambia respecto a los renderers web es la FORMA del fallo: fetch resuelve
// un 5xx como éxito y señala un fallo de red con un TypeError sin código.

test('clasifica un 5xx como fallo de servidor reintentable, con su status', () => {
  const err = Object.assign(new Error('HTTP 503'), { status: 503 })
  const f = classifyRequestFailure(err)
  assert.equal(f.kind, 'server')
  assert.equal(f.retryable, true)
  assert.equal(f.status, 503)
  assert.ok(f.message.includes('503'))
})

test('un TypeError de fetch se lee como sin-conexión aunque el navegador diga que hay red', () => {
  // "Failed to fetch" es TODO lo que da fetch: sin respuesta, la falta de respuesta es la prueba.
  const f = classifyRequestFailure(Object.assign(new TypeError('Failed to fetch')), { online: true })
  assert.equal(f.kind, 'offline')
})

test('un abort propio es cancelación silenciosa; uno por timeout sí es noticia', () => {
  const abort = Object.assign(new Error('aborted'), { name: 'AbortError' })
  assert.equal(classifyRequestFailure(abort).kind, 'cancelled')
  assert.equal(classifyRequestFailure(abort).message, '')
  const timedOut = Object.assign(new Error('aborted'), { name: 'AbortError', __mateuTimedOut: true })
  assert.equal(classifyRequestFailure(timedOut).kind, 'timeout')
  assert.ok(timedOut.message !== classifyRequestFailure(timedOut).message)
})

test('nunca ofrece reintentar una petición rechazada (4xx)', () => {
  const f = classifyRequestFailure(Object.assign(new Error('bad'), { status: 400 }))
  assert.equal(f.kind, 'client')
  assert.equal(f.retryable, false)
})

test('el mensaje al usuario no filtra jerga de transporte', () => {
  const raw = ['Failed to fetch', 'HTTP 500', 'AbortError']
  for (const e of [new TypeError('Failed to fetch'),
                   Object.assign(new Error('HTTP 500'), { status: 500 })]) {
    const msg = classifyRequestFailure(e, { online: false }).message
    assert.ok(msg.length > 0)
    for (const jargon of raw) assert.ok(!msg.includes(jargon), `"${msg}" filtra "${jargon}"`)
  }
})

test('reconoce las lecturas del framework — incluida la carga de ruta, que usa id vacío', () => {
  for (const id of ['', '__load__', 'search', '_globalsearch', 'search-pais', '_appcontext-search-hotel']) {
    assert.ok(isIdempotentAction(id), `${JSON.stringify(id)} debería ser lectura`)
  }
  for (const id of ['save', 'create', 'delete', '_notifications-read']) {
    assert.ok(!isIdempotentAction(id), `${id} NO debería ser lectura`)
  }
  // un id AUSENTE es trabajo desconocido, y no debe confundirse con el vacío de la carga
  assert.ok(!isIdempotentAction(undefined))
  // la bandera del wire es un opt-IN: nunca saca a una lectura conocida de la lista
  assert.ok(isIdempotentAction('recalcular', true))
  assert.ok(isIdempotentAction('search', false))
})

test('reintenta una lectura transitoria y JAMÁS una escritura', () => {
  const timeout = classifyRequestFailure(Object.assign(new Error('x'), { __mateuTimedOut: true }))
  const server = classifyRequestFailure(Object.assign(new Error('x'), { status: 500 }))
  assert.ok(shouldRetry(timeout, 1, { idempotent: true }))
  assert.ok(shouldRetry(server, 1, { idempotent: true }))
  // tras un timeout no sabemos si el servidor lo aplicó: repetir arriesga un duplicado
  assert.ok(!shouldRetry(timeout, 1, { idempotent: false }))
  assert.ok(!shouldRetry(server, 1, { idempotent: false }))
  // el offline lo lleva connectivity, no el bucle de reintentos
  const offline = classifyRequestFailure(new TypeError('Failed to fetch'), { online: false })
  assert.ok(!shouldRetry(offline, 1, { idempotent: true }))
  // y hay presupuesto
  assert.ok(shouldRetry(timeout, MAX_RETRIES, { idempotent: true }))
  assert.ok(!shouldRetry(timeout, MAX_RETRIES + 1, { idempotent: true }))
})

test('el backoff crece y lleva jitter de ±25%', () => {
  assert.ok(retryDelayMs(1, () => 0.5) < retryDelayMs(2, () => 0.5))
  assert.equal(retryDelayMs(1, () => 0), 225)
  assert.equal(retryDelayMs(1, () => 1), 375)
})

test('conectividad: el tráfico propio manda sobre la bandera del navegador', () => {
  connectivity.reset()
  assert.equal(connectivity.isOnline(), true)
  connectivity.noteUnreachable()
  assert.equal(connectivity.isOnline(), false)
  connectivity.noteReachable()
  assert.equal(connectivity.isOnline(), true)
  connectivity.reset()
})

test('el guard deja pasar la primera y descarta la idéntica en vuelo', () => {
  pendingActions.reset()
  const k = pendingActions.key('form-1', 'save')
  assert.equal(pendingActions.begin(k), true)
  assert.equal(pendingActions.begin(k), false)
  pendingActions.end(k)
  assert.equal(pendingActions.begin(k), true)
  // el bloqueo es por (componente, acción): otra acción u otro componente no se ven afectados
  assert.equal(pendingActions.begin(pendingActions.key('form-1', 'delete')), true)
  assert.equal(pendingActions.begin(pendingActions.key('form-2', 'save')), true)
  pendingActions.reset()
})

test('el guard libera un hueco que nadie pudo cerrar (válvula de caducidad)', () => {
  pendingActions.reset()
  const k = pendingActions.key('form-1', 'save')
  const t0 = 1000000
  assert.equal(pendingActions.begin(k, t0), true)
  assert.equal(pendingActions.begin(k, t0 + 119000), false)
  assert.equal(pendingActions.begin(k, t0 + 121000), true)
  pendingActions.reset()
})

atest('fetchWithPolicy reintenta una lectura ante un 503 y lo reporta como UN solo resultado', async () => {
  connectivity.reset()
  const events = []
  setTransportHooks({
    onStart: (e) => events.push(['start', e.actionId]),
    onSettle: (e) => events.push(['settle', e.actionId, e.failure ? e.failure.kind : 'ok']),
  })
  let calls = 0
  const original = globalThis.fetch
  globalThis.fetch = async () => {
    calls++
    if (calls === 1) return { ok: false, status: 503, text: async () => 'nope' }
    return { ok: true, json: async () => ({ fragments: [] }) }
  }
  try {
    const res = await fetchWithPolicy('http://x/', {}, { actionId: 'search' })
    assert.ok(res.ok)
    assert.equal(calls, 2, 'la lectura se reenvió una vez')
    // N intentos = UN estado de carga y UN resultado de cara a la UI
    assert.deepEqual(events, [['start', 'search'], ['settle', 'search', 'ok']])
  } finally {
    globalThis.fetch = original
    setTransportHooks(null)
    connectivity.reset()
  }
})

atest('fetchWithPolicy envía una escritura EXACTAMENTE una vez ante un 503, con el fallo clasificado', async () => {
  connectivity.reset()
  let calls = 0
  const original = globalThis.fetch
  globalThis.fetch = async () => { calls++; return { ok: false, status: 503, text: async () => 'nope' } }
  try {
    await assert.rejects(
      () => fetchWithPolicy('http://x/', {}, { actionId: 'save' }),
      (e) => {
        assert.equal(e.failure.kind, 'server')     // el error viaja clasificado
        assert.ok(e.failure.message.includes('503'))
        return true
      },
    )
    assert.equal(calls, 1, 'una escritura no se repite a espaldas del usuario')
  } finally {
    globalThis.fetch = original
    connectivity.reset()
  }
})

atest('fetchWithPolicy corta una petición colgada por timeout — fetch no trae ninguno', async () => {
  connectivity.reset()
  const original = globalThis.fetch
  globalThis.fetch = (url, init) => new Promise((_, reject) => {
    // simula el servidor que nunca responde: sólo termina cuando abortamos
    init.signal.addEventListener('abort', () => {
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    })
  })
  try {
    await assert.rejects(
      () => fetchWithPolicy('http://x/', {}, { actionId: 'save', timeoutMillis: 60 }),
      (e) => {
        assert.equal(e.failure.kind, 'timeout')   // no 'cancelled': al usuario sí le importa
        return true
      },
    )
  } finally {
    globalThis.fetch = original
    connectivity.reset()
  }
})

atest('timeoutMillis negativo = sin ceiling, para un stream que dura lo que dure', async () => {
  connectivity.reset()
  const original = globalThis.fetch
  let sawSignal
  globalThis.fetch = async (url, init) => {
    sawSignal = init.signal
    await new Promise((r) => setTimeout(r, 40))
    return { ok: true, json: async () => ({}) }
  }
  try {
    await fetchWithPolicy('http://x/', {}, { actionId: 'longTask', timeoutMillis: -1 })
    assert.ok(!sawSignal || !sawSignal.aborted, 'un LongTask no puede morir por el ceiling')
  } finally {
    globalThis.fetch = original
    connectivity.reset()
  }
})

// ── static bundle (modo sin backend) ──────────────────────────────────────────────────────
test('bundle: toSyncPath refleja el transporte/web', () => {
  assert.equal(toSyncPath(''), '_no_route')
  assert.equal(toSyncPath('/'), '_no_route')
  assert.equal(toSyncPath('/products'), 'products')
  assert.equal(toSyncPath('orders/1'), 'orders/1')
})

test('bundle: matchBundledTemplate casa :param e inyecta el param en state y data', () => {
  __setBundleForTests(new Map(), [
    { regex: /^orders\/([^/]+)$/, paramNames: ['id'],
      increment: { fragments: [{ targetComponentId: null, state: { id: '__mateu_param__' } }] } },
  ])
  assert.equal(getBundledIncrement('orders/42'), undefined) // una plantilla no es entrada exacta
  const inc = matchBundledTemplate('orders/42')
  assert.ok(inc)
  assert.equal(inc.fragments[0].state.id, '42')  // el valor real gana al placeholder
  assert.equal(inc.fragments[0].data.id, '42')
  assert.equal(matchBundledTemplate('customers/7'), undefined)
  __setBundleForTests(undefined)
})

test('bundle: bundledIncrementFor re-apunta el targetComponentId nulo al initiator', () => {
  __setBundleForTests(new Map([['home', { fragments: [{ targetComponentId: null, component: {} }] }]]))
  const inc = bundledIncrementFor('/home', 'isla1')
  assert.equal(inc.fragments[0].targetComponentId, 'isla1')
  __setBundleForTests(undefined)
})

atest('bundle: loadBundleManifest indexa las entradas ok y salta las rotas', async () => {
  const manifest = { entries: [
    { syncPath: 'home', ok: true, json: JSON.stringify({ fragments: [{ x: 1 }] }) },
    { syncPath: 'broken', ok: false, json: null },
    { syncPath: 'bad', ok: true, json: '{no json' },
  ] }
  await loadBundleManifest('x', async () => ({ ok: true, json: async () => manifest }))
  assert.equal(hasBundle(), true)
  assert.deepEqual(getBundledIncrement('home'), { fragments: [{ x: 1 }] })
  assert.equal(getBundledIncrement('broken'), undefined)
  assert.equal(getBundledIncrement('bad'), undefined)
  __setBundleForTests(undefined)
})

atest('bundle: loadRoute responde desde el bundle SIN tocar la red', async () => {
  __setBundleForTests(new Map([['home', { fragments: [{ targetComponentId: null }] }]]))
  const original = globalThis.fetch
  let hit = false
  globalThis.fetch = async () => { hit = true; return { ok: true, json: async () => ({}) } }
  try {
    const inc = await loadRoute('http://x', '/home', 'shell')
    assert.equal(hit, false, 'una carga bundleada no debe ir al backend')
    assert.equal(inc.fragments[0].targetComponentId, 'shell')
  } finally {
    globalThis.fetch = original
    __setBundleForTests(undefined)
  }
})

atest('bundle: bootstrapShell cae a la ruta raíz bundleada si el backend NO está', async () => {
  __setBundleForTests(new Map([['_no_route', { fragments: [{ targetComponentId: null, component: { menu: [] } }] }]]))
  connectivity.reset()
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') } // backend caído
  try {
    const inc = await bootstrapShell('http://x', 'shell')
    assert.ok(inc && inc.fragments, 'la shell debe arrancar desde el bundle sin backend')
    assert.equal(inc.fragments[0].targetComponentId, 'shell')
  } finally {
    globalThis.fetch = original
    connectivity.reset()
    __setBundleForTests(undefined)
  }
})

await queue
console.log(`\n${pass} tests OK (contrato de wire real)`)
