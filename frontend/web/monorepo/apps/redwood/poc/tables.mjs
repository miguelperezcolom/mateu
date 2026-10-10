// TONOS DE FILA del listado (@RowStatus) y filas de GRUPO (@GroupBy) sobre el oj-table de JET.
// oj-table no tiene clase por fila (sólo plantillas de celda o una plantilla de fila entera que
// obligaría a repintar todas las columnas a mano), así que una pasada mínima por el DOM: cada `tr`
// del cuerpo de #mateuTable recibe la clase de su fila (misma posición: la página se pinta entera,
// sin virtualizar). Un MutationObserver la repite cuando JET repinta (orden, página, refresco).

let tones = []

/** Los tonos de las filas en pantalla, en orden (de listingOf(...).rows: _tone de cada una). */
export function setListingTones(rows) {
  tones = (rows || []).map((r) => (r && r._tone) || '')
  applyRowTonesSoon()
}

export const toneClassOf = (tone) => (tone ? 'mateu-row-tone-' + tone : '')

function applyRowTones(doc) {
  const table = doc.getElementById('mateuTable')
  if (!table) return 0
  const trs = table.querySelectorAll('tbody tr')
  let n = 0
  trs.forEach((tr, i) => {
    const want = toneClassOf(tones[i])
    for (const c of [...tr.classList]) if (c.startsWith('mateu-row-tone-') && c !== want) tr.classList.remove(c)
    if (want && !tr.classList.contains(want)) { tr.classList.add(want); n++ }
  })
  return n
}

function applyRowTonesSoon(frames = 10) {
  if (typeof requestAnimationFrame === 'undefined' || typeof document === 'undefined') return
  let left = frames
  const tick = () => { applyRowTones(document); if (--left > 0) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}

/** Vigila (una vez) los repintados del oj-table para volver a poner los tonos. */
export function installRowTones(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRowTones || typeof MutationObserver === 'undefined') return
  doc.__mateuRowTones = true
  let pending = false
  new MutationObserver(() => {
    if (pending || !tones.some(Boolean)) return
    pending = true
    requestAnimationFrame(() => { pending = false; applyRowTones(doc) })
  }).observe(doc.body, { childList: true, subtree: true })
}

// ── cabecera de ficha FIJA y compacta al hacer scroll (la «business card» de OPERA) ─────────────
/** Marca el body con mateu-scrolled en cuanto la página deja la cabecera atrás: app.css pinta la
 *  banda .mateu-sticky-header compacta (menos aire, sin tira, con sombra). */
export function installStickyHeader(win = typeof window !== 'undefined' ? window : null) {
  if (!win || win.__mateuStickyHeader) return
  win.__mateuStickyHeader = true
  let on = false
  win.addEventListener('scroll', () => {
    const now = win.scrollY > 48
    if (now !== on) { on = now; win.document.body.classList.toggle('mateu-scrolled', now) }
  }, { passive: true })
}
