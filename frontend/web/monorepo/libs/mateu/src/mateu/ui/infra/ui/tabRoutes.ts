/**
 * Tabs that are URLs: a tab with a route key (`@Tab(key = "gateways")`) is opened by the page URL
 * ending with that key (`/vcns/7/gateways`) and selecting it pushes that URL as a history entry, so
 * back/forward walk the tabs and a reload or a pasted link opens the same tab.
 *
 * Pure functions, shared by every renderer's tab strip.
 */

/** The path that opens `key`: the page path with the strip's current key (if any) replaced. */
export const tabRoutePath = (pathname: string, keys: string[], key: string): string => {
    const trimmed = (pathname || '').replace(/\/+$/, '')
    const segments = trimmed.split('/')
    const last = segments[segments.length - 1]
    const base = keys.includes(last) ? segments.slice(0, -1).join('/') : trimmed
    return base + '/' + key
}

/** The index of the tab the path names (its last segment is that tab's key), or -1. */
export const tabIndexFromPath = (pathname: string, keys: (string | undefined)[]): number => {
    const trimmed = (pathname || '').replace(/\/+$/, '')
    const last = trimmed.substring(trimmed.lastIndexOf('/') + 1)
    if (!last) return -1
    return keys.findIndex(key => !!key && key === last)
}

/**
 * Pushes the URL of the tab at `index` — when it has a route key and the URL is not already it.
 * Goes through `url-update-requested`, the event mateu-ui turns into a history entry (and that keeps
 * its record of the URL on screen, which back/forward compares against).
 */
export const announceTabRoute = (source: EventTarget, keys: (string | undefined)[], index: number) => {
    const key = keys[index]
    if (!key || typeof window === 'undefined') return
    const defined = keys.filter((k): k is string => !!k)
    const path = tabRoutePath(window.location.pathname, defined, key)
    if (path === window.location.pathname) return
    source.dispatchEvent(new CustomEvent('url-update-requested', {
        detail: { route: path },
        bubbles: true,
        composed: true,
    }))
}
