// Static-bundle "no backend" mode. A build-time exporter (Mateu's mateu:bundle Maven goal) renders
// each declared route's initial load (actionId="") to wire JSON and writes a manifest.json. When
// mateu-ui is given a `bundleUrl`, we GET that manifest once at boot and answer route LOADS from it
// instead of POSTing to the Mateu server — so the UI runs from static assets with no backend. Live
// data still comes from external endpoints (@RestOptions/@RestListing …); ACTIONS still need a
// backend and degrade with the normal "request failed" path when it is absent.
import { setRemoteRestSources, setRestSourceCatalogue, setSampleMode } from './restSourceCatalogue.ts'
import { setActionCatalogue } from '../ui/actionCatalogue.ts'
import { setFieldTypeCatalogue } from '../expander/fieldTypes.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import type { DefinitionSpec } from '@infra/expander/expandDefinition.ts'
import {
    browserLocales, pickLocale, translateDeep, mentionsI18n, type TranslationCatalogue,
} from '@infra/i18n/translations.ts'
// The resolution rules themselves are pure and shared with the native renderer: bundleResolver.ts.
// This module only keeps the page's ONE bundle (and its static remotes) and the browser's locale.
import {
    appShellOf, applyRouteParams as applyRouteParamsOf, bundledIncrement, bundledTemplate,
    expandedIncrement, matchRouteEntry, parseBundleManifest, resolveLoad, rootIncrement, toSyncPath as toSyncPathOf,
    type BundleManifest, type BundleState, type BundleTemplate, type RouteEntry,
} from './bundleResolver.ts'

// The loaded bundle. undefined = no bundle loaded.
let state: BundleState | undefined
// The in-flight manifest load (if any), so a route load can await it before deciding to hit the
// backend — the first load can fire before the fetch resolves.
let pending: Promise<void> | undefined
// A host-chosen locale (Play).
let localeOverride: string | undefined

/** The loaded bundle's state, or an empty one (nothing answers from it). */
const current = (): BundleState => state ?? {
    increments: new Map(), contents: new Map(), templates: [], routeEntries: [], catalogueSources: [],
    definitions: {}, translations: {}, environment: undefined,
}

const translationsOf = (): TranslationCatalogue => state?.translations ?? {}

/**
 * Chooses the locale `${i18n.…}` resolves to in bundle mode, over the app's own (`AppDto.locale`)
 * and the browser's. undefined goes back to those. Takes effect on the next load — a host (the
 * visual editor's Play) re-mounts after calling it.
 */
export const setBundleLocale = (locale: string | undefined): void => { localeOverride = locale || undefined }

/** The locales the loaded bundle has translations for. */
export const getBundleLocales = (): string[] => Object.keys(translationsOf())

/** The environment the loaded bundle's REST sources were resolved for (informative), if any. */
export const getBundleEnvironment = (): string | undefined => state?.environment

/** The `locale` the bundle's app shell declares (`AppDto.locale`), when it declares one. */
const appLocale = (): string | undefined => {
    const shell = appShellOf(state?.increments.get('_no_route'))
    return typeof shell?.locale === 'string' && shell.locale ? shell.locale : undefined
}

/** The catalogue locale in effect: the host's choice → the app's → the browser's → fallback. */
export const getBundleLocale = (): string | undefined =>
    pickLocale(translationsOf(), [localeOverride, appLocale(), ...browserLocales()])

/** `${i18n.…}` resolved in a bundled answer (a copy), for the locale in effect. */
const localize = <T,>(value: T): T => {
    const translations = translationsOf()
    if (value === undefined || !Object.keys(translations).length || !mentionsI18n(value)) return value
    const locale = getBundleLocale()
    const fallback = pickLocale(translations, [])
    return translateDeep(value, locale ? translations[locale] : undefined,
        fallback && fallback !== locale ? translations[fallback] : undefined)
}

/** See bundleResolver.applyRouteParams — over the loaded bundle. */
export const applyRouteParams = (syncPath: string, increment: UIIncrement): UIIncrement =>
    applyRouteParamsOf(current(), syncPath, increment)

/** The registry entry answering a path, for callers that need its definition or view model. */
export const getRouteEntry = (syncPath: string): RouteEntry | undefined =>
    matchRouteEntry(current(), syncPath)?.entry

/** See bundleResolver.toSyncPath. */
export const toSyncPath = (route: string | undefined): string => toSyncPathOf(route)

/** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode off (the
 *  app falls back to the backend at baseUrl). Idempotent-ish: last call wins. */
export function loadBundleManifest(url: string, fetchImpl: typeof fetch = fetch): Promise<void> {
    pending = (async () => {
        try {
            const res = await fetchImpl(url)
            if (!res.ok) return
            const manifest = (await res.json()) as BundleManifest
            state = parseBundleManifest(manifest)
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
                const parsed = parseBundleManifest(manifest)
                setRemoteRestSources(url, manifest.sources?.sources)
                return parsed
            } catch (e) {
                console.warn('mateu: static remote manifest load failed', url, e)
                return undefined
            }
        })()
        const settled = loading
        // a failed load is asked again next time (the remote-menu retry), not cached forever
        settled.then((parsed) => { if (!parsed && remoteBundles.get(url) === settled) remoteBundles.delete(url) })
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
    const remote = await loadRemoteBundle(url, fetchImpl)
    if (!remote) return undefined
    // The remote's own translations, for the locale in effect (as the page's bundle resolves them).
    const own = state
    state = remote
    try {
        const fresh = consumedRoute === undefined || consumedRoute === '_empty'
        if (!fresh && syncPath === '_no_route') {
            // The remote mounted at its ROOT as content (a deep link to the shell's menu path): that
            // is its home screen, never its own app shell nested inside the shell's.
            const home = appShellOf(rootIncrement(remote, localize))?.homeRoute
            if (typeof home !== 'string' || toSyncPath(home) === '_no_route') return undefined
            return resolveLoad(remote, toSyncPath(home), consumedRoute, localize)
        }
        return resolveLoad(remote, syncPath, consumedRoute, localize)
    } finally {
        state = own
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
    !!state && (state.increments.size > 0 || state.templates.length > 0 || Object.keys(state.definitions).length > 0)

/**
 * The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
 * The registry's parameters are applied on the way out, so a statically served route behaves like
 * the same route served by the backend.
 */
export const getBundledIncrement = (syncPath: string): UIIncrement | undefined =>
    state ? bundledIncrement(state, syncPath) : undefined

/** See bundleResolver.bundledTemplate — over the loaded bundle. */
export const matchBundledTemplate = (syncPath: string, content = false): UIIncrement | undefined =>
    bundledTemplate(current(), syncPath, content)

/** See bundleResolver.expandedIncrement — over the loaded bundle, localized for the browser. */
export const getExpandedIncrement = (syncPath: string): UIIncrement | undefined =>
    expandedIncrement(current(), syncPath, localize)

/** The bundle's answer to a route LOAD, or undefined (→ the backend, if there is one). See
 *  bundleResolver.resolveLoad for the fresh/content rules (#557). */
export const resolveBundledLoad = (syncPath: string, consumedRoute?: string): UIIncrement | undefined =>
    state ? resolveLoad(state, syncPath, consumedRoute, localize) : undefined

/** Test hook: seed/clear the in-memory bundle directly. */
export const __setBundleForTests = (
    m: Map<string, UIIncrement> | undefined,
    t: BundleTemplate[] = [],
    r: RouteEntry[] = [],
    d: Record<string, DefinitionSpec> = {},
    c: Map<string, UIIncrement> = new Map(),
    tr: TranslationCatalogue = {},
): void => {
    localeOverride = undefined
    remoteBundles.clear()
    state = m === undefined && !t.length && !r.length && !Object.keys(d).length && !c.size && !Object.keys(tr).length
        ? undefined
        : {
            increments: m ?? new Map(), contents: c, templates: t, routeEntries: r, catalogueSources: [],
            definitions: d, translations: tr, environment: undefined,
        }
    pending = undefined
}
