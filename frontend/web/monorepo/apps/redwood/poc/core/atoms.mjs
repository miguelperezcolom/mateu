import { elementModuleUrl } from '../elements.mjs'
import { sanitizeHtml, markdownToHtml } from '../richtext.mjs'
import { formSectionsOf } from './tree.mjs'
import { wizardOf } from './archetypes.mjs'
import { dataProviderFactory, hostContentOf, panelExpanded } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): single-component atom projections: matrix, map, action panel, grid tracks, avatar, metric, chart; the wizard step view.

// ── MatrixGrid → oj-data-grid ────────────────────────────────────────────────────────────────
// The matrix (rows × dates, collapsible sections, linking cells and editable rows) is painted by
// JET's oj-data-grid over a RowDataGridProvider of a FlattenedTreeDataProviderView: the
// sections are tree nodes (JET paints the disclosure), the columns c0..cN. Here the PURE
// specification is built (tested in Node); the provider is created by the bridge's factory.
export let matrixProviderFactory = null
export function setMatrixProviderFactory(factory) { matrixProviderFactory = factory }

export const MATRIX_TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
export const toneClass = (tone) => (tone && MATRIX_TONES[tone] ? 'mateu-matrix-' + tone : '')

/** Key of a section's collapsed state (the same store as the collapsible panels). */
export const matrixSectionKey = (gridId, sectionId) => 'matrix:' + gridId + ':' + sectionId

export function matrixSpecOf(m, id) {
  const gridId = String(id || 'matrix').replace(/[^A-Za-z0-9_-]/g, '_')
  const columns = m.columns || []
  const columnKeys = columns.map((c, i) => 'c' + i)
  const cellsOf = (row, sectionId) => {
    const out = { id: sectionId + '/' + row.id, label: row.label || '', _rowId: row.id, _editable: !!row.editable,
      _emphasis: !!row.emphasis }
    columns.forEach((col, i) => {
      const cell = (row.cells || [])[i] || { value: '' }
      const cls = ['mateu-matrix-cell', toneClass(cell.tone) || toneClass(col.tone),
        row.emphasis ? 'mateu-matrix-emphasis' : '', cell.link && m.cellActionId ? 'mateu-matrix-link' : '',
        row.editable && m.editActionId ? 'mateu-matrix-editable' : ''].filter(Boolean).join(' ')
      out['c' + i] = { v: cell.value == null ? '' : String(cell.value), cls, link: !!(cell.link && m.cellActionId),
        editable: !!(row.editable && m.editActionId), rowId: row.id, columnId: col.id }
    })
    return out
  }
  const data = []
  const expanded = []
  for (const section of m.sections || []) {
    const rows = (section.rows || []).map((r) => cellsOf(r, section.id))
    if (section.title) {
      const key = '§' + section.id
      const blank = {}
      columnKeys.forEach((k) => { blank[k] = { v: '', cls: 'mateu-matrix-cell mateu-matrix-section-cell', link: false } })
      data.push({ id: key, label: section.title, _section: section.id, ...blank, children: rows })
      if (panelExpanded(matrixSectionKey(gridId, section.id), !section.collapsed)) expanded.push(key)
    } else {
      data.push(...rows)
    }
  }
  // headers: if there are groups (the month), two levels — the group spans its consecutive columns
  const hasGroups = columns.some((c) => c.group)
  const columnHeaders = []
  if (!hasGroups) columns.forEach((c) => columnHeaders.push(c.label || c.id))
  else {
    for (const c of columns) {
      const last = columnHeaders[columnHeaders.length - 1]
      if (c.group && last && last.group === c.group) last.children.push({ data: c.label || c.id })
      else if (c.group) columnHeaders.push({ data: c.group, group: c.group, children: [{ data: c.label || c.id }] })
      else columnHeaders.push({ data: c.label || c.id, depth: 2 })
    }
  }
  return { gridId, data, expanded, columnKeys, columnHeaders: hasGroups ? columnHeaders.map(({ group, ...h }) => h) : columnHeaders,
    rowHeaderLabel: m.rowHeaderLabel || '' }
}

/** The height the wire asks for the map (its `style`), or 25rem like the web's <mateu-map>. */
export function mapHeightOf(style) {
  const m = /(?:^|;)\s*height\s*:\s*([^;]+)/i.exec(style || '')
  return m ? m[1].trim() : '25rem'
}

/** Map: JET has no street map (oj-thematic-map needs GeoJSON geography), so the atom
 *  is a container that installMaps (poc/map.mjs) fills with Leaflet and OpenStreetMap tiles.
 *  The specification travels serialized in a data-attribute, like the rich text's HTML. */
export function mapAtomOf(m, id, style) {
  const markers = (m.markers || []).map((k) => ({
    id: k.id, latitude: k.latitude, longitude: k.longitude,
    label: k.label || '', description: k.description || '', color: k.color || '',
  }))
  return {
    isMap: true,
    mapId: 'mateuMap-' + (id || 'map'),
    mapSpec: JSON.stringify({
      position: m.position || '', zoom: m.zoom || '', markers, markerActionId: m.markerActionId || '',
      // the wire's tile provider ('' = OSM, see tileLayerOf in map.mjs)
      tileUrl: m.tileUrl || '', attribution: m.attribution || '',
    }),
    mapStyle: { width: '100%', height: mapHeightOf(style) },
  }
}

export function matrixAtomOf(m, id, interp = (x) => x) {
  const spec = matrixSpecOf({ ...m, rowHeaderLabel: interp(m.rowHeaderLabel || '') }, id)
  const rows = spec.data.reduce((n, r) => n + 1 + (r.children && spec.expanded.includes(r.id) ? r.children.length : 0), 0)
  return {
    isMatrix: true,
    gridId: 'mateuMatrix-' + spec.gridId,
    matrixId: spec.gridId,
    cellActionId: m.cellActionId || '',
    editActionId: m.editActionId || '',
    // height to fit (header(s) + visible rows), with a ceiling: the grid scrolls inside
    // (an OBJECT: JET's :style does not accept the CSS string)
    gridStyle: { width: '100%', height: Math.min(36, 3 + (spec.columnHeaders.some((h) => h && h.children) ? 2.25 : 0) + rows * 2.375) + 'rem' },
    provider: matrixProviderFactory ? matrixProviderFactory(spec) : null,
    // the tone goes on the grid CELL (not on the text): JET asks for the class per context
    cellClassName: (ctx) => {
      // in the class callback the value comes in ctx.data.data (in the template, in cell.item)
      const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
      return 'oj-helper-justify-content-right ' + ((d && d.cls) || '')
    },
    // which cells are edited is decided by JET (cell.editable): the rest stay natively read-only
    cellEditable: (ctx) => {
      const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
      return d && d.editable ? 'enable' : 'disable'
    },
    columnHeaderClassName: (ctx) => {
      const col = (m.columns || [])[ctx && ctx.index]
      return (ctx && ctx.level === 0 && (m.columns || []).some((c) => c.group)) ? '' : toneClass(col && col.tone)
    },
    spec,
  }
}

/** «ctrl+i» → «Ctrl+I», for the trigger's label. */
export function shortcutHintOf(shortcut) {
  if (!shortcut) return ''
  return String(shortcut).split('+').map((k) => k.trim()).filter(Boolean)
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')
}

/** ACTION PANEL by categories («I want to…»): columns per category, the actions WITH
 *  data first (and in bold), up to maxPerCategory visible and the rest behind «Show more».
 *  Show more / hide empty ones / open and close is DOM state (installActionPanels):
 *  no round trip to the server and no re-projection. */
export function actionPanelAtomOf(m, id, interp = (x) => x) {
  const max = m.maxPerCategory > 0 ? m.maxPerCategory : 10
  const panelId = 'mateuActionPanel-' + String(id || m.label || 'actions').replace(/[^A-Za-z0-9_-]/g, '_')
  const categories = (m.categories || []).map((c, ci) => {
    const actions = (c.actions || [])
      .map((a, i) => ({ a, i }))
      .sort((x, y) => (Number(!!y.a.populated) - Number(!!x.a.populated)) || (x.i - y.i))
      .map(({ a }, i) => ({
        label: interp(a.label || '') + (a.count > 0 ? ' (' + (a.count > 25 ? '25+' : a.count) + ')' : ''),
        actionId: a.actionId || '',
        parameters: a.parameters || {},
        disabled: !!a.disabled,
        itemClass: 'mateu-ap-item' + (a.populated ? ' mateu-ap-populated' : ' mateu-ap-unpopulated') + (i >= max ? ' mateu-ap-extra' : ''),
      }))
    const extra = Math.max(0, actions.length - max)
    // with «hide empty» a column with no populated actions is entirely superfluous, and so is «show more»
    // when what it hides is only empty ones (the populated ones go first: if any is left
    // past the cut, everything before it is populated too)
    const populated = (c.actions || []).filter((a) => a.populated).length
    return {
      key: panelId + ':' + ci, title: interp(c.title || ''), actions, hasMore: extra > 0,
      moreLabel: 'Show more (' + extra + ')',
      columnClass: 'mateu-ap-column' + (populated ? '' : ' mateu-ap-column-unpopulated'),
      moreClass: 'mateu-ap-more' + (populated > max ? '' : ' mateu-ap-unpopulated'),
    }
  }).filter((c) => c.actions.length)
  return {
    isActionPanel: true,
    panelId,
    label: interp(m.label || 'I want to…'),
    shortcut: String(m.shortcut || '').toLowerCase(),
    title: interp(m.label || 'I want to…') + (m.shortcut ? '  (' + shortcutHintOf(m.shortcut) + ')' : ''),
    hideToggle: !!m.hideUnpopulatedToggle,
    categories,
  }
}

/** The width the fixed tracks of a grid are measured against (px): a page's content box at a
 *  desktop width. Only the PROPORTION matters — JET's flex shares out twelfths, not pixels. */
export const GRID_REFERENCE_WIDTH = 1200

/** The tracks of a grid-template-columns as WEIGHTS: repeat(N, x) is expanded. Only flexible
 *  tracks («Nfr», minmax(…, Nfr), auto) weigh their fr, only percentages their %; when a FIXED
 *  length (px, rem, em, ch) is in the mix — the 22rem list beside a 1fr detail — every track is
 *  measured against GRID_REFERENCE_WIDTH and the fr tracks share what the others leave (it used
 *  to weigh 1 like a 1fr: «22rem 1fr» split 50/50). An approximation: JET's flex distributes in
 *  twelfths, not in tracks. */
export function gridTrackWeights(template) {
  const tracks = gridTracksOf(template)
  if (!tracks) return []
  if (!tracks.some((t) => t.px != null || t.pct != null)) return tracks.map((t) => t.fr)
  if (tracks.every((t) => t.pct != null)) return tracks.map((t) => t.pct)
  const W = GRID_REFERENCE_WIDTH
  const fixed = tracks.reduce((sum, t) => sum + (t.px != null ? t.px : t.pct != null ? t.pct * W / 100 : 0), 0)
  const frs = tracks.reduce((sum, t) => sum + (t.fr || 0), 0)
  // the fr tracks never vanish: a grid whose fixed tracks fill the reference still shows them
  const free = Math.max(W / 4, W - fixed)
  return tracks.map((t) => Math.round(t.px != null ? t.px : t.pct != null ? t.pct * W / 100 : (t.fr / frs) * free))
}

/** Each track of a grid-template-columns: {fr} | {pct} | {px}; null when the count depends on the
 *  width (auto-fill / auto-fit) and [] when there is no template. */
function gridTracksOf(template) {
  const src = String(template || '').trim()
  if (!src) return null
  // split on top-level spaces (not inside parentheses)
  const tokens = []
  let depth = 0, cur = ''
  for (const ch of src) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (/\s/.test(ch) && depth === 0) { if (cur) tokens.push(cur); cur = '' } else cur += ch
  }
  if (cur) tokens.push(cur)
  const lengthPx = (tok) => {
    const m = /^(\d*\.?\d+)(px|rem|em|ch)$/.exec(tok)
    if (!m) return null
    const n = Number(m[1])
    return m[2] === 'px' ? n : m[2] === 'ch' ? n * 8 : n * 16
  }
  const trackOf = (raw) => {
    const tok = raw.trim()
    // minmax(min, max) / fit-content(x): the track grows to its MAX
    const mm = /^minmax\(\s*[^,]+,\s*(.+)\)$/.exec(tok)
    if (mm) return trackOf(mm[1])
    const fit = /^fit-content\(\s*(.+)\)$/.exec(tok)
    if (fit) return trackOf(fit[1])
    const fr = /^(\d*\.?\d+)fr$/.exec(tok)
    if (fr) return { fr: Number(fr[1]) }
    const pct = /^(\d*\.?\d+)%$/.exec(tok)
    if (pct) return { pct: Number(pct[1]) }
    const px = lengthPx(tok)
    if (px != null) return { px }
    // auto, min-content, max-content, an unknown unit: a flexible track
    return { fr: 1 }
  }
  const out = []
  for (const tok of tokens) {
    const rep = /^repeat\(\s*(\d+)\s*,\s*(.+)\)$/.exec(tok)
    if (rep) {
      const inner = gridTracksOf(rep[2])
      if (!inner) return null
      for (let i = 0; i < Number(rep[1]); i++) out.push(...inner)
    } else if (/^repeat\(/.test(tok)) return null // auto-fill/auto-fit: decided by the width, unknown here
    else out.push(trackOf(tok))
  }
  return out
}

/** oj-flex class of each child of a grid (CSS auto-placement: in order, wrapping to a new row
 *  when the span does not fit). null if the grid has a single track (or it is unknown): it stacks. */
export function gridColClasses(template, colSpans, count) {
  const weights = gridTrackWeights(template)
  if (weights.length < 2) return null
  const total = weights.reduce((a, b) => a + b, 0)
  // a track's edges rounded to twelfths (not each share on its own): a full row always adds up to
  // 12 — «300px 1fr 1fr» rounded share by share was 3 + 5 + 5 and the last one wrapped
  const edge = (track) => Math.round(12 * weights.slice(0, track).reduce((a, b) => a + b, 0) / total)
  const classes = []
  let cursor = 0
  for (let i = 0; i < count; i++) {
    const span = Math.max(1, Math.min(weights.length, (colSpans && colSpans[i]) || 1))
    if (cursor + span > weights.length) cursor = 0
    const twelfths = Math.max(1, Math.min(12, edge(cursor + span) - edge(cursor)))
    classes.push('oj-flex-item oj-sm-12 oj-md-' + twelfths + (twelfths < 12 ? ' oj-sm-padding-2x-end' : ''))
    cursor = (cursor + span) % weights.length
  }
  return classes
}

/** The MIME type of a drag type: this way the target knows, while dragging (when it still
 *  cannot read the data), whether what is coming is its own. */
export const dragMimeOf = (type) => (type ? 'application/x-mateu-' + String(type).toLowerCase().replace(/[^a-z0-9.+-]/g, '-') : '')

/** A wire Avatar → what oj-avatar paints: initials (the given ones or the name's) and image. */
export function avatarOf(m) {
  const name = String((m && m.name) || '')
  const initials = (m && m.abbreviation) || name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  return { name, initials, src: m && m.image ? elementModuleUrl(m.image) : '' }
}

/** Rich text (richText/html/markdown) of a field or component → its sanitized HTML. */
export const RICH_TEXT_STEREOTYPES = { richText: true, html: true, markdown: true }
export function richHtmlOf(kind, value) {
  const text = value == null ? '' : String(value)
  return kind === 'markdown' ? markdownToHtml(text) : sanitizeHtml(text)
}

/** «colSpan of N columns» → the block's oj-flex class (twelfths, never more than 12). */
export function panelColClass(colSpan, columns) {
  const span = Math.max(1, Math.min(columns, colSpan > 0 ? colSpan : 1))
  const twelfths = Math.max(1, Math.min(12, Math.round((12 * span) / columns)))
  return 'oj-flex-item oj-sm-12 oj-md-' + twelfths + ' oj-sm-padding-2x-end'
}

export const TREND_TEXT = { up: '▲', down: '▼', neutral: '■' }
/** A KPI's accessible text, in reading order: "Revenue, 12.4k €, Last 7 days, +8%, …"
 *  (same as the web's: the period travels with the number it qualifies). */
export function metricAriaLabel({ title, value, unit, timeframe, trendLabel, description }) {
  const present = (s) => s != null && String(s).trim() !== ''
  const v = [value, unit].filter(present).map((s) => String(s).trim()).join(' ')
  return [title, v, timeframe, trendLabel, description].filter(present).map((s) => String(s).trim()).join(', ')
}
/** A MetricCard (KPI) ready for the template: big value, colored trend, and if it carries
 *  an actionId, a button that launches the action (e.g. the filtered search that explains it). */

export function metricOf(m, interp = (x) => x) {
  const trend = m.trend || ''
  const title = interp(m.title || '')
  // the value interpolates like the texts around it (`value: ${state.visitors}` showed literally)
  const value = m.value == null ? '' : String(interp(String(m.value)))
  const unit = m.unit ? String(interp(m.unit)) : ''
  // the period the number covers ("Last 7 days"): under the value, and in the accessible text
  const timeframe = String(interp(m.timeframe || '') || '').trim()
  const trendLabel = m.trendLabel ? interp(m.trendLabel) : ''
  const description = interp(m.description || '')
  return {
    title,
    // MetricCard.icon is NOT drawn on Redwood (owner's decision, 2026-10-24: "pure KPI, like in
    // Spectra"): oj-sp-scoreboard's metric card has no icon, and the band is painted exactly as
    // Spectra draws it — no icon slipped in front of the title.
    value,
    unit,
    timeframe,
    trendText: trend ? (TREND_TEXT[trend] || '') + (trendLabel ? ' ' + trendLabel : '') : trendLabel,
    trendClass: 'oj-typography-body-sm ' + (trend === 'up' ? 'mateu-trend-up' : trend === 'down' ? 'mateu-trend-down' : 'oj-text-color-secondary'),
    description,
    // the raw trend, for the scoreboard item (scoreboardTrendOf)
    trend,
    trendLabel,
    ariaLabel: metricAriaLabel({ title, value, unit, timeframe, trendLabel, description }),
    actionId: m.actionId || '',
    parameters: {},
  }
}

// ── Scoreboard → Spectra's oj-sp-scoreboard ─────────────────────────────────────────────────────
// The KPI band is Redwood's scoreboard: each MetricCard becomes one of its items
// ({id, title, metric, meta, periodChangeIndicator, trendColor, badge}). What the item has no
// property for is carried another way, never dropped: timeframe + description → meta (one line,
// the full text in its tooltip and in the card's accessible name); a trend whose label reads as a
// percentage ("+8% vs last month") → the period-change indicator (arrow, %, comparison period);
// any other trend ("+112", "stable") → a subtle badge with the arrow, coloured by the trend; the
// drill-in (actionId) is added by installScoreboards (poc/displayDom.mjs), keyed by the item id, on
// the card's own item action. MetricCard.icon is not shown: the card is Spectra's, as Spectra draws it.
export const TREND_COLOR = { up: 'success', down: 'danger', neutral: 'neutral' }
const PERCENT_TREND = /^\s*([+\-−]?)\s*(\d+(?:[.,]\d+)?)\s*%\s*(.*)$/

/** A metric's trend as the scoreboard draws it: {periodChangeIndicator} for a percentage,
 *  {badge} for anything else, {} without a trend. */
export function scoreboardTrendOf(trend, trendLabel) {
  const label = String(trendLabel || '').trim()
  if (!trend && !label) return {}
  const color = TREND_COLOR[trend] || 'neutral'
  const pct = label.match(PERCENT_TREND)
  if (pct) {
    const magnitude = Number(pct[2].replace(',', '.'))
    // an explicit sign wins; without one, the trend says which way it went
    const negative = pct[1] === '-' || pct[1] === '−' || (!pct[1] && trend === 'down')
    return { periodChangeIndicator: { value: negative ? -magnitude : magnitude, comparisonPeriod: pct[3].trim() }, trendColor: color }
  }
  const glyph = trend ? (TREND_TEXT[trend] || '') : ''
  return { badge: { text: [glyph, label].filter(Boolean).join(' '), status: color }, trendColor: color }
}

/** One MetricCard (already projected by metricOf) → an oj-sp-scoreboard item. */
export function scoreboardItemOf(metric, index) {
  return {
    id: 'k' + index,
    _rowNumber: index,
    title: metric.title,
    metric: [metric.value, metric.unit].filter((s) => s != null && String(s).trim() !== '').join(' '),
    meta: [metric.timeframe, metric.description].filter((s) => s && String(s).trim()).join(' · '),
    ...scoreboardTrendOf(metric.trend, metric.trendLabel),
  }
}

let scoreboardSeq = 0
/** The Spectra half of a scoreboard atom (recomputed when a MetricCard joins the band). */
export function scoreboardAtomOf(metrics) {
  const sbItems = (metrics || []).map(scoreboardItemOf)
  return {
    // the element's id: oj-sp-scoreboard names each card `<id>_kpi_<key>` ('undefined_kpi_k0' without one)
    sbId: 'mateuKpis' + (++scoreboardSeq),
    sbItems,
    sbProvider: dataProviderFactory ? dataProviderFactory(sbItems) : null,
    // any card that drills in: the band then reads as clickable
    sbActionable: (metrics || []).some((m) => !!m.actionId),
  }
}

// Chart.js (the wire's vocabulary) → JET's oj-chart
export const CHART_TYPES = {
  bar: { type: 'bar' }, line: { type: 'line' }, pie: { type: 'pie' }, doughnut: { type: 'pie', innerRadius: 0.55 },
  radar: { type: 'line', polar: true }, polarArea: { type: 'bar', polar: true },
  scatter: { type: 'line', markersOnly: true }, bubble: { type: 'line', markersOnly: true },
}
/** A Chart (series × labels) or a TrendChart (one series) → oj-chart atom: the precomputed
 *  ITEMS ({series, group, value}); in a pie each label is a series (a slice). */
export function chartAtomOf(m, t, interp = (x) => x) {
  const trend = t === 'TrendChart'
  const labels = (trend ? m.labels : m.chartData && m.chartData.labels) || []
  const datasets = trend
    ? [{ label: m.title || '', data: m.values || [] }]
    : ((m.chartData && m.chartData.datasets) || [])
  const spec = trend ? { type: m.area ? 'area' : 'line' } : (CHART_TYPES[m.chartType] || CHART_TYPES.bar)
  const pie = spec.type === 'pie'
  const items = []
  datasets.forEach((d, si) => (d.data || []).forEach((value, i) => {
    const label = labels[i] != null ? String(labels[i]) : String(i + 1)
    items.push({
      _rowNumber: items.length,
      id: si + ':' + i,
      value: value == null ? null : Number(value),
      series: pie ? label : (d.label || 'Series ' + (si + 1)),
      group: pie ? (d.label || 'Total') : label,
    })
  }))
  return {
    isChart: true,
    title: trend ? interp(m.title || '') : '',
    chartType: spec.type,
    coordinateSystem: spec.polar ? 'polar' : 'cartesian',
    innerRadius: spec.innerRadius || 0,
    lineType: spec.markersOnly ? 'none' : 'auto',
    markerDisplayed: spec.markersOnly ? 'on' : 'auto',
    legend: datasets.length > 1 || pie ? 'on' : 'off',
    chartStyle: { width: '100%', height: pie ? '18rem' : '16rem' },
    items,
    provider: dataProviderFactory ? dataProviderFactory(items) : null,
  }
}

/** Is it a RICH atom (a real display, not a loose field)? When a screen's content
 *  brings them, the generic form is superfluous: its fields are already seen in them. */
export const RICH_ATOM_FLAGS = [
  'isEntityHeader', 'isTaskProgress', 'isMeter', 'isStatusList', 'isLedger', 'isPayment',
  'isResourceGrid', 'isAddOns', 'isStat', 'isNotice', 'isPropertyRow',
  // PMS challenge: any NEW atom has to be here — otherwise, on a page that also
  // carries fields the generic form wins (it only paints fields) and the atom disappears
  'isAnchor', 'isQueue', 'isPlanning', 'isCollapsible', 'isActionPanel', 'isRecordMerge', 'isMatrix', 'isChart', 'isScoreboard', 'isCalendar', 'isPopover', 'isDropZone', 'isGantt', 'isImage', 'isAvatar', 'isGallery', 'isRichText', 'isMap',
  // the display components of core/display.mjs
  'isKanban', 'isTimeline', 'isPricing', 'isOrgChart', 'isHeatmap', 'isFunnel', 'isFeatureGrid', 'isTestimonials',
  'isCallout', 'isComments', 'isFileList', 'isChecklist', 'isComparison', 'isProcessMonitor', 'isSkeleton', 'isIcon',
  'isTooltip', 'isContextMenu', 'isMenuBar', 'isDirectory', 'isMessages', 'isMessageInput', 'isChatComponent', 'isBpmn',
  'isWorkflow', 'isResult', 'isCookieConsent', 'isConfirmDialog', 'isBreadcrumbs', 'isStepHeader', 'isCarouselPager',
  'isHero', 'isEmptyStateAtom', 'isProgressBar', 'isCustomSlot',
  // a Listing nested in a templated page's content (core/listing.mjs nestedListingAtomOf)
  'isNestedListing',
]
export function isRichAtom(a) {
  return !!a && RICH_ATOM_FLAGS.some((flag) => a[flag])
}

/** Is this button block the wizard's FOOTER (Back / Next / the completion action)? */
export function isWizardNavAtom(a) {
  return !!(a && a.isButtons && (a.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next'))
}

/**
 * A wizard's current STEP, ready to paint: { title, content, sections, nav }.
 *
 * - content: the step's display blocks (hostContentOf in wizard mode, with the island merged).
 * - sections: the step's fields grouped by @Section (formSectionsOf), or [] if the content
 *   is RICH (the same rule as the host: the header/property rows already show that data).
 * - Each field ONCE: the FormFields the form paints (with their real widget: select,
 *   date…) are removed from the content, where they would only be a text oj-input-text — before they
 *   appeared twice, above as text and below with their dropdown. Those of a merged island (fromNested)
 *   belong to another context and stay.
 * - In HORIZONTAL (train on top) the wire's Back/Next footer moves from the content to `nav` (the
 *   footer bar), and the wizard's title (its h2) moves to `title` if the page brings no other.
 */
export function wizardStepViewOf(ctx, islandBlocks, opts = {}) {
  const wizard = wizardOf(ctx)
  if (!wizard) return null
  let content = hostContentOf(ctx, islandBlocks,
    { forWizard: true, keepWizardNav: wizard.horizontal, title: opts.title || '' }) || []
  let sections = opts.sections || []
  if (content.some((block) => (block.items || []).some(isRichAtom))) sections = []
  const onForm = new Set()
  for (const section of sections) for (const f of section.fields || []) onForm.add(f.fieldId)
  let title = opts.title || ''
  let nav = []
  let subtitleDropped = false
  content = content.map((block) => {
    let movedToForm = 0
    const items = block.items.map((a) => {
      if (!a.isFormLayout || a.fromNested) return a
      const kept = a.fields.filter((f) => !onForm.has(f.fieldId))
      movedToForm += a.fields.length - kept.length
      return kept.length === a.fields.length ? a : { ...a, fields: kept }
    }).filter((a) => {
      if (a.isFormLayout && !a.fields.length) return false
      if (a.isInput && !a.fromNested && onForm.has(a.fieldId)) { movedToForm++; return false }
      // the wizard's title (its h2) goes to the header — the h1 above the train, or the guided
      // process's process title —, and its subtitle with it: neither is repeated in the step
      if (a.isText && a.isH2 && (!title || a.text === title || a.text === wizard.title)) {
        if (!title) title = a.text
        return false
      }
      if (!subtitleDropped && wizard.subtitle && a.isText && !a.isHeading && a.text === wizard.subtitle) {
        subtitleDropped = true
        return false
      }
      if (wizard.horizontal && isWizardNavAtom(a)) { nav = a.buttons; return false }
      return true
    })
    // a @Section card whose fields went to the form keeps only its title: the form
    // already paints that section with its heading — drop the empty card
    const onlyHeadings = items.every((a) => a.isText && a.isHeading)
    return { ...block, items: movedToForm && onlyHeadings ? [] : items }
  }).filter((block) => block.items.length)
  // the step's label is already painted by the step header (the h2 under the train, or the
  // guided process's step title): a @Section named like its step does not repeat it
  const stepLabel = wizard.currentLabel
  sections = sections.map((section) => (
    stepLabel && section.title && section.title.trim() === stepLabel.trim()
      ? { ...section, title: '', hasTitle: false }
      : section))
  // the ADVANCE action (Next, or the completion one) is the footer's call to action
  nav = nav.map((b) => ({
    ...b,
    chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
  }))
  return { wizard, title: title || wizard.title, subtitle: wizard.subtitle, content, sections, nav }
}
