import { chromeText } from './i18n.mjs'
// El árbol de navegación: las reglas de libs/mateu/.../navTree.ts que necesita este renderer,
// PORTADAS (no compartidas): el bridge se construye concatenando estos .mjs (make-amd.mjs) y no
// puede importar TypeScript. Mismas reglas, mismos casos en test.mjs; si cambia una, cambian las dos.
//
// Una sección remota llega como marcador (`remote: true`, sin hijos) hasta que su pod contesta. Lo
// que la shell sabe de ella antes —su rótulo y el prefijo bajo el que viven sus pantallas— basta
// para la sección activa y la primera miga.

const navRoute = (r) => {
  let s = String(r == null ? '' : r).trim()
  const q = s.search(/[?#]/)
  if (q >= 0) s = s.slice(0, q)
  if (s && s[0] !== '/') s = '/' + s
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

/** `path` es `route` o cuelga de ella. La raíz no casa por prefijo. */
export function routeCovers(route, path) {
  return !!route && route !== '/' && (path === route || path.indexOf(route + '/') === 0)
}

/** Una sección remota que aún no ha contestado (o que no contestó). */
export function isMount(option) {
  return !!(option && option.remote)
}

/** El prefijo de una sección remota: el que manda el servidor (`routePrefix`) o, si no, su path (o su ruta). */
export function mountPrefix(option) {
  return isMount(option) ? navRoute(option.routePrefix || option.path || option.route) : ''
}

/** Por qué una sección está deshabilitada, en el idioma de la UI. */
export function unavailableHint(label, lang) {
  const language = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  // Strip markup until nothing is left, then any stray angle bracket (as navTree.ts does): one pass of
  // the tag pattern can leave a tag behind (CodeQL js/incomplete-multi-character-sanitization).
  let name = String(label == null ? '' : label)
  for (let before = ''; before !== name;) {
    before = name
    name = name.replace(/<[^<>]*>/g, '')
  }
  name = name.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
  return chromeText('unavailableMount', { name }, language || 'en')
}

/**
 * Lo que contestó el pod, con el rótulo de la shell si lo DECLARÓ (`shellLabel`) y el pod contesta
 * con UNA entrada —lo normal: un grupo con el nombre del servicio—: manda la palabra de la shell, y
 * la barra no cambia bajo el lector. Varias entradas se pegan tal cual: no hay un nodo que nombrar.
 */
export function labelledByShell(entries, option) {
  if (option.shellLabel && option.label && entries.length === 1) {
    return [Object.assign({}, entries[0], { label: option.label, icon: option.icon || entries[0].icon })]
  }
  return entries
}

/**
 * HAMBURGER_SECTIONS: lo que contesta un pod montado en el primer nivel es UNA sección. Un grupo
 * ya lo es; varias entradas, o una sola pantalla, pasan a ser las entradas de una sección con el
 * rótulo (y el path) que la shell dio al montaje —pegarlas haría de cada pantalla del pod una
 * sección, y la subcabecera no tendría nada que enseñar—. Port de mergeRemoteMenus de navTree.ts.
 */
export function asSection(entries, option) {
  const list = entries || []
  const oneGroup = list.length === 1 && ((list[0].submenus || list[0].submenu || []).length > 0)
  if (oneGroup || !list.length) return list
  return [{ label: option.label, icon: option.icon, path: option.path, route: '', visible: option.visible, submenus: list }]
}

/** Las entradas de una sección oculta: no se pintan a ninguna profundidad, pero siguen en el árbol. */
export function markHidden(entries) {
  return entries.map((option) => {
    const children = option.submenus || option.submenu || []
    return Object.assign({}, option, { visible: false }, children.length ? { submenus: markHidden(children) } : {})
  })
}

/** La sección de un pod que no contestó: sigue ahí, deshabilitada y diciendo por qué. */
export function unavailableMount(option, lang) {
  return Object.assign({}, option, { unavailable: true, disabled: true, description: unavailableHint(option.label, lang) })
}

/**
 * Las rutas de una sección de primer nivel: las de sus entradas a cualquier profundidad (ocultas
 * incluidas: una pantalla bajo una sigue siendo de esa sección), el prefijo de una sección remota
 * que aún no contestó y los ids con que navega el menú ya proyectado (`node`, de shellNavOf).
 */
export function sectionRoutes(option, node) {
  const out = new Set()
  const add = (r) => {
    const s = navRoute(r)
    if (s && s !== '/') out.add(s)
  }
  const walkOption = (o) => {
    if (!o || o.separator) return
    if (isMount(o)) add(mountPrefix(o))
    add(o.route || o.path)
    for (const child of o.submenus || o.submenu || []) walkOption(child)
  }
  const walkNode = (n) => {
    if (!n) return
    add(n.id)
    for (const child of n.children || []) walkNode(child)
  }
  walkOption(option)
  walkNode(node)
  return Array.from(out)
}

/**
 * La sección de primer nivel que está en pantalla (la misma regla que activeSection.ts del
 * renderer web: la entrada que es la ruta, o el grupo que la contiene a cualquier profundidad):
 * su id, o null si la ruta no cuelga de ninguna — la home, p. ej. Gana la ruta más larga: una
 * sección no se queda con las pantallas de otra porque su prefijo sea más corto.
 */
function nodeRoutes(node, out = []) {
  if (!node) return out
  const route = navRoute(node.id)
  if (route && route !== '/') out.push(route)
  for (const child of node.children || []) nodeRoutes(child, out)
  return out
}

export function activeSectionOf(sections, current) {
  const path = navRoute(current)
  if (!path || path === '/') return null
  let best = null
  let length = 0
  for (const section of sections || []) {
    // una sección de primer nivel trae sus rutas (sectionRoutes); un ítem del segundo nivel
    // (HAMBURGER_SECTIONS) no: valen los ids de lo que cuelga de él
    for (const route of section.routes || nodeRoutes(section)) {
      if (routeCovers(route, path) && route.length > length) {
        best = section.id
        length = route.length
      }
    }
  }
  return best
}


/*
 * HAMBURGER_SECTIONS (al estilo de Opera Cloud): el primer nivel del menú son las SECCIONES, en la
 * hamburguesa; la subcabecera lleva el segundo nivel de la sección en pantalla (un grupo, en
 * desplegable: el tercer nivel). Port de activeSection/sectionHome de navTree.ts, sobre los nodos ya
 * proyectados por shellNavOf (id, children, disabled; lo oculto ya no está).
 */

/**
 * Adónde lleva elegir una sección: la propia sección si es una pantalla, si no su primera entrada
 * que se pueda abrir, en profundidad —la home de la sección, como en Opera—. null si no hay nada
 * que abrir (una sección remota que no contestó).
 */
export function sectionHomeOf(node) {
  if (!node || node.disabled) return null
  const children = node.children || []
  if (!children.length) return node.id || null
  for (const child of children) {
    const home = sectionHomeOf(child)
    if (home) return home
  }
  return null
}

/** El nodo de la sección en pantalla (activeSectionOf), o null —la home, p. ej.—. */
export function sectionOf(sections, current) {
  const id = activeSectionOf(sections, current)
  return id == null ? null : ((sections || []).find((section) => section.id === id) || null)
}

/** Las rutas centinela del servidor que significan «no hay home declarada»: la shell abre entonces
 *  la primera pantalla del menú (en profundidad), como la home de una sección. */
export function isSentinelHome(route) {
  const r = String(route || '')
  return !r || /(^|\/)_no_home_route$/.test(r) || /(^|\/)_page$/.test(r)
}

/**
 * La opción LOCAL del menú (no remota) que cubre una ruta —la de prefijo más largo, por tramos—,
 * o null. Una ruta de menú (`/inventory/floorPlan`) es del APP: el servidor sólo la resuelve si la
 * petición lleva el serverSideType del app que declara ese menú; sin él contesta «Not found.»
 * (en demo-vb no se notaba porque cada @Menu se llamaba como la ruta @UI de su clase).
 */
export function localMenuOptionOf(menu, route) {
  const path = String(route || '').split('?')[0]
  if (!path) return null
  let best = null
  const visit = (options) => {
    for (const o of options || []) {
      if (!o || o.remote || o.baseUrl) continue
      const r = o.route || o.path
      if (r && routeCovers(r, path) && (!best || r.length > (best.route || best.path).length)) best = o
      visit(o.submenus || o.submenu)
    }
  }
  visit(menu)
  return best
}
