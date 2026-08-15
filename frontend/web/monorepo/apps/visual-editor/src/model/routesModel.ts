import { parse, stringify } from 'yaml'

/**
 * The editor's model of a mount's route registry (`routes.yaml`): the list of entries binding a URL
 * to a definition, a view model and its parameters. Distinct from a page/partial (a component tree)
 * — this is structured data, edited as a table, and needs no backend.
 *
 * See `RouteEntry` (backend) and `routes-schema.json`. Two file shapes are accepted: a `routes:`
 * envelope (which may also carry an `app:` block — the data-authored app shell) or a bare list of
 * entries. Everything alongside `routes:` (the `app:` block, any future key) is preserved verbatim
 * so the routes editor never clobbers what the app editor owns.
 */
export interface RouteRow {
    route: string
    definition?: string
    viewModel?: string
    fixedParams?: Record<string, unknown>
    defaultParams?: Record<string, unknown>
}

export interface RoutesDoc {
    routes: RouteRow[]
    /** True when the source used a `routes:` envelope; false for a bare top-level list. */
    enveloped: boolean
    /** Top-level keys other than `routes` (e.g. `app:`), kept verbatim and re-emitted on save. */
    preamble: Record<string, unknown>
}

/** Whether this YAML is a route file (`type: Routes`, a `routes:` envelope, or a bare list). */
export function isRoutesYaml(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    if (Array.isArray(root)) return true
    if (!root || typeof root !== 'object') return false
    const type = (root as any).type
    if (type === 'UI' || type === 'AppShell') return false // a mount / app shell, not a route table
    return type === 'Routes' || Array.isArray((root as any).routes)
}

function toRow(entry: any): RouteRow {
    const row: RouteRow = { route: typeof entry?.route === 'string' ? entry.route : '' }
    if (typeof entry?.definition === 'string') row.definition = entry.definition
    if (typeof entry?.viewModel === 'string') row.viewModel = entry.viewModel
    if (entry?.fixedParams && typeof entry.fixedParams === 'object') row.fixedParams = entry.fixedParams
    if (entry?.defaultParams && typeof entry.defaultParams === 'object') row.defaultParams = entry.defaultParams
    return row
}

export function parseRoutes(yaml: string): RoutesDoc {
    let root: unknown
    try { root = parse(yaml) } catch { root = null }
    if (Array.isArray(root)) {
        return { routes: root.map(toRow), enveloped: false, preamble: {} }
    }
    if (root && typeof root === 'object' && Array.isArray((root as any).routes)) {
        // Drop the `type` discriminator from the preamble — it is re-emitted as `type: Routes` on
        // serialize. Everything else (e.g. `$schema`) is preserved.
        const { routes, type, ...preamble } = root as any
        void type
        return { routes: routes.map(toRow), enveloped: true, preamble }
    }
    // Not a recognisable routes file (or empty): start an empty envelope.
    return { routes: [], enveloped: true, preamble: {} }
}

/** Serialize back, omitting empty fields and empty param maps, and preserving the preamble. */
export function serializeRoutes(doc: RoutesDoc): string {
    const entries = doc.routes.map((row) => {
        const out: Record<string, unknown> = { route: row.route ?? '' }
        if (row.definition) out.definition = row.definition
        if (row.viewModel) out.viewModel = row.viewModel
        if (row.fixedParams && Object.keys(row.fixedParams).length) out.fixedParams = row.fixedParams
        if (row.defaultParams && Object.keys(row.defaultParams).length) out.defaultParams = row.defaultParams
        return out
    })
    // Always the `type: Routes` envelope so every route file is discriminated uniformly with the
    // mount (UI) and app (AppShell) files.
    return stringify({ type: 'Routes', ...doc.preamble, routes: entries })
}

/** Parse a `key=value, key2=value2` string into a param map, coercing obvious booleans/numbers. */
export function parseParams(text: string): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const pair of text.split(',')) {
        const eq = pair.indexOf('=')
        if (eq < 0) continue
        const key = pair.slice(0, eq).trim()
        if (!key) continue
        out[key] = coerce(pair.slice(eq + 1).trim())
    }
    return out
}

/** Render a param map back as a `key=value, …` string for editing. */
export function formatParams(params: Record<string, unknown> | undefined): string {
    if (!params) return ''
    return Object.entries(params).map(([k, v]) => `${k}=${v}`).join(', ')
}

function coerce(value: string): unknown {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value !== '' && !isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value)) return Number(value)
    return value
}
