// Transport resilience — the same contract as the web renderers (libs/mateu:
// requestPolicy + retryPolicy + connectivity + pendingActions), rewritten for THIS core,
// which shares nothing with them: here the transport is bare `fetch`, not axios.
//
// The differences fetch forces, and which are the reason this is not a copy-paste:
//   - fetch has NO timeout. Without an AbortController a request can hang
//     forever; the user sees the screen frozen with no error and no end.
//   - fetch does NOT reject on a 4xx/5xx: it resolves with `res.ok === false`. The status has to be
//     read and attached to the error by hand, or further down there is no way to tell a 500 from an
//     unplugged cable.
//   - a network failure is a generic `TypeError` ("Failed to fetch"), and an abort is a
//     `DOMException` with `name === 'AbortError'`. Neither carries its own code.
//
// Everything here is pure except `fetchWithPolicy`, so that test.mjs can exercise it in
// Node with no browser and no backend.

import { clientErrors } from './clientLog.mjs'
import { chromeText } from './i18n.mjs'
import { hostHeadersFor, lastHostHeadersOf, hostAuthorizes, hostCredentials } from './hostHeaders.mjs'

// ── classification ────────────────────────────────────────────────────────────────────────

/** Default ceiling of a request, in ms. Overridden by `@Action(timeoutMillis = …)`. */
export const DEFAULT_TIMEOUT_MS = 60000

// the texts, in the interface's language (i18n.mjs)
const MESSAGES = {
  offline: () => chromeText('errOffline'),
  timeout: () => chromeText('errTimeout'),
  server: (s) => (s ? chromeText('errServerStatus', { status: s }) : chromeText('errServer')),
  unauthorized: () => chromeText('errUnauthorized'),
  // A 403 is NOT the session: the server knows who you are and says no to THIS (an action the
  // view does not declare, a missing role). Saying "sign in again" sent the user to a login that
  // fixes nothing.
  forbidden: () => chromeText('errForbidden'),
  notFound: () => chromeText('errNotFound'),
  client: (s) => (s ? chromeText('errClientStatus', { status: s }) : chromeText('errClient')),
  cancelled: () => '',
  unknown: () => chromeText('errUnknown'),
}

/** Kinds worth retrying: either it did not arrive, or the server had a bad moment. */
const RETRYABLE = new Set(['offline', 'timeout', 'server'])

/**
 * Translates a transport failure into `{ kind, message, retryable, status }`.
 *
 * `online` is injected so it can be tested and because the caller has a better signal than
 * `navigator.onLine` (which lies on captive portals).
 */
export function classifyRequestFailure(error, options = {}) {
  const err = error || {}
  const status = err.status != null ? err.status : (err.response && err.response.status)
  const name = err.name || ''
  const message = err.message || ''
  const online = options.online !== undefined
    ? options.online
    : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

  const failure = (kind) => ({
    kind,
    message: MESSAGES[kind](status),
    retryable: RETRYABLE.has(kind),
    status,
  })

  // An abort is OUR decision (navigation, our own timeout): never news for the
  // user… except when the timeout fired it, which is. The marker tells them apart.
  if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
    return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
  }
  if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

  if (status == null) {
    // No response: either we know there is no network, or the request died before arriving.
    if (!online) return failure('offline')
    // fetch resolves a network failure as a TypeError with no further details.
    if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
      return failure('offline')
    }
    return failure('unknown')
  }
  if (status === 401) return failure('unauthorized')
  if (status === 403) return failure('forbidden')
  if (status === 404 || status === 410) return failure('notFound')
  if (status === 408 || status === 429) return failure('timeout')
  if (status >= 500) return failure('server')
  if (status >= 400) return failure('client')
  return failure('unknown')
}

// ── retry policy ────────────────────────────────────────────────────────────────

/** Framework action ids that only READ. '' is the route load. */
const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

/**
 * Whether repeating `actionId` cannot apply the same change twice.
 *
 * By default NO: when a request times out we do not know whether the server processed it, so
 * repeating a `create` risks a silent duplicate. `declared` is the wire's opt-in
 * (`@Action(idempotent = true)`), which never takes a known read off the list.
 */
export function isIdempotentAction(actionId, declared) {
  if (declared === true) return true
  // An ABSENT id is unknown work; an EMPTY one is the route load. They are not the same.
  if (actionId === undefined || actionId === null) return false
  if (ALWAYS_SAFE.has(actionId)) return true
  return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
}

/** Attempts IN ADDITION to the first. */
export const MAX_RETRIES = 2

/** Wait before retry `attempt` (1-based): exponential with ±25% jitter. */
export function retryDelayMs(attempt, random = Math.random) {
  const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
  return Math.round(base * (0.75 + random() * 0.5))
}

/**
 * The decision. `offline` is deliberately left out: resending after 300 ms with the network down
 * only burns the attempt budget — reconnection is `connectivity`'s job.
 */
export function shouldRetry(failure, attempt, options = {}) {
  if (!options.idempotent) return false
  if (attempt > MAX_RETRIES) return false
  if (!failure.retryable) return false
  return failure.kind === 'timeout' || failure.kind === 'server'
}

// ── conectividad ─────────────────────────────────────────────────────────────────────────

/**
 * An honest answer to "do we get through?".
 *
 * `navigator.onLine` reports the link, not the path: it says true on a captive portal and with
 * a VPN that lost its route. It serves as a hard negative; the positive comes from our own
 * traffic coming back.
 */
export const connectivity = {
  _linkUp: true,
  _reachable: undefined,
  _listeners: new Set(),
  _started: false,

  start() {
    if (this._started || typeof window === 'undefined') return
    this._started = true
    this._linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine : true
    window.addEventListener('online', () => {
      this._linkUp = true
      this._reachable = undefined   // the link is back, the path remains to be proven
      this._emit()
    })
    window.addEventListener('offline', () => { this._linkUp = false; this._emit() })
  },

  isOnline() {
    if (!this._linkUp) return false
    return this._reachable !== false
  },

  noteReachable() {
    const was = this.isOnline()
    this._reachable = true
    if (!was) this._emit()
  },

  noteUnreachable() {
    const was = this.isOnline()
    this._reachable = false
    if (was) this._emit()
  },

  subscribe(listener) {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  },

  reset() { this._linkUp = true; this._reachable = undefined },

  _emit() {
    const online = this.isOnline()
    this._listeners.forEach((l) => l(online))
  },
}

// ── double-submit guard ─────────────────────────────────────────────────────────────────

/** Safety valve: after this time an entry is considered dead and released. */
const STALE_MS = 120000

export const pendingActions = {
  _started: new Map(),

  key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

  /** Claims the slot. false = an identical one is already in flight and this is a duplicate. */
  begin(key, now = Date.now()) {
    const startedAt = this._started.get(key)
    if (startedAt !== undefined && now - startedAt < STALE_MS) return false
    this._started.set(key, now)
    return true
  },

  end(key) { this._started.delete(key) },

  isPending(key, now = Date.now()) {
    const startedAt = this._started.get(key)
    return startedAt !== undefined && now - startedAt < STALE_MS
  },

  reset() { this._started.clear() },
}

// ── lifecycle hooks ─────────────────────────────────────────────────────────────

/**
 * How the app (VB) learns there is work in flight, without the core knowing anything about VB.
 * `onStart` receives {actionId}; `onSettle` receives {actionId, failure} (failure null if it went well).
 */
/**
 * Requests a component makes FOR ITSELF and that already show their own loading: they never turn on the
 * page's busy bar (the same rule as the web renderer, localRequests.ts).
 * `search-<field>`: a lookup's options search (and the empty one that fills a select);
 * `code-<field>`: the label of a typed code; `__restfetch__`: a @RestOptions through the server.
 */
export function isLocalRequest(actionId) {
  return !!actionId && (actionId.indexOf('search-') === 0 || actionId.indexOf('code-') === 0 || actionId === '__restfetch__')
}

export const transportHooks = { onStart: null, onSettle: null }

export function setTransportHooks(hooks) {
  transportHooks.onStart = (hooks && hooks.onStart) || null
  transportHooks.onSettle = (hooks && hooks.onSettle) || null
}

const notify = (which, payload) => {
  const fn = transportHooks[which]
  if (!fn) return
  try { fn(payload) } catch (e) { /* the UI cannot bring the transport down */ }
}

// ── the current screen ─────────────────────────────────────────────────────────────────

/**
 * Which screen is showing: a counter navigation bumps when it starts loading another (beginView). A
 * request of the screen (callMateu stamps it on its own; not the background ones: header widgets, remote
 * menus, the chat) remembers the screen it went out for, and its response — good or bad — that
 * arrives when another one is showing dies silently: it is not painted, it raises no error band and does not ask to
 * reauthenticate; it only releases the busy state (onSettle without failure). It is the same rule as the web renderer
 * (staleViewGuard.ts): a request that went out with screen A and comes back with B belongs to nobody.
 */
export const viewGuard = { generation: 0 }

/** Another screen starts: whatever of the previous one is still in flight will no longer be applied. */
export function beginView() { return ++viewGuard.generation }

/** The current screen (to stamp a request on its way out). */
export function currentView() { return viewGuard.generation }

/** Is the view a request went out for no longer on screen? (undefined: not tied to any) */
export function isViewStale(view) { return view != null && view !== viewGuard.generation }

/** The rejection of a response that arrived for a screen that is gone. */
export function staleResponseError(actionId) {
  const error = new Error(`respuesta a '${actionId || ''}' para una pantalla que ya no está`)
  error.stale = true
  error.code = 'ERR_CANCELED'
  error.failure = { kind: 'cancelled', message: '', retryable: false, status: undefined }
  return error
}

export function isStaleResponse(error) { return !!(error && error.stale === true) }

// ── fetch with policy ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/** A request's traceparent header, if it carried one. */
function traceparentOf(init) {
  const h = init && init.headers
  if (!h) return undefined
  if (typeof h.get === 'function') return h.get('traceparent') || undefined
  return h.traceparent || h.Traceparent || undefined
}

/**
 * One send: applies the timeout (fetch has none) and turns a 4xx/5xx into an error that
 * CARRIES the status, because fetch resolves those as success and further down there would be no way to know.
 */
async function sendOnce(url, init, timeoutMillis) {
  // Negative = NO ceiling, for a stream that lasts as long as it lasts (LongTask). Different from 0 /
  // absent, which means "use the default one".
  const noCeiling = timeoutMillis != null && timeoutMillis < 0
  const ms = timeoutMillis && timeoutMillis > 0 ? timeoutMillis : DEFAULT_TIMEOUT_MS
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  let timedOut = false
  const timer = noCeiling ? null : setTimeout(() => {
    timedOut = true
    if (controller) controller.abort()
  }, ms)
  try {
    const res = await fetch(url, controller ? { ...init, signal: controller.signal } : init)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const error = new Error(`Mateu → HTTP ${res.status}${text ? `: ${text}` : ''}`)
      error.status = res.status
      throw error
    }
    return res
  } catch (e) {
    // An abort fired by OUR timeout must read as a timeout, not as a cancellation:
    // the user does need to find out.
    if (timedOut && e) e.__mateuTimedOut = true
    throw e
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * The header with the token, if the bootstrap left one.
 *
 * The bootstrap page authenticates against Keycloak and stores the token in
 * `localStorage.__mateu_auth_token`, refreshing it when it expires. Until this existed, NOTHING
 * read it: the bridge made every call without the header, the gateway answered 401 and the classifier
 * below translated it into "Tu sesión ya no es válida" — a message true about the 401 and misleading
 * about the cause, because the session was perfectly alive and the request simply did not
 * present it. The console loaded, was left without a single menu, and the chat panel did not
 * answer either.
 *
 * It goes here and not in the three places that build headers in transport.mjs, for the same reason that in
 * the other renderer it is an axios interceptor and not a parameter of each call: a single point
 * that a fourth place cannot forget.
 *
 * `localStorage` does not exist in Node, where test.mjs runs, so it is read behind a guard; and an
 * `Authorization` the caller has already set wins over this one, which is what allows testing
 * the path without touching storage.
 */
function authHeaders(init) {
  const already = init && init.headers &&
    (init.headers.Authorization || init.headers.authorization)
  if (already) return null
  const token = storedToken()
  return token ? { Authorization: 'Bearer ' + token } : null
}

/** The token the bootstrap left, or null (no localStorage, blocked or empty). */
function storedToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
  } catch (e) {
    // A browser with storage blocked. Without a token it carries on: the backend will say no,
    // which is better than not calling.
    return null
  }
}

/**
 * The header with the token for a call that does NOT go through fetchWithPolicy: the agent's chat
 * stream (SSE, its own fetch that reads the body in chunks). Without it the agent answers
 * 401 and the panel shows "Servidor respondió 401". {} if there is no token.
 */
export function authHeadersOf() {
  // embedded mode (hostHeaders.mjs): the host's headers, as last answered by its provider, win
  const host = lastHostHeadersOf()
  return { ...((hostAuthorizes(host) ? null : authHeaders(null)) || {}), ...host }
}

/** The refresh in progress, if any: 401s arriving meanwhile wait for this one. */
let reauthInFlight = null

/**
 * Asks the page to reauthenticate after a 401, with the same contract as the Vaadin renderer
 * (sessionGuard.ts): the cancelable 'mateu-session-expired' event on document, with
 * {retry, giveUp} in the detail. Mateu's bootstrap handles it — it forces the Keycloak token
 * refresh and calls retry, or sends to the login if the session no longer exists. Resolves true if
 * the request must be resent; false if nobody claimed it or the page gave up.
 *
 * ONE refresh for all: the tab comes back from the background with the token expired and the inbox badge,
 * the banner sync and the user's action come back 401 at the same time. Each one firing its
 * event meant N forced refreshes in parallel (and N keycloak.login() if it failed); now the 401s
 * arriving while one is in progress wait for that one and share its answer.
 *
 * `sentToken` (optional): the token the rejected request went out with. If the current one is
 * different, the refresh already happened while the request was in flight — the visibilitychange one, typically
 * — and resending is enough: forcing another would throw away a freshly issued one.
 */
export function askForReauthentication(sentToken) {
  if (sentToken !== undefined) {
    const current = storedToken()
    if (current && current !== sentToken) return Promise.resolve(true)
  }
  if (!reauthInFlight) {
    reauthInFlight = raiseSessionExpired().finally(() => { reauthInFlight = null })
  }
  return reauthInFlight
}

function raiseSessionExpired() {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') {
      resolve(false)
      return
    }
    let settled = false
    const settle = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const detail = { retry: () => settle(true), giveUp: () => settle(false) }
    const claimed = !document.dispatchEvent(
      new CustomEvent('mateu-session-expired', { detail, cancelable: true, bubbles: false }))
    if (!claimed) settle(false)
  })
}

/**
 * The single point ALL of this renderer's traffic goes through.
 *
 * And that is why it is where the token is attached: it is this renderer's Mateu client, just as
 * AxiosMateuApiClient is the other's.
 *
 * It resends while the failure is transient AND the action is safe to repeat; each resolved
 * attempt tells the connectivity tracker whether the backend answers — a response
 * proves the path better than any browser flag. The N attempts are ONE single
 * outcome as far as the UI is concerned: one loading state, one message.
 */
export async function fetchWithPolicy(url, init, options = {}) {
  // The token is read on EVERY send, not once: after a 401 the bootstrap leaves a new one in
  // localStorage and the retry has to carry that one, not the expired one.
  // The token the LAST send went out with (undefined if it did not carry ours): on a 401
  // it tells whether the refresh already arrived while the request was in flight.
  let sentToken
  const withAuth = async () => {
    // embedded mode: the HOST app's identity (hostHeaders.mjs) — asked on every send, so a retry
    // after a 401 carries whatever the host has now; it wins over the stored token
    const host = await hostHeadersFor(url)
    const credentials = hostCredentials()
    const auth = hostAuthorizes(host) ? null : authHeaders(init)
    sentToken = auth ? auth.Authorization.slice('Bearer '.length) : undefined
    if (!auth && !Object.keys(host).length && !credentials) return init
    return {
      ...(init || {}),
      ...(credentials ? { credentials } : {}),
      headers: { ...((init && init.headers) || {}), ...(auth || {}), ...host },
    }
  }
  const actionId = options.actionId
  const idempotent = isIdempotentAction(actionId, options.idempotent)
  // `quiet`: a BACKGROUND request (the refresh of a header widget every few seconds) does not
  // notify the hooks — the busy bar and the error band are about what the user does.
  // Neither does one from a component that already shows its own loading (isLocalRequest): the combo searching
  // its options spins its own indicator, and the bar on top meant two waits for one keystroke
  const quiet = options.quiet || isLocalRequest(actionId)
  const notifyUnlessQuiet = (hook, payload) => { if (!quiet) notify(hook, payload) }
  // `isolated`: whatever happens to this request says nothing about the connection — a federated
  // pod's menu, often from another origin: a pod that is down is ITS section unavailable, not "offline"
  const isolated = !!options.isolated
  notifyUnlessQuiet('onStart', { actionId })
  // `view`: the screen it goes out for (currentView); its response dies if another one is showing
  const view = options.view
  const dropStale = () => {
    // the busy state goes off (this request turned it on), with no failure to show
    notifyUnlessQuiet('onSettle', { actionId, failure: null })
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('mateu: respuesta descartada — su pantalla ya no está', actionId, url)
    }
    throw staleResponseError(actionId)
  }
  let attempt = 0
  let reauthenticated = false
  for (;;) {
    try {
      const res = await sendOnce(url, await withAuth(), options.timeoutMillis)
      if (!isolated) connectivity.noteReachable()
      if (isViewStale(view)) dropStale()
      notifyUnlessQuiet('onSettle', { actionId, failure: null })
      return res
    } catch (error) {
      if (isStaleResponse(error)) throw error
      // its screen is gone: no reauthenticating, no retrying, no band
      if (isViewStale(view)) dropStale()
      // A 401 is, almost always, the token expired between two refreshes. The page is asked to
      // reauthenticate and it is resent ONCE: the server rejected the request without executing it, so
      // repeating it is safe for a write too. With nobody to reauthenticate, or if the
      // retry gets 401 again, it fails as always.
      if (error && error.status === 401 && !reauthenticated) {
        reauthenticated = true
        if (await askForReauthentication(sentToken)) continue
      }
      const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
      if (failure.kind === 'offline' && !isolated) connectivity.noteUnreachable()
      attempt++
      if (!shouldRetry(failure, attempt, { idempotent })) {
        // The error travels CLASSIFIED: the UI shows `failure.message` instead of "Failed to
        // fetch", and decides whether to offer a retry.
        error.failure = failure
        notifyUnlessQuiet('onSettle', { actionId, failure })
        // to the server log (clientLog.mjs): what the user saw and what was underneath. A
        // 'cancelled' is not reported, and the call to the endpoint itself does not go through here.
        clientErrors.report({
          kind: failure.kind,
          message: failure.message,
          status: failure.status,
          detail: error && error.message,
          url,
          actionId,
          traceparent: traceparentOf(init),
        })
        throw error
      }
      await delay(retryDelayMs(attempt))
    }
  }
}
