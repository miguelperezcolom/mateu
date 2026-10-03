import { isMount, mountPrefix, routeCovers } from './navTree.mjs'
// El rastro automático de una pantalla — la MISMA regla que el renderer web
// (libs/mateu/.../breadcrumbTrail.ts): el camino de menús hasta la ruta (grupos y la entrada que
// la muestra, secciones de un pod incluidas) y, pasada la entrada, el nivel del CRUD — el registro
// (con el título de su propia página) y «Editar» / «Nuevo».
//
// Redwood no tiene migas: Spectra no trae componente de breadcrumbs y su cabecera ofrece, en su
// lugar, la afordancia «ir al padre» (displayOptions.goToParent). De este rastro sale ese padre:
// la última miga con ruta antes de la actual.

const crumbRoute = (r) => {
  let s = String(r == null ? '' : r).trim()
  const q = s.search(/[?#]/)
  if (q >= 0) s = s.slice(0, q)
  if (s && s[0] !== '/') s = '/' + s
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

// el título como texto: fuera el marcado (repetidamente, para que nada se recomponga con los
// trozos) y después cualquier corchete que quede
const crumbText = (text) => {
  let s = String(text == null ? '' : text)
  let previous
  do {
    previous = s
    s = s.replace(/<[^<>]*>/g, '')
  } while (s !== previous)
  return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

// las rutas que abren las ENTRADAS del menú (no los grupos): a donde una miga puede llevar
function crumbLeafRoutes(menu) {
  const out = new Set()
  const walk = (options) => {
    for (const option of options || []) {
      if (!option || option.separator || isMount(option)) continue
      const children = option.submenus || option.submenu || []
      if (children.length > 0) { walk(children); continue }
      const route = crumbRoute(option.route || option.path)
      if (route && route !== '/') out.add(route)
    }
  }
  walk(menu)
  return out
}

// Las entradas OCULTAS cuentan: no se pintan, pero una página bajo una sigue estando en algún sitio
// (la bandeja a la que se llega desde un widget sigue siendo Bandeja › Tareas). Una sección remota
// que no ha contestado cuenta por su prefijo (navTree.mjs), como la sección sola — `pending`, porque
// lo que hay debajo aún no se sabe.
export function menuTrail(menu, path) {
  const current = crumbRoute(path)
  let best = null
  // un grupo es un encabezado, no una página: su ruta (el prefijo de una sección federada,
  // "/admin") no suele llevar a ningún sitio. Su miga sólo navega si una ENTRADA tiene esa ruta.
  const pages = crumbLeafRoutes(menu)
  const consider = (route, crumbs, pending) => {
    // una entrada de verdad gana a un prefijo de sección de la misma longitud: dice más
    if (!best || route.length > best.route.length || (route.length === best.route.length && best.pending && !pending)) {
      best = { crumbs, route, pending }
    }
  }
  const walk = (options, above) => {
    for (const option of options || []) {
      if (!option || option.separator) continue
      if (isMount(option)) {
        const prefix = mountPrefix(option)
        if (routeCovers(prefix, current)) consider(prefix, [...above, { text: crumbText(option.caption || option.label) }], true)
        continue
      }
      const route = crumbRoute(option.route || option.path)
      const label = crumbText(option.caption || option.label)
      const children = option.submenus || option.submenu || []
      if (children.length > 0) {
        walk(children, [...above, route && route !== '/' && pages.has(route) ? { text: label, route } : { text: label }])
        continue
      }
      if (routeCovers(route, current)) consider(route, [...above, { text: label, route }], false)
    }
  }
  walk(menu, [])
  if (!best) return { crumbs: [] }
  return best.pending ? { crumbs: best.crumbs, matched: best.route, pending: true } : { crumbs: best.crumbs, matched: best.route }
}

const recordTitles = new Map()

export function autoTrail(menu, path, page = {}) {
  const { crumbs, matched, pending } = menuTrail(menu, path)
  if (!matched) return []
  const trail = [...crumbs]
  if (pending) {
    // una sección remota que no ha contestado: la sección se sabe (la nombró la shell) y lo de
    // debajo no. La sección, y después el título de la propia página.
    const title = crumbText(page.title)
    if (title && title !== trail[trail.length - 1].text) trail.push({ text: title })
    return trail.length < 2 ? [] : trail
  }
  const rest = crumbRoute(path).slice(matched.length).split('/').filter(Boolean)
  const lang = page.lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  const es = String(lang).toLowerCase().startsWith('es')
  if (rest.length > 0) {
    const id = decodeURIComponent(rest[0])
    if (id === 'new' || id === 'create') {
      trail.push({ text: es ? 'Nuevo' : 'New' })
    } else {
      const recordRoute = matched + '/' + rest[0]
      const title = crumbText(page.title)
      if (rest.length === 1 && title) recordTitles.set(recordRoute, title)
      trail.push({ text: recordTitles.get(recordRoute) || id, route: recordRoute })
      if (rest[1] === 'edit') trail.push({ text: es ? 'Editar' : 'Edit' })
      else if (rest.length > 1) trail.push({ text: title || decodeURIComponent(rest[rest.length - 1]) })
    }
  }
  if (trail.length < 2) return []
  trail[trail.length - 1] = { text: trail[trail.length - 1].text }
  return trail
}

export function parentCrumb(trail) {
  for (let i = (trail || []).length - 2; i >= 0; i--) {
    if (trail[i].route) return trail[i]
  }
  return undefined
}
