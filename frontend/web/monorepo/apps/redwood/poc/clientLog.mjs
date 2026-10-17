// Client errors → server log: what this renderer shows or suffers (a classified transport
// failure, an uncaught JS error, a rejected promise without catch) travels to
// POST <base>/mateu/v3/client-log, which writes ONE `client-error {...}` line per report in the
// "mateu.client" logger. Same contract as the Vaadin renderer (libs/mateu clientErrorReporter.ts).
//
// Why: a «Tu sesión ya no es válida» the user saw left no trace on the server — the
// ingress showed no 401/403 for it. Now there is a line to search for in Loki.
//
// Rules:
//   - it never reports its own failures (the call to the endpoint does not go through fetchWithPolicy, its
//     errors are swallowed, and an error whose url is the endpoint is discarded): no loops;
//   - 'cancelled' is not an error;
//   - the same error repeated within the window is ONE line with `count` + firstAt/lastAt: the
//     first occurrence goes out right away and the repetitions go in a summary line when the
//     window closes (or when leaving the page);
//   - at most `maxPerMinute` lines per minute and page; those that do not fit are counted in `dropped`
//     of the next one;
//   - a response saying there is no endpoint (404/405, or a backend without it that swallows it as an
//     action) turns it off for the page — see endpointIsMissing.
//
// The main send is fetch keepalive WITH the Authorization (the gateway requires the Bearer on
// /mateu/v3); sendBeacon cannot carry headers, so it is only used when hiding the page and without
// a token.
//
// Pure except installClientErrorReporting (which touches window): test.mjs exercises it with injected
// clock, timer and send.

export const CLIENT_LOG_PATH = '/mateu/v3/client-log'

const MAX = { message: 1000, detail: 1000, stack: 4000, url: 1000, pageUrl: 1000, source: 500, route: 500, actionId: 200, userAgent: 300 }
const MAX_BATCH_CHARS = 14000
// Query values that must never end up in a log: Keycloak's login code/state, tokens.
const SECRET_PARAMS = /^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i

const clipText = (s, max) => {
  if (s === undefined || s === null) return undefined
  const text = String(s)
  return text.length > max ? text.slice(0, max) + '…' : text
}

/** The URL without fragment and with the sensitive parameters masked. */
export function redactUrl(url) {
  if (!url) return url
  const text = String(url)
  const noHash = text.split('#')[0]
  const q = noHash.indexOf('?')
  if (q < 0) return noHash
  const params = noHash.slice(q + 1).split('&').map((pair) => {
    const eq = pair.indexOf('=')
    const key = eq < 0 ? pair : pair.slice(0, eq)
    return SECRET_PARAMS.test(decodeURIComponentSafe(key)) ? `${key}=***` : pair
  })
  return noHash.slice(0, q + 1) + params.join('&')
}

function decodeURIComponentSafe(s) {
  try { return decodeURIComponent(s) } catch (e) { return s }
}

/** The Mateu route of a transport URL (/mateu/v3/sync/<route>), or undefined. */
export function routeOfRequestUrl(url) {
  if (!url) return undefined
  const m = /\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(String(url))
  if (!m) return undefined
  return m[1] === '_no_route' ? '' : '/' + m[1]
}

/**
 * Whether the response says there is no endpoint here: a 404/405 (old backend or
 * mateu.client-log.enabled=false), or a backend whose generic /mateu/v3/** controller swallowed the
 * report as if it were an action (a 2xx that is not 204, a 400, a 500). Transient things — no
 * response, 401/403 from an expired token, 413, 429, 502-504 from the gateway — do not turn it off.
 */
export function endpointIsMissing(status) {
  if (status === undefined || status === null || status === 0 || status === 204) return false
  if (status === 401 || status === 403 || status === 413 || status === 429 || status >= 502) return false
  return true
}

/** Known noise that is not an application error. */
function isNoise(entry) {
  const msg = entry.message || ''
  return /ResizeObserver loop/i.test(msg)
}

/**
 * A reporter. `deps`: { renderer, endpoint() → url or null, send(url, body, {final}) → Promise
 * of a status (or undefined), now() → ms, schedule(fn, ms) → handle, cancel(handle), userAgent,
 * pageUrl() }. All optional except `send` for the tests.
 */
export function createClientErrorReporter(deps = {}) {
  const renderer = deps.renderer || 'redwood'
  const now = deps.now || (() => Date.now())
  const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
  const cancel = deps.cancel || ((h) => clearTimeout(h))
  const windowMs = deps.dedupeWindowMs || 60000
  const batchDelayMs = deps.batchDelayMs !== undefined ? deps.batchDelayMs : 2000
  const maxPerMinute = deps.maxPerMinute || 20
  const endpoint = deps.endpoint || (() => CLIENT_LOG_PATH)

  const entries = new Map()   // key → { report, windowStart, pending, pendingFirstAt, lastAt }
  let sentAt = []             // instants of the lines sent in the last minute
  let dropped = 0
  let disabled = false
  let timer = null
  let dueAt = Infinity

  const keyOf = (r) => [r.kind, r.status, r.message, r.url, r.actionId, (r.stack || '').split('\n')[0]].join('|')

  function report(input) {
    try {
      if (disabled || !input) return
      if (input.kind === 'cancelled') return
      const url = input.url ? String(input.url) : undefined
      if (url && url.indexOf(CLIENT_LOG_PATH) >= 0) return   // never report the report itself
      if (isNoise(input)) return
      const t = now()
      const r = {
        level: 'error',
        kind: input.kind || 'unknown',
        message: clipText(input.message, MAX.message),
        detail: clipText(input.detail, MAX.detail),
        status: typeof input.status === 'number' ? input.status : undefined,
        url: clipText(redactUrl(url), MAX.url),
        route: clipText(input.route !== undefined ? input.route : routeOfRequestUrl(url), MAX.route),
        actionId: clipText(input.actionId, MAX.actionId),
        source: clipText(input.source, MAX.source),
        traceparent: input.traceparent,
        stack: clipText(input.stack, MAX.stack),
      }
      const key = keyOf(r)
      const existing = entries.get(key)
      if (existing && t - existing.windowStart < windowMs) {
        if (existing.pending === 0) existing.pendingFirstAt = t
        existing.pending++
        existing.lastAt = t
        // repetitions wait for the window to close: one summary line, not one each time
        plan(existing.windowStart + windowMs - t)
        return
      }
      entries.set(key, { report: r, windowStart: t, pending: 1, pendingFirstAt: t, lastAt: t, sent: false })
      plan(batchDelayMs)
    } catch (e) { /* reporting can never break the page */ }
  }

  function plan(ms) {
    const at = now() + Math.max(0, ms)
    if (timer !== null && at >= dueAt) return
    if (timer !== null) cancel(timer)
    dueAt = at
    timer = schedule(() => { timer = null; dueAt = Infinity; flush(false) }, Math.max(0, ms))
  }

  /** The lines that are due now; `final` = the page is going away, everything pending goes out. */
  function takeDue(final) {
    const t = now()
    const lines = []
    for (const [key, e] of entries) {
      const expired = t - e.windowStart >= windowMs
      if (e.pending > 0 && (!e.sent || expired || final)) {
        lines.push({
          ...e.report,
          count: e.pending,
          firstAt: new Date(e.pendingFirstAt).toISOString(),
          lastAt: new Date(e.lastAt).toISOString(),
        })
        e.pending = 0
        e.sent = true
      }
      if (expired && e.pending === 0) entries.delete(key)
    }
    return lines
  }

  function admit(lines) {
    const t = now()
    sentAt = sentAt.filter((s) => t - s < 60000)
    // `dropped` on a line = the ones lost BEFORE it, in earlier sends
    const before = dropped
    const out = []
    for (const line of lines) {
      if (sentAt.length >= maxPerMinute) { dropped++; continue }
      sentAt.push(t)
      out.push(line)
    }
    if (out.length && before) { out[0].dropped = before; dropped -= before }
    return out
  }

  function batches(lines) {
    const out = []
    let current = []
    let size = 2
    for (const line of lines) {
      const json = JSON.stringify(line)
      if (current.length && size + json.length + 1 > MAX_BATCH_CHARS) {
        out.push(current); current = []; size = 2
      }
      current.push(line); size += json.length + 1
    }
    if (current.length) out.push(current)
    return out
  }

  function flush(final = false) {
    try {
      if (disabled) return
      const url = endpoint()
      if (!url) return
      const common = { renderer, userAgent: clipText(deps.userAgent, MAX.userAgent), pageUrl: clipText(redactUrl(deps.pageUrl ? deps.pageUrl() : undefined), MAX.pageUrl) }
      const lines = admit(takeDue(final)).map((l) => JSON.parse(JSON.stringify({ ...common, ...l })))
      for (const batch of batches(lines)) {
        let sent
        try { sent = deps.send(url, JSON.stringify(batch), { final }) } catch (e) { sent = null }
        Promise.resolve(sent).then((status) => {
          if (endpointIsMissing(status)) disabled = true
        }, () => { /* a lost report is not reported */ })
      }
      // repetitions remain waiting for their window to close
      let next = Infinity
      for (const e of entries.values()) {
        if (e.pending > 0) next = Math.min(next, e.windowStart + windowMs)
      }
      if (next !== Infinity && !final) plan(next - now())
    } catch (e) { /* idem */ }
  }

  return {
    report,
    flush,
    isDisabled: () => disabled,
    _pendingCount: () => entries.size,
  }
}

/**
 * The real send: fetch keepalive with the token (the gateway requires it); when hiding the page and without
 * a token, sendBeacon as a last resort. Resolves with the status, or undefined.
 */
export function clientLogSender(headers = () => ({})) {
  return (url, body, { final } = {}) => {
    const auth = headers() || {}
    const hasAuth = Object.keys(auth).length > 0
    if (final && !hasAuth && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
        return Promise.resolve(undefined)
      } catch (e) { /* carry on with fetch */ }
    }
    if (typeof fetch === 'undefined') return Promise.resolve(undefined)
    return fetch(url, {
      method: 'POST',
      keepalive: true,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...auth },
      body,
    }).then((res) => res.status, () => undefined)
  }
}

/** The page's reporter (null until installClientErrorReporting). */
export const clientErrors = {
  _reporter: null,
  report(entry) { if (this._reporter) this._reporter.report(entry) },
}

/** The endpoint for a base: same origin only (another origin carries neither our token nor CORS). */
export function clientLogEndpointOf(base, origin) {
  const b = base || ''
  if (/^https?:\/\//i.test(b)) {
    if (!origin || b.indexOf(origin) !== 0) return null
  }
  return b.replace(/\/+$/, '') + CLIENT_LOG_PATH
}

/**
 * Hooks it into the page: uncaught errors and rejected promises without catch, and the
 * flush when hiding it. Idempotent.
 */
export function installClientErrorReporting(base, options = {}) {
  if (clientErrors._reporter || typeof window === 'undefined') return clientErrors._reporter
  const origin = window.location && window.location.origin
  const reporter = createClientErrorReporter({
    renderer: options.renderer || 'redwood',
    endpoint: () => clientLogEndpointOf(base, origin),
    send: options.send || clientLogSender(options.headers || (() => ({}))),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    pageUrl: () => window.location && window.location.href,
  })
  clientErrors._reporter = reporter
  window.addEventListener('error', (event) => {
    // a resource that does not load (img/script) arrives here without `error`; it is not a JS error
    if (!event || (!event.error && !event.message)) return
    const err = event.error
    reporter.report({
      kind: 'js-error',
      message: event.message || (err && err.message),
      stack: err && err.stack,
      source: event.filename ? `${event.filename}:${event.lineno || 0}:${event.colno || 0}` : undefined,
    })
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event && event.reason
    // an already classified transport failure (and already reported by fetchWithPolicy) is not duplicated
    if (reason && reason.failure) return
    if (reason && (reason.name === 'AbortError')) return
    reporter.report({
      kind: 'unhandled-rejection',
      message: reason && reason.message ? reason.message : clipText(safeString(reason), MAX.message),
      stack: reason && reason.stack,
    })
  })
  window.addEventListener('pagehide', () => reporter.flush(true))
  return reporter
}

function safeString(v) {
  try { return typeof v === 'string' ? v : JSON.stringify(v) } catch (e) { return String(v) }
}
