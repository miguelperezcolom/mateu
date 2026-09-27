// Batería de tests del renderer — corre en Node, SIN VB.
// v3: valida el reducer contra increments REALES (fixtures/real/*.json, capturados con
// capture.mjs contra demo/demo-vb :9005) — son tests de CONTRATO del wire, no sintéticos.
// Regenerar fixtures: arrancar demo/demo-vb (mvn spring-boot:run, :9005) y `node capture.mjs`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { composeInnerRoute, routeFlipOf, loadRoute, loadRouteInto, bootstrapShell, expandRemoteMenus, remoteRouteOf, registerRemoteRoute, baseOf, runMateuAction, callMateu } from './transport.mjs'
import {
  headerWidgetsOf, redwoodHtmlOf, plainTextOf, initialsOf, remoteWidgetHtmlOf, startRemoteWidget, stopRemoteWidgets,
} from './widgets.mjs'
import {
  toSyncPath, loadBundleManifest, hasBundle, getBundledIncrement, matchBundledTemplate,
  bundledIncrementFor, __setBundleForTests, applyRouteParams, getRouteEntry,
} from './bundle.mjs'
import {
  classifyRequestFailure, isIdempotentAction, shouldRetry, retryDelayMs, MAX_RETRIES,
  connectivity, pendingActions, fetchWithPolicy, setTransportHooks,
  authHeadersOf,
} from './resilience.mjs'
import {
  buildChatMenuContext, buildChatBody, effectiveChatUrl, tryParseTokenUsage,
  tryParseCustomEvent, streamChat,
} from './chat.mjs'
import {
  reduceContexts, collectFields, collectActions, collectIslands, mediatorOf, HOST_ID,
  dynFormMetadataOf, actionsOf, summarizeHost, listingOf, onLoadTriggers, findByType,
  selectionOfKeySet, selectedRowsOf, withListingSelection,
  overlayOf, eventTriggersOf, shellNavOf, foldoutOf, wizardOf, bannersOf, pageStyleOf,
  welcomeOf, generalOverviewOf, itemOverviewOf, taskQueueOf, emptyStateOf,
  islandContentOf, collectIslands as collectIslandsFn, mergeNestedContent, hostContentOf, longTaskWatcher,
  entityHeaderOf, itemOverviewPageOf, primaryToolbarButton,
  filterDescriptorOf, filterChipsOf, multiValuesOf, abbreviateUuid,
  smartFiltersMetadataOf, smartFilterSuggestionsOf, smartFilterValueOf, filterStateOfSmartFilters,
  suggestionRowsFor, suggestionFiltersProviderOf, smartFiltersOf, setMetadataProviderFactory, KEYWORD_FILTER,
  listActionOf, listActionRequestOf, rowEditorOf, rowFieldsOf, validateRow, pendingLookupsOf, lookupRequestOf,
  isModalRowEditor, fieldListOf, interpolate, ROW_VALIDATING_VERBS,
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

// 14 bis) Detalle de fila (@Details): viaja como detailPath del Crud; listingOf lo proyecta, y
//     distingue el listado de consulta (el clic abre el detalle) del navegable (el clic abre el
//     registro: su primera columna lleva actionId 'view').
test('listing: listingOf proyecta el detalle de fila y si la fila es navegable', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  assert.ok(crud)
  const plain = listingOf(reduceContexts(empty(), content).contexts[HOST_ID])
  assert.equal(plain.detailPath, null)

  crud.metadata.detailPath = 'parameters'
  const cols = crud.metadata.columns || []
  const first = cols[0] && (cols[0].metadata || cols[0])
  if (first) delete first.actionId
  const detail = listingOf(reduceContexts(empty(), content).contexts[HOST_ID])
  assert.equal(detail.detailPath, 'parameters')
  assert.equal(detail.navigable, false)

  if (first) {
    first.actionId = 'view'
    const navigable = listingOf(reduceContexts(empty(), content).contexts[HOST_ID])
    assert.equal(navigable.navigable, true)
  }
})

// 14 ter) UUID abreviado: una columna de texto con UUIDs se pinta "…-<último bloque>" con el UUID
//     en el tooltip; la fila conserva el valor entero (navegación, acciones, selección).
test('listing: una columna de UUIDs se abrevia sin tocar la fila', () => {
  const uuid = '750f3bce-b760-4370-9ceb-0994d4bb705b'
  assert.equal(abbreviateUuid(uuid), '…-0994d4bb705b')
  assert.equal(abbreviateUuid('CU838F'), 'CU838F')
  assert.equal(abbreviateUuid('process ' + uuid), 'process ' + uuid)
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  const page = JSON.parse(JSON.stringify(search))
  const data = page.fragments[0].data
  const rows = data.crud.page.content
  rows.forEach((r, i) => { r.id = i === 0 ? uuid : 'P-' + i })
  reg = reduceContexts(reg, page)
  const listing = listingOf(reg.contexts[HOST_ID])
  const idCol = listing.columns.find((c) => c.headerText && c.field.startsWith('id'))
  assert.equal(idCol.field, 'id__uuidCell')
  assert.equal(idCol.template, 'cellUuid')
  assert.deepEqual(listing.rows[0].id__uuidCell, { text: '…-0994d4bb705b', full: uuid })
  assert.deepEqual(listing.rows[1].id__uuidCell, { text: 'P-1', full: 'P-1' })
  assert.equal(listing.rows[0].id, uuid) // la fila, intacta
  assert.ok(listing.columns.find((c) => c.field === 'name').template === undefined) // no es UUID
  const picked = selectedRowsOf(listing.rows, { all: true, keys: [], except: [] })
  assert.ok(picked.every((r) => !('id__uuidCell' in r))) // la selección manda la fila tal cual
})

// 14 ter) Selección de filas (Listing.rowsSelectionEnabled): la tabla pone casillas y una acción
//     del host lleva las filas marcadas en crud_selected_items — el contrato de Vaadin, que
//     HttpRequest.getSelectedRows lee del componentState.
test('listing: la selección de filas se proyecta y viaja en crud_selected_items', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, search)
  const listing = listingOf(reg.contexts[HOST_ID])
  assert.equal(listing.rowsSelectionEnabled, true)
  assert.deepEqual(listing.selectionMode, { row: 'multiple' })
  assert.deepEqual(listing.selectionRequired, ['delete'])

  // el KeySet de oj-table: explícito, y "todas menos"
  const explicit = { isAddAll: () => false, values: () => new Set([listing.rows[1]._rowNumber]) }
  const allBut = { isAddAll: () => true, deletedValues: () => new Set([listing.rows[0]._rowNumber]) }
  const one = selectionOfKeySet(explicit)
  assert.deepEqual(selectedRowsOf(listing.rows, one).map((r) => r.name), ['Mouse'])
  assert.deepEqual(selectedRowsOf(listing.rows, selectionOfKeySet(allBut)).map((r) => r.name), ['Mouse', 'Keyboard'])
  assert.deepEqual(selectionOfKeySet(null), { all: false, keys: [], except: [] })

  const state = withListingSelection({ page: 0 }, listing, listing.rows, one)
  assert.equal(state.page, 0)
  assert.deepEqual(state.crud_selected_items.map((r) => r.name), ['Mouse'])
  // sin nada marcado viaja la lista vacía (el servidor distingue "ninguna" de "no aplica")
  assert.deepEqual(withListingSelection({}, listing, listing.rows, null).crud_selected_items, [])
  // un listado sin selección no toca el estado
  const plain = { ...listing, rowsSelectionEnabled: false }
  const untouched = { page: 1 }
  assert.equal(withListingSelection(untouched, plain, listing.rows, one), untouched)
})

// el badge precomputado de @Status no viaja de vuelta en la fila seleccionada
test('listing: una fila seleccionada con @Status se manda sin el badge precomputado', () => {
  const rows = [{ _rowNumber: 0, name: 'A', outcome: { type: 'SUCCESS', message: 'Ok', badgeClass: 'oj-badge' } }]
  const [row] = selectedRowsOf(rows, { all: false, keys: [0], except: [] })
  assert.deepEqual(row.outcome, { type: 'SUCCESS', message: 'Ok' })
  assert.equal(rows[0].outcome.badgeClass, 'oj-badge') // la fila pintada no se toca
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
test('shellNavOf: una entrada oculta (visible:false) no se dibuja dentro de un grupo', () => {
  // @Menu @Hidden en una página local: la alcanza el botón New del listado, no el menú
  const nav = shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu: [
    { label: 'Call center', path: '/callCenter', submenus: [
      { label: 'Bookings', path: '/callCenter/bookings', route: '/callCenter/bookings' },
      { label: 'New booking', path: '/callCenter/newBooking', route: '/callCenter/newBooking', visible: false },
    ] },
  ] } })
  const group = nav.menuTree[0]
  assert.deepEqual(group.children.map((c) => c.label), ['Bookings'])
  assert.equal(group.hasChildren, true)
})

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

test('primaryToolbarButton: manda el wire; si calla, la última que no sea de vuelta', () => {
  // La cabecera Spectra enseña la primaria y la PRIMERA secundaria; lo demás va al `···`.
  // Con el toolbar de la vista de un crud (nadie marcado primary) `Edit` quedaba escondido.
  const view = [
    { actionId: 'cancel-view', label: 'Back to list', chroming: 'outlined' },
    { actionId: 'new', label: 'Add another', chroming: 'outlined' },
    { actionId: 'edit', label: 'Edit', chroming: 'outlined' },
  ]
  assert.equal(primaryToolbarButton(view).actionId, 'edit')
  // lo que declara el wire gana, esté donde esté
  const declared = [{ actionId: 'a', chroming: 'callToAction' }, { actionId: 'b', chroming: 'outlined' }]
  assert.equal(primaryToolbarButton(declared).actionId, 'a')
  // un toolbar de solo vueltas no promociona nada (mejor sin primaria que con una que saca de la pantalla)
  assert.equal(primaryToolbarButton([{ actionId: 'cancel-edit' }, { actionId: 'back' }]), null)
  assert.equal(primaryToolbarButton([]), null)
  // editor: Cancel + Save → Save
  assert.equal(primaryToolbarButton([{ actionId: 'cancel-edit' }, { actionId: 'save' }]).actionId, 'save')
})

test('detalle de proceso (wire real): campos, pestañas, grid embebido y el componente del grafo', () => {
  // Página de FORMULARIO con pestañas dentro. Antes la reclamaba el arquetipo item-overview
  // por el mero hecho de llevar un TabLayout, y quedaba en rótulos de pestaña sin nada debajo:
  // ni los campos de fuera, ni las tablas de dentro, ni el grafo.
  const reg = reduceContexts(empty(), fx('wf-process'))
  const host = reg.contexts[HOST_ID]
  assert.equal(itemOverviewOf(host), null, 'sin panel de datos clave no es un item overview')

  // como en la chain: el título de la Page lo pinta la banda del header, no el contenido
  const titulo = summarizeHost(reg, '').title
  const bloques = hostContentOf(host, null, { title: titulo }) || []
  // el card sin título que envuelve la página NO se pinta como tarjeta: el contenedor de
  // contenido ya es el marco, y con panel quedaba una caja dentro de otra
  assert.equal(bloques.length, 1)
  assert.equal(bloques[0].isCard, false)
  assert.equal(bloques[0].isPlain, true)
  const items = bloques.flatMap((b) => b.items)
  // los campos que están FUERA de las pestañas
  assert.ok(items.some((a) => a.isInput && a.fieldId === 'id'))
  assert.ok(items.some((a) => a.isInput && a.fieldId === 'name'))
  // la barra de pestañas, entera y con la primera activa
  const tabs = items.find((a) => a.isTabs)
  assert.ok(tabs, 'no se proyectó la barra de pestañas')
  assert.deepEqual(tabs.tabs.map((t) => t.label),
    ['Diagram', 'Steps', 'Messages', 'Errors', 'Resources', 'Variables'])
  assert.equal(tabs.selectedId, 'tab-0')
  // …y el contenido de la ACTIVA: el grafo, con sus atributos ya interpolados del estado
  const element = items.find((a) => a.isElement)
  assert.ok(element, 'el componente del grafo no se proyectó')
  assert.equal(element.name, 'eventconductor-workflow-graph')
  assert.equal(element.importUrl, '/eventconductor/workflow-graph.js')
  assert.ok(element.attributes.value && element.attributes.value.indexOf('${') < 0,
    'el value del grafo llegó sin interpolar')
  assert.ok(!items.some((a) => a.isGrid), 'la pestaña Diagram no tiene tablas')

  // otra pestaña: su grid embebido, con columnas y filas del estado
  const steps = (hostContentOf(host, null, { title: titulo, activeTab: 'tab-1' }) || [])
    .flatMap((b) => b.items).find((a) => a.isGrid)
  assert.ok(steps, 'no se proyectó la tabla de la pestaña Steps')
  assert.deepEqual(steps.columns.map((c) => c.headerText), ['Name', 'Status'])
  assert.ok(steps.rows.length > 0)
  // la columna de estado llega con su clase de badge precomputada (CSP)
  assert.match(steps.rows[0].status.badgeClass, /oj-badge/)
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

// 25 bis) Los chips de un EntityHeader llevan el tono de su color, también el chip normal: en
// Vaadin es el primario, y aquí caía al neutro — un tier Platinum y uno Silver se veían iguales.
test('EntityHeader: el chip normal/info es un badge info, no el neutro', () => {
  const island = JSON.parse(JSON.stringify(fx('fo-island-wizard')))
  const find = (n) => n && typeof n === 'object'
    ? ((n.metadata && n.metadata.type === 'EntityHeader') || n.type === 'EntityHeader' ? n
      : Object.values(n).map(find).find(Boolean))
    : null
  const node = find(island)
  assert.ok(node, 'el fixture trae un EntityHeader')
  node.metadata.badges = [
    { label: 'Platinum', color: 'normal' },
    { label: 'Gold', color: 'warning' },
    { label: 'Silver', color: 'contrast' },
  ]
  const header = islandContentOf(island).flatMap((b) => b.items).find((a) => a.isEntityHeader)
  assert.deepEqual(header.badges.map((b) => b.badgeClass), [
    'oj-badge oj-badge-info oj-badge-subtle',
    'oj-badge oj-badge-warning oj-badge-subtle',
    'oj-badge oj-badge-neutral oj-badge-subtle',
  ])
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

const remoteApp = (menu, route = '', serverSideType = 'Home') => ({
  fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', menu, route, serverSideType } } }],
})

atest('opción de menú → crud: el App de mediador (ClientSide/App) se sigue y proyecta el listado', async () => {
  // El bug: al abrir CUALQUIER opción de menú se veía la misma pantalla sin search form ni listado.
  // La 1ª carga de la ruta llega como App de mediador con forma ClientSide/App (la misma del
  // bootstrap, pero pedida para una SUB-ruta), que reduceContexts absorbe como shell; mediatorOf
  // no la ve y la 2ª carga —el contenido del crud— no se disparaba. Ahora se saca del incremento.
  const original = globalThis.fetch
  const shellApp = {
    fragments: [{ targetComponentId: '', component: { type: 'ClientSide', metadata: {
      type: 'App', route: '/app', rootRoute: '/app', homeConsumedRoute: '/app',
      homeServerSideType: 'io.example.MenuApp', serverSideType: 'io.example.MenuApp',
      menu: [{ route: '/app/products' }],
    } } }],
  }
  const crudContent = {
    fragments: [{ targetComponentId: '', component: { type: 'ServerSide', children: [
      { metadata: { type: 'Crud', title: 'Products', searchable: true,
        columns: [{ metadata: { id: 'name', label: 'Name' } }] } },
    ] } }],
  }
  let secondCallSaw = null
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body)
    // El 2º salto es el que lleva consumedRoute + serverSideType del App de mediador.
    if (body.serverSideType) { secondCallSaw = body; return { ok: true, json: async () => crudContent } }
    return { ok: true, json: async () => shellApp }
  }
  try {
    const reg = await loadRouteInto('http://x', empty(), '/app/products', '', {})
    assert.ok(secondCallSaw, 'la 2ª carga (contenido) debe dispararse')
    assert.equal(secondCallSaw.consumedRoute, '/app')
    assert.equal(secondCallSaw.serverSideType, 'io.example.MenuApp')
    const listing = listingOf(reg.contexts[HOST_ID])
    assert.ok(listing, 'la opción de menú debe proyectar el listado (no la shell vacía)')
    assert.equal(listing.columns.length, 1)
    assert.equal(listing.title, 'Products')
  } finally { globalThis.fetch = original }
})

atest('bootstrap del App (route === rootRoute) NO dispara un 2º salto: es la shell, no contenido', async () => {
  // El guardarraíl del fix: sólo una navegación POR DEBAJO de la raíz busca contenido. La raíz del
  // app es la shell/home y la resuelve el bootstrap — seguirla aquí sería una carga de más.
  const original = globalThis.fetch
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls++
    const body = JSON.parse(init.body)
    assert.ok(!body.serverSideType, 'no debe haber 2º salto para la raíz del app')
    return { ok: true, json: async () => ({ fragments: [{ targetComponentId: '', component: { type: 'ClientSide',
      metadata: { type: 'App', route: '/app', rootRoute: '/app', serverSideType: 'io.example.MenuApp', menu: [] } } }] }) }
  }
  try {
    await loadRouteInto('http://x', empty(), '/app', '', {})
    assert.equal(calls, 1, 'una sola carga para la raíz del app')
  } finally { globalThis.fetch = original }
})

atest('expandRemoteMenus pide su menú a cada pod y lo pone donde estaba la opción', async () => {
  // Lo que este renderer no hacía: pintaba el rótulo que la shell escribió y nada debajo.
  const original = globalThis.fetch
  const asked = []
  globalThis.fetch = async (url) => {
    asked.push(url)
    return { ok: true, json: async () => remoteApp([{ label: 'Processes', route: '/workflow/processes' }], '/workflow') }
  }
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_workflow', route: '/workflow', label: 'Workflow' },
      { label: 'Contenidos', route: '/content' },
    ])
    assert.equal(asked.length, 1)
    assert.ok(asked[0].startsWith('/_workflow/mateu/v3/sync/'), asked[0])
    assert.deepEqual(menu.map((o) => o.label), ['Processes', 'Contenidos'])
  } finally { globalThis.fetch = original }
})

atest('expandRemoteMenus registra a qué pod va cada entrada adoptada', async () => {
  // La mitad que hace que el menú sirva de algo: sin esto la navegación llamaría al base de
  // la shell, que no conoce esa ruta.
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => remoteApp([{ label: 'Processes', route: '/workflow/processes' }], '/workflow', 'WorkflowHome'),
  })
  try {
    await expandRemoteMenus([{ remote: true, baseUrl: '/_workflow', route: '/workflow', label: 'Workflow' }])
    const where = remoteRouteOf('/workflow/processes')
    assert.ok(where, 'la ruta adoptada no quedó registrada')
    assert.equal(where.baseUrl, '/_workflow')
    assert.equal(where.consumedRoute, '/workflow')
    assert.equal(where.serverSideType, 'WorkflowHome')
    // También por la forma sin barra inicial, que es como la ve el nav
    assert.ok(remoteRouteOf('workflow/processes'))
  } finally { globalThis.fetch = original }
})

atest('expandRemoteMenus baja a una opción remota ANIDADA en un grupo', async () => {
  const original = globalThis.fetch
  const asked = []
  globalThis.fetch = async (url) => {
    asked.push(url)
    return { ok: true, json: async () => remoteApp([{ label: 'Processes', route: '/workflow/processes' }], '/workflow') }
  }
  try {
    const menu = await expandRemoteMenus([
      { label: 'Admin', submenus: [{ remote: true, baseUrl: '/_workflow', route: '/workflow', label: 'Workflow' }] },
    ])
    assert.equal(asked.length, 1, 'una remota dentro de un grupo también se pregunta')
    assert.deepEqual(menu[0].submenus.map((o) => o.label), ['Processes'])
  } finally { globalThis.fetch = original }
})

atest('un pod que no contesta deja su rótulo y no tumba a los demás', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).indexOf('/_forms') === 0) throw new TypeError('Failed to fetch')
    return { ok: true, json: async () => remoteApp([{ label: 'Processes', route: '/workflow/processes' }], '/workflow') }
  }
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_workflow', route: '/workflow', label: 'Workflow' },
      { remote: true, baseUrl: '/_forms', route: '/forms', label: 'Forms' },
    ])
    assert.deepEqual(menu.map((o) => o.label), ['Processes', 'Forms'])
  } finally { globalThis.fetch = original }
})

atest('una remota OCULTA no sale en el menú pero sus rutas quedan registradas (deep-link)', async () => {
  // `@Menu @Hidden RemoteMenu inbox`: se llega a ella desde un widget de la cabecera. Sin entrada
  // en el menú, pero una recarga de /inbox/pending tiene que seguir yendo a su pod.
  const original = globalThis.fetch
  const asked = []
  globalThis.fetch = async (url) => {
    asked.push(url)
    return String(url).indexOf('/_inbox') === 0
      ? { ok: true, json: async () => remoteApp([{ label: 'Pending', route: '/inbox/pending' }], '/inbox', 'InboxHome') }
      : { ok: true, json: async () => remoteApp([{ label: 'Bookings', route: '/booking/bookings' }], '/booking') }
  }
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_booking', route: '/booking', label: 'Booking' },
      { remote: true, baseUrl: '/_inbox', route: '/inbox', label: 'Inbox', visible: false },
    ])
    assert.equal(asked.length, 2, 'la oculta también se pregunta: sus rutas hay que conocerlas')
    assert.deepEqual(menu.map((o) => o.label), ['Bookings'])
    const where = remoteRouteOf('/inbox/pending/n-7')
    assert.ok(where, 'el deep-link bajo la remota oculta no quedó registrado')
    assert.equal(where.baseUrl, '/_inbox')
  } finally { globalThis.fetch = original }
})

atest('una remota oculta que no contesta tampoco deja su rótulo', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_inbox', route: '/inbox', label: 'Inbox', visible: false },
      { label: 'Local', route: '/local' },
    ])
    assert.deepEqual(menu.map((o) => o.label), ['Local'])
  } finally { globalThis.fetch = original }
})

test('routeFlipOf: un fragmento solo-estado con _route nuevo pide recargar la ruta interna', () => {
  // Lo que contesta un crud de PÁGINA al clic de fila: ni componente ni navegación, un
  // `_route` nuevo. Quien no lo sigue se queda en el listado sin un solo error a la vista.
  const stateOnly = { fragments: [{ targetComponentId: '', component: null, state: { _route: '/2CSXZN' } }] }
  const ctx = { state: { _route: '/2CSXZN' }, outbound: { route: '/booking/bookings' } }
  assert.equal(routeFlipOf({ _route: 'list' }, ctx, stateOnly), '/booking/bookings/2CSXZN')
  // sin cambio de _route no hay flip…
  assert.equal(routeFlipOf({ _route: '/2CSXZN' }, ctx, stateOnly), null)
  // …ni cuando la respuesta TRAE componente (eso ya repinta por sí solo)
  const withComponent = { fragments: [{ component: { type: 'ServerSide' }, state: { _route: '/2CSXZN' } }] }
  assert.equal(routeFlipOf({ _route: 'list' }, ctx, withComponent), null)
  // los marcadores de query del mediador embebido siguen viajando
  const embedded = { state: { _route: '/edit' }, outbound: { route: '/pax?_embeddedMediator=1' } }
  assert.equal(routeFlipOf({}, embedded, { fragments: [{ component: null }] }),
    '/pax/edit?_embeddedMediator=1')
})

atest('un pod que contesta con un GRUPO: la hoja adoptada conserva su ruta compuesta', async () => {
  // La forma REAL de un menú federado (ec-demo1): la shell declara la sección `Booking` como
  // remota, y el pod NO contesta con hojas sueltas sino con SU grupo — `Booking` con
  // `/booking/bookings` debajo. El nav recorta el prefijo del padre a los hijos porque una ruta
  // compuesta de menú LOCAL no resuelve por sync; aplicado a una hoja de otro pod, ese recorte
  // la dejaba en `/bookings`, que no la sirve nadie: ni casa con el registro de rutas remotas
  // ni existe en la shell. El resultado era un crud que contestaba "Not found." al abrirlo.
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => remoteApp(
      [{ label: 'Booking', route: '/booking', submenus: [{ label: 'Bookings', route: '/booking/bookings' }] }],
      '',
      'BookingHome',
    ),
  })
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_booking', route: '', path: '/booking', label: 'Booking' },
    ])
    const nav = shellNavOf({ shell: { menu, variant: 'MENU_ON_TOP' } })
    const group = nav.menuTree.find((m) => m.hasChildren)
    assert.deepEqual(group.children.map((c) => c.id), ['/booking/bookings'])
    // …y por esa ruta el registro sabe a qué pod ir, con qué consumedRoute y qué serverSideType
    const where = remoteRouteOf('/booking/bookings')
    assert.equal(where.baseUrl, '/_booking')
    assert.equal(where.consumedRoute, '')
    assert.equal(where.serverSideType, 'BookingHome')
  } finally { globalThis.fetch = original }
})

atest('una shell federada de TRES niveles conserva el nivel de abajo', async () => {
  // La shell agrupa `Admin` y mete DENTRO tres pods; cada pod contesta con SU grupo y sus
  // pantallas debajo. El árbol resultante tiene tres niveles, y el proyector solo modelaba dos:
  // el grupo del pod quedaba como si fuese pantalla —clic → ruta de grupo → contenido vacío— y
  // sus pantallas no aparecían en ninguna parte.
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => remoteApp(
      [{ label: 'Workflow', route: '/workflow', submenus: [
        { label: 'Processes', route: '/workflow/processes' },
        { label: 'Steps', route: '/workflow/steps' },
      ] }],
      '',
      'WorkflowHome',
    ),
  })
  try {
    const menu = await expandRemoteMenus([
      { label: 'Admin', route: '/admin', submenus: [
        { remote: true, baseUrl: '/_workflow', route: '', path: '/workflow', label: 'Workflow' },
      ] },
    ])
    const nav = shellNavOf({ shell: { menu, variant: 'MENU_ON_TOP' } })
    const admin = nav.menuTree[0]
    assert.equal(admin.children.length, 1)
    const workflow = admin.children[0]
    assert.equal(workflow.label, 'Workflow')
    assert.equal(workflow.hasChildren, true, 'el grupo del pod se quedaba sin hijos')
    assert.deepEqual(workflow.children.map((c) => c.id), ['/workflow/processes', '/workflow/steps'])
    assert.equal(remoteRouteOf('/workflow/steps').baseUrl, '/_workflow')
  } finally { globalThis.fetch = original }
})

atest('deep-link a una sub-ruta: el mediador consume SU ruta, no la entera', async () => {
  // Entrando por el enlace del detalle de un proceso salía el LISTADO: el mediador contesta con
  // rootRoute = la ruta que se pidió (la entera) y homeConsumedRoute = la suya
  // (/workflow/processes). Mandando la entera como consumedRoute el servidor sirve la vista por
  // defecto del crud.
  const original = globalThis.fetch
  const consumed = []
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    consumed.push(body.consumedRoute)
    if (consumed.length === 1) {
      return { ok: true, json: async () => ({ fragments: [{ targetComponentId: '', component: {
        type: 'ServerSide', id: '_app', children: [{ type: 'ClientSide', metadata: {
          type: 'App', variant: 'MEDIATOR',
          rootRoute: '/workflow/processes/abc',
          homeRoute: '/workflow/processes/abc',
          homeConsumedRoute: '/workflow/processes',
          homeServerSideType: 'Processes',
        } }],
      } }] }) }
    }
    return { ok: true, json: async () => ({ fragments: [{ targetComponentId: '', component: {
      type: 'ServerSide', id: '_view', children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'Proceso abc' } }],
    } }] }) }
  }
  try {
    const reg = await loadRouteInto('/_workflow', empty(), '/workflow/processes/abc', '', {})
    assert.deepEqual(consumed, ['', '/workflow/processes'])
    assert.equal(reg.contexts[HOST_ID].outbound.consumedRoute, '/workflow/processes')
  } finally { globalThis.fetch = original }
})

atest('remoteRouteOf casa por prefijo: el detalle vive en el pod de su listado', async () => {
  // Al registro solo llegan las rutas del MENÚ. Un deep-link al detalle de un proceso
  // (/workflow/processes/<id>) no casaba con nada y salía al backend de la shell → "Not found.".
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => remoteApp([{ label: 'Processes', route: '/workflow/processes' }], '', 'WorkflowHome'),
  })
  try {
    await expandRemoteMenus([{ remote: true, baseUrl: '/_workflow', route: '', path: '/workflow', label: 'Workflow' }])
    const detalle = remoteRouteOf('/workflow/processes/4df04a98')
    assert.ok(detalle, 'el detalle no encontró su pod')
    assert.equal(detalle.baseUrl, '/_workflow')
    assert.equal(remoteRouteOf('/workflow/processes/4df04a98/edit').baseUrl, '/_workflow')
    // lo que no cuelga de una ruta registrada NO se adopta (un prefijo no es un "empieza por")
    assert.equal(remoteRouteOf('/workflow/processesXX'), undefined)
    assert.equal(remoteRouteOf('/otra/cosa'), undefined)
  } finally { globalThis.fetch = original }
})

atest('una hoja LOCAL bajo un grupo se sigue navegando por su ruta terminal', async () => {
  // El contrapunto del test anterior: sin baseUrl no hay pod, y la ruta compuesta del menú
  // (/gestion/person) no resuelve por sync — se navega por /person, como hasta ahora.
  const nav = shellNavOf({ shell: { menu: [
    { label: 'Gestion', route: '/gestion', submenus: [{ label: 'Person', route: '/gestion/person' }] },
  ] } })
  assert.deepEqual(nav.menuTree[0].children.map((c) => c.id), ['/person'])
})

atest('el contexto recuerda de qué pod se cargó, y sus acciones vuelven allí', async () => {
  // La segunda mitad del mismo fallo: con la ruta ya bien resuelta, el crud pintaba columnas y
  // toolbar pero SIN filas — el trigger `search` que el listado pide al cargar salía al base de
  // la shell, que contesta 200 con cero fragments. Un listado vacío y ni un error a la vista.
  const original = globalThis.fetch
  const asked = []
  globalThis.fetch = async (url) => {
    asked.push(String(url))
    return { ok: true, json: async () => ({ fragments: [{ targetComponentId: '', component: {
      type: 'ServerSide', id: '_list', children: [{ metadata: { type: 'Crud', title: 'Bookings' } }],
    } }] }) }
  }
  try {
    const reg = await loadRouteInto('/_booking', empty(), '/booking/bookings', '', {})
    assert.equal(baseOf(reg), '/_booking')
    asked.length = 0
    await runMateuAction('/la-shell', reg.contexts[HOST_ID], '/booking/bookings', 'search', {})
    assert.ok(asked[0].startsWith('/_booking/mateu/v3/sync/'), asked[0])
  } finally { globalThis.fetch = original }
})

atest('fetchWithPolicy adjunta el token que dejó el bootstrap', async () => {
  // La regresión que esto fija: el bootstrap autenticaba y guardaba el token, y NADA lo leía.
  // Cada llamada salía sin cabecera, el gateway devolvía 401, y el clasificador lo traducía a
  // "tu sesión ya no es válida" — con la sesión perfectamente viva. La consola cargaba sin un
  // solo menú.
  connectivity.reset()
  let seen = null
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? 'un-token' : null) }
  globalThis.fetch = async (url, init) => { seen = init; return { ok: true, json: async () => ({}) } }
  try {
    await fetchWithPolicy('http://x/', { headers: { 'Content-Type': 'application/json' } },
                          { actionId: 'search' })
    assert.equal(seen.headers.Authorization, 'Bearer un-token')
    // Y sin pisar lo que el llamante ya traía.
    assert.equal(seen.headers['Content-Type'], 'application/json')
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    connectivity.reset()
  }
})

atest('fetchWithPolicy ante un 401 pide reautenticar y reenvía UNA vez con el token nuevo', async () => {
  // El token caduca entre dos refrescos (pestaña dormida): la petición vuelve 401. En vez de
  // enseñar "tu sesión ya no es válida", se lanza mateu-session-expired; el bootstrap refresca,
  // deja el token nuevo y llama a retry, y la petición sale otra vez — con ESE token.
  connectivity.reset()
  const sent = []
  let token = 'caducado'
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? token : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault()
    token = 'nuevo'
    e.detail.retry()
  })
  globalThis.fetch = async (url, init) => {
    sent.push(init.headers.Authorization)
    return init.headers.Authorization === 'Bearer nuevo'
      ? { ok: true, json: async () => ({}) }
      : { ok: false, status: 401, text: async () => '' }
  }
  try {
    await fetchWithPolicy('https://x/', {}, { actionId: 'save' })
    assert.deepEqual(sent, ['Bearer caducado', 'Bearer nuevo'])
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy ante un 401 sin nadie que reautentique falla como siempre, y no reintenta en bucle', async () => {
  connectivity.reset()
  let calls = 0
  const originalFetch = globalThis.fetch
  const originalDocument = globalThis.document
  globalThis.document = new EventTarget()
  globalThis.fetch = async () => { calls++; return { ok: false, status: 401, text: async () => '' } }
  try {
    await assert.rejects(() => fetchWithPolicy('https://x/', {}, { actionId: 'search' }),
      (e) => e.failure && e.failure.kind === 'unauthorized')
    assert.equal(calls, 1)
    // Con alguien que reautentica pero el 401 persiste: un reintento, no más.
    calls = 0
    globalThis.document.addEventListener('mateu-session-expired', (e) => { e.preventDefault(); e.detail.retry() })
    await assert.rejects(() => fetchWithPolicy('https://x/', {}, { actionId: 'search' }),
      (e) => e.failure && e.failure.kind === 'unauthorized')
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy llama sin cabecera cuando no hay token, en vez de no llamar', async () => {
  // Sin token se sigue adelante: que conteste el backend. Un 401 explicado es mejor que una
  // pantalla en blanco que no ha preguntado a nadie.
  connectivity.reset()
  let seen = null
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  globalThis.localStorage = { getItem: () => null }
  globalThis.fetch = async (url, init) => { seen = init; return { ok: true, json: async () => ({}) } }
  try {
    await fetchWithPolicy('http://x/', {}, { actionId: 'search' })
    assert.ok(!seen.headers || !seen.headers.Authorization)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
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

// ── registro de rutas embarcado (el routes.yaml del mount, dentro del manifest) ───────────────
// La precedencia tiene que ser IDÉNTICA a la del servidor y a la de libs/mateu; si no, la misma
// ruta se comportaría distinto según el renderer o según haya backend:
//   fixed > path > lo que ya trae el increment > defaults
const inc1 = (state) => ({ fragments: [{ state, data: {} }] })
const st = (inc) => (inc && inc.fragments && inc.fragments[0].state) || {}

test('registro: un increment cuya ruta no está en el registro se devuelve INTACTO', () => {
  __setBundleForTests(undefined, [], [{ route: 'orders' }])
  const inc = inc1({ a: 1 })
  assert.equal(applyRouteParams('customers', inc), inc, 'misma referencia: sin copia ni cambio')
  __setBundleForTests(undefined)
})

test('registro: un parámetro fijado pisa lo que ya trae el increment', () => {
  __setBundleForTests(undefined, [], [{ route: 'tickets/open', fixedParams: { status: 'open' } }])
  assert.equal(st(applyRouteParams('tickets/open', inc1({ status: 'all' }))).status, 'open')
  __setBundleForTests(undefined)
})

test('registro: un default cede ante lo que el increment ya trae, y rellena lo que falta', () => {
  __setBundleForTests(undefined, [], [
    { route: 'tickets', defaultParams: { status: 'open', page: 1 } },
  ])
  const state = st(applyRouteParams('tickets', inc1({ status: 'closed' })))
  assert.equal(state.status, 'closed')
  assert.equal(state.page, 1)
  __setBundleForTests(undefined)
})

test('registro: un fijado gana también al parámetro del path con su mismo nombre', () => {
  __setBundleForTests(undefined, [], [
    { route: 'tickets/:status', fixedParams: { status: 'open' } },
  ])
  assert.equal(st(applyRouteParams('tickets/all', inc1({}))).status, 'open')
  __setBundleForTests(undefined)
})

test('registro: una ruta parametrizada NO se traga a su hermana estática', () => {
  // orders/:id se declara ANTES a propósito: el matching no puede depender del orden.
  __setBundleForTests(undefined, [], [
    { route: 'orders/:id', viewModel: 'Detail' },
    { route: 'orders/new', viewModel: 'New' },
  ])
  assert.equal(getRouteEntry('orders/new').viewModel, 'New')
  assert.equal(getRouteEntry('orders/42').viewModel, 'Detail')
  __setBundleForTests(undefined)
})

test('registro: la raíz del mount es la entrada con ruta vacía', () => {
  __setBundleForTests(undefined, [], [{ route: '', viewModel: 'Home' }])
  assert.equal(getRouteEntry('_no_route').viewModel, 'Home')
  __setBundleForTests(undefined)
})

test('registro: se aplica al responder una ruta bundleada', () => {
  __setBundleForTests(
    new Map([['tickets/open', inc1({ status: 'all' })]]), [],
    [{ route: 'tickets/open', fixedParams: { status: 'open' } }])
  assert.equal(st(getBundledIncrement('tickets/open')).status, 'open')
  __setBundleForTests(undefined)
})

test('registro: se aplica ENCIMA de la plantilla, así el fijado sigue ganando al path', () => {
  __setBundleForTests(undefined,
    [{ regex: /^tickets\/([^/]+)$/, paramNames: ['status'], increment: inc1({}) }],
    [{ route: 'tickets/:status', fixedParams: { status: 'open' } }])
  assert.equal(st(bundledIncrementFor('/tickets/all', '')).status, 'open')
  __setBundleForTests(undefined)
})

test('registro: expone la entrada para llegar a su definición', () => {
  __setBundleForTests(undefined, [], [{ route: 'about', definition: 'about.yaml' }])
  assert.equal(getRouteEntry('about').definition, 'about.yaml')
  assert.equal(getRouteEntry('about').viewModel, undefined)
  __setBundleForTests(undefined)
})

atest('registro: loadBundleManifest lee manifest.routes.routes', async () => {
  const manifest = {
    entries: [{ syncPath: 'tickets/open', ok: true, json: JSON.stringify(inc1({ status: 'all' })) }],
    routes: { routes: [{ route: 'tickets/open', fixedParams: { status: 'open' } }] },
  }
  await loadBundleManifest('/manifest.json', async () => ({ ok: true, json: async () => manifest }))
  assert.equal(st(getBundledIncrement('tickets/open')).status, 'open')
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
    const inc = await loadRoute('https://x', '/home', 'shell')
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
    const inc = await bootstrapShell('https://x', 'shell')
    assert.ok(inc && inc.fragments, 'la shell debe arrancar desde el bundle sin backend')
    assert.equal(inc.fragments[0].targetComponentId, 'shell')
  } finally {
    globalThis.fetch = original
    connectivity.reset()
    __setBundleForTests(undefined)
  }
})

// ── Filtros del listado ────────────────────────────────────────────────────────
// Un listado declara sus filtros en el wire y el buscador tiene que ofrecerlos TODOS: antes
// sólo salían los de opciones —y sólo el primero—, así que un booleano, un lookup y dos
// fechas no existían para el usuario aunque el server los mandara. El kind se precomputa
// aquí porque las plantillas de VB corren bajo CSP; el orden de resolución es el mismo de la
// barra compartida (rango → multi → opciones → booleano → texto).

const PROCESS_FILTERS = [
  { fieldId: 'onlyErrors', label: 'Only errors', stereotype: 'regular', dataType: 'bool' },
  { fieldId: 'workflowDefinitionId', label: 'Definition', stereotype: 'combobox', dataType: 'string' },
  { fieldId: 'status', label: 'Status', stereotype: 'multiSelect', dataType: 'string',
    options: [{ value: 'ERROR', label: 'Error' }, { value: 'RUNNING', label: 'Running' }] },
  { fieldId: 'createdFrom', label: 'Created from', stereotype: 'dateRange', dataType: 'dateTime' },
]

test('filtros: cada declaración resuelve al widget que le toca', () => {
  const [bool, lookup, multi, range] = PROCESS_FILTERS.map((f) => filterDescriptorOf(f))
  assert.equal(bool.kind, 'bool')
  assert.equal(lookup.kind, 'text', 'un combobox sin opciones se teclea, como en la barra compartida')
  assert.equal(multi.kind, 'multi')
  assert.equal(range.kind, 'range')
  assert.equal(range.inputType, 'datetime-local', 'una fecha-hora se teclea fatal como texto')
  assert.deepEqual(range.fromKey, 'createdFrom_from')
})

test('filtros: dataType boolean (.NET) cuenta como booleano igual que bool (Java)', () => {
  assert.equal(filterDescriptorOf({ fieldId: 'x', dataType: 'boolean' }).kind, 'bool')
})

test('filtros: un select con opciones manda sobre el tipo del dato', () => {
  const d = filterDescriptorOf({ fieldId: 'v', stereotype: 'select', dataType: 'string',
    options: [{ value: 'a', label: 'A' }] })
  assert.equal(d.kind, 'options')
  assert.equal(d.options[0].label, 'A')
})

test('chips: uno por FILTRO, no uno por valor posible', () => {
  const chips = filterChipsOf(PROCESS_FILTERS.map((f) => filterDescriptorOf(f)), {})
  assert.equal(chips.length, 4, 'cuatro filtros, cuatro chips')
  assert.deepEqual(chips.map((c) => c.applied), [false, false, false, false])
  assert.equal(chips[2].label, 'Status')
})

test('chips: un filtro aplicado enseña su valor con la etiqueta de la opción', () => {
  const filters = PROCESS_FILTERS.map((f) => filterDescriptorOf(f))
  const chips = filterChipsOf(filters, { status: ['ERROR', 'RUNNING'], onlyErrors: true })
  const status = chips.filter((c) => c.fieldId === 'status')[0]
  assert.equal(status.applied, true)
  assert.equal(status.text, 'Error, Running')
  assert.equal(chips.filter((c) => c.fieldId === 'onlyErrors')[0].text, 'Yes')
})

test('chips: un rango se quita ENTERO — sus dos claves', () => {
  const filters = PROCESS_FILTERS.map((f) => filterDescriptorOf(f))
  const chips = filterChipsOf(filters, { createdFrom_from: '2026-01-01T00:00' })
  const range = chips.filter((c) => c.fieldId === 'createdFrom')[0]
  assert.equal(range.applied, true)
  assert.equal(range.text, '≥ 2026-01-01T00:00')
  assert.deepEqual(range.keys, ['createdFrom_from', 'createdFrom_to'],
    'quitar medio rango deja el listado filtrado por algo que ya no se ve')
})

test('chips: un valor en blanco no cuenta como filtro aplicado', () => {
  const filters = PROCESS_FILTERS.map((f) => filterDescriptorOf(f))
  const chips = filterChipsOf(filters, { workflowDefinitionId: '   ', status: [] })
  assert.deepEqual(chips.map((c) => c.applied), [false, false, false, false])
})

test('multi: los valores llegan como lista o como cadena separada por comas', () => {
  assert.deepEqual(multiValuesOf(['A', 'B']), ['A', 'B'])
  assert.deepEqual(multiValuesOf('A, B'), ['A', 'B'], 'así vuelven tras restaurar desde la URL')
  assert.deepEqual(multiValuesOf(''), [])
  assert.deepEqual(multiValuesOf(null), [])
})

// ── Filtros DENTRO de la cabecera del buscador (smartFilters de oj-sp-smart-filter-search) ──
// Los filtros ya no son una fila propia bajo el componente —quedaba al otro lado de la franja
// de color de Redwood—: viajan por su API. Sugerencias = filtros sin aplicar; value = los
// aplicados (y el texto libre como keyword); filtersMetadata = el editor de cada uno.

const BOOKING_FILTERS = [
  { fieldId: 'hotel', label: 'Hotel', stereotype: 'select', dataType: 'string', options: [] },
  { fieldId: 'status', label: 'Status', stereotype: 'multiSelect', dataType: 'string',
    options: [{ value: 'Pending', label: 'Pending' }, { value: 'Confirmed', label: 'Confirmed' }] },
  { fieldId: 'arrival', label: 'Arrival', stereotype: 'dateRange', dataType: 'date' },
  { fieldId: 'vista', label: 'Vista', stereotype: 'select', dataType: 'string',
    options: [{ value: 'LLEGADAS_HOY', label: 'Llegadas hoy' }, { value: 'IN_HOUSE', label: 'In house' }] },
  { fieldId: 'vip', label: 'VIP', dataType: 'bool' },
  { fieldId: 'nights', label: 'Nights', stereotype: 'numberRange', dataType: 'integer' },
].map((f) => filterDescriptorOf(f))

test('smart filters: el editor de cada kind es el widget de oj-dynamic que toca', () => {
  const meta = smartFiltersMetadataOf(BOOKING_FILTERS)
  assert.equal(meta.discriminator, 'filter', 'el componente busca el editor por el fieldId del chip')
  const valueOf = (id) => meta.polymorphicTypes[id].properties.value
  assert.equal(valueOf('hotel').componentType, 'oj-input-text', 'un select sin opciones se teclea')
  assert.equal(valueOf('status').componentType, 'oj-checkboxset')
  assert.equal(valueOf('status').type, 'array')
  assert.deepEqual(valueOf('status').options.map((o) => o.value), ['Pending', 'Confirmed'])
  assert.equal(valueOf('vista').componentType, 'oj-select-single')
  assert.deepEqual(valueOf('vip').options.map((o) => o.value), ['true', 'false'])
  // gte/lte con esa forma exacta: el componente reconoce el rango y lo pinta "desde - hasta"
  const arrival = valueOf('arrival')
  assert.equal(arrival.type, 'object')
  assert.equal(arrival.properties.gte.componentType, 'oj-input-date')
  assert.equal(arrival.properties.lte.type, 'string')
  assert.equal(valueOf('nights').properties.gte.componentType, 'oj-input-number')
  assert.equal(valueOf('nights').properties.gte.type, 'number')
})

test('smart filters: una sugerencia por filtro declarado, y el rango lleva sus dos claves', () => {
  const sugg = smartFilterSuggestionsOf(BOOKING_FILTERS)
  assert.deepEqual(sugg.map((s) => s.filter), ['hotel', 'status', 'arrival', 'vista', 'vip', 'nights'])
  const by = (id) => sugg.filter((s) => s.filter === id)[0]
  assert.equal(by('vista').filterLabel, 'Vista', 'con filterLabel el chip se lee "Vista Llegadas hoy"')
  assert.equal(by('hotel').filterLabel, undefined, 'un texto con filterLabel escondería lo tecleado')
  assert.deepEqual(by('arrival').value, { gte: null, lte: null },
    'sin claves en el valor, el popup de un rango sale vacío')
})

test('smart filters: el estado de Mateu se pinta como chips aplicados, keyword incluido', () => {
  const value = smartFilterValueOf(BOOKING_FILTERS, {
    vista: 'LLEGADAS_HOY', status: 'Pending,Confirmed', arrival_from: '2026-09-01', vip: true, hotel: '  ',
  }, 'garcía')
  assert.deepEqual(value[0], { filter: KEYWORD_FILTER, label: 'garcía', value: 'garcía' })
  const by = (id) => value.filter((c) => c.filter === id)[0]
  assert.deepEqual(by('status'), { filter: 'status', label: 'Pending', filterLabel: 'Status', value: ['Pending', 'Confirmed'] })
  assert.deepEqual(by('arrival').value, { gte: '2026-09-01', lte: null })
  assert.equal(by('vista').label, 'Llegadas hoy')
  assert.equal(by('vip').value, 'true')
  assert.equal(by('hotel'), undefined, 'en blanco no es un filtro aplicado')
})

test('smart filters: los chips del componente vuelven a texto + valores del componentState', () => {
  const state = filterStateOfSmartFilters(BOOKING_FILTERS, [
    { filter: 'keyword', label: 'sale', value: 'sale' },
    { filter: 'keyword', label: 'hoy', value: 'hoy' },
    { filter: 'arrival', label: 'Arrival', value: { gte: '2026-09-01', lte: '2026-09-30' } },
    { filter: 'status', label: 'Pending', filterLabel: 'Status', value: ['Pending'] },
    { filter: 'vista', label: 'Vista', filterLabel: 'Vista' }, // recién sugerido: aún sin valor
    { filter: 'desconocido', label: 'x', value: 'y' },
  ])
  assert.equal(state.searchText, 'sale hoy')
  assert.deepEqual(state.values, { arrival_from: '2026-09-01', arrival_to: '2026-09-30', status: ['Pending'] })
})

test('smart filters: ida y vuelta sin perder nada', () => {
  const values = { vista: 'IN_HOUSE', status: ['Confirmed'], nights_to: 3, hotel: 'Riu' }
  const back = filterStateOfSmartFilters(BOOKING_FILTERS, smartFilterValueOf(BOOKING_FILTERS, values, 'x'))
  assert.deepEqual(back, { searchText: 'x', values })
})

atest('smart filters: las sugerencias excluyen los filtros aplicados y filtran por texto', async () => {
  const rows = smartFilterSuggestionsOf(BOOKING_FILTERS)
  const dp = suggestionFiltersProviderOf(rows)
  const criterion = { op: '$and', criteria: [{ op: '$ne', value: { filters: [{ filter: 'vista' }] } }, { text: '' }] }
  const it = dp.fetchFirst({ filterCriterion: criterion })[Symbol.asyncIterator]()
  const first = await it.next()
  assert.equal(first.done, true, 'un único bloque: dataProviderToArray de oj-sp itera hasta done')
  assert.equal(first.value.data.some((r) => r.filter === 'vista'), false)
  assert.equal(first.value.data.length, rows.length - 1)
  assert.deepEqual(suggestionRowsFor(rows, { text: 'arr' }).map((r) => r.filter), ['arrival'])
  const byKeys = await dp.fetchByKeys({ keys: new Set(['status']) })
  assert.equal(byKeys.results.get('status').data.label, 'Status')
})

atest('smart filters: la config completa lleva sugerencias y metadata; sin filtros, sólo el buscador', async () => {
  setMetadataProviderFactory(async (data) => ({ provided: data }))
  try {
    const config = await smartFiltersOf(BOOKING_FILTERS, { vista: 'IN_HOUSE' }, '')
    assert.equal(config.value.length, 1)
    assert.equal(typeof config.suggestionFilters.fetchFirst, 'function')
    assert.equal(config.filtersMetadata.provided.discriminator, 'filter')
    const bare = await smartFiltersOf([], {}, 'hola')
    assert.deepEqual(Object.keys(bare).sort((a, b) => a.localeCompare(b)), ['askHint', 'value'])
  } finally {
    setMetadataProviderFactory(null)
  }
})

const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

test('smart filters: las plantillas pintan los filtros DENTRO de la cabecera, no en una fila tras ella', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  const headers = html.match(/<oj-sp-smart-filter-search[\s\S]*?<\/oj-sp-smart-filter-search>/g) || []
  assert.equal(headers.length, 2, 'la cabecera de colección a sangre y la inline')
  for (const h of headers) {
    assert.match(h, /smart-filters="\[\[ \$application\.variables\.mateuSmartFilters \]\]"/)
    assert.match(h, /on-smart-filters-changed="\[\[ \$listeners\.smartFiltersChanged \]\]"/)
  }
  // ningún chip de filtro propio fuera del componente (quedaba bajo la franja de color)
  const outside = headers.reduce((acc, h) => acc.replace(h, ''), html)
  assert.equal(/<oj-sp-filter-chip/.test(outside), false, 'no hay fila de filtros fuera del componente')
  assert.equal(/mateuFilterChips|mateuFilterEditing/.test(html), false)
  // la navegación proyecta la config; la búsqueda lanzada por el componente no la reasigna
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /mateuSmartFilters = await bridge\.smartFiltersOf\(/)
  assert.equal(/mateuSmartFilters\s*=/.test(webApp('flows/main/pages/main-start-page-chains/runMateuSearch.js')), false)
  // las sugerencias (sin aplicar) no enseñan la parte de valor: un rango vacío se leería "Llegada -"
  assert.match(webApp('resources/css/app.css'),
    /oj-sp-smart-filter-search \.oj-sp-filter-chip-non-applied \.oj-sp-filter-chip-non-applied-value-count-focusable \{\s*display: none;/)
})

test('menú TABS: la barra de pestañas sale en todas las páginas, la home incluida', () => {
  const shell = webApp('pages/shell-page.html')
  const nav = shell.match(/<oj-bind-if test="([^"]*)">\s*<oj-sp-in-app-navigation/)
  assert.ok(nav, 'la barra in-app navigation está en la shell')
  assert.equal(nav[1], '[[ $application.variables.mateuMenuTabs ]]', 'nada de ocultarla en la home')
})

test('cabecera oscura: los estados del menú superior son un velo blanco, sin el fondo claro ni el borde de marca', () => {
  const css = webApp('resources/css/app.css')
  const block = css.match(/oj-sp-global-header \[slot="start"\] oj-button,\s*oj-sp-global-header \[slot="start"\] oj-menu-button \{([^}]*)\}/)
  assert.ok(block, 'sólo los botones del NAV de la cabecera (zona start)')
  const vars = block[1]
  for (const v of ['--oj-core-bg-color-hover', '--oj-core-bg-color-active', '--oj-button-borderless-chrome-bg-color-selected']) {
    assert.match(vars, new RegExp(v + ': rgb\\(255 255 255 / 0\\.\\d+\\)'), v + ' es un velo blanco translúcido')
  }
  for (const v of ['hover', 'selected', 'active']) {
    assert.match(vars, new RegExp('--oj-button-borderless-chrome-border-color-' + v + ': transparent'))
  }
  for (const v of ['', '-hover', '-selected', '-selected-hover', '-active']) {
    assert.match(vars, new RegExp('--oj-button-borderless-chrome-text-color' + v + ': var\\(--oj-core-text-color-inverse, #fff\\)'))
  }
  assert.match(vars, /--oj-core-focus-border-color: rgb\(255 255 255 \/ 0\.6\)/, 'foco visible pero discreto')
})

test('chat: FAB propio y drawer a la izquierda — Ask Oracle ya no lleva el chat dentro', () => {
  const shell = webApp('pages/shell-page.html')
  const dialog = shell.match(/<oj-dialog id="mateuAskOracle"[\s\S]*?<\/oj-dialog>/)[0]
  assert.equal(/mateuChatInput|mateuChatMode|chatShowChat/.test(dialog), false, 'la paleta es sólo el buscador')
  // el FAB del chat: su icono Redwood y su etiqueta (display=icons → aria-label + tooltip)
  const fab = shell.match(/<oj-button id="mateuChatFab"[\s\S]*?<\/oj-button>/)[0]
  assert.match(fab, /display="icons"/)
  assert.match(fab, /oj-ux-ico-chat/)
  assert.match(fab, /Chat con el asistente/)
  assert.match(fab, /\$listeners\.chatToggle/)
  // el drawer: START de un oj-drawer-layout (reflow en ancho, overlay en estrecho) que envuelve
  // el contenido — no un oj-drawer-popup, que taparía la pantalla
  const layout = shell.match(/<oj-drawer-layout id="mateuChatDrawer"[\s\S]*?>/)[0]
  assert.match(layout, /start-opened="\[\[ \$application\.variables\.mateuChatOpen \]\]"/)
  assert.match(layout, /on-oj-before-close="\[\[ \$listeners\.chatClose \]\]"/)
  assert.equal(/start-display="overlay"/.test(layout), false)
  assert.ok(shell.indexOf('id="mateuChatDrawer"') < shell.indexOf('id="mateuNavDrawer"'), 'envuelve al contenido')
  assert.ok(shell.indexOf('slot="globalHeader"') < shell.indexOf('id="mateuChatDrawer"'), 'la cabecera queda fuera')
  assert.match(shell, /<div slot="start" id="mateuChatPanel" role="complementary" aria-label="Chat del asistente"/)
  assert.match(shell, /id="mateuChatInput"/)
  assert.match(shell, /aria-live="polite"/)
  // cableado: listeners y cadena
  const page = JSON.parse(webApp('pages/shell-page.json'))
  assert.equal(page.eventListeners.chatToggle.chains[0].chain, 'toggleMateuChat')
  assert.equal(page.eventListeners.chatClose.chains[0].parameters.open, false)
  assert.equal(page.eventListeners.chatShowChat, undefined)
  const flow = JSON.parse(webApp('app-flow.json'))
  assert.equal(flow.variables.mateuChatOpen.defaultValue, false)
  assert.equal(flow.variables.mateuChatMode, undefined)
  // el envío conserva streaming + agente por ruta y ahora presenta el token
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /currentRoute: \$application\.variables\.mateuSelectedRoute/)
  assert.match(send, /headers: bridge\.authHeadersOf\(\)/)
  assert.match(send, /onText:/)
})

test('chat: el cuerpo lleva la ruta de la pantalla (el plano de control elige el agente por ella)', () => {
  assert.deepEqual(buildChatBody({ message: 'hola', sessionId: 's1', currentRoute: '/mapping/dictionary' }),
    { message: 'hola', sessionId: 's1', currentRoute: '/mapping/dictionary' })
  assert.equal('currentRoute' in buildChatBody({ message: 'hola', sessionId: 's1', currentRoute: '' }), false)
})

test('chat: el stream presenta el token de la sesión; sin token, sin cabecera', () => {
  const original = globalThis.localStorage
  try {
    globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? 'tk' : null) }
    assert.deepEqual(authHeadersOf(), { Authorization: 'Bearer tk' })
    globalThis.localStorage = { getItem: () => null }
    assert.deepEqual(authHeadersOf(), {})
  } finally {
    globalThis.localStorage = original
  }
})

// ── Chat de IA (núcleo de transporte, paridad con mateu-chat) ───────────────────
test('chat: buildChatMenuContext aplana el menú a path + navigation (salta separador/remoto)', () => {
  const menu = [
    { label: 'Bookings', submenus: [
      { label: 'List', route: '/bookings', consumedRoute: '', actionId: '', baseUrl: '', serverSideType: 'B', uriPrefix: undefined, description: 'todas' },
    ] },
    { separator: true },
    { label: 'Remoto', remote: true, route: '/x' },
  ]
  const ctx = buildChatMenuContext(menu)
  assert.equal(ctx.length, 1)
  assert.deepEqual(ctx[0].path, ['Bookings', 'List'])
  assert.equal(ctx[0].navigation.route, '/bookings')
  assert.equal(ctx[0].navigation.serverSideType, 'B')
  assert.equal(ctx[0].description, 'todas')
})

test('chat: effectiveChatUrl usa el agente local si vive, si no el sseUrl', () => {
  assert.equal(effectiveChatUrl({ localAgentAlive: true, localAgentUrl: 'http://localhost:9999', sseUrl: '/sse' }), 'http://localhost:9999/mateu/agent/stream')
  assert.equal(effectiveChatUrl({ localAgentAlive: false, localAgentUrl: 'http://localhost:9999', sseUrl: '/sse' }), '/sse')
})

test('chat: buildChatBody solo incluye lo presente (menuContext en el 1er mensaje)', () => {
  assert.deepEqual(buildChatBody({ message: 'hola', sessionId: 's1' }), { message: 'hola', sessionId: 's1' })
  const full = buildChatBody({ message: 'hola', sessionId: 's1', attachments: [{ name: 'a', path: 'p' }], context: { route: '/x' }, mcpUrl: 'http://m', menuContext: [{ path: ['A'] }] })
  assert.deepEqual(full.attachments, [{ name: 'a', path: 'p' }])
  assert.deepEqual(full.context, { route: '/x' })
  assert.equal(full.mcpUrl, 'http://m')
  assert.equal(full.menuContext.length, 1)
})

test('chat: los discriminadores de payload distinguen uso, evento y texto', () => {
  assert.deepEqual(tryParseTokenUsage('{"inputTokens":5}'), { inputTokens: 5 })
  assert.equal(tryParseTokenUsage('hola'), null)
  assert.deepEqual(tryParseCustomEvent('{"event":"navigate","detail":{"route":"/x"}}'), { event: 'navigate', detail: { route: '/x' } })
  assert.equal(tryParseCustomEvent('texto plano'), null)
})

// Un doble de reader SSE: emite los trozos dados y luego {done:true}.
const sseResponse = (chunks) => {
  const enc = new TextEncoder()
  let i = 0
  return {
    ok: true,
    body: { getReader: () => ({ read: async () => (i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }) }) },
  }
}

atest('chat: streamChat acumula payloads data: (trimmed, como el chat compartido) y bufferea a través de trozos', async () => {
  const texts = []
  const out = await streamChat({
    url: '/sse', body: { message: 'hola' },
    // el 2º payload llega partido en dos trozos SIN el \n → se bufferea hasta cerrar la línea
    fetchImpl: async () => sseResponse(['data: uno\n', 'data: d', 'os\n']),
    onText: (t) => texts.push(t),
  })
  assert.equal(out, 'unodos', 'payloads trimmed y concatenados = paridad con mateu-chat')
  assert.equal(texts[texts.length - 1], 'unodos')
})

atest('chat: streamChat despacha eventos personalizados y captura uso de tokens', async () => {
  const events = []; let usage = null
  await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data: {"event":"navigate","detail":{"route":"/x"}}\n', 'data: {"totalTokens":9}\n']),
    onEvent: (e) => events.push(e), onUsage: (u) => { usage = u },
  })
  assert.deepEqual(events, [{ event: 'navigate', detail: { route: '/x' } }])
  assert.deepEqual(usage, { totalTokens: 9 })
})

atest('chat: agent-error se muestra como el texto del asistente, no como evento', async () => {
  let text = ''; const events = []
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data: {"event":"agent-error","detail":{"message":"boom"}}\n']),
    onText: (t) => { text = t }, onEvent: (e) => events.push(e),
  })
  assert.equal(out, '⚠️ boom')
  assert.equal(text, '⚠️ boom')
  assert.deepEqual(events, [])
})

atest('chat: streamChat lanza un error legible ante una respuesta no-ok', async () => {
  await assert.rejects(
    streamChat({ url: '/sse', body: {}, fetchImpl: async () => ({ ok: false, status: 503, text: async () => 'caído' }) }),
    /503/,
  )
})

// ── Custom components (#14) en VB: placeholder + hijos slotted ──────────────────
test('custom component: placeholder visible + hijos slotted (escape hatch #14)', () => {
  const inc = {
    commands: [], messages: [], banners: [],
    fragments: [{
      targetComponentId: '', action: 'Replace', state: {}, data: {},
      component: {
        type: 'ServerSide', metadata: null,
        children: [{
          type: 'ClientSide', metadata: { type: 'Page', title: '' },
          children: [{
            type: 'ClientSide', metadata: { type: 'CustomComponent', name: 'org-chart' },
            children: [{ type: 'ClientSide', metadata: { type: 'Text', text: 'fallback content' }, children: [] }],
          }],
        }],
      },
    }],
  }
  const reg = reduceContexts(empty(), inc)
  const host = reg.contexts[HOST_ID]
  const atoms = (hostContentOf(host, null, { title: '' }) || []).flatMap((b) => b.items)
  // placeholder con el nombre del tipo custom
  const placeholder = atoms.find((a) => a.isNotice && /org-chart/.test(a.text || ''))
  assert.ok(placeholder, 'el custom component muestra un placeholder con su nombre')
  // y los hijos slotted se pintan igualmente
  assert.ok(atoms.some((a) => a.isText && a.text === 'fallback content'), 'los hijos slotted se renderizan')
})

// ── Widgets de cabecera del App (WidgetSupplier) ────────────────────────────────────────────
// Fixture real: el App de la shell de ec-demo1 (Vaadin) — un HorizontalLayout con slot
// "widgets": MicroFrontend /_inbox/badge + Popover(Text "Hola, …") con Email y Logout.
test('widgets: el App los guarda en la shell (hijos con slot "widgets")', () => {
  const { shell, contexts } = reduceContexts(empty(), fx('app-widgets'))
  assert.equal(Object.keys(contexts).length, 0)
  assert.equal(shell.widgets.length, 1)
  assert.equal(shell.widgets[0].metadata.type, 'HorizontalLayout')
  // un App sin widgets no inventa ninguno
  assert.deepEqual(reduceContexts(empty(), fx('app')).shell.widgets, [])
})

test('widgets: Popover(Text) → área de perfil (iniciales + nombre + email/Logout); MicroFrontend → acciones', () => {
  const reg = reduceContexts(empty(), fx('app-widgets'))
  const { user, items } = headerWidgetsOf(reg)
  // el saludo, sin el HTML de pantalla estrecha (el <vaadin-icon vaadin:user> y su <span>)
  assert.equal(user.label, 'Hola, Demo User')
  assert.equal(user.initials, 'DU')
  assert.deepEqual(user.rows.map((r) => r.isText ? r.text : `${r.label} → ${r.href}`),
    ['Email: demo@mateu.io', 'Logout → javascript: window.logout();'])
  // el badge: remoto, con su pod y su ruta; el Popover de usuario NO se repite en la zona de acciones
  assert.equal(items.length, 1)
  assert.equal(items[0].isRemote, true)
  assert.equal(items[0].baseUrl, '/_inbox')
  assert.equal(items[0].route, '/badge')
  // ids por POSICIÓN: el mismo en cada bootstrap
  assert.equal(items[0].id, headerWidgetsOf(reduceContexts(empty(), fx('app-widgets'))).items[0].id)
})

test('widgets: un 2º Popover, o uno sobre un botón, es botón + popup en la zona de acciones', () => {
  const popover = (wrapped, text) => ({ type: 'ClientSide', metadata: { type: 'Popover', wrapped,
    content: { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [
      { type: 'ClientSide', metadata: { type: 'Text', text } , children: [] }] } }, children: [] })
  const text = (t) => ({ type: 'ClientSide', metadata: { type: 'Text', text: t }, children: [] })
  const reg = { shell: { widgets: [
    { type: 'ClientSide', slot: 'widgets', metadata: { type: 'HorizontalLayout' }, children: [
      popover(text('Hola, Ana'), 'Email: ana@x.io'),
      popover(text('Ayuda'), 'Llama al 900'),
      popover({ type: 'ClientSide', metadata: { type: 'Button', label: 'Más' } }, 'Algo'),
      text('<b>v1.2</b>'),
    ] }] } }
  const { user, items } = headerWidgetsOf(reg)
  assert.equal(user.label, 'Hola, Ana')
  assert.equal(user.initials, 'AN')
  assert.deepEqual(items.map((i) => i.isPopover ? `popover:${i.label}` : `html:${i.html}`),
    ['popover:Ayuda', 'popover:Más', 'html:<b>v1.2</b>'])
  assert.deepEqual(items[0].rows.map((r) => r.text), ['Llama al 900'])
  assert.ok(items[0].buttonId && items[0].popupId && items[0].buttonId !== items[0].popupId)
})

test('widgets: <vaadin-icon> → icono de fuente Redwood, conservando el style (el rojo de urgente)', () => {
  const html = '<a href="#"><vaadin-icon icon="vaadin:bell" style="width: 1em; color: var(--lumo-error-color);"></vaadin-icon><span>Inbox (3)</span></a>'
  assert.equal(redwoodHtmlOf(html),
    '<a href="#"><span class="oj-ux-ico-notification mateu-widget-icon" aria-hidden="true" style="width: 1em; color: var(--lumo-error-color);"></span><span>Inbox (3)</span></a>')
  // autocerrado, y un icono sin equivalente se quita en vez de dejar un elemento que no pinta
  assert.equal(redwoodHtmlOf('<vaadin-icon icon="vaadin:user"/>x'), '<span class="oj-ux-ico-contact mateu-widget-icon" aria-hidden="true"></span>x')
  assert.equal(redwoodHtmlOf('<vaadin-icon icon="vaadin:no-such-icon"></vaadin-icon>x'), 'x')
  assert.equal(plainTextOf('<span>Hola,&nbsp;Demo</span>  <i>User</i>'), 'Hola, Demo User')
  assert.equal(initialsOf('Hola, José Luis Pérez'), 'JP')
  assert.equal(initialsOf('demo'), 'DE')
})

test('widgets: el HTML del badge (fixture real) interpola su state y lleva el enlace que emite navigation-requested', () => {
  const inc = fx('widget-badge')
  const fr = inc.fragments[0]
  const html = remoteWidgetHtmlOf(fr.component, fr.state)
  assert.match(html, /navigation-requested/)
  assert.match(html, /route: '\/inbox\/pending'/)
  assert.match(html, /baseUrl: '\/_inbox'/)
  assert.match(html, /class="oj-ux-ico-notification mateu-widget-icon"/)
  assert.doesNotMatch(html, /vaadin-icon/)
  assert.doesNotMatch(html, /\$\{state\./)
})

atest('widgets: el MicroFrontend se carga de SU pod y se refresca con sus triggers (OnLoad → OnSuccess encadenado)', async () => {
  const badge = fx('widget-badge')
  const calls = []
  let count = 16
  const call = async (base, body, options) => {
    calls.push({ base, body, options })
    if (body.actionId === '') return badge
    // refresh → fragmento SOLO-ESTADO (como State(this) del server)
    count += 1
    return { fragments: [{ targetComponentId: body.initiatorComponentId, state: { content: `<a href="#">Inbox (${count})</a>` } }] }
  }
  const timers = []
  const schedule = (fn, ms) => { timers.push({ fn, ms }); return timers.length }
  const htmls = []
  const { items } = headerWidgetsOf(reduceContexts(empty(), fx('app-widgets')))
  const rt = startRemoteWidget(items[0], (h) => htmls.push(h), { call, schedule, cancel: () => {} })
  await rt.loaded
  assert.equal(calls[0].base, '/_inbox')
  assert.equal(calls[0].body.route, '/badge')
  assert.equal(calls[0].body.actionId, '')
  assert.equal(calls[0].body.initiatorComponentId, items[0].id)
  // de fondo: ni barra de ocupado ni banda de error
  assert.equal(calls[0].options.quiet, true)
  assert.match(htmls[0], /Inbox \(16\)/)
  // OnLoad: refresh a los 10 s
  assert.equal(timers.length, 1)
  assert.equal(timers[0].ms, 10000)
  await timers[0].fn()
  assert.equal(calls[1].body.actionId, 'refresh')
  assert.equal(calls[1].body.serverSideType, 'io.mateu.ecdemo1.communication.ui.inbox.InboxBadge')
  assert.match(calls[1].body.componentState.content, /Inbox \(16\)/)
  assert.equal(htmls[1], '<a href="#">Inbox (17)</a>')
  // OnSuccess(refresh) → otro refresh a los 10 s, y así sucesivamente
  assert.equal(timers.length, 2)
  assert.equal(timers[1].ms, 10000)
  await timers[1].fn()
  assert.equal(htmls[2], '<a href="#">Inbox (18)</a>')
  assert.equal(timers.length, 3)
  // parar corta el bucle: un refresco ya programado no pinta ni reprograma
  stopRemoteWidgets()
  await timers[2].fn()
  assert.equal(htmls.length, 3)
  assert.equal(timers.length, 3)
})

atest('widgets: un refresco que falla no se reprograma (OnSuccess), y no tumba nada', async () => {
  const badge = fx('widget-badge')
  const call = async (base, body) => { if (body.actionId === '') return badge; throw new Error('503') }
  const timers = []
  const { items } = headerWidgetsOf(reduceContexts(empty(), fx('app-widgets')))
  const rt = startRemoteWidget(items[0], () => {}, { call, schedule: (fn, ms) => { timers.push(fn); return timers.length }, cancel: () => {} })
  await rt.loaded
  await timers[0]()
  assert.equal(timers.length, 1)
  stopRemoteWidgets()
})

atest('widgets: las peticiones quiet no avisan a los ganchos de ocupado/error', async () => {
  const seen = []
  setTransportHooks({ onStart: () => seen.push('start'), onSettle: () => seen.push('settle') })
  const realFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ fragments: [] }) })
  try {
    await callMateu('/_inbox', { route: '/badge', actionId: 'refresh' }, { quiet: true })
    assert.deepEqual(seen, [])
    await callMateu('/_inbox', { route: '/badge', actionId: 'refresh' })
    assert.deepEqual(seen, ['start', 'settle'])
  } finally {
    globalThis.fetch = realFetch
    setTransportHooks({})
  }
})

test('widgets: navigation-requested registra la ruta en su pod si el menú no la conoce; el menú manda', () => {
  assert.equal(registerRemoteRoute('/inbox/widget-only', { baseUrl: '/_inbox', serverSideType: 'x.InboxHome', consumedRoute: '' }), true)
  assert.deepEqual(remoteRouteOf('/inbox/widget-only'), { baseUrl: '/_inbox', consumedRoute: '', serverSideType: 'x.InboxHome', uriPrefix: '' })
  // ya registrada (p.ej. por el menú): no se pisa
  assert.equal(registerRemoteRoute('/inbox/widget-only', { baseUrl: '/_otro' }), false)
  assert.equal(remoteRouteOf('/inbox/widget-only').baseUrl, '/_inbox')
  // sin pod, nada que registrar
  assert.equal(registerRemoteRoute('/local', { route: '/local' }), false)
})


// ── Editor de filas modal (@DetailFormCustomisation position = modal) — wire real del booking
// de ec-demo1 (fixtures/real/rowedit-*.json): el wizard de nueva reserva en su paso Rooms y el
// formulario de edición de una reserva.
const WIZ_ID = '5c242863-bc33-4be8-8aeb-cac417f95673'
// el host del wizard en el paso Rooms: la respuesta real del Next, sobre un host cuyo árbol
// tenía el id al que el Next se mandó
const wizardAtRooms = () => {
  const seeded = { contexts: { [HOST_ID]: { id: HOST_ID, kind: 'host', state: {}, data: {},
    tree: { type: 'ServerSide', id: 'c1e58725-6bda-42a7-8f80-e51c95f9f6dc' },
    outbound: { route: '/booking/newBooking', consumedRoute: '', serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.BookingHome', baseUrl: '/_booking' } } },
  stack: [], shell: null }
  return reduceContexts(seeded, fx('rowedit-wizard-rooms'))
}
// la captura del "+" se mandó con el id previo al Next como initiator; el renderer manda el
// id del árbol que tiene (tree.id) y el servidor lo ECOA — se reescribe el eco en consecuencia
const echoTo = (inc, from, to) => ({ ...inc, fragments: inc.fragments.map((f) => (f.targetComponentId === from ? { ...f, targetComponentId: to } : f)) })
const wizardAddInc = () => echoTo(fx('rowedit-wizard-add'), 'c1e58725-6bda-42a7-8f80-e51c95f9f6dc', WIZ_ID)

test('rowedit: la lista modal es EDITABLE — "+" debajo, Editar/Quitar por fila, sin la columna _select', () => {
  const reg = wizardAtRooms()
  const host = reg.contexts[HOST_ID]
  assert.equal(host.tree.id, WIZ_ID)
  const rooms = collectFields(host.tree).find((f) => f.fieldId === 'rooms')
  assert.equal(rooms.formPosition, 'modal')
  assert.ok(isModalRowEditor(rooms))
  const atoms = (islandContentOf(host) || []).flatMap((b) => b.items)
  const grid = atoms.find((a) => a.isGrid && a.fieldId === 'rooms')
  assert.ok(grid.rowEditable)
  assert.equal(grid.addActionId, 'rooms_add')
  assert.ok(!grid.columns.some((c) => c.field === '_select'), 'la columna-botón del wire no se pinta como columna de datos')
  assert.equal(grid.columns[grid.columns.length - 1].template, 'cellListRowActions')
  // la lista no es un campo de texto del form genérico (salía un input "Rooms" bajo la tabla)
  assert.ok(!fieldListOf(host.tree, host.state).some((f) => f.fieldId === 'rooms'))
})

test('rowedit: una lista NO modal (o de solo lectura) sigue siendo una tabla sin acciones', () => {
  assert.equal(isModalRowEditor({ columns: [{}], formPosition: 'bottom' }), false)
  assert.equal(isModalRowEditor({ columns: [{}], formPosition: 'modal', readOnly: true }), false)
  assert.equal(isModalRowEditor({ columns: [{}], formPosition: 'modal', inlineEditing: true }), false)
  assert.equal(isModalRowEditor({ columns: [{}], formPosition: 'modalRight' }), true)
})

test('rowedit: las acciones de lista se reconocen por <campo>_rowClass (como Vaadin) o por el árbol', () => {
  const reg = wizardAtRooms()
  const host = reg.contexts[HOST_ID]
  assert.deepEqual(listActionOf(host.state, 'rooms_create-and-stay'), { fieldId: 'rooms', verb: 'create-and-stay' })
  assert.equal(listActionOf(host.state, 'next'), null)
  assert.equal(listActionOf({}, 'rooms_add'), null)
  assert.deepEqual(listActionOf({}, 'rooms_add', host.tree), { fieldId: 'rooms', verb: 'add' })
})

test('rowedit: "+" en el wizard va al SERVERSIDE del wizard con su estado — no al mediador', () => {
  const reg = wizardAtRooms()
  const rq = listActionRequestOf(reg, 'rooms_add', { hostDraft: {} })
  assert.equal(rq.verb, 'add')
  assert.equal(rq.componentState.position, 1)
  assert.equal(rq.componentState.stay.hotelCode, 'MRU01')
  assert.equal(rq.parameters.initiatorState, undefined)
  assert.equal(rq.ctx.outbound.serverSideType, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.NewBookingWizard')
  assert.equal(rq.ctx.outbound.route, '/booking/newBooking')
  assert.equal(rq.ctx.tree.id, WIZ_ID)
})

test('rowedit: la respuesta del "+" abre el editor — "New room", pie Cancel · Save and add another · Save', () => {
  const reg = reduceContexts(wizardAtRooms(), wizardAddInc())
  assert.deepEqual(reg.contexts[HOST_ID].state._show_detail, { rooms: true })
  assert.equal(reg.contexts[HOST_ID].state.position, 1, 'el wizard sigue en Rooms')
  const editor = rowEditorOf(reg)
  assert.equal(editor.id, 'rooms-container')
  assert.equal(editor.title, 'New room')
  assert.deepEqual(editor.buttons.map((b) => [b.actionId, b.chroming]), [
    ['rooms_cancel', 'borderless'], ['rooms_create-and-stay', 'outlined'], ['rooms_create', 'callToAction']])
  assert.deepEqual(editor.toolbar, [])
  const byId = Object.fromEntries(editor.fields.map((f) => [f.fieldId, f]))
  assert.ok(byId.roomTypeCode.isLookup && byId.roomTypeCode.isSelect && byId.roomTypeCode.required)
  assert.equal(byId.roomTypeCode.lookupActionId, 'search-roomTypeCode')
  assert.ok(byId.adults.isNumber)
  assert.equal(byId.adults.value, 2)
  assert.ok(byId.line.readonly)
  assert.ok(!byId.childrenAges, 'una lista anidada no se edita en el diálogo')
})

test('rowedit: Save valida los obligatorios de la fila en el diálogo; con ellos rellenos, pasa', () => {
  const reg = reduceContexts(wizardAtRooms(), wizardAddInc())
  const row = reg.contexts['rooms-container']
  assert.ok(ROW_VALIDATING_VERBS.create && ROW_VALIDATING_VERBS.save && !ROW_VALIDATING_VERBS.cancel)
  const errors = validateRow(row, {})
  assert.deepEqual(Object.keys(errors).sort(), ['boardCode', 'ratePlanCode', 'roomTypeCode'])
  const fields = rowFieldsOf(row, {}, errors)
  assert.equal(fields.find((f) => f.fieldId === 'roomTypeCode').messagesCustom[0].severity, 'error')
  assert.deepEqual(fields.find((f) => f.fieldId === 'adults').messagesCustom, [])
  assert.deepEqual(validateRow(row, { roomTypeCode: 'DBLSV', ratePlanCode: 'BAR', boardCode: 'AD' }), {})
})

test('rowedit: Save viaja con el estado del CONTENEDOR y la fila en initiatorState (wizard)', () => {
  const reg = reduceContexts(wizardAtRooms(), wizardAddInc())
  const rq = listActionRequestOf(reg, 'rooms_create', {
    hostDraft: {}, rowDraft: { roomTypeCode: 'DBLSV', ratePlanCode: 'BAR', boardCode: 'AD' } })
  assert.equal(rq.componentState.position, 1)
  assert.equal(rq.componentState.stay.arrival, '2026-11-10')
  assert.equal(rq.componentState.rooms_rowClass, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.RoomViewModel')
  assert.equal(rq.parameters.initiatorState.roomTypeCode, 'DBLSV')
  assert.equal(rq.parameters.initiatorState.adults, 2)
  assert.equal(rq.componentState.roomTypeCode, undefined, 'la fila NO es el componentState')
})

test('rowedit: los lookups de la fila los resuelve el ServerSide de la FILA con su estado', () => {
  const reg = reduceContexts(wizardAtRooms(), wizardAddInc())
  assert.deepEqual(pendingLookupsOf(reg.contexts['rooms-container']).map((l) => l.actionId),
    ['search-roomTypeCode', 'search-ratePlanCode', 'search-boardCode'])
  const rq = lookupRequestOf(reg, 'rooms-container', 'roomTypeCode')
  assert.equal(rq.actionId, 'search-roomTypeCode')
  assert.deepEqual(rq.parameters, { searchText: '', fieldId: 'roomTypeCode', size: 200, page: 0 })
  assert.equal(rq.ctx.outbound.serverSideType, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.RoomViewModel')
  assert.equal(rq.ctx.outbound.route, '/booking/newBooking')
  assert.equal(rq.ctx.tree.id, 'f0a221bf-453e-450a-927f-5b5327774174')
  assert.equal(rq.componentState.adults, 2)
})

// el formulario de EDICIÓN de una reserva: host '_edit' (BookingViewModel) con la lista rooms
const editForm = () => {
  const wiz = wizardAtRooms().contexts[HOST_ID]
  const holderState = JSON.parse(readFileSync(join(here, 'fixtures', 'real', 'rowedit-add.json'), 'utf8'))
    .fragments[0].state
  const state = { ...holderState, _show_detail: {}, _editing: {} }
  return { contexts: { [HOST_ID]: { id: HOST_ID, kind: 'host', data: {}, state,
    tree: { ...wiz.tree, id: '_edit', serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingViewModel' },
    outbound: { route: '/booking/bookings/XZ6GDG/edit', consumedRoute: '/booking/bookings',
      serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingCrudOrchestrator', baseUrl: '/_booking' } } },
  stack: [], shell: null }
}

test('rowedit (edición): buscar un lookup llena las opciones del diálogo', () => {
  let reg = reduceContexts(editForm(), fx('rowedit-add'))
  assert.equal(rowEditorOf(reg).title, 'New room')
  reg = reduceContexts(reg, fx('rowedit-search'))
  const row = reg.contexts['rooms-container']
  assert.equal(pendingLookupsOf(row).length, 2)
  const roomType = rowFieldsOf(row).find((f) => f.fieldId === 'roomTypeCode')
  assert.ok(roomType.options.some((o) => o.value === 'JSUSV' && o.label === 'JSUSV — Junior suite vista mar'))
  // el contenedor no se toca con la búsqueda
  assert.deepEqual(reg.contexts[HOST_ID].state._show_detail, { rooms: true })
})

test('rowedit (edición): Editar una fila manda su _rowNumber REAL y abre "Edit room" con su posición', () => {
  const reg0 = editForm()
  const rq = listActionRequestOf(reg0, 'rooms_select', { parameters: { _rowNumber: '0' } })
  assert.strictEqual(rq.parameters._rowNumber, 0, 'el servidor compara con equals: "0" no es 0')
  assert.equal(rq.ctx.outbound.serverSideType, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingViewModel')
  const reg = reduceContexts(reg0, fx('rowedit-select'))
  const editor = rowEditorOf(reg)
  assert.equal(editor.title, 'Edit room')
  assert.equal(editor.subtitle, '1/1')
  assert.deepEqual(editor.toolbar.map((b) => b.actionId), ['rooms_prev', 'rooms_next'])
  assert.deepEqual(editor.buttons.map((b) => b.actionId), ['rooms_cancel', 'rooms_save'])
  const byId = Object.fromEntries(editor.fields.map((f) => [f.fieldId, f]))
  assert.equal(byId.roomTypeCode.value, 'JSUSV')
  assert.equal(byId.total.value, 1247)
})

test('rowedit (edición): Save actualiza la fila en la lista y cierra; Cancel cierra sin cambiar nada', () => {
  const opened = reduceContexts(editForm(), fx('rowedit-select'))
  const rq = listActionRequestOf(opened, 'rooms_save', { rowDraft: { adults: 3 } })
  assert.equal(rq.parameters.initiatorState.adults, 3)
  assert.equal(rq.parameters.initiatorState._rowNumber, 0)
  const saved = reduceContexts(opened, fx('rowedit-save'))
  assert.equal(rowEditorOf(saved), null)
  assert.equal(saved.contexts[HOST_ID].state.rooms[0].adults, 3)
  const cancelled = reduceContexts(opened, fx('rowedit-cancel'))
  assert.equal(rowEditorOf(cancelled), null)
  assert.equal(cancelled.contexts[HOST_ID].state.rooms.length, 1)
  assert.equal(cancelled.contexts[HOST_ID].state.rooms[0].adults, 2)
})

test('rowedit (edición): Create añade la fila y cierra; "Save and add another" la añade y sigue con una nueva', () => {
  const opened = reduceContexts(editForm(), fx('rowedit-add'))
  const created = reduceContexts(opened, fx('rowedit-create'))
  assert.equal(created.contexts[HOST_ID].state.rooms.length, 2)
  assert.equal(created.contexts[HOST_ID].state.rooms[1].roomTypeCode, 'DBLSV')
  assert.equal(rowEditorOf(created), null)
  const again = reduceContexts(opened, fx('rowedit-create-and-stay'))
  assert.equal(again.contexts[HOST_ID].state.rooms.length, 2)
  const editor = rowEditorOf(again)
  assert.equal(editor.title, 'New room')
  assert.equal(editor.fields.find((f) => f.fieldId === 'roomTypeCode').value, null, 'fila NUEVA, vacía')
  // la fila nueva vuelve a necesitar sus opciones (su ServerSide es otro)
  assert.equal(pendingLookupsOf(again.contexts['rooms-container']).length, 3)
})

test('rowedit (edición): Quitar una fila la manda en <campo>_selected_items, tal cual está en la lista', () => {
  const reg = editForm()
  const rq = listActionRequestOf(reg, 'rooms_remove', { parameters: { _rowNumber: '0' } })
  assert.deepEqual(rq.componentState.rooms_selected_items, [reg.contexts[HOST_ID].state.rooms[0]])
  assert.equal(rq.parameters._rowNumber, undefined)
})

test('rowedit (edición): los otros editores — New guest (select de opciones, fecha) y New payment (lookup)', () => {
  const guest = rowEditorOf(reduceContexts(editForm(), fx('rowedit-guests-add')))
  // guests no es modal en el árbol sembrado (el del wizard sólo trae rooms): se usa la fila
  assert.equal(guest, null)
  const guestRow = reduceContexts(editForm(), fx('rowedit-guests-add')).contexts['guests-container']
  const g = Object.fromEntries(rowFieldsOf(guestRow).map((f) => [f.fieldId, f]))
  assert.ok(g.type.isSelect && !g.type.isLookup)
  assert.deepEqual(g.type.options.map((o) => o.value), ['Adult', 'Child'])
  assert.ok(g.birthDate.isDate)
  const payRow = reduceContexts(editForm(), fx('rowedit-payments-add')).contexts['payments-container']
  const p = Object.fromEntries(rowFieldsOf(payRow).map((f) => [f.fieldId, f]))
  assert.ok(p.methodCode.isLookup)
  assert.ok(p.amount.isNumber && p.amount.required)
  assert.ok(p.paymentId.readonly)
})

test('interpolate: ${state.x} y ${state[\'x\']}', () => {
  assert.equal(interpolate("${state['_position']} de ${state.total}", { _position: '2/3', total: 4 }), '2/3 de 4')
  assert.equal(interpolate('${state["a"]}', { a: 'x' }), 'x')
})

await queue
console.log(`\n${pass} tests OK (contrato de wire real)`)
