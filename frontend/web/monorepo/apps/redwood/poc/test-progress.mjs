// PROGRESS REPORTING and NOTIFICATIONS as patterns (design/progress-and-notifications.md) on the
// Redwood renderer: the task center (tasks.mjs) fed by `Progress` commands, Cancel / Retry /
// result actions, a task that outlives its screen (transport.mjs), the inbox (inbox.mjs: the
// server list ∪ the session's entries, categories, filters, actions, dismiss, detail, live
// NotificationsChanged) and toasts with N actions / persistence / dedup key (notify.mjs).
// Usage: node test-progress.mjs
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { makeDom, FakeEvent } from './test-harness-dom.mjs'
import {
  progressCommandsOf, withoutProgressCommands, isEmptyIncrement, createTaskCenter, taskViewOf, taskCenterViewOf,
  autoCloseDelayOf, taskAnnouncementOf, formatElapsed, cancelTask, retryTask, runResultAction, setTaskTransport,
  setTaskActionSink, setTaskNavigateSink, setTaskViewClock, installTaskCenter, taskCenter, noteProgress, taskMetaOf, recoverUnfinishedTasks,
} from './tasks.mjs'
import { chromeText, etaTextOf } from './i18n.mjs'
import { TASK_MEMORY_KEY, rememberedTasks, installTaskMemory, reattachTasks, resumeTask, recoverBrokenTasks, resetTaskMemoryForTests } from './reattach.mjs'
import {
  osNotify, osNotifyControl, offersOsNotifications, osNotificationPermission, setOsNotificationsEnabled,
  setOsNotificationNavigateSink, taskOsNotificationOf, inboxOsNotificationOf,
} from './osNotify.mjs'
import {
  inboxEntryOf, createInbox, withServerList, withSessionEntry, withChange, withRead, withFilter, entriesOf,
  filteredEntries, groupsOf, inboxModelOf, sessionEntryOfMessage, notificationsChangedOf, resetInboxForTests,
  setInboxContext, setInboxIncrementSink, setInboxNavigateSink, setInboxSessionActionSink, setInboxModelSink,
  adoptServerList, noteInboxMessage, actOnEntry, dismissEntry, openEntry, applyNotificationsChanged, currentInbox,
  mountInboxPanel, currentInboxModel,
} from './inbox.mjs'
import { isActionToast, takeUndoToasts, undoMessageOf, toastLifetimeOf, pausableToastClose, showUndoToasts, setUndoSink, setToastNavigateSink, inboxToastsOf, fetchNotifications } from './notify.mjs'
import { reduceContexts } from './reduceContexts.mjs'
import { applyDomEffects } from './files.mjs'
import { runMateuActionSse } from './transport.mjs'
import { beginView, currentView, isStaleResponse } from './resilience.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))

let passed = 0
const tests = []
const test = (name, fn) => tests.push({ name, fn })
const sinkLog = () => { const calls = []; const fn = (...a) => calls.push(a); fn.calls = calls; return fn }
const progress = (over = {}) => ({
  taskId: 't1', title: 'Import', text: 'Starting...', fraction: null, done: null, total: null, state: 'running',
  blocking: false, backgroundable: false, cancellable: false, retryable: false, startedAt: 1000,
  closeAfterSeconds: null, error: null, resultActions: [], ...over,
})
const progressInc = (p, more = {}) => ({ commands: [{ targetComponentId: null, type: 'Progress', data: p }], messages: [], fragments: [], ...more })

// ── the model ────────────────────────────────────────────────────────────────────────────────

test('an increment\'s Progress commands are read, and taken out of what the screen applies', () => {
  const nav = { type: 'NavigateTo', data: '/x' }
  const inc = { commands: [{ type: 'Progress', data: progress() }, nav], messages: [], fragments: [] }
  assert.deepEqual(progressCommandsOf(inc).map((p) => p.taskId), ['t1'])
  assert.deepEqual(withoutProgressCommands(inc).commands, [nav])
  const plain = { commands: [nav] }
  assert.equal(withoutProgressCommands(plain), plain, 'an increment without progress stays the same object')
  assert.equal(isEmptyIncrement(withoutProgressCommands(progressInc(progress()))), true, 'a progress-only increment leaves nothing to apply')
  assert.equal(isEmptyIncrement({ commands: [], messages: [{ text: 'x' }] }), false)
})

test('the center upserts by taskId: started → updated → finished; a late update for a finished task is ignored', () => {
  let now = 5000
  const c = createTaskCenter({ now: () => now })
  const events = []
  c.subscribe((e) => events.push(e.kind))
  assert.equal(c.upsert(progress(), { actionId: 'importAll' }), 'started')
  assert.equal(c.upsert(progress({ text: 'Row 1', done: 1, total: 3, fraction: 1 / 3 })), 'updated')
  now = 8000
  assert.equal(c.upsert(progress({ state: 'done', text: 'Imported 3 rows' })), 'finished')
  assert.equal(c.upsert(progress({ text: 'Row 3' })), 'ignored', 'a step after the end changes nothing')
  assert.equal(c.upsert(progress({ state: 'cancelled' })), 'ignored', 'a second terminal echo either')
  assert.deepEqual(events, ['started', 'updated', 'finished'])
  const t = c.get('t1')
  assert.equal(t.text, 'Imported 3 rows')
  assert.equal(t.origin.actionId, 'importAll', 'the origin of the first update is kept')
  assert.equal(t.finishedAt, 8000)
})

test('several tasks at once: running first (oldest first), then the finished ones (latest first), at most keepFinished', () => {
  let now = 0
  const c = createTaskCenter({ keepFinished: 2, now: () => ++now })
  c.upsert(progress({ taskId: 'a' }))
  c.upsert(progress({ taskId: 'b' }))
  c.upsert(progress({ taskId: 'c' }))
  c.upsert(progress({ taskId: 'd' }))
  c.upsert(progress({ taskId: 'b', state: 'done' }))
  c.upsert(progress({ taskId: 'c', state: 'failed', error: 'boom' }))
  c.upsert(progress({ taskId: 'd', state: 'cancelled' }))
  assert.deepEqual(c.list().map((t) => t.taskId), ['a', 'd', 'c'], 'b, the oldest finished, went')
  assert.equal(c.dismiss('a'), false, 'a running task cannot be dismissed: it is cancelled')
  assert.equal(c.dismiss('c'), true)
  assert.equal(c.clearFinished(), 1)
  assert.deepEqual(c.list().map((t) => t.taskId), ['a'])
})

test('a task\'s view: indeterminate, the count, elapsed time, and which controls it offers', () => {
  const base = { ...progress(), seenAt: 1000, backgrounded: true, origin: { actionId: 'importAll' } }
  const indeterminate = taskViewOf(base, 84000)
  assert.equal(indeterminate.value, -1, 'oj-progress-bar: -1 = indeterminate')
  assert.equal(indeterminate.indeterminate, true)
  assert.equal(indeterminate.elapsed, '1:23')
  assert.equal(indeterminate.canCancel, false)
  const counted = taskViewOf({ ...base, fraction: 0.04, done: 12, total: 300, cancellable: true }, 2000)
  assert.equal(counted.value, 4)
  assert.equal(counted.count, '12 of 300')
  assert.equal(counted.valueText, '12 of 300', 'what a screen reader reads off the bar')
  assert.equal(counted.canCancel, true)
  const blocking = taskViewOf({ ...base, blocking: true, backgroundable: true, backgrounded: false }, 2000)
  assert.equal(blocking.canBackground, true)
  assert.equal(blocking.blocking, true)
  const failed = taskViewOf({ ...base, state: 'failed', error: 'Network down', retryable: true, finishedAt: 3000 }, 9000)
  assert.equal(failed.error, 'Network down')
  assert.equal(failed.canRetry, true)
  assert.equal(failed.elapsed, '0:02', 'a finished task stops its clock')
  assert.equal(taskViewOf({ ...base, state: 'failed', retryable: true, origin: null }, 0).canRetry, false, 'nothing to run again')
  const done = taskViewOf({ ...base, state: 'done', resultActions: [{ label: 'Open report', route: '/r/1' }, { label: 'nothing' }] }, 0)
  assert.deepEqual(done.resultActions.map((a) => a.label), ['Open report'], 'an action with nowhere to go is not offered')
  assert.equal(done.value, 100)
  assert.equal(formatElapsed(3723000), '1:02:03')
})

test('the center\'s view: the blocking task in the dialog, the rest docked, the running count on the button', () => {
  const t = (over) => ({ ...progress(over), seenAt: 0, backgrounded: !over.blocking })
  const v = taskCenterViewOf([t({ taskId: 'modal', blocking: true }), t({ taskId: 'bg' }), t({ taskId: 'old', state: 'done' })], 0)
  assert.equal(v.dialog.id, 'modal')
  assert.deepEqual(v.docked.map((d) => d.id), ['bg', 'old'])
  assert.equal(v.running, 2)
  assert.equal(v.buttonLabel, 'Tasks · 2 running')
  assert.equal(v.hasFinished, true)
  const moved = taskCenterViewOf([{ ...t({ taskId: 'modal', blocking: true }), backgrounded: true }], 0)
  assert.equal(moved.dialog, null, 'moved to the background: it is docked')
})

test('a finished blocking dialog: a cancel closes at once, closeAfter is honoured, a failure or a result waits', () => {
  assert.equal(autoCloseDelayOf(progress({ state: 'running' })), null)
  assert.equal(autoCloseDelayOf(progress({ state: 'cancelled' })), 0)
  assert.equal(autoCloseDelayOf(progress({ state: 'done', closeAfterSeconds: 2 })), 2000)
  assert.equal(autoCloseDelayOf(progress({ state: 'done' })), 600)
  assert.equal(autoCloseDelayOf(progress({ state: 'done', resultActions: [{ route: '/r' }] })), null)
  assert.equal(autoCloseDelayOf(progress({ state: 'failed' })), null)
})

test('start and end are announced politely; a failure assertively', () => {
  assert.deepEqual(taskAnnouncementOf({ kind: 'started', task: progress() }), { text: 'Started: Import', assertive: false })
  assert.deepEqual(taskAnnouncementOf({ kind: 'finished', task: progress({ state: 'done' }) }), { text: 'Import: done', assertive: false })
  assert.deepEqual(taskAnnouncementOf({ kind: 'finished', task: progress({ state: 'failed', error: 'x' }) }), { text: 'Import failed: x', assertive: true })
  assert.equal(taskAnnouncementOf({ kind: 'updated', task: progress() }), null)
})

// ── Cancel, Retry, result actions ───────────────────────────────────────────────────────────

test('Cancel: _progress-cancel {taskId} to the backend that runs it; its cancelled answer ends the task', async () => {
  const c = createTaskCenter()
  const origin = { base: '/b', route: '/import', serverSideType: 'app.Importer', actionId: 'importAll', consumedRoute: '/import', initiatorComponentId: 'cmp' }
  c.upsert(progress({ cancellable: true }), origin)
  const sent = []
  setTaskTransport(async (kind, o, body) => { sent.push([kind, o.base, body]); return progressInc(progress({ state: 'cancelled' })) })
  assert.equal(await cancelTask('t1', c), true)
  assert.equal(sent[0][0], 'cancel')
  assert.equal(sent[0][1], '/b')
  assert.equal(sent[0][2].actionId, '_progress-cancel')
  assert.deepEqual(sent[0][2].parameters, { taskId: 't1' })
  assert.equal(sent[0][2].serverSideType, 'app.Importer')
  assert.equal(c.get('t1').state, 'cancelled')
  assert.equal(await cancelTask('t1', c), false, 'a finished task is not cancelled again')
})

test('Retry runs the task\'s action again: on the screen while it is the same one, straight to the backend otherwise', async () => {
  const c = createTaskCenter()
  const view = currentView()
  setTaskViewClock(currentView)
  const onScreen = sinkLog()
  setTaskActionSink(onScreen)
  const sent = []
  setTaskTransport(async (kind, o, body) => { sent.push([kind, body]); return [] })
  c.upsert(progress({ state: 'failed', retryable: true }), { actionId: 'importAll', parameters: { file: 'a.csv' }, view })
  assert.equal(retryTask('t1', c), true)
  assert.deepEqual(onScreen.calls, [['importAll', { file: 'a.csv' }, {}]])
  assert.equal(c.get('t1'), null, 'the failed entry goes; the new run is a new task')
  c.upsert(progress({ taskId: 't2', state: 'failed', retryable: true }), { actionId: 'importAll', parameters: {}, view: view - 1, route: '/import' })
  assert.equal(retryTask('t2', c), true)
  assert.equal(sent[0][0], 'stream')
  assert.equal(sent[0][1].actionId, 'importAll')
  c.upsert(progress({ taskId: 't3', state: 'failed', retryable: false }), { actionId: 'x' })
  assert.equal(retryTask('t3', c), false, 'not retryable: no Retry')
})

test('a result action: its route navigates, its actionId runs like the task\'s', () => {
  const c = createTaskCenter()
  const nav = sinkLog()
  setTaskNavigateSink(nav)
  const onScreen = sinkLog()
  setTaskActionSink(onScreen)
  setTaskViewClock(() => 7)
  c.upsert(progress({ state: 'done', resultActions: [{ label: 'Open', route: '/reports/1' }, { label: 'Errors', actionId: 'showErrors', parameters: { id: 1 } }] }), { view: 7 })
  assert.equal(runResultAction('t1', 0, c), true)
  assert.deepEqual(nav.calls, [['/reports/1']])
  assert.equal(runResultAction('t1', 1, c), true)
  assert.deepEqual(onScreen.calls, [['showErrors', { id: 1 }, {}]])
  setTaskViewClock(currentView)
})

// ── the stream ───────────────────────────────────────────────────────────────────────────────

const sseResponse = (increments) => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => increments.map((i) => 'data: ' + JSON.stringify(i) + '\n\n').join('') })

test('a LongTask stream (the real shape): every Progress reaches the center; only what is left reaches the screen', async () => {
  taskCenter.clear()
  const stream = fx('progress-scan-stream')
  const original = globalThis.fetch
  globalThis.fetch = async () => sseResponse(stream)
  try {
    const increments = await runMateuActionSse('', null, '/scan', 'scan', {}, { parameters: { pax: 1 } })
    assert.equal(increments.length, 1, 'progress-only increments are not delivered')
    assert.deepEqual(increments[0].commands.map((c) => c.type), ['DispatchEvent'], 'the done increment keeps its commands')
    const task = taskCenter.get('7c1e2a4d-5b6f-4e8a-9c0d-1f2e3a4b5c6d')
    assert.equal(task.state, 'done')
    assert.equal(task.done, 4)
    assert.equal(task.origin.actionId, 'scan')
    assert.deepEqual(task.origin.parameters, { pax: 1 })
    assert.equal(task.origin.route, '/scan')
  } finally { globalThis.fetch = original; taskCenter.clear() }
})

test('a task outlives its screen: after a navigation the stream keeps feeding the center, its inbox message lands in the inbox, the call ends stale', async () => {
  taskCenter.clear()
  resetInboxForTests()
  const stream = fx('progress-scan-stream')
  const original = globalThis.fetch
  let reads = 0
  // the body arrives in two halves; the user navigates in between
  globalThis.fetch = async () => {
    const chunks = [stream.slice(0, 2), stream.slice(2)].map((part) => part.map((i) => 'data: ' + JSON.stringify(i) + '\n\n').join(''))
    return {
      ok: true, status: 200, headers: { get: () => null },
      body: { getReader: () => ({ read: async () => { if (reads === 1) beginView(); return reads < chunks.length ? { done: false, value: new TextEncoder().encode(chunks[reads++]) } : { done: true } }, cancel: async () => undefined }) },
    }
  }
  try {
    await assert.rejects(() => runMateuActionSse('', null, '/scan', 'scan', {}), (e) => isStaleResponse(e))
    assert.equal(taskCenter.get('7c1e2a4d-5b6f-4e8a-9c0d-1f2e3a4b5c6d').state, 'done', 'the task finished in the center')
    const entries = entriesOf(currentInbox())
    assert.equal(entries.length, 1)
    assert.equal(entries[0].id, 'task-7c1e2a4d-5b6f-4e8a-9c0d-1f2e3a4b5c6d')
    assert.equal(entries[0].title, 'Documento verificado')
    assert.equal(entries[0].actions[0].route, '/documento')
  } finally { globalThis.fetch = original; taskCenter.clear(); resetInboxForTests() }
})

test('a stream that reports no task is still cut when the screen changes (as before)', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => { beginView(); return sseResponse([{ commands: [], messages: [], fragments: [{ step: 1 }] }]) }
  try {
    await assert.rejects(() => runMateuActionSse('', null, '/x', 'go', {}), (e) => isStaleResponse(e))
  } finally { globalThis.fetch = original }
})

// ── the DOM ──────────────────────────────────────────────────────────────────────────────────

const ojAction = (el) => el.dispatchEvent(new FakeEvent('ojAction', { bubbles: true }))
const buttonsOf = (root) => root.querySelectorAll('oj-button')
const buttonByText = (root, text) => buttonsOf(root).find((b) => b.textContent === text)

test('DOM: a blocking task opens the dialog (progressbar, Background, Cancel); Background docks it and opens the list', async () => {
  const { doc } = makeDom()
  const c = createTaskCenter()
  const h = installTaskCenter(doc, c)
  const dialog = doc.getElementById('mateuTaskDialog')
  let opened = 0
  dialog.open = () => { opened++ }
  dialog.close = () => {}
  c.upsert(progress({ blocking: true, backgroundable: true, cancellable: true }), { actionId: 'importAll' })
  assert.equal(opened, 1)
  assert.equal(doc.getElementById('mateuTaskDialogTitle').textContent, 'Import')
  const bar = dialog.querySelector('oj-c-progress-bar')
  assert.equal(bar.getAttribute('value'), '-1', 'indeterminate')
  assert.equal(bar.getAttribute('aria-label'), 'Import')
  assert.ok(buttonByText(dialog, 'Cancel'))
  ojAction(buttonByText(dialog, 'Background'))
  assert.equal(dialog.hasAttribute('data-open'), false, 'out of the dialog')
  const dock = doc.querySelector('.mateu-task-dock')
  assert.equal(dock.hasAttribute('hidden'), false)
  assert.equal(doc.getElementById('mateuTaskList').hasAttribute('hidden'), false, 'the list opens: the user sees where it went')
  assert.equal(doc.getElementById('mateuTaskDockButton').textContent, 'Tasks · 1 running')
  assert.equal(doc.getElementById('mateuTaskDockButton').getAttribute('aria-expanded'), 'true')
  c.upsert(progress({ blocking: true, state: 'done', text: 'Imported' }))
  assert.match(doc.getElementById('mateuTaskList').textContent, /Imported/)
  ojAction(buttonByText(doc.getElementById('mateuTaskList'), 'Clear finished'))
  assert.equal(c.list().length, 0)
  clearInterval(h.state.timer)
})

test('DOM: a background task never opens the dialog; a failed one offers Retry in the list', () => {
  const { doc } = makeDom()
  const c = createTaskCenter()
  installTaskCenter(doc, c)
  const dialog = doc.getElementById('mateuTaskDialog')
  let opened = 0
  dialog.open = () => { opened++ }
  c.upsert(progress({ retryable: true }), { actionId: 'sync' })
  c.upsert(progress({ state: 'failed', error: 'Timeout', retryable: true }))
  assert.equal(opened, 0)
  const list = doc.getElementById('mateuTaskList')
  ojAction(doc.getElementById('mateuTaskDockButton'))
  assert.equal(list.hasAttribute('hidden'), false)
  assert.match(list.textContent, /Timeout/)
  assert.ok(buttonByText(list, 'Retry'))
  assert.ok(buttonByText(list, 'Dismiss'))
})

test('DOM: Esc closes the open list, the clock ticks while a task runs, a finished blocking dialog closes on its own', async () => {
  const { doc } = makeDom()
  const c = createTaskCenter()
  const h = installTaskCenter(doc, c)
  const dialog = doc.getElementById('mateuTaskDialog')
  dialog.open = () => {}
  dialog.close = () => {}
  c.upsert(progress({ taskId: 'bg', startedAt: Date.now() - 5000 }), { actionId: 'sync' })
  const list = doc.getElementById('mateuTaskList')
  ojAction(doc.getElementById('mateuTaskDockButton'))
  assert.equal(list.hasAttribute('hidden'), false)
  doc.querySelector('.mateu-task-dock').dispatchEvent(new FakeEvent('keydown', { bubbles: true, key: 'Escape' }))
  assert.equal(list.hasAttribute('hidden'), true, 'Esc closes the list')
  // the elapsed time is rewritten every second while something runs
  await new Promise((r) => setTimeout(r, 1100))
  assert.ok(h.state.timer, 'a running task keeps the clock')
  // a blocking task that finishes with closeAfterSeconds 0 goes to the background by itself
  c.upsert(progress({ taskId: 'blk', blocking: true, startedAt: Date.now() }), { actionId: 'importAll' })
  c.upsert(progress({ taskId: 'blk', blocking: true, state: 'done', closeAfterSeconds: 0 }))
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(c.get('blk').backgrounded, true)
  clearInterval(h.state.timer)
})

test('Cancel that cannot reach the backend reports false and leaves the task running', async () => {
  const c = createTaskCenter()
  c.upsert(progress({ taskId: 'x', cancellable: true }), { route: '/r', actionId: 'run' })
  setTaskTransport(async () => { throw new Error('down') })
  assert.equal(await cancelTask('x', c), false)
  assert.equal(c.get('x').state, 'running')
  setTaskTransport(null)
})

// ── the inbox (pure) ─────────────────────────────────────────────────────────────────────────

const server = [
  { id: 'a', title: 'Approve PO 12', category: 'Approvals', unread: true, actions: [{ label: 'Approve', actionId: 'approve', style: 'primary' }, { label: 'Reject', actionId: 'reject' }] },
  { id: 'b', title: 'Import done', category: 'Imports', unread: false, route: '/imports/1' },
  { id: 'c', title: 'Old approval', category: 'Approvals', unread: false, resolved: true },
]

test('inbox: entries normalised; the session\'s over the server\'s; a session entry the server now lists is the server\'s', () => {
  const e = inboxEntryOf(server[0])
  assert.equal(e.category, 'Approvals')
  assert.equal(e.actions.length, 2)
  assert.match(e.titleClass, /bold/)
  let ib = withSessionEntry(withServerList(createInbox(), server), sessionEntryOfMessage({ key: 'task-1', title: 'Export ready', text: '3 files', variant: 'success', actions: [{ label: 'Open', route: '/x' }] }))
  assert.deepEqual(entriesOf(ib).map((x) => x.id), ['task-1', 'a', 'b', 'c'])
  // the same key replaces the entry instead of stacking another
  ib = withSessionEntry(ib, sessionEntryOfMessage({ key: 'task-1', text: 'Export ready (again)' }))
  assert.equal(entriesOf(ib).filter((x) => x.id === 'task-1').length, 1)
  assert.equal(entriesOf(ib)[0].title, 'Export ready (again)')
  ib = withServerList(ib, [...server, { id: 'task-1', title: 'stored' }])
  assert.equal(ib.session.length, 0)
})

test('inbox: filters (unread / all / resolved), categories, and a badge that does not depend on the filter', () => {
  const ib = withServerList(createInbox(), server)
  assert.deepEqual(filteredEntries(entriesOf(ib), 'unread').map((x) => x.id), ['a'])
  assert.deepEqual(filteredEntries(entriesOf(ib), 'resolved').map((x) => x.id), ['c'])
  assert.deepEqual(groupsOf(entriesOf(ib)).map((g) => [g.label, g.items.map((x) => x.id)]), [['Approvals', ['a', 'c']], ['Imports', ['b']]])
  assert.deepEqual(groupsOf([inboxEntryOf({ id: 'z' })]).map((g) => g.label), [''], 'nothing declares a category: no heading')
  const m = inboxModelOf(withFilter(ib, 'resolved'))
  assert.equal(m.unread, 1)
  assert.equal(m.items.length, 1)
  assert.equal(m.filters.find((f) => f.selected).id, 'resolved')
  assert.equal(withFilter(ib, 'nonsense').filter, 'all')
  assert.equal(inboxModelOf(withRead(ib, 'all')).unread, 0)
})

test('inbox: a pushed change upserts (new = added), removes, or asks for the list again', () => {
  const ib = withServerList(createInbox(), server)
  const added = withChange(ib, { notification: { id: 'd', title: 'New PO', unread: true } })
  assert.equal(added.added.id, 'd')
  assert.equal(entriesOf(added.inbox)[0].id, 'd')
  const changed = withChange(added.inbox, { notification: { id: 'a', title: 'Approve PO 12', resolved: true, unread: false } })
  assert.equal(changed.added, null)
  assert.equal(entriesOf(changed.inbox).find((x) => x.id === 'a').resolved, true)
  assert.equal(entriesOf(withChange(ib, { removedId: 'b' }).inbox).some((x) => x.id === 'b'), false)
  assert.equal(withChange(ib, {}).refetch, true)
  assert.deepEqual(notificationsChangedOf({ commands: [{ type: 'NotificationsChanged', data: { removedId: 'x' } }, { type: 'Other' }] }), [{ removedId: 'x' }])
})

// ── the inbox (talking to the server) ────────────────────────────────────────────────────────

const jsonResponse = (body) => ({ ok: true, status: 200, headers: { get: () => null }, json: async () => body })
const listAnswer = (list) => ({ commands: [], messages: [], fragments: [{ targetComponentId: '', data: { _notifications: list } }] })

test('inbox actions: _notifications-act with the entry and the action; the answer (minus the list) is painted on the page', async () => {
  resetInboxForTests()
  setInboxContext({ base: '', serverSideType: 'app.Shell', appState: { hotel: 'H1' } })
  const painted = sinkLog()
  setInboxIncrementSink(painted)
  const models = sinkLog()
  setInboxModelSink(models)
  adoptServerList(server)
  const sent = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    sent.push(body)
    const resolved = server.map((n) => (n.id === 'a' ? { ...n, unread: false, resolved: true } : n))
      .filter((n) => body.actionId !== '_notifications-dismiss' || n.id !== 'b')
    return jsonResponse({ ...listAnswer(resolved), messages: [{ text: 'Approved', variant: 'success' }] })
  }
  try {
    await actOnEntry('a', 0)
    assert.equal(sent[0].actionId, '_notifications-act')
    assert.deepEqual(sent[0].parameters, { id: 'a', actionId: 'approve' })
    assert.equal(sent[0].serverSideType, 'app.Shell')
    assert.deepEqual(sent[0].appState, { hotel: 'H1' })
    assert.equal(painted.calls[0][0].messages[0].text, 'Approved')
    assert.equal(painted.calls[0][0].fragments.length, 0, 'the list is the panel\'s, not the page\'s')
    assert.equal(entriesOf(currentInbox()).find((x) => x.id === 'a').resolved, true)
    assert.equal(models.calls.at(-1)[0].unread, 0, 'the badge follows')
    await dismissEntry('b')
    assert.equal(sent[1].actionId, '_notifications-dismiss')
    assert.deepEqual(sent[1].parameters, { ids: ['b'] })
    assert.equal(entriesOf(currentInbox()).some((x) => x.id === 'b'), false)
  } finally { globalThis.fetch = original; resetInboxForTests() }
})

test('inbox: an entry with a detail is read and its detail asked for; one with a route navigates; a session entry acts on the screen', async () => {
  resetInboxForTests()
  setInboxContext({ base: '', serverSideType: 'app.Shell', appState: {} })
  const painted = sinkLog(); setInboxIncrementSink(painted)
  const nav = sinkLog(); setInboxNavigateSink(nav)
  const onScreen = sinkLog(); setInboxSessionActionSink(onScreen)
  adoptServerList([{ id: 'x', title: 'Leave request', hasDetail: true }, { id: 'y', title: 'Report', route: '/r/1' }])
  const sent = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    sent.push(body.actionId)
    return jsonResponse(body.actionId === '_notifications-open'
      ? { commands: [], messages: [], fragments: [{ action: 'Add', component: { type: 'ClientSide', metadata: { type: 'Drawer' } } }] }
      : listAnswer([{ id: 'x', title: 'Leave request', hasDetail: true, unread: false }, { id: 'y', title: 'Report', route: '/r/1' }]))
  }
  try {
    await openEntry('x')
    assert.deepEqual(sent, ['_notifications-read', '_notifications-open'])
    assert.equal(painted.calls[0][0].fragments[0].component.metadata.type, 'Drawer')
    await openEntry('y')
    assert.deepEqual(nav.calls, [['/r/1']])
    noteInboxMessage({ key: 'k', text: 'Moved', actions: [{ label: 'Undo', actionId: 'undoMove', parameters: { id: 3 }, style: 'undo' }] })
    await actOnEntry('k', 0)
    assert.deepEqual(onScreen.calls, [['undoMove', { id: 3 }, {}]])
    assert.equal(entriesOf(currentInbox()).find((e) => e.id === 'k').unread, false)
  } finally { globalThis.fetch = original; resetInboxForTests() }
})

test('inbox: a NotificationsChanged upserts and announces; an empty one asks for the list again', async () => {
  resetInboxForTests()
  setInboxContext({ base: '', serverSideType: 'app.Shell', appState: {} })
  adoptServerList(server)
  await applyNotificationsChanged({ notification: { id: 'n', title: 'New PO', unread: true } })
  assert.equal(currentInboxModel().unread, 2)
  const original = globalThis.fetch
  let asked = null
  globalThis.fetch = async (url, init) => { asked = JSON.parse(init.body).actionId; return jsonResponse(listAnswer([])) }
  try {
    await applyNotificationsChanged({})
    assert.equal(asked, '_notifications-list')
    assert.equal(currentInboxModel().empty, true)
  } finally { globalThis.fetch = original; resetInboxForTests() }
})

test('inbox: marking a session entry read never asks the server (it does not know it)', async () => {
  resetInboxForTests()
  noteInboxMessage({ key: 's1', text: 'Exported' })
  const original = globalThis.fetch
  let asked = 0
  globalThis.fetch = async () => { asked++; return jsonResponse(listAnswer([])) }
  try {
    const model = await fetchNotifications('', 'app.Shell', {}, ['s1'])
    assert.equal(asked, 0)
    assert.equal(model.unread, 0)
  } finally { globalThis.fetch = original; resetInboxForTests() }
})

test('inbox panel (DOM): filters, category headings, an entry\'s actions and its dismiss', () => {
  resetInboxForTests()
  adoptServerList(server)
  const { doc } = makeDom()
  const host = doc.createElement('div')
  doc.body.appendChild(host)
  mountInboxPanel(host, doc)
  assert.deepEqual(host.querySelectorAll('[data-filter]').map((b) => [b.getAttribute('data-filter'), b.getAttribute('aria-pressed')]),
    [['unread', 'false'], ['all', 'true'], ['resolved', 'false']])
  assert.deepEqual(host.querySelectorAll('.mateu-inbox-group').map((g) => g.textContent), ['Approvals', 'Imports'])
  const a = host.querySelector('[data-id="a"]')
  assert.deepEqual(a.querySelectorAll('.mateu-inbox-actions oj-button').map((b) => b.textContent), ['Approve', 'Reject'])
  assert.equal(host.querySelector('[data-id="c"]').querySelectorAll('.mateu-inbox-actions').length, 0, 'a resolved entry has nothing left to do')
  assert.match(a.querySelector('.mateu-inbox-dismiss').getAttribute('aria-label'), /Dismiss: Approve PO 12/)
  ojAction(host.querySelector('[data-filter="unread"]'))
  assert.deepEqual(host.querySelectorAll('.mateu-inbox-item').map((li) => li.getAttribute('data-id')), ['a'])
  resetInboxForTests()
})

// ── toasts ───────────────────────────────────────────────────────────────────────────────────

test('toasts: N actions from the wire; an older server\'s undo is the same action; persistence and key travel', () => {
  const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, { messages: [
    { text: 'Saved', variant: 'success', persistence: 'sticky', key: 'save', actions: [{ label: 'Open', route: '/orders/1' }, { label: null, actionId: 'undoSave', parameters: { id: 1 }, style: 'undo' }] },
    { text: 'Moved', variant: 'contrast', undoActionId: 'undoMove', undoParameters: { id: 2 } },
    { text: 'Plain', variant: 'info' },
    { title: 'Export', text: 'Ready', variant: 'success', persistence: 'inbox' },
  ], fragments: [], commands: [] })
  const [saved, moved, plain, inboxed] = reg.effects.toasts
  assert.equal(saved.actions.length, 2)
  assert.equal(saved.undoActionId, 'undoSave', 'the undo action stays readable as before')
  assert.equal(saved.persistence, 'sticky')
  assert.equal(saved.key, 'save')
  assert.deepEqual(moved.actions, [{ label: '', actionId: 'undoMove', parameters: { id: 2 }, route: '', style: 'undo' }])
  assert.deepEqual(plain, { text: 'Plain', variant: 'info' }, 'a plain message is the toast it always was')
  assert.equal(isActionToast(saved), true)
  assert.equal(isActionToast(plain), false)
  assert.equal(isActionToast({ text: 'x', variant: 'error', persistence: 'sticky' }), false, 'an error goes to the message band, which stays')
  assert.deepEqual(inboxToastsOf(reg.effects), [inboxed])
  assert.equal(undoMessageOf(saved).autoTimeout, 'off', 'sticky stays')
  assert.deepEqual(undoMessageOf(inboxed), { severity: 'confirmation', summary: 'Export', detail: 'Ready', autoTimeout: 'off', closeAffordance: 'defaults' })
  assert.equal(toastLifetimeOf(inboxed), 10000, 'an action toast stays at least 10 s (WCAG 2.2.1)')
  assert.equal(toastLifetimeOf(saved), 0, 'sticky stays')
})

test('toasts (DOM): one button per action, a route navigates, an action runs; the same key replaces the message', () => {
  const { doc } = makeDom()
  const nav = sinkLog(); setToastNavigateSink(nav)
  const run = sinkLog(); setUndoSink(run)
  const toast = { text: 'Saved', variant: 'success', key: 'save', actions: [{ label: 'Open', route: '/orders/1' }, { label: '', actionId: 'undoSave', parameters: { id: 1 }, style: 'undo' }] }
  showUndoToasts([toast], doc)
  const host = doc.getElementById('mateuUndoMessages')
  assert.deepEqual(host.querySelectorAll('oj-button').map((b) => b.textContent), ['Open', 'Undo'])
  ojAction(host.querySelectorAll('oj-button')[0])
  ojAction(host.querySelectorAll('oj-button')[1])
  assert.deepEqual(nav.calls, [['/orders/1']])
  assert.deepEqual(run.calls, [['undoSave', { id: 1 }, {}]])
  showUndoToasts([{ ...toast, text: 'Saved again' }], doc)
  assert.equal(host.querySelectorAll('oj-message').length, 1, 'deduplicated by key')
})

test('toasts: applyDomEffects puts an inbox message in the inbox and takes the actionable ones out of the plain toasts', () => {
  const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, { messages: [
    { text: 'Export ready', variant: 'success', persistence: 'inbox' },
    { text: 'Moved', variant: 'contrast', actions: [{ label: 'Undo', actionId: 'u', style: 'undo' }] },
  ], fragments: [], commands: [] })
  const inboxed = sinkLog()
  applyDomEffects(reg.effects, null, { mateuInboxMessage: inboxed, mateuAnnounce: () => {} })
  assert.equal(inboxed.calls.length, 1)
  assert.deepEqual(reg.effects.toasts.map((t) => t.text), ['Export ready'], 'the inbox one is still shown as a toast')
})

// ── ETA (conformance/client/eta-format.json) ─────────────────────────────────────────────────

test('ETA: the shared corpus words etaSeconds exactly, in every language it carries; nothing without one', () => {
  const corpus = JSON.parse(readFileSync(join(here, '..', '..', '..', '..', '..', '..', 'conformance', 'client', 'eta-format.json'), 'utf8'))
  assert.deepEqual(Object.keys(corpus.texts), ['en', 'es', 'fr', 'de', 'pt', 'it'])
  for (const lang of Object.keys(corpus.texts)) {
    for (const [k, v] of Object.entries({ underMinute: 'taskEtaUnderMinute', minutes: 'taskEtaMinutes', hours: 'taskEtaHours' })) {
      assert.equal(chromeText(v, null, lang), corpus.texts[lang][k], `${lang} ${k}`)
    }
  }
  for (const c of corpus.cases) {
    for (const lang of Object.keys(corpus.texts)) assert.equal(etaTextOf(c.etaSeconds, lang), c[lang] || '', `${lang} ${c.etaSeconds}`)
  }
  assert.equal(etaTextOf(undefined), '')
})

test('ETA: a running task shows the server\'s estimate in its meta line; a finished one never does', () => {
  const running = taskViewOf({ ...progress({ etaSeconds: 125, done: 12, total: 300 }), seenAt: 1000 }, 43000)
  assert.equal(running.eta, 'about 2 min left')
  assert.equal(taskMetaOf(running), '12 of 300 · about 2 min left · 0:42 elapsed')
  assert.equal(taskViewOf({ ...progress({ etaSeconds: 125, state: 'done' }), seenAt: 1000, finishedAt: 2000 }).eta, '')
  assert.equal(taskViewOf({ ...progress(), seenAt: 1000 }, 2000).eta, '', 'indeterminate: no estimate')
})

// ── reattach (reattach.mjs) ──────────────────────────────────────────────────────────────────

const memoryStore = (initial) => {
  const data = new Map(initial ? [[TASK_MEMORY_KEY, JSON.stringify(initial)]] : [])
  return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k), data }
}

test('reattach: a running task is remembered for the session with where it runs; a finished one is forgotten', () => {
  taskCenter.clear()
  resetTaskMemoryForTests()
  const store = memoryStore()
  const off = installTaskMemory(taskCenter, store)
  try {
    taskCenter.upsert(progress({ taskId: 'a' }), { base: 'http://b', route: '/import', serverSideType: 'x.Import' })
    taskCenter.upsert(progress({ taskId: 'a', fraction: 0.5 }))
    assert.deepEqual(rememberedTasks(store), [{ taskId: 'a', baseUrl: 'http://b', route: '/import', serverSideType: 'x.Import' }])
    taskCenter.upsert(progress({ taskId: 'a', state: 'done' }))
    assert.deepEqual(rememberedTasks(store), [])
    assert.equal(store.data.has(TASK_MEMORY_KEY), false, 'nothing left behind once every task ended')
    store.setItem(TASK_MEMORY_KEY, '{not json')
    assert.deepEqual(rememberedTasks(store), [], 'a broken entry reads as none')
    assert.deepEqual(rememberedTasks(null), [], 'storage blocked: none')
  } finally { off(); taskCenter.clear() }
})

test('reattach: on boot _progress-tasks asks for the remembered ids; running ones resume, finished ones show, unanswered ones are forgotten', async () => {
  taskCenter.clear()
  resetTaskMemoryForTests()
  const store = memoryStore([
    { taskId: 'run', baseUrl: 'http://b', route: '/import', serverSideType: 'x.Import' },
    { taskId: 'end', baseUrl: 'http://b', route: '/import', serverSideType: 'x.Import' },
    { taskId: 'gone', baseUrl: 'http://b', route: '/import', serverSideType: 'x.Import' },
  ])
  const calls = []
  const call = async (base, body, opts) => {
    calls.push({ base, body, opts })
    // the server answers the caller's own tasks only — and here also an id nobody asked about
    return { commands: [
      { type: 'Progress', data: progress({ taskId: 'run', title: 'Import', fraction: 0.4, etaSeconds: 90 }) },
      { type: 'Progress', data: progress({ taskId: 'end', state: 'done', resultActions: [{ label: 'Open', route: '/r' }, { label: 'Run', actionId: 'again' }] }) },
      { type: 'Progress', data: progress({ taskId: 'stranger' }) },
    ] }
  }
  const streams = []
  const stream = async (base, ctx, route, actionId, state, extra) => {
    streams.push({ base, route, actionId, extra })
    noteProgress(progressInc(progress({ taskId: 'run', fraction: 0.7 })), {})
    await extra.onIncrement({ commands: [], messages: [{ persistence: 'inbox', key: 'k1', title: 'Import finished', text: 'ok', variant: 'success' }] })
    noteProgress(progressInc(progress({ taskId: 'run', state: 'done', fraction: 1 })), {})
    return []
  }
  resetInboxForTests()
  try {
    const picked = await reattachTasks({ center: taskCenter, store, call, stream })
    assert.deepEqual(picked, ['run', 'end'])
    assert.equal(calls.length, 1, 'one question per backend')
    assert.equal(calls[0].base, 'http://b')
    assert.equal(calls[0].body.actionId, '_progress-tasks')
    assert.deepEqual(calls[0].body.parameters, { taskIds: ['run', 'end', 'gone'] })
    assert.equal(taskCenter.get('stranger'), null, 'a task this tab did not ask about is never taken')
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(streams.length, 1, 'only the running task is resumed')
    assert.equal(streams[0].actionId, '_progress-resume')
    assert.deepEqual(streams[0].extra.parameters, { taskId: 'run' })
    assert.equal(streams[0].route, '/import')
    assert.equal(taskCenter.get('run').state, 'done', 'the resumed stream carried it to its end')
    assert.equal(entriesOf(currentInbox())[0].title, 'Import finished', 'its inbox message landed in the inbox')
    const ended = taskViewOf(taskCenter.get('end'))
    assert.deepEqual(ended.resultActions.map((a) => a.label), ['Open'], 'after a reload only the result actions that navigate are offered')
    assert.equal(ended.canRetry, false)
    assert.deepEqual(rememberedTasks(store), [], 'unanswered ids forgotten; finished ones too')
  } finally { taskCenter.clear(); resetTaskMemoryForTests(); resetInboxForTests() }
})

test('reattach: a backend that cannot be reached keeps its ids for the next boot; a resume stream that breaks leaves the task failed', async () => {
  taskCenter.clear()
  resetTaskMemoryForTests()
  const store = memoryStore([{ taskId: 'x', baseUrl: '', route: '', serverSideType: null }])
  try {
    assert.deepEqual(await reattachTasks({ center: taskCenter, store, call: async () => { throw new Error('offline') }, stream: async () => [] }), [])
    assert.equal(rememberedTasks(store).length, 1)
    taskCenter.upsert(progress({ taskId: 'x' }), {})
    await resumeTask({ taskId: 'x', baseUrl: '' }, { center: taskCenter, stream: async () => { throw new Error('reset') } })
    assert.equal(taskCenter.get('x').state, 'failed')
  } finally { taskCenter.clear(); resetTaskMemoryForTests() }
})

test('a resume stream belongs to no screen: a navigation before its first event does not cut it', async () => {
  taskCenter.clear()
  const original = globalThis.fetch
  globalThis.fetch = async () => { beginView(); return sseResponse([{ commands: [{ type: 'Progress', data: progress({ taskId: 'r1', state: 'done' }) }] }]) }
  try {
    taskCenter.upsert(progress({ taskId: 'r1' }), {})
    await resumeTask({ taskId: 'r1', baseUrl: '' }, { center: taskCenter })
    assert.equal(taskCenter.get('r1').state, 'done', 'followed to its end, not marked failed')
  } finally { globalThis.fetch = original; taskCenter.clear() }
})

test('leaving the screen before a task reports does not cut its stream: the first event decides', async () => {
  taskCenter.clear()
  const original = globalThis.fetch
  let cancelled = 0
  globalThis.fetch = async () => {
    beginView() // the user navigates while the request is in flight
    const res = sseResponse([{ commands: [{ type: 'Progress', data: progress({ taskId: 'k1', state: 'running' }) }] },
      { commands: [{ type: 'Progress', data: progress({ taskId: 'k1', state: 'done' }) }] }])
    return { ...res, body: { getReader: () => {
      const chunks = [res.text()]
      return {
        read: async () => (chunks.length ? { done: false, value: new TextEncoder().encode(await chunks.shift()) } : { done: true }),
        cancel: async () => { cancelled++ },
      }
    } } }
  }
  try {
    await assert.rejects(() => runMateuActionSse('', null, '/x', 'recalculate', {}), (e) => isStaleResponse(e))
    assert.equal(taskCenter.get('k1').state, 'done')
    assert.equal(cancelled, 0)
  } finally { globalThis.fetch = original; taskCenter.clear() }
})

test('a Retry carries the app state (the @AppContext values) of the action it re-runs', async () => {
  taskCenter.clear()
  const original = globalThis.fetch
  globalThis.fetch = async () => sseResponse([{ commands: [{ type: 'Progress', data: progress({ taskId: 'a1', state: 'failed', retryable: true }) }] }])
  const sent = []
  setTaskActionSink(null)
  setTaskTransport((kind, o, body) => { sent.push(body); return Promise.resolve([]) })
  try {
    await runMateuActionSse('', null, '/x', 'importAll', {}, { appState: { hotel: 'B' } })
    retryTask('a1')
    assert.deepEqual(sent.map((b) => b.appState), [{ hotel: 'B' }])
  } finally { globalThis.fetch = original; setTaskTransport(null); taskCenter.clear() }
})

const recoveryOrigin = { base: '/app', route: '/import', serverSideType: 'x.Import', actionId: 'importAll' }
test('a broken stream goes looking for its tasks: one still running is followed and keeps its origin', async () => {
  taskCenter.clear()
  taskCenter.upsert(progress({ taskId: 'b1' }), recoveryOrigin)
  const resumed = []
  const stream = async (base, ctx, route, actionId, state, extra) => { resumed.push({ actionId, parameters: extra.parameters }); return [] }
  await recoverBrokenTasks(recoveryOrigin, ['b1'], 'reset', {
    center: taskCenter, stream, waits: [0],
    call: async (base, body) => { assert.equal(body.actionId, '_progress-tasks'); return { commands: [{ type: 'Progress', data: progress({ taskId: 'b1', text: 'half way' }) }] } },
  })
  await new Promise((r) => setTimeout(r, 5))
  assert.deepEqual(resumed, [{ actionId: '_progress-resume', parameters: { taskId: 'b1' } }])
  assert.equal(taskCenter.get('b1').origin.actionId, 'importAll', 'Retry and Cancel still know where it came from')
  taskCenter.clear()
})

test('a broken stream: the server no longer knows the task, or cannot be reached in time → failed, with what broke', async () => {
  taskCenter.clear()
  taskCenter.upsert(progress({ taskId: 'g1' }), recoveryOrigin)
  await recoverBrokenTasks(recoveryOrigin, ['g1'], 'reset', { center: taskCenter, waits: [0], call: async () => ({ commands: [] }) })
  assert.equal(taskCenter.get('g1').state, 'failed')
  assert.equal(taskCenter.get('g1').error, 'reset')
  taskCenter.upsert(progress({ taskId: 'g2' }), recoveryOrigin)
  let calls = 0
  await recoverBrokenTasks(recoveryOrigin, ['g2'], 'reset', { center: taskCenter, waits: [0, 0], call: async () => { calls++; throw new Error('offline') } })
  assert.equal(calls, 2)
  assert.equal(taskCenter.get('g2').state, 'failed')
  taskCenter.clear()
})

test('a blip shorter than the waits costs nothing; a stream only looks for tasks that have not ended', async () => {
  taskCenter.clear()
  taskCenter.upsert(progress({ taskId: 'h1' }), recoveryOrigin)
  let calls = 0
  await recoverBrokenTasks(recoveryOrigin, ['h1'], 'reset', {
    center: taskCenter, stream: () => new Promise(() => {}), waits: [0, 0],
    call: async () => { if (++calls === 1) throw new Error('offline'); return { commands: [{ type: 'Progress', data: progress({ taskId: 'h1' }) }] } },
  })
  assert.equal(taskCenter.get('h1').state, 'running')
  taskCenter.upsert(progress({ taskId: 'h2', state: 'done' }), recoveryOrigin)
  assert.deepEqual(recoverUnfinishedTasks(recoveryOrigin, new Set(['h1', 'h2', 'unknown'])), ['h1'])
  taskCenter.clear()
})

// ── OS-level notifications (osNotify.mjs) ────────────────────────────────────────────────────

const fakeNotifications = (permission = 'default') => {
  const shown = []
  class N {
    constructor(title, options) { this.title = title; this.options = options; shown.push(this) }
    close() { this.closed = true }
  }
  N.permission = permission
  N.requestPermission = async () => { N.asked = (N.asked || 0) + 1; N.permission = 'granted'; return 'granted' }
  const win = { Notification: N, focus: () => { win.focused = true } }
  return { win, N, shown }
}

test('OS notifications: only for an app that opted in, granted, with the tab hidden; a click focuses and navigates', () => {
  const { win, shown } = fakeNotifications('granted')
  const hidden = { visibilityState: 'hidden' }
  const nav = sinkLog()
  setOsNotificationNavigateSink(nav)
  try {
    setOsNotificationsEnabled(false)
    assert.equal(osNotify({ title: 'T' }, { win, doc: hidden }), null, 'the app did not opt in')
    setOsNotificationsEnabled(true)
    assert.equal(osNotify({ title: 'T' }, { win, doc: { visibilityState: 'visible' } }), null, 'the user is looking at the app')
    assert.equal(osNotify({ title: 'T' }, { win: fakeNotifications('denied').win, doc: hidden }), null, 'denied')
    const n = osNotify({ title: 'Import', body: 'done', tag: 'task-1', route: '/r' }, { win, doc: hidden })
    assert.equal(shown.length, 1)
    assert.equal(n.options.tag, 'task-1', 'the tag collapses the tabs\' copies into one')
    n.onclick()
    assert.equal(win.focused, true)
    assert.deepEqual(nav.calls, [['/r']])
    assert.equal(n.closed, true)
  } finally { setOsNotificationsEnabled(false); setOsNotificationNavigateSink(null) }
})

test('OS notifications: which events — a background task that ended done/failed, a new unread inbox entry', () => {
  const bg = { kind: 'finished', task: { taskId: 't', title: 'Import', state: 'done', text: 'All in', backgrounded: true, resultActions: [{ route: '/r' }] } }
  assert.deepEqual(taskOsNotificationOf(bg), { title: 'Import', body: 'All in', tag: 'task-t', route: '/r' })
  assert.equal(taskOsNotificationOf({ ...bg, task: { ...bg.task, backgrounded: false } }), null, 'a blocking task the user is waiting for')
  assert.equal(taskOsNotificationOf({ ...bg, task: { ...bg.task, state: 'cancelled' } }), null, 'the user cancelled it')
  assert.equal(taskOsNotificationOf({ ...bg, kind: 'updated' }), null)
  assert.equal(taskOsNotificationOf({ kind: 'finished', task: { ...bg.task, state: 'failed', error: 'Boom' } }).body, 'Boom')
  assert.deepEqual(inboxOsNotificationOf({ id: 'e', title: 'Approve', text: 'x', unread: true, route: '/e' }), { title: 'Approve', body: 'x', tag: 'inbox-e', route: '/e' })
  assert.equal(inboxOsNotificationOf({ id: 'e', title: 'Approve', unread: false }), null)
})

test('OS notifications: "Notify me on this device" shows only while nothing was asked, and asks only on its click', async () => {
  const { win, N } = fakeNotifications('default')
  const { doc } = makeDom()
  try {
    setOsNotificationsEnabled(false)
    assert.equal(osNotifyControl(doc, null, win), null, 'not for an app that did not opt in')
    setOsNotificationsEnabled(true)
    assert.equal(offersOsNotifications(win), true)
    let repainted = 0
    const b = osNotifyControl(doc, () => { repainted++ }, win)
    assert.equal(b.textContent, 'Notify me on this device')
    assert.equal(N.asked, undefined, 'nothing asked before the click')
    b.dispatchEvent(new FakeEvent('ojAction', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(N.asked, 1)
    assert.equal(repainted, 1)
    assert.equal(offersOsNotifications(win), false, 'answered: the control goes')
    assert.equal(osNotificationPermission({}), 'unsupported')
  } finally { setOsNotificationsEnabled(false) }
})

test('OS notifications: an inbox message arriving while the tab is hidden is told through the OS, once', () => {
  const { win, shown } = fakeNotifications('granted')
  const saved = { Notification: globalThis.Notification, document: globalThis.document, window: globalThis.window }
  globalThis.window = win
  globalThis.document = { visibilityState: 'hidden' }
  resetInboxForTests()
  setOsNotificationsEnabled(true)
  try {
    const m = { persistence: 'inbox', key: 'k9', title: 'Export ready', text: 'report.xlsx', variant: 'success' }
    noteInboxMessage(m)
    noteInboxMessage(m)
    assert.equal(shown.length, 1, 'the same entry again is not news')
    assert.equal(shown[0].title, 'Export ready')
    assert.equal(shown[0].options.tag, 'inbox-k9')
  } finally {
    setOsNotificationsEnabled(false)
    resetInboxForTests()
    if (saved.window === undefined) delete globalThis.window; else globalThis.window = saved.window
    if (saved.document === undefined) delete globalThis.document; else globalThis.document = saved.document
  }
})

// ── the wiring ───────────────────────────────────────────────────────────────────────────────

test('the shell installs the task center and wires the inbox; the content page has no progress dialog of its own', () => {
  const app = (p) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', p), 'utf8')
  const boot = app('pages/shell-page-chains/loadMateuShell.js')
  assert.match(boot, /bridge\.installTaskCenter\(document\)/)
  assert.match(boot, /bridge\.setTaskActionSink\(runPageAction\)/)
  assert.match(boot, /bridge\.setInboxContext\(/)
  // a reloaded tab picks its tasks up again; @App(osNotifications) reaches the bell and task list
  assert.match(boot, /bridge\.reattachTasks\(\)/)
  assert.match(boot, /bridge\.setOsNotificationsEnabled\(/)
  assert.match(boot, /bridge\.setOsNotificationNavigateSink\(navigateToRoute\)/)
  assert.doesNotMatch(app('flows/main/pages/main-start-page.html'), /mateuProgressDialog/)
  assert.doesNotMatch(app('flows/main/pages/main-start-page-chains/runMateuAction.js'), /longTaskWatcher/)
  assert.doesNotMatch(app('flows/main/pages/main-start-page-chains/runMateuIslandAction.js'), /longTaskWatcher/)
  const bridge = app('resources/js/mateu-bridge.js')
  assert.match(bridge, /function installTaskCenter/)
  assert.match(bridge, /'_progress-cancel'/)
  assert.match(bridge, /'_progress-tasks'/)
  assert.match(bridge, /'_progress-resume'/)
  assert.match(bridge, /new win\.Notification\(/)
  assert.match(bridge, /'_notifications-act'/)
})

test('an action toast\'s clock stops while hovered or focused and resumes with what was left (WCAG 2.2.1)', () => {
  // a fake clock: the subject is the pause logic, not real time
  let now = 0
  let queue = []
  const realSet = globalThis.setTimeout, realClear = globalThis.clearTimeout, realNow = Date.now
  globalThis.setTimeout = (fn, ms) => { const t = { fn, at: now + ms }; queue.push(t); return t }
  globalThis.clearTimeout = (t) => { queue = queue.filter((q) => q !== t) }
  Date.now = () => now
  const advance = (ms) => { now += ms; for (const t of queue.filter((q) => q.at <= now)) { queue = queue.filter((q) => q !== t); t.fn() } }
  try {
    const listeners = {}
    const doc = { visibilityState: 'visible', addEventListener: (k, f) => { listeners['doc:' + k] = f }, removeEventListener: () => {} }
    const inner = {}
    const el = {
      addEventListener: (k, f) => { listeners[k] = f }, removeEventListener: (k) => { delete listeners[k] },
      contains: (n) => n === inner,
    }
    let closed = 0
    pausableToastClose(el, 10000, () => closed++, doc)
    advance(4000)
    listeners.mouseenter()
    advance(60000)
    assert.equal(closed, 0, 'hovered: stays')
    listeners.focusin()
    listeners.mouseleave()
    listeners.focusout({ relatedTarget: inner })
    advance(60000)
    assert.equal(closed, 0, 'focus moved inside the toast: still paused')
    listeners.focusout({ relatedTarget: null })
    advance(5999)
    assert.equal(closed, 0)
    advance(1)
    assert.equal(closed, 1, 'resumed with the 6 s that were left')
    assert.equal(listeners.mouseenter, undefined, 'listeners removed once closed')
    let never = 0
    pausableToastClose(el, 0, () => never++, doc)
    advance(600000)
    assert.equal(never, 0, 'a sticky toast never closes on its own')
  } finally {
    globalThis.setTimeout = realSet; globalThis.clearTimeout = realClear; Date.now = realNow
  }
})

for (const { name, fn } of tests) {
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    console.log('  ✗ ' + name)
    console.error(e)
    process.exit(1)
  }
}
console.log(`\n${passed} progress & notifications tests OK`)
