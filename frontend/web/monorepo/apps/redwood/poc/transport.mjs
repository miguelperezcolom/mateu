// Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
// "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
// sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
// testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).

import { actionSucceeded } from './polling.mjs'
import { reduceContexts, mediatorOf, HOST_ID, formLookupsOf, markLookupsLoaded, actionTransportOf, splitNestedApps, onLoadTriggers, listingOf, pendingSubresourcesOf } from './reduceContexts.mjs'
import { fetchWithPolicy, pendingActions, isIdempotentAction, currentView, isViewStale, staleResponseError } from './resilience.mjs'
import { awaitBundle, hasBundle, bundledIncrementFor } from './bundle.mjs'
import { asSection, labelledByShell, markHidden, unavailableMount, localMenuOptionOf } from './navTree.mjs'
import { currentMount, pathOfRoute } from './mount.mjs'

/** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction).
 *  Sale ATADA a la pantalla en curso (resilience.currentView): si cuando contesta ya hay otra, la
 *  respuesta se descarta en silencio. Las de fondo (quiet/isolated: widgets, menús remotos) no
 *  son de ninguna pantalla; `options.view` la fija a mano (null: de ninguna). */
export async function callMateu(base, body, options = {}) {
  const view = options.view !== undefined ? options.view
    : (options.quiet || options.isolated) ? null : currentView()
  const bare = (body.route || '').replace(/^\//, '')
  const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appState: {},
      componentState: {},
      parameters: {},
      initiatorComponentId: '',
      consumedRoute: '',
      serverSideType: undefined,
      ...body,
      route: bare ? `/${bare}` : '',
    }),
  }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent, quiet: options.quiet, isolated: options.isolated, view })
  const increment = await res.json()
  // el cuerpo también tarda: lo que llegue después de cambiar de pantalla tampoco se aplica
  if (isViewStale(view)) throw staleResponseError(body.actionId)
  return increment
}

/** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico.
 *  Static-bundle: la shell NO se exporta (el bundle guarda cargas de ruta, no el __load__ del App),
 *  así que en modo híbrido (bundle + backend) el menú sale del backend como siempre; pero si el
 *  backend NO está (despliegue estático puro) y el bundle trae la ruta raíz, se cae a ella para que
 *  la app arranque igual. Sólo en el fallo — el camino feliz no cambia. */
export async function bootstrapShell(base, initiator = 'shell') {
  await awaitBundle()
  try {
    const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
    }, { actionId: '__load__' })
    return res.json()
  } catch (e) {
    if (hasBundle()) {
      const bundled = bundledIncrementFor('', initiator)
      if (bundled) return bundled
    }
    throw e
  }
}

/** Ruta INTERNA de un mediador/isla tras un flip de state._route: base del outbound +
 *  flip + marcadores query (los ?_embeddedMediator=1&_inline=1 deben seguir viajando). */
export function composeInnerRoute(outboundRoute, flip) {
  if (!flip || flip === '/' ) return outboundRoute
  const queryIndex = outboundRoute.indexOf('?')
  const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
  const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
  return base + flip + query
}

/**
 * La base de un crud de PÁGINA a la que se pegan sus rutas internas (`/QN29HB`, `/QN29HB/edit`,
 * `/new`): su `consumedRoute`, no la ruta con la que se cargó. Entrando desde el listado las dos
 * coinciden (`/booking/bookings`), pero un detalle abierto por enlace directo se carga con
 * `/booking/bookings/QN29HB` y lo consumido es `/booking/bookings`: pegar ahí el `/QN29HB/edit`
 * del Edit daba `/booking/bookings/QN29HB/QN29HB/edit`. Solo cuando lo consumido es un prefijo de
 * la ruta; un mediador embebido (sin consumedRoute) conserva su ruta y sus marcadores de query.
 */
export function mediatorBaseOf(outbound, fallbackRoute = '') {
  const o = outbound || {}
  const own = o.route && o.route !== 'null' && o.route !== 'undefined' ? o.route : ''
  const route = own || (fallbackRoute && fallbackRoute !== 'null' ? fallbackRoute : '')
  const consumed = o.consumedRoute
  if (!consumed || consumed === '_empty' || !consumed.startsWith('/')) return route
  const queryIndex = route.indexOf('?')
  const path = queryIndex >= 0 ? route.slice(0, queryIndex) : route
  const query = queryIndex >= 0 ? route.slice(queryIndex) : ''
  if (path !== consumed && path.startsWith(consumed + '/')) return consumed + query
  return route
}

/**
 * ¿La respuesta a una acción pide recargar la ruta interna del mediador? Devuelve esa ruta, o
 * null si no hay flip.
 *
 * Un crud de PÁGINA no contesta el detalle: contesta un fragmento SOLO-ESTADO cuyo `_route`
 * apunta a él (clic de fila → `/2CSXZN`, New → `/new`), que significa "recarga mi ruta interna
 * con este estado". Quien no sigue el flip se queda mirando el listado: la petición sale, el
 * servidor contesta 200, y no pasa nada — el fallo más difícil de ver de todos.
 *
 * El criterio es SEMÁNTICO (comparar el valor de `_route` antes y después), no por identidad:
 * los objetos de VB son proxies y las referencias no dicen nada.
 */
export function routeFlipOf(previousState, nextCtx, increment, fallbackRoute = '') {
  const stateOnly = increment && (increment.fragments || []).length > 0
    && (increment.fragments || []).every((f) => !f.component)
  if (!stateOnly || !nextCtx || !nextCtx.state) return null
  const flip = nextCtx.state._route
  const previous = previousState ? previousState._route : undefined
  if (flip == null || flip === previous) return null
  const outbound = nextCtx.outbound || {}
  return composeInnerRoute(mediatorBaseOf(outbound, fallbackRoute), flip)
}

// ── a mount whose @UI is not an App ───────────────────────────────────────────────────────────
// @UI("/hello") on a plain page, @UI("/products") on a crud: the bootstrap (components/_/action)
// answers the page itself or nothing at all ("__load__ not supported by ProductsCrud") — never an
// App with a menu —, so there is no shell and no home route. Its home is the mount's own UI, which
// the sync endpoint resolves for a FRESH load: route '' with consumedRoute '_empty', exactly what
// the web renderer sends on a deep link or a reload. The shell remembers that the mount has no App
// and the home load ('' or '/') goes out that way.
let mountWithoutApp = false

/** Did the bootstrap answer an App (the root of a console with its menu)? */
export function bootstrapHasApp(increment) {
  const fragments = (increment && increment.fragments) || []
  return fragments.some((f) => {
    const c = f && f.component
    if (!c) return false
    if (c.metadata && c.metadata.type === 'App') return true
    return (c.children || []).some((child) => child && child.metadata && child.metadata.type === 'App')
  })
}

export function setMountWithoutApp(value) { mountWithoutApp = !!value }

/** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
 *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
 *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
 *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
export const loadRoute = async (base, route, initiator = '', extra = {}) => {
  // the home of a mount whose @UI is not an App: a fresh load of the mount — see bootstrapHasApp
  if ((!route || route === '/') && mountWithoutApp && !extra.consumedRoute && extra.serverSideType == null) {
    extra = { ...extra, consumedRoute: '_empty' }
  } else if (mountWithoutApp && route && route !== '/') {
    // …and below the mount (a deep link to /products/new): with no App to resolve it relative to,
    // the server knows the crud's inner routes by their full path, mount included
    route = pathOfRoute(route, currentMount())
  }
  await awaitBundle()
  if (hasBundle()) {
    const bundled = bundledIncrementFor(route, initiator)
    if (bundled) return bundled
  }
  return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
}

/** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
 *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
 *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
export function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
  // los OnSuccess (refresco periódico) se leen del contexto que LANZA la acción
  const source = ctx
  // la acción va al ServerSide que la DECLARA (la vista, no el mediador que la cargó): también
  // los triggers — el OnLoad «actualizar» de una vista cargada por un crud —, no sólo los botones
  ctx = actionTransportOf(ctx, actionId)
  const outbound = (ctx && ctx.outbound) || {}
  // Una superficie cargada de otro pod sigue hablando con ESE pod. La base viaja en el
  // outbound por la misma razón que los 4 campos de ruta: quien dispara una acción (el
  // trigger `search` de un listado, un botón del toolbar) sabe de qué contexto sale, pero
  // no de qué backend vino — y mandarla a la shell la contesta vacía, sin error.
  base = outbound.baseUrl != null ? outbound.baseUrl : base
  const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
  // Guard de doble envío. Una lectura queda EXENTA de la exclusividad: el guard existe porque
  // un segundo POST de una escritura significa una segunda fila, mientras que una segunda
  // lectura sólo significa datos más frescos — y bloquearlas rompería el type-ahead, donde la
  // búsqueda de "mad" se descartaría por estar en vuelo la de "ma".
  const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
  const key = pendingActions.key(initiator, actionId)
  if (exclusive && !pendingActions.begin(key)) {
    // Duplicado: se descarta ANTES de construir la petición.
    return Promise.resolve(null)
  }
  const release = () => { if (exclusive) pendingActions.end(key) }
  return callMateu(base, {
    route: outbound.route || route,
    consumedRoute: outbound.consumedRoute || '',
    actionId,
    componentState: componentState || (ctx && ctx.state) || {},
    serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
    initiatorComponentId: initiator,
    ...extra,
  }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
    .then((inc) => {
      release()
      if (inc) actionSucceeded(source, actionId)
      return inc
    }, (e) => { release(); throw e })
}

/**
 * Carga las opciones de los lookups REMOTOS de un contexto que aún no las tienen (los campos
 * editables de su formulario y los filtros de su listado; formLookupsOf): una búsqueda vacía
 * por lookup (`search-<campo>`, hasta 200), en paralelo, contra el ServerSide que la declara
 * — o el mediador, que la resuelve con la clase de sus filtros —, con el estado del contexto.
 * Cada respuesta deja sus opciones en ctx.data[campo]; se marcan como cargadas también las que
 * fallan, para no repetirlas en cada acción. Devuelve el registro nuevo.
 */
export async function loadLookups(base, reg, ctxId = HOST_ID, opts = {}) {
  const ctx = reg && reg.contexts && reg.contexts[ctxId]
  const pending = formLookupsOf(ctx)
  if (!pending.length) return reg
  const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
  const found = await Promise.all(pending.map((lookup) =>
    runMateuAction(base, actionTransportOf(ctx, lookup.actionId), opts.route || '', lookup.actionId, state, {
      parameters: { searchText: '', fieldId: lookup.fieldId, size: 200, page: 0 },
      appState: opts.appState || {},
      idempotent: true,
    }).catch(() => null)))
  let out = reg
  for (const inc of found) {
    // sólo los DATOS: un lookup que falla no debe pintar su error encima de la pantalla
    if (inc) out = reduceContexts(out, { fragments: (inc.fragments || []).filter((f) => !f.component) })
  }
  return markLookupsLoaded(out, ctxId, pending.map((lookup) => lookup.fieldId))
}

/** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
 *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
 *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
 *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
 *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
 *  callback, comportamiento clásico: lista completa al acabar. */
export async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
  const { onIncrement, ...bodyExtra } = extra || {}
  // atada a la pantalla en curso, como callMateu: cada increment se comprueba al llegar
  const view = currentView()
  ctx = actionTransportOf(ctx, actionId)
  const outbound = (ctx && ctx.outbound) || {}
  base = outbound.baseUrl != null ? outbound.baseUrl : base
  const effectiveRoute = outbound.route || route || ''
  const bare = effectiveRoute.replace(/^\//, '')
  // Sin timeout: un LongTask mantiene el stream abierto por diseño, así que un ceiling lo
  // mataría a mitad. Pasa igualmente por la política para que el fallo llegue clasificado.
  const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      appState: {},
      componentState: componentState || (ctx && ctx.state) || {},
      parameters: {},
      initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
      consumedRoute: outbound.consumedRoute || '',
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      ...bodyExtra,
      route: bare ? `/${bare}` : '',
      actionId,
    }),
  }, { actionId, timeoutMillis: -1, view })
  const increments = []
  let reader
  const handle = async (raw) => {
    const line = raw.trim()
    if (!line.startsWith('data:')) return
    if (isViewStale(view)) {
      if (reader && reader.cancel) reader.cancel().catch(() => undefined)
      throw staleResponseError(actionId)
    }
    const inc = JSON.parse(line.slice(5).trim())
    const consumed = onIncrement ? await onIncrement(inc) : false
    if (!consumed) increments.push(inc)
  }
  if (res.body && res.body.getReader) {
    reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let cut
      while ((cut = buffer.indexOf('\n\n')) >= 0) {
        await handle(buffer.slice(0, cut))
        buffer = buffer.slice(cut + 2)
      }
    }
    if (buffer.trim()) await handle(buffer)
  } else {
    for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
  }
  return increments
}

/**
 * Un mediador cuyo WRAPPER llega como App de chrome (ClientSide type App) en vez de envuelto en un
 * ServerSide. Es la forma que hoy manda el backend al abrir una opción de menú: el mismo App que en
 * el bootstrap, pero pedido para una SUB-ruta (route por debajo de rootRoute). reduceContexts lo
 * absorbe como shell y el contexto queda vacío, así que mediatorOf(host) no lo detecta y la 2ª carga
 * —la del contenido real: search form + listado del crud— nunca se dispara. Se lee entonces del
 * incremento: si trae un App cuyo rootRoute es prefijo de la ruta pedida, hay contenido que buscar.
 *
 * La raíz del app (route === rootRoute) es la shell/home y NO pasa por aquí: la resuelve el
 * bootstrap. Sólo una navegación por debajo de la raíz necesita el segundo salto.
 */
function mediatorFromShellApp(increment, route) {
  for (const fr of increment?.fragments || []) {
    const c = fr.component
    const md = c?.metadata
    if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
    const rootRoute = md.rootRoute || ''
    if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
      return {
        rootRoute: md.homeConsumedRoute || rootRoute,
        serverSideType: md.homeServerSideType ?? md.serverSideType,
      }
    }
  }
  return null
}

/** ¿La carga contestó el «Not found.» del servidor (un Text suelto, sin ServerSide)? */
export function isServerNotFound(ctx) {
  const t = ctx && ctx.tree
  return !!(t && t.type === 'ClientSide' && t.metadata && t.metadata.type === 'Text'
    && /^not found\.?$/i.test(String(t.metadata.text || '').trim()))
}

/** La ruta TERMINAL de una entrada de menú dentro de un grupo (/gestion/island-host → /island-host),
 *  o null si no cuelga de ningún grupo. */
export function terminalMenuRouteOf(menu, route) {
  const path = String(route || '').split('?')[0]
  const query = String(route || '').slice(path.length)
  let found = null
  const visit = (options, parent) => {
    for (const o of options || []) {
      const r = o && (o.route || o.path)
      if (!r) continue
      if (parent && r === path && r.indexOf(parent + '/') === 0) found = r.slice(parent.length) + query
      visit(o.submenus || o.submenu, r)
    }
  }
  visit(menu, '')
  return found
}

/**
 * Carga una ruta del MENÚ LOCAL: la compuesta con el serverSideType del app que la declara (lo
 * que hace Vaadin al elegir la opción); si el servidor no la reconoce —un RouteLink metido en un
 * grupo apunta a una ruta absoluta que no es camino de menú— se reintenta por la terminal.
 * Una ruta que no es del menú se carga tal cual.
 */
export async function loadMenuRouteInto(base, reg, route, targetId = '', extra = {}) {
  const shell = (reg && reg.shell) || {}
  const option = localMenuOptionOf(shell.menu, route)
  if (!option) return loadRouteInto(base, reg, route, targetId, extra)
  const next = await loadRouteInto(base, reg, route, targetId,
    { ...extra, serverSideType: option.serverSideType || shell.serverSideType })
  const terminal = terminalMenuRouteOf(shell.menu, route)
  if (terminal && isServerNotFound(next.contexts[targetId === '' ? HOST_ID : targetId]))
    return loadRouteInto(base, reg, terminal, targetId, extra)
  return next
}

/**
 * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
 * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
 * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
 */
export async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
  // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
  // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
  // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
  let firstIncrement = await loadRoute(base, route, targetId, extra)
  const ctxId = targetId === '' ? HOST_ID : targetId
  let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
  // La CADENA de rutas (P1): un registro con pestañas que son páginas llega como uno o varios Apps
  // ANIDADOS (el maestro) antes de la pantalla de su hueco. Cada uno es un NIVEL (título +
  // pestañas), no la shell; se sigue su home hasta llegar al contenido.
  const shellType = reg && reg.shell ? reg.shell.serverSideType : undefined
  const appLevels = []
  // la ruta que de verdad se carga: un maestro alcanzado solo (/customers/7) abre su pestaña
  // por defecto (/customers/7/orders)
  let effectiveRoute = route
  for (let hop = 0; hop < 4; hop++) {
    const split = splitNestedApps(firstIncrement, shellType, route)
    if (!split.levels.length) break
    appLevels.push(...split.levels)
    const home = split.levels[split.levels.length - 1].home
    effectiveRoute = home.route || effectiveRoute
    outbound = { route: effectiveRoute, consumedRoute: home.consumedRoute || '', serverSideType: home.serverSideType, baseUrl: base }
    firstIncrement = await loadRoute(base, effectiveRoute, targetId, {
      ...extra,
      consumedRoute: outbound.consumedRoute,
      serverSideType: outbound.serverSideType,
    })
  }
  let next = reduceContexts(reg, firstIncrement)
  // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
  // la carga de contenido las pierde, así que se conservan aquí
  const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
  const wrapperActions = (wrapperTree && wrapperTree.actions) || []
  const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, effectiveRoute)
  if (info) {
    // the home of a mount whose @UI is a crud (route '' or '/', a fresh load): the mediator names
    // the route of its content — the crud's own path
    if ((!effectiveRoute || effectiveRoute === '/') && info.homeRoute) effectiveRoute = info.homeRoute
    outbound = {
      route: effectiveRoute,
      consumedRoute: info.rootRoute || effectiveRoute,
      serverSideType: info.serverSideType,
      baseUrl: base,
    }
    next = reduceContexts(
      next,
      await loadRoute(base, effectiveRoute, targetId, {
        ...extra,
        consumedRoute: outbound.consumedRoute,
        serverSideType: outbound.serverSideType,
      }),
    )
  }
  // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
  // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada).
  // sseActionIds: acciones anunciadas Action.sse(true) — van por el endpoint /sse
  next = {
    ...next,
    contexts: {
      ...next.contexts,
      [ctxId]: {
        ...next.contexts[ctxId],
        outbound,
        sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
      },
    },
  }
  // los niveles de app (maestros) de la pantalla del HOST: una barra de pestañas por nivel
  if (targetId === '') next = { ...next, appLevels, loadedRoute: effectiveRoute }
  return next
}

/**
 * Carga un @Subresource (subresourceIslandOf) en SU contexto: la carga por su tipo — sin el baile
 * del mediador: el App que lo envuelve ya dice qué clase es — con el estado que le siembra el padre,
 * y su búsqueda OnLoad (las filas). Devuelve el registro nuevo.
 */
export async function loadSubresource(base, reg, sub, extra = {}) {
  const outbound = { route: sub.route, consumedRoute: sub.consumedRoute, serverSideType: sub.serverSideType, baseUrl: base }
  let next = reduceContexts(reg, await loadRoute(base, sub.route, sub.id, {
    ...extra,
    consumedRoute: sub.consumedRoute,
    serverSideType: sub.serverSideType,
    componentState: sub.componentState || {},
  }))
  next = { ...next, contexts: { ...next.contexts, [sub.id]: { ...next.contexts[sub.id], outbound } } }
  for (const triggerActionId of onLoadTriggers(next.contexts[sub.id])) {
    const ctx = next.contexts[sub.id]
    const listing = listingOf(ctx)
    const componentState = { ...(sub.componentState || {}), ...(ctx.state || {}), page: 0, size: (listing && listing.pageSize) || 10 }
    const increment = await runMateuAction(base, ctx, sub.route, triggerActionId, componentState, extra)
    if (increment) next = reduceContexts(next, increment)
  }
  return next
}

/**
 * Carga los @Subresource que el contenido deja a la vista y aún no están cargados (los de la
 * pestaña activa: lo que está en otra pestaña espera a que se abra). Uno que falla se queda como
 * hueco: no tumba la pantalla.
 */
export async function loadSubresources(base, reg, blocks, extra = {}) {
  let next = reg
  for (const sub of pendingSubresourcesOf(blocks, next.contexts)) {
    try {
      next = await loadSubresource(base, next, sub, extra)
    } catch (ignored) { /* la banda de error ya lo cuenta (onSettle) */ }
  }
  return next
}

/**
 * De qué backend se cargó una superficie, o undefined si aún no se sabe.
 *
 * Una isla se carga con `loadRouteInto`, que recibe la base como argumento: la cadena que la
 * dispara conoce el id del contexto, no el pod. Preguntándoselo al HOST (el valor por defecto)
 * la isla se carga de donde vino la pantalla que la contiene, que es lo que siempre quiere.
 */
export function baseOf(reg, ctxId = HOST_ID) {
  const ctx = reg && reg.contexts && reg.contexts[ctxId]
  return ctx && ctx.outbound ? ctx.outbound.baseUrl : undefined
}

// ── menús federados ────────────────────────────────────────────────────────────────────────
//
// Una shell declara secciones que sirve OTRO pod: `RemoteMenu("/_workflow")`. El árbol que llega
// en el bootstrap trae esas opciones marcadas `remote` y SIN hijos — los hijos son del pod, y hay
// que ir a buscarlos. Hasta ahora este renderer no lo hacía: pintaba el rótulo que la shell había
// escrito y nada debajo, que se lee como "ese servicio no tiene pantallas" en vez de como "nadie
// se lo ha preguntado".
//
// Lo que sigue es la mitad fácil. La otra está en la navegación: una entrada traída de otro pod
// solo se puede cargar llamando a ESE pod, y este bridge llamaba siempre al base de la shell. Por
// eso cada opción adoptada queda registrada en `remoteRoutes`, y la cadena de navegación consulta
// ahí a dónde tiene que ir. Sin esa segunda mitad, expandir el menú es peor que no expandirlo:
// aparecen entradas que al pulsarlas no llevan a ninguna parte.

/** Ruta de menú → dónde vive de verdad. La llena expandRemoteMenus; la lee la navegación. */
const remoteRoutes = new Map()

/**
 * Dónde vive una ruta, o undefined si la sirve la propia shell.
 *
 * Casa también por PREFIJO, con el registro más largo que encaje: al registro solo llegan las
 * rutas del MENÚ (`/workflow/processes`), y todo lo que cuelga de ellas —el detalle de un
 * proceso, `/new`, `/{id}/edit`— vive en el mismo pod. Sin esto, un deep-link a
 * `/workflow/processes/<id>` salía al backend de la shell, que contesta "Not found.".
 */
export function remoteRouteOf(route) {
  if (route == null) return undefined
  const bare = String(route).replace(/^\//, '')
  const exact = remoteRoutes.get(route) || remoteRoutes.get(bare)
  if (exact) return exact
  let best = null
  let bestLength = -1
  for (const [registered, descriptor] of remoteRoutes) {
    const prefix = String(registered).replace(/^\//, '')
    if (!prefix || prefix.length <= bestLength) continue
    if (bare === prefix || bare.indexOf(prefix + '/') === 0) {
      best = descriptor
      bestLength = prefix.length
    }
  }
  return best || undefined
}

/**
 * Registra a qué pod va una ruta que NO vino del menú: la navegación que pide un widget remoto
 * (el enlace del badge de la bandeja emite navigation-requested con su baseUrl y su
 * serverSideType). Una ruta que el menú ya registró se queda como está — el menú manda.
 */
export function registerRemoteRoute(route, descriptor) {
  if (!route || !descriptor || !descriptor.baseUrl || remoteRouteOf(route)) return false
  const entry = {
    baseUrl: descriptor.baseUrl,
    consumedRoute: descriptor.consumedRoute || '',
    serverSideType: descriptor.serverSideType,
    uriPrefix: descriptor.uriPrefix || '',
  }
  remoteRoutes.set(route, entry)
  remoteRoutes.set(String(route).replace(/^\//, ''), entry)
  return true
}

const childrenOf = (option) => option.submenus || option.submenu || []

/** Las opciones remotas del árbol, a cualquier profundidad.
 *  No se baja DENTRO de una remota: lo que cuelgue de ella es del pod, y aún no ha contestado. */
function collectRemoteMenus(menu, found = []) {
  for (const option of menu || []) {
    if (option.remote) found.push(option)
    else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
  }
  return found
}

/** El menú del App que contesta un pod, o null si no contestó con uno. */
function appMenuOf(increment) {
  for (const fragment of (increment && increment.fragments) || []) {
    const md = (fragment.component && fragment.component.metadata) || {}
    if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
      return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
    }
  }
  return null
}

/**
 * Marca las hojas traídas de un pod con dónde vive ese pod.
 *
 * Solo las que no traen `baseUrl` propio: un pod puede a su vez federar, y su respuesta ya viene
 * resuelta. Un grupo no se marca, se recorre — lo que navega es la hoja.
 */
function adoptRemote(menu, option, app) {
  const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
  for (const child of menu || []) {
    if (child.baseUrl) continue
    if (childrenOf(child).length) {
      adoptRemote(childrenOf(child), option, app)
      // El grupo también es del pod: lo que cuelga de su ruta y no es ninguna de sus hojas —la
      // página de UNA tarea, /forms/task/<id>, bajo el grupo /forms cuyas hojas son /forms/tasks
      // y /forms/executions— vive en el mismo pod. Es lo que reclama el servidor de la shell
      // (RemoteMenuHandler.claimLength cuenta todas las rutas del menú, grupos incluidos); sin
      // esto ese deep-link salía al backend de la shell, que contesta "Not found.". Solo como
      // prefijo de respaldo: remoteRouteOf se queda con el registro más largo, así que una hoja
      // sigue ganándole al grupo que la contiene. El grupo no se marca: lo que navega es la hoja.
      registerGroupRoute(child.route || child.path || '', option, app, serverSideType)
      continue
    }
    child.baseUrl = option.baseUrl
    child.consumedRoute = app.route || ''
    child.serverSideType = serverSideType
    child.uriPrefix = option.route
    const descriptor = {
      baseUrl: option.baseUrl,
      consumedRoute: app.route || '',
      serverSideType,
      uriPrefix: option.route,
    }
    // Por la ruta tal cual, y por la que verá la navegación cuando shellNavOf le quite el
    // prefijo del padre. Dos claves para la misma entrada es más barato que reconstruir
    // aquí el cálculo que hace el nav, y que se desincronicen luego.
    const route = child.route || child.path || ''
    remoteRoutes.set(route, descriptor)
    remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
  }
}

/** La ruta de un grupo de un pod, registrada como prefijo; la de una hoja ya registrada no se pisa. */
function registerGroupRoute(route, option, app, serverSideType) {
  const bare = String(route || '').replace(/^\//, '')
  if (!bare || remoteRoutes.has(bare)) return
  const descriptor = {
    baseUrl: option.baseUrl,
    consumedRoute: app.route || '',
    serverSideType,
    uriPrefix: option.route,
  }
  remoteRoutes.set('/' + bare, descriptor)
  remoteRoutes.set(bare, descriptor)
}

function spliceRemote(menu, answers, sections = false, depth = 0) {
  const out = []
  for (const option of menu || []) {
    if (option.remote) {
      const app = answers.get(option)
      // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
      // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— pero no
      // aporta nada al menú, ni siquiera el rótulo si el pod no contestó.
      // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
      // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— y sus
      // entradas se quedan en el árbol, ocultas: no se pintan (shellNavOf), pero una página bajo
      // ellas tiene sus migas. Si el pod no contestó, se queda el marcador, también oculto.
      if (option.visible === false) {
        if (app) {
          adoptRemote(app.menu, option, app)
          out.push(...markHidden(app.menu))
        } else {
          out.push(option)
        }
        continue
      }
      if (app) {
        adoptRemote(app.menu, option, app)
        // HAMBURGER_SECTIONS: un pod montado en el primer nivel es UNA sección conteste lo que
        // conteste (asSection, navTree.mjs); si no, el rótulo que la shell declaró manda sobre el
        // del pod
        const entries = sections && depth === 0 ? asSection(app.menu, option) : app.menu
        out.push(...labelledByShell(entries, option))
      } else {
        // El pod no contestó. Se queda la sección, deshabilitada y diciendo por qué: una sección
        // vacía se entiende, una que desaparece parece que nunca existió.
        out.push(unavailableMount(option))
      }
    } else if (childrenOf(option).length) {
      out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers, sections, depth + 1) })
    } else {
      out.push(option)
    }
  }
  return out
}

/**
 * Pide a cada pod su menú y lo pone donde estaba su opción.
 *
 * En paralelo, y un pod que falle no tumba al resto: su sección se queda como estaba en vez de
 * llevarse por delante las que sí contestaron. Con `sections` (HAMBURGER_SECTIONS) cada pod
 * montado en el primer nivel queda como una sola sección (asSection).
 */
export async function expandRemoteMenus(menu, { sections = false } = {}) {
  const remotes = collectRemoteMenus(menu)
  if (!remotes.length) return menu
  const answers = new Map()
  await Promise.all(remotes.map(async (option) => {
    try {
      const increment = await callMateu(option.baseUrl || '', {
        route: option.route || '',
        actionId: '',
        consumedRoute: '_empty',
        initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
        parameters: option.params || {},
        // su fallo es el de SU sección: sin banda de error ni "sin conexión" para toda la app
      }, { quiet: true, isolated: true, timeoutMillis: 20000 })
      const app = appMenuOf(increment)
      if (app) answers.set(option, app)
    } catch (e) {
      // Silencioso a propósito (quiet/isolated): la sección se queda no disponible (spliceRemote).
    }
  }))
  return spliceRemote(menu, answers, sections)
}
