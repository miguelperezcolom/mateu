import { applyColumnPrefs } from '../prefs.mjs'
import { walkWithinSurface } from './tree.mjs'
import { dragMimeOf } from './atoms.mjs'
import { columnPrefsReader, islandContentOf } from './content.mjs'
import { optionsOf } from './rowEditor.mjs'
import { aggregateFootersOf, groupedRows, toneRows } from './boards.mjs'
import { chromeText, chromeLanguage } from '../i18n.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): listings: the table, paging, sort, selection, filters and the smart search bar.

/** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
export function findByType(tree, type) {
  let found = null
  const walk = (node) => {
    if (found || !node || typeof node !== 'object') return
    if (node.metadata && node.metadata.type === type) { found = node; return }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') walk(v)
    }
  }
  walk(tree)
  return found
}

/** Primer nodo de la SUPERFICIE (sin cruzar islas) que cumple `test`; null si ninguno. */
export function findFirst(tree, test) {
  let found = null
  walkWithinSurface(tree, (n) => { if (!found && test(n)) found = n })
  return found
}

/** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
 *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
 *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
/**
 * El listado del host listo para pintar. `allColumns` son todas las del wire (de ahí parte el
 * diálogo de columnas) y `columns` las que se pintan, con las preferencias del usuario aplicadas
 * (prefs.mjs: ocultas fuera, en su orden) — leídas por columnPrefsReader (localStorage por ruta).
 */
export function listingOf(ctx, opts = {}) {
  const listing = listingBaseOf(ctx, opts)
  if (!listing) return listing
  const prefs = columnPrefsReader ? columnPrefsReader() : null
  // PRE-SEARCH content (Listing.preSearch / SmartSearchPage.preSearchContent → CrudlDto.preSearch,
  // the smart-filter-search `dashboard` slot): until the first search answers, those components
  // stand IN PLACE of the results — the table (and its empty state) is hidden and the blocks go
  // where the listing's header blocks go. oj-sp's own dashboard slot is a side column counted at
  // mount, not a stand-in that leaves, so the projection does it.
  const preSearch = listingPreSearchBlocksOf(ctx)
  const header = listingHeaderBlocksOf(ctx)
  return { ...listing, allColumns: listing.columns, columns: applyColumnPrefs(listing.columns, prefs),
    headerBlocks: preSearch ? header.concat(preSearch) : header,
    showPreSearch: !!preSearch,
    ...(preSearch ? {
      tableClass: listing.tableClass + ' oj-helper-hidden',
      paging: { ...listing.paging, visible: false },
    } : {}),
  }
}

/** Whether the listing has had a search answered: the server's page arrives in ctx.data.crud. */
export function listingSearchedOf(ctx) {
  const crud = ctx && ctx.data ? ctx.data.crud : null
  return !!(crud && crud.page)
}

/** The pre-search blocks while no search has answered yet; null otherwise (or when none). */
export function listingPreSearchBlocksOf(ctx) {
  const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
  const pre = crudNode && crudNode.metadata && Array.isArray(crudNode.metadata.preSearch) ? crudNode.metadata.preSearch : []
  if (!pre.length || listingSearchedOf(ctx)) return null
  const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_listingPreSearch', metadata: { type: 'VerticalLayout' }, children: pre } }) || []
  const out = blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12', preSearch: true }))
  return out.length ? out : null
}

/** Los componentes de CABECERA de la página del listado (HeaderSupplier → Page.metadata.header)
 *  como bloques de átomos: el listado no tiene contenido propio donde ponerlos. */
export function listingHeaderBlocksOf(ctx) {
  const pageNode = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  const header = pageNode && pageNode.metadata && Array.isArray(pageNode.metadata.header) ? pageNode.metadata.header : []
  if (!header.length) return []
  const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_listingHeader', metadata: { type: 'VerticalLayout' }, children: header } }) || []
  return blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12' }))
}

export function listingBaseOf(ctx, opts = {}) {
  const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
  if (!crudNode) return null
  const md = crudNode.metadata
  const page = (((ctx.data || {}).crud || {}).page) || {}
  // FILAS DE VARIAS LÍNEAS (@Line → GridColumn.line): las columnas de la línea 1 son las de la
  // tabla (cabecera, orden, anchos); las demás se pintan DEBAJO de cada fila, a lo ancho, como
  // pares «Etiqueta: valor» secundarios — ver rowLinesOf / la plantilla cellLines
  const lines = rowLinesSplit(md.columns || [])
  const tableColumns = lines.extra.length ? lines.first : (md.columns || [])
  return {
    // PAGINACIÓN: la página que mandó el server (Page: pageNumber/pageSize/totalElements) →
    // pie de la tabla con el rango y los controles; precomputado (CSP de VB)
    paging: listingPagingOf(page, md.pageSize || 20, opts.lang),
    title: md.title || '',
    subtitle: md.subtitle || '',
    // @RowRoute / Listing.rowRoute: una fila ABRE una ruta (el maestro de un registro) — ver rowRouteOf
    rowRoute: md.rowRoute || '',
    searchable: !!md.searchable,
    pageSize: md.pageSize || 20,
    emptyStateMessage: md.emptyStateMessage || 'No data.',
    columns: tableColumns.map((col) => {
      const c = col.metadata || col
      const def = { headerText: c.label || c.id, field: c.id }
      // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
      // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
      if (c.editable && c.editorType) {
        def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
          : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
            : 'cellEditText'
      }
      // ACCIONES por fila (ColumnActionGroup): botones que despachan
      // action-on-row-<método> con el id de la fila (Listing.handleActionOnRow)
      if (c.dataType === 'actionGroup') {
        def.template = 'cellRowActions'
        def.headerText = ''
        def.sortable = 'disabled'
      }
      // la clave de la columna = el id del wire: el ojSort la devuelve y es lo que el server
      // ordena (la celda puede leer otro campo, p.ej. el UUID abreviado)
      def.id = c.id
      // pie de totales (@Aggregate): la plantilla footerTotal lee totals[columnKey]
      if (aggregateFootersOf(md, (ctx.data || {}).crud)) def.footerTemplate = 'footerTotal'
      // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
      // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
      if (c.dataType === 'status') {
        def.template = 'cellStatusBadge'
      }
      // COLUMNA PRINCIPAL (@PrimaryColumn: stereotype 'primary'): imagen delante del título
      // (leadingPath, p.ej. la bandera del huésped) y línea de caption debajo (captionPath) —
      // campos de la fila que no son columnas. Precomputado por fila en primaryCellRows (CSP).
      if (!def.template && c.stereotype === 'primary') {
        def.field = c.id + PRIMARY_CELL_SUFFIX
        def.template = 'cellPrimary'
      }
      // UUID abreviado: una columna de texto cuyos valores son UUID se pinta "…-<último bloque>"
      // con el UUID entero en el tooltip. La fila NO cambia: la celda lee un campo aparte,
      // precomputado en uuidCellRows (CSP de VB: la plantilla no puede recortar el texto).
      if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
        def.field = c.id + UUID_CELL_SUFFIX
        def.template = 'cellUuid'
      }
      // ANCHO de la columna (@ColumnWidth: width + flexGrow "0" + tooltipPath en el wire, el
      // mismo contrato que aplica el gridRenderer de Vaadin): oj-table fija ese ancho; con
      // flexGrow 0 la columna no crece (min = max = width) y su texto se corta con elipsis,
      // entero en el tooltip (tooltipPath). Las demás columnas siguen a su contenido.
      Object.assign(def, columnWidthOf(c))
      if (!def.template && clipColumn(c)) {
        def.field = c.id + CLIP_CELL_SUFFIX
        def.template = 'cellClip'
      }
      return def
    }).concat(lines.extra.length ? [ROW_LINES_COLUMN] : []),
    // nº de líneas extra (0 = listado normal) y la clase de la tabla que les hace sitio
    // (PRECOMPUTADA: CSP de VB)
    extraLines: lines.extra.length,
    tableClass: lines.extra.length ? 'oj-sm-12 mateu-multiline-table mateu-lines-' + Math.min(lines.extra.length, 4) : 'oj-sm-12',
    // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
    // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
    // como editable en el wire); un listado de consulta queda en 'list' (aireado).
    // PRECOMPUTADO (CSP de VB).
    display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
    // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
    editable: (md.columns || []).some((col) => (col.metadata || col).editable),
    // DETALLE de fila (@Details en la fila): el campo que no es columna y se abre al pulsar la
    // fila. Una fila NAVEGABLE (primera columna con actionId 'view') sigue abriendo el registro:
    // el detalle es para los listados de consulta, donde el clic no tenía otro destino.
    detailPath: md.detailPath || null,
    navigable: (md.columns || []).some((col, i) => i === 0 && (col.metadata || col).actionId === 'view'),
    // SELECCIÓN de filas (Listing.rowsSelectionEnabled): casillas en la tabla, y las acciones de la
    // toolbar reciben las filas marcadas en crud_selected_items — el mismo contrato que Vaadin
    // (HttpRequest.getSelectedRows lo lee del componentState). El modo va PRECOMPUTADO (CSP de VB).
    rowsSelectionEnabled: !!md.rowsSelectionEnabled,
    selectionMode: { row: md.rowsSelectionEnabled ? 'multiple' : 'none' },
    // las acciones que no tienen sentido sin selección (Action.rowsSelectedRequired: Delete…)
    // (las acciones declaradas del ServerSide host, no los botones)
    selectionRequired: ((ctx.tree && ctx.tree.actions) || [])
      .filter((a) => a.rowsSelectedRequired).map((a) => a.id),
    // @RowStatus: cada fila lleva su tono (_tone) — lo pinta tables.mjs sobre los tr del oj-table;
    // @GroupBy: filas de grupo intercaladas (valor (n) + subtotales), sólo presentación
    rows: groupedRows(toneRows(rowLinesRows(clipCellRows(primaryCellRows(uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []), md.columns || []), md.columns || []), lines.extra), md.rowStatusField), md, (ctx.data || {}).crud),
    // @Aggregate: los totales del conjunto filtrado, por columna (pie del oj-table)
    totals: aggregateFootersOf(md, (ctx.data || {}).crud),
    hasTotals: !!aggregateFootersOf(md, (ctx.data || {}).crud),
    rowStatusField: md.rowStatusField || '',
    // @DragRows: las filas se arrastran (JET oj-table dnd) con este tipo MIME — dnd.mjs
    dragType: md.dragType || '',
    dragTypes: md.dragType ? [dragMimeOf(md.dragType)] : [],
    // la propiedad por la que ordena el server cada columna (GridColumn.sortingProperty o su id)
    sortFields: Object.fromEntries((md.columns || []).map((col) => col.metadata || col)
      .map((c) => [c.id, c.sortingProperty || c.id])),
    total: page.totalElements == null ? null : page.totalElements,
    isEmpty: (page.content || []).length === 0,
    toolbar: (md.toolbar || []).map((b) => ({
      actionId: b.actionId,
      label: b.label,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      disabled: !!b.disabled,
    })),
    // selector RÁPIDO del listado: filtros de opciones (p.ej. un enum en Filters, como
    // la Vista del listado de reservas) → chips oj-sp-filter-chip junto al smart search;
    // los filtros viajan como FormField select en la metadata (a veces en el mediator,
    // no en el nodo Crud — se busca en todo el árbol)
    filters: filtersOf(ctx),
  }
}

// los textos del pie, del catálogo de la interfaz (i18n.mjs)
export function pagingLangOf(lang) {
  const l = chromeLanguage(lang)
  const t = (key) => chromeText(key, null, l)
  return { of: t('pagingOf'), page: t('pagingPage'), first: t('pagingFirst'), prev: t('pagingPrev'), next: t('pagingNext'), last: t('pagingLast') }
}

/**
 * La PAGINACIÓN del listado, de la Page que manda el server (pageNumber/pageSize/totalElements) →
 * lo que pinta el pie de la tabla: "11–20 de 57", "Página 2 de 6" y qué botones están activos.
 * Sin total conocido (un Listing que no cuenta) hay "siguiente" mientras la página venga llena.
 * `visible` = hay más de una página (un listado corto no lleva pie).
 */
export function listingPagingOf(page, fallbackSize, lang) {
  const p = page || {}
  const t = pagingLangOf(lang)
  const size = p.pageSize > 0 ? p.pageSize : (fallbackSize > 0 ? fallbackSize : 20)
  const number = p.pageNumber > 0 ? p.pageNumber : 0
  const shown = (p.content || []).length
  const total = p.totalElements == null || p.totalElements < 0 ? null : p.totalElements
  const pageCount = total == null ? null : Math.max(1, Math.ceil(total / size))
  const from = shown === 0 ? 0 : number * size + 1
  const to = number * size + shown
  const hasPrev = number > 0
  const hasNext = total == null ? shown >= size : (number + 1) * size < total
  return {
    pageNumber: number,
    pageSize: size,
    total,
    pageCount,
    lastPage: pageCount == null ? null : pageCount - 1,
    hasPrev,
    hasNext,
    hasLast: hasNext && pageCount != null,
    // los disabled ya negados (CSP de VB: la plantilla no evalúa "!")
    prevDisabled: !hasPrev,
    nextDisabled: !hasNext,
    lastDisabled: !(hasNext && pageCount != null),
    visible: hasPrev || hasNext,
    rangeText: total == null ? `${from}–${to}` : `${from}–${to} ${t.of} ${total}`,
    pageText: pageCount == null ? `${t.page} ${number + 1}` : `${t.page} ${number + 1} ${t.of} ${pageCount}`,
    labels: { first: t.first, prev: t.prev, next: t.next, last: t.last },
  }
}

/**
 * La página a la que lleva un botón del pie: 'first' | 'prev' | 'next' | 'last' sobre el paging
 * actual → número de página, o null si el botón no lleva a ningún sitio.
 */
export function targetPageOf(paging, which) {
  if (!paging) return null
  if (which === 'first') return paging.hasPrev ? 0 : null
  if (which === 'prev') return paging.hasPrev ? paging.pageNumber - 1 : null
  if (which === 'next') return paging.hasNext ? paging.pageNumber + 1 : null
  if (which === 'last') return paging.hasLast ? paging.lastPage : null
  const n = Number(which)
  return Number.isInteger(n) && n >= 0 ? n : null
}

/**
 * El componentState de una búsqueda del listado: el estado del host + el texto, la página, el
 * tamaño, el orden y los filtros aplicados (los chips; un rango ocupa dos claves) — lo que
 * SearchActionHandler lee. Paginar o reordenar conserva texto y filtros; el orden viaja como
 * lista [{field, direction}] y sólo si lo hay.
 */
export function listingSearchStateOf(hostState, opts = {}) {
  const state = Object.assign({}, hostState || {}, {
    searchText: opts.searchText == null ? '' : opts.searchText,
    page: opts.page > 0 ? opts.page : 0,
    size: opts.size > 0 ? opts.size : 20,
  })
  const applied = opts.filters || {}
  for (const key of Object.keys(applied)) state[key] = applied[key]
  if (opts.sort && opts.sort.length) state.sort = opts.sort.map((s) => ({ field: s.field, direction: s.direction }))
  else delete state.sort
  return state
}

/**
 * El orden pedido por la cabecera de oj-table (ojSort: detail.header = clave de la columna,
 * detail.direction 'ascending'|'descending') → [{field, direction}] en el vocabulario del
 * server (io.mateu.uidl.data.Sort). La clave es el id del wire (listingOf la fija); si llega el
 * campo de la celda (p.ej. el UUID abreviado), se le quita el sufijo.
 */
export function listingSortOf(detail, sortFields) {
  if (!detail || !detail.header) return []
  const key = String(detail.header).replace(new RegExp('(' + UUID_CELL_SUFFIX + '|' + PRIMARY_CELL_SUFFIX + '|' + CLIP_CELL_SUFFIX + ')$'), '')
  const field = (sortFields && sortFields[key]) || key
  const direction = detail.direction === 'descending' ? 'descending' : 'ascending'
  return [{ field, direction }]
}

/**
 * La selección de la tabla, en una forma que sobrevive a un refresco: el KeySet de oj-table
 * (`detail.value.row` de ojSelectedChanged) → { all, keys, except }. Un "seleccionar todo" es
 * un KeySet de tipo addAll: todas menos las desmarcadas, no una lista de claves.
 */
export function selectionOfKeySet(keySet) {
  if (!keySet) return { all: false, keys: [], except: [] }
  if (typeof keySet.isAddAll === 'function' && keySet.isAddAll()) {
    const deleted = typeof keySet.deletedValues === 'function' ? Array.from(keySet.deletedValues()) : []
    return { all: true, keys: [], except: deleted }
  }
  const values = typeof keySet.values === 'function' ? Array.from(keySet.values()) : []
  return { all: false, keys: values, except: [] }
}

/** Las filas marcadas, resueltas contra las filas ACTUALES por su clave (_rowNumber). Lo que se
 *  manda es la fila tal como llegó: el badge precomputado de las columnas @Status no viaja. */
export function selectedRowsOf(rows, selection) {
  if (!selection) return []
  const picked = selection.all
    ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
    : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
  return picked.map((row) => {
    const out = {}
    for (const key of Object.keys(row)) {
      const value = row[key]
      if (key.endsWith(UUID_CELL_SUFFIX) || key.endsWith(CLIP_CELL_SUFFIX)) {
        continue
      }
      if (value && typeof value === 'object' && !Array.isArray(value) && 'badgeClass' in value) {
        const { badgeClass, ...rest } = value
        out[key] = rest
      } else {
        out[key] = value
      }
    }
    return out
  })
}

/** El componentState de una acción del host de un listado con selección: lleva las filas
 *  marcadas en crud_selected_items, como Vaadin. Sin listado o sin selección, intacto. */
export function withListingSelection(componentState, listing, rows, selection) {
  if (!listing || !listing.rowsSelectionEnabled) return componentState
  return Object.assign({}, componentState, { crud_selected_items: selectedRowsOf(rows, selection) })
}

// filas con columnas @Status: al valor {type, message} se le estampa la clase badge de
// JET (Redwood, sistema) — el template de celda no puede mapear (CSP sin ternarios)
export const STATUS_BADGE = {
  SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
  WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
  DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
  INFO: 'oj-badge oj-badge-info oj-badge-subtle',
  NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const UUID_CELL_SUFFIX = '__uuidCell'

/** "…-<último bloque>" de un UUID canónico; cualquier otro valor, tal cual. */
export function abbreviateUuid(value) {
  return typeof value === 'string' && UUID.test(value)
    ? '…-' + value.substring(value.lastIndexOf('-') + 1)
    : value
}

// las columnas de TEXTO (sin plantilla propia, ni editables) con algún valor que es un UUID entero
export function uuidColumnIds(rows, columns) {
  return columns
    .map((col) => col.metadata || col)
    .filter((c) => !c.editable && (!c.dataType || c.dataType === 'string'))
    .filter((c) => rows.some((row) => typeof row[c.id] === 'string' && UUID.test(row[c.id])))
    .map((c) => c.id)
}

// filas con columnas de UUID: a cada una se le añade <id>__uuidCell = {text, full}, que es lo que
// pinta la celda; el valor original de la fila queda intacto (navegación, acciones, selección)
export function uuidCellRows(rows, columns) {
  const ids = uuidColumnIds(rows, columns)
  if (!ids.length) return rows
  return rows.map((row) => {
    const out = { ...row }
    for (const id of ids) {
      const value = row[id] == null ? '' : String(row[id])
      out[id + UUID_CELL_SUFFIX] = { text: abbreviateUuid(value), full: value }
    }
    return out
  })
}

export const PRIMARY_CELL_SUFFIX = '__primary'

/** La celda (de la columna técnica ROW_LINES_COLUMN) que pinta las líneas extra de cada fila. */
export const ROW_LINES_FIELD = '__rowLines'

export const ROW_LINES_COLUMN = {
  id: ROW_LINES_FIELD,
  field: ROW_LINES_FIELD,
  headerText: '',
  template: 'cellLines',
  sortable: 'disabled',
  className: 'mateu-row-lines-cell',
  headerClassName: 'mateu-row-lines-cell',
  width: '1px',
  minWidth: '1px',
  maxWidth: '1px',
}

/** La línea (1-based) de una columna: su `line` si es > 1; si no, 1. */
export function lineOfColumn(c) {
  const line = c && typeof c.line === 'number' ? c.line : 0
  return line > 1 ? Math.floor(line) : 1
}

/** Reparte las columnas del wire por línea: {first: las de la línea 1, extra: [[línea 2], [línea 3]…]}
 *  en el orden del wire (las líneas vacías no cuentan). Sin @Line, extra = [] y nada cambia. */
export function rowLinesSplit(columns) {
  const first = []
  const byLine = new Map()
  for (const col of columns || []) {
    const c = col.metadata || col
    const line = c.type === 'GridGroupColumn' ? 1 : lineOfColumn(c)
    if (line === 1) first.push(col)
    else {
      if (!byLine.has(line)) byLine.set(line, [])
      byLine.get(line).push(col)
    }
  }
  return { first, extra: [...byLine.keys()].sort((a, b) => a - b).map((k) => byLine.get(k)) }
}

/** El texto de un valor en una línea extra: un estado por su mensaje, dinero «importe moneda». */
export function lineValueText(v) {
  if (v == null) return ''
  if (Array.isArray(v)) return v.map(lineValueText).filter(Boolean).join(', ')
  if (typeof v === 'object') {
    if (v.message !== undefined) return String(v.message == null ? '' : v.message)
    if (v.amount !== undefined) return [v.amount, v.currency].filter((x) => x != null).join(' ')
    return String(v.label || v.text || v.name || '')
  }
  if (typeof v === 'boolean') return v ? '✓' : '✗'
  return String(v)
}

/** A cada fila, <ROW_LINES_FIELD> = {lines: [{key, pairs: [{key, label, text, cls}]}]}: lo que pinta
 *  la plantilla cellLines (CSP de VB: precomputado). Un estado lleva su badge (cls). */
export function rowLinesRows(rows, extra) {
  if (!extra || !extra.length) return rows
  const lines = extra.map((line) => line.map((col) => col.metadata || col))
  return rows.map((row) => ({
    ...row,
    [ROW_LINES_FIELD]: {
      lines: lines.map((cols, i) => ({
        key: 'l' + (i + 2),
        pairs: cols.map((c) => {
          const v = row[c.id]
          return {
            key: c.id,
            label: c.label || c.id,
            text: lineValueText(v),
            cls: (v && typeof v === 'object' && v.badgeClass) || '',
          }
        }),
      })),
    },
  }))
}

export const CLIP_CELL_SUFFIX = '__clipCell'

/** El ancho que el wire pide para una columna (GridColumn.width / flexGrow), en las claves de
 *  oj-table: width (y, si no crece — flexGrow "0" —, minWidth = maxWidth = width). Sin width, {}. */
export function columnWidthOf(c) {
  const width = c && typeof c.width === 'string' ? c.width.trim() : (c && typeof c.width === 'number' ? c.width + 'px' : '')
  if (!width || width === 'auto') return {}
  return String(c.flexGrow) === '0'
    ? { width, minWidth: width, maxWidth: width }
    : { width, minWidth: width }
}

// una columna de TEXTO con ancho fijo (flexGrow 0) o con tooltip: su celda se corta con elipsis
// y el texto entero (o el del campo tooltipPath) va al title
export function clipColumn(c) {
  return !c.editable && c.dataType !== 'actionGroup' && c.dataType !== 'status' && c.stereotype !== 'primary'
    && (!!c.tooltipPath || (!!columnWidthOf(c).maxWidth))
}

/** A cada columna recortable se le añade <id>__clipCell = {text, title, cls}: lo que pinta la celda
 *  (CSP de VB: la plantilla no puede leer un campo variable de la fila). La fila queda intacta. */
export function clipCellRows(rows, columns) {
  const cols = (columns || []).map((c) => c.metadata || c).filter(clipColumn)
  if (!cols.length) return rows
  const text = (v) => (v == null ? '' : (typeof v === 'object' ? (v.message || v.text || v.label || '') : String(v)))
  return rows.map((row) => {
    const out = { ...row }
    for (const c of cols) {
      const shown = text(row[c.id])
      // tooltipPath a OTRO campo (@Tooltip): un detalle → la ventana flotante; a sí mismo (un ancho
      // fijo que corta): el texto entero en el title de siempre
      const tip = c.tooltipPath && c.tooltipPath !== c.id ? text(row[c.tooltipPath]) : ''
      // solo la columna de ancho fijo se corta; con tooltipPath y sin ancho, el texto sigue entero
      // con @Tooltip(otro campo) el detalle sale en la ventana flotante (hover.mjs), no en el title
      // del navegador: varias líneas y estilo Redwood; sin él, el title enseña lo que se corta
      out[c.id + CLIP_CELL_SUFFIX] = { text: shown, title: tip ? '' : shown, hover: tip, cls: columnWidthOf(c).maxWidth ? 'mateu-cell-clip' : '' }
    }
    return out
  })
}

/** La celda de cada columna principal: {title, caption, leading} (vacíos si no hay). */
export function primaryCellRows(rows, columns) {
  const cols = (columns || []).map((c) => c.metadata || c).filter((c) => c.stereotype === 'primary')
  if (!cols.length) return rows
  const text = (v) => (v == null ? '' : String(v))
  return rows.map((row) => {
    const out = { ...row }
    for (const c of cols) {
      out[c.id + PRIMARY_CELL_SUFFIX] = {
        title: text(row[c.id]),
        caption: c.captionPath ? text(row[c.captionPath]) : '',
        leading: c.leadingPath ? text(row[c.leadingPath]) : '',
      }
    }
    return out
  })
}

export function statusBadgeRows(rows, columns) {
  const statusCols = columns
    .map((col) => col.metadata || col)
    .filter((c) => c.dataType === 'status')
    .map((c) => c.id)
  if (!statusCols.length) return rows
  return rows.map((row) => {
    const out = { ...row }
    for (const id of statusCols) {
      const value = out[id]
      if (value && typeof value === 'object') {
        out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
      }
    }
    return out
  })
}

/**
 * TODOS los filtros que declara el listado, cada uno ya resuelto al widget que le toca.
 *
 * Antes sólo salían los de opciones, y sólo el primero: un listado con un booleano, un
 * lookup, un enum y dos fechas mostraba una tira de chips sueltos con los valores del enum
 * —sin decir siquiera de qué campo eran— y los otros cuatro filtros no existían para el
 * usuario. En el renderer Vaadin salen los cinco.
 *
 * El `kind` se PRECOMPUTA aquí porque las plantillas de VB corren bajo CSP y no pueden
 * evaluar expresiones; el orden de resolución es el mismo que el de la barra compartida
 * (rango → multi → opciones → booleano → texto), para que un mismo listado ofrezca lo
 * mismo en los dos renderers.
 */
export function filtersOf(ctx) {
  const found = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    for (const f of ((node.metadata || {}).filters) || []) {
      // un filtro readOnly es el ÁMBITO del listado (el :id del maestro que lo contiene, el
      // contexto de un @Subresource): lo fija la ruta, no es una condición que el usuario quite
      if (f.readOnly) continue
      found.push(filterDescriptorOf(f, ctx && ctx.data))
    }
    ;(node.children || []).forEach(walk)
  }
  walk(ctx && ctx.tree)
  return found
}

export function filterDescriptorOf(f, data) {
  // un filtro @Lookup trae sus opciones por su búsqueda (search-<campo>, bridge.loadLookups):
  // llegan a data[campo] como las de un campo del formulario
  const options = optionsOf(f, data).map((o) => ({ value: o.value, label: o.label || o.value }))
  // 'bool' lo emite el server Java y 'boolean' el .NET
  const isBool = f.dataType === 'bool' || f.dataType === 'boolean'
    || f.stereotype === 'checkbox' || f.stereotype === 'toggle'
  const isNumeric = ['integer', 'decimal', 'number', 'money'].indexOf(f.dataType) >= 0
  let kind
  if (f.stereotype === 'dateRange' || f.stereotype === 'numberRange') kind = 'range'
  else if (f.stereotype === 'multiSelect') kind = 'multi'
  else if (options.length) kind = 'options'
  else if (isBool) kind = 'bool'
  else kind = 'text'
  return {
    fieldId: f.fieldId,
    label: f.label || f.fieldId,
    kind,
    options,
    // el tipo del <input> de los kinds 'range' y 'text' (una fecha se teclea fatal como texto)
    inputType: f.stereotype === 'dateRange'
      ? (f.dataType === 'dateTime' ? 'datetime-local' : 'date')
      : (f.stereotype === 'numberRange' || isNumeric) ? 'number' : 'text',
    isRange: kind === 'range',
    isMulti: kind === 'multi',
    isOptions: kind === 'options',
    isBool: kind === 'bool',
    isText: kind === 'text',
    fromKey: f.fieldId + '_from',
    toKey: f.fieldId + '_to',
  }
}

/**
 * Los filtros como CHIPS: uno por filtro, aplicado o no.
 *
 * Uno por FILTRO y no uno por valor posible, que es lo que se pintaba antes: los ocho
 * estados de un enum salían como ocho chips sueltos, sin decir de qué campo eran, y ocupando
 * la fila entera que debían compartir los otros cuatro filtros. Un chip sin aplicar abre su
 * editor; uno aplicado enseña el valor y se quita por la ✕.
 *
 * `keys` son las claves de estado que hay que borrar para quitarlo — un rango ocupa dos, y
 * quitarlo a medias deja el listado filtrado por algo que ya no se ve.
 */
export function filterChipsOf(filters, values) {
  const v = values || {}
  const chips = (filters || []).map((f) => {
    if (f.isRange) {
      const from = v[f.fromKey]
      const to = v[f.toKey]
      const applied = !isBlank(from) || !isBlank(to)
      const text = !applied ? ''
        : isBlank(from) ? '≤ ' + to
        : isBlank(to) ? '≥ ' + from
        : from + ' → ' + to
      return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fromKey, f.toKey] }
    }
    const value = v[f.fieldId]
    const applied = !isBlank(value)
    let text = ''
    if (applied) {
      if (f.isMulti) {
        const selected = Array.isArray(value) ? value : String(value).split(',')
        text = selected.map((s) => labelOfOption(f, s)).join(', ')
      } else if (f.isBool) {
        text = (value === true || value === 'true') ? 'Yes' : 'No'
      } else if (f.isOptions) {
        text = labelOfOption(f, value)
      } else {
        text = String(value)
      }
    }
    return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fieldId] }
  })
  // la selección por ids (?ids=…): sólo cuando está aplicada — no es un filtro que se ofrezca
  if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
    chips.unshift({ fieldId: IDS_PARAM, label: 'Ids', text: idsChipLabelOf(v[IDS_PARAM]), applied: true, keys: [IDS_PARAM] })
  }
  return chips
}

/**
 * Los filtros que trae la query de una ruta (`integration=MRU01&status=PROPOSED,APPROVED`) →
 * { campo: valor }. Todos los parámetros, decodificados (`+` es un espacio, como en un
 * formulario); los vacíos no filtran, ni la página ni el orden. Un multi-select toma la lista separada por comas
 * (multiValuesOf), igual que la escribe Vaadin en la URL.
 */
/**
 * Una navegación pedida (ruta con o sin ?query) frente a la que hay en pantalla. `full` (ruta +
 * query) es lo que la identifica — el id de la entrada del menú, la URL —; `filters` son
 * EXACTAMENTE los de su query: ninguno si no trae (ir a /reservas desde /reservas?vista=… quita el
 * filtro). `same` = es la que ya hay (el eco del writeback de la selección del menú): no recargar.
 */
export function navTargetOf(requested, currentFull) {
  const raw = String(requested || '')
  const q = raw.indexOf('?')
  const route = q >= 0 ? raw.slice(0, q) : raw
  const query = q >= 0 ? raw.slice(q + 1) : ''
  const full = query ? route + '?' + query : route
  return { route, full, filters: queryFiltersOf(query), same: full === (currentFull || '') }
}

export function queryFiltersOf(query) {
  const out = {}
  const text = String(query || '').replace(/^\?/, '')
  if (!text) return out
  for (const part of text.split('&')) {
    const eq = part.indexOf('=')
    if (eq <= 0) continue
    const decode = (v) => {
      try { return decodeURIComponent(v.replace(/\+/g, ' ')) } catch (e) { return v }
    }
    const key = decode(part.slice(0, eq))
    const value = decode(part.slice(eq + 1))
    if (key && value !== '' && !PAGING_PARAMS[key]) out[key] = value
  }
  return out
}

// la página y el orden también viajan en la URL de un listado de Vaadin, pero no son filtros
export const PAGING_PARAMS = { page: true, size: true, sort: true }

// ── Filtros por URL: los declarados, el texto libre y la selección por ids ─────────────────────
// Cualquier filtro declarado de un listado se pone desde la URL con su nombre de campo (un rango,
// con <campo>_from / <campo>_to; un multi-select, separado por comas). Además, dos que no declara
// nadie: el texto libre (`searchText`, o `q` como alias al leer) y `ids`, la SELECCIÓN — un
// conjunto concreto de filas por su id (`?ids=4MBZS7,JXD3G6`), que el framework aplica en el
// server a cualquier listado. Todos salen como chips que se quitan, y la URL los refleja.

/** El filtro reservado de la selección por ids (lo aplica el server, ningún listado lo declara). */
export const IDS_PARAM = 'ids'

export function idsTextsOf(lang) {
  const l = chromeLanguage(lang)
  return { few: chromeText('idsFew', null, l), many: (n) => chromeText('idsMany', { n }, l) }
}

/** El rótulo del chip de la selección: los ids si son pocos (≤3), si no cuántos son. */
export function idsChipLabelOf(ids, lang) {
  const list = multiValuesOf(ids)
  const texts = idsTextsOf(lang)
  return list.length <= 3 ? texts.few + list.join(', ') : texts.many(list.length)
}

/**
 * Los filtros de una query (queryFiltersOf) separados en el texto libre y el resto: `searchText`
 * (o su alias `q`, si no viene searchText) es lo que se busca, no un filtro — va al chip keyword.
 */
export function splitListingQuery(filters) {
  const values = Object.assign({}, filters || {})
  let searchText = ''
  if (!isBlank(values.searchText)) searchText = String(values.searchText)
  else if (!isBlank(values.q)) searchText = String(values.q)
  delete values.searchText
  delete values.q
  return { searchText, values }
}

/**
 * La query que refleja los filtros aplicados de un listado (sin '?'): cada valor con su clave, las
 * listas separadas por comas (como las escribe Vaadin), el texto libre como `searchText`. Las comas
 * se dejan legibles; el resto, codificado.
 */
export function listingQueryOf(values, searchText) {
  const enc = (s) => encodeURIComponent(String(s)).replace(/%2C/gi, ',')
  const parts = []
  const v = values || {}
  for (const key of Object.keys(v)) {
    const value = v[key]
    if (isBlank(value) || PAGING_PARAMS[key]) continue
    parts.push(enc(key) + '=' + enc(Array.isArray(value) ? value.join(',') : value))
  }
  const text = searchText == null ? '' : String(searchText).trim()
  if (text) parts.push('searchText=' + enc(text))
  return parts.join('&')
}

/** La ruta COMPLETA (con su query) de un listado con esos filtros: lo que va a la URL. */
export function listingUrlOf(route, values, searchText) {
  const bare = String(route || '').split('?')[0]
  const query = listingQueryOf(values, searchText)
  return query ? bare + '?' + query : bare
}

export const declaresIds = (filters) => (filters || []).some((f) => f && f.fieldId === IDS_PARAM)

/** Los valores de un multi-select, que llegan como lista o como cadena separada por comas. */
export function multiValuesOf(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.map(String)
  const text = String(value).trim()
  return text === '' ? [] : text.split(',').map((s) => s.trim()).filter((s) => s)
}

// ── Filtros DENTRO de la cabecera del buscador ────────────────────────────────────────────
// Los filtros viajan por la API `smartFilters` de oj-sp-smart-filter-search, no en una fila
// propia debajo: el componente pinta su cabecera (título + buscador + filtros) y, al pie, la
// franja de color de Redwood. Una fila de filtros FUERA del componente quedaba al otro lado de
// la franja, que así parecía una ilustración suelta en mitad de la página.
//
// La API cubre todos los kinds de Mateu, cada uno con el editor que el propio componente abre
// en su popup (un oj-dynamic-form alimentado por `filtersMetadata`):
//   - `suggestionFilters`: los filtros SIN aplicar — un chip por filtro declarado bajo el
//     buscador; el componente quita de ahí los que ya están aplicados.
//   - `value`: los aplicados — chips DENTRO del campo de búsqueda, con su ✕; el texto libre
//     viaja ahí mismo como chips `keyword`.
//   - `filtersMetadata`: un JsonMetadataProvider de oj-dynamic, polimórfico por `filter` (el
//     fieldId): el editor del valor de cada filtro.

export const KEYWORD_FILTER = 'keyword'
export const BOOL_CHOICES = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]

/** El editor del valor de un filtro, en el vocabulario de oj-dynamic (lo que abre el popup). */
export function smartFilterValueMetadataOf(f) {
  const labelHint = f.label
  if (f.isRange) {
    // gte/lte oj-input-date (string) u oj-input-number (number): con esa forma exacta el
    // componente reconoce el rango y pinta el chip como "desde - hasta" formateado
    const numeric = f.inputType === 'number'
    const componentType = numeric ? 'oj-input-number'
      : f.inputType === 'datetime-local' ? 'oj-input-date-time' : 'oj-input-date'
    const type = numeric ? 'number' : 'string'
    return {
      type: 'object',
      labelHint,
      properties: {
        gte: { type, componentType, labelHint: 'Desde' },
        lte: { type, componentType, labelHint: 'Hasta' },
      },
    }
  }
  const options = (f.options || []).map((o) => ({ value: String(o.value), label: o.label }))
  if (f.isMulti) {
    return { type: 'array', items: { type: 'string' }, componentType: 'oj-checkboxset', labelHint, options }
  }
  if (f.isOptions) return { type: 'string', componentType: 'oj-select-single', labelHint, options }
  if (f.isBool) return { type: 'string', componentType: 'oj-select-single', labelHint, options: BOOL_CHOICES }
  if (f.inputType === 'number') return { type: 'number', componentType: 'oj-input-number', labelHint }
  return { type: 'string', componentType: 'oj-input-text', labelHint }
}

/**
 * `filtersMetadata` en crudo (JSON de oj-dynamic): polimórfico por `filter`, un tipo por filtro
 * declarado. El componente lo consulta con getMetadataByDiscriminator('filter', fieldId).
 */
export function smartFiltersMetadataOf(filters) {
  const polymorphicTypes = {}
  for (const f of filters || []) {
    polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
  }
  // el chip de la selección por ids también puede abrir su editor: un texto (ids separados por comas)
  if (!declaresIds(filters)) {
    polymorphicTypes[IDS_PARAM] = { type: 'object',
      properties: { value: { type: 'string', componentType: 'oj-input-text', labelHint: 'Ids' } } }
  }
  return {
    type: 'object',
    properties: { filter: { type: 'string' }, label: { type: 'string' } },
    discriminator: 'filter',
    polymorphicTypes,
  }
}

// Los de opciones llevan `filterLabel` (el nombre del campo): el componente pone en `label` la
// etiqueta de la opción elegida y el chip se lee "Vista Llegadas hoy". Un texto o un rango NO:
// con filterLabel el componente enseña la etiqueta en vez del valor tecleado.
export const usesFilterLabel = (f) => f.isOptions || f.isMulti || f.isBool

/** Los chips de `suggestionFilters`: uno por filtro declarado, sin valor. */
export function smartFilterSuggestionsOf(filters) {
  return (filters || []).map((f) => {
    const chip = { filter: f.fieldId, label: f.label }
    if (usesFilterLabel(f)) chip.filterLabel = f.label
    // el formulario del popup saca sus campos de las claves del valor: sin ellas, un rango
    // abre un popup vacío
    if (f.isRange) chip.value = { gte: null, lte: null }
    return chip
  })
}

/** El `value` del componente (los chips aplicados) a partir del estado de Mateu. */
export function smartFilterValueOf(filters, values, searchText) {
  const v = values || {}
  const out = []
  const text = searchText == null ? '' : String(searchText).trim()
  if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
  // la selección por ids: un chip más, que se quita como cualquiera (sin filterLabel: el rótulo
  // ya dice qué es)
  if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
    const ids = multiValuesOf(v[IDS_PARAM])
    if (ids.length) out.push({ filter: IDS_PARAM, label: idsChipLabelOf(ids), value: ids.join(',') })
  }
  for (const f of filters || []) {
    if (f.isRange) {
      const from = v[f.fromKey]
      const to = v[f.toKey]
      if (isBlank(from) && isBlank(to)) continue
      out.push({ filter: f.fieldId, label: f.label,
        value: { gte: isBlank(from) ? null : from, lte: isBlank(to) ? null : to } })
      continue
    }
    const value = v[f.fieldId]
    if (isBlank(value)) continue
    if (f.isMulti) {
      const selected = multiValuesOf(value)
      if (!selected.length) continue
      out.push({ filter: f.fieldId, label: labelOfOption(f, selected[0]), filterLabel: f.label, value: selected })
    } else if (f.isBool) {
      const bool = value === true || value === 'true' ? 'true' : 'false'
      out.push({ filter: f.fieldId, label: bool === 'true' ? 'Yes' : 'No', filterLabel: f.label, value: bool })
    } else if (f.isOptions) {
      out.push({ filter: f.fieldId, label: labelOfOption(f, value), filterLabel: f.label, value: String(value) })
    } else {
      out.push({ filter: f.fieldId, label: f.label, value })
    }
  }
  return out
}

/**
 * Lo inverso: los chips aplicados del componente → el texto buscado (los keywords, en orden) y
 * los valores de filtro que viajan en el componentState. Un chip recién sacado de las
 * sugerencias todavía no tiene valor: no filtra hasta que se elige uno en su popup.
 */
export function filterStateOfSmartFilters(filters, chips) {
  const byId = {}
  for (const f of filters || []) byId[f.fieldId] = f
  const values = {}
  const keywords = []
  for (const chip of chips || []) {
    if (!chip) continue
    if (chip.filter === KEYWORD_FILTER) {
      if (!isBlank(chip.value)) keywords.push(String(chip.value))
      continue
    }
    if (chip.filter === IDS_PARAM && !byId[IDS_PARAM]) {
      const ids = multiValuesOf(chip.value)
      if (ids.length) values[IDS_PARAM] = ids.join(',')
      continue
    }
    const f = byId[chip.filter]
    if (!f) continue
    if (f.isRange) {
      const range = chip.value || {}
      if (!isBlank(range.gte)) values[f.fromKey] = range.gte
      if (!isBlank(range.lte)) values[f.toKey] = range.lte
    } else if (f.isMulti) {
      const selected = multiValuesOf(chip.value)
      if (selected.length) values[f.fieldId] = selected
    } else if (!isBlank(chip.value)) {
      values[f.fieldId] = chip.value
    }
  }
  return { searchText: keywords.join(' '), values }
}

/**
 * Las sugerencias que tocan para un fetch del componente: fuera las de los filtros ya
 * aplicados (el criterio trae `{op:'$ne', value:{filters}}`) y, si hay texto, las que no lo
 * contienen. Es el contrato del SuggestionFiltersDataProvider de oj-sp, que es REST; aquí las
 * sugerencias son locales.
 */
export function suggestionRowsFor(rows, criterion) {
  const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
  let applied = []
  let text = ''
  for (const c of parts) {
    if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
    if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
  }
  const taken = applied.map((a) => a && a.filter)
  return (rows || [])
    .filter((r) => taken.indexOf(r.filter) < 0)
    .filter((r) => !text || String(r.filterLabel || r.label).toLowerCase().indexOf(text) >= 0)
}

/** Un DataProvider (la parte que usa oj-sp-smart-filters) sobre las sugerencias locales. */
export function suggestionFiltersProviderOf(rows) {
  const all = rows || []
  const block = (data, params) => ({
    done: true,
    value: { data, metadata: data.map((r) => ({ key: r.filter })), fetchParameters: params },
  })
  return {
    fetchFirst(params) {
      const data = suggestionRowsFor(all, params && params.filterCriterion)
      return { [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(block(data, params)) }) }
    },
    fetchByKeys(params) {
      const results = new Map()
      for (const key of (params && params.keys) || []) {
        const row = all.filter((r) => r.filter === key)[0]
        if (row) results.set(key, { data: row, metadata: { key } })
      }
      return Promise.resolve({ fetchParameters: params, results })
    },
    containsKeys(params) {
      const results = new Set()
      for (const key of (params && params.keys) || []) {
        if (all.some((r) => r.filter === key)) results.add(key)
      }
      return Promise.resolve({ containsParameters: params, results })
    },
    getCapability() { return null },
    getTotalSize() { return Promise.resolve(all.length) },
    isEmpty() { return all.length ? 'no' : 'yes' },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true },
  }
}

/**
 * Las filas del DESPLEGABLE del buscador (la propiedad `suggestions` de oj-sp-smart-filters, un
 * SmartSuggestionChipsDataProvider): una por filtro declarado, cada una con su chip. Al entrar en
 * el campo el componente las abre en su popup bajo la caja; elegir una aplica ese filtro y, como
 * es un chip complejo, abre su editor (oj-dynamic, filtersMetadata) — el mismo editor que los chips.
 * `category: 'suggestion'` es el icono de caja del componente (los otros son historial y texto).
 */
export function smartFilterDropdownRowsOf(filters) {
  return smartFilterSuggestionsOf(filters).map((chip) => ({ id: chip.filter, category: 'suggestion', chips: [chip] }))
}

/** Las filas del desplegable que tocan: fuera los filtros ya aplicados y, si hay texto, las que no lo contienen. */
export function dropdownRowsFor(rows, criterion) {
  const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
  let applied = []
  let text = ''
  for (const c of parts) {
    if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
    if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
  }
  const taken = applied.map((a) => a && a.filter)
  return (rows || [])
    .filter((r) => taken.indexOf(r.id) < 0)
    .filter((r) => !text || r.chips.some((chip) => String(chip.filterLabel || chip.label).toLowerCase().indexOf(text) >= 0))
}

/** Un DataProvider (lo que usa el popup del buscador) sobre las filas locales del desplegable. */
export function suggestionsProviderOf(rows) {
  const all = rows || []
  return {
    // como un ArrayDataProvider de JET: un bloque con las filas (done: false) y después el final
    // vacío (done: true). Un único bloque ya «done» lo pinta bien el primer fetch, pero al
    // refiltrar el oj-list-view del popup conservaba las filas de antes con el dato nuevo
    fetchFirst(params) {
      const data = dropdownRowsFor(all, params && params.filterCriterion)
      return {
        [Symbol.asyncIterator]: () => {
          let sent = false
          return {
            next: () => {
              const rowsNow = sent ? [] : data
              const done = sent
              sent = true
              return Promise.resolve({ done, value: { data: rowsNow, metadata: rowsNow.map((r) => ({ key: r.id })), fetchParameters: params } })
            },
          }
        },
      }
    },
    fetchByKeys(params) {
      const results = new Map()
      for (const key of (params && params.keys) || []) {
        const row = all.filter((r) => r.id === key)[0]
        if (row) results.set(key, { data: row, metadata: { key } })
      }
      return Promise.resolve({ fetchParameters: params, results })
    },
    containsKeys(params) {
      const results = new Set()
      for (const key of (params && params.keys) || []) {
        if (all.some((r) => r.id === key)) results.add(key)
      }
      return Promise.resolve({ containsParameters: params, results })
    },
    fetchByOffset(params) {
      const data = dropdownRowsFor(all, params && params.filterCriterion)
      const offset = (params && params.offset) || 0
      const size = params && params.size > 0 ? params.size : data.length
      const slice = data.slice(offset, offset + size)
      return Promise.resolve({
        done: offset + size >= data.length,
        fetchParameters: params,
        results: slice.map((r) => ({ data: r, metadata: { key: r.id } })),
      })
    },
    // el filtrado lo hace el propio provider (texto + aplicados): el ListDataProviderView del
    // componente se lo pasa tal cual
    getCapability(name) { return name === 'filter' ? { operators: ['$and', '$ne'], textFilter: {} } : null },
    // el total depende del filtro: «desconocido» (-1). Con el de todas las filas, el oj-list-view
    // del popup pintaba seis veces «Business key» al teclear «busi»
    getTotalSize() { return Promise.resolve(-1) },
    isEmpty() { return all.length ? 'no' : 'yes' },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true },
  }
}

// el JsonMetadataProvider de oj-dynamic: lo pone el módulo AMD (el core no depende de JET)
export let metadataProviderFactory = null
export function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

/**
 * La configuración ENTERA de `smart-filters` para un listado: el desplegable de filtros, los
 * aplicados y el editor de cada filtro. Sin filtros declarados, sólo el buscador de texto.
 *
 * Los filtros sin aplicar se ofrecen en el DESPLEGABLE que abre el buscador al entrar en él
 * (`suggestions`), no como una fila de botones bajo la caja (`suggestionFilters`, lo que hubo
 * desde 8af850e63): el buscador del listado vuelve a ser una caja con su menú de filtros.
 */
export async function smartFiltersOf(filters, values, searchText) {
  const config = { askHint: chromeText('search'), value: smartFilterValueOf(filters, values, searchText) }
  const hasIds = !isBlank((values || {})[IDS_PARAM])
  if ((!filters || !filters.length) && !hasIds) return config
  // sin filtros declarados pero con selección por ids: el chip necesita su metadata, no sugerencias
  if (filters && filters.length) {
    config.suggestions = suggestionsProviderOf(smartFilterDropdownRowsOf(filters))
  }
  if (metadataProviderFactory) {
    config.filtersMetadata = await metadataProviderFactory(smartFiltersMetadataOf(filters))
  }
  return config
}

export function labelOfOption(filter, value) {
  const hit = (filter.options || []).filter((o) => String(o.value) === String(value))[0]
  return hit ? hit.label : String(value)
}

export function isBlank(value) {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  return String(value).trim() === ''
}
