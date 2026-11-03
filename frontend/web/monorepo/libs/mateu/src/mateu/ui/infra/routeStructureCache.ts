import { withoutResolvedMicroFrontends } from './resolvedMicroFrontends'
// Client-side cache of screen STRUCTURE (the `component` tree of a route-load fragment) so a
// declared/static screen can paint its real layout INSTANTLY on a return visit instead of a
// generic skeleton. Phase (a) of the structure-cache work: this is a PREDICTION, never a
// replacement — mateu-ux still fires the normal route request and the authoritative response
// overwrites this seed (stale-while-revalidate). Only the structure is cached; state/data
// always come fresh from the server, so no stale business data is ever shown, and a structure
// that has drifted (permissions, a new deploy) self-corrects within one navigation.
//
// Mirrors the localStorage shape of recentRoutesStore.ts / columnPrefsStore.ts: one JSON
// object per origin under a single key, best-effort (any storage failure degrades to no cache).

import type Component from "@mateu/shared/apiClients/dtos/Component";

const KEY = 'mateu-route-structure-cache'
// Bump to hard-invalidate every cached structure when this module's shape (or the structural
// wire contract) changes in a way old entries can no longer be trusted through.
// 2: stored entries no longer carry the page's values (initialData); older ones did, so they go.
const CACHE_VERSION = 2
const MAX_ENTRIES = 50

interface Entry {
    v: number
    t: number            // last write (epoch ms), for LRU eviction
    component: Component
    // The server's structure ETag for this component (phase b). Echoed back as knownStructureHash
    // so the server can omit the structure when it still matches. undefined against old backends.
    hash?: string
}

// The full components (values included) this TAB has seen, by key. A revisit within the tab paints
// them exactly as before — the page's seed lets its OnLoad fetch the record before the server
// answers —, but they never reach storage, where another user of the browser would find them.
const inMemory = new Map<string, { component: Component, hash: string | undefined }>()

/** A cache hit: the cached structure plus the server ETag to echo on revalidation. */
export interface CachedStructure {
    component: Component
    hash: string | undefined
}

type Store = Record<string, Entry>

// Kill switch — defaults on, flip off from devtools (localStorage['mateu-route-structure-cache-off']='1')
// to measure the difference, or via setStructureCacheEnabled(false) in code.
let enabled = (() => {
    try {
        return localStorage.getItem('mateu-route-structure-cache-off') !== '1'
    } catch {
        return true
    }
})()

export const setStructureCacheEnabled = (on: boolean): void => { enabled = on }
export const isStructureCacheEnabled = (): boolean => enabled

const readAll = (): Store => {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
    } catch {
        return {}
    }
}

const writeAll = (store: Store): void => {
    try {
        localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
        // Quota exceeded / unavailable: drop the older half and try once more, else give up —
        // the cache is a best-effort accelerator, never load-bearing.
        try {
            const trimmed = Object.entries(store)
                .sort((a, b) => b[1].t - a[1].t)
                .slice(0, Math.floor(MAX_ENTRIES / 2))
            localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)))
        } catch {
            // no cache this time
        }
    }
}

/**
 * Stable cache key for a route load. `initialState` (an embedded island's host-seeded state,
 * e.g. a stayId) is folded in so two islands sharing a route but seeded differently — and thus
 * potentially yielding different structures — cache separately.
 */
export const structureCacheKey = (parts: {
    baseUrl: string
    consumedRoute: string | undefined
    route: string | undefined
    serverSideType: string | undefined
    initialState?: Record<string, unknown> | undefined
}): string => {
    const seed = parts.initialState && Object.keys(parts.initialState).length
        ? '#' + hash(JSON.stringify(parts.initialState))
        : ''
    return [
        parts.baseUrl,
        parts.consumedRoute ?? '',
        parts.route ?? '',
        parts.serverSideType ?? '',
    ].join('|') + seed
}

/** The cached STRUCTURE (+ its ETag) for a route, or undefined on miss / version mismatch / disabled. */
export const getCachedStructure = (key: string): CachedStructure | undefined => {
    if (!enabled) return undefined
    const remembered = inMemory.get(key)
    // A copy, every time: what is painted gets written on (an OnLoad trigger records that it fired).
    // Painting the remembered objects again, a revisit found its OnLoad already fired, and a listing
    // waited for ever for the rows it was going to ask for.
    if (remembered) return { component: structuredClone(remembered.component), hash: remembered.hash }
    const entry = readAll()[key]
    if (!entry || entry.v !== CACHE_VERSION) return undefined
    return { component: entry.component, hash: entry.hash }
}

/**
 * The STRUCTURE of a component, without the values it carries: the page's own seed
 * (`initialData`, the instance's state — a record's fields, a user's data) and that of every
 * island nested in it are dropped, and so is a remote's answer the host embedded (per request,
 * often per user). `valued` says whether anything was dropped.
 */
export const structureOf = (component: Component): { component: Component, valued: boolean } => {
    let valued = false
    const strip = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(strip)
        if (!value || typeof value !== 'object') return value
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (k === 'initialData') {
                if (v != null && !(typeof v === 'object' && Object.keys(v as object).length === 0)) {
                    valued = true
                }
                continue
            }
            out[k] = strip(v)
        }
        return out
    }
    const stripped = strip(withoutResolvedMicroFrontends(component)) as Component
    return { component: stripped, valued }
}

/** Record the authoritative structure (and its server ETag) for a route, evicting the
 *  least-recently-written entries once the cache is full. Only the STRUCTURE is persisted —
 *  never the values the page was opened with (see {@link structureOf}); those stay in this tab's
 *  memory. */
export const putCachedStructure = (key: string, component: Component, hash?: string): void => {
    if (!enabled) return
    const store = readAll()
    const structure = structureOf(component)
    inMemory.delete(key)
    inMemory.set(key, { component: structuredClone(withoutResolvedMicroFrontends(component)), hash })
    while (inMemory.size > MAX_ENTRIES) inMemory.delete(inMemory.keys().next().value as string)
    if (structure.valued) {
        // its values are what made it a prediction worth painting: without them it is not one
        delete store[key]
    } else {
        store[key] = { v: CACHE_VERSION, t: Date.now(), component: structure.component, hash }
    }
    const keys = Object.keys(store)
    if (keys.length > MAX_ENTRIES) {
        const oldest = keys.sort((a, b) => store[a].t - store[b].t).slice(0, keys.length - MAX_ENTRIES)
        for (const k of oldest) delete store[k]
    }
    writeAll(store)
}

/** Wipe the whole cache (exposed for debugging / a hard reset). */
export const clearStructureCache = (): void => {
    inMemory.clear()
    try {
        localStorage.removeItem(KEY)
    } catch {
        // ignore
    }
}

// Small, fast, stable string hash (FNV-1a) — for the initialState discriminator only, never
// for anything security-sensitive.
const hash = (s: string): string => {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0).toString(36)
}
