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
