// Selección de RANGO en el tape chart (PlanningBoard → oj-gantt): arrastrar por celdas VACÍAS de
// una fila lanza rangeSelectActionId con { _resourceId, _start, _end } (el «clic en la celda de
// inicio y en la de fin» del Room Diary de OPERA → I Want To: reserva, walk-in, fuera de servicio).
// oj-gantt no lo trae: mueve y redimensiona tareas, pero no selecciona tiempo vacío. Así que una
// capa fina por encima, sin sustituir al componente:
//   - la fila, del propio gantt (getContextByNode → rowIndex);
//   - el día, de las posiciones REALES de las etiquetas del eje de días (respeta zoom y scroll);
//   - mientras se arrastra, una banda translúcida; al soltar, la acción por el canal de la página.
// Lo puro (x → día) está exportado y probado en Node.

/** Día (índice) bajo `x` a partir de los centros de las etiquetas del eje de días. */
export function dayIndexAtX(x, centers) {
  if (!centers || !centers.length) return null
  if (centers.length === 1) return centers[0].index
  const sorted = [...centers].sort((a, b) => a.x - b.x)
  const width = (sorted[sorted.length - 1].x - sorted[0].x) / (sorted[sorted.length - 1].index - sorted[0].index)
  if (!(width > 0)) return sorted[0].index
  // el día i ocupa [centro_i - w/2, centro_i + w/2)
  return Math.round((x - sorted[0].x) / width) + sorted[0].index
}

const DAY = 86400000
const isoUtc = (ms) => new Date(ms).toISOString().slice(0, 10)

let rangeSink = null
/** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
export function setPlanningRangeSink(fn) { rangeSink = typeof fn === "function" ? fn : null }

/** Los centros (x en pantalla) de las etiquetas de días del eje menor de un gantt. */
function dayCenters(gantt, startIso, days) {
  const labels = [...gantt.querySelectorAll('text')]
  const out = []
  // las etiquetas del eje menor tienen el formato del locale ("10/14", "14/10"…): se casan por
  // orden con los días de la ventana, quedándose con la fila de etiquetas más baja del eje
  const rows = {}
  for (const t of labels) {
    const r = t.getBoundingClientRect()
    if (!/\d/.test(t.textContent || '')) continue
    const key = Math.round(r.top)
    ;(rows[key] = rows[key] || []).push({ t, r })
  }
  const axisRows = Object.keys(rows).map(Number).sort((a, b) => a - b)
  // el eje menor: la fila con más etiquetas entre las primeras (la cabecera), no las barras
  const minor = axisRows.slice(0, 3).map((k) => rows[k]).sort((a, b) => b.length - a.length)[0] || []
  minor.sort((a, b) => a.r.left - b.r.left).forEach((e, i) => {
    if (i < days) out.push({ x: e.r.left + e.r.width / 2, index: i })
  })
  return out
}

/** Instala (una vez) el arrastre de rango sobre cualquier oj-gantt.mateu-planning del documento. */
export function installPlanningRange(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuPlanningRange) return
  doc.__mateuPlanningRange = true
  let drag = null
  const band = () => {
    let el = doc.getElementById('mateuPlanningRangeBand')
    if (!el) {
      el = doc.createElement('div')
      el.id = 'mateuPlanningRangeBand'
      el.className = 'mateu-planning-range'
      doc.body.appendChild(el)
    }
    return el
  }
  doc.addEventListener('pointerdown', (e) => {
    const gantt = e.target && e.target.closest && e.target.closest('oj-gantt.mateu-planning')
    if (!gantt || !gantt.dataset.rangeAction || e.button > 0) return
    // sólo tiempo VACÍO de una fila (el fondo de la fila, rect.oj-gantt-row): una tarea se mueve y
    // redimensiona como siempre. getContextByNode no da contexto para ese fondo, así que la fila
    // sale de la etiqueta del eje de filas más cercana en vertical (vale también con scroll)
    const cls = (e.target.getAttribute && e.target.getAttribute('class')) || ''
    if (!/(^|\s)oj-gantt-row(\s|$)/.test(cls)) return
    const labels = (gantt.dataset.rowLabels || '').split('\u001f')
    let best = null
    for (const t of gantt.querySelectorAll('text')) {
      const i = labels.indexOf(t.textContent)
      if (i < 0) continue
      const r = t.getBoundingClientRect()
      const dist = Math.abs(r.top + r.height / 2 - e.clientY)
      if (!best || dist < best.dist) best = { i, dist }
    }
    if (!best) return
    const ctx = { rowIndex: best.i }
    const start = gantt.dataset.start
    const days = Math.round((Date.parse(gantt.dataset.end + 'Z') - Date.parse(start + 'Z')) / DAY)
    const centers = dayCenters(gantt, start, days)
    const anchor = dayIndexAtX(e.clientX, centers)
    if (anchor == null) return
    const rowRect = e.target.getBoundingClientRect()
    drag = { gantt, ctx, centers, anchor, current: anchor, start, top: rowRect.top, height: rowRect.height }
  }, true)
  doc.addEventListener('pointermove', (e) => {
    if (!drag) return
    const i = dayIndexAtX(e.clientX, drag.centers)
    if (i == null) return
    drag.current = i
    const [a, b] = [Math.min(drag.anchor, i), Math.max(drag.anchor, i)]
    const w = drag.centers.length > 1 ? Math.abs(drag.centers[1].x - drag.centers[0].x) : 40
    const el = band()
    const left = drag.centers[0].x + (a - drag.centers[0].index) * w - w / 2
    Object.assign(el.style, { display: 'block', left: left + window.scrollX + 'px', width: (b - a + 1) * w + 'px',
      top: drag.top + window.scrollY + 'px', height: drag.height + 'px' })
  }, true)
  doc.addEventListener('pointerup', () => {
    const d = drag
    drag = null
    const el = doc.getElementById('mateuPlanningRangeBand')
    if (el) el.style.display = 'none'
    if (!d || !rangeSink) return
    const ids = (d.gantt.dataset.rowIds || '').split('\u001f')
    const rowId = ids[d.ctx.rowIndex]
    if (!rowId) return
    const [a, b] = [Math.min(d.anchor, d.current), Math.max(d.anchor, d.current)]
    const base = Date.parse(d.start + 'Z')
    rangeSink(d.gantt.dataset.rangeAction, { _resourceId: rowId, _start: isoUtc(base + a * DAY), _end: isoUtc(base + b * DAY) }, {})
  }, true)
}
