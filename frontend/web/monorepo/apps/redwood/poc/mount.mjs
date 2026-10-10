// The mount path of the packaged app (the jar io.mateu:redwood served by a Mateu backend).
//
// The controller the annotation processor generates for an @UI serves _index.html at the UI's
// path and injects a hidden <mateu-ui baseUrl="/console" pathPrefix="/console">. That element is
// two things at once:
//   - the SIGNAL that the app is served by a Mateu backend → URLs are PATHS (/console/products),
//     not hashes (#/products, the static serving of vb-serve / VB hosted at Oracle, where the
//     server cannot rewrite arbitrary paths to the index);
//   - the MOUNT: the API lives at <mount>/mateu/v3/... and every screen route is relative to it.
// Before this module the packaged app assumed the @UI at "" (it called /mateu/v3 on the root and
// read location.pathname as the route), so an @UI("/console") booted into "Not found.".
//
// The pure functions are what the tests pin; initMount/mateuBase/urlOfRoute/currentRouteOf keep
// the mount read once at boot (loadMateuShell) for the chains.

/** '' (root) or '/segment(s)' without a trailing slash. */
export function normalizeMount(value) {
  let v = String(value == null ? '' : value).trim()
  if (!v || v === '/') return ''
  if (v.charAt(0) !== '/') v = '/' + v
  return v.replace(/\/+$/, '')
}

/**
 * The base for /mateu/v3/... calls: the mount the <mateu-ui> carries when there is one (its
 * attributes as a plain object, or null when the page has no such element), else the development
 * default (the app-flow constant mateuBaseUrl — an absolute backend URL under vb-serve).
 */
export function baseUrlOf(attrs, devDefault) {
  if (!attrs) return devDefault
  return normalizeMount(attrs.baseUrl != null ? attrs.baseUrl : attrs.baseurl)
}

/** The Mateu route of a browser path under the mount: '/console/products' → '/products',
 *  '/console' or '/console/' → '' (the home). A path outside the mount is returned as is. */
export function routeOfPath(pathname, mount) {
  const m = normalizeMount(mount)
  let p = pathname || '/'
  if (m) {
    if (p === m || p === m + '/') return ''
    if (p.startsWith(m + '/')) p = p.slice(m.length)
  }
  return p === '/' ? '' : p
}

/** The browser path of a Mateu route under the mount: '/products' → '/console/products', the home
 *  ('' or '/') → '/console' ('/' at the root). A route may carry its ?query. */
export function pathOfRoute(route, mount) {
  const m = normalizeMount(mount)
  let r = route == null ? '' : String(route)
  if (r === '/' ) r = ''
  if (r.charAt(0) === '?') r = '/' + r
  if (r && r.charAt(0) !== '/') r = '/' + r
  if (!r) return m || '/'
  if (r.startsWith('/?')) return (m || '') + r.slice(m ? 1 : 0)
  return m + r
}

// ── the mount read at boot ─────────────────────────────────────────────────────────────────────
let mountPath = null

/** Reads the <mateu-ui> of the page once: the mount ('' at the root) or null (hash mode). */
export function initMount(doc) {
  const el = doc && typeof doc.querySelector === 'function' ? doc.querySelector('mateu-ui') : null
  mountPath = el ? baseUrlOf({ baseUrl: el.getAttribute('baseUrl') }, '') : null
  return mountPath
}

/** Test hook / explicit setting: null = hash mode. */
export function setMount(value) { mountPath = value == null ? null : normalizeMount(value) }

/** Path mode (served by a Mateu backend) vs hash mode (static serving). */
export function isPathMode() { return mountPath != null }

export function currentMount() { return mountPath || '' }

/** The base for API calls: the mount in path mode, the development constant otherwise. */
export function mateuBase(devDefault) { return mountPath != null ? mountPath : devDefault }

/** The base for STATIC things the backend serves at its root (images, logos, web-component
 *  modules, the agent's sseUrl): the origin root in path mode — they are not under the mount, just
 *  as on the Vaadin renderer —, the development constant (the backend origin) otherwise. */
export function mateuAssetBase(devDefault) { return mountPath != null ? '' : devDefault }

/** What goes in history.pushState for a route: its path under the mount, or '#route'. */
export function urlOfRoute(route) {
  return mountPath != null ? pathOfRoute(route, mountPath) : '#' + (route || '')
}

/** The route (with its ?query) the browser URL names. */
export function currentRouteOf(location) {
  if (!location) return ''
  if (mountPath == null) return (location.hash || '').replace(/^#/, '')
  return routeOfPath(location.pathname, mountPath) + (location.search || '')
}

/** The route part (no query) of the browser path — what to compare a route against. */
export function currentRoutePathOf(location) {
  if (!location) return ''
  return mountPath != null ? routeOfPath(location.pathname, mountPath) : (location.hash || '').replace(/^#/, '').split('?')[0]
}
