import { isMount, mountPrefix, routeCovers } from './navTree.mjs'
import { chromeText } from './i18n.mjs'
// The automatic trail of a screen — the SAME rule as the web renderer
// (libs/mateu/.../breadcrumbTrail.ts): the path of menus up to the route (groups and the entry that
// shows it, a pod's sections included) and, past the entry, the CRUD level — the record
// (with the title of its own page) and «Editar» / «Nuevo».
//
// Redwood has no breadcrumbs: Spectra has no breadcrumbs component and its header offers, in their
// place, the «go to parent» affordance (displayOptions.goToParent). That parent comes from this trail:
// the last breadcrumb with a route before the current one.

const crumbRoute = (r) => {
  let s = String(r == null ? '' : r).trim()
  const q = s.search(/[?#]/)
  if (q >= 0) s = s.slice(0, q)
  if (s && s[0] !== '/') s = '/' + s
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

// the title as text: markup out (repeatedly, so nothing recomposes from the
// pieces) and then any remaining bracket
const crumbText = (text) => {
  let s = String(text == null ? '' : text)
  let previous
  do {
    previous = s
    s = s.replace(/<[^<>]*>/g, '')
  } while (s !== previous)
  return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

// the routes the menu ENTRIES open (not the groups): where a breadcrumb can lead
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

// HIDDEN entries count: they are not painted, but a page under one is still somewhere
// (the inbox reached from a widget is still Bandeja › Tareas). A remote section
// that has not answered counts by its prefix (navTree.mjs), like the section alone — `pending`, because
// what is below is not known yet.
export function menuTrail(menu, path) {
  const current = crumbRoute(path)
  let best = null
  // a group is a heading, not a page: its route (the prefix of a federated section,
  // "/admin") usually leads nowhere. Its breadcrumb only navigates if an ENTRY has that route.
  const pages = crumbLeafRoutes(menu)
  const consider = (route, crumbs, pending) => {
    // a real entry beats a section prefix of the same length: it says more
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
    // a remote section that has not answered: the section is known (the shell named it) and what is
    // below is not. The section, and then the title of the page itself.
    const title = crumbText(page.title)
    if (title && title !== trail[trail.length - 1].text) trail.push({ text: title })
    return trail.length < 2 ? [] : trail
  }
  const rest = crumbRoute(path).slice(matched.length).split('/').filter(Boolean)
  const lang = page.lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  if (rest.length > 0) {
    const id = decodeURIComponent(rest[0])
    if (id === 'new' || id === 'create') {
      trail.push({ text: chromeText('new', null, lang || 'en') })
    } else {
      const recordRoute = matched + '/' + rest[0]
      const title = crumbText(page.title)
      if (rest.length === 1 && title) recordTitles.set(recordRoute, title)
      trail.push({ text: recordTitles.get(recordRoute) || id, route: recordRoute })
      if (rest[1] === 'edit') trail.push({ text: chromeText('edit', null, lang || 'en') })
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
