// PANEL DE ACCIONES por categorías («I want to…», ActionPanel): el disparador es un oj-button y la
// capa un oj-dialog de JET; el estado de la capa (abierta, «mostrar más» de una columna, ocultar
// las acciones sin datos) vive en el DOM — clases sobre el diálogo y sus columnas —, así que nada
// pregunta al servidor ni re-proyecta. Elegir una acción cierra el diálogo y la acción sale por el
// canal normal de los botones (blockAction). Un listener por documento, instalado una vez.

/** «ctrl+shift+i» → { ctrl, alt, shift, meta, key } */
export function parseShortcut(shortcut) {
  const parts = String(shortcut || '').toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)
  if (!parts.length) return null
  const mods = { ctrl: false, alt: false, shift: false, meta: false }
  let key = ''
  for (const p of parts) {
    if (p === 'ctrl' || p === 'control') mods.ctrl = true
    else if (p === 'alt' || p === 'option') mods.alt = true
    else if (p === 'shift') mods.shift = true
    else if (p === 'meta' || p === 'cmd') mods.meta = true
    else key = p
  }
  return key ? { ...mods, key } : null
}

/** ¿La tecla pulsada es el atajo? Por e.key o por e.code (KeyI / Digit1 / Numpad1), como los
 *  atajos del renderer web: independiente de la distribución del teclado. */
export function shortcutMatches(shortcut, e) {
  const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut
  if (!s || !e) return false
  if (!!e.ctrlKey !== s.ctrl || !!e.altKey !== s.alt || !!e.shiftKey !== s.shift || !!e.metaKey !== s.meta) return false
  const k = s.key
  const key = String(e.key || '').toLowerCase()
  const code = String(e.code || '')
  return key === k || code === 'Key' + k.toUpperCase() || code === 'Digit' + k || code === 'Numpad' + k
}

const visible = (el) => !!(el && (el.offsetParent || (el.getClientRects && el.getClientRects().length)))

/** Instala (una vez) el comportamiento de los paneles de acciones del documento. */
export function installActionPanels(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuActionPanels) return
  doc.__mateuActionPanels = true
  const dialogOf = (id) => (id ? doc.getElementById(id) : null)
  const open = (id) => {
    const d = dialogOf(id)
    if (d && typeof d.open === 'function' && !(d.isOpen && d.isOpen())) d.open()
  }
  doc.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target : null
    if (!t) return
    const trigger = t.closest('[data-ap-open]')
    if (trigger) { open(trigger.getAttribute('data-ap-open')); return }
    const more = t.closest('[data-ap-more]')
    if (more) {
      const col = more.closest('.mateu-ap-column')
      if (col) col.classList.add('mateu-ap-showall')
      return
    }
  }, true)
  // elegir una acción cierra la capa; el oj-button sigue y su blockAction lanza la acción
  doc.addEventListener('ojAction', (e) => {
    const item = e.target && e.target.closest && e.target.closest('.mateu-ap-item')
    const dialog = item && item.closest('oj-dialog')
    if (dialog && typeof dialog.close === 'function') dialog.close()
  }, true)
  // ocultar las vacías: el oj-switch NO burbujea valueChanged, pero la fase de captura sí lo ve
  doc.addEventListener('valueChanged', (e) => {
    const sw = e.target
    if (!sw || !sw.hasAttribute || !sw.hasAttribute('data-ap-hide')) return
    const dialog = sw.closest('oj-dialog')
    if (dialog) dialog.classList.toggle('mateu-ap-hide-unpopulated', !!(e.detail && e.detail.value))
  }, true)
  doc.addEventListener('keydown', (e) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) return
    for (const trigger of doc.querySelectorAll('[data-ap-shortcut]')) {
      const sc = trigger.getAttribute('data-ap-shortcut')
      if (sc && visible(trigger) && shortcutMatches(sc, e)) {
        e.preventDefault()
        e.stopPropagation()
        open(trigger.getAttribute('data-ap-open'))
        return
      }
    }
  }, true)
}
