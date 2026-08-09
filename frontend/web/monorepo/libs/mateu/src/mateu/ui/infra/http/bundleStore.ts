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

interface BundleManifest {
    baseUrl?: string
    generatedAt?: string
    staticOnly?: boolean
    entries?: BundleEntry[]
}

// syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
let increments: Map<string, UIIncrement> | undefined
// :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
interface BundleTemplate { regex: RegExp; paramNames: string[]; increment: UIIncrement }
let templates: BundleTemplate[] = []
// The in-flight manifest load (if any), so a route load can await it before deciding to hit the
// backend — the first load can fire before the fetch resolves.
let pending: Promise<void> | undefined

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

/** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend). */
export const getBundledIncrement = (syncPath: string): UIIncrement | undefined => increments?.get(syncPath)

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
        return {
            ...t.increment,
            // params LAST so the real value wins over any placeholder captured at render time
            fragments: (t.increment.fragments ?? []).map(f => ({
                ...f,
                state: { ...(f.state ?? {}), ...params },
                data: { ...(f.data ?? {}), ...params },
            })),
        }
    }
    return undefined
}

/** Test hook: seed/clear the in-memory bundle directly. */
export const __setBundleForTests = (
    m: Map<string, UIIncrement> | undefined,
    t: BundleTemplate[] = [],
): void => {
    increments = m
    templates = t
    pending = undefined
}
