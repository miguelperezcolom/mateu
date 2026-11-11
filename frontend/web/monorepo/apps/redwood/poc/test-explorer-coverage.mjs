// The DOM wiring the Mateu Explorer review added to the Redwood core and no suite exercised: the
// left-click context menu, the wire's Cancel label on Spectra's create/edit header, the AddOnPicker
// running total, the PaymentPicker pick, a click anywhere in a drilling KPI card, @OnRowSelected on
// a grid field (click and base combination + number), the island banners' dismissal, and the
// embedded component's page-action sinks. Over test-harness-dom's fake DOM.
// Run: node test-explorer-coverage.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { makeDom, FakeEvent, sleep } from './test-harness-dom.mjs'
import {
  installContextMenus, relabelCancel, installFactActions, showAddOnTotal, pickPaymentMethod, paymentParametersOf,
  installPaymentPickers, installScoreboards, setScoreboardActionSink, setScoreboardDataResolver,
} from './displayDom.mjs'
import { installRowSelection, setRowSelectSink } from './tables.mjs'
import { installBannerDismissal } from './notify.mjs'
import { isBannerDismissed } from './core/content.mjs'
import { installEmbeddedContentRuntime } from './embedded.mjs'
import { installAttachmentChips } from './files.mjs'
import { moneyNumberText, chromeText } from './i18n.mjs'
import { classifyRequestFailure, connectivity, pendingActions } from './resilience.mjs'

let passed = 0
const tests = []
const test = (name, fn) => tests.push({ name, fn })
const sinkLog = () => { const calls = []; const fn = (...a) => calls.push(a); fn.calls = calls; return fn }
class FakeObserver { constructor(fn) { this.fn = fn; FakeObserver.last = this } observe() {} }

// ── ContextMenu activateOnLeftClick ──────────────────────────────────────────────────────────
test('context menu: a plain left click on what it wraps opens it; a click on a control does not', () => {
  const { doc, el, fire } = makeDom()
  const menu = el('oj-menu')
  const opened = []
  menu.open = (ev) => opened.push(ev.type)
  const text = el('span', { text: 'Room 101' })
  const own = el('button', { text: 'Edit' })
  doc.body.appendChild(el('div', {}, el('div', {}, text, own), el('div', { class: 'mateu-context-menu', 'data-mateu-context-left': 'true' }, menu)))
  installContextMenus(doc)
  fire(text, 'click')
  assert.deepEqual(opened, ['click'])
  fire(own, 'click')
  assert.equal(opened.length, 1, 'the wrapped content\'s own button keeps its click')
  // a menu that only opens on the right button: a left click leaves it closed
  const { doc: d2, el: e2, fire: f2 } = makeDom()
  const rightOnly = e2('oj-menu')
  rightOnly.open = () => opened.push('wrong')
  const t2 = e2('span', { text: 'x' })
  d2.body.appendChild(e2('div', {}, t2, e2('div', { class: 'mateu-context-menu', 'data-mateu-context-menu': 'true' }, rightOnly)))
  installContextMenus(d2)
  f2(t2, 'click')
  assert.equal(opened.length, 1)
  // a menu not upgraded yet (no open()): the click is left alone, nothing throws
  const { doc: d3, el: e3, fire: f3 } = makeDom()
  const t3 = e3('span')
  d3.body.appendChild(e3('div', {}, t3, e3('div', { class: 'mateu-context-menu', 'data-mateu-context-left': 'true' }, e3('oj-menu'))))
  installContextMenus(d3)
  assert.equal(f3(t3, 'click').defaultPrevented, false)
})

// ── oj-sp-header-create-edit: the wire's Cancel label ───────────────────────────────────────
test('create/edit header: Spectra\'s Cancel takes the wire\'s label, at install and after oj-sp re-renders it', () => {
  const { doc, el } = makeDom()
  globalThis.MutationObserver = FakeObserver
  try {
    const cancel = el('oj-button', { id: 'hdr_cancelAction' })
    cancel.label = 'Cancel'
    const header = el('oj-sp-header-create-edit', { id: 'hdr', 'data-mateu-cancel-label': 'Discard' }, cancel)
    doc.body.appendChild(header)
    installFactActions(doc)
    assert.equal(cancel.label, 'Discard', 'the headers already on the page')
    // oj-sp draws its button again with its fixed label: an attribute record inside the header
    cancel.label = 'Cancel'
    FakeObserver.last.fn([{ type: 'attributes', target: cancel, addedNodes: [] }])
    assert.equal(cancel.label, 'Discard')
    // a header painted later (a navigation): found among the added nodes
    const later = el('oj-button', { id: 'h2_cancelAction' })
    later.label = 'Cancel'
    const wrap = el('div', {}, el('oj-sp-header-create-edit', { id: 'h2', 'data-mateu-cancel-label': 'Back to list' }, later))
    doc.body.appendChild(wrap)
    FakeObserver.last.fn([{ type: 'childList', target: { nodeType: 3, parentNode: doc.body }, addedNodes: [doc.createTextNode('x'), wrap] }])
    assert.equal(later.label, 'Back to list')
  } finally { delete globalThis.MutationObserver }
  // no label on the wire, or a header without an id: Spectra's own label stays
  const { el: e } = makeDom()
  const b = e('oj-button', { id: 'x_cancelAction' })
  b.label = 'Cancel'
  relabelCancel(e('div', { id: 'x', 'data-mateu-cancel-label': '' }, b))
  relabelCancel(e('div', { 'data-mateu-cancel-label': 'Discard' }, b))
  assert.equal(b.label, 'Cancel')
})

// ── AddOnPicker / PaymentPicker ─────────────────────────────────────────────────────────────
test('AddOnPicker: the running total is written in its own picker, formatted, before the server answers', () => {
  const { doc, el } = makeDom()
  const out = el('span', { class: 'mateu-addons-total-value', text: '€ 0.00' })
  const other = el('span', { class: 'mateu-addons-total-value', text: 'untouched' })
  const toggle = el('oj-switch')
  doc.body.appendChild(el('div', { class: 'mateu-addons' }, toggle, out))
  doc.body.appendChild(el('div', { class: 'mateu-addons' }, other))
  showAddOnTotal(toggle, 1234.5, 'USD')
  assert.equal(out.textContent, 'USD ' + moneyNumberText(1234.5))
  assert.match(out.textContent, /1,234\.50/)
  assert.equal(other.textContent, 'untouched')
  showAddOnTotal(toggle, 'not a number')
  assert.equal(out.textContent, '€ ' + moneyNumberText(0), 'no currency: the euro; no number: zero')
  showAddOnTotal(el('span'), 5) // outside a picker: nothing to write, nothing thrown
  showAddOnTotal(null, 5)
})

test('PaymentPicker: a click picks the method (callToAction), a local one stays on the client, the confirm carries it', () => {
  const { doc, el, fire } = makeDom()
  const card = el('oj-button', { 'data-payment-method': 'card', chroming: 'callToAction' })
  const cash = el('oj-button', { 'data-payment-method': 'cash', 'data-payment-local': 'true', chroming: 'outlined' })
  const remote = el('oj-button', { 'data-payment-method': 'transfer', chroming: 'outlined' })
  const methods = el('div', { class: 'mateu-payment-methods' }, card, cash, remote)
  const confirm = el('oj-button', { text: 'Pay' })
  doc.body.appendChild(el('div', { class: 'mateu-payment' }, methods, confirm))
  const bubbled = []
  doc.body.addEventListener('click', () => bubbled.push('click'))
  assert.deepEqual(paymentParametersOf(confirm, { amount: 10 }), { amount: 10 }, 'nothing picked yet: the server\'s selection')
  installPaymentPickers(doc)
  installPaymentPickers(doc) // once
  fire(cash, 'click')
  assert.equal(methods.getAttribute('data-selected'), 'cash')
  assert.deepEqual([card.chroming, cash.chroming, remote.chroming], ['outlined', 'callToAction', 'outlined'])
  assert.equal(cash.getAttribute('chroming'), 'callToAction')
  assert.deepEqual(bubbled, [], 'a method without methodActionId sends no (empty) action')
  fire(remote, 'click')
  assert.equal(bubbled.length, 1, 'one with methodActionId still tells the server')
  assert.deepEqual(paymentParametersOf(confirm, { amount: 10 }), { amount: 10, _method: 'transfer' })
  fire(confirm, 'click')
  assert.equal(methods.getAttribute('data-selected'), 'transfer', 'a click elsewhere picks nothing')
  pickPaymentMethod(null, 'card') // no methods row: no-op
})

// ── Scoreboard: a click anywhere in a drilling card ─────────────────────────────────────────
test('scoreboard: a click on a card\'s TEXT drills in once (the item action of the same click is not run twice)', () => {
  const { doc, el, fire } = makeDom()
  const title = el('span', { class: 'oj-sp-scoreboard-metric-card-title', text: 'Orders' })
  const plain = el('span', { text: 'Revenue' })
  const host = el('oj-sp-scoreboard', {},
    el('div', { id: 'sb_kpi_k0' }, plain),
    el('div', { id: 'sb_kpi_k1' }, el('div', {}, title)))
  const loose = el('span', { text: 'band caption' })
  host.appendChild(loose)
  doc.body.appendChild(host)
  const atom = { metrics: [{ title: 'Revenue' }, { title: 'Orders', actionId: 'openOrders', parameters: { y: 2 }, surfaceId: 'isl' }] }
  const sink = sinkLog()
  setScoreboardActionSink(sink)
  setScoreboardDataResolver(() => atom)
  try {
    installScoreboards(doc)
    fire(title, 'click')
    title.dispatchEvent(new FakeEvent('ojItemAction', { bubbles: false, detail: { context: { key: 'k1' } } }))
    assert.deepEqual(sink.calls, [['openOrders', { y: 2 }, { fromNested: false, surfaceId: 'isl' }]])
    fire(plain, 'click')
    fire(loose, 'click')
    assert.equal(sink.calls.length, 1, 'a card that does not drill in, or the band outside the cards: nothing')
  } finally { setScoreboardActionSink(null); setScoreboardDataResolver(null) }
})

// ── @OnRowSelected on a grid field ──────────────────────────────────────────────────────────
function gridDom() {
  const { doc, el, fire } = makeDom()
  const rows = [{ guest: 'Ada' }, { guest: 'Alan' }]
  const cells = rows.map((r) => el('td', { text: r.guest }))
  const header = el('th', { text: 'Guest' })
  const inner = el('oj-button', { text: 'edit' })
  cells[1].appendChild(inner)
  const table = el('oj-table', {}, header, ...cells)
  table.getContextByNode = (n) => {
    if (n === header) return { subId: 'oj-table-header', rowIndex: null }
    const i = cells.findIndex((c) => c.contains(n))
    return i < 0 ? null : { subId: 'oj-table-cell', rowIndex: i }
  }
  const grid = el('div', {
    'data-row-select-action': 'pickGuest', 'data-row-select-shortcut': 'ctrl+shift',
    'data-row-select-rows': JSON.stringify(rows), 'data-mateu-surface-id': 'isl-1',
  }, table)
  doc.body.appendChild(grid)
  return { doc, el, fire, rows, cells, header, inner, grid }
}

test('grid @OnRowSelected: a click on a row runs the action with _clickedRow, to the grid\'s surface', () => {
  const { doc, fire, rows, cells, header, inner } = gridDom()
  const sink = sinkLog()
  setRowSelectSink(sink)
  try {
    installRowSelection(doc)
    installRowSelection(doc) // once
    fire(cells[1], 'click')
    assert.deepEqual(sink.calls, [['pickGuest', { _clickedRow: rows[1] }, { surfaceId: 'isl-1' }]])
    fire(header, 'click')
    fire(inner, 'click')
    assert.equal(sink.calls.length, 1, 'the header, or a control inside a cell, does not select')
  } finally { setRowSelectSink(null) }
})

test('grid @OnRowSelected: the base combination + a number selects that row (top row or keypad); out of range, nothing', () => {
  const { doc, fire, rows, grid } = gridDom()
  const sink = sinkLog()
  setRowSelectSink(sink)
  try {
    installRowSelection(doc)
    const key = (code, mods = {}) => fire(doc.body, 'keydown', { code, key: code.slice(-1), ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods })
    const ev = key('Digit2', { ctrlKey: true, shiftKey: true })
    assert.deepEqual(sink.calls, [['pickGuest', { _clickedRow: rows[1] }, { surfaceId: 'isl-1' }]])
    assert.ok(ev.defaultPrevented)
    key('Numpad1', { ctrlKey: true, shiftKey: true })
    assert.deepEqual(sink.calls[1][1], { _clickedRow: rows[0] })
    key('Digit5', { ctrlKey: true, shiftKey: true })
    key('Digit1', { shiftKey: true })
    key('Digit1', { ctrlKey: true })
    assert.equal(sink.calls.length, 2, 'no fifth row; no modifier; the wrong combination')
    // a grid out of sight (no box) does not take the keys; unreadable rows select nothing
    grid.box(null)
    key('Digit1', { ctrlKey: true, shiftKey: true })
    grid.box({})
    grid.setAttribute('data-row-select-rows', '{broken')
    assert.equal(key('Digit1', { ctrlKey: true, shiftKey: true }).defaultPrevented, false)
    assert.equal(sink.calls.length, 2)
  } finally { setRowSelectSink(null) }
})

// ── island banners ─────────────────────────────────────────────────────────────────────────
test('island banners: the ✕ hides a closeable one and remembers it; a timed one dismisses itself', async () => {
  const { doc, win, el, fire } = makeDom()
  win.MutationObserver = FakeObserver
  const close = el('button', { 'data-mateu-banner-close': '' })
  const closeable = el('div', { 'data-mateu-banner': 'b-close' }, el('span', { text: 'Saved' }), close)
  const timed = el('div', { 'data-mateu-banner': 'b-timed', 'data-mateu-banner-timeout': '5' })
  const untimed = el('div', { 'data-mateu-banner': 'b-never', 'data-mateu-banner-timeout': '0' })
  doc.body.appendChild(closeable); doc.body.appendChild(timed); doc.body.appendChild(untimed)
  installBannerDismissal(doc)
  installBannerDismissal(doc)
  fire(closeable.firstChild, 'click')
  assert.equal(closeable.hidden, undefined, 'a click on the text is not the ✕')
  fire(close, 'click')
  assert.deepEqual([closeable.hidden, closeable.style.display], [true, 'none'])
  assert.ok(isBannerDismissed('b-close'), 'a re-projection does not bring it back')
  assert.equal(timed.hidden, undefined)
  await sleep(20)
  assert.equal(timed.hidden, true)
  assert.ok(isBannerDismissed('b-timed'))
  assert.equal(untimed.hidden, undefined, 'no positive timeout: it stays')
  // a timed banner painted later: armed when the observer sees it
  const later = el('div', { 'data-mateu-banner': 'b-later', 'data-mateu-banner-timeout': '5' })
  doc.body.appendChild(later)
  FakeObserver.last.fn([])
  FakeObserver.last.fn([]) // armed once
  await sleep(20)
  assert.ok(isBannerDismissed('b-later'))
})

// ── FileList chips ─────────────────────────────────────────────────────────────────────────
test('attachment chips: preview opens the safe href in a new tab, download downloads it; an unsafe one, nothing', () => {
  const { doc, el } = makeDom()
  const clicked = []
  doc.registry.set('a', class extends (Object.getPrototypeOf(el('div')).constructor) { click() { clicked.push([this.getAttribute('href'), this.hasAttribute('download'), this.target]) } })
  const chip = el('oj-sp-attachment-chip', { 'data-mateu-href': '/files/invoice.pdf' })
  const evil = el('oj-sp-attachment-chip', { 'data-mateu-href': 'javascript:alert(1)' })
  doc.body.appendChild(chip); doc.body.appendChild(evil)
  installAttachmentChips(doc)
  chip.dispatchEvent(new FakeEvent('spPreview'))
  chip.dispatchEvent(new FakeEvent('spDownload'))
  evil.dispatchEvent(new FakeEvent('spDownload'))
  assert.deepEqual(clicked, [['/files/invoice.pdf', false, '_blank'], ['/files/invoice.pdf', true, '_blank']])
  assert.equal(doc.querySelectorAll('a').length, 0, 'the link is gone once followed')
})

// ── the embedded component's sinks ─────────────────────────────────────────────────────────
test('embedded: a content sink fires the page action (with its surface), tiles and kanban moves their own events', () => {
  const sinks = {}
  const b = new Proxy({}, { get: (t, name) => (name === 'connectivity' || name === 'setTransportHooks' ? undefined : (fn) => { sinks[name] = fn }) })
  const fired = []
  const runtime = { fireEvent: (name, payload) => fired.push([name, payload]), $application: { variables: {} } }
  installEmbeddedContentRuntime(b, runtime)
  sinks.setRowSelectSink('pickGuest', { _clickedRow: { guest: 'Ada' } }, { surfaceId: 'isl-1', fromNested: true })
  sinks.setFactActionSink('editFact', {}, null)
  sinks.setTileReorderSink()
  sinks.setKanbanMoveSink({ key: 'c1', move: { to: 'done' } })
  assert.deepEqual(fired, [
    ['application:mateuElementEvent', { actionId: 'pickGuest', parameters: { _clickedRow: { guest: 'Ada' } }, fromNested: true, surfaceId: 'isl-1' }],
    ['application:mateuElementEvent', { actionId: 'editFact', parameters: {}, fromNested: false, surfaceId: '' }],
    ['application:mateuTilesReordered', { scope: '' }],
    ['application:mateuKanbanMove', { key: 'c1', move: { to: 'done' }, surfaceId: '' }],
  ])
})

// ── transport: what the error band says, the connectivity band, the double-submit guard ──────
test('resilience: a gone record and an unexplained failure say so in plain words; the band follows reachability', () => {
  const gone = classifyRequestFailure({ status: 410 })
  assert.deepEqual([gone.kind, gone.retryable, gone.message], ['notFound', false, chromeText('errNotFound')])
  const odd = classifyRequestFailure({ message: 'weird' }, { online: true })
  assert.deepEqual([odd.kind, odd.message], ['unknown', chromeText('errUnknown')])
  connectivity.reset()
  const seen = []
  const off = connectivity.subscribe((online) => seen.push(online))
  connectivity.noteUnreachable()
  connectivity.noteUnreachable() // still down: no second notice
  connectivity.noteReachable()
  off()
  connectivity.noteUnreachable()
  assert.deepEqual(seen, [false, true], 'only the changes, and only while subscribed')
  connectivity.reset()
  pendingActions.reset()
  const key = pendingActions.key('cmp', 'save')
  assert.equal(pendingActions.isPending(key), false)
  assert.ok(pendingActions.begin(key, 1000))
  assert.equal(pendingActions.isPending(key, 2000), true)
  assert.equal(pendingActions.isPending(key, 1000 + 120001), false, 'a dead entry is released by time')
  pendingActions.end(key)
  assert.equal(pendingActions.isPending(key, 2000), false)
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
console.log(`\n${passed}/${tests.length} explorer coverage tests ${passed === tests.length ? 'OK' : 'FAILED'}`)
