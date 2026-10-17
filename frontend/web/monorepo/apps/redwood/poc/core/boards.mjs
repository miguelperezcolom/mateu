import { ojIconOrGenericOf } from './shellNav.mjs'
import { dataProviderFactory } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): planning board, gantt, row tones and listing aggregates/groups.

// ── PlanningBoard (Room Diary) on oj-gantt ────────────────────────────────────────────────────
//
// oj-gantt is JET's tape chart: rows with tasks, drag to move (dnd.move) and edges to resize
// (task-defaults.resizable), its own tooltip (shortDesc). Mateu sends the blocks with an
// INCLUSIVE end (the last night); the gantt paints [start, end) in time, so the end is painted
// as the following day and returned by subtracting one.

export const DAY_MS = 86400000
export const isoDay = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
}
export const plusDays = (iso, n) => isoDay(new Date(Date.parse(iso + 'T00:00:00Z') + n * DAY_MS))

export function planningAtomOf(m, id) {
  const columns = m.attributeColumns || []
  const blocks = m.blocks || []
  const from = m.from || (blocks.length ? blocks.map((b) => b.start).sort()[0] : isoDay(new Date()))
  const to = m.to || (blocks.length ? blocks.map((b) => b.end).sort().slice(-1)[0] : from)
  const rows = (m.resources || []).map((r, i) => {
    const attrs = columns.map((c, k) => ({ label: c, value: (r.attributes || [])[k] || '' }))
    return {
      _rowNumber: i,
      id: r.id,
      // the row label carries the attributes: oj-gantt's row axis only paints text
      label: [r.label].concat(attrs.map((a) => a.value).filter(Boolean)).join(' · '),
      group: r.group || '',
      iconClass: r.icon ? ojIconOrGenericOf(r.icon) : '',
      tasks: blocks.filter((b) => b.resourceId === r.id && b.start && b.end).map((b) => ({
        id: b.id,
        start: b.start + 'T00:00:00',
        end: plusDays(b.end, 1) + 'T00:00:00',
        label: (b.icon ? '★ ' : '') + (b.label || ''),
        shortDesc: b.summary || ((b.label || '') + ' · ' + b.start + ' → ' + b.end + (b.status ? ' · ' + b.status : '')),
        svgStyle: b.color ? { fill: b.color, stroke: b.color } : undefined,
        // inside the bar or nothing: outside, white text on the background is unreadable (and the full
        // summary is still in the tooltip)
        labelPosition: ['innerCenter', 'innerStart', 'none'],
        labelStyle: { fill: '#ffffff' },
      })),
    }
  })
  return {
    isPlanning: true,
    planningId: id || 'planning',
    attributeColumns: columns,
    start: from + 'T00:00:00',
    end: plusDays(to, 1) + 'T00:00:00',
    rows,
    rowsProvider: dataProviderFactory ? dataProviderFactory(rows) : null,
    movable: !!m.moveActionId,
    resizable: !!m.resizeActionId,
    moveActionId: m.moveActionId || '',
    resizeActionId: m.resizeActionId || '',
    openActionId: m.openActionId || '',
    selectActionId: m.selectActionId || '',
    rangeSelectActionId: m.rangeSelectActionId || '',
    // for range selection (poc/planning.mjs reads these data-* off the oj-gantt)
    rangeAction: m.rangeSelectActionId || '',
    startDay: from,
    endDay: plusDays(to, 1),
    rowIds: rows.map((r) => r.id).join('\u001f'),
    rowLabels: rows.map((r) => r.label).join('\u001f'),
    dndMove: m.moveActionId ? 'enabled' : 'disabled',
    taskResizable: m.resizeActionId ? 'enabled' : 'disabled',
  }
}

/** A task GANTT (Gantt: title, start, end, progress, color) on the same oj-gantt as the tape
 *  chart: one row per task with its bar, progress as JET's progress fill, and the clicked task
 *  → onTaskSelectionActionId with _clickedTaskId (the web renderer's contract). */
export function ganttAtomOf(m, id) {
  const tasks = (m.tasks || []).filter((t) => t && t.start && t.end)
  const atom = planningAtomOf({
    resources: tasks.map((t) => ({ id: t.id, label: t.title || t.id })),
    blocks: tasks.map((t) => ({
      id: t.id, resourceId: t.id, start: t.start, end: t.end, label: t.title || '', color: t.color,
      summary: (t.title || '') + ' · ' + t.start + ' → ' + t.end + ' · ' + Math.round(t.progress || 0) + '%',
    })),
    selectActionId: m.onTaskSelectionActionId || '',
  }, id || 'gantt')
  const progress = {}
  for (const t of tasks) progress[t.id] = Math.max(0, Math.min(100, Number(t.progress) || 0)) / 100
  for (const row of atom.rows) for (const task of row.tasks) task.progress = { value: progress[task.id] || 0 }
  const days = Math.round((Date.parse(atom.endDay) - Date.parse(atom.startDay)) / DAY_MS)
  return {
    ...atom,
    isGantt: true,
    selectParam: '_clickedTaskId',
    // scale to fit the plan: a months-long project reads by months/weeks
    majorScale: days > 60 ? 'months' : 'weeks',
    minorScale: days > 60 ? 'weeks' : 'days',
  }
}

/**
 * An oj-gantt event → Mateu { actionId, parameters }, or null if there is no action. Dates to
 * days (inclusive end). `kind`: 'move' | 'resize' | 'open' | 'select' | 'range'.
 */
export function planningActionOf(atom, kind, detail) {
  if (!atom) return null
  // the gantt returns instants (the exact point where it was dropped, in UTC): they are rounded to
  // the nearest LOCAL day — a stay starts and ends on days, not at 09:38
  const day = (v) => {
    if (!v) return null
    const text = String(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
    const d = new Date(text)
    return isoDay(new Date(Math.round((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS) * DAY_MS))
  }
  const lastNight = (v) => (v ? plusDays(day(v), -1) : null)
  const task = detail && detail.taskContexts && detail.taskContexts[0]
  const taskId = (task && (task.data ? task.data.id : task.id)) || (detail && detail.taskId)
  if (kind === 'move' && atom.moveActionId && taskId) {
    const rowId = detail.rowContext && detail.rowContext.rowData ? detail.rowContext.rowData.id
      : (detail.rowContext && detail.rowContext.data && detail.rowContext.data.id) || detail.rowId
    return { actionId: atom.moveActionId, parameters: {
      // start/end: the bar's new bounds (value is the instant under the pointer)
      _blockId: taskId, _resourceId: rowId, _start: day(detail.start || detail.value), _end: lastNight(detail.end) } }
  }
  if (kind === 'resize' && atom.resizeActionId && taskId) {
    const rowId = detail.rowId || (task && task.rowData && task.rowData.id)
      || (task && task.rowContext && task.rowContext.rowData && task.rowContext.rowData.id)
    return { actionId: atom.resizeActionId, parameters: {
      _blockId: taskId, _resourceId: rowId, _start: day(detail.start), _end: lastNight(detail.end) } }
  }
  if (kind === 'open' && atom.openActionId && taskId) return { actionId: atom.openActionId, parameters: { _blockId: taskId } }
  // the Gantt (Gantt.onTaskSelectionActionId) receives the task as _clickedTaskId; the tape chart, _blockId
  if (kind === 'select' && atom.selectActionId && taskId) return { actionId: atom.selectActionId, parameters: { [atom.selectParam || '_blockId']: taskId } }
  if (kind === 'range' && atom.rangeSelectActionId && detail && detail.rowId && detail.start && detail.end) {
    const [a, b] = [day(detail.start), day(detail.end)].sort((x, y) => x.localeCompare(y))
    return { actionId: atom.rangeSelectActionId, parameters: { _resourceId: detail.rowId, _start: a, _end: b } }
  }
  return null
}


// ── listings: row tones (@RowStatus) and groups/totals (@GroupBy/@Aggregate) ──────────────────
// Same contract as libs/mateu listingGroups.ts / rowTone.ts (the web renderer): the crud brings
// groupBy and rowStatusField; the columns, `aggregate`; the search (data.crud), `aggregates` (of
// the filtered set) and `groups` (per group, in order).

export const ROW_TONES = { success: 'success', warning: 'warning', danger: 'danger', error: 'danger', info: 'info', neutral: 'neutral', none: 'neutral' }

export function rowToneOf(row, field) {
  if (!row || !field) return null
  let v = row[field]
  if (v && typeof v === 'object') v = v.type != null ? v.type : v.value
  return v == null ? null : (ROW_TONES[String(v).toLowerCase()] || null)
}

export function toneRows(rows, field) {
  if (!field) return rows
  return rows.map((r) => {
    const tone = rowToneOf(r, field)
    return tone ? { ...r, _tone: tone } : r
  })
}

export function formatAggregate(value, col) {
  if (value == null) return ''
  if (col.dataType === 'money' || col.stereotype === 'money')
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  if (col.aggregate === 'count') return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value))
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
}

export function aggregatableColumns(md) {
  return (md.columns || []).map((c) => c.metadata || c).filter((c) => c && c.id)
}

/** The per-column totals (text) or null if there is nothing to total. */
export function aggregateFootersOf(md, listing) {
  const aggregates = listing && listing.aggregates
  const cols = aggregatableColumns(md)
  if (!aggregates || !cols.some((c) => c.aggregate)) return null
  const out = {}
  for (const c of cols) if (c.aggregate && aggregates[c.id] != null) out[c.id] = formatAggregate(aggregates[c.id], c)
  const first = cols[0]
  if (first && out[first.id] == null) {
    const total = listing.page && listing.page.totalElements
    out[first.id] = md.groupBy && first.id === md.groupBy && total != null ? 'Total (' + total + ')' : 'Total'
  }
  return out
}

/** GROUP rows interleaved where the groupBy value changes (rows arrive sorted). */
export function groupedRows(rows, md, listing) {
  const groupBy = md.groupBy
  const groups = (listing && listing.groups) || []
  if (!groupBy || !groups.length) return rows
  const cols = aggregatableColumns(md)
  const labelCol = cols.some((c) => c.id === groupBy) ? groupBy : (cols[0] && cols[0].id)
  const out = []
  let last
  // one key function for the group a row is in AND the rows a group counts: a row with no value is
  // in the '' group, and String(null) is 'null' — counting with it gave that group « (0)»
  const keyOf = (row) => String(row[groupBy] == null ? '' : row[groupBy])
  rows.forEach((row, i) => {
    const key = keyOf(row)
    if (i === 0 || key !== last) {
      const g = groups.find((x) => String(x.value) === key)
        || { value: key, count: rows.filter((r) => keyOf(r) === key).length, aggregates: {} }
      const groupRow = { _rowNumber: '__mateuGroup:' + i + ':' + key, _group: true, _tone: 'group' }
      for (const c of cols) {
        groupRow[c.id] = c.id === labelCol ? g.value + ' (' + g.count + ')'
          : c.aggregate ? formatAggregate((g.aggregates || {})[c.id], c) : ''
      }
      out.push(groupRow)
      last = key
    }
    out.push(row)
  })
  return out
}
