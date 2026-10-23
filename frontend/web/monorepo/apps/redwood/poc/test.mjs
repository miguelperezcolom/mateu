// Renderer test suite — runs in Node, WITHOUT VB.
// v3: validates the reducer against REAL increments (fixtures/real/*.json, captured with
// capture.mjs against demo/demo-vb :9005) — these are wire CONTRACT tests, not synthetic ones.
// Regenerate fixtures: start demo/demo-vb (mvn spring-boot:run, :9005) and `node capture.mjs`.

import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { autoTrail, parentCrumb } from './breadcrumbs.mjs'
import { createClientErrorReporter, endpointIsMissing, clientLogSender, clientLogEndpointOf, clientErrors, redactUrl, routeOfRequestUrl } from './clientLog.mjs'
import { foldoutElementAtomsOf } from './elements.mjs'
import { foldoutHeaderOf, foldoutIconClassOf } from './core/archetypes.mjs'
import { styledTextOf } from './core/content.mjs'
import { styleObjectOf } from './richtext.mjs'
import { drawerOverlayOf, listingCardsOf, toggleSelectionKey, rowActionIsRows, isCardLayout } from './reduceContexts.mjs'
import { guidedProcessMediaQuery, guidedProcessWheelIsNative, focusIsInChat, overlayIsOpen } from './a11y.mjs'
import { activeSectionOf, sectionHomeOf, sectionOf, routeCollisionsOf, routeCollisionMessage } from './navTree.mjs'
import { inAppRouteOfLink } from './links.mjs'
import { checkWireVersion, observeWireVersion, setWireMismatchListener, resetWireVersionCheck, wireMismatchMessage } from './wireVersion.mjs'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { composeInnerRoute, mediatorBaseOf, routeFlipOf, loadRoute, loadRouteInto, bootstrapShell, expandRemoteMenus, remoteRouteOf, registerRemoteRoute, baseOf, runMateuAction, runMateuActionSse, callMateu, loadLookups } from './transport.mjs'
import {
  headerWidgetsOf, redwoodHtmlOf, plainTextOf, initialsOf, remoteWidgetHtmlOf, startRemoteWidget, stopRemoteWidgets,
  askFabOf, brandAskFab, ASK_FAB_GLYPH, SHELL_CHAT_GLYPH,
} from './widgets.mjs'
import {
  toSyncPath, loadBundleManifest, hasBundle, getBundledIncrement, matchBundledTemplate,
  bundledIncrementFor, __setBundleForTests, applyRouteParams, getRouteEntry,
  setBundleLocale, pickBundleLocale,
} from './bundle.mjs'
import { bundleUrlOf } from './mount.mjs'
import {
  classifyRequestFailure, isIdempotentAction, shouldRetry, retryDelayMs, MAX_RETRIES,
  connectivity, pendingActions, fetchWithPolicy, setTransportHooks,
  authHeadersOf, askForReauthentication, beginView, currentView, isStaleResponse,
} from './resilience.mjs'
import {
  buildChatMenuContext, buildChatBody, tryParseTokenUsage,
  tryParseCustomEvent, streamChat, mergeTurnUsage, addUsage, chatStatusText,
  createSseParser, classifyChatPayload, isEmptyUsage, createChatProgress, latestUsage,
  speechRecognitionCtor, transcriptOf, chatMarkdownToHtml, chatRouteOfLink, stickChatToBottom, isChatMicShortcut,
  CHAT_MIC_ARIA_KEYSHORTCUTS,
  chatConfigOf, chatTurnOf, chatTurnTextOf, chatToolStepsOf, withAttachments,
} from './chat.mjs'
import { CHROME_TEXTS, chromeText, chromeLanguage, setChromeLanguage, chromeTextsOf } from './i18n.mjs'
import { nlsFiles } from './make-nls.mjs'
import { trustShellBase } from './hostHeaders.mjs'
// the transport tests talk to these bases as the shell's own backend (hostHeaders.storedTokenMayGoTo)
trustShellBase('http://x'); trustShellBase('https://x')
import { classifyRequestFailure as i18nClassify } from './resilience.mjs'
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
// the renderer's interface, in English unless a test asks for another language (Node ships navigator.language)
setChromeLanguage('en')
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }

// The transport tests are async and REPLACE globalThis.fetch with a double. They have to
// run in SERIES: launched together, one test's double replaces the previous one's while that one
// is still in flight, and the first one's retry ends up talking to the second one's double (it happened to me).
let queue = Promise.resolve()
const atest = (name, fn) => {
  queue = queue.then(async () => { await fn(); console.log(`  ✓ ${name}`); pass++ })
}

// 1) Bootstrap: the App configures the shell (menu→navigator) and creates no content context.
test('bootstrap App → shell con menú; ningún contexto de contenido', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('app'))
  assert.equal(Object.keys(contexts).length, 0)
  assert.equal(shell.title, 'VB Demo')
  assert.deepEqual(shell.menu.map((m) => m.route), ['/hello', '/products', '/gestion'])
})

// 2) Loading a form: target '' → host; the context stores the fragment's tree + state.
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

// 3) Save: State-only fragment whose target is the ECHO of the initiator (here, the tree's uuid)
//    → state merge keeping the tree; the toast comes out as an effect.
test('save-form: State-only por eco de id → merge sin perder el árbol + toast', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const treeRef = reg.contexts[HOST_ID].tree
  reg = reduceContexts(reg, fx('save-form'))
  const c = reg.contexts[HOST_ID]
  assert.equal(c.state.name, 'Grace')
  assert.equal(c.state.age, 41)
  assert.equal(c.tree, treeRef) // tree kept (same ref: structural sharing)
  assert.deepEqual(reg.effects.toasts, [{ text: 'Saved Grace', variant: 'success' }])
})

// 4) Internal NavigateTo → route effect; the registry is not touched.
test('navigate produce efecto route sin tocar el registro', () => {
  const before = reduceContexts(empty(), fx('load-form'))
  const { effects, contexts } = reduceContexts(before, fx('navigate'))
  assert.deepEqual(effects.navigate, { route: '/products' })
  assert.ok(contexts[HOST_ID])
})

// 5) Crud: arrives as a MEDIATOR (ServerSide → chromeless child App) addressed to the initiator;
//    mediatorOf provides the info for the second load (content).
test('load-listing: mediador registrado por eco del initiator; mediatorOf → rootRoute/SST', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('load-listing'))
  const c = contexts['crud1']
  assert.ok(c, 'contexto crud1 (eco del initiator)')
  assert.equal(c.kind, 'island')
  assert.equal(shell, null) // a mediator App does NOT configure the shell
  const info = mediatorOf(c)
  assert.equal(info.rootRoute, '/products')
  assert.match(info.serverSideType, /ProductsCrud$/)
})

// 6) The second load (the mediator's content) REPLACES the mediator's context with the
//    listing; the host next to it does not change ref (surgical re-render).
test('load-listing-content reemplaza crud1 con el listado sin tocar otros contextos', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const hostRef = () => reg.contexts[HOST_ID]
  const hostBefore = hostRef()
  reg = reduceContexts(reg, fx('load-listing'))
  reg = reduceContexts(reg, fx('load-listing-content'))
  const c = reg.contexts['crud1']
  assert.equal(mediatorOf(c), null) // it is no longer the mediator: it is the content
  assert.equal(c.tree.children[0].metadata.type, 'Page')
  assert.equal(hostBefore, hostRef()) // host untouched, SAME ref
})

// 7) Add → stacked drawer; the drawer's initial state comes from metadata.initialData.
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

// 8) Save-in-drawer: CloseModal closes by pure state AND emits the bus event with which
//    the subscribed listing refreshes; MarkAsClean with no target applies to the initiator.
test('save-in-drawer: pop del stack + evento mateu-crud:saved-in-drawer + toast', () => {
  let reg = reduceContexts(empty(), fx('load-listing'))
  reg = reduceContexts(reg, fx('open-drawer'))
  const drawerId = reg.stack[0]
  reg = reduceContexts(reg, fx('save-in-drawer'), { initiator: drawerId })
  assert.deepEqual(reg.stack, [])
  assert.equal(reg.contexts[drawerId], undefined)
  // the event carries its SOURCE (the surface whose answer emitted it: the drawer) for the @SubscribeTo scopes
  assert.deepEqual(reg.effects.events, [{ name: 'mateu-crud:saved-in-drawer', detail: null, source: drawerId }])
  assert.equal(reg.effects.toasts[0].variant, 'success')
})

// 9) Host with an embedded island: the boundary is an inner ServerSide with a field id and the
//    markers in initialData — the dispatcher mounts a nested mateu-node there.
test('island-host: collectIslands encuentra la frontera _guestNote con sus marcadores', () => {
  const { contexts } = reduceContexts(empty(), fx('island-host'))
  const islands = collectIslands(contexts[HOST_ID].tree)
  assert.equal(islands.length, 1)
  assert.equal(islands[0].id, '_guestNote')
  assert.match(islands[0].route, /_embeddedMediator=1/)
  assert.equal(islands[0].initialData._embeddedMediator, true)
})

// 10) Island cycle: mediator → content → edit → save, ALWAYS addressed to
//     '_guestNote' through the initiator's echo; the host never changes ref.
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

// 11) State-only on an island: MERGE keeping the tree (a push from the host does not erase the island).
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

// 12) FormLayout branch (Phase 3): fields → oj-dyn-form metadata; buttons → actions.
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

// 13) summarizeHost: form → title + form spec; listing (no Page title) → menu caption.
test('summarizeHost proyecta form y cae al caption del menú en un listado', () => {
  let reg = reduceContexts(empty(), fx('app'))
  reg = reduceContexts(reg, fx('load-form'))
  const form = summarizeHost(reg, '/person')
  assert.equal(form.title, 'Person')
  assert.equal(form.formValue.name, 'Ada')
  // the listing lands as the initiator's context (crud1); we simulate its arrival at the host
  const listing = fx('load-listing-content')
  listing.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, listing)
  const summary = summarizeHost(reg, '/products')
  assert.equal(summary.title, 'Products') // Page without a title → menu caption
  assert.equal(summary.formMetadata, null) // pageType collection: its FormFields are columns
})

// 14) Listing (Phase 4): the OnLoad trigger asks for 'search'; the response is a
//     DATA-ONLY fragment merged into ctx.data without touching the tree; listingOf projects columns+rows.
test('listing: OnLoad→search, data-only mergea, listingOf proyecta columnas y filas', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = '' // simulates the arrival at the host
  let reg = reduceContexts(empty(), content)
  const host = () => reg.contexts[HOST_ID]
  assert.deepEqual(onLoadTriggers(host()), ['search'])
  const before = listingOf(host())
  assert.equal(before.title, 'Products')
  // a boolean reads Yes/No (its cell reads active__labelCell), the price is aligned to the end
  assert.deepEqual(before.columns.map((c) => c.field), ['id', 'name', 'price', 'active__labelCell'])
  assert.equal(before.columns.find((c) => c.id === 'price').className, 'oj-helper-text-align-end')
  assert.equal(before.isEmpty, true) // no rows yet: the search has not run
  const treeRef = host().tree
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, search)
  assert.equal(host().tree, treeRef) // data-only: tree intact
  const after = listingOf(host())
  assert.deepEqual(after.rows.map((r) => r.name), ['Laptop', 'Mouse', 'Keyboard'])
  assert.equal(after.total, 3)
  assert.equal(after.isEmpty, false)
  assert.ok(after.toolbar.some((b) => b.label === 'New'))
})

// 14 pagination) The listing is paginated on the SERVER: the Page (pageNumber/pageSize/totalElements)
//     is projected to a footer with range + first/previous/next/last; paging keeps text,
//     filters and order; the header sorts on the server ([{field, direction}] = uidl Sort).
test('listing: paginación — el pie sale de la Page del server', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  const search = JSON.parse(JSON.stringify(fx('search-listing')))
  search.fragments[0].targetComponentId = ''
  // a single page (3 rows out of 20): no footer
  reg = reduceContexts(reg, search)
  const one = listingOf(reg.contexts[HOST_ID], { lang: 'en' }).paging
  assert.equal(one.visible, false)
  assert.equal(one.rangeText, '1–3 of 3')
  // second page of 57 at 10 per page
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
  // last page: 7 rows, no next
  const last = listingPagingOf({ pageSize: 10, pageNumber: 5, totalElements: 57, content: new Array(7).fill({}) }, 20, 'en')
  assert.equal(last.rangeText, '51–57 of 57')
  assert.equal(last.nextDisabled, true)
  assert.equal(last.lastDisabled, true)
  assert.equal(targetPageOf(last, 'next'), null)
  assert.equal(targetPageOf(last, 'prev'), 4)
  // no known total: there is a next as long as the page comes full
  const open = listingPagingOf({ pageSize: 10, pageNumber: 0, totalElements: null, content: new Array(10).fill({}) }, 20, 'en')
  assert.equal(open.hasNext, true)
  assert.equal(open.lastDisabled, true)
  assert.equal(open.pageText, 'Page 1')
  // the columns carry their wire id as the key (what ojSort returns)
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
  assert.equal(listing.rows[0].name, 'Laptop') // the row, intact
  // sorting by it sorts by its sortingProperty
  assert.deepEqual(listingSortOf({ header: 'name', direction: 'ascending' }, listing.sortFields), [{ field: 'sortName', direction: 'ascending' }])
})

test('listing: filas de varias líneas (@Line) — la línea 1 son las columnas, el resto va debajo como pares', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  const crud = findByType(content.fragments[0].component, 'Crud')
  const metas = crud.metadata.columns.map((c) => c.metadata || c)
  // without @Line the listing is the usual one
  let reg = reduceContexts(empty(), content)
  const search = JSON.parse(JSON.stringify(fx('search-listing')))
  search.fragments[0].targetComponentId = ''
  const plain = listingOf(reduceContexts(reg, search).contexts[HOST_ID])
  assert.equal(plain.extraLines, 0)
  assert.equal(plain.tableClass, 'oj-sm-12')
  assert.ok(plain.columns.every((c) => c.id !== ROW_LINES_FIELD))
  assert.equal(plain.rows[0][ROW_LINES_FIELD], undefined)
  // the last data column, to line 2
  const moved = metas.filter((c) => c.dataType === 'string' && c.id !== 'select').slice(-1)[0]
  moved.line = 2
  reg = reduceContexts(empty(), content)
  const listing = listingOf(reduceContexts(reg, search).contexts[HOST_ID])
  assert.equal(listing.extraLines, 1)
  assert.match(listing.tableClass, /mateu-multiline-table mateu-lines-1/)
  // out of the table's columns (header, sort) — and the technical lines column at the end
  assert.ok(!listing.columns.some((c) => c.id === moved.id))
  const last = listing.columns[listing.columns.length - 1]
  assert.equal(last.id, ROW_LINES_FIELD)
  assert.equal(last.template, 'cellLines')
  assert.equal(last.sortable, 'disabled')
  // each row carries its extra lines precomputed: «Label: value»
  const row = listing.rows[0]
  const lines = row[ROW_LINES_FIELD].lines
  assert.equal(lines.length, 1)
  assert.equal(lines[0].pairs.length, 1)
  assert.equal(lines[0].pairs[0].key, moved.id)
  assert.equal(lines[0].pairs[0].label, moved.label || moved.id)
  const raw = search.fragments[0].data.crud.page.content[0][moved.id]
  assert.equal(lines[0].pairs[0].text, raw == null ? '' : String(raw))
  // the column stays sortable on the server by its sortField; the selector does not carry the technical one
  assert.ok(listing.sortFields[moved.id])
  // a status on line 2 carries its badge; a money value, «amount currency»; line 3 goes separately
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
  // with no sort requested an old one is not sent; with no page, the first
  const plain = listingSearchStateOf({ sort: [{ field: 'old', direction: 'ascending' }] }, { searchText: null, size: 20 })
  assert.equal(plain.sort, undefined)
  assert.equal(plain.page, 0)
  assert.equal(plain.searchText, '')
  assert.deepEqual(listingSortOf({ header: 'when', direction: 'descending' }), [{ field: 'when', direction: 'descending' }])
  assert.deepEqual(listingSortOf({ header: 'id__uuidCell', direction: 'ascending' }), [{ field: 'id', direction: 'ascending' }])
  assert.deepEqual(listingSortOf({}), [])
})

// 14 bis) Row detail (@Details): travels as the Crud's detailPath; listingOf projects it, and
//     tells the lookup listing (the click opens the detail) from the navigable one (the click opens the
//     record: its first column carries actionId 'view').
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

// 14 ter) Abbreviated UUID: a text column with UUIDs is painted "…-<last block>" with the UUID
//     in the tooltip; the row keeps the whole value (navigation, actions, selection).
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
  assert.equal(listing.rows[0].id, uuid) // the row, untouched
  assert.ok(listing.columns.find((c) => c.field === 'name').template === undefined) // not a UUID
  const picked = selectedRowsOf(listing.rows, { all: true, keys: [], except: [] })
  assert.ok(picked.every((r) => !('id__uuidCell' in r))) // the selection sends the row as is
})

// 14 bis-b) The selection guard travels IN THE BUTTON (Button.rowsSelectedRequired): a toolbar
//     button whose id does not match the advertised action's (an @Action is also advertised with
//     its nested-form-… id) still does not fire without checked rows.
test('listing: un botón de toolbar con rowsSelectedRequired exige selección aunque su id no esté anunciado', () => {
  const content = fx('load-listing-content')
  content.fragments[0].targetComponentId = ''
  let reg = reduceContexts(empty(), content)
  const search = fx('search-listing')
  search.fragments[0].targetComponentId = ''
  reg = reduceContexts(reg, search)
  const ctx = reg.contexts[HOST_ID]
  const md = (function find(n) {
    if (!n || typeof n !== 'object') return null
    if (n.metadata && n.metadata.type === 'Crud') return n.metadata
    for (const c of (n.children || [])) { const f = find(c); if (f) return f }
    return null
  })(ctx.tree)
  assert.ok(md, 'the fixture carries a Crud')
  md.toolbar = (md.toolbar || []).concat([
    { actionId: 'action-on-row-cancel', label: 'Cancel', rowsSelectedRequired: true },
    { actionId: 'purgeAll', label: 'Purge all' },
  ])
  const listing = listingOf(ctx)
  assert.ok(listing.selectionRequired.includes('action-on-row-cancel'))
  assert.ok(!listing.selectionRequired.includes('purgeAll'))
})

// 14 ter) Row selection (Listing.rowsSelectionEnabled): the table puts checkboxes and a host
//     action carries the checked rows in crud_selected_items — the Vaadin contract, which
//     HttpRequest.getSelectedRows reads from the componentState.
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

  // oj-table's KeySet: explicit, and "all except"
  const explicit = { isAddAll: () => false, values: () => new Set([listing.rows[1]._rowNumber]) }
  const allBut = { isAddAll: () => true, deletedValues: () => new Set([listing.rows[0]._rowNumber]) }
  const one = selectionOfKeySet(explicit)
  assert.deepEqual(selectedRowsOf(listing.rows, one).map((r) => r.name), ['Mouse'])
  assert.deepEqual(selectedRowsOf(listing.rows, selectionOfKeySet(allBut)).map((r) => r.name), ['Mouse', 'Keyboard'])
  assert.deepEqual(selectionOfKeySet(null), { all: false, keys: [], except: [] })

  const state = withListingSelection({ page: 0 }, listing, listing.rows, one)
  assert.equal(state.page, 0)
  assert.deepEqual(state.crud_selected_items.map((r) => r.name), ['Mouse'])
  // with nothing checked the empty list travels (the server tells "none" from "not applicable")
  assert.deepEqual(withListingSelection({}, listing, listing.rows, null).crud_selected_items, [])
  // a listing without selection does not touch the state
  const plain = { ...listing, rowsSelectionEnabled: false }
  const untouched = { page: 1 }
  assert.equal(withListingSelection(untouched, plain, listing.rows, one), untouched)
})

// the precomputed @Status badge does not travel back in the selected row
test('listing: una fila seleccionada con @Status se manda sin el badge precomputado', () => {
  const rows = [{ _rowNumber: 0, name: 'A', outcome: { type: 'SUCCESS', message: 'Ok', badgeClass: 'oj-badge' } }]
  const [row] = selectedRowsOf(rows, { all: false, keys: [0], except: [] })
  assert.deepEqual(row.outcome, { type: 'SUCCESS', message: 'Ok' })
  assert.equal(rows[0].outcome.badgeClass, 'oj-badge') // the painted row is not touched
})

// 15) CRUD in a drawer (Phase 5): new→projectable Add; view→Edit drawer with the row;
//     save→CloseModal(eventName) and the listing's OnCustomEvent trigger asks for 'search'.
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
  // save: closes by state and emits the bus event…
  reg = reduceContexts(reg, fx('save-in-drawer'))
  assert.equal(overlayOf(reg), null)
  const eventName = reg.effects.events[0].name
  assert.equal(eventName, 'mateu-crud:saved-in-drawer')
  // …which the listing has subscribed to 'search' (the refresh travels IN the wire)
  assert.deepEqual(eventTriggersOf(reg.contexts[HOST_ID], eventName), ['search'])
  // edit: the row click (view + parameters=row) opens the drawer with the row loaded
  reg = reduceContexts(reg, fx('open-edit-drawer'))
  overlay = overlayOf(reg)
  assert.equal(overlay.title, 'Edit')
  assert.equal(overlay.state.name, 'Laptop')
  assert.deepEqual(overlay.actions.map((a) => a.actionId).sort(), ['cancel-edit', 'delete', 'save'].filter((x) => overlay.actions.some((a) => a.actionId === x)))
})

// 16) Complex shell (Phase 6): groups with children by TERMINAL route, @AppContext selectors
//     and header actions (dropdown with children) projected for simple bindings.
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
  assert.equal(b.same, false) // before: same path → «echo», it did not reload and the chip stayed
  assert.deepEqual(b.filters, {})
  assert.equal(navTargetOf('/reservas?vista=SALIDAS_HOY', '/reservas?vista=LLEGADAS_HOY').same, false)
  assert.equal(navTargetOf('/reservas?vista=LLEGADAS_HOY', '/reservas?vista=LLEGADAS_HOY').same, true) // eco
  assert.equal(navTargetOf('/reservas', '/reservas').same, true)
  assert.deepEqual(navTargetOf('/mapping/dictionary?integration=MRU01&page=2', '').filters, { integration: 'MRU01' })
})

test('iconos: vaadin:sign-in (Llegadas) tiene icono; uno sin traducción cae en el genérico', () => {
  assert.equal(ojIconOf('vaadin:sign-in'), 'oj-ux-ico-login')
  assert.equal(ojIconOf('vaadin:tablet'), 'oj-ux-ico-tablet-portrait') // the check-in tablet (Oracle's font has it)
  for (const v of ['cloud', 'trending-up', 'building', 'refresh', 'close-circle', 'tablet']) {
    assert.ok(ojIconOf('vaadin:' + v), v)
  }
  assert.equal(ojIconOf('vaadin:nope'), undefined) // strict: widgets and FAB keep their fallback
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
  // @Menu @Hidden on a local page: the listing's New button reaches it, not the menu
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
  // the brand accent (@App(accentColor)) belongs to the web renderer: the Redwood band uses the
  // theme's neutral tokens, so the nav does not even carry it
  assert.equal(onTop.accentColor, undefined)
  // TABS with groups (they don't fit in the bottom bar): they stay in the dark header, as before
  assert.equal(shellNavOf({ shell: { variant: 'TABS', menu } }).mode, 'topbar')
  // flat TABS (the front office): the bottom bar, intact
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
      // a group on the second level: the third level, in a dropdown
      { label: 'Permisos', path: '/perm', submenus: [{ label: 'Roles', route: '/users/roles', baseUrl: '/_users' }] },
      { label: 'Users', route: '/users/users', baseUrl: '/_users' },
    ] },
    // a pod that did not answer: disabled, no home
    { label: 'Audit', path: '/audit', remote: true, unavailable: true, description: 'Audit no está disponible ahora.' },
  ]
  const nav = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', title: 'Control plane', menu } })
  assert.equal(nav.mode, 'sections')
  assert.deepEqual(nav.sections.map((s) => s.label), ['Inicio', 'IA', 'Usuarios', 'Audit'])
  // the list's id is the HOME: choosing the section navigates to its first screen (like Opera)
  assert.deepEqual(nav.sections.map((s) => s.id), ['/inicio', '/catalogues/agents', '/users/roles', nav.menuTree[3].id])
  assert.ok(nav.sections.every((s) => !s.hasChildren), 'la hamburguesa sólo lleva el primer nivel')
  assert.equal(nav.sections[3].disabled, true)
  assert.equal(nav.sections[3].hint, 'Audit no está disponible ahora.')
  // the other variants do not change; HAMBURGER_MENU is the correct spelling of HAMBURGUER_MENU
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
  // the section's second level: the item marked in the band — a group, by what it contains
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
      // hidden: a screen under it still belongs to Call center
      { label: 'Nueva', route: '/booking/new', baseUrl: '/_booking', visible: false },
    ] },
    { label: 'Admin', path: '/admin', submenus: [
      // third level (federated shell): the pod's group with its screens
      { label: 'Workflow', path: '/workflow', remote: false, submenus: [{ label: 'Processes', route: '/workflow/processes', baseUrl: '/_workflow' }] },
    ] },
    // a remote that has not answered yet: counts by its prefix
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
  // the home (or a route nobody owns): none marked
  assert.equal(activeSectionOf(tree, '/inicio'), null)
  assert.equal(activeSectionOf(tree, ''), null)
  assert.equal(activeSectionOf(tree, null), null)
  // a shorter prefix does not take the screens of another section
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
  // HAMBURGUER_MENU (explicit in the demo) → left drawer with oj-navigation-list
  assert.equal(nav.mode, 'drawer')
  const group = nav.menuTree.find((m) => m.hasChildren)
  assert.equal(group.label, 'Gestion')
  // the COMPOSED route, like Vaadin: resolves with the app's serverSideType (loadMenuRouteInto),
  // and a group RouteLink (/gestion/island-host) falls back to its terminal if the server does not recognise it
  assert.deepEqual(group.children.map((c) => c.id), ['/gestion/person', '/gestion/island-host'])
  assert.equal(nav.selectors[0].fieldName, 'hotel')
  assert.deepEqual(nav.selectors[0].options.map((o) => o.value), ['Playa', 'Centro'])
  const menu = nav.headerActions.find((a) => a.hasChildren)
  assert.deepEqual(menu.children.map((c) => c.actionId), ['exportPdf', 'exportExcel'])
  assert.match(nav.serverSideType, /VbHome$/)
})

test('primaryToolbarButton: manda el wire; si calla, la última que no sea de vuelta', () => {
  // The Spectra header shows the primary and the FIRST secondary; the rest goes to the `···`.
  // With a crud view's toolbar (nobody marked primary) `Edit` ended up hidden.
  const view = [
    { actionId: 'cancel-view', label: 'Back to list', chroming: 'outlined' },
    { actionId: 'new', label: 'Add another', chroming: 'outlined' },
    { actionId: 'edit', label: 'Edit', chroming: 'outlined' },
  ]
  assert.equal(primaryToolbarButton(view).actionId, 'edit')
  // what the wire declares wins, wherever it is
  const declared = [{ actionId: 'a', chroming: 'callToAction' }, { actionId: 'b', chroming: 'outlined' }]
  assert.equal(primaryToolbarButton(declared).actionId, 'a')
  // a toolbar of only back buttons promotes nothing (better no primary than one that takes you off the screen)
  assert.equal(primaryToolbarButton([{ actionId: 'cancel-edit' }, { actionId: 'back' }]), null)
  assert.equal(primaryToolbarButton([]), null)
  // editor: Cancel + Save → Save
  assert.equal(primaryToolbarButton([{ actionId: 'cancel-edit' }, { actionId: 'save' }]).actionId, 'save')
})

test('detalle de proceso (wire real): campos, pestañas, grid embebido y el componente del grafo', () => {
  // FORM page with tabs inside. It used to be claimed by the item-overview archetype
  // just for carrying a TabLayout, and ended up as tab labels with nothing under them:
  // neither the fields outside, nor the tables inside, nor the graph.
  const reg = reduceContexts(empty(), fx('wf-process'))
  const host = reg.contexts[HOST_ID]
  assert.equal(itemOverviewOf(host), null, 'sin panel de datos clave no es un item overview')

  // as in the chain: the Page title is painted by the header band, not by the content
  const titulo = summarizeHost(reg, '').title
  const bloques = hostContentOf(host, null, { title: titulo }) || []
  // the untitled card wrapping the page is NOT painted as a card: the content container
  // is already the frame, and with a panel it ended up as a box inside another
  assert.equal(bloques.length, 1)
  assert.equal(bloques[0].isCard, false)
  assert.equal(bloques[0].isPlain, true)
  const items = bloques.flatMap((b) => b.items)
  // the fields OUTSIDE the tabs: in the JET form layout of their FormLayout
  const campos = items.filter((a) => a.isFormLayout).flatMap((a) => a.fields)
  assert.ok(campos.some((f) => f.fieldId === 'id'))
  assert.ok(campos.some((f) => f.fieldId === 'name'))
  // the tab bar, whole and with the first one active
  const tabs = items.find((a) => a.isTabs)
  assert.ok(tabs, 'no se proyectó la barra de pestañas')
  assert.deepEqual(tabs.tabs.map((t) => t.label),
    ['Diagram', 'Steps', 'Messages', 'Errors', 'Resources', 'Variables'])
  assert.equal(tabs.selectedId, 'tab-0')
  // …and the content of the ACTIVE one: the graph, with its attributes already interpolated from the state
  const element = items.find((a) => a.isElement)
  assert.ok(element, 'el componente del grafo no se proyectó')
  assert.equal(element.name, 'eventconductor-workflow-graph')
  assert.equal(element.importUrl, '/eventconductor/workflow-graph.js')
  assert.ok(element.attributes.value && element.attributes.value.indexOf('${') < 0,
    'el value del grafo llegó sin interpolar')
  assert.ok(!items.some((a) => a.isGrid), 'la pestaña Diagram no tiene tablas')

  // another tab: its embedded grid, with columns and rows from the state
  const steps = (hostContentOf(host, null, { title: titulo, activeTab: 'tab-1' }) || [])
    .flatMap((b) => b.items).find((a) => a.isGrid)
  assert.ok(steps, 'no se proyectó la tabla de la pestaña Steps')
  assert.deepEqual(steps.columns.map((c) => c.headerText), ['Name', 'Status'])
  assert.ok(steps.rows.length > 0)
  // the status column arrives with its badge class precomputed (CSP)
  assert.match(steps.rows[0].status.badgeClass, /oj-badge/)
})

test('pestañas ANIDADAS: ids y pestaña activa por barra, sin mezclar la interior con la exterior', () => {
  const text = (t) => ({ type: 'ClientSide', metadata: { type: 'Text', text: t }, children: [] })
  const tab = (label, children, active) => ({ type: 'ClientSide', metadata: { type: 'Tab', label, active: !!active }, children })
  const tabLayout = (id, tabs) => ({ type: 'ClientSide', id, metadata: { type: 'TabLayout' }, children: tabs })
  // outer [General, Detalle]; inside Detalle another bar [General, Notas] — same label
  // «General» in both and the same id "_tabs" the backend sent before the fix
  const inner = tabLayout('_tabs', [tab('General', [text('interior general')]), tab('Notas', [text('interior notas')])])
  const outer = tabLayout('_tabs', [tab('General', [text('exterior general')]), tab('Detalle', [inner])])
  const ctx = { tree: outer, state: {} }
  const atomsOf = (opts) => (islandContentOf(ctx, opts) || []).flatMap((b) => b.items)
  const barsOf = (opts) => atomsOf(opts).filter((a) => a.isTabs)
  const textsOf = (opts) => atomsOf(opts).filter((a) => a.isText).map((a) => a.text)

  // initially: only the outer bar (the inner one lives in an inactive tab), the usual ids
  let bars = barsOf({})
  assert.equal(bars.length, 1)
  assert.deepEqual(bars[0].tabs.map((t) => t.id), ['tab-0', 'tab-1'])
  assert.equal(bars[0].barId, 'mateuContentTabs')
  assert.equal(bars[0].stripKey, '')
  assert.deepEqual(textsOf({}), ['exterior general'])

  // click on Detalle: the inner bar appears with its OWN ids (prefixed by its tab)
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

  // click on the 2nd INNER one: the outer one stays on Detalle (before, it jumped to its 2nd… or to the 1st)
  assert.equal(tabStripOf('tab-1/tab-1'), 'tab-1')
  assert.equal(tabStripOf('tab-1'), '')
  active = withActiveTab(active, 'tab-1/tab-1')
  assert.deepEqual(active, { '': 'tab-1', 'tab-1': 'tab-1/tab-1' })
  bars = barsOf({ activeTabs: active })
  assert.equal(bars[0].selectedId, 'tab-1')
  assert.equal(bars[1].selectedId, 'tab-1/tab-1')
  assert.deepEqual(textsOf({ activeTabs: active }), ['interior notas'])

  // and going back to the outer General does not forget the chosen inner one
  active = withActiveTab(active, 'tab-0')
  assert.deepEqual(textsOf({ activeTabs: active }), ['exterior general'])
  active = withActiveTab(active, 'tab-1')
  assert.deepEqual(textsOf({ activeTabs: active }), ['interior notas'])

  // compatibility: a single-id activeTab still drives the first-level bar
  assert.equal(barsOf({ activeTab: 'tab-1' })[0].selectedId, 'tab-1')

  // two top-level SIBLING bars do not share ids either
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
  // the inner bar's content goes INSIDE its tab
  assert.deepEqual(overview.tabs[1].texts, ['i1', 'i2'])
})

// 17) Foldout (Phase 7): headers in metadata.panels, slotted content overview/panel-N.
// @FoldoutDetail: the (read-only) view of a record as a foldout — overview as a property
// list, one panel per section with content; empty things do not travel (backend FoldoutDetailSyncTest).
test('una vista @FoldoutDetail proyecta overview en propiedades y paneles solo con contenido', () => {
  const { contexts } = reduceContexts(empty(), fx('crud-view-foldout'))
  const foldout = foldoutOf(contexts['fv_app'])
  assert.ok(foldout)
  const rows = foldout.overview.blocks.flatMap((b) => b.items || []).filter((i) => i.isPropertyRow)
  // a lookup is read by its label (data['hotel-label']), not by the code
  assert.deepEqual(rows.map((r) => [r.label, r.value]), [['Locator', 'QN29HB'], ['Hotel', 'MRU01 — Riu Demo Mauricio'], ['Total', '306.00 EUR']])
  assert.deepEqual(foldout.panels.map((p) => [p.title, p.open]), [['Titular', true], ['Seguimiento', false]])
  const fields = foldout.panels[0].blocks.flatMap((b) => b.items || []).flatMap((i) => i.fields || [])
  assert.deepEqual(fields.map((f) => [f.fieldId, f.value, f.readonly]), [['holder', 'Giulia Keller', true]])
})

// The real view of an ec-demo1 booking with @FoldoutDetail: the read-only lookups
// (hotel, channel) travel as '<field>-label' with the label in data — the overview reads it from there.
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

// The page badge (@Status «Confirmed») heads the foldout's overview: the web paints it
// next to the title and the VB header has no room for it.
test('el overview @FoldoutDetail lleva la insignia de estado de la página, con la clase badge de JET', () => {
  const { contexts } = reduceContexts(empty(), fx('crud-view-foldout-booking'))
  const foldout = foldoutOf(contexts[HOST_ID])
  assert.deepEqual(foldout.badges.map((b) => [b.label, b.badgeClass]),
    [['Confirmed', 'oj-badge oj-badge-success oj-badge-subtle']])
  // the first block is PLAIN and carries the badge as an atom: the overview template does not paint
  // a loose isBadge block (only isCard/isPlain), so the badge was not visible
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

// 18) Wizard (Phase 8): the wire's ProgressSteps → the guided-process train; the current step
//     travels as status 'current' and the step's fields/buttons go through the existing branches.
test('wizardOf proyecta los pasos y el paso actual; el form del paso fluye como form normal', () => {
  const { contexts } = reduceContexts(empty(), fx('load-wizard'))
  const host = contexts[HOST_ID]
  const wizard = wizardOf(host)
  assert.deepEqual(wizard.steps.map((s) => s.id), ['cliente', 'envio', 'pago'])
  assert.equal(wizard.currentStep, 'cliente')
  assert.equal(host.pageType, 'process')
  // the current step is a normal form for the widgetFor switch…
  const metadata = dynFormMetadataOf(host.tree)
  assert.deepEqual(Object.keys(metadata), ['name', 'email'])
  // …and the navigation buttons are normal actions
  assert.deepEqual(actionsOf(host.tree).map((a) => a.actionId).sort(), ['back', 'next'])
})

// 19) Boundaries (Phase 9): an ISLAND's fields/actions do not leak into the host's form.
test('el host de una isla no ve los campos ni las acciones del otro lado de la frontera', () => {
  const { contexts } = reduceContexts(empty(), fx('island-host'))
  const host = contexts[HOST_ID]
  const metadata = dynFormMetadataOf(host.tree)
  assert.deepEqual(Object.keys(metadata), ['room', 'status']) // without paxName/note (the island's)
  assert.ok(!actionsOf(host.tree).some((a) => a.actionId === 'edit')) // the Edit belongs to the island
})

// 20) Mediator/island route-flip: the inner route keeps the query markers.
test('composeInnerRoute: base + flip + marcadores (?_embeddedMediator sigue viajando)', () => {
  assert.equal(
    composeInnerRoute('/guest-note?_embeddedMediator=1&_inline=1', '/edit'),
    '/guest-note/edit?_embeddedMediator=1&_inline=1')
  assert.equal(composeInnerRoute('/products', '/new'), '/products/new')
  assert.equal(composeInnerRoute('/x?m=1', '/'), '/x?m=1')
})

// 21) Gates 1.3/1.6: page banners and pageWidth anatomy.
test('bannersOf mapea Page.banners al messages-banner; pageStyleOf aplica la anatomía RDS', () => {
  const { contexts } = reduceContexts(empty(), fx('load-form'))
  // load-form (Person) carries no banners
  assert.deepEqual(bannersOf(contexts[HOST_ID]), [])
  // anatomy: person (no pageWidth) → fixed; foldout → edgeToEdge
  // fixed: capped at 1408px, and the cap leaves BOTH gutters — a narrow area (the editor's canvas,
  // a laptop) must not hug the left edge with the only blank strip on the right
  const fixedStyle = pageStyleOf(contexts[HOST_ID])
  assert.equal(fixedStyle.maxWidth, 'min(1408px, calc(100% - 24px - max(24px, calc((100vw - 1536px) / 2 + 64px))))')
  assert.equal(fixedStyle.margin, '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto')
  const foldout = reduceContexts(empty(), fx('load-foldout')).contexts[HOST_ID]
  assert.equal(foldout.pageWidth, 'edgeToEdge')
  assert.deepEqual(pageStyleOf(foldout), { maxWidth: 'none', margin: '0', padding: '0' })
})

// 22) Composed archetypes: welcome, general overview and item overview are projected from the core.
test('welcomeLookOf: el hero rota al entrar en la welcome y se queda mientras se sigue en ella', () => {
  const ctx = reduceContexts(empty(), fx('load-welcome')).contexts[HOST_ID]
  const key = welcomeKeyOf(ctx)
  assert.ok(key, 'la welcome tiene una clave')
  const first = welcomeLookOf(key, null, () => 0.5)
  assert.equal(first.theme, 'dark-plum')
  assert.ok(first.illu.endsWith('illust-welcome-banner-fg-03.png'))
  // the response of an action launched from it (a CTA that navigates) re-projects it: same look
  assert.equal(welcomeLookOf(key, first, () => 0), first)
  // another welcome, or re-entering after another screen (no welcome was painted): rotates
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

// 23) Inline editing (@InlineEditing): editable columns → grid + editor templates per
// type; the commit is update-row + parameters._editedRow and answers ONLY a success toast
// (no fragments — the edited value is already on the client).
test('inline editing: plantillas por editorType y update-row = toast sin fragments', () => {
  const stock = fx('load-stock') // the mediator's content; its arrival at the host is simulated
  stock.fragments[0].targetComponentId = ''
  const listing = listingOf(reduceContexts(empty(), stock).contexts[HOST_ID])
  assert.equal(listing.display, 'grid')
  assert.equal(listing.editable, true)
  const byField = Object.fromEntries(listing.columns.map((c) => [c.field, c.template]))
  assert.equal(byField.id, undefined) // @ReadOnly → no editor
  assert.equal(byField.product, 'cellEditText')
  assert.equal(byField.units, 'cellEditNumber')
  assert.equal(byField.price, 'cellEditNumber')
  assert.equal(byField.active, 'cellEditBoolean')
  const inc = fx('update-row')
  assert.equal((inc.fragments || []).length, 0)
  assert.equal(inc.messages.length, 1)
  assert.equal(inc.messages[0].variant, 'success')
})

// 24) Front office: the check-in/out/in-house "listings" are TaskQueues with the data
// INLINE in the metadata (groups → cards with badges); the detail panel's EmptyState
// is projected separately. Click contract: actionId with parameters._item = id.
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

// 24 bis) NOT FOUND: the route names a record that does not exist (a deleted booking). The server no
// longer answers an error toast over an empty page but a NotFound component (captured from
// mvc-app1: /hotel/stays/FO-X6JB7F, whose view(id) throws NoSuchElementException). It is projected to
// the full-page oj-sp-empty-state: the exception's message as the headline and the way back to the parent
// as its navigationAction.
test('not found: notFoundOf proyecta titular, texto y vuelta atrás del componente NotFound', () => {
  const reg = reduceContexts(empty(), fx('load-not-found'))
  const tree = reg.contexts[HOST_ID].tree
  const page = notFoundOf(tree, 'en-US')
  assert.equal(page.title, 'Stay FO-X6JB7F not found')
  assert.equal(page.message, 'It may have been deleted, or the link is wrong.')
  assert.equal(page.backRoute, '/hotel/stays')
  assert.deepEqual(page.navigationAction, { label: 'Go back', display: 'on' })
  // it is not an error: neither a toast nor host content to paint as well
  assert.equal(reg.effects.toasts.length, 0)
  // any other screen is not a not-found
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

// 25) Front office: the TaskQueue's detail is an App-flavoured mediator island (a
// ClientSide App MEDIATOR node with a stable id and homeRoute/homeConsumedRoute/homeServerSideType
// in its metadata) and its content (the embedded CheckInWizard) is projected as precomputed
// display BLOCKS (is* flags, ${state.x} texts interpolated).
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
  assert.ok(atoms.every((a) => !a.isText || !a.text.includes('${'))) // interpolation done
  assert.ok(atoms.some((a) => a.isButtons && a.buttons.some((btn) => btn.actionId === 'next')))
})

// 25 bis) An EntityHeader's chips carry their colour's tone, the normal chip too: in
// Vaadin it is the primary, and here it fell back to neutral — a Platinum tier and a Silver one looked the same.
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

// 26) Front office: business atoms — ResourceGrid/OfferCard (room), AddOnPicker/
// StatusList (extras/confirm), Ledger/PaymentPicker (check-out), Meter/Stat (in house).
// Dispatch contracts = those of the shared web renderer (_item / _method / _added+_total).
test('front-office: átomos ResourceGrid/AddOns/Ledger/Payment/Meter proyectan del wire real', () => {
  // money is written in the UI's locale (i18n.moneyText): this front office is a German-grouped one
  setChromeLanguage('de-DE')
  try {
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
  } finally { setChromeLanguage('') }
})

// 27) NESTED island (the check-in document): collectIslands detects the App node with its
// initialData (the host's SEED: stayId/paxIndex — it must travel as componentState on the
// load AND on every action, the server does not echo it); mergeNestedContent merges its atoms into
// the parent island's block MARKED fromNested (reading $application.variables in deep
// templates does not re-bind the contexts in VB's CSP evaluator).
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

// 28) Check-in operations checklist (Reserva 360, pending-arrival state): the
// TaskProgress banner projects a precomputed N-of-M (VB's CSP does not compare) and the StatusList
// carries the quick actions per operation (Create wifi / Write key → {_item}).
test('checklist check-in: TaskProgress N-de-M + StatusList con acciones por operación', () => {
  const atoms = islandContentOf(fx('fo-reserva-arriving')).flatMap((b) => b.items)
  const tp = atoms.find((a) => a.isTaskProgress)
  assert.equal(tp.label, 'Operaciones de check-in')
  assert.equal(tp.max, 7)
  assert.equal(tp.valueText, tp.value + ' of 7')
  assert.match(tp.panelClass, /oj-panel/)
  const ops = atoms.filter((a) => a.isStatusList)
      .find((sl) => sl.items.some((i) => i.title === 'Tarjeta wifi'))
  // columns=3 → responsive grid: oj-flex wrapper + each row oj-flex-item oj-md-4
  assert.match(ops.wrapClass, /oj-flex/)
  assert.equal(ops.items[0].gridCell, true)
  assert.match(ops.items[0].cellClass, /mateu-grid-cell/) // the cockpit's fixed grid (22rem)
  assert.match(ops.wrapClass, /mateu-grid/)
  const huespedes = atoms.filter((a) => a.isStatusList)
      .find((sl) => sl.items.some((i) => i.title === 'Klaus Hoffmann'))
  // ONE-column list with actions → STACKED branch (h3 without avatar), not cards
  assert.equal(huespedes.wrapClass, '')
  assert.ok(!huespedes.items[0].gridCell)
  assert.equal(huespedes.items[0].hasActions, true)
  const wifi = ops.items.find((i) => i.title === 'Tarjeta wifi')
  assert.equal(wifi.actions.length, 1)
  assert.equal(wifi.actions[0].label, 'Crear')
  assert.equal(wifi.actions[0].actionId, 'opWifi')
  assert.deepEqual(wifi.actions[0].parameters, { _item: 'wifi' })
  // pax rows: TWO actions (scan / by hand) and STACKED projection (hasActions)
  const paxRow = huespedes.items.find((i) => i.title === 'Acompañante 2')
  assert.equal(paxRow.hasActions, true)
  assert.deepEqual(paxRow.actions.map((a) => a.actionId), ['escanearPax', 'rellenarPax'])
  assert.deepEqual(paxRow.actions[0].parameters, { _item: '2' })
})

// 29) Zoned row (@Zones 36/64 of the Reserva 360): the HorizontalLayout of flex-calc
// columns is projected as column blocks (colClass in twelfths: 36→4, 64→8) and
// hostContentOf stamps blockClass (the non-zoned ones go to oj-sm-12).
test('zonas: huéspedes md-4 a la izquierda y operativa md-8 a la derecha', () => {
  const ctx = fx('fo-reserva-arriving')
  const blocks = hostContentOf(ctx, null, { dropEntityHeader: true })
  const zoned = blocks.filter((b) => /oj-md-/.test(b.blockClass))
  assert.equal(zoned.length, 2)
  assert.match(zoned[0].blockClass, /oj-md-4/) // 36% → 4/12 (guests, card)
  assert.ok(zoned[0].isCard)
  assert.match(zoned[1].blockClass, /oj-md-8/) // 64% → 8/12 (operativa)
  assert.ok(zoned[1].items.some((a) => a.isTaskProgress))
  assert.ok(blocks.every((b) => b.blockClass))
})

// 30) A LongTask's progress dialog (host SSE: the 360's escanearPax): the watcher
// consumes the Add of the Dialog-with-ProgressBar and the state-only ones addressed to its id; the last
// increment brings _closeAfterMillis + the refresh commands in rest.
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
  assert.equal(last.rest.fragments.length, 0) // the dialog's fragment is NOT reduced
})

// 31) Native ITEM OVERVIEW: entity page with the NARROW zone first (key-data
// panel + wide main) → oj-sp-item-overview-page; wide-first is still a
// general overview (null here). The EntityHeader goes to the oj-sp-item-overview (badge from the
// first Chip, subtitle WITHOUT badges) and the toolbar's "Volver…" to the goToParent arrow.
test('item overview: zona estrecha primero → panel clave + main; ancha primero → null', () => {
  const ctx = fx('fo-reserva-arriving')
  const entity = entityHeaderOf(ctx)
  // the pure entity page is ONLY the two zones (the arriving fixture also carries
  // an oj-sm-12 header band; the detector requires exactly two blocks, like the gop)
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
  assert.equal(iop.overview.subtitle, entity.subtitlePlain) // without the concatenated badges
  assert.ok(iop.overview.badge, 'el primer Chip del EntityHeader es el badge del panel')
  assert.equal(iop.overview.badge.status, 'neutral') // color contrast → neutral
  assert.equal(iop.overview.blocks.length, 1)
  assert.match(iop.overview.blocks[0].blockClass, /oj-sm-12/) // at the slot's full width
  assert.equal(iop.main.blocks.length, 1)
  assert.ok(iop.main.blocks[0].items.some((a) => a.isTaskProgress)) // the operations are the main
  assert.ok(iop.back.show)
  assert.equal(iop.back.actionId, 'volverReserva')
  assert.equal(iop.back.label, 'Volver a la reserva') // the label travels to translations.goToParent
  assert.equal(iop.secondary.length, 1)
  assert.equal(iop.secondary[0].id, 'otra')
  // wide first (general overview anatomy) is NOT an item overview
  assert.equal(itemOverviewPageOf(entity, [blocks[1], blocks[0]].map((b) => b), toolbar), null)
})

// 32) Decision modal (Dialog): ALL the content's buttons move to the footer WITH their
// parameters — the group check-in modal offers "Check-in de <name>" (with _item)
// besides "Volver al listado" (in a drawer, buttons with parameters stay in
// the content: they are option lists).
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
  assert.equal(siguiente.parameters._item, 'st-ana') // the _item travels with the action
  assert.equal(siguiente.chroming, 'callToAction')
  // and the content NO longer carries buttons (they would be duplicated)
  assert.ok(!overlay.content.some((b) => b.items.some((a) => a.isButtons)))
})


// ── transport resilience ─────────────────────────────────────────────────────────────────
// This core shares nothing with libs/mateu, so the same guarantees are tested here
// again. What changes compared with the web renderers is the SHAPE of the failure: fetch resolves
// a 5xx as success and signals a network failure with a TypeError without a code.

test('clasifica un 5xx como fallo de servidor reintentable, con su status', () => {
  const err = Object.assign(new Error('HTTP 503'), { status: 503 })
  const f = classifyRequestFailure(err)
  assert.equal(f.kind, 'server')
  assert.equal(f.retryable, true)
  assert.equal(f.status, 503)
  assert.ok(f.message.includes('503'))
})

test('un TypeError de fetch se lee como sin-conexión aunque el navegador diga que hay red', () => {
  // "Failed to fetch" is ALL fetch gives: with no response, the lack of a response is the proof.
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
  // an ABSENT id is unknown work, and must not be confused with the load's empty one
  assert.ok(!isIdempotentAction(undefined))
  // the wire flag is an opt-IN: it never takes a known read off the list
  assert.ok(isIdempotentAction('recalcular', true))
  assert.ok(isIdempotentAction('search', false))
})

test('reintenta una lectura transitoria y JAMÁS una escritura', () => {
  const timeout = classifyRequestFailure(Object.assign(new Error('x'), { __mateuTimedOut: true }))
  const server = classifyRequestFailure(Object.assign(new Error('x'), { status: 500 }))
  assert.ok(shouldRetry(timeout, 1, { idempotent: true }))
  assert.ok(shouldRetry(server, 1, { idempotent: true }))
  // after a timeout we don't know whether the server applied it: repeating risks a duplicate
  assert.ok(!shouldRetry(timeout, 1, { idempotent: false }))
  assert.ok(!shouldRetry(server, 1, { idempotent: false }))
  // offline is handled by connectivity, not by the retry loop
  const offline = classifyRequestFailure(new TypeError('Failed to fetch'), { online: false })
  assert.ok(!shouldRetry(offline, 1, { idempotent: true }))
  // and there is budget
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
  // the lock is per (component, action): another action or another component is not affected
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
    // N attempts = ONE loading state and ONE outcome as far as the UI is concerned
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
  // The bug: opening ANY menu option showed the same screen with no search form or listing.
  // The route's 1st load arrives as a mediator App with ClientSide/App shape (the same as the
  // bootstrap, but requested for a SUB-route), which reduceContexts absorbs as the shell; mediatorOf
  // does not see it and the 2nd load —the crud's content— was not fired. Now it is taken from the increment.
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
    // The 2nd hop is the one carrying the mediator App's consumedRoute + serverSideType.
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
  // The fix's guardrail: only a navigation BELOW the root looks for content. The app's root
  // is the shell/home and the bootstrap resolves it — following it here would be one load too many.
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
  // What this renderer did not do: it painted the label the shell wrote and nothing below it.
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
  // with MENU_ON_TOP its two screens stick to the first level; as sections, each one
  // would be a section without a second level
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => remoteApp([
    { label: 'Page', route: '/remote/page' }, { label: 'Things', route: '/remote/things' },
  ], '/remote') })
  try {
    const mount = () => [{ remote: true, baseUrl: '/_remote', route: '', path: '/remote', label: 'Remote', shellLabel: true }]
    const sections = await expandRemoteMenus(mount(), { sections: true })
    assert.deepEqual(sections.map((o) => o.label), ['Remote'])
    assert.deepEqual(sections[0].submenus.map((o) => o.label), ['Page', 'Things'])
    // the other variants: the label the shell declared groups them too (labelledByShell)
    const grouped = await expandRemoteMenus(mount())
    assert.deepEqual(grouped.map((o) => o.label), ['Remote'])
    assert.deepEqual(grouped[0].submenus.map((o) => o.label), ['Page', 'Things'])
    // without a declared label, spliced as they come
    const flat = await expandRemoteMenus([{ ...mount()[0], shellLabel: false }])
    assert.deepEqual(flat.map((o) => o.label), ['Page', 'Things'])
  } finally { globalThis.fetch = original }
})

atest('expandRemoteMenus (MENU_ON_TOP…): a declared label groups the pod\'s entries; routes still go to the pod', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => remoteApp([
    { label: 'Inicio', route: '/inicio' }, { label: 'Libros', route: '/libros' },
  ], '', 'BibliotecaHome') })
  try {
    const menu = await expandRemoteMenus([
      { label: 'Inicio', route: '/inicio-shell', submenus: [] },
      { remote: true, baseUrl: 'https://b/app', route: '', path: '/biblioteca', label: 'Biblioteca', icon: 'vaadin:book', shellLabel: true },
    ])
    assert.deepEqual(menu.map((o) => o.label), ['Inicio', 'Biblioteca'])
    assert.equal(menu[1].path, '/biblioteca')
    assert.equal(menu[1].icon, 'vaadin:book')
    assert.deepEqual(menu[1].submenus.map((o) => o.route), ['/inicio', '/libros'])
    // the deep link is claimed by route, as before: the group changes the menu's shape only
    assert.equal(remoteRouteOf('/libros').baseUrl, 'https://b/app')
    assert.equal(remoteRouteOf('/libros').serverSideType, 'BibliotecaHome')
    // the projected nav: a group with the pod's two screens
    const nav = shellNavOf({ shell: { variant: 'MENU_ON_TOP', menu } })
    assert.equal(nav.mode, 'subheader')
    assert.deepEqual(nav.menuTree[1].children.map((c) => c.id), ['/inicio', '/libros'])
    // a HIDDEN labelled pod: grouped the same way, hidden
    const hidden = await expandRemoteMenus([{ remote: true, baseUrl: 'https://b/app', route: '', label: 'Biblioteca', shellLabel: true, visible: false }])
    assert.equal(hidden.length, 1)
    assert.equal(hidden[0].visible, false)
    assert.ok(hidden[0].submenus.every((o) => o.visible === false))
  } finally { globalThis.fetch = original }
})

atest('expandRemoteMenus warns, naming both sources, when the shell and a pod (or two pods) claim a route', async () => {
  const original = globalThis.fetch
  const originalWarn = console.warn
  const said = []
  console.warn = (m) => said.push(String(m))
  globalThis.fetch = async (url) => {
    if (String(url).indexOf('https://down') === 0) throw new TypeError('Failed to fetch')
    return { ok: true, json: async () => remoteApp([{ label: 'Inicio', route: '/inicio' }, { label: 'Home', route: '/' }, { label: 'Estudiantes', route: '/estudiantes' }], '') }
  }
  try {
    await expandRemoteMenus([
      { label: 'Inicio', route: '/inicio', submenus: [] },
      { remote: true, baseUrl: 'https://a/app', route: '', label: 'Alumnado', shellLabel: true },
      { label: 'Más', submenus: [{ remote: true, baseUrl: 'https://b/app', route: '', label: 'Biblioteca', shellLabel: true }] },
      { remote: true, baseUrl: 'https://down/app', route: '', label: 'Caída' },
    ])
    assert.deepEqual(said.filter((m) => m.indexOf('route collision') >= 0), [
      routeCollisionMessage({ route: '/inicio', first: 'the shell', second: 'RemoteMenu "Alumnado" (https://a/app)' }),
      routeCollisionMessage({ route: '/inicio', first: 'the shell', second: 'RemoteMenu "Biblioteca" (https://b/app)' }),
      routeCollisionMessage({ route: '/estudiantes', first: 'RemoteMenu "Alumnado" (https://a/app)', second: 'RemoteMenu "Biblioteca" (https://b/app)' }),
    ])
    assert.match(said[0], /"\/inicio" is claimed by the shell and by RemoteMenu "Alumnado" \(https:\/\/a\/app\)/)
  } finally { globalThis.fetch = original; console.warn = originalWarn }
})

test('routeCollisionsOf (port of navTree.ts routeCollisions): homes, groups and pods that did not answer claim nothing', () => {
  const a = { remote: true, baseUrl: 'https://a/app', label: 'Alumnado', shellLabel: true }
  const b = { remote: true, baseUrl: 'https://b/app', label: 'Biblioteca', shellLabel: true }
  const down = { remote: true, baseUrl: 'https://c/app', label: 'Plantillas' }
  const menu = [{ label: 'Inicio', route: '/inicio' }, { label: 'Home', route: '' }, a, { label: 'Más', route: '', submenus: [b, down] }]
  const answers = new Map([
    [a, { menu: [{ label: 'Inicio', route: '/inicio/' }, { label: 'Estudiantes', route: '/estudiantes' }, { label: 'Home', route: '/' }] }],
    [b, { menu: [{ label: 'Libros', route: '/libros', submenus: [{ label: 'Estudiantes', route: '/estudiantes?x=1' }] }, { label: 'Otra', route: '/otra' }] }],
  ])
  assert.deepEqual(routeCollisionsOf(menu, answers, [a, b, down]), [
    { route: '/inicio', first: 'the shell', second: 'RemoteMenu "Alumnado" (https://a/app)' },
    { route: '/estudiantes', first: 'RemoteMenu "Alumnado" (https://a/app)', second: 'RemoteMenu "Biblioteca" (https://b/app)' },
  ])
})

atest('expandRemoteMenus registra a qué pod va cada entrada adoptada', async () => {
  // The half that makes the menu good for something: without this the navigation would call the
  // shell's base, which does not know that route.
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
    // Also through the form without the leading slash, which is how the nav sees it
    assert.ok(remoteRouteOf('workflow/processes'))
  } finally { globalThis.fetch = original }
})

atest('un deep-link bajo un GRUPO de un pod que no es ninguna de sus hojas va a ese pod', async () => {
  // /tasksgrp/task/<id> —a task's page— is not in the menu: its leaves are /tasksgrp/tasks and
  // /tasksgrp/executions, and the group containing them is /tasksgrp. Without registering the group it went out to
  // the shell's backend, which answered "Not found.". The shell (server) already claims it this way.
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
    // the leaf still beats the group, and what does not hang from the group does not belong to the pod
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
    // the fallback stays, disabled and saying why — the same as in the web renderer
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
    // declared: the shell decides; undeclared (the field name): the pod decides, as always
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
  // the group's path is /admin/forms; the pod's screens live under /forms
  assert.deepEqual(autoTrail(menu, '/forms/tasks', { title: 'Tareas' }), [{ text: 'Admin' }, { text: 'Forms' }, { text: 'Tareas' }])
  // a real entry beats the prefix of a section of the same length
  assert.deepEqual(autoTrail(menu, '/notices/7', { title: 'Aviso 7' }), [{ text: 'Notices', route: '/notices' }, { text: 'Aviso 7' }])
  assert.deepEqual(autoTrail(menu, '/otra', { title: 'x' }), [])
})

atest('una remota OCULTA no sale en el menú pero sus rutas quedan registradas (deep-link)', async () => {
  // `@Menu @Hidden RemoteMenu inbox`: it is reached from a header widget. No entry
  // in the menu, but a reload of /inbox/pending must still go to its pod.
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
    // still in the tree, hidden: it is not painted, but a page under it has its breadcrumbs
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
    // the marker stays, hidden: the section is known by its prefix
    assert.deepEqual(autoTrail(menu, '/inbox/tasks', { title: 'Tareas' }), [{ text: 'Inbox' }, { text: 'Tareas' }])
  } finally { globalThis.fetch = original }
})

test('routeFlipOf: un fragmento solo-estado con _route nuevo pide recargar la ruta interna', () => {
  // What a PAGE crud answers to a row click: neither a component nor a navigation, a
  // new `_route`. Whoever does not follow it stays on the listing without a single error in sight.
  const stateOnly = { fragments: [{ targetComponentId: '', component: null, state: { _route: '/2CSXZN' } }] }
  const ctx = { state: { _route: '/2CSXZN' }, outbound: { route: '/booking/bookings' } }
  assert.equal(routeFlipOf({ _route: 'list' }, ctx, stateOnly), '/booking/bookings/2CSXZN')
  // without a _route change there is no flip…
  assert.equal(routeFlipOf({ _route: '/2CSXZN' }, ctx, stateOnly), null)
  // …nor when the response BRINGS a component (that already repaints on its own)
  const withComponent = { fragments: [{ component: { type: 'ServerSide' }, state: { _route: '/2CSXZN' } }] }
  assert.equal(routeFlipOf({ _route: 'list' }, ctx, withComponent), null)
  // the embedded mediator's query markers keep travelling
  const embedded = { state: { _route: '/edit' }, outbound: { route: '/pax?_embeddedMediator=1' } }
  assert.equal(routeFlipOf({}, embedded, { fragments: [{ component: null }] }),
    '/pax/edit?_embeddedMediator=1')
})

test('mediatorBaseOf: un detalle abierto por enlace directo pega su Edit a lo consumido, no a su ruta', () => {
  // real wire (rw.ec1, booking QN29HB pasted in the bar): the load goes with route
  // /booking/bookings/QN29HB and consumedRoute /booking/bookings; the Edit answers _route
  // /QN29HB/edit. Appended to the route it gave /booking/bookings/QN29HB/QN29HB/edit.
  const deepLinked = { route: '/booking/bookings/QN29HB', consumedRoute: '/booking/bookings' }
  assert.equal(mediatorBaseOf(deepLinked), '/booking/bookings')
  const stateOnly = { fragments: [{ component: null, state: { _route: '/QN29HB/edit' } }] }
  assert.equal(routeFlipOf({}, { state: { _route: '/QN29HB/edit' }, outbound: deepLinked }, stateOnly),
    '/booking/bookings/QN29HB/edit')
  // from the listing they already matched
  assert.equal(mediatorBaseOf({ route: '/booking/bookings', consumedRoute: '/booking/bookings' }), '/booking/bookings')
  // without consumedRoute (embedded mediator) the route stays, with its query
  assert.equal(mediatorBaseOf({ route: '/pax?_embeddedMediator=1' }), '/pax?_embeddedMediator=1')
  // a 'null' route is never appended
  assert.equal(mediatorBaseOf({ route: 'null' }, ''), '')
  assert.equal(mediatorBaseOf({ route: 'null', consumedRoute: '/integrations' }, '/integrations/7'), '/integrations')
})

atest('un pod que contesta con un GRUPO: la hoja adoptada conserva su ruta compuesta', async () => {
  // The REAL shape of a federated menu (ec-demo1): the shell declares the `Booking` section as
  // remote, and the pod does NOT answer with loose leaves but with ITS group — `Booking` with
  // `/booking/bookings` under it. The nav trims the parent's prefix off the children because a composed
  // LOCAL menu route does not resolve via sync; applied to a leaf of another pod, that trim
  // left it at `/bookings`, which nobody serves: it neither matches the remote route registry
  // nor exists in the shell. The result was a crud that answered "Not found." when opened.
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
    // …and through that route the registry knows which pod to go to, with which consumedRoute and which serverSideType
    const where = remoteRouteOf('/booking/bookings')
    assert.equal(where.baseUrl, '/_booking')
    assert.equal(where.consumedRoute, '')
    assert.equal(where.serverSideType, 'BookingHome')
  } finally { globalThis.fetch = original }
})

atest('una shell federada de TRES niveles conserva el nivel de abajo', async () => {
  // The shell groups `Admin` and puts three pods INSIDE it; each pod answers with ITS group and its
  // screens under it. The resulting tree has three levels, and the projector only modelled two:
  // the pod's group was left as if it were a screen —click → group route → empty content— and
  // its screens appeared nowhere.
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
  // Entering through the link to a process's detail showed the LISTING: the mediator answers with
  // rootRoute = the requested route (the whole one) and homeConsumedRoute = its own
  // (/workflow/processes). Sending the whole one as consumedRoute the server serves the crud's
  // default view.
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
  // Only the MENU's routes reach the registry. A deep link to a process's detail
  // (/workflow/processes/<id>) matched nothing and went out to the shell's backend → "Not found.".
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
    // what does not hang from a registered route is NOT adopted (a prefix is not a "starts with").
    // /workflow/processesXX no longer works as an example: it hangs from the GROUP /workflow that another test
    // registered for the same pod, and under a group of the pod, it belongs to the pod
    assert.equal(remoteRouteOf('/workflowXX/processes'), undefined)
    assert.equal(remoteRouteOf('/workflow/processes').baseUrl, '/_workflow')
    assert.equal(remoteRouteOf('/otra/cosa'), undefined)
  } finally { globalThis.fetch = original }
})

atest('una hoja LOCAL bajo un grupo se navega por su ruta compuesta (como Vaadin)', async () => {
  // The counterpoint to the previous test: without a baseUrl there is no pod. The composed route (/gestion/person)
  // resolves with the app's serverSideType — loadMenuRouteInto adds it, and falls back to the terminal if
  // the server does not recognise it (a group RouteLink); see test-pms.mjs.
  const nav = shellNavOf({ shell: { menu: [
    { label: 'Gestion', route: '/gestion', submenus: [{ label: 'Person', route: '/gestion/person' }] },
  ] } })
  assert.deepEqual(nav.menuTree[0].children.map((c) => c.id), ['/gestion/person'])
})

atest('el contexto recuerda de qué pod se cargó, y sus acciones vuelven allí', async () => {
  // The second half of the same failure: with the route already resolved properly, the crud painted columns and
  // toolbar but WITHOUT rows — the `search` trigger the listing asks for on load went out to the shell's
  // base, which answers 200 with zero fragments. An empty listing and not one error in sight.
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
  // The regression this pins: the bootstrap authenticated and stored the token, and NOTHING read it.
  // Every call went out without the header, the gateway returned 401, and the classifier translated it into
  // "your session is no longer valid" — with the session perfectly alive. The console loaded without a
  // single menu.
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
    // And without overwriting what the caller already brought.
    assert.equal(seen.headers['Content-Type'], 'application/json')
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    connectivity.reset()
  }
})

atest('fetchWithPolicy ante un 401 pide reautenticar y reenvía UNA vez con el token nuevo', async () => {
  // The token expires between two refreshes (sleeping tab): the request comes back 401. Instead of
  // showing "your session is no longer valid", mateu-session-expired is fired; the bootstrap refreshes,
  // leaves the new token and calls retry, and the request goes out again — with THAT token.
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

atest('a LongTask stream answered 401 re-authenticates and is resent ONCE with the new token (RN/IntelliJ parity)', async () => {
  // External review 2026-10-18: React Native and IntelliJ failed the stream at once; this renderer's
  // SSE leg goes through fetchWithPolicy — pinned here so it stays that way.
  connectivity.reset()
  const sent = []
  let token = 'expired'
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const originalDocument = globalThis.document
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? token : null) }
  globalThis.document = new EventTarget()
  globalThis.document.addEventListener('mateu-session-expired', (e) => {
    e.preventDefault()
    token = 'renewed'
    e.detail.retry()
  })
  globalThis.fetch = async (url, init) => {
    sent.push([url, init.headers.Authorization])
    return init.headers.Authorization === 'Bearer renewed'
      ? { ok: true, text: async () => 'data: {"fragments":[{"step":1}]}\n\n' }
      : { ok: false, status: 401, text: async () => '' }
  }
  try {
    const increments = await runMateuActionSse('https://x', null, '/long-task', 'runLongTask', {})
    assert.deepEqual(sent, [['https://x/mateu/v3/sse/long-task', 'Bearer expired'], ['https://x/mateu/v3/sse/long-task', 'Bearer renewed']])
    assert.deepEqual(increments, [{ fragments: [{ step: 1 }] }])
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
    // With someone who re-authenticates but the 401 persists: one retry, no more.
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
  // The tab comes back from the background: the inbox badge and the banner sync go out with the
  // expired token and come back 401 together. A single forced refresh, not one per request.
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
    // the refresh takes a while: the second 401 arrives with this one still running
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
  // The visibilitychange already left the new token while the request was flying with the old one: it is enough
  // to resend, without throwing away the freshly issued token by asking for another.
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
      token = 'nuevo' // the bootstrap's refresh lands with the request in flight
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
      (e) => e.failure && e.failure.kind === 'unauthorized' && /session is no longer valid/.test(e.failure.message))
    assert.equal(calls, 1)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    globalThis.document = originalDocument
    connectivity.reset()
  }
})

atest('fetchWithPolicy: un 403 no refresca la sesión ni dice que haya caducado', async () => {
  // A 403 is a real refusal (e.g. an action the view does not declare): neither is re-authentication
  // requested nor is the user sent to a login that does not fix it.
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
  // Without a token we carry on: let the backend answer. An explained 401 is better than a
  // blank screen that has asked nobody.
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
        assert.equal(e.failure.kind, 'server')     // the error travels classified
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
    // simulates the server that never answers: it only ends when we abort
    init.signal.addEventListener('abort', () => {
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    })
  })
  try {
    await assert.rejects(
      () => fetchWithPolicy('http://x/', {}, { actionId: 'save', timeoutMillis: 60 }),
      (e) => {
        assert.equal(e.failure.kind, 'timeout')   // not 'cancelled': the user does care
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

// ── static bundle (backend-less mode) ──────────────────────────────────────────────────────
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
  assert.equal(getBundledIncrement('orders/42'), undefined) // a template is not an exact entry
  const inc = matchBundledTemplate('orders/42')
  assert.ok(inc)
  assert.equal(inc.fragments[0].state.id, '42')  // the real value wins over the placeholder
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

// ── shipped route registry (the mount's routes.yaml, inside the manifest) ──────────────────────
// The precedence has to be IDENTICAL to the server's and to libs/mateu's; otherwise the same
// route would behave differently depending on the renderer or on whether there is a backend:
//   fixed > path > what the increment already brings > defaults
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
  // orders/:id is declared FIRST on purpose: the matching cannot depend on the order.
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

atest('bundle: under an app shell a route load INTO the shell takes contentJson, the bootstrap keeps json', async () => {
  const shell = { fragments: [{ component: { metadata: { type: 'App' } } }] }
  const screen = { fragments: [{ component: { metadata: { type: 'Page' } } }] }
  const manifest = { entries: [
    { syncPath: '_no_route', ok: true, json: JSON.stringify(shell) },
    { syncPath: 'orders', ok: true, json: JSON.stringify(shell), contentJson: JSON.stringify(screen) },
  ] }
  await loadBundleManifest('x', async () => ({ ok: true, json: async () => manifest }))
  try {
    // the shell's content slot: the screen, never the shell again (#557, nested shells)
    assert.equal(bundledIncrementFor('/orders', 'c', { content: true }).fragments[0].component.metadata.type, 'Page')
    assert.equal((await loadRoute('https://x', '/orders', 'c')).fragments[0].component.metadata.type, 'Page')
    // a fresh load keeps the exported json (the shell aimed at the route)
    assert.equal((await loadRoute('https://x', '/orders', 'c', { consumedRoute: '_empty' })).fragments[0].component.metadata.type, 'App')
    // the bootstrap: the root shell
    assert.equal(bundledIncrementFor('', 'shell').fragments[0].component.metadata.type, 'App')
  } finally {
    __setBundleForTests(undefined)
  }
})

test('bundle: the manifest URL comes from <mateu-ui bundleUrl>, as on the web renderers', () => {
  const doc = (attrs) => ({ querySelector: (sel) => (sel === 'mateu-ui' && attrs ? { getAttribute: (n) => (n in attrs ? attrs[n] : null) } : null) })
  assert.equal(bundleUrlOf(doc({ bundleUrl: '/manifest.json' })), '/manifest.json')
  assert.equal(bundleUrlOf(doc({ baseUrl: '' })), '')
  assert.equal(bundleUrlOf(doc(null)), '')
})

atest('bundle: on a static host the backend is only probed — its absence shows no error band', async () => {
  __setBundleForTests(new Map([['_no_route', { fragments: [{ targetComponentId: null, component: { menu: [] } }] }]]))
  connectivity.reset()
  const failures = []
  setTransportHooks({ onSettle: ({ failure }) => { if (failure) failures.push(failure) } })
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, status: 405, json: async () => ({}), text: async () => '' })
  try {
    const inc = await bootstrapShell('', 'shell')
    assert.ok(inc && inc.fragments, 'the shell boots from the bundle')
    assert.deepEqual(failures, [], 'a static host answering 405 is not news')
    assert.equal(connectivity.isOnline(), true)
  } finally {
    globalThis.fetch = original
    setTransportHooks(null)
    connectivity.reset()
    __setBundleForTests(undefined)
  }
})

atest('bundle: bootstrapShell cae a la ruta raíz bundleada si el backend NO está', async () => {
  __setBundleForTests(new Map([['_no_route', { fragments: [{ targetComponentId: null, component: { menu: [] } }] }]]))
  connectivity.reset()
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') } // backend down
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

// ── Listing filters ────────────────────────────────────────────────────────────
// A listing declares its filters on the wire and the search box has to offer ALL of them: before,
// only the option ones came out —and only the first—, so a boolean, a lookup and two
// dates did not exist for the user even though the server sent them. The kind is precomputed
// here because VB templates run under CSP; the resolution order is the same as the shared
// bar's (range → multi → options → boolean → text).

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

// ── Filters INSIDE the search box header (smartFilters of oj-sp-smart-filter-search) ──
// The filters are no longer a row of their own under the component —it ended up on the other side of
// Redwood's colour strip—: they travel through its API. Suggestions = unapplied filters; value = the
// applied ones (and the free text as keyword); filtersMetadata = each one's editor.

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
  // gte/lte with that exact shape: the component recognises the range and paints it "from - to"
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
    { filter: 'vista', label: 'Vista', filterLabel: 'Vista' }, // just suggested: no value yet
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
  // each row, a complex chip (no value) of its filter, with the «suggestion» icon
  assert.deepEqual(rows[0].chips.map((c) => c.filter), [rows[0].id])
  assert.equal(rows[0].category, 'suggestion')
  // a range carries its value's keys: without them the popup's editor comes out empty
  const range = rows.filter((r) => r.chips[0].value && 'gte' in r.chips[0].value)[0]
  assert.ok(range, 'hay un filtro de rango')
  const dp = suggestionsProviderOf(rows)
  const criterion = { op: '$and', criteria: [{ op: '$ne', value: { filters: [{ filter: 'vista' }] } }, { text: '' }] }
  const it = dp.fetchFirst({ filterCriterion: criterion })[Symbol.asyncIterator]()
  const first = await it.next()
  // a block with data and then the empty end, like an ArrayDataProvider
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
  // the total depends on the typed text: unknown (with the total of all, the list repeated rows)
  assert.equal(await dp.getTotalSize(), -1)
})

atest('smart filters: la config completa lleva sugerencias y metadata; sin filtros, sólo el buscador', async () => {
  setMetadataProviderFactory(async (data) => ({ provided: data }))
  try {
    const config = await smartFiltersOf(BOOKING_FILTERS, { vista: 'IN_HOUSE' }, '')
    assert.equal(config.value.length, 1)
    // the unapplied filters go in the search box's DROPDOWN, not as buttons under the box
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
  // no filter chip of our own outside the component (it ended up under the colour strip)
  const outside = headers.reduce((acc, h) => acc.replace(h, ''), html)
  assert.equal(/<oj-sp-filter-chip/.test(outside), false, 'no hay fila de filtros fuera del componente')
  assert.equal(/mateuFilterChips|mateuFilterEditing/.test(html), false)
  // the navigation projects the config; the search fired by the component does not reassign it
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /mateuSmartFilters = await bridge\.smartFiltersOf\(/)
  assert.equal(/mateuSmartFilters\s*=/.test(webApp('flows/main/pages/main-start-page-chains/runMateuSearch.js')), false)
  // the (unapplied) suggestions do not show the value part: an empty range would read "Llegada -"
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
  // there is no chat FAB any more: the one left in the corner is only Ask Oracle's
  assert.equal(/mateuChatFab|mateu-chat-fab/.test(shell), false, 'sin FAB del chat')
  assert.equal(/mateu-chat-fab/.test(webApp('resources/css/app.css')), false)
  // the button: in the global header's actions (slot end), before the App's widgets,
  // only if the app declares the chat; its Redwood icon and its label (display=icons → aria-label +
  // tooltip), and marked while the panel is open
  const header = shell.match(/<oj-sp-global-header[\s\S]*?<\/oj-sp-global-header>/)[0]
  const end = header.match(/<div slot="end"[\s\S]*?<!-- PROFILE AREA/)[0]
  const toggle = end.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatSseUrl \]\]">\s*<oj-button id="mateuChatToggle"[\s\S]*?<\/oj-button>/)
  assert.ok(toggle, 'el botón del chat está en la zona de acciones, sólo con sseUrl')
  assert.ok(end.indexOf('id="mateuChatToggle"') < end.indexOf('mateu-header-widgets'), 'antes de los widgets')
  assert.match(toggle[0], /display="icons"/)
  assert.match(toggle[0], /chroming="borderless"/)
  assert.match(toggle[0], /oj-ux-ico-chat/)
  assert.match(toggle[0], /aria-controls="mateuChatPanel"/)
  assert.match(toggle[0], /<span slot="startIcon" class="oj-ux-ico-chat"><\/span>\s*<oj-bind-text value=\"\[\[ \$application\.translations\.appBundle\.chatOpen \]\]\"><\/oj-bind-text>\s*<\/oj-button>/)
  assert.match(toggle[0], /mateuChatOpen \? ' mateu-chat-open' : ''/)
  assert.match(toggle[0], /\$listeners\.chatToggle/)
  assert.match(webApp('resources/css/app.css'), /oj-button\.mateu-chat-toggle\.mateu-chat-open \.oj-button-button \{/)
  const chain = webApp('pages/shell-page-chains/toggleMateuChat.js')
  assert.match(chain, /#mateuChatToggle button/, 'al cerrar, el foco vuelve al botón')
  assert.match(chain, /setAttribute\('aria-expanded', open \? 'true' : 'false'\)/)
  // the drawer: START of an oj-drawer-layout (reflow when wide, overlay when narrow) wrapping
  // the content — not an oj-drawer-popup, which would cover the screen
  const layout = shell.match(/<oj-drawer-layout id="mateuChatDrawer"[\s\S]*?>/)[0]
  assert.match(layout, /start-opened="\[\[ \$application\.variables\.mateuChatOpen \]\]"/)
  assert.match(layout, /on-oj-before-close="\[\[ \$listeners\.chatClose \]\]"/)
  assert.equal(/start-display="overlay"/.test(layout), false)
  assert.ok(shell.indexOf('id="mateuChatDrawer"') < shell.indexOf('id="mateuNavDrawer"'), 'envuelve al contenido')
  assert.ok(shell.indexOf('slot="globalHeader"') < shell.indexOf('id="mateuChatDrawer"'), 'la cabecera queda fuera')
  assert.match(shell, /<div slot="start" id="mateuChatPanel" role="complementary" :aria-label="\[\[ \$application\.translations\.appBundle\.chatPanel \]\]"/)
  assert.match(shell, /id="mateuChatInput"/)
  assert.match(shell, /aria-live="polite"/)
  // wiring: listeners and chain
  const page = JSON.parse(webApp('pages/shell-page.json'))
  assert.equal(page.eventListeners.chatToggle.chains[0].chain, 'toggleMateuChat')
  assert.equal(page.eventListeners.chatClose.chains[0].parameters.open, false)
  assert.equal(page.eventListeners.chatShowChat, undefined)
  const flow = JSON.parse(webApp('app-flow.json'))
  assert.equal(flow.variables.mateuChatOpen.defaultValue, false)
  assert.equal(flow.variables.mateuChatMode, undefined)
  // sending keeps streaming + per-route agent and presents the token, read on EVERY send and
  // recovering a 401 like the rest of the traffic
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /currentRoute: vars\.mateuSelectedRoute/)
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
  // the code, as is and escaped; unclosed (the stream half done) it runs to the end
  assert.equal(md('```\n<b>x</b>\n```'), '<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>')
  assert.equal(md('```\nmedio'), '<pre><code>medio</code></pre>')
  // half done, an unpaired ** is text
  assert.equal(md('Hay **2'), '<p>Hay **2</p>')
  // security: the text's HTML comes out as text, and there are only http(s) links, in another tab
  assert.equal(md('<script>alert(1)</script><img src=x onerror=alert(1)>'),
    '<p>&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;</p>')
  assert.equal(md('[x](javascript:alert(1))'), '<p>[x](javascript:alert(1))</p>')
  assert.equal(md('[doc](https://a.b/c?d=1&e="2")'),
    '<p><a href="https://a.b/c?d=1&amp;e=&quot;2&quot;" target="_blank" rel="noopener noreferrer">doc</a></p>')
  assert.equal(md(''), '')
  assert.equal(md(null), '')
  // the assistant's bubble paints it with oj-bind-dom (the person's, text as is)
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /<oj-bind-dom config="\[\[ \$functions\.chatMessageDom\(\$current\.data\.text\) \]\]"><\/oj-bind-dom>/)
  assert.match(shell, /<span class="mateu-chat-user-text"><oj-bind-text value="\[\[ \$current\.data\.text \]\]"><\/oj-bind-text><\/span>/)
  assert.match(webApp('pages/shell-page.js'), /bridge\.chatMarkdownToHtml\(text\)/)
  assert.equal(JSON.parse(webApp('pages/shell-page.json')).imports.components['oj-bind-dom'].path, 'ojs/ojbinddom')
  assert.match(webApp('resources/js/mateu-bridge.js'), /chatMarkdownToHtml,/)
})

test('chat: el panel dice que el asistente trabaja, cuenta los tokens y deja dictar — con JET', () => {
  const shell = webApp('pages/shell-page.html')
  const panel = shell.match(/<div slot="start" id="mateuChatPanel"[\s\S]*?<!-- PERSISTENT navigator/)[0]
  // the empty response is not painted; the status row, with JET's progress circle, is
  assert.match(panel, /<oj-bind-if test="\[\[ \$current\.data\.role === 'user' \|\| !!\$current\.data\.text \]\]">/)
  const status = panel.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatStatus \]\]">[\s\S]*?<\/oj-bind-if>/)[0]
  assert.match(status, /<oj-progress-circle size="sm" value="-1"/)
  assert.match(status, /role="status"/)
  // tokens: JET badges, only when there is any
  const tokens = panel.match(/<oj-bind-if test="\[\[ !!\$application\.variables\.mateuChatTokens \]\]">[\s\S]*?id="mateuChatTokens"/)
  assert.ok(tokens, 'la fila de tokens sale sólo con tokens')
  assert.match(panel, /class="oj-badge oj-badge-subtle[^"]*"><oj-bind-text value="\[\[ \$application\.translations\.appBundle\.chatTokensIn/)
  assert.match(panel, /class="oj-badge oj-badge-subtle[^"]*"><oj-bind-text value="\[\[ \$application\.translations\.appBundle\.chatTokensOut/)
  // microphone: Redwood icon oj-button, only where there is speech recognition, before the field
  const mic = panel.match(/<oj-bind-if test="\[\[ \$application\.variables\.mateuChatMicAvailable \]\]">\s*<oj-bind-if test="\[\[ !\$application\.variables\.mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[\s\S]*?<\/oj-button>/)
  assert.ok(mic, 'el botón de dictar depende de mateuChatMicAvailable')
  assert.match(mic[0], /oj-ux-ico-mic-on/)
  assert.match(mic[0], /\$listeners\.chatMic/)
  assert.ok(panel.indexOf('id="mateuChatMic"') < panel.indexOf('id="mateuChatInput"'))
  // wiring: listener, imports, variables and chains
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
  // the agent sends the usage of the whole conversation: it is replaced, not added
  assert.match(send, /mateuChatTokens = bridge\.latestUsage\(/)
  // the status row reads the progress the agent reports
  assert.match(send, /onProgress: \(p\) => \{\s*progress = p;\s*vars\.mateuChatSteps = bridge\.chatToolStepsOf\(p\);\s*showStatus\(\);\s*\}/)
  assert.match(send, /bridge\.chatStatusText\(\{[^}]*progress, now: Date\.now\(\)/)
  // the agent's UI events go, as they arrive, through the shared dispatcher (poc test-chat-events.mjs)
  assert.match(send, /onEvent: onAgentEvent/)
  assert.match(send, /bridge\.dispatchChatEvent\(ev\)/)
  assert.doesNotMatch(send, /renderScreen|ai-screen/)
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

// ── AI chat (transport core, parity with mateu-chat) ───────────────────
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

// An SSE reader double: emits the given chunks and then {done:true}.
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
    // the 2nd event arrives split into chunks → it is buffered until the blank line that closes it
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
  // the all-zero usage (marker of previous agents) does not get through; the real one does
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
  assert.deepEqual(lines, ['Conectando con 2 servidores MCP… 3 s', 'Calling booking_findBookings… 3 s', 'Conectando con 2 servidores MCP… 3 s', 'Answering…'])
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

// The chat does not go through fetchWithPolicy, and a 401 left it at "Servidor respondió 401" while the
// screens re-authenticated and carried on: in ec1 it went out without a token because at that instant
// localStorage had none. Now it recovers the same way: re-authenticate and resend ONCE, with the token of THEN.
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
    }), /The server answered 401/)
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
  }), /The server answered 401/)
  assert.equal(calls, 2)
})

// ── @Notice: a null or blank field hides the notice (parity with the web) ─────
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

// ── Custom components (#14) in VB: placeholder + slotted children ──────────────────
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
  // placeholder with the name of the custom type
  const placeholder = atoms.find((a) => a.isNotice && /org-chart/.test(a.text || ''))
  assert.ok(placeholder, 'el custom component muestra un placeholder con su nombre')
  // and the slotted children are painted all the same
  assert.ok(atoms.some((a) => a.isText && a.text === 'fallback content'), 'los hijos slotted se renderizan')
})

// ── App header widgets (WidgetSupplier) ────────────────────────────────────────────
// Real fixture: the App of the ec-demo1 shell (Vaadin) — a HorizontalLayout with slot
// "widgets": MicroFrontend /_inbox/badge + Popover(Text "Hola, …") with Email and Logout.
test('widgets: el App los guarda en la shell (hijos con slot "widgets")', () => {
  const { shell, contexts } = reduceContexts(empty(), fx('app-widgets'))
  assert.equal(Object.keys(contexts).length, 0)
  assert.equal(shell.widgets.length, 1)
  assert.equal(shell.widgets[0].metadata.type, 'HorizontalLayout')
  // an App without widgets does not invent any
  assert.deepEqual(reduceContexts(empty(), fx('app')).shell.widgets, [])
})

test('widgets: Popover(Text) → área de perfil (iniciales + nombre + email/Logout); MicroFrontend → acciones', () => {
  const reg = reduceContexts(empty(), fx('app-widgets'))
  const { user, items } = headerWidgetsOf(reg)
  // the greeting, without the narrow-screen HTML (the <vaadin-icon vaadin:user> and its <span>)
  assert.equal(user.label, 'Hola, Demo User')
  assert.equal(user.initials, 'DU')
  assert.deepEqual(user.rows.map((r) => r.isText ? r.text : `${r.label} → ${r.href}`),
    // a javascript: url is never a link (M-S7 — the web renderer's anchor already refused it)
    ['Email: demo@mateu.io', 'Logout → #'])
  // the badge: remote, with its pod and its route; the user Popover is NOT repeated in the actions area
  assert.equal(items.length, 1)
  assert.equal(items[0].isRemote, true)
  assert.equal(items[0].baseUrl, '/_inbox')
  assert.equal(items[0].route, '/badge')
  // ids by POSITION: the same on every bootstrap
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
  // self-closing, and an icon with no equivalent is removed instead of leaving an element that paints nothing
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
    // refresh → STATE-ONLY fragment (like the server's State(this))
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
  // background: neither busy bar nor error band
  assert.equal(calls[0].options.quiet, true)
  assert.match(htmls[0], /Inbox \(16\)/)
  // OnLoad: refresh after 10 s
  assert.equal(timers.length, 1)
  assert.equal(timers[0].ms, 10000)
  await timers[0].fn()
  assert.equal(calls[1].body.actionId, 'refresh')
  assert.equal(calls[1].body.serverSideType, 'io.mateu.ecdemo1.communication.ui.inbox.InboxBadge')
  assert.match(calls[1].body.componentState.content, /Inbox \(16\)/)
  assert.equal(htmls[1], '<a href="#">Inbox (17)</a>')
  // OnSuccess(refresh) → another refresh after 10 s, and so on
  assert.equal(timers.length, 2)
  assert.equal(timers[1].ms, 10000)
  await timers[1].fn()
  assert.equal(htmls[2], '<a href="#">Inbox (18)</a>')
  assert.equal(timers.length, 3)
  // stopping breaks the loop: an already scheduled refresh neither paints nor reschedules
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
    setTransportHooks(null)
  }
})

test('widgets: navigation-requested registra la ruta en su pod si el menú no la conoce; el menú manda', () => {
  assert.equal(registerRemoteRoute('/inbox/widget-only', { baseUrl: '/_inbox', serverSideType: 'x.InboxHome', consumedRoute: '' }), true)
  assert.deepEqual(remoteRouteOf('/inbox/widget-only'), { baseUrl: '/_inbox', consumedRoute: '', serverSideType: 'x.InboxHome', uriPrefix: '' })
  // already registered (e.g. by the menu): not overwritten
  assert.equal(registerRemoteRoute('/inbox/widget-only', { baseUrl: '/_otro' }), false)
  assert.equal(remoteRouteOf('/inbox/widget-only').baseUrl, '/_inbox')
  // no pod, nothing to register
  assert.equal(registerRemoteRoute('/local', { route: '/local' }), false)
})


// ── Modal row editor (@DetailFormCustomisation position = modal) — real wire of the ec-demo1
// booking (fixtures/real/rowedit-*.json): the new-booking wizard on its Rooms step and the
// edit form of a booking.
const WIZ_ID = '5c242863-bc33-4be8-8aeb-cac417f95673'
// the wizard host on the Rooms step: the real response of the Next, over a host whose tree
// had the id the Next was sent to
const wizardAtRooms = () => {
  const seeded = { contexts: { [HOST_ID]: { id: HOST_ID, kind: 'host', state: {}, data: {},
    tree: { type: 'ServerSide', id: 'c1e58725-6bda-42a7-8f80-e51c95f9f6dc' },
    outbound: { route: '/booking/newBooking', consumedRoute: '', serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.BookingHome', baseUrl: '/_booking' } } },
  stack: [], shell: null }
  return reduceContexts(seeded, fx('rowedit-wizard-rooms'))
}
// the capture of the "+" was sent with the pre-Next id as initiator; the renderer sends the
// id of the tree it has (tree.id) and the server ECHOES it — the echo is rewritten accordingly
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
  // the list is not a text field of the generic form (an input "Rooms" used to come out under the table)
  assert.ok(!fieldListOf(host.tree, host.state).some((f) => f.fieldId === 'rooms'))
  // a just-added room (no line or total: the server sets them) says «—» in those
  // cells, not a gap
  const withNew = { ...host, state: { ...host.state, rooms: [{ line: null, roomTypeCode: 'DBL', adults: 2, total: null }] } }
  const fresh = (islandContentOf(withNew) || []).flatMap((b) => b.items).find((a) => a.isGrid && a.fieldId === 'rooms')
  assert.equal(fresh.rows[0].line, '—')
  assert.equal(fresh.rows[0].total, '—')
  assert.equal(fresh.rows[0].roomTypeCode, 'DBL')
  // and the state that goes back to the server is not touched
  assert.equal(withNew.state.rooms[0].line, null)
})

test('rowedit: every editable list edits its rows in the dialog, whatever its formPosition; read-only and inline ones do not', () => {
  // `right` is the wire's default (a plain List<Row> field of a record's edit page)
  for (const formPosition of ['right', 'left', 'top', 'bottom', undefined, 'modal']) {
    assert.equal(isModalRowEditor({ columns: [{}], formPosition }), true, String(formPosition))
  }
  assert.equal(isModalRowEditor({ columns: [], formPosition: 'right' }), false)
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
  // the line (and the total) of a new room are set by the server: a «—» text, not an
  // empty number box
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

// the EDIT form of a booking: host '_edit' (BookingViewModel) with the rooms list
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
  // the container is not touched by the search
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
  // the new row needs its options again (its ServerSide is a different one)
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
  // guests is not modal in the seeded tree (the wizard's only carries rooms): the row is used
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

// ── Shell "ask" FAB: neutral (Search with the magnifier), or the @App(askLabel, askIcon) brand ──
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
  // nor the shell App: a registry without a shell does not break either
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
  // anything that is none of those does not leave the FAB empty: it goes back to the magnifier
  assert.equal(askFabOf({ askIcon: 'vaadin:no-existe' }).glyph, ASK_FAB_GLYPH)
  assert.equal(askFabOf({ askIcon: 'RIU Hotels' }).glyph, ASK_FAB_GLYPH)
})

// a minimal DOM: the shell's <a> with its div role=img
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
  assert.ok(icon.classList.contains('oj-sp-ux-icon-size-11x')) // the size is still set by the shell
  assert.equal(fab.attrs.role, 'button')
  assert.equal(fab.attrs.tabindex, '0')
  assert.equal(fab.attrs['aria-label'], 'Search')
  assert.equal(fab.attrs.title, 'Search')
  let prevented = false
  fab.listeners.keydown[0]({ key: 'Enter', preventDefault: () => { prevented = true } })
  assert.ok(prevented && fab.clicked === 1)
  // without the FAB (the shell has not painted it yet) it does nothing and says so
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
  // again, with an image: brands and keyboard handlers do not pile up
  brandAskFab(fab, askFabOf({ askLabel: 'Ask RIU', askIcon: '/images/riu.svg' }, 'http://b'))
  assert.equal(icon.children.length, 1)
  assert.equal(icon.children[0].tagName, 'img')
  assert.equal(icon.children[0].attrs.src, 'http://b/images/riu.svg')
  assert.equal(fab.listeners.keydown.length, 1)
  // and back to the glyph: no brand
  brandAskFab(fab, askFabOf(null))
  assert.equal(icon.children.length, 0)
  assert.ok(icon.classList.contains(ASK_FAB_GLYPH) && !icon.classList.contains('mateu-ask-fab-branded'))
})

test('interpolate: ${i18n.clave} sin catálogo se muestra como la clave', () => {
  assert.equal(interpolate('${i18n.orders.title} (${state.n})', { n: 2 }), 'orders.title (2)')
})

test('bundle: traducciones del manifest resueltas para el locale elegido', () => {
  const inc = { fragments: [{ component: { metadata: { type: 'Text', text: '${i18n.hello}!' } } }] }
  __setBundleForTests(new Map([['home', inc]]), [], [], { en: { hello: 'Hello' }, es: { hello: 'Hola' } })
  setBundleLocale('es-ES')
  assert.equal(bundledIncrementFor('/home', '').fragments[0].component.metadata.text, 'Hola!')
  setBundleLocale('fr')
  assert.equal(bundledIncrementFor('/home', '').fragments[0].component.metadata.text, 'Hello!')
  assert.equal(inc.fragments[0].component.metadata.text, '${i18n.hello}!')
  assert.equal(pickBundleLocale({ de: {}, it: {} }, ['fr']), 'de')
  __setBundleForTests(undefined)
})

test('interpolate: ${state.x} y ${state[\'x\']}', () => {
  assert.equal(interpolate("${state['_position']} de ${state.total}", { _position: '2/3', total: 4 }), '2/3 de 4')
  assert.equal(interpolate('${state["a"]}', { a: 'x' }), 'x')
})

// PAGE forms (not only the row editor): the ec-demo1 front-office walk-in
// (real fixture) — selects with OptionsSupplier options, dates and three @Section.
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
  // the sections, in wire order, with their title and their columns
  assert.deepEqual(summary.sections.map((s) => [s.title, s.hasTitle, s.columns]),
    [['Estancia', true, 2], ['Titular', true, 2], ['Precio del CRS', true, 1]])
  assert.deepEqual(summary.sections[0].fields.map((f) => f.fieldId),
    ['llegada', 'salida', 'habitacion', 'tarifa', 'regimen', 'adultos', 'edadesNinos'])
  assert.deepEqual(summary.sections[2].fields.map((f) => f.fieldId), ['precio'])
  // no field is lost or repeated when grouping
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
  // stereotype radio → a real oj-radioset (it used to degrade to a dropdown)
  assert.ok(byId.status.isRadio && !byId.status.isSelect)
  assert.deepEqual(byId.status.options, [{ value: 'OPEN', label: 'Open' }, { value: 'CLOSED', label: 'CLOSED' }])
  // a remote lookup with a value is a dropdown with that value (and its label) even if its
  // options have not arrived: a select with a value outside its options paints empty
  assert.ok(byId.hotel.isSelect && byId.hotel.isLookup)
  assert.deepEqual(byId.hotel.options, [{ value: 'H1', label: 'Hotel 1' }])
  assert.equal(byId.hotel.value, 'H1')
  // with neither value nor options it is still text on the page (an empty select would be worse)
  const empty = fieldListOf(tree, {}).find((f) => f.fieldId === 'hotel')
  assert.ok(empty.isText && !empty.isSelect)
  assert.ok(byId.vip.isBoolean)
  // no sections in the tree: one untitled group with everything
  assert.deepEqual(formSectionsOf(tree, {}).map((s) => s.fields.length), [4])
})

test('page form: a todo el ancho, con las columnas del wire o dos por defecto', () => {
  const field = (fieldId, extra) => ({ type: 'ClientSide', id: fieldId, metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', stereotype: 'regular', ...extra } })
  // no FormLayout: two columns (like Vaadin's FormLayout on desktop)
  const loose = { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'Page' }, children: [
    field('id'), field('name'), field('description'),
  ] }] }
  const [plain] = formSectionsOf(loose, {})
  assert.equal(plain.wideColumns, 2)
  assert.equal(plain.columns, 1, 'las columnas de siempre siguen ahí para la isla (media columna)')
  // with FormLayout(maxColumns) at the root, its own
  const declared = { type: 'ServerSide', id: 'x', children: [{ type: 'ClientSide', metadata: { type: 'FormLayout', maxColumns: 4 }, children: [
    field('a'), field('b'),
  ] }] }
  const [four] = formSectionsOf(declared, {})
  assert.equal(four.wideColumns, 4)
  // the page form and the two wizards: full-width oj-form-layout, with wideColumns
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/<oj-form-layout class="oj-formlayout-full-width" max-columns="\[\[ \$current\.data\.wideColumns \]\]"/g) || []).length, 3)
  // and the page form no longer sits in a half column (oj-md-6)
  const pageForm = html.slice(html.indexOf('$application.variables.mateuFormMetadata && !$application.variables.mateuWizard'))
  assert.ok(!pageForm.slice(0, 300).includes('oj-md-6'))
})

test('secondaryActionOf: la secundaria del header se resuelve por su actionId (y si no, por rótulo)', () => {
  const toolbar = [
    { actionId: 'seedDemo', label: '＋ 10 reservas demo' },
    { actionId: 'walkIn', label: '＋ Walk-in' },
  ]
  // the header returns the id of the item we gave it (mateuListSecondary: {id, value, label})
  assert.equal(secondaryActionOf({ secondaryItem: 'walkIn' }, toolbar).actionId, 'walkIn')
  const items = toolbar.map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }))
  assert.equal(secondaryActionOf({ secondaryItem: items[1] }, toolbar).actionId, 'walkIn')
  // old variants: the caption
  assert.equal(secondaryActionOf({ secondaryItem: { label: '＋ Walk-in' } }, toolbar).actionId, 'walkIn')
  assert.equal(secondaryActionOf({ secondaryItem: '＋ 10 reservas demo' }, toolbar).actionId, 'seedDemo')
  // nothing to match
  assert.equal(secondaryActionOf({ secondaryItem: 'nope' }, toolbar), null)
  assert.equal(secondaryActionOf({}, toolbar), null)
  assert.equal(secondaryActionOf(null, null), null)
})

// WIZARD: each field ONCE, and the train ON TOP with @WizardProgress(STEPS). The ec-demo1 front
// office walk-in (real fixture): before, the FormFields came out twice — on top as isInput (text)
// atoms of the content and below in the sections form, with their dropdown.
test('wizard: el walk-in pinta cada campo una vez, con su widget, y el tren arriba', () => {
  const reg = reduceContexts(empty(), fx('fo-walkin-wizard'))
  const host = reg.contexts[HOST_ID]
  const summary = summarizeHost(reg, '/walk-in')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  // STEPS → horizontal: train on top, not the guided process rail
  assert.equal(view.wizard.horizontal, true)
  assert.deepEqual(view.wizard.trainSteps.map((s) => [s.id, s.disabled, s.visited]),
    [['estancia', false, false], ['precio', true, false], ['titular', true, false], ['confirmar', true, false]])
  assert.equal(view.wizard.currentLabel, 'Estancia')
  assert.deepEqual(view.wizard.listSteps.map((s) => s.marker), ['1', '2', '3', '4'])
  assert.match(view.wizard.listSteps[0].cls, /mateu-wizard-step-current/)
  // the wizard title (its h2) moves up to the header and is not repeated in the content
  assert.equal(view.title, 'Walk-in')
  const atoms = view.content.flatMap((b) => b.items)
  assert.ok(!atoms.some((a) => a.isText && a.text === 'Walk-in'))
  // no form field is also left as a text input in the content
  assert.ok(!atoms.some((a) => a.isInput), 'sin inputs duplicados en el contenido')
  assert.ok(!atoms.some((a) => a.isFormLayout), 'ni un form layout con los mismos campos')
  const fields = view.sections.flatMap((sec) => sec.fields)
  assert.deepEqual(fields.map((f) => f.fieldId),
    ['llegada', 'salida', 'habitacion', 'tarifa', 'regimen', 'adultos', 'edadesNinos'])
  assert.ok(fields.find((f) => f.fieldId === 'habitacion').isSelect)
  assert.ok(fields.find((f) => f.fieldId === 'llegada').isDate)
  // the wire's Back/Next footer goes to the footer bar (Back disabled on the first step),
  // with the captions the server sends
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
  assert.deepEqual(view.sections, []) // rich → no generic form (same rule as the host)
  // the pax buttons are page actions (with parameters): they stay in the content
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
  // the back/next footer is provided by the guided process: outside the content, as always
  assert.ok(!atoms.some((a) => a.isButtons && a.buttons.every((b) => b.actionId === 'back' || b.actionId === 'next')))
  // and here too each field once
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
  // each @Section goes to the form with its title; its card (with just the title) is not repeated on top.
  // The one named like its step («Stay») does not repeat the caption of the step above it
  assert.deepEqual(view.content, [])
  assert.deepEqual(view.sections.map((sec) => [sec.title, sec.hasTitle]),
    [['', false], ['Holder', true], ['Comments', true]])
  assert.ok(view.sections[0].fields.find((f) => f.fieldId === 'arrival').isDate)
  assert.deepEqual(view.nav.map((b) => b.actionId), ['back', 'next'])
})

// A wizard's Next is validationRequired (as in Vaadin): with the required fields empty the
// action does not go out — the fields are marked, the first one gets the focus. The ec-demo1
// booking creation advanced with hotel, channel, dates and holder empty.
test('wizard: el Next valida los obligatorios del paso antes de salir', () => {
  const reg = reduceContexts(empty(), fx('booking-new-wizard'))
  const host = reg.contexts[HOST_ID]
  const summary = summarizeHost(reg, '/booking/newBooking')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  assert.deepEqual(validationOf(host, 'next'), { fields: [] })
  assert.equal(validationOf(host, 'back'), null) // the '*' wildcard does not ask to validate
  assert.deepEqual(formErrorsOf(view.sections, {}),
    ['hotelCode', 'channelCode', 'arrival', 'departure', 'holderFirstName', 'holderLastName'])
  // what was typed (the draft) counts, even if the server state is still empty
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

// Redwood's guided process (@WizardProgress RAIL): its OVERVIEW shows the process title
// (the wizard's h2) and its subtitle over the step columns, and each done column carries
// the template status ('success' → «Completado»).
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
      // on step 2: the first one done
      n.metadata.steps = n.metadata.steps.map((st, i) => ({ ...st, status: i === 0 ? 'done' : i === 1 ? 'current' : 'upcoming' }))
    }
    // the wizard subtitle (@Subtitle) travels as a Text with the class mateu-wizard-subtitle
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
  assert.equal(wizard.resumeStepId, 'precio') // already started: «Reanudar» on its step
  const summary = summarizeHost(reg, '/walk-in')
  const view = wizardStepViewOf(host, null, { title: summary.title, sections: summary.sections })
  // the title and the subtitle belong to the process: they are not repeated inside the step
  assert.equal(view.title, 'Walk-in')
  const atoms = view.content.flatMap((b) => b.items)
  assert.ok(!atoms.some((a) => a.isText && (a.text === 'Walk-in' || a.text === wizard.subtitle)))
  // on the first step there is nothing to resume yet
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
  // a response without usage does not erase what was there
  assert.deepEqual(addUsage(total, {}), total)
})

test('chat: el uso que se enseña es el último que manda el agente (el de la conversación), no la suma', () => {
  assert.equal(latestUsage(null, null), null)
  const first = latestUsage(null, { inputTokens: 130, outputTokens: 40, totalTokens: 170 })
  const second = latestUsage(first, { inputTokens: 330, outputTokens: 100, totalTokens: 430 })
  assert.deepEqual(second, { inputTokens: 330, outputTokens: 100, totalTokens: 430 })
  // a response without usage keeps the one that was there
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
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 4.7, progress: p, now: 4700 }), 'Thinking… 4 s')
  p.status({ phase: 'thinking', text: 'Pensando…' }, 5000)
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 9, progress: p, now: 7000 }), 'Pensando… 2 s')
  assert.equal(chatStatusText({ busy: false, hasText: false, elapsedSeconds: 9, progress: p, now: 7000 }), '')
})

test('chat: la fila de estado dice si el asistente piensa o ya responde', () => {
  assert.equal(chatStatusText({ busy: false, hasText: false, elapsedSeconds: 9 }), '')
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 0 }), 'Thinking…')
  assert.equal(chatStatusText({ busy: true, hasText: false, elapsedSeconds: 4.7 }), 'Thinking… 4 s')
  assert.equal(chatStatusText({ busy: true, hasText: true, elapsedSeconds: 12 }), 'Answering…')
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
  // by character on Latin keyboards (AZERTY: the M is where QWERTY has «;»), by position on the rest
  assert.equal(isChatMicShortcut(k({ key: 'M', code: 'Semicolon' })), true)
  assert.equal(isChatMicShortcut(k({ key: 'Q', code: 'KeyM' })), false)
  assert.equal(isChatMicShortcut(k({ key: 'Ь', code: 'KeyM' })), true)
  assert.equal(isChatMicShortcut(null), false)
  assert.equal(CHAT_MIC_ARIA_KEYSHORTCUTS, 'Control+Shift+M')
  // the page hooks it to the document and presses the microphone button (it only exists with the panel open
  // and speech recognition); the button announces it
  const page = webApp('pages/shell-page.js')
  assert.match(page, /bridge\.isChatMicShortcut\(event\)/)
  assert.match(page, /#mateuChatMic/)
  assert.match(page, /setAttribute\('aria-keyshortcuts', bridge\.CHAT_MIC_ARIA_KEYSHORTCUTS\)/)
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /aria-keyshortcuts="Control\+Shift\+M"/)
  // one button per state (an oj-button's text does not follow an oj-bind-text): the listening one highlighted
  assert.match(shell, /mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[^>]*chroming="callToAction"[\s\S]*?appBundle\.chatStopDictation \]\]\"><\/oj-bind-text>\s*<\/oj-button>/)
  assert.match(shell, /!\$application\.variables\.mateuChatListening \]\]">\s*<oj-button id="mateuChatMic"[^>]*chroming="borderless"[\s\S]*?appBundle\.chatDictate \]\]\"><\/oj-bind-text>\s*<\/oj-button>/)
})

// ── Redwood gaps seen in the ec-demo1 demo (3.0-alpha.376) ─────────────────────────

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
  // the view was loaded through the orchestrator crud: its outbound is the mediator's
  const orchestrator = 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingCrudOrchestrator'
  const host = { ...reg.contexts[HOST_ID], outbound: { serverSideType: orchestrator, route: '/booking/bookings/X', consumedRoute: '/booking/bookings', baseUrl: '/_booking' } }
  const view = 'io.mateu.ecdemo1.booking.infra.in.ui.pages.BookingViewModel'
  // «Ver recorrido» and «Cancel booking» are @Toolbar of the view: the crud does not know them
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.serverSideType, view)
  assert.equal(actionTransportOf(host, 'cancelBooking').outbound.serverSideType, view)
  // the route, the consumed mediator and the pod do not change
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.consumedRoute, '/booking/bookings')
  assert.equal(actionTransportOf(host, 'verRecorrido').outbound.baseUrl, '/_booking')
  // edit / new / cancel-view are not declared by the view: they bubble up to the crud
  for (const id of ['edit', 'new', 'cancel-view']) assert.equal(actionTransportOf(host, id), host)
  // one declared with bubble also goes up
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
  // the action does not declare the buttons: they fall back, each on its own, to the generic ones
  assert.equal(activate.confirmText, 'Yes')
  assert.equal(activate.denyText, 'No')
  // and it goes to the view, which is the one declaring it
  const routed = actionTransportOf({ ...host, outbound: { serverSideType: 'Crud' } }, 'activate')
  assert.equal(routed.outbound.serverSideType, 'io.mateu.ecdemo1.integrations.ui.pages.IntegrationViewModel')
  // an action without confirmationRequired does not ask
  assert.equal(confirmationOf(host, 'edit'), null)
  // a wildcard does not hide the exact one, and the exact one with its own texts wins
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
  // what the action declares still wins
  assert.equal(es.title, 'Activate this integration?')
  assert.deepEqual(confirmationDefaultsOf('es'), { title: 'Un momento, por favor', message: '¿Estás seguro?', confirmText: 'Sí', denyText: 'No' })
  // a language without translation falls back to English
  assert.equal(confirmationDefaultsOf('de-DE').confirmText, 'Yes')
  assert.equal(confirmationOf(host, 'activate', 'en-GB').confirmText, 'Yes')
})

atest('confirmación: la chain espera la respuesta; abrir otra da la anterior por denegada', async () => {
  const first = awaitConfirmation()
  const second = awaitConfirmation()
  assert.equal(await first, false)
  answerConfirmation(true)
  assert.equal(await second, true)
  // with nobody waiting, answering does nothing (the ojBeforeClose after the close)
  answerConfirmation(false)
})

test('diálogo con formulario embebido (EmbeddedView): sus campos, su estado, su título y sus botones', () => {
  const host = reduceContexts(empty(), fx('crud-view-booking'))
  const reg = reduceContexts(host, fx('dialog-embedded-cancel'))
  const overlay = overlayOf(reg)
  assert.ok(overlay.isDialog)
  assert.equal(overlay.title, 'Cancel booking UWS52M')
  // the state is the form's: the booking being cancelled and where to go back to
  assert.equal(overlay.state.bookingIds, 'UWS52M')
  assert.equal(overlay.state.returnTo, '/booking/bookings/UWS52M')
  // the reason is a dropdown with the OptionsSupplier options
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
  // an action the form does not declare is not sent to it
  assert.equal(overlayTransportOf(reg, 'save'), null)
  // its CloseModal (addressed to its id) closes the dialog
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
  // the lone option of the value (the label the server sends when editing) does not count as loaded
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
    // already loaded: a second pass does not search again
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

// ── P1: master of a record with tabs that are pages ─────────────────────────────────────
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
  // the shell, a mediator or an App that is its own home are NOT levels
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

// ── P1 on Redwood: form pages with tabs and @Subresource, and read-only pages ────
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
  // the parent seeds the master id into it, and the scope mark travels with it (as in Vaadin)
  assert.equal(invoices.componentState.customerId, '3')
  assert.equal(invoices.componentState._scope, 'customerId')
  // the island dance (mateuIsland) does not touch them: loadSubresources loads them
  assert.deepEqual(collectIslands(host.tree), [])
  // the check-in document (an embedded mediator that is not a sub-resource) is still an island
  assert.ok(collectIslands(reduceContexts(empty(), fx('fo-checkin-wizard')).contexts[HOST_ID].tree).some((i) => i.id === '_documento'))
})

test('P1: una página-formulario con la pestaña de los @Subresource activa conserva la barra y sus huecos', () => {
  const host = p1Overview().contexts[HOST_ID]
  // direct link to /customer-overview/3/billing: the server marks Billing active
  const blocks = hostContentOf(host, null, { title: 'Customer 3' })
  const atoms = p1Atoms(blocks)
  const bar = atoms.find((a) => a.isTabs)
  assert.ok(bar, 'la barra de pestañas sigue ahí')
  assert.deepEqual(bar.tabs.map((t) => [t.label, t.routeKey]), [['Details', 'details'], ['Orders (23)', 'orders'], ['Billing', 'billing']])
  assert.equal(bar.selectedId, 'tab-2')
  // only those of the tab in view, stacked with their title and their help
  assert.deepEqual(atoms.filter((a) => a.isSubresource).map((a) => a.islandId), ['_invoices', '_payments'])
  assert.ok(atoms.some((a) => a.isText && a.text === 'Invoices issued to this customer'))
  assert.ok(!blocks.some((b) => b.isNestedBlock), 'no se confunden con la isla anidada (que vaciaba el bloque)')
  assert.equal(p1HostContentShown(blocks, summarizeHost(p1Overview(), '/customer-overview/3/billing')), true,
    'el contenido manda sobre el form genérico')
  // with the Orders tab chosen by hand, its listing; Billing waits until it is opened
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
  // VB takes the startup route as «application URL» (/customers → /customers/) and reads whatever
  // hangs from it as one of its own pages: after entering the master from a row (/customers/5), a
  // back made it leave the shell and left the chains' context «disposed» (it did not repaint).
  // Regression guard on the chain (in Node there is no VB to boot): see e2e/master-tabs-check.mjs
  const chain = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'pages', 'shell-page-chains', 'loadMateuShell.js'), 'utf8')
  assert.match(chain, /if \(pathMode\) \{\s*window\.onpopstate = null;\s*\}/)
  // and before wiring our own popstate listener
  assert.ok(chain.indexOf('window.onpopstate = null') < chain.indexOf("addEventListener(pathMode ? 'popstate'"))
})

test('P1: una página de solo lectura (sus campos son textos) se pinta, no sale vacía', () => {
  const reg = reduceContexts(empty(), fx('p1-history'))
  const summary = summarizeHost(reg, '/customers/3/history')
  const blocks = hostContentOf(reg.contexts[HOST_ID], null, { title: summary.title })
  assert.deepEqual(p1Atoms(blocks).filter((a) => a.isText).map((a) => a.text), ['3', 'Customer 3 created 2026-01-01'])
  assert.equal(p1HostContentShown(blocks, summary), true)
  // but if the generic form has fields, a few loose texts do not take its place
  assert.equal(p1HostContentShown(blocks, { ...summary, fields: [{ fieldId: 'x' }] }), false)
  assert.equal(p1HostContentShown(null, summary), false)
})

// ── client errors → server log (clientLog.mjs) ──────────────────────────────────
// Clock, timer and sending injected: no real waits.
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
  // three more inside the window: nothing goes out until it closes
  advance(1000); reporter.report(e); advance(1000); reporter.report(e); reporter.report(e)
  advance(10000)
  assert.equal(sent.length, 1)
  advance(60000)
  assert.equal(sent.length, 2)
  const summary = lines()[1]
  assert.equal(summary.count, 3)
  assert.ok(summary.firstAt < summary.lastAt)
  // once the window has passed, the same error is news again
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
    // the real reporter discards 'cancelled'; here we check that the kind arrives as such
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

// ── responses for a screen that is no longer there (the web renderer's staleViewGuard.ts rule) ──
// A request goes out with screen A; the user navigates to B (onMateuNavigate → beginView) before
// it answers. Its response — good or bad — dies silently: the chain receives an
// `isStaleResponse` rejection (it does not paint it), busy turns off without a failure (no error
// band) and a 401 does not ask to re-authenticate.
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
    beginView() // the user navigates to another screen
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
    beginView() // navigation 1
    const first = loadRouteInto('/_integrations', empty(), '/integrations/frontoffice', '', {}).then(
      (reg) => ({ reg }), (error) => ({ error }))
    await tick()
    beginView() // navigation 2, before 1 answers
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
    beginView() // navigating does not cut a header widget's refresh
    h.pending[1].answer({ fragments: [{ targetComponentId: 'badge', data: { count: 3 } }] })
    assert.equal((await widget).fragments[0].data.count, 3)
    assert.equal(typeof currentView(), 'number')
  } finally { h.restore() }
})

// ── i18n: the renderer's own words (i18n.mjs) ──────────────────────────────────────
test('i18n: inglés por defecto; español por el idioma de la interfaz; huecos en inglés clave a clave', () => {
  assert.equal(chromeText('retry'), 'Retry')
  assert.equal(chromeText('retry', null, 'es-ES'), 'Reintentar')
  assert.equal(chromeText('retry', null, 'ja'), 'Retry')
  assert.equal(chromeText('selectValue', null, 'fr'), 'Sélectionnez une valeur')
  assert.equal(chromeText('retry', null, 'fr'), 'Retry')
  assert.equal(chromeText('progressOf', { done: 2, total: 7 }, 'es'), '2 de 7')
  assert.equal(chromeText('chatCalling', { name: 'x' }), 'Calling x…')
  assert.equal(chromeText('no-such-key'), 'no-such-key')
  assert.equal(chromeLanguage('pt_BR'), 'pt')
  setChromeLanguage('es')
  try {
    assert.equal(chromeLanguage(), 'es')
    assert.equal(chromeText('close'), 'Cerrar')
    assert.equal(i18nClassify({ status: 503 }).message, 'El servidor no ha podido completar la petición (error 503). Inténtalo de nuevo.')
  } finally { setChromeLanguage('en') }
  assert.equal(i18nClassify({ status: 503 }).message, 'The server could not complete the request (error 503). Try again.')
  assert.equal(chromeTextsOf('fr').retry, 'Retry')
})

test('i18n: español e inglés tienen las MISMAS claves (un hueco en español sería inglés en una consola española)', () => {
  assert.deepEqual(Object.keys(CHROME_TEXTS.es).sort((a, b) => a.localeCompare(b)), Object.keys(CHROME_TEXTS.en).sort((a, b) => a.localeCompare(b)))
  for (const [lang, dict] of Object.entries(CHROME_TEXTS)) {
    for (const k of Object.keys(dict)) assert.ok(k in CHROME_TEXTS.en, lang + '.' + k + ' no existe en inglés')
  }
})

test('i18n: el bundle nls de VB sale del catálogo y está al día; las páginas sólo enlazan claves que existen', () => {
  const files = nlsFiles()
  assert.equal(JSON.parse(files['appBundle-strings.json']).root, true)
  assert.equal(JSON.parse(files['appBundle-strings.json']).es, true)
  assert.equal(JSON.parse(files['root/appBundle-strings.json']).retry, 'Retry')
  const nls = join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'strings', 'appBundle', 'nls')
  for (const [f, c] of Object.entries(files)) assert.equal(readFileSync(join(nls, f), 'utf8'), c, f + ': npm run bridge')
  // no leftovers of the VB starter
  assert.doesNotMatch(files['root/appBundle-strings.json'], /Welcome to your First Redwood App|Lorem ipsum/)
  const pages = ['pages/shell-page.html', 'flows/main/pages/main-start-page.html']
    .map((rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')).join('\n')
  const used = [...pages.matchAll(/translations\.appBundle\.(\w+)/g)].map((m) => m[1])
  assert.ok(used.length > 10)
  for (const k of used) assert.ok(k in CHROME_TEXTS.en, 'la página enlaza una clave que no existe: ' + k)
})

test('i18n: la chrome de las páginas no lleva español escrito a mano', () => {
  const stripComments = (text) => { let prev; do { prev = text; text = text.replace(/<!--[\s\S]*?-->/g, '') } while (text !== prev); return text }
  const page = (rel) => stripComments(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8'))
  const html = page('pages/shell-page.html') + page('flows/main/pages/main-start-page.html') + stripComments(readFileSync(join(here, 'templates', 'atoms.html'), 'utf8'))
  for (const word of ['Buscar', 'Cerrar', 'Reintentar', 'Cargando', 'Sin conexión', 'Sin datos', 'Secciones', 'Asistente', 'Enviar', 'Escribe un mensaje', 'Dictar', 'Contexto']) {
    assert.ok(!html.includes(word), 'texto en español en una página: ' + word)
  }
})


// ── chat: parity with the web chat (mateu-chat.ts) ─────────────────────────────────────────────
test('chat: la config del panel sale del App — sseUrl/uploadUrl/mcpUrl con la base del backend, y el título es su marca', () => {
  const reg = reduceContexts(empty(), { fragments: [{ targetComponentId: '', component: { type: 'ClientSide', metadata: {
    type: 'App', title: 'X', menu: [], sseUrl: '/agent/stream', uploadUrl: '/agent/upload', mcpUrl: '/mcp', askLabel: 'Ask RIU' } } }] })
  assert.equal(reg.shell.uploadUrl, '/agent/upload')
  assert.equal(reg.shell.mcpUrl, '/mcp')
  assert.deepEqual(chatConfigOf(reg.shell, 'http://b'), { sseUrl: 'http://b/agent/stream', uploadUrl: 'http://b/agent/upload', mcpUrl: 'http://b/mcp', title: 'Ask RIU' })
  assert.deepEqual(chatConfigOf({ sseUrl: 'https://agent.example/stream' }, 'http://b'), { sseUrl: 'https://agent.example/stream', uploadUrl: '', mcpUrl: '', title: 'Assistant' })
  assert.equal(chatConfigOf(null).title, 'Assistant')
})

test('chat: el turno lleva lo mismo que el web — contexto, pantalla proyectada, mcpUrl, adjuntos y el menú sólo la primera vez', () => {
  const tree = { type: 'ServerSide', id: 'p', route: '/people', serverSideType: 'app.People', actions: [{ id: 'save' }, { id: 'search' }],
    children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'People' }, children: [
      { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string', required: true } },
      { type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'kind', label: 'Kind', dataType: 'string', options: [{ value: 'A', label: 'Alpha' }, 'B'] } },
      { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Save' } },
      { type: 'ClientSide', metadata: { type: 'Button', actionId: 'extra', label: 'Extra' } },
    ] }] }
  const registry = { contexts: { __root__: { tree, state: { name: 'Ada' }, data: { d: 1 } } }, appData: { x: 1 } }
  const menu = [{ label: 'People', route: '/people' }]
  const first = chatTurnOf({ message: ' hola ', sessionId: 's', attachments: [{ name: 'a.pdf', path: 'up/a.pdf' }], registry,
    appState: { hotel: 'H1' }, url: '/people', screenTitle: 'People', currentRoute: '/people', mcpUrl: '/mcp', menu, sendMenu: true, origin: 'http://h' })
  assert.equal(first.shown, 'hola\n\n📎 a.pdf')
  assert.equal(first.body.message, 'hola')
  assert.deepEqual(first.body.attachments, [{ name: 'a.pdf', path: 'up/a.pdf' }])
  assert.equal(first.body.mcpUrl, 'http://h/mcp')
  assert.deepEqual(first.body.context, { url: '/people', screenTitle: 'People', appState: { hotel: 'H1' }, appData: { x: 1 }, componentState: { name: 'Ada' }, componentData: { d: 1 } })
  assert.equal(first.body.menuContext.length, 1)
  assert.equal(first.body.screen.title, 'People')
  assert.equal(first.body.screen.route, '/people')
  assert.deepEqual(first.body.screen.fields[0], { id: 'name', label: 'Name', dataType: 'string', stereotype: 'regular', required: true, readOnly: false, value: 'Ada' })
  assert.deepEqual(first.body.screen.fields[1].options, [{ value: 'A', label: 'Alpha' }, { value: 'B', label: 'B' }])
  assert.deepEqual(first.body.screen.actions, [{ id: 'save', label: 'Save' }, { id: 'search', label: 'search' }, { id: 'extra', label: 'Extra' }])
  const next = chatTurnOf({ message: 'otra', sessionId: 's', registry, menu, sendMenu: false })
  assert.equal(next.body.menuContext, undefined)
  assert.equal(next.shown, 'otra')
  // with no screen (no host yet) `screen` does not travel
  assert.equal('screen' in chatTurnOf({ message: 'x', sessionId: 's', registry: { contexts: {} } }).body, false)
  // a message with ONLY attachments
  assert.equal(chatTurnOf({ message: '', sessionId: 's', attachments: [{ name: 'b', path: 'b' }] }).shown, '📎 b')
})

test('chat: una respuesta vacía o un corte de red se explican; el resto de errores dice cuál', () => {
  assert.equal(chatTurnTextOf('Hola', null), 'Hola')
  assert.match(chatTurnTextOf('', null), /^⚠️ The agent returned no answer/)
  assert.match(chatTurnTextOf('', new Error('Failed to fetch')), /^⚠️ No answer from the agent/)
  assert.equal(chatTurnTextOf('parcial', new Error('Failed to fetch')), '⚠️ Error: Failed to fetch')
  assert.equal(chatTurnTextOf('', new Error('The server answered 500: x')), '⚠️ Error: The server answered 500: x')
})

test('chat: las herramientas del turno se pintan hechas, fallidas o en marcha, con su tiempo', () => {
  const p = createChatProgress(0)
  p.tool({ name: 'findBookings', phase: 'start', server: 'booking' }, 0)
  p.tool({ name: 'findBookings', phase: 'end', ms: 1234 }, 10)
  p.tool({ name: 'cancel', phase: 'start' }, 20)
  p.tool({ name: 'cancel', phase: 'end', error: 'denied', ms: 80 }, 30)
  p.tool({ name: 'lookup', phase: 'start' }, 40)
  const steps = chatToolStepsOf(p)
  assert.deepEqual(steps.map((s) => [s.name, s.icon, s.time, s.error]), [['findBookings', '✓', '1,2 s', ''], ['cancel', '✕', '80 ms', 'denied'], ['lookup', '…', '', '']])
  assert.match(steps[1].cls, /failed/)
  assert.equal(chatToolStepsOf(null).length, 0)
})

test('chat: adjuntos — se acumulan sin repetir y cada chip lleva el nombre accesible de su ✕', () => {
  const a = withAttachments([], [{ name: 'a.pdf', path: 'p/a' }, { name: 'x' }])
  assert.deepEqual(a, [{ name: 'a.pdf', path: 'p/a', removeLabel: 'Remove a.pdf' }])
  assert.equal(withAttachments(a, [{ name: 'a.pdf', path: 'p/a' }, { name: 'b', path: 'p/b' }]).length, 2)
})

test('chat: el panel VB tiene lo del web — título de marca, modo ancho, herramientas, adjuntos', () => {
  const shell = webApp('pages/shell-page.html')
  assert.match(shell, /mateuChatTitle \|\| \$application\.translations\.appBundle\.chatTitle/)
  assert.doesNotMatch(shell, /mateuChatLocalAgent/)
  assert.match(shell, /mateu-chat-wide/)
  assert.match(shell, /id="mateuChatSteps"/)
  assert.match(shell, /id="mateuChatAttach"/)
  assert.match(shell, /\$listeners\.chatRemoveAttachment/)
  const listeners = JSON.parse(webApp('pages/shell-page.json')).eventListeners
  for (const l of ['chatAttach', 'chatRemoveAttachment', 'chatExpand']) assert.equal(listeners[l].chains[0].chain, 'chatAttach', l)
  const flow = JSON.parse(webApp('app-flow.json'))
  for (const v of ['mateuChatTitle', 'mateuChatUploadUrl', 'mateuChatMcpUrl', 'mateuChatAttachments', 'mateuChatSteps', 'mateuChatExpanded']) assert.ok(flow.variables[v], v)
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /url: vars\.mateuChatSseUrl/)
  assert.match(send, /bridge\.chatTurnTextOf\(accumulated, failure\)/)
  assert.doesNotMatch(webApp('pages/shell-page-chains/toggleMateuChat.js'), /probeLocalAgent/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.chatConfigOf\(reg\.shell, assetBase\)/)
  const attach = webApp('pages/shell-page-chains/chatAttach.js')
  assert.match(attach, /bridge\.uploadChatFiles\(/)
  assert.match(attach, /headers: bridge\.authHeadersOf\(\)/)
})

// ── the shell's FLOWS: a menu RuleLink running a declared flow client-side ───────────────────────
import { isMenuRuleId, menuRulesOf, shellFlowOf, menuRulePlanOf } from './shellFlows.mjs'
import { MENU_RULE_PREFIX } from './reduceContexts.mjs'
{
  // the Java golden (AppShellFlowSyncTest): a YAML shell declaring flows + a menu action leaf
  const shellGolden = JSON.parse(readFileSync(join(here, '..', '..', '..', 'libs', 'mateu', 'src', 'mateu', 'ui', 'infra', 'expander', '__fixtures__', 'app-shell.golden.json'), 'utf8'))
  const bootReg = reduceContexts({ contexts: {}, stack: [] }, shellGolden)

  test('shell flows: the wire App\'s declared actions (lowered commands) reach the shell', () => {
    assert.deepEqual(bootReg.shell.actions.map((a) => a.id), ['newOrder', 'announce'])
    assert.deepEqual(shellFlowOf(bootReg.shell, 'newOrder').map((c) => c.type), ['MarkAsClean', 'NavigateTo'])
    assert.equal(shellFlowOf(bootReg.shell, 'nope'), null)
  })

  test('shell flows: a RuleLink leaf gets a marked node id (it does not navigate); a RouteLink keeps its route', () => {
    const nav = shellNavOf(bootReg)
    const ids = nav.menuTree.map((n) => n.id)
    assert.equal(ids[0], '/home')
    assert.ok(isMenuRuleId(ids[1]), ids[1])
    assert.ok(ids[1].startsWith(MENU_RULE_PREFIX))
    assert.equal(isMenuRuleId('/home'), false)
    assert.deepEqual(menuRulesOf(bootReg.shell.menu, ids[1]).map((r) => r.actionId), ['newOrder'])
    assert.equal(menuRulesOf(bootReg.shell.menu, '/home'), null)
  })

  test('shell flows: running the leaf applies the flow with NO server call — clean, then in-app navigation', () => {
    const id = shellNavOf(bootReg).menuTree[1].id
    const plan = menuRulePlanOf(bootReg, menuRulesOf(bootReg.shell.menu, id))
    assert.deepEqual(plan.navigate, { route: '/orders/new' })
    assert.equal(plan.dirty, false)
    assert.deepEqual(plan.serverActions, [])
    assert.deepEqual(plan.events, [])
  })

  test('shell flows: an Emit step goes on the bus; an undeclared id stays an app-level server action; RunJS is skipped', () => {
    const plan = menuRulePlanOf(bootReg, [
      { action: 'RunAction', actionId: 'announce' },
      { action: 'RunAction', actionId: 'serverSide' },
      { action: 'RunJS', value: 'alert(1)' },
    ])
    assert.deepEqual(plan.events, [{ name: 'order-started', detail: null, source: HOST_ID }])
    assert.deepEqual(plan.serverActions, ['serverSide'])
    assert.equal(plan.navigate, null)
    assert.equal(plan.skipped.length, 1)
  })

  test('shell flows: a flow\'s RunAction step and an absolute URL, nested in a group', () => {
    const reg = { contexts: {}, stack: [], shell: {
      menu: [{ label: 'Tools', submenus: [{ label: 'Docs', path: '/docs', rules: [{ action: 'RunAction', actionId: 'docs' }] }] }],
      actions: [{ id: 'docs', commands: [
        { type: 'RunAction', data: { actionId: 'audit' } },
        { type: 'NavigateTo', data: 'https://example.com/docs' },
      ] }],
    } }
    const leaf = shellNavOf(reg).menuTree[0].children[0]
    assert.ok(isMenuRuleId(leaf.id))
    const plan = menuRulePlanOf(reg, menuRulesOf(reg.shell.menu, leaf.id))
    assert.deepEqual(plan.serverActions, ['audit'])
    assert.deepEqual(plan.navigate, { url: 'https://example.com/docs' })
  })

  test('shell flows: onMateuNavigate runs a rule leaf instead of loading it; the bridge exports the pieces', () => {
    const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
    assert.match(nav, /if \(bridge\.isMenuRuleId\(route\)\) \{\s*await Actions\.callChain\(context, \{ chain: 'runMateuMenuRules', params: \{ ruleId: route \} \}\);\s*return;/)
    const rulesChain = webApp('pages/shell-page-chains/runMateuMenuRules.js')
    assert.match(rulesChain, /bridge\.menuRulePlanOf\(before, rules\)/)
    assert.match(rulesChain, /chain: 'runMateuHeaderAction'/)
    assert.match(rulesChain, /chain: 'onMateuNavigate'/)
    const amd = readFileSync(join(here, 'make-amd.mjs'), 'utf8')
    assert.match(amd, /'shellFlows\.mjs'/)
    assert.match(amd, /menuRulePlanOf,/)
  })
}

// ── leave actions with unsaved changes (BUGS-MATEU #7) ────────────────────────────────────────
import { isLeaveAction, isConflictDialogAnswer, confirmLeaveAction, tracksUnsavedChanges, screenActionIdsOf, isWizardStepAction, fieldEditLeavesUnsavedChanges } from './shellFlows.mjs'
{
  test('isLeaveAction: the ids the server styles as leave actions (FormMapper) and the crud\'s, no business «cancelX»', () => {
    for (const id of ['cancel', 'cancel-new', 'cancel-create', 'cancel-edit', 'cancel-view', 'back', 'backToList']) assert.equal(isLeaveAction(id), true, id)
    for (const id of ['cancelBooking', 'save', 'backup', 'back-office', '', undefined, null]) assert.equal(isLeaveAction(id), false, String(id))
  })

  test('confirmLeaveAction: asks the navigation question (unsavedLeave) only for a leave action on a dirty screen', () => {
    const asked = []
    const win = (answer) => ({ confirm: (m) => { asked.push(m); return answer } })
    assert.equal(confirmLeaveAction('cancel-edit', { mateuDirty: false }, win(false)), true)
    assert.equal(confirmLeaveAction('save', { mateuDirty: true }, win(false)), true)
    assert.equal(asked.length, 0, 'nothing to lose, or not leaving: no question')
    const vars = { mateuDirty: true }
    assert.equal(confirmLeaveAction('cancel-edit', vars, win(false)), false, 'stay')
    assert.equal(vars.mateuDirty, true)
    assert.equal(confirmLeaveAction('backToList', vars, win(true)), true, 'leave')
    assert.equal(vars.mateuDirty, false, 'cleared: the navigation it answers with does not ask again')
    assert.deepEqual(asked, [chromeText('unsavedLeave'), chromeText('unsavedLeave')])
  })

  test('confirmLeaveAction: the conflict dialog\'s Reload (cancel-edit marked _conflictDialog) does not ask again', () => {
    const asked = []
    const win = { confirm: (m) => { asked.push(m); return false } }
    const vars = { mateuDirty: true }
    assert.equal(confirmLeaveAction('cancel-edit', vars, win, { _conflictDialog: true, initiatorState: {} }), true)
    assert.equal(asked.length, 0)
    assert.equal(confirmLeaveAction('cancel-edit', vars, win, { _conflictDialog: 'yes' }), false, 'only the server\'s marker')
    assert.equal(isConflictDialogAnswer(undefined), false)
  })

  test('a wizard\'s Back is step navigation, not leaving: no question; its Cancel and a CRUD editor\'s Cancel still ask', () => {
    const asked = []
    const win = { confirm: (m) => { asked.push(m); return false } }
    // the wizard (advertises next/skip, claims the rest with *), here inside the host's tree
    const wizardReg = { stack: [], contexts: { [HOST_ID]: { tree: { type: 'ServerSide', actions: [], children: [
      { type: 'ServerSide', confirmOnNavigationIfDirty: true, actions: [{ id: 'next' }, { id: 'skip' }, { id: '*' }], children: [] }] } } } }
    assert.deepEqual(screenActionIdsOf(wizardReg), ['next', 'skip', '*'])
    assert.equal(isWizardStepAction('back', screenActionIdsOf(wizardReg)), true)
    assert.equal(confirmLeaveAction('back', { mateuDirty: true, mateuRegistry: wizardReg }, win), true)
    assert.equal(confirmLeaveAction('goToStep', { mateuDirty: true, mateuRegistry: wizardReg }, win), true)
    assert.equal(asked.length, 0)
    assert.equal(confirmLeaveAction('cancel', { mateuDirty: true, mateuRegistry: wizardReg }, win), false)
    // a wizard opened in a DRAWER over a page: found on the stack
    const drawerReg = { stack: ['d1'], contexts: { [HOST_ID]: { tree: { actions: [{ id: 'back' }] } }, d1: { tree: { actions: [{ id: 'next' }] } } } }
    assert.equal(confirmLeaveAction('back', { mateuDirty: true, mateuRegistry: drawerReg }, win), true)
    const editorReg = { stack: [], contexts: { [HOST_ID]: { tree: { confirmOnNavigationIfDirty: true, actions: [{ id: 'cancel-edit' }, { id: 'save' }, { id: 'back' }] } } } }
    assert.equal(confirmLeaveAction('cancel-edit', { mateuDirty: true, mateuRegistry: editorReg }, win), false)
    assert.equal(confirmLeaveAction('back', { mateuDirty: true, mateuRegistry: editorReg }, win), false, 'a page\'s own Back still leaves')
    assert.equal(asked.length, 3)
  })

  test('tracksUnsavedChanges: only a host whose ServerSide asks before it is left (@ConfirmOnNavigationIfDirty)', () => {
    assert.equal(tracksUnsavedChanges({ tree: { confirmOnNavigationIfDirty: true } }), true)
    assert.equal(tracksUnsavedChanges({ tree: { confirmOnNavigationIfDirty: false } }), false)
    assert.equal(tracksUnsavedChanges({ tree: {} }), false)
    assert.equal(tracksUnsavedChanges(undefined), false)
    // the owner may sit below the context's root (a crud mediator wrapping its form)
    assert.equal(tracksUnsavedChanges({ tree: { children: [{ children: [{ confirmOnNavigationIfDirty: true }] }] } }), true)
  })

  test('fieldEditLeavesUnsavedChanges: the context that owns the edit decides — host, top overlay or island', () => {
    const tracked = { tree: { confirmOnNavigationIfDirty: true } }
    const plain = { tree: {} }
    const reg = { stack: ['d1', 'd2'], contexts: { [HOST_ID]: tracked, d1: tracked, d2: plain, isl: tracked } }
    assert.equal(fieldEditLeavesUnsavedChanges(reg), true)
    assert.equal(fieldEditLeavesUnsavedChanges(reg, { overlay: true }), false, 'the TOP overlay owns it')
    assert.equal(fieldEditLeavesUnsavedChanges(reg, { islandId: 'isl' }), true)
    assert.equal(fieldEditLeavesUnsavedChanges({ stack: [], contexts: { [HOST_ID]: plain } }), false)
    assert.equal(fieldEditLeavesUnsavedChanges({ stack: [], contexts: {} }, { overlay: true }), false)
  })
}

// ── the ACTION catalogue: owner first, then App.actionCatalogue ──────────────────────────────────
import { pageFlowOf, catalogueActionOf } from './shellFlows.mjs'
{
  // the Java golden (ActionCatalogueSyncTest): a shell whose menu names a CATALOGUE id
  const catGolden = JSON.parse(readFileSync(join(here, '..', '..', '..', 'libs', 'mateu', 'src', 'mateu', 'ui', 'infra', 'expander', '__fixtures__', 'action-catalogue.golden.json'), 'utf8'))
  const catReg = reduceContexts({ contexts: {}, stack: [] }, catGolden.shell)

  test('action catalogue: the wire App\'s actionCatalogue (lowered) reaches the shell', () => {
    assert.deepEqual(catReg.shell.actionCatalogue.map((a) => a.id),
      ['newOrder', 'refreshCustomers', 'refresh', 'chained', 'fromOtherFile'])
    assert.deepEqual(catReg.shell.actions.map((a) => a.id), ['announce'])
    assert.ok(catalogueActionOf(catReg.shell, 'refreshCustomers').restAction)
  })

  test('action catalogue: a menu leaf naming a catalogue id the shell does not declare runs it client-side', () => {
    const leaf = shellNavOf(catReg).menuTree.find((n) => isMenuRuleId(n.id))
    const plan = menuRulePlanOf(catReg, menuRulesOf(catReg.shell.menu, leaf.id))
    assert.deepEqual(plan.navigate, { route: '/orders/new' })
    assert.equal(plan.dirty, false)
    assert.deepEqual(plan.serverActions, [])
  })

  test('action catalogue: owner first — a shell action without steps stays the shell\'s server action', () => {
    const reg = { ...catReg, shell: { ...catReg.shell, actions: [{ id: 'newOrder' }] } }
    const plan = menuRulePlanOf(reg, [{ action: 'RunAction', actionId: 'newOrder' }])
    assert.deepEqual(plan.serverActions, ['newOrder'])
    assert.equal(plan.navigate, null)
  })

  test('action catalogue: a catalogue flow running another entry resolves it too; an unknown id goes to the server', () => {
    const plan = menuRulePlanOf(catReg, [{ action: 'RunAction', actionId: 'chained' }, { action: 'RunAction', actionId: 'nobody' }])
    assert.deepEqual(plan.navigate, { route: '/orders/new' })
    assert.deepEqual(plan.serverActions, ['nobody'])
  })

  test('action catalogue: a page button runs the page\'s own flow first, then the catalogue\'s, else the server', () => {
    const reg = { ...catReg, contexts: { ...catReg.contexts, [HOST_ID]: {
      declaredActions: [
        { id: 'refresh', commands: [{ type: 'DispatchEvent', data: { eventName: 'page-refresh' } }] },
        { id: 'save', commands: null },
      ],
    } } }
    assert.equal(pageFlowOf(reg, 'refresh')[0].data.eventName, 'page-refresh')
    assert.deepEqual(pageFlowOf(reg, 'newOrder').map((c) => c.type), ['MarkAsClean', 'NavigateTo'])
    assert.equal(pageFlowOf(reg, 'save'), null, 'the page owns it: its server action')
    assert.equal(pageFlowOf(reg, 'refreshCustomers'), null, 'a REST entry is not a flow')
    assert.equal(pageFlowOf(reg, 'nobody'), null)
    const chain = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page-chains', 'runMateuAction.js'), 'utf8')
    assert.match(chain, /const clientFlow = preset \? null : bridge\.pageFlowOf\(before, id\);/)
    const amd = readFileSync(join(here, 'make-amd.mjs'), 'utf8')
    assert.match(amd, /pageFlowOf,/)
  })
}

await queue
console.log(`\n${pass} tests OK (contrato de wire real)`)

// ec-demo1 CRUD (CRS booking, real fixtures): its @Section are Cards with a FormLayout
// (maxColumns 2) of FormRows. Before, each FormField came out as a loose oj-input-text — editable
// even though the detail view sends them all readOnly, with no real columns and no dates.
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
  // all readonly: the layout itself too, and JET paints values, not boxes
  assert.ok(layouts.every((l) => l.readonly && l.fields.every((f) => f.readonly)))
  // the dates come out now, with their widget
  assert.ok(booking.fields.find((f) => f.fieldId === 'arrival').isDate)
  // the label of a read-only lookup comes in data, not in the state
  assert.match(String(booking.fields.find((f) => f.fieldId === 'hotelCode-label').value), /MRU01/)
  // each field takes its wire colspan, without exceeding the layout columns
  assert.ok(layouts.every((l) => l.fields.every((f) => f.colspan >= 1 && f.colspan <= l.columns)))
  // the section grids are still tables, outside the layout
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
  // a grid or a property row are not layout fields
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
  // the «go to parent» of a listing hanging from groups: there is no navigable parent → not painted
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

// ── @Searchable: chips + the selector in a dialog (fixtures/real/searchable-multi-*, captured
//    against demo/demo-admin-panel Page 5: a List<String> hotelIds and a String hotelId) ─────────

const searchableHost = () => {
  const form = fx('searchable-multi-form')
  form.fragments[0].targetComponentId = '' // the host load
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
  // the single-id one: no chip while empty, «Search»
  const single = fields.find((f) => f.fieldId === 'hotelId')
  assert.ok(single.isSearchable && !single.isSearchableMulti)
  assert.equal(single.hasChips, false)
  assert.equal(single.addLabel, 'Search')
  // the form sections carry them the same
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
  assert.equal(picker.rows.length, 0) // the rows arrive with their `search`
  // its search goes to ITS ServerSide (the selector), with its state
  const transport = overlayTransportOf(reg, 'search')
  assert.equal(transport.tree.serverSideType, 'io.mateu.mdd.demoadminpanel.infra.in.ui.HotelSelector')
  assert.equal(transport.state._searchableMulti, true)
  assert.deepEqual(pickerSearchStateOf(picker, { searchText: 'Ho' }), { searchText: 'Ho', page: 0, size: 10 })
  // an overlay that is not a selector is not a picker
  assert.equal(searchPickerOf(reduceContexts(reduceContexts(empty(), fx('load-listing')), fx('open-drawer'))), null)
})

test('a LISTING embedded in a drawer is drawn as a listing in the drawer (search, columns, pages, row click = view)', () => {
  const column = (id, label) => ({ type: 'ClientSide', metadata: { type: 'GridColumn', id, label, dataType: 'string' } })
  const surface = { type: 'ServerSide', id: 'emb', serverSideType: 'io.example.CompaniesListing', actions: [{ id: 'search' }, { id: 'view' }],
    children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'Companies listing' }, children: [
      { type: 'ClientSide', metadata: { type: 'Crud', searchable: true, pageSize: 10, columns: [column('codigo', 'Código'), column('nombre', 'Nombre')] } }] }] }
  const overlay = (type, data) => ({ contexts: {
    [HOST_ID]: { tree: { type: 'ServerSide', children: [] }, state: {}, data: {} },
    d1: { tree: { type: 'ClientSide', metadata: { type } }, surface, title: 'Empresa — a quién se factura', state: {}, data },
  }, stack: ['d1'] })
  // opened: not searched yet
  const before = searchPickerOf(overlay('Drawer', {}))
  assert.equal(before.inDrawer, true)
  assert.equal(before.loaded, false)
  assert.equal(before.searchable, true)
  assert.equal(before.title, 'Empresa — a quién se factura')
  assert.deepEqual(before.columns.map((c) => c.id), ['codigo', 'nombre'])
  // the click on a row is the listing's `view` with the row, as on a page
  assert.equal(before.pickActionId, 'view')
  assert.equal(before.pickWithRow, true)
  assert.equal(before.multi, false)
  // its first page arrived
  const after = searchPickerOf(overlay('Drawer', { crud: { page: { content: [{ id: 'ACME', codigo: 'ACME', nombre: 'Acme' }], totalElements: 1 } } }))
  assert.equal(after.loaded, true)
  assert.equal(after.rows.length, 1)
  // the drawer does not walk it as a form (its title and a stray «Id» button)
  const drawer = overlayOf(overlay('Drawer', {}))
  assert.equal(drawer.isListing, true)
  assert.equal(drawer.hasContent, false)
  assert.deepEqual([drawer.fields, drawer.actions, drawer.texts], [[], [], []])
  // in a dialog, the selector's dialog draws it
  assert.equal(searchPickerOf(overlay('Dialog', {})).inDrawer, false)
})

test('@Searchable: la búsqueda del selector llena SUS filas (data-only a su id)', () => {
  let reg = searchableHost()
  reg = reduceContexts(reg, fx('searchable-multi-open'))
  reg = reduceContexts(reg, fx('searchable-multi-search'))
  const picker = searchPickerOf(reg)
  assert.equal(picker.rows.length, 30)
  assert.equal(picker.rows[0].name, 'Hotel 1')
  assert.equal(reg.contexts[HOST_ID].state.hotelIds[0], '3') // the host, untouched
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
  assert.deepEqual(reg.effects.events, []) // they do not follow the bus
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
  // the rest, untouched
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


// ── URL filters (declared, free text and selection by ids) and chat links ──────────────

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
  // comes back from the component: with the chip, ids; without it (removed with the ✕), nothing
  assert.deepEqual(filterStateOfSmartFilters(BOOKING_FILTERS, chips).values, { ids: '4MBZS7,JXD3G6' })
  assert.deepEqual(filterStateOfSmartFilters(BOOKING_FILTERS, []).values, {})
  // in the search, in the componentState like any filter
  assert.equal(listingSearchStateOf({}, { filters: values }).ids, '4MBZS7,JXD3G6')
  // and the chip can open its editor: it has metadata, also on a listing with no declared filters
  assert.ok(smartFiltersMetadataOf(BOOKING_FILTERS).polymorphicTypes.ids)
  assert.deepEqual(filterChipsOf(BOOKING_FILTERS, values)[0].keys, ['ids'])
  // a listing that DECLARES its own ids filter treats it as its own (no double chip)
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
  // round trip through the query
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
  // the requested navigation (chat) is compared with what is LOADED, not with the menu entry
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  assert.match(nav, /window\.__mateuLoadedFull/)
  assert.match(nav, /bridge\.splitListingQuery\(target\.filters\)/)
  // a deep link with a query keeps it in the URL (the VB router removed it on startup)
  assert.match(nav, /history\.replaceState\(window\.history\.state, '', bridge\.urlOfRoute\(target\.full\)\)/)
  // changing filters rewrites the URL
  assert.match(webApp('flows/main/pages/main-start-page-chains/smartFiltersChanged.js'), /bridge\.listingUrlOf\(/)
})

test('chat: un enlace a una ruta de la app se pinta como enlace (no texto, no vacío) y navega dentro', () => {
  const html = chatMarkdownToHtml('Nora Duarte: [4MBZS7](/booking/bookings/4MBZS7)')
  assert.equal(html, '<p>Nora Duarte: <a href="/booking/bookings/4MBZS7" class="mateu-chat-route" data-mateu-route="/booking/bookings/4MBZS7">4MBZS7</a></p>')
  // the query (& escaped in the attribute) and the href's _ are not broken by the italics
  assert.equal(chatMarkdownToHtml('[ver](/booking/bookings?ids=A_B,C_D&status=Cancelled) _ok_'),
    '<p><a href="/booking/bookings?ids=A_B,C_D&amp;status=Cancelled" class="mateu-chat-route" data-mateu-route="/booking/bookings?ids=A_B,C_D&amp;status=Cancelled">ver</a> <em>ok</em></p>')
  // //host is not an app route
  assert.equal(chatMarkdownToHtml('[x](//evil.com/a)'), '<p>[x](//evil.com/a)</p>')
  // the click: only a normal one on one of our links
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
  // Redwood's chat sends it in the first message of the session (before, it never sent it)
  const send = webApp('pages/shell-page-chains/chatSend.js')
  assert.match(send, /bridge\.chatTurnOf\(/)
  assert.match(send, /sendMenu = window\.__mateuChatMenuSentFor !== sessionId/)
})

test('guided process: el overview sólo va en columna en teléfono (< 600px), no en ventanas bajas', () => {
  // the query oj-sp-guided-process uses to decide the column is rewritten; the rest, untouched
  assert.equal(guidedProcessMediaQuery('(max-width: 767px), (max-height: 767px)'), '(max-width: 599px)')
  assert.equal(guidedProcessMediaQuery(' (max-width: 767px),  (max-height: 767px) '), '(max-width: 599px)')
  assert.equal(guidedProcessMediaQuery('(min-width: 768px)'), '(min-width: 768px)')
  assert.equal(guidedProcessMediaQuery('(max-width: 767px)'), '(max-width: 767px)')
  // the wheel goes back to the page when the steps no longer overflow horizontally
  assert.equal(guidedProcessWheelIsNative({ scrollWidth: 1200, clientWidth: 1200 }), true)
  assert.equal(guidedProcessWheelIsNative({ scrollWidth: 1600, clientWidth: 1200 }), false)
  assert.equal(guidedProcessWheelIsNative(null), false)
  // the wizard guard installs it, and app.css spreads the panels horizontally from tablet up
  assert.match(webApp('resources/js/mateu-bridge.js'), /relaxGuidedProcessOverview\(\)/)
  const css = webApp('resources/css/app.css')
  assert.match(css, /@media \(min-width: 600px\)[\s\S]*#mateuWizardEl \.oj-sp-guided-process-step-container[\s\S]*display: grid/)
  assert.match(css, /grid-template-columns: repeat\(auto-fit, minmax\(/)
})

// Column WIDTH (@ColumnWidth: width "420px" + flexGrow "0" + tooltipPath on the GridColumn,
// Mateu #703): oj-table fixes the width (min = max = width), the cell is cut with an ellipsis and
// the whole text goes to the title; the other columns do not change. The row stays untouched.
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
  assert.equal(listing.rows[0].name, rows[0].name) // the row, untouched
  // the rest of the columns, as before: no width and no clipping template
  for (const c of listing.columns.filter((c) => c.id !== 'name')) {
    assert.equal(c.width, undefined)
    assert.notEqual(c.template, 'cellClip')
  }
  // sorting by the header returns the wire id; the selection sends the row without the cell
  assert.deepEqual(listingSortOf({ header: 'name__clipCell', direction: 'ascending' }, listing.sortFields)[0].field, 'name')
  assert.ok(selectedRowsOf(listing.rows, { all: true, keys: [], except: [] }).every((r) => !('name__clipCell' in r)))
  // the template exists in the listing table (and in the picker, and in a drawer's listing), and
  // app.css cuts with an ellipsis
  const html = webApp('flows/main/pages/main-start-page.html')
  assert.equal((html.match(/<template slot="cellClip">/g) || []).length, 3)
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
    assert.equal(el.scrollTop, 1000)            // on connecting, at the end
    el.scrollHeight = 1300; observed([{ addedNodes: [] }])
    assert.equal(el.scrollTop, 1300)            // a chunk of response arrives: it keeps following the end
    el.scrollTop = 200; listeners.scroll()      // the reader moves up to re-read
    el.scrollHeight = 1500; observed([{ addedNodes: [] }])
    assert.equal(el.scrollTop, 200)             // does not drag it along
    const userBubble = { nodeType: 1, querySelector: (s) => s === '.mateu-chat-user-text' ? {} : null, classList: { contains: () => false } }
    el.scrollHeight = 1700; observed([{ addedNodes: [userBubble] }])
    assert.equal(el.scrollTop, 1700)            // sends another question: follows the end again
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

test('a11y: navegar con un drawer abierto (el del contexto) no se lleva el foco al contenido', () => {
  const doc = (opened) => ({ querySelectorAll: () => [{ opened: false }, { opened }] })
  assert.equal(overlayIsOpen(doc(true)), true)
  assert.equal(overlayIsOpen(doc(false)), false)
  assert.equal(overlayIsOpen(null), false)
})

test('enlaces: un <a href> del contenido a una ruta de la app navega dentro de la shell; el resto, el navegador', () => {
  const loc = { href: 'https://rw.ec1.mateu.io/booking/bookings/ZUAAKJ', origin: 'https://rw.ec1.mateu.io',
    pathname: '/booking/bookings/ZUAAKJ', search: '' }
  const a = (href, attrs = {}) => ({ getAttribute: (n) => (n === 'href' ? href : (n in attrs ? attrs[n] : null)) })
  const click = { button: 0 }
  const route = (href, attrs, ev = click, hashMode = false) => inAppRouteOfLink(a(href, attrs), ev, loc, hashMode)
  // the case: «Ver recorrido» of a booking's record page
  assert.equal(route('/journey/bookings/ZUAAKJ'), '/journey/bookings/ZUAAKJ')
  // with its query; relative and absolute of the same origin too
  assert.equal(route('/booking/bookings?status=Cancelled&ids=A_B'), '/booking/bookings?status=Cancelled&ids=A_B')
  assert.equal(route('https://rw.ec1.mateu.io/journey/bookings/X1'), '/journey/bookings/X1')
  assert.equal(route('../customers/7'), '/booking/customers/7')
  assert.equal(route('/customers/ana.ruiz'), '/customers/ana.ruiz', 'un id con punto no es un fichero')
  assert.equal(route('/'), '/', 'la home: la shell la traduce a su ruta de inicio')
  assert.equal(route('/journey/bookings/X1', { target: '_self' }), '/journey/bookings/X1')
  assert.equal(route('/journey/bookings/X1', {}, { button: 0, key: 'Enter' }), '/journey/bookings/X1', 'Enter llega como click')
  // another console / another host / another scheme: the browser
  assert.equal(route('https://vaadin.ec1.mateu.io/journey/bookings/X1'), null)
  assert.equal(route('//evil.com/x'), null)
  assert.equal(route('http://rw.ec1.mateu.io/journey/bookings/X1'), null, 'otro origen (esquema)')
  assert.equal(route('mailto:a@b.c'), null)
  assert.equal(route('javascript:void(0)'), null)
  // what the author wanted outside: another tab, download, router-ignore
  assert.equal(route('/journey/bookings/X1', { target: '_blank' }), null)
  assert.equal(route('/journey/bookings/X1', { download: '' }), null)
  assert.equal(route('/journey/bookings/X1', { 'router-ignore': '' }), null)
  // a click that is not the normal one, or that someone else already handled (chat, widget badge)
  assert.equal(route('/journey/bookings/X1', {}, { button: 1 }), null, 'botón del medio')
  for (const k of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
    assert.equal(route('/journey/bookings/X1', {}, { button: 0, [k]: true }), null, k)
  }
  assert.equal(route('/journey/bookings/X1', {}, { button: 0, defaultPrevented: true }), null)
  // same-page anchors, empty href or no href
  assert.equal(route('#'), null)
  assert.equal(route('#expand=recorrido'), null)
  assert.equal(route('/booking/bookings/ZUAAKJ#expand=recorrido'), null)
  assert.equal(route(''), null)
  assert.equal(route(null), null)
  // they are not screens: internal routes, API, login, files, static assets
  for (const href of ['/_inbox', '/_journey/mateu/v3/ui', '/api/bookings', '/oauth2/authorization/keycloak', '/login',
    '/logout', '/files/factura.pdf', '/export/bookings.csv', '/version_123/resources/js/x.js', '/assets/logo.png']) {
    assert.equal(route(href), null, href)
  }
  // in static (hash mode) `#/ruta` is also a screen
  assert.equal(route('#/journey/bookings/X1', {}, click, true), '/journey/bookings/X1')
  assert.equal(route('#/journey/bookings/X1', {}, click, false), null)
  // the shell wires it: listens for clicks on #pageContent and navigates with onMateuNavigate
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.inAppRouteOfLink\(anchor, event, window\.location/)
  assert.match(shell, /getElementById\('pageContent'\)/)
  assert.match(shell, /event\.preventDefault\(\);\s*Actions\.callChain\(liveContext\(\), \{\s*chain: 'onMateuNavigate'/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /'links\.mjs'/)
})

test('navegar: lo que la chain asigna (foldout, wizard, cola) se lee de constantes, no de vuelta de la variable', () => {
  // a VB `any` variable that held an object and is set to null reads INSIDE the chain as a
  // truthy proxy: from a booking's detail (foldout) to the itinerary, the host was not projected
  for (const rel of ['pages/shell-page-chains/onMateuNavigate.js', 'flows/main/pages/main-start-page-chains/runMateuAction.js']) {
    const src = webApp(rel)
    assert.doesNotMatch(src, /!\s*\$application\.variables\.mateu(Foldout|Queue|Wizard)\b/, rel)
    assert.doesNotMatch(src, /integratedHeader = !!\(\$application\.variables\.mateuWizard/, rel)
    assert.doesNotMatch(src, /if \(\$application\.variables\.mateuWizard\)/, rel)
    assert.match(src, /queue: queueNow, foldout: foldoutNow/, rel)
  }
})

test('wireVersion: mismo major vale; otro major se avisa UNA vez, en claro; sin campo se acepta', () => {
  assert.deepEqual(checkWireVersion('3.0'), { ok: true })
  assert.deepEqual(checkWireVersion('3.9'), { ok: true })
  assert.deepEqual(checkWireVersion(undefined), { ok: true })
  assert.deepEqual(checkWireVersion('banana'), { ok: true })
  assert.equal(checkWireVersion('4.0').ok, false)
  assert.equal(checkWireVersion('2.1').serverMajor, 2)
  const msg = wireMismatchMessage(4, 3, 'en')
  assert.match(msg, /4\.x/)
  assert.match(msg, /3\.x/)
  const seen = []
  resetWireVersionCheck()
  setWireMismatchListener((m) => seen.push(m))
  const quietConsole = console.error
  console.error = () => {}
  try {
    observeWireVersion({ wireVersion: '3.0' })
    observeWireVersion({ fragments: [] })
    assert.equal(seen.length, 0)
    assert.equal(observeWireVersion({ wireVersion: '4.0' }).ok, false)
    observeWireVersion({ wireVersion: '4.0' })
    assert.equal(seen.length, 1)
  } finally {
    console.error = quietConsole
    setWireMismatchListener(null)
    resetWireVersionCheck()
  }
  // the shell wires it to the error band
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.setWireMismatchListener\(/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /'wireVersion\.mjs'/)
})


import { withinAppLevels as p1WithinAppLevels } from './reduceContexts.mjs'
test('P1: dentro de un maestro la cabecera nombra al MAESTRO y el rótulo de la pestaña pasa al subtítulo', () => {
  const levels = [{ title: 'Customer 7', tabs: [] }]
  // a tab with its own @Title: the record it belongs to still heads the page (it used to vanish)
  assert.deepEqual(p1WithinAppLevels({ title: 'Customer orders', text: '' }, levels),
    { title: 'Customer 7', text: '', levelSubtitle: 'Customer orders' })
  // an untitled tab: the master's title, nothing to repeat
  assert.deepEqual(p1WithinAppLevels({ title: '' }, levels), { title: 'Customer 7', levelSubtitle: '' })
  // the same title on both: no echo in the subtitle
  assert.equal(p1WithinAppLevels({ title: 'Customer 7' }, levels).levelSubtitle, '')
  // no level (a plain screen): untouched
  const plain = { title: 'Orders' }
  assert.equal(p1WithinAppLevels(plain, []), plain)
  assert.equal(p1WithinAppLevels(plain, undefined), plain)
})


// ── INLINE islands (a form's component fields holding a ServerSide of their own) + the event bus ──
// sample1 EventsLab (/events-lab): two emitter islands and a listener island inside a plain form, the
// page subscribed in DOCUMENT and SELF scope, the listener in COMPONENT scope (from emitter-a).
// Before: the shell painted the form through its generic form and the islands were not drawn at all.
import {
  inlineIslandOf as iiInlineIslandOf, collectIslands as iiCollectIslands, hostContentOf as iiHostContentOf,
  hostContentShown as iiHostContentShown, withSubresources as iiWithSubresources, summarizeHost as iiSummarizeHost,
  pendingSubresourcesOf as iiPendingSubresourcesOf,
} from './reduceContexts.mjs'
import {
  loadSubresources as iiLoadSubresources, runSurfaceAction as iiRunSurfaceAction, inlineIslandsOf as iiInlineIslandsOf,
  busSubscribersOf as iiBusSubscribersOf, registerInlineIsland as iiRegisterInlineIsland,
} from './transport.mjs'

const iiAtoms = (blocks) => (blocks || []).flatMap((b) => b.items || [])
const iiHostOf = () => {
  const reg = reduceContexts(empty(), fx('sut-events-lab'))
  // what loadRouteInto stamps on the host when the page is loaded
  reg.contexts[HOST_ID].outbound = { route: '/events-lab', consumedRoute: '', serverSideType: 'io.mateu.sample1.actions.EventsLab', baseUrl: 'http://x' }
  return reg
}

test('inline islands: a ServerSide held by a form field is a SURFACE of its own, not the legacy island, and makes the content the body', () => {
  const reg = iiHostOf()
  const host = reg.contexts[HOST_ID]
  const islands = iiInlineIslandsOf(host.tree)
  assert.deepEqual(islands.map((i) => i.serverSideType.split('.').pop()), ['PingEmitterA', 'PingEmitterB', 'FilteredListener'])
  assert.deepEqual(islands[2].componentState, { times: 0, last: 'nothing' })
  assert.ok(islands.every((i) => i.surface && i.inline && i.inline.type === 'ServerSide'))
  // the island dance (mateuIsland: an embedded mediator loaded in two steps) does not take them
  assert.deepEqual(iiCollectIslands(host.tree), [])
  // the legacy shapes stay legacy: an embedded mediator (App MEDIATOR child) is not inline
  const guestNote = reduceContexts(empty(), fx('island-host')).contexts[HOST_ID]
  assert.equal(iiInlineIslandOf(iiCollectIslands(guestNote.tree)[0]), null)
  // (the predicate is a node test: the walkers — visitNode, collectIslands, inlineIslandsOf — skip the root)
  assert.deepEqual(iiInlineIslandsOf(host.tree).map((i) => i.id).includes(host.tree.id), false)
  // the content: one hole per island, in document order, next to the form's fields
  const summary = iiSummarizeHost(reg, '/events-lab')
  const blocks = iiHostContentOf(host, null, { title: summary.title })
  const holes = iiAtoms(blocks).filter((a) => a.isInlineIsland)
  assert.deepEqual(holes.map((h) => h.islandId), islands.map((i) => i.id))
  assert.ok(holes.every((h) => h.isSubresource && h.subresource.inline), 'painted and loaded like a @Subresource')
  assert.deepEqual(iiAtoms(blocks).filter((a) => a.isFormLayout).flatMap((a) => a.fields.map((f) => f.fieldId)), ['heardByPage', 'heardFromChild'])
  assert.equal(iiHostContentShown(blocks, summary), true, 'the generic form (which dropped the islands) steps aside')
  assert.deepEqual(iiPendingSubresourcesOf(blocks, reg.contexts).map((s) => s.id), islands.map((i) => i.id))
})

test('inline islands: read through VB-like proxies (a fresh wrapper per property read) the root is still the page, not an island', () => {
  // VB hands the chains its variables as proxies: `node !== ctx.tree` held for the ROOT, which was
  // then taken for an inline island — the page painted as one hole. Position, not identity.
  const vbLike = (o) => new Proxy(o, { get: (t, k) => { const v = t[k]; return v && typeof v === 'object' ? vbLike(v) : v } })
  const reg = iiHostOf()
  const direct = iiHostContentOf(reg.contexts[HOST_ID], null, { title: 'Events lab' })
  const proxied = iiHostContentOf(vbLike(reg.contexts[HOST_ID]), null, { title: 'Events lab' })
  const shape = (blocks) => iiAtoms(blocks).map((a) => Object.keys(a).filter((k) => /^is[A-Z]/.test(k) && a[k]).join(','))
  assert.deepEqual(shape(proxied), shape(direct))
  assert.equal(iiAtoms(proxied).filter((a) => a.isInlineIsland).length, 3)
  assert.equal(iiAtoms(proxied).filter((a) => a.isFormLayout).length, 1)
})

test('component holder (walk-behaviour): a `Callable<Component>` field\'s Text is drawn — the content is the body, with the fields', () => {
  const reg = reduceContexts(empty(), fx('sut-walk-behaviour'))
  const summary = iiSummarizeHost(reg, '/walk-behaviour')
  assert.ok(summary.fields.length, 'a plain form: the generic form has fields to paint')
  const blocks = iiHostContentOf(reg.contexts[HOST_ID], null, { title: summary.title })
  const greeting = iiAtoms(blocks).find((a) => a.isText && a.text === 'Hello from a component holder')
  assert.ok(greeting, 'the holder\'s Text is in the content')
  assert.ok(greeting.fromHolder, 'marked as the holder\'s')
  assert.equal(iiHostContentShown(blocks, summary), true, 'so the content paints the page (it used to lose to the generic form)')
  // its fields travel in the content's form layouts, every one of them once
  const fieldIds = iiAtoms(blocks).filter((a) => a.isFormLayout).flatMap((a) => a.fields.map((f) => f.fieldId))
  assert.deepEqual(fieldIds, ['name', 'amount', 'lockedForGuests', 'disabledForGuests', 'address-street', 'address-city', 'autoSaves'])
  // the section titles are headings (the generic form's own vocabulary): they alone never flip a form
  assert.ok(!iiAtoms(blocks).some((a) => a.isText && a.isHeading && a.fromHolder))
  // the overlay lab (fields only) keeps its generic form
  const plain = reduceContexts(empty(), fx('sut-overlay-lab'))
  const plainSummary = iiSummarizeHost(plain, '/overlay-lab')
  assert.equal(iiHostContentShown(iiHostContentOf(plain.contexts[HOST_ID], null, { title: plainSummary.title }), plainSummary), false)
})

atest('inline islands: registered from their node with NO request, painted in their hole, actions tagged with their id', async () => {
  const original = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => { calls++; return { ok: true, json: async () => ({ fragments: [] }) } }
  try {
    let reg = iiHostOf()
    const summary = iiSummarizeHost(reg, '/events-lab')
    const blocks = iiHostContentOf(reg.contexts[HOST_ID], null, { title: summary.title })
    reg = await iiLoadSubresources('http://x', reg, blocks, { appState: {} })
    assert.equal(calls, 0, 'the island arrived with its tree: nothing to load')
    const islands = iiInlineIslandsOf(reg.contexts[HOST_ID].tree)
    const listener = reg.contexts[islands[2].id]
    assert.equal(listener.kind, 'island')
    assert.deepEqual(listener.state, { times: 0, last: 'nothing' })
    // an action from it goes out as the web's nested mateu-component sends it: the page's route and
    // consumed route, the ISLAND's class, answered to the island's id
    assert.deepEqual(listener.outbound, { route: '/events-lab', consumedRoute: '', serverSideType: 'io.mateu.sample1.actions.FilteredListener', baseUrl: 'http://x' })
    const painted = iiWithSubresources(blocks, reg.contexts)
    const atoms = iiAtoms(painted)
    assert.ok(!atoms.some((a) => a.isInlineIsland), 'the holes are filled')
    const buttons = atoms.filter((a) => a.isButtons).flatMap((a) => a.buttons)
    assert.deepEqual(buttons.map((b) => [b.label, b.surfaceId]), [['Ping A', islands[0].id], ['Child ping A', islands[0].id], ['Ping B', islands[1].id]])
    assert.ok(atoms.some((a) => a.isText && a.text === 'Listener heard nothing (0)'), 'the listener\'s text, interpolated with ITS state')
    // the FILLED blocks still make the content the body: the chains decide on them, after the fill
    // (the holes are gone by then — and a form page with islands fell back to its generic form)
    assert.ok(atoms.filter((a) => a.isButtons || a.isText).every((a) => a.fromSurface))
    assert.equal(iiHostContentShown(painted, summary), true)
    // registering again (a host re-render re-sends the island) keeps the context, state refreshed from the node
    const again = await iiRegisterInlineIsland('http://x', reg, { ...islands[2], componentState: { times: 3, last: 'from A' } }, {})
    assert.deepEqual(again.contexts[islands[2].id].state, { times: 3, last: 'from A' })
  } finally { globalThis.fetch = original }
})

atest('event bus across surfaces: DOCUMENT hears any island, COMPONENT only its `from`, SELF what bubbles from inside', async () => {
  const original = globalThis.fetch
  const sent = []
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body)
    sent.push(body)
    const type = String(body.serverSideType || '').split('.').pop()
    const from = (body.parameters || {}).from
    let answer = { fragments: [], commands: [], messages: [] }
    if (body.actionId === 'pingB') answer.commands = [{ type: 'DispatchEvent', data: { eventName: 'lab-ping', detail: { from: 'B' } } }]
    if (body.actionId === 'pingA') answer.commands = [{ type: 'DispatchEvent', data: { eventName: 'lab-ping', detail: { from: 'A' } } }]
    if (body.actionId === 'childPingA') answer.commands = [{ type: 'DispatchEvent', data: { eventName: 'child-ping', detail: { from: 'A' } } }]
    if (type === 'EventsLab' && body.actionId === 'onPing') answer.fragments = [{ targetComponentId: body.initiatorComponentId, state: { heardByPage: 'ping from ' + from } }]
    if (type === 'EventsLab' && body.actionId === 'onChild') answer.fragments = [{ targetComponentId: body.initiatorComponentId, state: { heardFromChild: 'child ping from ' + from } }]
    if (type === 'FilteredListener' && body.actionId === 'heard') answer.fragments = [{ targetComponentId: body.initiatorComponentId, state: { times: (body.componentState.times || 0) + 1, last: 'from ' + from } }]
    return { ok: true, json: async () => answer }
  }
  try {
    let reg = iiHostOf()
    const summary = iiSummarizeHost(reg, '/events-lab')
    const blocks = iiHostContentOf(reg.contexts[HOST_ID], null, { title: summary.title })
    reg = await iiLoadSubresources('http://x', reg, blocks, { appState: {} })
    const [a, b, listener] = iiInlineIslandsOf(reg.contexts[HOST_ID].tree).map((i) => i.id)
    // «Ping B»: the page hears it (DOCUMENT); the listener (COMPONENT from emitter-a) does not
    reg = await iiRunSurfaceAction(reg, b, 'pingB', {}, { appState: {} })
    assert.deepEqual(sent.map((s) => s.actionId), ['pingB', 'onPing'])
    assert.equal(sent[0].serverSideType, 'io.mateu.sample1.actions.PingEmitterB')
    assert.equal(sent[0].initiatorComponentId, b)
    assert.equal(sent[0].route, '/events-lab')
    assert.deepEqual(sent[1].parameters, { from: 'B', __source: 'emitter-b' }, 'the detail is the handler\'s parameters, the emitter named like the web stamps it')
    assert.equal(reg.contexts[HOST_ID].state.heardByPage, 'ping from B')
    assert.equal(reg.contexts[listener].state.times, 0)
    // «Ping A»: the page AND the listener (its `from` matches @Emits(name = "emitter-a"))
    sent.length = 0
    reg = await iiRunSurfaceAction(reg, a, 'pingA', {}, { appState: {} })
    assert.deepEqual(sent.map((s) => s.actionId).sort(), ['heard', 'onPing', 'pingA'])
    assert.equal(reg.contexts[HOST_ID].state.heardByPage, 'ping from A')
    assert.deepEqual(reg.contexts[listener].state, { times: 1, last: 'from A' })
    const atoms = iiAtoms(iiWithSubresources(iiHostContentOf(reg.contexts[HOST_ID], null, { title: summary.title }), reg.contexts))
    assert.ok(atoms.some((x) => x.isText && x.text === 'Listener heard from A (1)'), 're-projected with the listener\'s new state')
    // «Child ping A» (child-ping): the page's SELF subscription — the island is inside the page
    sent.length = 0
    reg = await iiRunSurfaceAction(reg, a, 'childPingA', {}, { appState: {} })
    assert.deepEqual(sent.map((s) => s.actionId), ['childPingA', 'onChild'])
    assert.equal(reg.contexts[HOST_ID].state.heardFromChild, 'child ping from A')
    // the scopes, spelled out
    const subs = (event) => iiBusSubscribersOf(reg, event).map((s) => [s.ctxId === HOST_ID ? 'host' : s.ctxId === listener ? 'listener' : s.ctxId, s.actionId])
    assert.deepEqual(subs({ name: 'lab-ping', source: b }), [['host', 'onPing']])
    assert.deepEqual(subs({ name: 'lab-ping', source: a }), [['host', 'onPing'], ['listener', 'heard']])
    assert.deepEqual(subs({ name: 'child-ping', source: a }), [['host', 'onChild']])
    assert.deepEqual(subs({ name: 'child-ping', source: null }), [], 'SELF needs a source inside the page')
    assert.deepEqual(subs({ name: 'child-ping', source: HOST_ID }), [['host', 'onChild']], 'a surface hears its own')
    assert.deepEqual(iiBusSubscribersOf(reg, { name: 'lab-ping', source: a }, { skipHost: true }).map((s) => s.actionId), ['heard'])
  } finally { globalThis.fetch = original }
})


// ── @Toc: the sticky sections index (toc.mjs tocOf) ─────────────────────────────────────────────
import { tocOf as tocProjectionOf, TOC_EMPTY as tocEmpty } from './toc.mjs'

test('@Toc: a long sectioned page (walk-layout, toc=true) projects one entry per titled section, in order, with its shortcut key', () => {
  const host = reduceContexts(empty(), fx('sut-walk-layout')).contexts[HOST_ID]
  const toc = tocProjectionOf(host)
  assert.equal(toc.on, true)
  assert.equal(toc.cls, 'mateu-has-toc')
  assert.deepEqual(toc.entries.map((e) => e.title), ['Guests', 'Document', 'Contact', 'Address', 'Preferences', 'Notes', 'History'])
  assert.deepEqual(toc.entries.map((e) => e.key), ['1', '2', '3', '4', '5', '6', '7'])
  assert.deepEqual(toc.entries.map((e) => e.index), [0, 1, 2, 3, 4, 5, 6])
  assert.equal(toc.entries[0].hint, 'Guests (Ctrl+Alt+1)')
  assert.equal(toc.entries[0].sticky, true, 'the pinned section (@Section(sticky = true)) is flagged')
  assert.equal(toc.entries[1].sticky, false)
  // roving tabindex, as Spectra's navigator: one tab stop, the arrows move inside the list
  assert.deepEqual(toc.entries.map((e) => e.tabIndex), [0, -1, -1, -1, -1, -1, -1])
  // the two untitled frameless bands at the top are not entries (nothing to name them by)
  assert.ok(!toc.entries.some((e) => !e.title))
  // the painted section cards carry the marker the DOM wiring finds them by, in the same order
  const blocks = iiHostContentOf(host, null, { title: 'Layout walk' })
  assert.deepEqual(blocks.filter((b) => b.sectionTitle).map((b) => b.sectionTitle), toc.entries.map((e) => e.title))
})

test("a titled @Section is Spectra's oj-sp-section: the card is flagged and its body drops the heading the section draws", async () => {
  const { sectionBodyOf } = await import('./core/content.mjs')
  const host = reduceContexts(empty(), fx('sut-walk-layout')).contexts[HOST_ID]
  const sections = iiHostContentOf(host, null, { title: 'Layout walk' }).filter((b) => b.sectionTitle)
  assert.ok(sections.length >= 5)
  for (const block of sections) {
    assert.equal(block.spSection, true, block.sectionTitle)
    // the section's title is not repeated inside it
    assert.ok(!block.sectionItems.some((a) => a.isHeading && a.text === block.sectionTitle), block.sectionTitle)
  }
  // the card's own items are untouched (other surfaces paint them as they were)
  assert.ok(sections.some((b) => b.items[0] && (b.items[0].isHeading || b.items[0].isRow)))
  // a heading sharing the title row with the section's buttons: the row stays, without the heading
  const row = { isRow: true, items: [{ rowHeading: true, text: 'Guests' }, { rowButton: true, actionId: 'add' }] }
  assert.deepEqual(sectionBodyOf([row, { isText: true, text: 'x' }]), [{ isRow: true, items: [{ rowButton: true, actionId: 'add' }] }, { isText: true, text: 'x' }])
  assert.deepEqual(sectionBodyOf([{ isRow: true, items: [{ rowHeading: true, text: 'G' }] }, { isText: true, text: 'x' }]), [{ isText: true, text: 'x' }])
  assert.deepEqual(sectionBodyOf([{ isHeading: true, text: 'G' }, { isText: true, text: 'x' }]), [{ isText: true, text: 'x' }])
  assert.deepEqual(sectionBodyOf([{ isText: true, text: 'x' }]), [{ isText: true, text: 'x' }])
})

test('@Toc: tri-state — false suppresses, absent is AUTO (5+ titled sections, not a @Zones form), a short form has none', () => {
  const host = reduceContexts(empty(), fx('sut-walk-layout')).contexts[HOST_ID]
  const withToc = (value) => {
    const tree = JSON.parse(JSON.stringify(host.tree))
    const page = tree.children[0]
    if (value === undefined) delete page.metadata.toc
    else page.metadata.toc = value
    return { ...host, tree }
  }
  assert.equal(tocProjectionOf(withToc(false)).on, false)
  assert.deepEqual(tocProjectionOf(withToc(false)).entries, [])
  assert.equal(tocProjectionOf(withToc(undefined)).on, true, '7 titled sections stacked vertically: auto on')
  assert.equal(tocProjectionOf(withToc(null)).on, true)
  // the same sections laid out in @Zones columns (a HorizontalLayout of flex-basis columns): auto off, true still forces
  const zoned = withToc(undefined)
  const page = zoned.tree.children[0]
  const sections = []
  const pick = (n) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(pick); return }
    if (n.cssClasses && /mateu-section/.test(n.cssClasses)) { sections.push(n); return }
    for (const v of Object.values(n)) if (v && typeof v === 'object') pick(v) }
  pick(page.children)
  assert.equal(sections.length, 7)
  page.children = [{ type: 'ClientSide', metadata: { type: 'HorizontalLayout' }, children: [
    { type: 'ClientSide', style: 'flex: 1 1 calc(60% - 1rem);', metadata: { type: 'VerticalLayout' }, children: sections.slice(0, 4) },
    { type: 'ClientSide', style: 'flex: 1 1 calc(40% - 1rem);', metadata: { type: 'VerticalLayout' }, children: sections.slice(4) },
  ] }]
  assert.equal(tocProjectionOf(zoned).on, false)
  page.metadata.toc = true
  assert.equal(tocProjectionOf(zoned).on, true)
  assert.equal(tocProjectionOf(zoned).entries.length, 7)
  // a form with one section (overlay lab), the events lab, a page with no tree: off
  assert.equal(tocProjectionOf(reduceContexts(empty(), fx('sut-overlay-lab')).contexts[HOST_ID]).on, false)
  assert.equal(tocProjectionOf(reduceContexts(empty(), fx('sut-events-lab')).contexts[HOST_ID]).on, false)
  assert.equal(tocProjectionOf(null), tocEmpty)
  assert.equal(tocProjectionOf({ tree: null }), tocEmpty)
  // an island's sections are not the page's
  const withIsland = withToc(undefined)
  withIsland.tree.children[0].children.push({ type: 'ServerSide', id: 'isl', serverSideType: 'x.Y', children: [
    { type: 'ClientSide', cssClasses: 'mateu-section', metadata: { type: 'Card' }, children: [{ type: 'ClientSide', metadata: { type: 'Text', container: 'h3', text: 'Inner' } }] },
  ] })
  assert.ok(!tocProjectionOf(withIsland).entries.some((e) => e.title === 'Inner'))
})

// @Zones of a crud's detail (BUGS workshop #8): the server sends Page > ResponsiveGrid «35% 65%» >
// [column of section cards, column of section cards]. The generic form has one column and used to win
// (the form has fields), painting every section stacked in a single card. Real captures: the edit view
// as it came, the read-only view derived from it (its fields readOnly, the id card hidden).
test('@Zones in a crud detail: the columns are the body (4/12 + 8/12), the generic form steps aside', () => {
  for (const name of ['crud-view-zones', 'crud-edit-zones']) {
    const reg = reduceContexts(empty(), fx(name))
    const host = reg.contexts[HOST_ID]
    const blocks = hostContentOf(host, null, { title: summarizeHost(reg).title })
    const zoned = blocks.filter((b) => /oj-md-/.test(b.blockClass))
    assert.equal(zoned.length, 2, name)
    assert.match(zoned[0].blockClass, /oj-md-4/, name)
    assert.match(zoned[1].blockClass, /oj-md-8/, name)
    assert.ok(zoned.every((b) => b.fromColumns), name)
    // each column keeps its sections' headings and their fields (Contacto + Matrícula | Datos personales + Observaciones)
    assert.deepEqual(zoned[0].items.filter((a) => a.isHeading).map((a) => a.text), ['Contacto', 'Matrícula'], name)
    assert.deepEqual(zoned[1].items.filter((a) => a.isHeading).map((a) => a.text), ['Datos personales', 'Observaciones'], name)
    assert.ok(zoned[1].items.some((a) => a.isFormLayout && a.fields.some((f) => f.fieldId === 'nombre')), name)
    assert.equal(p1HostContentShown(blocks, summarizeHost(reg)), true, name + ': the content wins over the generic form')
  }
  // read-only in the view, editable in the editor
  const layouts = (name) => hostContentOf(reduceContexts(empty(), fx(name)).contexts[HOST_ID], null, {})
    .flatMap((b) => b.items).filter((a) => a.isFormLayout)
  assert.ok(layouts('crud-view-zones').every((l) => l.readonly))
  assert.ok(layouts('crud-edit-zones').some((l) => !l.readonly))
})

// A column grid NESTED in a block (CollectionDetail: its list/detail grid sits in a CustomField of the
// form's card) was stacked — a block cannot hold columns. It is hoisted: the card is cut, the grid's
// columns follow it at the page's level, and what the card still had goes to a continuation block.
test('a column grid nested in a card is hoisted to the page level, in order', () => {
  const cdReg = reduceContexts(empty(), fx('tpl-collection-detail'))
  const blocks = hostContentOf(cdReg.contexts[HOST_ID], null, { title: summarizeHost(cdReg).title })
  assert.equal(blocks.length, 3)
  assert.ok(blocks[0].items.some((a) => a.isFormLayout), 'the card keeps the search field')
  assert.match(blocks[1].blockClass, /oj-md-4/) // 22rem of a 1200px page → a third
  assert.ok(blocks[1].items.some((a) => a.isQueue))
  assert.match(blocks[2].blockClass, /oj-md-8/)
  assert.ok(blocks[2].items.some((a) => a.isEmptyStateAtom))
  // synthetic: what follows the grid inside the card is not lost nor moved before it
  const card = { type: 'ClientSide', metadata: { type: 'Card', title: 'Card' }, children: [
    { type: 'ClientSide', metadata: { type: 'Text', text: 'before' } },
    { type: 'ClientSide', metadata: { type: 'ResponsiveGrid', gridTemplateColumns: '1fr 1fr' }, children: [
      { type: 'ClientSide', metadata: { type: 'Text', text: 'left' } },
      { type: 'ClientSide', metadata: { type: 'Text', text: 'right' } },
    ] },
    { type: 'ClientSide', metadata: { type: 'Text', text: 'after' } },
  ] }
  const out = hostContentOf({ tree: { type: 'ServerSide', id: 's', children: [card] }, state: {} }, null, {})
  assert.deepEqual(out.map((b) => b.items.map((a) => a.text).join(',')), ['Card,before', 'left', 'right', 'after'])
  assert.deepEqual(out.map((b) => (b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '12'), ['12', '6', '6', '12'])
  assert.ok(out[3].isCard, 'the continuation is still the card')
  // a grid with ONE track stays where it was
  card.children[1].metadata.gridTemplateColumns = '1fr'
  const single = hostContentOf({ tree: { type: 'ServerSide', id: 's', children: [card] }, state: {} }, null, {})
  assert.equal(single.length, 1)
})

test('DataManagement: «1fr 22rem» gives the table 8/12 and the docked panel 4/12 (not 50/50)', () => {
  const blocks = hostContentOf(reduceContexts(empty(), fx('tpl-data-management')).contexts[HOST_ID], null, {})
  const cols = blocks.filter((b) => /oj-md-/.test(b.blockClass))
  assert.deepEqual(cols.map((b) => b.blockClass.match(/oj-md-(\d+)/)[1]), ['8', '4'])
  assert.ok(cols[0].items.some((a) => a.isGrid))
})
// A Wizard in a Drawer (GuidedProcessDrawer: Drawer.content = EmbeddedView(wizard)). The overlay is
// painted from its embedded SURFACE; «Next» is answered with a Replace of that surface (the server
// targets the initiator, the wizard's ServerSide). The reducer put it in the overlay's `tree` and left
// `surface` alone: the drawer stayed on step 1. Real open; the next step is the same server's answer
// with the demo's workaround (a new Drawer per step) undone into the Replace Mateu sends without it.
test('a wizard in a drawer advances: the answer re-renders the embedded surface, the drawer keeps its frame', () => {
  let reg = reduceContexts(empty(), fx('open-drawer-wizard'))
  const opened = drawerOverlayOf(reg)
  assert.deepEqual(opened.fields.map((f) => f.fieldId), ['nombre', 'apellidos', 'fechaNacimiento', 'email'])
  const overlayId = reg.stack[reg.stack.length - 1]
  const next = fx('drawer-wizard-next')
  reg = reduceContexts(reg, next, { initiator: overlayId })
  assert.deepEqual(reg.stack, [overlayId], 'the same drawer, not a second one')
  const step2 = drawerOverlayOf(reg)
  assert.deepEqual(step2.fields.map((f) => f.fieldId), ['curso', 'turno', 'optativa', 'comedor'])
  assert.equal(step2.title, 'Matricular a un estudiante', 'the Drawer frame (its header title) is kept')
  assert.equal(reg.contexts[overlayId].tree.metadata.type, 'Drawer')
  // the next answer targets the NEW surface's id: it still lands in the drawer
  const back = JSON.parse(JSON.stringify(fx('open-drawer-wizard').fragments[0].component.metadata.content))
  reg = reduceContexts(reg, { fragments: [{ targetComponentId: next.fragments[0].component.id, component: back, state: back.initialData, action: 'Replace' }] })
  assert.deepEqual(drawerOverlayOf(reg).fields.map((f) => f.fieldId), ['nombre', 'apellidos', 'fechaNacimiento', 'email'])
  assert.deepEqual(reg.stack, [overlayId])
  // a host or an island has no surface: nothing new appears on them
  assert.ok(!('surface' in (reg.contexts[HOST_ID] || {})))
})
test('the real Welcome (con-micronaut demo): its five panels in order, the attendance TrendChart an area chart in its tile', () => {
  const w = welcomeOf(reduceContexts(empty(), fx('tpl-welcome')).contexts[HOST_ID])
  assert.deepEqual(w.tiles.map((t) => [t.title, t.isKpi]), [['Asistencia del curso', false], ['Alumnado', true], ['Evaluación', true], ['Primeros pasos', false], ['Avisos', false]])
  assert.equal(w.tiles[0].subtitle, '% de alumnos presentes por mes')
  assert.equal(w.tiles[0].items.find((a) => a.isChart).chartType, 'area')
  assert.equal(w.tiles[3].items.length, 3)
})
test('a Drawer placed in the page (GanttPage bottom panel) is a collapsible panel with its title; the overlay root is not', () => {
  const node = (metadata, children = []) => ({ type: 'ClientSide', metadata, children })
  const blocks = hostContentOf(reduceContexts(empty(), fx('tpl-gantt-page')).contexts[HOST_ID], null, {})
  const atoms = blocks.flatMap((b) => b.items)
  const at = atoms.findIndex((a) => a.isCollapsible)
  assert.ok(at >= 0, 'the drawer has a header')
  assert.equal(atoms[at].title, 'Leyenda y próximos hitos')
  assert.equal(atoms[at].expanded, true)
  assert.ok(atoms[at + 1] && atoms[at + 1].isRichText, 'its content follows the header')
  // not collapsible: its title as a heading, then its content
  const inline = hostContentOf({ state: {}, data: {}, tree: { type: 'ServerSide', id: 's', children: [node({ type: 'VerticalLayout' }, [
    node({ type: 'Drawer', headerTitle: 'Side', content: [node({ type: 'Text', text: 'inside' })] })])] } }, null, {})
  assert.deepEqual(inline.flatMap((b) => b.items).map((a) => [!!a.isHeading, a.text]), [[true, 'Side'], [false, 'inside']])
  // a Drawer that IS the overlay (the root of its context) is painted by the drawer panel, as before
  const reg = reduceContexts(empty(), { fragments: [{ action: 'Add', targetComponentId: '', component: node({ type: 'Drawer', headerTitle: 'Panel', content: [node({ type: 'Text', text: 'body' })] }) }] })
  assert.ok(!drawerOverlayOf(reg).content.flatMap((b) => b.items).some((a) => a.isCollapsible))
})
test('Hero Search (con-micronaut demo, gridLayout = cards): the listing is a grid of cards — title, badge, @Line, pairs', () => {
  let reg = reduceContexts(empty(), fx('tpl-hero-search'))
  const before = listingOf(reg.contexts[HOST_ID])
  assert.equal(before.cardLayout, true)
  assert.equal(before.showCards, true)
  assert.deepEqual(before.cards, [], 'no search yet: no cards (the empty state)')
  reg = reduceContexts(reg, fx('tpl-hero-search-results'))
  const listing = listingOf(reg.contexts[HOST_ID])
  assert.equal(listing.cards.length, 8)
  const [robotica, , teatro] = listing.cards
  assert.equal(robotica.title, 'Robótica')
  assert.deepEqual(robotica.badges, [{ key: 'disponibilidad', text: 'Últimas plazas', cls: 'oj-badge oj-badge-warning oj-badge-subtle' }])
  // @Line(2): under the title, labelled
  assert.deepEqual(robotica.lines.map((l) => l.pairs.map((p) => p.label + ': ' + p.text)), [['Profesor/a: Marta Ríos', 'Horario: Lunes y Miércoles 16:30-18:00']])
  // the other line-1 columns as pairs — an enum by its label, not the constant
  assert.deepEqual(robotica.pairs.map((p) => [p.label, p.text]), [['Etapa', 'ESO'], ['Plazas libres', '1'], ['Precio/mes', '35 €']])
  assert.equal(teatro.badges[0].cls, 'oj-badge oj-badge-danger oj-badge-subtle')
  // the card names its row by key: the click resolves the row as the table does
  assert.equal(listing.rows.find((r) => String(r._rowNumber) === String(teatro.key)).nombre, 'Teatro en inglés')
  assert.equal(robotica.hasImage, false)
  assert.equal(robotica.hasActions, false)
})
test('listing cards: which layout, the image, row actions, selection keys and the card\'s own click', () => {
  assert.equal(isCardLayout({ gridLayout: 'cards' }), true)
  assert.equal(isCardLayout({ gridLayout: 'auto', crudlType: 'card' }), true)
  assert.equal(isCardLayout({ gridLayout: 'auto', crudlType: 'table' }), false)
  assert.equal(isCardLayout({ gridLayout: 'table', crudlType: 'card' }), false)
  assert.equal(isCardLayout({}), false)
  const cols = [
    { id: 'photo', label: 'Photo', stereotype: 'image' },
    { id: 'code', label: 'Code' },
    { id: 'name', label: 'Name', identifier: true },
    { id: 'state', label: 'State', dataType: 'status' },
    { id: 'ops', label: '', dataType: 'actionGroup' },
  ]
  const [card] = listingCardsOf([{ _rowNumber: 0, id: 'p1', photo: '/p.png', code: 'A1', name: 'Ada', state: { type: 'SUCCESS', message: 'Ok', badgeClass: 'b' },
    ops: { actions: [{ methodNameInCrud: 'archive', label: 'Archive' }] } }], cols)
  assert.equal(card.title, 'Ada', 'the identifier column is the title')
  assert.equal(card.image, '/p.png')
  assert.deepEqual(card.pairs.map((p) => p.key), ['code'])
  assert.deepEqual(card.actions, [{ key: 'ops:archive', methodNameInCrud: 'archive', label: 'Archive' }])
  assert.equal(card.rowId, 'p1')
  // a group row (@GroupBy) is not a card
  assert.equal(listingCardsOf([{ _group: true }], cols).length, 0)
  // selection: the same keys the table stores
  let sel = toggleSelectionKey({ all: false, keys: [], except: [] }, 2, true)
  sel = toggleSelectionKey(sel, 5, true)
  assert.deepEqual(sel.keys, [2, 5])
  assert.deepEqual(toggleSelectionKey(sel, '2', false).keys, [5])
  // the card IS an oj-action-card (role=button): a click on its text is the row's; a button inside is not
  const el = (matches, parent) => ({ parent, closest(sel) { let n = this; while (n) { if (n.matches) return n; n = n.parent } return null }, contains(o) { while (o) { if (o === this) return true; o = o.parent } return false }, matches })
  const cardEl = el(true, el(false))
  const text = el(false, cardEl)
  const button = el(true, cardEl)
  assert.equal(rowActionIsRows(text), false, 'without the card, the card itself reads as a control')
  assert.equal(rowActionIsRows(text, cardEl), true)
  assert.equal(rowActionIsRows(el(false, button), cardEl), false)
})
test('listing cards: the page paints them in place of the table, and the card click / checkbox reach their chains', () => {
  const html = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  assert.match(html, /<oj-bind-if test="\[\[ \$application\.variables\.mateuListing\.showCards \]\]">[\s\S]*?<oj-action-card class="mateu-listing-card" :data-row-key="\[\[ card\.data\.key \]\]"\s+on-oj-action="\[\[ \$listeners\.mateuCardAction \]\]">/)
  assert.match(html, /<oj-bind-if test="\[\[ !\$application\.variables\.mateuListing\.cardLayout \]\]">\s*<oj-table id="mateuTable"/)
  const page = JSON.parse(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.json'), 'utf8'))
  assert.equal(page.eventListeners.mateuCardAction.chains[0].chain, 'mateuRowClicked')
  assert.equal(page.eventListeners.mateuCardAction.chains[0].parameters.rowKey, '{{ $event.target.dataset.rowKey }}')
  assert.equal(page.eventListeners.mateuCardSelected.chains[0].chain, 'mateuCardSelected')
  const chain = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page-chains', 'mateuCardSelected.js'), 'utf8')
  assert.match(chain, /bridge\.toggleSelectionKey\(/)
})
test('Foldout (con-micronaut demo): navigation, overview edit, badges, panel icons and orientation reach the projection', () => {
  const f = foldoutOf(reduceContexts(empty(), fx('tpl-foldout')).contexts[HOST_ID])
  assert.equal(f.orientation, 'vertical')
  assert.equal(f.overviewOnTop, false)
  const h = f.header
  assert.equal(h.hasNavigation, true)
  assert.deepEqual([h.goToParent, h.parentLabel, h.parentActionId], [true, 'Estudiantes', 'volver'])
  assert.equal(h.bidirectional, true)
  assert.deepEqual(h.previousStep, { id: 'anterior', label: chromeText('previousItem') })
  assert.deepEqual(h.nextStep, { id: 'siguiente', label: chromeText('nextItem') })
  assert.deepEqual(h.overviewActions, [{ id: 'editar', label: chromeText('edit'), icon: 'oj-ux-ico-edit', display: 'on' }])
  // the foldout's own badges head the overview, next to the page's
  const badgeLabels = f.overview.blocks[0].items.filter((a) => a.isBadge).map((a) => a.label)
  assert.deepEqual(badgeLabels, ['Matrícula activa', 'Beca MEC'])
  // panel icons: bare Vaadin names → Redwood classes; none → ''
  assert.deepEqual(f.panels.map((p) => p.iconClass), ['oj-ux-ico-contact', 'oj-ux-ico-list', 'oj-ux-ico-clock', ''])
  // orientation horizontal: the overview on top
  const wire = fx('tpl-foldout')
  const json = JSON.stringify(wire).replace('"orientation":"vertical"', '"orientation":"horizontal"')
  const top = foldoutOf(reduceContexts(empty(), JSON.parse(json)).contexts[HOST_ID])
  assert.deepEqual([top.orientation, top.overviewOnTop], ['horizontal', true])
})
test('Foldout header: no navigation → no controls; only a next id → no bidirectional arrows', () => {
  const none = foldoutHeaderOf({})
  assert.deepEqual([none.hasNavigation, none.goToParent, none.bidirectional, none.previousStep, none.nextStep], [false, false, false, null, null])
  assert.deepEqual(none.overviewActions, [])
  const next = foldoutHeaderOf({ navigation: { nextActionId: 'n' } })
  assert.deepEqual([next.hasNavigation, next.bidirectional, next.nextStep.id], [true, false, 'n'])
  assert.equal(foldoutHeaderOf({ navigation: { parentActionId: 'up' } }).parentLabel, chromeText('goBack'))
  assert.equal(foldoutIconClassOf('vaadin:user'), 'oj-ux-ico-contact')
  assert.equal(foldoutIconClassOf('oj-ux-ico-edit'), 'oj-ux-ico-edit')
  assert.equal(foldoutIconClassOf(null), '')
})
test('Foldout page: the layout binds the header, the overview can take the overview slot, the actions reach the host', () => {
  const html = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  const H = '$application.variables.mateuFoldoutContent.header'
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const layout = html.slice(html.indexOf('<oj-sp-foldout-layout id="mateuFoldoutEl"'), html.indexOf('</oj-sp-foldout-layout>'))
  for (const attr of ['display-options.go-to-parent="[[ !!' + H + '.goToParent ]]"', 'previous-step="[[ ' + H + '.previousStep ]]"',
    'next-step="[[ ' + H + '.nextStep ]]"', 'translations.go-to-parent="[[ ' + H + '.parentLabel ]]"',
    'on-sp-next="[[ $listeners.foldoutNext ]]"', 'secondary-actions="[[ ' + H + '.overviewActions || [] ]]"',
    ':slot="[[ $application.variables.mateuFoldout.overviewOnTop ? \'overview\' : null ]]"']) {
    assert.match(layout, new RegExp(esc(attr)), attr)
  }
  assert.match(layout, /class="mateu-foldout-panel-icon"/)
  const page = JSON.parse(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.json'), 'utf8'))
  for (const [listener, id] of [['foldoutGoToParent', 'parentActionId'], ['foldoutPrevious', 'previousActionId'], ['foldoutNext', 'nextActionId']]) {
    assert.equal(page.eventListeners[listener].chains[0].chain, 'dispatchHostBlockAction')
    assert.equal(page.eventListeners[listener].chains[0].parameters.actionId, '{{ ' + H + '.' + id + ' }}')
  }
  assert.equal(page.eventListeners.foldoutPanelAction.chains[0].parameters.actionId, '{{ $event.detail.actionId }}')
})
test('Data Management (con-micronaut demo): the docked panel\'s «Resumen ✕» HorizontalLayout is ONE row; its Text keeps its style', () => {
  const blocks = hostContentOf(reduceContexts(empty(), fx('tpl-data-management')).contexts[HOST_ID], null, {})
  const atoms = blocks.flatMap((b) => b.items || [])
  const row = atoms.find((a) => a.isRow)
  assert.ok(row, 'the HorizontalLayout is a row')
  assert.deepEqual(row.style, { alignItems: 'center', width: '100%' })
  assert.deepEqual(row.items.map((i) => [i.rowText, i.rowButton, i.text || i.label]), [[true, false, 'Resumen'], [false, true, '✕']])
  assert.deepEqual(row.items[0].style, { fontWeight: '600', flex: '1' })
  assert.match(row.items[0].cls, /oj-typography-semi-bold/)
  assert.equal(row.items[1].actionId, 'toggleEndPanel', 'the button keeps its action')
  // the toolbar (buttons only) stays a button bar
  assert.ok(atoms.some((a) => a.isButtons && a.buttons.map((b) => b.label).join() === 'Tabla,Calendario,Resumen,Incidencias'))
})
test('Text.style: filtered like an Element\'s HTML style; a weight / size beats Redwood\'s !important typography', () => {
  assert.deepEqual(styleObjectOf('color: red; background-image: url(x.png); width: expression(alert(1)); font-size: 1.5rem; --x: 1'),
    { color: 'red', fontSize: '1.5rem' })
  assert.deepEqual(styleObjectOf(''), {})
  assert.deepEqual(styledTextOf('oj-typography-body-md', 'font-weight: bold'), { cls: 'oj-typography-body-md oj-typography-bold', style: { fontWeight: 'bold' } })
  assert.equal(styledTextOf('oj-typography-body-xs oj-text-color-secondary', 'font-size: 2rem').cls, 'oj-text-color-secondary')
  assert.equal(styledTextOf('oj-typography-body-md', 'font-weight: 400').cls, 'oj-typography-body-md')
  const node = (metadata, children = [], style) => ({ type: 'ClientSide', metadata, children, ...(style ? { style } : {}) })
  const items = hostContentOf({ state: {}, data: {}, tree: { type: 'ServerSide', id: 's', children: [node({ type: 'VerticalLayout' }, [
    node({ type: 'Text', text: 'Big', size: 'xl' }, [], 'color: #c00; font-weight: 700'),
  ])] } }, null, {}).flatMap((b) => b.items)
  const t = items.find((a) => a.text === 'Big')
  assert.deepEqual(t.style, { color: '#c00', fontWeight: '700' })
  assert.equal(t.cls, 'oj-typography-heading-md oj-typography-bold')
})
test('HorizontalLayout: inline pieces make a row; any other child keeps the stacked projection', () => {
  const node = (metadata, children = []) => ({ type: 'ClientSide', metadata, children })
  const project = (hl) => hostContentOf({ state: {}, data: {}, tree: { type: 'ServerSide', id: 's', children: [node({ type: 'VerticalLayout' }, [hl])] } }, null, {}).flatMap((b) => b.items)
  const row = project(node({ type: 'HorizontalLayout' }, [node({ type: 'Text', text: 'Total' }), node({ type: 'Badge', text: 'Paid', color: 'success' }),
    node({ type: 'Anchor', text: 'Invoice', url: '/invoices/1' }), node({ type: 'Icon', icon: 'vaadin:check' })]))
  assert.equal(row.length, 1)
  assert.deepEqual(row[0].items.map((i) => [i.rowText, i.rowBadge, i.rowAnchor, i.rowIcon]),
    [[true, false, false, false], [false, true, false, false], [false, false, true, false], [false, false, false, true]])
  // buttons only: still the button bar
  const bar = project(node({ type: 'HorizontalLayout' }, [node({ type: 'Button', label: 'A', actionId: 'a' }), node({ type: 'Button', label: 'B', actionId: 'b' })]))
  assert.deepEqual(bar.map((a) => !!a.isButtons), [true])
  // a non-inline child: no row, the pieces as before
  const mixed = project(node({ type: 'HorizontalLayout' }, [node({ type: 'Text', text: 'x' }), node({ type: 'Separator' })]))
  assert.ok(!mixed.some((a) => a.isRow))
  assert.ok(mixed.some((a) => a.isText && a.text === 'x'))
  // the template paints the row (single atoms template, expanded into every surface by the bridge)
  const atomsHtml = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')
  assert.match(atomsHtml, /<oj-bind-if test="\[\[ \$current\.data\.isRow \]\]">\s*(<!--[\s\S]*?-->\s*)?<div class="mateu-atom-row oj-sm-margin-1x-bottom" :style="\[\[ \$current\.data\.style \|\| \{\} \]\]">/)
  assert.match(atomsHtml, /rowButton \]\]">\s*<oj-button[\s\S]*?on-oj-action="\[\[ \$listeners\.\{\{blockAction\}\} \]\]"/)
  assert.match(atomsHtml, /\$current\.data\.isText && !\$current\.data\.isHeading \]\]">\s*<div class="oj-sm-margin-1x-bottom" :class="\[\[ \$current\.data\.cls \]\]" :style="\[\[ \$current\.data\.style \|\| \{\} \]\]">/)
})
