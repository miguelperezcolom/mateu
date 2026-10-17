// Mounting of third-party WEB COMPONENTS (isElement atom): the wire carries the tag, its
// attributes and the URL of the module that defines it. It lives outside the reducer because it touches the DOM.
//
// Why it cannot be painted in the template: VB cannot write `<{name}>`. And why it is not
// recreated on every render: a web component keeps state the server does not know —the zoom and
// selection of a graph, an already computed layout—, so it is created ONCE per slot and on
// subsequent renders only its attributes are rewritten. Same criterion as the shared web
// renderer (libs/mateu elementRenderer).

const loaded = {}

// ── component events → server action ─────────────────────────────────────────────
// `Element.on` = { eventName: actionId }. It is the official escape hatch (a graph, an editor,
// a third-party floor plan), so its round trip has to work fully: the event
// travels as the action's `event` parameter, just as in the shared web renderer —the
// `detail` of a CustomEvent, or the primitive properties of any other event—. The app
// registers a sink (setElementEventSink) that knows on which surface the action runs;
// without a sink (Node, tests) events are ignored.

let sink = null
let moduleBase = ''

/** Base of the Mateu backend (the mateuBaseUrl constant): a RELATIVE `import` is served by the backend,
 *  not the VB app — in VB hosted on Oracle or in vb-serve they are different origins. '' = same origin. */
export function setElementModuleBase(base) {
  moduleBase = String(base || '').replace(/\/$/, '')
}

/** The URL an Element's module is loaded from. */
export function elementModuleUrl(importUrl, base = moduleBase) {
  if (!importUrl) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(importUrl) || importUrl.startsWith('//')) return importUrl
  const root = String(base || '').replace(/\/+$/, '')
  return root ? root + (importUrl.startsWith('/') ? '' : '/') + importUrl : importUrl
}

/** The VB app registers here who runs an event's action: (actionId, parameters, atom). */
export function setElementEventSink(fn) {
  sink = typeof fn === 'function' ? fn : null
}

/** The event as it travels to the server (same criterion as libs/mateu elementRenderer). */
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

/** Hooks each declared event ONCE; the action is read when it fires (that of the last render),
 *  so a re-render that changes `on` neither duplicates listeners nor keeps the old actionId. */
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

// ── HTML with DATA: sanitised ────────────────────────────────────────────────────────────────────
// Content written in the definition is trusted as is; as soon as `${…}` has put data into
// it, it is sanitised (no scripts, no on… handlers, no javascript: URLs) — stored XSS. The
// web renderer does it with DOMPurify; here there are no dependencies, so a DOM-based sanitiser with
// the same rules.
const DROP_TAGS = /^(script|iframe|object|embed|link|meta|base|frame|frameset|noscript)$/i
const URL_ATTRS = /^(href|src|xlink:href|action|formaction|background|poster)$/i

export function sanitizeElementHtml(html, doc = typeof document !== 'undefined' ? document : null) {
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
 * Loads the module that defines the tag, only once. The element can be created before: web
 * components "upgrade" themselves as soon as their definition arrives.
 *
 * A `<script type="module">` is injected instead of using `import(url)` because the VB build
 * transpiles dynamic import into an AMD `require()`, and requirejs starts resolving the URL
 * as if it were one of its module ids: the request never goes out and the slot stays empty
 * without a single error. Nobody can rewrite a module script.
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
  // a third-party component failing to load must not bring the screen down: the slot stays
  // empty and the rest of the content is still there
  script.addEventListener('error', () => { loaded[importUrl] = false })
  document.head.appendChild(script)
}

function hydrate(element, atom) {
  for (const key of Object.keys(atom.attributes || {})) {
    // setAttribute on the one ALREADY there, never on a new one: the component turns it into a
    // property change and repaints keeping its own state
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

/** Hydrates the `.mateu-element` slots in the document. Returns how many ended up
 *  mounted, so whoever retries knows whether it is done. */
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

/** The same, but waiting for VB to paint: its bindings update ASYNCHRONOUSLY, so
 *  when the chain finishes the slot is not in the DOM yet (the same trap that cost the content
 *  focus in accessibility). */
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

/** The isElement atoms of a block projection (the ones to mount). */
export function elementAtomsOf(blocks) {
  const out = []
  for (const block of blocks || []) {
    for (const atom of block.items || []) if (atom && atom.isElement) out.push(atom)
  }
  return out
}

/** The isElement atoms of a foldout's CONTENT (overview + each panel): an Element in a
 *  panel (e.g. a booking's «In other systems» table, server HTML) was left
 *  unmounted — the panel came out blank — because only those of the host's content were mounted. */
export function foldoutElementAtomsOf(content) {
  if (!content) return []
  const out = elementAtomsOf((content.overview || {}).blocks)
  for (const panel of content.panels || []) out.push(...elementAtomsOf(panel && panel.blocks))
  return out
}
