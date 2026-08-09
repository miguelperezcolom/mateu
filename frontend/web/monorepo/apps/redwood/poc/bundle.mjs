// Static-bundle "no backend" mode for the VB/Redwood renderer — the same contract as the web
// renderers' libs/mateu (bundleStore.ts), rewritten for THIS core (which shares nothing with them:
// here the transport is `fetch` in transport.mjs, not axios). A build-time exporter (Mateu's
// `mateu:bundle` goal) OR the runtime endpoint (GET /mateu/v3/bundle) renders each declared route's
// initial load (actionId '') to wire JSON and writes a manifest.json; when a bundle is present we
// answer route LOADS from it instead of POSTing to the server, so the VB app runs from static
// assets with no backend. Live data still comes from external endpoints; ACTIONS still need a
// backend (they fall through to the normal transport).
//
// Pure except loadBundleManifest, so test.mjs can exercise it in Node with a fetch double.

// syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
let increments
// :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
let templates = []
// The in-flight manifest load (if any), so a route load can await it before hitting the backend.
let pending

/** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors transport.callMateu and the web:
 *  leading slash stripped, blank/root → `_no_route`. */
export function toSyncPath(route) {
  const r = route && route.startsWith('/') ? route.substring(1) : (route || '')
  return r === '' ? '_no_route' : r
}

/** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode OFF (the
 *  app falls back to the backend at baseUrl). */
export function loadBundleManifest(url, fetchImpl) {
  const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
  pending = (async () => {
    try {
      if (!f) return
      const res = await f(url)
      if (!res || !res.ok) return
      const manifest = await res.json()
      const map = new Map()
      const tpls = []
      for (const e of (manifest.entries || [])) {
        if (!e.ok || !e.json) continue
        try {
          const inc = JSON.parse(e.json)
          if (e.routePattern) {
            tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames || [], increment: inc })
          } else {
            map.set(e.syncPath, inc)
          }
        } catch (err) {
          // skip a malformed entry, keep the rest
        }
      }
      increments = map
      templates = tpls
    } catch (e) {
      // leave bundle mode off
    }
  })()
  return pending
}

/** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
 *  backend before the bundle is ready. Resolves immediately when nothing is loading. */
export const awaitBundle = () => pending || Promise.resolve()

/** True once a non-empty bundle has been loaded (exact routes or :param templates). */
export const hasBundle = () =>
  (increments !== undefined && increments.size > 0) || templates.length > 0

/** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend). */
export const getBundledIncrement = (syncPath) => (increments ? increments.get(syncPath) : undefined)

/** Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES; on a hit, return the
 *  pre-rendered structure with the extracted params INJECTED into every fragment's state and data —
 *  so a `${state.<param>}` in a client-side data URL resolves to the real value. undefined = no hit. */
export function matchBundledTemplate(syncPath) {
  for (const t of templates) {
    const m = t.regex.exec(syncPath)
    if (!m) continue
    const params = {}
    t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
    return {
      ...t.increment,
      // params LAST so the real value wins over the render-time placeholder
      fragments: (t.increment.fragments || []).map((f) => ({
        ...f,
        state: { ...(f.state || {}), ...params },
        data: { ...(f.data || {}), ...params },
      })),
    }
  }
  return undefined
}

/** The bundled increment for a route (exact match then :param template), re-targeted so its
 *  fragments land on the loading surface: the exporter had no initiator, so a fragment's
 *  targetComponentId is null — reduceContexts routes null → HOST, but a load INTO an island must
 *  target that island, so stamp the initiator (matches the web intercept). undefined = not bundled. */
export function bundledIncrementFor(route, initiator) {
  const syncPath = toSyncPath(route)
  const inc = getBundledIncrement(syncPath) || matchBundledTemplate(syncPath)
  if (!inc) return undefined
  return {
    ...inc,
    fragments: (inc.fragments || []).map((f) =>
      f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' }),
  }
}

/** Test hook: seed/clear the in-memory bundle directly. */
export function __setBundleForTests(m, t) {
  increments = m
  templates = t || []
  pending = undefined
}
