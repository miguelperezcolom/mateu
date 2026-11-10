// What a Java ISLAND embedded in an Explorer page (an inline ServerSide: a calendar, a map, a wizard,
// a form…) sends — the Explorer review found it all going to the host page (403) or not at all:
// actions fired from the island's own components, typed values, its triggers, its shortcuts, its
// rows, its ${data}/${appState}/${appData} texts, a catalogue flow inside an embedded page.
// Run: node test-explorer-islands.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { islandContentOf, reduceContexts, tagSurfaceActions, foldoutOf, HOST_ID } from './reduceContexts.mjs'
import { surfaceOfNode, surfaceAtomOf, surfaceOfEvent, SURFACE_ATTR } from './surfaces.mjs'
import { stampSurfaces } from './make-html.mjs'
import { surfaceFieldEditOf, pageFlowOf } from './shellFlows.mjs'
import { setShortcutContexts, currentShortcutActions, setShortcutContext } from './keys.mjs'
import { rowShortcutIndexOf } from './tables.mjs'
import { runSurfaceAction } from './transport.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const pending = []
const test = (name, fn) => { pending.push([name, fn]) }
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id: id || metadata.id || '', metadata, children })
const atomsOf = (ctx) => (islandContentOf(ctx) || []).flatMap((b) => b.items || [])

// a minimal DOM: elements with attributes, a parent and (optionally) a shadow root's host
const el = (attrs = {}, parent = null) => ({
  nodeType: 1, parentElement: parent, attrs,
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null },
  getRootNode() { return { host: null } },
})

test('every atom of a surface carries its surfaceId, and so does any object naming a …ActionId', () => {
  const tagged = tagSurfaceActions([
    { isMap: true, mapSpec: '{}' },
    { isCalendar: true, nav: { create: 'x' }, days: [{ dayActionId: 'dayClicked' }] },
    { isRow: true, items: [{ label: 'Go', actionId: 'go' }, { label: 'plain' }] },
  ], 'island-1')
  assert.equal(tagged[0].surfaceId, 'island-1')
  assert.equal(tagged[1].surfaceId, 'island-1')
  assert.equal(tagged[1].days[0].surfaceId, 'island-1')
  assert.equal(tagged[1].nav.surfaceId, undefined)
  assert.equal(tagged[2].items[0].surfaceId, 'island-1')
  assert.equal(tagged[2].items[1].surfaceId, undefined)
})

test('make-html stamps data-mateu-surface-id LAST on every atom root (not on the bind-* roots)', () => {
  const out = stampSurfaces([
    '<template>',
    '  <oj-bind-if test="[[ $current.data.isMap ]]">',
    '    <div class="mateu-map" :data-x="[[ a > b ]]"',
    '      :style="[[ s ]]"></div>',
    '  </oj-bind-if>',
    '  <oj-bind-if test="[[ $current.data.isList ]]">',
    '    <oj-bind-for-each data="[[ x ]]"><template><span></span></template></oj-bind-for-each>',
    '  </oj-bind-if>',
    '</template>',
  ].join('\n'))
  assert.match(out, /<div class="mateu-map" :data-x="\[\[ a > b \]\]"\n {6}:style="\[\[ s \]\]" :data-mateu-surface-id="\[\[ \$current\.data\.surfaceId \]\]"><\/div>/)
  assert.doesNotMatch(out, /<oj-bind-for-each[^>]*data-mateu-surface-id/)
  // the real page: the atoms' roots carry it (a calendar's, a map's, a grid's)
  const page = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  assert.match(page, /class="mateu-map oj-sm-margin-2x-bottom"[^>]*:data-mateu-surface-id="\[\[ \$current\.data\.surfaceId \]\]"/)
  assert.match(page, /class="mateu-addons" :data-mateu-surface-id=/)
})

test('a DOM sink finds the surface by walking up from the node that fired; the host keeps its routing', () => {
  const root = el({ [SURFACE_ATTR]: 'island-7' })
  const inner = el({}, el({}, root))
  assert.equal(surfaceOfNode(inner), 'island-7')
  assert.equal(surfaceOfNode(el({}, el())), '')
  assert.deepEqual(surfaceAtomOf(inner), { surfaceId: 'island-7' })
  assert.deepEqual(surfaceAtomOf(el()), {}, 'painted among the host atoms: the sink third argument as before')
  assert.deepEqual(surfaceAtomOf(inner, { surfaceId: 'own', fromNested: true }), { surfaceId: 'own', fromNested: true })
  // VB hands a chain a COPY of the event: composedPath throws, the target still tells
  const copy = { target: inner, composedPath() { throw new TypeError('Illegal invocation') } }
  assert.equal(surfaceOfEvent(copy), 'island-7')
  // across a shadow root (a JET element's inner node)
  const shadowChild = { nodeType: 1, parentElement: null, getAttribute: () => null, getRootNode: () => ({ host: root }) }
  assert.equal(surfaceOfNode(shadowChild), 'island-7')
})

const island = (extra = {}) => ({
  id: 'isl', kind: 'island', state: { name: null, quantity: 1 }, data: {},
  outbound: { route: '/page', serverSideType: 'x.Island', baseUrl: '' },
  tree: { type: 'ServerSide', id: 'isl', serverSideType: 'x.Island', actions: [], triggers: [], children: [] },
  ...extra,
})
const regWith = (ctx) => ({ contexts: { [HOST_ID]: { id: HOST_ID, state: {}, tree: { type: 'ServerSide' } }, [ctx.id]: ctx }, stack: [], effects: {} })

test('a value typed in an island field goes to the ISLAND state (its next request carries it)', () => {
  const reg = regWith(island())
  const edit = surfaceFieldEditOf(reg, 'isl', 'name', 'Ada')
  assert.equal(edit.registry.contexts.isl.state.name, 'Ada')
  assert.equal(edit.actionId, '')
  assert.equal(surfaceFieldEditOf(reg, 'nope', 'name', 'Ada'), null, 'an unknown surface falls back to the host draft')
  assert.equal(surfaceFieldEditOf(reg, HOST_ID, 'name', 'Ada'), null)
})

test('the island\'s OnValueChange / @AutoSave fire against it; a keystroke only feeds the auto-save', () => {
  const vc = regWith(island({ tree: { type: 'ServerSide', id: 'isl', triggers: [{ type: 'OnValueChange', propertyName: 'quantity', actionId: 'recalculate' }] } }))
  assert.equal(surfaceFieldEditOf(vc, 'isl', 'quantity', 3).actionId, 'recalculate')
  assert.equal(surfaceFieldEditOf(vc, 'isl', 'name', 'x').actionId, '')
  const auto = regWith(island({ tree: { type: 'ServerSide', id: 'isl', triggers: [{ type: 'AutoSave', actionId: 'save', debounceMillis: 800 }] } }))
  const typed = surfaceFieldEditOf(auto, 'isl', 'name', 'Ad', { typing: true })
  assert.deepEqual([typed.actionId, typed.debounceMillis, typed.registry.contexts.isl.state.name], ['save', 800, 'Ad'])
  assert.equal(surfaceFieldEditOf(auto, 'isl', 'name', null).actionId, '', 'no change, no save')
  assert.equal(surfaceFieldEditOf(vc, 'isl', 'name', 'Ad', { typing: true }).changed, false, 'no auto-save: a keystroke is ignored')
})

test('an island\'s @Action(shortcut)s count, carrying the island; the host\'s win on the same keys', () => {
  const reg = regWith(island({ tree: { type: 'ServerSide', id: 'isl', actions: [{ id: 'recalculate', shortcut: 'ctrl+alt+r' }, { id: 'clash', shortcut: 'ctrl+s' }] } }))
  reg.contexts[HOST_ID].tree.actions = [{ id: 'save', shortcut: 'ctrl+s' }]
  setShortcutContexts(reg, HOST_ID)
  assert.deepEqual(currentShortcutActions(), [
    { id: 'save', shortcut: 'ctrl+s' },
    { id: 'recalculate', shortcut: 'ctrl+alt+r', surfaceId: 'isl' },
  ])
  setShortcutContext(null)
})

test('an answer\'s appState / appData are kept app-wide and the texts read them, with the component data', () => {
  let reg = { contexts: {}, stack: [] }
  reg = reduceContexts(reg, { fragments: [], commands: [], messages: [], appState: { language: 'es' } })
  reg = reduceContexts(reg, { fragments: [], commands: [], messages: [], appData: { museum: 'Rijksmuseum' } })
  reg = reduceContexts(reg, { fragments: [], commands: [], messages: [] })
  assert.deepEqual([reg.appState, reg.appData], [{ language: 'es' }, { museum: 'Rijksmuseum' }])
  const texts = atomsOf({ state: { visitors: 3 }, data: { lastUpdate: '10:00' }, tree: node({ type: 'VerticalLayout' }, [
    node({ type: 'Text', text: 'v=${state.visitors} d=${data.lastUpdate} s=${appState.language} a=${appData.museum}' }),
  ]) }).filter((a) => a.isText).map((a) => a.text)
  assert.deepEqual(texts, ['v=3 d=10:00 s=es a=Rijksmuseum'])
  reduceContexts({ contexts: {}, stack: [] }, { fragments: [] }) // leave no app scope behind
})

test('a catalogue flow fired inside an embedded page runs client-side and still navigates', async () => {
  const reg = { ...regWith(island()), shell: { actionCatalogue: [{ id: 'goHome', commands: [{ type: 'MarkAsClean' }, { type: 'NavigateTo', data: '/home' }] }] } }
  assert.ok(pageFlowOf(reg, 'goHome', { state: {} }, 'isl'))
  const fetched = []
  const saved = globalThis.fetch
  globalThis.fetch = async (...args) => { fetched.push(args); throw new Error('no server') }
  try {
    const next = await runSurfaceAction(reg, 'isl', 'goHome', {})
    assert.equal(fetched.length, 0, 'nothing posted')
    assert.equal(next.effects.navigate.route, '/home')
  } finally { globalThis.fetch = saved }
})

test('@OnRowSelected on a grid field: the grid atom carries the action, its shortcut and the clean rows', () => {
  const grid = node({ type: 'FormField', fieldId: 'guests', onItemSelectionActionId: 'pick', rowSelectionShortcut: 'ctrl+shift',
    columns: [{ id: 'guest', label: 'Guest' }] })
  const [atom] = atomsOf({ state: { guests: [{ guest: 'Ada', _rowNumber: 0 }, { guest: 'Alan' }] }, tree: node({ type: 'VerticalLayout' }, [grid]) }).filter((a) => a.isGrid)
  assert.deepEqual([atom.selectActionId, atom.selectShortcut], ['pick', 'ctrl+shift'])
  assert.deepEqual(JSON.parse(atom.selectRows), [{ guest: 'Ada' }, { guest: 'Alan' }])
  const plain = atomsOf({ state: {}, tree: node({ type: 'VerticalLayout' }, [node({ type: 'FormField', fieldId: 'g', columns: [{ id: 'a' }] })]) }).find((a) => a.isGrid)
  assert.equal(plain.selectActionId, undefined)
  const key = (code, mods = {}) => ({ code, key: code.slice(-1), ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods })
  assert.equal(rowShortcutIndexOf('ctrl+shift', key('Digit3', { ctrlKey: true, shiftKey: true })), 2)
  assert.equal(rowShortcutIndexOf('ctrl+shift', key('Numpad1', { ctrlKey: true, shiftKey: true })), 0)
  assert.equal(rowShortcutIndexOf('ctrl+shift', key('Digit3', { ctrlKey: true })), null)
  const page = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
  assert.match(page, /:data-row-select-action="\[\[ \$current\.data\.selectActionId \|\| null \]\]"/)
})

test('a foldout an inline island holds sends its navigation back to the island', () => {
  const foldout = node({ type: 'FoldoutLayout', panels: [], navigation: { nextActionId: 'nextExhibition' } }, [], 'f')
  const tree = { type: 'ServerSide', id: 'host', children: [node({ type: 'Form', title: 'Entry' }, [
    { type: 'ServerSide', id: 'isl-9', serverSideType: 'x.Foldout', children: [foldout] },
  ])] }
  assert.equal(foldoutOf({ tree, state: {} }).surfaceId, 'isl-9')
  assert.equal(foldoutOf({ tree: { type: 'ServerSide', id: 'host', children: [foldout] }, state: {} }).surfaceId, undefined)
  const json = JSON.parse(readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.json'), 'utf8'))
  for (const k of ['foldoutGoToParent', 'foldoutPrevious', 'foldoutNext']) {
    assert.equal(json.eventListeners[k].chains[0].parameters.surfaceId, '{{ $application.variables.mateuFoldoutContent.surfaceId }}')
  }
})

test('the chains that dispatch an island atom forward its surface', () => {
  const chain = (n) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page-chains', n), 'utf8')
  assert.match(chain('hostInputChanged.js'), /surfaceFieldEditOf/)
  assert.match(chain('hostInputTyped.js'), /surfaceFieldEditOf/)
  assert.match(chain('checklistToggled.js'), /surfaceOfEvent/)
  assert.match(chain('messageInputSend.js'), /surfaceOfNode\(input\)/)
  assert.match(chain('orgChartCardAction.js'), /surfaceOfNode\(card\)/)
  assert.match(chain('planningGanttEvent.js'), /surfaceOfEvent/)
  assert.match(chain('kanbanCardMoved.js'), /initiator: owner/)
  assert.match(chain('dispatchIslandAction.js'), /runMateuSurfaceAction/)
  assert.match(chain('runMateuSurfaceAction.js'), /application:mateuNavigate/)
  const shell = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'pages', 'shell-page-chains', 'loadMateuShell.js'), 'utf8')
  assert.match(shell, /bridge\.setRowSelectSink\(runPageAction\)/)
})

for (const [name, fn] of pending) { await fn(); passed++; console.log('  ✓ ' + name) }
console.log(`\n${passed} explorer-islands tests OK`)
