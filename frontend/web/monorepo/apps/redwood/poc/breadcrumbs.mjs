// El rastro automático de una pantalla — la MISMA regla que el renderer web
// (libs/mateu/.../breadcrumbTrail.ts): el camino de menús hasta la ruta (grupos y la entrada que
// la muestra, secciones de un pod incluidas) y, pasada la entrada, el nivel del CRUD — el registro
// (con el título de su propia página) y «Editar» / «Nuevo».
//
// Redwood no tiene migas: Spectra no trae componente de breadcrumbs y su cabecera ofrece, en su
// lugar, la afordancia «ir al padre» (displayOptions.goToParent). De este rastro sale ese padre:
// la última miga con ruta antes de la actual.

const normRoute = (r) => {
  let s = String(r == null ? '' : r).trim()
  const q = s.search(/[?#]/)
  if (q >= 0) s = s.slice(0, q)
  if (s && s[0] !== '/') s = '/' + s
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

// el título como texto: fuera el marcado (repetidamente, para que nada se recomponga con los
// trozos) y después cualquier corchete que quede
const plainText = (text) => {
  let s = String(text == null ? '' : text)
  let previous
  do {
    previous = s
    s = s.replace(/<[^<>]*>/g, '')
  } while (s !== previous)
  return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

export function menuTrail(menu, path) {
  const current = normRoute(path)
  let best = null
  const walk = (options, above) => {
    for (const option of options || []) {
      if (!option || option.separator || option.visible === false) continue
      const route = normRoute(option.route || option.path)
      const label = plainText(option.caption || option.label)
      const children = option.submenus || option.submenu || []
      if (children.length > 0) {
        walk(children, [...above, route && route !== '/' ? { text: label, route } : { text: label }])
        continue
      }
      if (!route || route === '/') continue
      if ((current === route || current.startsWith(route + '/')) && (!best || route.length > best.route.length)) {
        best = { crumbs: [...above, { text: label, route }], route }
      }
    }
  }
  walk(menu, [])
  return best ? { crumbs: best.crumbs, matched: best.route } : { crumbs: [] }
}

const recordTitles = new Map()

export function autoTrail(menu, path, page = {}) {
  const { crumbs, matched } = menuTrail(menu, path)
  if (!matched) return []
  const trail = [...crumbs]
  const rest = normRoute(path).slice(matched.length).split('/').filter(Boolean)
  const lang = page.lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  const es = String(lang).toLowerCase().startsWith('es')
  if (rest.length > 0) {
    const id = decodeURIComponent(rest[0])
    if (id === 'new' || id === 'create') {
      trail.push({ text: es ? 'Nuevo' : 'New' })
    } else {
      const recordRoute = matched + '/' + rest[0]
      const title = plainText(page.title)
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
