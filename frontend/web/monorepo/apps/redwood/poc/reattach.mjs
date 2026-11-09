import { callMateu, runMateuActionSse } from './transport.mjs'
import { taskCenter, progressCommandsOf, setTaskRecovery } from './tasks.mjs'
import { noteDetachedMessages, applyNotificationsChanged } from './inbox.mjs'
// REATTACH (design/progress-and-notifications.md, "Reattach"): a task survives a reload of the tab.
//
// The server keeps a task running for a grace period after its last subscriber left. This tab
// remembers, for its SESSION only (sessionStorage, the same key the web renderer uses), the tasks its
// streams reported; when the shell boots again it asks `_progress-tasks {taskIds}` of each backend
// — which answers the current state of the caller's own tasks and nothing about the others — and
// opens a `_progress-resume {taskId}` stream for every one still running: the task center fills up
// again. Ids the server does not answer (finished long ago, another user's, unknown) are forgotten.

export const TASK_MEMORY_KEY = 'mateu-progress-tasks'
const REATTACH_MAX_IDS = 50

const taskSession = () => { try { return globalThis.sessionStorage || null } catch (e) { return null } }

/** The tasks this tab's session remembers: [{ taskId, baseUrl, route, serverSideType }]. */
export function rememberedTasks(store = taskSession()) {
  try {
    const raw = store && store.getItem(TASK_MEMORY_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((t) => t && typeof t.taskId === 'string' && t.taskId) : []
  } catch (e) {
    return []
  }
}

function writeRememberedTasks(list, store) {
  try {
    if (!store) return
    if (list.length) store.setItem(TASK_MEMORY_KEY, JSON.stringify(list.slice(-REATTACH_MAX_IDS)))
    else store.removeItem(TASK_MEMORY_KEY)
  } catch (e) { /* storage blocked or full: the task simply will not survive a reload */ }
}

export function rememberTask(task, store = taskSession()) {
  if (!task || !task.taskId) return
  const list = rememberedTasks(store)
  if (list.some((t) => t.taskId === task.taskId)) return
  list.push({ taskId: String(task.taskId), baseUrl: task.baseUrl || '', route: task.route || '', serverSideType: task.serverSideType || null })
  writeRememberedTasks(list, store)
}

export function forgetTasks(taskIds, store = taskSession()) {
  const gone = new Set([].concat(taskIds || []).map(String))
  const list = rememberedTasks(store)
  const kept = list.filter((t) => !gone.has(t.taskId))
  if (kept.length !== list.length) writeRememberedTasks(kept, store)
}

let taskMemoryOff = null

/** Keeps the session's memory in step with the center: a running task is remembered, a finished
 *  one forgotten (once). */
export function installTaskMemory(center = taskCenter, store = taskSession()) {
  if (taskMemoryOff) return taskMemoryOff
  const off = center.subscribe((event) => {
    const t = event && event.task
    if (!t) return
    if (event.kind === 'finished' || event.kind === 'dismissed') { forgetTasks([t.taskId], store); return }
    if ((event.kind === 'started' || event.kind === 'updated') && t.state === 'running') {
      const o = t.origin || {}
      rememberTask({ taskId: t.taskId, baseUrl: o.base || '', route: o.route || '', serverSideType: o.serverSideType || null }, store)
    }
  })
  taskMemoryOff = () => { off(); taskMemoryOff = null }
  return taskMemoryOff
}

const reattachedOrigin = (t) => ({ base: t.baseUrl || '', route: t.route || '', serverSideType: t.serverSideType || undefined, actionId: null, view: null, reattached: true })

/** Follows one remembered task: `_progress-resume {taskId}` over the stream endpoint. Its page-level
 *  parts apply (progress → the center, `inbox` messages → the inbox, NotificationsChanged → the
 *  bell); a stream that ends before the task did leaves it failed — a task "running" forever is a lie. */
export async function resumeTask(t, { center = taskCenter, stream = runMateuActionSse } = {}) {
  const origin = reattachedOrigin(t)
  try {
    await stream(origin.base, null, origin.route, '_progress-resume', {}, {
      // no screen behind it (a boot's first navigation must not cut it), and the last try
      parameters: { taskId: t.taskId }, serverSideType: origin.serverSideType, view: null, recover: false,
      onIncrement: async (inc) => {
        for (const p of progressCommandsOf(inc)) center.upsert(p, origin)
        noteDetachedMessages(inc && inc.messages)
        for (const c of (inc && inc.commands) || []) if (c && c.type === 'NotificationsChanged') await applyNotificationsChanged(c.data || {})
        return true
      },
    })
  } catch (e) { /* a navigation (stale) or a broken connection: decided below */ }
  const now = center.get(t.taskId)
  if (now && now.state === 'running') {
    // the server stops streaming only once the task ended; anything else broke on the way
    center.upsert({ ...now, state: 'failed' }, origin)
  }
  return center.get(t.taskId)
}

/** How long a broken stream waits before each attempt to find its tasks again (the blip's length). */
export const RECOVERY_WAITS_MS = [1000, 3000, 8000]

/** A stream broke or ended under tasks still running: the server keeps them for its grace period, so
 *  before showing them as failed — with a Retry that would start the work twice — ask for them and
 *  follow the ones still running. They keep their origin (Cancel, Retry). Out of reach: failed. */
export async function recoverBrokenTasks(origin, ids, error, { center = taskCenter, call = callMateu, stream = runMateuActionSse, waits = RECOVERY_WAITS_MS } = {}) {
  const fail = (id) => {
    const now = center.get(id)
    if (now && now.state === 'running') center.upsert({ ...now, state: 'failed', error: error || now.error || null }, origin)
  }
  const base = origin.base || ''
  for (const wait of waits) {
    await new Promise((resolve) => setTimeout(resolve, wait))
    let answer = null
    try {
      answer = await call(base, {
        route: origin.route || '', actionId: '_progress-tasks', componentState: {},
        parameters: { taskIds: ids }, serverSideType: origin.serverSideType || undefined,
      }, { isolated: true })
    } catch (e) {
      continue // still cut off: the next attempt
    }
    const found = new Map(progressCommandsOf(answer).map((p) => [String(p.taskId), p]))
    for (const id of ids) {
      const p = found.get(id)
      if (!p) { fail(id); forgetTasks([id]); continue } // the server no longer knows it
      center.upsert(p, origin)
      if (p.state === 'running') void resumeTask({ taskId: id, baseUrl: base, route: origin.route, serverSideType: origin.serverSideType }, { center, stream })
    }
    return
  }
  ids.forEach(fail)
}

setTaskRecovery((origin, ids, error) => { void recoverBrokenTasks(origin, ids, error) })

/** On boot: asks every backend the remembered tasks came from which are still the caller's, puts
 *  them back in the center and resumes the running ones. Answers the task ids picked up. */
export async function reattachTasks({ center = taskCenter, store = taskSession(), call = callMateu, stream = runMateuActionSse } = {}) {
  installTaskMemory(center, store)
  const remembered = rememberedTasks(store)
  if (!remembered.length) return []
  const byBase = new Map()
  for (const t of remembered) {
    const k = t.baseUrl || ''
    if (!byBase.has(k)) byBase.set(k, [])
    byBase.get(k).push(t)
  }
  const picked = []
  const resumes = []
  for (const [base, tasks] of byBase) {
    let answer = null
    try {
      answer = await call(base, {
        route: tasks[0].route || '', actionId: '_progress-tasks', componentState: {},
        parameters: { taskIds: tasks.map((t) => t.taskId).slice(0, REATTACH_MAX_IDS) },
        serverSideType: tasks[0].serverSideType || undefined,
      }, { isolated: true })
    } catch (e) {
      continue // that backend is not reachable now: keep its ids for the next boot
    }
    const known = new Map(tasks.map((t) => [t.taskId, t]))
    const answered = new Set()
    for (const p of progressCommandsOf(answer)) {
      const t = known.get(String(p.taskId))
      if (!t) continue // never take a task this tab did not ask about
      answered.add(t.taskId)
      center.upsert(p, reattachedOrigin(t))
      picked.push(t.taskId)
      if (p.state === 'running') resumes.push(resumeTask(t, { center, stream }))
    }
    forgetTasks(tasks.map((t) => t.taskId).filter((id) => !answered.has(id)), store)
  }
  // the resume streams run on their own: the boot does not wait for the tasks to end
  void Promise.all(resumes)
  return picked
}

/** Test hook. */
export function resetTaskMemoryForTests() { if (taskMemoryOff) taskMemoryOff() }
