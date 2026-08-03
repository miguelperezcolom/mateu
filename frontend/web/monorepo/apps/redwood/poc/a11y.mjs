// Accesibilidad del renderer VB — la parte que NO traen los componentes oj-*.
//
// Medido antes de escribir nada (axe-core sobre la app servida): la composición de oj-sp-*
// sale prácticamente limpia, igual que pasaba con Vaadin, porque esos componentes traen su
// propia accesibilidad. Los huecos reales son los de una SPA, que axe no puede evaluar:
// al cambiar de ruta no cambia la página, así que un lector de pantalla no tiene NADA que
// anunciar y el foco se queda donde estaba — normalmente en el enlace del menú que se acaba
// de pulsar, obligando a tabular por toda la shell para llegar al contenido pedido.
//
// Vive en poc/ (fuente única) para que make-amd.mjs lo empaquete en el bridge y la app lo
// use desde las chains, igual que el resto del core.

// ── región viva ──────────────────────────────────────────────────────────────────────────

const REGION_STYLE = [
  'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
  'overflow:hidden',
  // clip, NO display:none ni visibility:hidden: esas dos sacan el nodo del árbol de
  // accesibilidad, que es justo lo contrario de lo que hace falta aquí.
  'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
].join(';')

const regions = {}

function regionFor(politeness) {
  if (typeof document === 'undefined' || !document.body) return null
  const existing = regions[politeness]
  if (existing && existing.isConnected) return existing
  const region = document.createElement('div')
  region.setAttribute('aria-live', politeness)
  region.setAttribute('aria-atomic', 'true')
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
  region.setAttribute('data-mateu-live-region', politeness)
  region.style.cssText = REGION_STYLE
  document.body.appendChild(region)
  regions[politeness] = region
  return region
}

/**
 * Crea las regiones por adelantado.
 *
 * No es opcional: una región creada y rellenada en el mismo tick a menudo NO se anuncia,
 * porque la tecnología asistiva vigila mutaciones de regiones que ya conocía.
 */
export function installAnnouncer() {
  if (typeof document === 'undefined') return
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
    return
  }
  regionFor('polite')
  regionFor('assertive')
}

/**
 * Dice `message` a la tecnología asistiva. No pinta nada.
 *
 * `assertive` interrumpe y es para lo que el usuario no puede perderse (un guardado que
 * falló); `polite` espera una pausa y es para lo rutinario (dónde acaba de aterrizar). Usar
 * assertive para todo hace la app inusable, así que es opt-in.
 */
export function announce(message, options = {}) {
  const text = (message == null ? '' : String(message)).trim()
  if (!text) return
  const region = regionFor(options.politeness || 'polite')
  if (!region) return
  if (region.textContent === text) {
    // Repetir el mismo mensaje es un caso real (dos guardados fallidos seguidos) y una
    // región cuyo texto no cambia no anuncia nada: se limpia y se repone.
    region.textContent = ''
    setTimeout(() => { region.textContent = text }, 60)
    return
  }
  region.textContent = text
}

// ── foco tras navegar ────────────────────────────────────────────────────────────────────

/**
 * Lleva el foco al contenido recién cargado.
 *
 * Se busca el primer encabezado del área de contenido; si no hay, el propio contenedor, al
 * que se le da `tabindex="-1"` para que pueda recibir foco por programa sin añadir una
 * parada de tabulación propia.
 */
export function focusContent() {
  if (typeof document === 'undefined') return false
  const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
  if (!root) return false

  // Candidatos en orden de preferencia. El encabezado tiene que llevar TEXTO: la shell pinta
  // un <h1> vacío hasta que llega el título, y un encabezado vacío no es focusable (ni sería
  // útil anunciarlo) — el intento fallaba en silencio y el foco se quedaba donde estaba.
  const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
    .filter((h) => (h.textContent || '').trim().length > 0)
  const candidates = [...headings, root]

  for (const target of candidates) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
    // Comprobar que PRENDIÓ: focus() sobre un elemento sin caja no hace nada y no avisa.
    if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
      return true
    }
  }
  return false
}

let hasNavigated = false

/**
 * Anuncia la llegada a una pantalla y deja el foco en ella.
 *
 * Dos límites deliberados, y los dos importan:
 *
 *  - Sólo en navegaciones REALES. Un re-render no debe tocar el foco: se lo arrancaría al
 *    usuario del campo que está editando.
 *  - NUNCA en la primera carga. Ahí el documento ya empieza arriba, y llevar el foco al
 *    contenido deja el enlace de salto por DETRÁS del punto de partida: el primer tabulador
 *    del usuario ya no lo alcanza y el menú queda sólo a base de Shift+Tab. Se anuncia el
 *    título igualmente, que es lo que aporta valor en esa primera pantalla.
 */
export function announceNavigation(title) {
  announce(title)
  if (hasNavigated) focusContentSoon()
  hasNavigated = true
}

/**
 * Intenta llevar el foco al contenido durante unos cuantos frames.
 *
 * VB actualiza los bindings de forma asíncrona: en el momento en que la chain de navegación
 * termina, el contenido nuevo AÚN NO está en el DOM. Enfocar ahí prende sobre el contenido
 * viejo y se pierde en cuanto se reemplaza — que es exactamente lo que pasaba. Se reintenta
 * hasta que prenda, o se abandona: mejor no mover el foco que dejarlo en un sitio raro.
 */
export function focusContentSoon(framesLeft = 12) {
  if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
  requestAnimationFrame(() => {
    if (focusContent()) return
    if (framesLeft > 0) focusContentSoon(framesLeft - 1)
  })
}

/** Test seam: olvida que ya se navegó. */
export function resetNavigationState() { hasNavigated = false }

// ── salto al contenido ───────────────────────────────────────────────────────────────────

/**
 * Monta el enlace "saltar al contenido" como PRIMER elemento del body (WCAG 2.4.1).
 *
 * Cada pantalla empieza por el mismo menú. Sin una vía para saltarlo, quien navega con
 * teclado paga ese menú entero en cada pantalla antes de llegar a lo que venía a hacer.
 *
 * Oculto por transform y no por display:none, porque un elemento con display:none no puede
 * recibir foco — y entonces el enlace sería inalcanzable, que es justo lo contrario.
 */
export function mountSkipLink(label = 'Saltar al contenido') {
  if (typeof document === 'undefined') return
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
    return
  }
  if (document.querySelector('.mateu-skip-link')) return
  const link = document.createElement('button')
  link.className = 'mateu-skip-link'
  link.textContent = label
  link.addEventListener('click', focusContent)
  document.body.insertBefore(link, document.body.firstChild)
}

// ── estado de ocupado en el control pulsado ──────────────────────────────────────────────

/**
 * Marca ocupado el control que el usuario pulsó, mientras su acción está en vuelo.
 *
 * La barra global responde a "¿está ocupada la app?", pero la pregunta que se hace quien está
 * en una conexión lenta es "¿se ha enterado de mi clic?". Sin esto pulsa Guardar, no cambia
 * nada, y vuelve a pulsar.
 *
 * Anima la OPACIDAD del propio elemento y no dibuja un spinner en ::after: sobre un shadow
 * host el pseudo-elemento no se pinta (comprobado en los renderers web con un
 * `inset:0;background:red` sobre un vaadin-button vivo), y no hay garantía de que los
 * componentes de JET no lo sean.
 */
export function markPending(element) {
  if (!element || !element.setAttribute) return
  if (element.hasAttribute('data-mateu-pending')) return
  element.setAttribute('data-mateu-pending', '')
  element.setAttribute('aria-busy', 'true')
}

export function clearPending(element) {
  if (!element || !element.removeAttribute) return
  element.removeAttribute('data-mateu-pending')
  element.removeAttribute('aria-busy')
}

/**
 * El control realmente pulsado a partir del evento, o null si no lo hay.
 *
 * Sólo se decora una lista CERRADA de cosas con pinta de botón: atenuar un contenedor (una
 * tabla, un formulario entero) sería peor que no mostrar nada, y una acción puede dispararse
 * desde cualquier sitio — un trigger, un atajo, el clic de una fila.
 */
const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

export function pressedControl(event) {
  const target = event && (event.target || event.currentTarget)
  if (!target || !target.closest) return null
  return target.closest(INTERACTIVE)
}

/**
 * Sigue el control pulsado a nivel de DOCUMENTO y lo marca mientras haya trabajo en vuelo.
 *
 * Enhebrar el evento por cada chain no vale: los botones de la app pasan por chains
 * distintas (toolbar, listado, wizard, isla…) y cualquiera nueva se olvidaría de hacerlo. En
 * cambio el clic siempre pasa por el documento, y el transporte siempre avisa de cuándo
 * empieza y acaba — así que emparejar las dos señales cubre todos los caminos, incluidos los
 * que aún no existen.
 *
 * La ventana de gracia evita marcar un control por trabajo que no desencadenó él (un trigger
 * OnLoad, un autosave): sólo cuenta si la petición sale justo detrás del clic.
 */
const PRESS_GRACE_MS = 400
let lastPress = { control: null, at: 0 }
let markedControl = null

export function trackPressedControls() {
  if (typeof document === 'undefined') return
  document.addEventListener('click', (e) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : []
    const origin = path[0] || e.target
    const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
    lastPress = { control, at: Date.now() }
  }, true)
}

/** Llamar desde el hook onStart del transporte. */
export function markPressedControlBusy() {
  if (!lastPress.control) return
  if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
  markedControl = lastPress.control
  markPending(markedControl)
}

/** Llamar desde el hook onSettle. */
export function clearPressedControlBusy() {
  clearPending(markedControl)
  markedControl = null
}

// ── reintento a nivel de chain ───────────────────────────────────────────────────────────

/**
 * Qué hay que rehacer tras un fallo.
 *
 * Se guarda un DESCRIPTOR, no un cierre. Un cierre atrapa el `context` de VB de la ejecución
 * que falló, y ese contexto ya no sirve cuando el usuario pulsa Reintentar un segundo después:
 * la llamada no hace nada y falla en silencio (me pasó). Con un descriptor, quien reintenta
 * usa SU contexto, que está vivo.
 *
 * Reenviar sólo la petición tampoco valdría: una respuesta que nadie procesa no cambia nada en
 * pantalla — la misma lección que en los renderers web. Por eso lo que se rehace es la acción
 * o la navegación ENTERA.
 */
let lastRetry = null

/** `{ kind: 'navigate', route }` o `{ kind: 'action', actionId, parameters }`. */
export function setLastRetry(descriptor) {
  lastRetry = descriptor && descriptor.kind ? descriptor : null
}

export function hasLastRetry() { return !!lastRetry }

/** Devuelve el descriptor y lo olvida: un reintento se ofrece una vez. */
export function takeLastRetry() {
  const descriptor = lastRetry
  lastRetry = null
  return descriptor
}
