// VENTANAS FLOTANTES al pasar el ratón (y al enfocar con el teclado): el resumen de una tarifa, el
// detalle de una celda. UNA oj-popup de JET compartida, creada fuera de Knockout, a la que se
// le cambia el contenido: cualquier elemento con data-mateu-hover (texto, líneas con \n) la abre
// al pasar o enfocar y la cierra al salir; uno con data-mateu-pop-click, al pulsar. Las celdas
// de un listado con @Tooltip(otro campo) y los Popover (trigger hover/click) pasan por aquí.

/** Las líneas del contenido (puro). */
export const hoverLinesOf = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)

export function installHover(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuHover) return
  doc.__mateuHover = true
  let popup = null
  let body = null
  let anchor = null
  let openTimer = null
  let closeTimer = null
  const ensure = () => {
    if (popup) return popup
    const wrap = doc.createElement('div')
    wrap.setAttribute('data-oj-binding-provider', 'none')
    popup = doc.createElement('oj-popup')
    popup.id = 'mateuHoverPopup'
    popup.className = 'mateu-hover-popup'
    popup.setAttribute('modality', 'modeless')
    popup.setAttribute('auto-dismiss', 'none')
    popup.setAttribute('tail', 'simple')
    popup.setAttribute('initial-focus', 'none')
    popup.setAttribute('position', '{"my":{"horizontal":"start","vertical":"top"},"at":{"horizontal":"start","vertical":"bottom"},"collision":"flipfit"}')
    body = doc.createElement('div')
    body.className = 'mateu-hover-content'
    body.setAttribute('role', 'tooltip')
    popup.appendChild(body)
    popup.addEventListener('mouseenter', () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null } })
    popup.addEventListener('mouseleave', () => scheduleClose())
    wrap.appendChild(popup)
    doc.body.appendChild(wrap)
    return popup
  }
  let hoverAnchorSeq = 0
  const open = (el, text) => {
    const p = ensure()
    body.textContent = ''
    for (const line of hoverLinesOf(text)) {
      const div = doc.createElement('div')
      div.textContent = line
      body.appendChild(div)
    }
    if (!el.id) el.id = 'mateuHover-' + (++hoverAnchorSeq)
    anchor = el
    el.setAttribute('aria-describedby', 'mateuHoverPopup')
    // un oj-popup recién creado tarda en «actualizarse» (JET lo hace de forma asíncrona): hasta
    // entonces sus métodos lanzan — se reintenta unos frames
    const tryOpen = (left) => {
      if (anchor !== el) return
      try {
        if (p.isOpen()) p.close()
        p.open('#' + el.id)
      } catch (err) {
        if (left > 0) requestAnimationFrame(() => tryOpen(left - 1))
      }
    }
    tryOpen(30)
  }
  const close = () => {
    if (openTimer) { clearTimeout(openTimer); openTimer = null }
    if (anchor) anchor.removeAttribute('aria-describedby')
    anchor = null
    try { if (popup && popup.isOpen()) popup.close() } catch (err) { /* aún sin actualizar */ }
  }
  const scheduleClose = () => {
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(() => { closeTimer = null; close() }, 200)
  }
  const hoverTarget = (node) => {
    const el = node && node.closest ? node.closest('[data-mateu-hover]') : null
    return el && el.getAttribute('data-mateu-hover') ? el : null
  }
  const show = (el) => {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
    if (anchor === el) return
    if (openTimer) clearTimeout(openTimer)
    openTimer = setTimeout(() => { openTimer = null; open(el, el.getAttribute('data-mateu-hover')) }, 300)
  }
  // se crea ya: cuando llegue el primer hover JET habrá tenido tiempo de actualizarlo
  if (doc.body) ensure()
  doc.addEventListener('mouseover', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
  doc.addEventListener('mouseout', (e) => {
    const el = hoverTarget(e.target)
    if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) {
      if (openTimer && anchor !== el) { clearTimeout(openTimer); openTimer = null }
      scheduleClose()
    }
  }, true)
  doc.addEventListener('focusin', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
  doc.addEventListener('focusout', (e) => { if (hoverTarget(e.target)) scheduleClose() }, true)
  doc.addEventListener('click', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-mateu-pop-click]') : null
    if (!el || !el.getAttribute('data-mateu-pop-click')) return
    if (anchor === el) close()
    else open(el, el.getAttribute('data-mateu-pop-click'))
  }, true)
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && anchor) { close(); return }
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('data-mateu-pop-click')) {
      e.preventDefault()
      e.target.click()
    }
  }, true)
}
