/**
 * OpenID Connect for a PUBLIC browser client: Authorization Code + PKCE (S256), no client secret.
 * The pieces are pure or take their I/O (`fetch`, `crypto`) as parameters, so they are tested as
 * they are; signInFlow.ts wires them to the page.
 *
 * Mateu does not validate tokens — the server's framework does. What the client checks is what
 * protects the FLOW: the `state` it sent comes back (no login CSRF), the code verifier only it
 * knows redeems the code (PKCE), and the id token's `nonce` is the one it chose (no replay).
 */

export interface OidcDiscovery {
    issuer: string
    authorization_endpoint: string
    token_endpoint: string
    end_session_endpoint?: string
}

export interface OidcTokens {
    accessToken: string
    refreshToken?: string
    idToken?: string
    /** Epoch millis the access token stops being valid, when the IdP said (`expires_in`). */
    expiresAt?: number
}

const base64Url = (bytes: Uint8Array): string => {
    let s = ''
    bytes.forEach((b) => { s += String.fromCharCode(b) })
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** A random URL-safe string from `bytes` random bytes (32 → 43 characters, RFC 7636's minimum). */
export const randomToken = (bytes = 32, cryptoImpl: Crypto = globalThis.crypto): string => {
    const buffer = new Uint8Array(bytes)
    cryptoImpl.getRandomValues(buffer)
    return base64Url(buffer)
}

/** The PKCE S256 challenge of a verifier: base64url(SHA-256(verifier)). */
export const pkceChallenge = async (verifier: string, cryptoImpl: Crypto = globalThis.crypto): Promise<string> =>
    base64Url(new Uint8Array(await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))

/** The discovery document's URL for an issuer (`<issuer>/.well-known/openid-configuration`). */
export const discoveryUrl = (issuer: string): string =>
    issuer.replace(/\/+$/, '') + '/.well-known/openid-configuration'

/**
 * Fetches and checks an issuer's discovery document. It must be the issuer's own (its `issuer`
 * equals the one declared) and name https endpoints — or http ones on a loopback issuer, for a
 * development IdP — or it is refused: an endpoint is where the user's credentials and codes go.
 */
export const fetchDiscovery = async (issuer: string, fetchImpl: typeof fetch = fetch): Promise<OidcDiscovery> => {
    const response = await fetchImpl(discoveryUrl(issuer), { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`discovery answered ${response.status}`)
    const doc = await response.json() as Partial<OidcDiscovery>
    if (!doc || typeof doc.issuer !== 'string' || doc.issuer.replace(/\/+$/, '') !== issuer.replace(/\/+$/, '')) {
        throw new Error('the discovery document belongs to another issuer')
    }
    for (const key of ['authorization_endpoint', 'token_endpoint'] as const) {
        if (!endpointAllowed(doc[key], issuer)) throw new Error(`unusable ${key}`)
    }
    if (doc.end_session_endpoint !== undefined && !endpointAllowed(doc.end_session_endpoint, issuer)) {
        delete doc.end_session_endpoint
    }
    return doc as OidcDiscovery
}

const LOOPBACK = /^(localhost|127(?:\.\d+){3}|\[::1\])$/

/** https, or http when the issuer itself is a loopback http one (a developer's IdP). */
export const endpointAllowed = (url: unknown, issuer: string): boolean => {
    if (typeof url !== 'string') return false
    try {
        const u = new URL(url)
        if (u.protocol === 'https:') return true
        const i = new URL(issuer)
        return u.protocol === 'http:' && i.protocol === 'http:' && LOOPBACK.test(u.hostname) && LOOPBACK.test(i.hostname)
    } catch {
        return false
    }
}

export interface AuthorizeRequest {
    clientId: string
    redirectUri: string
    scopes: string[]
    state: string
    nonce: string
    codeChallenge: string
    audience?: string
}

/** The authorize endpoint URL with the code flow + PKCE parameters (the endpoint's own query kept). */
export const authorizeUrl = (endpoint: string, rq: AuthorizeRequest): string => {
    const url = new URL(endpoint)
    const params: Record<string, string> = {
        response_type: 'code',
        client_id: rq.clientId,
        redirect_uri: rq.redirectUri,
        scope: rq.scopes.join(' '),
        state: rq.state,
        nonce: rq.nonce,
        code_challenge: rq.codeChallenge,
        code_challenge_method: 'S256',
    }
    if (rq.audience) params.audience = rq.audience
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return url.href
}

/** The RP-initiated logout URL (`end_session_endpoint`), or undefined when the IdP has none. */
export const endSessionUrl = (endpoint: string | undefined, options: { idToken?: string, postLogoutRedirectUri: string, clientId: string }): string | undefined => {
    if (!endpoint) return undefined
    const url = new URL(endpoint)
    if (options.idToken) url.searchParams.set('id_token_hint', options.idToken)
    url.searchParams.set('post_logout_redirect_uri', options.postLogoutRedirectUri)
    url.searchParams.set('client_id', options.clientId)
    return url.href
}

const tokensOf = (body: Record<string, unknown>, now: number, previous?: OidcTokens): OidcTokens => {
    const accessToken = body.access_token
    if (typeof accessToken !== 'string' || !accessToken) throw new Error('the token endpoint returned no access token')
    const expiresIn = Number(body.expires_in)
    return {
        accessToken,
        // a refresh answer may omit the refresh token (no rotation): the previous one still works
        refreshToken: typeof body.refresh_token === 'string' ? body.refresh_token : previous?.refreshToken,
        idToken: typeof body.id_token === 'string' ? body.id_token : previous?.idToken,
        ...(Number.isFinite(expiresIn) && expiresIn > 0 ? { expiresAt: now + expiresIn * 1000 } : {}),
    }
}

const postForm = async (endpoint: string, form: Record<string, string>, fetchImpl: typeof fetch): Promise<Record<string, unknown>> => {
    const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams(form).toString(),
    })
    const body = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error + (body.error_description ? ': ' + body.error_description : '') : `token endpoint answered ${response.status}`)
    }
    return body
}

/** Redeems an authorization code (with its PKCE verifier) for tokens. */
export const exchangeCode = async (tokenEndpoint: string, rq: { code: string, codeVerifier: string, clientId: string, redirectUri: string },
                                   fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<OidcTokens> =>
    tokensOf(await postForm(tokenEndpoint, {
        grant_type: 'authorization_code',
        code: rq.code,
        code_verifier: rq.codeVerifier,
        client_id: rq.clientId,
        redirect_uri: rq.redirectUri,
    }, fetchImpl), now)

/** New tokens from a refresh token. */
export const refreshTokens = async (tokenEndpoint: string, rq: { refreshToken: string, clientId: string, scopes?: string[] },
                                    fetchImpl: typeof fetch = fetch, now = Date.now(), previous?: OidcTokens): Promise<OidcTokens> =>
    tokensOf(await postForm(tokenEndpoint, {
        grant_type: 'refresh_token',
        refresh_token: rq.refreshToken,
        client_id: rq.clientId,
        ...(rq.scopes?.length ? { scope: rq.scopes.join(' ') } : {}),
    }, fetchImpl), now, previous ?? { accessToken: '', refreshToken: rq.refreshToken })

/** The claims of a JWT (unverified — only to read the `nonce` the client chose), or {}. */
export const jwtClaims = (jwt: string | undefined): Record<string, unknown> => {
    const part = jwt?.split('.')[1]
    if (!part) return {}
    try {
        const json = atob(part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - part.length % 4) % 4))
        const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0))
        const claims = JSON.parse(new TextDecoder().decode(bytes))
        return claims && typeof claims === 'object' ? claims : {}
    } catch {
        return {}
    }
}

/** True while the token is valid for at least `skewMs` more (no `expiresAt` = assumed valid). */
export const tokenFresh = (expiresAt: number | undefined, now = Date.now(), skewMs = 30_000): boolean =>
    expiresAt === undefined || expiresAt - skewMs > now

/** When to refresh: `leadMs` before expiry, never sooner than `minMs` from now; undefined without expiry. */
export const refreshDelay = (expiresAt: number | undefined, now = Date.now(), leadMs = 60_000, minMs = 5_000): number | undefined =>
    expiresAt === undefined ? undefined : Math.max(minMs, expiresAt - leadMs - now)

/** The query parameters an authorization response adds to the redirect URI. */
export const CALLBACK_PARAMS = ['code', 'state', 'session_state', 'iss', 'error', 'error_description', 'error_uri']

export interface CallbackParams {
    code?: string
    state?: string
    error?: string
    errorDescription?: string
}

/**
 * The authorization response in a URL's query, when it is one: a `state` plus a `code` or an
 * `error`. Whether it is OURS is for the caller to decide (the state must be the pending one).
 */
export const callbackParamsOf = (search: string): CallbackParams | undefined => {
    const q = new URLSearchParams(search)
    const state = q.get('state') ?? undefined
    const code = q.get('code') ?? undefined
    const error = q.get('error') ?? undefined
    if (!state || (!code && !error)) return undefined
    return { state, code, error, errorDescription: q.get('error_description') ?? undefined }
}

/** The URL without the authorization response's parameters (what history.replaceState writes). */
export const withoutCallbackParams = (href: string): string => {
    const url = new URL(href)
    for (const p of CALLBACK_PARAMS) url.searchParams.delete(p)
    return url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash
}
