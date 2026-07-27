// Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
// "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
// sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
// testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).

import { reduceContexts, mediatorOf, HOST_ID } from './reduceContexts.mjs'

/** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction). */
export async function callMateu(base, body) {
  const bare = (body.route || '').replace(/^\//, '')
  const res = await fetch(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
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
  })
  if (!res.ok) throw new Error(`Mateu ${body.route} ${body.actionId} → HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

/** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico. */
export async function bootstrapShell(base, initiator = 'shell') {
  const res = await fetch(`${base}/mateu/v3/components/_/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
  })
  if (!res.ok) throw new Error(`Mateu bootstrap → HTTP ${res.status}`)
  return res.json()
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

/** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…). */
export const loadRoute = (base, route, initiator = '', extra = {}) =>
  callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })

/** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
 *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
 *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
export function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
  const outbound = (ctx && ctx.outbound) || {}
  return callMateu(base, {
    route: outbound.route || route,
    consumedRoute: outbound.consumedRoute || '',
    actionId,
    componentState: componentState || (ctx && ctx.state) || {},
    serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
    initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
    ...extra,
  })
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
  const effectiveRoute = outbound.route || route || ''
  const bare = effectiveRoute.replace(/^\//, '')
  const res = await fetch(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
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
  })
  if (!res.ok) throw new Error(`Mateu sse ${route} ${actionId} → HTTP ${res.status}: ${await res.text()}`)
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
 * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
 * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
 * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
 */
export async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
  let next = reduceContexts(reg, await loadRoute(base, route, targetId, extra))
  const ctxId = targetId === '' ? HOST_ID : targetId
  let outbound = { route, consumedRoute: '', serverSideType: undefined }
  // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
  // la carga de contenido las pierde, así que se conservan aquí
  const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
  const wrapperActions = (wrapperTree && wrapperTree.actions) || []
  const info = mediatorOf(next.contexts[ctxId])
  if (info) {
    outbound = {
      route,
      consumedRoute: info.rootRoute || route,
      serverSideType: info.serverSideType,
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
