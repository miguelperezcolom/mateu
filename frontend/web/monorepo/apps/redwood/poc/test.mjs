// Batería de tests del renderer — corre en Node, SIN VB.
// v3: valida el reducer contra increments REALES (fixtures/real/*.json, capturados con
// capture.mjs contra demo/demo-vb :9005) — son tests de CONTRATO del wire, no sintéticos.
// Regenerar fixtures: arrancar demo/demo-vb (mvn spring-boot:run, :9005) y `node capture.mjs`.

import assert from 'node:assert/strict'
import { autoTrail, parentCrumb } from './breadcrumbs.mjs'
import { createClientErrorReporter, endpointIsMissing, clientLogSender, clientLogEndpointOf, clientErrors, redactUrl, routeOfRequestUrl } from './clientLog.mjs'
import { foldoutElementAtomsOf } from './elements.mjs'
import { guidedProcessMediaQuery, guidedProcessWheelIsNative, focusIsInChat } from './a11y.mjs'
import { activeSectionOf, sectionHomeOf, sectionOf } from './navTree.mjs'
import { inAppRouteOfLink } from './links.mjs'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { composeInnerRoute, mediatorBaseOf, routeFlipOf, loadRoute, loadRouteInto, bootstrapShell, expandRemoteMenus, remoteRouteOf, registerRemoteRoute, baseOf, runMateuAction, callMateu, loadLookups } from './transport.mjs'
import {
  headerWidgetsOf, redwoodHtmlOf, plainTextOf, initialsOf, remoteWidgetHtmlOf, startRemoteWidget, stopRemoteWidgets,
  askFabOf, brandAskFab, ASK_FAB_GLYPH, SHELL_CHAT_GLYPH,
} from './widgets.mjs'
import {
  toSyncPath, loadBundleManifest, hasBundle, getBundledIncrement, matchBundledTemplate,
  bundledIncrementFor, __setBundleForTests, applyRouteParams, getRouteEntry,
} from './bundle.mjs'
import {
  classifyRequestFailure, isIdempotentAction, shouldRetry, retryDelayMs, MAX_RETRIES,
  connectivity, pendingActions, fetchWithPolicy, setTransportHooks,
  authHeadersOf, askForReauthentication, beginView, currentView, isStaleResponse,
} from './resilience.mjs'
import {
  buildChatMenuContext, buildChatBody, effectiveChatUrl, tryParseTokenUsage,
  tryParseCustomEvent, streamChat, mergeTurnUsage, addUsage, chatStatusText,
  createSseParser, classifyChatPayload, isEmptyUsage, createChatProgress, latestUsage,
  speechRecognitionCtor, transcriptOf, chatMarkdownToHtml, chatRouteOfLink, stickChatToBottom, isChatMicShortcut,
  CHAT_MIC_ARIA_KEYSHORTCUTS,
} from './chat.mjs'
import {
  reduceContexts, collectFields, collectActions, collectIslands, mediatorOf, HOST_ID, layoutFieldOf,
  dynFormMetadataOf, actionsOf, summarizeHost, listingOf, onLoadTriggers, findByType,
  listingPagingOf, targetPageOf, listingSearchStateOf, listingSortOf, ROW_LINES_FIELD, rowLinesSplit, lineOfColumn,
  ojIconOf, ojIconOrGenericOf, GENERIC_ICON, navTargetOf,
  selectionOfKeySet, selectedRowsOf, withListingSelection,
  overlayOf, eventTriggersOf, shellNavOf, foldoutOf, wizardOf, bannersOf, pageStyleOf,
  welcomeOf, welcomeKeyOf, welcomeLookOf, generalOverviewOf, itemOverviewOf, taskQueueOf, emptyStateOf, notFoundOf,
  islandContentOf, tabStripOf, withActiveTab, tabBarIdsOf, collectIslands as collectIslandsFn, mergeNestedContent, hostContentOf, longTaskWatcher,
  entityHeaderOf, pageKpisOf, pageSubtitleOf, itemOverviewPageOf, primaryToolbarButton,
  filterDescriptorOf, filterChipsOf, multiValuesOf, abbreviateUuid, columnWidthOf,
  smartFiltersMetadataOf, smartFilterSuggestionsOf, smartFilterValueOf, filterStateOfSmartFilters,
  suggestionRowsFor, suggestionFiltersProviderOf, smartFiltersOf, smartFilterDropdownRowsOf, dropdownRowsFor, suggestionsProviderOf, setMetadataProviderFactory, KEYWORD_FILTER,
  listActionOf, listActionRequestOf, rowEditorOf, rowFieldsOf, validateRow, pendingLookupsOf, lookupRequestOf,
  isModalRowEditor, fieldListOf, formSectionsOf, secondaryActionOf, interpolate, ROW_VALIDATING_VERBS,
  wizardStepViewOf, isRichAtom, validationOf, formErrorsOf, selectPlaceholder,
  backToolbarButton, pageToolbarOf, declaredActionOf, actionTransportOf, overlayTransportOf, confirmationOf, confirmationDefaultsOf,
  awaitConfirmation, answerConfirmation, queryFiltersOf, formLookupsOf, markLookupsLoaded, filtersOf, LOOKUP_LOADED,
  searchableIdsOf, searchableChipsOf, searchPickerOf, pickerSearchStateOf, withContextState, withSearchableIds,
  IDS_PARAM, idsChipLabelOf, splitListingQuery, listingQueryOf, listingUrlOf,
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

// 14 paginación) El listado se pagina en el SERVER: la Page (pageNumber/pageSize/totalElements)
//     se proyecta a un pie con rango + primera/anterior/siguiente/última; paginar conserva texto,
//     filtros y orden; la cabecera ordena en el server ([{field, direction}] = uidl Sort).
test('listing: paginación — el pie sale de la Page del server', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  const search = JSON.parse(JSON.stringify(fx('search-listing')))
  search.fragments[0].targetComponentId = ''
  // una sola página (3 filas de 20): sin pie
  reg = reduceContexts(reg, search)
  const one = listingOf(reg.contexts[HOST_ID], { lang: 'en' }).paging
  assert.equal(one.visible, false)
  assert.equal(one.rangeText, '1–3 of 3')
  // segunda página de 57 a 10 por página
  const page = search.fragments[0].data.crud.page
  page.pageSize = 10
  page.pageNumber = 1
  page.totalElements = 57
  page.content = Array.from({ length: 10 }, (_, i) => ({ _rowNumber: i, id: 'P' + i, name: 'n' + i }))
  reg = reduceContexts(reg, search)
  const p = listingOf(reg.contexts[HOST_ID], { lang: 'es' }).paging
  assert.equal(p.visible, true)
  assert.equal(p.pageNumber, 1)
  assert.equal(p.pageCount, 6)
  assert.equal(p.rangeText, '11–20 de 57')
  assert.equal(p.pageText, 'Página 2 de 6')
  assert.equal(p.prevDisabled, false)
  assert.equal(p.nextDisabled, false)
  assert.equal(targetPageOf(p, 'first'), 0)
  assert.equal(targetPageOf(p, 'prev'), 0)
  assert.equal(targetPageOf(p, 'next'), 2)
  assert.equal(targetPageOf(p, 'last'), 5)
  // última página: 7 filas, sin siguiente
  const last = listingPagingOf({ pageSize: 10, pageNumber: 5, totalElements: 57, content: new Array(7).fill({}) }, 20, 'en')
  assert.equal(last.rangeText, '51–57 of 57')
  assert.equal(last.nextDisabled, true)
  assert.equal(last.lastDisabled, true)
  assert.equal(targetPageOf(last, 'next'), null)
  assert.equal(targetPageOf(last, 'prev'), 4)
  // sin total conocido: hay siguiente mientras la página venga llena
  const open = listingPagingOf({ pageSize: 10, pageNumber: 0, totalElements: null, content: new Array(10).fill({}) }, 20, 'en')
  assert.equal(open.hasNext, true)
  assert.equal(open.lastDisabled, true)
  assert.equal(open.pageText, 'Page 1')
  // las columnas llevan su id del wire como clave (lo que devuelve el ojSort)
  const listing = listingOf(reg.contexts[HOST_ID])
  assert.ok(listing.columns.every((c) => c.id))
})

test('listing: la columna principal (@PrimaryColumn) lleva imagen delante y caption — campos de la fila', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  const cols = crud.metadata.columns
  const name = cols.map((c) => c.metadata || c).find((c) => c.id === 'name')
  name.stereotype = 'primary'
  name.leadingPath = 'bandera'
  name.captionPath = 'nota'
  name.sortingProperty = 'sortName'
  let reg = reduceContexts(empty(), content)
  const search = JSON.parse(JSON.stringify(fx('search-listing')))
  search.fragments[0].targetComponentId = ''
  search.fragments[0].data.crud.page.content[0].bandera = '/flags/at.svg'
  search.fragments[0].data.crud.page.content[0].nota = 'VIP'
  reg = reduceContexts(reg, search)
  const listing = listingOf(reg.contexts[HOST_ID])
  const col = listing.columns.find((c) => c.id === 'name')
  assert.equal(col.template, 'cellPrimary')
  assert.equal(col.field, 'name__primary')
  assert.deepEqual(listing.rows[0].name__primary, { title: 'Laptop', caption: 'VIP', leading: '/flags/at.svg' })
  assert.deepEqual(listing.rows[1].name__primary, { title: 'Mouse', caption: '', leading: '' })
  assert.equal(listing.rows[0].name, 'Laptop') // la fila, intacta
  // ordenar por ella ordena por su sortingProperty
  assert.deepEqual(listingSortOf({ header: 'name', direction: 'ascending' }, listing.sortFields), [{ field: 'sortName', direction: 'ascending' }])
})

test('listing: filas de varias líneas (@Line) — la línea 1 son las columnas, el resto va debajo como pares', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  const metas = crud.metadata.columns.map((c) => c.metadata || c)
  // sin @Line el listado es el de siempre
  let reg = reduceContexts(empty(), content)
  const search = JSON.parse(JSON.stringify(fx('search-listing')))
  search.fragments[0].targetComponentId = ''
  const plain = listingOf(reduceContexts(reg, search).contexts[HOST_ID])
  assert.equal(plain.extraLines, 0)
  assert.equal(plain.tableClass, 'oj-sm-12')
  assert.ok(plain.columns.every((c) => c.id !== ROW_LINES_FIELD))
  assert.equal(plain.rows[0][ROW_LINES_FIELD], undefined)
  // la última columna de datos, a la línea 2
  const moved = metas.filter((c) => c.dataType === 'string' && c.id !== 'select').slice(-1)[0]
  moved.line = 2
  reg = reduceContexts(empty(), content)
  const listing = listingOf(reduceContexts(reg, search).contexts[HOST_ID])
  assert.equal(listing.extraLines, 1)
  assert.match(listing.tableClass, /mateu-multiline-table mateu-lines-1/)
  // fuera de las columnas de la tabla (cabecera, orden) — y la columna técnica de líneas al final
  assert.ok(!listing.columns.some((c) => c.id === moved.id))
  const last = listing.columns[listing.columns.length - 1]
  assert.equal(last.id, ROW_LINES_FIELD)
  assert.equal(last.template, 'cellLines')
  assert.equal(last.sortable, 'disabled')
  // cada fila lleva sus líneas extra precomputadas: «Etiqueta: valor»
  const row = listing.rows[0]
  const lines = row[ROW_LINES_FIELD].lines
  assert.equal(lines.length, 1)
  assert.equal(lines[0].pairs.length, 1)
  assert.equal(lines[0].pairs[0].key, moved.id)
  assert.equal(lines[0].pairs[0].label, moved.label || moved.id)
  const raw = search.fragments[0].data.crud.page.content[0][moved.id]
  assert.equal(lines[0].pairs[0].text, raw == null ? '' : String(raw))
  // la columna sigue ordenable en el server por su sortField; el selector no lleva la técnica
  assert.ok(listing.sortFields[moved.id])
  // un estado en la línea 2 lleva su badge; un dinero, «importe moneda»; la línea 3 va aparte
  assert.deepEqual(rowLinesSplit([{ metadata: { id: 'a' } }, { metadata: { id: 'b', line: 3 } }, { metadata: { id: 'c', line: 2 } }]).extra
    .map((l) => l.map((c) => c.metadata.id)), [['c'], ['b']])
  assert.equal(lineOfColumn({ line: null }), 1)
  assert.equal(lineOfColumn({ line: 2 }), 2)
})

test('listing: paginar conserva texto, filtros y orden; el orden va en el vocabulario del server', () => {
  const state = listingSearchStateOf({ crud_selected_items: [], sort: [{ field: 'old', direction: 'ascending' }] }, {
    searchText: 'mru', page: 3, size: 10,
    filters: { hotel: 'MRU01', when_from: '2026-01-01' },
    sort: [{ field: 'when', direction: 'descending' }],
  })
  assert.equal(state.searchText, 'mru')
  assert.equal(state.page, 3)
  assert.equal(state.size, 10)
  assert.equal(state.hotel, 'MRU01')
  assert.equal(state.when_from, '2026-01-01')
  assert.deepEqual(state.sort, [{ field: 'when', direction: 'descending' }])
  // sin orden pedido no se manda uno viejo; sin página, la primera
  const plain = listingSearchStateOf({ sort: [{ field: 'old', direction: 'ascending' }] }, { searchText: null, size: 20 })
  assert.equal(plain.sort, undefined)
  assert.equal(plain.page, 0)
  assert.equal(plain.searchText, '')
  assert.deepEqual(listingSortOf({ header: 'when', direction: 'descending' }), [{ field: 'when', direction: 'descending' }])
  assert.deepEqual(listingSortOf({ header: 'id__uuidCell', direction: 'ascending' }), [{ field: 'id', direction: 'ascending' }])
  assert.deepEqual(listingSortOf({}), [])
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
test('foldout: los Element de los paneles también se montan (la tabla «In other systems»)', () => {
  const el = (id) => ({ isElement: true, elementId: id, name: 'div', content: '<table></table>', asHtml: true })
  const content = { overview: { blocks: [{ items: [el('o1'), { isText: true }] }] },
    panels: [{ blocks: [{ items: [{ isText: true }] }] }, { blocks: [{ items: [el('p2')] }] }, null] }
  assert.deepEqual(foldoutElementAtomsOf(content).map((a) => a.elementId), ['o1', 'p2'])
  assert.deepEqual(foldoutElementAtomsOf(null), [])
})

test('header: los @KPI de la Page son los facts del header de pantalla (interpolados)', () => {
  const ctx = { state: { total: '1431.12 EUR' }, tree: { type: 'ServerSide', children: [{ metadata: { type: 'Page', title: '7DM5S9',
    kpis: [{ title: 'Total', text: '${state.total}' }, { title: 'Paid', text: '0 EUR' }, { title: '', text: '' }] } }] } }
  assert.deepEqual(pageKpisOf(ctx), [{ label: 'Total', value: '1431.12 EUR' }, { label: 'Paid', value: '0 EUR' }])
  assert.deepEqual(pageKpisOf({ tree: { children: [] } }), [])
})

test('header: el subtítulo de la Page (SubtitleSupplier) va al header de pantalla', () => {
  const ctx = { state: { n: 5 }, tree: { type: 'ServerSide', children: [{ metadata: { type: 'Page', title: '7DM5S9',
    subtitle: 'Total 1.431,12 EUR (${state.n} noches) · Pagado 0,00 EUR' } }] } }
  assert.equal(pageSubtitleOf(ctx), 'Total 1.431,12 EUR (5 noches) · Pagado 0,00 EUR')
  assert.equal(pageSubtitleOf({ tree: { children: [] } }), '')
})

test('navegación: los filtros son EXACTAMENTE los de la query de la ruta (ninguno si no trae)', () => {
  const a = navTargetOf('/reservas?vista=LLEGADAS_HOY', '/reservas')
  assert.deepEqual(a, { route: '/reservas', full: '/reservas?vista=LLEGADAS_HOY', filters: { vista: 'LLEGADAS_HOY' }, same: false })
  const b = navTargetOf('/reservas', '/reservas?vista=LLEGADAS_HOY')
  assert.equal(b.same, false) // antes: mismo path → «eco», no recargaba y el chip se quedaba
  assert.deepEqual(b.filters, {})
  assert.equal(navTargetOf('/reservas?vista=SALIDAS_HOY', '/reservas?vista=LLEGADAS_HOY').same, false)
  assert.equal(navTargetOf('/reservas?vista=LLEGADAS_HOY', '/reservas?vista=LLEGADAS_HOY').same, true) // eco
  assert.equal(navTargetOf('/reservas', '/reservas').same, true)
  assert.deepEqual(navTargetOf('/mapping/dictionary?integration=MRU01&page=2', '').filters, { integration: 'MRU01' })
})

test('iconos: vaadin:sign-in (Llegadas) tiene icono; uno sin traducción cae en el genérico', () => {
  assert.equal(ojIconOf('vaadin:sign-in'), 'oj-ux-ico-login')
  for (const v of ['cloud', 'trending-up', 'building', 'refresh', 'close-circle']) {
    assert.ok(ojIconOf('vaadin:' + v), v)
  }
  assert.equal(ojIconOf('vaadin:nope'), undefined) // estricto: widgets y FAB conservan su caída
  assert.equal(ojIconOrGenericOf('vaadin:nope'), GENERIC_ICON)
  assert.equal(ojIconOrGenericOf(undefined), undefined)
  const nav = shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu: [
    { label: 'Llegadas', route: '/reservas?vista=LLEGADAS_HOY', icon: 'vaadin:sign-in' },
    { label: 'Raro', route: '/raro', icon: 'vaadin:nope' },
    { label: 'Sin', route: '/sin' },
  ] } })
  const flat = JSON.stringify(nav)
  assert.ok(flat.includes('oj-ux-ico-login'))
  assert.ok(flat.includes(GENERIC_ICON))
})

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

test('shellNavOf: MENU_ON_TOP es la SUBCABECERA (título, sin acento); TABS con grupos sigue en la cabecera', () => {
  const menu = [
    { label: 'Call center', path: '/callcenter', submenus: [{ label: 'Bookings', route: '/booking/bookings', baseUrl: '/_booking' }] },
    { label: 'Avisos', route: '/inbox' },
  ]
  const onTop = shellNavOf({ shell: { variant: 'MENU_ON_TOP', title: 'Consola de datos', accentColor: '#D2232A', menu } })
  assert.equal(onTop.mode, 'subheader')
  assert.equal(onTop.title, 'Consola de datos')
  // el acento de marca (@App(accentColor)) es del renderer web: la banda de Redwood va con los
  // tokens neutros del tema, así que el nav ni lo lleva
  assert.equal(onTop.accentColor, undefined)
  // TABS con grupos (no caben en la barra inferior): siguen en la cabecera oscura, como antes
  assert.equal(shellNavOf({ shell: { variant: 'TABS', menu } }).mode, 'topbar')
  // TABS plano (el front office): la barra inferior, intacta
  assert.equal(shellNavOf({ shell: { variant: 'TABS', menu: [{ label: 'Hoy', route: '/hoy' }, { label: 'Reservas', route: '/reservas' }] } }).mode, 'tabs')
  assert.equal(shellNavOf({ shell: { variant: 'HAMBURGUER_MENU', menu } }).mode, 'drawer')
})

test('reduceContexts: el @App(accentColor) no llega a la shell de Redwood', () => {
  const { shell } = reduceContexts(empty(), { fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App', variant: 'MENU_ON_TOP', title: 'X', menu: [], accentColor: '#D2232A' }, children: [] } }] })
  assert.equal(shell.accentColor, undefined)
})

test('shellNavOf: HAMBURGER_SECTIONS — la hamburguesa lleva las secciones, cada una con su home', () => {
  const menu = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'IA', path: '/ia', submenus: [
      { label: 'Agentes', route: '/catalogues/agents', baseUrl: '/_ai' },
      { label: 'Oculta', route: '/catalogues/hidden', baseUrl: '/_ai', visible: false },
      { label: 'Modelos', route: '/catalogues/llms', baseUrl: '/_ai' },
    ] },
    { label: 'Usuarios', path: '/users', submenus: [
      // un grupo en el segundo nivel: el tercer nivel, en desplegable
      { label: 'Permisos', path: '/perm', submenus: [{ label: 'Roles', route: '/users/roles', baseUrl: '/_users' }] },
      { label: 'Users', route: '/users/users', baseUrl: '/_users' },
    ] },
    // un pod que no contestó: deshabilitado, sin home
    { label: 'Audit', path: '/audit', remote: true, unavailable: true, description: 'Audit no está disponible ahora.' },
  ]
  const nav = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', title: 'Control plane', menu } })
  assert.equal(nav.mode, 'sections')
  assert.deepEqual(nav.sections.map((s) => s.label), ['Inicio', 'IA', 'Usuarios', 'Audit'])
  // el id de la lista es la HOME: elegir la sección navega a su primera pantalla (como Opera)
  assert.deepEqual(nav.sections.map((s) => s.id), ['/inicio', '/catalogues/agents', '/users/roles', nav.menuTree[3].id])
  assert.ok(nav.sections.every((s) => !s.hasChildren), 'la hamburguesa sólo lleva el primer nivel')
  assert.equal(nav.sections[3].disabled, true)
  assert.equal(nav.sections[3].hint, 'Audit no está disponible ahora.')
  // las demás variantes no cambian; HAMBURGER_MENU es la grafía correcta de HAMBURGUER_MENU
  assert.equal(shellNavOf({ shell: { variant: 'HAMBURGER_MENU', menu } }).mode, 'drawer')
  assert.equal(shellNavOf({ shell: { variant: 'HAMBURGUER_MENU', menu } }).mode, 'drawer')
  assert.equal(shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu } }).mode, 'subheader')
})

test('HAMBURGER_SECTIONS: la sección en pantalla y su segundo nivel salen de la ruta', () => {
  const nav = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', menu: [
    { label: 'IA', path: '/ia', submenus: [
      { label: 'Agentes', route: '/catalogues/agents', baseUrl: '/_ai' },
      { label: 'Modelos', route: '/catalogues/llms', baseUrl: '/_ai' },
    ] },
    { label: 'Usuarios', path: '/users', submenus: [
      { label: 'Permisos', path: '/perm', submenus: [{ label: 'Roles', route: '/users/roles', baseUrl: '/_users' }] },
      { label: 'Users', route: '/users/users', baseUrl: '/_users' },
    ] },
  ] } })
  const tree = nav.menuTree
  assert.equal(sectionOf(tree, '/catalogues/llms/7').label, 'IA', 'el detalle de un registro sigue en su sección')
  assert.equal(sectionOf(tree, '/users/roles').label, 'Usuarios')
  assert.equal(sectionOf(tree, '/'), null)
  // el segundo nivel de la sección: el ítem marcado en la banda — un grupo, por lo que contiene
  const items = sectionOf(tree, '/users/roles').children
  assert.deepEqual(items.map((n) => n.label), ['Permisos', 'Users'])
  assert.equal(activeSectionOf(items, '/users/roles'), items[0].id)
  assert.equal(activeSectionOf(items, '/users/users'), items[1].id)
  assert.equal(sectionHomeOf(tree[1]), '/users/roles')
  assert.equal(sectionHomeOf({ id: '/x', disabled: true, children: [] }), null)
})

test('activeSectionOf: la sección en pantalla — la entrada, o el grupo que la contiene a cualquier profundidad', () => {
  const nav = shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu: [
    { label: 'Call center', path: '/callcenter', submenus: [
      { label: 'Bookings', route: '/booking/bookings', baseUrl: '/_booking' },
      // oculta: una pantalla bajo ella sigue siendo de Call center
      { label: 'Nueva', route: '/booking/new', baseUrl: '/_booking', visible: false },
    ] },
    { label: 'Admin', path: '/admin', submenus: [
      // tercer nivel (shell federada): grupo del pod con sus pantallas
      { label: 'Workflow', path: '/workflow', remote: false, submenus: [{ label: 'Processes', route: '/workflow/processes', baseUrl: '/_workflow' }] },
    ] },
    // remota que aún no contestó: cuenta por su prefijo
    { label: 'ERP', path: '/erp', remote: true, routePrefix: '/erp' },
    { label: 'Avisos', route: '/inbox' },
    { label: 'Llegadas', route: '/reservas?vista=LLEGADAS_HOY' },
  ] } })
  const tree = nav.menuTree
  const ids = tree.map((n) => n.id)
  assert.equal(activeSectionOf(tree, '/booking/bookings'), ids[0])
  assert.equal(activeSectionOf(tree, '/booking/bookings/36K69K'), ids[0], 'el detalle de un registro sigue en su sección')
  assert.equal(activeSectionOf(tree, '/booking/new'), ids[0])
  assert.equal(activeSectionOf(tree, '/workflow/processes?status=RUNNING'), ids[1])
  assert.equal(activeSectionOf(tree, '/erp/partners'), ids[2])
  assert.equal(activeSectionOf(tree, '/inbox'), ids[3])
  assert.equal(activeSectionOf(tree, '/reservas?vista=LLEGADAS_HOY'), ids[4])
  // la home (o una ruta de nadie): ninguna marcada
  assert.equal(activeSectionOf(tree, '/inicio'), null)
  assert.equal(activeSectionOf(tree, ''), null)
  assert.equal(activeSectionOf(tree, null), null)
  // un prefijo más corto no se queda con las pantallas de otra sección
  const overlap = shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu: [
    { label: 'Clientes', route: '/customers' },
    { label: 'Cambios', route: '/customers/changes' },
  ] } }).menuTree
  assert.equal(activeSectionOf(overlap, '/customers/changes/7'), overlap[1].id)
  assert.equal(activeSectionOf(overlap, '/customers/7'), overlap[0].id)
})

test('shellNavOf: grupos con rutas terminales + selectores de contexto + header actions', () => {
  const { shell } = reduceContexts(empty(), fx('app'))
  const nav = shellNavOf({ shell })
  assert.deepEqual(nav.items.map((i) => i.id), ['/hello', '/products', '/gestion'])
  // HAMBURGUER_MENU (explícito en el demo) → drawer izquierdo con oj-navigation-list
  assert.equal(nav.mode, 'drawer')
  const group = nav.menuTree.find((m) => m.hasChildren)
  assert.equal(group.label, 'Gestion')
  // la ruta COMPUESTA, como Vaadin: resuelve con el serverSideType del app (loadMenuRouteInto),
  // y un RouteLink de grupo (/gestion/island-host) cae a su terminal si el servidor no la reconoce
  assert.deepEqual(group.children.map((c) => c.id), ['/gestion/person', '/gestion/island-host'])
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
  // los campos que están FUERA de las pestañas: en el form layout de JET de su FormLayout
  const campos = items.filter((a) => a.isFormLayout).flatMap((a) => a.fields)
  assert.ok(campos.some((f) => f.fieldId === 'id'))
  assert.ok(campos.some((f) => f.fieldId === 'name'))
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

test('pestañas ANIDADAS: ids y pestaña activa por barra, sin mezclar la interior con la exterior', () => {
  const text = (t) => ({ type: 'ClientSide', metadata: { type: 'Text', text: t }, children: [] })
  const tab = (label, children, active) => ({ type: 'ClientSide', metadata: { type: 'Tab', label, active: !!active }, children })
  const tabLayout = (id, tabs) => ({ type: 'ClientSide', id, metadata: { type: 'TabLayout' }, children: tabs })
  // exterior [General, Detalle]; dentro de Detalle otra barra [General, Notas] — mismo rótulo
  // «General» en las dos y el mismo id "_tabs" que mandaba el backend antes del arreglo
  const inner = tabLayout('_tabs', [tab('General', [text('interior general')]), tab('Notas', [text('interior notas')])])
  const outer = tabLayout('_tabs', [tab('General', [text('exterior general')]), tab('Detalle', [inner])])
  const ctx = { tree: outer, state: {} }
  const atomsOf = (opts) => (islandContentOf(ctx, opts) || []).flatMap((b) => b.items)
  const barsOf = (opts) => atomsOf(opts).filter((a) => a.isTabs)
  const textsOf = (opts) => atomsOf(opts).filter((a) => a.isText).map((a) => a.text)

  // de entrada: solo la barra exterior (la interior vive en una pestaña no activa), ids de siempre
  let bars = barsOf({})
  assert.equal(bars.length, 1)
  assert.deepEqual(bars[0].tabs.map((t) => t.id), ['tab-0', 'tab-1'])
  assert.equal(bars[0].barId, 'mateuContentTabs')
  assert.equal(bars[0].stripKey, '')
  assert.deepEqual(textsOf({}), ['exterior general'])

  // clic en Detalle: aparece la barra interior con ids PROPIOS (prefijados por su pestaña)
  let active = withActiveTab({}, 'tab-1')
  bars = barsOf({ activeTabs: active })
  assert.equal(bars.length, 2)
  assert.equal(bars[0].selectedId, 'tab-1')
  assert.deepEqual(bars[1].tabs.map((t) => t.id), ['tab-1/tab-0', 'tab-1/tab-1'])
  assert.equal(bars[1].stripKey, 'tab-1')
  assert.equal(bars[1].selectedId, 'tab-1/tab-0')
  assert.notEqual(bars[1].barId, bars[0].barId, 'dos oj-tab-bar con el mismo id')
  assert.deepEqual(tabBarIdsOf(islandContentOf(ctx, { activeTabs: active })), [bars[0].barId, bars[1].barId])
  const allIds = bars.flatMap((b) => b.tabs.map((t) => t.id))
  assert.equal(new Set(allIds).size, allIds.length, 'ids de pestaña repetidos entre barras')
  assert.deepEqual(textsOf({ activeTabs: active }), ['interior general'])

  // clic en la 2ª INTERIOR: la exterior se queda en Detalle (antes saltaba a su 2ª… o a la 1ª)
  assert.equal(tabStripOf('tab-1/tab-1'), 'tab-1')
  assert.equal(tabStripOf('tab-1'), '')
  active = withActiveTab(active, 'tab-1/tab-1')
  assert.deepEqual(active, { '': 'tab-1', 'tab-1': 'tab-1/tab-1' })
  bars = barsOf({ activeTabs: active })
  assert.equal(bars[0].selectedId, 'tab-1')
  assert.equal(bars[1].selectedId, 'tab-1/tab-1')
  assert.deepEqual(textsOf({ activeTabs: active }), ['interior notas'])

  // y volver a la exterior General no olvida la interior elegida
  active = withActiveTab(active, 'tab-0')
  assert.deepEqual(textsOf({ activeTabs: active }), ['exterior general'])
  active = withActiveTab(active, 'tab-1')
  assert.deepEqual(textsOf({ activeTabs: active }), ['interior notas'])

  // compatibilidad: el activeTab de un solo id sigue mandando en la barra de primer nivel
  assert.equal(barsOf({ activeTab: 'tab-1' })[0].selectedId, 'tab-1')

  // dos barras HERMANAS de primer nivel tampoco comparten ids
  const twins = { tree: { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [
    tabLayout('a', [tab('X', [text('a-x')]), tab('Y', [text('a-y')])]),
    tabLayout('b', [tab('X', [text('b-x')]), tab('Y', [text('b-y')])]),
  ] }, state: {} }
  const twinBars = (islandContentOf(twins, { activeTabs: withActiveTab({}, 'tabs-1/tab-1') }) || [])
    .flatMap((b) => b.items).filter((a) => a.isTabs)
  assert.deepEqual(twinBars.map((b) => b.selectedId), ['tab-0', 'tabs-1/tab-1'])
})

test('item overview con pestañas anidadas: solo las de la barra exterior en la lista', () => {
  const text = (t) => ({ type: 'ClientSide', metadata: { type: 'Text', text: t }, children: [] })
  const tab = (label, children) => ({ type: 'ClientSide', metadata: { type: 'Tab', label }, children })
  const card = { type: 'ClientSide', metadata: { type: 'Card', title: { text: 'Clave' } }, children: [text('dato clave')] }
  const inner = { type: 'ClientSide', metadata: { type: 'TabLayout' }, children: [tab('I1', [text('i1')]), tab('I2', [text('i2')])] }
  const outer = { type: 'ClientSide', metadata: { type: 'TabLayout' }, children: [tab('A', [text('a')]), tab('B', [inner])] }
  const tree = { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [card, outer] }
  const overview = itemOverviewOf({ tree, state: {} })
  assert.deepEqual(overview.tabs.map((t) => t.label), ['A', 'B'])
  // el contenido de la barra interior va DENTRO de su pestaña
  assert.deepEqual(overview.tabs[1].texts, ['i1', 'i2'])
})

// 17) Foldout (Fase 7): cabeceras en metadata.panels, contenido slotted overview/panel-N.
// @FoldoutDetail: la vista (solo lectura) de un registro como foldout — overview en lista de
// propiedades, un panel por sección con contenido; lo vacío no viaja (backend FoldoutDetailSyncTest).
test('una vista @FoldoutDetail proyecta overview en propiedades y paneles solo con contenido', () => {
  const { contexts } = reduceContexts(empty(), fx('crud-view-foldout'))
  const foldout = foldoutOf(contexts['fv_app'])
  assert.ok(foldout)
  const rows = foldout.overview.blocks.flatMap((b) => b.items || []).filter((i) => i.isPropertyRow)
  // un lookup se lee por su etiqueta (data['hotel-label']), no por el código
  assert.deepEqual(rows.map((r) => [r.label, r.value]), [['Locator', 'QN29HB'], ['Hotel', 'MRU01 — Riu Demo Mauricio'], ['Total', '306.00 EUR']])
  assert.deepEqual(foldout.panels.map((p) => [p.title, p.open]), [['Titular', true], ['Seguimiento', false]])
  const fields = foldout.panels[0].blocks.flatMap((b) => b.items || []).flatMap((i) => i.fields || [])
  assert.deepEqual(fields.map((f) => [f.fieldId, f.value, f.readonly]), [['holder', 'Giulia Keller', true]])
})

// La vista real de una reserva de ec-demo1 con @FoldoutDetail: los lookups de sólo lectura
// (hotel, canal) viajan como '<campo>-label' con la etiqueta en data — el overview la lee de ahí.
test('el overview @FoldoutDetail de una reserva real pinta hotel y canal por su etiqueta', () => {
  const { contexts } = reduceContexts(empty(), fx('crud-view-foldout-booking'))
  const foldout = foldoutOf(contexts[HOST_ID])
  const rows = foldout.overview.blocks.flatMap((b) => b.items || []).filter((i) => i.isPropertyRow)
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]))
  assert.equal(byLabel['Hotel code'], 'MRU01 — Riu Demo Mauricio')
  assert.equal(byLabel['Channel code'], 'CALLCENTER — Central de reservas (call center)')
  assert.equal(byLabel['Opera reservation'], '39486242')
  assert.ok(foldout.panels.map((p) => p.title).includes('History'))
})

// La insignia de la página (@Status «Confirmed») encabeza el overview del foldout: el web la pinta
// junto al título y la cabecera de VB no tiene sitio para ella.
test('el overview @FoldoutDetail lleva la insignia de estado de la página, con la clase badge de JET', () => {
  const { contexts } = reduceContexts(empty(), fx('crud-view-foldout-booking'))
  const foldout = foldoutOf(contexts[HOST_ID])
  assert.deepEqual(foldout.badges.map((b) => [b.label, b.badgeClass]),
    [['Confirmed', 'oj-badge oj-badge-success oj-badge-subtle']])
  // el primer bloque es PLANO y lleva la insignia como átomo: el template del overview no pinta
  // un bloque isBadge suelto (solo isCard/isPlain), así que la insignia no se veía
  const first = foldout.overview.blocks[0]
  assert.equal(first.isPlain, true)
  assert.deepEqual(first.items.map((i) => [i.isBadge, i.label]), [[true, 'Confirmed']])
  assert.equal(foldout.overview.blocks.filter((b) => b.isBadge).length, 0)
})

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
test('welcomeLookOf: el hero rota al entrar en la welcome y se queda mientras se sigue en ella', () => {
  const ctx = reduceContexts(empty(), fx('load-welcome')).contexts[HOST_ID]
  const key = welcomeKeyOf(ctx)
  assert.ok(key, 'la welcome tiene una clave')
  const first = welcomeLookOf(key, null, () => 0.5)
  assert.equal(first.theme, 'dark-plum')
  assert.ok(first.illu.endsWith('illust-welcome-banner-fg-03.png'))
  // la respuesta de una acción lanzada desde ella (un CTA que navega) la reproyecta: mismo aspecto
  assert.equal(welcomeLookOf(key, first, () => 0), first)
  // otra welcome, o volver a entrar tras otra pantalla (no había welcome pintada): rota
  assert.equal(welcomeLookOf('otra.Welcome', first, () => 0).theme, 'dark-ocean')
  assert.equal(welcomeLookOf(key, null, () => 0.99).theme, 'dark-teal')
})

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

// 24 bis) NOT FOUND: la ruta nombra un registro que no existe (una reserva borrada). El server ya
// no contesta un toast de error sobre una página vacía sino un componente NotFound (capturado de
// mvc-app1: /hotel/stays/FO-X6JB7F, cuyo view(id) lanza NoSuchElementException). Se proyecta al
// oj-sp-empty-state a página completa: el mensaje de la excepción de titular y la vuelta al padre
// como su navigationAction.
test('not found: notFoundOf proyecta titular, texto y vuelta atrás del componente NotFound', () => {
  const reg = reduceContexts(empty(), fx('load-not-found'))
  const tree = reg.contexts[HOST_ID].tree
  const page = notFoundOf(tree, 'en-US')
  assert.equal(page.title, 'Stay FO-X6JB7F not found')
  assert.equal(page.message, 'It may have been deleted, or the link is wrong.')
  assert.equal(page.backRoute, '/hotel/stays')
  assert.deepEqual(page.navigationAction, { label: 'Go back', display: 'on' })
  // no es un error: ni toast ni contenido de host que pintar además
  assert.equal(reg.effects.toasts.length, 0)
  // cualquier otra pantalla no es un not-found
  assert.equal(notFoundOf(reduceContexts(empty(), fx('load-form')).contexts[HOST_ID].tree, 'en'), null)
})

test('not found: sin textos del server, los genéricos en el idioma de la página; sin ruta, sin vuelta', () => {
  const tree = { type: 'ClientSide', metadata: { type: 'NotFound' }, children: [] }
  const es = notFoundOf(tree, 'es-ES')
  assert.equal(es.title, 'No encontrado')
  assert.match(es.message, /borrado/)
  assert.equal(es.navigationAction, null)
  assert.equal(notFoundOf(tree, 'en').title, 'Not found')
  const back = notFoundOf({ type: 'ClientSide', metadata: { type: 'NotFound', backRoute: '/reservas' } }, 'es')
  assert.deepEqual(back.navigationAction, { label: 'Volver', display: 'on' })
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

atest('busy: la búsqueda de un lookup no enciende la barra de ocupado de la página; una acción sí', async () => {
  connectivity.reset()
  const events = []
  setTransportHooks({
    onStart: (e) => events.push(['start', e.actionId]),
    onSettle: (e) => events.push(['settle', e.actionId]),
  })
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ fragments: [] }) })
  try {
    await fetchWithPolicy('http://x/', {}, { actionId: 'search-pmsHotelCode' })
    await fetchWithPolicy('http://x/', {}, { actionId: 'code-hotel' })
    await fetchWithPolicy('http://x/', {}, { actionId: '__restfetch__' })
    assert.deepEqual(events, [], 'el combo ya enseña su propia carga')
    await fetchWithPolicy('http://x/', {}, { actionId: 'save' })
    assert.deepEqual(events, [['start', 'save'], ['settle', 'save']])
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

atest('expandRemoteMenus con HAMBURGER_SECTIONS: un pod montado arriba es UNA sección', async () => {
  // con MENU_ON_TOP sus dos pantallas se pegan en el primer nivel; como secciones, cada una
  // sería una sección sin segundo nivel
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => remoteApp([
    { label: 'Page', route: '/remote/page' }, { label: 'Things', route: '/remote/things' },
  ], '/remote') })
  try {
    const mount = () => [{ remote: true, baseUrl: '/_remote', route: '', path: '/remote', label: 'Remote', shellLabel: true }]
    const sections = await expandRemoteMenus(mount(), { sections: true })
    assert.deepEqual(sections.map((o) => o.label), ['Remote'])
    assert.deepEqual(sections[0].submenus.map((o) => o.label), ['Page', 'Things'])
    const flat = await expandRemoteMenus(mount())
    assert.deepEqual(flat.map((o) => o.label), ['Page', 'Things'])
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

atest('un deep-link bajo un GRUPO de un pod que no es ninguna de sus hojas va a ese pod', async () => {
  // /tasksgrp/task/<id> —la página de una tarea— no está en el menú: sus hojas son /tasksgrp/tasks y
  // /tasksgrp/executions, y el grupo que las contiene es /tasksgrp. Sin registrar el grupo salía al
  // backend de la shell, que contestaba "Not found.". La shell (servidor) ya lo reclama así.
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => remoteApp([{ label: 'Forms', route: '/tasksgrp', submenus: [
      { label: 'Executions', route: '/tasksgrp/executions' },
      { label: 'Tasks', route: '/tasksgrp/tasks' },
    ] }], '', 'TasksGrpHome'),
  })
  try {
    await expandRemoteMenus([{ remote: true, baseUrl: '/_tasksgrp-admin', route: '', path: '/tasksgrpAdmin', label: 'Forms' }])
    const where = remoteRouteOf('/tasksgrp/task/977984b8')
    assert.ok(where, 'el deep-link bajo el grupo no quedó registrado')
    assert.equal(where.baseUrl, '/_tasksgrp-admin')
    assert.equal(where.serverSideType, 'TasksGrpHome')
    assert.ok(remoteRouteOf('tasksgrp/task/977984b8'), 'también sin la barra inicial, como la ve el nav')
    // la hoja sigue ganándole al grupo, y lo que no cuelga del grupo no es del pod
    assert.equal(remoteRouteOf('/tasksgrp/tasks').baseUrl, '/_tasksgrp-admin')
    assert.equal(remoteRouteOf('/tasksgrpx/task/1'), undefined)
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
    // la caída se queda, deshabilitada y diciendo por qué — igual que en el renderer web
    assert.equal(menu[1].unavailable, true)
    assert.equal(menu[1].disabled, true)
    assert.match(menu[1].description, /Forms/)
    const nav = shellNavOf({ shell: { menu, variant: 'MENU_ON_TOP' } })
    assert.equal(nav.menuTree[1].disabled, true)
    assert.match(nav.menuTree[1].hint, /Forms/)
    assert.equal(nav.items[1].disabled, true)
    assert.equal(nav.menuTree[0].disabled, false)
  } finally { globalThis.fetch = original }
})

atest('un pod caído no dice nada de la conexión: no hay banda de "sin conexión" por él', async () => {
  const original = globalThis.fetch
  connectivity.reset()
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  try {
    const menu = await expandRemoteMenus([{ remote: true, baseUrl: 'http://localhost:8099/offline', route: '', path: '/offline', label: 'Offline' }])
    assert.equal(menu[0].unavailable, true)
    assert.equal(connectivity.isOnline(), true, 'un pod que no contesta marcaba toda la app sin conexión')
  } finally { globalThis.fetch = original; connectivity.reset() }
})

atest('el rótulo que la shell declaró manda sobre el del pod', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async (url) => ({ ok: true, json: async () => String(url).indexOf('/_booking') === 0
    ? remoteApp([{ label: 'Booking', route: '/booking', submenus: [{ label: 'Bookings', route: '/booking/bookings' }] }], '')
    : remoteApp([{ label: 'Reservas', route: '/erp', submenus: [{ label: 'Partners', route: '/erp/partners' }] }], '') })
  try {
    const menu = await expandRemoteMenus([
      { remote: true, baseUrl: '/_booking', route: '', path: '/booking', label: 'Call center', shellLabel: true },
      { remote: true, baseUrl: '/_erp', route: '', path: '/erp', label: 'Erp', shellLabel: false },
    ])
    // declarado: manda la shell; sin declarar (el nombre del campo): manda el pod, como siempre
    assert.deepEqual(menu.map((o) => o.label), ['Call center', 'Reservas'])
    assert.deepEqual(menu[0].submenus.map((o) => o.label), ['Bookings'])
  } finally { globalThis.fetch = original }
})

test('migas en frío: una sección remota sin contestar da la sección, por su prefijo', () => {
  const menu = [
    { label: 'Admin', route: '/admin', submenus: [
      { remote: true, baseUrl: '/_forms', route: '', path: '/admin/forms', routePrefix: '/forms', label: 'Forms' },
    ] },
    { label: 'Notices', route: '/notices', submenus: [] },
    { remote: true, baseUrl: '/_notices', route: '', path: '/notices', label: 'Avisos' },
  ]
  // el path del grupo es /admin/forms; las pantallas del pod viven bajo /forms
  assert.deepEqual(autoTrail(menu, '/forms/tasks', { title: 'Tareas' }), [{ text: 'Admin' }, { text: 'Forms' }, { text: 'Tareas' }])
  // una entrada de verdad gana al prefijo de una sección de la misma longitud
  assert.deepEqual(autoTrail(menu, '/notices/7', { title: 'Aviso 7' }), [{ text: 'Notices', route: '/notices' }, { text: 'Aviso 7' }])
  assert.deepEqual(autoTrail(menu, '/otra', { title: 'x' }), [])
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
    // sigue en el árbol, oculta: no se pinta, pero una página bajo ella tiene sus migas
    assert.deepEqual(menu.filter((o) => o.visible !== false).map((o) => o.label), ['Bookings'])
    assert.deepEqual(shellNavOf({ shell: { menu, variant: 'MENU_ON_TOP' } }).items.map((i) => i.label), ['Bookings'])
    assert.deepEqual(autoTrail(menu, '/inbox/pending/n-7', { title: 'n-7' }), [
      { text: 'Pending', route: '/inbox/pending' }, { text: 'n-7' },
    ])
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
    assert.deepEqual(menu.filter((o) => o.visible !== false).map((o) => o.label), ['Local'])
    // el marcador se queda, oculto: la sección se conoce por su prefijo
    assert.deepEqual(autoTrail(menu, '/inbox/tasks', { title: 'Tareas' }), [{ text: 'Inbox' }, { text: 'Tareas' }])
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

test('mediatorBaseOf: un detalle abierto por enlace directo pega su Edit a lo consumido, no a su ruta', () => {
  // wire real (rw.ec1, booking QN29HB pegado en la barra): la carga va con route
  // /booking/bookings/QN29HB y consumedRoute /booking/bookings; el Edit contesta _route
  // /QN29HB/edit. Pegado a la ruta daba /booking/bookings/QN29HB/QN29HB/edit.
  const deepLinked = { route: '/booking/bookings/QN29HB', consumedRoute: '/booking/bookings' }
  assert.equal(mediatorBaseOf(deepLinked), '/booking/bookings')
  const stateOnly = { fragments: [{ component: null, state: { _route: '/QN29HB/edit' } }] }
  assert.equal(routeFlipOf({}, { state: { _route: '/QN29HB/edit' }, outbound: deepLinked }, stateOnly),
    '/booking/bookings/QN29HB/edit')
  // desde el listado ya coincidían
  assert.equal(mediatorBaseOf({ route: '/booking/bookings', consumedRoute: '/booking/bookings' }), '/booking/bookings')
  // sin consumedRoute (mediador embebido) se queda la ruta, con su query
  assert.equal(mediatorBaseOf({ route: '/pax?_embeddedMediator=1' }), '/pax?_embeddedMediator=1')
  // una ruta 'null' no se pega nunca
  assert.equal(mediatorBaseOf({ route: 'null' }, ''), '')
  assert.equal(mediatorBaseOf({ route: 'null', consumedRoute: '/integrations' }, '/integrations/7'), '/integrations')
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
    // lo que no cuelga de una ruta registrada NO se adopta (un prefijo no es un "empieza por").
    // /workflow/processesXX ya no sirve de ejemplo: cuelga del GRUPO /workflow que otro test le
    // registró al mismo pod, y bajo un grupo del pod, es del pod
    assert.equal(remoteRouteOf('/workflowXX/processes'), undefined)
    assert.equal(remoteRouteOf('/workflow/processes').baseUrl, '/_workflow')
    assert.equal(remoteRouteOf('/otra/cosa'), undefined)
  } finally { globalThis.fetch = original }
})

atest('una hoja LOCAL bajo un grupo se navega por su ruta compuesta (como Vaadin)', async () => {
  // El contrapunto del test anterior: sin baseUrl no hay pod. La ruta compuesta (/gestion/person)
  // resuelve con el serverSideType del app — loadMenuRouteInto lo añade, y cae a la terminal si
  // el servidor no la reconoce (un RouteLink de grupo); ver test-pms.mjs.
  const nav = shellNavOf({ shell: { menu: [
    { label: 'Gestion', route: '/gestion', submenus: [{ label: 'Person', route: '/gestion/person' }] },
  ] } })
  assert.deepEqual(nav.menuTree[0].children.map((c) => c.id), ['/gestion/person'])
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

atest('fetchWithPolicy: dos 401 a la vez comparten UN refresco, y los dos salen con el token nuevo', async () => {
  // La pestaña vuelve del fondo: el badge del inbox y la sincronización del banner salen con el
  // token caducado y vuelven 401 juntos. Un solo refresco forzado, no uno por petición.
  connectivity.reset()
  const sent = []
  let token = 'caducado'
  let refreshes = 0
  const pending = []
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? token : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault()
    refreshes++
    // el refresco tarda: el segundo 401 llega con éste aún en marcha
    pending.push(() => { token = 'nuevo'; e.detail.retry() })
  })
  let rejected = 0
  globalThis.fetch = async (url, init) => {
    sent.push(`${url} ${init.headers.Authorization}`)
    if (init.headers.Authorization === 'Bearer nuevo') return { ok: true, json: async () => ({}) }
    rejected++
    if (rejected === 2) setTimeout(() => pending.forEach((f) => f()), 5)
    return { ok: false, status: 401, text: async () => '' }
  }
  try {
    await Promise.all([
      fetchWithPolicy('https://x/badge', {}, { actionId: 'search', quiet: true }),
      fetchWithPolicy('https://x/sync', {}, { actionId: 'search', quiet: true }),
    ])
    assert.equal(refreshes, 1)
    assert.deepEqual(sent.filter((s) => s.endsWith('Bearer nuevo')).sort(),
      ['https://x/badge Bearer nuevo', 'https://x/sync Bearer nuevo'])
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy: un 401 de una petición que salió ANTES del refresco se reenvía sin forzar otro', async () => {
  // El visibilitychange ya dejó el token nuevo mientras la petición volaba con el viejo: basta
  // con reenviar, sin tirar el token recién emitido pidiendo otro.
  connectivity.reset()
  const sent = []
  let token = 'caducado'
  let refreshes = 0
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? token : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault(); refreshes++; e.detail.retry()
  })
  globalThis.fetch = async (url, init) => {
    sent.push(init.headers.Authorization)
    if (init.headers.Authorization === 'Bearer caducado') {
      token = 'nuevo' // el refresco del bootstrap aterriza con la petición en vuelo
      return { ok: false, status: 401, text: async () => '' }
    }
    return { ok: true, json: async () => ({}) }
  }
  try {
    await fetchWithPolicy('https://x/', {}, { actionId: 'save' })
    assert.deepEqual(sent, ['Bearer caducado', 'Bearer nuevo'])
    assert.equal(refreshes, 0)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy: si el refresco falla, el 401 acaba en "sesión no válida" sin reenviar', async () => {
  connectivity.reset()
  let calls = 0
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? 'caducado' : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault()
    setTimeout(() => e.detail.giveUp(), 1) // keycloak.updateToken(-1) rechazado
  })
  globalThis.fetch = async () => { calls++; return { ok: false, status: 401, text: async () => '' } }
  try {
    await assert.rejects(() => fetchWithPolicy('https://x/', {}, { actionId: 'save' }),
      (e) => e.failure && e.failure.kind === 'unauthorized' && /sesión ya no es válida/.test(e.failure.message))
    assert.equal(calls, 1)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy: un 403 no refresca la sesión ni dice que haya caducado', async () => {
  // Un 403 es una negativa de verdad (p. ej. una acción que la vista no declara): ni se pide
  // reautenticar ni se manda al usuario a un login que no lo arregla.
  connectivity.reset()
  let calls = 0
  let raised = 0
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? 'vigente' : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault(); raised++; e.detail.retry()
  })
  globalThis.fetch = async () => { calls++; return { ok: false, status: 403, text: async () => '' } }
  try {
    await assert.rejects(() => fetchWithPolicy('https://x/', {}, { actionId: 'activate' }),
      (e) => e.failure && e.failure.kind === 'forbidden' && !/sesión/.test(e.failure.message))
    assert.equal(calls, 1)
    assert.equal(raised, 0)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
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

atest('smart filters: el desplegable del buscador ofrece un filtro por fila, sin los aplicados y filtrado por texto', async () => {
  const rows = smartFilterDropdownRowsOf(BOOKING_FILTERS)
  assert.equal(rows.length, BOOKING_FILTERS.length)
  // cada fila, un chip complejo (sin valor) de su filtro, con el icono de «sugerencia»
  assert.deepEqual(rows[0].chips.map((c) => c.filter), [rows[0].id])
  assert.equal(rows[0].category, 'suggestion')
  // un rango lleva las claves de su valor: sin ellas el editor del popup sale vacío
  const range = rows.filter((r) => r.chips[0].value && 'gte' in r.chips[0].value)[0]
  assert.ok(range, 'hay un filtro de rango')
  const dp = suggestionsProviderOf(rows)
  const criterion = { op: '$and', criteria: [{ op: '$ne', value: { filters: [{ filter: 'vista' }] } }, { text: '' }] }
  const it = dp.fetchFirst({ filterCriterion: criterion })[Symbol.asyncIterator]()
  const first = await it.next()
  // un bloque con datos y después el final vacío, como un ArrayDataProvider
  assert.equal(first.done, false)
  const last = await it.next()
  assert.equal(last.done, true)
  assert.deepEqual(last.value.data, [])
  assert.equal(first.value.data.some((r) => r.id === 'vista'), false)
  assert.equal(first.value.data.length, rows.length - 1)
  assert.deepEqual(first.value.metadata.map((m) => m.key), first.value.data.map((r) => r.id))
  assert.deepEqual(dropdownRowsFor(rows, { text: 'arr' }).map((r) => r.id), ['arrival'])
  const page = await dp.fetchByOffset({ offset: 0, size: 2, filterCriterion: { text: '' } })
  assert.equal(page.results.length, 2)
  const byKeys = await dp.fetchByKeys({ keys: new Set(['status']) })
  assert.equal(byKeys.results.get('status').data.chips[0].label, 'Status')
  // el total depende del texto tecleado: desconocido (con el de todas, la lista repetía filas)
  assert.equal(await dp.getTotalSize(), -1)
})

atest('smart filters: la config completa lleva sugerencias y metadata; sin filtros, sólo el buscador', async () => {
  setMetadataProviderFactory(async (data) => ({ provided: data }))
  try {
    const config = await smartFiltersOf(BOOKING_FILTERS, { vista: 'IN_HOUSE' }, '')
    assert.equal(config.value.length, 1)
    // los filtros sin aplicar van en el DESPLEGABLE del buscador, no como botones bajo la caja
    assert.equal(typeof config.suggestions.fetchFirst, 'function')
    assert.equal(config.suggestionFilters, undefined)
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

test('chat: botón en la cabecera y drawer a la izquierda — Ask Oracle ya no lleva el chat dentro', () => {
  const shell = webApp('pages/shell-page.html')
  const dialog = shell.match(/<oj-dialog id="mateuAskOracle"[\s\S]*?<\/oj-dialog>/)[0]
  assert.equal(/mateuChatInput|mateuChatMode|chatShowChat/.test(dialog), false, 'la paleta es sólo el buscador')
  // ya no hay FAB del chat: el que queda en la esquina es sólo el de Ask Oracle
  assert.equal(/mateuChatFab|mateu-chat-fab/.test(shell), false, 'sin FAB del chat')
  assert.equal(/mateu-chat-fab/.test(webApp('resources/css/app.css')), false)
  // el botón: en las acciones de la cabecera global (slot end), antes de los widgets del App,
  // sólo si la app declara el chat; su icono Redwood y su etiqueta (display=icons → aria-label +
  // tooltip), y marcado mientras el panel está abierto
  const header = shell.match(/<oj-sp-global-header[\s\S]*?<\/oj-sp-global-header>/)[0]
  const end = header.match(/<div slot="end"[\s\S]*?<!-- ÁREA DE PERFIL/)[0]
  const toggle = end.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatSseUrl \]\]">\s*<oj-button id="mateuChatToggle"[\s\S]*?<\/oj-button>/)
  assert.ok(toggle, 'el botón del chat está en la zona de acciones, sólo con sseUrl')
  assert.ok(end.indexOf('id="mateuChatToggle"') < end.indexOf('mateu-header-widgets'), 'antes de los widgets')
  assert.match(toggle[0], /display="icons"/)
  assert.match(toggle[0], /chroming="borderless"/)
  assert.match(toggle[0], /oj-ux-ico-chat/)
  assert.match(toggle[0], /aria-controls="mateuChatPanel"/)
  assert.match(toggle[0], /<span slot="startIcon" class="oj-ux-ico-chat"><\/span>\s*Chat\s*<\/oj-button>/)
  assert.match(toggle[0], /mateuChatOpen \? ' mateu-chat-open' : ''/)
  assert.match(toggle[0], /\$listeners\.chatToggle/)
  assert.match(webApp('resources/css/app.css'), /oj-button\.mateu-chat-toggle\.mateu-chat-open \.oj-button-button \{/)
  const chain = webApp('pages/shell-page-chains/toggleMateuChat.js')
  assert.match(chain, /#mateuChatToggle button/, 'al cerrar, el foco vuelve al botón')
  assert.match(chain, /setAttribute\('aria-expanded', open \? 'true' : 'false'\)/)
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
  // el envío conserva streaming + agente por ruta y presenta el token, leído en CADA envío y
  // recuperando un 401 como el resto del tráfico
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /currentRoute: \$application\.variables\.mateuSelectedRoute/)
  assert.match(send, /headers: \(\) => bridge\.authHeadersOf\(\)/)
  assert.match(send, /reauthenticate: bridge\.askForReauthentication/)
  assert.match(send, /onText:/)
})

test('chat: la respuesta del asistente se pinta como markdown, con el HTML escapado', () => {
  const md = (t) => chatMarkdownToHtml(t)
  assert.equal(md('Hay **2** integraciones y una *pausada*.'), '<p>Hay <strong>2</strong> integraciones y una <em>pausada</em>.</p>')
  assert.equal(md('- **MRU01**: ACTIVE\n- PMI01: `PENDING`'),
    '<ul><li><strong>MRU01</strong>: ACTIVE</li><li>PMI01: <code>PENDING</code></li></ul>')
  assert.equal(md('1. uno\n2. dos'), '<ol><li>uno</li><li>dos</li></ol>')
  assert.equal(md('- a\n  - a1\n- b'), '<ul><li>a<ul><li>a1</li></ul></li><li>b</li></ul>')
  assert.equal(md('## Estado'), '<h4>Estado</h4>')
  assert.equal(md('línea 1\nlínea 2'), '<p>línea 1<br>línea 2</p>')
  assert.equal(md('| Hotel | Estado |\n|---|---|\n| MRU01 | ACTIVE |'),
    '<table><thead><tr><th>Hotel</th><th>Estado</th></tr></thead><tbody><tr><td>MRU01</td><td>ACTIVE</td></tr></tbody></table>')
  // el código, tal cual y escapado; sin cerrar (el stream a medias) llega hasta el final
  assert.equal(md('```\n<b>x</b>\n```'), '<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>')
  assert.equal(md('```\nmedio'), '<pre><code>medio</code></pre>')
  // a medias, un ** sin pareja es texto
  assert.equal(md('Hay **2'), '<p>Hay **2</p>')
  // seguridad: el HTML del texto sale como texto, y solo hay enlaces http(s), en otra pestaña
  assert.equal(md('<script>alert(1)</script><img src=x onerror=alert(1)>'),
    '<p>&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;</p>')
  assert.equal(md('[x](javascript:alert(1))'), '<p>[x](javascript:alert(1))</p>')
  assert.equal(md('[doc](https://a.b/c?d=1&e="2")'),
    '<p><a href="https://a.b/c?d=1&amp;e=&quot;2&quot;" target="_blank" rel="noopener noreferrer">doc</a></p>')
  assert.equal(md(''), '')
  assert.equal(md(null), '')
  // la burbuja del asistente lo pinta con oj-bind-dom (la de la persona, texto tal cual)
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /<oj-bind-dom config="\[\[ \$functions\.chatMessageDom\(\$current\.data\.text\) \]\]"><\/oj-bind-dom>/)
  assert.match(shell, /<span class="mateu-chat-user-text"><oj-bind-text value="\[\[ \$current\.data\.text \]\]"><\/oj-bind-text><\/span>/)
  assert.match(webApp('pages/shell-page.js'), /bridge\.chatMarkdownToHtml\(text\)/)
  assert.equal(JSON.parse(webApp('pages/shell-page.json')).imports.components['oj-bind-dom'].path, 'ojs/ojbinddom')
  assert.match(webApp('resources/js/mateu-bridge.js'), /chatMarkdownToHtml,/)
})

test('chat: el panel dice que el asistente trabaja, cuenta los tokens y deja dictar — con JET', () => {
  const shell = webApp('pages/shell-page.html')
  const panel = shell.match(/<div slot="start" id="mateuChatPanel"[\s\S]*?<!-- Navigator PERSISTENTE/)[0]
  // la respuesta vacía no se pinta; la fila de estado, con el progress circle de JET, sí
  assert.match(panel, /<oj-bind-if test="\[\[ \$current\.data\.role === 'user' \|\| !!\$current\.data\.text \]\]">/)
  const status = panel.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatStatus \]\]">[\s\S]*?<\/oj-bind-if>/)[0]
  assert.match(status, /<oj-progress-circle size="sm" value="-1"/)
  assert.match(status, /role="status"/)
  // tokens: badges de JET, sólo cuando hay alguno
  const tokens = panel.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatTokens \]\]">[\s\S]*?id="mateuChatTokens"/)
  assert.ok(tokens, 'la fila de tokens sale sólo con tokens')
  assert.match(panel, /class="oj-badge oj-badge-subtle[^"]*">entrada/)
  assert.match(panel, /class="oj-badge oj-badge-subtle[^"]*">salida/)
  // micrófono: oj-button de icono Redwood, sólo donde hay reconocimiento de voz, antes del campo
  const mic = panel.match(/<oj-bind-if test="\[\[ \$application\.variables\.mateuChatMicAvailable \]\]">\s*<oj-bind-if test="\[\[ !\$application\.variables\.mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[\s\S]*?<\/oj-button>/)
  assert.ok(mic, 'el botón de dictar depende de mateuChatMicAvailable')
  assert.match(mic[0], /oj-ux-ico-mic-on/)
  assert.match(mic[0], /\$listeners\.chatMic/)
  assert.ok(panel.indexOf('id="mateuChatMic"') < panel.indexOf('id="mateuChatInput"'))
  // cableado: listener, imports, variables y cadenas
  const page = JSON.parse(webApp('pages/shell-page.json'))
  assert.equal(page.eventListeners.chatMic.chains[0].chain, 'chatMic')
  assert.equal(page.imports.components['oj-progress-circle'].path, 'ojs/ojprogress-circle')
  const flow = JSON.parse(webApp('app-flow.json'))
  assert.equal(flow.variables.mateuChatStatus.defaultValue, '')
  assert.equal(flow.variables.mateuChatTokens.defaultValue, null)
  assert.equal(flow.variables.mateuChatMicAvailable.defaultValue, false)
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /bridge\.chatStatusText\(/)
  assert.match(send, /onUsage: \(usage\) => \{ turnUsage = bridge\.mergeTurnUsage\(turnUsage, usage\); \}/)
  // el agente manda el uso de toda la conversación: se sustituye, no se suma
  assert.match(send, /mateuChatTokens = bridge\.latestUsage\(/)
  // la fila de estado lee el progreso que informa el agente
  assert.match(send, /onProgress: \(p\) => \{ progress = p; showStatus\(\); \}/)
  assert.match(send, /bridge\.chatStatusText\(\{[^}]*progress, now: Date\.now\(\)/)
  // y un navigation-requested navega al acabar, si no hay pantalla generada
  assert.match(send, /ev\.event === 'navigation-requested'/)
  assert.match(send, /\} else if \(navigateTo\) \{\s*await Actions\.callChain\(context, \{\s*chain: 'onMateuNavigate'/)
  assert.match(send, /clearInterval\(ticking\)/)
  assert.match(webApp('pages/shell-page-chains/toggleMateuChat.js'), /mateuChatMicAvailable = !!bridge\.speechRecognitionCtor\(window\)/)
  const mc = webApp('pages/shell-page-chains/chatMic.js')
  assert.match(mc, /bridge\.speechRecognitionCtor\(window\)/)
  assert.match(mc, /bridge\.transcriptOf\(event\)/)
  assert.match(mc, /#mateuChatSend/)
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

atest('chat: streamChat lee por EVENTO: un texto por evento es una línea, y bufferea a través de trozos', async () => {
  const texts = []
  const out = await streamChat({
    url: '/sse', body: { message: 'hola' },
    // el 2º evento llega partido en trozos → se bufferea hasta la línea en blanco que lo cierra
    fetchImpl: async () => sseResponse(['data: uno\n\n', 'data: d', 'os\n', '\n']),
    onText: (t) => texts.push(t),
  })
  assert.equal(out, 'uno\ndos', 'sin trozos, cada texto es una línea: el contrato línea a línea de siempre')
  assert.deepEqual(texts, ['uno', 'uno\ndos'])
})

atest('chat: streamChat conserva las líneas del markdown (una por evento, las vacías incluidas, y la sangría)', async () => {
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data: ## Estado\n\ndata: \n\ndata: - **MRU01**\n\n', 'data: - PMI01\n\ndata:   - anidado\n\n']),
  })
  assert.equal(out, '## Estado\n\n- **MRU01**\n- PMI01\n  - anidado')
})

atest('chat: las líneas data: de UN evento se unen con \\n — una respuesta de varias líneas en un evento', async () => {
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data:## Estado\r\ndata:\r\ndata:- **MRU01**\r\n\r\n']),
  })
  assert.equal(out, '## Estado\n\n- **MRU01**')
  assert.equal(chatMarkdownToHtml(out), '<h4>Estado</h4><ul><li><strong>MRU01</strong></li></ul>')
})

atest('chat: los trozos (agent-delta) se añaden y la respuesta entera del final los SUSTITUYE', async () => {
  const texts = []; const deltas = []
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse([
      'data:{"inputTokens":0,"outputTokens":0,"totalTokens":0}\n\n',
      'data:{"event":"agent-delta","detail":{"text":"Te "}}\n\n',
      'data:{"event":"agent-delta","detail":{"text":"llevo.\\n"}}\n\n:keep-alive\n\n',
      'data:{"inputTokens":10,"outputTokens":5,"totalTokens":15}\n\n',
      'data:Te llevo ahora.\n\n',
    ]),
    onText: (t) => texts.push(t), onDelta: (piece) => deltas.push(piece),
    onUsage: (u) => texts.push(u),
  })
  assert.deepEqual(deltas, ['Te ', 'llevo.\n'])
  assert.equal(out, 'Te llevo ahora.')
  // el uso todo-cero (marcador de agentes anteriores) no llega; el real sí
  assert.deepEqual(texts, ['Te ', 'Te llevo.\n', { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, 'Te llevo ahora.'])
})

atest('chat: el progreso del agente (fases y herramientas) llega a onProgress y a la fila de estado', async () => {
  let clock = 0
  const lines = []
  await streamChat({
    url: '/sse', body: {}, now: () => clock,
    fetchImpl: async () => sseResponse([
      'data:{"event":"agent-status","detail":{"phase":"connecting","text":"Conectando con 2 servidores MCP…"}}\n\n',
      'data:{"event":"agent-tool","detail":{"name":"booking_findBookings","server":"booking","kind":"mcp","phase":"start"}}\n\n',
      'data:{"event":"agent-tool","detail":{"name":"booking_findBookings","server":"booking","kind":"mcp","phase":"end","ms":3100,"error":"timeout"}}\n\n',
      'data:{"event":"agent-delta","detail":{"text":"No he podido."}}\n\n',
    ]),
    onProgress: (p) => {
      clock += 3000
      lines.push(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 0, progress: p, now: clock }))
      if (p.steps.length && !p.runningTool()) assert.deepEqual(p.steps, [{ name: 'booking_findBookings', server: 'booking', kind: 'mcp', ms: 3100, error: 'timeout', running: false }])
    },
  })
  assert.deepEqual(lines, ['Conectando con 2 servidores MCP… 3 s', 'Llamando a booking_findBookings… 3 s', 'Conectando con 2 servidores MCP… 3 s', 'Respondiendo…'])
})

atest('chat: streamChat despacha eventos personalizados y captura uso de tokens', async () => {
  const events = []; let usage = null
  await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data: {"event":"navigate","detail":{"route":"/x"}}\n\n', 'data: {"totalTokens":9}\n\n']),
    onEvent: (e) => events.push(e), onUsage: (u) => { usage = u },
  })
  assert.deepEqual(events, [{ event: 'navigate', detail: { route: '/x' } }])
  assert.deepEqual(usage, { totalTokens: 9 })
})

atest('chat: agent-error se muestra como el texto del asistente, no como evento', async () => {
  let text = ''; const events = []
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse(['data: {"event":"agent-error","detail":{"message":"boom"}}\n\n']),
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

// El chat no pasa por fetchWithPolicy, y un 401 lo dejaba en "Servidor respondió 401" mientras las
// pantallas reautenticaban y seguían: en ec1 salió sin token porque en ese instante localStorage no
// tenía ninguno. Ahora se recupera igual: reautenticar y reenviar UNA vez, con el token de ENTONCES.
atest('chat: streamChat ante un 401 pide reautenticar y reenvía una vez con el token nuevo', async () => {
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  let token = null
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? token : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault()
    token = 'nuevo'
    e.detail.retry()
  })
  const sent = []
  try {
    const out = await streamChat({
      url: '/sse', body: { message: 'hola' },
      headers: () => authHeadersOf(),
      reauthenticate: askForReauthentication,
      fetchImpl: async (url, init) => {
        sent.push(init.headers.Authorization)
        return init.headers.Authorization === 'Bearer nuevo'
          ? sseResponse(['data: hola\n\n'])
          : { ok: false, status: 401, text: async () => '' }
      },
    })
    assert.deepEqual(sent, [undefined, 'Bearer nuevo'], 'el reenvío lleva el token nuevo, el primero no llevaba')
    assert.equal(out, 'hola')
  } finally {
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
  }
})

atest('chat: streamChat ante un 401 sin nadie que reautentique falla como siempre, sin reenviar', async () => {
  const originalDocument = globalThis.document
  globalThis.document = new EventTarget()
  let calls = 0
  try {
    await assert.rejects(streamChat({
      url: '/sse', body: {}, reauthenticate: askForReauthentication,
      fetchImpl: async () => { calls++; return { ok: false, status: 401, text: async () => '' } },
    }), /Servidor respondió 401/)
    assert.equal(calls, 1)
  } finally {
    globalThis.document = originalDocument
  }
})

atest('chat: streamChat reenvía UNA sola vez: un segundo 401 falla, sin bucle', async () => {
  let calls = 0
  await assert.rejects(streamChat({
    url: '/sse', body: {}, reauthenticate: async () => true,
    fetchImpl: async () => { calls++; return { ok: false, status: 401, text: async () => '' } },
  }), /Servidor respondió 401/)
  assert.equal(calls, 2)
})

// ── @Notice: un campo a null o en blanco oculta el aviso (paridad con el web) ─────
test('notice: a null el aviso no se pinta; con valor, sí', () => {
  const noticesWith = (state) => {
    const inc = {
      commands: [], messages: [], banners: [],
      fragments: [{
        targetComponentId: '', action: 'Replace', state, data: {},
        component: {
          type: 'ServerSide', metadata: null,
          children: [{
            type: 'ClientSide', metadata: { type: 'Page', title: '' },
            children: [
              { type: 'ClientSide', metadata: { type: 'Notice', text: '${state.quejas}', theme: 'warning' }, children: [] },
            ],
          }],
        },
      }],
    }
    const reg = reduceContexts(empty(), inc)
    return (hostContentOf(reg.contexts[HOST_ID], null, { title: '' }) || []).flatMap((b) => b.items).filter((a) => a.isNotice)
  }
  assert.equal(noticesWith({ quejas: null }).length, 0)
  assert.equal(noticesWith({ quejas: '  ' }).length, 0)
  assert.equal(noticesWith({}).length, 0)
  const [shown] = noticesWith({ quejas: '2 quejas pendientes' })
  assert.equal(shown.text, '2 quejas pendientes')
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
  // una habitación recién añadida (sin línea ni total: los pone el servidor) dice «—» en esas
  // celdas, no un hueco
  const withNew = { ...host, state: { ...host.state, rooms: [{ line: null, roomTypeCode: 'DBL', adults: 2, total: null }] } }
  const fresh = (islandContentOf(withNew) || []).flatMap((b) => b.items).find((a) => a.isGrid && a.fieldId === 'rooms')
  assert.equal(fresh.rows[0].line, '—')
  assert.equal(fresh.rows[0].total, '—')
  assert.equal(fresh.rows[0].roomTypeCode, 'DBL')
  // y el estado que vuelve al servidor no se toca
  assert.equal(withNew.state.rooms[0].line, null)
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
  // la línea (y el total) de una habitación nueva los pone el servidor: un texto «—», no una
  // cajita de número vacía
  assert.ok(byId.line.isEmptyReadonly && !byId.line.isText && !byId.line.isNumber)
  assert.equal(byId.line.value, '—')
  assert.ok(!byId.childrenAges, 'una lista anidada no se edita en el diálogo')
})

test('rowedit: Save valida los obligatorios de la fila en el diálogo; con ellos rellenos, pasa', () => {
  const reg = reduceContexts(wizardAtRooms(), wizardAddInc())
  const row = reg.contexts['rooms-container']
  assert.ok(ROW_VALIDATING_VERBS.create && ROW_VALIDATING_VERBS.save && !ROW_VALIDATING_VERBS.cancel)
  const errors = validateRow(row, {})
  assert.deepEqual(Object.keys(errors).sort((a, b) => a.localeCompare(b)), ['boardCode', 'ratePlanCode', 'roomTypeCode'])
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

// ── FAB de "ask" del shell: neutro (Search con la lupa), o la marca del @App(askLabel, askIcon) ──
const brandedApp = (askLabel, askIcon) => {
  const increment = fx('app')
  for (const fr of increment.fragments) {
    if (fr.component?.metadata?.type === 'App') Object.assign(fr.component.metadata, { askLabel, askIcon })
  }
  return reduceContexts(empty(), increment).shell
}

test('ask FAB: sin @App(askLabel/askIcon) es neutro — Search con la lupa —, ni la marca de Oracle ni el bocadillo', () => {
  const shell = reduceContexts(empty(), fx('app')).shell
  assert.equal(shell.askLabel, '')
  assert.equal(shell.askIcon, '')
  assert.deepEqual(askFabOf(shell, 'http://b'), { label: 'Search', kind: 'glyph', glyph: 'oj-ux-ico-search' })
  assert.equal(ASK_FAB_GLYPH, 'oj-ux-ico-search')
  assert.notEqual(ASK_FAB_GLYPH, SHELL_CHAT_GLYPH)
  // ni el App del shell: un registro sin shell tampoco rompe
  assert.equal(askFabOf(null).label, 'Search')
})

test('ask FAB: @App(askLabel="Ask RIU", askIcon="R") → la inicial, con el rótulo del App', () => {
  const shell = brandedApp('Ask RIU', 'R')
  assert.equal(shell.askLabel, 'Ask RIU')
  assert.deepEqual(askFabOf(shell, 'http://b'), { label: 'Ask RIU', kind: 'initial', text: 'R' })
  assert.deepEqual(askFabOf({ askIcon: 'ri' }), { label: 'Search', kind: 'initial', text: 'RI' })
})

test('ask FAB: askIcon imagen (relativa al backend como el logo, o absoluta) e iconos', () => {
  assert.deepEqual(askFabOf(brandedApp('Ask RIU', '/images/riu.svg'), 'http://b'),
    { label: 'Ask RIU', kind: 'image', src: 'http://b/images/riu.svg' })
  assert.equal(askFabOf({ askIcon: 'https://cdn.x/riu.png' }, 'http://b').src, 'https://cdn.x/riu.png')
  assert.equal(askFabOf({ askIcon: 'data:image/svg+xml;base64,AAA' }, 'http://b').src, 'data:image/svg+xml;base64,AAA')
  assert.deepEqual(askFabOf({ askIcon: 'oj-ux-ico-oracle-o' }), { label: 'Search', kind: 'glyph', glyph: 'oj-ux-ico-oracle-o' })
  assert.equal(askFabOf({ askIcon: 'vaadin:cog' }).glyph, 'oj-ux-ico-settings')
  // lo que no es nada de eso no deja el FAB vacío: vuelve a la lupa
  assert.equal(askFabOf({ askIcon: 'vaadin:no-existe' }).glyph, ASK_FAB_GLYPH)
  assert.equal(askFabOf({ askIcon: 'RIU Hotels' }).glyph, ASK_FAB_GLYPH)
})

// un DOM mínimo: el <a> del shell con su div role=img
const fakeEl = (tag, classes = []) => {
  const el = {
    tagName: tag, attrs: {}, children: [], listeners: {}, textContent: '', parent: null,
    classList: {
      set: new Set(classes),
      add(...c) { c.forEach((x) => this.set.add(x)) },
      remove(...c) { c.forEach((x) => this.set.delete(x)) },
      contains(c) { return this.set.has(c) },
    },
    setAttribute(k, v) { el.attrs[k] = String(v) },
    getAttribute(k) { return el.attrs[k] },
    addEventListener(t, fn) { (el.listeners[t] = el.listeners[t] || []).push(fn) },
    appendChild(c) { c.parent = el; el.children.push(c); return c },
    remove() { if (el.parent) el.parent.children = el.parent.children.filter((c) => c !== el) },
    querySelector(sel) {
      const cls = sel.replace(/^\./, '')
      const walk = (n) => { for (const c of n.children) { if (c.classList.contains(cls)) return c; const r = walk(c); if (r) return r } return null }
      return walk(el)
    },
    click() { el.clicked = (el.clicked || 0) + 1 },
  }
  Object.defineProperty(el, 'className', { set(v) { el.classList.set = new Set(v.split(/\s+/)) } })
  el.ownerDocument = { createElement: (t) => fakeEl(t) }
  return el
}
const shellFab = () => {
  const fab = fakeEl('a', ['oj-sp-rw-chat-icon-cont'])
  const icon = fab.appendChild(fakeEl('div', ['oj-sp-rw-chat-icon-image', SHELL_CHAT_GLYPH, 'oj-sp-ux-icon-size-11x']))
  icon.ownerDocument = fab.ownerDocument
  return { fab, icon }
}

test('ask FAB: brandAskFab cambia el bocadillo por la lupa y le da nombre y teclado', () => {
  const { fab, icon } = shellFab()
  assert.equal(brandAskFab(fab, askFabOf(null)), true)
  assert.ok(icon.classList.contains('oj-ux-ico-search'))
  assert.ok(!icon.classList.contains(SHELL_CHAT_GLYPH))
  assert.ok(icon.classList.contains('oj-sp-ux-icon-size-11x')) // el tamaño lo sigue poniendo el shell
  assert.equal(fab.attrs.role, 'button')
  assert.equal(fab.attrs.tabindex, '0')
  assert.equal(fab.attrs['aria-label'], 'Search')
  assert.equal(fab.attrs.title, 'Search')
  let prevented = false
  fab.listeners.keydown[0]({ key: 'Enter', preventDefault: () => { prevented = true } })
  assert.ok(prevented && fab.clicked === 1)
  // sin el FAB (el shell aún no lo pintó) no hace nada y lo dice
  assert.equal(brandAskFab(null, askFabOf(null)), false)
  assert.equal(brandAskFab(fakeEl('a'), askFabOf(null)), false)
})

test('ask FAB: brandAskFab con la marca del App (inicial, imagen) — idempotente y reaplicable', () => {
  const { fab, icon } = shellFab()
  brandAskFab(fab, askFabOf({ askLabel: 'Ask RIU', askIcon: 'R' }))
  assert.equal(fab.attrs['aria-label'], 'Ask RIU')
  assert.ok(!icon.classList.contains(SHELL_CHAT_GLYPH) && !icon.classList.contains(ASK_FAB_GLYPH))
  assert.ok(icon.classList.contains('mateu-ask-fab-branded'))
  assert.equal(icon.children.length, 1)
  assert.equal(icon.children[0].textContent, 'R')
  assert.equal(icon.children[0].attrs['aria-hidden'], 'true')
  // otra vez, con una imagen: no se acumulan marcas ni manejadores de teclado
  brandAskFab(fab, askFabOf({ askLabel: 'Ask RIU', askIcon: '/images/riu.svg' }, 'http://b'))
  assert.equal(icon.children.length, 1)
  assert.equal(icon.children[0].tagName, 'img')
  assert.equal(icon.children[0].attrs.src, 'http://b/images/riu.svg')
  assert.equal(fab.listeners.keydown.length, 1)
  // y de vuelta al glifo: sin marca
  brandAskFab(fab, askFabOf(null))
  assert.equal(icon.children.length, 0)
  assert.ok(icon.classList.contains(ASK_FAB_GLYPH) && !icon.classList.contains('mateu-ask-fab-branded'))
})

test('interpolate: ${state.x} y ${state[\'x\']}', () => {
  assert.equal(interpolate("${state['_position']} de ${state.total}", { _position: '2/3', total: 4 }), '2/3 de 4')
  assert.equal(interpolate('${state["a"]}', { a: 'x' }), 'x')
})

// Formularios de PÁGINA (no sólo el editor de fila): el walk-in del front-office de ec-demo1
// (fixture real) — selects con opciones del OptionsSupplier, fechas y tres @Section.
test('page form: el walk-in pinta selects con sus opciones, fechas y sus secciones', () => {
  const reg = reduceContexts(empty(), fx('fo-walkin-form'))
  const summary = summarizeHost(reg, '/walk-in')
  assert.equal(summary.title, 'Walk-in')
  const byId = Object.fromEntries(summary.fields.map((f) => [f.fieldId, f]))
  for (const id of ['habitacion', 'tarifa', 'regimen', 'tipoDocumento']) {
    assert.ok(byId[id].isSelect && !byId[id].isText, id + ' es un select')
  }
  assert.ok(byId.habitacion.options.some((o) => o.value === 'STD-KING' && o.label === 'Estándar con cama king (STD-KING)'))
  assert.equal(byId.habitacion.value, 'STD-KING')
  assert.deepEqual(byId.tipoDocumento.options.map((o) => o.value), ['PASSPORT', 'ID_CARD', 'DRIVING_LICENSE'])
  assert.ok(byId.llegada.isDate && !byId.llegada.isText)
  assert.equal(byId.llegada.value, '2026-09-27')
  assert.ok(byId.salida.isDate)
  assert.ok(byId.adultos.isNumber)
  assert.ok(byId.nombre.isText)
  assert.ok(byId.precio.isText && byId.precio.readonly)
  assert.equal(byId.habitacion.isLookup, false, 'en una página nadie lanza búsquedas de lookup')
  // las secciones, en el orden del wire, con su título y sus columnas
  assert.deepEqual(summary.sections.map((s) => [s.title, s.hasTitle, s.columns]),
    [['Estancia', true, 2], ['Titular', true, 2], ['Precio del CRS', true, 1]])
  assert.deepEqual(summary.sections[0].fields.map((f) => f.fieldId),
    ['llegada', 'salida', 'habitacion', 'tarifa', 'regimen', 'adultos', 'edadesNinos'])
  assert.deepEqual(summary.sections[2].fields.map((f) => f.fieldId), ['precio'])
  // ningún campo se pierde ni se repite al agrupar
  assert.deepEqual(summary.sections.flatMap((s) => s.fields.map((f) => f.fieldId)).sort(),
    summary.fields.map((f) => f.fieldId).sort())
})

test('page form: sin @Section es un único grupo sin título; el drawer también agrupa', () => {
  let reg = reduceContexts(empty(), fx('app'))
  reg = reduceContexts(reg, fx('load-form'))
  const form = summarizeHost(reg, '/person')
  assert.deepEqual(form.sections.map((s) => [s.title, s.hasTitle, s.fields.map((f) => f.fieldId)]),
    [['', false, ['name', 'age']]])
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  reg = reduceContexts(reduceContexts(empty(), content), fx('open-drawer'))
  const overlay = overlayOf(reg)
  assert.deepEqual(overlay.sections.flatMap((s) => s.fields.map((f) => f.fieldId)), ['id', 'name', 'price', 'active'])
  assert.ok(overlay.sections[0].fields.find((f) => f.fieldId === 'active').isBoolean)
})

test('page form: fecha-hora, enum con opciones y lookup remoto sin opciones', () => {
  const field = (fieldId, extra) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId, ...extra } })
  const tree = { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [
    field('at', { dataType: 'dateTime', stereotype: 'regular' }),
    field('status', { dataType: 'string', stereotype: 'radio', options: [{ value: 'OPEN', label: 'Open' }, { value: 'CLOSED' }] }),
    field('hotel', { dataType: 'string', stereotype: 'combobox', remoteCoordinates: { action: 'search-hotel' } }),
    field('vip', { dataType: 'bool', stereotype: 'regular' }),
  ] }] }
  const byId = Object.fromEntries(fieldListOf(tree, { at: '2026-09-27T10:30:00', status: 'OPEN', hotel: { value: 'H1', label: 'Hotel 1' } })
    .map((f) => [f.fieldId, f]))
  assert.ok(byId.at.isDateTime && !byId.at.isDate && !byId.at.isText)
  assert.equal(byId.at.value, '2026-09-27T10:30:00')
  // stereotype radio → un oj-radioset de verdad (antes se degradaba a desplegable)
  assert.ok(byId.status.isRadio && !byId.status.isSelect)
  assert.deepEqual(byId.status.options, [{ value: 'OPEN', label: 'Open' }, { value: 'CLOSED', label: 'CLOSED' }])
  // un lookup remoto con valor es un desplegable con ese valor (y su etiqueta) aunque sus
  // opciones no hayan llegado: un select con un valor fuera de sus opciones se pinta vacío
  assert.ok(byId.hotel.isSelect && byId.hotel.isLookup)
  assert.deepEqual(byId.hotel.options, [{ value: 'H1', label: 'Hotel 1' }])
  assert.equal(byId.hotel.value, 'H1')
  // sin valor ni opciones sigue siendo texto en la página (un select vacío sería peor)
  const empty = fieldListOf(tree, {}).find((f) => f.fieldId === 'hotel')
  assert.ok(empty.isText && !empty.isSelect)
  assert.ok(byId.vip.isBoolean)
  // sin secciones en el árbol: un grupo sin título con todo
  assert.deepEqual(formSectionsOf(tree, {}).map((s) => s.fields.length), [4])
})

test('page form: a todo el ancho, con las columnas del wire o dos por defecto', () => {
  const field = (fieldId, extra) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', stereotype: 'regular', ...extra } })
  // sin FormLayout: dos columnas (como el FormLayout de Vaadin en escritorio)
  const loose = { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [
    field('id'), field('name'), field('description'),
  ] }] }
  const [plain] = formSectionsOf(loose, {})
  assert.equal(plain.wideColumns, 2)
  assert.equal(plain.columns, 1, 'las columnas de siempre siguen ahí para la isla (media columna)')
  // con FormLayout(maxColumns) en la raíz, las suyas
  const declared = { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'FormLayout', maxColumns: 4 }, children: [
    field('a'), field('b'),
  ] }] }
  const [four] = formSectionsOf(declared, {})
  assert.equal(four.wideColumns, 4)
  // el formulario de página y los dos wizards: oj-form-layout a todo el ancho, con wideColumns
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/<oj-form-layout class="oj-formlayout-full-width" max-columns="\[\[ \$current\.data\.wideColumns \]\]"/g) || []).length, 3)
  // y el formulario de página ya no va en media columna (oj-md-6)
  const pageForm = html.slice(html.indexOf('$application.variables.mateuFormMetadata && !$application.variables.mateuWizard'))
  assert.ok(!pageForm.slice(0, 300).includes('oj-md-6'))
})

test('secondaryActionOf: la secundaria del header se resuelve por su actionId (y si no, por rótulo)', () => {
  const toolbar = [
    { actionId: 'seedDemo', label: '＋ 10 reservas demo' },
    { actionId: 'walkIn', label: '＋ Walk-in' },
  ]
  // el header devuelve el id del item que le dimos (mateuListSecondary: {id, value, label})
  assert.equal(secondaryActionOf({ secondaryItem: 'walkIn' }, toolbar).actionId, 'walkIn')
  const items = toolbar.map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }))
  assert.equal(secondaryActionOf({ secondaryItem: items[1] }, toolbar).actionId, 'walkIn')
  // variantes viejas: el rótulo
  assert.equal(secondaryActionOf({ secondaryItem: { label: '＋ Walk-in' } }, toolbar).actionId, 'walkIn')
  assert.equal(secondaryActionOf({ secondaryItem: '＋ 10 reservas demo' }, toolbar).actionId, 'seedDemo')
  // nada que casar
  assert.equal(secondaryActionOf({ secondaryItem: 'nope' }, toolbar), null)
  assert.equal(secondaryActionOf({}, toolbar), null)
  assert.equal(secondaryActionOf(null, null), null)
})

// WIZARD: cada campo UNA vez, y el tren ARRIBA con @WizardProgress(STEPS). El walk-in del front
// office de ec-demo1 (fixture real): antes los FormFields salían dos veces — arriba como átomos
// isInput (texto) del contenido y abajo en el form de secciones, con su desplegable.
test('wizard: el walk-in pinta cada campo una vez, con su widget, y el tren arriba', () => {
  const reg = reduceContexts(empty(), fx('fo-walkin-wizard'))
  const host = reg.contexts[HOST_ID]
  const summary = summarizeHost(reg, '/walk-in')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  // STEPS → horizontal: tren arriba, no el rail del guided process
  assert.equal(view.wizard.horizontal, true)
  assert.deepEqual(view.wizard.trainSteps.map((s) => [s.id, s.disabled, s.visited]),
    [['estancia', false, false], ['precio', true, false], ['titular', true, false], ['confirmar', true, false]])
  assert.equal(view.wizard.currentLabel, 'Estancia')
  assert.deepEqual(view.wizard.listSteps.map((s) => s.marker), ['1', '2', '3', '4'])
  assert.match(view.wizard.listSteps[0].cls, /mateu-wizard-step-current/)
  // el título del wizard (su h2) sube a la cabecera y no se repite en el contenido
  assert.equal(view.title, 'Walk-in')
  const atoms = view.content.flatMap((b) => b.items)
  assert.ok(!atoms.some((a) => a.isText && a.text === 'Walk-in'))
  // ningún campo del form queda además como input de texto en el contenido
  assert.ok(!atoms.some((a) => a.isInput), 'sin inputs duplicados en el contenido')
  assert.ok(!atoms.some((a) => a.isFormLayout), 'ni un form layout con los mismos campos')
  const fields = view.sections.flatMap((sec) => sec.fields)
  assert.deepEqual(fields.map((f) => f.fieldId),
    ['llegada', 'salida', 'habitacion', 'tarifa', 'regimen', 'adultos', 'edadesNinos'])
  assert.ok(fields.find((f) => f.fieldId === 'habitacion').isSelect)
  assert.ok(fields.find((f) => f.fieldId === 'llegada').isDate)
  // el pie Back/Next del wire va a la barra del pie (Back deshabilitado en el primer paso),
  // con los rótulos que manda el servidor
  assert.deepEqual(view.nav.map((b) => [b.actionId, b.label, b.disabled, b.chroming]),
    [['back', 'Back', true, 'outlined'], ['next', 'Next', false, 'callToAction']])
  assert.ok(!atoms.some((a) => a.isButtons && a.buttons.some((b) => b.actionId === 'next')))
})

test('wizard: el check-in (contenido rico) conserva su contenido y sus acciones de página', () => {
  const reg = reduceContexts(empty(), fx('fo-checkin-wizard'))
  const host = reg.contexts[HOST_ID]
  const summary = summarizeHost(reg, '/checkin/V5M48N')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  assert.equal(view.wizard.horizontal, true)
  assert.equal(view.wizard.currentStep, 'identidad')
  assert.equal(view.title, 'Check-In')
  const atoms = view.content.flatMap((b) => b.items)
  assert.ok(atoms.some((a) => a.isEntityHeader) && atoms.some((a) => a.isNotice))
  assert.ok(atoms.some(isRichAtom))
  assert.deepEqual(view.sections, []) // rico → sin form genérico (misma regla que el host)
  // los botones de pax son acciones de página (con parámetros): se quedan en el contenido
  assert.ok(atoms.some((a) => (a.buttons || []).some((b) => b.actionId === 'selectPax')))
  assert.deepEqual(view.nav.map((b) => b.actionId), ['back', 'next'])
})

test('wizard: con RAIL (ProgressSteps vertical) sigue el guided process — sin pie ni título fuera', () => {
  const increment = fx('load-wizard')
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (n.metadata && n.metadata.type === 'ProgressSteps') n.metadata.vertical = true
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') walk(v)
    }
  }
  walk(increment)
  const reg = reduceContexts(empty(), increment)
  const summary = summarizeHost(reg, '/wizard')
  const view = wizardStepViewOf(reg.contexts[HOST_ID], null, { title: summary.title, sections: summary.sections })
  assert.equal(view.wizard.horizontal, false)
  assert.deepEqual(view.nav, [])
  const atoms = view.content.flatMap((b) => b.items)
  // el pie back/next lo aporta el guided process: fuera del contenido, como siempre
  assert.ok(!atoms.some((a) => a.isButtons && a.buttons.every((b) => b.actionId === 'back' || b.actionId === 'next')))
  // y también aquí cada campo una vez
  assert.ok(!atoms.some((a) => a.isInput))
  assert.ok(!atoms.some((a) => a.isFormLayout))
  assert.deepEqual(view.sections.flatMap((sec) => sec.fields.map((f) => f.fieldId)), ['name', 'email'])
})

test('wizard: el alta de reserva (secciones en tarjetas) no deja tarjetas vacías tras mover sus campos', () => {
  const reg = reduceContexts(empty(), fx('booking-new-wizard'))
  const summary = summarizeHost(reg, '/booking/newBooking')
  const view = wizardStepViewOf(reg.contexts[HOST_ID], null, { title: summary.title, sections: summary.sections })
  assert.equal(view.wizard.horizontal, true)
  assert.equal(view.title, 'New booking')
  // cada @Section va al form con su título; su tarjeta (sólo con el título) no se repite arriba.
  // La que se llama como su paso («Stay») no repite el rótulo del paso que va encima
  assert.deepEqual(view.content, [])
  assert.deepEqual(view.sections.map((sec) => [sec.title, sec.hasTitle]),
    [['', false], ['Holder', true], ['Comments', true]])
  assert.ok(view.sections[0].fields.find((f) => f.fieldId === 'arrival').isDate)
  assert.deepEqual(view.nav.map((b) => b.actionId), ['back', 'next'])
})

// El Next de un wizard es validationRequired (como en Vaadin): con los obligatorios vacíos la
// acción no sale — se marcan los campos, el primero con el foco. El alta de reserva de ec-demo1
// avanzaba con hotel, canal, fechas y titular vacíos.
test('wizard: el Next valida los obligatorios del paso antes de salir', () => {
  const reg = reduceContexts(empty(), fx('booking-new-wizard'))
  const host = reg.contexts[HOST_ID]
  const summary = summarizeHost(reg, '/booking/newBooking')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  assert.deepEqual(validationOf(host, 'next'), { fields: [] })
  assert.equal(validationOf(host, 'back'), null) // el comodín '*' no pide validar
  assert.deepEqual(formErrorsOf(view.sections, {}),
    ['hotelCode', 'channelCode', 'arrival', 'departure', 'holderFirstName', 'holderLastName'])
  // lo escrito (el borrador) cuenta, aunque el estado del servidor siga vacío
  assert.deepEqual(formErrorsOf(view.sections, {
    hotelCode: 'H1', channelCode: { value: 'WEB', label: 'Web' }, arrival: '2026-10-01',
    departure: '2026-10-03', holderFirstName: 'Ana', holderLastName: '  ',
  }), ['holderLastName'])
  // fieldsToValidate restringe
  assert.deepEqual(formErrorsOf(view.sections, {}, ['arrival']), ['arrival'])
})

test('validationOf: la acción exacta gana al comodín, y sin validationRequired no valida', () => {
  const ctx = { tree: { actions: [
    { id: 'save*', validationRequired: true, fieldsToValidate: ['name'] },
    { id: 'saveDraft', validationRequired: false },
  ] } }
  assert.equal(validationOf(ctx, 'saveDraft'), null)
  assert.deepEqual(validationOf(ctx, 'saveAll'), { fields: ['name'] })
  assert.equal(validationOf(ctx, 'other'), null)
  assert.equal(validationOf(null, 'next'), null)
})

// El guided process (@WizardProgress RAIL) de Redwood: su OVERVIEW enseña el título del proceso
// (el h2 del wizard) y su subtítulo sobre las columnas de los pasos, y cada columna hecha lleva
// el status del template ('success' → «Completado»).
test('wizard: el guided process lleva título, subtítulo y el estado de cada paso', () => {
  const increment = fx('fo-walkin-wizard')
  const walk = (n, fn) => {
    if (!n || typeof n !== 'object') return
    fn(n)
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, fn))
      else if (v && typeof v === 'object') walk(v, fn)
    }
  }
  let subtitleAdded = false
  walk(increment, (n) => {
    if (n.metadata && n.metadata.type === 'ProgressSteps') {
      n.metadata.vertical = true
      // en el paso 2: el primero hecho
      n.metadata.steps = n.metadata.steps.map((st, i) => ({ ...st, status: i === 0 ? 'done' : i === 1 ? 'current' : 'upcoming' }))
    }
    // el subtítulo del wizard (@Subtitle) viaja como un Text con la clase mateu-wizard-subtitle
    if (!subtitleAdded && Array.isArray(n.children) && n.children.some((c) => c && c.metadata
        && c.metadata.type === 'Text' && c.metadata.container === 'h2')) {
      const at = n.children.findIndex((c) => c.metadata && c.metadata.container === 'h2')
      n.children.splice(at + 1, 0, { type: 'ClientSide', id: 'sub', children: [], cssClasses: 'mateu-wizard-subtitle',
        metadata: { type: 'Text', container: 'p', text: 'Un cliente sin reserva, paso a paso' } })
      subtitleAdded = true
    }
  })
  assert.ok(subtitleAdded)
  const reg = reduceContexts(empty(), increment)
  const host = reg.contexts[HOST_ID]
  const wizard = wizardOf(host)
  assert.equal(wizard.horizontal, false)
  assert.equal(wizard.title, 'Walk-in')
  assert.equal(wizard.subtitle, 'Un cliente sin reserva, paso a paso')
  assert.deepEqual(wizard.steps.map((st) => [st.id, st.status, st.display]),
    [['estancia', 'success', 'on'], ['precio', 'none', 'on'], ['titular', 'none', 'on'], ['confirmar', 'none', 'on']])
  assert.equal(wizard.currentStep, 'precio')
  assert.equal(wizard.resumeStepId, 'precio') // ya empezado: «Reanudar» en su paso
  const summary = summarizeHost(reg, '/walk-in')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  // el título y el subtítulo son del proceso: no se repiten dentro del paso
  assert.equal(view.title, 'Walk-in')
  const atoms = view.content.flatMap((b) => b.items)
  assert.ok(!atoms.some((a) => a.isText && (a.text === 'Walk-in' || a.text === wizard.subtitle)))
  // en el primer paso aún no hay nada que reanudar
  const fresh = reduceContexts(empty(), fx('fo-walkin-wizard'))
  assert.equal(wizardOf(fresh.contexts[HOST_ID]).resumeStepId, '')
})

test('selectPlaceholder: el del idioma del navegador, inglés si no se conoce', () => {
  assert.equal(selectPlaceholder('es-ES'), 'Seleccione un valor')
  assert.equal(selectPlaceholder('ca'), 'Seleccioneu un valor')
  assert.equal(selectPlaceholder('en-US'), 'Select a value')
  assert.equal(selectPlaceholder('xx'), 'Select a value')
  assert.equal(selectPlaceholder(undefined), 'Select a value')
})

test('chat: el uso de una respuesta se queda con el último valor de cada contador', () => {
  let turn = mergeTurnUsage(null, { inputTokens: 120 })
  turn = mergeTurnUsage(turn, { inputTokens: 130, outputTokens: 40 })
  assert.deepEqual(turn, { inputTokens: 130, outputTokens: 40 })
})

test('chat: los totales de la conversación suman cada respuesta; sin contadores, nada', () => {
  assert.equal(addUsage(null, {}), null)
  assert.equal(addUsage(null, null), null)
  let total = addUsage(null, { inputTokens: 130, outputTokens: 40, totalTokens: 170 })
  total = addUsage(total, { inputTokens: 200, outputTokens: 60, totalTokens: 260 })
  assert.deepEqual(total, { inputTokens: 330, outputTokens: 100, totalTokens: 430 })
  // una respuesta sin uso no borra lo que había
  assert.deepEqual(addUsage(total, {}), total)
})

test('chat: el uso que se enseña es el último que manda el agente (el de la conversación), no la suma', () => {
  assert.equal(latestUsage(null, null), null)
  const first = latestUsage(null, { inputTokens: 130, outputTokens: 40, totalTokens: 170 })
  const second = latestUsage(first, { inputTokens: 330, outputTokens: 100, totalTokens: 430 })
  assert.deepEqual(second, { inputTokens: 330, outputTokens: 100, totalTokens: 430 })
  // una respuesta sin uso deja el que había
  assert.deepEqual(latestUsage(second, {}), second)
  assert.equal(isEmptyUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }), true)
  assert.equal(isEmptyUsage({ totalTokens: 3 }), false)
})

test('chat: el lector SSE ignora comentarios y otros campos, y quita sólo UN espacio tras data:', () => {
  const parser = createSseParser()
  const out = [...parser.push(':keep-alive\n\nevent: x\nid: 1\ndata:   sangrado\n\ndata: a\r'), ...parser.push('\n\r\n'), ...parser.push('data: fin'), ...parser.end()]
  assert.deepEqual(out, ['  sangrado', 'a', 'fin'])
  assert.deepEqual(classifyChatPayload('{"event":"agent-status","detail":{"phase":"thinking"}}'), { kind: 'status', detail: { phase: 'thinking' } })
  assert.deepEqual(classifyChatPayload('{"event":"navigation-requested","detail":{"route":"/x"}}'), { kind: 'event', event: 'navigation-requested', detail: { route: '/x' } })
  assert.deepEqual(classifyChatPayload('hola'), { kind: 'text', text: 'hola' })
})

test('chat: sin progreso del agente, la fila de estado es la de siempre', () => {
  const p = createChatProgress(0)
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 4.7, progress: p, now: 4700 }), 'Pensando… 4 s')
  p.status({ phase: 'thinking', text: 'Pensando…' }, 5000)
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 9, progress: p, now: 7000 }), 'Pensando… 2 s')
  assert.equal(chatStatusText({ busy: false, hasText: false, elapsedSeconds: 9, progress: p, now: 7000 }), '')
})

test('chat: la fila de estado dice si el asistente piensa o ya responde', () => {
  assert.equal(chatStatusText({ busy: false, hasText: false, elapsedSeconds: 9 }), '')
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 0 }), 'Pensando…')
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 4.7 }), 'Pensando… 4 s')
  assert.equal(chatStatusText({ busy: true, hasText: true, elapsedSeconds: 12 }), 'Respondiendo…')
})

test('chat: el dictado usa el reconocimiento del navegador si existe, y el último resultado', () => {
  function Rec() {}
  assert.equal(speechRecognitionCtor({}), null)
  assert.equal(speechRecognitionCtor({ webkitSpeechRecognition: Rec }), Rec)
  assert.equal(speechRecognitionCtor({ SpeechRecognition: Rec, webkitSpeechRecognition: () => {} }), Rec)
  assert.equal(transcriptOf({ results: [[{ transcript: 'hola' }], [{ transcript: ' llegadas de hoy ' }]] }), 'llegadas de hoy')
  assert.equal(transcriptOf({ results: [] }), '')
  assert.equal(transcriptOf(null), '')
})

test('chat: Ctrl+Shift+M activa/desactiva el micrófono (también en macOS: Ctrl, no Cmd)', () => {
  const k = (over = {}) => ({ key: 'M', code: 'KeyM', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, repeat: false, ...over })
  assert.equal(isChatMicShortcut(k()), true)
  assert.equal(isChatMicShortcut(k({ key: 'm' })), true)
  assert.equal(isChatMicShortcut(k({ ctrlKey: false })), false)
  assert.equal(isChatMicShortcut(k({ shiftKey: false })), false)
  assert.equal(isChatMicShortcut(k({ altKey: true })), false)
  assert.equal(isChatMicShortcut(k({ metaKey: true, ctrlKey: false })), false)
  assert.equal(isChatMicShortcut(k({ metaKey: true })), false)
  assert.equal(isChatMicShortcut(k({ repeat: true })), false)
  assert.equal(isChatMicShortcut(k({ key: 'N', code: 'KeyN' })), false)
  // por el carácter en teclados latinos (AZERTY: la M está donde QWERTY tiene «;»), por posición en el resto
  assert.equal(isChatMicShortcut(k({ key: 'M', code: 'Semicolon' })), true)
  assert.equal(isChatMicShortcut(k({ key: 'Q', code: 'KeyM' })), false)
  assert.equal(isChatMicShortcut(k({ key: 'Ь', code: 'KeyM' })), true)
  assert.equal(isChatMicShortcut(null), false)
  assert.equal(CHAT_MIC_ARIA_KEYSHORTCUTS, 'Control+Shift+M')
  // la página lo engancha al documento y pulsa el botón del micrófono (solo existe con el panel abierto
  // y reconocimiento de voz); el botón lo anuncia
  const page = webApp('pages/shell-page.js')
  assert.match(page, /bridge\.isChatMicShortcut\(event\)/)
  assert.match(page, /#mateuChatMic/)
  assert.match(page, /setAttribute\('aria-keyshortcuts', bridge\.CHAT_MIC_ARIA_KEYSHORTCUTS\)/)
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /aria-keyshortcuts="Control\+Shift\+M"/)
  // un botón por estado (el texto de un oj-button no sigue a un oj-bind-text): el de escuchar resaltado
  assert.match(shell, /mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[^>]*chroming="callToAction"[\s\S]*?Detener dictado \(Ctrl\+Shift\+M\)\s*<\/oj-button>/)
  assert.match(shell, /!\$application\.variables\.mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[^>]*chroming="borderless"[\s\S]*?Dictar \(Ctrl\+Shift\+M\)\s*<\/oj-button>/)
})

// ── gaps de Redwood vistos en la demo de ec-demo1 (3.0-alpha.376) ─────────────────────────

test('cabecera: «Cancel booking» (cancelBooking) es una acción, no la vuelta; cancel-view sí lo es', () => {
  const host = reduceContexts(empty(), fx('crud-view-booking')).contexts[HOST_ID]
  const toolbar = pageToolbarOf(host)
  assert.ok(toolbar.some((b) => b.actionId === 'cancelBooking'))
  const back = backToolbarButton(toolbar)
  assert.ok(!back || back.actionId !== 'cancelBooking')
  assert.equal(backToolbarButton([{ actionId: 'cancelBooking' }, { actionId: 'cancel-view' }]).actionId, 'cancel-view')
  assert.equal(backToolbarButton([{ actionId: 'cancel' }]).actionId, 'cancel')
  assert.equal(backToolbarButton([{ actionId: 'cancelBooking' }]), null)
  assert.equal(primaryToolbarButton([{ actionId: 'cancelBooking' }]).actionId, 'cancelBooking')
})

test('acciones del host: la que declara la vista va a la vista; las del crud, al mediador', () => {
  let reg = reduceContexts(empty(), fx('crud-view-booking'))
  // la vista se cargó a través del crud orquestador: su outbound es el del mediador
  const orchestrator = 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingCrudOrchestrator'
  const host = { ...reg.contexts[HOST_ID], outbound: { serverSideType: orchestrator, route: '/booking/bookings/X', consumedRoute: '/booking/bookings', baseUrl: '/_booking' } }
  const view = 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingViewModel'
  // «Ver recorrido» y «Cancel booking» son @Toolbar de la vista: el crud no las conoce
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.serverSideType, view)
  assert.equal(actionTransportOf(host, 'cancelBooking').outbound.serverSideType, view)
  // la ruta, el mediador consumido y el pod no cambian
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.consumedRoute, '/booking/bookings')
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.baseUrl, '/_booking')
  // edit / new / cancel-view no las declara la vista: suben al crud
  for (const id of ['edit', 'new', 'cancel-view']) assert.equal(actionTransportOf(host, id), host)
  // una declarada con bubble también sube
  const bubbling = { ...host, tree: { ...host.tree, actions: [{ id: 'verRecorrido', bubble: true }] } }
  assert.equal(actionTransportOf(bubbling, 'verRecorrido'), bubbling)
})

atest('acciones del host: la request de «Ver recorrido» lleva el serverSideType de la vista', async () => {
  const reg = reduceContexts(empty(), fx('crud-view-booking'))
  const host = { ...reg.contexts[HOST_ID], outbound: { serverSideType: 'Orchestrator', route: '/booking/bookings/X', consumedRoute: '/booking/bookings' } }
  const original = globalThis.fetch
  const bodies = []
  globalThis.fetch = async (url, init) => { bodies.push({ url, body: JSON.parse(init.body) }); return { ok: true, json: async () => ({ commands: [], fragments: [] }) } }
  try {
    await runMateuAction('', actionTransportOf(host, 'verRecorrido'), '/x', 'verRecorrido', host.state)
    assert.equal(bodies[0].body.serverSideType, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingViewModel')
    assert.equal(bodies[0].body.route, '/booking/bookings/X')
    assert.equal(bodies[0].body.consumedRoute, '/booking/bookings')
  } finally {
    globalThis.fetch = original
  }
})

test('confirmación: «Activate» pide confirmar con sus textos; los que no declara, los genéricos', () => {
  const host = reduceContexts(empty(), fx('crud-view-integration')).contexts[HOST_ID]
  const activate = confirmationOf(host, 'activate')
  assert.equal(activate.title, 'Activate this integration?')
  assert.match(activate.message, /Real-time traffic/)
  // la acción no declara los botones: caen, cada uno por su cuenta, a los genéricos
  assert.equal(activate.confirmText, 'Yes')
  assert.equal(activate.denyText, 'No')
  // y va a la vista, que es quien la declara
  const routed = actionTransportOf({ ...host, outbound: { serverSideType: 'Crud' } }, 'activate')
  assert.equal(routed.outbound.serverSideType, 'io.mateu.ecdemo1.integrations.ui.pages.IntegrationViewModel')
  // una acción sin confirmationRequired no pregunta
  assert.equal(confirmationOf(host, 'edit'), null)
  // un comodín no tapa a la exacta, y la exacta con textos propios manda
  const ctx = { tree: { type: 'ServerSide', actions: [{ id: 'action-on-row-*' }, { id: 'action-on-row-seed', confirmationRequired: true, confirmationTexts: { title: 'T', message: 'M', confirmationText: 'Crear', denialText: 'Cancelar' } }] } }
  assert.deepEqual(confirmationOf(ctx, 'action-on-row-seed'), { title: 'T', message: 'M', confirmText: 'Crear', denyText: 'Cancelar' })
  assert.equal(declaredActionOf(ctx, 'action-on-row-other').id, 'action-on-row-*')
  assert.equal(confirmationOf(ctx, 'action-on-row-other'), null)
})

test('confirmación: los textos genéricos van en el idioma de la interfaz (Sí / No en español)', () => {
  const host = reduceContexts(empty(), fx('crud-view-integration')).contexts[HOST_ID]
  const es = confirmationOf(host, 'activate', 'es-ES')
  assert.equal(es.confirmText, 'Sí')
  assert.equal(es.denyText, 'No')
  // lo declarado por la acción sigue mandando
  assert.equal(es.title, 'Activate this integration?')
  assert.deepEqual(confirmationDefaultsOf('es'), { title: 'Un momento, por favor', message: '¿Estás seguro?', confirmText: 'Sí', denyText: 'No' })
  // un idioma sin traducción cae al inglés
  assert.equal(confirmationDefaultsOf('de-DE').confirmText, 'Yes')
  assert.equal(confirmationOf(host, 'activate', 'en-GB').confirmText, 'Yes')
})

atest('confirmación: la chain espera la respuesta; abrir otra da la anterior por denegada', async () => {
  const first = awaitConfirmation()
  const second = awaitConfirmation()
  assert.equal(await first, false)
  answerConfirmation(true)
  assert.equal(await second, true)
  // sin nadie esperando, contestar no hace nada (el ojBeforeClose tras el close)
  answerConfirmation(false)
})

test('diálogo con formulario embebido (EmbeddedView): sus campos, su estado, su título y sus botones', () => {
  const host = reduceContexts(empty(), fx('crud-view-booking'))
  const reg = reduceContexts(host, fx('dialog-embedded-cancel'))
  const overlay = overlayOf(reg)
  assert.ok(overlay.isDialog)
  assert.equal(overlay.title, 'Cancel booking UWS52M')
  // el estado es el del formulario: la reserva que se cancela y a dónde volver
  assert.equal(overlay.state.bookingIds, 'UWS52M')
  assert.equal(overlay.state.returnTo, '/booking/bookings/UWS52M')
  // el motivo es un desplegable con las opciones del OptionsSupplier
  const reason = overlay.sections.flatMap((sec) => sec.fields).find((f) => f.fieldId === 'cancellationReasonCode')
  assert.ok(reason && reason.isSelect)
  assert.deepEqual(reason.options.map((o) => o.value), ['IMPAGO', 'DUPLICADA', 'CANCELA-TTOO', 'OTR'])
  assert.deepEqual(overlay.actions.map((a) => a.actionId), ['cancelBookings', 'keep'])
})

test('diálogo con formulario embebido: sus botones van a SU ServerSide, sin ruta; el resto, al host', () => {
  const host = reduceContexts(empty(), fx('crud-view-booking'))
  const reg = reduceContexts(
    { ...host, contexts: { ...host.contexts, [HOST_ID]: { ...host.contexts[HOST_ID], outbound: { serverSideType: 'Crud', route: '/booking/bookings/UWS52M', consumedRoute: '/booking/bookings', baseUrl: '/_booking' } } } },
    fx('dialog-embedded-cancel'))
  const ctx = overlayTransportOf(reg, 'cancelBookings')
  assert.equal(ctx.outbound.serverSideType, 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingCancellationForm')
  assert.equal(ctx.outbound.baseUrl, '/_booking')
  assert.equal(ctx.outbound.route, '')
  assert.equal(ctx.state.bookingIds, 'UWS52M')
  assert.equal(ctx.id, fx('dialog-embedded-cancel').fragments[0].component.metadata.content.id)
  // una acción que el formulario no declara no se le manda
  assert.equal(overlayTransportOf(reg, 'save'), null)
  // su CloseModal (dirigido a su id) cierra el diálogo
  const closed = reduceContexts(reg, { commands: [{ type: 'CloseModal', targetComponentId: ctx.id }], fragments: [] })
  assert.equal(overlayOf(closed), null)
})

test('query de la ruta: todos los filtros, decodificados; la página y el orden no', () => {
  assert.deepEqual(queryFiltersOf('integration=MRU01'), { integration: 'MRU01' })
  assert.deepEqual(queryFiltersOf('?integration=MRU01&status=PROPOSED,APPROVED&page=2&sort=id:asc&q=a+b%20c&empty='),
    { integration: 'MRU01', status: 'PROPOSED,APPROVED', q: 'a b c' })
  assert.deepEqual(queryFiltersOf(''), {})
})

test('lookups de página: los editables sin opciones se buscan; los cargados y los de sólo lectura no', () => {
  const field = (fieldId, extra) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', ...extra } })
  const tree = { type: 'ServerSide', id: 'v', serverSideType: 'View', actions: [{ id: 'search-crsHotelCode' }], children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [
    field('crsHotelCode', { stereotype: 'combobox', remoteCoordinates: { action: 'search-crsHotelCode' } }),
    field('operaProperty', { stereotype: 'combobox', remoteCoordinates: { action: 'search-operaProperty' }, readOnly: true }),
    field('name', {}),
  ] }] }
  const reg = { contexts: { [HOST_ID]: { id: HOST_ID, tree, state: {}, data: {} } }, stack: [] }
  assert.deepEqual(formLookupsOf(reg.contexts[HOST_ID]), [{ fieldId: 'crsHotelCode', actionId: 'search-crsHotelCode' }])
  const loaded = markLookupsLoaded(reg, HOST_ID, ['crsHotelCode'])
  assert.deepEqual(formLookupsOf(loaded.contexts[HOST_ID]), [])
  assert.ok(loaded.contexts[HOST_ID].data.crsHotelCode[LOOKUP_LOADED])
  // la opción suelta del valor (la etiqueta que manda el server al editar) no cuenta como cargadas
  const labelled = { ...reg.contexts[HOST_ID], data: { crsHotelCode: { pageSize: 1, content: [{ value: 'MRU01', label: 'MRU01 · Riu' }] } } }
  assert.equal(formLookupsOf(labelled).length, 1)
})

atest('lookups de página: loadLookups busca cada uno contra quien lo declara y deja sus opciones', async () => {
  const field = (fieldId, extra) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', ...extra } })
  const tree = { type: 'ServerSide', id: 'v', serverSideType: 'View', actions: [{ id: 'search-crsHotelCode' }], children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [
    field('crsHotelCode', { stereotype: 'combobox', remoteCoordinates: { action: 'search-crsHotelCode' } }),
  ] }] }
  const reg = { contexts: { [HOST_ID]: { id: HOST_ID, tree, state: { name: 'x' }, data: {}, outbound: { serverSideType: 'Crud', route: '/integrations/registry/new', consumedRoute: '/integrations/registry', baseUrl: '/_integrations' } } }, stack: [] }
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return { ok: true, json: async () => ({ commands: [], messages: [], fragments: [{ targetComponentId: 'v', component: null, state: null, data: { crsHotelCode: { pageSize: 200, content: [{ value: 'MRU01', label: 'MRU01 · Riu Demo Mauricio' }, { value: 'MRU02', label: 'MRU02' }] } } }] }) }
  }
  try {
    const out = await loadLookups('', reg, HOST_ID, { appState: {} })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, '/_integrations/mateu/v3/sync/integrations/registry/new')
    assert.equal(calls[0].body.actionId, 'search-crsHotelCode')
    assert.equal(calls[0].body.serverSideType, 'View')
    assert.equal(calls[0].body.parameters.size, 200)
    const widget = fieldListOf(out.contexts[HOST_ID].tree, { crsHotelCode: 'MRU01' }, out.contexts[HOST_ID].data)[0]
    assert.ok(widget.isSelect)
    assert.deepEqual(widget.options.map((o) => o.value), ['MRU01', 'MRU02'])
    // ya cargadas: una segunda pasada no vuelve a buscar
    await loadLookups('', out, HOST_ID, {})
    assert.equal(calls.length, 1)
  } finally {
    globalThis.fetch = original
  }
})

test('filtro @Lookup: con las opciones de su búsqueda es un desplegable y su chip dice la etiqueta', () => {
  const filter = { type: 'FormField', fieldId: 'integration', dataType: 'string', stereotype: 'combobox', label: 'Integration', options: [], remoteCoordinates: { action: 'search-integration' } }
  const tree = { type: 'ServerSide', id: 'crud', children: [{ type: 'ClientSide', metadata: { type: 'Crud', filters: [filter] } }] }
  const ctx = { tree, state: {}, data: {} }
  assert.equal(filtersOf(ctx)[0].kind, 'text')
  assert.deepEqual(formLookupsOf(ctx), [{ fieldId: 'integration', actionId: 'search-integration' }])
  const withOptions = { ...ctx, data: { integration: { content: [{ value: 'MRU01', label: 'MRU01 · Riu Demo Mauricio' }] } } }
  const [descriptor] = filtersOf(withOptions)
  assert.ok(descriptor.isOptions)
  assert.deepEqual(descriptor.options, [{ value: 'MRU01', label: 'MRU01 · Riu Demo Mauricio' }])
  assert.equal(smartFilterValueOf([descriptor], { integration: 'MRU01' }, '').filter((c) => c.filter === 'integration')[0].label, 'MRU01 · Riu Demo Mauricio')
})

// ── P1: maestro de un registro con pestañas que son páginas ─────────────────────────────────────
import { rowRouteOf as p1RowRouteOf } from './reduceContexts.mjs'

test('P1: @RowRoute — la fila abre la ruta del maestro; una plantilla sin resolver no navega', () => {
  assert.equal(p1RowRouteOf('/customers/${row.id}', { id: '3' }), '/customers/3')
  assert.equal(p1RowRouteOf('/customers/${row.id}', {}), '')
  assert.equal(p1RowRouteOf('', { id: '3' }), '')
})
import { appLevelOf as p1AppLevelOf, splitNestedApps as p1SplitNestedApps, tabRoutePath as p1TabRoutePath, islandContentOf as p1IslandContentOf } from './reduceContexts.mjs'

test('P1: la URL de una pestaña con clave sustituye la de su barra', () => {
  assert.equal(p1TabRoutePath('/vcns/7', ['subnets', 'gateways'], 'gateways'), '/vcns/7/gateways')
  assert.equal(p1TabRoutePath('/vcns/7/subnets', ['subnets', 'gateways'], 'gateways'), '/vcns/7/gateways')
})

const p1Tabs = (tabs) => ({ tree: { type: 'ClientSide', metadata: { type: 'TabLayout' }, children: tabs.map((t) => ({
  type: 'ClientSide', metadata: { type: 'Tab', ...t.md }, children: [{ type: 'ClientSide', metadata: { type: 'Text', text: t.text } }] })) }, state: {}, data: {} })

test('P1: barra de contenido — claves de ruta y contador; con una sola pestaña, sin barra', () => {
  const blocks = p1IslandContentOf(p1Tabs([
    { md: { label: 'Subnets', routeKey: 'subnets', badge: '12' }, text: 'a' },
    { md: { label: 'Gateways', routeKey: 'gateways' }, text: 'b' },
  ]))
  const bar = blocks.flatMap((b) => b.items).find((a) => a.isTabs)
  assert.deepEqual(bar.tabs.map((t) => [t.label, t.routeKey]), [['Subnets (12)', 'subnets'], ['Gateways', 'gateways']])
  const single = p1IslandContentOf(p1Tabs([{ md: { label: 'Policies', routeKey: 'all-policies' }, text: 'only' }]))
  assert.ok(!single.flatMap((b) => b.items).some((a) => a.isTabs), 'una sola pestaña: sin barra')
})

const p1Master = (extra = {}) => ({ targetComponentId: '', component: { type: 'ClientSide', metadata: {
  type: 'App', variant: 'TABS', title: 'Customer 3', route: '/customers/3', serverSideType: 'demo.CustomerMaster',
  homeRoute: '/customers/3/orders', homeConsumedRoute: '/customers/3', homeServerSideType: 'demo.CustomerOrders',
  backRoute: '/customers', backLabel: 'Customers',
  menu: [{ label: 'Orders', route: '/customers/3/orders' }, { label: 'Addresses', route: '/customers/3/addresses' }],
  ...extra,
} } })

test('P1: el ámbito del listado (filtro readOnly) no se ofrece como filtro', () => {
  const tree = { type: 'ClientSide', metadata: { type: 'Crud', filters: [
    { fieldId: 'customerId', label: 'Customer id', dataType: 'string', stereotype: 'regular', readOnly: true },
    { fieldId: 'status', label: 'Status', dataType: 'string', stereotype: 'regular' },
  ] } }
  assert.deepEqual(filtersOf({ tree, state: {}, data: {} }).map((f) => f.fieldId), ['status'])
})

test('P1: un App anidado (el maestro) es un NIVEL de contenido, no la shell', () => {
  const level = p1AppLevelOf(p1Master(), 'demo.VbHome', '/customers/3/orders/3-2')
  assert.equal(level.title, 'Customer 3')
  assert.deepEqual(level.tabs.map((t) => t.label), ['Orders', 'Addresses'])
  assert.equal(level.selected, '/customers/3/orders', 'un registro del crud de la pestaña sigue en esa pestaña')
  assert.equal(level.showTabs, true)
  assert.equal(level.backRoute, '/customers')
  assert.equal(level.backLabel, 'Customers')
  assert.deepEqual(level.home, { route: '/customers/3/orders', consumedRoute: '/customers/3', serverSideType: 'demo.CustomerOrders' })
  // la shell, un mediador o un App que es su propia home NO son niveles
  assert.equal(p1AppLevelOf(p1Master({ serverSideType: 'demo.VbHome' }), 'demo.VbHome'), null)
  assert.equal(p1AppLevelOf(p1Master({ variant: 'MEDIATOR' }), 'demo.VbHome'), null)
  assert.equal(p1AppLevelOf(p1Master({ homeServerSideType: 'demo.CustomerMaster' }), 'demo.VbHome'), null)
})

test('P1: el maestro pedido a secas marca su pestaña por defecto', () => {
  assert.equal(p1AppLevelOf(p1Master(), 'demo.VbHome', '/customers/3').selected, '/customers/3/orders')
})

test('P1: con una sola pestaña visible no hay barra (la ruta se conserva)', () => {
  const level = p1AppLevelOf(p1Master({ menu: [{ label: 'Orders', route: '/customers/3/orders' }] }), 'demo.VbHome')
  assert.equal(level.showTabs, false)
  assert.equal(level.tabs[0].route, '/customers/3/orders')
})

test('P1: splitNestedApps saca los Apps anidados del incremento y deja el resto', () => {
  const other = { targetComponentId: '', component: { type: 'ServerSide', children: [] } }
  const { increment, levels } = p1SplitNestedApps({ fragments: [p1Master(), other], commands: [] }, 'demo.VbHome', '/customers/3')
  assert.equal(levels.length, 1)
  assert.deepEqual(increment.fragments, [other])
})

atest('P1: loadRouteInto sigue la cadena maestro → pestaña → mediador y no machaca la shell', async () => {
  const original = globalThis.fetch
  const seen = []
  const ordersMediator = { fragments: [{ targetComponentId: '', component: { type: 'ServerSide', serverSideType: 'demo.CustomerOrders', children: [
    { type: 'ClientSide', metadata: { type: 'App', variant: 'MEDIATOR', homeRoute: '/customers/3/orders', homeConsumedRoute: '/customers/3/orders', homeServerSideType: 'demo.CustomerOrders', serverSideType: 'demo.CustomerOrders' } },
  ] } }] }
  const listing = { fragments: [{ targetComponentId: '', component: { type: 'ServerSide', children: [
    { metadata: { type: 'Crud', title: null, searchable: true, columns: [{ metadata: { id: 'id', label: 'Id' } }] } },
  ] } }] }
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body)
    seen.push({ route: body.route, consumedRoute: body.consumedRoute, serverSideType: body.serverSideType })
    if (!body.serverSideType) return { ok: true, json: async () => ({ fragments: [p1Master()] }) }
    if (body.consumedRoute === '/customers/3') return { ok: true, json: async () => ordersMediator }
    return { ok: true, json: async () => listing }
  }
  try {
    const shell = { title: 'VB Demo', serverSideType: 'demo.VbHome', menu: [] }
    const reg = await loadRouteInto('http://x', { contexts: {}, stack: [], shell }, '/customers/3', '', {})
    assert.equal(reg.shell, shell, 'la shell sigue siendo la del bootstrap')
    assert.deepEqual(reg.appLevels.map((l) => l.title), ['Customer 3'])
    assert.equal(reg.loadedRoute, '/customers/3/orders', 'el maestro solo abre su pestaña por defecto')
    assert.deepEqual(seen.map((s) => s.consumedRoute), ['', '/customers/3', '/customers/3/orders'])
    assert.ok(listingOf(reg.contexts[HOST_ID]), 'la pestaña pinta su listado')
  } finally { globalThis.fetch = original }
})

// ── P1 en Redwood: páginas-formulario con pestañas y @Subresource, y páginas de solo lectura ────
import {
  subresourceIslandOf as p1SubresourceIslandOf, pendingSubresourcesOf as p1PendingSubresourcesOf,
  withSubresources as p1WithSubresources, hostContentShown as p1HostContentShown,
} from './reduceContexts.mjs'
import { loadSubresources as p1LoadSubresources } from './transport.mjs'

const p1Overview = () => reduceContexts(empty(), fx('p1-overview-billing'))
const p1Atoms = (blocks) => (blocks || []).flatMap((b) => b.items)

test('P1: un @Subresource es su propia superficie, no la isla de la pantalla', () => {
  const host = p1Overview().contexts[HOST_ID]
  const subs = []
  const walk = (n) => { if (!n || typeof n !== 'object') return; const s = p1SubresourceIslandOf(n); if (s) { subs.push(s); return } Object.values(n).forEach((v) => (Array.isArray(v) ? v.forEach(walk) : walk(v))) }
  ;(host.tree.children || []).forEach(walk)
  assert.deepEqual(subs.map((s) => [s.id, s.lazy]), [['_orders', false], ['_invoices', true], ['_payments', true]])
  const invoices = subs[1]
  assert.equal(invoices.serverSideType, 'io.mateu.mdd.demovb.infra.in.ui.mastertabs.InvoicesOfCustomer')
  assert.equal(invoices.consumedRoute, '/_subresource/CustomerOverview/invoices')
  // el padre le siembra el id del maestro, y la marca de ámbito viaja con él (como en Vaadin)
  assert.equal(invoices.componentState.customerId, '3')
  assert.equal(invoices.componentState._scope, 'customerId')
  // el baile de la isla (mateuIsland) no los toca: los carga loadSubresources
  assert.deepEqual(collectIslands(host.tree), [])
  // el documento del check-in (un mediador embebido que no es sub-recurso) sigue siendo isla
  assert.ok(collectIslands(reduceContexts(empty(), fx('fo-checkin-wizard')).contexts[HOST_ID].tree).some((i) => i.id === '_documento'))
})

test('P1: una página-formulario con la pestaña de los @Subresource activa conserva la barra y sus huecos', () => {
  const host = p1Overview().contexts[HOST_ID]
  // enlace directo a /customer-overview/3/billing: el servidor marca Billing activa
  const blocks = hostContentOf(host, null, { title: 'Customer 3' })
  const atoms = p1Atoms(blocks)
  const bar = atoms.find((a) => a.isTabs)
  assert.ok(bar, 'la barra de pestañas sigue ahí')
  assert.deepEqual(bar.tabs.map((t) => [t.label, t.routeKey]), [['Details', 'details'], ['Orders (23)', 'orders'], ['Billing', 'billing']])
  assert.equal(bar.selectedId, 'tab-2')
  // sólo los de la pestaña a la vista, apilados con su título y su ayuda
  assert.deepEqual(atoms.filter((a) => a.isSubresource).map((a) => a.islandId), ['_invoices', '_payments'])
  assert.ok(atoms.some((a) => a.isText && a.text === 'Invoices issued to this customer'))
  assert.ok(!blocks.some((b) => b.isNestedBlock), 'no se confunden con la isla anidada (que vaciaba el bloque)')
  assert.equal(p1HostContentShown(blocks, summarizeHost(p1Overview(), '/customer-overview/3/billing')), true,
    'el contenido manda sobre el form genérico')
  // con la pestaña Orders elegida a mano, su listado; Billing espera a que se abra
  const orders = p1Atoms(hostContentOf(host, null, { title: 'Customer 3', activeTab: 'tab-1' }))
  assert.deepEqual(orders.filter((a) => a.isSubresource).map((a) => a.islandId), ['_orders'])
})

test('P1: un @Subresource cargado se pinta como su tabla; el que falta se queda como hueco', () => {
  let reg = p1Overview()
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: 'Customer 3' })
  assert.deepEqual(p1PendingSubresourcesOf(blocks, reg.contexts).map((s) => s.id), ['_invoices', '_payments'])
  reg = reduceContexts(reg, fx('p1-subresource-invoices-load'))
  reg = reduceContexts(reg, fx('p1-subresource-invoices-search'))
  assert.deepEqual(p1PendingSubresourcesOf(blocks, reg.contexts).map((s) => s.id), ['_payments'])
  const atoms = p1Atoms(p1WithSubresources(blocks, reg.contexts))
  const grid = atoms.find((a) => a.isGrid && a.fieldId === '_invoices')
  assert.ok(grid, 'Invoices es una tabla')
  assert.deepEqual(grid.columns.map((c) => c.field), ['id', 'customerId', 'date', 'total'])
  assert.deepEqual(grid.rows.map((r) => r.id), ['F3-1', 'F3-2', 'F3-3', 'F3-4'])
  assert.equal(grid.isEmpty, false)
  assert.ok(atoms.some((a) => a.isSubresource && a.islandId === '_payments'), 'Payments aún sin cargar: hueco')
})

atest('P1: loadSubresources carga cada @Subresource a la vista por su tipo, con el id del maestro, y busca', async () => {
  const original = globalThis.fetch
  const seen = []
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body)
    seen.push(body)
    const inv = String(body.route).includes('/invoices')
    const res = body.actionId === 'search'
      ? (inv ? fx('p1-subresource-invoices-search') : { fragments: [] })
      : (inv ? fx('p1-subresource-invoices-load') : { fragments: [] })
    return { ok: true, json: async () => res }
  }
  try {
    let reg = p1Overview()
    const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: 'Customer 3' })
    reg = await p1LoadSubresources('http://x', reg, blocks, { appState: {} })
    const loadInv = seen.find((b) => b.actionId === '' && b.initiatorComponentId === '_invoices')
    assert.equal(loadInv.serverSideType, 'io.mateu.mdd.demovb.infra.in.ui.mastertabs.InvoicesOfCustomer')
    assert.equal(loadInv.consumedRoute, '/_subresource/CustomerOverview/invoices')
    assert.equal(loadInv.componentState.customerId, '3')
    const search = seen.find((b) => b.actionId === 'search')
    assert.equal(search.componentState.customerId, '3')
    assert.equal(search.componentState.page, 0)
    assert.equal(search.serverSideType, 'io.mateu.mdd.demovb.infra.in.ui.mastertabs.InvoicesOfCustomer')
    assert.ok(!seen.some((b) => String(b.route).includes('/orders')), 'Orders, en otra pestaña, no se carga')
    const grid = p1Atoms(p1WithSubresources(blocks, reg.contexts)).find((a) => a.isGrid && a.fieldId === '_invoices')
    assert.equal(grid.rows.length, 4)
  } finally { globalThis.fetch = original }
})

test('P1: en modo path el historial es solo de Mateu — la shell le quita a VB su onpopstate', () => {
  // VB toma la ruta de arranque por «application URL» (/customers → /customers/) y lee lo que
  // cuelga de ella como una página suya: tras entrar al maestro desde una fila (/customers/5), un
  // atrás le hacía salir de la shell y dejaba «disposed» el contexto de las chains (no repintaba).
  // Guardia de regresión sobre la chain (en Node no hay VB que arrancar): ver e2e/master-tabs-check.mjs
  const chain = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'pages', 'shell-page-chains', 'loadMateuShell.js'), 'utf8')
  assert.match(chain, /if \(pathMode\) \{\s*window\.onpopstate = null;\s*\}/)
  // y antes de cablear el listener propio del popstate
  assert.ok(chain.indexOf('window.onpopstate = null') < chain.indexOf("addEventListener(pathMode ? 'popstate'"))
})

test('P1: una página de solo lectura (sus campos son textos) se pinta, no sale vacía', () => {
  const reg = reduceContexts(empty(), fx('p1-history'))
  const summary = summarizeHost(reg, '/customers/3/history')
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: summary.title })
  assert.deepEqual(p1Atoms(blocks).filter((a) => a.isText).map((a) => a.text), ['3', 'Customer 3 created 2026-01-01'])
  assert.equal(p1HostContentShown(blocks, summary), true)
  // pero si el form genérico tiene campos, unos textos sueltos no le quitan el sitio
  assert.equal(p1HostContentShown(blocks, { ...summary, fields: [{ fieldId: 'x' }] }), false)
  assert.equal(p1HostContentShown(null, summary), false)
})

// ── errores del cliente → log del servidor (clientLog.mjs) ──────────────────────────────────
// Reloj, temporizador y envío inyectados: nada de esperas reales.
const fakeClientLog = (opts = {}) => {
  let t = 1_000_000
  const timers = []
  const sent = []
  const reporter = createClientErrorReporter({
    renderer: 'redwood',
    now: () => t,
    schedule: (fn, ms) => { const h = { fn, at: t + ms }; timers.push(h); return h },
    cancel: (h) => { const i = timers.indexOf(h); if (i >= 0) timers.splice(i, 1) },
    send: opts.send || ((url, body) => { sent.push({ url, lines: JSON.parse(body) }); return Promise.resolve(204) }),
    userAgent: 'UA',
    pageUrl: () => 'https://app/x?code=secret&tab=2#frag',
    ...opts,
  })
  const advance = (ms) => {
    t += ms
    for (;;) {
      const due = timers.filter((h) => h.at <= t).sort((a, b) => a.at - b.at)[0]
      if (!due) break
      timers.splice(timers.indexOf(due), 1)
      due.fn()
    }
  }
  return { reporter, sent, advance, lines: () => sent.flatMap((s) => s.lines) }
}

test('clientLog: el mismo error repetido es UNA línea, y las repeticiones van en un resumen al cerrar la ventana', () => {
  const { reporter, sent, advance, lines } = fakeClientLog()
  const e = { kind: 'unauthorized', status: 401, message: 'Tu sesión ya no es válida. Vuelve a iniciar sesión.', url: '/mateu/v3/sync/bookings', actionId: 'save' }
  reporter.report(e); reporter.report(e)
  advance(2000)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].url, '/mateu/v3/client-log')
  const [first] = lines()
  assert.equal(first.count, 2)
  assert.equal(first.kind, 'unauthorized')
  assert.equal(first.route, '/bookings', 'la ruta se saca de la URL de sync')
  assert.equal(first.renderer, 'redwood')
  assert.equal(first.pageUrl, 'https://app/x?code=***&tab=2', 'sin fragmento y sin el code del login')
  // tres más dentro de la ventana: nada sale hasta que se cierra
  advance(1000); reporter.report(e); advance(1000); reporter.report(e); reporter.report(e)
  advance(10000)
  assert.equal(sent.length, 1)
  advance(60000)
  assert.equal(sent.length, 2)
  const summary = lines()[1]
  assert.equal(summary.count, 3)
  assert.ok(summary.firstAt < summary.lastAt)
  // pasada la ventana, el mismo error vuelve a ser noticia
  reporter.report(e); advance(2000)
  assert.equal(lines().length, 3)
  assert.equal(lines()[2].count, 1)
})

test('clientLog: como mucho 20 líneas por minuto; las que no caben se cuentan en `dropped` de la siguiente', () => {
  const { reporter, advance, lines } = fakeClientLog()
  for (let i = 0; i < 30; i++) reporter.report({ kind: 'server', status: 500, message: 'm' + i })
  advance(2000)
  assert.equal(lines().length, 20)
  reporter.report({ kind: 'server', status: 500, message: 'later' })
  advance(2000)
  assert.equal(lines().length, 20, 'el minuto aún no ha pasado')
  advance(60000)
  reporter.report({ kind: 'server', status: 500, message: 'next minute' })
  advance(2000)
  const last = lines()[lines().length - 1]
  assert.equal(last.message, 'next minute')
  assert.equal(last.dropped, 11)
})

test('clientLog: sin bucles — ni el propio endpoint, ni cancelled, ni un envío que falla o lanza', async () => {
  let calls = 0
  const { reporter, advance } = fakeClientLog({ send: () => { calls++; if (calls === 1) throw new Error('boom'); return Promise.reject(new Error('offline')) } })
  reporter.report({ kind: 'offline', url: '/mateu/v3/client-log', message: 'x' })
  reporter.report({ kind: 'cancelled', message: '' })
  reporter.report({ kind: 'js-error', message: 'ResizeObserver loop completed with undelivered notifications.' })
  advance(5000)
  assert.equal(calls, 0)
  reporter.report({ kind: 'server', status: 500, message: 'a' })
  advance(2000)
  reporter.report({ kind: 'server', status: 500, message: 'b' })
  advance(2000)
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(calls, 2, 'cada fallo de envío se traga; ninguno genera otro informe')
  assert.equal(reporter._pendingCount(), 2)
})

test('clientLog: un 404 del endpoint (backend sin él o desactivado) lo apaga para la página', async () => {
  let calls = 0
  const { reporter, advance } = fakeClientLog({ send: () => { calls++; return Promise.resolve(404) } })
  reporter.report({ kind: 'server', status: 500, message: 'a' })
  advance(2000)
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(reporter.isDisabled(), true)
  reporter.report({ kind: 'server', status: 500, message: 'b' })
  advance(5000)
  assert.equal(calls, 1)
})

test('clientLog: qué respuestas dicen "aquí no hay endpoint" y cuáles son pasajeras', () => {
  for (const s of [404, 405, 400, 200, 500]) assert.equal(endpointIsMissing(s), true, String(s))
  for (const s of [undefined, 0, 204, 401, 403, 413, 429, 502, 503, 504]) assert.equal(endpointIsMissing(s), false, String(s))
})

test('clientLog: trunca message/stack y parte el lote para no pasar del límite del servidor', () => {
  const { reporter, sent, advance, lines } = fakeClientLog()
  for (let i = 0; i < 8; i++) reporter.report({ kind: 'js-error', message: i + 'x'.repeat(5000), stack: 'y'.repeat(9000) })
  advance(2000)
  assert.equal(lines().length, 8)
  assert.ok(lines().every((l) => l.message.length === 1001 && l.stack.length === 4001))
  assert.ok(sent.length > 1, 'más de un envío')
  assert.ok(sent.every((s) => JSON.stringify(s.lines).length < 16 * 1024))
})

test('clientLog: el endpoint sólo es del mismo origen', () => {
  assert.equal(clientLogEndpointOf('', 'https://a'), '/mateu/v3/client-log')
  assert.equal(clientLogEndpointOf('/admin/', 'https://a'), '/admin/mateu/v3/client-log')
  assert.equal(clientLogEndpointOf('https://a/admin', 'https://a'), 'https://a/admin/mateu/v3/client-log')
  assert.equal(clientLogEndpointOf('https://other/admin', 'https://a'), null)
  assert.equal(redactUrl('/x?access_token=abc&q=1'), '/x?access_token=***&q=1')
  assert.equal(routeOfRequestUrl('/b/mateu/v3/sync/_no_route'), '')
})

atest('clientLog: el envío va por fetch keepalive con el Bearer; sendBeacon sólo al salir y sin token', async () => {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { status: 204 } }
  const hadNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const beacons = []
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { sendBeacon: (u, b) => { beacons.push(u); return true } } })
  try {
    const status = await clientLogSender(() => ({ Authorization: 'Bearer T' }))('/mateu/v3/client-log', '[]', { final: true })
    assert.equal(status, 204)
    assert.equal(calls[0].init.keepalive, true)
    assert.equal(calls[0].init.headers.Authorization, 'Bearer T')
    assert.equal(beacons.length, 0, 'con token, ni al salir se usa sendBeacon (no lleva cabeceras)')
    await clientLogSender(() => ({}))('/mateu/v3/client-log', '[]', { final: true })
    assert.equal(beacons.length, 1)
    assert.equal(calls.length, 1)
  } finally {
    globalThis.fetch = original
    if (hadNavigator) Object.defineProperty(globalThis, 'navigator', hadNavigator); else delete globalThis.navigator
  }
})

atest('clientLog: un fallo clasificado de fetchWithPolicy se informa una vez; un abort (cancelled) no', async () => {
  connectivity.reset()
  const reports = []
  clientErrors._reporter = { report: (e) => reports.push(e) }
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => '' })
    await assert.rejects(fetchWithPolicy('/mateu/v3/sync/bookings', { headers: { traceparent: '00-abc-def-01' } }, { actionId: 'save' }))
    assert.equal(reports.length, 1)
    assert.equal(reports[0].kind, 'unauthorized')
    assert.equal(reports[0].status, 401)
    assert.equal(reports[0].actionId, 'save')
    assert.equal(reports[0].traceparent, '00-abc-def-01')
    assert.match(reports[0].detail, /HTTP 401/)
    globalThis.fetch = async () => { const e = new Error('aborted'); e.name = 'AbortError'; throw e }
    await assert.rejects(fetchWithPolicy('/mateu/v3/sync/x', {}, { actionId: 'go' }))
    // el reporter de verdad descarta 'cancelled'; aquí se comprueba que el kind llega como tal
    assert.equal(reports[1].kind, 'cancelled')
    const real = fakeClientLog()
    real.reporter.report(reports[1])
    real.advance(5000)
    assert.equal(real.sent.length, 0)
  } finally {
    globalThis.fetch = original
    clientErrors._reporter = null
    connectivity.reset()
  }
})

// ── respuestas para una pantalla que ya no está (la regla de staleViewGuard.ts del renderer web) ──
// Una petición sale con la pantalla A; el usuario navega a B (onMateuNavigate → beginView) antes
// de que conteste. Su respuesta — buena o mala — muere en silencio: el chain recibe un rechazo
// `isStaleResponse` (no la pinta), el ocupado se apaga sin fallo (sin banda de error) y un 401 no
// pide reautenticar.
const staleHarness = () => {
  const pending = []
  const settles = []
  const original = globalThis.fetch
  const originalDocument = globalThis.document
  let sessionExpired = 0
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', () => { sessionExpired++ })
  globalThis.fetch = (url, init) => new Promise((resolve) => pending.push({
    url, body: JSON.parse(init.body),
    answer: (data) => resolve({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) }),
    fail: (status) => resolve({ ok: false, status, json: async () => ({}), text: async () => '' }),
  }))
  setTransportHooks({ onStart: () => {}, onSettle: ({ failure }) => { settles.push(failure) } })
  return {
    pending, settles, sessionExpired: () => sessionExpired,
    restore: () => { globalThis.fetch = original; globalThis.document = originalDocument; setTransportHooks(null) },
  }
}
const tick = () => new Promise((r) => setTimeout(r, 0))
const listingCtx = { id: 'list', tree: { id: 'list', serverSideType: 'io.example.RuleCrud' }, state: {},
  outbound: { route: '/registro/reglas', consumedRoute: '/registro', serverSideType: 'io.example.RuleCrud', baseUrl: '/_registration-rules' } }
const rowsOf = (sst) => ({ fragments: [{ targetComponentId: 'list', data: { rows: [{ id: 1, of: sst }] } }],
  messages: [{ text: 'Cargado', variant: 'success' }] })

atest('una búsqueda que contesta después de navegar a otra pantalla no se aplica ni pone banda', async () => {
  const h = staleHarness()
  try {
    const search = runMateuAction('', listingCtx, '/registro/reglas', 'search', {}).then(
      (inc) => ({ inc }), (error) => ({ error }))
    await tick()
    beginView() // el usuario navega a otra pantalla
    h.pending[0].answer(rowsOf('io.example.RuleCrud'))
    const outcome = await search
    assert.ok(outcome.error && isStaleResponse(outcome.error), 'el chain recibe el rechazo silencioso, no el incremento')
    assert.deepEqual(h.settles, [null], 'el ocupado se apaga, sin fallo que enseñar')
  } finally { h.restore() }
})

atest('un 500 de una pantalla que ya no está: ni banda de error ni reintento', async () => {
  const h = staleHarness()
  try {
    const search = runMateuAction('', listingCtx, '/registro/reglas', 'search', {}).then(
      (inc) => ({ inc }), (error) => ({ error }))
    await tick()
    beginView()
    h.pending[0].fail(500)
    const outcome = await search
    assert.ok(isStaleResponse(outcome.error))
    assert.deepEqual(h.settles, [null])
    assert.equal(h.pending.length, 1, 'una lectura de otra pantalla no se reintenta')
  } finally { h.restore() }
})

atest('un 401 de una pantalla que ya no está no pide reautenticar', async () => {
  const h = staleHarness()
  try {
    const save = runMateuAction('', listingCtx, '/registro/reglas', 'save', {}).then(
      (inc) => ({ inc }), (error) => ({ error }))
    await tick()
    beginView()
    h.pending[0].fail(401)
    const outcome = await save
    assert.ok(isStaleResponse(outcome.error))
    assert.equal(h.sessionExpired(), 0)
    assert.deepEqual(h.settles, [null])
  } finally { h.restore() }
})

atest('una navegación superada por otra más nueva no deja su registro (onMateuNavigate corta)', async () => {
  const h = staleHarness()
  try {
    beginView() // navegación 1
    const first = loadRouteInto('/_integrations', empty(), '/integrations/frontoffice', '', {}).then(
      (reg) => ({ reg }), (error) => ({ error }))
    await tick()
    beginView() // navegación 2, antes de que conteste la 1
    h.pending[0].answer({ fragments: [{ targetComponentId: '', component: { type: 'ServerSide', id: 'x', serverSideType: 'io.example.Integrations', children: [] } }] })
    const outcome = await first
    assert.ok(outcome.error && isStaleResponse(outcome.error), 'la carga vieja no devuelve registro que pintar')
  } finally { h.restore() }
})

atest('la pantalla en curso sigue recibiendo sus respuestas; las de fondo (quiet) no son de ninguna pantalla', async () => {
  const h = staleHarness()
  try {
    beginView()
    const search = runMateuAction('', listingCtx, '/registro/reglas', 'search', {})
    const widget = callMateu('/_inbox', { route: '/inbox/badge', actionId: 'refresh' }, { quiet: true })
    await tick()
    h.pending[0].answer(rowsOf('io.example.RuleCrud'))
    assert.equal((await search).fragments[0].data.rows[0].of, 'io.example.RuleCrud')
    beginView() // navegar no corta el refresco de un widget de cabecera
    h.pending[1].answer({ fragments: [{ targetComponentId: 'badge', data: { count: 3 } }] })
    assert.equal((await widget).fragments[0].data.count, 3)
    assert.equal(typeof currentView(), 'number')
  } finally { h.restore() }
})

await queue
console.log(`\n${pass} tests OK (contrato de wire real)`)

// CRUD de ec-demo1 (booking del CRS, fixtures reales): sus @Section son Cards con un FormLayout
// (maxColumns 2) de FormRows. Antes cada FormField salía como un oj-input-text suelto — editable
// aunque la vista de detalle los manda todos readOnly, sin columnas de verdad y sin las fechas.
const layoutsOf = (name) => {
  const reg = reduceContexts(empty(), fx(name))
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, {}) || []
  return blocks.flatMap((b) => b.items).filter((a) => a.isFormLayout)
}

test('crud: la vista de detalle pinta cada sección con el form layout de JET, de sólo lectura', () => {
  const layouts = layoutsOf('crud-view-booking')
  const booking = layouts.find((l) => l.fields.some((f) => f.fieldId === 'partnerCode'))
  assert.equal(booking.columns, 2)
  assert.deepEqual(booking.fields.map((f) => f.fieldId),
    ['hotelCode-label', 'channelCode-label', 'partnerCode', 'externalReference', 'arrival', 'departure'])
  // todo readonly: el propio layout también, y JET pinta valores, no cajas
  assert.ok(layouts.every((l) => l.readonly && l.fields.every((f) => f.readonly)))
  // las fechas ya salen, con su widget
  assert.ok(booking.fields.find((f) => f.fieldId === 'arrival').isDate)
  // la etiqueta de un lookup de sólo lectura viene en data, no en el state
  assert.match(String(booking.fields.find((f) => f.fieldId === 'hotelCode-label').value), /MRU01/)
  // cada campo ocupa su colspan del wire, sin pasar de las columnas del layout
  assert.ok(layouts.every((l) => l.fields.every((f) => f.colspan >= 1 && f.colspan <= l.columns)))
  // los grids de la sección siguen siendo tablas, fuera del layout
  const atoms = (hostContentOf(reduceContexts(empty(), fx('crud-view-booking')).contexts[HOST_ID], null, {}) || [])
    .flatMap((b) => b.items)
  assert.ok(atoms.some((a) => a.isGrid && a.fieldId === 'rooms'))
  assert.ok(!layouts.some((l) => l.fields.some((f) => f.fieldId === 'rooms')))
})

test('crud: el formulario de edición es editable salvo lo que el wire manda readOnly', () => {
  const layouts = layoutsOf('crud-edit-booking')
  const field = (id) => layouts.flatMap((l) => l.fields).find((f) => f.fieldId === id)
  assert.equal(field('holderFirstName').readonly, false)
  assert.equal(field('arrival').readonly, false)
  assert.ok(field('arrival').isDate)
  assert.equal(field('id').readonly, true)
  const holder = layouts.find((l) => l.fields.some((f) => f.fieldId === 'holderFirstName'))
  assert.equal(holder.columns, 2)
  assert.equal(holder.readonly, false)
})

test('crud: el colspan de un campo viaja acotado a las columnas del layout', () => {
  const md = { type: 'FormField', fieldId: 'comments', dataType: 'string', label: 'Comments', colspan: 2 }
  const wide = layoutFieldOf(md, { comments: 'x' }, {}, 2)
  assert.equal(wide.colspan, 2)
  assert.equal(layoutFieldOf({ ...md, colspan: 5 }, {}, {}, 2).colspan, 2)
  assert.equal(layoutFieldOf({ ...md, colspan: 1 }, {}, {}, 2).colspan, 1)
  // un grid o una property row no son campos del layout
  assert.equal(layoutFieldOf({ ...md, columns: [{}] }, {}, {}, 2), null)
  assert.equal(layoutFieldOf({ ...md, dataType: 'array' }, {}, {}, 2), null)
})

test('breadcrumbs: el rastro automático — camino de menús y nivel del crud; el padre para goToParent', () => {
  const leaf = (label, route) => ({ label, route, submenus: [] })
  const menu = [
    leaf('Inicio', ''),
    { label: 'Call center', route: '', submenus: [leaf('Reservas', '/booking/bookings')] },
  ]
  const es = { lang: 'es' }
  assert.deepEqual(autoTrail(menu, '/booking/bookings', es), [{ text: 'Call center' }, { text: 'Reservas' }])
  const detail = autoTrail(menu, '/booking/bookings/QN29HB', { title: 'QN29HB · Giulia', lang: 'es' })
  assert.deepEqual(detail.map((c) => c.text), ['Call center', 'Reservas', 'QN29HB · Giulia'])
  assert.deepEqual(parentCrumb(detail), { text: 'Reservas', route: '/booking/bookings' })
  const edit = autoTrail(menu, '/booking/bookings/QN29HB/edit', { title: 'Editar', lang: 'es' })
  assert.deepEqual(edit.map((c) => c.text), ['Call center', 'Reservas', 'QN29HB · Giulia', 'Editar'])
  assert.deepEqual(parentCrumb(edit), { text: 'QN29HB · Giulia', route: '/booking/bookings/QN29HB' })
  assert.deepEqual(autoTrail(menu, '/otra/cosa', es), [])
})

test('breadcrumbs: un grupo con ruta propia (prefijo de una sección federada) no navega salvo que una entrada abra esa ruta', () => {
  const menu = [
    { label: 'Admin', route: '/admin', submenus: [{ label: 'Workflow', route: '/workflow', submenus: [{ label: 'Processes', route: '/workflow/processes', submenus: [] }] }] },
    { label: 'Mapping', route: '/mapping', submenus: [{ label: 'Overview', route: '/mapping', submenus: [] }, { label: 'Dictionary', route: '/mapping/dictionary', submenus: [] }] },
  ]
  const trail = autoTrail(menu, '/workflow/processes/42', { lang: 'es' })
  assert.deepEqual(trail, [{ text: 'Admin' }, { text: 'Workflow' }, { text: 'Processes', route: '/workflow/processes' }, { text: '42' }])
  // el «ir al padre» de un listado colgado de grupos: no hay padre navegable → no se pinta
  assert.equal(parentCrumb(autoTrail(menu, '/workflow/processes', { lang: 'es' })), undefined)
  assert.deepEqual(autoTrail(menu, '/mapping/dictionary/7', { lang: 'es' })[0], { text: 'Mapping', route: '/mapping' })
})

test('breadcrumbs: summarizeHost lleva el rastro; @NoBreadcrumbs en página o shell lo apaga', () => {
  const menu = [{ label: 'Call center', route: '', submenus: [{ label: 'Reservas', route: '/booking/bookings', submenus: [] }] }]
  const regOf = (pageMd, shellExtra = {}) => ({
    shell: { menu, ...shellExtra },
    contexts: { [HOST_ID]: { tree: { children: [{ metadata: { type: 'Page', title: 'QN29HB', ...pageMd } }] }, state: {}, pageType: 'detail' } },
  })
  assert.deepEqual(summarizeHost(regOf({}), '/booking/bookings/QN29HB').trail.map((c) => c.text), ['Call center', 'Reservas', 'QN29HB'])
  assert.deepEqual(summarizeHost(regOf({ noBreadcrumbs: true }), '/booking/bookings/QN29HB').trail, [])
  assert.deepEqual(summarizeHost(regOf({}, { noBreadcrumbs: true }), '/booking/bookings/QN29HB').trail, [])
})

// ── @Searchable: chips + el selector en un diálogo (fixtures/real/searchable-multi-*, capturados
//    contra demo/demo-admin-panel Page 5: un List<String> hotelIds y un String hotelId) ─────────

const searchableHost = () => {
  const form = fx('searchable-multi-form')
  form.fragments[0].targetComponentId = '' // la carga del host
  return reduceContexts(empty(), form)
}

test('@Searchable: un campo de varios ids son chips rotulados + «Add» que abre su selector', () => {
  const reg = searchableHost()
  const host = reg.contexts[HOST_ID]
  const fields = fieldListOf(host.tree, host.state, host.data)
  const multi = fields.find((f) => f.fieldId === 'hotelIds')
  assert.ok(multi.isSearchable && multi.isSearchableMulti)
  assert.equal(multi.isText, false)
  assert.equal(multi.actionId, 'codesearch-hotelIds')
  assert.deepEqual(multi.chips.map((c) => [c.id, c.label, c.remaining]), [['3', 'Hotel 3', []]])
  assert.equal(multi.addLabel, 'Add')
  // el de un solo id: sin chip mientras está vacío, «Search»
  const single = fields.find((f) => f.fieldId === 'hotelId')
  assert.ok(single.isSearchable && !single.isSearchableMulti)
  assert.equal(single.hasChips, false)
  assert.equal(single.addLabel, 'Search')
  // las secciones del formulario los llevan igual
  assert.ok(formSectionsOf(host.tree, host.state, host.data)[0].fields.some((f) => f.fieldId === 'hotelIds' && f.isSearchable))
})

test('@Searchable: el chip de un id sin rótulo es el id; uno simple lleva el rótulo de <campo>-label', () => {
  const chips = searchableChipsOf('ids', ['a', 7], { a: 'Alpha' }, { multi: true })
  assert.deepEqual(chips.map((c) => c.label), ['Alpha', '7'])
  assert.deepEqual(chips[0].remaining, [7])
  assert.equal(chips[0].removeLabel, 'Remove Alpha')
  const single = searchableChipsOf('id', ['h2'], null, { singleLabel: 'Hotel Two' })
  assert.deepEqual(single.map((c) => [c.label, c.remaining]), [['Hotel Two', null]])
  assert.equal(searchableChipsOf('ids', ['a'], {}, { multi: true, readonly: true })[0].removable, false)
  assert.deepEqual(searchableIdsOf(null), [])
  assert.deepEqual(searchableIdsOf('x'), ['x'])
  assert.deepEqual(searchableIdsOf(['x', null, '']), ['x'])
})

test('@Searchable: codesearch abre el SELECTOR (no el modal de decisión): multi, sin la columna «Select», título del campo', () => {
  let reg = searchableHost()
  reg = reduceContexts(reg, fx('searchable-multi-open'))
  assert.equal(reg.stack.length, 1)
  assert.equal(reg.contexts[reg.stack[0]].opener, HOST_ID)
  const picker = searchPickerOf(reg)
  assert.ok(picker)
  assert.equal(picker.multi, true)
  assert.deepEqual(picker.selectionMode, { row: 'multiple' })
  assert.equal(picker.title, 'Hotel ids')
  assert.deepEqual(picker.columns.map((c) => c.id), ['id', 'name', 'address'])
  assert.equal(picker.addLabel, 'Add selected')
  assert.equal(picker.addActionId, 'action-on-row-select-selected')
  assert.equal(picker.pickActionId, 'action-on-row-select')
  assert.equal(picker.rows.length, 0) // las filas llegan con su `search`
  // su búsqueda va a SU ServerSide (el selector), con su estado
  const transport = overlayTransportOf(reg, 'search')
  assert.equal(transport.tree.serverSideType, 'io.mateu.mdd.demoadminpanel.infra.in.ui.HotelSelector')
  assert.equal(transport.state._searchableMulti, true)
  assert.deepEqual(pickerSearchStateOf(picker, { searchText: 'Ho' }), { searchText: 'Ho', page: 0, size: 10 })
  // un overlay que no es un selector no es un picker
  assert.equal(searchPickerOf(reduceContexts(reduceContexts(empty(), fx('load-listing')), fx('open-drawer'))), null)
})

test('@Searchable: la búsqueda del selector llena SUS filas (data-only a su id)', () => {
  let reg = searchableHost()
  reg = reduceContexts(reg, fx('searchable-multi-open'))
  reg = reduceContexts(reg, fx('searchable-multi-search'))
  const picker = searchPickerOf(reg)
  assert.equal(picker.rows.length, 30)
  assert.equal(picker.rows[0].name, 'Hotel 1')
  assert.equal(reg.contexts[HOST_ID].state.hotelIds[0], '3') // el host, intacto
})

test('@Searchable: «Add selected» devuelve al host los ids fusionados y sus rótulos, y cierra el selector', () => {
  let reg = searchableHost()
  reg = reduceContexts(reg, fx('searchable-multi-open'))
  reg = reduceContexts(reg, fx('searchable-multi-search'))
  reg = reduceContexts(reg, fx('searchable-multi-add'))
  assert.deepEqual(reg.stack, [])
  assert.equal(searchPickerOf(reg), null)
  const host = reg.contexts[HOST_ID]
  assert.deepEqual(host.state.hotelIds, ['3', '1', '5'])
  assert.equal(host.data['hotelIds-labels']['5'], 'Hotel 5')
  assert.deepEqual(reg.effects.events, []) // no siguen al bus
  const multi = fieldListOf(host.tree, host.state, host.data).find((f) => f.fieldId === 'hotelIds')
  assert.deepEqual(multi.chips.map((c) => c.label), ['Hotel 3', 'Hotel 1', 'Hotel 5'])
})

test('@Searchable: un clic de fila añade esa fila', () => {
  let reg = searchableHost()
  reg = reduceContexts(reg, fx('searchable-multi-open'))
  reg = reduceContexts(reg, fx('searchable-multi-pick'))
  assert.deepEqual(reg.contexts[HOST_ID].state.hotelIds, ['3', '1', '5', '7'])
  assert.deepEqual(reg.stack, [])
})

test('@Searchable: quitar un chip rehace los chips de la proyección sin ir al servidor; el borrador se funde al abrir', () => {
  const reg = searchableHost()
  const host = reg.contexts[HOST_ID]
  const sections = formSectionsOf(host.tree, { ...host.state, hotelIds: ['3', '9'] }, { ...host.data, 'hotelIds-labels': { 3: 'Hotel 3', 9: 'Hotel 9' } })
  const after = withSearchableIds(sections, 'hotelIds', ['9'])
  const field = after[0].fields.find((f) => f.fieldId === 'hotelIds')
  assert.deepEqual(field.chips.map((c) => [c.id, c.label]), [['9', 'Hotel 9']])
  // lo demás, intacto
  assert.equal(after[0].fields.length, sections[0].fields.length)
  const merged = withContextState(reg, HOST_ID, { hotelId: '2' })
  assert.equal(merged.contexts[HOST_ID].state.hotelId, '2')
  assert.deepEqual(merged.contexts[HOST_ID].state.hotelIds, ['3'])
  assert.equal(withContextState(reg, HOST_ID, {}), reg)
})

test('@Searchable: la vista de detalle (<campo>-label, sólo lectura) se pinta como texto', () => {
  const field = layoutFieldOf({ fieldId: 'hotelIds-label', dataType: 'array', stereotype: 'searchable', readOnly: true, label: 'Hotels' },
    {}, { 'hotelIds-label': 'Hotel 3, Hotel 5' })
  assert.equal(field.isText, true)
  assert.equal(field.readonly, true)
  assert.equal(field.value, 'Hotel 3, Hotel 5')
  assert.equal(field.isSearchable, undefined)
  const tree = { type: 'ServerSide', children: [{ metadata: { type: 'FormField', fieldId: 'hotelIds-label', dataType: 'array', stereotype: 'searchable', readOnly: true, label: 'Hotels' } }] }
  const listed = fieldListOf(tree, {}, { 'hotelIds-label': 'Hotel 3, Hotel 5' })
  assert.deepEqual(listed.map((f) => [f.isText, f.value]), [[true, 'Hotel 3, Hotel 5']])
})


// ── Filtros por URL (declarados, texto libre y selección por ids) y enlaces del chat ──────────────

test('url filters: cada tipo de filtro declarado se pone desde la query, y sale como chip aplicado', () => {
  const q = queryFiltersOf('status=Pending,Confirmed&hotel=Riu&arrival_from=2026-11-01&arrival_to=2026-11-30&vip=true&nights_from=2&vista=IN_HOUSE')
  const chips = smartFilterValueOf(BOOKING_FILTERS, q, '')
  const by = (id) => chips.filter((c) => c.filter === id)[0]
  assert.deepEqual(by('status').value, ['Pending', 'Confirmed'], 'un Set<Enum>: la lista separada por comas')
  assert.equal(by('hotel').value, 'Riu')
  assert.deepEqual(by('arrival').value, { gte: '2026-11-01', lte: '2026-11-30' })
  assert.equal(by('vip').value, 'true')
  assert.deepEqual(by('nights').value, { gte: '2', lte: null })
  assert.equal(by('vista').label, 'In house')
})

test('url filters: searchText (o su alias q) es el buscador, no un filtro', () => {
  assert.deepEqual(splitListingQuery({ q: 'garcía', status: 'Cancelled' }), { searchText: 'garcía', values: { status: 'Cancelled' } })
  assert.deepEqual(splitListingQuery({ searchText: 'a', q: 'b' }), { searchText: 'a', values: {} }, 'searchText manda sobre q')
  assert.deepEqual(splitListingQuery({}), { searchText: '', values: {} })
})

test('url filters: ?ids=… es la selección — un chip que se quita, y viaja al server como ids', () => {
  assert.equal(IDS_PARAM, 'ids')
  const values = queryFiltersOf('ids=4MBZS7,JXD3G6')
  const chips = smartFilterValueOf(BOOKING_FILTERS, values, '')
  assert.deepEqual(chips, [{ filter: 'ids', label: idsChipLabelOf('4MBZS7,JXD3G6'), value: '4MBZS7,JXD3G6' }])
  assert.equal(idsChipLabelOf('4MBZS7,JXD3G6', 'es'), 'Selección: 4MBZS7, JXD3G6')
  assert.equal(idsChipLabelOf(['a', 'b', 'c', 'd'], 'es-ES'), '4 elementos seleccionados')
  assert.equal(idsChipLabelOf('a', 'en'), 'Selection: a')
  assert.equal(idsChipLabelOf('a,b,c,d', 'en'), '4 selected items')
  // vuelve del componente: con el chip, ids; sin él (quitado con la ✕), nada
  assert.deepEqual(filterStateOfSmartFilters(BOOKING_FILTERS, chips).values, { ids: '4MBZS7,JXD3G6' })
  assert.deepEqual(filterStateOfSmartFilters(BOOKING_FILTERS, []).values, {})
  // en el search, en el componentState como cualquier filtro
  assert.equal(listingSearchStateOf({}, { filters: values }).ids, '4MBZS7,JXD3G6')
  // y el chip puede abrir su editor: tiene metadata, también en un listado sin filtros declarados
  assert.ok(smartFiltersMetadataOf(BOOKING_FILTERS).polymorphicTypes.ids)
  assert.deepEqual(filterChipsOf(BOOKING_FILTERS, values)[0].keys, ['ids'])
  // un listado que DECLARA su propio filtro ids lo trata como suyo (sin chip doble)
  const own = [filterDescriptorOf({ fieldId: 'ids', label: 'Ids', dataType: 'string' })]
  assert.equal(smartFilterValueOf(own, { ids: 'x' }, '').length, 1)
})

atest('url filters: un listado sin filtros declarados también pinta el chip de la selección', async () => {
  const config = await smartFiltersOf([], { ids: 'a,b' }, '')
  assert.deepEqual(config.value.map((c) => c.filter), ['ids'])
  assert.equal(config.suggestionFilters, undefined)
  assert.equal(config.suggestions, undefined)
  const plain = await smartFiltersOf([], {}, '')
  assert.deepEqual(Object.keys(plain).sort(), ['askHint', 'value'])
})

test('url filters: la URL refleja los filtros aplicados (comas legibles, el resto codificado)', () => {
  assert.equal(listingUrlOf('/booking/bookings', { status: ['Cancelled'] }, ''), '/booking/bookings?status=Cancelled')
  assert.equal(listingUrlOf('/booking/bookings?status=Pending', { status: ['Pending', 'Confirmed'], ids: '' }, ''),
    '/booking/bookings?status=Pending,Confirmed')
  assert.equal(listingUrlOf('/booking/bookings?ids=a', {}, ''), '/booking/bookings', 'quitar el último chip deja la ruta limpia')
  assert.equal(listingQueryOf({ ids: '4MBZS7,JXD3G6', arrival_from: '2026-11-01' }, 'Nora D'),
    'ids=4MBZS7,JXD3G6&arrival_from=2026-11-01&searchText=Nora%20D')
  // ida y vuelta por la query
  const back = splitListingQuery(queryFiltersOf(listingQueryOf({ status: 'Cancelled', ids: 'a,b' }, 'x y')))
  assert.deepEqual(back, { searchText: 'x y', values: { status: 'Cancelled', ids: 'a,b' } })
})

test('url filters: ir al MISMO listado con otra query aplica exactamente la nueva', () => {
  const a = navTargetOf('/booking/bookings?status=Cancelled', '/booking/bookings')
  assert.equal(a.same, false)
  assert.deepEqual(a.filters, { status: 'Cancelled' })
  const b = navTargetOf('/booking/bookings?ids=4MBZS7,JXD3G6', '/booking/bookings?status=Cancelled')
  assert.equal(b.same, false)
  assert.deepEqual(b.filters, { ids: '4MBZS7,JXD3G6' })
  // la navegación pedida (chat) se compara con lo CARGADO, no con la entrada del menú
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  assert.match(nav, /window\.__mateuLoadedFull/)
  assert.match(nav, /bridge\.splitListingQuery\(target\.filters\)/)
  // un deep-link con query la conserva en la URL (el router de VB la quitaba al arrancar)
  assert.match(nav, /history\.replaceState\(window\.history\.state, '', bridge\.urlOfRoute\(target\.full\)\)/)
  // cambiar filtros reescribe la URL
  assert.match(webApp('flows/main/pages/main-start-page-chains/smartFiltersChanged.js'), /bridge\.listingUrlOf\(/)
})

test('chat: un enlace a una ruta de la app se pinta como enlace (no texto, no vacío) y navega dentro', () => {
  const html = chatMarkdownToHtml('Nora Duarte: [4MBZS7](/booking/bookings/4MBZS7)')
  assert.equal(html, '<p>Nora Duarte: <a href="/booking/bookings/4MBZS7" class="mateu-chat-route" data-mateu-route="/booking/bookings/4MBZS7">4MBZS7</a></p>')
  // la query (& escapado en el atributo) y los _ del href no se rompen con la cursiva
  assert.equal(chatMarkdownToHtml('[ver](/booking/bookings?ids=A_B,C_D&status=Cancelled) _ok_'),
    '<p><a href="/booking/bookings?ids=A_B,C_D&amp;status=Cancelled" class="mateu-chat-route" data-mateu-route="/booking/bookings?ids=A_B,C_D&amp;status=Cancelled">ver</a> <em>ok</em></p>')
  // //host no es una ruta de la app
  assert.equal(chatMarkdownToHtml('[x](//evil.com/a)'), '<p>[x](//evil.com/a)</p>')
  // el clic: sólo uno normal sobre un enlace nuestro
  const anchor = { getAttribute: (n) => (n === 'data-mateu-route' ? '/booking/bookings/4MBZS7' : null) }
  assert.equal(chatRouteOfLink(anchor, { button: 0 }), '/booking/bookings/4MBZS7')
  assert.equal(chatRouteOfLink(anchor, { button: 0, metaKey: true }), null, 'Cmd-clic: otra pestaña, lo hace el navegador')
  assert.equal(chatRouteOfLink({ getAttribute: () => null }, { button: 0 }), null)
  assert.equal(chatRouteOfLink({ getAttribute: () => '//evil.com' }, { button: 0 }), null)
  const page = webApp('pages/shell-page.js')
  assert.match(page, /bridge\.chatRouteOfLink\(anchor, event\)/)
  assert.match(page, /new CustomEvent\('navigation-requested'/)
})

atest('chat: la respuesta en stream con enlaces a fichas llega entera y se pinta con texto y href', async () => {
  const texts = []
  const ev = (o) => 'data:' + JSON.stringify(o) + '\n\n'
  const out = await streamChat({
    url: '/sse', body: {},
    fetchImpl: async () => sseResponse([
      ev({ event: 'agent-delta', detail: { text: 'Fichas: Nora Duarte: [4MBZS7](/booking/' } }),
      ev({ event: 'agent-delta', detail: { text: 'bookings/4MBZS7), Giulia Okafor: [JXD3G6](/booking/bookings/JXD3G6)' } }),
      'data:Fichas: Nora Duarte: [4MBZS7](/booking/bookings/4MBZS7), Giulia Okafor: [JXD3G6](/booking/bookings/JXD3G6)\n\n',
    ]),
    onText: (t) => texts.push(t),
  })
  const html = chatMarkdownToHtml(out)
  assert.match(html, /<a href="\/booking\/bookings\/4MBZS7"[^>]*>4MBZS7<\/a>/)
  assert.match(html, /<a href="\/booking\/bookings\/JXD3G6"[^>]*>JXD3G6<\/a>/)
  assert.doesNotMatch(html, /<a [^>]*><\/a>/, 'ningún enlace vacío')
})

test('chat: el menuContext lleva el descriptor de listado de cada entrada (filtros por URL, id, ids)', () => {
  const listing = { idField: 'id', idsParam: 'ids', searchParam: 'searchText',
    filters: [{ param: 'status', label: 'Status', type: 'enum', multiple: true, values: ['Pending', 'Confirmed', 'Cancelled'] }] }
  const ctx = buildChatMenuContext([
    { label: 'Call center', submenus: [
      { label: 'Bookings', route: '/booking/bookings', consumedRoute: '', baseUrl: '/_booking',
        serverSideType: 'x.BookingHome', uriPrefix: '', description: 'Las reservas del CRS', listing },
      { label: 'New booking', route: '/booking/newBooking', baseUrl: '/_booking' },
    ] },
  ])
  assert.deepEqual(ctx[0].listing, listing)
  assert.equal(ctx[0].description, 'Las reservas del CRS')
  assert.deepEqual(ctx[0].path, ['Call center', 'Bookings'])
  assert.equal(ctx[1].listing, undefined)
  // el chat de Redwood lo manda en el primer mensaje de la sesión (antes no lo mandaba nunca)
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /bridge\.buildChatMenuContext\(/)
  assert.match(send, /menuContext: menuContext/)
})

test('guided process: el overview sólo va en columna en teléfono (< 600px), no en ventanas bajas', () => {
  // la consulta con la que oj-sp-guided-process decide la columna se reescribe; el resto, intacta
  assert.equal(guidedProcessMediaQuery('(max-width: 767px), (max-height: 767px)'), '(max-width: 599px)')
  assert.equal(guidedProcessMediaQuery(' (max-width: 767px),  (max-height: 767px) '), '(max-width: 599px)')
  assert.equal(guidedProcessMediaQuery('(min-width: 768px)'), '(min-width: 768px)')
  assert.equal(guidedProcessMediaQuery('(max-width: 767px)'), '(max-width: 767px)')
  // la rueda vuelve a la página cuando los pasos ya no desbordan a lo ancho
  assert.equal(guidedProcessWheelIsNative({ scrollWidth: 1200, clientWidth: 1200 }), true)
  assert.equal(guidedProcessWheelIsNative({ scrollWidth: 1600, clientWidth: 1200 }), false)
  assert.equal(guidedProcessWheelIsNative(null), false)
  // el guard del wizard lo instala, y app.css reparte los paneles a lo ancho desde tablet
  assert.match(webApp('resources/js/mateu-bridge.js'), /relaxGuidedProcessOverview\(\)/)
  const css = webApp('resources/css/app.css')
  assert.match(css, /@media \(min-width: 600px\)[\s\S]*#mateuWizardEl \.oj-sp-guided-process-step-container[\s\S]*display: grid/)
  assert.match(css, /grid-template-columns: repeat\(auto-fit, minmax\(/)
})

// ANCHO de columna (@ColumnWidth: width "420px" + flexGrow "0" + tooltipPath en el GridColumn,
// Mateu #703): oj-table fija el ancho (min = max = width), la celda se corta con elipsis y el
// texto entero va al title; las demás columnas no cambian. La fila queda intacta.
test('listing: una columna con ancho fijo se corta con elipsis y tooltip; las demás, igual', () => {
  assert.deepEqual(columnWidthOf({ width: '420px', flexGrow: '0' }), { width: '420px', minWidth: '420px', maxWidth: '420px' })
  assert.deepEqual(columnWidthOf({ width: '12rem', flexGrow: '1' }), { width: '12rem', minWidth: '12rem' })
  assert.deepEqual(columnWidthOf({ width: 200, flexGrow: 0 }), { width: '200px', minWidth: '200px', maxWidth: '200px' })
  assert.deepEqual(columnWidthOf({ width: null, flexGrow: null }), {})
  assert.deepEqual(columnWidthOf({ width: 'auto' }), {})
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  const col = (id) => crud.metadata.columns.map((c) => c.metadata || c).find((c) => c.id === id)
  Object.assign(col('name'), { width: '420px', flexGrow: '0', tooltipPath: 'name', autoWidth: false })
  let reg = reduceContexts(empty(), content)
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  const page = JSON.parse(JSON.stringify(search))
  const rows = page.fragments[0].data.crud.page.content
  rows[0].name = 'A very long title that does not fit in four hundred and twenty pixels at all, not even close'
  reg = reduceContexts(reg, page)
  const listing = listingOf(reg.contexts[HOST_ID])
  const name = listing.columns.find((c) => c.id === 'name')
  assert.equal(name.width, '420px')
  assert.equal(name.minWidth, '420px')
  assert.equal(name.maxWidth, '420px')
  assert.equal(name.field, 'name__clipCell')
  assert.equal(name.template, 'cellClip')
  assert.deepEqual(listing.rows[0].name__clipCell, { text: rows[0].name, title: rows[0].name, hover: '', cls: 'mateu-cell-clip' })
  assert.equal(listing.rows[0].name, rows[0].name) // la fila, intacta
  // el resto de columnas, como antes: sin ancho ni plantilla de recorte
  for (const c of listing.columns.filter((c) => c.id !== 'name')) {
    assert.equal(c.width, undefined)
    assert.notEqual(c.template, 'cellClip')
  }
  // ordenar por la cabecera devuelve el id del wire; la selección manda la fila sin la celda
  assert.deepEqual(listingSortOf({ header: 'name__clipCell', direction: 'ascending' }, listing.sortFields)[0].field, 'name')
  assert.ok(selectedRowsOf(listing.rows, { all: true, keys: [], except: [] }).every((r) => !('name__clipCell' in r)))
  // la plantilla existe en la tabla del listado (y en el picker), y app.css corta con elipsis
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/<template slot="cellClip">/g) || []).length, 2)
  assert.match(webApp('resources/css/app.css'), /\.mateu-cell-clip \{[\s\S]*text-overflow: ellipsis;[\s\S]*white-space: nowrap;/)
})

test('listing: tooltipPath a otro campo lo pone en la ventana flotante (no en el title), sin cortar el texto', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  const col = crud.metadata.columns.map((c) => c.metadata || c).find((c) => c.id === 'name')
  Object.assign(col, { tooltipPath: 'id' })
  let reg = reduceContexts(empty(), content)
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, search)
  const listing = listingOf(reg.contexts[HOST_ID])
  const name = listing.columns.find((c) => c.id === 'name')
  assert.equal(name.width, undefined)
  assert.equal(name.template, 'cellClip')
  const r = listing.rows[0]
  assert.deepEqual(r.name__clipCell, { text: String(r.name), title: '', hover: String(r.id), cls: '' })
})

test('chat: la lista sigue el último mensaje mientras crece; si el lector subió, no lo arrastra', () => {
  let observed = null
  const saved = globalThis.MutationObserver
  globalThis.MutationObserver = class { constructor(cb) { observed = cb } observe() {} disconnect() {} }
  try {
    const listeners = {}
    const el = { scrollHeight: 1000, scrollTop: 0, clientHeight: 400, addEventListener: (t, f) => { listeners[t] = f }, removeEventListener: () => {} }
    const stop = stickChatToBottom(el)
    assert.equal(el.scrollTop, 1000)            // al conectar, al final
    el.scrollHeight = 1300; observed([{ addedNodes: [] }])
    assert.equal(el.scrollTop, 1300)            // llega un trozo de respuesta: sigue al final
    el.scrollTop = 200; listeners.scroll()      // el lector sube a releer
    el.scrollHeight = 1500; observed([{ addedNodes: [] }])
    assert.equal(el.scrollTop, 200)             // no lo arrastra
    const userBubble = { nodeType: 1, querySelector: (s) => s === '.mateu-chat-user-text' ? {} : null, classList: { contains: () => false } }
    el.scrollHeight = 1700; observed([{ addedNodes: [userBubble] }])
    assert.equal(el.scrollTop, 1700)            // envía otra pregunta: vuelve a seguir el final
    stop()
  } finally { globalThis.MutationObserver = saved }
})

test('chat: una pantalla que abre el asistente no le quita el foco al chat', () => {
  const inChat = { closest: (s) => (s === '#mateuChatPanel' ? {} : null) }
  const inPage = { closest: () => null }
  assert.equal(focusIsInChat(inChat), true)
  assert.equal(focusIsInChat(inPage), false)
  assert.equal(focusIsInChat(null), false)
})

test('enlaces: un <a href> del contenido a una ruta de la app navega dentro de la shell; el resto, el navegador', () => {
  const loc = { href: 'https://rw.ec1.mateu.io/booking/bookings/ZUAAKJ', origin: 'https://rw.ec1.mateu.io',
    pathname: '/booking/bookings/ZUAAKJ', search: '' }
  const a = (href, attrs = {}) => ({ getAttribute: (n) => (n === 'href' ? href : (n in attrs ? attrs[n] : null)) })
  const click = { button: 0 }
  const route = (href, attrs, ev = click, hashMode = false) => inAppRouteOfLink(a(href, attrs), ev, loc, hashMode)
  // el caso: «Ver recorrido» de la ficha de una reserva
  assert.equal(route('/journey/bookings/ZUAAKJ'), '/journey/bookings/ZUAAKJ')
  // con su query; relativo y absoluto del mismo origen también
  assert.equal(route('/booking/bookings?status=Cancelled&ids=A_B'), '/booking/bookings?status=Cancelled&ids=A_B')
  assert.equal(route('https://rw.ec1.mateu.io/journey/bookings/X1'), '/journey/bookings/X1')
  assert.equal(route('../customers/7'), '/booking/customers/7')
  assert.equal(route('/customers/ana.ruiz'), '/customers/ana.ruiz', 'un id con punto no es un fichero')
  assert.equal(route('/'), '/', 'la home: la shell la traduce a su ruta de inicio')
  assert.equal(route('/journey/bookings/X1', { target: '_self' }), '/journey/bookings/X1')
  assert.equal(route('/journey/bookings/X1', {}, { button: 0, key: 'Enter' }), '/journey/bookings/X1', 'Enter llega como click')
  // otra consola / otro host / otro esquema: el navegador
  assert.equal(route('https://vaadin.ec1.mateu.io/journey/bookings/X1'), null)
  assert.equal(route('//evil.com/x'), null)
  assert.equal(route('http://rw.ec1.mateu.io/journey/bookings/X1'), null, 'otro origen (esquema)')
  assert.equal(route('mailto:a@b.c'), null)
  assert.equal(route('javascript:void(0)'), null)
  // lo que el autor quiso fuera: otra pestaña, descarga, router-ignore
  assert.equal(route('/journey/bookings/X1', { target: '_blank' }), null)
  assert.equal(route('/journey/bookings/X1', { download: '' }), null)
  assert.equal(route('/journey/bookings/X1', { 'router-ignore': '' }), null)
  // clic que no es el normal, o que ya atendió otro (chat, badge de widget)
  assert.equal(route('/journey/bookings/X1', {}, { button: 1 }), null, 'botón del medio')
  for (const k of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
    assert.equal(route('/journey/bookings/X1', {}, { button: 0, [k]: true }), null, k)
  }
  assert.equal(route('/journey/bookings/X1', {}, { button: 0, defaultPrevented: true }), null)
  // anclas de la misma página, href vacío o sin href
  assert.equal(route('#'), null)
  assert.equal(route('#expand=recorrido'), null)
  assert.equal(route('/booking/bookings/ZUAAKJ#expand=recorrido'), null)
  assert.equal(route(''), null)
  assert.equal(route(null), null)
  // no son pantallas: rutas internas, API, login, ficheros, estáticos
  for (const href of ['/_inbox', '/_journey/mateu/v3/ui', '/api/bookings', '/oauth2/authorization/keycloak', '/login',
    '/logout', '/files/factura.pdf', '/export/bookings.csv', '/version_123/resources/js/x.js', '/assets/logo.png']) {
    assert.equal(route(href), null, href)
  }
  // en estático (modo hash) `#/ruta` también es una pantalla
  assert.equal(route('#/journey/bookings/X1', {}, click, true), '/journey/bookings/X1')
  assert.equal(route('#/journey/bookings/X1', {}, click, false), null)
  // la shell lo cablea: escucha clics en #pageContent y navega con onMateuNavigate
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.inAppRouteOfLink\(anchor, event, window\.location/)
  assert.match(shell, /getElementById\('pageContent'\)/)
  assert.match(shell, /event\.preventDefault\(\);\s*Actions\.callChain\(liveContext\(\), \{\s*chain: 'onMateuNavigate'/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /'links\.mjs'/)
})

test('navegar: lo que la chain asigna (foldout, wizard, cola) se lee de constantes, no de vuelta de la variable', () => {
  // una variable `any` de VB que tenía un objeto y se pone a null se lee DENTRO de la chain como un
  // proxy truthy: del detalle de una reserva (foldout) al recorrido, el host no se proyectaba
  for (const rel of ['pages/shell-page-chains/onMateuNavigate.js', 'flows/main/pages/main-start-page-chains/runMateuAction.js']) {
    const src = webApp(rel)
    assert.doesNotMatch(src, /!\s*\$application\.variables\.mateu(Foldout|Queue|Wizard)\b/, rel)
    assert.doesNotMatch(src, /integratedHeader = !!\(\$application\.variables\.mateuWizard/, rel)
    assert.doesNotMatch(src, /if \(\$application\.variables\.mateuWizard\)/, rel)
    assert.match(src, /&& !queueNow && !foldoutNow;/, rel)
  }
})
