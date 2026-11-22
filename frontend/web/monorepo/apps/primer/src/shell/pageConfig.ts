/**
 * What the served page says about where the UI lives.
 *
 * A Mateu server writes `<mateu-ui baseUrl="/crm/x" …>` between the page's AQUIUI / HASTAAQUIUI
 * markers (the same page contract the Vaadin and Redwood renderers read); a page served on its own
 * (the dev server, a static host) carries `<div id="mateu-primer" data-base-url="…">` instead.
 * Blank = same origin, at the root.
 */
export function baseUrlOfPage(doc: Document): string {
  // the dev server only: `?baseUrl=/shell-rail` reaches an app mounted under a path (a served page says it itself)
  if (import.meta.env.DEV) {
    const dev = new URLSearchParams(doc.location?.search ?? '').get('baseUrl')
    if (dev && dev.startsWith('/')) return trimTrailingSlash(dev)
  }
  const ui = doc.querySelector('mateu-ui')
  const fromUi = ui?.getAttribute('baseUrl') ?? ui?.getAttribute('baseurl')
  if (fromUi != null) return trimTrailingSlash(fromUi)
  const fromDiv = doc.getElementById('mateu-primer')?.getAttribute('data-base-url')
  return trimTrailingSlash(fromDiv ?? '')
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
    return trimTrailingSlash(new URL(baseUrl || '/', 'http://x').pathname)
  } catch {
    return ''
  }
}

function trimTrailingSlash(s: string): string {
  return s.length > 1 ? s.replace(/\/+$/, '') : s === '/' ? '' : s
}
