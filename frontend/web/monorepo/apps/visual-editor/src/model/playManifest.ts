import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { isRoutesYaml, parseRoutes, flattenRoutes } from './routesModel'

/**
 * The manifest play mode runs the mount from: the same "specs mode" shape a static bundle ships
 * (`libs/mateu/.../bundleStore`), built from the files AS EDITED — so playing shows this minute's
 * screens, not the last deploy. A definition-only route is expanded in the browser; a route with a
 * view model is not in it and falls through to the preview backend, if there is one.
 *
 * Unlike the export (`exportBundle.ts`, which mirrors the server exporter's output), the route table
 * here is normalised to what the runtime reads: nested children flattened to their absolute route,
 * `layout:` (the canonical key) read as the `definition`, a bare `data: name` turned into `{ref}`,
 * and definitions keyed by their path — app shells included, since the shell is what play opens on.
 */
export interface PlayManifest {
    staticOnly: true
    generatedAt: string
    routes: { routes: PlayRoute[] }
    sources?: { sources: unknown[] }
    definitions: Record<string, unknown>
}

export interface PlayRoute {
    route: string
    definition?: string
    viewModel?: string
    fixedParams?: Record<string, unknown>
    defaultParams?: Record<string, unknown>
    data?: Record<string, unknown>
}

export function buildPlayManifest(files: ProjectFile[], generatedAt = new Date().toISOString()): PlayManifest {
    const routes: PlayRoute[] = []
    const definitions: Record<string, unknown> = {}
    const sources: unknown[] = []
    for (const f of files ?? []) {
        if (isRoutesYaml(f.content)) { routes.push(...flattenRoutes(parseRoutes(f.content).routes).map(toPlayRoute)); continue }
        const obj = parseObject(f.content)
        if (!obj || obj.type === 'UI') continue // unreadable, or the mount descriptor
        if (obj.type === 'Sources' || (!obj.type && Array.isArray(obj.sources))) sources.push(...((obj.sources as unknown[]) ?? []))
        else definitions[normalizePath(f.path)] = obj
    }
    return { staticOnly: true, generatedAt, routes: { routes }, sources: sources.length ? { sources } : undefined, definitions }
}

/** A route row as the runtime reads it: `layout:` as the definition, a bare `data: name` as `{ref}`. */
function toPlayRoute(r: ReturnType<typeof flattenRoutes>[number]): PlayRoute {
    const entry: PlayRoute = { route: r.absolute }
    if (r.definition) entry.definition = normalizePath(r.definition)
    if (r.viewModel) entry.viewModel = r.viewModel
    if (r.fixedParams) entry.fixedParams = r.fixedParams
    if (r.defaultParams) entry.defaultParams = r.defaultParams
    if (typeof r.data === 'string' && r.data) entry.data = { ref: r.data }
    else if (r.data && typeof r.data === 'object') entry.data = r.data
    return entry
}

function parseObject(text: string): Record<string, unknown> | undefined {
    try {
        const parsed = parse(text)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined
    } catch {
        return undefined
    }
}

/** The mount's files with the edited (maybe unsaved) text of one of them laid over its copy on disk. */
export function withEdited(files: ProjectFile[], path: string | undefined, text: string | undefined): ProjectFile[] {
    if (!path || text === undefined) return files
    const p = normalizePath(path)
    const out = files.map((f) => (normalizePath(f.path) === p ? { ...f, content: text } : f))
    return out.some((f) => normalizePath(f.path) === p) ? out : [...out, { path: p, content: text }]
}

function normalizePath(p: string): string {
    return (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
}
