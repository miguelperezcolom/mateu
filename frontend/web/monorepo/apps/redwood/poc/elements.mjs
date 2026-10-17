// Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
// atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
//
// Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
// recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
// selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
// renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
// compartido (libs/mateu elementRenderer).

import { sanitizeHtml } from './richtext.mjs'
import { safeHref } from './core/display.mjs'

const loaded = {}

// ── eventos del componente → acción en el servidor ─────────────────────────────────────────────
// `Element.on` = { nombreDeEvento: actionId }. Es la vía de escape oficial (un grafo, un editor,
// un plano de planta de terceros), así que su ida y vuelta tiene que funcionar entera: el evento
// viaja como parámetro `event` de la acción, igual que en el renderer web compartido —el
// `detail` de un CustomEvent, o las propiedades primitivas de cualquier otro evento—. La app
// registra un sumidero (setElementEventSink) que sabe en qué superficie se ejecuta la acción;
// sin sumidero (Node, tests) los eventos se ignoran.

let sink = null
let moduleBase = ''

/** Base del backend Mateu (la constante mateuBaseUrl): un `import` RELATIVO lo sirve el backend,
 *  no la app VB — en VB alojado en Oracle o en vb-serve son orígenes distintos. '' = mismo origen. */
export function setElementModuleBase(base) {
  moduleBase = String(base || '').replace(/\/$/, '')
}

/** La URL de la que se carga el módulo de un Element. */
export function elementModuleUrl(importUrl, base = moduleBase) {
  if (!importUrl) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(importUrl) || importUrl.startsWith('//')) return importUrl
  const root = String(base || '').replace(/\/+$/, '')
  return root ? root + (importUrl.startsWith('/') ? '' : '/') + importUrl : importUrl
}

/** La app VB registra aquí quién ejecuta la acción de un evento: (actionId, parameters, atom). */
export function setElementEventSink(fn) {
  sink = typeof fn === 'function' ? fn : null
}

/** El evento tal como viaja al servidor (mismo criterio que libs/mateu elementRenderer). */
export function serializeElementEvent(e) {
  if (e == null) return null
  if (typeof CustomEvent !== 'undefined' && e instanceof CustomEvent) return e.detail
  if (e.detail !== undefined && e.constructor && e.constructor.name === 'CustomEvent') return e.detail
  const out = {}
  for (const k in e) {
    const v = e[k]
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v
  }
  return out
}

/** Engancha UNA vez cada evento declarado; la acción se lee al dispararse (la del último render),
 *  así un re-render que cambia `on` no duplica listeners ni deja el actionId viejo. */
export function wireElementEvents(element, atom) {
  element.__mateuAtom = atom
  const wired = element.__mateuWired || (element.__mateuWired = {})
  for (const eventName of Object.keys(atom.on || {})) {
    if (wired[eventName]) continue
    wired[eventName] = true
    element.addEventListener(eventName, (e) => {
      const current = element.__mateuAtom || {}
      const actionId = (current.on || {})[eventName]
      if (!actionId || !sink) return
      sink(actionId, { event: serializeElementEvent(e) }, current)
    })
  }
}

// ── HTML con DATOS: saneado ────────────────────────────────────────────────────────────────────
// El contenido escrito en la definición se confía tal cual; en cuanto `${…}` ha metido datos en
// él se sanea. It used to be a hand-rolled DENY-list (it kept <style>, <form>, SVG <set>/<animate>,
// <math>, and never looked inside a <template>); it is now the bridge's ONE whitelist sanitizer
// (richtext.mjs sanitizeHtml) in its presentation mode: text markup, tables, images with a safe
// src, class/title and a filtered style — nothing that runs.
export function sanitizeElementHtml(html) {
  return html == null ? '' : sanitizeHtml(String(html), { presentation: true })
}

// ── atributos con DATOS (M-S7) ─────────────────────────────────────────────────────────────────
// Un atributo escrito literal es del autor y pasa tal cual (salvo srcdoc: un documento entero en
// el origen de la app). Uno cuyo valor declarado lleva `${…}` trae DATOS: nunca un manejador on…,
// y una URL sólo como enlace seguro (safeHref) — y en un elemento que carga CÓDIGO por su URL
// (script, object, embed, base, link, meta) ni eso. Misma regla que libs/mateu elementAttributes.ts.
const ELEMENT_URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'background', 'poster',
  'data', 'cite', 'ping', 'srcset', 'manifest', 'codebase', 'longdesc', 'usemap', 'icon'])
const CODE_LOADING_ELEMENTS = new Set(['script', 'object', 'embed', 'base', 'link', 'meta', 'applet', 'frame'])

/** The value to set for an Element attribute, or undefined to leave it out. */
export function elementAttributeValue(elementName, attribute, declared, resolved) {
  const name = String(attribute).toLowerCase()
  if (name === 'srcdoc') return undefined
  if (!String(declared == null ? '' : declared).includes('${')) return resolved
  if (name.startsWith('on')) return undefined
  if (ELEMENT_URL_ATTRIBUTES.has(name)) {
    if (CODE_LOADING_ELEMENTS.has(String(elementName).toLowerCase())) return undefined
    const cleaned = String(resolved == null ? '' : resolved).replace(/[\t\n\r]/g, '').replace(/^[\u0000- ]+/, '')
    return safeHref(cleaned) || undefined
  }
  return resolved
}

/**
 * Carga el módulo que define la etiqueta, una sola vez. El elemento se puede crear antes: los
 * componentes web se "actualizan" solos en cuanto su definición llega.
 *
 * Se inyecta un `<script type="module">` en vez de usar `import(url)` porque el build de VB
 * transpila el import dinámico a un `require()` de AMD, y requirejs se pone a resolver la URL
 * como si fuera un id de módulo suyo: la petición no llega a salir y el hueco se queda vacío
 * sin un solo error. Un script de módulo no lo puede reescribir nadie.
 */
function ensureDefined(name, importUrl) {
  if (!importUrl || !name || name.indexOf('-') < 0) return
  if (loaded[importUrl]) return
  if (typeof customElements !== 'undefined' && customElements.get(name)) return
  if (typeof document === 'undefined') return
  loaded[importUrl] = true
  const script = document.createElement('script')
  script.type = 'module'
  script.src = importUrl
  // que un componente de terceros no cargue no puede tumbar la pantalla: el hueco se queda
  // vacío y el resto del contenido sigue ahí
  script.addEventListener('error', () => { loaded[importUrl] = false })
  document.head.appendChild(script)
}

function hydrate(element, atom) {
  for (const key of Object.keys(atom.attributes || {})) {
    // setAttribute sobre el que YA está, nunca sobre uno nuevo: el componente lo convierte en
    // cambio de propiedad y se repinta conservando lo suyo
    element.setAttribute(key, atom.attributes[key])
  }
  if (atom.style) element.setAttribute('style', atom.style)
  if (atom.cssClasses) element.setAttribute('class', atom.cssClasses)
  if (atom.content) {
    if (atom.asHtml) element.innerHTML = atom.dataInContent ? sanitizeElementHtml(atom.content) : atom.content
    else element.textContent = atom.content
  }
  wireElementEvents(element, atom)
}

/** Hidrata los huecos `.mateu-element` que haya en el documento. Devuelve cuántos quedaron
 *  montados, para que quien reintenta sepa si ya está. */
export function mountElements(atoms) {
  const byId = {}
  for (const atom of atoms || []) byId[atom.elementId] = atom
  let mounted = 0
  const holes = typeof document === 'undefined'
    ? [] : document.querySelectorAll('.mateu-element[data-element-id]')
  for (const hole of holes) {
    const atom = byId[hole.getAttribute('data-element-id')]
    if (!atom) continue
    ensureDefined(atom.name, elementModuleUrl(atom.importUrl))
    let element = hole.firstElementChild
    if (!element || element.tagName.toLowerCase() !== atom.name.toLowerCase()) {
      hole.textContent = ''
      element = document.createElement(atom.name)
      hole.appendChild(element)
    }
    hydrate(element, atom)
    mounted += 1
  }
  return mounted
}

/** Igual, pero esperando a que VB pinte: sus bindings se actualizan de forma ASÍNCRONA, así que
 *  al terminar la chain el hueco todavía no está en el DOM (la misma trampa que costó el foco
 *  del contenido en la accesibilidad). */
export function mountElementsSoon(atoms, frames = 12) {
  const pending = (atoms || []).filter((a) => a && a.isElement)
  if (!pending.length || typeof requestAnimationFrame === 'undefined') return
  let left = frames
  const tick = () => {
    if (mountElements(pending) >= pending.length) return
    left -= 1
    if (left > 0) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Los átomos isElement de una proyección de bloques (los que hay que montar). */
export function elementAtomsOf(blocks) {
  const out = []
  for (const block of blocks || []) {
    for (const atom of block.items || []) if (atom && atom.isElement) out.push(atom)
  }
  return out
}

/** Los átomos isElement del CONTENIDO de un foldout (overview + cada panel): un Element en un
 *  panel (p.ej. la tabla «In other systems» de una reserva, HTML del servidor) se quedaba sin
 *  montar — el panel salía en blanco — porque sólo se montaban los del contenido del host. */
export function foldoutElementAtomsOf(content) {
  if (!content) return []
  const out = elementAtomsOf((content.overview || {}).blocks)
  for (const panel of content.panels || []) out.push(...elementAtomsOf(panel && panel.blocks))
  return out
}
