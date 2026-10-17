import { ProjectFile } from './projectIndex'
import { buildPlayManifest } from './playManifest'

/**
 * Export the authored mount as a **static bundle manifest** (visual-editor Phase 7 — the €0 deploy half).
 * Produces the exact `manifest.json` the coherence Phase 6 "specs mode" runtime consumes
 * (`libs/mateu/.../bundleStore`): the RAW authored `definitions` (each file → JSON, keyed by name),
 * the `routes` table and the REST `sources` catalogue — no backend, no build step. Drop it beside the
 * Mateu renderer on any free static host and definition-only routes expand client-side.
 *
 * Pure (files → manifest); the shell downloads it. Matches `MateuBundleExporter`'s manifest shape.
 */
export interface BundleManifest {
    staticOnly: boolean
    generatedAt: string
    /**
     * PRE-RENDERED route loads — what a renderer with no client-side expander (Redwood) answers route
     * loads from. Only for a Redwood project (see {@link renderedEntries}); the shape of the server
     * exporter's entries (`MateuBundleExporter.BundleEntry`).
     */
    entries?: RenderedEntry[]
    routes?: { routes: unknown[] }
    sources?: { sources: unknown[] }
    /** The ACTION catalogue (every `type: Actions` file), shipped once and lowered — `BundleManifest.actions`. */
    actions?: unknown[]
    /** Authored definitions keyed by their path under specs/ui (e.g. `orders/list.yaml`) — what specs mode expands. */
    definitions: Record<string, unknown>
    types?: { types: unknown[] }
    translations?: Record<string, Record<string, string>>
}

export function buildBundleManifest(files: ProjectFile[], generatedAt: string): BundleManifest {
    // The SAME manifest Play runs on (buildPlayManifest): the route table normalised to what the
    // runtime reads (`layout:` as the definition, children flattened, `data: name` as {ref}, state
    // seeds), definitions keyed by their path under specs/ui, the app shell included, translations
    // and field types shipped, partials and business components inlined. It used to ship the raw
    // route files and key definitions by BASENAME and skip the shell — so a route authored with the
    // canonical `layout:` (or a definition in a subfolder) found no definition in the exported
    // bundle and the app opened on nothing. Only sample mode stays behind: that is a design-session
    // rule, a deployed bundle calls the real endpoints.
    const { mockSources: _mock, ...manifest } = buildPlayManifest(files, generatedAt)
    void _mock
    return manifest
}

/** How many routes would render with NO backend (definition-only), for the export summary. */
export function clientRenderableRouteCount(manifest: BundleManifest): number {
    const routes = (manifest.routes?.routes ?? []) as Record<string, unknown>[]
    return routes.filter((r) => r && (r.definition != null || r.layout != null) && r.viewModel == null && (r as Record<string, unknown>).modelView == null).length
}

/** One pre-rendered route load, as the server exporter writes it. */
export interface RenderedEntry {
    route: string
    syncPath: string
    ok: boolean
    /** The FRESH load (a deep link): under an app shell, the shell aimed at the route. */
    json: string | null
    /** The route's own screen, when it differs from `json` (what an app shell loads into its slot). */
    contentJson?: string | null
    skipReason?: string
}

/** Answers a route load as the bundle store does (`resolveBundledLoad`), for {@link renderedEntries}. */
export type LoadResolver = (syncPath: string, consumedRoute?: string) => unknown

/**
 * Every static route of the mount pre-rendered — expanded in the browser, with the same runtime Play
 * uses — into the entries a renderer with no expander needs: the Redwood renderer paints only wire
 * increments, so a Redwood project's export ships them beside the raw definitions. A `:param` route
 * and one that cannot be answered without a backend (a view model) are listed as skipped.
 */
export function renderedEntries(routes: string[], resolve: LoadResolver): RenderedEntry[] {
    const out: RenderedEntry[] = []
    for (const route of [...new Set(routes.map((r) => (r ?? '').replace(/^\/+/, '')))]) {
        const syncPath = route === '' ? '_no_route' : route
        if (route.split('/').some((seg) => seg.startsWith(':'))) {
            out.push({ route, syncPath, ok: false, json: null, skipReason: 'parameterised route — served by a backend' })
            continue
        }
        const fresh = resolve(syncPath, '_empty')
        if (!fresh) {
            out.push({ route, syncPath, ok: false, json: null, skipReason: 'needs a backend (a view model)' })
            continue
        }
        const json = JSON.stringify(fresh)
        const content = resolve(syncPath, '')
        const contentJson = content ? JSON.stringify(content) : null
        out.push({ route, syncPath, ok: true, json, ...(contentJson && contentJson !== json ? { contentJson } : {}) })
    }
    return out
}
