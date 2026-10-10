// TECLADO de la shell VB: los atajos declarados y las TECLAS DE ACCESO.
//  - @Action(shortcut) de la pantalla en curso: el atajo lanza la acción (por el canal de los
//    Element), como en el renderer web; sólo combinaciones con Ctrl/Alt/Meta — una tecla suelta
//    es del campo donde se escribe — o una TECLA DE FUNCIÓN (F1–F12, sola o combinada): no
//    escribe nada en un campo, y las aplicaciones de back-office las usan (F2, F9…).
//  - @Tab(shortcut): selecciona la pestaña (el li del oj-tab-bar lleva data-shortcut).
//  - @App(accessKeys): mantener Alt enseña una tecla junto a cada botón y pestaña visibles — su
//    atajo si lo declara, si no una letra de su etiqueta asignada sin repetir — y Alt+letra lo
//    pulsa. Lo de OPERA con su tecla de acceso. Lo puro (qué letra toca a quién) se prueba en Node.

/** Las letras de acceso para unas etiquetas: primero las iniciales de sus palabras, luego cualquier
 *  letra de la etiqueta, luego cifras; sin repetir y saltando las reservadas. '' si no queda. */
export function assignAccessKeys(labels, reserved = []) {
  const used = new Set(reserved.map((k) => String(k).toLowerCase()))
  return labels.map((label) => {
    const text = String(label || '').toLowerCase()
    const initials = text.split(/[^a-z0-9áéíóúñ]+/i).map((w) => w.charAt(0))
    const letters = [...text]
    for (const c of [...initials, ...letters, ...'1234567890']) {
      if (/^[a-z0-9]$/.test(c) && !used.has(c)) { used.add(c); return c }
    }
    return ''
  })
}

/** Etiqueta legible de un atajo: «ctrl+shift+s» → «Ctrl+Shift+S». */
export const keyHint = (shortcut) => String(shortcut || '').split('+').filter(Boolean)
  .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')

// ── atajos de acción de la pantalla en curso ──────────────────────────────────────────────────
let shortcutActions = []
/** Una tecla de función (F1–F12): la de un atajo («f2», «shift+f9») o la de un evento (e.key). */
const FUNCTION_KEY = /^f([1-9]|1[0-2])$/i
export const isFunctionKeyShortcut = (shortcut) =>
  FUNCTION_KEY.test(String(shortcut || '').split('+').pop().trim())
/** La pantalla en curso (afterReduce): sus acciones con atajo con modificador o tecla de función. */
export function setShortcutContext(hostCtx) {
  const actions = (hostCtx && hostCtx.tree && hostCtx.tree.actions) || []
  shortcutActions = actions
    .filter((a) => a && a.id && a.shortcut
      && (/(^|\+)(ctrl|control|alt|meta|cmd)(\+|$)/i.test(a.shortcut) || isFunctionKeyShortcut(a.shortcut)))
    .map((a) => ({ id: a.id, shortcut: String(a.shortcut).toLowerCase() }))
}
export const currentShortcutActions = () => shortcutActions

let keysSink = null
export function setKeysActionSink(fn) { keysSink = typeof fn === 'function' ? fn : null }

let accessKeysOn = false
export function setAccessKeysEnabled(on) { accessKeysOn = !!on }

// ── DOM ────────────────────────────────────────────────────────────────────────────────────────
const keyTargetVisible = (el) => {
  if (!el || !el.getClientRects || !el.getClientRects().length) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (el.ownerDocument.defaultView.innerHeight || 1e6)
}
const labelOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()

/** Lo que se puede pulsar con una tecla de acceso: botones (no deshabilitados) y pestañas. */
function accessCandidates(doc) {
  const out = []
  for (const el of doc.querySelectorAll('oj-button, oj-menu-button, oj-tab-bar li')) {
    if (!keyTargetVisible(el) || el.hasAttribute('disabled') || el.closest('[aria-hidden="true"], .mateu-access-keys')) continue
    const label = labelOf(el)
    if (!label) continue
    const actionId = el.getAttribute('data-action-id')
    const declared = el.getAttribute('data-shortcut')
      || (actionId && (shortcutActions.find((a) => a.id === actionId) || {}).shortcut) || ''
    out.push({ el, label, declared })
  }
  return out
}

const activate = (el) => {
  const inner = el.querySelector && el.querySelector('button')
  if (inner) inner.click()
  else el.click()
}

const reservedAltLetters = () => shortcutActions
  .map((a) => /^alt\+([a-z0-9])$/.exec(a.shortcut)).filter(Boolean).map((m) => m[1])

function showAccessKeys(doc) {
  hideAccessKeys(doc)
  const candidates = accessCandidates(doc)
  const free = candidates.filter((c) => !c.declared)
  const letters = assignAccessKeys(free.map((c) => c.label), reservedAltLetters())
  free.forEach((c, i) => { c.letter = letters[i] })
  const layer = doc.createElement('div')
  layer.className = 'mateu-access-keys'
  layer.setAttribute('aria-hidden', 'true')
  for (const c of candidates) {
    const text = c.declared ? keyHint(c.declared) : (c.letter ? c.letter.toUpperCase() : '')
    if (!text) continue
    const r = c.el.getBoundingClientRect()
    const badge = doc.createElement('span')
    badge.className = 'mateu-access-key'
    badge.textContent = text
    badge.style.left = Math.max(0, r.left - 4) + 'px'
    badge.style.top = Math.max(0, r.top - 8) + 'px'
    layer.appendChild(badge)
  }
  doc.body.appendChild(layer)
  doc.__mateuAccessMap = candidates.filter((c) => c.letter).map((c) => ({ letter: c.letter, el: c.el }))
}

function hideAccessKeys(doc) {
  for (const l of doc.querySelectorAll('.mateu-access-keys')) l.remove()
}

const matches = (shortcut, e) => (typeof shortcutMatches === 'function' ? shortcutMatches(shortcut, e) : false)

export function installKeys(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuKeys) return
  doc.__mateuKeys = true
  let holdTimer = null
  doc.addEventListener('keydown', (e) => {
    // mantener Alt (sola): aparecen las teclas
    if (e.key === 'Alt' && accessKeysOn && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (!holdTimer) holdTimer = setTimeout(() => showAccessKeys(doc), 250)
      return
    }
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (!e.ctrlKey && !e.altKey && !e.metaKey && !FUNCTION_KEY.test(String(e.key || ''))) return
    // 1. una acción de la pantalla
    const action = shortcutActions.find((a) => matches(a.shortcut, e))
    if (action && keysSink) {
      e.preventDefault(); e.stopPropagation()
      keysSink(action.id, {}, {})
      return
    }
    // 2. una pestaña
    for (const li of doc.querySelectorAll('oj-tab-bar li[data-shortcut]')) {
      const sc = li.getAttribute('data-shortcut')
      if (sc && keyTargetVisible(li) && matches(sc, e)) { e.preventDefault(); e.stopPropagation(); activate(li); return }
    }
    // 3. una tecla de acceso (Alt+letra, por el código físico: en Mac Alt cambia e.key)
    if (accessKeysOn && e.altKey && !e.ctrlKey && !e.metaKey) {
      const m = /^(Key([A-Z])|Digit([0-9]))$/.exec(e.code || '')
      const letter = m ? (m[2] || m[3]).toLowerCase() : ''
      if (!letter) return
      if (!doc.querySelector('.mateu-access-keys')) showAccessKeys(doc)
      const hit = (doc.__mateuAccessMap || []).find((x) => x.letter === letter)
      if (hit) { e.preventDefault(); e.stopPropagation(); hideAccessKeys(doc); activate(hit.el) }
    }
  }, true)
  doc.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
      hideAccessKeys(doc)
    }
  }, true)
  const view = doc.defaultView
  if (view) view.addEventListener('blur', () => hideAccessKeys(doc))
}
