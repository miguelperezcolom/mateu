// LIVE RELOAD (modo desarrollo del backend, mateu.dev=true): el mismo contrato que
// libs/mateu/src/mateu/ui/infra/dev/liveReloadPolicy.ts — aquí no se hereda nada del core web.
//
// El backend en modo dev estampa <meta name="mateu-dev" content="/mateu/dev/events"> en el índice
// y sirve ese stream SSE: `hello` (con bootId: si cambia, el servidor se reinició → repintar),
// `specs-changed` (scope page|app), `reload` (el IDE tras un HotSwap) y `ping`. Una ráfaga de
// eventos se colapsa en UNA recarga. `page` repinta la ruta en pantalla CONSERVANDO lo tecleado
// (la shell lo pasa a onMateuNavigate como liveState); `app` vuelve a montar la app en la misma URL.

/** Qué significa un mensaje del stream: { action: 'none'|'page'|'app', bootId, reason }. */
export function liveReloadDecision(message, knownBootId) {
  if (!message || typeof message !== 'object') return { action: 'none', bootId: knownBootId }
  if (message.type === 'hello') {
    const restarted = !!knownBootId && !!message.bootId && message.bootId !== knownBootId
    return {
      action: restarted ? 'page' : 'none',
      bootId: message.bootId || knownBootId,
      reason: restarted ? 'server restarted' : undefined,
    }
  }
  if (message.type === 'specs-changed' || message.type === 'reload') {
    const files = message.files || []
    const names = files.map((f) => f.substring(f.lastIndexOf('/') + 1))
    const reason = message.type === 'reload'
      ? 'reload requested'
      : names.length === 0 ? 'specs changed'
        : names.length <= 2 ? names.join(', ') : `${names[0]} and ${names.length - 1} more`
    return { action: message.scope === 'app' ? 'app' : 'page', bootId: knownBootId, reason }
  }
  return { action: 'none', bootId: knownBootId }
}

/** La más fuerte de dos recargas pendientes (app absorbe page). */
export function strongerReload(a, b) {
  const rank = { none: 0, page: 1, app: 2 }
  return (rank[a] || 0) >= (rank[b] || 0) ? a : b
}

/** Dónde está el stream, si el índice lo anuncia (o la app lo fija en window.__MATEU_DEV_EVENTS__). */
export function devEventsUrlOf(doc, win) {
  if (win && win.__MATEU_DEV_EVENTS__) return win.__MATEU_DEV_EVENTS__
  const meta = doc && doc.querySelector ? doc.querySelector('meta[name="mateu-dev"]') : null
  return (meta && meta.content) || undefined
}

let liveReloadSource = null

/**
 * Se suscribe al stream (una vez) y llama a onReload(action, reason) tras cada ráfaga. Sin
 * <meta name="mateu-dev"> no hace nada. `EventSourceImpl` y `timer` se inyectan en los tests.
 */
export function installDevLiveReload(doc, win, onReload, EventSourceImpl, timer = setTimeout) {
  const ES = EventSourceImpl || (win && win.EventSource)
  if (liveReloadSource || !ES) return null
  const url = devEventsUrlOf(doc, win)
  if (!url) return null
  const source = new ES(url)
  liveReloadSource = source
  let bootId
  let pending = 'none'
  let reason
  let handle
  source.onmessage = (event) => {
    let message
    try { message = JSON.parse(event.data) } catch (e) { return }
    const decision = liveReloadDecision(message, bootId)
    bootId = decision.bootId
    if (decision.action === 'none') return
    pending = strongerReload(pending, decision.action)
    reason = decision.reason
    if (handle !== undefined) clearTimeout(handle)
    handle = timer(() => {
      const action = pending
      pending = 'none'
      handle = undefined
      onReload(action, reason)
      showReloadedPill(doc, reason)
    }, 60)
  }
  return source
}

/** Tests. */
export function resetDevLiveReload() {
  if (liveReloadSource && liveReloadSource.close) liveReloadSource.close()
  liveReloadSource = null
}

/** Una píldora discreta abajo a la izquierda que se desvanece sola. */
export function showReloadedPill(doc, reason) {
  if (!doc || !doc.body || !doc.createElement) return
  let pill = doc.getElementById('mateu-live-reload-indicator')
  if (!pill) {
    pill = doc.createElement('div')
    pill.id = 'mateu-live-reload-indicator'
    pill.setAttribute('role', 'status')
    pill.setAttribute('aria-live', 'polite')
    pill.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;padding:4px 10px;'
      + 'border-radius:999px;font:12px/1.4 system-ui,sans-serif;background:rgba(30,30,30,.82);'
      + 'color:#fff;pointer-events:none;transition:opacity .4s ease;opacity:0'
    doc.body.appendChild(pill)
  }
  pill.textContent = '↻ Reloaded' + (reason ? ' · ' + reason : '')
  pill.style.opacity = '1'
  clearTimeout(pill.__mateuFade)
  pill.__mateuFade = setTimeout(() => { pill.style.opacity = '0' }, 1800)
}
