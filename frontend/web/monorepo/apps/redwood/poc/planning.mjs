// RANGE selection on the tape chart (PlanningBoard → oj-gantt): dragging over EMPTY cells of
// a row launches rangeSelectActionId with { _resourceId, _start, _end } (the «click on the start
// cell and on the end cell» of OPERA's Room Diary → I Want To: booking, walk-in, out of service).
// oj-gantt does not have it: it moves and resizes tasks, but does not select empty time. So a
// thin layer on top, without replacing the component:
//   - the row, from the gantt itself (getContextByNode → rowIndex);
//   - the day, from the REAL positions of the day axis labels (respects zoom and scroll);
//   - while dragging, a translucent band; on release, the action through the page's channel.
// The pure part (x → day) is exported and tested in Node.

/** Day (index) under `x` from the centres of the day axis labels. */
export function dayIndexAtX(x, centers) {
  if (!centers || !centers.length) return null
  if (centers.length === 1) return centers[0].index
  const sorted = [...centers].sort((a, b) => a.x - b.x)
  const width = (sorted[sorted.length - 1].x - sorted[0].x) / (sorted[sorted.length - 1].index - sorted[0].index)
  if (!(width > 0)) return sorted[0].index
  // day i occupies [centre_i - w/2, centre_i + w/2)
  return Math.round((x - sorted[0].x) / width) + sorted[0].index
}

const DAY = 86400000
const isoUtc = (ms) => new Date(ms).toISOString().slice(0, 10)

let rangeSink = null
/** Who runs the action (the shell reuses the Elements' sink). */
export function setPlanningRangeSink(fn) { rangeSink = typeof fn === "function" ? fn : null }

/** The centres (on-screen x) of the day labels of a gantt's minor axis. */
function dayCenters(gantt, startIso, days) {
  const labels = [...gantt.querySelectorAll('text')]
  const out = []
  // the minor axis labels have the locale's format ("10/14", "14/10"…): they are matched in
  // order with the window's days, keeping the lowest row of labels of the axis
  const rows = {}
  for (const t of labels) {
    const r = t.getBoundingClientRect()
    if (!/\d/.test(t.textContent || '')) continue
    const key = Math.round(r.top)
    ;(rows[key] = rows[key] || []).push({ t, r })
  }
  const axisRows = Object.keys(rows).map(Number).sort((a, b) => a - b)
  // the minor axis: the row with the most labels among the first ones (the header), not the bars
  const minor = axisRows.slice(0, 3).map((k) => rows[k]).sort((a, b) => b.length - a.length)[0] || []
  minor.sort((a, b) => a.r.left - b.r.left).forEach((e, i) => {
    if (i < days) out.push({ x: e.r.left + e.r.width / 2, index: i })
  })
  return out
}

/** Installs (once) the range drag on any oj-gantt.mateu-planning in the document. */
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
    // only EMPTY time of a row (the row's background, rect.oj-gantt-row): a task moves and
    // resizes as always. getContextByNode gives no context for that background, so the row
    // comes from the vertically closest row-axis label (also works with scroll)
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
