import { isMountYaml } from './mountModel'
import { isRoutesYaml, parseRoutes } from './routesModel'
import { hasAppShell } from './appModel'

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
}

const PARTIALS_DIR = 'partials/'

/** Build the reference index from the mount's authored files. Pure — the unit of the pickers. */
export function buildIndex(files: ProjectFile[]): ProjectIndex {
    const routes: RouteRef[] = []
    const pages: string[] = []
    const partials: string[] = []
    const appShells: string[] = []
    const viewModels = new Set<string>()

    for (const f of files ?? []) {
        const path = normalize(f.path)
        const content = f.content ?? ''
        if (!path) continue
        if (isMountYaml(content)) continue // the mount descriptor is not itself a reference target
        if (isRoutesYaml(content)) {
            for (const r of parseRoutes(content).routes) {
                routes.push({ route: r.route, definition: r.definition, viewModel: r.viewModel })
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
        viewModels: [...viewModels].sort(),
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
