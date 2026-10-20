import { elementModuleUrl } from '../elements.mjs'
import { sanitizeHtml, markdownToHtml } from '../richtext.mjs'
import { formSectionsOf } from './tree.mjs'
import { wizardOf } from './archetypes.mjs'
import { dataProviderFactory, hostContentOf, panelExpanded } from './content.mjs'
import { ojIconOrGenericOf } from './shellNav.mjs'
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

/** The tracks of a grid-template-columns as WEIGHTS: repeat(N, x) is expanded, «Nfr», «N%» and
 *  minmax(…, Nfr) weigh N, the rest (px, rem, auto, min-content…) weighs 1 — an approximation:
 *  JET's flex distributes in twelfths, not in tracks. */
export function gridTrackWeights(template) {
  const src = String(template || '').trim()
  if (!src) return []
  // split on top-level spaces (not inside parentheses)
  const tokens = []
  let depth = 0, cur = ''
  for (const ch of src) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (/\s/.test(ch) && depth === 0) { if (cur) tokens.push(cur); cur = '' } else cur += ch
  }
  if (cur) tokens.push(cur)
  const weightOf = (tok) => {
    const fr = /(\d*\.?\d+)(fr|%)\)?$/.exec(tok)
    return fr ? Number(fr[1]) : 1
  }
  const out = []
  for (const tok of tokens) {
    const rep = /^repeat\(\s*(\d+)\s*,\s*(.+)\)$/.exec(tok)
    if (rep) {
      const inner = gridTrackWeights(rep[2])
      for (let i = 0; i < Number(rep[1]); i++) out.push(...inner)
    } else if (/^repeat\(/.test(tok)) return [] // auto-fill/auto-fit: decided by the width, unknown here
    else out.push(weightOf(tok))
  }
  return out
}

/** oj-flex class of each child of a grid (CSS auto-placement: in order, wrapping to a new row
 *  when the span does not fit). null if the grid has a single track (or it is unknown): it stacks. */
export function gridColClasses(template, colSpans, count) {
  const weights = gridTrackWeights(template)
  if (weights.length < 2) return null
  const total = weights.reduce((a, b) => a + b, 0)
  const classes = []
  let cursor = 0
  for (let i = 0; i < count; i++) {
    const span = Math.max(1, Math.min(weights.length, (colSpans && colSpans[i]) || 1))
    if (cursor + span > weights.length) cursor = 0
    const share = weights.slice(cursor, cursor + span).reduce((a, b) => a + b, 0) / total
    const twelfths = Math.max(1, Math.min(12, Math.round(12 * share)))
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
/** An icon NAME (`vaadin:users`, `lumo:edit`, an `oj-ux-` class) — not an emoji or a glyph. */
export const isIconName = (icon) => !!icon && (/^[a-z][\w-]*:[\w-]+$/i.test(String(icon)) || String(icon).indexOf('oj-ux-') === 0)

export function metricOf(m, interp = (x) => x) {
  const trend = m.trend || ''
  const title = interp(m.title || '')
  const value = String(m.value == null ? '' : m.value)
  const unit = m.unit || ''
  // the period the number covers ("Last 7 days"): under the value, and in the accessible text
  const timeframe = String(interp(m.timeframe || '') || '').trim()
  const trendLabel = m.trendLabel ? interp(m.trendLabel) : ''
  const description = interp(m.description || '')
  return {
    title,
    // MetricCard.icon beside the title — it was not drawn: a NAME (vaadin:/lumo:…, an oj-ux- class)
    // is Redwood's icon; anything else (an emoji, a glyph) is drawn as the text it is. '' without one
    iconClass: isIconName(m.icon) ? ojIconOrGenericOf(m.icon) : '',
    iconText: m.icon && !isIconName(m.icon) ? String(m.icon) : '',
    value,
    unit,
    timeframe,
    trendText: trend ? (TREND_TEXT[trend] || '') + (trendLabel ? ' ' + trendLabel : '') : trendLabel,
    trendClass: 'oj-typography-body-sm ' + (trend === 'up' ? 'mateu-trend-up' : trend === 'down' ? 'mateu-trend-down' : 'oj-text-color-secondary'),
    description,
    ariaLabel: metricAriaLabel({ title, value, unit, timeframe, trendLabel, description }),
    actionId: m.actionId || '',
    parameters: {},
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
