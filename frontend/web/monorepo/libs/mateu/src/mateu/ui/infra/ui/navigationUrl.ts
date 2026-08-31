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
