/**
 * What the address bar should become when a route change is applied, or null when it should be
 * left alone.
 *
 * <p>A function, and exported, because the rule it encodes is not obvious and used to be wrong.
 * It compared paths only, so navigating to the page already on screen with a different query
 * string pushed nothing — and a Mateu listing keeps its filters in the query string
 * (`mateu-table-crud._initStateFromUrl` reads them back out of it). The visible effect was a
 * navigation that appeared to do nothing at all: ask an agent to show the running processes while
 * standing on the process list, and the list stays unfiltered with no error anywhere.
 *
 * <p>The comparison is therefore over path AND query. Same path with different filters is a
 * different destination; identical path and query is not a destination at all, and pushing it
 * would put a duplicate entry in the history that the back button has to be pressed twice to get
 * past.
 */
export const nextHistoryUrl = (
    current: { pathname: string; search: string },
    target: { pathname: string; search: string },
): string | null => {
    const to = target.pathname + (target.search ?? '')
    const from = (current.pathname ?? '') + (current.search ?? '')
    if (!to && !from) {
        return null
    }
    if (from === to) {
        return null
    }
    return to.startsWith('/') ? to : '/' + to
}

/**
 * Whether a back/forward (popstate) lands on a DIFFERENT screen from the one shown, so the whole
 * tree has to be rebuilt as on a fresh load rather than refreshed in place.
 *
 * <p>The top-level ux only re-fetches what changed and keeps its live content when its own route is
 * unchanged — but a nested screen (a record master's tab, the crud inside it) pushes its URL without
 * touching the top-level route. Going back from `/customers/3/orders/new` to `/customers/3/orders`
 * left the top route equal, the server answered state-only, and the New form stayed on screen
 * under the listing's URL. A change of path or query is a change of screen; a change of hash alone
 * (a foldout's `#expand=`) is not.
 */
export const isScreenChange = (
    previousHref: string | undefined,
    current: { pathname: string; search: string },
): boolean => {
    if (!previousHref) {
        return false
    }
    let previous: URL
    try {
        previous = new URL(previousHref)
    } catch {
        return false
    }
    return previous.pathname !== current.pathname || (previous.search ?? '') !== (current.search ?? '')
}

/**
 * The URL a route change of the top-level ux points the address bar at.
 *
 * <p>An absolute route (`/orders/3`) is resolved against the page's own mount (origin +
 * `pathPrefix`); a relative one (`section1`) against `baseUrl`, prefixed with `pathPrefix`. A route
 * that is ONLY a query string (`?genre=NOVEL`) is the page already mounted with other filters —
 * which is what the top-level ux reports when the page was opened from a deep link carrying a
 * listing's filters. It used to take the relative branch, where both `baseUrl` and `pathPrefix`
 * carry the mount path, and the address bar became `/books/books?genre=NOVEL`: the rows were right,
 * but the next reload asked for a route that does not exist.
 */
export const routeTargetUrl = (
    rawRoute: string | undefined,
    baseUrlAttr: string | undefined,
    pathPrefix: string | undefined,
    origin: string,
    publicBase: string = '',
): URL => {
    let route = rawRoute ?? ''
    // Under a public base (`/crm`: a context path, a prefix-stripping proxy) the page's pathPrefix
    // carries it (`/crm/products`) but the server spells a crud's inner route with its mount only
    // (`/products/new`): that spelling is the mount too, so it is put under the base and stripped
    // like the plain one below (it used to become `/crm/products/products/new`).
    if (publicBase && pathPrefix && pathPrefix.startsWith(publicBase + '/') && route.startsWith('/')) {
        const mount = pathPrefix.substring(publicBase.length)
        if (route === mount || route.startsWith(mount + '/') || route.startsWith(mount + '?')) {
            route = publicBase + route
        }
    }
    let baseUrl = baseUrlAttr ?? ''
    if (!route || route.startsWith('/') || route.startsWith('?') || route.startsWith('#')) {
        baseUrl = origin + (pathPrefix ?? '')
    } else {
        // a relative route is a segment BELOW the base: joined with a slash. Concatenated as it
        // was, a mount-relative RouteLink `second` on the YAML mount /yaml-mount pushed
        // /yaml-mountsecond (and on an @UI("/fed") app, /fedsecond)
        route = (pathPrefix ?? '') + '/' + route
        if (baseUrl.indexOf('://') < 0) {
            if (!baseUrl.startsWith('/')) {
                baseUrl = '/' + baseUrl
            }
            baseUrl = origin + baseUrl
        }
    }
    if (route.startsWith(pathPrefix + '/')) {
        route = route.substring(pathPrefix?.length ?? 0)
    } else if (pathPrefix && (route === pathPrefix || route.startsWith(pathPrefix + '?'))) {
        // the mount itself (a crud back on its listing after a delete or a bulk action pushes
        // "/products"): it used to be appended to the mount, "/products/products"
        route = route.substring(pathPrefix.length)
    }
    if (baseUrl.endsWith('/') && route.startsWith('/')) {
        route = route.substring(1)
    }
    return new URL(baseUrl + route)
}

/**
 * Whether a back/forward only moves between two states of the listing on screen — same path, and
 * at least one of the two entries written by the listing (its filters, page, sort): the listing
 * re-reads the URL and searches again (mateu-table-crud `updated`), so the screen is NOT rebuilt.
 * Rebuilding it (isScreenChange) re-mounted the whole app and reloaded the route on every
 * `?page=1 ↔ ?page=2`.
 */
export const isListingMove = (
    from: { href: string, listing?: boolean },
    toListing: boolean,
    current: { pathname: string },
): boolean => {
    if (!from.listing && !toListing) return false
    try {
        return new URL(from.href).pathname === current.pathname
    } catch {
        return false
    }
}
