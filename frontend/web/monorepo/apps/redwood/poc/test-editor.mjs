// Tests of the visual editor's Redwood canvas (editorPreview.mjs + the node ids of the projection):
// the editor frames this app and hands it the increment, the app answers its own /mateu calls with
// it, and — only in that mode — what it paints carries the definition's node ids, so a click
// selects the node it came from. A production page must never carry them.
// Run: node test-editor.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  islandContentOf, setEditorNodeIds, fieldListOf, actionsOf, formSectionsOf, welcomeOf, itemOverviewOf,
  reduceContexts, HOST_ID, summarizeHost, listingOf, smartFiltersOf,
} from './reduceContexts.mjs'
import {
  PREVIEW_ROUTE, isEditorPreview, previewAppIncrement, previewLoadIncrement, previewAnswerOf, previewFetch,
  stampNodeIds, nodeIdOfPath, elementOfNodeId, nodeBoxesOf, pressTracker, installEditorPreview, DRAG_THRESHOLD,
} from './editorPreview.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const pending = []
const test = (name, fn) => {
  const done = () => { passed++; console.log('  ✓ ' + name) }
  const r = fn()
  if (r && typeof r.then === 'function') pending.push(r.then(done))
  else done()
}
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id, metadata, children })
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

// a definition as the editor's preview sends it: every node with its synthetic ve-<path> id
const page = () => node({ type: 'VerticalLayout' }, [
  node({ type: 'Text', text: 'Hello' }, [], 've-0'),
  node({ type: 'Card' }, [node({ type: 'Text', text: 'inside' }, [], 've-1-0')], 've-1'),
  node({ type: 'HorizontalLayout' }, [
    node({ type: 'Button', label: 'Save', actionId: 'save' }, [], 've-2-0'),
    node({ type: 'Button', label: 'Cancel', actionId: 'cancel' }, [], 've-2-1'),
  ], 've-2'),
  node({ type: 'FormLayout', maxColumns: 2 }, [
    node({ type: 'FormField', fieldId: 'name', dataType: 'string', label: 'Name' }, [], 've-3-0'),
    node({ type: 'FormField', fieldId: 'email', dataType: 'string', label: 'Email' }, [], 've-3-1'),
  ], 've-3'),
], 've-root')

const project = () => islandContentOf({ tree: page(), state: {}, data: {} })

test('production: the projection carries no editor id at all', () => {
  setEditorNodeIds(false)
  assert.ok(!JSON.stringify(project()).includes('nodeId'))
  assert.ok(!JSON.stringify(fieldListOf(page(), {}, {})).includes('nodeId'))
  assert.ok(!JSON.stringify(actionsOf(page())).includes('nodeId'))
})

test('editor mode: every atom carries the id of the wire node it came from', () => {
  setEditorNodeIds(true)
  try {
    const blocks = project()
    const atoms = blocks.flatMap((b) => b.items || [])
    assert.equal(atoms.find((a) => a.isText && a.text === 'Hello').nodeId, 've-0')
    // a card block is its node's; the atoms inside it are their own nodes'
    const card = blocks.find((b) => b.isCard)
    assert.equal(card.nodeId, 've-1')
    assert.equal(card.items.find((a) => a.text === 'inside').nodeId, 've-1-0')
    // consecutive buttons share an atom: each button keeps its own node
    const buttons = atoms.find((a) => a.isButtons).buttons
    assert.deepEqual(buttons.map((b) => b.nodeId), ['ve-2-0', 've-2-1'])
    // a form layout atom is the FormLayout's; each of its fields is its FormField's
    const form = atoms.find((a) => a.isFormLayout)
    assert.equal(form.nodeId, 've-3')
    assert.deepEqual(form.fields.map((f) => f.nodeId), ['ve-3-0', 've-3-1'])
    // the implicit run of loose atoms belongs to nobody (a click on it must not pick the first atom)
    assert.ok(blocks.filter((b) => b.isPlain).every((b) => b.nodeId === undefined))
  } finally {
    setEditorNodeIds(false)
  }
})

test('editor mode: the generic form (fields, sections, buttons) carries the node ids too', () => {
  setEditorNodeIds(true)
  try {
    assert.deepEqual(fieldListOf(page(), {}, {}).map((f) => f.nodeId), ['ve-3-0', 've-3-1'])
    assert.deepEqual(formSectionsOf(page(), {}, {})[0].fields.map((f) => f.nodeId), ['ve-3-0', 've-3-1'])
    assert.deepEqual(actionsOf(page()).map((a) => a.nodeId), ['ve-2-0', 've-2-1'])
  } finally {
    setEditorNodeIds(false)
  }
})

test('the app answers its bootstrap with a one-route App whose home is the preview', () => {
  const app = previewAnswerOf('/mateu/v3/components/_/action', { initiatorComponentId: 'shell' }, null)
  const md = app.fragments[0].component.metadata
  assert.equal(app.fragments[0].targetComponentId, 'shell')
  assert.equal(md.type, 'App')
  assert.equal(md.homeRoute, PREVIEW_ROUTE)
  assert.deepEqual(md.menu.map((m) => m.route), [PREVIEW_ROUTE])
})

test('the route load answers the edited tree, wrapped as a real route content arrives', () => {
  const fragment = { component: page(), state: { name: 'Ada' }, data: { x: 1 } }
  const inc = previewAnswerOf('/mateu/v3/sync/preview', { actionId: '', route: '/preview', initiatorComponentId: '' }, fragment)
  const f = inc.fragments[0]
  assert.equal(f.targetComponentId, '')
  assert.equal(f.component.type, 'ServerSide')
  assert.equal(f.component.route, '/preview')
  assert.equal(f.component.children[0], fragment.component)
  assert.deepEqual(f.state, { name: 'Ada' })
  assert.deepEqual(f.component.initialData, { name: 'Ada' })
  // nothing handed over yet: an empty page, not a crash
  assert.deepEqual(previewLoadIncrement(null).fragments, [])
})

test('anything else does nothing: an action, a search, the client log — and the rest is not ours', () => {
  assert.deepEqual(previewAnswerOf('/mateu/v3/sync/preview', { actionId: 'search' }, page()).fragments, [])
  assert.deepEqual(previewAnswerOf('/mateu/v3/client-log', {}, null).fragments, [])
  assert.equal(previewAnswerOf('https://api.example.com/items', {}, null), null)
})

test('previewFetch answers the load once the editor hands the fragment over, and lets the rest through', async () => {
  let handOver
  const handed = new Promise((resolve) => { handOver = resolve })
  const outside = []
  const fetch = previewFetch(async (url) => { outside.push(url); return { ok: true } }, () => handed)
  const load = fetch('/mateu/v3/sync/preview', { method: 'POST', body: JSON.stringify({ actionId: '', route: '/preview' }) })
  handOver({ component: node({ type: 'Text', text: 'late' }, [], 've-0') })
  const json = await (await load).json()
  assert.equal(json.fragments[0].component.children[0].metadata.text, 'late')
  await fetch('https://cdn.example.com/x.js')
  assert.deepEqual(outside, ['https://cdn.example.com/x.js'])
})

// a tiny DOM: elements with children and attributes, enough for the stamping walk
const el = (data, children = []) => {
  const attrs = {}
  return {
    data, children, attrs,
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = String(v) },
    hasAttribute: (k) => k in attrs,
    removeAttribute: (k) => { delete attrs[k] },
  }
}

test('stamping: the outermost element of an atom carries its id; a nested object of the same atom inherits', () => {
  const atom = { nodeId: 've-0' }
  const group = { label: 'g' } // a nested for-each item with no node of its own
  const inner = el(group)
  const wrapper = el(atom, [el(atom, [inner])])
  const button = el({ nodeId: 've-2-0' })
  const root = el(undefined, [wrapper, el({ isButtons: true }, [button])])
  const count = stampNodeIds(root, (e) => e.data)
  assert.equal(count, 2)
  assert.equal(wrapper.getAttribute('data-node-id'), 've-0')
  assert.equal(wrapper.children[0].getAttribute('data-node-id'), null, 'same atom: not stamped twice')
  assert.equal(inner.getAttribute('data-node-id'), null)
  assert.equal(button.getAttribute('data-node-id'), 've-2-0')
})

test('stamping: an element re-used for data with no node loses its stale id', () => {
  const reused = el({ text: 'no node' })
  reused.setAttribute('data-node-id', 've-9')
  stampNodeIds(el(undefined, [reused]), (e) => e.data)
  assert.equal(reused.getAttribute('data-node-id'), null)
})

test('a click selects the nearest stamped element of its path', () => {
  const button = el({}); button.setAttribute('data-node-id', 've-2-0')
  assert.equal(nodeIdOfPath([el({}), button, el({})]), 've-2-0')
  assert.equal(nodeIdOfPath([{}, null]), null)
  const doc = { querySelector: (sel) => (sel === '[data-node-id="ve-2-0"]' ? button : null) }
  assert.equal(elementOfNodeId(doc, 've-2-0'), button)
  assert.equal(elementOfNodeId(doc, null), null)
})

test('only the editor preview page enters the mode, and the shell wires it before the bootstrap', () => {
  assert.equal(isEditorPreview({}), false)
  assert.equal(isEditorPreview({ __mateuEditorPreview: true }), true)
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  const guard = shell.indexOf('if (bridge.isEditorPreview(window))')
  assert.ok(guard > 0)
  // the ids are switched on INSIDE the guard, never unconditionally
  assert.equal(shell.split('setEditorNodeIds(').length - 1, 1)
  assert.ok(shell.indexOf('setEditorNodeIds(true)') > guard)
  assert.ok(shell.indexOf('installEditorPreview(') < shell.indexOf('bridge.bootstrapShell(base)'))
})

// the Welcome page template, as the editor's preview sends it (expanded, with ve-<path> ids)
const welcome = () => node({ type: 'VerticalLayout' }, [
  node({ type: 'HeroSection', title: 'Welcome', subtitle: 'Hi' }, [
    node({ type: 'Button', label: 'Get started', actionId: 'getStarted' }, [], 've-0-0'),
    node({ type: 'Button', label: 'Learn more', actionId: 'learnMore' }, [], 've-0-1'),
  ], 've-0'),
  node({ type: 'DashboardLayout', columns: 3 }, [
    node({ type: 'DashboardPanel', title: 'Orders' }, [node({ type: 'Text', text: 'Track orders.' }, [], 've-1-items.0-0')], 've-1-items.0'),
    node({ type: 'DashboardPanel', title: 'Customers' }, [node({ type: 'Text', text: 'Everyone.' }, [], 've-1-items.1-0')], 've-1-items.1'),
  ], 've-1'),
], 've-root')

test('editor mode: the welcome banner, its CTAs, its tiles and their texts carry their node ids', () => {
  setEditorNodeIds(false)
  const plain = welcomeOf({ tree: welcome(), state: {}, data: {} })
  assert.ok(!JSON.stringify(plain).includes('ve-'), 'production: no editor id')
  setEditorNodeIds(true)
  try {
    const w = welcomeOf({ tree: welcome(), state: {}, data: {} })
    assert.equal(w.nodeId, 've-0')
    assert.equal(w.ctaNodeIds, 've-0-0 ve-0-1')
    assert.equal(w.tilesNodeId, 've-1')
    assert.deepEqual(w.tiles.map((t) => t.nodeId), ['ve-1-items.0', 've-1-items.1'])
    assert.deepEqual(w.tiles[0].textNodes, [{ text: 'Track orders.', nodeId: 've-1-items.0-0' }])
  } finally {
    setEditorNodeIds(false)
  }
})

test('editor mode: a dashboard panel is its own node (not the layout\'s), and each metric is its MetricCard\'s', () => {
  const dashboard = node({ type: 'VerticalLayout' }, [
    node({ type: 'Scoreboard' }, [
      node({ type: 'MetricCard', title: 'Revenue', value: '1.2M' }, [], 've-0-metrics.0'),
      node({ type: 'MetricCard', title: 'Orders', value: '3' }, [], 've-0-metrics.1'),
    ], 've-0'),
    node({ type: 'DashboardLayout', columns: 2 }, [
      node({ type: 'DashboardPanel', title: 'Sales' }, [node({ type: 'Text', text: 'chart' }, [], 've-1-items.0-0')], 've-1-items.0'),
      node({ type: 'DashboardPanel', title: 'Latest' }, [node({ type: 'Text', text: 'list' }, [], 've-1-items.1-0')], 've-1-items.1'),
    ], 've-1'),
  ], 've-root')
  setEditorNodeIds(true)
  try {
    const blocks = islandContentOf({ tree: dashboard, state: {}, data: {} })
    const all = JSON.stringify(blocks)
    for (const id of ['ve-0-metrics.0', 've-0-metrics.1', 've-1-items.0', 've-1-items.1', 've-1-items.0-0', 've-1-items.1-0']) {
      assert.ok(all.includes(`"nodeId":"${id}"`), id + ' is projected')
    }
  } finally {
    setEditorNodeIds(false)
  }
})

test('editor mode: an item overview\'s key panel, tab bar and tabs carry their node ids', () => {
  const tree = node({ type: 'HorizontalLayout' }, [
    node({ type: 'Card', content: node({ type: 'Text', text: 'key' }, [], 've-0-0') }, [], 've-0'),
    node({ type: 'TabLayout' }, [
      node({ type: 'Tab', label: 'Details' }, [node({ type: 'Text', text: 'd' }, [], 've-1-tabs.0-0')], 've-1-tabs.0'),
      node({ type: 'Tab', label: 'History' }, [node({ type: 'Text', text: 'h' }, [], 've-1-tabs.1-0')], 've-1-tabs.1'),
    ], 've-1'),
  ], 've-root')
  setEditorNodeIds(true)
  try {
    const ov = itemOverviewOf({ tree, state: {}, data: {} })
    assert.equal(ov.keyNodeId, 've-0')
    assert.equal(ov.tabsNodeId, 've-1')
    assert.deepEqual(ov.tabs.map((t) => t.nodeId), ['ve-1-tabs.0', 've-1-tabs.1'])
  } finally {
    setEditorNodeIds(false)
  }
})

test('stamping: an id the page binds itself is kept, its children inherit it, and its buttons get theirs in order', () => {
  const b1 = el({}); const b2 = el({})
  const banner = el(undefined, [el(undefined, [b1, b2])])
  banner.setAttribute('data-node-bound', '')
  banner.setAttribute('data-node-id', 've-0')
  banner.setAttribute('data-node-buttons', 've-0-0 ve-0-1')
  banner.querySelectorAll = () => [b1, b2]
  const inside = el({ text: 'no node of its own' })
  banner.children.push(inside)
  const count = stampNodeIds(el(undefined, [banner]), (e) => e.data)
  assert.equal(banner.getAttribute('data-node-id'), 've-0', 'not wiped as stale')
  assert.equal(b1.getAttribute('data-node-id'), 've-0-0')
  assert.equal(b2.getAttribute('data-node-id'), 've-0-1')
  assert.equal(inside.getAttribute('data-node-id'), null)
  assert.ok(count >= 1)
})

test('a drag measures the page: every painted node\'s box, nothing unpainted', () => {
  const box = (id, r) => ({ getAttribute: (n) => (n === 'data-node-id' ? id : null), getBoundingClientRect: () => r })
  const doc = { querySelectorAll: (sel) => (sel === '[data-node-id]' ? [
    box('ve-0', { left: 10, top: 20, width: 300, height: 40 }),
    box('ve-1', { left: 0, top: 0, width: 0, height: 0 }), // hidden: a tab not showing
  ] : []) }
  assert.deepEqual(nodeBoxesOf(doc), [{ id: 've-0', left: 10, top: 20, width: 300, height: 40 }])
})

// A YAML `type: Listing` with `filters:`, as the editor's expander hands it (canvas and Play): a bare
// ClientSide Crud — no ServerSide page, so no `pageType: collection` either. Its filters are FormFields
// on the wire, and the page used to be taken for a FORM: each filter came out again as a loose field
// (a «Status» select) under the grid. They belong to the listing's search header only.
const filteredListing = () => ({
  id: 'crud', sizing: 'fill', type: 'ClientSide', children: [],
  metadata: {
    type: 'Crud', crudlType: 'table', title: 'Products', searchable: true, pageSize: 10,
    rowsSource: { ref: 'products' },
    filters: [{ type: 'FormField', fieldId: 'status', label: 'Status', stereotype: 'select', dataType: 'string',
      options: [{ value: 'AVAILABLE', label: 'Available' }, { value: 'OUT_OF_STOCK', label: 'Out of stock' }] }],
    columns: [
      node({ type: 'GridColumn', id: 'name', label: 'Name' }, [], 'name'),
      node({ type: 'GridColumn', id: 'status', label: 'Status', dataType: 'status' }, [], 'status'),
    ],
  },
})
const previewed = (component) => reduceContexts(
  reduceContexts({ contexts: {}, stack: [], shell: null }, previewAppIncrement()),
  previewLoadIncrement({ component }, { route: PREVIEW_ROUTE }))

test('a previewed listing\'s filters go to its search header, never to a form under the grid', async () => {
  const reg = previewed(filteredListing())
  const summary = summarizeHost(reg, PREVIEW_ROUTE)
  assert.equal(reg.contexts[HOST_ID].pageType, undefined, 'the case: no pageType on the wire')
  assert.equal(summary.formMetadata, null)
  assert.deepEqual(summary.fields, [])
  assert.deepEqual(summary.sections, [])
  const listing = listingOf(reg.contexts[HOST_ID])
  assert.deepEqual(listing.filters.map((f) => [f.fieldId, f.kind, f.options.map((o) => o.value)]),
    [['status', 'options', ['AVAILABLE', 'OUT_OF_STOCK']]])
  // …which the header's smart filters offer (the search box's dropdown)
  const config = await smartFiltersOf(listing.filters, {}, '')
  assert.ok(config.suggestions, 'the filter is offered by the smart-filter search')
})

test('a page with a form AND a listing keeps its own fields in the form, without the listing\'s filters', () => {
  const page = node({ type: 'VerticalLayout' }, [
    node({ type: 'FormField', fieldId: 'name', label: 'Name', dataType: 'string', stereotype: 'regular' }, [], 'name'),
    filteredListing(),
  ])
  const summary = summarizeHost(previewed(page), PREVIEW_ROUTE)
  assert.deepEqual(Object.keys(summary.formMetadata), ['name'])
  assert.deepEqual(summary.fields.map((f) => f.fieldId), ['name'])
})

// ── moving a node: a press in the frame is relayed, the editor drives the drag ──
// The editor's canvas starts a MOVE drag from a press on a node (past its 4 px threshold). A press
// inside this iframe never reaches the editor's window — and while the button is down the browser
// keeps the mouse here — so the frame relays the press, the moves and the release.
const mouse = (x, y, extra = {}) => ({ button: 0, buttons: 1, clientX: x, clientY: y, ...extra })

test('a press on a node is relayed with its moves and release; a press that travelled swallows its click', () => {
  const t = pressTracker()
  assert.equal(DRAG_THRESHOLD, 4)
  assert.deepEqual(t.down(mouse(10, 20), 've-0-1'), { kind: 'press', id: 've-0-1', x: 10, y: 20 })
  assert.deepEqual(t.move(mouse(12, 21)), { kind: 'pointer', phase: 'move', x: 12, y: 21 })
  assert.deepEqual(t.move(mouse(40, 80)), { kind: 'pointer', phase: 'move', x: 40, y: 80 })
  assert.deepEqual(t.up(mouse(40, 80, { buttons: 0 })), { kind: 'pointer', phase: 'up', x: 40, y: 80 })
  assert.equal(t.swallowClick(), true, 'the click ending a drag is not a selection')
  assert.equal(t.swallowClick(), false, '…only that one')
  assert.equal(t.move(mouse(50, 90)), null, 'no press, nothing relayed')
})

test('a press that does not travel stays a click (the selection), and nothing else starts a drag', () => {
  const t = pressTracker()
  t.down(mouse(10, 20), 've-0')
  t.move(mouse(12, 21)) // under the threshold
  t.up(mouse(12, 21, { buttons: 0 }))
  assert.equal(t.swallowClick(), false)
  // the page's bare background, another button: no press for the editor
  assert.equal(t.down(mouse(10, 20), null), null)
  assert.equal(t.down(mouse(10, 20, { button: 2 }), 've-0'), null)
  assert.equal(t.move(mouse(30, 30)), null)
  // released where the frame did not see it (the editor had the pointer): the next move forgets it
  t.down(mouse(10, 20), 've-0')
  assert.equal(t.move(mouse(40, 40, { buttons: 0 })), null)
  assert.equal(t.up(mouse(40, 40)), null)
  assert.equal(t.swallowClick(), false)
})

test('installed, the frame posts press → pointer → up to the editor, and the dragged click selects nothing', () => {
  // a window just big enough for installEditorPreview: listeners in order, stopImmediatePropagation honoured
  const listeners = []
  const posted = []
  const el = (attrs = {}) => ({
    children: [], style: {}, className: '', classList: { add() {}, toggle() {} },
    getAttribute: (n) => (n in attrs ? attrs[n] : null), hasAttribute: (n) => n in attrs,
    appendChild(c) { this.children.push(c); return c }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
  })
  const doc = {
    documentElement: { ...el(), addEventListener() {} }, head: el(), body: el(),
    createElement: () => el(), getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  }
  const win = {
    document: doc, fetch: async () => ({}), parent: { postMessage: (m) => posted.push(m) },
    MutationObserver: class { observe() {} }, requestAnimationFrame() {}, setTimeout() { return 0 }, clearTimeout() {},
    addEventListener: (type, fn) => listeners.push({ type, fn }),
  }
  installEditorPreview(win, {})
  const fire = (type, ev) => {
    let stopped = false
    const e = { ...ev, type, preventDefault() {}, stopImmediatePropagation() { stopped = true } }
    for (const l of listeners) { if (l.type === type) l.fn(e); if (stopped) break }
  }
  const field = el({ 'data-node-id': 've-1' })
  const at = (x, y, extra) => ({ ...mouse(x, y, extra), composedPath: () => [field] })
  posted.length = 0
  // pointer events: the inert guard cancels pointerdown, which suppresses mousedown/mouseup altogether
  fire('pointerdown', at(10, 20))
  fire('mousedown', at(10, 20))
  fire('pointermove', at(30, 60))
  fire('pointerup', at(30, 60, { buttons: 0 }))
  fire('click', at(30, 60, { buttons: 0 }))
  assert.deepEqual(posted.map((m) => m.mateuPreview + (m.phase ? ':' + m.phase : '')), ['press', 'pointer:move', 'pointer:up'])
  assert.deepEqual(posted[0], { mateuPreview: 'press', kind: 'press', id: 've-1', x: 10, y: 20 })
  // a plain click (no travel) still selects
  posted.length = 0
  fire('pointerdown', at(10, 20))
  fire('pointerup', at(10, 20, { buttons: 0 }))
  fire('click', at(10, 20, { buttons: 0 }))
  assert.deepEqual(posted.map((m) => m.mateuPreview), ['press', 'pointer', 'click'])
  assert.equal(posted[2].id, 've-1')
})

await Promise.all(pending)
console.log(`\n${passed} editor-preview tests OK`)
