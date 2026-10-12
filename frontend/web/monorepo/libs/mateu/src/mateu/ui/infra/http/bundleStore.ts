// Static-bundle "no backend" mode. A build-time exporter (Mateu's mateu:bundle Maven goal) renders
// each declared route's initial load (actionId="") to wire JSON and writes a manifest.json. When
// mateu-ui is given a `bundleUrl`, we GET that manifest once at boot and answer route LOADS from it
// instead of POSTing to the Mateu server — so the UI runs from static assets with no backend. Live
// data still comes from external endpoints (@RestOptions/@RestListing …); ACTIONS still need a
// backend and degrade with the normal "request failed" path when it is absent.
import { setRemoteRestSources, setRestSourceCatalogue, setSampleMode } from './restSourceCatalogue.ts'
import { setActionCatalogue } from '../ui/actionCatalogue.ts'
import { setFieldTypeCatalogue, type FieldTypeEntry } from '../expander/fieldTypes.ts'
import type RestSourceEntry from '@mateu/shared/apiClients/dtos/componentmetadata/RestSourceEntry.ts'
import type Action from '@mateu/shared/apiClients/dtos/componentmetadata/Action.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import { expandDefinition, isClientExpandable, type DefinitionSpec } from '@infra/expander/expandDefinition.ts'
import {
    browserLocales, pickLocale, translateDeep, mentionsI18n, type TranslationCatalogue,
} from '@infra/i18n/translations.ts'

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
    // The route's CONTENT load (what an app shell asks for its content slot), when it differs from
    // `json` — which, under a mount whose root is an app shell, is the SHELL (the fresh load).
    contentJson?: string | null
}

/**
 * One entry of the mount's authored route registry (the server's RouteEntry), shipped with the
 * bundle. A statically deployed mount has no server left to ask what a URL means, so the parameters
 * a route pins or seeds have to travel as data.
 */
interface RouteEntry {
    route: string
    definition?: string | null
    viewModel?: string | null
    fixedParams?: Record<string, unknown>
    defaultParams?: Record<string, unknown>
    // The named source that loads the route's data on entry (`data: <source>` in routes.yaml).
    data?: { ref?: string | null, url?: string | null } | null
}

interface BundleManifest {
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
    // no `viewModel`) is expanded to the wire IN THE BROWSER by the client-side expander instead of
    // being pre-rendered at build time — so editing a definition and refreshing shows it, with no
    // backend and no export step. A `viewModel` route cannot be expanded client-side and is skipped.
    definitions?: Record<string, DefinitionSpec>
    // The translation catalogue (locale → key → text). Pre-rendered entries keep their `${i18n.…}`
    // expressions on purpose (the exporter renders RAW): with no server, the browser resolves them
    // for the visitor's locale — see localize().
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

// syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
let increments: Map<string, UIIncrement> | undefined
// syncPath → the route's CONTENT load, for the routes under an app shell (see BundleEntry.contentJson).
let contents: Map<string, UIIncrement> = new Map()
// :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure (and, under
// an app shell, its content load).
interface BundleTemplate { regex: RegExp; paramNames: string[]; increment: UIIncrement; content?: UIIncrement }
let templates: BundleTemplate[] = []
// The in-flight manifest load (if any), so a route load can await it before deciding to hit the
// backend — the first load can fire before the fetch resolves.
let pending: Promise<void> | undefined
// The mount's authored route registry, as shipped in the manifest.
let routeEntries: RouteEntry[] = []
// The manifest's REST source catalogue, kept to hand to an app shell expanded in the browser.
let catalogueSources: RestSourceEntry[] = []
// Specs mode: raw authored definitions keyed by file name (see BundleManifest.definitions).
let definitions: Record<string, DefinitionSpec> = {}
// The manifest's translations, the environment it was built for, and a host-chosen locale (Play).
let translations: TranslationCatalogue = {}
let environment: string | undefined
let localeOverride: string | undefined

/**
 * Chooses the locale `${i18n.…}` resolves to in bundle mode, over the app's own (`AppDto.locale`)
 * and the browser's. undefined goes back to those. Takes effect on the next load — a host (the
 * visual editor's Play) re-mounts after calling it.
 */
export const setBundleLocale = (locale: string | undefined): void => { localeOverride = locale || undefined }

/** The locales the loaded bundle has translations for. */
export const getBundleLocales = (): string[] => Object.keys(translations)

/** The environment the loaded bundle's REST sources were resolved for (informative), if any. */
export const getBundleEnvironment = (): string | undefined => environment

/** The `locale` the bundle's app shell declares (`AppDto.locale`), when it declares one. */
const appLocale = (): string | undefined => {
    const shell = appShellOf(increments?.get('_no_route'))
    return typeof shell?.locale === 'string' && shell.locale ? shell.locale : undefined
}

/** The catalogue locale in effect: the host's choice → the app's → the browser's → fallback. */
export const getBundleLocale = (): string | undefined =>
    pickLocale(translations, [localeOverride, appLocale(), ...browserLocales()])

/** `${i18n.…}` resolved in a bundled answer (a copy), for the locale in effect. */
const localize = <T,>(value: T): T => {
    if (value === undefined || !Object.keys(translations).length || !mentionsI18n(value)) return value
    const locale = getBundleLocale()
    const fallback = pickLocale(translations, [])
    return translateDeep(value, locale ? translations[locale] : undefined,
        fallback && fallback !== locale ? translations[fallback] : undefined)
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
const matchRouteEntry = (
    path: string,
): { entry: RouteEntry; pathParams: Record<string, string> } | undefined => {
    const norm = (s: string) => s.replace(/^\/+/, '').replace(/\/+$/, '')
    const target = norm(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best: { entry: RouteEntry; pathParams: Record<string, string> } | undefined
    for (const entry of routeEntries) {
        const pattern = norm(entry.route ?? '')
        const patternSegments = pattern === '' ? [] : pattern.split('/')
        if (patternSegments.length !== targetSegments.length) continue
        const pathParams: Record<string, string> = {}
        let matches = true
        for (let i = 0; i < patternSegments.length; i++) {
            const seg = patternSegments[i]
            if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
            else if (seg !== targetSegments[i]) { matches = false; break }
        }
        if (!matches) continue
        const candidate = { entry, pathParams }
        if (!best
            || paramNamesOf(pattern).length < paramNamesOf(norm(best.entry.route ?? '')).length) {
            best = candidate
        }
    }
    return best
}

/**
 * Applies the registry's parameters to a pre-rendered increment, in the same order the server uses:
 *
 *   fixed  >  path  >  what the increment already carries  >  defaults
 *
 * Defaults only fill what nothing else supplied; fixed ones override everything, which is the whole
 * point of pinning them. Returns the increment untouched when no entry answers the path.
 */
export const applyRouteParams = (syncPath: string, increment: UIIncrement): UIIncrement => {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const { entry, pathParams } = match
    const defaults = entry.defaultParams ?? {}
    const fixed = entry.fixedParams ?? {}
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
        return increment
    }
    return {
        ...increment,
        fragments: (increment.fragments ?? []).map(f => ({
            ...f,
            state: { ...defaults, ...(f.state ?? {}), ...pathParams, ...fixed },
            data: { ...defaults, ...(f.data ?? {}), ...pathParams, ...fixed },
        })),
    }
}

/** The registry entry answering a path, for callers that need its definition or view model. */
export const getRouteEntry = (syncPath: string): RouteEntry | undefined =>
    matchRouteEntry(syncPath)?.entry

/** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors the server exporter's toSyncPath
 *  and AxiosMateuApiClient's URL building: leading slash stripped, blank/root → `_no_route`. */
export const toSyncPath = (route: string | undefined): string => {
    // the query string is a listing's filters, page and sort — never part of the screen: with it a
    // deep link (/products?status=X) or a reload of a filtered listing answered nothing at all
    const path = route && route.includes('?') ? route.substring(0, route.indexOf('?')) : route
    const r = path && path.startsWith('/') ? path.substring(1) : (path ?? '')
    return r === '' ? '_no_route' : r
}

/** Everything a manifest says, parsed: the state the resolvers below read. */
interface BundleState {
    increments: Map<string, UIIncrement>
    contents: Map<string, UIIncrement>
    templates: BundleTemplate[]
    routeEntries: RouteEntry[]
    catalogueSources: RestSourceEntry[]
    definitions: Record<string, DefinitionSpec>
    translations: TranslationCatalogue
    environment: string | undefined
}

/** A manifest, parsed (a malformed entry is skipped with a warning, never fatal). */
const parseManifest = (manifest: BundleManifest): BundleState => {
    const map = new Map<string, UIIncrement>()
    const contentMap = new Map<string, UIIncrement>()
    const tpls: BundleTemplate[] = []
    for (const e of manifest.entries ?? []) {
        if (!e.ok || !e.json) continue
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

const currentState = (): BundleState | undefined => increments === undefined ? undefined : ({
    increments, contents, templates, routeEntries, catalogueSources, definitions, translations, environment,
})

const useState = (state: BundleState | undefined): void => {
    increments = state?.increments
    contents = state?.contents ?? new Map()
    templates = state?.templates ?? []
    routeEntries = state?.routeEntries ?? []
    catalogueSources = state?.catalogueSources ?? []
    definitions = state?.definitions ?? {}
    translations = state?.translations ?? {}
    environment = state?.environment
}

/** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode off (the
 *  app falls back to the backend at baseUrl). Idempotent-ish: last call wins. */
export function loadBundleManifest(url: string, fetchImpl: typeof fetch = fetch): Promise<void> {
    pending = (async () => {
        try {
            const res = await fetchImpl(url)
            if (!res.ok) return
            const manifest = (await res.json()) as BundleManifest
            useState(parseManifest(manifest))
            setRestSourceCatalogue(manifest.sources?.sources)
            // the action catalogue, shipped once and already lowered (BundleManifest.actions)
            setActionCatalogue(manifest.actions)
            // A bundle built with the mock flag answers its sources from their samples. Only ever
            // switched ON here: a plain manifest does not switch off an editor that set it.
            if (manifest.mockSources) setSampleMode(true)
            // The field types the raw definitions reference (play ships them; an exported bundle
            // resolves them at build time, so its table is empty and nothing changes).
            if (manifest.types) setFieldTypeCatalogue(manifest.types.types)
        } catch (e) {
            console.warn('mateu: bundle manifest load failed', e)
        }
    })()
    return pending
}

// ── Static REMOTES ──────────────────────────────────────────────────────────────────────────────
// A federated shell (RemoteMenu) can mount a domain that has no backend at all: its static bundle.
// Its base URL then names the bundle's manifest (`https://cdn.example.com/catalog/manifest.json`)
// instead of a server, and every load the shell aims at it is answered from that manifest — exactly
// what the static site itself would answer — while its REST sources join the client catalogue as
// that remote's layer. Each remote keeps its own parsed state; the page's own bundle (if any) is
// untouched.

const remoteBundles = new Map<string, Promise<BundleState | undefined>>()

/** True when a base URL names a static bundle's manifest rather than a Mateu server. */
export const isStaticBundleUrl = (baseUrl: string | undefined): boolean => {
    if (!baseUrl) return false
    const path = baseUrl.split('#')[0].split('?')[0]
    return /\.json$/i.test(path)
}

/** Loads (once) the manifest a static remote's base URL names; undefined when it cannot be read. */
export const loadRemoteBundle = (url: string, fetchImpl: typeof fetch = fetch): Promise<BundleState | undefined> => {
    let loading = remoteBundles.get(url)
    if (!loading) {
        loading = (async () => {
            try {
                const res = await fetchImpl(url)
                if (!res.ok) return undefined
                const manifest = (await res.json()) as BundleManifest
                const state = parseManifest(manifest)
                setRemoteRestSources(url, manifest.sources?.sources)
                return state
            } catch (e) {
                console.warn('mateu: static remote manifest load failed', url, e)
                return undefined
            }
        })()
        const settled = loading
        // a failed load is asked again next time (the remote-menu retry), not cached forever
        settled.then((state) => { if (!state && remoteBundles.get(url) === settled) remoteBundles.delete(url) })
        remoteBundles.set(url, settled)
    }
    return loading
}

/**
 * A static remote's answer to a route load — the same rules as the page's own bundle
 * ({@link resolveBundledLoad}), read from that remote's manifest. undefined when the manifest cannot
 * be read or does not answer the route.
 */
export const resolveRemoteBundledLoad = async (
    url: string, syncPath: string, consumedRoute?: string, fetchImpl: typeof fetch = fetch,
): Promise<UIIncrement | undefined> => {
    const state = await loadRemoteBundle(url, fetchImpl)
    if (!state) return undefined
    // The resolvers read the module's state: swap the remote's in for this one synchronous call.
    const own = currentState()
    useState(state)
    try {
        const fresh = consumedRoute === undefined || consumedRoute === '_empty'
        if (!fresh && syncPath === '_no_route') {
            // The remote mounted at its ROOT as content (a deep link to the shell's menu path): that
            // is its home screen, never its own app shell nested inside the shell's.
            const root = getBundledIncrement('_no_route') ?? getExpandedIncrement('_no_route')
            const home = appShellOf(root)?.homeRoute
            if (typeof home !== 'string' || toSyncPath(home) === '_no_route') return undefined
            return resolveBundledLoad(toSyncPath(home), consumedRoute)
        }
        return resolveBundledLoad(syncPath, consumedRoute)
    } finally {
        useState(own)
    }
}

/** A base URL the loaded bundle answers for although it is another origin (see {@link setBundleBaseUrl}). */
let bundleBaseUrl: string | undefined

const sameBase = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '')

/**
 * Declare that the loaded bundle is the app served at `baseUrl`, although that is another origin
 * than the page's — the visual editor's Play: the mount runs from the files as edited, and the
 * configured preview backend (VS Code's loopback server, a typed URL) only answers what the bundle
 * cannot. `undefined` clears it. A federated remote at any other origin stays foreign.
 */
export function setBundleBaseUrl(baseUrl: string | undefined): void {
    bundleBaseUrl = baseUrl || undefined
}

/** True when a base URL points at ANOTHER origin than the page's: a federated remote's server, which
 *  the page's own bundle must never answer for (it would hand the remote's menu load the shell). */
export const isForeignBaseUrl = (baseUrl: string | undefined): boolean => {
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) return false
    if (bundleBaseUrl && sameBase(baseUrl, bundleBaseUrl)) return false
    try {
        return typeof window === 'undefined' || new URL(baseUrl).origin !== window.location.origin
    } catch {
        return false
    }
}

/** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
 *  backend before the bundle is ready. Resolves immediately when no bundle is being loaded. */
export const awaitBundle = (): Promise<void> => pending ?? Promise.resolve()

/** True once a non-empty bundle has been loaded (exact routes, :param templates, or — specs mode —
 *  raw definitions to expand client-side). */
export const hasBundle = (): boolean =>
    (increments !== undefined && increments.size > 0) || templates.length > 0
    || Object.keys(definitions).length > 0

/**
 * The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
 * The registry's parameters are applied on the way out, so a statically served route behaves like
 * the same route served by the backend.
 */
export const getBundledIncrement = (syncPath: string): UIIncrement | undefined => {
    const increment = increments?.get(syncPath)
    return increment === undefined ? undefined : applyRouteParams(syncPath, increment)
}

/**
 * Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES and, on a hit, return
 * the pre-rendered structure with the extracted params INJECTED into every fragment's state and data
 * — so the screen's client-side data fetch (`@RestOptions`/`@RestData` URL with `${state.<param>}`)
 * resolves to the real value with no backend. undefined when no template matches.
 */
export const matchBundledTemplate = (syncPath: string, content = false): UIIncrement | undefined => {
    for (const t of templates) {
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
                state: { ...(f.state ?? {}), ...params },
                data: { ...(f.data ?? {}), ...params },
            })),
        }
        // …and then the registry's own, so a pinned parameter still outranks the path.
        return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
}

/** A server-side component carries the path params it was rendered with in `initialData` too — at
 *  export time, the PLACEHOLDER. Overwrite them with the real ones, or a page that seeds its state
 *  from initialData would ask the API for `__mateu_param__`. */
const withInitialData = <T,>(component: T, params: Record<string, string>): T => {
    const c = component as unknown as { initialData?: unknown } | undefined
    if (!c || !c.initialData || typeof c.initialData !== 'object') return component
    return { ...c, initialData: { ...(c.initialData as Record<string, unknown>), ...params } } as unknown as T
}

/**
 * SPECS MODE (Phase 6, #1): expand a definition-only route to the wire IN THE BROWSER. When the
 * route entry names a `definition` the manifest shipped raw, and it is client-expandable (a layout,
 * no `viewModel`), the client-side expander turns it into an increment — no pre-render, no backend.
 * The registry's parameters are applied on the way out, exactly like a pre-rendered increment.
 * undefined when there is no matching definition or it needs a backend (a `viewModel` route).
 */
export const getExpandedIncrement = (syncPath: string): UIIncrement | undefined => {
    const match = matchRouteEntry(syncPath)
    const name = match?.entry.definition
    if (!name) return undefined
    const raw = definitions[name]
    if (!raw || !isClientExpandable(raw)) return undefined
    const spec = localize(raw)
    const expanded = expandDefinition(spec, match!.entry.route, undefined, {
        data: match!.entry.data ?? undefined,
        path: syncPath === '_no_route' ? '' : syncPath,
    })
    // The expander targets the harness's main id (its goldens were captured that way); in the
    // browser the fragment goes to whoever asked, so leave it untargeted and let the client aim it.
    // An expanded app shell carries the manifest's source catalogue, as a served one carries the
    // app's: the shell PUBLISHES its catalogue when it mounts (a replace), and one without it would
    // wipe the table every screen resolves its `ref`s against.
    return applyRouteParams(syncPath, {
        ...expanded,
        fragments: (expanded.fragments ?? []).map(f => {
            const app = appShellOf({ fragments: [f] } as UIIncrement)
            const component = app
                ? { ...f.component, metadata: { ...app, restSources: catalogueSources } } as unknown as typeof f.component
                : f.component
            return { ...f, component, targetComponentId: undefined as unknown as string }
        }),
    })
}

/** The `type: App` metadata of an increment's first fragment, when the increment is an app shell. */
const appShellOf = (increment: UIIncrement | undefined): Record<string, unknown> | undefined => {
    const component = increment?.fragments?.[0]?.component as unknown as
        { metadata?: Record<string, unknown> } | undefined
    return component?.metadata?.type === 'App' ? component.metadata : undefined
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

/**
 * The bundle's answer to a route LOAD, or undefined (→ the backend, if there is one).
 *
 * Two loads exist under an app shell, and they must not be confused (#557):
 *  - the FRESH load (`consumedRoute` "_empty": a deep link, a reload) answers the SHELL, aimed at the
 *    requested route — exactly what the server does;
 *  - the CONTENT load (any other consumed route: the shell filling its slot) answers the route's own
 *    screen — its exported content, a :param template's content, or its definition expanded here.
 * A content load is never answered with a shell: that is what nested shells until the tab died.
 */
export const resolveBundledLoad = (syncPath: string, consumedRoute?: string): UIIncrement | undefined =>
    localize(resolveBundledLoadRaw(syncPath, consumedRoute))

const resolveBundledLoadRaw = (syncPath: string, consumedRoute?: string): UIIncrement | undefined => {
    const fresh = consumedRoute === undefined || consumedRoute === '_empty'
    const own = (): UIIncrement | undefined =>
        getBundledIncrement(syncPath) ?? matchBundledTemplate(syncPath) ?? getExpandedIncrement(syncPath)
    if (fresh) {
        const answer = own()
        if (answer && appShellOf(answer)) return aimedAt(answer, syncPath)
        // A route of the root mount (an authored entry), or one the bundle cannot answer itself: when
        // the root is an app shell, the fresh load is that shell. A route of ANOTHER mount (a pathed
        // @UI page) keeps its own answer.
        if (syncPath !== '_no_route' && (matchRouteEntry(syncPath) || !answer)) {
            const root = getBundledIncrement('_no_route') ?? getExpandedIncrement('_no_route')
            if (root && appShellOf(root)) return aimedAt(root, syncPath)
        }
        return answer
    }
    const exported = contents.get(syncPath) !== undefined
        ? applyRouteParams(syncPath, contents.get(syncPath)!)
        : matchBundledTemplate(syncPath, true)
    if (exported) return exported
    const answer = own()
    return answer && appShellOf(answer) ? undefined : answer
}

/** Test hook: seed/clear the in-memory bundle directly. */
export const __setBundleForTests = (
    m: Map<string, UIIncrement> | undefined,
    t: BundleTemplate[] = [],
    r: RouteEntry[] = [],
    d: Record<string, DefinitionSpec> = {},
    c: Map<string, UIIncrement> = new Map(),
    tr: TranslationCatalogue = {},
): void => {
    translations = tr
    localeOverride = undefined
    remoteBundles.clear()
    increments = m
    contents = c
    templates = t
    routeEntries = r
    definitions = d
    pending = undefined
}
