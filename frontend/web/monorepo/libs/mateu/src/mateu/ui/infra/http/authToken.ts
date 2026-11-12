import { nanoid } from 'nanoid'
import { safeLocalStorage, safeSessionStorage } from '@infra/safeStorage.ts'
import { clearStructureCache } from '@infra/routeStructureCache.ts'
import { clearTokenCookie, CookieJar, cookiePathOf, cookiePathsToClear, cookieValue, documentCookieJar,
    writeTokenCookie } from '@infra/http/tokenCookie.ts'

/**
 * Where the client reads the Bearer token every request carries, and the per-tab session id.
 *
 * The bootstrap (the built-in sign-in, an OIDC adapter in index.html, a login page,
 * `onSessionExpired`) leaves the token and Mateu reads it on each request. WHERE it lives is a
 * security trade-off, so it is configurable:
 *
 *  - `cookie` (default): a cookie `__mateu_auth_token` written by the client (tokenCookie.ts):
 *    `Path` = the mount, `SameSite=Strict`, `Secure` on https, no Domain, `Max-Age` = the token's
 *    life when known (else a session cookie). Shared by the tabs of the mount. It is still the
 *    CLIENT's store: requests carry `Authorization: Bearer`, servers read the header, not the
 *    cookie. A script-written cookie cannot be HttpOnly, so an XSS can read it like localStorage.
 *  - `localStorage`: survives reloads and is shared by the tabs of the origin.
 *  - `sessionStorage`: per tab, gone when the tab closes.
 *  - `memory`: never written anywhere; the page must call `setAuthToken` (or register a
 *    `provider`) after every load. Smallest exposure, no persistence.
 *  - `provider`: a function the app supplies (e.g. `() => keycloak.token`) — replaces storage
 *    while configured (an empty answer is "no token", the storage is not consulted), so the token
 *    can stay inside the OIDC library.
 *
 * Writing never loses the token: when the cookie cannot take it (cookies disabled, the write does
 * not read back, or the token is too big for a cookie) it goes to sessionStorage, else to memory.
 * Reading looks in the cookie, then the configured storage, then sessionStorage and localStorage
 * (a fallback write, or a token an older version left), then memory. Writing a token, or clearing
 * it, removes it from every other place, so a stale copy never shadows the current one.
 *
 * Configure with `configureAuthToken({ storage, provider, cookiePath })` before `<mateu-ui>` boots,
 * or declaratively with `<meta name="mateu-auth-token-storage" content="sessionStorage">`.
 * `<mateu-ui>` scopes the cookie to its mount ({@link useMountForTokenCookie}) unless configured.
 * HttpOnly framework sessions (a `redirect` sign-in provider) keep no token in the page at all.
 * Same policy as the Redwood renderer (apps/redwood/poc/authStore.mjs).
 */

export type AuthTokenStorage = 'cookie' | 'localStorage' | 'sessionStorage' | 'memory'

export const AUTH_TOKEN_KEY = '__mateu_auth_token'
export const SESSION_ID_KEY = '__mateu_sesion_id'

const STORAGES: AuthTokenStorage[] = ['cookie', 'localStorage', 'sessionStorage', 'memory']

let configuredStorage: AuthTokenStorage | undefined
let provider: (() => string | null | undefined) | undefined
let memoryToken: string | null = null
let configuredCookiePath: string | undefined
let mountCookiePath: string | undefined
let cookieJar: CookieJar = documentCookieJar
const writtenPaths = new Set<string>()

const metaStorage = (): AuthTokenStorage | undefined => {
    try {
        const content = typeof document !== 'undefined'
            ? document.querySelector('meta[name="mateu-auth-token-storage"]')?.getAttribute('content')
            : undefined
        return STORAGES.includes(content as AuthTokenStorage) ? content as AuthTokenStorage : undefined
    } catch {
        return undefined
    }
}

/** The storage in effect: the configured one, else the `<meta>` declaration, else the cookie. */
export const authTokenStorage = (): AuthTokenStorage => configuredStorage ?? metaStorage() ?? 'cookie'

/** The Path the token cookie is written with: configured > the mount's > `/`. */
export const tokenCookiePath = (): string => configuredCookiePath ?? mountCookiePath ?? '/'

const currentHref = (): string => {
    try {
        if (typeof location !== 'undefined' && location.href) return location.href
    } catch { /* no location */ }
    return 'http://localhost/'
}

/** `<mateu-ui>` calls this with its base url: the cookie is scoped to the mount (first call wins). */
export const useMountForTokenCookie = (baseUrl: string | undefined) => {
    if (mountCookiePath !== undefined) return
    mountCookiePath = cookiePathOf(baseUrl, currentHref())
}

type Location = AuthTokenStorage

const cookieToken = (): string | null => {
    try {
        return cookieValue(cookieJar.read(), AUTH_TOKEN_KEY)
    } catch {
        return null
    }
}

/** Where the token is now, in read order (see the module doc), and the token. */
const locate = (): { at: Location, token: string } | null => {
    if (authTokenStorage() === 'memory') return memoryToken ? { at: 'memory', token: memoryToken } : null
    const cookie = cookieToken()
    if (cookie) return { at: 'cookie', token: cookie }
    const order: Location[] = authTokenStorage() === 'localStorage'
        ? ['localStorage', 'sessionStorage'] : ['sessionStorage', 'localStorage']
    for (const at of order) {
        const token = (at === 'localStorage' ? safeLocalStorage : safeSessionStorage).get(AUTH_TOKEN_KEY)
        if (token) return { at, token }
    }
    return memoryToken ? { at: 'memory', token: memoryToken } : null
}

/**
 * Whether every tab of this origin acts as the same user. True when the token lives in a cookie or
 * in `localStorage` (or would, once written); with a token in `sessionStorage`, in memory or behind
 * a provider each tab holds its own identity, so nothing about the user may pass between tabs.
 */
export const tabsShareIdentity = (): boolean => {
    if (provider) return false
    const found = locate()
    if (found) return found.at === 'cookie' || found.at === 'localStorage'
    const storage = authTokenStorage()
    return storage === 'cookie' || storage === 'localStorage'
}

/** Whether the app supplies the token itself (`configureAuthToken({ provider })`): then it owns sign-in too. */
export const hasAuthTokenProvider = (): boolean => !!provider

export const configureAuthToken = (options: {
    storage?: AuthTokenStorage
    provider?: (() => string | null | undefined) | null
    /** The token cookie's Path (default: the mount `<mateu-ui>` is served at, else `/`). */
    cookiePath?: string
}) => {
    if (options.storage) configuredStorage = options.storage
    if (options.provider !== undefined) provider = options.provider ?? undefined
    if (options.cookiePath) configuredCookiePath = options.cookiePath
}

/**
 * The current Bearer token, or null. Never throws.
 *
 * A configured `provider` is AUTHORITATIVE: what it answers is the token, and an empty answer
 * (null, undefined, '') or a failure means "no session" — never "ask the storage instead". The
 * storage may still hold a previous user's token (a logout through the OIDC library never knew
 * about Mateu's key), and reviving it would send requests as somebody who signed out.
 */
export const getAuthToken = (): string | null => {
    if (provider) {
        try {
            return provider() || null
        } catch {
            // a provider failure is "no token"
            return null
        }
    }
    return locate()?.token ?? null
}

const clearEverywhere = (except?: Location) => {
    if (except !== 'cookie') {
        let pathname = '/'
        try {
            if (typeof location !== 'undefined' && location.pathname) pathname = location.pathname
        } catch { /* the root only */ }
        try {
            clearTokenCookie(AUTH_TOKEN_KEY, cookiePathsToClear([tokenCookiePath(), ...writtenPaths], pathname), cookieJar)
        } catch { /* no cookies here */ }
        writtenPaths.clear()
    }
    if (except !== 'localStorage') safeLocalStorage.remove(AUTH_TOKEN_KEY)
    if (except !== 'sessionStorage') safeSessionStorage.remove(AUTH_TOKEN_KEY)
    if (except !== 'memory') memoryToken = null
}

const writeTo = (at: Location, token: string, expiresAt?: number): boolean => {
    switch (at) {
        case 'cookie': {
            const path = tokenCookiePath()
            let ok = false
            try {
                ok = writeTokenCookie(AUTH_TOKEN_KEY, token, { path, expiresAt }, cookieJar)
            } catch { /* not stored: the next place takes it */ }
            if (ok) writtenPaths.add(path)
            return ok
        }
        case 'localStorage': return safeLocalStorage.set(AUTH_TOKEN_KEY, token)
        case 'sessionStorage': return safeSessionStorage.set(AUTH_TOKEN_KEY, token)
        default:
            memoryToken = token
            return true
    }
}

/** Where the token is now (`cookie`, a storage, `memory`), or null; for diagnostics and tests. */
export const authTokenLocation = (): Location | null => locate()?.at ?? null

/**
 * Stores (or, with null, clears everywhere) the token where {@link authTokenStorage} says.
 * `expiresAt` (ms) sizes the cookie's life; without it the token's own `exp` does, if it is a JWT.
 * A store that cannot take the token hands it on (cookie → sessionStorage → memory; a web storage
 * → memory), and the token is removed from every other place.
 */
export const setAuthToken = (token: string | null, options: { expiresAt?: number } = {}) => {
    // another identity (or none) may be shown another structure: drop what the previous one cached
    if (token !== getAuthToken()) clearStructureCache()
    if (!token) {
        clearEverywhere()
        return
    }
    const storage = authTokenStorage()
    const chain: Location[] = storage === 'memory' ? ['memory']
        : storage === 'cookie' ? ['cookie', 'sessionStorage', 'memory']
            : [storage, 'memory']
    for (const at of chain) {
        if (writeTo(at, token, options.expiresAt)) {
            clearEverywhere(at)
            return
        }
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
    configuredCookiePath = undefined
    mountCookiePath = undefined
    cookieJar = documentCookieJar
    writtenPaths.clear()
}

/** For tests: where cookies are read and written (null = the document's). */
export const setTokenCookieJar = (jar: CookieJar | null) => {
    cookieJar = jar ?? documentCookieJar
}
