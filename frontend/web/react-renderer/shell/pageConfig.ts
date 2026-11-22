/**
 * What the served page says about where the UI lives.
 *
 * A Mateu server writes `<mateu-ui baseUrl="/crm/x" …>` between the page's AQUIUI / HASTAAQUIUI
 * markers (the same page contract the Vaadin and Redwood renderers read); a page served on its own
 * (the dev server, a static host) carries the renderer's own mount div instead
 * (`<div id="mateu-primer" data-base-url="…">` — `mountId` names it). Blank = same origin, at the root.
 */
export function baseUrlOfPage(doc: Document, mountId: string): string {
  // the dev server only: `?baseUrl=/shell-rail` reaches an app mounted under a path (a served page says it itself)
  if (import.meta.env.DEV) {
    const dev = new URLSearchParams(doc.location?.search ?? '').get('baseUrl')
    if (dev && dev.startsWith('/')) return trimTrailingSlash(dev)
  }
  const ui = doc.querySelector('mateu-ui')
  const fromUi = ui?.getAttribute('baseUrl') ?? ui?.getAttribute('baseurl')
  if (fromUi != null) return trimTrailingSlash(fromUi)
  const fromDiv = doc.getElementById(mountId)?.getAttribute('data-base-url')
  return trimTrailingSlash(fromDiv ?? '')
}

/**
 * The static bundle the page boots from (`<mateu-ui bundleUrl="/x/manifest.json">`, what the
 * mateu-bundle Maven goal stamps): its manifest answers the route loads with no server behind them.
 * Null for a page served by a Mateu backend. The dev server also takes `?bundleUrl=`.
 */
export function bundleUrlOfPage(doc: Document): string | null {
  if (import.meta.env.DEV) {
    const dev = new URLSearchParams(doc.location?.search ?? '').get('bundleUrl')
    if (dev) return dev
  }
  const ui = doc.querySelector('mateu-ui')
  return ui?.getAttribute('bundleUrl') ?? ui?.getAttribute('bundleurl') ?? null
}

/** The route the browser asked for, relative to the mount (`/products/12` → `products/12`). */
export function routeOfLocation(pathname: string, baseUrl: string): string {
  const base = baseUrlPath(baseUrl)
  let path = pathname
  if (base && (path === base || path.startsWith(base + '/'))) path = path.slice(base.length)
  return path.replace(/^\/+/, '').replace(/\/+$/, '')
}

/** The browser path of a mount-relative route. */
export function locationOfRoute(route: string, baseUrl: string): string {
  const base = baseUrlPath(baseUrl)
  const clean = route.replace(/^\/+/, '')
  return `${base}/${clean}`.replace(/\/{2,}/g, '/') || '/'
}

function baseUrlPath(baseUrl: string): string {
  try {
    return trimTrailingSlash(new URL(baseUrl || '/', 'https://mateu.invalid').pathname)
  } catch {
    return ''
  }
}

function trimTrailingSlash(s: string): string {
  return s.length > 1 ? s.replace(/\/+$/, '') : s === '/' ? '' : s
}
