/**
 * Retry policy — WHEN it is safe to re-send a sync call by ourselves.
 *
 * Two independent questions must both answer yes before anything is re-sent:
 *
 *   1. Could it work? — {@link ./requestPolicy} answers that from the failure (a timeout or a
 *      5xx might; a 400 never will).
 *   2. May we? — answered here, from the ACTION. This is the half that matters: re-sending a
 *      read is free, re-sending `create` after a timeout can produce a second row. When the
 *      request timed out we do NOT know whether the server processed it, so "retryable failure"
 *      alone is never licence to repeat a write.
 *
 * Hence the default is NO. Only actions known to be reads retry on their own; everything else
 * fails once and offers the user an explicit Retry, where the decision is theirs and informed.
 * A developer can opt an action in with `@Action(idempotent = true)`.
 */

import { RequestFailure } from './requestPolicy'

/**
 * Framework action ids that only ever read.
 *
 * The empty id is the ROUTE LOAD — the request `mateu-ux` fires when a route is mounted, and the
 * one whose failure hurts most on a bad connection, because it leaves the user on a blank page
 * with nothing to retry. It is a pure read, so it recovers by itself.
 */
const ALWAYS_SAFE: ReadonlySet<string> = new Set([
    '',
    '__load__',
    'search',
    '_globalsearch',
    '_notifications-list',
])

/** Prefixes of generated read-only action ids (lookup and context-selector searches). */
const SAFE_PREFIXES: readonly string[] = [
    '_appcontext-search-',
    'search-',
]

/**
 * Whether re-sending `actionId` cannot change server state twice. `declared` is the wire flag
 * (`Action.idempotent`) — an explicit opt-in from the developer, which wins over the built-in
 * list but is never used to opt an action OUT of it.
 */
export const isIdempotentAction = (actionId: string | undefined, declared?: boolean): boolean => {
    if (declared === true) return true
    // An ABSENT id is unknown work; an EMPTY id is the route load. Do not conflate them.
    if (actionId === undefined || actionId === null) return false
    if (ALWAYS_SAFE.has(actionId)) return true
    return SAFE_PREFIXES.some((prefix) => actionId.startsWith(prefix))
}

/** Attempts BEYOND the first. Two is enough to ride out a blip without stacking latency. */
export const MAX_RETRIES = 2

/**
 * Delay before retry number `attempt` (1-based). Exponential, with ±25% jitter so a server
 * coming back from an outage is not hit by every client in the same millisecond.
 * `random` is injectable for deterministic tests.
 */
export const retryDelayMs = (attempt: number, random: () => number = Math.random): number => {
    const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
    return Math.round(base * (0.75 + random() * 0.5))
}

/**
 * The decision. Note `offline` is deliberately NOT auto-retried here: re-sending in 300ms while
 * the network is down just burns the attempt budget. Reconnection is a different mechanism
 * ({@link ../ui/connectivity}), which waits for the connection to actually come back.
 */
export const shouldRetry = (
    failure: RequestFailure,
    attempt: number,
    options: { idempotent: boolean },
): boolean => {
    if (!options.idempotent) return false
    if (attempt > MAX_RETRIES) return false
    if (!failure.retryable) return false
    return failure.kind === 'timeout' || failure.kind === 'server'
}
