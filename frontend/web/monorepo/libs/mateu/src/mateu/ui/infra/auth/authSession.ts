import { safeLocalStorage, safeSessionStorage, SafeStorage } from '@infra/safeStorage.ts'
import { authTokenStorage, getAuthToken } from '@infra/http/authToken.ts'

/**
 * What the built-in sign-in remembers beside the Bearer token (which stays in authToken.ts, so its
 * storage choice applies): which provider signed the user in, the refresh and id tokens, when the
 * access token expires. Kept in the SAME storage as the token (`memory` keeps it in memory), under
 * `__mateu_auth_session`. A redirect provider's session lives in a cookie the client cannot see;
 * this record is how the client knows one was started.
 *
 * The PENDING sign-in (state, nonce, PKCE verifier, where to come back) must survive the trip to
 * the IdP, so it is in sessionStorage whatever the token storage: per tab, gone with the tab.
 */

export interface AuthSession {
    providerId: string
    kind: 'oidc' | 'redirect'
    issuer?: string
    clientId?: string
    refreshToken?: string
    idToken?: string
    expiresAt?: number
}

export interface PendingSignIn {
    providerId: string
    state: string
    nonce: string
    codeVerifier: string
    redirectUri: string
    returnTo: string
    tokenEndpoint: string
    createdAt: number
}

export const AUTH_SESSION_KEY = '__mateu_auth_session'
export const PENDING_SIGN_IN_KEY = '__mateu_sign_in_pending'
/** A pending sign-in older than this is ignored (an abandoned trip to the IdP). */
export const PENDING_MAX_AGE_MS = 10 * 60_000

let memorySession: AuthSession | null = null

const storage = (): SafeStorage | null => {
    switch (authTokenStorage()) {
        case 'memory': return null
        case 'sessionStorage': return safeSessionStorage
        default: return safeLocalStorage
    }
}

const parse = <T>(raw: string | null): T | null => {
    if (!raw) return null
    try {
        const v = JSON.parse(raw)
        return v && typeof v === 'object' ? v as T : null
    } catch {
        return null
    }
}

export const readAuthSession = (): AuthSession | null => {
    const s = storage()
    return s ? parse<AuthSession>(s.get(AUTH_SESSION_KEY)) : memorySession
}

export const writeAuthSession = (session: AuthSession | null) => {
    const s = storage()
    if (!s) {
        memorySession = session
        return
    }
    if (session) s.set(AUTH_SESSION_KEY, JSON.stringify(session))
    else s.remove(AUTH_SESSION_KEY)
}

/**
 * Whether the built-in sign-in holds a session: an oidc one with its token still there, or a
 * redirect one (the framework's cookie). What shows the "Sign out" button.
 */
export const hasBuiltInSession = (): boolean => {
    const session = readAuthSession()
    if (!session) return false
    return session.kind === 'redirect' || !!getAuthToken()
}

export const readPendingSignIn = (now = Date.now()): PendingSignIn | null => {
    const pending = parse<PendingSignIn>(safeSessionStorage.get(PENDING_SIGN_IN_KEY))
    return pending && now - (pending.createdAt ?? 0) <= PENDING_MAX_AGE_MS ? pending : null
}

export const writePendingSignIn = (pending: PendingSignIn | null) => {
    if (pending) safeSessionStorage.set(PENDING_SIGN_IN_KEY, JSON.stringify(pending))
    else safeSessionStorage.remove(PENDING_SIGN_IN_KEY)
}

/** For tests. */
export const resetAuthSessionMemory = () => {
    memorySession = null
}
