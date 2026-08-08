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
}

interface BundleManifest {
    baseUrl?: string
    generatedAt?: string
    staticOnly?: boolean
    entries?: BundleEntry[]
}

// syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
let increments: Map<string, UIIncrement> | undefined

/** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors the server exporter's toSyncPath
 *  and AxiosMateuApiClient's URL building: leading slash stripped, blank/root → `_no_route`. */
export const toSyncPath = (route: string | undefined): string => {
    const r = route && route.startsWith('/') ? route.substring(1) : (route ?? '')
    return r === '' ? '_no_route' : r
}

/** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode off (the
 *  app falls back to the backend at baseUrl). Idempotent-ish: last call wins. */
export async function loadBundleManifest(url: string, fetchImpl: typeof fetch = fetch): Promise<void> {
    try {
        const res = await fetchImpl(url)
        if (!res.ok) return
        const manifest = (await res.json()) as BundleManifest
        const map = new Map<string, UIIncrement>()
        for (const e of manifest.entries ?? []) {
            if (e.ok && e.json) {
                try {
                    map.set(e.syncPath, JSON.parse(e.json) as UIIncrement)
                } catch (err) {
                    console.warn('mateu: bundle entry parse failed for', e.syncPath, err)
                }
            }
        }
        increments = map
    } catch (e) {
        console.warn('mateu: bundle manifest load failed', e)
    }
}

/** True once a non-empty bundle has been loaded. */
export const hasBundle = (): boolean => increments !== undefined && increments.size > 0

/** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend). */
export const getBundledIncrement = (syncPath: string): UIIncrement | undefined => increments?.get(syncPath)

/** Test hook: seed/clear the in-memory bundle directly. */
export const __setBundleForTests = (m: Map<string, UIIncrement> | undefined): void => {
    increments = m
}
