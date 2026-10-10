// Tests of the visual editor's Redwood canvas (editorPreview.mjs + the node ids of the projection):
// the editor frames this app and hands it the increment, the app answers its own /mateu calls with
// it, and — only in that mode — what it paints carries the definition's node ids, so a click
// selects the node it came from. A production page must never carry them.
// Run: node test-editor.mjs (npm test runs it with the other suites).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { islandContentOf, setEditorNodeIds, fieldListOf, actionsOf, formSectionsOf } from './reduceContexts.mjs'
import {
  PREVIEW_ROUTE, isEditorPreview, previewAppIncrement, previewLoadIncrement, previewAnswerOf, previewFetch,
  stampNodeIds, nodeIdOfPath, elementOfNodeId,
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

await Promise.all(pending)
console.log(`\n${passed} editor-preview tests OK`)
