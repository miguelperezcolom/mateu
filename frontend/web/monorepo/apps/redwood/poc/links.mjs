// Los enlaces HTML corrientes dentro del contenido (`<a href="/journey/bookings/ZUAAKJ">Ver
// recorrido</a>`, de un Text/Html de la app) navegan DENTRO de la shell, como en Vaadin: allí el
// cliente de Flow (RouterLinkHandler) se queda con el clic en un enlace a una ruta de la app y
// navega sin recargar. Aquí, sin esto, el navegador cargaba la página entera y la shell de Redwood
// volvía a arrancar (20–40 s en blanco). Mismas reglas que Flow: sólo un clic normal (botón
// principal, sin Ctrl/Cmd/Mayús/Alt) que nadie haya atendido ya, en un enlace del mismo origen,
// sin target (o _self), sin download ni router-ignore; además, nada que no sea una pantalla: las
// rutas internas (/_inbox, /_xxx), el API, el login/logout y los ficheros (algo.pdf) siguen
// siendo del navegador, y un ancla a la misma página (#expand=…, el foldout) también.

/** Prefijos de rutas que no son pantallas de la app: el navegador las carga como siempre. */
const NOT_A_SCREEN = /^\/(_|api(\/|$)|oauth2(\/|$)|login(\/|$)|logout(\/|$)|sso(\/|$)|actuator(\/|$)|webjars(\/|$)|assets(\/|$)|static(\/|$)|resources(\/|$)|version_)/i

/** El último tramo con extensión de fichero (`informe.pdf`, `bundle.js`): no es una pantalla (un id
 *  con punto, `/customers/ana.ruiz`, sí). */
const LOOKS_LIKE_FILE = /\.(pdf|csv|tsv|xlsx?|docx?|pptx?|odt|ods|zip|gz|tar|json|xml|txt|md|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|mp3|wav|js|mjs|css|map|html?|woff2?|ttf|otf)$/i

/**
 * La ruta de la app a la que navega un clic en un enlace (con su query), o null si el clic sigue
 * siendo del navegador. `location` es la de la página (window.location); `hashMode` es la shell
 * servida en estático, cuyas rutas viven en `#/ruta`.
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
  // en estático (#/ruta) un `#/ruta` también es una pantalla
  if (hashMode && /^#\//.test(href.trim())) {
    return href.trim().slice(1)
  }
  // `#`, `#expand=…`: anclas de esta misma página (el foldout, los href="#" de JET), del navegador
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
  // un ancla a esta misma página (#expand=…): la hace el navegador
  if (url.hash && path === location.pathname && url.search === (location.search || '')) return null
  // the app mounted under a path (@UI("/console")): only links below it are screens of the app,
  // and the route is the part after the mount
  const m = String(mount || '').replace(/\/+$/, '')
  if (m) {
    if (path === m || path === m + '/') path = '/'
    else if (path.startsWith(m + '/')) path = path.slice(m.length)
    else return null
  }
  if (NOT_A_SCREEN.test(path) || LOOKS_LIKE_FILE.test(path)) return null
  return path + url.search
}
