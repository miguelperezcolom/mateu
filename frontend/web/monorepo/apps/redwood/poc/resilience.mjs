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

import { clientErrors } from './clientLog.mjs'

// ── clasificación ────────────────────────────────────────────────────────────────────────

/** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
export const DEFAULT_TIMEOUT_MS = 60000

const MESSAGES = {
  offline: () => 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
  timeout: () => 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
  server: (s) => `El servidor no ha podido completar la petición${s ? ` (error ${s})` : ''}. Inténtalo de nuevo.`,
  unauthorized: () => 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
  // Un 403 NO es la sesión: el servidor sabe quién eres y dice que no a ESTO (una acción que la
  // vista no declara, un rol que falta). Decir "vuelve a iniciar sesión" mandaba a un login que
  // no arregla nada.
  forbidden: () => 'No tienes permiso para hacer esto.',
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
  if (status === 401) return failure('unauthorized')
  if (status === 403) return failure('forbidden')
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
/**
 * Peticiones que un componente hace PARA SÍ y que ya enseñan su propia carga: nunca encienden la
 * barra de ocupado de la página (la misma regla que el renderer web, localRequests.ts).
 * `search-<campo>`: la búsqueda de opciones de un lookup (y la vacía que llena un select);
 * `code-<campo>`: el rótulo de un código tecleado; `__restfetch__`: un @RestOptions por el servidor.
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
  try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
}

// ── la pantalla en curso ─────────────────────────────────────────────────────────────────

/**
 * Qué pantalla hay: un contador que la navegación sube al empezar a cargar otra (beginView). Una
 * petición de la pantalla (callMateu la estampa sola; no las de fondo: widgets de cabecera, menús
 * remotos, el chat) recuerda la pantalla para la que salió, y su respuesta — buena o mala — que
 * llega cuando ya hay otra muere en silencio: no se pinta, no pone banda de error ni pide
 * reautenticar; sólo libera el ocupado (onSettle sin fallo). Es la misma regla que el renderer web
 * (staleViewGuard.ts): una petición que salió con la pantalla A y vuelve con la B no es de nadie.
 */
export const viewGuard = { generation: 0 }

/** Empieza otra pantalla: lo que siga en vuelo de la anterior ya no se aplicará. */
export function beginView() { return ++viewGuard.generation }

/** La pantalla en curso (para estampar una petición al salir). */
export function currentView() { return viewGuard.generation }

/** ¿Ya no está en pantalla la vista para la que salió una petición? (undefined: no atada a ninguna) */
export function isViewStale(view) { return view != null && view !== viewGuard.generation }

/** El rechazo de una respuesta que llegó para una pantalla que ya no está. */
export function staleResponseError(actionId) {
  const error = new Error(`respuesta a '${actionId || ''}' para una pantalla que ya no está`)
  error.stale = true
  error.code = 'ERR_CANCELED'
  error.failure = { kind: 'cancelled', message: '', retryable: false, status: undefined }
  return error
}

export function isStaleResponse(error) { return !!(error && error.stale === true) }

// ── fetch con política ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/** La cabecera traceparent de una petición, si la llevaba. */
function traceparentOf(init) {
  const h = init && init.headers
  if (!h) return undefined
  if (typeof h.get === 'function') return h.get('traceparent') || undefined
  return h.traceparent || h.Traceparent || undefined
}

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
 * La cabecera con el token, si el bootstrap dejó uno.
 *
 * La página de bootstrap autentica contra Keycloak y guarda el token en
 * `localStorage.__mateu_auth_token`, refrescándolo al caducar. Hasta que esto existió, NADA lo
 * leía: el bridge hacía cada llamada sin cabecera, el gateway respondía 401 y el clasificador de
 * abajo lo traducía a "Tu sesión ya no es válida" — un mensaje cierto sobre el 401 y engañoso
 * sobre la causa, porque la sesión estaba perfectamente viva y la petición sencillamente no la
 * presentaba. La consola cargaba, se quedaba sin un solo menú, y el panel de chat tampoco
 * respondía.
 *
 * Va aquí y no en los tres sitios que construyen cabeceras en transport.mjs, por lo mismo que en
 * el otro renderer es un interceptor de axios y no un parámetro de cada llamada: un punto único
 * que un cuarto sitio no puede olvidar.
 *
 * `localStorage` no existe en Node, donde corre test.mjs, así que se consulta con guarda; y un
 * `Authorization` que el llamante ya haya puesto manda sobre este, que es lo que permite probar
 * el camino sin tocar el almacenamiento.
 */
function authHeaders(init) {
  const already = init && init.headers &&
    (init.headers.Authorization || init.headers.authorization)
  if (already) return null
  const token = storedToken()
  return token ? { Authorization: 'Bearer ' + token } : null
}

/** El token que dejó el bootstrap, o null (sin localStorage, bloqueado o vacío). */
function storedToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
  } catch (e) {
    // Un navegador con el almacenamiento bloqueado. Sin token se sigue: el backend dirá que no,
    // que es mejor que no llamar.
    return null
  }
}

/**
 * La cabecera con el token para una llamada que NO pasa por fetchWithPolicy: el stream del chat
 * del agente (SSE, un fetch propio que lee el cuerpo por trozos). Sin ella el agente contesta
 * 401 y el panel enseña "Servidor respondió 401". {} si no hay token.
 */
export function authHeadersOf() {
  return authHeaders(null) || {}
}

/** El refresco en marcha, si lo hay: los 401 que llegan mientras tanto esperan a éste. */
let reauthInFlight = null

/**
 * Pide a la página que reautentique tras un 401, con el mismo contrato que el renderer de Vaadin
 * (sessionGuard.ts): el evento cancelable 'mateu-session-expired' en document, con
 * {retry, giveUp} en el detail. El bootstrap de Mateu lo atiende — fuerza el refresco del token
 * de Keycloak y llama a retry, o manda al login si la sesión ya no existe. Resuelve true si hay
 * que reenviar la petición; false si nadie lo reclamó o la página desistió.
 *
 * UN refresco para todos: la pestaña vuelve del fondo con el token caducado y el badge del inbox,
 * la sincronización del banner y la acción del usuario vuelven 401 a la vez. Cada una lanzando su
 * evento eran N refrescos forzados en paralelo (y N keycloak.login() si fallaba); ahora los 401
 * que llegan mientras hay uno en marcha esperan a ése y comparten su respuesta.
 *
 * `sentToken` (opcional): el token con el que salió la petición rechazada. Si el que hay ahora es
 * otro, el refresco ya ocurrió mientras la petición volaba — el del visibilitychange, típicamente
 * — y basta con reenviar: forzar otro sería tirar uno recién emitido.
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
 * El punto único por el que pasa TODO el tráfico de este renderer.
 *
 * Y por eso es donde se adjunta el token: es el cliente de Mateu de este renderer, igual que
 * AxiosMateuApiClient lo es del otro.
 *
 * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
 * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
 * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
 * resultado de cara a la UI: un estado de carga, un mensaje.
 */
export async function fetchWithPolicy(url, init, options = {}) {
  // El token se lee en CADA envío, no una vez: tras un 401 el bootstrap deja uno nuevo en
  // localStorage y el reintento tiene que llevar ese, no el caducado.
  // El token con el que salió el ÚLTIMO envío (undefined si no llevaba el nuestro): ante un 401
  // dice si el refresco ya llegó mientras la petición volaba.
  let sentToken
  const withAuth = () => {
    const auth = authHeaders(init)
    sentToken = auth ? auth.Authorization.slice('Bearer '.length) : undefined
    return auth ? { ...(init || {}), headers: { ...((init && init.headers) || {}), ...auth } } : init
  }
  const actionId = options.actionId
  const idempotent = isIdempotentAction(actionId, options.idempotent)
  // `quiet`: una petición de FONDO (el refresco de un widget de cabecera cada pocos segundos) no
  // avisa a los ganchos — la barra de ocupado y la banda de error hablan de lo que hace el usuario.
  // Tampoco la de un componente que ya enseña su propia carga (isLocalRequest): el combo que busca
  // sus opciones gira su propio indicador, y la barra encima eran dos esperas para una tecla
  const quiet = options.quiet || isLocalRequest(actionId)
  const notifyUnlessQuiet = (hook, payload) => { if (!quiet) notify(hook, payload) }
  // `isolated`: lo que pase con esta petición no dice nada de la conexión — el menú de un pod
  // federado, a menudo de otro origen: un pod caído es SU sección no disponible, no "sin conexión"
  const isolated = !!options.isolated
  notifyUnlessQuiet('onStart', { actionId })
  // `view`: la pantalla para la que sale (currentView); su respuesta muere si ya hay otra
  const view = options.view
  const dropStale = () => {
    // el ocupado se apaga (lo encendió esta petición), sin fallo que enseñar
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
      const res = await sendOnce(url, withAuth(), options.timeoutMillis)
      if (!isolated) connectivity.noteReachable()
      if (isViewStale(view)) dropStale()
      notifyUnlessQuiet('onSettle', { actionId, failure: null })
      return res
    } catch (error) {
      if (isStaleResponse(error)) throw error
      // su pantalla ya no está: ni reautenticar, ni reintentar, ni banda
      if (isViewStale(view)) dropStale()
      // Un 401 es, casi siempre, el token caducado entre dos refrescos. Se pide a la página que
      // reautentique y se reenvía UNA vez: el servidor rechazó la petición sin ejecutarla, así
      // que repetirla es seguro también para una escritura. Sin nadie que reautentique, o si el
      // reintento vuelve a dar 401, falla como siempre.
      if (error && error.status === 401 && !reauthenticated) {
        reauthenticated = true
        if (await askForReauthentication(sentToken)) continue
      }
      const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
      if (failure.kind === 'offline' && !isolated) connectivity.noteUnreachable()
      attempt++
      if (!shouldRetry(failure, attempt, { idempotent })) {
        // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
        // fetch", y decide si ofrecer reintentar.
        error.failure = failure
        notifyUnlessQuiet('onSettle', { actionId, failure })
        // al log del servidor (clientLog.mjs): lo que el usuario vio y lo que hubo debajo. Un
        // 'cancelled' no se informa, y la llamada al propio endpoint no pasa por aquí.
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
