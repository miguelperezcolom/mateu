// The mount path of the packaged app (the jar io.mateu:mateu-redwood served by a Mateu backend).
//
// The controller the annotation processor generates for an @UI serves _index.html at the UI's
// path and injects a hidden <mateu-ui baseUrl="/console" pathPrefix="/console">. That element is
// two things at once:
//   - the SIGNAL that the app is served by a Mateu backend → URLs are PATHS (/console/orders),
//     not hashes (#/orders, the static serving of vb-serve / VB hosted at Oracle, where the
//     server cannot rewrite arbitrary paths to the index);
//   - the MOUNT: the API of that UI lives at <mount>/mateu/v3/... (the root /mateu/v3 is ANOTHER
//     UI's, or nothing at all when no @UI sits at "").
// Routes are RELATIVE to the mount, as on the web renderer (mateu-ui strips its pathPrefix): an
// App @UI("/app") lists its menu as '/section1', and the browser shows /app/section1. The mount
// itself is the HOME of the UI (the menu's home for an App; the page or crud itself otherwise).
// One wrinkle: a crud's inner routes come back from the server already carrying the crud's own
// path ('/products/new' for @UI("/products")), so a route that already starts with the mount is
// not prefixed twice.
// Before this module the packaged app called /mateu/v3 on the ROOT whatever the mount: it booted
// the root app's shell at /products, and with no @UI at "" it did not boot at all.
//
// The pure functions are what the tests pin; initMount/mateuBase/urlOfRoute/currentRouteOf keep
// the mount read once at boot (loadMateuShell) for the chains.

/** '' (root) or '/segment(s)' without a trailing slash. */
import { isEmbedded } from './embedded.mjs'
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

/** The Mateu route of a browser path under the mount: '/console/orders' → '/orders', the mount
 *  itself ('/console', '/console/', '/' at the root) → '' (the home). A path outside the mount is
 *  returned as is. */
export function routeOfPath(pathname, mount) {
  const m = normalizeMount(mount)
  let p = pathname || '/'
  if (m) {
    if (p === m || p === m + '/') return ''
    if (p.startsWith(m + '/')) p = p.slice(m.length)
  }
  return p === '/' ? '' : p
}

/** The browser path of a Mateu route under the mount: '/orders' → '/console/orders', the home
 *  ('' or '/') → '/console' ('/' at the root). A route may carry its ?query; one that already
 *  starts with the mount (a crud's inner route) is not prefixed again. */
export function pathOfRoute(route, mount) {
  const m = normalizeMount(mount)
  let r = route == null ? '' : String(route)
  if (r.charAt(0) === '?') r = '/' + r
  if (r === '' || r === '/') return m || '/'
  if (r.startsWith('/?')) return (m || '') + r.slice(m ? 1 : 0)
  if (r.charAt(0) !== '/') r = '/' + r
  const path = r.split('?')[0]
  if (m && (path === m || path.startsWith(m + '/'))) return r
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

/** The static bundle's manifest URL, when the page's <mateu-ui> names one (`bundleUrl`, stamped
 *  by the mateu-bundle goal's index.html — the same attribute the web renderers read). '' = none. */
export function bundleUrlOf(doc) {
  const el = doc && typeof doc.querySelector === 'function' ? doc.querySelector('mateu-ui') : null
  const url = el ? el.getAttribute('bundleUrl') || el.getAttribute('bundleurl') : null
  return url || ''
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

// query keys the host's login flow adds and no screen reads (Spring Security's ?continue after a
// form login): never a route parameter — same list as libs/mateu routeQuery.ts
const LOGIN_FLOW_QUERY_KEYS = ['continue']

/** The browser query as the route's: the login flow's artefacts dropped, the rest as written. */
export function routeQueryOf(search) {
  const raw = String(search || '').replace(/^\?/, '')
  if (!raw) return ''
  const kept = raw.split('&').filter((pair) => {
    if (!pair) return false
    let key = pair.split('=')[0]
    try { key = decodeURIComponent(key.replace(/\+/g, ' ')) } catch (e) { /* kept as written */ }
    return !LOGIN_FLOW_QUERY_KEYS.includes(key)
  })
  return kept.length ? '?' + kept.join('&') : ''
}

/** The route (with its ?query) the browser URL names. */
export function currentRouteOf(location) {
  if (!location) return ''
  if (mountPath == null) return (location.hash || '').replace(/^#/, '')
  return routeOfPath(location.pathname, mountPath) + routeQueryOf(location.search)
}

/** A route the server names in full (an App's homeRoute '/console/home') as a route under the mount
 *  ('/home'); unchanged in hash mode or when it is not under the mount. */
export function routeUnderMount(route) {
  if (mountPath == null || !route) return route || ''
  const [path, query] = String(route).split(/(?=\?)/)
  const r = routeOfPath(path, mountPath)
  return (r || (query ? '/' : '')) + (query || '')
}

/** Every route a menu names (its entries and their children, at any depth). */
export function menuRoutesOf(menu) {
  const out = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (typeof n.route === 'string' && n.route) out.push(n.route)
    if (typeof n.routePrefix === 'string' && n.routePrefix) out.push(n.routePrefix)
    for (const k of ['children', 'submenus', 'menu', 'items']) if (n[k]) walk(n[k])
  }
  walk(menu)
  return out
}

/**
 * Where a server NavigateTo (an action answering `URI.create("/dashboard-demo")`) really goes when it
 * leaves THIS mount: the origin path to load, or null when it stays in the app. The web renderer
 * treats a NavigateTo as a browser path (safeNavigate → a full load of that URL), so from the
 * `/welcome-demo` mount `/dashboard-demo` is the OTHER mount — here it was taken as a route under
 * this one and the browser went to /welcome-demo/dashboard-demo. In the app: the root mount (every
 * path is its route), hash mode, a relative route, a path under the mount (a crud's '/products/new')
 * and a route the app's own menu names (an App @UI("/app") lists its sections as '/section1').
 */
export function pathLeavingMountOf(route, menuRoutes = []) {
  if (!mountPath) return null
  const r = String(route == null ? '' : route)
  if (r.charAt(0) !== '/' || r.charAt(1) === '/') return null
  const path = r.split(/[?#]/)[0]
  if (path === mountPath || path.startsWith(mountPath + '/')) return null
  const own = (m) => { const p = String(m).split('?')[0].replace(/\/+$/, '') || '/'; return path === p || (p !== '/' && path.startsWith(p + '/')) }
  if ((menuRoutes || []).some(own)) return null
  return r
}

/** pathLeavingMountOf for a reducer's `navigate` effect, against the registry's shell menu. */
export function navigationLeavingMountOf(navigate, reg) {
  if (!navigate || navigate.url || !navigate.route) return null
  return pathLeavingMountOf(navigate.route, menuRoutesOf(((reg && reg.shell) || {}).menu))
}

/** Loads the page of a navigate effect that leaves this mount (navigationLeavingMountOf) and says
 *  whether it did — false: the navigation stays in the app, for the caller to do. */
export function leftMountFor(navigate, reg, win = typeof window !== 'undefined' ? window : null) {
  const path = navigationLeavingMountOf(navigate, reg)
  if (!path || !win || !win.location) return false
  win.location.assign(path)
  return true
}

/** The route part (no query) of the browser path — what to compare a route against. */
export function currentRoutePathOf(location) {
  if (!location) return ''
  return mountPath != null ? routeOfPath(location.pathname, mountPath) : (location.hash || '').replace(/^#/, '').split('?')[0]
}

/**
 * Another screen starts at its top. The window kept the scroll of the one before: leaving a long
 * wizard from its last step (its buttons are at the bottom), the reservation's page opened scrolled
 * down, its top under the pinned header. Not on back/forward or a deep link (fromUrl: the browser
 * restores its own position), nor a live reload (the same screen, where it was), nor embedded in a
 * host page (the scroll is the host's). True when it scrolled.
 */
export function scrollToTopOnNavigate({ fromUrl, liveState } = {}, win = typeof window !== 'undefined' ? window : null) {
  if (fromUrl || liveState || isEmbedded() || !win || typeof win.scrollTo !== 'function') return false
  win.scrollTo(0, 0)
  return true
}

/** How long the old screen stays on show once another starts loading (app.css mateu-stale-hide). */
export const STALE_SCREEN_HIDE_MS = 500

/**
 * scrollToTopOnNavigate, but not while the old screen is still on show: scrolled at once, the page
 * the user clicked in jumped to its top and only then did the new one arrive. It scrolls when the
 * old screen is hidden (after STALE_SCREEN_HIDE_MS) or when the new one is in place — the function
 * returned, called once the navigation lands — whichever comes first, and only once.
 */
export function scrollToTopWhenReplaced(params = {}, win = typeof window !== 'undefined' ? window : null,
    delay = STALE_SCREEN_HIDE_MS) {
  let done = false
  const scroll = () => {
    if (done) return false
    done = true
    return scrollToTopOnNavigate(params, win)
  }
  const timer = win && typeof win.setTimeout === 'function' ? win.setTimeout(scroll, delay) : null
  return () => {
    if (timer != null && typeof win.clearTimeout === 'function') win.clearTimeout(timer)
    return scroll()
  }
}

