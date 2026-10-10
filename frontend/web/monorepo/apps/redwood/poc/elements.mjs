// Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
// atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
//
// Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
// recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
// selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
// renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
// compartido (libs/mateu elementRenderer).

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
// él se sanea (sin scripts, sin manejadores on…, sin URLs javascript:) — XSS almacenado. El
// renderer web lo hace con DOMPurify; aquí no hay dependencias, así que un saneado por DOM con
// las mismas reglas.
const DROP_TAGS = /^(script|iframe|object|embed|link|meta|base|frame|frameset|noscript)$/i
const URL_ATTRS = /^(href|src|xlink:href|action|formaction|background|poster)$/i

export function sanitizeHtml(html, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || html == null) return html == null ? '' : String(html)
  const tpl = doc.createElement('template')
  tpl.innerHTML = String(html)
  const walk = (root) => {
    for (const el of [...root.querySelectorAll('*')]) {
      if (DROP_TAGS.test(el.tagName)) { el.remove(); continue }
      for (const attr of [...el.attributes]) {
        const name = attr.name
        const value = String(attr.value || '').replace(/[\s\u0000-\u001f]/g, '').toLowerCase()
        if (/^on/i.test(name)
          || (URL_ATTRS.test(name) && (value.startsWith('javascript:') || value.startsWith('vbscript:')
            || (value.startsWith('data:') && !value.startsWith('data:image/'))))
          || (name === 'srcdoc')) el.removeAttribute(name)
      }
    }
  }
  walk(tpl.content)
  return tpl.innerHTML
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
    if (atom.asHtml) element.innerHTML = atom.dataInContent ? sanitizeHtml(atom.content) : atom.content
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
