// PERIODIC REFRESH (triggers with a wait): the web's pattern — an OnLoad with timeoutMillis
// starts the first round and an OnSuccess(actionId = the same, calledActionId = the same,
// timeoutMillis) closes the loop: each refresh that ends well schedules the next. Before,
// the VB shell fired all OnLoads immediately, with no wait, and did not know OnSuccess.
//
// One GENERATION per screen: navigating starts a new one and everything scheduled for the previous one
// is discarded when it falls due (like the web's callbackToken) — a floor panel that is no longer seen
// stops asking.
//
// A trigger's CONDITION (`state.status.type != 'SUCCESS'`: poll while the process runs) is read
// when each round falls due, against the state its screen has THEN — as the web renderer reads it
// with the component's state. Before, it was not read at all: a finished process kept polling.

import { evaluateExpression } from './rules.mjs'
import { HOST_ID } from './core/tree.mjs'

let runner = null
/** Who runs the scheduled action (the shell: the same path as the Elements). */
export function setPollingRunner(fn) { runner = typeof fn === 'function' ? fn : null }

let generation = 0
let screenTree = null
const timers = new Set()

// the registry after the last reduction (make-amd's after-reduce hook)
let latestRegistry = null
export function notePollingRegistry(reg) { latestRegistry = reg || null }

// the context a trigger was scheduled from, as it is NOW: the reduced one of the same ServerSide (the
// host first), or the scheduled one when the registry does not have it
const currentPollingCtxOf = (ctx) => {
  const contexts = (latestRegistry && latestRegistry.contexts) || {}
  const type = ctx && ctx.tree && ctx.tree.serverSideType
  const host = contexts[HOST_ID]
  if (host && host.tree && host.tree.serverSideType === type) return host
  return Object.values(contexts).find((c) => c && c.tree && c.tree.serverSideType === type) || ctx
}

/** Whether a round of `trigger` runs: no condition, or its condition holds on the state `ctx` has now. */
export function pollingConditionHolds(trigger, ctx) {
  if (!trigger.condition) return true
  const now = currentPollingCtxOf(ctx) || {}
  return !!evaluateExpression(trigger.condition, { state: now.state || {}, data: now.data || {} })
}

const triggersOf = (ctx) => (ctx && ctx.tree && ctx.tree.triggers) || []

/** The OnLoads WITH a wait (the immediate ones follow the usual path: onLoadTriggers). */
export function timedOnLoadTriggers(ctx) {
  return triggersOf(ctx).filter((t) => t.type === 'OnLoad' && t.actionId && t.timeoutMillis > 0)
}

/** The OnSuccess ones that follow `actionId`. */
export function onSuccessTriggers(ctx, actionId) {
  return triggersOf(ctx).filter((t) => t.type === 'OnSuccess' && t.actionId && t.calledActionId === actionId)
}

// ONE pending round per trigger: if the refresh repaints the host and that relaunches its OnLoads (another
// 'search' that also ends well), a second success must not set up a second loop in parallel
// — the same one is rescheduled (the loops multiplied: 14 searches in 47 s with a 15 s wait)
const pendingByTrigger = new Map()
const triggerKey = (t) => t.type + ':' + t.actionId + ':' + (t.calledActionId || '')

const schedule = (trigger, ctx, gen, timer = setTimeout, clear = clearTimeout) => {
  const fire = () => {
    if (gen !== generation || !runner) return
    // the condition no longer holds (the process finished): no round, so no success and no next one
    if (!pollingConditionHolds(trigger, ctx)) return
    runner(trigger.actionId, {}, { background: !!trigger.background, polling: true })
  }
  if (!(trigger.timeoutMillis > 0)) { fire(); return }
  const key = triggerKey(trigger)
  const previous = pendingByTrigger.get(key)
  if (previous !== undefined) { clear(previous); timers.delete(previous) }
  // the round only runs if it is still THE pending one of its trigger (a replaced one falls due without
  // effect even if its timer could not be cancelled)
  const handle = timer(() => {
    timers.delete(handle)
    if (pendingByTrigger.get(key) !== handle) return
    pendingByTrigger.delete(key)
    fire()
  }, trigger.timeoutMillis)
  timers.add(handle)
  pendingByTrigger.set(key, handle)
}

/** New screen: discards what was scheduled and sets up its OnLoads with a wait. */
export function startPolling(hostCtx, timer = setTimeout) {
  generation++
  for (const h of timers) clearTimeout(h)
  timers.clear()
  pendingByTrigger.clear()
  screenTree = hostCtx && hostCtx.tree
  for (const t of timedOnLoadTriggers(hostCtx)) schedule(t, hostCtx, generation, timer)
  return generation
}

/** An action ended well (transport hook): its OnSuccess ones, if they belong to the current screen. */
export function actionSucceeded(ctx, actionId, timer = setTimeout) {
  if (!ctx || !ctx.tree) return 0
  // only the current screen (same server class as the one set up when navigating): another
  // ServerSide's island or a response of the previous screen reschedule nothing
  if (!screenTree || ctx.tree.serverSideType !== screenTree.serverSideType) return 0
  const next = onSuccessTriggers(ctx, actionId)
  for (const t of next) schedule(t, ctx, generation, timer)
  return next.length
}

/** The OnError ones that follow `actionId`. */
export function onErrorTriggers(ctx, actionId) {
  return triggersOf(ctx).filter((t) => t.type === 'OnError' && t.actionId && t.calledActionId === actionId)
}

/** An answer that FAILED: the server answers an exception with an error message (the error
 *  boundary), not with an HTTP error — the web renderer reads it the same way. */
export const isErrorAnswer = (inc) => !!(inc && (inc.messages || []).some((m) => m && m.variant === 'error'))

/** An action failed: its OnError ones (before, the VB shell did not know OnError), if they belong to the current
 *  screen — and NOT its OnSuccess ones: a refresh that fails is not rescheduled. */
export function actionFailed(ctx, actionId, timer = setTimeout) {
  if (!ctx || !ctx.tree) return 0
  if (!screenTree || ctx.tree.serverSideType !== screenTree.serverSideType) return 0
  const next = onErrorTriggers(ctx, actionId)
  for (const t of next) schedule(t, ctx, generation, timer)
  return next.length
}

export const pollingGeneration = () => generation
