import { nanoid } from 'nanoid'
import { safeLocalStorage, safeSessionStorage, SafeStorage } from '@infra/safeStorage.ts'
import { authTokenStorage, getAuthToken } from '@infra/http/authToken.ts'

/**
 * What the built-in sign-in remembers beside the Bearer token (which stays in authToken.ts, so its
 * storage choice applies): which provider signed the user in, the refresh and id tokens, when the
 * access token expires. A redirect provider's session lives in a cookie the client cannot see;
 * this record is how the client knows one was started.
 *
 * The record NEVER goes into the token cookie: a cookie travels with every request to its path,
 * and the refresh + id tokens beside the access token would exceed the ~4 KB a cookie holds. It is
 * split in two:
 *
 *  - the DESCRIPTOR (provider, kind, issuer, client id, expiry — nothing secret), under
 *    `__mateu_auth_session`: with the default cookie storage it is in localStorage, so every tab
 *    that shares the cookie also knows a built-in session is there (its "Sign out" button, the
 *    token's expiry);
 *  - the SECRETS (refresh and id tokens), under `__mateu_auth_session_secrets`: with the default
 *    cookie storage in sessionStorage — per tab, gone with the tab. Another tab that shares the
 *    cookie cannot refresh it; when it expires there that tab signs in again.
 *
 * With `localStorage` / `sessionStorage` configured both halves live in that storage; with `memory`
 * in memory. The two halves carry the same random `key`: secrets left by a previous sign-in (another
 * user in another tab) never merge into the current descriptor.
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
export const AUTH_SESSION_SECRETS_KEY = '__mateu_auth_session_secrets'
export const PENDING_SIGN_IN_KEY = '__mateu_sign_in_pending'
/** A pending sign-in older than this is ignored (an abandoned trip to the IdP). */
export const PENDING_MAX_AGE_MS = 10 * 60_000

type Descriptor = Omit<AuthSession, 'refreshToken' | 'idToken'> & { key?: string }
type Secrets = { key?: string, refreshToken?: string, idToken?: string }

let memoryDescriptor: Descriptor | null = null
let memorySecrets: Secrets | null = null

/** Where each half lives; null = memory. */
const stores = (): { descriptor: SafeStorage | null, secrets: SafeStorage | null } => {
    switch (authTokenStorage()) {
        case 'memory': return { descriptor: null, secrets: null }
        case 'sessionStorage': return { descriptor: safeSessionStorage, secrets: safeSessionStorage }
        case 'localStorage': return { descriptor: safeLocalStorage, secrets: safeLocalStorage }
        default: return { descriptor: safeLocalStorage, secrets: safeSessionStorage }
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
    const s = stores()
    const descriptor = s.descriptor ? parse<Descriptor>(s.descriptor.get(AUTH_SESSION_KEY)) : memoryDescriptor
    if (!descriptor) return null
    const secrets = s.secrets ? parse<Secrets>(s.secrets.get(AUTH_SESSION_SECRETS_KEY)) : memorySecrets
    const { key, ...session } = descriptor
    const mine = secrets && secrets.key === key
    return {
        ...session,
        ...(mine && secrets.refreshToken ? { refreshToken: secrets.refreshToken } : {}),
        ...(mine && secrets.idToken ? { idToken: secrets.idToken } : {}),
    }
}

export const writeAuthSession = (session: AuthSession | null) => {
    const s = stores()
    if (!session) {
        // whatever the storage is now, nothing of a session survives a sign-out
        for (const store of [safeLocalStorage, safeSessionStorage]) {
            store.remove(AUTH_SESSION_KEY)
            store.remove(AUTH_SESSION_SECRETS_KEY)
        }
        memoryDescriptor = null
        memorySecrets = null
        return
    }
    const { refreshToken, idToken, ...rest } = session
    const key = nanoid()
    const descriptor: Descriptor = { ...rest, key }
    const secrets: Secrets | null = refreshToken || idToken ? { key, refreshToken, idToken } : null
    if (s.descriptor) s.descriptor.set(AUTH_SESSION_KEY, JSON.stringify(descriptor))
    else memoryDescriptor = descriptor
    if (s.secrets) {
        if (secrets) s.secrets.set(AUTH_SESSION_SECRETS_KEY, JSON.stringify(secrets))
        else s.secrets.remove(AUTH_SESSION_SECRETS_KEY)
    } else memorySecrets = secrets
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
    memoryDescriptor = null
    memorySecrets = null
}
