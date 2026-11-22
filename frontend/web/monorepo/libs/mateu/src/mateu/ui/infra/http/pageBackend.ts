// Where the backend is when the renderer's page is served by a CDN or a static host.
//
// A page a Mateu backend serves writes `<mateu-ui baseUrl="…">` itself (IndexPage, UiPage,
// ui_page). The renderer jars also ship a DEPLOYABLE `index.html`, which has no backend to write it:
// its `<mateu-ui>` carries no baseUrl, and the backend is read from ONE place outside the compiled
// bundle:
//
//   <meta name="mateu-backend" content="https://api.example.com">
//
// Empty or absent = the page's own origin, the recommended setup: the host proxies `/mateu/*` to the
// backend, so the browser sees one origin (no CORS, cookies work). The Redwood renderer reads the
// same tag (apps/redwood/poc/mount.mjs `pageBackendOf`) — keep the two rules identical.

/** The meta tag's name. */
export const PAGE_BACKEND_META = 'mateu-backend'

/**
 * The backend the page names: '' (same origin) or an http(s) URL / a root-relative path, without
 * trailing slashes. Anything else (a `javascript:` URL, a relative path, garbage) is ignored with a
 * warning: the value becomes the base of every API call and of the credentials scope.
 */
export function pageBackendOf(doc: Pick<Document, 'querySelector'> | null | undefined): string {
    const el = doc && typeof doc.querySelector === 'function'
        ? doc.querySelector(`meta[name="${PAGE_BACKEND_META}"]`)
        : null
    return normalizePageBackend(el ? el.getAttribute('content') : null)
}

/** The rule of {@link pageBackendOf} over the raw value. */
export function normalizePageBackend(raw: string | null | undefined): string {
    let v = String(raw == null ? '' : raw).trim()
    if (!v) return ''
    let end = v.length
    while (end > 0 && v.charCodeAt(end - 1) === 47) end--
    v = v.slice(0, end)
    if (!v) return ''
    if (/^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/i.test(v)) return v
    if (v.charAt(0) === '/' && v.charAt(1) !== '/' && v.charAt(1) !== '\\' && !/[\s?#]/.test(v)) return v
    console.warn(`mateu: ignoring <meta name="${PAGE_BACKEND_META}" content="${raw}">: expected an http(s) URL or a path`)
    return ''
}

/**
 * The baseUrl a `<mateu-ui>` uses: the one its page wrote (attribute or property) wins; only an
 * element whose page wrote none takes the meta tag.
 */
export function effectiveBaseUrl(
    el: { hasAttribute(name: string): boolean; baseUrl?: string | null },
    doc: Pick<Document, 'querySelector'> | null | undefined,
): string {
    const written = el.baseUrl == null ? '' : String(el.baseUrl)
    if (written || el.hasAttribute('baseurl') || el.hasAttribute('baseUrl')) return written
    return pageBackendOf(doc)
}
