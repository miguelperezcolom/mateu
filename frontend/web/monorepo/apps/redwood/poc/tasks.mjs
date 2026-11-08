import { chromeText } from './i18n.mjs'
import { announce } from './a11y.mjs'
// TASK CENTER: the progress-reporting pattern (design/progress-and-notifications.md) in Redwood.
//
// The server reports long-running work as `Progress` commands (ProgressDto: taskId, title, text,
// fraction | null = indeterminate, done/total, state running|done|failed|cancelled, blocking,
// backgroundable, cancellable, retryable, startedAt, closeAfterSeconds, error, resultActions). Each
// command is the WHOLE current state of its task, so the center upserts by taskId. Several tasks can
// run at once; a task belongs to the center, not to the screen that started it — the stream keeps
// feeding it after the user navigates away (transport.mjs runMateuActionSse).
//
// Presentation (Redwood / JET, painted outside Knockout: data-oj-binding-provider="none"):
//  - a BLOCKING task that is running (and not moved to the background) → an oj-dialog with an
//    oj-c-progress-bar (value -1 = indeterminate; the legacy oj-progress-bar does not register
//    at runtime against the CDN, DESIGN-NOTES «JET GOTCHA»), its text, "12 of 300", the elapsed time and
//    Background / Cancel; once finished it shows the outcome (result actions, Retry) and closes on
//    its own when the task says so;
//  - everything else → a docked task panel (bottom end) whose button counts the running tasks and
//    opens the list: per task its state, progress, text or error, Cancel / Retry / result actions /
//    Dismiss, and «Clear finished».
//
// Cancel → the app-level `_progress-cancel {taskId}`; Retry → the action that started the task,
// again; a result action → its route (navigate) or its actionId (run like the task's action).

// ── pure model ────────────────────────────────────────────────────────────────────────────────

export const TASK_STATES = ['running', 'done', 'failed', 'cancelled']
const isTaskTerminal = (state) => state === 'done' || state === 'failed' || state === 'cancelled'

/** The Progress commands an increment carries (their data), in order. */
export function progressCommandsOf(increment) {
  return ((increment && increment.commands) || [])
    .filter((c) => c && c.type === 'Progress' && c.data && c.data.taskId)
    .map((c) => c.data)
}

/** The increment without its Progress commands (the same object when it has none). */
export function withoutProgressCommands(increment) {
  const commands = (increment && increment.commands) || []
  if (!commands.some((c) => c && c.type === 'Progress')) return increment
  return { ...increment, commands: commands.filter((c) => !(c && c.type === 'Progress')) }
}

/** Nothing left to apply: no commands, messages, fragments or banners. */
export function isEmptyIncrement(increment) {
  if (!increment) return true
  return !((increment.commands || []).length || (increment.messages || []).length
    || (increment.fragments || []).length || (increment.banners || []).length
    || increment.appData != null || increment.appState != null)
}

/**
 * A task center: tasks by id, running ones first (oldest first), then the finished ones (latest
 * first, at most `keepFinished`). `upsert` answers what happened: 'started' | 'updated' | 'finished'
 * | 'ignored' (an update for a task that already ended — a late step, a second cancelled echo).
 */
export function createTaskCenter({ keepFinished = 10, now = () => Date.now() } = {}) {
  const tasks = new Map()
  const listeners = new Set()
  const emit = (event) => { for (const l of [...listeners]) { try { l(event) } catch (e) { /* a painter must not stop the center */ } } }
  const prune = () => {
    const finished = [...tasks.values()].filter((t) => isTaskTerminal(t.state)).sort((a, b) => b.finishedAt - a.finishedAt)
    for (const t of finished.slice(keepFinished)) tasks.delete(t.taskId)
  }
  const center = {
    upsert(progress, origin) {
      if (!progress || !progress.taskId) return 'ignored'
      const id = String(progress.taskId)
      const prev = tasks.get(id)
      if (prev && isTaskTerminal(prev.state)) return 'ignored'
      const state = TASK_STATES.includes(progress.state) ? progress.state : 'running'
      const at = now()
      const task = {
        ...progress,
        taskId: id,
        state,
        resultActions: Array.isArray(progress.resultActions) ? progress.resultActions : [],
        origin: (prev && prev.origin) || origin || null,
        // a background task never takes the dialog; a blocking one does until moved/closed
        backgrounded: prev ? prev.backgrounded : !progress.blocking,
        seenAt: prev ? prev.seenAt : at,
        finishedAt: isTaskTerminal(state) ? at : null,
      }
      tasks.set(id, task)
      const kind = !prev ? (isTaskTerminal(state) ? 'finished' : 'started') : (isTaskTerminal(state) ? 'finished' : 'updated')
      prune()
      emit({ kind, task })
      return kind
    },
    get: (id) => tasks.get(String(id)) || null,
    list() {
      const all = [...tasks.values()]
      const running = all.filter((t) => !isTaskTerminal(t.state)).sort((a, b) => a.seenAt - b.seenAt)
      const finished = all.filter((t) => isTaskTerminal(t.state)).sort((a, b) => b.finishedAt - a.finishedAt)
      return running.concat(finished)
    },
    /** The user sends a blocking task to the background (or its finished dialog closes). */
    background(id) {
      const t = tasks.get(String(id))
      if (!t || t.backgrounded) return false
      tasks.set(t.taskId, { ...t, backgrounded: true })
      emit({ kind: 'backgrounded', task: tasks.get(t.taskId) })
      return true
    },
    /** Removes a FINISHED task from the list (a running one cannot be dismissed: cancel it). */
    dismiss(id) {
      const t = tasks.get(String(id))
      if (!t || !isTaskTerminal(t.state)) return false
      tasks.delete(t.taskId)
      emit({ kind: 'dismissed', task: t })
      return true
    },
    clearFinished() {
      let n = 0
      for (const t of [...tasks.values()]) if (isTaskTerminal(t.state)) { tasks.delete(t.taskId); n++ }
      if (n) emit({ kind: 'cleared', task: null })
      return n
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    clear() { tasks.clear(); emit({ kind: 'cleared', task: null }) },
  }
  return center
}

/** 83 s → "1:23", 3723 s → "1:02:03". */
export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** What one task shows (pure: `now` is the clock). */
export function taskViewOf(task, now = Date.now()) {
  const running = task.state === 'running'
  const fraction = typeof task.fraction === 'number' && isFinite(task.fraction) ? Math.max(0, Math.min(1, task.fraction)) : null
  // elapsed from the server's start when it sent one, else from when this tab first saw the task
  const started = typeof task.startedAt === 'number' ? Math.min(task.startedAt, task.seenAt || task.startedAt) : task.seenAt
  const end = running ? now : (task.finishedAt || now)
  const count = task.total != null && task.total > 0 && task.done != null
    ? chromeText('taskCount', { done: task.done, total: task.total }) : ''
  const stateLabel = chromeText({ running: 'taskRunning', done: 'taskDone', failed: 'taskFailed', cancelled: 'taskCancelled' }[task.state])
  const value = fraction == null ? (running ? -1 : (task.state === 'done' ? 100 : 0)) : Math.round(fraction * 100)
  return {
    id: task.taskId,
    title: task.title || '',
    text: task.text || '',
    error: task.state === 'failed' ? (task.error || task.text || '') : '',
    state: task.state,
    stateLabel,
    running,
    finished: !running,
    indeterminate: value === -1,
    value,
    count,
    elapsed: started != null ? formatElapsed(end - started) : '',
    // what a screen reader reads off the bar: the count, else the percent, else the state
    valueText: count || (fraction != null ? `${value}%` : stateLabel),
    canCancel: running && !!task.cancellable,
    canBackground: running && !!task.blocking && !!task.backgroundable && !task.backgrounded,
    canRetry: task.state === 'failed' && !!task.retryable && !!(task.origin && task.origin.actionId),
    resultActions: task.state === 'done' ? (task.resultActions || []).filter((a) => a && (a.route || a.actionId)) : [],
    blocking: !!task.blocking && !task.backgrounded,
  }
}

/** The whole center: the task in the dialog (if any), the docked list and its taskButton. */
export function taskCenterViewOf(tasks, now = Date.now()) {
  const views = (tasks || []).map((t) => taskViewOf(t, now))
  const dialog = views.find((v) => v.blocking) || null
  const docked = views.filter((v) => v !== dialog)
  const running = views.filter((v) => v.running).length
  return {
    dialog,
    docked,
    running,
    hasDocked: docked.length > 0,
    hasFinished: docked.some((v) => v.finished),
    badge: running > 9 ? '9+' : String(running),
    buttonLabel: running ? `${chromeText('tasks')} · ${chromeText('tasksRunning', { n: running })}` : chromeText('tasks'),
    ariaLabel: chromeText('tasksTitle', { n: running }),
  }
}

/** How long a finished blocking dialog stays: ms, or null = until the user closes it. A cancel
 *  closes it at once; a failure, or a result the user can act on, waits for the user. */
export function autoCloseDelayOf(task) {
  if (!task || !isTaskTerminal(task.state)) return null
  if (task.state === 'cancelled') return 0
  if (task.closeAfterSeconds != null && task.closeAfterSeconds >= 0) return task.closeAfterSeconds * 1000
  if (task.state === 'failed') return null
  return (task.resultActions || []).length ? null : 600
}

/** What the screen reader is told about a transition (polite; a failure is assertive). */
export function taskAnnouncementOf(event) {
  if (!event || !event.task) return null
  const t = event.task
  const title = t.title || chromeText('tasks')
  if (event.kind === 'started') return { text: chromeText('taskStarted', { title }), assertive: false }
  if (event.kind !== 'finished') return null
  if (t.state === 'done') return { text: chromeText('taskFinished', { title }), assertive: false }
  if (t.state === 'failed') return { text: chromeText('taskFailedAnnounce', { title, error: t.error || t.text || '' }), assertive: true }
  return { text: chromeText('taskCancelledAnnounce', { title }), assertive: false }
}

// ── the center of this tab, and what feeds it ────────────────────────────────────────────────

export const taskCenter = createTaskCenter()

/** Feeds the center from an increment of a stream started by `origin` ({ base, route, actionId,
 *  parameters, componentState, serverSideType, consumedRoute, initiatorComponentId, view }).
 *  Returns how many Progress commands it carried. */
export function noteProgress(increment, origin) {
  const all = progressCommandsOf(increment)
  for (const p of all) taskCenter.upsert(p, origin)
  return all.length
}

// how the center talks to the server: set by transport.mjs (no import cycle), replaced in tests
let taskTransport = null
export function setTaskTransport(fn) { taskTransport = typeof fn === 'function' ? fn : null }
// how a task's action runs again ON THE SCREEN (the content page's chain), when still on it
let taskActionSink = null
export function setTaskActionSink(fn) { taskActionSink = typeof fn === 'function' ? fn : null }
// how a result action navigates
let taskNavigateSink = null
export function setTaskNavigateSink(fn) { taskNavigateSink = typeof fn === 'function' ? fn : null }
// the current view generation (resilience.currentView), to know whether the screen changed
let taskCurrentView = () => null
export function setTaskViewClock(fn) { taskCurrentView = typeof fn === 'function' ? fn : () => null }

/** Cancel: `_progress-cancel {taskId}` to the backend that runs it; its answer (Progress
 *  cancelled) is fed back to the center. */
export async function cancelTask(taskId, center = taskCenter) {
  const t = center.get(taskId)
  if (!t || t.state !== 'running' || !taskTransport) return false
  const o = t.origin || {}
  try {
    const increment = await taskTransport('cancel', o, {
      route: o.route || '', actionId: '_progress-cancel', parameters: { taskId: t.taskId },
      componentState: {}, serverSideType: o.serverSideType, consumedRoute: o.consumedRoute || '',
      initiatorComponentId: o.initiatorComponentId || '',
    })
    for (const p of progressCommandsOf(increment)) center.upsert(p, o)
    return true
  } catch (e) {
    return false
  }
}

/** Runs `actionId` (with `parameters`) the way the task's own action ran: on the screen through
 *  the page's chain while it is still the screen that started it, else straight to the backend
 *  (its progress lands in the center; the screen it would repaint is gone). */
export function runTaskAction(task, actionId, parameters) {
  const o = (task && task.origin) || {}
  if (!actionId) return false
  if (taskActionSink && o.view != null && o.view === taskCurrentView()) {
    taskActionSink(actionId, parameters || {}, {})
    return true
  }
  if (!taskTransport) return false
  taskTransport('stream', o, {
    route: o.route || '', actionId, parameters: parameters || {}, componentState: o.componentState || {},
    serverSideType: o.serverSideType, consumedRoute: o.consumedRoute || '', initiatorComponentId: o.initiatorComponentId || '',
  }).catch(() => undefined)
  return true
}

/** Retry: the action that started the failed task, with the same parameters. The old entry goes
 *  (the new run is a new task). */
export function retryTask(taskId, center = taskCenter) {
  const t = center.get(taskId)
  if (!t || t.state !== 'failed' || !t.retryable || !(t.origin && t.origin.actionId)) return false
  center.dismiss(t.taskId)
  return runTaskAction(t, t.origin.actionId, t.origin.parameters)
}

/** A result action: its route navigates, its actionId runs like the task's action. */
export function runResultAction(taskId, index, center = taskCenter) {
  const t = center.get(taskId)
  const a = t && (t.resultActions || [])[index]
  if (!a) return false
  if (a.route) { if (taskNavigateSink) taskNavigateSink(a.route); return !!taskNavigateSink }
  return runTaskAction(t, a.actionId, a.parameters)
}

// ── DOM (JET components created outside Knockout) ────────────────────────────────────────────

const taskDoc = () => (typeof document !== 'undefined' ? document : null)
let taskCenterInstalled = null

function taskEl(doc, tag, attrs = {}, text) {
  const e = doc.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) e.setAttribute(k, v === true ? '' : String(v))
  if (text != null) e.textContent = text
  return e
}

function taskButton(doc, label, onAction, { chroming = 'outlined', id, cls } = {}) {
  const b = taskEl(doc, 'oj-button', { chroming, id, class: cls })
  b.textContent = label
  b.addEventListener('ojAction', onAction)
  return b
}

function taskProgressBar(doc, v) {
  const bar = taskEl(doc, 'oj-c-progress-bar', {
    class: 'mateu-task-bar', max: '100', value: String(v.value),
    'aria-label': v.title, 'aria-valuetext': v.valueText,
  })
  bar.value = v.value
  return bar
}

function taskActionsOf(doc, v, center, { inDialog } = {}) {
  const row = taskEl(doc, 'div', { class: 'mateu-task-actions oj-flex oj-sm-flex-wrap oj-sm-justify-content-flex-end' })
  if (v.canBackground) row.appendChild(taskButton(doc, chromeText('taskBackground'), () => center.background(v.id)))
  if (v.canCancel) row.appendChild(taskButton(doc, chromeText('taskCancel'), () => cancelTask(v.id, center), { cls: 'mateu-task-cancel' }))
  if (v.canRetry) row.appendChild(taskButton(doc, chromeText('retry'), () => retryTask(v.id, center), { chroming: 'callToAction' }))
  v.resultActions.forEach((a, i) => row.appendChild(taskButton(doc, a.label || a.route || a.actionId,
    () => { runResultAction(v.id, i, center); if (inDialog) center.background(v.id) },
    { chroming: a.style === 'primary' || i === 0 ? 'callToAction' : 'outlined' })))
  if (v.finished) {
    row.appendChild(taskButton(doc, inDialog ? chromeText('close') : chromeText('taskDismiss'),
      () => (inDialog ? center.background(v.id) : center.dismiss(v.id)), { chroming: 'borderless' }))
  }
  return row
}

function taskBody(doc, v, { noTitle } = {}) {
  const box = taskEl(doc, 'div', { class: 'mateu-task', 'data-task-id': v.id, 'data-task-state': v.state })
  const head = taskEl(doc, 'div', { class: 'oj-flex oj-sm-justify-content-space-between oj-sm-align-items-center' })
  if (!noTitle) head.appendChild(taskEl(doc, 'span', { class: 'mateu-task-title oj-typography-body-md oj-typography-bold' }, v.title))
  head.appendChild(taskEl(doc, 'span', { class: 'mateu-task-state oj-typography-body-xs oj-text-color-secondary' }, v.stateLabel))
  box.appendChild(head)
  if (v.running || v.state === 'done') box.appendChild(taskProgressBar(doc, v))
  const text = v.error || v.text
  if (text) box.appendChild(taskEl(doc, 'div', { class: 'mateu-task-text oj-typography-body-sm' + (v.error ? ' oj-text-color-danger' : '') }, text))
  const meta = [v.count, v.elapsed ? chromeText('taskElapsed', { time: v.elapsed }) : ''].filter(Boolean).join(' · ')
  if (meta) box.appendChild(taskEl(doc, 'div', { class: 'mateu-task-meta oj-typography-body-xs oj-text-color-secondary', 'data-elapsed-for': v.id }, meta))
  return box
}

function paintTaskCenter(state) {
  const { doc, center, root, dock, dockButton, list, dialog, dialogBody, dialogFooter, dialogTitle } = state
  const view = taskCenterViewOf(center.list(), Date.now())
  // the dialog: the blocking task
  const d = view.dialog
  if (d) {
    dialogTitle.textContent = d.title
    dialog.setAttribute('aria-label', d.title)
    dialogBody.textContent = ''
    dialogBody.appendChild(taskBody(doc, d, { noTitle: true }))
    dialogFooter.textContent = ''
    dialogFooter.appendChild(taskActionsOf(doc, d, center, { inDialog: true }))
    if (state.dialogTask !== d.id) {
      state.dialogTask = d.id
      state.returnFocus = doc.activeElement
      if (typeof dialog.open === 'function') dialog.open()
      dialog.setAttribute('data-open', '')
      // keyboard: the first of its buttons (Background / Cancel) takes the focus
      const first = dialogFooter.querySelector('oj-button')
      if (first && typeof first.focus === 'function') setTimeout(() => first.focus(), 0)
    }
  } else if (state.dialogTask) {
    state.dialogTask = null
    if (typeof dialog.close === 'function') dialog.close()
    dialog.removeAttribute('data-open')
    const back = state.returnFocus
    state.returnFocus = null
    if (back && back.isConnected && typeof back.focus === 'function') back.focus()
  }
  // the dock: its taskButton (count) and its list
  taskToggleHidden(dock, !view.hasDocked)
  dockButton.textContent = view.buttonLabel
  dockButton.setAttribute('aria-label', view.ariaLabel)
  dockButton.setAttribute('aria-expanded', state.open ? 'true' : 'false')
  taskToggleHidden(list, !state.open)
  list.textContent = ''
  if (!view.docked.length) list.appendChild(taskEl(doc, 'div', { class: 'oj-text-color-secondary oj-sm-padding-2x' }, chromeText('tasksEmpty')))
  for (const v of view.docked) {
    const item = taskEl(doc, 'div', { class: 'mateu-task-item', role: 'listitem' })
    item.appendChild(taskBody(doc, v))
    item.appendChild(taskActionsOf(doc, v, center))
    list.appendChild(item)
  }
  if (view.hasFinished) {
    list.appendChild(taskButton(doc, chromeText('tasksClearFinished'), () => center.clearFinished(), { chroming: 'borderless', cls: 'mateu-task-clear' }))
  }
  // the clock: the elapsed time moves while something runs
  const anyRunning = view.running > 0
  if (anyRunning && !state.timer) state.timer = setInterval(() => tickTaskCenter(state), 1000)
  if (!anyRunning && state.timer) { clearInterval(state.timer); state.timer = null }
  void root
}

function tickTaskCenter(state) {
  const now = Date.now()
  for (const t of state.center.list()) {
    if (t.state !== 'running') continue
    const v = taskViewOf(t, now)
    const meta = [v.count, v.elapsed ? chromeText('taskElapsed', { time: v.elapsed }) : ''].filter(Boolean).join(' · ')
    for (const node of state.doc.querySelectorAll(`[data-elapsed-for="${TASK_CSS_ESCAPE(t.taskId)}"]`)) node.textContent = meta
  }
}

function taskToggleHidden(node, hidden) {
  if (hidden) node.setAttribute('hidden', ''); else node.removeAttribute('hidden')
}

const TASK_CSS_ESCAPE = (s) => String(s).replace(/["\\]/g, '\\$&')

/** Paints the center in `doc` (once; later calls answer the same handle). */
export function installTaskCenter(doc = taskDoc(), center = taskCenter) {
  if (taskCenterInstalled && taskCenterInstalled.doc === doc && taskCenterInstalled.center === center) return taskCenterInstalled
  if (!doc || !doc.body) return null
  // the JET modules these elements need, when the bridge runs inside VB's AMD loader
  if (typeof require === 'function') { try { require(['ojs/ojdialog', 'oj-c/progress-bar', 'ojs/ojbutton'], () => undefined, () => undefined) } catch (e) { /* not AMD */ } }
  const root = taskEl(doc, 'div', { id: 'mateuTaskCenter', class: 'mateu-task-center', 'data-oj-binding-provider': 'none' })
  const dialog = taskEl(doc, 'oj-dialog', { id: 'mateuTaskDialog', 'cancel-behavior': 'none', 'drag-affordance': 'none', modality: 'modal', role: 'dialog', 'aria-modal': 'true' })
  const header = taskEl(doc, 'div', { slot: 'header' })
  const dialogTitle = taskEl(doc, 'span', { class: 'oj-dialog-title', id: 'mateuTaskDialogTitle' })
  header.appendChild(dialogTitle)
  const dialogBody = taskEl(doc, 'div', { slot: 'body', class: 'mateu-task-dialog-body' })
  const dialogFooter = taskEl(doc, 'div', { slot: 'footer' })
  dialog.appendChild(header); dialog.appendChild(dialogBody); dialog.appendChild(dialogFooter)
  const dock = taskEl(doc, 'div', { class: 'mateu-task-dock' })
  taskToggleHidden(dock, true)
  const state = { doc, center, root, dock, dialog, dialogBody, dialogFooter, dialogTitle, open: false, dialogTask: null, timer: null, returnFocus: null }
  const dockButton = taskButton(doc, chromeText('tasks'), () => { state.open = !state.open; paintTaskCenter(state) },
    { chroming: 'solid', id: 'mateuTaskDockButton', cls: 'mateu-task-dock-button' })
  dockButton.setAttribute('aria-controls', 'mateuTaskList')
  const list = taskEl(doc, 'div', { id: 'mateuTaskList', class: 'mateu-task-list', role: 'list', 'aria-label': chromeText('tasks') })
  taskToggleHidden(list, true)
  dock.appendChild(list); dock.appendChild(dockButton)
  root.appendChild(dialog); root.appendChild(dock)
  doc.body.appendChild(root)
  state.dockButton = dockButton; state.list = list
  // Esc closes the open list (the dialog has no Esc: its buttons say what happens to the task)
  dock.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) { state.open = false; paintTaskCenter(state); dockButton.focus && dockButton.focus() } })
  const timers = new Map()
  center.subscribe((event) => {
    const said = taskAnnouncementOf(event)
    if (said) announce(said.text, { politeness: said.assertive ? 'assertive' : 'polite' })
    // a finished blocking dialog closes on its own when the task says so
    if (event.kind === 'finished' && event.task && event.task.blocking && !event.task.backgrounded) {
      const delay = autoCloseDelayOf(event.task)
      if (delay != null) timers.set(event.task.taskId, setTimeout(() => { timers.delete(event.task.taskId); center.background(event.task.taskId) }, delay))
    }
    // a newly backgrounded task opens the list, so the user sees where it went
    if (event.kind === 'backgrounded' && event.task && event.task.state === 'running') state.open = true
    paintTaskCenter(state)
  })
  taskCenterInstalled = { doc, center, state, repaint: () => paintTaskCenter(state) }
  paintTaskCenter(state)
  return taskCenterInstalled
}

/** Test hook: forget the taskCenterInstalled painter. */
export function resetTaskCenterForTests() {
  if (taskCenterInstalled && taskCenterInstalled.state.timer) clearInterval(taskCenterInstalled.state.timer)
  taskCenterInstalled = null
  taskCenter.clear()
}
