// The built-in sign-in of the Redwood renderer: the same contract as the web one (libs/mateu
// infra/auth — signInConfig.ts, oidc.ts, signInFlow.ts, mateu-sign-in.ts), ported because this
// renderer shares no code with it. The page declares its providers in
// <meta name="mateu-auth" content="{…auth block…}">; with none, nothing here runs.
//
//  - boot (loadMateuShell, BEFORE the first bootstrapShell): an OIDC callback on the URL is
//    completed first (state checked, code + PKCE verifier redeemed, nonce checked, URL cleaned and
//    put back on the route the user was on); then, with `loginOnStart` and no session, one provider
//    is followed straight away and several are offered in the chooser;
//  - a 401 nobody else claimed (resilience.mjs → setBuiltInReauthentication): refresh and retry;
//    else sign in again;
//  - sign-out (the header's "Sign out" action): end_session (oidc) or `logoutUrl` (redirect).
//
// Tokens: the Bearer token in localStorage `__mateu_auth_token` (what resilience.mjs's storedToken
// reads), the rest beside it in `__mateu_auth_session`; the pending sign-in in sessionStorage.
// Rules held to conformance/client/sign-in-flow.json (test-conformance.mjs).

import { chromeText } from './i18n.mjs'
import { setBuiltInReauthentication } from './resilience.mjs'

export const SIGN_IN_ICONS = ['google', 'microsoft', 'apple', 'github', 'facebook', 'x', 'linkedin', 'gitlab', 'okta', 'auth0', 'keycloak', 'key']
const SIGN_IN_PLATFORMS = ['web', 'mobile', 'desktop']
const SIGN_IN_TOKEN_KEY = '__mateu_auth_token'
const SIGN_IN_SESSION_KEY = '__mateu_auth_session'
const SIGN_IN_PENDING_KEY = '__mateu_sign_in_pending'
const SIGN_IN_PENDING_MAX_AGE_MS = 10 * 60000
/** The header action id of "Sign out" (runMateuHeaderAction handles it locally). */
export const SIGN_OUT_ACTION = '__mateu_sign_out'

const signInText = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined)
const signInList = (v) => (Array.isArray(v) ? v.map(signInText).filter(Boolean)
  : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : undefined)

/** One declared provider, normalised; null when it cannot be used. */
export function signInProviderOf(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = signInText(raw.id)
  const type = (signInText(raw.type) || '').toLowerCase()
  if (!id || (type !== 'oidc' && type !== 'redirect')) return null
  const issuer = signInText(raw.issuer)
  const clientId = signInText(raw.clientId)
  const url = signInText(raw.url)
  if (type === 'oidc' && (!issuer || !clientId)) return null
  if (type === 'redirect' && !url) return null
  const icon = (signInText(raw.icon) || 'key').toLowerCase()
  const platforms = (signInList(raw.platforms) || []).map((s) => s.toLowerCase()).filter((s) => SIGN_IN_PLATFORMS.includes(s))
  const scopes = signInList(raw.scopes)
  const provider = {
    id, type, label: signInText(raw.label) || id, icon: SIGN_IN_ICONS.includes(icon) ? icon : 'key',
    scopes: type === 'oidc' ? (scopes && scopes.length ? scopes : ['openid', 'profile']) : [],
    platforms: platforms.length ? platforms : (type === 'oidc' ? SIGN_IN_PLATFORMS.slice() : ['web']),
    continueParam: raw.continueParam !== false,
  }
  if (type === 'oidc') { provider.issuer = issuer.replace(/\/+$/, ''); provider.clientId = clientId } else provider.url = url
  if (signInText(raw.audience)) provider.audience = signInText(raw.audience)
  return provider
}

/** The auth block, normalised, with only the providers usable on `platform`; null when none. */
export function signInConfigOf(raw, platform = 'web') {
  if (!raw || typeof raw !== 'object') return null
  const declared = Array.isArray(raw.providers) ? raw.providers
    : raw.type === 'oidc' ? [{ id: 'default', type: 'oidc', issuer: raw.issuer, clientId: raw.clientId, scopes: raw.scopes, audience: raw.audience }] : []
  const seen = new Set()
  const providers = declared.map(signInProviderOf)
    .filter((p) => p && p.platforms.includes(platform))
    .filter((p) => !seen.has(p.id) && !!seen.add(p.id))
  if (!providers.length) return null
  const config = { loginOnStart: raw.loginOnStart !== false, providers }
  if (signInText(raw.logoutUrl)) config.logoutUrl = signInText(raw.logoutUrl)
  return config
}

/** The page's <meta name="mateu-auth">, parsed; null when absent or broken. */
export function readSignInConfig(doc) {
  try {
    const meta = doc && doc.querySelector('meta[name="mateu-auth"]')
    const content = meta && meta.getAttribute('content')
    return content ? signInConfigOf(JSON.parse(content)) : null
  } catch (e) {
    return null
  }
}

/** What to show when signing in is required: {show:'nothing'|'provider'|'chooser', provider?}. */
export function signInPlanOf(config, required, failed = false) {
  if (!config || !required) return { show: 'nothing' }
  if (config.providers.length === 1 && !failed) return { show: 'provider', provider: config.providers[0] }
  return { show: 'chooser', providers: config.providers }
}

export function signInRequiredAtBoot(config, hasSession) { return !!config && config.loginOnStart && !hasSession }

/** A redirect provider's URL with continue=<current url>; http(s) only. */
export function redirectProviderUrlOf(provider, currentHref) {
  if (!provider || !provider.url) return undefined
  try {
    const url = new URL(provider.url, currentHref)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    if (provider.continueParam) url.searchParams.set('continue', currentHref)
    return url.href
  } catch (e) {
    return undefined
  }
}

/** The OIDC redirect uri: the mount's root on the page's origin. */
export function oidcRedirectUriOf(baseUrl, currentHref) {
  const page = new URL(currentHref)
  try {
    const base = new URL(baseUrl || '/', page.href)
    if (base.origin === page.origin) return base.origin + (base.pathname.endsWith('/') ? base.pathname : base.pathname + '/')
  } catch (e) { /* the origin's root */ }
  return page.origin + '/'
}

// ── OIDC (Authorization Code + PKCE, public client) ───────────────────────────────────────────

const signInBase64Url = (bytes) => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function signInRandomToken(bytes = 32, cryptoImpl = globalThis.crypto) {
  const buffer = new Uint8Array(bytes)
  cryptoImpl.getRandomValues(buffer)
  return signInBase64Url(buffer)
}

export async function pkceChallengeOf(verifier, cryptoImpl = globalThis.crypto) {
  return signInBase64Url(new Uint8Array(await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))
}

const SIGN_IN_LOOPBACK = /^(localhost|127(?:\.\d+){3}|\[::1\])$/
export function oidcEndpointAllowed(url, issuer) {
  if (typeof url !== 'string') return false
  try {
    const u = new URL(url)
    if (u.protocol === 'https:') return true
    const i = new URL(issuer)
    return u.protocol === 'http:' && i.protocol === 'http:' && SIGN_IN_LOOPBACK.test(u.hostname) && SIGN_IN_LOOPBACK.test(i.hostname)
  } catch (e) {
    return false
  }
}

export async function fetchOidcDiscovery(issuer, fetchImpl = fetch) {
  const trimmed = issuer.replace(/\/+$/, '')
  const res = await fetchImpl(trimmed + '/.well-known/openid-configuration', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('discovery answered ' + res.status)
  const doc = await res.json()
  if (!doc || typeof doc.issuer !== 'string' || doc.issuer.replace(/\/+$/, '') !== trimmed) throw new Error('the discovery document belongs to another issuer')
  for (const key of ['authorization_endpoint', 'token_endpoint']) {
    if (!oidcEndpointAllowed(doc[key], issuer)) throw new Error('unusable ' + key)
  }
  if (doc.end_session_endpoint !== undefined && !oidcEndpointAllowed(doc.end_session_endpoint, issuer)) delete doc.end_session_endpoint
  return doc
}

export function oidcAuthorizeUrlOf(endpoint, rq) {
  const url = new URL(endpoint)
  const params = {
    response_type: 'code', client_id: rq.clientId, redirect_uri: rq.redirectUri, scope: rq.scopes.join(' '),
    state: rq.state, nonce: rq.nonce, code_challenge: rq.codeChallenge, code_challenge_method: 'S256',
  }
  if (rq.audience) params.audience = rq.audience
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return url.href
}

export function oidcEndSessionUrlOf(endpoint, options) {
  if (!endpoint) return undefined
  const url = new URL(endpoint)
  if (options.idToken) url.searchParams.set('id_token_hint', options.idToken)
  url.searchParams.set('post_logout_redirect_uri', options.postLogoutRedirectUri)
  url.searchParams.set('client_id', options.clientId)
  return url.href
}

async function oidcTokenRequest(endpoint, form, fetchImpl, now, previous) {
  const res = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(form).toString(),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof body.error === 'string' ? body.error : 'token endpoint answered ' + res.status)
  if (typeof body.access_token !== 'string' || !body.access_token) throw new Error('the token endpoint returned no access token')
  const expiresIn = Number(body.expires_in)
  const tokens = {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === 'string' ? body.refresh_token : previous && previous.refreshToken,
    idToken: typeof body.id_token === 'string' ? body.id_token : previous && previous.idToken,
  }
  if (Number.isFinite(expiresIn) && expiresIn > 0) tokens.expiresAt = now + expiresIn * 1000
  return tokens
}

export function oidcJwtClaims(jwt) {
  const part = jwt && jwt.split('.')[1]
  if (!part) return {}
  try {
    const raw = atob(part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - part.length % 4) % 4))
    const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(raw, (c) => c.charCodeAt(0))))
    return claims && typeof claims === 'object' ? claims : {}
  } catch (e) {
    return {}
  }
}

const OIDC_CALLBACK_PARAMS = ['code', 'state', 'session_state', 'iss', 'error', 'error_description', 'error_uri']

export function oidcCallbackOf(search) {
  const q = new URLSearchParams(search)
  const state = q.get('state')
  const code = q.get('code')
  const error = q.get('error')
  if (!state || (!code && !error)) return undefined
  return { state, code: code || undefined, error: error || undefined }
}

export function withoutOidcCallback(href) {
  const url = new URL(href)
  for (const p of OIDC_CALLBACK_PARAMS) url.searchParams.delete(p)
  const q = url.searchParams.toString()
  return url.pathname + (q ? '?' + q : '') + url.hash
}

// ── the page's side effects (swappable in tests) ──────────────────────────────────────────────

const signInStore = (kind) => {
  try {
    const s = kind === 'session' ? globalThis.sessionStorage : globalThis.localStorage
    return s || null
  } catch (e) {
    return null
  }
}
const signInStoreGet = (kind, key) => { try { const s = signInStore(kind); return s ? s.getItem(key) : null } catch (e) { return null } }
const signInStoreSet = (kind, key, value) => {
  try {
    const s = signInStore(kind)
    if (!s) return
    if (value == null) s.removeItem(key)
    else s.setItem(key, value)
  } catch (e) { /* blocked storage: the sign-in still works for this page */ }
}
const signInStoreJson = (kind, key) => { try { const v = JSON.parse(signInStoreGet(kind, key) || 'null'); return v && typeof v === 'object' ? v : null } catch (e) { return null } }

const signInDefaultEnv = () => ({
  href: () => window.location.href,
  assign: (url) => window.location.assign(url),
  replaceUrl: (url) => window.history.replaceState(window.history.state, '', url),
  fetch: (...args) => fetch(...args),
  crypto: globalThis.crypto,
  now: () => Date.now(),
  choose: (options) => showSignInChooser(document, options),
})
let signInEnvOverride = null
const sie = () => signInEnvOverride || (signInEnvOverride = signInDefaultEnv())

/** For tests: replace (part of) the side effects; null restores them. */
export function setSignInEnv(overrides) {
  signInEnvOverride = overrides ? { ...signInDefaultEnv(), ...overrides } : null
}

const signInDiscoveries = new Map()
function discoverIssuer(issuer) {
  if (!signInDiscoveries.has(issuer)) {
    const p = fetchOidcDiscovery(issuer, sie().fetch)
    p.catch(() => signInDiscoveries.delete(issuer))
    signInDiscoveries.set(issuer, p)
  }
  return signInDiscoveries.get(issuer)
}

const signInGo = (url) => {
  try {
    const u = new URL(url, sie().href())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    sie().assign(u.href)
    return true
  } catch (e) {
    return false
  }
}

export function storedSignInToken() { return signInStoreGet('local', SIGN_IN_TOKEN_KEY) }
export function readSignInSession() { return signInStoreJson('local', SIGN_IN_SESSION_KEY) }
const writeSignInSession = (session) => signInStoreSet('local', SIGN_IN_SESSION_KEY, session ? JSON.stringify(session) : null)
const writeSignInToken = (token) => signInStoreSet('local', SIGN_IN_TOKEN_KEY, token || null)
const readSignInPending = () => {
  const p = signInStoreJson('session', SIGN_IN_PENDING_KEY)
  return p && sie().now() - (p.createdAt || 0) <= SIGN_IN_PENDING_MAX_AGE_MS ? p : null
}
const writeSignInPending = (p) => signInStoreSet('session', SIGN_IN_PENDING_KEY, p ? JSON.stringify(p) : null)

const signInProviderById = (config, id) => config.providers.find((p) => p.id === id)

const signInStoreTokens = (provider, tokens) => {
  writeSignInToken(tokens.accessToken)
  writeSignInSession({
    providerId: provider.id, kind: 'oidc', issuer: provider.issuer, clientId: provider.clientId,
    refreshToken: tokens.refreshToken, idToken: tokens.idToken, expiresAt: tokens.expiresAt,
  })
}

let signInRefreshTimer = null
const scheduleSignInRefresh = (config) => {
  if (signInRefreshTimer) clearTimeout(signInRefreshTimer)
  signInRefreshTimer = null
  const s = readSignInSession()
  if (!s || s.kind !== 'oidc' || !s.refreshToken || s.expiresAt == null) return
  const delay = Math.max(5000, s.expiresAt - 60000 - sie().now())
  signInRefreshTimer = setTimeout(() => { refreshSignIn(config).catch(() => undefined) }, delay)
}

let signInRefreshing = null
/** Renews the access token with the refresh token; true when a new one is stored. One at a time. */
export function refreshSignIn(config) {
  if (signInRefreshing) return signInRefreshing
  signInRefreshing = (async () => {
    const s = readSignInSession()
    const provider = s && signInProviderById(config, s.providerId)
    if (!s || s.kind !== 'oidc' || !s.refreshToken || !provider) return false
    try {
      const discovery = await discoverIssuer(provider.issuer)
      const tokens = await oidcTokenRequest(discovery.token_endpoint,
        { grant_type: 'refresh_token', refresh_token: s.refreshToken, client_id: provider.clientId }, sie().fetch, sie().now(), s)
      signInStoreTokens(provider, tokens)
      scheduleSignInRefresh(config)
      return true
    } catch (e) {
      console.warn('mateu: the token could not be refreshed', e)
      return false
    }
  })().finally(() => { signInRefreshing = null })
  return signInRefreshing
}

/** Sends the browser to a provider; false when it could not start. */
export async function startSignIn(provider, baseUrl, returnTo = sie().href()) {
  if (provider.type === 'redirect') {
    const target = redirectProviderUrlOf(provider, returnTo)
    if (!target) return false
    writeSignInSession({ providerId: provider.id, kind: 'redirect' })
    return signInGo(target)
  }
  try {
    const discovery = await discoverIssuer(provider.issuer)
    const env = sie()
    const codeVerifier = signInRandomToken(32, env.crypto)
    const state = signInRandomToken(16, env.crypto)
    const nonce = signInRandomToken(16, env.crypto)
    const redirectUri = oidcRedirectUriOf(baseUrl, env.href())
    writeSignInPending({ providerId: provider.id, state, nonce, codeVerifier, redirectUri, returnTo, tokenEndpoint: discovery.token_endpoint, createdAt: env.now() })
    return signInGo(oidcAuthorizeUrlOf(discovery.authorization_endpoint, {
      clientId: provider.clientId, redirectUri, scopes: provider.scopes, state, nonce,
      codeChallenge: await pkceChallengeOf(codeVerifier, env.crypto), audience: provider.audience,
    }))
  } catch (e) {
    console.warn('mateu: sign-in with ' + provider.id + ' could not start', e)
    return false
  }
}

/** Completes OUR callback on the URL: 'none' | 'signed-in' | 'failed'. */
export async function completeSignInCallback(config) {
  const env = sie()
  const params = oidcCallbackOf(new URL(env.href()).search)
  if (!params) return 'none'
  const pending = readSignInPending()
  if (!pending || pending.state !== params.state) return 'none'
  writeSignInPending(null)
  const provider = signInProviderById(config, pending.providerId)
  const back = (target) => {
    let sameOrigin = false
    try { sameOrigin = new URL(target, env.href()).origin === new URL(env.href()).origin } catch (e) { sameOrigin = false }
    env.replaceUrl(withoutOidcCallback(sameOrigin ? new URL(target, env.href()).href : env.href()))
  }
  if (params.error || !params.code || !provider) {
    console.warn('mateu: sign-in failed', params.error || '')
    back(env.href())
    return 'failed'
  }
  try {
    const tokens = await oidcTokenRequest(pending.tokenEndpoint, {
      grant_type: 'authorization_code', code: params.code, code_verifier: pending.codeVerifier,
      client_id: provider.clientId, redirect_uri: pending.redirectUri,
    }, env.fetch, env.now())
    if (tokens.idToken && oidcJwtClaims(tokens.idToken).nonce !== pending.nonce) throw new Error('the id token carries another nonce')
    signInStoreTokens(provider, tokens)
    scheduleSignInRefresh(config)
    back(pending.returnTo)
    return 'signed-in'
  } catch (e) {
    console.warn('mateu: the authorization code could not be redeemed', e)
    back(env.href())
    return 'failed'
  }
}

async function usableSignInSession(config) {
  const s = readSignInSession()
  if (s && s.kind === 'redirect') return true
  if (!storedSignInToken()) return false
  if (s && s.kind === 'oidc' && s.expiresAt != null && s.expiresAt - 30000 <= sie().now()) {
    if (await refreshSignIn(config)) return true
    writeSignInToken(null)
    writeSignInSession(null)
    return false
  }
  scheduleSignInRefresh(config)
  return true
}

async function chooseAndStartSignIn(baseUrl, options, returnTo) {
  let message = options.message
  for (;;) {
    const chosen = await sie().choose({ ...options, message })
    if (!chosen) return false
    if (await startSignIn(chosen, baseUrl, returnTo)) return true
    message = chromeText('signInFailed')
  }
}

let signInActive = null

/**
 * Boot (loadMateuShell, before the first bootstrapShell): true when the shell may load now,
 * false while the user signs in. Installs the built-in answer to a 401 when the page declares
 * providers; without the meta it answers true at once and installs nothing.
 */
export async function bootSignIn(baseUrl, doc = typeof document !== 'undefined' ? document : null) {
  const config = readSignInConfig(doc)
  if (!config) return true
  signInActive = { config, baseUrl }
  setBuiltInReauthentication((detail) => { reauthenticateSignIn(detail, config, baseUrl) })
  const outcome = await completeSignInCallback(config)
  if (outcome === 'signed-in') return true
  const failed = outcome === 'failed'
  if (!failed && await usableSignInSession(config)) return true
  if (!failed && !signInRequiredAtBoot(config, false)) return true
  const plan = signInPlanOf(config, true, failed)
  if (plan.show === 'provider' && await startSignIn(plan.provider, baseUrl)) return false
  await chooseAndStartSignIn(baseUrl, {
    providers: config.providers, cancellable: false,
    message: failed || plan.show === 'provider' ? chromeText('signInFailed') : undefined,
  })
  return false
}

let signInReauthenticating = null
/** A 401 nobody else claimed: refresh and retry; else sign in again (the chooser may be declined). */
export function reauthenticateSignIn(detail, config, baseUrl) {
  if (!signInReauthenticating) {
    signInReauthenticating = (async () => {
      if (await refreshSignIn(config)) return true
      if (readSignInSession()) writeSignInSession(null)
      if (storedSignInToken()) writeSignInToken(null)
      const leaving = new Promise(() => { /* the page is leaving for the provider */ })
      const plan = signInPlanOf(config, true)
      if (plan.show === 'provider' && await startSignIn(plan.provider, baseUrl)) return leaving
      return (await chooseAndStartSignIn(baseUrl, { providers: config.providers, cancellable: true })) ? leaving : false
    })().finally(() => { signInReauthenticating = null })
  }
  signInReauthenticating.then((renewed) => (renewed ? detail.retry() : detail.giveUp()), () => detail.giveUp())
}

/** Whether "Sign out" applies: the built-in sign-in is on and holds a session. */
export function signOutAvailable() {
  if (!signInActive) return false
  const s = readSignInSession()
  return !!s && (s.kind === 'redirect' || !!storedSignInToken())
}

/** The header actions plus "Sign out" when it applies (loadMateuShell). */
export function withSignOutAction(headerActions) {
  const list = Array.isArray(headerActions) ? headerActions : []
  if (!signOutAvailable()) return list
  return list.concat([{ actionId: SIGN_OUT_ACTION, label: chromeText('signOut'), route: '', hasChildren: false, children: [] }])
}

/** Signs out: tokens dropped, then the IdP's end_session or the framework's logoutUrl. */
export async function signOut() {
  const active = signInActive
  const s = readSignInSession()
  if (signInRefreshTimer) clearTimeout(signInRefreshTimer)
  signInRefreshTimer = null
  writeSignInToken(null)
  writeSignInSession(null)
  if (!active) {
    if (typeof window !== 'undefined') window.location.reload()
    return
  }
  const home = oidcRedirectUriOf(active.baseUrl, sie().href())
  const provider = s && signInProviderById(active.config, s.providerId)
  if (s && s.kind === 'oidc' && provider) {
    try {
      const discovery = await discoverIssuer(provider.issuer)
      const url = oidcEndSessionUrlOf(discovery.end_session_endpoint, { idToken: s.idToken, postLogoutRedirectUri: home, clientId: provider.clientId })
      if (url && signInGo(url)) return
    } catch (e) { /* no discovery: just leave */ }
  }
  if (active.config.logoutUrl && signInGo(active.config.logoutUrl)) return
  signInGo(home)
}

/** For tests. */
export function resetSignIn() {
  signInActive = null
  signInDiscoveries.clear()
  if (signInRefreshTimer) clearTimeout(signInRefreshTimer)
  signInRefreshTimer = null
  signInRefreshing = null
  signInReauthenticating = null
  signInEnvOverride = null
  setBuiltInReauthentication(null)
}

// ── the chooser: plain accessible DOM (Redwood is light only) ─────────────────────────────────

const SIGN_IN_STYLE = `
.mateu-sign-in{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:#f1efed;font-family:var(--oj-typography-body-md-font-family,system-ui,sans-serif);color:#161513;overflow:auto}
.mateu-sign-in-panel{box-sizing:border-box;width:100%;max-width:26rem;padding:32px 28px;border-radius:12px;background:#fff;border:1px solid #e4e1dd;box-shadow:0 8px 24px rgba(0,0,0,.08)}
.mateu-sign-in h1{margin:0 0 8px;font-size:1.5rem;font-weight:600}
.mateu-sign-in-hint{margin:0 0 24px;color:#4b4a47}
.mateu-sign-in-message{margin:0 0 24px;padding:10px 12px;border-radius:8px;background:#fdecea;color:#7a1c14}
.mateu-sign-in ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.mateu-sign-in-provider{width:100%;display:flex;align-items:center;gap:12px;min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid #b9b5b0;background:#fff;color:inherit;font:inherit;text-align:start;cursor:pointer}
.mateu-sign-in-provider:hover{background:#f5f4f2}
.mateu-sign-in-provider:focus-visible,.mateu-sign-in-cancel:focus-visible{outline:3px solid #227e9e;outline-offset:2px}
.mateu-sign-in-glyph{flex:0 0 28px;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:.875rem;background:#ece9e6}
.mateu-sign-in-cancel{margin-top:20px;padding:8px 4px;border:none;background:none;color:#227e9e;font:inherit;cursor:pointer}
`

/** A provider's neutral glyph text: its brand's initial, '' (a key) for the generic one. */
export function signInGlyphOf(provider) {
  if (provider.icon === 'key') return ''
  if (provider.icon === 'x') return 'X'
  return (provider.icon[0] || provider.label[0] || '').toUpperCase()
}

/**
 * Shows the chooser over the page; resolves with the chosen provider, or null when declined
 * (only `cancellable` — after a 401; at boot there is nothing behind it).
 */
export function showSignInChooser(doc, options) {
  return new Promise((resolve) => {
    doc.querySelectorAll('.mateu-sign-in').forEach((el) => el.remove())
    if (!doc.getElementById('mateu-sign-in-style')) {
      const style = doc.createElement('style')
      style.setAttribute('id', 'mateu-sign-in-style')
      style.textContent = SIGN_IN_STYLE
      doc.head.appendChild(style)
    }
    const overlay = doc.createElement('div')
    overlay.setAttribute('class', 'mateu-sign-in')
    const panel = doc.createElement('div')
    panel.setAttribute('class', 'mateu-sign-in-panel')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    panel.setAttribute('aria-labelledby', 'mateu-sign-in-title')
    const title = doc.createElement('h1')
    title.setAttribute('id', 'mateu-sign-in-title')
    title.textContent = chromeText('signInTitle')
    panel.appendChild(title)
    const intro = doc.createElement('p')
    if (options.message) {
      intro.setAttribute('class', 'mateu-sign-in-message')
      intro.setAttribute('role', 'alert')
      intro.textContent = options.message
    } else {
      intro.setAttribute('class', 'mateu-sign-in-hint')
      intro.textContent = chromeText(options.providers.length > 1 ? 'signInChoose' : 'signInHint')
    }
    panel.appendChild(intro)
    const done = (provider) => {
      overlay.remove()
      resolve(provider)
    }
    const list = doc.createElement('ul')
    const buttons = []
    for (const provider of options.providers) {
      const item = doc.createElement('li')
      const button = doc.createElement('button')
      button.setAttribute('type', 'button')
      button.setAttribute('class', 'mateu-sign-in-provider')
      button.setAttribute('data-provider', provider.id)
      const glyph = doc.createElement('span')
      glyph.setAttribute('class', 'mateu-sign-in-glyph')
      glyph.setAttribute('aria-hidden', 'true')
      glyph.textContent = signInGlyphOf(provider) || '⚿'
      const label = doc.createElement('span')
      label.textContent = chromeText('signInWith', { provider: provider.label })
      button.appendChild(glyph)
      button.appendChild(label)
      button.addEventListener('click', () => done(provider))
      item.appendChild(button)
      list.appendChild(item)
      buttons.push(button)
    }
    panel.appendChild(list)
    if (options.cancellable) {
      const cancel = doc.createElement('button')
      cancel.setAttribute('type', 'button')
      cancel.setAttribute('class', 'mateu-sign-in-cancel')
      cancel.textContent = chromeText('cancel')
      cancel.addEventListener('click', () => done(null))
      panel.appendChild(cancel)
      buttons.push(cancel)
    }
    overlay.appendChild(panel)
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && options.cancellable) {
        e.preventDefault()
        done(null)
      } else if (e.key === 'Tab' && buttons.length) {
        // the focus stays in the dialog (aria-modal): Tab cycles through its buttons
        const at = buttons.indexOf(doc.activeElement)
        const next = e.shiftKey ? (at <= 0 ? buttons.length - 1 : at - 1) : (at === buttons.length - 1 ? 0 : at + 1)
        e.preventDefault()
        buttons[next].focus()
      }
    })
    doc.body.appendChild(overlay)
    if (buttons[0]) buttons[0].focus()
  })
}
