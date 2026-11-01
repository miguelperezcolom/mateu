// How a STATIC BUNDLE answers a route load — the pure half of bundleStore.ts, shared with the native
// renderer (frontend/app/react-native imports this file through src/shared/mateuLib.ts).
//
// A bundle (mateu-bundle:bundle → manifest.json) carries each route's pre-rendered load, :param
// route templates, the authored route registry and, in specs mode, the RAW definitions the client
// expands. Everything here is a function of a parsed {@link BundleState}: no module state, no DOM,
// no Lit — the web keeps ONE state in bundleStore.ts (plus a map of static remotes), the native app
// one per UI it runs. Runtime imports stay RELATIVE with a `.ts` extension and types are imported
// with `import type`, so Metro and `node --test` (type stripping) load this closure as it is.
import { expandDefinition, isClientExpandable, type DefinitionSpec } from '../expander/expandDefinition.ts'
import { declaresAccessKeys } from '../expander/accessKeys.ts'
import type { FieldTypeEntry } from '../expander/fieldTypes.ts'
import type { TranslationCatalogue } from '../i18n/translations.ts'
import type RestSourceEntry from '@mateu/shared/apiClients/dtos/componentmetadata/RestSourceEntry.ts'
import type Action from '@mateu/shared/apiClients/dtos/componentmetadata/Action.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

export interface BundleEntry {
    route: string
    syncPath: string
    json: string | null
    ok: boolean
    skipReason?: string
    // Present on a :param route bundled as a TEMPLATE: a regex over the sync path with one capture
    // group per param, and the param names in order (see the server's MateuBundleExporter).
    routePattern?: string
    paramNames?: string[]
    // The route's CONTENT load (what an app shell asks for its content slot), when it differs from
    // `json` — which, under a mount whose root is an app shell, is the SHELL (the fresh load).
    contentJson?: string | null
}

/**
 * One entry of the mount's authored route registry (the server's RouteEntry), shipped with the
 * bundle. A statically deployed mount has no server left to ask what a URL means, so the parameters
 * a route pins or seeds have to travel as data.
 */
export interface RouteEntry {
    route: string
    definition?: string | null
    viewModel?: string | null
    fixedParams?: Record<string, unknown>
    defaultParams?: Record<string, unknown>
    // Literal seeds (`state:` / `appState:` in routes.yaml), at the defaults' precedence level.
    state?: Record<string, unknown>
    appState?: Record<string, unknown>
    // The named source that loads the route's data on entry (`data: <source>` in routes.yaml).
    data?: { ref?: string | null, url?: string | null } | null
    // Who may reach the route (`access:` in routes.yaml) — enforced by the server only.
    access?: { roles?: string[], groups?: string[], scopes?: string[], permissions?: string[] } | null
}

/** Whether a route declares who may reach it: a browser has no identity to check that against. */
export const restrictsAccess = (entry: RouteEntry | undefined): boolean => {
    const access = entry?.access
    if (!access) return false
    return [access.roles, access.groups, access.scopes, access.permissions].some(list => (list?.length ?? 0) > 0)
}

export interface BundleManifest {
    baseUrl?: string
    generatedAt?: string
    staticOnly?: boolean
    entries?: BundleEntry[]
    routes?: { routes?: RouteEntry[] }
    // The REST source catalogue, shipped once for the whole bundle. In bundle mode there is no app
    // metadata arriving from a server, so this is the only place a statically served screen can learn
    // what the source names its surfaces reference actually point at — and, being one table in one
    // file, it is what makes re-pointing a deployment an edit rather than a rebuild.
    sources?: { sources?: RestSourceEntry[] }
    // The ACTION catalogue, shipped once and already lowered: an id a statically served page or the
    // shell menu names but does not declare runs the catalogue's flow / REST call (actionCatalogue.ts).
    actions?: Action[]
    // SPECS MODE (Phase 6, #1): the raw authored definitions, keyed by the file name a route entry's
    // `definition` names (e.g. "about.yaml"). When present, a definition-only route (a `definition`,
    // no `viewModel`) is expanded to the wire on the CLIENT by the expander instead of being
    // pre-rendered at build time — so editing a definition and refreshing shows it, with no backend
    // and no export step. A `viewModel` route cannot be expanded client-side and is skipped.
    definitions?: Record<string, DefinitionSpec>
    // The translation catalogue (locale → key → text). Pre-rendered entries keep their `${i18n.…}`
    // expressions on purpose (the exporter renders RAW): with no server, the client resolves them
    // for the visitor's locale.
    translations?: TranslationCatalogue
    // The deployment environment the `sources` were resolved for (mateu-bundle -Dmateu.bundle.environment),
    // or null/absent when they are as authored. Informative: the catalogue shipped IS the resolved one.
    environment?: string | null
    // A bundle built with the mock flag (`-Dmateu.bundle.mock=true`), or play: the sources answer
    // with their SAMPLE data instead of being called.
    mockSources?: boolean | null
    // The field type catalogue (types.yaml) the raw definitions reference by `fieldType:`. Play ships
    // it; the server exporter resolves the references at build time and ships none.
    types?: { types?: FieldTypeEntry[] }
}

/** A :param route TEMPLATE: a compiled matcher + param names + the pre-rendered structure (and,
 *  under an app shell, its content load). */
export interface BundleTemplate { regex: RegExp; paramNames: string[]; increment: UIIncrement; content?: UIIncrement }

/** Everything a manifest says, parsed: what the resolvers below read. */
export interface BundleState {
    // syncPath → parsed increment, for the routes that exported OK
    increments: Map<string, UIIncrement>
    // syncPath → the route's CONTENT load, for the routes under an app shell (BundleEntry.contentJson)
    contents: Map<string, UIIncrement>
    templates: BundleTemplate[]
    // the mount's authored route registry
    routeEntries: RouteEntry[]
    // the REST source catalogue, handed to an app shell expanded on the client
    catalogueSources: RestSourceEntry[]
    // specs mode: raw authored definitions keyed by file name
    definitions: Record<string, DefinitionSpec>
    translations: TranslationCatalogue
    environment: string | undefined
}

/** Resolves `${i18n.…}` in a value (a copy), or hands it back. */
export type Localize = <T>(value: T) => T

const asIs: Localize = <T,>(value: T): T => value

/**
 * True when a JSON document has the shape of a bundle manifest (what `mateu-bundle:bundle` writes):
 * an object with an `entries` list, or `definitions` and a `routes` registry. What a native client
 * checks before treating a URL as a static UI — a web app manifest or an API answer is not one.
 */
export const isBundleManifest = (raw: unknown): raw is BundleManifest => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
    const m = raw as Record<string, unknown>
    const isObject = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v)
    if (m.entries !== undefined && !Array.isArray(m.entries)) return false
    if (m.routes !== undefined && m.routes !== null && !isObject(m.routes)) return false
    return Array.isArray(m.entries) || (isObject(m.definitions) && isObject(m.routes))
}

/** A manifest, parsed (a malformed entry is skipped with a warning, never fatal). */
export const parseBundleManifest = (manifest: BundleManifest): BundleState => {
    const map = new Map<string, UIIncrement>()
    const contentMap = new Map<string, UIIncrement>()
    const tpls: BundleTemplate[] = []
    for (const e of manifest.entries ?? []) {
        if (!e || !e.ok || !e.json) continue
        try {
            const inc = JSON.parse(e.json) as UIIncrement
            const content = e.contentJson ? JSON.parse(e.contentJson) as UIIncrement : undefined
            if (e.routePattern) {
                tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames ?? [], increment: inc, content })
            } else {
                map.set(e.syncPath, inc)
                if (content) contentMap.set(e.syncPath, content)
            }
        } catch (err) {
            console.warn('mateu: bundle entry parse failed for', e.syncPath, err)
        }
    }
    return {
        increments: map,
        contents: contentMap,
        templates: tpls,
        routeEntries: manifest.routes?.routes ?? [],
        definitions: manifest.definitions ?? {},
        catalogueSources: manifest.sources?.sources ?? [],
        translations: manifest.translations ?? {},
        environment: manifest.environment ?? undefined,
    }
}

/** The `:name` segments of a route pattern, in order. */
const paramNamesOf = (route: string): string[] =>
    route.split('/').filter(s => s.startsWith(':') && s.length > 1).map(s => s.substring(1))

/**
 * The registry entry answering a concrete path, plus the path params read off it. Static routes are
 * tried before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and among
 * parameterised matches the most specific wins — matching must not depend on declaration order.
 * Mirrors the server's RouteTable.match.
 */
export const matchRouteEntry = (
    state: BundleState,
    path: string,
): { entry: RouteEntry; pathParams: Record<string, string> } | undefined => {
    const targetSegments = segmentsOf(path === '_no_route' ? '' : path)
    let best: { entry: RouteEntry; pathParams: Record<string, string> } | undefined
    for (const entry of state.routeEntries) {
        const pathParams = pathParamsOf(segmentsOf(entry.route ?? ''), targetSegments)
        if (!pathParams) continue
        if (!best || paramCountOf(entry) < paramCountOf(best.entry)) best = { entry, pathParams }
    }
    return best
}

/** `s` without its leading and trailing slashes (no regex: `/\/+$/` backtracks on a long run of them). */
const trimSlashes = (s: string): string => {
    let start = 0
    let end = s.length
    while (start < end && s[start] === '/') start++
    while (end > start && s[end - 1] === '/') end--
    return s.substring(start, end)
}

/** The segments of a route or path, its leading and trailing slashes aside ('' → none). */
const segmentsOf = (route: string): string[] => {
    const trimmed = trimSlashes(route)
    return trimmed === '' ? [] : trimmed.split('/')
}

const paramCountOf = (entry: RouteEntry): number => paramNamesOf(entry.route ?? '').length

/** The path params a route pattern's segments read off a path's, or undefined when it does not match. */
const pathParamsOf = (pattern: string[], target: string[]): Record<string, string> | undefined => {
    if (pattern.length !== target.length) return undefined
    const pathParams: Record<string, string> = {}
    for (let i = 0; i < pattern.length; i++) {
        const seg = pattern[i]
        if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = target[i]
        else if (seg !== target[i]) return undefined
    }
    return pathParams
}

/** `carried` with `defaults` filling every key it has no value for — a null is no value, as in the
 *  server's `putIfAbsent` (RouteSegmentUtils.addParameterValues). */
const withDefaults = (defaults: Record<string, unknown>, carried: Record<string, unknown> | undefined) => {
    const out: Record<string, unknown> = { ...defaults, ...carried }
    for (const key of Object.keys(defaults)) out[key] ??= defaults[key]
    return out
}

/**
 * Applies the registry's parameters to a pre-rendered increment, in the same order the server uses:
 *
 *   fixed  >  path  >  what the increment already carries  >  state seeds  >  defaults
 *
 * Defaults only fill what nothing else supplied (a null included); fixed ones override everything,
 * which is the whole point of pinning them. The server's order is `fixed > client state > path >
 * query > defaults`: a statically served load has no client state yet, its increment is what the
 * server rendered for the route, and the query level is applied on the answer (withQueryParams), so
 * the two agree
 * (conformance/client/route-params.json pins it, for this renderer and Redwood).
 * Returns the increment untouched when no entry answers the path.
 */
export const applyRouteParams = (state: BundleState, syncPath: string, increment: UIIncrement): UIIncrement => {
    const match = matchRouteEntry(state, syncPath)
    if (!match) return increment
    const { entry, pathParams } = match
    // A route's `state:` seeds sit at the defaults' level, as on the server (it was ignored here, so
    // a specsOnly page read `${state.x}` as blank where the served one showed the seed).
    const defaults = withDefaults(entry.defaultParams ?? {}, entry.state)
    const fixed = entry.fixedParams ?? {}
    const appSeed = entry.appState ?? {}
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length
        && !Object.keys(appSeed).length) {
        return increment
    }
    return {
        ...increment,
        // `appState:` goes UNDER what the increment (the client's app context) already carries
        ...(Object.keys(appSeed).length ? { appState: { ...appSeed, ...increment.appState } } : {}),
        fragments: (increment.fragments ?? []).map(f => ({
            ...f,
            state: { ...withDefaults(defaults, f.state), ...pathParams, ...fixed },
            data: { ...withDefaults(defaults, f.data), ...pathParams, ...fixed },
        })),
    }
}

/** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors the server exporter's toSyncPath
 *  and AxiosMateuApiClient's URL building: leading slash stripped, blank/root → `_no_route`. */
export const toSyncPath = (route: string | undefined): string => {
    // the query string is a listing's filters, page and sort — never part of the screen: with it a
    // deep link (/products?status=X) or a reload of a filtered listing answered nothing at all
    const path = route?.includes('?') ? route.substring(0, route.indexOf('?')) : route
    const r = path?.startsWith('/') ? path.substring(1) : (path ?? '')
    return r === '' ? '_no_route' : r
}

/**
 * The pre-rendered increment for a route's sync path, or undefined. The registry's parameters are
 * applied on the way out, so a statically served route behaves like the same route served by the
 * backend.
 */
export const bundledIncrement = (state: BundleState, syncPath: string): UIIncrement | undefined => {
    const increment = state.increments.get(syncPath)
    return increment === undefined ? undefined : applyRouteParams(state, syncPath, increment)
}

/** A server-side component carries the path params it was rendered with in `initialData` too — at
 *  export time, the PLACEHOLDER. Overwrite them with the real ones, or a page that seeds its state
 *  from initialData would ask the API for `__mateu_param__`. */
const withInitialData = <T,>(component: T, params: Record<string, string>): T => {
    const c = component as unknown as { initialData?: unknown } | undefined
    if (!c?.initialData || typeof c.initialData !== 'object') return component
    return { ...c, initialData: { ...(c.initialData as Record<string, unknown>), ...params } } as unknown as T
}

/**
 * Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES and, on a hit, return
 * the pre-rendered structure with the extracted params INJECTED into every fragment's state and data
 * — so the screen's client-side data fetch (`@RestOptions`/`@RestData` URL with `${state.<param>}`)
 * resolves to the real value with no backend. undefined when no template matches.
 */
export const bundledTemplate = (state: BundleState, syncPath: string, content = false): UIIncrement | undefined => {
    for (const t of state.templates) {
        const m = t.regex.exec(syncPath)
        if (!m) continue
        const increment = content ? t.content : t.increment
        if (!increment) return undefined
        const params: Record<string, string> = {}
        t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
        const withPathParams = {
            ...increment,
            // params LAST so the real value wins over any placeholder captured at render time
            fragments: (increment.fragments ?? []).map(f => ({
                ...f,
                component: withInitialData(f.component, params),
                state: { ...f.state, ...params },
                data: { ...f.data, ...params },
            })),
        }
        // …and then the registry's own, so a pinned parameter still outranks the path.
        return applyRouteParams(state, syncPath, withPathParams)
    }
    return undefined
}

/** The `type: App` metadata of an increment's first fragment, when the increment is an app shell. */
export const appShellOf = (increment: UIIncrement | undefined): Record<string, unknown> | undefined => {
    const component = increment?.fragments?.[0]?.component as unknown as
        { metadata?: Record<string, unknown> } | undefined
    return component?.metadata?.type === 'App' ? component.metadata : undefined
}

/**
 * SPECS MODE (Phase 6, #1): expand a definition-only route to the wire ON THE CLIENT. When the route
 * entry names a `definition` the manifest shipped raw, and it is client-expandable (a layout, no
 * `viewModel`), the client-side expander turns it into an increment — no pre-render, no backend.
 * The registry's parameters are applied on the way out, exactly like a pre-rendered increment.
 * undefined when there is no matching definition or it needs a backend (a `viewModel` route).
 */
export const expandedIncrement = (
    state: BundleState, syncPath: string, localize: Localize = asIs,
): UIIncrement | undefined => {
    const match = matchRouteEntry(state, syncPath)
    const name = match?.entry.definition
    if (!name) return undefined
    // A route that declares `access:` is the server's to answer (per caller): the definition may
    // ship for a public route that shares it, but expanding it here would show it to everybody.
    if (restrictsAccess(match!.entry)) return undefined
    const raw = state.definitions[name]
    if (!raw || !isClientExpandable(raw)) return undefined
    // …and so is a definition that declares access keys: a current bundle never ships one, but one
    // built before that rule does — rendering it would hand every visitor what the keys withhold.
    // (The visual editor's Play expands such a definition on purpose, unrestricted, elsewhere.)
    if (declaresAccessKeys(raw)) return undefined
    const spec = localize(raw)
    const expanded = expandDefinition(spec, match!.entry.route, undefined, {
        data: match!.entry.data ?? undefined,
        path: syncPath === '_no_route' ? '' : syncPath,
    })
    // The expander targets the harness's main id (its goldens were captured that way); on the client
    // the fragment goes to whoever asked, so leave it untargeted and let the client aim it.
    // An expanded app shell carries the manifest's source catalogue, as a served one carries the
    // app's: the shell PUBLISHES its catalogue when it mounts (a replace), and one without it would
    // wipe the table every screen resolves its `ref`s against.
    return applyRouteParams(state, syncPath, {
        ...expanded,
        fragments: (expanded.fragments ?? []).map(f => {
            const app = appShellOf({ fragments: [f] } as UIIncrement)
            const component = app
                ? { ...f.component, metadata: { ...app, restSources: state.catalogueSources } } as unknown as typeof f.component
                : f.component
            return { ...f, component, targetComponentId: undefined as unknown as string }
        }),
    })
}

/** The shell, re-aimed at `syncPath`: an app shell loads its content slot from `homeRoute`, which is
 *  how the server answers a deep link (a fresh load of /vcns/7 is the shell with homeRoute /vcns/7). */
const aimedAt = (shell: UIIncrement, syncPath: string): UIIncrement => {
    if (syncPath === '_no_route') return shell
    const [first, ...rest] = shell.fragments ?? []
    const component = first.component as unknown as { metadata: Record<string, unknown> }
    return {
        ...shell,
        fragments: [{
            ...first,
            component: {
                ...component,
                metadata: { ...component.metadata, homeRoute: '/' + syncPath },
            } as unknown as typeof first.component,
        }, ...rest],
    }
}

/** The bundle's root answer (`_no_route`): pre-rendered, else expanded. */
export const rootIncrement = (state: BundleState, localize: Localize = asIs): UIIncrement | undefined =>
    bundledIncrement(state, '_no_route') ?? expandedIncrement(state, '_no_route', localize)

/**
 * The bundle's answer to a route LOAD, or undefined (→ the backend, if there is one).
 *
 * Two loads exist under an app shell, and they must not be confused (#557):
 *  - the FRESH load (`consumedRoute` "_empty": a deep link, a reload) answers the SHELL, aimed at the
 *    requested route — exactly what the server does;
 *  - the CONTENT load (any other consumed route: the shell filling its slot) answers the route's own
 *    screen — its exported content, a :param template's content, or its definition expanded here.
 * A content load is never answered with a shell: that is what nested shells until the tab died.
 * `${i18n.…}` is resolved with `localize`, in the definition expanded and in the answer.
 * `query` is the route's own query string (`/people?dept=sales` → `{dept: 'sales'}`): it seeds the
 * screen's state at the server's query level — see withQueryParams.
 */
export const resolveLoad = (
    state: BundleState, syncPath: string, consumedRoute?: string, localize: Localize = asIs,
    query?: Record<string, string>,
): UIIncrement | undefined =>
    localize(withQueryParams(state, syncPath, resolveLoadRaw(state, syncPath, consumedRoute, localize), query))

/**
 * The route's query parameters on a screen the bundle answered, at the level the server gives them:
 *
 *   fixed  >  path  >  query  >  what the pre-rendered answer carries (its defaults included)
 *
 * The server seeds the query into the state of the load (RouteSegmentUtils.addParameterValues), so
 * `/people?dept=sales` shows `${state.dept}` filled; a bundle answer was rendered with no query at
 * all, and dropped it. A pinned (fixed) or path parameter is never overridden from the URL, and an
 * app shell is left alone — its content load carries the query to the screen.
 */
export const withQueryParams = (
    state: BundleState, syncPath: string, answer: UIIncrement | undefined, query?: Record<string, string>,
): UIIncrement | undefined => {
    if (!answer || !query || !Object.keys(query).length || appShellOf(answer)) return answer
    const match = matchRouteEntry(state, syncPath)
    const fixed = match?.entry.fixedParams ?? {}
    const path = match?.pathParams ?? {}
    const params = Object.fromEntries(Object.entries(query).filter(([k]) => !(k in fixed) && !(k in path)))
    if (!Object.keys(params).length) return answer
    return {
        ...answer,
        fragments: (answer.fragments ?? []).map(f => ({
            ...f,
            state: { ...f.state, ...params },
            data: { ...f.data, ...params },
        })),
    }
}

/** The query parameters of a route string (`/people?dept=sales&page=2`), first value of each. */
export const queryOf = (route: string | undefined): Record<string, string> => {
    const at = route?.indexOf('?') ?? -1
    if (at < 0) return {}
    const out: Record<string, string> = {}
    new URLSearchParams(route!.substring(at + 1)).forEach((value, key) => {
        if (!(key in out)) out[key] = value
    })
    return out
}

const resolveLoadRaw = (
    state: BundleState, syncPath: string, consumedRoute: string | undefined, localize: Localize,
): UIIncrement | undefined => {
    const fresh = consumedRoute === undefined || consumedRoute === '_empty'
    const own = (): UIIncrement | undefined =>
        bundledIncrement(state, syncPath) ?? bundledTemplate(state, syncPath) ?? expandedIncrement(state, syncPath, localize)
    if (fresh) {
        const answer = own()
        if (answer && appShellOf(answer)) return aimedAt(answer, syncPath)
        // A route of the root mount (an authored entry), or one the bundle cannot answer itself: when
        // the root is an app shell, the fresh load is that shell. A route of ANOTHER mount (a pathed
        // @UI page) keeps its own answer.
        if (syncPath !== '_no_route' && (matchRouteEntry(state, syncPath) || !answer)) {
            const root = rootIncrement(state, localize)
            if (root && appShellOf(root)) return aimedAt(root, syncPath)
        }
        return answer
    }
    const content = state.contents.get(syncPath)
    const exported = content !== undefined
        ? applyRouteParams(state, syncPath, content)
        : bundledTemplate(state, syncPath, true)
    if (exported) return exported
    const answer = own()
    return answer && appShellOf(answer) ? undefined : answer
}
