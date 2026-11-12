import { underPublicBase } from '@infra/http/publicBase.ts'
/**
 * The ONE way the client follows a URL that came from the server (a `NavigateTo` command, an
 * action's `href`, a breadcrumb, a peer-navigation arrow, a URL field's "open" icon).
 *
 * Those URLs are data. Assigning one to `location.href` unchecked runs a `javascript:` URL in the
 * page's origin, and `window.open` without `noopener` hands the opened page a `window.opener` it
 * can redirect. So:
 *
 *  - only `http:`, `https:` and relative URLs are followed — anything else (`javascript:`, `data:`,
 *    `vbscript:`, `file:`…) is refused and logged;
 *  - a same-origin URL navigates the CURRENT tab (it is part of this app);
 *  - a cross-origin URL opens in a new tab with `noopener,noreferrer`.
 */

export interface SafeUrl {
    href: string
    sameOrigin: boolean
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

const currentHref = (): string | undefined =>
    typeof window !== 'undefined' && window.location ? window.location.href : undefined

/**
 * Resolves a server-sent URL against the page, or `undefined` when it must not be followed.
 * Browsers strip ASCII tabs/newlines and leading control characters/spaces before reading the
 * scheme (`java\tscript:` IS `javascript:`), and so does the WHATWG URL parser used here, so
 * those tricks resolve to the real protocol and are refused like it.
 */
export const resolveSafeUrl = (url: unknown, base: string | undefined = currentHref()): SafeUrl | undefined => {
    if (typeof url !== 'string' || url.trim() === '') return undefined
    let parsed: URL
    try {
        parsed = base ? new URL(url, base) : new URL(url)
    } catch {
        return undefined
    }
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return undefined
    let sameOrigin = false
    try {
        sameOrigin = !!base && new URL(base).origin === parsed.origin
    } catch {
        sameOrigin = false
    }
    return { href: parsed.href, sameOrigin }
}

/** True for a URL {@link safeNavigate} would follow. */
export const isSafeUrl = (url: unknown, base?: string): boolean =>
    resolveSafeUrl(url, base ?? currentHref()) !== undefined

const refuse = (url: unknown) => {
    // eslint-disable-next-line no-console
    console.warn('mateu: refused to navigate to a URL that is not http(s) or relative:', url)
}

/**
 * Follows a server-sent URL safely: same-origin in the current tab, cross-origin in a new tab
 * (`noopener,noreferrer`). Pass `newTab: true` to always open a new tab (e.g. an "open link" icon).
 * Returns false when the URL was refused.
 */
export const safeNavigate = (url: unknown, options: { newTab?: boolean } = {}): boolean => {
    // mailto:/tel: — what the same value as an <a href> opens (safeHref): the mail or phone app,
    // the page stays. A row click used to refuse what the row's own link opened.
    const contact = contactHref(url)
    if (contact) {
        window.location.assign(contact)
        return true
    }
    // a root-relative path the server named (`/orders/3`) is under the app's public base
    // (a context path, a prefix-stripping proxy — publicBase.ts)
    const safe = resolveSafeUrl(typeof url === 'string' ? underPublicBase(url) : url)
    if (!safe) {
        refuse(url)
        return false
    }
    if (safe.sameOrigin && !options.newTab) {
        window.location.assign(safe.href)
    } else {
        window.open(safe.href, '_blank', 'noopener,noreferrer')
    }
    return true
}

const HREF_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])

/** A `mailto:` / `tel:` URL (as safeHref reads it), else undefined. */
const contactHref = (url: unknown): string | undefined => {
    const href = typeof url === 'string' ? safeHref(url) : undefined
    return href && /^(mailto|tel):/i.test(href) ? href : undefined
}

/**
 * The value to put in an `<a href>` built from server data, or `undefined` when it must not be a
 * link. Relative URLs and `http(s):`/`mailto:`/`tel:` pass; `javascript:`, `vbscript:` and the like
 * never do (browsers ignore tabs/newlines and leading control characters when reading a scheme, so
 * those are stripped before checking). `allowData` admits `data:` URLs — for download links of a
 * value the client itself holds (a file field's data URI).
 */
export const safeHref = (url: unknown, options: { allowData?: boolean } = {}): string | undefined => {
    if (url === undefined || url === null) return undefined
    // eslint-disable-next-line no-control-regex
    const cleaned = String(url).replace(/[\t\n\r]/g, '').replace(/^[\u0000- ]+/, '').trimEnd()
    if (cleaned === '') return undefined
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned)?.[1]?.toLowerCase()
    if (!scheme) return cleaned
    if (HREF_SCHEMES.has(scheme)) return cleaned
    if (scheme === 'data' && options.allowData) return cleaned
    return undefined
}
