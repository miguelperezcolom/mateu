// The DOM WIRING of the VB core, in Node and without VB: what the user does with keyboard and
// mouse on the painted page — shortcuts and access keys, dragging rows to a destination, the
// «I want to…» panel, the matrix (collapse, edit, link), the tape chart range, the map, the
// floating windows, accessibility (live regions, skip to content, focus after navigating,
// required errors), the client rules on the painted fields, the calendar and the capture
// fields. The pure part of those modules is already pinned by test.mjs/test-pms.mjs; here, what
// lives in the listeners. The DOM is the minimal one of test-harness-dom.mjs.
// Usage: node test-dom.mjs
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { makeDom, dataTransfer, sleep, FakeEvent } from './test-harness-dom.mjs'
import { installKeys, setShortcutContext, setKeysActionSink, setAccessKeysEnabled } from './keys.mjs'
import { shortcutMatches, installActionPanels } from './actionPanels.mjs'
import { installDragAndDrop, setDropSink, installTileReorder, setTileReorderSink, paintedTileOrder } from './dnd.mjs'
import { installMatrixGrids, setMatrixActionSink } from './matrix.mjs'
import { panelExpanded, matrixSectionKey } from './reduceContexts.mjs'
import { installPlanningRange, setPlanningRangeSink } from './planning.mjs'
import { installHover } from './hover.mjs'
import { installMaps, setMapActionSink } from './map.mjs'
import {
  installAnnouncer, announce, focusContent, announceNavigation, resetNavigationState, mountSkipLink,
  trackPressedControls, markPressedControlBusy, clearPressedControlBusy, showFieldErrors, clearFieldErrorMarks,
  clearFieldError, guardGuidedProcess, setLastRetry, takeLastRetry, hasLastRetry, focusIsInChat,
} from './a11y.mjs'
import { setRulesContext, setRulesContexts, applyRulesNow, installRules, setRuleActionSink, rulesDebug } from './rules.mjs'
import { installCalendars, setCalendarActionSink } from './calendar.mjs'
import { installToc, tocActiveIndex, tocSectionsOf } from './toc.mjs'
import { defineCaptureField, defineColorField, captureTexts } from './inputs.mjs'
import { installRowTones, setListingTones, installStickyHeader } from './tables.mjs'
import { readTileOrder } from './prefs.mjs'
import { chromeText } from './i18n.mjs'
import { setChatEventHost } from './chat.mjs'
import { applyFoldoutFolds, resetFoldoutFolds, FOLDED_CLASS } from './foldouts.mjs'
import { sanitizeElementHtml, mountElements, setElementEventSink, setElementModuleBase } from './elements.mjs'
import { installCookieConsent, installContextMenus, installCustomComponents, drawBpmn, installBpmn, installChatComponents, decorateFactActions, installFactActions, setFactActionSink } from './displayDom.mjs'
import { registerCustomComponent, fieldWidgetOf } from './reduceContexts.mjs'
import { defineMarkupField, defineRichTextField, installRichText } from './richtext.mjs'

// in the bridge everything shares one scope: keys.mjs uses actionPanels.mjs's shortcutMatches
// without importing it. In Node, separate modules — it is given through the global, as the bridge would see it.
globalThis.shortcutMatches = shortcutMatches

let passed = 0
const tests = []
const test = (name, fn) => tests.push({ name, fn })
const sinkLog = () => { const calls = []; const fn = (...a) => calls.push(a); fn.calls = calls; return fn }

// ── teclado ──────────────────────────────────────────────────────────────────────────────────
test('keys: un atajo @Action(ctrl+s) de la pantalla lanza la acción; una tecla suelta no', () => {
  const { doc, el, fire } = makeDom()
  const field = el('input')
  doc.body.appendChild(field)
  installKeys(doc)
  const sink = sinkLog()
  setKeysActionSink(sink)
  setShortcutContext({ tree: { actions: [{ id: 'save', shortcut: 'ctrl+s' }, { id: 'typed', shortcut: 's' }, { id: 'find', shortcut: 'f2' }] } })
  const ev = fire(field, 'keydown', { key: 's', ctrlKey: true })
  assert.deepEqual(sink.calls, [['save', {}, {}]])
  assert.ok(ev.defaultPrevented, 'el navegador no guarda la página')
  fire(field, 'keydown', { key: 's' })
  assert.equal(sink.calls.length, 1, 'una tecla suelta es del campo donde se escribe')
  fire(field, 'keydown', { key: 'F2' })
  assert.deepEqual(sink.calls[1], ['find', {}, {}], 'una tecla de función sola sí es atajo')
  // layout-independent: Alt changes e.key on a Mac, the physical code does not
  setShortcutContext({ tree: { actions: [{ id: 'open', shortcut: 'alt+o' }] } })
  fire(field, 'keydown', { key: 'ø', code: 'KeyO', altKey: true })
  assert.deepEqual(sink.calls[2], ['open', {}, {}])
})

test('keys: @Tab(shortcut) selecciona la pestaña visible; una oculta no se pulsa', () => {
  const { doc, el, fire } = makeDom()
  const clicked = []
  const tab1 = el('li', { 'data-shortcut': 'alt+1', text: 'General' })
  const tab2 = el('li', { 'data-shortcut': 'alt+2', text: 'Hidden', box: null })
  tab1.addEventListener('click', () => clicked.push('general'))
  tab2.addEventListener('click', () => clicked.push('hidden'))
  doc.body.appendChild(el('oj-tab-bar', {}, tab1, tab2))
  installKeys(doc)
  setShortcutContext(null)
  fire(doc.body, 'keydown', { key: '1', code: 'Digit1', altKey: true })
  fire(doc.body, 'keydown', { key: '2', code: 'Digit2', altKey: true })
  assert.deepEqual(clicked, ['general'])
})

test('keys: con accessKeys, mantener Alt enseña letras; Alt+letra pulsa el botón; soltar Alt las quita', async () => {
  const { doc, el, fire } = makeDom()
  const pressed = []
  const save = el('oj-button', { text: 'Save draft' }, el('button'))
  const reports = el('oj-button', { text: 'Reports' })
  const disabled = el('oj-button', { text: 'Delete', disabled: true })
  const declared = el('oj-button', { text: 'Print', 'data-shortcut': 'ctrl+p' })
  save.querySelector('button').addEventListener('click', () => pressed.push('save'))
  reports.addEventListener('click', () => pressed.push('reports'))
  disabled.addEventListener('click', () => pressed.push('delete'))
  ;[save, reports, disabled, declared].forEach((b) => doc.body.appendChild(b))
  setShortcutContext({ tree: { actions: [{ id: 'x', shortcut: 'alt+s' }] } }) // alt+s reservada
  setAccessKeysEnabled(true)
  installKeys(doc)
  fire(doc.body, 'keydown', { key: 'Alt', altKey: true })
  await sleep(300)
  const badges = doc.querySelectorAll('.mateu-access-key').map((b) => b.textContent)
  assert.deepEqual(badges, ['D', 'R', 'Ctrl+P'], 'iniciales, saltando la reservada; el declarado enseña su atajo; el deshabilitado no')
  assert.equal(doc.querySelector('.mateu-access-keys').getAttribute('aria-hidden'), 'true')
  fire(doc.body, 'keyup', { key: 'Alt' })
  assert.equal(doc.querySelector('.mateu-access-keys'), null)
  // without holding: Alt+R computes the letters and presses directly
  fire(doc.body, 'keydown', { key: '®', code: 'KeyR', altKey: true })
  fire(doc.body, 'keydown', { key: '∂', code: 'KeyD', altKey: true })
  assert.deepEqual(pressed, ['reports', 'save'], 'el oj-button con un <button> dentro se pulsa por dentro')
  fire(doc.body, 'keydown', { key: 'z', code: 'KeyZ', altKey: true })
  assert.deepEqual(pressed, ['reports', 'save'], 'una letra sin dueño no hace nada')
  setAccessKeysEnabled(false)
  setShortcutContext(null)
})

// ── action panel ────────────────────────────────────────────────────────────────────────────
test('action panel: el disparador (o su atajo) abre el diálogo; «mostrar más» y «ocultar vacías» viven en el DOM', () => {
  const { doc, el, fire } = makeDom()
  const dialog = el('oj-dialog', { id: 'ap1' })
  let open = false
  Object.assign(dialog, { open: () => { open = true }, close: () => { open = false }, isOpen: () => open })
  const more = el('oj-button', { 'data-ap-more': true }, el('span', { text: 'Show more' }))
  const column = el('div', { class: 'mateu-ap-column' }, more)
  const item = el('oj-button', { class: 'mateu-ap-item' }, el('span', { text: 'Check in' }))
  const sw = el('oj-switch', { 'data-ap-hide': true })
  dialog.appendChild(column); dialog.appendChild(item); dialog.appendChild(sw)
  const trigger = el('oj-button', { 'data-ap-open': 'ap1', 'data-ap-shortcut': 'ctrl+i' }, el('span', { text: 'I want to…' }))
  doc.body.appendChild(trigger); doc.body.appendChild(dialog)
  installActionPanels(doc)
  fire(trigger.querySelector('span'), 'click')
  assert.equal(open, true)
  fire(more.querySelector('span'), 'click')
  assert.ok(column.classList.contains('mateu-ap-showall'))
  fire(sw, 'valueChanged', { bubbles: false, detail: { value: true } })
  assert.ok(dialog.classList.contains('mateu-ap-hide-unpopulated'), 'valueChanged no burbujea: la captura lo ve')
  fire(sw, 'valueChanged', { bubbles: false, detail: { value: false } })
  assert.ok(!dialog.classList.contains('mateu-ap-hide-unpopulated'))
  fire(item.querySelector('span'), 'ojAction')
  assert.equal(open, false, 'elegir una acción cierra la capa')
  const ev = fire(doc.body, 'keydown', { key: 'i', code: 'KeyI', ctrlKey: true })
  assert.equal(open, true)
  assert.ok(ev.defaultPrevented)
})

// ── arrastrar ────────────────────────────────────────────────────────────────────────────────
test('dnd: soltar filas en un DropZone que acepta su tipo lanza su acción con _draggedIds y _dragType', async () => {
  const { doc, el, fire } = makeDom()
  const zone = el('div', { class: 'mateu-drop-zone', 'data-drop-accept': 'application/x-mateu-charge',
    'data-drop-action': 'moveCharges', 'data-drop-params': '{"window":2}' }, el('span', { text: 'Window 2' }))
  const other = el('div', { class: 'mateu-drop-zone', 'data-drop-accept': 'application/x-mateu-guest', 'data-drop-action': 'x' })
  doc.body.appendChild(zone); doc.body.appendChild(other)
  installDragAndDrop(doc)
  const sink = sinkLog()
  setDropSink(sink)
  const dt = dataTransfer({ 'application/x-mateu-charge': '[{"id":"C1"},{"data":{"id":"C2"}}]' })
  fire(doc.body, 'dragstart', { dataTransfer: dt })
  await sleep(5)
  assert.ok(zone.classList.contains('mateu-drop-ready'), 'el destino que acepta el tipo se ofrece')
  assert.ok(!other.classList.contains('mateu-drop-ready'))
  const over = fire(zone.querySelector('span'), 'dragover', { dataTransfer: dt })
  assert.ok(over.defaultPrevented && zone.classList.contains('mateu-drop-over'))
  assert.equal(fire(other, 'dragover', { dataTransfer: dt }).defaultPrevented, false, 'otro tipo: no se puede soltar')
  fire(zone, 'drop', { dataTransfer: dt })
  assert.deepEqual(sink.calls, [['moveCharges', { window: 2, _draggedIds: ['C1', 'C2'], _dragType: 'charge' }, {}]])
  assert.ok(!zone.classList.contains('mateu-drop-over') && !zone.classList.contains('mateu-drop-ready'))
  zone.setAttribute('data-drop-params', '{roto')
  fire(zone, 'drop', { dataTransfer: dt })
  assert.deepEqual(sink.calls[1][1], { _draggedIds: ['C1', 'C2'], _dragType: 'charge' }, 'parámetros ilegibles: se suelta igual')
  fire(zone, 'drop', { dataTransfer: dataTransfer({ 'application/x-mateu-charge': '[]' }) })
  assert.equal(sink.calls.length, 2, 'nada arrastrado: nada que lanzar')
})

test('dnd: los tiles reordenables se mueven arrastrando y con Alt+←/→, y el orden se guarda', async () => {
  const { doc, el, fire } = makeDom()
  const mem = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) } })
  const tiles = ['a', 'b', 'c'].map((k) => el('div', { 'data-mateu-tile': k, 'data-mateu-tile-scope': 'dash' }, el('span', { text: k })))
  tiles.forEach((t) => doc.body.appendChild(t))
  installTileReorder(doc)
  const sink = sinkLog()
  setTileReorderSink(sink)
  fire(tiles[0].querySelector('span'), 'mousedown')
  assert.equal(tiles[0].draggable, true)
  const dt = dataTransfer({})
  fire(tiles[0], 'dragstart', { dataTransfer: dt })
  assert.equal(dt.getData('application/x-mateu-tile'), 'dash\na')
  assert.ok(fire(tiles[2], 'dragover', { dataTransfer: dt }).defaultPrevented)
  fire(tiles[2], 'drop', { dataTransfer: dt })
  assert.deepEqual(readTileOrder('dash'), ['b', 'c', 'a'])
  assert.deepEqual(sink.calls, [['dash']])
  fire(doc.body, 'dragend')
  assert.equal(doc.querySelectorAll('.mateu-tile-dragging, .mateu-tile-over').length, 0)
  // keyboard: the focused tile moves one position (over what is PAINTED: a, b, c)
  fire(tiles[1], 'keydown', { key: 'ArrowLeft', altKey: true })
  assert.deepEqual(readTileOrder('dash'), ['b', 'a', 'c'])
  assert.deepEqual(paintedTileOrder(doc, 'dash'), ['a', 'b', 'c'])
  await sleep(5)
})

// ── matriz ───────────────────────────────────────────────────────────────────────────────────
test('matrix: plegar/desplegar una sección cambia el KeySet y lo recuerda; editar lanza sólo si cambió; un enlace lanza cellActionId', () => {
  const { doc, el, fire } = makeDom()
  const grid = el('oj-data-grid', { class: 'mateu-matrix', 'data-matrix-id': 'avail', 'data-edit-action': 'editCell', 'data-cell-action': 'openCell' })
  const keySet = (keys) => ({ keys, add: (k) => keySet([...keys, ...k]), delete: (k) => keySet(keys.filter((x) => !k.includes(x))) })
  let expandedNow = null
  grid.data = { __mateu: { expanded: keySet([]), flat: { setExpanded: (ks) => { expandedNow = ks.keys } } } }
  const cell = el('div', { class: 'oj-datagrid-cell' })
  const input = el('oj-input-text', { 'data-mx-row': 'rooms', 'data-mx-col': '2026-10-02', 'data-mx-value': '12' })
  const link = el('a', { 'data-mx-link': 'true', 'data-mx-row': 'sold', 'data-mx-col': '2026-10-03', text: '7' })
  grid.appendChild(cell); grid.appendChild(input); grid.appendChild(link)
  doc.body.appendChild(grid)
  installMatrixGrids(doc)
  const sink = sinkLog()
  setMatrixActionSink(sink)
  const rowDetail = (key) => ({ item: { metadata: { rowItem: { metadata: { key } } } } })
  fire(cell, 'ojCollapseRequest', { detail: rowDetail('§rooms') })
  assert.deepEqual(expandedNow, [])
  assert.equal(panelExpanded(matrixSectionKey('avail', 'rooms'), true), false, 'sobrevive a una re-proyección')
  fire(cell, 'ojExpandRequest', { detail: rowDetail('§rooms') })
  assert.deepEqual(expandedNow, ['§rooms'])
  assert.equal(panelExpanded(matrixSectionKey('avail', 'rooms'), false), true)
  input.value = '12'
  fire(cell, 'ojBeforeEditEnd', { detail: {} })
  assert.equal(sink.calls.length, 0, 'un Enter sin tocar nada no es una edición')
  input.value = '14'
  fire(cell, 'ojBeforeEditEnd', { detail: { cancelEdit: true } })
  assert.equal(sink.calls.length, 0, 'Escape cancela')
  fire(cell, 'ojBeforeEditEnd', { detail: {} })
  assert.deepEqual(sink.calls[0], ['editCell', { _rowId: 'rooms', _columnId: '2026-10-02', _value: '14' }, {}])
  fire(link, 'click')
  assert.deepEqual(sink.calls[1], ['openCell', { _rowId: 'sold', _columnId: '2026-10-03', _value: '7' }, {}])
})

// ── tape chart ───────────────────────────────────────────────────────────────────────────────
test('planning: arrastrar por tiempo VACÍO de una fila lanza el rango (recurso + días); una tarea o el botón derecho no', () => {
  const { doc, win, el, fire } = makeDom()
  globalThis.window = win
  const gantt = el('oj-gantt', { class: 'mateu-planning', 'data-range-action': 'newBooking',
    'data-row-labels': 'R101\u001fR102', 'data-row-ids': 'r1\u001fr2', 'data-start': '2026-10-01', 'data-end': '2026-10-08' })
  for (let i = 0; i < 7; i++) gantt.appendChild(el('text', { text: '10/0' + (i + 1), box: { left: 100 + i * 40, top: 0, width: 20, height: 14 } }))
  gantt.appendChild(el('text', { text: 'R101', box: { left: 0, top: 50, width: 40, height: 20 } }))
  gantt.appendChild(el('text', { text: 'R102', box: { left: 0, top: 80, width: 40, height: 20 } }))
  const rowBg = el('rect', { class: 'oj-gantt-row', box: { left: 100, top: 80, width: 280, height: 20 } })
  const task = el('rect', { class: 'oj-gantt-task', box: { left: 100, top: 50, width: 80, height: 20 } })
  gantt.appendChild(rowBg); gantt.appendChild(task)
  doc.body.appendChild(gantt)
  installPlanningRange(doc)
  const sink = sinkLog()
  setPlanningRangeSink(sink)
  fire(rowBg, 'pointerdown', { button: 0, clientX: 150, clientY: 88 })
  fire(doc.body, 'pointermove', { clientX: 232 })
  const band = doc.getElementById('mateuPlanningRangeBand')
  assert.equal(band.style.display, 'block', 'mientras se arrastra, la banda')
  assert.equal(band.style.width, '120px', 'tres días de 40px')
  fire(doc.body, 'pointerup')
  assert.equal(band.style.display, 'none')
  assert.deepEqual(sink.calls, [['newBooking', { _resourceId: 'r2', _start: '2026-10-02', _end: '2026-10-04' }, {}]])
  // backwards: the range is sorted
  fire(rowBg, 'pointerdown', { button: 0, clientX: 230, clientY: 88 })
  fire(doc.body, 'pointermove', { clientX: 110 })
  fire(doc.body, 'pointerup')
  assert.deepEqual(sink.calls[1][1], { _resourceId: 'r2', _start: '2026-10-01', _end: '2026-10-04' })
  fire(task, 'pointerdown', { button: 0, clientX: 150, clientY: 60 })
  fire(doc.body, 'pointerup')
  fire(rowBg, 'pointerdown', { button: 2, clientX: 150, clientY: 88 })
  fire(doc.body, 'pointerup')
  assert.equal(sink.calls.length, 2, 'una tarea se mueve como siempre; el botón derecho no selecciona')
  delete globalThis.window
})

// ── ventanas flotantes ───────────────────────────────────────────────────────────────────────
test('hover: pasar (o enfocar) abre la ventana con las líneas; salir la cierra; Escape también; el clic alterna', async () => {
  const { doc, el, fire } = makeDom()
  const cell = el('span', { 'data-mateu-hover': 'Rate: 120\n\nTaxes: 10' }, el('b', { text: '130' }))
  const pop = el('oj-button', { 'data-mateu-pop-click': 'x', 'data-mateu-pop-html': '<p>Hi<script>alert(1)</script></p>' })
  doc.body.appendChild(cell); doc.body.appendChild(pop)
  installHover(doc)
  const popup = doc.getElementById('mateuHoverPopup')
  assert.ok(popup, 'se crea ya, para que JET la actualice antes del primer hover')
  assert.equal(popup.querySelector('.mateu-hover-content').getAttribute('role'), 'tooltip')
  const opened = []
  let isOpen = false
  Object.assign(popup, { open: (sel) => { opened.push(sel); isOpen = true }, close: () => { isOpen = false }, isOpen: () => isOpen })
  fire(cell.querySelector('b'), 'mouseover')
  await sleep(330)
  assert.deepEqual(popup.querySelectorAll('.mateu-hover-content div').map((d) => d.textContent), ['Rate: 120', 'Taxes: 10'])
  assert.equal(opened[0], '#' + cell.id)
  assert.equal(cell.getAttribute('aria-describedby'), 'mateuHoverPopup')
  fire(cell, 'mouseout', { relatedTarget: doc.body })
  await sleep(230)
  assert.equal(isOpen, false)
  assert.equal(cell.hasAttribute('aria-describedby'), false)
  fire(cell, 'focusin')
  await sleep(330)
  assert.equal(isOpen, true, 'con el teclado también')
  fire(doc.body, 'keydown', { key: 'Escape' })
  assert.equal(isOpen, false)
  fire(pop, 'click')
  assert.equal(isOpen, true)
  assert.equal(popup.querySelector('.mateu-hover-content').innerHTML, '<p>Hi</p>', 'el HTML de un Popover, saneado')
  fire(pop, 'click')
  assert.equal(isOpen, false, 'el segundo clic cierra')
  const enter = fire(pop, 'keydown', { key: 'Enter' })
  assert.ok(enter.defaultPrevented && isOpen, 'Enter sobre el disparador es un clic')
})

// ── mapa ─────────────────────────────────────────────────────────────────────────────────────
function fakeLeaflet() {
  const log = []
  const layers = []
  const layer = (kind, args) => {
    const handlers = {}
    const node = { setAttribute: (k, v) => log.push(['attr', k, v]), style: {}, keys: {}, addEventListener(ev, fn) { this.keys[ev] = fn } }
    // like Leaflet: the element exists only once the layer is added to a map WITH a view (the map
    // adds layers whenReady) — getElement() is null until the `add` event the test fires
    let added = false
    const l = { kind, args, handlers, addTo: () => l, bindTooltip: (t) => { log.push(['tooltip', t]); return l },
      on: (ev, fn) => { handlers[ev] = fn; return l }, getElement: () => (added ? node : null), node,
      add: () => { added = true; if (handlers.add) handlers.add() } }
    log.push([kind, ...args])
    layers.push(l)
    return l
  }
  const map = { remove: () => log.push(['remove']), fitBounds: (b) => log.push(['fit', b]), setView: (c, z) => log.push(['view', c, z]), invalidateSize: () => {} }
  const L = { map: () => map, tileLayer: (...a) => layer('tiles', a), circleMarker: (...a) => layer('marker', a) }
  L.markers = () => log.filter((x) => x[0] === 'marker')
  return { L, log, layers }
}
class FakeObserver { constructor(fn) { this.fn = fn; FakeObserver.last = this } observe() {} }

test('map: un marcador pintado lanza markerActionId con _markerId; varios se encuadran; el atributo nuevo repinta', async () => {
  const { doc, el } = makeDom()
  const { L, log, layers } = fakeLeaflet()
  globalThis.window = { L }
  globalThis.MutationObserver = FakeObserver
  const spec = { markers: [
    { id: 'h1', latitude: 40.4, longitude: -3.7, label: 'Madrid', description: '120 rooms' },
    { id: 'h2', latitude: 41.4, longitude: 2.2, label: 'Barcelona', color: '#00f' }], markerActionId: 'openHotel' }
  const box = el('div', { 'data-map-spec': JSON.stringify(spec) })
  doc.body.appendChild(box)
  installMaps(doc)
  const sink = sinkLog()
  setMapActionSink(sink)
  await sleep(5)
  const markers = log.filter((x) => x[0] === 'marker')
  assert.equal(markers.length, 2)
  assert.equal(markers[1][2].fillColor, '#00f')
  assert.ok(!log.some((x) => x[0] === 'attr'), 'nothing to decorate before the layers are added (no element yet)')
  for (const l of layers) if (l.kind === 'marker') l.add()
  // a marker that runs something is a keyboard-reachable button (Leaflet draws a bare SVG path)
  assert.ok(log.some((x) => x[0] === 'attr' && x[1] === 'role' && x[2] === 'button'), 'role=button on the marker')
  assert.ok(log.some((x) => x[0] === 'attr' && x[1] === 'tabindex' && x[2] === '0'), 'a tab stop on the marker')
  // …and Enter on it runs the action like a click (the shared spec: «a keyboard-reachable button»)
  const pin = layers.find((l) => l.kind === 'marker')
  const enter = new FakeEvent('keydown', { key: 'Enter' })
  pin.node.keys.keydown(enter)
  assert.deepEqual(sink.calls[0], ['openHotel', { _markerId: 'h1' }, {}])
  assert.ok(enter.defaultPrevented)
  assert.deepEqual(log.find((x) => x[0] === 'fit')[1], [[40.4, -3.7], [41.4, 2.2]])
  assert.ok(log.some((x) => x[0] === 'attr' && x[1] === 'aria-label' && x[2] === 'Madrid · 120 rooms'), 'el marcador tiene nombre accesible')
  assert.ok(log.some((x) => x[0] === 'tiles' && /openstreetmap/.test(x[1])))
  // re-draw with ONE marker: centred at zoom 15
  box.setAttribute('data-map-spec', JSON.stringify({ markers: [spec.markers[0]], markerActionId: 'openHotel' }))
  FakeObserver.last.fn([{ type: 'attributes', target: box }])
  await sleep(5)
  assert.deepEqual(log.filter((x) => x[0] === 'view').pop(), ['view', [40.4, -3.7], 15])
  assert.ok(log.some((x) => x[0] === 'remove'), 'el mapa anterior se desmonta')
  delete globalThis.window
  delete globalThis.MutationObserver
})

test('map: el clic en un marcador sale por el sumidero; si Leaflet no carga, se dice', async () => {
  const { doc, el } = makeDom()
  const handlers = []
  const L = {
    map: () => ({ setView() {}, fitBounds() {}, invalidateSize() {}, remove() {} }),
    tileLayer: () => ({ addTo() {} }),
    circleMarker: () => { const h = {}; handlers.push(h); const l = { addTo: () => l, bindTooltip: () => l, getElement: () => ({ setAttribute() {}, style: {} }), on: (ev, fn) => { h[ev] = fn; return l } }; return l },
  }
  globalThis.window = { L }
  globalThis.MutationObserver = FakeObserver
  doc.body.appendChild(el('div', { 'data-map-spec': JSON.stringify({ markers: [{ id: 'h9', latitude: 1, longitude: 2 }], markerActionId: 'openHotel' }) }))
  installMaps(doc)
  const sink = sinkLog()
  setMapActionSink(sink)
  await sleep(5)
  handlers[0].click()
  assert.deepEqual(sink.calls, [['openHotel', { _markerId: 'h9' }, {}]])
  // without Leaflet (CDN down): it is requested via <script> with its CSS and, if that fails, the map says so
  const offline = makeDom()
  globalThis.window = {}
  const failing = offline.el('div', { 'data-map-spec': '{"markers":[]}' })
  offline.doc.body.appendChild(failing)
  installMaps(offline.doc)
  assert.ok(offline.doc.querySelector('link[data-mateu-leaflet]'), 'la hoja de estilos del CDN')
  const script = offline.doc.head.querySelectorAll('script')[0]
  assert.match(script.src, /cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet/)
  script.onerror(new Error('offline'))
  await sleep(5)
  assert.equal(failing.textContent, chromeText('mapUnavailable'))
  delete globalThis.window
  delete globalThis.MutationObserver
})

// ── accesibilidad ────────────────────────────────────────────────────────────────────────────
const withDocument = (doc, fn) => async () => {
  const before = globalThis.document
  globalThis.document = doc
  try { await fn() } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before }
}

{
  const { doc, el } = makeDom()
  test('a11y: dos regiones vivas desde el arranque; anunciar lo mismo dos veces se vuelve a decir', withDocument(doc, async () => {
    installAnnouncer()
    const polite = doc.querySelector('[data-mateu-live-region="polite"]')
    const assertive = doc.querySelector('[data-mateu-live-region="assertive"]')
    assert.equal(polite.getAttribute('role'), 'status')
    assert.equal(assertive.getAttribute('role'), 'alert')
    assert.match(polite.style.cssText, /clip/, 'oculta por clip, no por display:none')
    assert.doesNotMatch(polite.style.cssText, /display:\s*none/)
    announce('Saved')
    assert.equal(polite.textContent, 'Saved')
    announce('Saved')
    assert.equal(polite.textContent, '', 'se limpia…')
    await sleep(80)
    assert.equal(polite.textContent, 'Saved', '…y se repone, para que se anuncie otra vez')
    announce('Could not save', { politeness: 'assertive' })
    assert.equal(assertive.textContent, 'Could not save')
    announce('   ')
    assert.equal(polite.textContent, 'Saved', 'un mensaje vacío no pisa nada')
    void el
  }))
}

{
  const { doc, el, fire } = makeDom()
  test('a11y: el enlace de salto es el PRIMER elemento y lleva el foco al primer encabezado CON texto', withDocument(doc, () => {
    doc.body.appendChild(el('nav', {}, el('a', { href: '/x', text: 'Menu' })))
    const content = el('div', { id: 'vbRouterContent' }, el('h1', {}), el('h2', { text: 'Bookings' }))
    doc.body.appendChild(content)
    mountSkipLink('Skip to content')
    mountSkipLink('again')
    const links = doc.querySelectorAll('.mateu-skip-link')
    assert.equal(links.length, 1, 'una vez')
    assert.equal(doc.body.firstChild, links[0])
    assert.equal(links[0].tagName, 'button')
    fire(links[0], 'click')
    assert.equal(doc.activeElement.textContent, 'Bookings', 'el h1 vacío (sin título aún) se salta')
    assert.equal(doc.activeElement.getAttribute('tabindex'), '-1', 'enfocable por programa sin parada de tabulación')
  }))
}

{
  const { doc, el } = makeDom()
  test('a11y: si el encabezado no puede recibir foco, el contenedor; la 1ª carga no mueve el foco; el chat lo conserva', withDocument(doc, () => {
    const h = el('h2', { text: 'Hidden title', box: null })
    const content = el('div', { id: 'vbRouterContent' }, h)
    doc.body.appendChild(content)
    assert.equal(focusContent(), true)
    assert.equal(doc.activeElement, content)
    doc.activeElement = doc.body
    resetNavigationState()
    announceNavigation('Home')
    assert.equal(doc.activeElement, doc.body, 'primera carga: el foco queda arriba, el enlace de salto alcanzable')
    announceNavigation('Bookings')
    assert.equal(doc.activeElement, content, 'una navegación de verdad lleva el foco al contenido')
    const chat = el('div', { id: 'mateuChatPanel' }, el('textarea'))
    doc.body.appendChild(chat)
    doc.activeElement = chat.querySelector('textarea')
    assert.equal(focusIsInChat(doc.activeElement), true)
    announceNavigation('Opened by the assistant')
    assert.equal(doc.activeElement, chat.querySelector('textarea'), 'quien habla con el asistente sigue en el chat')
    content.remove()
    assert.equal(focusContent(), false, 'sin contenido, nada')
  }))
}

{
  const { doc, el, fire } = makeDom()
  test('a11y: el control pulsado queda ocupado mientras su petición vuela, sólo si sale justo detrás del clic', withDocument(doc, () => {
    const save = el('oj-button', {}, el('span', { text: 'Save' }))
    doc.body.appendChild(save)
    trackPressedControls()
    fire(save.querySelector('span'), 'click')
    markPressedControlBusy()
    assert.equal(save.getAttribute('aria-busy'), 'true')
    assert.ok(save.hasAttribute('data-mateu-pending'))
    clearPressedControlBusy()
    assert.equal(save.hasAttribute('aria-busy'), false)
    // outside the grace window (an OnLoad, an autosave): not marked
    const realNow = Date.now
    fire(save.querySelector('span'), 'click')
    Date.now = () => realNow() + 1000
    try { markPressedControlBusy() } finally { Date.now = realNow }
    assert.equal(save.hasAttribute('aria-busy'), false)
    // a click on something that is not a button marks nothing
    fire(doc.body, 'click')
    markPressedControlBusy()
    assert.equal(doc.querySelectorAll('[aria-busy]').length, 0)
  }))
}

{
  const { doc, el } = makeDom()
  test('a11y: los obligatorios vacíos se marcan (JET por su validador, el resto por clase) y el foco va al primero', withDocument(doc, async () => {
    const jet = el('oj-input-text', { 'data-field-id': 'name' }, el('input'))
    jet.validate = async () => 'invalid'
    const lazy = el('oj-input-text', { 'data-field-id': 'email' })
    lazy.validate = async () => 'valid' // its value has not reached the widget yet
    lazy.messagesCustom = []
    const chips = el('div', { 'data-field-id': 'tags' })
    const inDialog = el('oj-dialog', {}, el('oj-input-text', { 'data-field-id': 'name' }))
    ;[jet, lazy, chips, inDialog].forEach((x) => doc.body.appendChild(x))
    assert.equal(await showFieldErrors(['name', 'email', 'tags'], 'Required'), 3, 'el del diálogo no cuenta')
    assert.equal(doc.activeElement, jet.querySelector('input'))
    // Redwood draws the DETAIL under the field: a summary alone showed only the error icon
    assert.deepEqual(lazy.messagesCustom, [{ severity: 'error', summary: 'Required', detail: 'Required' }])
    assert.equal(chips.getAttribute('data-error'), 'Required')
    assert.ok(chips.classList.contains('mateu-field-error'))
    clearFieldError(lazy)
    assert.deepEqual(lazy.messagesCustom, [])
    clearFieldErrorMarks('tags')
    assert.ok(!chips.classList.contains('mateu-field-error') && !chips.hasAttribute('data-error'))
    assert.equal(await showFieldErrors([], 'x'), 0)
  }))
}

{
  const { doc, el } = makeDom()
  test('a11y: the open drawer\'s fields are marked — a failed bound with its own message, not the page\'s twin', withDocument(doc, async () => {
    const onPage = el('oj-input-number', { 'data-field-id': 'beds' }, el('input'))
    onPage.validate = async () => 'valid'
    onPage.messagesCustom = []
    const inDrawer = el('oj-input-number', { 'data-field-id': 'beds' }, el('input'))
    inDrawer.validate = async () => 'valid' // 12 is a number: its own validator has nothing to say
    inDrawer.messagesCustom = []
    const name = el('oj-input-text', { 'data-field-id': 'name' }, el('input'))
    name.validate = async () => 'invalid'
    const drawer = el('oj-drawer-popup', {}, el('div', {}, name, inDrawer))
    ;[onPage, drawer].forEach((x) => doc.body.appendChild(x))
    assert.equal(await showFieldErrors(['name', 'beds'], null,
      { inOverlay: true, messages: { beds: 'Must be at most 9' } }), 2)
    assert.deepEqual(inDrawer.messagesCustom, [{ severity: 'error', summary: 'Must be at most 9', detail: 'Must be at most 9' }])
    assert.deepEqual(onPage.messagesCustom, [], 'the page\'s field is not the drawer\'s')
    assert.equal(doc.activeElement, name.querySelector('input'))
  }))
}

{
  const { doc, el, fire } = makeDom()
  test('a11y: el guided process no avanza por su cuenta (lo decide el servidor); el reintento se ofrece una vez', withDocument(doc, () => {
    const wizard = el('oj-sp-guided-process', { id: 'mateuWizardEl' })
    const other = el('oj-sp-guided-process', { id: 'someoneElse' })
    doc.body.appendChild(wizard); doc.body.appendChild(other)
    guardGuidedProcess()
    assert.ok(fire(wizard, 'spBeforeNext', { bubbles: false }).defaultPrevented)
    assert.ok(fire(wizard, 'spBeforeStepNavigate', { bubbles: false }).defaultPrevented)
    assert.equal(fire(other, 'spBeforeNext', { bubbles: false }).defaultPrevented, false)
    setLastRetry({ kind: 'navigate', route: 'bookings' })
    assert.equal(hasLastRetry(), true)
    assert.deepEqual(takeLastRetry(), { kind: 'navigate', route: 'bookings' })
    assert.equal(takeLastRetry(), null)
    setLastRetry({ nope: 1 })
    assert.equal(hasLastRetry(), false, 'un descriptor sin kind no se guarda')
  }))
}

// ── client rules on the painted fields ───────────────────────────────────────────────────────
{
  const { doc, el, fire } = makeDom()
  test('rules: ocultar/deshabilitar/copiar un valor según otro campo, por superficie, sin ida y vuelta', withDocument(doc, () => {
    const kind = el('oj-select-single', { 'data-field-id': 'kind' })
    const vat = el('oj-input-text', { 'data-field-id': 'vat' })
    const vatItem = el('oj-label-value', {}, vat)
    const notes = el('oj-input-text', { 'data-field-id': 'notes' })
    const copy = el('oj-input-text', { 'data-field-id': 'copy' })
    const quoted = el('oj-input-text', { 'data-field-id': 'a"b' })
    const drawerVat = el('oj-input-text', { 'data-field-id': 'vat' })
    doc.body.appendChild(el('oj-form-layout', {}, kind, vatItem, notes, copy, quoted))
    doc.body.appendChild(el('div', { id: 'mateuDrawerPanel' }, drawerVat))
    const changes = []
    copy.addEventListener('valueChanged', (e) => changes.push(e.detail))
    const sink = sinkLog()
    setRuleActionSink(sink)
    const ctx = { id: 'host', state: { kind: 'person', name: 'Ann' }, data: {}, tree: { rules: [
      { filter: "state.kind != 'company'", action: 'SetDataValue', fieldName: 'vat', fieldAttribute: 'hidden', value: true },
      { filter: "state.kind == 'company'", action: 'SetDataValue', fieldName: 'vat', fieldAttribute: 'hidden', value: false },
      { filter: 'state.name.length > 5', action: 'SetDataValue', fieldName: 'notes,a"b', fieldAttribute: 'disabled', value: true },
      { filter: '', action: 'SetStateValue', fieldName: 'copy', expression: '${state.name.toUpperCase()}' },
      { filter: "state.kind == 'company'", action: 'RunAction', actionId: 'loadCompany', result: 'Stop' },
      { filter: 'true', action: 'SetDataValue', fieldName: 'notes', fieldAttribute: 'required', value: true },
    ] } }
    setRulesContext(ctx, {})
    applyRulesNow(doc)
    assert.equal(vatItem.style.display, 'none', 'se oculta su oj-label-value, no la sección entera')
    assert.equal(drawerVat.style.display, undefined, 'el del drawer es de OTRA superficie')
    assert.equal(copy.value, 'ANN')
    assert.deepEqual(changes, [{ value: 'ANN', updatedFrom: 'internal' }], 'como si lo hubiese tecleado: entra en el borrador')
    assert.equal(notes.required, true)
    assert.equal(notes.disabled, undefined)
    installRules(doc)
    kind.value = 'company'
    fire(kind, 'valueChanged', { bubbles: false, detail: { value: 'company', updatedFrom: 'internal' } })
    assert.equal(vatItem.style.display, '')
    assert.deepEqual(sink.calls, [['loadCompany', {}, { surface: 'host' }]])
    assert.equal(notes.required, true, 'antes del Stop')
    fire(doc.querySelector('[data-field-id="kind"]'), 'valueChanged', { bubbles: false, detail: { value: 'x', updatedFrom: 'external' } })
    assert.equal(rulesDebug()[0].state.kind, 'company', 'un cambio EXTERNO (el propio render) no es del usuario')
    fire(kind, 'valueChanged', { bubbles: false, detail: { value: 'person', updatedFrom: 'internal' } })
    fire(el('oj-input-text', { 'data-field-id': 'name' }), 'valueChanged', { detail: { value: 'Annabel', updatedFrom: 'internal' } })
    void fire
    // long names → notes and the id with quotes, disabled (escaped attribute selector)
    setRulesContexts({ contexts: { __root__: { ...ctx, state: { kind: 'person', name: 'Annabel' } } }, stack: [] }, {})
    applyRulesNow(doc)
    assert.equal(notes.disabled, true)
    assert.equal(quoted.disabled, true, 'un id con comillas no rompe el selector')
    setRulesContext(null)
    assert.equal(applyRulesNow(doc), 0, 'sin reglas no se toca nada')
  }))
}

// ── calendario ───────────────────────────────────────────────────────────────────────────────
test('calendar: cambiar de vista es del DOM; un evento clicable o un día (clic o Enter) lanzan su acción', () => {
  const { doc, el, fire } = makeDom()
  const chip = el('div', { 'data-cal-event': 'e1', 'data-cal-title': 'Standup', 'data-cal-date': '2026-10-05', 'data-cal-clickable': 'true', 'data-cal-action': 'openCalendarEvent' })
  const dead = el('div', { 'data-cal-event': 'e2', 'data-cal-clickable': 'false' })
  const day = el('div', { 'data-cal-date': '2026-10-06' }, el('span', { text: '6' }))
  const switcher = el('oj-buttonset-one', { 'data-cal-switch': true })
  const cal = el('div', { class: 'mateu-cal', 'data-day-action': 'openCalendarDay', 'data-cal-shown': 'month' }, switcher, chip, dead, day)
  doc.body.appendChild(cal)
  installCalendars(doc)
  const sink = sinkLog()
  setCalendarActionSink(sink)
  fire(switcher, 'valueChanged', { bubbles: false, detail: { value: 'week' } })
  assert.equal(cal.getAttribute('data-cal-shown'), 'week')
  const chipClick = fire(chip, 'click')
  assert.deepEqual(sink.calls[0], ['openCalendarEvent', { _clickedEvent: { id: 'e1', title: 'Standup', date: '2026-10-05' } }, {}])
  // the chip is an <a href="#">: without this the browser went to /# and VB rebooted the app
  assert.ok(chipClick.defaultPrevented, 'the anchor does not navigate')
  fire(dead, 'click')
  assert.equal(sink.calls.length, 1, 'un evento no clicable no hace nada')
  const ev = fire(day.querySelector('span'), 'keydown', { key: 'Enter' })
  assert.deepEqual(sink.calls[1], ['openCalendarDay', { _date: '2026-10-06' }, {}])
  assert.ok(ev.defaultPrevented)
})

// ── @Toc: the sticky sections index ──────────────────────────────────────────────────────────
test('toc: a click on an entry scrolls to its section (no anchor navigation) and keeps it highlighted; Ctrl+Alt+N jumps; the spy follows the reading line', () => {
  const { doc, win, el, fire } = makeDom()
  const scrolls = []
  win.scrollBy = (o) => scrolls.push(o.top)
  const titles = ['Guests', 'Document', 'Contact', 'Notes']
  const sections = titles.map((t, i) => el('div', { 'data-mateu-section': t, box: { top: 100 + i * 500, height: 400 } }))
  const items = titles.map((t, i) => el('a', { href: '#', class: 'mateu-toc-item', 'data-toc-index': String(i), text: t }))
  const toc = el('aside', { class: 'mateu-toc' }, el('nav', {}, ...items))
  doc.body.appendChild(el('div', { class: 'mateu-has-toc' }, toc, ...sections))
  // an untitled marker (a frameless band) is not a section of the index
  doc.body.appendChild(el('div', { 'data-mateu-section': '' }))
  installToc(doc, win)
  installToc(doc, win) // once
  assert.deepEqual(tocSectionsOf(doc).map((s) => s.getAttribute('data-mateu-section')), titles)
  // click «Contact» (section 3, top 1100): scroll by its distance to the reading line (16px of air)
  const click = fire(items[2].querySelector ? items[2] : items[2], 'click')
  assert.ok(click.defaultPrevented, 'the anchor does not navigate (VB would reboot on /#)')
  assert.deepEqual(scrolls, [1100 - 16])
  assert.ok(items[2].classList.contains('is-active'))
  assert.equal(items[2].getAttribute('aria-current'), 'true')
  assert.ok(!items[0].classList.contains('is-active'))
  // locked on the click: a scroll event that lands elsewhere does not move the highlight…
  sections.forEach((s, i) => s.box({ top: -3000 + i * 500, height: 400 }))
  fire(win, 'scroll', { bubbles: false })
  assert.ok(items[2].classList.contains('is-active'), 'still the clicked one')
  // …until the user scrolls by hand (wheel): then the spy picks the section at the reading line
  fire(win, 'wheel', { bubbles: false })
  fire(win, 'scroll', { bubbles: false })
  assert.ok(items[3].classList.contains('is-active'), 'the last section whose top is above the line')
  assert.equal(items[3].getAttribute('aria-current'), 'true')
  assert.equal(items[2].getAttribute('aria-current'), null)
  // Ctrl+Alt+2 (physical key, layout-independent): «Document»
  const key = fire(doc.body, 'keydown', { key: '@', code: 'Digit2', ctrlKey: true, altKey: true })
  assert.ok(key.defaultPrevented)
  assert.ok(items[1].classList.contains('is-active'))
  assert.equal(scrolls.length, 2)
  // a digit without the modifiers, or one past the entries: nothing
  fire(doc.body, 'keydown', { key: '3', code: 'Digit3' })
  fire(doc.body, 'keydown', { key: '9', code: 'Digit9', ctrlKey: true, altKey: true })
  assert.equal(scrolls.length, 2)
  // the reading line sits under a pinned record header
  doc.body.appendChild(el('div', { class: 'mateu-sticky-header', box: { top: 0, height: 64 } }))
  sections.forEach((s, i) => s.box({ top: 70 + i * 500, height: 400 }))
  fire(win, 'wheel', { bubbles: false })
  fire(win, 'scroll', { bubbles: false })
  assert.ok(items[0].classList.contains('is-active'), 'Guests (70) is just under the 64px header + air: in view')
  assert.equal(tocActiveIndex([0, 500, 1000], 520), 1)
  assert.equal(tocActiveIndex([300, 800], 16), 0, 'nothing above the line: the first')
})

// ── capture fields ──────────────────────────────────────────────────────────────────────────
test('capture: firmar y Aceptar emite el PNG; sin tinta no; Quitar vacía; sólo lectura enseña un guion; un src peligroso no se carga', () => {
  const { doc, win, el, fire } = makeDom()
  defineCaptureField(win)
  defineCaptureField(win) // once
  const field = doc.createElement('mateu-capture-field')
  field.setAttribute('mode', 'signature')
  const values = []
  field.addEventListener('valueChanged', (e) => values.push(e.detail))
  doc.body.appendChild(field)
  const buttons = () => field.querySelectorAll('oj-button')
  const press = (label) => fire(buttons().find((b) => b.textContent === label), 'ojAction')
  assert.ok(field.querySelector('canvas.mateu-capture-pad'), 'sin valor: el pad')
  assert.deepEqual(buttons().map((b) => b.textContent), ['Accept', 'Clear'])
  press('Accept')
  assert.equal(values.length, 0, 'sin tinta, Aceptar no firma')
  const canvas = field.querySelector('canvas')
  fire(canvas, 'pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
  fire(canvas, 'pointermove', { clientX: 40, clientY: 12 })
  fire(canvas, 'pointerup')
  assert.ok(canvas.ops.some((o) => o[0] === 'stroke'), 'el trazo se pinta')
  press('Accept')
  assert.deepEqual(values[0], { value: 'data:image/png;base64,SIGNED', previousValue: null, updatedFrom: 'internal' })
  assert.equal(field.querySelector('img').src, 'data:image/png;base64,SIGNED')
  assert.deepEqual(buttons().map((b) => b.textContent), ['Sign again', 'Remove'])
  press('Remove')
  assert.equal(values[1].value, null)
  assert.ok(field.querySelector('canvas'), 'vuelve al pad')
  field.setAttribute('readonly', '')
  assert.equal(field.textContent, '—')
  assert.equal(buttons().length, 0)
  const img = doc.createElement('mateu-capture-field')
  img.setAttribute('mode', 'image')
  img.setAttribute('value', 'javascript:alert(1)')
  doc.body.appendChild(img)
  assert.equal(img.querySelector('img').src, undefined, 'javascript: no llega al src')
  void el
})

test('capture: un fichero que no es imagen se describe; la cámara sin getUserMedia cae al selector de fichero', async () => {
  const { doc, win, fire } = makeDom()
  defineCaptureField(win)
  const file = doc.createElement('mateu-capture-field')
  file.setAttribute('mode', 'file')
  file.setAttribute('value', 'data:application/pdf;base64,JVBERi0xLjQK')
  doc.body.appendChild(file)
  assert.match(file.textContent, /application\/pdf · 9 B/)
  const cam = doc.createElement('mateu-capture-field')
  cam.setAttribute('mode', 'camera')
  doc.body.appendChild(cam)
  const created = []
  const realCreate = doc.createElement.bind(doc)
  doc.createElement = (t) => { const e = realCreate(t); if (t === 'input') created.push(e); return e }
  win.navigator.mediaDevices = undefined
  fire(cam.querySelectorAll('oj-button')[0], 'ojAction') // Start camera
  await sleep(1)
  assert.equal(created.length, 1, 'un <input type=file>')
  assert.equal(created[0].getAttribute('capture'), 'environment', 'en un teléfono abre la cámara nativa')
  assert.equal(created[0].accept, 'image/*')
  win.navigator.mediaDevices = { getUserMedia: async () => { throw new Error('denied') } }
  fire(cam.querySelectorAll('oj-button')[0], 'ojAction')
  await sleep(1)
  assert.equal(cam.querySelector('.mateu-capture-box').textContent, captureTexts('en').noCamera, 'permiso denegado: se dice')
})

test('color field: el muestrario emite el hex; sólo lectura lo deshabilita', () => {
  const { doc, win, fire } = makeDom()
  defineColorField(win)
  const f = doc.createElement('mateu-color-field')
  f.setAttribute('value', '#ABC')
  const values = []
  f.addEventListener('valueChanged', (e) => values.push(e.detail.value))
  doc.body.appendChild(f)
  const swatch = f.querySelector('input')
  assert.equal(swatch.value, '#aabbcc')
  swatch.value = '#112233'
  fire(swatch, 'change')
  assert.deepEqual(values, ['#112233'])
  assert.equal(f.querySelector('.mateu-color-code').textContent, '#112233')
  f.setAttribute('readonly', '')
  assert.equal(f.querySelector('input').disabled, true)
})

test('markup field: an editable markdown/html edits its source and previews it rendered', () => {
  // owner, 2026-10-12: an editor with preview on Vaadin and Redwood (Redwood showed the raw source
  // in an oj-text-area, with no way to see the result)
  const { doc, win, fire } = makeDom()
  defineMarkupField(win)
  const f = doc.createElement('mateu-markup-field')
  f.setAttribute('kind', 'markdown')
  f.setAttribute('value', '**bold**')
  const values = []
  f.addEventListener('valueChanged', (e) => values.push(e.detail.value))
  doc.body.appendChild(f)
  const area = f.querySelector('textarea')
  assert.equal(area.value, '**bold**')
  area.value = '# Title'
  fire(area, 'input')
  fire(area, 'change')
  assert.deepEqual(values, ['# Title'])
  fire(f.querySelector('button'), 'click')
  assert.equal(f.querySelector('textarea'), null)
  assert.ok(f.querySelector('.mateu-markup-preview').innerHTML.includes('<h1'), 'rendered, not the source')
  assert.equal(f.querySelector('button').getAttribute('aria-pressed'), 'true')
  const widget = fieldWidgetOf({ fieldId: 'notes', stereotype: 'markdown', dataType: 'string' }, {}, { value: '' })
  assert.equal(widget.isMarkupEditor, true)
  assert.equal(widget.markupKind, 'markdown')
  assert.equal(widget.isTextArea, false)
  assert.ok(!fieldWidgetOf({ fieldId: 'notes', stereotype: 'html', readOnly: true }, {}, { value: '' }).isMarkupEditor)
})

test('rich text field: opens a legacy Delta as HTML, commits on blur only when it changed, empty is null', () => {
  const { doc, win, fire } = makeDom()
  defineRichTextField(win)
  defineRichTextField(win) // twice: defined once
  const f = doc.createElement('mateu-rich-text-field')
  f.setAttribute('aria-label', 'Notes')
  f.setAttribute('value', JSON.stringify({ ops: [{ insert: 'Hi', attributes: { bold: true } }, { insert: '\n' }] }))
  const values = []
  f.addEventListener('valueChanged', (e) => values.push(e.detail.value))
  doc.body.appendChild(f)
  const area = f.querySelector('.mateu-rte-area')
  assert.equal(area.getAttribute('role'), 'textbox')
  assert.equal(area.getAttribute('aria-label'), 'Notes')
  assert.match(area.innerHTML, /<strong>Hi<\/strong>/, 'the Delta opened as HTML')
  assert.equal(f.querySelector('.mateu-rte-toolbar').querySelectorAll('oj-button').length, 7)
  fire(area, 'blur')
  assert.deepEqual(values, [], 'nothing changed: nothing committed')
  area.innerHTML = '<p>New <script>x</script>text</p>'
  fire(area, 'blur')
  assert.deepEqual(values, ['<p>New text</p>'], 'committed sanitised')
  assert.equal(f.value, '<p>New text</p>')
  assert.ok(f.querySelector('.mateu-rte-area'), 'committing does not repaint under the caret')
  area.innerHTML = '<p><br></p>'
  fire(area, 'blur')
  assert.deepEqual(values, ['<p>New text</p>', null], 'an editor left empty is null')
  assert.equal(f.hasAttribute('value'), false)
  // read only: the rendered HTML, no editor
  f.setAttribute('readonly', '')
  assert.equal(f.querySelector('.mateu-rte-area'), null)
  assert.ok(f.querySelector('.mateu-atom-richtext'))
  f.setAttribute('readonly', 'false')
  assert.ok(f.querySelector('.mateu-rte-area'), 'readonly="false" is editable')
})

test('rich text field: the toolbar and Ctrl+B format; a link must be safe', () => {
  const { doc, win, fire } = makeDom()
  defineRichTextField(win)
  const commands = []
  doc.execCommand = (cmd, _ui, arg) => { commands.push([cmd, arg]) }
  let answer = 'javascript:alert(1)'
  win.prompt = () => answer
  const f = doc.createElement('mateu-rich-text-field')
  f.setAttribute('value', '<p>x</p>')
  doc.body.appendChild(f)
  const buttons = f.querySelectorAll('oj-button')
  const press = (i) => buttons[i].dispatchEvent(new FakeEvent('ojAction', { bubbles: true }))
  const down = new FakeEvent('mousedown', { bubbles: true })
  buttons[0].dispatchEvent(down)
  assert.equal(down.defaultPrevented, true, 'the button keeps the selection in the editor')
  press(0)
  press(5) // createLink with an unsafe url: refused
  answer = 'https://example.com'
  press(5)
  answer = null
  press(5) // cancelled
  fire(f.querySelector('.mateu-rte-area'), 'keydown', { key: 'B', ctrlKey: true })
  fire(f.querySelector('.mateu-rte-area'), 'keydown', { key: 'q', ctrlKey: true })
  assert.deepEqual(commands, [['bold', null], ['createLink', 'https://example.com'], ['bold', null]])
})

test('rich text in content: [data-mateu-html] gets its sanitised HTML now and whenever it changes', () => {
  const { doc, el } = makeDom()
  let observer = null
  const realMO = globalThis.MutationObserver
  globalThis.MutationObserver = class { constructor(cb) { observer = cb } observe() {} }
  try {
    const box = el('div', { 'data-mateu-html': '<b>bold</b><img src=x onerror="alert(1)">' })
    doc.body.appendChild(box)
    installRichText(doc)
    installRichText(doc) // once per document
    assert.match(box.innerHTML, /<b>bold<\/b>/)
    assert.ok(!/onerror/.test(box.innerHTML), 'sanitised again on the way in')
    box.setAttribute('data-mateu-html', '<i>changed</i>')
    observer([{ type: 'attributes', target: box }])
    assert.equal(box.innerHTML, '<i>changed</i>')
    const later = el('section', {}, el('p', { 'data-mateu-html': '<u>late</u>' }))
    doc.body.appendChild(later)
    observer([{ type: 'childList', addedNodes: [later, doc.createTextNode('text')] }])
    assert.equal(later.querySelector('p').innerHTML, '<u>late</u>')
  } finally { globalThis.MutationObserver = realMO }
})

// ── tabla ────────────────────────────────────────────────────────────────────────────────────
test('tables: la cabecera de ficha se compacta al hacer scroll', () => {
  const { win, doc } = makeDom()
  installStickyHeader(win)
  win.scrollY = 100
  win.dispatchEvent(new FakeEvent('scroll'))
  assert.ok(doc.body.classList.contains('mateu-scrolled'))
  win.scrollY = 0
  win.dispatchEvent(new FakeEvent('scroll'))
  assert.ok(!doc.body.classList.contains('mateu-scrolled'))
})

{
  const { doc, el } = makeDom()
  test('tables: cada fila del oj-table recibe la clase de su tono (@RowStatus), también tras un repintado de JET', withDocument(doc, async () => {
    globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0)
    globalThis.MutationObserver = FakeObserver
    try {
      const tr = () => el('tr', {}, el('td', { text: 'x' }))
      const tbody = el('tbody', {}, tr(), tr(), tr())
      doc.body.appendChild(el('oj-table', { id: 'mateuTable' }, el('table', {}, tbody)))
      installRowTones(doc)
      setListingTones([{ _tone: 'danger' }, {}, { _tone: 'success' }])
      await sleep(30)
      assert.deepEqual(tbody.children.map((r) => r.className), ['mateu-row-tone-danger', '', 'mateu-row-tone-success'])
      // JET repaints (order, page): new rows, same positions; a tone that changes replaces the old one
      tbody.textContent = ''
      ;[tr(), tr(), tr()].forEach((r) => tbody.appendChild(r))
      tbody.children[0].className = 'mateu-row-tone-success'
      setListingTones([{ _tone: 'warning' }, {}, {}])
      FakeObserver.last.fn([{ type: 'childList', addedNodes: [] }])
      await sleep(30)
      assert.deepEqual(tbody.children.map((r) => r.className), ['mateu-row-tone-warning', '', ''])
    } finally {
      delete globalThis.requestAnimationFrame
      delete globalThis.MutationObserver
    }
  }))
}

// ── third-party web components (Element) ────────────────────────────────────────────────────
{
  const { doc, el, fire } = makeDom()
  test('elements: el HTML con DATOS se sanea (scripts, on…, javascript:, data: que no es imagen, srcdoc)', withDocument(doc, () => {
    const dirty = '<p onclick="steal()">hi<script>bad()</script><a href=" java\tscript:alert(1)">l</a>'
      + '<img src="data:image/png;base64,AA" onerror="x()"><a href="data:text/html,x">d</a><a href="&#106;avascript:alert(2)">e</a><iframe srcdoc="x"></iframe><b>ok</b></p>'
    assert.equal(sanitizeElementHtml(dirty),
      '<p>hi<a>l</a><img src="data:image/png;base64,AA"><a>d</a><a>e</a><b>ok</b></p>')
    assert.equal(sanitizeElementHtml(null), '')
  }))

  test('elements: el hueco se crea UNA vez y en los renders siguientes sólo se reescriben atributos; sus eventos llegan al servidor', withDocument(doc, () => {
    const hole = el('div', { class: 'mateu-element', 'data-element-id': 'g1' })
    doc.body.appendChild(hole)
    const sink = sinkLog()
    setElementEventSink(sink)
    setElementModuleBase('http://backend:8080/')
    const atom = { elementId: 'g1', name: 'my-graph', importUrl: '/components/graph.js', attributes: { zoom: '1' },
      on: { 'node-click': 'openNode' }, content: '<b>${row}</b><script>x()</script>', asHtml: true, dataInContent: true }
    assert.equal(mountElements([atom]), 1)
    const graph = hole.firstElementChild
    assert.equal(graph.tagName, 'my-graph')
    assert.equal(graph.getAttribute('zoom'), '1')
    assert.equal(graph.innerHTML, '<b>${row}</b>', 'con datos dentro: saneado')
    const script = doc.head.querySelectorAll('script').find((s) => s.type === 'module')
    assert.equal(script.src, 'http://backend:8080/components/graph.js', 'el módulo lo sirve el backend, no la app VB')
    graph.__zoomState = 'kept'
    mountElements([{ ...atom, attributes: { zoom: '2' }, on: { 'node-click': 'openNodeV2' } }])
    assert.equal(hole.firstElementChild, graph, 'el mismo elemento: conserva su estado')
    assert.equal(graph.getAttribute('zoom'), '2')
    graph.dispatchEvent(new CustomEvent('node-click', { detail: { id: 'n7' } }))
    assert.deepEqual(sink.calls.map((c) => [c[0], c[1]]), [['openNodeV2', { event: { id: 'n7' } }]], 'la acción del ÚLTIMO render, un solo listener')
    assert.equal(doc.head.querySelectorAll('script').length, 1, 'el módulo se carga una vez')
    setElementEventSink(null)
    setElementModuleBase('')
    void fire
  }))
}

// ── an Element re-rendered with a DIFFERENT definition: what is no longer declared goes ────────
{
  const { doc, el } = makeDom()
  test("elements: an attribute, style or class the definition drops is removed — the element's own are kept", withDocument(doc, () => {
    const hole = el('div', { class: 'mateu-element', 'data-element-id': 'g2' })
    doc.body.appendChild(hole)
    const atom = { elementId: 'g2', name: 'my-plan', attributes: { disabled: '', title: 'T' }, style: 'color: red', cssClasses: 'big' }
    mountElements([atom])
    const plan = hole.firstElementChild
    assert.equal(plan.hasAttribute('disabled'), true)
    plan.setAttribute('aria-busy', 'true') // the component's own
    mountElements([{ ...atom, attributes: { title: 'T' }, style: '', cssClasses: '' }])
    assert.equal(hole.firstElementChild, plan, 'the same element')
    assert.equal(plan.hasAttribute('disabled'), false, 'dropped from the definition → removed')
    assert.equal(plan.getAttribute('title'), 'T')
    assert.equal(plan.hasAttribute('style'), false)
    assert.equal(plan.hasAttribute('class'), false)
    assert.equal(plan.getAttribute('aria-busy'), 'true', 'never written by Mateu → left alone')
  }))
}

// ── an Element of a REMOTE screen loads its module from the remote ────────────────────────────
{
  const { doc, el } = makeDom()
  test('elements: the module of an Element sent by a REMOTE screen is loaded from the remote origin', withDocument(doc, () => {
    const hole = el('div', { class: 'mateu-element', 'data-element-id': 'wf' })
    doc.body.appendChild(hole)
    setElementModuleBase('http://shell:8621/') // NOSONAR
    assert.equal(mountElements([{ elementId: 'wf', name: 'wf-remote-graph', importUrl: '/eventconductor/workflow-graph.js',
      attributes: {}, screenBase: 'http://pod:8620/_workflow' }]), 1) // NOSONAR
    const script = doc.head.querySelectorAll('script').find((s) => s.type === 'module')
    assert.equal(script.src, 'http://pod:8620/eventconductor/workflow-graph.js', 'from the remote, not the shell') // NOSONAR
    setElementModuleBase('')
  }))
}

// ── page foldout: FoldoutPanel.open = false starts folded; the layout's own selection unfolds ──
{
  const { doc, el } = makeDom()
  test("foldout: an open=false panel starts as a strip and the layout's selection (click, dot, focus) unfolds it", withDocument(doc, () => {
    resetFoldoutFolds()
    // what oj-sp-foldout-layout stamps: one container per panel, the overview first
    const container = (title) => el('div', { class: 'oj-sp-foldout-animation-container oj-sp-foldout-layout-panel-container open' },
      el('oj-sp-foldout-panel', { 'panel-title': title }))
    const layout = el('oj-sp-foldout-layout', { id: 'mateuFoldoutEl' },
      el('div', { class: 'oj-sp-foldout-layout-children-container' },
        container('Booking'), container('Payments'), container('Notes')))
    doc.body.appendChild(layout)
    const foldout = { panels: [{ title: 'Payments', open: true }, { title: 'Notes', open: false }] }
    // not every panel stamped yet → the caller retries
    assert.equal(applyFoldoutFolds(layout, { panels: [...foldout.panels, { title: 'More', open: false }] }), false)
    assert.equal(applyFoldoutFolds(layout, foldout), true)
    const [overview, payments, notes] = layout.querySelectorAll('.oj-sp-foldout-layout-panel-container')
    const panelIn = (c) => c.querySelector('oj-sp-foldout-panel')
    let revealed = 0
    notes.scrollIntoView = () => { revealed++ }
    assert.ok(panelIn(notes).classList.contains(FOLDED_CLASS), 'Notes starts folded')
    assert.equal(notes.getAttribute('aria-expanded'), 'false')
    assert.equal(notes.getAttribute('title'), chromeText('foldoutUnfold', { title: 'Notes' }))
    assert.ok(!panelIn(payments).classList.contains(FOLDED_CLASS), 'an open panel is untouched')
    assert.equal(payments.getAttribute('aria-expanded'), null)
    assert.ok(!panelIn(overview).classList.contains(FOLDED_CLASS))
    // selecting ANOTHER panel leaves it folded
    layout.dispatchEvent(new CustomEvent('selectedPanelChanged', { detail: { value: 1 } }))
    assert.ok(panelIn(notes).classList.contains(FOLDED_CLASS))
    assert.equal(revealed, 0)
    // the layout selects Notes (its container clicked/focused, or its page dot): it unfolds
    layout.dispatchEvent(new CustomEvent('selectedPanelChanged', { detail: { value: 2 } }))
    assert.ok(!panelIn(notes).classList.contains(FOLDED_CLASS), 'unfolded')
    assert.equal(notes.getAttribute('aria-expanded'), 'true')
    assert.equal(notes.getAttribute('title'), null)
    assert.equal(revealed, 1, 'the unfolded panel is brought into view')
    // an action re-projects the page: it stays unfolded, and the listener is not wired twice
    applyFoldoutFolds(layout, { panels: foldout.panels.map((p) => ({ ...p })) })
    assert.ok(!panelIn(notes).classList.contains(FOLDED_CLASS))
    layout.dispatchEvent(new CustomEvent('selectedPanelChanged', { detail: { value: 2 } }))
    assert.equal(revealed, 1)
    resetFoldoutFolds()
  }))
  test('foldout with the overview on top (orientation horizontal): the panel containers are the wire panels', withDocument(doc, () => {
    resetFoldoutFolds()
    const container = (title) => el('div', { class: 'oj-sp-foldout-layout-panel-container' }, el('oj-sp-foldout-panel', { 'panel-title': title }))
    const layout = el('oj-sp-foldout-layout', { id: 'mateuFoldoutTop' }, container('Payments'), container('Notes'))
    doc.body.appendChild(layout)
    const foldout = { overviewOnTop: true, panels: [{ title: 'Payments', open: true }, { title: 'Notes', open: false }] }
    assert.equal(applyFoldoutFolds(layout, foldout), true)
    const [payments, notes] = layout.querySelectorAll('.oj-sp-foldout-layout-panel-container')
    assert.ok(notes.querySelector('oj-sp-foldout-panel').classList.contains(FOLDED_CLASS), 'Notes (container 1) is the folded one')
    assert.ok(!payments.querySelector('oj-sp-foldout-panel').classList.contains(FOLDED_CLASS))
    notes.scrollIntoView = () => {}
    layout.dispatchEvent(new CustomEvent('selectedPanelChanged', { detail: { value: 1 } }))
    assert.ok(!notes.querySelector('oj-sp-foldout-panel').classList.contains(FOLDED_CLASS), 'selecting it unfolds it')
    resetFoldoutFolds()
  }))
}

// ── display: cookies, context menu, registered components, BPMN, chat ───────────────────────
{
  const { doc, el, fire } = makeDom()
  test('display: la banda de cookies se esconde si ya se aceptó; Aceptar escribe la cookie y la esconde', withDocument(doc, () => {
    globalThis.MutationObserver = FakeObserver
    try {
      const band = el('div', { 'data-mateu-cookie': 'consent' }, el('oj-button', { 'data-mateu-cookie-dismiss': true }, el('span', { text: 'OK' })))
      doc.body.appendChild(band)
      installCookieConsent(doc)
      assert.equal(band.hidden, false)
      fire(band.querySelector('span'), 'click')
      assert.equal(band.hidden, true)
      assert.match(doc.cookie, /^consent=dismiss; max-age=31536000; path=\/; SameSite=Lax$/)
      const again = el('div', { 'data-mateu-cookie': 'consent' })
      doc.body.appendChild(again)
      FakeObserver.last.fn([{ type: 'childList', addedNodes: [again] }])
      assert.equal(again.hidden, true, 'con la cookie puesta, no vuelve a salir')
    } finally { delete globalThis.MutationObserver }
  }))

  test('display: el botón derecho sobre el contenido abre SU menú contextual', () => {
    const { doc: d, el: e, fire: f } = makeDom()
    const menu = e('oj-menu')
    const opened = []
    menu.open = (ev) => opened.push(ev.type)
    const target = e('span', { text: 'Row 1' })
    d.body.appendChild(e('div', {}, e('div', {}, target), e('div', { class: 'mateu-context-menu', 'data-mateu-context-menu': 'true' }, menu)))
    installContextMenus(d)
    const ev = f(target, 'contextmenu')
    assert.deepEqual(opened, ['contextmenu'])
    assert.ok(ev.defaultPrevented, 'no sale el menú del navegador')
    // far away (more than five levels above there is no menu): the browser's
    const plain = e('p', { text: 'elsewhere' })
    let deep = plain
    for (let i = 0; i < 6; i++) deep = e('div', {}, deep)
    d.body.appendChild(deep)
    assert.equal(f(plain, 'contextmenu').defaultPrevented, false)
    assert.equal(opened.length, 1)
  })

  test('display: un componente registrado se monta en su hueco con sus props; si falla, se dice', () => {
    const { doc: d, el: e } = makeDom()
    globalThis.MutationObserver = FakeObserver
    try {
      const mounts = []
      registerCustomComponent('floor-plan', (slot, props) => { mounts.push(props); slot.textContent = 'plan of ' + props.floor; return () => mounts.push('cleanup') })
      registerCustomComponent('broken', () => { throw new Error('nope') })
      const slot = e('div', { 'data-mateu-custom': 'floor-plan', 'data-mateu-custom-props': '{"floor":3}' })
      const bad = e('div', { 'data-mateu-custom': 'broken', 'data-mateu-custom-props': '{}' })
      d.body.appendChild(slot); d.body.appendChild(bad)
      installCustomComponents(d)
      assert.equal(slot.textContent, 'plan of 3')
      assert.match(bad.textContent, /nope/)
      slot.setAttribute('data-mateu-custom-props', '{"floor":4}')
      FakeObserver.last.fn([{ type: 'attributes', target: slot }])
      assert.deepEqual(mounts, [{ floor: 3 }, 'cleanup', { floor: 4 }], 'props nuevas: se limpia el anterior y se vuelve a montar')
    } finally { delete globalThis.MutationObserver }
  })

  test('display: el BPMN se dibuja como SVG (tareas, eventos, compuertas, flujos con etiqueta); vacío, se dice', () => {
    const { doc: d, el: e } = makeDom()
    const box = e('div', { id: 'bp' })
    d.body.appendChild(box)
    drawBpmn(box, { minX: 0, minY: 0, width: 400, height: 100,
      nodes: [{ kind: 'event', x: 0, y: 40, w: 20, h: 20, label: 'Start' }, { kind: 'task', x: 60, y: 30, w: 100, h: 40, label: 'Check the guest documents now please' },
        { kind: 'gateway', x: 200, y: 30, w: 40, h: 40 }, { kind: 'end', x: 300, y: 40, w: 20, h: 20 }],
      flows: [{ points: [[20, 50], [60, 50]], label: 'go' }] })
    const svg = box.querySelector('svg')
    assert.equal(svg.getAttribute('viewBox'), '0 0 400 100')
    assert.equal(svg.querySelectorAll('circle').length, 2)
    assert.ok(svg.querySelector('circle.mateu-bpmn-end'))
    assert.equal(svg.querySelectorAll('polygon').length, 1)
    assert.equal(svg.querySelector('polyline').getAttribute('marker-end'), 'url(#bp-arrow)')
    assert.ok(svg.querySelectorAll('tspan').length >= 2, 'un nombre largo se parte en líneas')
    globalThis.MutationObserver = FakeObserver
    try {
      const empty = e('div', { 'data-mateu-bpmn': '{"nodes":[]}' })
      d.body.appendChild(empty)
      installBpmn(d)
      assert.equal(empty.textContent, chromeText('emptyProcess'))
    } finally { delete globalThis.MutationObserver }
  })

  test('display: el componente Chat pinta el turno del usuario ESCAPADO y el error del asistente', async () => {
    const { doc: d, el: e, fire: f } = makeDom()
    globalThis.MutationObserver = FakeObserver
    globalThis.location = { pathname: '/bookings' }
    const realFetch = globalThis.fetch
    const sent = []
    globalThis.fetch = async (url, init) => { sent.push([url, JSON.parse(init.body)]); return { ok: false, status: 503, text: async () => 'down' } }
    try {
      const box = e('div', { id: 'chat1', 'data-mateu-chat-url': '/agent/chat' })
      d.body.appendChild(box)
      installChatComponents(d)
      const input = box.querySelector('textarea')
      assert.equal(input.getAttribute('aria-label'), chromeText('chatInputLabel'))
      assert.equal(box.querySelector('.mateu-chat-log').getAttribute('aria-live'), 'polite')
      input.value = '<img src=x onerror=alert(1)> hello'
      f(input, 'keydown', { key: 'Enter' })
      await sleep(5)
      assert.equal(sent[0][0], '/agent/chat')
      assert.equal(sent[0][1].message, '<img src=x onerror=alert(1)> hello')
      const turns = box.querySelectorAll('.mateu-chat-turn')
      assert.equal(turns[0].querySelector('img'), null, 'el texto del usuario no es HTML')
      assert.match(turns[0].innerHTML, /&lt;img src=x onerror=alert\(1\)&gt; hello/)
      assert.match(turns[1].textContent, /503/)
      assert.equal(input.value, '')
      f(input, 'keydown', { key: 'Enter', shiftKey: true })
      await sleep(5)
      assert.equal(sent.length, 1, 'Shift+Enter es salto de línea; vacío no se envía')
    } finally {
      globalThis.fetch = realFetch
      delete globalThis.location
      delete globalThis.MutationObserver
    }
  })

  test('display: the Chat component hands the agent events to the shell dispatcher WHILE the answer streams, and shows progress and tokens', async () => {
    const { doc: d, el: e, fire: f } = makeDom()
    globalThis.MutationObserver = FakeObserver
    globalThis.location = { pathname: '/bookings' }
    const realFetch = globalThis.fetch
    const enc = new TextEncoder()
    const chunks = [
      'data: {"event":"agent-status","detail":{"phase":"thinking","text":"Looking it up"}}\n\n',
      'data: {"event":"navigation-requested","detail":{"route":"/orders","serverSideType":"a.B"}}\n\n',
      'data: {"inputTokens":3,"outputTokens":5}\n\n',
      'data: Done\n\n',
    ]
    let i = 0
    let statusMidStream = ''
    globalThis.fetch = async () => ({ ok: true, body: { getReader: () => ({ read: async () => {
      if (i === 3) { await sleep(5); statusMidStream = box.querySelector('.mateu-chat-status').textContent }
      return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }
    } }) } })
    const seen = []
    setChatEventHost({ registry: () => null, navigate: async (n) => { seen.push([n, i]) } })
    let box
    try {
      box = e('div', { id: 'chat2', 'data-mateu-chat-url': '/agent/chat', 'data-mateu-chat-upload': '/agent/upload' })
      d.body.appendChild(box)
      installChatComponents(d)
      assert.ok(box.querySelector('.mateu-chat-attach'), 'with an upload endpoint: the attach button')
      const input = box.querySelector('textarea')
      input.value = 'take me to orders'
      f(input, 'keydown', { key: 'Enter' })
      await sleep(30)
      assert.deepEqual(seen[0][0], { route: '/orders', serverSideType: 'a.B' })
      assert.ok(seen[0][1] < chunks.length, 'handled before the stream ended')
      assert.equal(statusMidStream, 'Looking it up')
      assert.equal(box.querySelector('.mateu-chat-tokens').textContent, 'Tokens: input 3 · output 5')
      assert.equal(box.querySelector('.mateu-chat-status').textContent, '')
      assert.match(box.querySelectorAll('.mateu-chat-turn')[1].textContent, /Done/)
    } finally {
      setChatEventHost(null)
      globalThis.fetch = realFetch
      delete globalThis.location
      delete globalThis.MutationObserver
    }
  })
}

// ── the action of a fact in the oj-sp header (the pencil next to EMPRESA) ─────────────────────
// oj-sp paints each contextualInfo fact as <div id="<uid>_contextualInfo<i>-labelled-by"> (label)
// + <div id="<uid>_contextualInfo<i>"> (value) inside a flex item; the button goes after the value.
const ojSpHeader = (e, facts, actions) => {
  const items = facts.map((f, i) => e('div', { class: 'oj-flex-item oj-flex' },
    e('div', { id: 'h1_contextualInfo' + i + '-labelled-by', text: f.label }),
    e('div', { id: 'h1_contextualInfo' + i, text: f.value })))
  return e('oj-sp-header-general-overview', actions ? { 'data-mateu-fact-actions': JSON.stringify(actions) } : {}, e('div', {}, ...items))
}
const companyAction = { index: 1, actionId: 'changeCompany', parameters: { stayId: 'S-1' }, label: 'Cambiar empresa', iconClass: 'oj-ux-ico-edit' }

test('fact action: el botón de icono va JUSTO tras el valor de SU fact, con su nombre accesible', () => {
  const { doc, el } = makeDom()
  const header = ojSpHeader(el, [{ label: 'TOTAL RESERVA', value: '€ 4.890,00' }, { label: 'EMPRESA', value: 'Acme' }], [companyAction])
  doc.body.appendChild(header)
  decorateFactActions(header, doc)
  const buttons = header.querySelectorAll('.mateu-fact-action')
  assert.equal(buttons.length, 1)
  const value = header.querySelectorAll('[id]').find((x) => x.id === 'h1_contextualInfo1')
  const row = value.parentNode.childNodes
  assert.equal(row[row.indexOf(value) + 1], buttons[0], 'tras el valor, en su línea')
  assert.equal(buttons[0].getAttribute('aria-label'), 'Cambiar empresa')
  assert.equal(buttons[0].getAttribute('title'), 'Cambiar empresa')
  assert.equal(buttons[0].querySelector('span').getAttribute('class'), 'oj-ux-ico-edit')
  // idempotent: another pass (the observer) adds and moves nothing
  decorateFactActions(header, doc)
  assert.equal(header.querySelectorAll('.mateu-fact-action').length, 1)
  // another record without action: the button goes away
  header.setAttribute('data-mateu-fact-actions', '')
  decorateFactActions(header, doc)
  assert.equal(header.querySelectorAll('.mateu-fact-action').length, 0)
})

test('fact action: oj-sp repinta la fila y el botón vuelve; un fact que oj-sp no muestra no rompe nada', () => {
  const { doc, el } = makeDom()
  const header = ojSpHeader(el, [{ label: 'EMPRESA', value: 'Acme' }], [{ ...companyAction, index: 0 }, { ...companyAction, index: 5 }])
  doc.body.appendChild(header)
  decorateFactActions(header, doc)
  // oj-sp re-renders the value (a new element, the old one gone)
  const old = header.querySelectorAll('[id]').find((x) => x.id === 'h1_contextualInfo0')
  const parent = old.parentNode
  for (const c of [...parent.childNodes]) c.remove()
  parent.appendChild(el('div', { id: 'h1_contextualInfo0-labelled-by', text: 'EMPRESA' }))
  parent.appendChild(el('div', { id: 'h1_contextualInfo0', text: 'Globex' }))
  decorateFactActions(header, doc)
  assert.equal(header.querySelectorAll('.mateu-fact-action').length, 1)
  assert.equal(parent.childNodes[2].getAttribute('data-action-id'), 'changeCompany')
})

test('fact action: el clic lanza SU acción con SUS parámetros por el canal de la página', () => {
  const { doc, el } = makeDom()
  const header = ojSpHeader(el, [{ label: 'TOTAL', value: '1' }, { label: 'EMPRESA', value: 'Acme' }], [companyAction])
  doc.body.appendChild(header)
  const sink = sinkLog()
  setFactActionSink(sink)
  installFactActions(doc)
  const button = header.querySelector('.mateu-fact-action')
  button.querySelector('span').click()
  assert.deepEqual(sink.calls, [['changeCompany', { stayId: 'S-1' }, {}]])
  setFactActionSink(null)
})

for (const { name, fn } of tests) {
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    console.error('  ✗ ' + name)
    console.error(e)
    process.exitCode = 1
  }
}
console.log(`\n${passed}/${tests.length} DOM tests ${passed === tests.length ? 'OK' : 'FAILED'}`)
