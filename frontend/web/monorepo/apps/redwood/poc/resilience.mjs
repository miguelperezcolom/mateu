// Resiliencia del transporte — el mismo contrato que los renderers web (libs/mateu:
// requestPolicy + retryPolicy + connectivity + pendingActions), reescrito para ESTE core,
// que no comparte nada con aquéllos: aquí el transporte es `fetch` pelado, no axios.
//
// Las diferencias que obliga fetch, y que son la razón de que esto no sea un copy-paste:
//   - fetch NO tiene timeout. Sin AbortController una petición puede quedarse colgada para
//     siempre; el usuario ve la pantalla congelada sin error ni fin.
//   - fetch NO rechaza ante un 4xx/5xx: resuelve con `res.ok === false`. El estado hay que
//     leerlo y adjuntarlo al error a mano, o abajo no hay forma de distinguir un 500 de un
//     cable desenchufado.
//   - un fallo de red es un `TypeError` genérico ("Failed to fetch"), y un abort es un
//     `DOMException` con `name === 'AbortError'`. Ninguno trae código propio.
//
// Todo lo de aquí es puro salvo `fetchWithPolicy`, para que test.mjs lo pueda ejercitar en
// Node sin navegador ni backend.

// ── clasificación ────────────────────────────────────────────────────────────────────────

/** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
export const DEFAULT_TIMEOUT_MS = 60000

const MESSAGES = {
  offline: () => 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
  timeout: () => 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
  server: (s) => `El servidor no ha podido completar la petición${s ? ` (error ${s})` : ''}. Inténtalo de nuevo.`,
  unauthorized: () => 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
  notFound: () => 'Esto ya no está disponible. Puede que se haya movido o borrado.',
  client: (s) => `La petición ha sido rechazada${s ? ` (error ${s})` : ''}.`,
  cancelled: () => '',
  unknown: () => 'Algo ha ido mal. Inténtalo de nuevo.',
}

/** Tipos que merece la pena reintentar: o no llegó, o el servidor tuvo un mal momento. */
const RETRYABLE = new Set(['offline', 'timeout', 'server'])

/**
 * Traduce un fallo de transporte a `{ kind, message, retryable, status }`.
 *
 * `online` se inyecta para poder testearlo y porque el llamante tiene una señal mejor que
 * `navigator.onLine` (que miente en portales cautivos).
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

  // Un abort es una decisión NUESTRA (navegación, timeout propio): nunca es noticia para el
  // usuario… salvo cuando lo disparó el timeout, que sí lo es. Los distingue la marca.
  if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
    return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
  }
  if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

  if (status == null) {
    // Sin respuesta: o sabemos que no hay red, o la petición murió antes de llegar.
    if (!online) return failure('offline')
    // fetch resuelve un fallo de red como un TypeError sin más señas.
    if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
      return failure('offline')
    }
    return failure('unknown')
  }
  if (status === 401 || status === 403) return failure('unauthorized')
  if (status === 404 || status === 410) return failure('notFound')
  if (status === 408 || status === 429) return failure('timeout')
  if (status >= 500) return failure('server')
  if (status >= 400) return failure('client')
  return failure('unknown')
}

// ── política de reintento ────────────────────────────────────────────────────────────────

/** Ids de acción del framework que sólo LEEN. '' es la carga de ruta. */
const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

/**
 * Si repetir `actionId` no puede aplicar el mismo cambio dos veces.
 *
 * Por defecto NO: cuando una petición expira no sabemos si el servidor la procesó, así que
 * repetir un `create` arriesga un duplicado silencioso. `declared` es el opt-in del wire
 * (`@Action(idempotent = true)`), que nunca saca a una lectura conocida de la lista.
 */
export function isIdempotentAction(actionId, declared) {
  if (declared === true) return true
  // Un id AUSENTE es trabajo desconocido; uno VACÍO es la carga de ruta. No son lo mismo.
  if (actionId === undefined || actionId === null) return false
  if (ALWAYS_SAFE.has(actionId)) return true
  return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
}

/** Intentos ADEMÁS del primero. */
export const MAX_RETRIES = 2

/** Espera antes del reintento `attempt` (1-based): exponencial con ±25% de jitter. */
export function retryDelayMs(attempt, random = Math.random) {
  const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
  return Math.round(base * (0.75 + random() * 0.5))
}

/**
 * La decisión. `offline` queda deliberadamente fuera: reenviar a los 300 ms con la red caída
 * sólo quema el presupuesto de intentos — de la reconexión se encarga `connectivity`.
 */
export function shouldRetry(failure, attempt, options = {}) {
  if (!options.idempotent) return false
  if (attempt > MAX_RETRIES) return false
  if (!failure.retryable) return false
  return failure.kind === 'timeout' || failure.kind === 'server'
}

// ── conectividad ─────────────────────────────────────────────────────────────────────────

/**
 * Una respuesta honesta a "¿llegamos?".
 *
 * `navigator.onLine` informa del enlace, no del camino: dice true en un portal cautivo y con
 * una VPN que perdió la ruta. Sirve como negativo duro; el positivo lo da nuestro propio
 * tráfico volviendo.
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
      this._reachable = undefined   // el enlace vuelve, el camino está por demostrar
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

// ── guard de doble envío ─────────────────────────────────────────────────────────────────

/** Válvula de seguridad: pasado este tiempo una entrada se da por muerta y se libera. */
const STALE_MS = 120000

export const pendingActions = {
  _started: new Map(),

  key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

  /** Reclama el hueco. false = ya hay una idéntica en vuelo y ésta es un duplicado. */
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

// ── ganchos de ciclo de vida ─────────────────────────────────────────────────────────────

/**
 * Cómo la app (VB) se entera de que hay trabajo en vuelo, sin que el core sepa nada de VB.
 * `onStart` recibe {actionId}; `onSettle` recibe {actionId, failure} (failure null si fue bien).
 */
export const transportHooks = { onStart: null, onSettle: null }

export function setTransportHooks(hooks) {
  transportHooks.onStart = (hooks && hooks.onStart) || null
  transportHooks.onSettle = (hooks && hooks.onSettle) || null
}

const notify = (which, payload) => {
  const fn = transportHooks[which]
  if (!fn) return
  try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
}

// ── fetch con política ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Un envío: aplica el timeout (fetch no trae ninguno) y convierte un 4xx/5xx en un error que
 * LLEVA el status, porque fetch resuelve esos como éxito y abajo no habría forma de saberlo.
 */
async function sendOnce(url, init, timeoutMillis) {
  // Negativo = SIN ceiling, para un stream que dura lo que dure (LongTask). Distinto de 0 /
  // ausente, que significa "usa el de por defecto".
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
    // Un abort disparado por NUESTRO timeout debe leerse como timeout, no como cancelación:
    // el usuario sí tiene que enterarse.
    if (timedOut && e) e.__mateuTimedOut = true
    throw e
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * El punto único por el que pasa TODO el tráfico de este renderer.
 *
 * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
 * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
 * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
 * resultado de cara a la UI: un estado de carga, un mensaje.
 */
export async function fetchWithPolicy(url, init, options = {}) {
  const actionId = options.actionId
  const idempotent = isIdempotentAction(actionId, options.idempotent)
  notify('onStart', { actionId })
  let attempt = 0
  for (;;) {
    try {
      const res = await sendOnce(url, init, options.timeoutMillis)
      connectivity.noteReachable()
      notify('onSettle', { actionId, failure: null })
      return res
    } catch (error) {
      const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
      if (failure.kind === 'offline') connectivity.noteUnreachable()
      attempt++
      if (!shouldRetry(failure, attempt, { idempotent })) {
        // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
        // fetch", y decide si ofrecer reintentar.
        error.failure = failure
        notify('onSettle', { actionId, failure })
        throw error
      }
      await delay(retryDelayMs(attempt))
    }
  }
}
