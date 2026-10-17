import { authHeaders, sessionId } from '@infra/http/authToken.ts'
/**
 * WHERE the client may send the user's credentials — the Bearer token, the `X-Session-Id` and the
 * `@AppContext` values. Without this they went to EVERY Mateu request whatever its origin: a
 * federated remote received them, and so did any remote a remote named in its own menu, or a
 * `<mateu-ux baseurl=…>` a record value managed to put on the page.
 *
 * Two kinds of trusted origins:
 *
 *  - ROOT: the page's own origin, the base url of the top-level `<mateu-ui>` (written by the host
 *    page, never by data), and what the host configured: `<meta name="mateu-credential-origins"
 *    content="https://a.example, https://b.example">` or {@link configureCredentialOrigins}.
 *  - DECLARED: a remote an app served from a ROOT origin names (a `RemoteMenu`). The app's author
 *    chose it, exactly as the server-side `mateu.remote.allowed-hosts` does for its own leg.
 *
 * A declared remote cannot extend the trust: the remotes IT names get no credentials unless the
 * host configured them. Everything else is called anonymously (it still works for a public remote).
 */

const rootOrigins = new Set<string>()
const declaredOrigins = new Set<string>()
let metaRead = false

const pageHref = (): string | undefined =>
    typeof window !== 'undefined' && window.location ? window.location.href : undefined

/** The origin of `url` resolved against the page, or undefined when it is not http(s). */
export const originOf = (url: string | undefined | null): string | undefined => {
    if (url === undefined || url === null) return undefined
    try {
        const base = pageHref()
        const parsed = base ? new URL(url, base) : new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : undefined
    } catch {
        return undefined
    }
}

const readMeta = () => {
    if (metaRead || typeof document === 'undefined') return
    metaRead = true
    const content = document.querySelector('meta[name="mateu-credential-origins"]')?.getAttribute('content')
    content?.split(',').map(s => s.trim()).filter(Boolean).forEach(o => {
        const origin = originOf(o)
        if (origin) rootOrigins.add(origin)
    })
}

/** Origins the HOST trusts with the user's credentials, beyond its own (a federated remote, an API). */
export const configureCredentialOrigins = (origins: string[]): void => {
    origins.forEach(o => {
        const origin = originOf(o)
        if (origin) rootOrigins.add(origin)
    })
}

/** The top-level `<mateu-ui>`'s base url: the host page wrote it, so its origin is ROOT. */
export const trustRootBaseUrl = (baseUrl: string | undefined): void => {
    const origin = originOf(baseUrl || '/')
    if (origin) rootOrigins.add(origin)
}

const isRoot = (origin: string): boolean => {
    readMeta()
    const page = originOf(pageHref() ?? null)
    return origin === page || rootOrigins.has(origin)
}

/**
 * Remotes an app answered from `declarerBaseUrl` names. Trusted only when the declarer is ROOT
 * (the page's own server, the host's configured origins): a remote cannot hand out credentials.
 */
export const trustDeclaredRemotes = (declarerBaseUrl: string | undefined, remoteBaseUrls: (string | undefined)[]): void => {
    const declarer = originOf(declarerBaseUrl || '/')
    if (!declarer || !isRoot(declarer)) return
    remoteBaseUrls.forEach(url => {
        const origin = originOf(url)
        if (origin) declaredOrigins.add(origin)
    })
}

/** True when a request to `url` may carry the user's credentials. */
export const mayCarryCredentials = (url: string | undefined): boolean => {
    const origin = originOf(url ?? '')
    if (!origin) return false
    return isRoot(origin) || declaredOrigins.has(origin)
}

/** Tests only: forgets every trusted origin. */
export const resetCredentialScope = (): void => {
    rootOrigins.clear()
    declaredOrigins.clear()
    metaRead = false
}

/**
 * The credential headers (`Authorization`, `X-Session-Id`) for a bare `fetch` to `url` — the SSE
 * stream, the live-updates stream, the chat — or none when `url` is not trusted with them. The
 * axios interceptor applies the same rule to every ordinary request.
 */
export const credentialHeadersFor = (url: string): Record<string, string> => {
    if (!mayCarryCredentials(url)) return {}
    const headers: Record<string, string> = { ...authHeaders() }
    const sid = sessionId(false)
    if (sid) headers['X-Session-Id'] = sid
    return headers
}
