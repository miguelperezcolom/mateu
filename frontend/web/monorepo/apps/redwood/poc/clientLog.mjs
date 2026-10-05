// Errores del cliente → log del servidor: lo que este renderer enseña o sufre (un fallo de
// transporte clasificado, un error de JS sin capturar, una promesa rechazada sin catch) viaja a
// POST <base>/mateu/v3/client-log, que escribe UNA línea `client-error {...}` por informe en el
// logger "mateu.client". Mismo contrato que el renderer de Vaadin (libs/mateu clientErrorReporter.ts).
//
// Por qué: un «Tu sesión ya no es válida» que vio el usuario no dejaba rastro en el servidor — el
// ingress no mostraba ningún 401/403 para él. Ahora queda una línea que buscar en Loki.
//
// Reglas:
//   - nunca informa de sus propios fallos (la llamada al endpoint no pasa por fetchWithPolicy, sus
//     errores se tragan, y un error cuyo url es el endpoint se descarta): sin bucles;
//   - 'cancelled' no es un error;
//   - el mismo error repetido dentro de la ventana es UNA línea con `count` + firstAt/lastAt: la
//     primera aparición sale enseguida y las repeticiones van en una línea resumen al cerrar la
//     ventana (o al salir de la página);
//   - como mucho `maxPerMinute` líneas por minuto y página; las que no caben se cuentan en `dropped`
//     de la siguiente;
//   - una respuesta que dice que no hay endpoint (404/405, o un backend sin él que se lo traga como
//     acción) lo apaga para la página — ver endpointIsMissing.
//
// El envío principal es fetch keepalive CON el Authorization (el gateway exige el Bearer en
// /mateu/v3); sendBeacon no puede llevar cabeceras, así que sólo se usa al ocultar la página y sin
// token.
//
// Puro salvo installClientErrorReporting (que toca window): test.mjs lo ejercita con reloj,
// temporizador y envío inyectados.

export const CLIENT_LOG_PATH = '/mateu/v3/client-log'

const MAX = { message: 1000, detail: 1000, stack: 4000, url: 1000, pageUrl: 1000, source: 500, route: 500, actionId: 200, userAgent: 300 }
const MAX_BATCH_CHARS = 14000
// Valores de query que nunca deben acabar en un log: el código/estado del login de Keycloak, tokens.
const SECRET_PARAMS = /^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i

const clipText = (s, max) => {
  if (s === undefined || s === null) return undefined
  const text = String(s)
  return text.length > max ? text.slice(0, max) + '…' : text
}

/** La URL sin fragmento y con los parámetros sensibles enmascarados. */
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

/** La ruta Mateu de una URL de transporte (/mateu/v3/sync/<ruta>), o undefined. */
export function routeOfRequestUrl(url) {
  if (!url) return undefined
  const m = /\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(String(url))
  if (!m) return undefined
  return m[1] === '_no_route' ? '' : '/' + m[1]
}

/**
 * Si la respuesta dice que aquí no hay endpoint: un 404/405 (backend antiguo o
 * mateu.client-log.enabled=false), o un backend cuyo controlador genérico /mateu/v3/** se tragó el
 * informe como si fuera una acción (un 2xx que no es 204, un 400, un 500). Lo pasajero — sin
 * respuesta, 401/403 de un token caducado, 413, 429, 502-504 del gateway — no lo apaga.
 */
export function endpointIsMissing(status) {
  if (status === undefined || status === null || status === 0 || status === 204) return false
  if (status === 401 || status === 403 || status === 413 || status === 429 || status >= 502) return false
  return true
}

/** Ruido conocido que no es un error de la aplicación. */
function isNoise(entry) {
  const msg = entry.message || ''
  return /ResizeObserver loop/i.test(msg)
}

/**
 * Un informador. `deps`: { renderer, endpoint() → url o null, send(url, body, {final}) → Promise
 * de un status (o undefined), now() → ms, schedule(fn, ms) → handle, cancel(handle), userAgent,
 * pageUrl() }. Todo opcional salvo `send` para los tests.
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

  const entries = new Map()   // clave → { report, windowStart, pending, pendingFirstAt, lastAt }
  let sentAt = []             // instantes de las líneas enviadas en el último minuto
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
      if (url && url.indexOf(CLIENT_LOG_PATH) >= 0) return   // nunca informar del propio informe
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
        // las repeticiones esperan al cierre de la ventana: una línea resumen, no una por vez
        plan(existing.windowStart + windowMs - t)
        return
      }
      entries.set(key, { report: r, windowStart: t, pending: 1, pendingFirstAt: t, lastAt: t, sent: false })
      plan(batchDelayMs)
    } catch (e) { /* informar nunca puede romper la página */ }
  }

  function plan(ms) {
    const at = now() + Math.max(0, ms)
    if (timer !== null && at >= dueAt) return
    if (timer !== null) cancel(timer)
    dueAt = at
    timer = schedule(() => { timer = null; dueAt = Infinity; flush(false) }, Math.max(0, ms))
  }

  /** Las líneas que tocan ya; `final` = la página se va, sale todo lo pendiente. */
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
    // `dropped` en una línea = las que se perdieron ANTES de ella, en envíos anteriores
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
        }, () => { /* un informe perdido no se informa */ })
      }
      // quedan repeticiones esperando el cierre de su ventana
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
 * El envío real: fetch keepalive con el token (el gateway lo exige); al ocultar la página y sin
 * token, sendBeacon como último recurso. Resuelve con el status, o undefined.
 */
export function clientLogSender(headers = () => ({})) {
  return (url, body, { final } = {}) => {
    const auth = headers() || {}
    const hasAuth = Object.keys(auth).length > 0
    if (final && !hasAuth && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
        return Promise.resolve(undefined)
      } catch (e) { /* sigue por fetch */ }
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

/** El informador de la página (null hasta installClientErrorReporting). */
export const clientErrors = {
  _reporter: null,
  report(entry) { if (this._reporter) this._reporter.report(entry) },
}

/** El endpoint para una base: sólo mismo origen (otro origen no lleva nuestro token ni CORS). */
export function clientLogEndpointOf(base, origin) {
  const b = base || ''
  if (/^https?:\/\//i.test(b)) {
    if (!origin || b.indexOf(origin) !== 0) return null
  }
  return b.replace(/\/+$/, '') + CLIENT_LOG_PATH
}

/**
 * Lo engancha a la página: los errores sin capturar y las promesas rechazadas sin catch, y el
 * vaciado al ocultarla. Idempotente.
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
    // un recurso que no carga (img/script) llega aquí sin `error`; no es un error de JS
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
    // un fallo de transporte ya clasificado (y ya informado por fetchWithPolicy) no se duplica
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
