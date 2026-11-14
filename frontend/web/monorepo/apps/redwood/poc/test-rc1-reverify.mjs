// rc.1 re-verification of GA review 2 (Redwood): N-1, N-2, N-4 with scenarios of our own (Dialog
// instead of Drawer, a menu click after the close, a flow from the app's action catalogue), and the
// two findings rc.1 did not touch — N-11 (a body that stalls past the ceiling) and N-14 (header
// actions have no double-submit guard) — were pinned as EXPECTED FAILURES (xfail); fixed for rc.2
// (also pinned in test-vb-chains.mjs, which `npm test` runs).
//
// It runs on the SAME harness as test-vb-chains.mjs (a fake VB context, the bridge assembled from
// poc/, the shipped chain files): the harness part of that file is reused verbatim — this script
// copies it (everything before its first test) into a temporary module next to it, adds its own
// cases and runs them. Not part of `npm test` (the xfails would be noise there).
//   node test-rc1-reverify.mjs            → exit 0 while the xfails still fail
//   an XPASS (a pinned finding now fixed) exits 1: turn it into an ordinary test.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(here, 'test-vb-chains.mjs'), 'utf8')
const harness = src.slice(0, src.indexOf("test('the bridge assembled from poc/"))
if (harness.length < 1000) throw new Error('test-vb-chains.mjs harness not found')

const cases = String.raw`
// (in test-vb-chains.mjs an earlier test leaves these on the fake window; the scroll restore needs them)
Object.assign(win, { setTimeout, clearTimeout })
const navigate = (ctx, route, extra = {}) => new chains.onMateuNavigate().run(ctx, { event: { detail: { route } }, ...extra })
const act = (ctx, actionId, parameters) => new chains.runMateuAction().run(ctx, { actionId, parameters })
chains.runMateuHeaderAction = chain('pages/shell-page-chains/runMateuHeaderAction.js')
const xqueue = []
const xfail = (name, fn) => xqueue.push({ name, fn })

const formIn = (kind, id, sst, actions) => ({ type: 'ClientSide', id: id + '-overlay', metadata: { type: kind, headerTitle: kind, position: 'end',
  content: { type: 'ServerSide', id, serverSideType: sst, route: '/' + id, actions, triggers: [], rules: [], validations: [],
    children: [{ type: 'ClientSide', metadata: { type: 'FormField', fieldId: 'note', label: 'Note', dataType: 'string' } }] } }, children: [] })

test('N-1 (Dialog): a content button only the dialog\'s embedded form declares reaches it', async () => {
  const overlay = bridge.buildOverlay({ component: formIn('Dialog', 'approve-form', 'x.Approve', [{ id: 'approve' }]) }, bridge.HOST_ID)
  const reg = { contexts: { [bridge.HOST_ID]: { id: bridge.HOST_ID, tree: { type: 'ServerSide', id: 'p', actions: [{ id: 'save' }], children: [] } },
    [overlay.id]: overlay }, stack: [overlay.id], shell: null }
  assert.equal(bridge.contentActionIsClaimed(reg, 'approve'), true)
  const dispatchHost = chain('flows/main/pages/main-start-page-chains/dispatchHostBlockAction.js')
  const ctx = newContext()
  ctx.$application.variables.mateuRegistry = reg
  const real = chains.runMateuAction
  delete chains.runMateuAction
  try {
    await new dispatchHost().run(ctx, { actionId: 'approve' })
    assert.deepEqual(calls.filter((c) => c[0] === 'callChain').map((c) => c[2].actionId), ['approve'])
  } finally { chains.runMateuAction = real }
})

test('N-1 (probe): a form nested ONE level inside the drawer\'s content (ClientSide wrapper → ServerSide)', async () => {
  const wrapped = { type: 'ClientSide', id: 'w-overlay', metadata: { type: 'Drawer', headerTitle: 'W', position: 'end',
    content: { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [
      { type: 'ServerSide', id: 'inner', serverSideType: 'x.Inner', actions: [{ id: 'innerGo' }], children: [] }] } }, children: [] }
  const overlay = bridge.buildOverlay({ component: wrapped }, bridge.HOST_ID)
  const reg = { contexts: { [bridge.HOST_ID]: { id: bridge.HOST_ID, tree: { type: 'ServerSide', id: 'p', actions: [{ id: 'save' }], children: [] } },
    [overlay.id]: overlay }, stack: [overlay.id], shell: null }
  console.log('    (info) nested-in-wrapper form claims its action:', bridge.contentActionIsClaimed(reg, 'innerGo'))
})

test('N-2 (Dialog + menu click): after the server closes the dialog, the typed value is still sent and a menu click asks', async () => {
  answer(byRoute('/r2-edit'), replace(page('pr2', 'x.R2', 'Edit', [], { actions: [{ id: 'openNote' }, { id: 'save' }] })))
  answer(byRoute('/r2-other'), replace(page('po2', 'x.O2', 'Other')))
  answer((b) => b.actionId === 'openNote', { commands: [], messages: [], fragments: [{ targetComponentId: '', action: 'Add', state: {}, data: null,
    component: formIn('Dialog', 'note-form', 'x.Note', [{ id: 'done' }]) }] })
  answer((b) => b.actionId === 'done', { commands: [{ type: 'CloseModal', targetComponentId: '', data: null }], messages: [], fragments: [] })
  answer((b) => b.actionId === 'save', { commands: [], messages: [], fragments: [] })
  const ctx = newContext()
  ctx.$page.variables.mateuModalOpen = false
  await navigate(ctx, '/r2-edit')
  ctx.$application.variables.mateuRegistry.contexts[bridge.HOST_ID].tree.confirmOnNavigationIfDirty = true
  await new chains.mateuFieldEdited().run(ctx, { fieldId: 'city', event: { detail: { value: 'Palma', updatedFrom: 'internal' } } })
  await act(ctx, 'openNote')
  await act(ctx, 'done')
  assert.equal((ctx.$application.variables.mateuRegistry.stack || []).length, 0, 'dialog closed')
  assert.equal(ctx.$page.variables.mateuDraft.city, 'Palma')
  assert.equal(bridge.hasUnsavedChanges(ctx.$application.variables), true)
  confirmAnswer = false
  const before = sent.length
  await navigate(ctx, '/r2-other')
  assert.equal(sent.length, before, '«stay»: nothing loaded')
  assert.equal(ctx.$application.variables.mateuSelectedRoute, '/r2-edit')
  confirmAnswer = true
  await act(ctx, 'save')
  assert.equal(sent.filter((s) => s.body.actionId === 'save').at(-1).body.componentState.city, 'Palma')
})

test('N-4 (catalogue flow): a browser-run Navigate from the app\'s action catalogue asks about the user\'s typing', async () => {
  answer(byRoute('/r4-edit'), replace(page('pr4', 'x.R4', 'Edit', [text('x')], { actions: [] })))
  const ctx = newContext()
  await navigate(ctx, '/r4-edit')
  const reg = ctx.$application.variables.mateuRegistry
  reg.contexts[bridge.HOST_ID].tree.confirmOnNavigationIfDirty = true
  reg.shell = { ...(reg.shell || {}), actionCatalogue: [{ id: 'goList', commands: [{ type: 'NavigateTo', data: '/r4-list' }] }] }
  await new chains.mateuFieldEdited().run(ctx, { fieldId: 'nombre', event: { detail: { value: 'Ana', updatedFrom: 'internal' } } })
  const asked = []
  const realConfirm = win.confirm
  win.confirm = (t) => { asked.push(t); return false }
  const navs = () => calls.filter((c) => c[0] === 'event' && c[1] === 'application:mateuNavigate').length
  try {
    const n0 = navs()
    await act(ctx, 'goList')
    assert.equal(asked.length, 1, 'it asked')
    assert.equal(navs(), n0, '«stay» navigates nowhere')
    assert.equal(ctx.$page.variables.mateuDraft.nombre, 'Ana')
  } finally { win.confirm = realConfirm }
})

test('N-14: a double click on a WRITING app header action sends it once', async () => {
  let release
  const gate = new Promise((r) => { release = r })
  answer((b) => b.actionId === 'closeDay', async () => { await gate; return { commands: [], messages: [], fragments: [] } })
  const ctx = newContext()
  ctx.$application.variables.mateuHeaderActions = [{ actionId: 'closeDay', label: 'Close day' }]
  ctx.$application.variables.mateuShellSST = 'x.App'
  const a = new chains.runMateuHeaderAction().run(ctx, { actionId: 'closeDay' })
  const b = new chains.runMateuHeaderAction().run(ctx, { actionId: 'closeDay' })
  await settle()
  release()
  await Promise.allSettled([a, b])
  assert.equal(sent.filter((s) => s.body.actionId === 'closeDay').length, 1)
})

test('N-11: a read whose BODY stalls past the ceiling reports a failure (or is retried), not a silent throw', async () => {
  const settles = []
  bridge.setTransportHooks({ onStart() {}, onSettle: (e) => settles.push(e) })
  const realFetch = win.fetch
  let attempts = 0
  win.fetch = async (url, init = {}) => {
    attempts++
    return { ok: true, status: 200, headers: { get: () => null },
      json: () => new Promise((_, rej) => init.signal && init.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })))) }
  }
  const keepAlive = setInterval(() => {}, 1000) // the ceiling's timer is unref'd
  try {
    let threw = null
    try { await bridge.callMateu('http://api', { route: '/slow', actionId: '' }, { timeoutMillis: 30 }) } catch (e) { threw = e }
    await settle()
    const failed = settles.some((s) => s && s.failure)
    assert.ok(failed || attempts > 1, 'onSettle reported ' + JSON.stringify(settles.map((s) => s && s.failure)) + ', attempts ' + attempts + ', threw ' + (threw && threw.message))
  } finally { clearInterval(keepAlive); win.fetch = realFetch; bridge.setTransportHooks(null) }
})

const failed = []
for (const { name, fn } of queue) {
  reset()
  try { await fn(); passed++; console.log('  ✓ ' + name) } catch (e) { failed.push(name); console.error('  ✗ ' + name + '\n', e) }
}
const xpassed = []
for (const { name, fn } of xqueue) {
  reset()
  try { await fn(); xpassed.push(name); console.error('  ✗ XPASS (fixed? turn it into a test) ' + name) }
  catch (e) { console.log('  ~ XFAIL (still open) ' + name + ' — ' + String(e && e.message).split('\n')[0]) }
}
if (failed.length || xpassed.length) { console.error('\n' + failed.length + ' failed, ' + xpassed.length + ' xpassed'); process.exit(1) }
console.log('\n' + passed + ' rc.1 re-verify tests passed, ' + xqueue.length + ' still-open findings pinned (xfail)')
`

const tmp = join(here, '.rc1-reverify.generated.mjs')
writeFileSync(tmp, harness + cases)
try {
  await import(pathToFileURL(tmp).href)
} finally {
  rmSync(tmp, { force: true })
}
