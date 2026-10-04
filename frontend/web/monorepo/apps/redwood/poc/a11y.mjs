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

// ── campos obligatorios ───────────────────────────────────────────────────────────────────

/** Los widgets de un campo del formulario de la página (no los de un diálogo o un drawer). */
function fieldElementsOf(fieldId) {
  if (typeof document === 'undefined') return []
  // comparando el atributo, sin montar un selector con el id: nada que escapar
  return [...document.querySelectorAll('[data-field-id]')]
    .filter((el) => el.getAttribute('data-field-id') === String(fieldId))
    .filter((el) => !el.closest('oj-dialog, oj-drawer-popup, oj-sp-general-drawer-template, oj-sp-create-edit-drawer-template'))
}

/**
 * Marca los obligatorios vacíos como lo hace un formulario Redwood y lleva el foco al primero.
 *
 * El mensaje es el del propio componente: `validate()` corre su validador de obligatorio (el
 * `required` que ya pinta «Obligatorio» bajo el campo) y enseña su texto — «Introduzca un
 * valor.», en el idioma de JET —, igual que al salir de un campo vacío. Si un componente no se
 * da por inválido (su valor no ha llegado aún al widget), el mensaje va por `messagesCustom`.
 * Devuelve cuántos campos marcó.
 */
export async function showFieldErrors(fieldIds, fallbackMessage) {
  let first = null
  let marked = 0
  for (const fieldId of fieldIds || []) {
    for (const el of fieldElementsOf(fieldId)) {
      let invalid = false
      if (typeof el.validate === 'function') {
        try { invalid = (await el.validate()) === 'invalid' } catch (ignored) { invalid = false }
      }
      if (!invalid) {
        if ('messagesCustom' in el || typeof el.validate === 'function') {
          try {
            el.messagesCustom = [{ severity: 'error', summary: fallbackMessage || 'Enter a value.', detail: '' }]
          } catch (ignored) { /* no es un componente JET */ }
        } else {
          // un campo que no es un componente JET (los chips de un @Searchable): el mensaje lo
          // pinta su CSS (.mateu-field-error + data-error) hasta que se vuelva a tocar
          el.setAttribute('data-error', fallbackMessage || 'Enter a value.')
          el.classList.add('mateu-field-error')
        }
      }
      marked++
      if (!first) first = el
    }
  }
  if (first) {
    try { first.scrollIntoView({ block: 'center' }) } catch (ignored) { /* jsdom */ }
    const input = first.querySelector && first.querySelector('input, textarea, [tabindex="0"]')
    try { (input || first).focus() } catch (ignored) { /* sin caja */ }
  }
  return marked
}

/** Quita las marcas de error de los campos que no son componentes JET (ver showFieldErrors). */
export function clearFieldErrorMarks(fieldId) {
  if (typeof document === 'undefined') return
  for (const el of document.querySelectorAll('.mateu-field-error')) {
    if (fieldId == null || el.getAttribute('data-field-id') === String(fieldId)) {
      el.classList.remove('mateu-field-error')
      el.removeAttribute('data-error')
    }
  }
}

/** Al editar un campo marcado, su mensaje propio se va (el del validador lo gestiona JET). */
export function clearFieldError(element) {
  if (element && Array.isArray(element.messagesCustom) && element.messagesCustom.length) {
    element.messagesCustom = []
  }
}

let guidedProcessGuarded = false

/**
 * El guided process (oj-sp-guided-process) avanza SOLO al pulsar Continue o un paso del rail,
 * antes de saber si Mateu deja salir del paso: sus eventos spBeforeNext/spBeforeStepNavigate se
 * pueden cancelar, pero sólo en el momento, y las chains de VB corren después. Aquí se cancelan
 * siempre, en captura (no burbujean: la captura los ve igual), y el paso que se enseña lo manda
 * el servidor (current-step ← el paso del wire tras cada acción): si el paso no valida, el
 * proceso no se mueve. Las chains siguen recibiendo el evento y lanzan la acción.
 */
export function guardGuidedProcess() {
  if (guidedProcessGuarded || typeof document === 'undefined') return
  guidedProcessGuarded = true
  const cancel = (event) => {
    const target = event.target
    if (target && target.id === 'mateuWizardEl') event.preventDefault()
  }
  document.addEventListener('spBeforeNext', cancel, true)
  document.addEventListener('spBeforeStepNavigate', cancel, true)
  relaxGuidedProcessOverview()
}

/**
 * La consulta con la que oj-sp-guided-process decide si su OVERVIEW (la portada con un panel por
 * paso) va en columna: «(max-width: 767px), (max-height: 767px)». Pensada para un guided process a
 * pantalla completa, apila los paneles en cuanto la ventana es estrecha O baja — un portátil con la
 * ventana a menos de 768px de alto ya ve los pasos uno debajo de otro. Con app.css los paneles se
 * reparten el ancho del contenido (una fila; otra sólo si de verdad no caben), así que la columna
 * se reserva al teléfono (RDS: < 600px). Cualquier otra consulta pasa intacta.
 */
export const GUIDED_PROCESS_VERTICAL_QUERY = '(max-width: 767px), (max-height: 767px)'
export const GUIDED_PROCESS_PHONE_QUERY = '(max-width: 599px)'

export function guidedProcessMediaQuery(query) {
  const normalized = String(query == null ? '' : query).replace(/\s+/g, ' ').trim()
  return normalized === GUIDED_PROCESS_VERTICAL_QUERY ? GUIDED_PROCESS_PHONE_QUERY : query
}

/**
 * La rueda del ratón sobre el overview: el componente la convierte SIEMPRE en scroll horizontal
 * (preventDefault), porque en su diseño los paneles desbordan a lo ancho. Repartidos a lo ancho ya
 * no desbordan, y robarle la rueda a la página sólo impediría bajar (p.ej. a la 2ª fila). Se le
 * deja el gesto al componente sólo si su contenedor de pasos aún desborda a lo ancho.
 */
export function guidedProcessWheelIsNative(stepContainer) {
  if (!stepContainer) return false
  return stepContainer.scrollWidth <= stepContainer.clientWidth + 1
}

let guidedProcessOverviewRelaxed = false

export function relaxGuidedProcessOverview() {
  if (guidedProcessOverviewRelaxed || typeof window === 'undefined' || typeof document === 'undefined') return
  guidedProcessOverviewRelaxed = true
  if (typeof window.matchMedia === 'function') {
    const original = window.matchMedia.bind(window)
    window.matchMedia = (query) => original(guidedProcessMediaQuery(query))
  }
  document.addEventListener('wheel', (event) => {
    const target = event.target
    const wizard = target && target.closest ? target.closest('#mateuWizardEl') : null
    if (!wizard) return
    const steps = wizard.querySelector('.oj-sp-guided-process-step-container')
    if (steps && steps.contains(target) && guidedProcessWheelIsNative(steps)) event.stopPropagation()
  }, { capture: true, passive: true })
}
