// Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
// atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
//
// Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
// recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
// selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
// renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
// compartido (libs/mateu elementRenderer).

const loaded = {}

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
    if (atom.asHtml) element.innerHTML = atom.content
    else element.textContent = atom.content
  }
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
    ensureDefined(atom.name, atom.importUrl)
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
