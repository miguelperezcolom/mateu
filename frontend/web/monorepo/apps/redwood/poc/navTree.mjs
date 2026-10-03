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
  return String(language).toLowerCase().startsWith('es')
    ? `${name} no está disponible ahora. Se volverá a intentar.`
    : `${name} is not available right now. It will be retried.`
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
