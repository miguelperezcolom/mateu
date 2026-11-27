import { surfaceAtomOf } from './surfaces.mjs'
import { chromeText } from './i18n.mjs'
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
    rangeSink(d.gantt.dataset.rangeAction, { _resourceId: rowId, _start: isoUtc(base + a * DAY), _end: isoUtc(base + b * DAY) }, surfaceAtomOf(d.gantt))
  }, true)
}

// ── WITHOUT DRAGGING (WCAG 2.1.1 Keyboard, 2.5.7 Dragging Movements) — the web's
// mateu-planning-board tool row. Under a movable/resizable tape chart, a toolbar: the block to
// change (a select — a click on a bar picks it too), one day earlier/later, previous/next row,
// one day shorter/longer, the pending change in words, Apply / Cancel. With focus in the toolbar the
// arrow keys nudge (Shift+Left/Right change the length), Enter applies, Escape cancels. Apply sends
// the SAME action (and parameters) a drag would (core/boards.mjs planningActionOf). The pure half is
// tested in Node (test-pms.mjs).

/** The pending change after one nudge (libs/mateu `nudged`, the same rule): a move keeps the length
 *  inside the window and walks the rows; a resize moves the END edge, never before the start. */
export function planningNudged(p, nudge, resourceIds, windowDays) {
  if (nudge.length) {
    const endIdx = Math.max(p.startIdx, Math.min(windowDays - 1, p.endIdx + nudge.length))
    return { ...p, mode: 'resize', resourceId: p.originResourceId, endIdx }
  }
  const length = p.endIdx - p.startIdx
  const startIdx = Math.max(0, Math.min(windowDays - 1 - length, p.startIdx + (nudge.days || 0)))
  const row = resourceIds.indexOf(p.resourceId)
  const nextRow = Math.max(0, Math.min(resourceIds.length - 1, row + (nudge.rows || 0)))
  return { ...p, mode: 'move', startIdx, endIdx: startIdx + length, resourceId: resourceIds[nextRow] != null ? resourceIds[nextRow] : p.resourceId }
}

/** Whether a pending change changes anything. */
export const planningPendingChanged = (p) => !!p
  && (p.resourceId !== p.originResourceId || p.startIdx !== p.originStartIdx || p.endIdx !== p.originEndIdx)

/** A block's pending change before any nudge. */
export function planningPendingOf(model, blockId) {
  const b = model && (model.blocks || []).find((x) => x.id === String(blockId))
  return b ? { blockId: b.id, mode: 'move', resourceId: b.resourceId, startIdx: b.startIdx, endIdx: b.endIdx,
    originResourceId: b.resourceId, originStartIdx: b.startIdx, originEndIdx: b.endIdx } : null
}

/** Nudges `p` (a move and a resize are separate changes: switching kind starts from the block). */
export function planningNudgeOf(model, p, nudge) {
  if (!model || !p) return p
  if (nudge.length ? !model.resize : !model.move) return p
  const base = p.mode === (nudge.length ? 'resize' : 'move') ? p : planningPendingOf(model, p.blockId)
  return planningNudged(base, nudge, model.rows.map((r) => r.id), model.days)
}

/** The action Apply sends: the drag's (moveActionId / resizeActionId) with the new row and days. */
export function planningApplyOf(model, p) {
  if (!model || !planningPendingChanged(p)) return null
  const actionId = p.mode === 'resize' ? model.resize : model.move
  if (!actionId) return null
  const day = (i) => new Date(Date.parse(model.from + 'T00:00:00Z') + i * DAY).toISOString().slice(0, 10)
  return { actionId, parameters: { _blockId: p.blockId, _resourceId: p.resourceId, _start: day(p.startIdx), _end: day(p.endIdx) } }
}

/** The pending change in words ("Smith: Room 102, 3/14/2027 to 3/16/2027"). */
export function planningPendingText(model, p, lang) {
  if (!model || !p) return ''
  const block = (model.blocks || []).find((b) => b.id === p.blockId)
  const row = (model.rows || []).find((r) => r.id === p.resourceId)
  const day = (i) => new Date(Date.parse(model.from + 'T00:00:00Z') + i * DAY).toLocaleDateString(lang || undefined, { timeZone: 'UTC' })
  return chromeText('planningPending', { block: block ? block.label : p.blockId, resource: row ? row.label : p.resourceId, start: day(p.startIdx), end: day(p.endIdx) })
}

/** The block a gantt click landed on (getContextByNode → row and task index), or null. */
export function planningBlockAtContext(model, ctx) {
  if (!model || !ctx || ctx.rowIndex == null || ctx.index == null) return null
  if (ctx.subId && !/^oj-gantt-task/.test(ctx.subId)) return null
  const tasks = (model.rowTasks || [])[ctx.rowIndex]
  return tasks && tasks[ctx.index] != null ? tasks[ctx.index] : null
}

const PLANNING_TOOL_KEYS = { ArrowLeft: { days: -1 }, ArrowRight: { days: 1 }, ArrowUp: { rows: -1 }, ArrowDown: { rows: 1 } }

/** The nudge a key asks for in the toolbar, or null (Shift+Left/Right = length). */
export function planningKeyNudge(e) {
  if (!(e.key in PLANNING_TOOL_KEYS) || e.ctrlKey || e.metaKey || e.altKey) return null
  if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return { length: e.key === 'ArrowLeft' ? -1 : 1 }
  return PLANNING_TOOL_KEYS[e.key]
}

function planningModelOfTools(tools) {
  try { return JSON.parse(tools.getAttribute('data-planning-tools') || 'null') } catch (e) { return null }
}

/** Paints a tool row from its model and its state (`tools.__mateuPending`, `tools.__mateuBlock`). */
export function paintPlanningTools(tools) {
  const doc = tools.ownerDocument
  const model = planningModelOfTools(tools)
  tools.textContent = ''
  tools.hidden = !model || !(model.blocks || []).length
  if (tools.hidden) return
  const lang = doc.documentElement && doc.documentElement.getAttribute('lang')
  if (!tools.__mateuBlock || !model.blocks.some((b) => b.id === tools.__mateuBlock)) { tools.__mateuBlock = model.blocks[0].id; tools.__mateuPending = null }
  const pending = tools.__mateuPending
  tools.setAttribute('role', 'toolbar')
  tools.setAttribute('aria-label', chromeText('planningPick'))
  tools.setAttribute('aria-description', chromeText('planningKeys'))
  const select = doc.createElement('select')
  select.className = 'mateu-planning-pick'
  select.setAttribute('aria-label', chromeText('planningPick'))
  for (const b of model.blocks) {
    const o = doc.createElement('option')
    const row = model.rows.find((r) => r.id === b.resourceId)
    o.value = b.id
    o.textContent = b.label + (row ? ' · ' + row.label : '')
    if (b.id === tools.__mateuBlock) o.selected = true
    select.appendChild(o)
  }
  tools.appendChild(select)
  const button = (label, glyph, act, extra) => {
    const el = doc.createElement('button')
    el.type = 'button'
    el.className = 'mateu-planning-tool' + (extra ? ' ' + extra : '')
    el.setAttribute('data-planning-act', act)
    if (glyph) { el.setAttribute('aria-label', label); el.title = label; el.textContent = glyph } else el.textContent = label
    tools.appendChild(el)
  }
  if (model.move) {
    button(chromeText('planningEarlier'), '◀', 'earlier')
    button(chromeText('planningLater'), '▶', 'later')
    button(chromeText('planningRowUp'), '▲', 'up')
    button(chromeText('planningRowDown'), '▼', 'down')
  }
  if (model.resize) {
    button(chromeText('planningShorter'), '−', 'shorter')
    button(chromeText('planningLonger'), '+', 'longer')
  }
  const text = doc.createElement('span')
  text.className = 'mateu-planning-pending'
  text.setAttribute('aria-live', 'polite')
  text.textContent = planningPendingChanged(pending) ? planningPendingText(model, pending, lang) : ''
  tools.appendChild(text)
  if (planningPendingChanged(pending)) {
    button(chromeText('apply'), '', 'apply', 'mateu-planning-apply')
    button(chromeText('cancel'), '', 'cancel')
  }
}

const PLANNING_ACTS = { earlier: { days: -1 }, later: { days: 1 }, up: { rows: -1 }, down: { rows: 1 }, shorter: { length: -1 }, longer: { length: 1 } }

/** Runs one act of a tool row (a nudge, apply, cancel); repaints it, keeping focus on the same control. */
export function runPlanningTool(tools, act) {
  const model = planningModelOfTools(tools)
  if (!model) return
  const doc = tools.ownerDocument
  const focusedAct = doc.activeElement && tools.contains(doc.activeElement) ? doc.activeElement.getAttribute('data-planning-act') : null
  if (act === 'cancel') tools.__mateuPending = null
  else if (act === 'apply') {
    const call = planningApplyOf(model, tools.__mateuPending)
    tools.__mateuPending = null
    if (call && rangeSink) {
      const gantt = tools.previousElementSibling
      rangeSink(call.actionId, call.parameters, surfaceAtomOf(gantt && gantt.matches && gantt.matches('oj-gantt') ? gantt : tools))
    }
  } else if (PLANNING_ACTS[act]) {
    const p = tools.__mateuPending || planningPendingOf(model, tools.__mateuBlock)
    tools.__mateuPending = planningNudgeOf(model, p, PLANNING_ACTS[act])
  }
  paintPlanningTools(tools)
  const again = focusedAct && tools.querySelector('[data-planning-act="' + focusedAct + '"]')
  if (again && again.focus) again.focus()
}

/** Installs (once) the tool rows: clicks and keys on them, a bar click picking the block. */
export function installPlanningTools(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuPlanningTools) return
  doc.__mateuPlanningTools = true
  const toolsOf = (t) => (t && t.closest ? t.closest('.mateu-planning-tools') : null)
  doc.addEventListener('click', (e) => {
    const tools = toolsOf(e.target)
    if (tools) {
      const act = e.target.closest('[data-planning-act]')
      if (act) { e.preventDefault(); runPlanningTool(tools, act.getAttribute('data-planning-act')) }
      return
    }
    // a click on a bar of the tape chart picks that block in its tool row
    const gantt = e.target && e.target.closest ? e.target.closest('oj-gantt.mateu-planning') : null
    const next = gantt && gantt.nextElementSibling
    if (!next || !next.classList || !next.classList.contains('mateu-planning-tools') || typeof gantt.getContextByNode !== 'function') return
    const id = planningBlockAtContext(planningModelOfTools(next), gantt.getContextByNode(e.target))
    if (id && id !== next.__mateuBlock) { next.__mateuBlock = id; next.__mateuPending = null; paintPlanningTools(next) }
  }, true)
  doc.addEventListener('change', (e) => {
    const tools = toolsOf(e.target)
    if (!tools || !e.target.classList.contains('mateu-planning-pick')) return
    tools.__mateuBlock = e.target.value
    tools.__mateuPending = null
    paintPlanningTools(tools)
    const pick = tools.querySelector('.mateu-planning-pick')
    if (pick) pick.focus()
  }, true)
  // VB paints (and repaints) the tool rows asynchronously: follow them
  const Observer = doc.defaultView && doc.defaultView.MutationObserver
  if (Observer && doc.body) {
    let queued = false
    new Observer(() => {
      if (queued) return
      queued = true
      queueMicrotask(() => { queued = false; refreshPlanningTools(doc) })
    }).observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-planning-tools'] })
  }
  refreshPlanningTools(doc)
  doc.addEventListener('keydown', (e) => {
    const tools = toolsOf(e.target)
    if (!tools) return
    // the select keeps its own arrows (choosing the block)
    if (e.target.classList && e.target.classList.contains('mateu-planning-pick') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return
    const nudge = planningKeyNudge(e)
    if (nudge) {
      e.preventDefault()
      const act = Object.keys(PLANNING_ACTS).find((k) => JSON.stringify(PLANNING_ACTS[k]) === JSON.stringify(nudge))
      runPlanningTool(tools, act)
    } else if (e.key === 'Escape' && planningPendingChanged(tools.__mateuPending)) {
      e.preventDefault(); e.stopPropagation(); runPlanningTool(tools, 'cancel')
    } else if (e.key === 'Enter' && planningPendingChanged(tools.__mateuPending) && !(e.target.closest && e.target.closest('button'))) {
      e.preventDefault(); runPlanningTool(tools, 'apply')
    }
  }, true)
}

/** Paints every tool row whose model changed (a repaint brings a new data-planning-tools). */
export function refreshPlanningTools(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  for (const tools of doc.querySelectorAll('.mateu-planning-tools')) {
    const model = tools.getAttribute('data-planning-tools') || ''
    if (tools.__mateuModel === model) continue
    tools.__mateuModel = model
    tools.__mateuPending = null
    paintPlanningTools(tools)
  }
}
