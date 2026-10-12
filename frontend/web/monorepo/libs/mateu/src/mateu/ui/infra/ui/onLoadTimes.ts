/**
 * How many times an OnLoad trigger fires — its `times` (1 by default, 0 = unlimited), counted over
 * the life of the component on screen, not per render.
 *
 * A view that re-renders ITSELF (an action returning `this`) arrives as a fresh component with fresh
 * triggers, so the count used to start again at every render: an OnLoad action returning `this`
 * re-fired itself until the request-loop guard stopped it, whatever `times` said. Carrying the
 * count across an in-place re-render keeps `times = 1` meaning "once", and `times = 0` the documented
 * polling idiom (re-fire on every render, after `timeoutMillis`).
 */

interface CountedTrigger {
    type?: string
    actionId?: string
    times?: number
    triggered?: boolean
    firedTimes?: number
}

/** Copies the fire count of each OnLoad trigger of the outgoing render onto the incoming one. */
export function carryOnLoadCounts(previous: CountedTrigger[] | undefined, next: CountedTrigger[] | undefined) {
    if (!previous || !next) return
    for (const trigger of next) {
        if (trigger?.type !== 'OnLoad') continue
        const before = previous.find(p => p?.type === 'OnLoad' && p.actionId === trigger.actionId)
        if (before?.firedTimes) trigger.firedTimes = before.firedTimes
    }
}

/** Whether this OnLoad trigger may fire now; counts the firing when it may. */
export function claimOnLoadFiring(trigger: CountedTrigger): boolean {
    if (trigger.triggered) return false
    const times = trigger.times ?? 1
    const fired = trigger.firedTimes ?? 0
    if (times > 0 && fired >= times) return false
    trigger.triggered = true
    trigger.firedTimes = fired + 1
    return true
}
