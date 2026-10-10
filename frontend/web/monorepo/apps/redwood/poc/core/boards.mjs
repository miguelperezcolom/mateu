import { ojIconOrGenericOf } from './shellNav.mjs'
import { dataProviderFactory } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): planning board, gantt, row tones and listing aggregates/groups.

// ── PlanningBoard (Room Diary) sobre oj-gantt ─────────────────────────────────────────────────
//
// oj-gantt es el tape chart de JET: filas con tareas, arrastrar para mover (dnd.move) y bordes para
// redimensionar (task-defaults.resizable), tooltip propio (shortDesc). Mateu manda los bloques con
// el fin INCLUSIVO (la última noche); el gantt pinta [start, end) en tiempo, así que el fin se
// pinta como el día siguiente y se devuelve restando uno.

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
      // la etiqueta de la fila lleva los atributos: el eje de filas de oj-gantt sólo pinta texto
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
        // dentro de la barra o nada: fuera, el texto blanco sobre el fondo no se lee (y el resumen
        // completo sigue en el tooltip)
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
    // para la selección de rango (poc/planning.mjs lee estos data-* del oj-gantt)
    rangeAction: m.rangeSelectActionId || '',
    startDay: from,
    endDay: plusDays(to, 1),
    rowIds: rows.map((r) => r.id).join('\u001f'),
    rowLabels: rows.map((r) => r.label).join('\u001f'),
    dndMove: m.moveActionId ? 'enabled' : 'disabled',
    taskResizable: m.resizeActionId ? 'enabled' : 'disabled',
  }
}

/** Un GANTT de tareas (Gantt: título, inicio, fin, avance, color) sobre el mismo oj-gantt que el
 *  tape chart: una fila por tarea con su barra, el avance como el relleno de progreso de JET, y la
 *  tarea pulsada → onTaskSelectionActionId con _clickedTaskId (el contrato del renderer web). */
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
    // escala a la medida del plan: un proyecto de meses se lee por meses/semanas
    majorScale: days > 60 ? 'months' : 'weeks',
    minorScale: days > 60 ? 'weeks' : 'days',
  }
}

/**
 * Un evento del oj-gantt → { actionId, parameters } de Mateu, o null si no hay acción. Fechas a
 * días (fin inclusivo). `kind`: 'move' | 'resize' | 'open' | 'select' | 'range'.
 */
export function planningActionOf(atom, kind, detail) {
  if (!atom) return null
  // el gantt devuelve instantes (el punto exacto donde se soltó, en UTC): se redondean al día
  // LOCAL más cercano — una estancia empieza y acaba en días, no a las 09:38
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
      // start/end: los nuevos límites de la barra (value es el instante bajo el puntero)
      _blockId: taskId, _resourceId: rowId, _start: day(detail.start || detail.value), _end: lastNight(detail.end) } }
  }
  if (kind === 'resize' && atom.resizeActionId && taskId) {
    const rowId = detail.rowId || (task && task.rowData && task.rowData.id)
      || (task && task.rowContext && task.rowContext.rowData && task.rowContext.rowData.id)
    return { actionId: atom.resizeActionId, parameters: {
      _blockId: taskId, _resourceId: rowId, _start: day(detail.start), _end: lastNight(detail.end) } }
  }
  if (kind === 'open' && atom.openActionId && taskId) return { actionId: atom.openActionId, parameters: { _blockId: taskId } }
  // el Gantt (Gantt.onTaskSelectionActionId) recibe la tarea como _clickedTaskId; el tape chart, _blockId
  if (kind === 'select' && atom.selectActionId && taskId) return { actionId: atom.selectActionId, parameters: { [atom.selectParam || '_blockId']: taskId } }
  if (kind === 'range' && atom.rangeSelectActionId && detail && detail.rowId && detail.start && detail.end) {
    const [a, b] = [day(detail.start), day(detail.end)].sort((x, y) => x.localeCompare(y))
    return { actionId: atom.rangeSelectActionId, parameters: { _resourceId: detail.rowId, _start: a, _end: b } }
  }
  return null
}


// ── listados: tonos de fila (@RowStatus) y grupos/totales (@GroupBy/@Aggregate) ───────────────
// Mismo contrato que libs/mateu listingGroups.ts / rowTone.ts (el renderer web): el crud trae
// groupBy y rowStatusField; las columnas, `aggregate`; la búsqueda (data.crud), `aggregates` (del
// conjunto filtrado) y `groups` (por grupo, en orden).

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

/** Los totales por columna (texto) o null si no hay nada que totalizar. */
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

/** Filas de GRUPO intercaladas donde cambia el valor de groupBy (las filas llegan ordenadas). */
export function groupedRows(rows, md, listing) {
  const groupBy = md.groupBy
  const groups = (listing && listing.groups) || []
  if (!groupBy || !groups.length) return rows
  const cols = aggregatableColumns(md)
  const labelCol = cols.some((c) => c.id === groupBy) ? groupBy : (cols[0] && cols[0].id)
  const out = []
  let last
  rows.forEach((row, i) => {
    const key = String(row[groupBy] == null ? '' : row[groupBy])
    if (i === 0 || key !== last) {
      const g = groups.find((x) => String(x.value) === key)
        || { value: key, count: rows.filter((r) => String(r[groupBy]) === key).length, aggregates: {} }
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
