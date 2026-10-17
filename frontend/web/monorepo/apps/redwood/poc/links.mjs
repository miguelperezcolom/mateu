// Ordinary HTML links inside the content (`<a href="/journey/bookings/ZUAAKJ">Ver
// recorrido</a>`, from an app Text/Html) navigate INSIDE the shell, as in Vaadin: there the
// Flow client (RouterLinkHandler) takes the click on a link to an app route and
// navigates without reloading. Here, without this, the browser loaded the whole page and the Redwood shell
// booted again (20–40 s blank). Same rules as Flow: only a plain click (main
// button, no Ctrl/Cmd/Shift/Alt) that nobody has handled yet, on a same-origin link,
// without target (or _self), without download or router-ignore; also, nothing that is not a screen: the
// internal routes (/_inbox, /_xxx), the API, login/logout and files (something.pdf) still
// belong to the browser, and an anchor to the same page (#expand=…, the foldout) too.

/** Prefixes of routes that are not app screens: the browser loads them as always. */
const NOT_A_SCREEN = /^\/(_|api(\/|$)|oauth2(\/|$)|login(\/|$)|logout(\/|$)|sso(\/|$)|actuator(\/|$)|webjars(\/|$)|assets(\/|$)|static(\/|$)|resources(\/|$)|version_)/i

/** The last segment with a file extension (`informe.pdf`, `bundle.js`): it is not a screen (an id
 *  with a dot, `/customers/ana.ruiz`, is). */
const LOOKS_LIKE_FILE = /\.(pdf|csv|tsv|xlsx?|docx?|pptx?|odt|ods|zip|gz|tar|json|xml|txt|md|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|mp3|wav|js|mjs|css|map|html?|woff2?|ttf|otf)$/i

/**
 * The app route a click on a link navigates to (with its query), or null if the click still
 * belongs to the browser. `location` is the page's (window.location); `hashMode` is the shell
 * served statically, whose routes live in `#/route`.
 */
export function inAppRouteOfLink(anchor, event, location, hashMode = false, mount = '') {
  if (!anchor || !anchor.getAttribute || !location) return null
  if (event && (event.defaultPrevented || event.button > 0
    || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
  const href = anchor.getAttribute('href')
  if (href == null || href.trim() === '') return null
  const target = (anchor.getAttribute('target') || '').trim().toLowerCase()
  if (target && target !== '_self') return null
  if (anchor.getAttribute('download') != null || anchor.getAttribute('router-ignore') != null) return null
  // statically (#/route) a `#/route` is a screen too
  if (hashMode && /^#\//.test(href.trim())) {
    return href.trim().slice(1)
  }
  // `#`, `#expand=…`: anchors of this same page (the foldout, JET's href="#"), the browser's
  if (href.trim().charAt(0) === '#') return null
  let url
  try {
    url = new URL(href.trim(), location.href)
  } catch (e) {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.origin !== location.origin) return null
  let path = url.pathname || '/'
  // an anchor to this same page (#expand=…): the browser handles it
  if (url.hash && path === location.pathname && url.search === (location.search || '')) return null
  // the app mounted under a path (@UI("/console")): only links below it are screens of THIS app
  // (another path is another UI: the browser loads it), its route is the part after the mount and
  // the mount itself is the home
  const m = String(mount || '').replace(/\/+$/, '')
  if (m) {
    if (path === m || path === m + '/') path = '/'
    else if (path.startsWith(m + '/')) path = path.slice(m.length)
    else return null
  }
  if (NOT_A_SCREEN.test(path) || LOOKS_LIKE_FILE.test(path)) return null
  return path + url.search
}
