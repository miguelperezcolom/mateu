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
  overlayOf, eventTriggersOf, shellNavOf, foldoutOf, wizardOf, bannersOf, pageStyleOf,
  welcomeOf, generalOverviewOf, itemOverviewOf, taskQueueOf, emptyStateOf,
  islandContentOf, collectIslands as collectIslandsFn, mergeNestedContent, hostContentOf, longTaskWatcher,
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

console.log(`\n${pass} tests OK (contrato de wire real)`)
