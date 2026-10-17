// LIVE RELOAD (backend development mode, mateu.dev=true): the same contract as
// libs/mateu/src/mateu/ui/infra/dev/liveReloadPolicy.ts — nothing is inherited from the web core here.
//
// The backend in dev mode stamps <meta name="mateu-dev" content="/mateu/dev/events"> in the index
// and serves that SSE stream: `hello` (with bootId: if it changes, the server restarted → repaint),
// `specs-changed` (scope page|app), `reload` (the IDE after a HotSwap) and `ping`. A burst of
// events collapses into ONE reload. `page` repaints the route on screen KEEPING what was typed
// (the shell passes it to onMateuNavigate as liveState); `app` remounts the app at the same URL.

/** What a stream message means: { action: 'none'|'page'|'app', bootId, reason }. */
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

/** The stronger of two pending reloads (app absorbs page). */
export function strongerReload(a, b) {
  const rank = { none: 0, page: 1, app: 2 }
  return (rank[a] || 0) >= (rank[b] || 0) ? a : b
}

/** Where the stream is, if the index announces it (or the app sets it in window.__MATEU_DEV_EVENTS__). */
export function devEventsUrlOf(doc, win) {
  if (win && win.__MATEU_DEV_EVENTS__) return win.__MATEU_DEV_EVENTS__
  const meta = doc && doc.querySelector ? doc.querySelector('meta[name="mateu-dev"]') : null
  return (meta && meta.content) || undefined
}

let liveReloadSource = null

// What was typed in the host's form lives in the content page's draft ($page.mateuDraft),
// which the shell does not see: the chain that accumulates it notes it here, with the route it was typed on.
let liveDraft = { route: null, draft: null }
export function noteLiveDraft(route, draft) { liveDraft = { route: route == null ? null : route, draft } }
/** The draft typed on `route` (nothing if it was from another screen). */
export function liveDraftFor(route) {
  return liveDraft.draft && liveDraft.route === (route == null ? null : route) ? liveDraft.draft : null
}

/**
 * Subscribes to the stream (once) and calls onReload(action, reason) after each burst. Without
 * <meta name="mateu-dev"> it does nothing. `EventSourceImpl` and `timer` are injected in the tests.
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

/** A discreet pill at the bottom left that fades out on its own. */
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
