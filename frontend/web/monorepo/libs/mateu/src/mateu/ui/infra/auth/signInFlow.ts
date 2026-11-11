import { getAuthToken, setAuthToken } from '@infra/http/authToken.ts'
import type { SessionExpiredContext } from '@infra/http/sessionGuard.ts'
import { resolveSafeUrl } from '@infra/ui/safeNavigate.ts'
import { safeSessionStorage } from '@infra/safeStorage.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import {
    AuthSession, readAuthSession, readPendingSignIn, writeAuthSession, writePendingSignIn,
} from './authSession.ts'
import {
    authorizeUrl, callbackParamsOf, endSessionUrl, exchangeCode, fetchDiscovery, jwtClaims, OidcDiscovery,
    pkceChallenge, randomToken, refreshDelay, refreshTokens, tokenFresh, withoutCallbackParams,
} from './oidc.ts'
import {
    oidcRedirectUri, redirectProviderUrl, SignInConfig, SignInProvider, signInPlan, signInRequiredAtBoot,
} from './signInConfig.ts'

/**
 * The built-in sign-in, loaded only when the page declares providers (signIn.ts imports it on
 * demand, so a page without `<meta name="mateu-auth">` never downloads it).
 *
 *  - boot: an OIDC callback on the URL is completed first (code → tokens, the URL cleaned and put
 *    back on the route the user was on); then, with `loginOnStart` and no session, one provider is
 *    followed straight away and several are offered in the chooser;
 *  - a 401 nobody else handled: refresh (oidc) and retry; else sign in again;
 *  - the access token is refreshed a minute before it expires;
 *  - sign-out: end_session at the IdP (oidc) or the framework's `logoutUrl` (redirect).
 */

/** The page's side effects, swappable in tests. */
export interface SignInEnv {
    href: () => string
    assign: (url: string) => void
    replaceUrl: (url: string) => void
    fetch: typeof fetch
    crypto: Crypto
    now: () => number
    choose: (options: ChooserOptions) => Promise<SignInProvider | null>
}

export interface ChooserOptions {
    providers: SignInProvider[]
    /** A sentence on top: why the user is asked (the last attempt failed…). */
    message?: string
    /** After a 401 the user may decline (the request then fails); at boot there is nothing behind. */
    cancellable: boolean
}

const defaultEnv = (): SignInEnv => ({
    href: () => window.location.href,
    assign: (url) => window.location.assign(url),
    replaceUrl: (url) => window.history.replaceState(window.history.state, '', url),
    fetch: (...args) => fetch(...args),
    crypto: globalThis.crypto,
    now: () => Date.now(),
    choose: async (options) => (await import('./mateu-sign-in.ts')).showSignInChooser(options),
})

let env: SignInEnv | undefined
const e = (): SignInEnv => env ?? (env = defaultEnv())

/** For tests: replace (part of) the page's side effects. */
export const setSignInEnv = (overrides: Partial<SignInEnv> | undefined) => {
    env = overrides ? { ...defaultEnv(), ...overrides } : undefined
}

const DISCOVERY_PREFIX = '__mateu_oidc_discovery:'
const discoveries = new Map<string, Promise<OidcDiscovery>>()

/** The issuer's discovery document, fetched once per tab (kept in sessionStorage). */
export const discover = (issuer: string): Promise<OidcDiscovery> => {
    const cached = discoveries.get(issuer)
    if (cached) return cached
    const stored = safeSessionStorage.get(DISCOVERY_PREFIX + issuer)
    if (stored) {
        try {
            const doc = Promise.resolve(JSON.parse(stored) as OidcDiscovery)
            discoveries.set(issuer, doc)
            return doc
        } catch { /* refetch */ }
    }
    const promise = fetchDiscovery(issuer, e().fetch).then((doc) => {
        safeSessionStorage.set(DISCOVERY_PREFIX + issuer, JSON.stringify(doc))
        return doc
    })
    promise.catch(() => discoveries.delete(issuer))
    discoveries.set(issuer, promise)
    return promise
}

/** Follows a URL the sign-in produced: http(s) only (an IdP lives on another origin, same tab). */
const go = (url: string | undefined): boolean => {
    const safe = resolveSafeUrl(url, e().href())
    if (!safe) {
        // eslint-disable-next-line no-console
        console.warn('mateu: refused a sign-in URL that is not http(s):', url)
        return false
    }
    e().assign(safe.href)
    return true
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined

const scheduleRefresh = (config: SignInConfig) => {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = undefined
    const session = readAuthSession()
    if (session?.kind !== 'oidc' || !session.refreshToken) return
    const delay = refreshDelay(session.expiresAt, e().now())
    if (delay === undefined) return
    refreshTimer = setTimeout(() => { void refresh(config).catch(() => undefined) }, delay)
}

const providerOf = (config: SignInConfig, id: string | undefined) => config.providers.find((p) => p.id === id)

const store = (provider: SignInProvider, tokens: { accessToken: string, refreshToken?: string, idToken?: string, expiresAt?: number }) => {
    setAuthToken(tokens.accessToken)
    writeAuthSession({
        providerId: provider.id, kind: 'oidc', issuer: provider.issuer, clientId: provider.clientId,
        refreshToken: tokens.refreshToken, idToken: tokens.idToken, expiresAt: tokens.expiresAt,
    })
}

let refreshing: Promise<boolean> | undefined

/** Renews the access token with the refresh token. One at a time; true when a new token is stored. */
export const refresh = (config: SignInConfig): Promise<boolean> => {
    if (refreshing) return refreshing
    refreshing = (async () => {
        const session = readAuthSession()
        const provider = providerOf(config, session?.providerId)
        if (session?.kind !== 'oidc' || !session.refreshToken || !provider?.issuer || !provider.clientId) return false
        try {
            const discovery = await discover(provider.issuer)
            const tokens = await refreshTokens(discovery.token_endpoint,
                { refreshToken: session.refreshToken, clientId: provider.clientId }, e().fetch, e().now(),
                { accessToken: '', refreshToken: session.refreshToken, idToken: session.idToken })
            store(provider, tokens)
            scheduleRefresh(config)
            return true
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('mateu: the token could not be refreshed', error)
            return false
        }
    })().finally(() => { refreshing = undefined })
    return refreshing
}

/** Sends the browser to a provider. Resolves false when it could not (then the chooser says so). */
export const startSignIn = async (provider: SignInProvider, baseUrl: string, returnTo = e().href()): Promise<boolean> => {
    if (provider.type === 'redirect') {
        const target = redirectProviderUrl(provider, returnTo)
        if (!target) return false
        writeAuthSession({ providerId: provider.id, kind: 'redirect' })
        return go(target)
    }
    try {
        const discovery = await discover(provider.issuer!)
        const codeVerifier = randomToken(32, e().crypto)
        const state = randomToken(16, e().crypto)
        const nonce = randomToken(16, e().crypto)
        const redirectUri = oidcRedirectUri(baseUrl, e().href())
        writePendingSignIn({
            providerId: provider.id, state, nonce, codeVerifier, redirectUri, returnTo,
            tokenEndpoint: discovery.token_endpoint, createdAt: e().now(),
        })
        return go(authorizeUrl(discovery.authorization_endpoint, {
            clientId: provider.clientId!, redirectUri, scopes: provider.scopes, state, nonce,
            codeChallenge: await pkceChallenge(codeVerifier, e().crypto), audience: provider.audience,
        }))
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`mateu: sign-in with ${provider.id} could not start`, error)
        return false
    }
}

export type CallbackOutcome = 'none' | 'signed-in' | 'failed'

/**
 * Completes an OIDC callback on the current URL, when it is OURS (its `state` is the pending
 * sign-in's). Someone else's `code`/`state` (an app route that uses them) is left alone.
 */
export const completeCallback = async (config: SignInConfig): Promise<CallbackOutcome> => {
    const params = callbackParamsOf(new URL(e().href()).search)
    if (!params) return 'none'
    const pending = readPendingSignIn(e().now())
    if (!pending || pending.state !== params.state) return 'none'
    writePendingSignIn(null)
    const provider = providerOf(config, pending.providerId)
    const back = (target: string) => {
        const resolved = resolveSafeUrl(target, e().href())
        e().replaceUrl(resolved?.sameOrigin ? withoutCallbackParams(resolved.href) : withoutCallbackParams(e().href()))
    }
    if (params.error || !params.code || !provider?.clientId) {
        // eslint-disable-next-line no-console
        console.warn('mateu: sign-in failed', params.error, params.errorDescription ?? '')
        back(e().href())
        return 'failed'
    }
    try {
        const tokens = await exchangeCode(pending.tokenEndpoint, {
            code: params.code, codeVerifier: pending.codeVerifier, clientId: provider.clientId, redirectUri: pending.redirectUri,
        }, e().fetch, e().now())
        if (tokens.idToken && jwtClaims(tokens.idToken).nonce !== pending.nonce) throw new Error('the id token carries another nonce')
        store(provider, tokens)
        scheduleRefresh(config)
        back(pending.returnTo)
        return 'signed-in'
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('mateu: the authorization code could not be redeemed', error)
        back(e().href())
        return 'failed'
    }
}

/** Whether a session is there to use: a fresh token (refreshed first when expired), or a redirect one. */
const usableSession = async (config: SignInConfig): Promise<boolean> => {
    const session: AuthSession | null = readAuthSession()
    if (session?.kind === 'redirect') return true
    if (!getAuthToken()) return false
    if (session?.kind === 'oidc' && !tokenFresh(session.expiresAt, e().now())) {
        if (await refresh(config)) return true
        setAuthToken(null)
        writeAuthSession(null)
        return false
    }
    scheduleRefresh(config)
    return true
}

/** The chooser, then the chosen provider; asks again when a provider could not start. */
const chooseAndStart = async (baseUrl: string, options: ChooserOptions, returnTo?: string): Promise<boolean> => {
    let message = options.message
    for (;;) {
        const chosen = await e().choose({ ...options, message })
        if (!chosen) return false
        if (await startSignIn(chosen, baseUrl, returnTo)) return true
        message = chromeText('signInFailed')
    }
}

/**
 * Boot: resolves true when the app may load now; false while the user signs in (the page is
 * leaving for a provider, or the chooser is on screen).
 */
export const bootSignIn = async (config: SignInConfig, baseUrl: string): Promise<boolean> => {
    const outcome = await completeCallback(config)
    if (outcome === 'signed-in') return true
    const failed = outcome === 'failed'
    if (!failed && await usableSession(config)) return true
    if (!failed && !signInRequiredAtBoot(config, false)) return true
    const plan = signInPlan(config, true, failed)
    if (plan.show === 'provider' && await startSignIn(plan.provider, baseUrl)) return false
    await chooseAndStart(baseUrl, {
        providers: config.providers, cancellable: false,
        message: failed || plan.show === 'provider' ? chromeText('signInFailed') : undefined,
    })
    return false
}

let reauthenticating: Promise<boolean> | undefined

/**
 * The built-in answer to a 401 nobody else handled: refresh and retry; else sign in again (one
 * provider: straight to it, coming back to this URL; several: the chooser, which the user may
 * decline — then the request fails as it would have). Concurrent 401s share one answer.
 */
export const reauthenticate = (context: SessionExpiredContext, config: SignInConfig, baseUrl: string) => {
    if (!reauthenticating) {
        reauthenticating = (async () => {
            if (await refresh(config)) return true
            const session = readAuthSession()
            if (session) writeAuthSession(null)
            if (getAuthToken()) setAuthToken(null)
            const plan = signInPlan(config, true)
            if (plan.show === 'provider') {
                if (await startSignIn(plan.provider, baseUrl)) return new Promise<boolean>(() => { /* the page is leaving */ })
            }
            const started = await chooseAndStart(baseUrl, { providers: config.providers, cancellable: true })
            return started ? new Promise<boolean>(() => { /* the page is leaving */ }) : false
        })().finally(() => { reauthenticating = undefined })
    }
    void reauthenticating.then((renewed) => (renewed ? context.retry() : context.giveUp()), () => context.giveUp())
}

/**
 * Signs the user out: the tokens go, then the IdP ends its session (oidc `end_session_endpoint`,
 * back to this mount) or the framework's (`logoutUrl`). Without either the page reloads on the
 * mount, where the sign-in starts again.
 */
export const signOut = async (config: SignInConfig, baseUrl: string): Promise<void> => {
    const session = readAuthSession()
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = undefined
    setAuthToken(null)
    writeAuthSession(null)
    const home = oidcRedirectUri(baseUrl, e().href())
    const provider = providerOf(config, session?.providerId)
    if (session?.kind === 'oidc' && provider?.issuer && provider.clientId) {
        try {
            const discovery = await discover(provider.issuer)
            const url = endSessionUrl(discovery.end_session_endpoint, { idToken: session.idToken, postLogoutRedirectUri: home, clientId: provider.clientId })
            if (url && go(url)) return
        } catch { /* no discovery: just leave */ }
    }
    if (config.logoutUrl && go(config.logoutUrl)) return
    go(home)
}

/** For tests. */
export const resetSignInFlow = () => {
    discoveries.clear()
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = undefined
    refreshing = undefined
    reauthenticating = undefined
    env = undefined
}
