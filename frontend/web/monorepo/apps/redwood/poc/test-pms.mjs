// Contract tests for what was added for the PMS challenge (OPERA Cloud on Mateu + Redwood):
// every new component or behaviour of the renderer, with real wire fixtures captured from
// demo/demo-vb-pms (poc/fixtures/pms/*.json) or, when the wire is trivial, built by hand
// with the SAME shape the backend emits (record → DTO).
// Usage: node test-pms.mjs   (npm test runs test.mjs and this one)

import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
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
import { coverageProblems, wireTypesOf } from './parity-check.mjs'
import { coverageTable } from './coverage.mjs'
import { mapAtomOf, mapHeightOf } from './reduceContexts.mjs'
import { mapViewPlanOf, mapMarkerParams, SINGLE_MARKER_ZOOM, tileLayerOf, OSM_TILES } from './map.mjs'
import { attrSelectorValue } from './rules.mjs'
import { wizardOf, WIZARD_DONE_STEP } from './reduceContexts.mjs'
import { dashboardOf, dashboardDeclaresLayout, findAllByType, todoListOf, pageSubtitleOf } from './reduceContexts.mjs'
import { hostContentPlanOf, archetypeVarsOf as archetypeVarsOfForTest } from './pageProjection.mjs'
import { dataManagementPageOf, collectionDetailPageOf, itemOverviewPageHeaderOf } from './reduceContexts.mjs'
import { safeImageSrc } from './inputs.mjs'
import { routeUnderMount, normalizeMount, baseUrlOf, routeOfPath, pathOfRoute, initMount, setMount, isPathMode, mateuBase, mateuAssetBase, urlOfRoute, currentRouteOf, currentRoutePathOf, scrollToTopOnNavigate, menuRoutesOf, pathLeavingMountOf, leftMountFor } from './mount.mjs'
import { inAppRouteOfLink } from './links.mjs'
import { chartAtomOf, metricOf, gridTrackWeights, gridColClasses, panelColClass, scoreboardTrendOf, scoreboardItemOf, scoreboardAtomOf, emptyStateAtomOf } from './reduceContexts.mjs'
import { calendarAtomOf, calPeriod, calEventsOn, calAddDays, spColorKeyOf, spCalendarSpecOf, calendarPageToolbarOf, spNavActionOf, spCalendarHostClassOf } from './calendar.mjs'
import { notificationsOf, notificationListOf, takeUndoToasts, undoMessageOf } from './notify.mjs'
import { startPolling, actionSucceeded, setPollingRunner, timedOnLoadTriggers, notePollingRegistry } from './polling.mjs'
import { onLoadTriggers, mediatorOf } from './reduceContexts.mjs'
import { assignAccessKeys, keyHint, setShortcutContext, currentShortcutActions, isFunctionKeyShortcut } from './keys.mjs'
import { hoverLinesOf } from './hover.mjs'
import { draggedIdsOf, dragTypeOfMime } from './dnd.mjs'
import { dragMimeOf, listingHeaderBlocksOf } from './reduceContexts.mjs'
import { dayIndexAtX } from './planning.mjs'
import { listingBaseOf, selectedRowsOf, rowAsArrived, valueLabelOf, LABEL_CELL_SUFFIX, isDisplayColumn, rowActionIsRows, NO_OPEN_CELL_CLASS, leafColumnsOf } from './core/listing.mjs'
import { applyColumnPrefs, columnChooserOf, prefsFromChooser, moveChooserItem, readColumnPrefs, writeColumnPrefs, saveView, listSavedViews, defaultView, deleteView, viewRouteOf, currentViewValues, viewsMenuOf, listingScope } from './prefs.mjs'
import { listingOf, rowClickOpensRecord, groupedRows, rowToneOf, aggregateFootersOf } from './reduceContexts.mjs'
import { reduceContexts, islandContentOf, hostContentOf, hostContentShown, summarizeHost, shellNavOf, entityHeaderOf, taskQueueOf, formSectionsOf, layoutFieldOf, HOST_ID } from './reduceContexts.mjs'
import { localMenuOptionOf, isSentinelHome } from './navTree.mjs'
import { loadMenuRouteInto, terminalMenuRouteOf, bootstrapHasApp, mediatorConsumedRoute, mediatorBaseOf, composeInnerRoute } from './transport.mjs'
import { fileDownloadOf, triggerDownload, applyDomEffects, documentUrlOf, noteDocumentBase, PRINT_CSS } from './files.mjs'
import { evaluateExpression, evaluateTemplate, computeRules, fieldFlagsOf, valueChangeActionOf } from './rules.mjs'
import { describeFileValue, isImageValue, captureTexts } from './inputs.mjs'
import { wireElementEvents, serializeElementEvent, setElementEventSink, elementModuleUrl, remoteOriginOf } from './elements.mjs'
import { foldoutOf } from './core/archetypes.mjs'
import { foldedPanelIndexes, isPanelFolded, unfoldPanel, resetFoldoutFolds, wirePanelIndexOf, foldoutPanelKey } from './foldouts.mjs'

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
/** Atoms the template paints for a tree (every surface uses the same projection). */
export const atomsOf = (tree, state = {}, data = {}, opts = {}) =>
  (islandContentOf({ tree, state, data }, opts) || []).flatMap((b) => b.items || [])
const node = (metadata, children = []) => ({ type: 'ClientSide', id: metadata.id || '', metadata, children })

// ── P0 #2: downloads and links ─────────────────────────────────────────────────────────────────────

/** A minimal DOM that records what is done with it. */
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

// the copies of the fields OUTSIDE the atoms surfaces: the row editor, the generic form, the wizard,
// the island… and the drawer's, once per Spectra drawer template (general / create-edit / bottom)
const FIELD_COPIES_OUTSIDE_ATOMS = 9

test('DownloadFile: el reducer acumula TODOS los ficheros del increment', () => {
  const file = (n) => ({ type: 'DownloadFile', data: { filename: n, mimeType: 'text/csv', base64Content: 'YSxiCjEsMg==' } })
  const reg = reduceContexts(empty(), { commands: [file('a.csv'), file('b.csv')] })
  assert.deepEqual(reg.effects.downloads.map((d) => d.filename), ['a.csv', 'b.csv'])
  assert.equal(reg.effects.download.filename, 'b.csv') // compat: the last one
})

test('DownloadFile: se descarga como Blob con su nombre y tipo; sin contenido no hace nada', () => {
  const { env, log } = fakeEnv()
  assert.equal(triggerDownload({ filename: 'folio.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=' }, env), 'downloaded')
  assert.deepEqual(log, [['url', 'application/pdf'], ['append', 'folio.pdf'], ['click', 'folio.pdf', 'blob:x'], ['remove'], ['revoke', 'blob:x']])
  assert.equal(fileDownloadOf({ filename: 'x' }), null)
  assert.equal(fileDownloadOf({ base64Content: 'eA==' }).filename, 'export')
  assert.equal(applyDomEffects({ downloads: [{ base64Content: 'eA==' }, {}] }, null, fakeEnv().env), 1)
})

test('Document: inline se abre en otra pestaña (sin opener); un bloqueador de popups lo convierte en descarga', () => {
  const { env, log } = fakeEnv()
  const tab = { opener: {} }
  env.open = (href, target) => { log.push(['open', href, target]); return tab }
  assert.equal(triggerDownload({ filename: 'folio.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=', disposition: 'inline' }, env), 'opened')
  assert.deepEqual(log[1], ['open', 'blob:x', '_blank'])
  assert.equal(tab.opener, null)
  const blocked = fakeEnv()
  blocked.env.open = () => null
  assert.equal(triggerDownload({ filename: 'folio.pdf', base64Content: 'JVBERi0=', disposition: 'inline' }, blocked.env), 'downloaded')
  assert.ok(blocked.log.some((l) => l[0] === 'click'))
})

test('Document: los grandes llegan por una URL de un solo uso, resuelta contra el backend', () => {
  noteDocumentBase('http://localhost:9005')
  assert.equal(documentUrlOf('/mateu/v3/documents/tok'), 'http://localhost:9005/mateu/v3/documents/tok')
  assert.equal(documentUrlOf('javascript:alert(1)'), null)
  assert.equal(documentUrlOf('//evil.example/x'), null)
  const f = fileDownloadOf({ filename: 'big.pdf', url: '/mateu/v3/documents/tok', disposition: 'inline', print: true })
  assert.equal(f.url, 'http://localhost:9005/mateu/v3/documents/tok')
  assert.equal(f.print, true)
  assert.equal(fileDownloadOf({ filename: 'x', url: 'javascript:alert(1)' }), null)
  // print only makes sense when shown
  assert.equal(fileDownloadOf({ filename: 'x', base64Content: 'eA==', print: true }).print, false)
  noteDocumentBase('')
  const { env, log } = fakeEnv()
  env.open = (href) => { log.push(['open', href]); return {} }
  assert.equal(triggerDownload({ filename: 'big.pdf', url: '/mateu/v3/documents/tok', disposition: 'inline' }, env), 'opened')
  assert.deepEqual(log, [['open', '/mateu/v3/documents/tok']]) // ni Blob ni object URL
})

test('Document: print lo imprime en un iframe oculto, sin popup', () => {
  const log = []
  let onload
  const frame = {
    style: {}, setAttribute: (k, v) => log.push(['attr', k, v]),
    addEventListener: (ev, fn) => { onload = fn },
    contentWindow: { focus() {}, print() { log.push(['print']) } },
    remove() { log.push(['frame-removed']) },
  }
  const env = {
    atob: (b) => Buffer.from(b, 'base64').toString('binary'),
    Blob: class { constructor(parts, opts) { this.type = opts.type } },
    URL: { createObjectURL: () => 'blob:p', revokeObjectURL: () => {} },
    setTimeout: () => {},
    open: () => { log.push(['open']); return {} },
    document: { body: { appendChild: (f) => log.push(['append', f.src]) }, createElement: () => frame },
  }
  assert.equal(triggerDownload({ filename: 'f.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=', disposition: 'inline', print: true }, env), 'printing')
  assert.deepEqual(log.find((l) => l[0] === 'append'), ['append', 'blob:p'])
  onload()
  assert.ok(log.some((l) => l[0] === 'print'))
  assert.ok(!log.some((l) => l[0] === 'open'))
})

test('Print: el reducer lo describe y applyDomEffects imprime la página sin chrome', () => {
  const reg = reduceContexts(empty(), { commands: [{ type: 'Print', data: null }] })
  assert.equal(reg.effects.print, true)
  const appended = []
  let printed = 0
  const env = {
    print: () => { printed++ },
    document: {
      head: { appendChild: (s) => appended.push(s) },
      createElement: () => ({ setAttribute() {}, textContent: '' }),
      querySelectorAll: () => [],
    },
  }
  applyDomEffects(reg.effects, null, env)
  assert.equal(printed, 1)
  assert.equal(appended.length, 1)
  assert.match(appended[0].textContent, /@media print/)
  assert.match(PRINT_CSS, /oj-sp-global-header/)
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
    // a reduction the chain does itself, or one the bridge does for it (the bus delivery to the
    // islands reduces their answers inside deliverBusEvents): both leave effects to apply
    const reduces = (src.match(/reg = bridge\.reduceContexts\(/g) || []).length
      + (src.match(/await bridge\.deliverBusEvents\(/g) || []).length
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
    // an Anchor declared as a form FIELD arrives wrapped in a CustomField (children)
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

// ── P0 #3: Element, the escape hatch, in full ────────────────────────────────────────────────

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
  // a re-render with another action does NOT add another listener: it changes the action fired
  wireElementEvents(element, { on: { 'room-selected': 'openRoom' }, fromNested: true })
  assert.equal(listeners['room-selected'].length, 1)
  listeners['room-selected'][0]({ detail: { room: '104' }, constructor: { name: 'CustomEvent' } })
  assert.deepEqual(sent, [{ actionId: 'openRoom', parameters: { event: { room: '104' } }, nested: true }])
  // an event that is not a CustomEvent travels with its primitive properties
  assert.deepEqual(serializeElementEvent({ clientX: 3, key: 'a', target: {}, fn() {} }), { clientX: 3, key: 'a' })
  setElementEventSink(null)
})

test('Element: un import relativo se carga del BACKEND (VB alojado/vb-serve son otro origen)', () => {
  // a local dev backend on plain http, as vb-serve uses it
  assert.equal(elementModuleUrl('/pms/floor-plan.js', 'http://localhost:9005/'), 'http://localhost:9005/pms/floor-plan.js') // NOSONAR
  assert.equal(elementModuleUrl('/pms/floor-plan.js', ''), '/pms/floor-plan.js')
  assert.equal(elementModuleUrl('https://cdn.example/x.js', 'http://b'), 'https://cdn.example/x.js')
})

// Same rule as libs/mateu elementRenderer (remoteOriginOf / moduleUrlFor) and the same cases as
// its tests: a root-relative module of a REMOTE screen is loaded from the remote's origin.
test('Element of a REMOTE screen: its root-relative module is loaded from the remote, not from this app', () => {
  // the EventConductor console's diagram tab, composed into a shell on another origin
  const origin = remoteOriginOf('http://localhost:8620/_workflow', '', 'http://localhost:8621') // NOSONAR
  assert.equal(origin, 'http://localhost:8620') // NOSONAR
  assert.equal(elementModuleUrl('/eventconductor/workflow-graph.js', '', origin),
    'http://localhost:8620/eventconductor/workflow-graph.js') // NOSONAR
  // this app's backend is absolute (vb-serve / hosted VB): still the remote wins for a remote screen
  assert.equal(elementModuleUrl('/eventconductor/workflow-graph.js', 'http://localhost:8621', origin), // NOSONAR
    'http://localhost:8620/eventconductor/workflow-graph.js') // NOSONAR
})

test("Element of this app's own screens: no remote origin", () => {
  // a relative screen base (a mount of this same app)
  assert.equal(remoteOriginOf('/_workflow', '', 'http://localhost:8621'), undefined) // NOSONAR
  // this app's own backend is absolute on another origin than the page (a static front end
  // calling its API): a screen from that backend is not remote
  assert.equal(remoteOriginOf('https://api.acme.com/_wf', 'https://api.acme.com', 'https://cdn.acme.com'), undefined)
  // no base known (an unloaded context, a test fixture)
  assert.equal(remoteOriginOf('', '', 'http://localhost:8621'), undefined) // NOSONAR
  assert.equal(remoteOriginOf(undefined), undefined)
  // without a remote origin the app's rule stands
  assert.equal(elementModuleUrl('/x/graph.js', '', undefined), '/x/graph.js')
  assert.equal(elementModuleUrl('/x/graph.js', 'http://localhost:9005', undefined), 'http://localhost:9005/x/graph.js') // NOSONAR
})

test('Element of a REMOTE screen: absolute, protocol-relative and relative module urls keep their rule', () => {
  const remote = 'http://localhost:8620' // NOSONAR
  assert.equal(elementModuleUrl('https://cdn.acme.com/graph.js', '', remote), 'https://cdn.acme.com/graph.js')
  assert.equal(elementModuleUrl('//cdn.acme.com/graph.js', '', remote), '//cdn.acme.com/graph.js')
  // a bare relative url is NOT re-pointed at the remote (the web leaves it to the page; here
  // that is this app's backend, as for any other Element)
  assert.equal(elementModuleUrl('graph.js', '', remote), 'graph.js')
  assert.equal(elementModuleUrl('graph.js', 'http://localhost:9005', remote), 'http://localhost:9005/graph.js') // NOSONAR
})

test('Element atom carries the backend its OWNING context was loaded from (also inside a foldout panel)', () => {
  const graph = node({ type: 'Element', name: 'wf-graph', attributes: { import: '/wf/graph.js' }, on: {} })
  const outbound = { route: '/_workflow/p/1', baseUrl: 'http://localhost:8620/_workflow' } // NOSONAR
  const atom = (islandContentOf({ tree: node({ type: 'Page' }, [graph]), state: {}, data: {}, outbound }) || [])
    .flatMap((b) => b.items || []).find((a) => a.isElement)
  assert.equal(atom.screenBase, 'http://localhost:8620/_workflow') // NOSONAR
  // a context without an outbound (fixtures) has none
  assert.equal(atomsOf(node({ type: 'Page' }, [graph])).find((a) => a.isElement).screenBase, '')
  // a foldout panel projects its slot through a synthetic context: it keeps the host's outbound
  const foldout = node({ type: 'FoldoutLayout', panels: [{ title: 'Graph' }] },
    [{ ...node({ type: 'VerticalLayout' }), slot: 'overview' }, { ...node({ type: 'VerticalLayout' }, [graph]), slot: 'panel-0' }])
  const f = foldoutOf({ tree: node({ type: 'Page' }, [foldout]), state: {}, data: {}, outbound })
  const inPanel = f.panels[0].blocks.flatMap((b) => b.items || []).find((a) => a.isElement)
  assert.equal(inPanel.screenBase, 'http://localhost:8620/_workflow') // NOSONAR
})

// ── FoldoutPanel.open = false on the page foldout (poc/foldouts.mjs) ─────────────────────────────
test('foldout: the open=false panels start folded, unfolding one keeps it unfolded until a new page', () => {
  const foldout = foldoutOf(reduceContexts(empty(), JSON.parse(readFileSync(join(here, 'fixtures', 'real', 'load-foldout.json'), 'utf8'))).contexts[HOST_ID])
  resetFoldoutFolds()
  // the BookingFoldout fixture: Payments, Guest profile open; Notes (open = false) folded
  assert.deepEqual(foldout.panels.map((p) => p.open), [true, true, false])
  assert.deepEqual(foldedPanelIndexes(foldout), [2])
  // an open panel never folds, and "unfolding" it changes nothing
  assert.equal(isPanelFolded(foldout, 0), false)
  assert.equal(unfoldPanel(foldout, 0), false)
  assert.equal(unfoldPanel(foldout, 2), true)
  assert.deepEqual(foldedPanelIndexes(foldout), [])
  assert.equal(unfoldPanel(foldout, 2), false, 'already unfolded')
  // an action re-projects the same page: a new projection object, same panels → still unfolded
  assert.deepEqual(foldedPanelIndexes({ panels: foldout.panels.map((p) => ({ ...p })) }), [])
  // a new page starts over
  resetFoldoutFolds()
  assert.deepEqual(foldedPanelIndexes(foldout), [2])
  // nothing to fold without panels, or with an unknown index
  assert.deepEqual(foldedPanelIndexes(null), [])
  assert.equal(isPanelFolded(foldout, 9), false)
  resetFoldoutFolds()
})

test("foldout: the layout's selectedPanel counts the overview as panel 0", () => {
  assert.equal(wirePanelIndexOf(0), -1, 'the overview is never folded')
  assert.equal(wirePanelIndexOf(1), 0)
  assert.equal(wirePanelIndexOf(3), 2)
  assert.equal(wirePanelIndexOf('2'), 1)
  assert.equal(wirePanelIndexOf(undefined), -1)
  assert.equal(wirePanelIndexOf(1.5), -1)
  // orientation horizontal: the overview is the top band, not a panel — panel 0 is the first wire panel
  assert.equal(wirePanelIndexOf(0, { overviewOnTop: true }), 0)
  assert.equal(wirePanelIndexOf(2, { overviewOnTop: true }), 2)
  assert.equal(wirePanelIndexOf(1, { overviewOnTop: false }), 0)
  // a panel's identity on the same page: its position and title
  assert.equal(foldoutPanelKey({ title: 'Notes' }, 2), '2:Notes')
  assert.notEqual(foldoutPanelKey({ title: 'Notes' }, 2), foldoutPanelKey({ title: 'Notes' }, 1))
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
  // application events are listened to with the `application:` prefix (without it they never arrive)
  assert.ok(page.eventListeners['application:mateuElementEvent'])
  assert.ok(page.eventListeners['application:mateuRetryAction'])
  assert.ok(!page.eventListeners.mateuRetryAction && !page.eventListeners.mateuElementEvent)
  for (const rel of ['runMateuIslandAction.js', 'runMateuNestedAction.js'])
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + rel), /mountElementsSoon/, rel)
})

// ── OPERA-style shell (HAMBURGER_SECTIONS with nested sections) ──────────────────────────────

test('shell PMS real: sin home declarada arranca en la primera pantalla de la primera sección', () => {
  const reg = reduceContexts(empty(), fixture('shell'))
  assert.equal(reg.shell.homeRoute, '_no_home_route') // what the server sends
  const nav = shellNavOf(reg)
  assert.equal(nav.mode, 'sections')
  assert.equal(nav.homeRoute, '/inventory/floorPlan')
  assert.ok(isSentinelHome('_no_home_route') && isSentinelHome('/x/_page') && isSentinelHome(''))
  assert.ok(!isSentinelHome('/welcome'))
})

test('shell PMS real: una ruta del menú se carga con el serverSideType del app que la declara', () => {
  const menu = reduceContexts(empty(), fixture('shell')).shell.menu
  assert.equal(localMenuOptionOf(menu, '/inventory/floorPlan').serverSideType, 'io.mateu.mdd.demovbpms.infra.in.ui.PmsHome')
  // a sub-route (the detail of a menu crud) also belongs to the app; a route that is not in the menu does not
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
  // the queue is not the page "queue mode", and the chosen item's card is not the page header
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

// ── P0 #5: field types ────────────────────────────────────────────────────────────────────────

test('tarjeta de registro real: cada estereotipo con su widget (radio, múltiple, importe, captura)', () => {
  const reg = reduceContexts(empty(), fixture('registration-card'))
  const host = reg.contexts[HOST_ID]
  const fields = formSectionsOf(host.tree, host.state, host.data).flatMap((s) => s.fields)
  const by = Object.fromEntries(fields.map((f) => [f.fieldId, f]))
  assert.ok(by.documentType.isRadio)
  assert.deepEqual(by.documentType.options.map((o) => o.value), ['PASSPORT', 'ID_CARD', 'DRIVING_LICENCE'])
  // the multiple-choice list is ONE field (before, a table or nothing) with its value as a list
  assert.ok(by.preferences.isMultiSelect)
  assert.deepEqual(by.preferences.value, ['QUIET_ROOM'])
  assert.equal(by.preferences.options.length, 6)
  // amount: a number with JET's currency converter (in Node, its specification)
  assert.ok(by.deposit.isMoney && by.deposit.value === 150)
  assert.equal(by.deposit.converter.options.style, 'currency')
  assert.deepEqual(['documentScan', 'voucher', 'photo', 'signature'].map((id) => by[id].isCapture && by[id].captureMode),
    ['camera', 'file', 'image', 'signature'])
  // no widget is left with flags set to undefined (the template evaluates all of them)
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

test('plantilla: los widgets nuevos están en cada superficie de átomos y en las copias de campos de fuera', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  // (a field's oj-checkboxset opens a line of its own; the Checklist atom's one does not)
  for (const tag of ['<oj-radioset', '<oj-select-many', '<oj-checkboxset\n', '<mateu-capture-field', '<oj-slider', '<mateu-rich-text-field', '<mateu-color-field'])
    assert.equal(page.split(tag).length - 1, surfaces + FIELD_COPIES_OUTSIDE_ATOMS, tag)
  // each copy keeps ITS change listener
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

// ── P0 #4: rules and dependent fields in the browser ────────────────────────────────────────

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
  assert.equal(ev('state.missing.deep'), undefined) // without breaking
  assert.equal(ev('alert(1)'), undefined) // ni funciones globales…
  assert.equal(ev('state.constructor.constructor("x")()'), undefined) // …nor escape through the prototype
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
  // arrival/nights fire their server action (@Trigger OnValueChange); another field does not
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
  for (const rel of ['hostInputChanged.js', 'mateuFieldEdited.js']) {
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + rel), /bridge\.valueChangeActionOf\(/, rel)
    // @AutoSave too: a field of the generic form (mateuFieldEdited) never autosaved
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + rel), /bridge\.autoSaveOf\(/, rel)
  }
})

// ── card menu (@Menu(display = cards)) ──────────────────────────────────────────────────────────

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
  // stable across projections (the launcher points at the popup by id)
  const again = shellNavOf({ shell: { variant: 'HAMBURGER_SECTIONS', menu: [{ label: 'Bookings', route: '/bookings', submenus: [
    { label: 'Quick access', route: '/bookings/quickAccess', display: 'cards', submenus: [{ label: 'X', route: '/bookings/quickAccess/x' }] }] }] } })
  assert.equal(again.menuTree[0].children[0].popupId, group.popupId)
  const [plan, checkIn, billing] = group.cards
  assert.deepEqual([plan.label, plan.description, plan.navigable, plan.hasIcon, plan.hasImage], ['Floor plan', 'Rooms by status', true, true, false])
  assert.ok(plan.iconClass.startsWith('oj-ux-ico'))
  assert.deepEqual([checkIn.hasImage, checkIn.image, checkIn.hasIcon], [true, '/img/c.png', false])
  assert.equal(billing.navigable, false)
  assert.deepEqual(billing.actions, [{ id: '/bookings/quickAccess/billing/folio', label: 'Folio' }])
  // a normal group is still a dropdown
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
  // the end day (inclusive in Mateu) is painted up to the next day
  const m = { resources: [{ id: '101', label: '101' }], blocks: [{ id: 'b', resourceId: '101', start: '2026-10-12', end: '2026-10-13' }], from: '2026-10-11', to: '2026-10-24' }
  const one = planningAtomOf(m, 'x').rows[0].tasks[0]
  assert.deepEqual([one.start, one.end], ['2026-10-12T00:00:00', '2026-10-14T00:00:00'])
  assert.equal(planningAtomOf(m, 'x').end, '2026-10-25T00:00:00')
})

test('Planning/Gantt: degenerate dates never give oj-gantt a negative length', () => {
  // end BEFORE start → a single day at the start; missing / unparseable dates → not drawn; a
  // date-time keeps its day; an inverted from/to window is read the other way round
  const p = planningAtomOf({ from: '2026-10-07', to: '2026-10-01', resources: [{ id: 'r', label: 'R' }], blocks: [
    { id: 'inv', resourceId: 'r', start: '2026-10-05', end: '2026-10-03' },
    { id: 'noEnd', resourceId: 'r', start: '2026-10-02' },
    { id: 'bad', resourceId: 'r', start: 'soon', end: '2026-10-03' },
    { id: 'dt', resourceId: 'r', start: '2026-10-02T10:00:00', end: '2026-10-03T08:00:00Z' },
  ] }, 'x')
  assert.deepEqual([p.start, p.end], ['2026-10-01T00:00:00', '2026-10-08T00:00:00'])
  const tasks = Object.fromEntries(p.rows[0].tasks.map((t) => [t.id, [t.start, t.end]]))
  assert.deepEqual(tasks, {
    inv: ['2026-10-05T00:00:00', '2026-10-06T00:00:00'],
    dt: ['2026-10-02T00:00:00', '2026-10-04T00:00:00'],
  })
  // without a window the axis spans every drawn day, the inverted task's start included
  const g = ganttAtomOf({ tasks: [
    { id: 'a', title: 'A', start: '2026-10-01', end: '2026-10-02' },
    { id: 'b', title: 'B', start: '2026-10-12', end: '2026-10-03' },
    { id: 'c', title: 'C', start: '2026-10-04' },
    { id: 'd', title: 'D', start: '2026-01-31', end: '2026-01-31' },
  ] }, 'g')
  assert.deepEqual(g.rows.map((r) => r.id), ['a', 'b', 'd'])
  assert.deepEqual([g.start, g.end], ['2026-01-31T00:00:00', '2026-10-13T00:00:00'])
  for (const t of g.rows.flatMap((r) => r.tasks)) assert.ok(Date.parse(t.end) > Date.parse(t.start), t.id)
  for (const t of p.rows[0].tasks) assert.ok(Date.parse(t.end) > Date.parse(t.start), t.id)
  assert.ok(Date.parse(g.end) > Date.parse(g.start) && Date.parse(p.end) > Date.parse(p.start))
  // no tasks at all: an empty, still valid axis
  const none = ganttAtomOf({ tasks: [] }, 'n')
  assert.equal(none.rows.length, 0)
  assert.ok(Date.parse(none.end) > Date.parse(none.start))
  // the layout floor: below ~160px oj-gantt draws its own chrome with negative widths
  assert.match(webApp('resources/css/app.css'), /oj-gantt\.mateu-planning \{[^}]*min-width: 12rem/)
})

test('Room Diary: los eventos de oj-gantt se traducen a la acción de Mateu (días locales, fin inclusivo)', () => {
  const atom = planningAtomOf({ moveActionId: 'move', resizeActionId: 'resize', openActionId: 'open', rangeSelectActionId: 'range', resources: [], blocks: [] }, 'x')
  const local = (y, mo, d, h) => new Date(y, mo - 1, d, h).toISOString()
  // ojMove: start/end = new bounds (value = instant under the pointer, ignored); rounded to the day
  assert.deepEqual(planningActionOf(atom, 'move', {
    taskContexts: [{ data: { id: 'R1' } }], rowContext: { rowData: { id: '104' } },
    value: local(2026, 10, 16, 9), start: local(2026, 10, 13, 9), end: local(2026, 10, 19, 9) }),
  { actionId: 'move', parameters: { _blockId: 'R1', _resourceId: '104', _start: '2026-10-13', _end: '2026-10-18' } })
  assert.deepEqual(planningActionOf(atom, 'resize', {
    taskContexts: [{ data: { id: 'R2' }, rowData: { id: '102' } }], start: local(2026, 10, 15, 0), end: local(2026, 10, 21, 1) }),
  { actionId: 'resize', parameters: { _blockId: 'R2', _resourceId: '102', _start: '2026-10-15', _end: '2026-10-20' } })
  assert.deepEqual(planningActionOf(atom, 'open', { taskId: 'R3' }), { actionId: 'open', parameters: { _blockId: 'R3' } })
  // without the declared action, nothing
  assert.equal(planningActionOf(planningAtomOf({ resources: [], blocks: [] }, 'y'), 'move', { taskContexts: [{ data: { id: 'R1' } }] }), null)
})

test('Room Diary: el día bajo el puntero sale de las etiquetas reales del eje (zoom y scroll incluidos)', () => {
  const centers = [{ x: 240, index: 0 }, { x: 322, index: 1 }, { x: 404, index: 2 }]
  assert.equal(dayIndexAtX(240, centers), 0)
  assert.equal(dayIndexAtX(280, centers), 0)
  assert.equal(dayIndexAtX(285, centers), 1)
  assert.equal(dayIndexAtX(1060, centers), 10) // beyond the measured labels: extrapolates
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

// ── P0 #7: listings (groups and totals, tones, columns, views, export) ───────────────────────

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
  // the group row goes BEFORE its own rows
  assert.ok(!l.rows[1]._group && l.rows[1].code === groups[0].code.replace(/ \(\d+\)$/, ''))
})

test('a group of rows with no value (the server did not list it) counts its rows, not 0', () => {
  const md = { groupBy: 'status', columns: [{ metadata: { id: 'status' } }, { metadata: { id: 'n' } }] }
  const rows = [{ status: 'OPEN', n: 1 }, { status: null, n: 2 }, { n: 3 }]
  const heads = groupedRows(rows, md, { groups: [{ value: 'OPEN', count: 1, aggregates: {} }] }).filter((r) => r._group)
  assert.deepEqual(heads.map((r) => r.status), ['OPEN (1)', ' (2)'])
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

// ── #6 collapsible panels, foldout inside a tab, sticky header ───────────────────────────────
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
  assert.match(webApp('flows/main/pages/main-start-page-chains/contentTabSelected.js'), /dropEntityHeader: !!bridge\.entityHeaderOf\(host\)/)
  // panelToggled / tilesReordered / uiValueChanged share poc/reproject.mjs
  for (const chain of ['panelToggled.js', 'tilesReordered.js', 'uiValueChanged.js']) {
    assert.match(webApp('flows/main/pages/main-start-page-chains/' + chain), /bridge\.reprojectedContentOf\(/, chain)
  }
  assert.match(readFileSync(join(here, 'reproject.mjs'), 'utf8'), /dropEntityHeader: !!entityHeaderOf\(host\)/)
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /oj-collapsible/)
  assert.match(page, /mateuPageHeader\.bandClass/)
  // the header projection (sticky business card with an EntityHeader) is poc/pageProjection.mjs
  assert.match(readFileSync(join(here, 'pageProjection.mjs'), 'utf8'), /mateu-sticky-header/)
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /bridge\.pageHeaderOf\(/)
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
  // what «Show more» hides is only empty ones → with «hide empty» it goes too
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
  // the one that does not come collapsed is open; the collapsed one, closed
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

// ── #11 parity.md tells the truth ─────────────────────────────────────────────────────────────
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
  // un tipo deprecado (registrado, nadie lo produce) no se exige ni es fantasma si está clasificado
  assert.deepEqual(coverageProblems({ ...ok, wireTypes: ['Text', 'Kanban'], deprecated: ['Chart'] }), [])
})

test('parity-check: los tipos salen del wire-schema.json, los deprecados aparte', () => {
  const repo = join(here, '..', '..', '..', '..', '..', '..')
  const { produced, deprecated } = wireTypesOf(readFileSync(join(repo, 'backend/shared/uidl/wire-schema.json'), 'utf8'))
  assert.ok(produced.length >= 114)
  assert.deepEqual([...deprecated].sort(), ['Result', 'Stepper'])
})

// ── P1 #13 dashboard and charts on any page ──────────────────────────────────────────────────
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
  // timeframe: under the value and inside the accessible text; blank is not painted
  assert.equal(k.timeframe, '')
  assert.equal(k.ariaLabel, 'Occ, 53 %, vs LW')
  const t = metricOf({ title: 'Revenue', value: '12.4k', unit: '€', timeframe: ' Last 7 days ', trendLabel: '+8%', description: 'Gross' })
  assert.equal(t.timeframe, 'Last 7 days')
  assert.equal(t.ariaLabel, 'Revenue, 12.4k €, Last 7 days, +8%, Gross')
  assert.equal(metricOf({ title: 'R', value: 1, timeframe: '   ' }).timeframe, '')
  assert.deepEqual(gridTrackWeights('repeat(3, minmax(0, 1fr))'), [1, 1, 1])
  assert.deepEqual(gridTrackWeights('64fr 36fr'), [64, 36])
  assert.deepEqual(gridTrackWeights('62% 38%'), [62, 38], 'las zonas de @Zones viajan en %')
  assert.deepEqual(gridTrackWeights('repeat(auto-fill, minmax(16rem, 1fr))'), [], 'auto-fill: lo decide el ancho, se apila')
  assert.deepEqual(gridColClasses('64fr 36fr', [], 2).map((c) => c.match(/oj-md-(\d+)/)[1]), ['8', '4'])
  // span 2 + span 2 in 3 tracks: the second does not fit → new row
  assert.deepEqual(gridColClasses('1fr 1fr 1fr', [2, 2, 1], 3).map((c) => c.match(/oj-md-(\d+)/)[1]), ['8', '8', '4'])
  assert.equal(gridColClasses('1fr', [], 2), null)
  assert.match(panelColClass(2, 3), /oj-md-8/)
})

test('grid tracks: a FIXED track weighs its length, not 1 like a 1fr (22rem 1fr split 50/50)', () => {
  const md = (t, n) => gridColClasses(t, [], n).map((c) => c.match(/oj-md-(\d+)/)[1])
  assert.deepEqual(md('22rem 1fr', 2), ['4', '8'], 'CollectionDetail: the list a third, the detail the rest')
  assert.deepEqual(md('1fr 22rem', 2), ['8', '4'], 'DataManagement: the table wide, the docked panel narrow')
  assert.deepEqual(md('35% 65%', 2), ['4', '8'], '@Zones of a crud detail')
  assert.deepEqual(md('minmax(0, 2fr) 320px', 2), ['9', '3'])
  // the edges are rounded, not each share: a full row adds up to 12 (3 + 5 + 5 wrapped the last)
  assert.deepEqual(md('300px 1fr 1fr', 3), ['3', '5', '4'])
  assert.deepEqual(md('1fr 1fr 1fr 1fr 1fr', 5).reduce((a, b) => a + Number(b), 0), 12)
  // only flexible or only percentages: their own numbers, as before
  assert.deepEqual(gridTrackWeights('auto 1fr'), [1, 1])
  assert.deepEqual(gridTrackWeights('repeat(2, 10rem) 1fr'), [160, 160, 880])
})

// ── P1 #12 calendar: month, week, day, list; cells per date; dates that act ──────────────────
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

// ── Spectra #13: the calendar is oj-sp-calendar, fed locally ───────────────────────────────────
test('calendario Spectra: colores a las seis claves de Redwood, eventos en hora LOCAL, días y acciones', () => {
  assert.equal(spColorKeyOf('#c74634'), 'rose')
  assert.equal(spColorKeyOf('#2e7d32'), 'pine')
  assert.equal(spColorKeyOf('#b8860b'), 'sienna')
  assert.equal(spColorKeyOf('#3b82f6'), 'blue')
  assert.equal(spColorKeyOf('#777'), 'teal', 'gris → la clave por defecto de Spectra')
  assert.equal(spColorKeyOf('nope'), 'teal')
  const spec = spCalendarSpecOf(calWire, null, '2026-10-28')
  const conv = spec.events.find((e) => e.id === 'conv')
  assert.deepEqual(conv, { id: 'conv', eventTitle: 'Convention', start: '2026-10-29T09:00', end: '2026-10-31T18:00', allDay: false, calendarProvider: 'teal' })
  assert.deepEqual(spCalendarSpecOf({ events: [{ id: 'a', title: 'A', date: '2026-10-02' }] }).events[0],
    { id: 'a', eventTitle: 'A', start: '2026-10-02T00:00:00', end: '2026-10-02T23:59:59', allDay: true, calendarProvider: 'teal' }, 'todo el día, sin Z')
  assert.deepEqual(spec.providers, [{ name: 'teal', color: 'teal', displayName: '' }])
  assert.deepEqual(spec.actions, { conv: { actionId: 'openCalendarEvent', id: 'conv', title: 'Convention', date: '2026-10-29' } }, 'sólo los eventos con acción')
  assert.deepEqual(spec.days, { '2026-10-30': { tone: 'danger', label: 'Avail 3' } })
  assert.equal(spec.dayActionId, 'openCalendarDay')
  assert.equal(spec.focusDate, '2026-10-28T12:00:00')
  assert.deepEqual([spec.displayOptions.monthView, spec.displayOptions.weekView, spec.displayOptions.dayView, spec.displayOptions.listView], ['on', 'on', 'on', 'on'])
  assert.equal(spec.displayOptions.createEvent, 'off')
  assert.equal(spec.nav, null)
  const onlyMonth = spCalendarSpecOf({ month: '2026-10-01', events: [] })
  assert.deepEqual([onlyMonth.displayOptions.weekView, onlyMonth.displayOptions.listView], ['off', 'off'])
  assert.equal(JSON.parse(calendarAtomOf(calWire, 'cal', '2026-10-28').spSpec).events.length, 3, 'el átomo lleva la spec')
})

const calPageToolbar = node({ type: 'HorizontalLayout' }, [
  node({ type: 'Button', label: '‹', actionId: 'previousCalendarMonth' }),
  node({ type: 'Button', label: 'Hoy', actionId: 'goCalendarToday' }),
  node({ type: 'Button', label: '›', actionId: 'nextCalendarMonth' }),
  node({ type: 'Button', label: 'Month', actionId: 'switchCalendarView', parameters: { _view: 'month' } }),
  node({ type: 'Button', label: 'Week', actionId: 'switchCalendarView', parameters: { _view: 'week' } }),
  node({ type: 'Button', label: '+ Create', actionId: 'createCalendarEvent' }),
])
test('calendario Spectra: la barra de un CalendarPage pasa a la barra de oj-sp-calendar (y no se pinta dos veces)', () => {
  const nav = calendarPageToolbarOf(calPageToolbar)
  assert.equal(nav.prev, 'previousCalendarMonth')
  assert.equal(nav.today, 'goCalendarToday')
  assert.deepEqual(nav.views, ['month', 'week'])
  assert.equal(nav.createLabel, 'Create')
  assert.equal(calendarPageToolbarOf(node({ type: 'HorizontalLayout' }, [node({ type: 'Button', label: 'x', actionId: 'save' })])), null)
  const spec = spCalendarSpecOf({ month: '2026-10-28', view: 'week', events: [] }, nav)
  assert.deepEqual([spec.displayOptions.monthView, spec.displayOptions.weekView, spec.displayOptions.dayView], ['on', 'on', 'off'])
  assert.equal(spec.displayOptions.createEvent, 'on')
  assert.equal(spec.displayOptions.createEventLabel, 'Create')
  const items = atomsOf(node({ type: 'Page' }, [node({ type: 'VerticalLayout' }, [calPageToolbar, node({ type: 'Calendar', month: '2026-10-28', view: 'month', events: [] })])]))
  const cal = items.find((a) => a.isCalendar)
  assert.ok(cal, 'hay calendario')
  assert.equal(items.filter((a) => a.isButtons || a.isRow).length, 0, 'la barra no se pinta aparte')
  assert.equal(JSON.parse(cal.spSpec).nav.next, 'nextCalendarMonth')
  assert.deepEqual(cal.navButtons.map((b) => b.label), ['‹', 'Hoy', '›', 'Month', 'Week', '+ Create'], 'la rejilla de reserva conserva la barra')
})

test('calendario Spectra: navegar en su barra = la acción de página (‹ › Hoy, vista); un salto sin acción → null', () => {
  const nav = calendarPageToolbarOf(calPageToolbar)
  assert.deepEqual(spNavActionOf(nav, 'month', '2026-10-28', '2026-11-01', '2026-10-28'), { kind: 'action', actionId: 'nextCalendarMonth' })
  assert.deepEqual(spNavActionOf(nav, 'month', '2026-10-28', '2026-09-01', '2026-10-28'), { kind: 'action', actionId: 'previousCalendarMonth' })
  assert.deepEqual(spNavActionOf(nav, 'month', '2026-10-28', '2026-10-05', '2026-10-28'), { kind: 'same' })
  assert.deepEqual(spNavActionOf(nav, 'week', '2026-10-28', '2026-11-04', '2026-10-28'), { kind: 'action', actionId: 'nextCalendarMonth' })
  assert.deepEqual(spNavActionOf(nav, 'month', '2027-03-10', '2026-10-24', '2026-10-24'), { kind: 'action', actionId: 'goCalendarToday' })
  assert.equal(spNavActionOf(nav, 'month', '2026-10-28', '2027-05-01', '2026-10-28'), null, 'el selector de fecha del título no tiene acción en el wire')
  assert.equal(spNavActionOf(null, 'month', '2026-10-28', '2026-11-01'), null)
  // a backend that advertises goCalendarToDate (3.0-beta.13+): the title's date picker jumps there
  const jumping = calendarPageToolbarOf(calPageToolbar, ['openCalendarEvent', 'goCalendarToDate'])
  assert.equal(nav.goTo, '', 'an older backend: no date jump')
  assert.equal(jumping.goTo, 'goCalendarToDate')
  assert.deepEqual(spNavActionOf(jumping, 'month', '2026-10-28', '2027-05-01', '2026-10-28'),
    { kind: 'action', actionId: 'goCalendarToDate', params: { _date: '2027-05-01' } })
  // the neighbours still use their own actions
  assert.deepEqual(spNavActionOf(jumping, 'month', '2026-10-28', '2026-11-01', '2026-10-28'), { kind: 'action', actionId: 'nextCalendarMonth' })
})

test('calendario Spectra: la plantilla lleva data-cal-sp y la shell lo monta; CSS oculta la rejilla de reserva', () => {
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /:data-cal-sp="\[\[ \$current\.data\.spSpec \]\]"/)
  assert.match(page, /data-cal-nav-action/)
  const css = webApp('resources/css/app.css')
  assert.match(css, /\.mateu-cal\.mateu-cal-sp-on > \.mateu-cal-head/)
  assert.match(css, /\.mateu-cal-sp-fixed \[data-action-id="calendar_next"\]/)
  // the title's date picker is switched off ONLY where it cannot jump — never on a page that
  // advertises goCalendarToDate (it used to be off everywhere, so the jump was unreachable)
  assert.match(css, /\.mateu-cal-sp-nopick \.oj-sp-calendar-title-date-picker-clickable \{ pointer-events: none; \}/)
  assert.doesNotMatch(css, /\.mateu-cal-sp \.oj-sp-calendar-title-date-picker-clickable \{ pointer-events: none/)
  assert.equal(spCalendarHostClassOf({ nav: null }), 'mateu-cal-sp mateu-cal-sp-fixed mateu-cal-sp-nopick')
  assert.equal(spCalendarHostClassOf({ nav: { goTo: '' } }), 'mateu-cal-sp mateu-cal-sp-nopick')
  assert.equal(spCalendarHostClassOf({ nav: { goTo: 'goCalendarToDate' } }), 'mateu-cal-sp')
})

// ── P1 #17 notification bell and toasts with undo ────────────────────────────────────────────
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
  // an error stays until dismissed (owner, 2026-10-12), even when it can be undone
  assert.equal(undoMessageOf({ text: 'Failed', variant: 'error', undoActionId: 'x' }).autoTimeout, 'off')
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

// ── P1 #16 periodic refresh (OnLoad with delay + OnSuccess) ──────────────────────────────────
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
  // the round finished fine → the next one
  assert.equal(actionSucceeded(host, 'refreshRooms', timer), 1)
  assert.equal(pending.length, 2)
  // another action reschedules nothing; another screen neither
  assert.equal(actionSucceeded(host, 'save', timer), 0)
  assert.equal(actionSucceeded({ tree: { serverSideType: 'Other', triggers: host.tree.triggers } }, 'refreshRooms', timer), 0)
  // navigating to another screen: what was scheduled for the previous one expires without running
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
  actionSucceeded(host, 'search', timer) // the OnLoad fired again when the host is repainted
  pending.forEach((p) => p.fn())
  assert.deepEqual(ran, ['search'], 'sólo la última vuelta programada corre')
  setPollingRunner(null)
})

test('polling: la condición del trigger se lee al vencer cada vuelta, con el estado de ESE momento', () => {
  const pending = []
  const timer = (fn, ms) => { const h = { fn, ms }; pending.push(h); return h }
  const ran = []
  setPollingRunner((actionId) => ran.push(actionId))
  const triggers = [
    { type: 'OnLoad', actionId: 'refresh', timeoutMillis: 2000, condition: "state.status.type != 'SUCCESS'" },
    { type: 'OnSuccess', actionId: 'refresh', calledActionId: 'refresh', timeoutMillis: 2000, condition: "state.status.type != 'SUCCESS'" },
  ]
  const process = (type) => ({ tree: { serverSideType: 'ProcessView', triggers }, state: { status: { type } } })
  // a process already finished when it is opened: no round at all
  notePollingRegistry({ contexts: { __root__: process('SUCCESS') } })
  startPolling(process('SUCCESS'), timer)
  pending.shift().fn()
  assert.deepEqual(ran, [], 'un proceso terminado no se refresca')
  // a running one refreshes…
  notePollingRegistry({ contexts: { __root__: process('WARNING') } })
  startPolling(process('WARNING'), timer)
  pending.shift().fn()
  assert.deepEqual(ran, ['refresh'])
  actionSucceeded(process('WARNING'), 'refresh', timer)
  // …until the answer of a round says it finished: the next round reads THAT state and stops
  notePollingRegistry({ contexts: { __root__: process('SUCCESS') } })
  pending.shift().fn()
  assert.deepEqual(ran, ['refresh'], 'el bucle se para cuando la condición deja de cumplirse')
  notePollingRegistry(null)
  setPollingRunner(null)
})

test('polling: la shell lo arranca al navegar y el transporte avisa de cada éxito (y de cada fallo: OnError)', () => {
  assert.match(webApp('pages/shell-page-chains/onMateuNavigate.js'), /bridge\.startPolling\(reg\.contexts\[bridge\.HOST_ID\]\)/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.setPollingRunner\(runPageAction\)/)
  // the crud's route flip (row → detail, back → listing) is another screen too
  assert.match(webApp('flows/main/pages/main-start-page-chains/runMateuAction.js'), /applyInc\(await bridge\.loadRoute\(base, flipRoute[\s\S]*?bridge\.startPolling\(reg\.contexts\[bridge\.HOST_ID\]\)[\s\S]*?bridge\.onLoadTriggers\(reloaded\)/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /setAfterReduceHook\(\(reg\) => \{[\s\S]*?notePollingRegistry\(reg\)/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /if \(inc\) \(isErrorAnswer\(inc\) \? actionFailed : actionSucceeded\)\(source, actionId\)/)
})

// ── P1 #15 shortcuts and access keys ─────────────────────────────────────────────────────────
test('teclas de acceso: iniciales primero, sin repetir, saltando las reservadas; luego letras y cifras', () => {
  assert.deepEqual(assignAccessKeys(['Reservations', 'Room diary', 'Property availability', 'New reservation'], ['n']), ['r', 'd', 'p', 'e'])
  assert.deepEqual(assignAccessKeys(['aa', 'a', 'a']), ['a', '1', '2'])
  assert.equal(assignAccessKeys(Array.from({ length: 40 }, () => 'x')).filter(Boolean).length, 11)
  assert.equal(keyHint('ctrl+alt+7'), 'Ctrl+Alt+7')
})

test('atajos: una tecla de función (F1–F12) vale sola, como en un back-office (F2, F9…)', () => {
  assert.equal(isFunctionKeyShortcut('f2'), true)
  assert.equal(isFunctionKeyShortcut('Shift+F9'), true)
  assert.equal(isFunctionKeyShortcut('f13'), false)
  assert.equal(isFunctionKeyShortcut('f'), false)
  setShortcutContext({ tree: { actions: [
    { id: 'quickLaunch', shortcut: 'F2' }, { id: 'lov', shortcut: 'shift+f9' }, { id: 'search', shortcut: 'enter' }, { id: 'typed', shortcut: 'x' },
  ] } })
  assert.deepEqual(currentShortcutActions(), [{ id: 'quickLaunch', shortcut: 'f2' }, { id: 'lov', shortcut: 'shift+f9' }])
  assert.equal(shortcutMatches('f2', { key: 'F2', code: 'F2' }), true)
  assert.equal(shortcutMatches('f2', { shiftKey: true, key: 'F2', code: 'F2' }), false)
  assert.equal(shortcutMatches('shift+f9', { shiftKey: true, key: 'F9', code: 'F9' }), true)
  setShortcutContext(null)
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

// ── P1 #18 floating windows on mouse hover ───────────────────────────────────────────────────
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
  assert.equal((page.match(/:data-mateu-hover="\[\[ \(\$current\.data && \$current\.data\.hover\) \|\| '' \]\]"/g) || []).length, 5, 'las plantillas cellClip (listado, selector, listado en un drawer × 3 plantillas Spectra)')
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installHover\(\)/)
})

test('clic de fila: sólo abre el registro si el listado lo ofrece (@NotNavigable no lo ofrece)', () => {
  const crud = (firstColumn) => ({ tree: { type: 'ServerSide', id: 's', serverSideType: 'X', children: [node({ type: 'Crud',
    columns: [node({ type: 'GridColumn', id: 'room', label: 'Room', dataType: 'string', ...firstColumn })] })] },
  data: { crud: { page: { content: [{ id: '101', room: '101' }], totalElements: 1 } } }, state: {} })
  const navigable = listingOf(crud({ actionId: 'view' }))
  const board = listingOf(crud({}))
  assert.equal(navigable.navigable, true)
  assert.equal(board.navigable, false)
  assert.equal(rowClickOpensRecord(navigable), true)
  assert.equal(rowClickOpensRecord(board), false)
  assert.equal(rowClickOpensRecord(null), true, 'sin listado conocido, como antes')
  assert.match(webApp('flows/main/pages/main-start-page-chains/mateuRowClicked.js'), /bridge\.rowClickOpensRecord\(listing\)/)
})

test('clic de fila entera (U1): toda la fila abre el registro salvo las celdas con clic propio', () => {
  // display columns (and inline editors) carry the class the chain respects
  assert.equal(isDisplayColumn({ id: 'name', actionId: 'view' }), false, 'la columna que abre no es de display')
  assert.equal(isDisplayColumn({ id: 'city', dataType: 'string' }), false)
  assert.equal(isDisplayColumn({ id: 's', dataType: 'status' }), false)
  for (const dataType of ['action', 'actionGroup', 'menu', 'component', 'link']) assert.equal(isDisplayColumn({ id: 'c', dataType }), true, dataType)
  assert.equal(isDisplayColumn({ id: 'c', stereotype: 'button' }), true)
  assert.equal(isDisplayColumn({ id: 'c', actionId: 'approve' }), true, 'una columna con su propia acción')
  assert.equal(isDisplayColumn({ id: 'c', editable: true, editorType: 'string' }), true, 'un editor inline')
  const ctx = { tree: { type: 'ServerSide', id: 's', serverSideType: 'X', children: [node({ type: 'Crud', columns: [
    node({ type: 'GridColumn', id: 'name', label: 'Name', dataType: 'string', actionId: 'view' }),
    node({ type: 'GridColumn', id: 'stock', label: 'Stock', dataType: 'integer', editable: true, editorType: 'integer' }),
    node({ type: 'GridColumn', id: 'ops', label: '', dataType: 'actionGroup' }),
  ] })] }, data: { crud: { page: { content: [{ _rowNumber: 0, name: 'A', stock: 1 }], totalElements: 1 } } }, state: {} }
  const listing = listingOf(ctx)
  const cls = (id) => listing.columns.find((c) => c.id === id).className || ''
  assert.doesNotMatch(cls('name'), new RegExp(NO_OPEN_CELL_CLASS))
  assert.match(cls('stock'), new RegExp(NO_OPEN_CELL_CLASS), 'la celda editable no abre')
  assert.match(cls('ops'), new RegExp(NO_OPEN_CELL_CLASS))
  // the origin of ojRowAction: a normal cell belongs to the row; a control or a display cell does not
  const at = (hits) => ({ closest: (sel) => hits.some((h) => sel.split(',').map((x) => x.trim()).includes(h)) ? {} : null })
  assert.equal(rowActionIsRows(at([])), true, 'texto de una celda normal')
  assert.equal(rowActionIsRows(at(['.' + NO_OPEN_CELL_CLASS])), false, 'celda de display / editable')
  assert.equal(rowActionIsRows(at(['oj-button'])), false, 'un botón de la fila')
  assert.equal(rowActionIsRows(at(['a'])), false, 'un enlace')
  assert.equal(rowActionIsRows(at(['[role="checkbox"]'])), false, 'la casilla de selección')
  assert.equal(rowActionIsRows(null), true, 'sin origen (Enter en la fila): es de la fila')
  // a WORK table (inline editing) no longer cuts the whole row click: only its editors
  const chain = webApp('flows/main/pages/main-start-page-chains/mateuRowClicked.js')
  assert.match(chain, /bridge\.rowActionIsRows\(origin, card\)/)
  assert.doesNotMatch(chain, /listing\.editable\)/)
})

// ── P1 #14 drag rows to a destination (@DragRows + DropZone) ───────────────────────────────
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
  // an action that repaints the host requests its OnLoad load again (the listing is not left empty)
  assert.match(webApp('flows/main/pages/main-start-page-chains/runMateuAction.js'), /bridge\.hostReRendered\(lastIncrement, host, hostNow\)/)
})

import { ganttAtomOf, itemOverviewOf, generalOverviewOf, isRichAtom } from './reduceContexts.mjs'
import { ganttLabelOf, GANTT_OUTSIDE_LABEL_INK } from './core/boards.mjs'
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

test('campos richText / html / markdown: con formato en sólo lectura; un richText editable, su editor', () => {
  const ro = atomsOf(node({ type: 'FormLayout' }, [
    node({ type: 'FormField', fieldId: 'notes', dataType: 'string', stereotype: 'richText', readOnly: true, label: 'Notes' }),
    node({ type: 'FormField', fieldId: 'policy', dataType: 'string', stereotype: 'markdown', readOnly: true, label: 'Policy' }),
  ]), { notes: '<p>VIP <b>guest</b><script>x</script></p>', policy: '**No** pets' })
  assert.deepEqual(ro.map((a) => [a.label, a.html]), [['Notes', '<p>VIP <b>guest</b></p>'], ['Policy', '<p><strong>No</strong> pets</p>']])
  const [layout] = atomsOf(node({ type: 'FormLayout' }, [node({ type: 'FormField', fieldId: 'notes', dataType: 'string', stereotype: 'richText', label: 'Notes' })]), { notes: '<p>x</p>' })
  assert.ok(layout.isFormLayout)
  assert.ok(layout.fields[0].isRichEditor && !layout.fields[0].isTextArea, 'JET has no rich text editor: mateu-rich-text-field')
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
  // the done part takes a darker shade of the task's colour (not JET's one grey for every bar)
  const coloured = ganttAtomOf({ tasks: [{ id: 'p', start: '2026-01-05', end: '2026-01-20', progress: 15, color: '#508223' },
    { id: 'q', start: '2026-01-05', end: '2026-01-20', progress: 15 }] })
  const [p, q] = coloured.rows.map((r) => r.tasks[0])
  assert.deepEqual(p.progress, { value: 0.15, svgStyle: { fill: '#304e15' } })
  assert.deepEqual(q.progress, { value: 0.15 })
  assert.equal(g.majorScale, 'months', 'un plan de meses se lee por meses')
  // the bar's label is READABLE: white only over the dark done fill (≥ 75%), else outside in dark ink
  const [t1, t2] = g.rows.map((r) => r.tasks[0])
  assert.deepEqual(t1.labelPosition, ['end', 'start', 'none'], 'half done: the middle of the bar is light — the label goes outside')
  assert.equal(t1.labelStyle.fill, GANTT_OUTSIDE_LABEL_INK)
  assert.deepEqual(t2.labelPosition, ['innerCenter', 'innerStart', 'none'])
  assert.equal(t2.labelStyle.fill, '#ffffff')
  assert.equal(ganttLabelOf(0.8).labelStyle.fill, '#ffffff')
  assert.equal(ganttLabelOf(0).labelStyle.fill, GANTT_OUTSIDE_LABEL_INK)
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

test('Column groups: oj-table has no grouped headers, so the group label prefixes its columns (wire shape of GridColumnGroupSyncTest)', () => {
  const col = (id, label) => ({ type: 'ClientSide', id, metadata: { type: 'GridColumn', id, label }, children: [] })
  const group = { type: 'ClientSide', id: 'occupancy', children: [],
    metadata: { type: 'GridGroupColumn', id: 'occupancy', label: 'Occupancy', columns: [col('adults', 'Adults'), col('children', 'Children')] } }
  // a fluent Grid
  const [g] = atomsOf(node({ type: 'Grid', content: [col('room', 'Room'), group],
    page: { content: [{ room: '101', adults: 2, children: 1 }] } }))
  assert.deepEqual(g.columns.map((c) => [c.field, c.headerText]),
    [['room', 'Room'], ['adults', 'Occupancy · Adults'], ['children', 'Occupancy · Children']])
  // nested groups compose their prefixes; an unlabelled group adds none
  assert.deepEqual(leafColumnsOf([{ type: 'GridGroupColumn', label: 'A', columns: [
    { type: 'GridGroupColumn', label: 'B', columns: [{ type: 'GridColumn', id: 'x', label: 'X' }] },
    { type: 'GridGroupColumn', columns: [{ type: 'GridColumn', id: 'y', label: 'Y' }] },
  ] }]).map((c) => c.label), ['A · B · X', 'A · Y'])
  // a grid FIELD of a form
  const [f] = atomsOf(node({ type: 'FormField', fieldId: 'rooms', columns: [col('room', 'Room'), group] }))
  // (an editable field: its rows' Edit/Remove column closes the table)
  assert.deepEqual(f.columns.map((c) => c.field), ['room', 'adults', 'children', '__rowActions'])
  assert.equal(f.columns[1].headerText, 'Occupancy · Adults')
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

test('General Overview: everything the main slot draws is a card, in order; main and info are columns at the grid widths', () => {
  const slotted = (slot, n) => ({ ...n, slot })
  const tree = node({ type: 'VerticalLayout' }, [
    node({ type: 'FormField', fieldId: 'record', dataType: 'string', options: [{ value: '1', label: 'One' }] }),
    node({ type: 'ResponsiveGrid', gridTemplateColumns: '3fr 1fr', gridTemplateAreas: '"main info"' }, [
      slotted('main', node({ type: 'VerticalLayout' }, [
        node({ type: 'EntityHeader', title: 'One' }),
        node({ type: 'Card', title: node({ type: 'Text', text: 'Grades' }), content: [node({ type: 'Markdown', markdown: 'A' })] }),
        node({ type: 'Markdown', markdown: 'loose' }),
        node({ type: 'Card', content: [node({ type: 'Markdown', markdown: 'untitled' })] }),
      ])),
      slotted('info', node({ type: 'VerticalLayout' }, [node({ type: 'Markdown', markdown: 'side' })])),
    ]),
  ])
  const go = generalOverviewOf({ state: {}, data: {}, tree })
  const main = go.columns[0].cards
  // the untitled pieces are no longer dropped (only titled Cards were taken)
  assert.deepEqual(main.map((c) => [c.title, c.items[0].html]), [['Grades', '<p>A</p>'], ['', '<p>loose</p>'], ['', '<p>untitled</p>']])
  // infoWidth: the info column takes its track (3fr 1fr → 9 + 3), each column stacks its cards
  assert.deepEqual(go.columns.map((c) => c.colClass.match(/oj-md-(\d+)/)[1]), ['9', '3'])
  assert.ok(go.columns.flatMap((c) => c.cards).every((c) => c.colClass === 'oj-flex-item oj-sm-12'))
  assert.equal(go.columns[1].cards[0].items[0].html, '<p>side</p>')
  // promoted info slot (travels first): its column goes first and takes the FIRST track
  tree.children[1].children.reverse()
  tree.children[1].metadata.gridTemplateColumns = '1fr 3fr'
  const promoted = generalOverviewOf({ state: {}, data: {}, tree })
  assert.deepEqual(promoted.columns.map((c) => [c.colClass.match(/oj-md-(\d+)/)[1], c.cards.length]), [['3', 1], ['9', 3]])
  // the real GeneralOverview (con-micronaut demo): its three main cards in one column, the info slot in the other
  const real = generalOverviewOf(reduceContexts(empty(), JSON.parse(readFileSync(join(here, 'fixtures', 'real', 'tpl-general-overview.json'), 'utf8'))).contexts[HOST_ID])
  assert.deepEqual(real.columns.map((c) => c.cards.map((k) => k.title)), [['Resultados', 'Notas por materia', 'Asistencia mensual'], ['']])
  // …and the page is Spectra's oj-sp-general-overview-page: the main cards in its MAIN slot, the
  // info slot in its INFO slot (promoteInfoSlot when it travels first)
  assert.deepEqual([real.mainCards.map((k) => k.title), real.infoCards.length, real.hasInfo], [['Resultados', 'Notas por materia', 'Asistencia mensual'], 1, true])
  assert.deepEqual([go.promoteInfo, promoted.promoteInfo, promoted.infoCards[0].items[0].html], [false, true, '<p>side</p>'])
  const html = webApp('flows/main/pages/main-start-page.html')
  const at = html.indexOf('<oj-sp-general-overview-page id="mateuOverviewHeader"')
  assert.ok(at > 0, 'the archetype paints the template')
  const body = html.slice(at, html.indexOf('</oj-sp-general-overview-page>', at))
  assert.match(body, /<div slot="main">[\s\S]{0,200}mateuOverview\.mainCards/)
  assert.match(body, /<div slot="info">[\s\S]{0,200}mateuOverview\.infoCards/)
  assert.match(body, /display-options\.promote-info-slot="\[\[ !!\$application\.variables\.mateuOverview\.promoteInfo \]\]"/)
  // the archetype's @Toolbar methods: the template header's primary / secondary actions
  assert.match(body, /primary-action="\[\[ \$application\.variables\.mateuPageHeader\.primary \]\]"/)
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
  // a carousel of arbitrary content still stacks
  assert.ok(atomsOf(node({ type: 'CarouselLayout' }, [node({ type: 'Text', text: 'slide' })])).some((a) => a.isText))
  // the title of a fluent Card is a Text component
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
  // without reorderable: the server's order and no marks
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
  // default height, like the web's <mateu-map>
  assert.equal(mapHeightOf(''), '25rem')
  assert.equal(mapAtomOf({ markers: [] }, 'm', 'width: 100%').mapStyle.height, '25rem')
  // the view: explicit position > markers (one centred, several framed) > world
  assert.deepEqual(mapViewPlanOf({ position: '40.4, -3.7', zoom: '9', markers: [palma, port] }), { kind: 'center', center: { lat: 40.4, lon: -3.7 }, zoom: 9 })
  assert.deepEqual(mapViewPlanOf({ markers: [palma] }), { kind: 'center', center: { lat: 39.5715, lon: 2.649 }, zoom: SINGLE_MARKER_ZOOM })
  assert.deepEqual(mapViewPlanOf(spec), { kind: 'fit', min: { lat: 39.558, lon: 2.649 }, max: { lat: 39.5715, lon: 2.6735 } })
  assert.deepEqual(mapViewPlanOf({ markers: [] }), { kind: 'center', center: { lat: 0, lon: 0 }, zoom: 3 })
  assert.deepEqual(mapMarkerParams('PMI03'), { _markerId: 'PMI03' })
  // tiles: without tileUrl on the wire, OSM with its attribution; with tileUrl, the Map's
  assert.equal(spec.tileUrl, '')
  assert.equal(tileLayerOf(spec).url, OSM_TILES)
  assert.match(tileLayerOf(spec).options.attribution, /OpenStreetMap/)
  const custom = JSON.parse(mapAtomOf({ markers: [], tileUrl: 'https://{s}.tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example' }, 'm', '').mapSpec)
  assert.equal(custom.tileUrl, 'https://{s}.tiles.example.com/{z}/{x}/{y}.png')
  assert.deepEqual(tileLayerOf(custom), { url: 'https://{s}.tiles.example.com/{z}/{x}/{y}.png', options: { maxZoom: 19, attribution: '© Example' } })
  assert.deepEqual(tileLayerOf({ tileUrl: 'https://t.example/{z}/{x}/{y}.png' }).options, { maxZoom: 19 })
  // wiring: template with the container, shell that installs it
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
  // a Wizard always advertises `next` (the root carries its actions, as the ServerSide does)
  const tree = (statuses) => ({ type: 'ClientSide', id: 'w', actions: [{ id: 'next' }], metadata: { type: 'VerticalLayout' }, children: [
    { type: 'ClientSide', id: 'p', metadata: { type: 'ProgressSteps', vertical: true,
      steps: statuses.map((st, i) => ({ id: 's' + i, title: 'Step ' + i, status: st })) }, children: [] }] })
  const running = wizardOf({ tree: tree(['done', 'current', 'upcoming']) })
  assert.equal(running.completed, false)
  assert.equal(running.currentStep, 's1')
  assert.equal(running.steps.length, 3)
  const done = wizardOf({ tree: tree(['done', 'done', 'done']) })
  assert.equal(done.completed, true)
  assert.equal(done.currentStep, WIZARD_DONE_STEP)
  // no resultTitle on the wire (an older server): a translated fallback
  assert.equal(done.currentLabel, 'Completed')
  assert.equal(done.steps.length, 4)
  // the counter counts the process's steps, not the result screen
  assert.equal(done.total, 3)
  assert.equal(done.currentIndex, 2)
  assert.ok(done.steps.every((st) => st.status === 'success'))
  assert.equal(done.resumeStepId, '')
  assert.match(webApp('flows/main/pages/main-start-page.html'), /mateuWizard\.completed \? 'mateu-wizard-completed'/)
  assert.match(webApp('resources/css/app.css'), /mateu-wizard-completed \.oj-sp-guided-process-step-count/)
})

test('proceso guiado terminado: el paso de resultado lleva el título que manda el servidor (resultTitle, su @Label)', () => {
  const tree = { type: 'ClientSide', id: 'w', actions: [{ id: 'next' }], metadata: { type: 'VerticalLayout' }, children: [
    { type: 'ClientSide', id: 'p', metadata: { type: 'ProgressSteps', vertical: true, resultTitle: 'Matrícula hecha',
      steps: [{ id: 'a', title: 'Datos', status: 'done' }, { id: 'b', title: 'Pago', status: 'done' }] }, children: [] }] }
  const done = wizardOf({ tree })
  assert.equal(done.currentStep, WIZARD_DONE_STEP)
  assert.equal(done.currentLabel, 'Matrícula hecha')
  assert.deepEqual(done.steps.map((s) => s.title), ['Datos', 'Pago', 'Matrícula hecha'])
  assert.equal(done.total, 2)
  // while running, the result title is not a step
  tree.children[0].metadata.steps = [{ id: 'a', title: 'Datos', status: 'current' }, { id: 'b', title: 'Pago', status: 'upcoming' }]
  const running = wizardOf({ tree })
  assert.deepEqual(running.steps.map((s) => s.title), ['Datos', 'Pago'])
  assert.equal(running.total, 2)
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
  // …and its content loads with the mount ROOT consumed: "", never "/"
  assert.equal(mediatorConsumedRoute({ rootRoute: '' }, '/'), '')
  assert.equal(mediatorConsumedRoute({ rootRoute: '' }, ''), '')
  assert.equal(mediatorConsumedRoute({ rootRoute: '/products' }, '/products/7'), '/products')
  assert.equal(mediatorConsumedRoute({}, '/orders'), '/orders')
  // a deep link to a RECORD of a root crud (/P-001): the mediator App says the root is consumed
  // (homeConsumedRoute "" + rootRoute ""), not its _route, which is the record
  const rootMediator = mediatorOf({ tree: { type: 'ServerSide', children: [{ type: 'ClientSide', metadata: {
    type: 'App', variant: 'MEDIATOR', rootRoute: '', homeConsumedRoute: '', homeRoute: '/P-001',
    homeServerSideType: 'com.example.app.Products' } }] }, state: { _route: '/P-001' } })
  assert.equal(rootMediator.rootRoute, '')
  assert.equal(mediatorConsumedRoute(rootMediator, '/P-001'), '')
  // a crud mounted at /products keeps consuming its own path
  const productsMediator = mediatorOf({ tree: { type: 'ServerSide', children: [{ type: 'ClientSide', metadata: {
    type: 'App', variant: 'MEDIATOR', rootRoute: '/products/7', homeConsumedRoute: '/products' } }] }, state: { _route: '/7' } })
  assert.equal(mediatorConsumedRoute(productsMediator, '/products/7'), '/products')
  // and a row click on the root crud flips to /P-002, not //P-002
  assert.equal(composeInnerRoute(mediatorBaseOf({ route: '', consumedRoute: '' }, '/'), '/P-002'), '/P-002')
  // …and Edit on a record opened by a deep link (/P-003): /P-003/edit, not /P-003/P-003/edit
  assert.equal(composeInnerRoute(mediatorBaseOf({ route: '/P-003', consumedRoute: '', mountRoot: true }, '/P-003'), '/P-003/edit'), '/P-003/edit')
  assert.equal(composeInnerRoute(mediatorBaseOf({ route: '/products', consumedRoute: '/products' }, '/products'), '/7'), '/products/7')
  // @UI("") on a crud: the bootstrap now answers its MEDIATOR App (the load, not an error) — still
  // a mount without a shell
  assert.equal(bootstrapHasApp({ fragments: [{ component: { type: 'ServerSide', serverSideType: 'com.example.app.Products',
    children: [{ type: 'ClientSide', metadata: { type: 'App', variant: 'MEDIATOR' } }] } }] }), false)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.setMountWithoutApp\(withoutApp\)/)
  assert.match(readFileSync(join(here, 'transport.mjs'), 'utf8'), /consumedRoute: '_empty'/)
})

test('enum cells: a column with valueLabels shows "In house", the row keeps IN_HOUSE', () => {
  const labels = { IN_HOUSE: 'In house', DEPARTED: 'Checked out' }
  const ctx = { tree: { metadata: { type: 'Crud', columns: [
    { metadata: { id: 'guest', label: 'Guest' } },
    { metadata: { id: 'status', label: 'Status', valueLabels: labels } },
    { metadata: { id: 'state', label: 'State', dataType: 'status', valueLabels: labels, tones: { DEPARTED: 'danger' } } },
  ] }, children: [] }, data: { crud: { page: { content: [
    { _rowNumber: 0, guest: 'Ada', status: 'IN_HOUSE', state: 'DEPARTED' },
  ], totalElements: 1 } } } }
  const listing = listingBaseOf(ctx)
  const status = listing.columns.find((c) => c.id === 'status')
  assert.equal(status.field, 'status' + LABEL_CELL_SUFFIX)
  const row = listing.rows[0]
  assert.equal(row['status' + LABEL_CELL_SUFFIX], 'In house')
  assert.equal(row.status, 'IN_HOUSE')
  // a status badge reads the label, toned by the RAW value
  assert.equal(row.state.message, 'Checked out')
  assert.equal(row.state.type, 'DANGER')
  // what a selection hands back is the row as it arrived
  const [picked] = selectedRowsOf(listing.rows, { all: true, keys: [], except: [] })
  assert.equal(picked.status, 'IN_HOUSE')
  assert.equal(picked.state, 'DEPARTED')
  assert.equal(Object.keys(picked).some((k) => k.endsWith(LABEL_CELL_SUFFIX)), false)
  // a row CLICK hands the row back as it arrived too (the 'view' parameters)
  assert.deepEqual(rowAsArrived(listing.rows[0]), { _rowNumber: 0, guest: 'Ada', status: 'IN_HOUSE', state: 'DEPARTED' })
  assert.equal(valueLabelOf({ valueLabels: labels }, 'DUE_OUT'), 'DUE_OUT')
  assert.equal(valueLabelOf({}, 'IN_HOUSE'), 'IN_HOUSE')
})

test('a listing with a column group: every leaf column is a table column, the group label prefixing it', () => {
  const ctx = { tree: { metadata: { type: 'Crud', columns: [
    { metadata: { id: 'room', label: 'Room' } },
    { metadata: { type: 'GridGroupColumn', id: 'occ', label: 'Occupancy', columns: [
      { metadata: { type: 'GridColumn', id: 'adults', label: 'Adults', sortable: true } },
      { metadata: { type: 'GridColumn', id: 'children', label: 'Children' } },
    ] } },
  ] }, children: [] }, data: { crud: { page: { content: [{ _rowNumber: 0, room: '101', adults: 2, children: 0 }], totalElements: 1 } } } }
  const listing = listingBaseOf(ctx)
  assert.deepEqual(listing.columns.map((c) => [c.id, c.headerText]),
    [['room', 'Room'], ['adults', 'Occupancy · Adults'], ['children', 'Occupancy · Children']])
  assert.equal(listing.rows[0].adults, 2)
})

test('@Compact listing: the table takes JET display="grid" (dense rows), a plain one stays "list"', () => {
  const ctxOf = (compact) => ({ tree: { metadata: { type: 'Crud', compact, columns: [{ metadata: { id: 'name' } }] }, children: [] },
    data: { crud: { page: { content: [], totalElements: 0 } } } })
  assert.equal(listingBaseOf(ctxOf(true)).display, 'grid')
  assert.equal(listingBaseOf(ctxOf(false)).display, 'list')
})

atest('navigating to another screen starts it at its top — not on back/forward, a live reload, or embedded', async () => {
  // leaving a long wizard from its last step, the reservation's page opened scrolled down, its top
  // under the pinned header
  const calls = []
  const win = { scrollTo: (x, y) => calls.push([x, y]) }
  assert.equal(scrollToTopOnNavigate({ event: { detail: { route: '/reservas/st-noah' } } }, win), true)
  assert.deepEqual(calls, [[0, 0]])
  // the browser restores its own position on back/forward and a deep link; a live reload keeps it
  assert.equal(scrollToTopOnNavigate({ fromUrl: true }, win), false)
  assert.equal(scrollToTopOnNavigate({ liveState: {} }, win), false)
  // embedded in a host page the scroll is the host's
  const { setEmbeddedHost } = await import('./embedded.mjs')
  setEmbeddedHost({})
  try { assert.equal(scrollToTopOnNavigate({}, win), false) } finally { setEmbeddedHost(null) }
  assert.equal(calls.length, 1)
})

for (const [name, fn] of pending) { await fn(); console.log(`  ✓ ${name}`); pass++ }
void HOST_ID

import { meterAtomOf } from './reduceContexts.mjs'

test('Meter: its unit, its thresholds and its fill percent (mateu-meter); a MetricCard icon; the info status tone', () => {
  // the unit after the value (it was «98 / 100»), the fill percent as the caption when none is given
  const m = meterAtomOf({ label: 'Attendance', value: 98, max: 100, unit: '%' })
  assert.equal(m.valueText, '98 %')
  assert.equal(m.caption, '98 %')
  assert.equal(m.hasThresholds, false, 'no thresholds: JET\'s progress bar, as before')
  assert.equal(meterAtomOf({ value: 3, max: 10, caption: 'used' }).valueText, '3 / 10')
  assert.equal(meterAtomOf({ value: 3, max: 10, caption: 'used' }).caption, 'used')
  // warnAt / dangerAt: the fill's tone (success below, warning from warnAt, error from dangerAt)
  const tone = (value) => meterAtomOf({ value, max: 100, warnAt: 70, dangerAt: 90 }).fillClass
  assert.deepEqual([tone(50), tone(70), tone(95)], ['mateu-meter-fill mateu-meter-success', 'mateu-meter-fill mateu-meter-warning', 'mateu-meter-fill mateu-meter-error'])
  assert.equal(meterAtomOf({ value: 150, max: 100, warnAt: 70 }).fillWidth, '100%')
  // money keeps its value against its limit
  assert.match(meterAtomOf({ value: 1710.5, max: 2000, unit: '€' }, (x) => x, (v) => '€ ' + v).valueText, /€ 1710.5 \/ € 2000/)
  // MetricCard.icon is not shown on Redwood ("pure KPI, like in Spectra"): the KPI carries no icon
  for (const icon of ['vaadin:users', '📝', undefined]) {
    const k = metricOf({ title: 'Students', value: 412, icon })
    assert.deepEqual([k.iconClass, k.iconText], [undefined, undefined], String(icon))
  }
  // a StatusItem in the info tone has a colour (it was the secondary grey)
  const list = islandContentOf({ state: {}, data: {}, tree: node({ type: 'StatusList', items: [{ id: 'a', title: 'A', status: 'Info', statusColor: 'info' }] }) })
  assert.equal(list[0].items[0].items[0].statusClass, 'mateu-text-info')
  const css = webApp('resources/css/app.css')
  for (const cls of ['mateu-text-info', 'mateu-meter-success', 'mateu-meter-warning', 'mateu-meter-error']) assert.match(css, new RegExp('\\.' + cls + ' \\{'))
})

// ── Spectra adoption (phase A): KPI band = oj-sp-scoreboard, EmptyState CTA, typed inputs ────────
test('Scoreboard → oj-sp-scoreboard items: nothing a MetricCard says is dropped', () => {
  // a percentage trend → the period-change indicator (signed by the label, else by the trend)
  assert.deepEqual(scoreboardTrendOf('up', '+8% vs last month'), { periodChangeIndicator: { value: 8, comparisonPeriod: 'vs last month' }, trendColor: 'success' })
  assert.deepEqual(scoreboardTrendOf('down', '12%'), { periodChangeIndicator: { value: -12, comparisonPeriod: '' }, trendColor: 'danger' })
  assert.equal(scoreboardTrendOf('down', '-3,5 % WoW').periodChangeIndicator.value, -3.5)
  // anything else → a badge with the arrow, coloured by the trend (the indicator would print "%")
  assert.deepEqual(scoreboardTrendOf('up', '+112'), { badge: { text: '▲ +112', status: 'success' }, trendColor: 'success' })
  assert.deepEqual(scoreboardTrendOf('neutral', 'stable').badge, { text: '■ stable', status: 'neutral' })
  assert.deepEqual(scoreboardTrendOf('', ''), {})
  // value + unit → metric; timeframe + description → meta
  const m = metricOf({ title: 'NPS', value: 62, unit: 'pts', timeframe: 'Last 30 days', description: 'Net promoter score', trend: 'neutral', trendLabel: 'stable' })
  const item = scoreboardItemOf(m, 3)
  assert.deepEqual([item.id, item._rowNumber, item.title, item.metric, item.meta], ['k3', 3, 'NPS', '62 pts', 'Last 30 days · Net promoter score'])
  // the band: one item per card, actionable when any card drills in (installScoreboards runs it)
  const band = scoreboardAtomOf([metricOf({ title: 'A', value: 1 }), metricOf({ title: 'B', value: 2, actionId: 'openB' })])
  assert.deepEqual(band.sbItems.map((i) => i.id), ['k0', 'k1'])
  assert.equal(band.sbActionable, true)
  assert.equal(scoreboardAtomOf([metricOf({ title: 'A', value: 1 })]).sbActionable, false)
})

test('Scoreboard: the band carries its items as consecutive MetricCards join it; the page paints oj-sp-scoreboard', () => {
  const reg = fixture('dashboard').reduce((r, inc) => reduceContexts(r, inc), empty())
  const kpis = hostContentOf(reg.contexts[HOST_ID], null, { title: 'Dashboard' })[0].items.find((a) => a.isScoreboard)
  assert.deepEqual(kpis.sbItems.map((i) => i.title), kpis.metrics.map((x) => x.title))
  assert.equal(kpis.sbActionable, true, 'In house drills in')
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  // one per atoms surface, plus the dashboard landing page's `kpi` slot
  assert.equal(page.split('<oj-sp-scoreboard :id="[[ $current.data.sbId ]]" class="mateu-sp-scoreboard').length - 1, surfaces + 1)
  assert.match(kpis.sbId, /^mateuKpis\d+$/)
  const imports = JSON.parse(webApp('flows/main/pages/main-start-page.json')).imports.components
  for (const c of ['oj-sp-scoreboard', 'oj-sp-input-email', 'oj-sp-input-url', 'oj-sp-input-currency']) assert.ok(imports[c], c)
})

test('EmptyState: the call to action is oj-sp-empty-state\'s own primaryAction', () => {
  assert.deepEqual(emptyStateAtomOf({ actionId: 'go', actionLabel: 'Create' }).primaryAction, { label: 'Create', type: 'callToAction', display: 'on' })
  assert.equal(emptyStateAtomOf({ title: 'Nothing' }).primaryAction, null)
  const page = webApp('flows/main/pages/main-start-page.html')
  assert.match(page, /primary-action="\[\[ \$current\.data\.primaryAction \]\]"\s+on-sp-primary-action="\[\[ \$listeners\.hostBlockAction \]\]"/)
  assert.match(page, /on-sp-primary-action="\[\[ \$listeners\.islandBlockAction \]\]"/)
})

test('email / link / money fields → oj-sp-input-email / -url / -currency (the currency travels with the field)', () => {
  const md = (extra) => ({ type: 'FormField', fieldId: 'x', label: 'X', dataType: 'string', ...extra })
  const email = layoutFieldOf(md({ stereotype: 'email' }), { x: 'a@b.c' })
  assert.deepEqual([email.isEmail, email.isText, email.value], [true, false, 'a@b.c'])
  const url = layoutFieldOf(md({ stereotype: 'link', readOnly: true }), { x: 'https://mateu.io' })
  assert.deepEqual([url.isUrl, url.readonly, url.isText], [true, true, false])
  // an Amount brings its own currency; a declared one wins; EUR otherwise
  const amount = layoutFieldOf(md({ dataType: 'money', stereotype: 'money' }), { x: { currency: 'usd', value: 12.5, locale: 'en-US' } })
  assert.deepEqual([amount.isMoney, amount.currency, amount.value], [true, 'USD', 12.5])
  assert.equal(layoutFieldOf(md({ dataType: 'number', stereotype: 'money', attributes: [{ key: 'currency', value: 'GBP' }] }), { x: 3 }).currency, 'GBP')
  assert.equal(layoutFieldOf(md({ dataType: 'number', stereotype: 'money' }), { x: 3 }).currency, 'EUR')
  // the section form (formSectionsOf) shows an Amount's number too (it painted the field empty)
  const tree = { type: 'ServerSide', metadata: { type: 'Form' }, children: [{ metadata: { type: 'FormField', fieldId: 'dep', label: 'Deposit', dataType: 'money', stereotype: 'money' } }] }
  const f = formSectionsOf(tree, { dep: { currency: 'GBP', value: 320, locale: 'en-GB' } }, {}).flatMap((s) => s.fields).find((x) => x.fieldId === 'dep')
  assert.deepEqual([f && f.isMoney, f && f.value, f && f.currency], [true, 320, 'GBP'])
  // every copy of the fields carries the three Spectra inputs, each with ITS change listener
  const page = webApp('flows/main/pages/main-start-page.html')
  const surfaces = (page.match(/<!-- @atoms /g) || []).length
  for (const tag of ['<oj-sp-input-currency', '<oj-sp-input-email', '<oj-sp-input-url']) assert.equal(page.split(tag).length - 1, surfaces + FIELD_COPIES_OUTSIDE_ATOMS, tag)
})


test('a server NavigateTo OUTSIDE the mount is a browser path (as on the web renderer); inside it, a route of the app', () => {
  // the showcase: /dashboard-demo's openOrders answers URI.create("/products") — another @UI's mount
  setMount('/dashboard-demo')
  assert.equal(pathLeavingMountOf('/products'), '/products')
  assert.equal(pathLeavingMountOf('/products?x=1'), '/products?x=1')
  // under the mount (a crud's inner route), relative, protocol-relative: the app's own
  assert.equal(pathLeavingMountOf('/dashboard-demo/3'), null)
  assert.equal(pathLeavingMountOf('/dashboard-demo'), null)
  assert.equal(pathLeavingMountOf('orders'), null)
  assert.equal(pathLeavingMountOf('//evil.example'), null)
  // a route the app's own menu names (an App @UI("/app") lists '/section1'), and below it
  const menu = [{ label: 'S', route: '/section1', submenus: [{ label: 'T', route: '/section2' }] }, { remote: true, routePrefix: '/billing' }]
  assert.deepEqual(menuRoutesOf(menu), ['/section1', '/section2', '/billing'])
  for (const r of ['/section1', '/section2/7', '/billing/invoices']) assert.equal(pathLeavingMountOf(r, menuRoutesOf(menu)), null, r)
  // the chains' entry: it loads the page when it leaves (a URL is another tab's business), else not
  const assigned = []
  const win = { location: { assign: (p) => assigned.push(p) } }
  assert.equal(leftMountFor({ route: '/products' }, { shell: { menu } }, win), true)
  assert.equal(leftMountFor({ route: '/section1' }, { shell: { menu } }, win), false)
  assert.equal(leftMountFor({ url: 'https://x' }, null, win), false)
  assert.deepEqual(assigned, ['/products'])
  // the root mount and hash mode: every route is the app's
  setMount('')
  assert.equal(pathLeavingMountOf('/products'), null)
  setMount(null)
  assert.equal(pathLeavingMountOf('/products'), null)
})

test('Dashboard on Redwood: Spectra\'s grid UNLESS the dashboard declares its own geometry (colSpan/rowSpan ≠ 1, fixed columns)', () => {
  const panel = (title, extra = {}) => node({ type: 'DashboardPanel', title, colSpan: 1, rowSpan: 1, ...extra }, [node({ type: 'Text', text: title })])
  const dash = (panels, gridMeta = {}) => ({ type: 'ServerSide', id: 'd', children: [node({ type: 'ResponsiveGrid', ...gridMeta }, [
    node({ type: 'Scoreboard' }, [node({ type: 'MetricCard', title: 'Revenue', value: 1 })]), ...panels])] })
  const useGrid = (tree) => dashboardOf({ id: HOST_ID, kind: 'host', tree, state: {}, data: {} }).useGrid
  // nothing declared (the defaults: colSpan/rowSpan 1, columns() = 0 → no tracks): Spectra's grid
  assert.equal(useGrid(dash([panel('A'), panel('B'), panel('C')])), true)
  // a fluent DashboardPanel with 0 spans is "not declared" too
  assert.equal(useGrid(dash([panel('A', { colSpan: 0, rowSpan: 0 }), panel('B')])), true)
  // a panel spanning two columns or two rows: our grid, which honours it
  assert.equal(useGrid(dash([panel('A', { colSpan: 2 }), panel('B')])), false)
  // …and our grid gives each panel its width: the spanning one takes twice the twelfths of the other
  const spanned = dashboardOf({ id: HOST_ID, kind: 'host', tree: dash([panel('A', { colSpan: 2 }), panel('B')]), state: {}, data: {} })
  const xl = (b) => parseInt((b.blockClass.match(/oj-xl-(\d+)/) || [])[1] || '0', 10)
  assert.equal(xl(spanned.panels[0]), 2 * xl(spanned.panels[1]), spanned.panels.map((b) => b.blockClass).join(' | '))
  // a fixed column count: the panels share the declared tracks (3 columns → a third each)
  const fixed = dashboardOf({ id: HOST_ID, kind: 'host', tree: dash([panel('A'), panel('B'), panel('C')], { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' }), state: {}, data: {} })
  assert.ok(fixed.panels.every((b) => /oj-md-4/.test(b.blockClass)), fixed.panels.map((b) => b.blockClass).join(' | '))
  assert.equal(useGrid(dash([panel('A'), panel('B', { rowSpan: 2 })])), false)
  // a fixed column count (Dashboard.columns() = 3 → three fill tracks on the wire): our grid
  assert.equal(useGrid(dash([panel('A'), panel('B')], { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' })), false)
  // …and a legacy DashboardLayout with its own columns
  const legacy = { type: 'ServerSide', id: 'd', children: [node({ type: 'DashboardLayout', columns: 2 }, [panel('A'), panel('B')])] }
  const l = dashboardOf({ id: HOST_ID, kind: 'host', tree: legacy, state: {}, data: {} })
  if (l) assert.equal(l.useGrid, false)
  assert.equal(dashboardDeclaresLayout(legacy, findAllByType(legacy, 'DashboardPanel')), true)
  assert.equal(dashboardDeclaresLayout(dash([panel('A')]), [panel('A')]), false)
})

test('Dashboard declaring header pieces: inside a Page it is still the landing page, and the Page\'s subtitle is its header\'s', () => {
  const dash = node({ type: 'ResponsiveGrid' }, [node({ type: 'Scoreboard' }, [node({ type: 'MetricCard', title: 'Revenue', value: 1 })]),
    node({ type: 'DashboardPanel', title: 'A', colSpan: 1, rowSpan: 1 }, [node({ type: 'Text', text: 'a' })])])
  const tree = { type: 'ServerSide', id: 'd', children: [node({ type: 'Page', title: 'Ops', subtitle: 'Today' }, [dash])] }
  const host = { id: HOST_ID, kind: 'host', tree, state: {}, data: {} }
  const d = dashboardOf(host)
  assert.ok(d, 'the Page wrapper (the declared header) keeps the dashboard branch')
  assert.equal(d.panels.length, 1)
  assert.equal(pageSubtitleOf(host), 'Today')
})

test('Dashboard archetype → oj-sp-dashboard-landing-page: the scoreboard in its kpi slot, the @Panels as oj-sp-dashboard-panel', () => {
  const kpi = (title, extra = {}) => node({ type: 'MetricCard', title, value: 1, ...extra })
  const panel = (title, subtitle, kids, colSpan = 1) => node({ type: 'DashboardPanel', title, subtitle, colSpan }, kids)
  const dash = (panels) => ({ type: 'ServerSide', id: 'd', children: [node({ type: 'ResponsiveGrid' }, [
    node({ type: 'Scoreboard' }, [kpi('Revenue'), kpi('Orders', { actionId: 'openOrders' })]), ...panels])] })
  const three = [panel('Monthly sales', 'Units', [node({ type: 'Text', text: 'body' })]), panel('Mix', '', [node({ type: 'Markdown', markdown: 'x' })]), panel('Notes', '', [node({ type: 'Text', text: 'n' })])]
  const d = dashboardOf({ id: HOST_ID, kind: 'host', tree: dash(three), state: {}, data: {} })
  assert.ok(d)
  assert.deepEqual(d.kpis.map((k) => k.isScoreboard), [true])
  assert.equal(d.kpis[0].sbActionable, true, 'the drill-in rides along')
  assert.deepEqual(d.panels.map((p) => [p.title, p.subtitle]), [['Monthly sales', 'Units'], ['Mix', ''], ['Notes', '']])
  // the panel's title/subtitle are the panel's props, not repeated as its first texts
  assert.deepEqual(d.panels[0].items.map((a) => a.text), ['body'])
  assert.equal(d.useGrid, true, 'up to five panels: Spectra\'s own grid')
  // six panels: the oj-flex row (colSpan kept)
  const six = Array.from({ length: 6 }, (_, i) => panel('P' + i, '', [node({ type: 'Text', text: 't' + i })]))
  assert.equal(dashboardOf({ id: HOST_ID, kind: 'host', tree: dash(six), state: {}, data: {} }).useGrid, false)
  // a hero makes it a welcome; anything else beside the tiles, the generic content
  assert.equal(dashboardOf({ tree: { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [node({ type: 'HeroSection', title: 'W' }), ...three])] }, state: {}, data: {} }), null)
  assert.equal(dashboardOf({ tree: { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [node({ type: 'Notice', text: 'n' }), ...three])] }, state: {}, data: {} }), null)
  assert.equal(dashboardOf({ tree: { type: 'ServerSide', children: [node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: 'plain' })])] }, state: {}, data: {} }), null)
  // the page claims it: no generic content, the template's header instead of the VB one
  const plan = hostContentPlanOf({ id: HOST_ID, kind: 'host', tree: dash(three), state: {}, data: {} }, {})
  assert.equal(plan.hostBlocks, null)
  const html = webApp('flows/main/pages/main-start-page.html')
  const at = html.indexOf('<oj-sp-dashboard-landing-page id="mateuDashboardPage"')
  assert.ok(at > 0)
  const body = html.slice(at, html.indexOf('</oj-sp-dashboard-landing-page>', at))
  assert.match(body, /<div slot="kpi">[\s\S]{0,300}<oj-sp-scoreboard/)
  assert.match(body, /<oj-sp-dashboard-grid[\s\S]{0,400}<oj-sp-dashboard-panel/)
  const imports = JSON.parse(webApp('flows/main/pages/main-start-page.json')).imports.components
  for (const c of ['oj-sp-dashboard-landing-page', 'oj-sp-dashboard-grid', 'oj-sp-dashboard-panel']) assert.ok(imports[c], c)
  for (const chain of ['pages/shell-page-chains/onMateuNavigate.js', 'flows/main/pages/main-start-page-chains/runMateuAction.js']) {
    assert.match(webApp(chain), /integratedHeader = !!\(wizardProjection \|\| welcome \|\| archetypes\.dashboard/, chain)
  }
})

test('TodoList archetype → oj-sp-task-organizer-page: its header + the queue as the generic content paints it', () => {
  const queue = node({ type: 'TaskQueue', actionId: 'openTodoItem', groups: [{ label: 'Today (1)', items: [{ id: 'T1', title: 'Call Ada' }] }] })
  const tree = { type: 'ServerSide', id: 't', children: [node({ type: 'Page', title: 'Front desk tasks' }, [
    node({ type: 'Card', content: node({ type: 'CustomField', content: queue }) })])] }
  const todo = todoListOf({ id: HOST_ID, kind: 'host', tree, state: {}, data: {} })
  assert.equal(todo.title, 'Front desk tasks')
  assert.ok(todo.blocks.flatMap((b) => b.items).some((a) => a.isQueue), 'the queue atom rides in its slot')
  // the page claims it (no generic content twice) — and a TaskQueue of another archetype is not one
  assert.equal(hostContentPlanOf({ id: HOST_ID, kind: 'host', tree, state: {}, data: {} }, {}).hostBlocks, null)
  // …and the queue + detail page steps aside (it painted the list a second time below)
  assert.equal(taskQueueOf(tree), null)
  const other = { type: 'ServerSide', children: [node({ type: 'TaskQueue', actionId: 'selectCollectionItem', groups: [] })] }
  assert.equal(todoListOf({ tree: other, state: {}, data: {} }), null)
  const html = webApp('flows/main/pages/main-start-page.html')
  const at = html.indexOf('<oj-sp-task-organizer-page id="mateuTodoPage"')
  assert.ok(at > 0)
  assert.match(html.slice(at, html.indexOf('</oj-sp-task-organizer-page>', at)), /mateuTodo\.blocks/)
  assert.ok(JSON.parse(webApp('flows/main/pages/main-start-page.json')).imports.components['oj-sp-task-organizer-page'])
})

// ── Spectra page templates with slots (core/spPages.mjs, phase D2) ──────────────────────────────
const realHost = (name) => reduceContexts(empty(), JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))).contexts[HOST_ID]
const sectionOf = (html, open, close) => { const at = html.indexOf(open); assert.ok(at > 0, open); return html.slice(at, html.indexOf(close, at)) }

test('DataManagement → oj-sp-data-management-page: the view in its default slot, the DockedPanels in its inner drawers', () => {
  const dm = dataManagementPageOf(realHost('tpl-data-management-docked'))
  assert.equal(dm.kind, 'dataManagement')
  assert.equal(dm.title, 'Plan del proyecto')
  const atoms = dm.main.flatMap((b) => b.items)
  assert.deepEqual(atoms.find((a) => a.isButtons).buttons.map((b) => b.actionId), ['switchToGrid', 'switchToGantt', 'toggleEndPanel', 'toggleBottomPanel'], 'the view switcher + panel toggles stay in the content')
  assert.ok(atoms.some((a) => a.isGrid), 'the grid view')
  assert.ok(!atoms.some((a) => a.isText && a.text === 'Resumen'), 'the end panel is not painted in the content')
  assert.deepEqual([dm.end.title, dm.end.closeActionId, dm.endOpened], ['Resumen', 'toggleEndPanel', 'inner'], 'the end panel: its header row becomes the template header')
  assert.ok(!dm.end.blocks.flatMap((b) => b.items).some((a) => a.isButtons), 'its ✕ is the template\'s close, not a button of the body')
  assert.deepEqual([dm.bottom.title, dm.bottom.closeActionId, dm.bottomOpened, dm.bottomOptions.drawerMode], ['Registro', 'toggleBottomPanel', 'inner', 'closable'])
  // a closed panel (only its toggle in the toolbar) leaves its drawer closed
  const other = dataManagementPageOf(realHost('tpl-data-management'))
  assert.deepEqual([other.title, other.endOpened, other.bottomOpened, other.end.on, other.bottom.on], ['Planificación de cursos', 'inner', 'none', true, false])
  // the page claims it
  assert.equal(hostContentPlanOf(realHost('tpl-data-management-docked'), {}).hostBlocks, null)
  assert.equal(dataManagementPageOf({ tree: node({ type: 'VerticalLayout' }), state: {}, data: {} }), null)
})

test('GanttPage → oj-sp-data-management-page: the canvas + detail in the default slot, the persistent drawer docked at the bottom in fixed mode', () => {
  const g = dataManagementPageOf(realHost('tpl-gantt-page'))
  assert.equal(g.kind, 'gantt')
  assert.ok(g.main.flatMap((b) => b.items).some((a) => a.isPlanning), 'the oj-gantt canvas')
  assert.ok(g.bottom.on && g.bottom.blocks.length > 0, 'the bottom drawer\'s content')
  assert.equal(g.bottom.closeActionId, '', 'a persistent drawer has no toggle to run')
  assert.equal(g.bottomOptions.drawerMode, 'fixed', 'collapsible = Spectra\'s fixed mode (the handle)')
  const html = webApp('flows/main/pages/main-start-page.html')
  const page = sectionOf(html, '<oj-sp-data-management-page id="mateuDmPage"', '</oj-sp-data-management-page>')
  assert.match(page, /<div slot="innerEnd"[^>]*>\s*<oj-bind-if[^>]*>\s*<oj-sp-general-drawer-template[\s\S]*on-sp-close="\[\[ \$listeners\.dmEndPanelClosed \]\]"/)
  assert.match(page, /<div slot="innerBottom"[^>]*>\s*<oj-bind-if[^>]*>\s*<oj-sp-bottom-drawer-template[\s\S]*drawer-state="\{\{ \$variables\.mateuDmBottomState \}\}"/)
  assert.match(page, /end-opened="\[\[ \$application\.variables\.mateuDm\.endOpened \]\]"/)
  const pageJson = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  assert.ok(pageJson.imports.components['oj-sp-data-management-page'])
  assert.equal(pageJson.eventListeners.dmBottomStateChanged.chains[0].chain, 'dmPanelClosed')
  assert.ok(existsSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page-chains', 'dmPanelClosed.js')))
  assert.match(webApp('resources/css/app.css'), /\.mateu-dm-page:not\(\.mateu-dm-transactional\) oj-sp-header-create-edit \[id\$="_cancelAction"\]/, 'no transaction: Cancel/primary hidden')
  // a page declaring a cancel + a primary @Toolbar action (pageHeaderOf → createEdit) shows them:
  // the template's own Cancel/primary run the header's back/primary actions
  assert.match(page, /:class="\[\[ \$application\.variables\.mateuPageHeader\.createEdit \? 'mateu-dm-page mateu-dm-transactional' : 'mateu-dm-page' \]\]"/)
  assert.match(page, /on-sp-primary-action="\[\[ \$listeners\.headerPrimary \]\]"/)
  assert.match(page, /on-sp-cancel="\[\[ \$listeners\.headerGoToParent \]\]"/)
})

test('CollectionDetail → oj-sp-collection-detail-page: the collection in its default slot, the server-built detail stamped for the selected item', () => {
  const host = realHost('tpl-collection-detail')
  const title = 'Hotel directory'
  const cd = collectionDetailPageOf(host, { title })
  assert.ok(cd.collection.some((b) => b.items.some((a) => a.isQueue)), 'the cards')
  assert.ok(cd.collection.some((b) => b.items.some((a) => a.isFormLayout)), 'the search form (its debounced auto-save keeps working)')
  assert.deepEqual(cd.selectedItems, [], 'nothing selected')
  assert.ok(cd.noSelection.flatMap((b) => b.items).some((a) => a.isEmptyStateAtom), 'emptyDetail() in the noSelection slot')
  // selecting: the selected card carries the server's detail; the template gets only { id }
  const state = JSON.parse(JSON.stringify(host))
  const queue = findAllByType(state.tree, 'TaskQueue')[0]
  queue.metadata.groups[0].items[1].selected = true
  const sel = collectionDetailPageOf(state, { title })
  assert.deepEqual(sel.selectedItems, [{ id: queue.metadata.groups[0].items[1].id }])
  assert.equal(sel.detail.length, 1)
  assert.deepEqual(sel.noSelection, [])
  assert.equal(hostContentPlanOf(host, { title }).hostBlocks, null, 'the page claims it')
  const html = webApp('flows/main/pages/main-start-page.html')
  const page = sectionOf(html, '<oj-sp-collection-detail-page id="mateuCdPage"', '</oj-sp-collection-detail-page>')
  assert.match(page, /selected-items="\[\[ \$application\.variables\.mateuCd\.selectedItems \]\]"/)
  assert.match(page, /<template slot="detailTemplate">[\s\S]*mateuCd\.detail/)
  assert.match(page, /<div slot="noSelection"[\s\S]*mateuCd\.noSelection/)
})

test('ItemOverview → oj-sp-item-overview-page: the key panel in oj-sp-item-overview (its leading heading is the item title), the tabs in main', () => {
  const host = realHost('tpl-item-overview')
  const item = itemOverviewOf(host)
  const h = itemOverviewPageHeaderOf(host, item)
  assert.equal(h.itemTitle, 'Ergonomic chair EC-200', 'the key panel\'s leading heading')
  assert.ok(!/<h3>/.test(h.keyItems[0].html), 'taken out of the body (it was said twice)')
  assert.equal(itemOverviewPageHeaderOf(null, { key: { title: '', items: [{ isHeading: true, text: 'Chair' }, { isText: true, text: 'x' }] } }).keyItems.length, 1)
  assert.equal(itemOverviewPageHeaderOf(null, { key: { title: 'Card', items: [{ isHeading: true, text: 'Chair' }] } }).itemTitle, 'Card')
  // a rich-text heading's TEXT: tags out (a nested one too), entities decoded once (`&amp;lt;` stays `&lt;`)
  const rich = (html) => itemOverviewPageHeaderOf(null, { key: { title: '', items: [{ isRichText: true, html }] } })
  assert.equal(rich('<h2>Tom &amp; Jerry&nbsp;<b>&quot;EC&quot;</b> &amp;lt;x&gt;</h2><p>body</p>').itemTitle, 'Tom & Jerry "EC" &lt;x>')
  assert.equal(rich('<h3><scr<b>ipt>alert(1)</h3>').itemTitle, 'iptalert(1)', 'a tag split by another leaves no markup')
  assert.equal(rich('<h3><i></i></h3>rest').itemTitle, '', 'an empty heading is no title')
  assert.equal(rich('<p>no heading</p>').itemTitle, '')
  // the PAGE's title (@Title → the window title) is the item title, as Vaadin draws it above the panels
  assert.equal(host.windowTitle, 'Ergonomic chair EC-200')
  const titled = itemOverviewPageHeaderOf({ ...host, windowTitle: 'Product EC-200' }, item)
  assert.equal(titled.itemTitle, 'Product EC-200', 'the page title, not the panel\'s heading')
  assert.match(titled.keyItems[0].html, /<h3>Ergonomic chair EC-200/, 'a heading saying something else stays in the body')
  const carded = itemOverviewPageHeaderOf({ tree: {}, windowTitle: 'Chair' }, { key: { title: 'Key info', items: [{ isText: true, text: 'x' }] } })
  assert.equal(carded.itemTitle, 'Chair')
  assert.deepEqual(carded.keyItems.map((a) => a.text), ['Key info', 'x'], 'the key card\'s own title heads the body')
  const html = webApp('flows/main/pages/main-start-page.html')
  const page = sectionOf(html, '<oj-sp-item-overview-page id="mateuItemOvPage"', '</oj-sp-item-overview-page>')
  assert.match(page, /<oj-sp-item-overview slot="overview"[\s\S]*<div slot="body"/)
  assert.match(page, /<div slot="main"[\s\S]*<oj-tab-bar id="mateuItemTabs"/)
  // the template's look is Spectra's: no rule over its internals, no display mode forced on it
  assert.doesNotMatch(webApp('resources/css/app.css'), /\.oj-sp-item-overview-page-/, 'no override of the template\'s own surfaces')
  assert.doesNotMatch(page.split('\n')[0], /display-mode=/, 'the display mode is Spectra\'s default (or the app\'s appMode)')
  // its edit action is the page's primary when that primary edits
  assert.match(page, /edit: \$application\.variables\.mateuPageHeader\.itemEdit/)
  assert.match(page, /on-sp-edit="\[\[ \$listeners\.headerPrimary \]\]"/)
})
console.log(`\n${pass} tests PMS OK`)

test('a page that DECLARES the Item overview page template (YAML template: ItemOverviewPage) → Spectra\'s, from the slots by id', () => {
  // the Java golden (PageTemplateSyncTest) of the same YAML the browser expander reads
  const golden = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)),
    '../../../libs/mateu/src/mateu/ui/infra/expander/__fixtures__/item-overview-page.golden.json'), 'utf-8'))
  const host = { state: { name: 'Luke', image: 'https://img/luke.png' }, data: {}, tree: golden.fragments[0].component }
  const io = itemOverviewOf(host)
  // the panel's body + footer slots, as atoms; the media is the template's, never an atom
  assert.deepEqual(io.key.items.map((a) => a.fieldId || a.text), ['gender', 'homeworld', 'Last seen on Tatooine'])
  // a main slot that is one tab bar → the template's tabs
  assert.deepEqual(io.tabs.map((t) => t.label), ['Physique', 'Appearance'])
  assert.equal(io.selectedTab, 'itab-0')
  const header = itemOverviewPageHeaderOf(host, io)
  assert.equal(header.itemTitle, 'Luke')
  assert.equal(header.itemSubtitle, 'Character')
  assert.deepEqual(header.badge, { text: 'Jedi', status: 'success', style: 'subtle', position: 'trailing' })
  assert.deepEqual(header.avatar, { src: 'https://img/luke.png', initials: 'LS' })
  assert.equal(header.photo, null)
  // the page is a Spectra page template: it brings its own header
  const vars = archetypeVarsOfForTest(host)
  assert.equal(vars.spPage, true)

  // a photo, and a main slot that is not a tab bar: no tabs, its atoms as they are
  const photoGolden = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)),
    '../../../libs/mateu/src/mateu/ui/infra/expander/__fixtures__/item-overview-photo.golden.json'), 'utf-8'))
  const photoHost = { state: { name: 'X-wing', picture: 'https://img/x.png' }, data: {}, tree: photoGolden.fragments[0].component }
  const photoIo = itemOverviewOf(photoHost)
  assert.deepEqual(photoIo.tabs, [])
  assert.deepEqual(photoIo.mainItems.map((a) => a.text), ['Main area'])
  assert.deepEqual(itemOverviewPageHeaderOf(photoHost, photoIo).photo, { src: 'https://img/x.png' })
  assert.deepEqual(archetypeVarsOfForTest(photoHost).vars.mateuItemTabTexts.map((a) => a.text), ['Main area'])

  // served, a YAML page arrives wrapped in its server-side component (SeededYamlPage)
  const wrapped = { ...host, tree: { type: 'ServerSide', id: 'page', serverSideType: 'io.mateu.SeededYamlPage', children: [golden.fragments[0].component] } }
  const wrappedIo = itemOverviewOf(wrapped)
  assert.deepEqual(wrappedIo.tabs.map((t) => t.label), ['Physique', 'Appearance'])
  assert.equal(itemOverviewPageHeaderOf(wrapped, wrappedIo).itemTitle, 'Luke')
})

test('Item overview page as in Redwood\'s examples: a stacked body, sections with Spectra\'s header in the main slot', () => {
  // the body is Spectra's read-only form layout: property rows (nested ones too) are drawn stacked
  const golden = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)),
    '../../../libs/mateu/src/mateu/ui/infra/expander/__fixtures__/item-overview-page.golden.json'), 'utf-8'))
  const host = { state: { name: 'Luke' }, data: {}, tree: golden.fragments[0].component }
  const io = itemOverviewOf(host)
  const rows = { ...io, key: { ...io.key, items: [
    { isPropertyRow: true, label: 'Gender', value: 'male' },
    { isRow: true, items: [{ isPropertyRow: true, label: 'Height', value: '172' }] },
    { isText: true, text: 'note' },
  ] } }
  const keyItems = itemOverviewPageHeaderOf(host, rows).keyItems
  assert.equal(keyItems[0].stacked, true)
  assert.equal(keyItems[1].items[0].stacked, true)
  assert.equal(keyItems[2].stacked, undefined)

  // a titled section (a Card marked mateu-section, its title a heading) in the main slot keeps its
  // oj-sp-section header, and its title is not repeated as a text
  const section = { type: 'ClientSide', id: 's1', cssClasses: 'mateu-section', children: [],
    metadata: { type: 'Card', title: { type: 'ClientSide', metadata: { type: 'Text', container: 'h3', text: 'Physique' } },
      content: { type: 'ClientSide', metadata: { type: 'Text', text: 'Tall' } } } }
  const tree = JSON.parse(JSON.stringify(golden.fragments[0].component))
  const main = (function find(n) { if (!n || typeof n !== 'object') return null; if (n.id === 'item-overview-main') return n
    for (const c of n.children || []) { const r = find(c); if (r) return r } return null })(tree)
  main.children = [section]
  const sectioned = itemOverviewOf({ ...host, tree })
  const header = sectioned.mainItems.find((a) => a.isSpSectionHeader)
  assert.equal(header && header.sectionTitle, 'Physique')
  assert.equal(sectioned.mainItems.filter((a) => a.text === 'Physique').length, 0)
  assert.ok(sectioned.mainItems.some((a) => a.text === 'Tall'))
})
