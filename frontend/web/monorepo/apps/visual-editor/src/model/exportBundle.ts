import { parse } from 'yaml'
import { ProjectFile } from './projectIndex'

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
    routes?: { routes: unknown[] }
    sources?: { sources: unknown[] }
    /** Raw authored definitions keyed by file name (e.g. `about.yaml`) — what specs mode expands. */
    definitions: Record<string, unknown>
}

export function buildBundleManifest(files: ProjectFile[], generatedAt: string): BundleManifest {
    const definitions: Record<string, unknown> = {}
    let routes: { routes: unknown[] } | undefined
    let sources: { sources: unknown[] } | undefined

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
        // The mount descriptor and the app shell are not definitions a route expands — skip them.
        if (type === 'UI' || type === 'AppShell') continue
        // Everything else is an authored definition (a page `layout:`, a bare component, a partial).
        definitions[basename(f.path)] = obj
    }

    return { staticOnly: true, generatedAt, routes, sources, definitions }
}

/** How many routes would render with NO backend (definition-only), for the export summary. */
export function clientRenderableRouteCount(manifest: BundleManifest): number {
    const routes = (manifest.routes?.routes ?? []) as Record<string, unknown>[]
    return routes.filter((r) => r && (r.definition != null) && r.viewModel == null && (r as Record<string, unknown>).modelView == null).length
}

function basename(path: string): string {
    const i = path.lastIndexOf('/')
    return i >= 0 ? path.slice(i + 1) : path
}
