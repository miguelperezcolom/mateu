// Session-scoped cache of the FULL response of a @StaticView screen (the last step of the client
// structure cache). When the server marks a view static — its whole response never varies — the
// client keeps the complete fragment (structure + state + data) here and, on a return visit within
// the same session, renders it from the cache and SKIPS the server round-trip entirely.
//
// Deliberately IN-MEMORY (module scope), not localStorage: session scope is what makes skipping
// revalidation safe without a build hash — a full page reload wipes this map, so a new deployment
// is always picked up. It survives client-side navigations (that's the win) but not a reload.

import type UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";

const MAX_ENTRIES = 30

// key → the full authoritative fragment (component + state + data) for a static view
const store = new Map<string, UIFragment>()

let enabled = true
export const setStaticViewCacheEnabled = (on: boolean): void => {
    enabled = on
    if (!on) store.clear()
}

/** The cached full response for a static route, or undefined on miss / disabled. */
export const getStaticFragment = (key: string): UIFragment | undefined => {
    if (!enabled) return undefined
    return store.get(key)
}

/** Cache the full response of a static view for the session (most-recently-used eviction). */
export const putStaticFragment = (key: string, fragment: UIFragment): void => {
    if (!enabled) return
    store.delete(key)            // re-insert at the end so the Map's iteration order is LRU
    store.set(key, fragment)
    if (store.size > MAX_ENTRIES) {
        const oldest = store.keys().next().value
        if (oldest !== undefined) store.delete(oldest)
    }
}

/** Wipe the session cache (exposed for debugging / a hard reset). */
export const clearStaticFragments = (): void => store.clear()
