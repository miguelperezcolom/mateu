/**
 * The PUBLIC base path of the app: the path in front of everything it serves, as the browser sees
 * it — `''` at the root of a host, `'/crm'` when the server runs under a servlet context path
 * (`server.servlet.context-path=/crm`) or behind a reverse proxy that serves it at `/crm/` and
 * strips the prefix (the server's `io.mateu.core.infra.PublicBase`).
 *
 * The served page already writes it into everything the page itself names: its assets, the root
 * `<mateu-ui baseUrl="/crm/admin" pathPrefix="/crm/admin">`, so the API calls and the address bar
 * of that UI derive the right URL as they are. What it CANNOT rewrite is what the server names in a
 * response, because the server answers with the paths it routes (it never sees the stripped prefix):
 * a remote/sibling mount's base url (`/orders`), a `NavigateTo('/orders/3')`, a REST source of the
 * app's own (`/api/products`), a crud's inner route spelled with its mount (`/products/new`). Those
 * go through {@link underPublicBase}. The page carries the base as `<mateu-ui publicBase="/crm">`.
 */

let base = ''

/** `value` as a base path (`''` or `'/a/b'`, no trailing slash); anything else is `''`. */
export const normalizePublicBase = (value: string | null | undefined): string => {
    let v = String(value ?? '').trim()
    while (v.endsWith('/')) v = v.slice(0, -1)
    if (!v) return ''
    if (!v.startsWith('/')) v = '/' + v
    return /^(\/[A-Za-z0-9._~-]+)+$/.test(v) ? v : ''
}

/** Set once, by the top-level `<mateu-ui>` (the host page wrote its attribute, never data). */
export const setPublicBase = (value: string | null | undefined): void => {
    base = normalizePublicBase(value)
}

export const publicBase = (): string => base

/** Whether a root-relative path already sits under the base (`/crm`, `/crm/x`, `/crm?q`). */
const isUnder = (path: string, b: string): boolean =>
    path === b || path.startsWith(b + '/') || path.startsWith(b + '?') || path.startsWith(b + '#')

/**
 * `url` under the public base when it is a ROOT-RELATIVE path the server named (`/orders` →
 * `/crm/orders`); unchanged when there is no base, when it is absolute (`https://…`), protocol-
 * relative (`//host/…`), relative (`orders`, `?q`), empty, or already under the base.
 */
export const underPublicBase = <T extends string | undefined | null>(url: T, b: string = base): T => {
    if (!b || typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return url
    if (isUnder(url, b)) return url
    return (b + url) as T
}

/**
 * `path` without the public base (`/crm/orders` → `/orders`), for comparing a browser path with a
 * route the server names; unchanged when it is not under the base.
 */
export const withoutPublicBase = (path: string, b: string = base): string => {
    if (!b || !isUnder(path, b)) return path
    const rest = path.substring(b.length)
    return rest === '' ? '/' : rest.startsWith('/') ? rest : '/' + rest
}
