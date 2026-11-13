import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { interpolate } from './interpolation.ts'
import { safeNavigate } from './safeNavigate.ts'
import { routeTargetUrl } from './navigationUrl.ts'

/**
 * A listing's `rowRoute`: where a row click goes.
 *
 * <p>Without it, the only detail a listing with no view model could offer was `masterDetail` — a
 * pane painted from the row already fetched, which is not addressable, not shareable and gone on
 * reload. A route is all three, and it is what turns a listing into the entrance to a record rather
 * than the whole of it.
 *
 * The template is evaluated with the clicked row in scope as `row`, alongside the listing's own
 * `state` and `data`: `people/${row.id}`.
 */
export function rowRouteOf(
    template: string | undefined,
    row: unknown,
    state?: Record<string, any>,
    data?: Record<string, any>,
): string | undefined {
    if (!template || row == null) return undefined
    // A template that is ONE placeholder (`${row.url}`) is a whole route or URL, taken as it is. In a
    // composed one (`people/${row.id}`) every value is a path segment: it is percent-encoded, like
    // Redwood does, so a value `../../admin` or `x?y=1#z` can neither leave the mount nor add a query.
    const whole = /^\s*\$\{[^}]*\}\s*$/.test(template)
    const route = whole
        ? interpolate(template, state, data, { row })
        : template.replace(/\$\{[^}]*\}/g, (placeholder) => {
            const value = interpolate(placeholder, state, data, { row })
            return value === placeholder ? placeholder : encodeURIComponent(value)
        })
    // An unresolved template comes back unchanged, and navigating to a literal "${row.id}" would
    // land on a route nobody declared. Better to do nothing than to leave the user somewhere wrong.
    if (!route || route === template || route.includes('${')) return undefined
    return route
}

/**
 * Navigate, using the pair every shell already honors — the same one the command centre and the
 * menu use. Emitting these rather than touching a router keeps this working on Vaadin, Redwood and
 * the DS shells alike, with no shell-specific glue.
 */
export function navigateToRoute(from: HTMLElement, route: string): void {
    // A route that is a whole URL (`${row.imageLarge}`, `https://…`) leaves the app: it opens in a
    // new tab, through the one door that refuses `javascript:` and friends.
    if (isExternalRoute(route)) {
        safeNavigate(route, { newTab: true })
        return
    }
    // A route is relative to ITS mount: in a page EMBEDDED from another mount of this app (a
    // MicroFrontend of `/yaml-mount` inside `/`), it names a place under that mount — the host's
    // router resolved it under its own and landed on "Page not found" (Explorer F4). That place is
    // another app's page: loaded by the browser, like Redwood's leftMountFor.
    const mount = embeddingMountOf(from)
    if (mount !== undefined) {
        safeNavigate(trimSlashesAtEnd(mount) + '/' + route.replace(/^\/+/, ''))
        return
    }
    for (const type of ['route-changed', 'navigate-to-requested']) {
        from.dispatchEvent(new CustomEvent(type, { detail: { route }, bubbles: true, composed: true }))
    }
}

/**
 * A button that navigates inside the app leaves the screen, so it asks about unsaved changes like a
 * menu click or a breadcrumb. A whole URL opens in another tab and loses nothing.
 */
export function leaveToRoute(from: HTMLElement, route: string): boolean {
    if (!isExternalRoute(route) && !dirtyGuard.confirmLeave()) return false
    navigateToRoute(from, route)
    return true
}

/**
 * The `href` of an app route as the address bar will show it once {@link navigateToRoute} follows
 * it: resolved by the page's top-level `mateu-ui` (its mount path and base url), so on an app
 * mounted at `/back-office` the link reads `/back-office/people/3`, not `/people/3` (which is
 * another app, or nothing). Without a `mateu-ui` around, `/<route>`.
 */
export function appRouteHref(from: Element, route: string): string {
    const ui = closestAcrossShadows(from, 'mateu-ui') as (Element & { baseUrl?: string, pathPrefix?: string }) | undefined
    const fallback = '/' + route.replace(/^\/+/, '')
    if (!ui || typeof window === 'undefined') return fallback
    try {
        const url = routeTargetUrl(route.startsWith('/') ? route : '/' + route, ui.baseUrl, ui.pathPrefix, window.location.origin)
        return url.pathname + url.search + url.hash
    } catch {
        return fallback
    }
}

/** Trailing '/'s off, in linear time (a /\/+$/ regex backtracks on a long run of slashes). */
const trimSlashesAtEnd = (s: string): string => {
    let end = s.length
    while (end > 0 && s.charCodeAt(end - 1) === 47) end--
    return s.slice(0, end)
}

const samePath = (a: string | undefined | null, b: string | undefined | null): boolean =>
    trimSlashesAtEnd(a ?? '') === trimSlashesAtEnd(b ?? '')

/**
 * The base path of ANOTHER mount of this app that `from` is embedded from — the nearest micro
 * frontend's `mateu-ux` whose base url is a same-origin path different from the page's
 * `mateu-ui` — or undefined (the page's own mount, a remote of another origin, no shell around).
 */
export function embeddingMountOf(from: Element): string | undefined {
    const ui = closestAcrossShadows(from, 'mateu-ui') as (Element & { baseUrl?: string }) | undefined
    const ux = closestAcrossShadows(from, 'mateu-ux[micro-frontend]') as (Element & { baseUrl?: string }) | undefined
    if (!ui || !ux) return undefined
    const base = ux.baseUrl ?? ux.getAttribute('baseurl') ?? ux.getAttribute('baseUrl') ?? undefined
    if (!base || !base.startsWith('/') || base.startsWith('//') || base.startsWith('/\\')) return undefined
    return samePath(base, ui.baseUrl ?? ui.getAttribute('baseurl')) ? undefined : base
}

const closestAcrossShadows = (from: Element, selector: string): Element | undefined => {
    let node: Node | null = from
    while (node) {
        if (node instanceof Element) {
            const hit = node.closest(selector)
            if (hit) return hit
        }
        const root: Node = (node as Element).getRootNode?.() ?? node
        node = root instanceof ShadowRoot ? root.host : null
    }
    return undefined
}

/**
 * The row fields a `rowRoute` needs, beyond the visible columns.
 *
 * <p>A row fetched from an external source only carries the columns the listing declares — that is
 * what keeps the payload to what is on screen. But the field that identifies the record is usually
 * NOT one of them: nobody wants an id column, and yet `people/${row.id}` cannot work without it. So
 * the template says which extra fields to carry, and they are fetched alongside the visible ones.
 */
export function rowRouteFields(template: string | undefined): string[] {
    if (!template) return []
    const fields = new Set<string>()
    for (const match of template.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g)) {
        fields.add(match[1])
    }
    return [...fields]
}

/**
 * Whether a route leaves the app: it carries a scheme (`https://…`, and also `mailto:` or a refused
 * `javascript:`) or is protocol-relative (`//host/…`). Every other route is the app's own,
 * mount-relative. The same rule in every renderer: Redwood `isExternalRoute` (poc/core/content.mjs),
 * RN `isExternalRoute` (core/rowOpen.ts), IntelliJ `RowOpen.isExternal`.
 */
export function isExternalRoute(route: string | undefined | null): boolean {
    if (!route) return false
    // a browser reads `/\host` and `\\host` as `//host`: another site, not one of the app's routes
    const r = route.trim().replace(/\\/g, '/')
    return /^[a-z][a-z0-9+.-]*:/i.test(r) || r.startsWith('//')
}
