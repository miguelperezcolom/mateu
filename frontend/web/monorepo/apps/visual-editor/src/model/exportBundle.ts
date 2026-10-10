import { parse } from 'yaml'
import { ProjectFile } from './projectIndex'
import { lowerCatalogue } from '@infra/ui/actionCatalogue.ts'

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
    /** Raw authored definitions keyed by file name (e.g. `about.yaml`) — what specs mode expands. */
    definitions: Record<string, unknown>
}

export function buildBundleManifest(files: ProjectFile[], generatedAt: string): BundleManifest {
    const definitions: Record<string, unknown> = {}
    let routes: { routes: unknown[] } | undefined
    let sources: { sources: unknown[] } | undefined
    const actions: unknown[] = []

    for (const f of files) {
        let obj: Record<string, unknown>
        try {
            const parsed = parse(f.content)
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue
            obj = parsed as Record<string, unknown>
        } catch {
            continue
        }
        const type = obj.type
        // The route registry and the REST-source catalogue travel as their own manifest sections.
        if (type === 'Routes' || (Array.isArray(obj.routes) && !type)) { routes = { routes: (obj.routes as unknown[]) ?? [] }; continue }
        if (type === 'Sources' || (Array.isArray(obj.sources) && !type)) { sources = { sources: (obj.sources as unknown[]) ?? [] }; continue }
        if (type === 'Actions') { actions.push(...((obj.actions as unknown[]) ?? [])); continue }
        // The mount descriptor, the app shell and the project descriptor are not definitions a
        // route expands — skip them.
        if (type === 'UI' || type === 'AppShell' || type === 'Project') continue
        // Everything else is an authored definition (a page `layout:`, a bare component, a partial).
        definitions[basename(f.path)] = obj
    }

    const lowered = lowerCatalogue(actions)
    return { staticOnly: true, generatedAt, routes, sources, ...(lowered.length ? { actions: lowered } : {}), definitions }
}

/** How many routes would render with NO backend (definition-only), for the export summary. */
export function clientRenderableRouteCount(manifest: BundleManifest): number {
    const routes = (manifest.routes?.routes ?? []) as Record<string, unknown>[]
    return routes.filter((r) => r && (r.definition != null || r.layout != null) && r.viewModel == null && (r as Record<string, unknown>).modelView == null).length
}

function basename(path: string): string {
    const i = path.lastIndexOf('/')
    return i >= 0 ? path.slice(i + 1) : path
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
