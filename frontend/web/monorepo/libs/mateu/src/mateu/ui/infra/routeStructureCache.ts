import { withoutResolvedMicroFrontends } from './resolvedMicroFrontends'
import { clearStaticFragments } from './staticViewCache'
import { backendKeyOf } from './http/backendKey'
import { underPublicBase } from './http/publicBase'
// Client-side cache of screen STRUCTURE (the `component` tree of a route-load fragment) so a
// declared/static screen can paint its real layout INSTANTLY on a return visit instead of a
// generic skeleton. Phase (a) of the structure-cache work: this is a PREDICTION, never a
// replacement — mateu-ux still fires the normal route request and the authoritative response
// overwrites this seed (stale-while-revalidate). Only the structure is cached; state/data
// always come fresh from the server, so no stale business data is ever shown, and a structure
// that has drifted (permissions, a new deploy) self-corrects within one navigation.
//
// One JSON object under a single key in SESSION storage (W-2), best-effort (any storage failure
// degrades to no cache). Not localStorage: a composed page (a Dashboard's MetricCards, an
// EntityHeader, the shell's per-caller menu) carries its values in the STRUCTURE, which therefore
// cannot be told apart from them — kept in localStorage they stayed on the machine after sign-out
// and were painted first for the next user of the browser. Session storage dies with the tab, and
// the cache is also wiped on a 401 (sessionGuard), an idle sign-out and an auth-token change.

import type Component from "@mateu/shared/apiClients/dtos/Component";

// NAMESPACES (per app and per build). The key of an entry says which route it is for, not which
// app: two apps served one after the other on the same origin (localhost:8095) share every route
// key, and the structure the first one left named ITS view types — painted for the second one, its
// OnLoad triggers and nested route loads sent those types to a server that has never heard of them,
// and the user got "you are not allowed" (403) on every page the first app had visited. So every
// entry is written under a namespace: the page's APP (the `<meta name="mateu-app">` fingerprint the
// server puts in the page: the @UI class + the Mateu version, hashed) and the BUILD of the backend
// it came from (the X-Mateu-Build every response carries, AppBuild.java). A page of another app
// wipes the cache on load; a response from another build than the one a backend's entries were
// written under drops that backend's entries (noteBackendBuild); an entry whose namespace is not the
// current one is never returned. A page without the meta (a static bundle, an older or non-Java
// server) has the app '' — still a namespace, and still told apart by the build.

const KEY = 'mateu-route-structure-cache'
// Bump to hard-invalidate every cached structure when this module's shape (or the structural
// wire contract) changes in a way old entries can no longer be trusted through.
// 2: stored entries no longer carry the page's values (initialData); older ones did, so they go.
const CACHE_VERSION = 2
const MAX_ENTRIES = 50

interface Entry {
    v: number
    be?: string          // the backend (backendKeyOf) the structure came from
    ns?: string          // the namespace it was written under (see namespaceOf)
    t: number            // last write (epoch ms), for LRU eviction
    component: Component
    // The server's structure ETag for this component (phase b). Echoed back as knownStructureHash
    // so the server can omit the structure when it still matches. undefined against old backends.
    hash?: string
}

// The full components (values included) this TAB has seen, by key. A revisit within the tab paints
// them exactly as before — the page's seed lets its OnLoad fetch the record before the server
// answers —, but they never reach storage, where another user of the browser would find them.
const inMemory = new Map<string, { component: Component, hash: string | undefined, be: string, ns: string }>()

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

// what older releases left in localStorage (values of composed pages included) goes
try { localStorage.removeItem(KEY) } catch { /* unavailable */ }

const NS_KEY = 'mateu-route-structure-cache-ns'

/** The page's app and the last build seen of every backend, persisted with the entries. */
interface Namespaces {
    app: string
    builds: Record<string, string>
}

/** The page's app fingerprint (`<meta name="mateu-app">`), '' when the page carries none. */
export const pageAppFingerprint = (): string => {
    try {
        const meta = typeof document !== 'undefined'
            ? document.querySelector?.('meta[name="mateu-app"]')
            : null
        return meta?.getAttribute('content')?.trim() ?? ''
    } catch {
        return ''
    }
}

/** The backend a ux's baseUrl talks to, exactly as the transport computes it (buildWatch.ts). */
export const backendOfBaseUrl = (baseUrl: string | undefined): string =>
    backendKeyOf(underPublicBase(baseUrl ?? '') + '/mateu/v3/sync/') ?? ''

// the first part of a structureCacheKey is the ux's baseUrl (it holds no '|')
const backendOfKey = (key: string): string => backendOfBaseUrl(key.split('|')[0])

let namespaces: Namespaces | undefined

const readNamespaces = (): Namespaces | undefined => {
    try {
        const parsed = JSON.parse(sessionStorage.getItem(NS_KEY) ?? 'null') as Namespaces | null
        return parsed && typeof parsed.app === 'string' && parsed.builds && typeof parsed.builds === 'object'
            ? parsed : undefined
    } catch {
        return undefined
    }
}

const writeNamespaces = (ns: Namespaces): void => {
    try {
        sessionStorage.setItem(NS_KEY, JSON.stringify(ns))
    } catch {
        // best effort, like the entries
    }
}

/**
 * The namespaces in force, settled on first use: what this tab kept, unless the page is another
 * app's — then nothing the previous one wrote is kept.
 */
const currentNamespaces = (): Namespaces => {
    if (namespaces) return namespaces
    const app = pageAppFingerprint()
    const kept = readNamespaces()
    if (kept && kept.app === app) {
        namespaces = kept
    } else {
        namespaces = { app, builds: {} }
        if (kept) dropEntries(() => true)
        writeNamespaces(namespaces)
    }
    return namespaces
}

/** The namespace a backend's entries are written and read under: the page's app + its build. */
const namespaceOf = (backend: string): string => {
    const ns = currentNamespaces()
    return ns.app + '@' + (ns.builds[backend] ?? '')
}

/** Drops the entries (stored and in this tab's memory) whose backend `drop` names. */
const dropEntries = (drop: (backend: string) => boolean): void => {
    for (const [k, v] of [...inMemory.entries()]) {
        if (drop(v.be)) inMemory.delete(k)
    }
    const store = readAll()
    let changed = false
    for (const [k, v] of Object.entries(store)) {
        if (drop(v.be ?? backendOfKey(k))) {
            delete store[k]
            changed = true
        }
    }
    if (changed) writeAll(store)
    // a @StaticView's full answer is per build as much as its structure is
    clearStaticFragments()
}

/**
 * A response from `backend` said which build answered it (X-Mateu-Build). When that is not the
 * build the backend's entries were written under, the app was deployed again (or another app now
 * answers there): they all go, before the answer itself is cached under the new build.
 */
export const noteBackendBuild = (backend: string | undefined, build: string | undefined): void => {
    if (backend === undefined || !build) return
    const ns = currentNamespaces()
    const known = ns.builds[backend]
    if (known === build) return
    if (known !== undefined) dropEntries((be) => be === backend)
    ns.builds[backend] = build
    writeNamespaces(ns)
}

/**
 * A request driven by a cached structure was refused (cachedLayoutRecovery.ts): the cache holds a
 * view the server does not know, so everything it holds for that backend goes.
 */
export const dropBackendStructures = (baseUrl: string | undefined): void => {
    const backend = backendOfBaseUrl(baseUrl)
    dropEntries((be) => be === backend)
}

const readAll = (): Store => {
    try {
        return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Store
    } catch {
        return {}
    }
}

const writeAll = (store: Store): void => {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(store))
    } catch {
        // Quota exceeded / unavailable: drop the older half and try once more, else give up —
        // the cache is a best-effort accelerator, never load-bearing.
        try {
            const trimmed = Object.entries(store)
                .sort((a, b) => b[1].t - a[1].t)
                .slice(0, Math.floor(MAX_ENTRIES / 2))
            sessionStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)))
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
    const ns = namespaceOf(backendOfKey(key))
    const remembered = inMemory.get(key)
    if (remembered && remembered.ns !== ns) {
        inMemory.delete(key)
        return undefined
    }
    // A copy, every time: what is painted gets written on (an OnLoad trigger records that it fired).
    // Painting the remembered objects again, a revisit found its OnLoad already fired, and a listing
    // waited for ever for the rows it was going to ask for.
    if (remembered) return { component: structuredClone(remembered.component), hash: remembered.hash }
    const entry = readAll()[key]
    // an entry of another app or build (or one written before namespaces existed) is not a
    // prediction of this one's screen
    if (!entry || entry.v !== CACHE_VERSION || entry.ns !== ns) return undefined
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
    const be = backendOfKey(key)
    const ns = namespaceOf(be)
    const store = readAll()
    const structure = structureOf(component)
    inMemory.delete(key)
    inMemory.set(key, { component: structuredClone(withoutResolvedMicroFrontends(component)), hash, be, ns })
    while (inMemory.size > MAX_ENTRIES) inMemory.delete(inMemory.keys().next().value as string)
    if (structure.valued) {
        // its values are what made it a prediction worth painting: without them it is not one
        delete store[key]
    } else {
        store[key] = { v: CACHE_VERSION, t: Date.now(), be, ns, component: structure.component, hash }
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
    namespaces = undefined
    try {
        sessionStorage.removeItem(KEY)
        sessionStorage.removeItem(NS_KEY)
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
