/**
 * The "add this UI" link the Mateu mobile app understands (design/mobile-app-hub.md): a universal
 * link / App Link on mateu.io, so the phone's camera opens the app when it is installed and the
 * landing page (store badges + the QR again) when it is not.
 *
 *   https://mateu.io/add?u=<url-encoded absolute base URL>[&r=<url-encoded route>]
 *
 * It carries NO secret — only where the UI lives. Credentials are entered at login (OIDC).
 */
export const MOBILE_ADD_URL = 'https://mateu.io/add'

const trimSlashes = (s: string) => s.replace(/\/+$/, '')

/**
 * @param origin the page's origin, e.g. `https://crm.acme.com`
 * @param baseUrl the UI mount's base URL (`''` for the root mount, `/crm` for a nested one; an
 *   absolute URL is kept as is)
 * @param route the screen to open, relative to the mount; omitted when empty or `/`
 */
export const mobileAddUrl = (origin: string, baseUrl: string | undefined, route?: string): string => {
    const base = (baseUrl ?? '').trim()
    let absolute: string
    if (/^https?:\/\//i.test(base)) {
        absolute = trimSlashes(base)
    } else {
        const path = base && base !== '/' ? trimSlashes(base.startsWith('/') ? base : '/' + base) : ''
        absolute = trimSlashes(origin) + path
    }
    let url = `${MOBILE_ADD_URL}?u=${encodeURIComponent(absolute)}`
    const r = (route ?? '').trim()
    if (r && r !== '/') url += `&r=${encodeURIComponent(r)}`
    return url
}

/**
 * The current route relative to the mount, from the browser's location: the path without the
 * mount's prefix, plus the query string.
 */
export const currentRoute = (pathname: string, search: string, baseUrl: string | undefined): string => {
    const base = trimSlashes(baseUrl ?? '')
    let path = pathname
    if (base && !/^https?:/i.test(base) && (path === base || path.startsWith(base + '/'))) {
        path = path.substring(base.length)
    }
    if (path === '' || path === '/') return search ? '/' + search : ''
    return path + (search ?? '')
}
