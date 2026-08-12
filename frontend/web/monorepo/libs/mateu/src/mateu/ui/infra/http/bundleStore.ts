// Static-bundle "no backend" mode. A build-time exporter (Mateu's mateu:bundle Maven goal) renders
// each declared route's initial load (actionId="") to wire JSON and writes a manifest.json. When
// mateu-ui is given a `bundleUrl`, we GET that manifest once at boot and answer route LOADS from it
// instead of POSTing to the Mateu server — so the UI runs from static assets with no backend. Live
// data still comes from external endpoints (@RestOptions/@RestListing …); ACTIONS still need a
// backend and degrade with the normal "request failed" path when it is absent.
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

interface BundleEntry {
    route: string
    syncPath: string
    json: string | null
    ok: boolean
    skipReason?: string
    // Present on a :param route bundled as a TEMPLATE: a regex over the sync path with one capture
    // group per param, and the param names in order (see the server's MateuBundleExporter).
    routePattern?: string
    paramNames?: string[]
}

/**
 * One entry of the mount's authored route registry (the server's RouteEntry), shipped with the
 * bundle. A statically deployed mount has no server left to ask what a URL means, so the parameters
 * a route pins or seeds have to travel as data.
 */
interface RouteEntry {
    route: string
    definition?: string | null
    viewModel?: string | null
    fixedParams?: Record<string, unknown>
    defaultParams?: Record<string, unknown>
}

interface BundleManifest {
    baseUrl?: string
    generatedAt?: string
    staticOnly?: boolean
    entries?: BundleEntry[]
    routes?: { routes?: RouteEntry[] }
}

// syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
let increments: Map<string, UIIncrement> | undefined
// :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
interface BundleTemplate { regex: RegExp; paramNames: string[]; increment: UIIncrement }
let templates: BundleTemplate[] = []
// The in-flight manifest load (if any), so a route load can await it before deciding to hit the
// backend — the first load can fire before the fetch resolves.
let pending: Promise<void> | undefined
// The mount's authored route registry, as shipped in the manifest.
let routeEntries: RouteEntry[] = []

/** The `:name` segments of a route pattern, in order. */
const paramNamesOf = (route: string): string[] =>
    route.split('/').filter(s => s.startsWith(':') && s.length > 1).map(s => s.substring(1))

/**
 * The registry entry answering a concrete path, plus the path params read off it. Static routes are
 * tried before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and among
 * parameterised matches the most specific wins — matching must not depend on declaration order.
 * Mirrors the server's RouteTable.match.
 */
const matchRouteEntry = (
    path: string,
): { entry: RouteEntry; pathParams: Record<string, string> } | undefined => {
    const norm = (s: string) => s.replace(/^\/+/, '').replace(/\/+$/, '')
    const target = norm(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best: { entry: RouteEntry; pathParams: Record<string, string> } | undefined
    for (const entry of routeEntries) {
        const pattern = norm(entry.route ?? '')
        const patternSegments = pattern === '' ? [] : pattern.split('/')
        if (patternSegments.length !== targetSegments.length) continue
        const pathParams: Record<string, string> = {}
        let matches = true
        for (let i = 0; i < patternSegments.length; i++) {
            const seg = patternSegments[i]
            if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
            else if (seg !== targetSegments[i]) { matches = false; break }
        }
        if (!matches) continue
        const candidate = { entry, pathParams }
        if (!best
            || paramNamesOf(pattern).length < paramNamesOf(norm(best.entry.route ?? '')).length) {
            best = candidate
        }
    }
    return best
}

/**
 * Applies the registry's parameters to a pre-rendered increment, in the same order the server uses:
 *
 *   fixed  >  path  >  what the increment already carries  >  defaults
 *
 * Defaults only fill what nothing else supplied; fixed ones override everything, which is the whole
 * point of pinning them. Returns the increment untouched when no entry answers the path.
 */
export const applyRouteParams = (syncPath: string, increment: UIIncrement): UIIncrement => {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const { entry, pathParams } = match
    const defaults = entry.defaultParams ?? {}
    const fixed = entry.fixedParams ?? {}
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
        return increment
    }
    return {
        ...increment,
        fragments: (increment.fragments ?? []).map(f => ({
            ...f,
            state: { ...defaults, ...(f.state ?? {}), ...pathParams, ...fixed },
            data: { ...defaults, ...(f.data ?? {}), ...pathParams, ...fixed },
        })),
    }
}

/** The registry entry answering a path, for callers that need its definition or view model. */
export const getRouteEntry = (syncPath: string): RouteEntry | undefined =>
    matchRouteEntry(syncPath)?.entry

/** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors the server exporter's toSyncPath
 *  and AxiosMateuApiClient's URL building: leading slash stripped, blank/root → `_no_route`. */
export const toSyncPath = (route: string | undefined): string => {
    const r = route && route.startsWith('/') ? route.substring(1) : (route ?? '')
    return r === '' ? '_no_route' : r
}

/** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode off (the
 *  app falls back to the backend at baseUrl). Idempotent-ish: last call wins. */
export function loadBundleManifest(url: string, fetchImpl: typeof fetch = fetch): Promise<void> {
    pending = (async () => {
        try {
            const res = await fetchImpl(url)
            if (!res.ok) return
            const manifest = (await res.json()) as BundleManifest
            const map = new Map<string, UIIncrement>()
            const tpls: BundleTemplate[] = []
            for (const e of manifest.entries ?? []) {
                if (!e.ok || !e.json) continue
                try {
                    const inc = JSON.parse(e.json) as UIIncrement
                    if (e.routePattern) {
                        tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames ?? [], increment: inc })
                    } else {
                        map.set(e.syncPath, inc)
                    }
                } catch (err) {
                    console.warn('mateu: bundle entry parse failed for', e.syncPath, err)
                }
            }
            increments = map
            templates = tpls
            routeEntries = manifest.routes?.routes ?? []
        } catch (e) {
            console.warn('mateu: bundle manifest load failed', e)
        }
    })()
    return pending
}

/** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
 *  backend before the bundle is ready. Resolves immediately when no bundle is being loaded. */
export const awaitBundle = (): Promise<void> => pending ?? Promise.resolve()

/** True once a non-empty bundle has been loaded (exact routes or :param templates). */
export const hasBundle = (): boolean =>
    (increments !== undefined && increments.size > 0) || templates.length > 0

/**
 * The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
 * The registry's parameters are applied on the way out, so a statically served route behaves like
 * the same route served by the backend.
 */
export const getBundledIncrement = (syncPath: string): UIIncrement | undefined => {
    const increment = increments?.get(syncPath)
    return increment === undefined ? undefined : applyRouteParams(syncPath, increment)
}

/**
 * Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES and, on a hit, return
 * the pre-rendered structure with the extracted params INJECTED into every fragment's state and data
 * — so the screen's client-side data fetch (`@RestOptions`/`@RestData` URL with `${state.<param>}`)
 * resolves to the real value with no backend. undefined when no template matches.
 */
export const matchBundledTemplate = (syncPath: string): UIIncrement | undefined => {
    for (const t of templates) {
        const m = t.regex.exec(syncPath)
        if (!m) continue
        const params: Record<string, string> = {}
        t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
        const withPathParams = {
            ...t.increment,
            // params LAST so the real value wins over any placeholder captured at render time
            fragments: (t.increment.fragments ?? []).map(f => ({
                ...f,
                state: { ...(f.state ?? {}), ...params },
                data: { ...(f.data ?? {}), ...params },
            })),
        }
        // …and then the registry's own, so a pinned parameter still outranks the path.
        return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
}

/** Test hook: seed/clear the in-memory bundle directly. */
export const __setBundleForTests = (
    m: Map<string, UIIncrement> | undefined,
    t: BundleTemplate[] = [],
    r: RouteEntry[] = [],
): void => {
    increments = m
    templates = t
    routeEntries = r
    pending = undefined
}
