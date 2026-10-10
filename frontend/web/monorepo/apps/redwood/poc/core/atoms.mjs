import { elementModuleUrl } from '../elements.mjs'
import { sanitizeHtml, markdownToHtml } from '../richtext.mjs'
import { formSectionsOf } from './tree.mjs'
import { wizardOf } from './archetypes.mjs'
import { dataProviderFactory, hostContentOf, panelExpanded } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): single-component atom projections: matrix, map, action panel, grid tracks, avatar, metric, chart; the wizard step view.

// ── MatrixGrid → oj-data-grid ────────────────────────────────────────────────────────────────
// La matriz (filas × fechas, secciones plegables, celdas que enlazan y filas editables) la pinta
// el oj-data-grid de JET sobre un RowDataGridProvider de un FlattenedTreeDataProviderView: las
// secciones son nodos del árbol (el disclosure lo pinta JET), las columnas c0..cN. Aquí se arma
// la especificación PURA (probada en Node); el provider lo crea la fábrica del bridge.
export let matrixProviderFactory = null
export function setMatrixProviderFactory(factory) { matrixProviderFactory = factory }

export const MATRIX_TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
export const toneClass = (tone) => (tone && MATRIX_TONES[tone] ? 'mateu-matrix-' + tone : '')

/** Clave del estado plegado de una sección (el mismo almacén que los paneles plegables). */
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
  // cabeceras: si hay grupos (el mes), dos niveles — el grupo abarca sus columnas consecutivas
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

/** La altura que el wire pide para el mapa (su `style`), o 25rem como el <mateu-map> del web. */
export function mapHeightOf(style) {
  const m = /(?:^|;)\s*height\s*:\s*([^;]+)/i.exec(style || '')
  return m ? m[1].trim() : '25rem'
}

/** Map: JET no tiene mapa de calles (oj-thematic-map pide geografía GeoJSON), así que el átomo
 *  es un contenedor que installMaps (poc/map.mjs) llena con Leaflet y teselas de OpenStreetMap.
 *  La especificación viaja serializada en un data-attribute, como el HTML del texto enriquecido. */
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
      // el proveedor de teselas del wire ('' = OSM, ver tileLayerOf en map.mjs)
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
    // alto a la medida (cabecera(s) + filas visibles), con techo: el grid hace scroll dentro
    // (un OBJETO: el :style de JET no acepta la cadena CSS)
    gridStyle: { width: '100%', height: Math.min(36, 3 + (spec.columnHeaders.some((h) => h && h.children) ? 2.25 : 0) + rows * 2.375) + 'rem' },
    provider: matrixProviderFactory ? matrixProviderFactory(spec) : null,
    // el tono va en la CELDA del grid (no en el texto): JET pide la clase por contexto
    cellClassName: (ctx) => {
      // en el callback de clase el valor viene en ctx.data.data (en la plantilla, en cell.item)
      const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
      return 'oj-helper-justify-content-right ' + ((d && d.cls) || '')
    },
    // qué celdas se editan lo decide JET (cell.editable): las demás quedan read-only nativas
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

/** «ctrl+i» → «Ctrl+I», para el rótulo del disparador. */
export function shortcutHintOf(shortcut) {
  if (!shortcut) return ''
  return String(shortcut).split('+').map((k) => k.trim()).filter(Boolean)
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')
}

/** PANEL DE ACCIONES por categorías («I want to…»): columnas por categoría, las acciones CON
 *  datos primero (y en negrita), hasta maxPerCategory visibles y el resto tras «Show more».
 *  Mostrar más / ocultar las vacías / abrir y cerrar es estado del DOM (installActionPanels):
 *  sin ida y vuelta al servidor y sin re-proyectar. */
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
    // con «ocultar vacías» una columna sin acciones con datos sobra entera, y el «mostrar más»
    // también cuando lo que esconde son sólo vacías (los poblados van primero: si alguno queda
    // fuera del corte, todo lo que hay antes también es poblado)
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

/** Las pistas de un grid-template-columns como PESOS: repeat(N, x) se expande, «Nfr», «N%» y
 *  minmax(…, Nfr) pesan N, lo demás (px, rem, auto, min-content…) pesa 1 — una aproximación: el
 *  flex de JET reparte en doceavos, no en pistas. */
export function gridTrackWeights(template) {
  const src = String(template || '').trim()
  if (!src) return []
  // trocea por espacios de primer nivel (no dentro de paréntesis)
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
    } else if (/^repeat\(/.test(tok)) return [] // auto-fill/auto-fit: lo decide el ancho, no se sabe aquí
    else out.push(weightOf(tok))
  }
  return out
}

/** Clase oj-flex de cada hijo de una rejilla (auto-colocación CSS: en orden, saltando de fila
 *  cuando el span no cabe). null si la rejilla es de una pista (o no se sabe): se apila. */
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

/** El tipo MIME de un tipo de arrastre: así el destino sabe, mientras se arrastra (cuando aún no
 *  puede leer los datos), si lo que viene es suyo. */
export const dragMimeOf = (type) => (type ? 'application/x-mateu-' + String(type).toLowerCase().replace(/[^a-z0-9.+-]/g, '-') : '')

/** Un Avatar del wire → lo que pinta oj-avatar: iniciales (las dadas o las del nombre) e imagen. */
export function avatarOf(m) {
  const name = String((m && m.name) || '')
  const initials = (m && m.abbreviation) || name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  return { name, initials, src: m && m.image ? elementModuleUrl(m.image) : '' }
}

/** Texto enriquecido (richText/html/markdown) de un campo o componente → su HTML saneado. */
export const RICH_TEXT_STEREOTYPES = { richText: true, html: true, markdown: true }
export function richHtmlOf(kind, value) {
  const text = value == null ? '' : String(value)
  return kind === 'markdown' ? markdownToHtml(text) : sanitizeHtml(text)
}

/** «colSpan de N columnas» → la clase oj-flex del bloque (doceavos, nunca más de 12). */
export function panelColClass(colSpan, columns) {
  const span = Math.max(1, Math.min(columns, colSpan > 0 ? colSpan : 1))
  const twelfths = Math.max(1, Math.min(12, Math.round((12 * span) / columns)))
  return 'oj-flex-item oj-sm-12 oj-md-' + twelfths + ' oj-sm-padding-2x-end'
}

export const TREND_TEXT = { up: '▲', down: '▼', neutral: '■' }
/** Un MetricCard (KPI) listo para la plantilla: valor grande, tendencia con color, y si lleva
 *  actionId, un botón que lanza la acción (p.ej. la búsqueda filtrada que lo explica). */
export function metricOf(m, interp = (x) => x) {
  const trend = m.trend || ''
  return {
    title: interp(m.title || ''),
    value: String(m.value == null ? '' : m.value),
    unit: m.unit || '',
    trendText: trend ? (TREND_TEXT[trend] || '') + (m.trendLabel ? ' ' + interp(m.trendLabel) : '') : (m.trendLabel ? interp(m.trendLabel) : ''),
    trendClass: 'oj-typography-body-sm ' + (trend === 'up' ? 'mateu-trend-up' : trend === 'down' ? 'mateu-trend-down' : 'oj-text-color-secondary'),
    description: interp(m.description || ''),
    actionId: m.actionId || '',
    parameters: {},
  }
}

// Chart.js (el vocabulario del wire) → oj-chart de JET
export const CHART_TYPES = {
  bar: { type: 'bar' }, line: { type: 'line' }, pie: { type: 'pie' }, doughnut: { type: 'pie', innerRadius: 0.55 },
  radar: { type: 'line', polar: true }, polarArea: { type: 'bar', polar: true },
  scatter: { type: 'line', markersOnly: true }, bubble: { type: 'line', markersOnly: true },
}
/** Un Chart (series × etiquetas) o un TrendChart (una serie) → átomo de oj-chart: los ITEMS
 *  precomputados ({series, group, value}); en una tarta cada etiqueta es una serie (una porción). */
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

/** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
 *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
export const RICH_ATOM_FLAGS = [
  'isEntityHeader', 'isTaskProgress', 'isMeter', 'isStatusList', 'isLedger', 'isPayment',
  'isResourceGrid', 'isAddOns', 'isStat', 'isNotice', 'isPropertyRow',
  // reto PMS: cualquier átomo NUEVO tiene que estar aquí — si no, en una página que también
  // lleva campos gana el formulario genérico (que solo pinta campos) y el átomo desaparece
  'isAnchor', 'isQueue', 'isPlanning', 'isCollapsible', 'isActionPanel', 'isMatrix', 'isChart', 'isScoreboard', 'isCalendar', 'isPopover', 'isDropZone', 'isGantt', 'isImage', 'isAvatar', 'isGallery', 'isRichText', 'isMap',
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

/** ¿Es este bloque de botones el PIE del wizard (Back / Next / la acción de completar)? */
export function isWizardNavAtom(a) {
  return !!(a && a.isButtons && (a.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next'))
}

/**
 * El PASO actual de un wizard, listo para pintar: { title, content, sections, nav }.
 *
 * - content: los bloques display del paso (hostContentOf en modo wizard, con la isla fusionada).
 * - sections: los campos del paso agrupados por @Section (formSectionsOf), o [] si el contenido
 *   es RICO (la misma regla que el host: el header/las property rows ya muestran esos datos).
 * - Cada campo UNA vez: los FormFields que el formulario pinta (con su widget de verdad: select,
 *   fecha…) salen del contenido, donde sólo serían un oj-input-text de texto — antes salían dos
 *   veces, arriba como texto y abajo con su desplegable. Los de una isla fusionada (fromNested)
 *   son de otro contexto y se quedan.
 * - En HORIZONTAL (tren arriba) el pie Back/Next del wire sale del contenido a `nav` (la barra
 *   del pie), y el título del wizard (su h2) sale a `title` si la página no trae otro.
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
      // el título del wizard (su h2) va a la cabecera — el h1 sobre el tren, o el título del
      // proceso del guided process —, y su subtítulo con él: ninguno se repite en el paso
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
    // una tarjeta de @Section cuyos campos se fueron al form se queda en su título: el form
    // ya pinta esa sección con su encabezado — fuera la tarjeta vacía
    const onlyHeadings = items.every((a) => a.isText && a.isHeading)
    return { ...block, items: movedToForm && onlyHeadings ? [] : items }
  }).filter((block) => block.items.length)
  // el rótulo del paso ya lo pinta la cabecera del paso (el h2 bajo el tren, o el título del
  // paso del guided process): una @Section que se llama igual que su paso no lo repite
  const stepLabel = wizard.currentLabel
  sections = sections.map((section) => (
    stepLabel && section.title && section.title.trim() === stepLabel.trim()
      ? { ...section, title: '', hasTitle: false }
      : section))
  // la acción de AVANCE (Next, o la de completar) es la llamada a la acción del pie
  nav = nav.map((b) => ({
    ...b,
    chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
  }))
  return { wizard, title: title || wizard.title, subtitle: wizard.subtitle, content, sections, nav }
}
