import { nanoid } from 'nanoid'
import { safeLocalStorage, safeSessionStorage } from '@infra/safeStorage.ts'

/**
 * Where the client reads the Bearer token every request carries, and the per-tab session id.
 *
 * The bootstrap (an OIDC adapter in index.html, a login page, `onSessionExpired`) leaves the token
 * and Mateu reads it on each request. WHERE it lives is a security trade-off, so it is
 * configurable:
 *
 *  - `localStorage` (default, backwards compatible): survives reloads and is shared by the tabs of
 *    the origin. Readable by any script running in the page — an XSS can exfiltrate it.
 *  - `sessionStorage`: per tab, gone when the tab closes. Same XSS exposure while open.
 *  - `memory`: never written to storage; the page must call `setAuthToken` (or register a
 *    `provider`) after every load. Smallest exposure, no persistence.
 *  - `provider`: a function the app supplies (e.g. `() => keycloak.token`) — wins over storage,
 *    so the token can stay inside the OIDC library.
 *
 * Configure with `configureAuthToken({ storage, provider })` before `<mateu-ui>` boots, or
 * declaratively with `<meta name="mateu-auth-token-storage" content="sessionStorage">`.
 * The key is `__mateu_auth_token` (unchanged). Prefer HttpOnly session cookies when the backend
 * can use them: then no token is visible to scripts at all and none of this is needed.
 */

export type AuthTokenStorage = 'localStorage' | 'sessionStorage' | 'memory'

export const AUTH_TOKEN_KEY = '__mateu_auth_token'
export const SESSION_ID_KEY = '__mateu_sesion_id'

let configuredStorage: AuthTokenStorage | undefined
let provider: (() => string | null | undefined) | undefined
let memoryToken: string | null = null

const metaStorage = (): AuthTokenStorage | undefined => {
    try {
        const content = typeof document !== 'undefined'
            ? document.querySelector('meta[name="mateu-auth-token-storage"]')?.getAttribute('content')
            : undefined
        return content === 'localStorage' || content === 'sessionStorage' || content === 'memory' ? content : undefined
    } catch {
        return undefined
    }
}

/** The storage in effect: the configured one, else the `<meta>` declaration, else localStorage. */
export const authTokenStorage = (): AuthTokenStorage => configuredStorage ?? metaStorage() ?? 'localStorage'

export const configureAuthToken = (options: {
    storage?: AuthTokenStorage
    provider?: (() => string | null | undefined) | null
}) => {
    if (options.storage) configuredStorage = options.storage
    if (options.provider !== undefined) provider = options.provider ?? undefined
}

/** The current Bearer token, or null. Never throws. */
export const getAuthToken = (): string | null => {
    if (provider) {
        try {
            const t = provider()
            if (t) return t
        } catch {
            // a provider failure is "no token"
        }
    }
    switch (authTokenStorage()) {
        case 'memory': return memoryToken
        case 'sessionStorage': return safeSessionStorage.get(AUTH_TOKEN_KEY)
        default: return safeLocalStorage.get(AUTH_TOKEN_KEY)
    }
}

/** Stores (or, with null, clears) the token where {@link authTokenStorage} says. */
export const setAuthToken = (token: string | null) => {
    switch (authTokenStorage()) {
        case 'memory':
            memoryToken = token
            return
        case 'sessionStorage':
            if (token) safeSessionStorage.set(AUTH_TOKEN_KEY, token)
            else safeSessionStorage.remove(AUTH_TOKEN_KEY)
            return
        default:
            if (token) safeLocalStorage.set(AUTH_TOKEN_KEY, token)
            else safeLocalStorage.remove(AUTH_TOKEN_KEY)
    }
}

/** `{Authorization: 'Bearer …'}` when there is a token, else `{}`. */
export const authHeaders = (): Record<string, string> => {
    const token = getAuthToken()
    return token ? { Authorization: 'Bearer ' + token } : {}
}

let memorySessionId: string | undefined

/** The per-tab session id sent as X-Session-Id (created on first use; in memory if storage is blocked). */
export const sessionId = (create = true): string | null => {
    const stored = safeSessionStorage.get(SESSION_ID_KEY)
    if (stored) return stored
    if (memorySessionId) return memorySessionId
    if (!create) return null
    const id = nanoid()
    if (!safeSessionStorage.set(SESSION_ID_KEY, id)) memorySessionId = id
    return id
}

/** For tests. */
export const resetAuthTokenConfig = () => {
    configuredStorage = undefined
    provider = undefined
    memoryToken = null
    memorySessionId = undefined
}
