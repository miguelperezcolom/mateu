// Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
// "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
// sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
// testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).

import { reduceContexts, mediatorOf, HOST_ID } from './reduceContexts.mjs'
import { fetchWithPolicy, pendingActions, isIdempotentAction } from './resilience.mjs'
import { awaitBundle, hasBundle, bundledIncrementFor } from './bundle.mjs'

/** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction). */
export async function callMateu(base, body, options = {}) {
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
  }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent })
  return res.json()
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
  return composeInnerRoute(outbound.route || fallbackRoute || '', flip)
}

/** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
 *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
 *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
 *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
export const loadRoute = async (base, route, initiator = '', extra = {}) => {
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
    .then((inc) => { release(); return inc }, (e) => { release(); throw e })
}

/** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
 *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
 *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
 *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
 *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
 *  callback, comportamiento clásico: lista completa al acabar. */
export async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
  const { onIncrement, ...bodyExtra } = extra || {}
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
  }, { actionId, timeoutMillis: -1 })
  const increments = []
  const handle = async (raw) => {
    const line = raw.trim()
    if (!line.startsWith('data:')) return
    const inc = JSON.parse(line.slice(5).trim())
    const consumed = onIncrement ? await onIncrement(inc) : false
    if (!consumed) increments.push(inc)
  }
  if (res.body && res.body.getReader) {
    const reader = res.body.getReader()
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

/**
 * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
 * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
 * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
 */
export async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
  // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
  // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
  // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
  const firstIncrement = await loadRoute(base, route, targetId, extra)
  let next = reduceContexts(reg, firstIncrement)
  const ctxId = targetId === '' ? HOST_ID : targetId
  let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
  // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
  // la carga de contenido las pierde, así que se conservan aquí
  const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
  const wrapperActions = (wrapperTree && wrapperTree.actions) || []
  const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, route)
  if (info) {
    outbound = {
      route,
      consumedRoute: info.rootRoute || route,
      serverSideType: info.serverSideType,
      baseUrl: base,
    }
    next = reduceContexts(
      next,
      await loadRoute(base, route, targetId, {
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

function spliceRemote(menu, answers) {
  const out = []
  for (const option of menu || []) {
    if (option.remote) {
      const app = answers.get(option)
      if (app) {
        adoptRemote(app.menu, option, app)
        out.push(...app.menu)
      } else {
        // El pod no contestó. Se queda el rótulo: una sección vacía se entiende, una que
        // desaparece parece que nunca existió.
        out.push(option)
      }
    } else if (childrenOf(option).length) {
      out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers) })
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
 * llevarse por delante las que sí contestaron.
 */
export async function expandRemoteMenus(menu) {
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
      })
      const app = appMenuOf(increment)
      if (app) answers.set(option, app)
    } catch (e) {
      // Ya reportado por el transporte. Aquí solo se decide no propagarlo.
    }
  }))
  return spliceRemote(menu, answers)
}
