import { isMountYaml } from './mountModel'
import { isRoutesYaml, parseRoutes, flattenRoutes } from './routesModel'
import { parse } from 'yaml'
import { hasAppShell } from './appModel'
import { environmentName, parseTranslationsFile, type TranslationsFile } from './translationsModel'

/**
 * A file of the mount as the host hands it over: a path relative to `specs/ui/` plus its raw YAML.
 * The host (browser / IntelliJ / VSCode) enumerates these; the index derives the reference graph.
 */
export interface ProjectFile {
    path: string
    content: string
}

/** One route entry seen across the mount's route files (what the app menu can link to). */
export interface RouteRef {
    route: string
    definition?: string
    viewModel?: string
    /** The route's `data:` source (a name or an inline descriptor). */
    data?: unknown
}

/**
 * The cross-file reference graph of a mount, derived from its authored files — so the editors can
 * offer a PICK from what exists instead of a typed string: a menu links to a `route`, a route serves
 * a `page` (definition) and a `viewModel` (data source), a page inlines a `partial`. This is the
 * data behind the reference pickers (see design/visual-editor-project-awareness.md).
 */
export interface ProjectIndex {
    routes: RouteRef[]
    pages: string[]       // page definition files (paths relative to specs/ui)
    partials: string[]    // partial refs (the file stem a `Partial ref` names)
    appShells: string[]   // type: AppShell definition files
    viewModels: string[]  // distinct view-model FQNs referenced by routes
    /** The REST source catalogue (`sources.yaml`): each named endpoint, as authored. */
    sources: SourceEntry[]
    /** The message catalogues (`type: Translations` / `translations/<locale>.yaml`), flattened. */
    translations?: TranslationsFile[]
    /** The deployment environments (`type: Environment` / `environments/<name>.yaml`), by name. */
    environments?: string[]
}

/** One entry of the REST source catalogue — the shape the renderer's catalogue takes. */
export interface SourceEntry {
    name: string
    description?: string
    source?: Record<string, unknown>
    totalPath?: string
    fields?: Record<string, string>
    [k: string]: unknown
}

/** Whether this YAML is the REST source catalogue (`type: Sources`, or a top-level `sources:` list). */
export function isSourcesYaml(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    if (!root || typeof root !== 'object' || Array.isArray(root)) return false
    const type = (root as any).type
    return type === 'Sources' || (!type && Array.isArray((root as any).sources))
}

/** The entries of a sources file (named ones only). */
export function parseSources(yaml: string): SourceEntry[] {
    let root: any
    try { root = parse(yaml) } catch { return [] }
    const list = Array.isArray(root?.sources) ? root.sources : []
    return list.filter((s: any) => s && typeof s.name === 'string')
}

const PARTIALS_DIR = 'partials/'

/** Build the reference index from the mount's authored files. Pure — the unit of the pickers. */
export function buildIndex(files: ProjectFile[]): ProjectIndex {
    const routes: RouteRef[] = []
    const pages: string[] = []
    const partials: string[] = []
    const appShells: string[] = []
    const viewModels = new Set<string>()
    const sources: SourceEntry[] = []
    const translations: TranslationsFile[] = []
    const environments: string[] = []

    for (const f of files ?? []) {
        const path = normalize(f.path)
        const content = f.content ?? ''
        if (!path) continue
        if (isMountYaml(content)) continue // the mount descriptor is not itself a reference target
        if (isSourcesYaml(content)) { sources.push(...parseSources(content)); continue }
        const catalogue = parseTranslationsFile(path, content)
        if (catalogue) { translations.push(catalogue); continue }
        const environment = environmentName(path, content)
        if (environment) { environments.push(environment); continue }
        if (isRoutesYaml(content)) {
            // Children are flattened to their absolute route, as the loader does.
            for (const r of flattenRoutes(parseRoutes(content).routes)) {
                routes.push({ route: r.absolute, definition: r.definition, viewModel: r.viewModel, data: r.data })
                if (r.viewModel) viewModels.add(r.viewModel)
            }
            continue
        }
        if (hasAppShell(content)) { appShells.push(path); continue }
        if (isPartial(path)) { partials.push(stem(path)); continue }
        pages.push(path) // anything else is a page definition (a component tree)
    }

    return {
        routes,
        pages: dedupe(pages),
        partials: dedupe(partials),
        appShells: dedupe(appShells),
        viewModels: [...viewModels].sort((a, b) => a.localeCompare(b)),
        sources,
        // only when present, so an index of a mount without them keeps its shape
        ...(translations.length ? { translations } : {}),
        ...(environments.length ? { environments: dedupe(environments) } : {}),
    }
}

function isPartial(path: string): boolean {
    return path === PARTIALS_DIR.slice(0, -1) ? false : path.startsWith(PARTIALS_DIR) || path.includes('/' + PARTIALS_DIR)
}

/** Strip a leading slash and a `specs/ui/` prefix so paths are comparable to a route's `definition`. */
function normalize(p: string): string {
    return (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
}

/** The file name without directory or `.yaml`/`.yml` extension — how a `Partial ref` names it. */
function stem(p: string): string {
    return (p.split('/').pop() ?? p).replace(/\.(ya?ml)$/i, '')
}

function dedupe(a: string[]): string[] {
    return [...new Set(a)]
}
