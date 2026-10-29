import { applyColumnPrefs } from '../prefs.mjs'
import { walkWithinSurface } from './tree.mjs'
import { dragMimeOf } from './atoms.mjs'
import { buttonRouteOf, columnPrefsReader, islandContentOf } from './content.mjs'
import { optionsOf } from './rowEditor.mjs'
import { aggregateFootersOf, groupedRows, toneRows } from './boards.mjs'
import { chromeText, chromeLanguage, moneyText } from '../i18n.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): listings: the table, paging, sort, selection, filters and the smart search bar.

/** RENDER helper: first node of the tree with the given metadata.type. */
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

/** First node of the SURFACE (without crossing islands) that satisfies `test`; null if none. */
export function findFirst(tree, test) {
  let found = null
  walkWithinSurface(tree, (n) => { if (!found && test(n)) found = n })
  return found
}

/** Projection of the LISTING (Crud component): columns + rows (from the data axis) + search.
 *  null if the context contains no Crud. Rows arrive through the 'search' action
 *  (OnLoad trigger) as a data-only fragment: data.crud.page.content. */
/**
 * The host's listing ready to paint. `allColumns` are all those on the wire (the columns
 * dialog starts from them) and `columns` the ones painted, with the user's preferences applied
 * (prefs.mjs: hidden ones out, in their order) — read by columnPrefsReader (localStorage per route).
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
  return { ...listing, allColumns: listing.columns, columns: finishColumnSizing(applyColumnPrefs(listing.columns, prefs), listing.fitColumns),
    headerBlocks: preSearch ? header.concat(preSearch) : header,
    showPreSearch: !!preSearch,
    // the card grid shows unless the pre-search blocks stand in for the results (like the table)
    showCards: listing.cardLayout && !preSearch,
    ...(preSearch ? {
      tableClass: listing.tableClass + ' oj-helper-hidden',
      paging: { ...listing.paging, visible: false },
    } : {}),
  }
}

/**
 * Whether a plain click on a row of this listing opens its record (the crud's `view` action). Only
 * when the listing says so: its first column carries the `view` action (`navigable`, which the
 * server leaves out for `@NotNavigable` and for listings without a way into a record). A listing
 * that does not — a status board you select rows on, a report — keeps the click for itself, like
 * the web renderer, instead of asking the server for a record page it did not offer.
 */
export function rowClickOpensRecord(listing) {
  return !listing || listing.navigable !== false
}

/**
 * Whole-row click (decision U1, the same rule as libs/mateu rowOpen.ts): a navigable row opens its
 * record wherever it is clicked, EXCEPT on the cells that have a click of their own — inline
 * editors, buttons, links, menus, action groups, components, any column with its own actionId (not
 * the row-open `view`). Those columns carry NO_OPEN_CELL_CLASS on their cells (oj-table column
 * className), and a click inside one never opens the row.
 */
export const NO_OPEN_CELL_CLASS = 'mateu-cell-noopen'
const DISPLAY_DATA_TYPES = ['action', 'actionGroup', 'menu', 'component', 'link', 'button']
const DISPLAY_STEREOTYPES = ['button', 'link', 'html']
export function isDisplayColumn(c) {
  if (!c) return true
  if (c.editable) return true
  if (c.dataType && DISPLAY_DATA_TYPES.indexOf(c.dataType) >= 0) return true
  if (c.stereotype && DISPLAY_STEREOTYPES.indexOf(c.stereotype) >= 0) return true
  if (c.actionId && c.actionId !== 'view') return true
  return false
}

/** What a click inside the table must never turn into a row open: a control (button, link,
 *  input, the selection checkbox, an editor) or a cell of a display column. */
export const ROW_CLICK_EXCLUDED = '.' + NO_OPEN_CELL_CLASS + ', [data-method], oj-button, oj-c-button, button, a, input, select, textarea, label, '
  + 'oj-selector, oj-c-selector, oj-checkboxset, [role="checkbox"], [role="button"], [role="link"], [role="menuitem"], '
  + 'oj-input-text, oj-input-number, oj-switch, oj-select-single, oj-c-select-single, oj-menu-button, oj-c-menu-button'

/** Whether a row action that started on `origin` (the original event target) is the ROW's — a
 *  click on a plain cell — rather than a control's or a display column's. `row` is the element
 *  that IS the row when it is itself a control (a listing card is an oj-action-card, role=button):
 *  only a control INSIDE it keeps the click for itself, not the card or what wraps it. */
export function rowActionIsRows(origin, row) {
  if (!origin || typeof origin.closest !== 'function') return true
  const control = origin.closest(ROW_CLICK_EXCLUDED)
  if (!control) return true
  return !!row && (control === row || (typeof control.contains === 'function' && control.contains(row)))
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
  // kind island: as host content the first EmptyState is the page's own one, and skipped
  const blocks = islandContentOf({ ...ctx, kind: 'island', tree: { type: 'ClientSide', id: '_listingPreSearch', metadata: { type: 'VerticalLayout' }, children: pre } }) || []
  const out = blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12', preSearch: true }))
  return out.length ? out : null
}

/** The HEADER components of the listing page (HeaderSupplier → Page.metadata.header)
 *  as atom blocks: the listing has no content of its own to put them in. */
/** The siblings that precede the first node of `type` in its parent (none when it is the root or
 *  inside a Page — a Page's own header is metadata.header). */
function siblingsBefore(tree, type) {
  let out = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return false
    const kids = n.children || []
    const i = kids.findIndex((k) => k && k.metadata && k.metadata.type === type)
    if (i >= 0) {
      if (!(n.metadata && n.metadata.type === 'Page')) out = kids.slice(0, i)
      return true
    }
    return kids.some(walk)
  }
  walk(tree)
  return out
}

export function listingHeaderBlocksOf(ctx) {
  const pageNode = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  const declared = pageNode && pageNode.metadata && Array.isArray(pageNode.metadata.header) ? pageNode.metadata.header : []
  // …and what a composed page puts BEFORE its listing (the HeroSearch hero): the listing page
  // paints only the table, so it was lost. The SmartSearchPage intro line is the subtitle instead.
  const before = ctx && ctx.tree ? siblingsBefore(ctx.tree, 'Crud')
    .filter((n) => !(n.id === 'page-subtitle' && n.metadata && n.metadata.type === 'Text')) : []
  const header = [...declared, ...before]
  if (!header.length) return []
  const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_listingHeader', metadata: { type: 'VerticalLayout' }, children: header } }) || []
  return blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12' }))
}

export function listingBaseOf(ctx, opts = {}) {
  const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
  if (!crudNode) return null
  // column groups flattened to their leaf columns (leafColumnsOf): from here on a listing only
  // ever sees plain columns
  const md = { ...crudNode.metadata, columns: leafColumnsOf(crudNode.metadata.columns) }
  const page = (((ctx.data || {}).crud || {}).page) || {}
  // MULTI-LINE ROWS (@Line → GridColumn.line): the line-1 columns are the table's
  // (header, sort, widths); the rest are painted BELOW each row, full width, as secondary
  // «Label: value» pairs — see rowLinesOf / the cellLines template
  const lines = rowLinesSplit(md.columns || [])
  const tableColumns = lines.extra.length ? lines.first : (md.columns || [])
  // what each cell PAINTS (labels, badges, clipped/abbreviated text), before group rows are
  // interleaved: the content a compact column is sized to (columnSizingOf)
  const cellRows = labelCellRows(clipCellRows(primaryCellRows(uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []), md.columns || []), md.columns || []), md.columns || [])
  const footers = aggregateFootersOf(md, (ctx.data || {}).crud) || {}
  // the columns sized by the DEFAULT rule (they declare no width/flexGrow): id → their compact
  // width (fit) — finishColumnSizing lets them grow when no other column does
  const fitColumns = {}
  const defaultSized = []
  const columns = tableColumns.map((col) => {
    const c = col.metadata || col
    const def = { headerText: c.label || c.id, field: c.id }
    // editable cell → editor template per type (always visible, commit per cell:
    // the contract is update-row + parameters._editedRow; fixtures/real/update-row.json)
    if (c.editable && c.editorType) {
      def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
        : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
          : 'cellEditText'
    }
    // per-row ACTIONS (ColumnActionGroup): buttons that dispatch
    // action-on-row-<method> with the row's id (Listing.handleActionOnRow)
    if (c.dataType === 'actionGroup') {
      def.template = 'cellRowActions'
      def.headerText = ''
      def.sortable = 'disabled'
    }
    // the column key = the wire id: ojSort returns it and it is what the server
    // sorts by (the cell may read another field, e.g. the abbreviated UUID)
    def.id = c.id
    // totals footer (@Aggregate): the footerTotal template reads totals[columnKey]
    if (aggregateFootersOf(md, (ctx.data || {}).crud)) def.footerTemplate = 'footerTotal'
    // STATUS as a badge (@Status): the cell value is {type, message} — the badge's JET
    // class is precomputed on the rows (statusBadgeRows, CSP without ternaries)
    if (c.dataType === 'status') {
      def.template = 'cellStatusBadge'
    }
    // PRIMARY COLUMN (@PrimaryColumn: stereotype 'primary'): image before the title
    // (leadingPath, e.g. the guest's flag) and a caption line below (captionPath) —
    // row fields that are not columns. Precomputed per row in primaryCellRows (CSP).
    if (!def.template && c.stereotype === 'primary') {
      def.field = c.id + PRIMARY_CELL_SUFFIX
      def.template = 'cellPrimary'
    }
    // Abbreviated UUID: a text column whose values are UUIDs is painted "…-<last block>"
    // with the whole UUID in the tooltip. The row does NOT change: the cell reads a separate field,
    // precomputed in uuidCellRows (VB CSP: the template cannot trim the text).
    if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
      def.field = c.id + UUID_CELL_SUFFIX
      def.template = 'cellUuid'
    }
    const align = alignOf(c)
    if (align && !def.template) {
      def.className = 'oj-helper-text-align-' + align
      def.headerClassName = 'oj-helper-text-align-' + align
      def.footerClassName = 'oj-helper-text-align-' + align
    }
    if (!def.template && clipColumn(c)) {
      def.field = c.id + CLIP_CELL_SUFFIX
      def.template = 'cellClip'
    }
    // an enum is read by its label («In house», not IN_HOUSE): the cell reads <id>__labelCell
    if (!def.template && labelColumn(c)) {
      def.field = c.id + LABEL_CELL_SUFFIX
    }
    // column WIDTH. A DECLARED width (@ColumnWidth: width + flexGrow "0" + tooltipPath on the
    // wire, the same contract Vaadin's gridRenderer applies) wins: oj-table fixes that width; with
    // flexGrow 0 the column does not grow (min = max = width) and its text is clipped with an
    // ellipsis, whole in the tooltip (tooltipPath). A column that declares none is sized by the
    // DEFAULT rule (columnSizingOf): compact types fit their content, text columns share the rest.
    // (after the cell's field is final: it is what the content is read from)
    const sizing = columnSizingOf(c, cellRows, def.field, footers[c.id])
    Object.assign(def, sizing.def)
    if (sizing.kind !== 'declared') defaultSized.push(c.id)
    if (sizing.kind === 'fit') fitColumns[c.id] = sizing.px
    // WHOLE-ROW CLICK: a cell with its own click (editor, buttons, link, menu, component,
    // column with its own action) carries the class mateuRowClicked respects — see isDisplayColumn
    if (isDisplayColumn(c)) def.className = (def.className ? def.className + ' ' : '') + NO_OPEN_CELL_CLASS
    return def
  }).concat(lines.extra.length ? [ROW_LINES_COLUMN] : [])
  return {
    // PAGINATION: the page the server sent (Page: pageNumber/pageSize/totalElements) →
    // table footer with the range and the controls; precomputed (VB CSP)
    paging: listingPagingOf(page, md.pageSize || 20, opts.lang),
    title: md.title || '',
    subtitle: md.subtitle || '',
    // @RowRoute / Listing.rowRoute: a row OPENS a route (a record's master) — see rowRouteOf
    rowRoute: md.rowRoute || '',
    searchable: !!md.searchable,
    pageSize: md.pageSize || 20,
    emptyStateMessage: md.emptyStateMessage || 'No data.',
    columns: finishColumnSizing(columns, fitColumns),
    fitColumns,
    defaultSizedColumns: defaultSized,
    // oj-table `layout`: 'fixed' sizes the columns by our widths/weights (and fills the width);
    // a table whose every column declares its width keeps JET's default, 'contents', as before
    tableLayout: defaultSized.length ? 'fixed' : 'contents',
    // gridLayout = cards: a responsive grid of CARDS instead of the table (the web renderer's
    // card grid) — the cards are precomputed per row (VB CSP); see listingCardsOf
    cardLayout: isCardLayout(md),
    cards: isCardLayout(md) ? listingCardsOf(statusBadgeRows(page.content || [], md.columns || []), md.columns || []) : [],
    // number of extra lines (0 = normal listing) and the table class that makes room for them
    // (PRECOMPUTED: VB CSP)
    extraLines: lines.extra.length,
    tableClass: lines.extra.length ? 'oj-sm-12 mateu-multiline-table mateu-lines-' + Math.min(lines.extra.length, 4) : 'oj-sm-12',
    // Redwood table density: the compact 'grid' is for WORK tables —
    // it switches on when the crud is inline-editable (@InlineEditing marks the columns
    // as editable on the wire); a lookup listing stays at 'list' (airy).
    // PRECOMPUTED (VB CSP).
    // And a @Compact listing (CrudlDto.compact) asks for the same work density: 'grid'
    // rows instead of the airy 'list' ones.
    display: md.compact === true || (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
    // WORK table: a row click does NOT navigate (cells are edited in place)
    editable: (md.columns || []).some((col) => (col.metadata || col).editable),
    // the accessible NAME of an in-cell editor = its column header (the cellEdit* templates read it)
    editorLabels: Object.fromEntries((md.columns || []).map((col) => col.metadata || col)
      .filter((c) => c.editable).map((c) => [c.id, c.label || c.id])),
    // row DETAIL (@Details on the row): the field that is not a column and opens when the
    // row is clicked. A NAVIGABLE row (first column with actionId 'view') still opens the record:
    // the detail is for lookup listings, where the click had no other destination.
    detailPath: md.detailPath || null,
    navigable: (md.columns || []).some((col, i) => i === 0 && (col.metadata || col).actionId === 'view'),
    // row SELECTION (Listing.rowsSelectionEnabled): checkboxes in the table, and the toolbar
    // actions receive the checked rows in crud_selected_items — the same contract as Vaadin
    // (HttpRequest.getSelectedRows reads it from the componentState). The mode is PRECOMPUTED (VB CSP).
    rowsSelectionEnabled: !!md.rowsSelectionEnabled,
    selectionMode: { row: md.rowsSelectionEnabled ? 'multiple' : 'none' },
    // the actions that make no sense without a selection (Action.rowsSelectedRequired: Delete…)
    // (the declared actions of the ServerSide host, not the buttons)
    // + the toolbar buttons that carry the guard THEMSELVES (Button.rowsSelectedRequired, every
    // @ListToolbarButton): the id the button fires and that of the advertised action do not always match
    selectionRequired: ((ctx.tree && ctx.tree.actions) || [])
      .filter((a) => a.rowsSelectedRequired).map((a) => a.id)
      .concat((md.toolbar || []).filter((b) => b && b.rowsSelectedRequired).map((b) => b.actionId)),
    // @RowStatus: each row carries its tone (_tone) — tables.mjs paints it on the oj-table's tr;
    // @GroupBy: interleaved group rows (value (n) + subtotals), presentation only
    rows: groupedRows(toneRows(rowLinesRows(cellRows, lines.extra), md.rowStatusField), md, (ctx.data || {}).crud),
    // @Aggregate: the totals of the filtered set, per column (oj-table footer)
    totals: aggregateFootersOf(md, (ctx.data || {}).crud),
    hasTotals: !!aggregateFootersOf(md, (ctx.data || {}).crud),
    rowStatusField: md.rowStatusField || '',
    // @DragRows: rows are dragged (JET oj-table dnd) with this MIME type — dnd.mjs
    dragType: md.dragType || '',
    dragTypes: md.dragType ? [dragMimeOf(md.dragType)] : [],
    // the property the server sorts each column by (GridColumn.sortingProperty or its id)
    sortFields: Object.fromEntries((md.columns || []).map((col) => col.metadata || col)
      .map((c) => [c.id, c.sortingProperty || c.id])),
    total: page.totalElements == null ? null : page.totalElements,
    isEmpty: (page.content || []).length === 0,
    // a toolbar Button whose actionable is a RouteLink ("New character" → people/new) NAVIGATES, like
    // a content button (content.mjs buttonOf) and the web: its actionId is only the label's echo and
    // the server has nothing behind it (strict mode answers 403). An unresolved route disables it.
    toolbar: (md.toolbar || []).map((b) => {
      const route = b.route ? buttonRouteOf(b.route, ctx.state || {}) : null
      return {
        actionId: b.actionId,
        label: b.label,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled || (!!b.route && route == null),
        ...(route ? { route } : {}),
      }
    }),
    // QUICK selector of the listing: option filters (e.g. an enum in Filters, like
    // the View of the bookings listing) → oj-sp-filter-chip chips next to the smart search;
    // the filters travel as select FormFields in the metadata (sometimes in the mediator,
    // not in the Crud node — the whole tree is searched)
    filters: filtersOf(ctx),
  }
}

// the footer texts, from the interface catalogue (i18n.mjs)
export function pagingLangOf(lang) {
  const l = chromeLanguage(lang)
  const t = (key) => chromeText(key, null, l)
  return { of: t('pagingOf'), page: t('pagingPage'), first: t('pagingFirst'), prev: t('pagingPrev'), next: t('pagingNext'), last: t('pagingLast') }
}

/**
 * The listing's PAGINATION, from the Page the server sends (pageNumber/pageSize/totalElements) →
 * what the table footer paints: "11–20 of 57", "Page 2 of 6" and which buttons are active.
 * With no known total (a Listing that does not count) there is a "next" while the page comes full.
 * `visible` = there is more than one page (a short listing has no footer).
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
    // the disabled flags already negated (VB CSP: the template does not evaluate "!")
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
 * The page a footer button leads to: 'first' | 'prev' | 'next' | 'last' over the current
 * paging → page number, or null if the button leads nowhere.
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
 * The componentState of a listing search: the host state + the text, the page, the
 * size, the sort and the applied filters (the chips; a range takes two keys) — what
 * SearchActionHandler reads. Paging or re-sorting keeps text and filters; the sort travels as a
 * [{field, direction}] list and only if there is one.
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
 * The sort requested by the oj-table header (ojSort: detail.header = the column key,
 * detail.direction 'ascending'|'descending') → [{field, direction}] in the server's
 * vocabulary (io.mateu.uidl.data.Sort). The key is the wire id (listingOf sets it); if the
 * cell's field arrives (e.g. the abbreviated UUID), the suffix is stripped.
 */
export function listingSortOf(detail, sortFields) {
  if (!detail || !detail.header) return []
  const key = String(detail.header).replace(new RegExp('(' + UUID_CELL_SUFFIX + '|' + PRIMARY_CELL_SUFFIX + '|' + CLIP_CELL_SUFFIX + '|' + LABEL_CELL_SUFFIX + ')$'), '')
  const field = (sortFields && sortFields[key]) || key
  const direction = detail.direction === 'descending' ? 'descending' : 'ascending'
  return [{ field, direction }]
}

/**
 * The table selection, in a form that survives a refresh: oj-table's KeySet
 * (`detail.value.row` of ojSelectedChanged) → { all, keys, except }. A "select all" is
 * an addAll KeySet: all except the unchecked ones, not a list of keys.
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

/** The checked rows, resolved against the CURRENT rows by their key (_rowNumber). What is
 *  sent is the row as it arrived: the precomputed badge of the @Status columns does not travel. */
export function selectedRowsOf(rows, selection) {
  if (!selection) return []
  const picked = selection.all
    ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
    : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
  return picked.map(rowAsArrived)
}

/** A table row as the server sent it: without the cells precomputed for the templates (the
 *  abbreviated UUID, the clipped text, an enum's label) and with a plain status word back in place
 *  of its badge — what a row click ("view") and a selection hand back to the server. */
export function rowAsArrived(row) {
  if (!row || typeof row !== 'object') return row
  const out = {}
  for (const key of Object.keys(row)) {
    const value = row[key]
    if (key.endsWith(UUID_CELL_SUFFIX) || key.endsWith(CLIP_CELL_SUFFIX) || key.endsWith(LABEL_CELL_SUFFIX)) {
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && 'badgeClass' in value) {
      const { badgeClass, ...rest } = value
      out[key] = rest.plain ? (rest.raw !== undefined ? rest.raw : rest.message) : rest
    } else {
      out[key] = value
    }
  }
  return out
}

/** The componentState of a host action of a listing with selection: it carries the checked
 *  rows in crud_selected_items, like Vaadin. Without a listing or without a selection, untouched. */
export function withListingSelection(componentState, listing, rows, selection) {
  if (!listing || !listing.rowsSelectionEnabled) return componentState
  return Object.assign({}, componentState, { crud_selected_items: selectedRowsOf(rows, selection) })
}

// rows with @Status columns: the {type, message} value gets stamped with the JET badge
// class (Redwood, system) — the cell template cannot map (CSP without ternaries)
export const STATUS_BADGE = {
  SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
  WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
  DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
  INFO: 'oj-badge oj-badge-info oj-badge-subtle',
  NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const UUID_CELL_SUFFIX = '__uuidCell'

/** "…-<last block>" of a canonical UUID; any other value, as is. */
export function abbreviateUuid(value) {
  return typeof value === 'string' && UUID.test(value)
    ? '…-' + value.substring(value.lastIndexOf('-') + 1)
    : value
}

// the TEXT columns (no template of their own, not editable) with some value that is a whole UUID
export function uuidColumnIds(rows, columns) {
  return columns
    .map((col) => col.metadata || col)
    .filter((c) => !c.editable && (!c.dataType || c.dataType === 'string'))
    .filter((c) => rows.some((row) => typeof row[c.id] === 'string' && UUID.test(row[c.id])))
    .map((c) => c.id)
}

// rows with UUID columns: each one gets <id>__uuidCell = {text, full}, which is what
// the cell paints; the row's original value stays intact (navigation, actions, selection)
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

/** The cell (of the technical ROW_LINES_COLUMN column) that paints each row's extra lines. */
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

/** What separates a column group's label from each of its columns' labels. */
export const COLUMN_GROUP_SEPARATOR = ' · '

/**
 * COLUMN GROUPS (GridGroupColumn: a header spanning several columns). oj-table has no grouped
 * headers — its `columns` are flat — so a group is FLATTENED into its leaf columns and the group's
 * label PREFIXES each of theirs ("Occupancy · Adults"): no column is lost and the grouping still
 * reads. Takes wire nodes (ClientSide with metadata) or bare metadata and returns each leaf column's
 * metadata in wire order. `interp` resolves the ${...} in the group label (the column's own label is
 * resolved by whoever paints the header).
 */
export function leafColumnsOf(columns, interp = (s) => s) {
  const out = []
  const walk = (col, prefix) => {
    const c = col && (col.metadata || col)
    if (!c) return
    if (c.type === 'GridGroupColumn') {
      const label = interp(c.label || '')
      const next = label ? (prefix ? prefix + COLUMN_GROUP_SEPARATOR + label : label) : prefix
      ;(c.columns || []).forEach((k) => walk(k, next))
      ;(col.children || []).forEach((k) => walk(k, next))
      return
    }
    out.push(prefix ? { ...c, label: prefix + COLUMN_GROUP_SEPARATOR + (c.label || c.id || '') } : c)
  }
  ;(columns || []).forEach((col) => walk(col, ''))
  return out
}

/** The (1-based) line of a column: its `line` if > 1; otherwise 1. */
export function lineOfColumn(c) {
  const line = c && typeof c.line === 'number' ? c.line : 0
  return line > 1 ? Math.floor(line) : 1
}

/** Splits the wire columns by line: {first: those of line 1, extra: [[line 2], [line 3]…]}
 *  in wire order (empty lines do not count). Without @Line, extra = [] and nothing changes. */
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

/** The text of a value in an extra line: a status by its message, money as «amount currency». */
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

/** On each row, <ROW_LINES_FIELD> = {lines: [{key, pairs: [{key, label, text, cls}]}]}: what the
 *  cellLines template paints (VB CSP: precomputed). A status carries its badge (cls). */
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

/**
 * Whether the listing is laid out as a grid of CARDS (`gridLayout = cards`, or the older
 * `listingType` card declaration with gridLayout auto) — the same rule as the web renderer's
 * effectiveGridLayout. Anything else (table, auto, list, masterDetail, tree) keeps the table.
 */
export function isCardLayout(md) {
  if (!md) return false
  const raw = md.gridLayout || 'auto'
  if (raw === 'auto') return md.crudlType === 'card'
  return raw === 'cards'
}

/** How many plain data rows a card shows (the web renderer's cut); status badges and row actions
 *  are never cut — they carry the row's state and its operations. */
export const CARD_DATA_COLUMNS = 6

/**
 * The CARDS of a `gridLayout = cards` listing, one per row, precomputed (VB CSP: the template cannot
 * pick the title column or format a value). Mirrors the web renderer's card: the image (first
 * `image` column), the title (the identifier column, else the first one), the status columns as
 * badges beside the title, the secondary lines (@Line 2+) under it as «Label: value», the other
 * line-1 columns as label/value pairs, and the row actions as buttons. `key` is the row's
 * _rowNumber — what the row click and the selection resolve the row by. `rows` are the
 * statusBadgeRows ones (each status already carries its badge class).
 */
export function listingCardsOf(rows, columns) {
  const cols = (columns || []).map((col) => col.metadata || col)
  const { first, extra } = rowLinesSplit(cols)
  const isAction = (c) => c.dataType === 'actionGroup' || c.dataType === 'action' || c.dataType === 'menu'
  const firstCols = first.map((col) => col.metadata || col)
  const visible = firstCols.slice(0, CARD_DATA_COLUMNS)
    .concat(firstCols.slice(CARD_DATA_COLUMNS).filter((c) => isAction(c) || c.dataType === 'status'))
  const image = visible.find((c) => c.stereotype === 'image')
  const textual = visible.filter((c) => c !== image && !isAction(c))
  const title = textual.find((c) => c.identifier && c.dataType !== 'status') || textual.find((c) => c.dataType !== 'status')
  const badges = textual.filter((c) => c.dataType === 'status')
  const pairs = textual.filter((c) => c !== title && c.dataType !== 'status')
  const actionCols = visible.filter((c) => c.dataType === 'actionGroup')
  const textOf = (c, v) => {
    const shown = valueLabelOf(c, v)
    return lineValueText(shown)
  }
  return (rows || []).filter((row) => row && !row._group).map((row) => {
    const card = {
      key: row._rowNumber,
      rowId: row.id == null ? '' : String(row.id),
      title: title ? textOf(title, row[title.id]) : '',
      image: image && row[image.id] ? String(row[image.id]) : '',
      badges: badges.map((c) => {
        // the rows come through statusBadgeRows: a status (object or plain word) carries its badge
        const status = row[c.id]
        return status && typeof status === 'object' ? { key: c.id, text: lineValueText(status), cls: status.badgeClass || STATUS_BADGE.NONE } : null
      }).filter((b) => b && b.text),
      lines: extra.map((line, i) => ({
        key: 'l' + (i + 2),
        pairs: line.map((col) => col.metadata || col).map((c) => ({ key: c.id, label: c.label || c.id, text: textOf(c, row[c.id]) }))
          .filter((p) => p.text !== ''),
      })).filter((l) => l.pairs.length),
      pairs: pairs.map((c) => ({ key: c.id, label: c.label || c.id, text: textOf(c, row[c.id]) })),
      actions: actionCols.flatMap((c) => ((row[c.id] && row[c.id].actions) || [])
        .map((a) => ({ key: c.id + ':' + a.methodNameInCrud, methodNameInCrud: a.methodNameInCrud, label: a.label || a.methodNameInCrud }))),
    }
    card.hasImage = !!card.image
    card.hasBadges = card.badges.length > 0
    card.hasActions = card.actions.length > 0
    return card
  })
}

/** The listing selection after a card's checkbox changed: the key added or removed (a «select
 *  all» from the table does not exist in cards, so the selection is always a plain key list). */
export function toggleSelectionKey(selection, key, checked) {
  const keys = (selection && !selection.all && Array.isArray(selection.keys) ? selection.keys : [])
    .filter((k) => String(k) !== String(key))
  return { all: false, keys: checked ? keys.concat([key]) : keys, except: [] }
}

export const CLIP_CELL_SUFFIX = '__clipCell'

/** The cell of a column that declares labels for its values (GridColumn.valueLabels — an enum's:
 *  IN_HOUSE → "In house", what its form options say). The row keeps the RAW value (sorting,
 *  filtering, selection and editing work on it); the cell reads <id>__labelCell. */
export const LABEL_CELL_SUFFIX = '__labelCell'

/** What a cell shows for a raw value: the column's label for it, or the value itself. */
export function valueLabelOf(c, value) {
  // an amount of money reads formatted: "89.50" in the UI's locale, an Amount in its own ("€89.50")
  if (isMoneyColumn(c) && value != null && value !== '') return moneyText(value)
  // a boolean reads Yes / No, never the raw "true" / "false" (UX review W-R-BOOL: Nielsen #2)
  if (isBoolColumn(c) && typeof value === 'boolean') return chromeText(value ? 'confirmYes' : 'confirmNo')
  const labels = c && c.valueLabels
  if (!labels || value == null || typeof value === 'object') return value
  const label = labels[String(value)]
  return label != null ? label : value
}

/** A column of amounts: an Amount (dataType money) or a number declared money (stereotype). */
const isMoneyColumn = (c) => !!c && (c.dataType === 'money' || c.stereotype === 'money')

/** Whether a (non-status, non-editable) column reads its values through their labels. */
const isBoolColumn = (c) => !!c && (c.dataType === 'bool' || c.dataType === 'boolean')

/** Numbers and amounts line up at the END (NN/g data tables; Redwood/JET oj-helper-text-align-end). */
export const LISTING_NUMERIC_TYPES = ['integer', 'number', 'double', 'decimal', 'long', 'float', 'money']
export function alignOf(c) {
  if (c && c.align) return c.align === 'end' || c.align === 'right' ? 'end' : c.align === 'center' ? 'center' : null
  return c && LISTING_NUMERIC_TYPES.indexOf(c.dataType) >= 0 ? 'end' : null
}

export function labelColumn(c) {
  return !!(c && ((c.valueLabels && Object.keys(c.valueLabels).length) || isBoolColumn(c) || isMoneyColumn(c))) && !c.editable
    && c.dataType !== 'status' && c.dataType !== 'actionGroup' && c.stereotype !== 'primary'
}

/** Each column with labels gets <id>__labelCell = the text the cell paints (VB
 *  CSP: the template cannot look up a map). The row stays intact. */
export function labelCellRows(rows, columns) {
  const cols = (columns || []).map((c) => c.metadata || c).filter(labelColumn)
  if (!cols.length) return rows
  return rows.map((row) => {
    const out = { ...row }
    for (const c of cols) {
      const shown = valueLabelOf(c, row[c.id])
      out[c.id + LABEL_CELL_SUFFIX] = shown == null ? '' : String(shown)
    }
    return out
  })
}

/** The width the wire asks for a column (GridColumn.width / flexGrow), in oj-table's
 *  keys: width (and, if it does not grow — flexGrow "0" —, minWidth = maxWidth = width). Without width, {}. */
export function columnWidthOf(c) {
  const width = c && typeof c.width === 'string' ? c.width.trim() : (c && typeof c.width === 'number' ? c.width + 'px' : '')
  if (!width || width === 'auto') return {}
  return String(c.flexGrow) === '0'
    ? { width, minWidth: width, maxWidth: width }
    : { width, minWidth: width }
}

/**
 * DEFAULT COLUMN SIZING — the rule for a column that declares no width (the same rule the web
 * renderer applies, libs/mateu columnSizing.ts):
 *  - COMPACT columns FIT their content and do not grow: identifiers, numbers, amounts, dates and
 *    times, booleans, statuses, enums (a column with value labels), row actions and buttons;
 *  - TEXT columns (string, primary, anything else) GROW and share what is left, each by its
 *    weight: flexGrow when it declares one, else `weight`, else 1 (`weight: 2` grows twice as much);
 *  - a declared width (+ flexGrow) wins as before (columnWidthOf), and a declared flexGrow without a
 *    width picks the behaviour: "0" fits the content, N grows with weight N.
 * The table then uses oj-table's `layout="fixed"` (tableLayout), which honours the weights, fills
 * the available width and scrolls horizontally when the columns' minimums do not fit.
 * 'fixed' does not measure the cells, so a compact column's width is ESTIMATED from what its header,
 * cells (the page that arrived) and total paint (estimateTextPx) — a little generously.
 */
const COMPACT_DATA_TYPES = ['integer', 'number', 'double', 'decimal', 'long', 'float', 'money', 'bool', 'boolean',
  'status', 'date', 'time', 'dateTime', 'dateRange', 'range', 'action', 'actionGroup', 'menu']
const COMPACT_STEREOTYPES = ['money', 'button', 'toggle', 'checkbox', 'badge', 'stars', 'color', 'numberRange', 'dateRange']
export function isCompactColumn(c) {
  if (!c) return false
  if (c.identifier) return true
  if (c.dataType && COMPACT_DATA_TYPES.indexOf(c.dataType) >= 0) return true
  if (c.stereotype && COMPACT_STEREOTYPES.indexOf(c.stereotype) >= 0) return true
  return !!(c.valueLabels && Object.keys(c.valueLabels).length)
}

/** The flexGrow a column declares as a number (null when it declares none). */
function declaredFlexGrow(c) {
  if (!c || c.flexGrow == null || c.flexGrow === '') return null
  const n = parseFloat(c.flexGrow)
  return isNaN(n) || n < 0 ? null : n
}

// Redwood's table font (Oracle Sans 16px): approximate advance per character, in px
const charPx = (ch) => {
  const code = ch.codePointAt(0)
  if (code >= 0x2e80) return 16 // CJK & co.: full width
  if (ch >= '0' && ch <= '9') return 9.6
  if (' .,:;!|\'`'.indexOf(ch) >= 0) return 4.5
  if ('ijlft()[]'.indexOf(ch) >= 0) return 5
  if (ch === '-' || ch === '/') return 6.5
  if (ch === 'M' || ch === 'W' || ch === 'm' || ch === 'w' || ch === '@' || ch === '%') return 13
  if ('OQGDCH'.indexOf(ch) >= 0) return 12
  if (ch >= 'A' && ch <= 'Z') return 10.5
  return 8.2
}

/** Estimated width (px) of a text in the table font, scaled for another size/weight. */
export function estimateTextPx(text, scale = 1) {
  if (text == null) return 0
  let w = 0
  for (const ch of String(text)) w += charPx(ch)
  return w * scale
}

// paddings measured on the Redwood table (list display): header 16 + 8 and a 36px sort icon (on
// every sortable header: oj-table offers sorting on all but the disabled ones), cell 16 + 16; a
// status badge (13.7px) adds 12 + 12, a small button 12 + 12 and its margin. SLACK covers the
// estimate's error (a few %): too narrow clips, too wide only costs a few px
const HEADER_PAD = 24
const SORT_ICON = 36
const CELL_PAD = 32
const BADGE_PAD = 24
const BUTTON_PAD = 28
const SLACK = 1.04
const COMPACT_MIN = 56
const COMPACT_MAX = 400
// a growing column never starts narrower than this, nor (from its content) wider than GROW_MIN_MAX
const GROW_MIN = 120
const GROW_MIN_MAX = 240
// an in-cell editor needs room for its input
const EDITOR_MIN = 128

/** What a cell paints, as text: a badge's message, a clipped cell's text, a primary cell's title… */
function cellTextOf(v) {
  if (v == null) return ''
  if (typeof v !== 'object') return String(v)
  return String(v.message || v.text || v.title || v.label || v.type || '')
}

/** The estimated width (px) of a column's CONTENT: header, the cells of the page and its total. */
function contentPxOf(c, rows, field, footerText) {
  const actions = c.dataType === 'actionGroup'
  const header = HEADER_PAD + estimateTextPx(c.label || (actions ? '' : c.id), 1.06) + (actions ? 0 : SORT_ICON)
  let cells = 0
  for (const row of (rows || []).slice(0, 100)) {
    let w
    if (actions) {
      const buttons = (row[c.id] && row[c.id].actions) || []
      w = buttons.reduce((sum, a) => sum + estimateTextPx(a.label || a.methodNameInCrud, 0.875) + BUTTON_PAD, 0)
    } else if (c.dataType === 'status') {
      const text = cellTextOf(row[field])
      w = text ? estimateTextPx(text, 0.86) + BADGE_PAD : 0
    } else if (c.stereotype === 'button') {
      w = estimateTextPx(c.text || cellTextOf(row[field]), 0.875) + BUTTON_PAD
    } else {
      w = estimateTextPx(cellTextOf(row[field]))
    }
    if (w > cells) cells = w
  }
  const footer = footerText ? estimateTextPx(footerText, 1.06) : 0
  return { header, cells: CELL_PAD + Math.max(cells, footer) }
}

/**
 * How a column is sized: { kind, def, px }. kind 'declared' = its own width (columnWidthOf, as
 * before); 'fit' = a compact column at its content width (def.width, px); 'grow' = a text column
 * that grows by its weight from a minimum (def.minWidth + def.weight). `def` are oj-table keys.
 */
export function columnSizingOf(c, rows, field, footerText) {
  const declared = columnWidthOf(c)
  if (declared.width) return { kind: 'declared', def: declared }
  const grow = declaredFlexGrow(c)
  const { header, cells } = contentPxOf(c, rows, field || c.id, footerText)
  if (grow === 0 || (grow == null && isCompactColumn(c))) {
    let px = Math.ceil(Math.max(header, cells) * SLACK + 4)
    if (c.editable) px = Math.max(px, EDITOR_MIN + CELL_PAD)
    px = Math.min(COMPACT_MAX, Math.max(COMPACT_MIN, px))
    return { kind: 'fit', px, def: { width: px + 'px' } }
  }
  const weight = grow != null ? grow : (typeof c.weight === 'number' && c.weight > 0 ? c.weight : 1)
  let min = Math.max(GROW_MIN, Math.ceil(header * SLACK + 4), Math.ceil(Math.min(cells * SLACK + 4, GROW_MIN_MAX)))
  if (c.editable) min = Math.max(min, 2 * EDITOR_MIN)
  return { kind: 'grow', px: min, def: { minWidth: min + 'px', weight } }
}

/**
 * The last step, on the columns ACTUALLY painted (after the user's column preferences): the
 * growing columns' weights are normalised (oj-table reads any weight below 1 as 1, so 0.5 vs 1
 * becomes 1 vs 2) and, when NO column grows, the compact ones share the width instead of leaving
 * a gap: each from its content width, in proportion to it. `fitColumns` = id → px of the compact
 * defaults.
 */
export function finishColumnSizing(columns, fitColumns) {
  const fits = fitColumns || {}
  const growing = columns.filter((d) => typeof d.weight === 'number')
  if (!growing.length) {
    const fitted = columns.filter((d) => fits[d.id] != null).map((d) => fits[d.id])
    if (!fitted.length) return columns
    const least = Math.min(...fitted)
    return columns.map((d) => {
      if (fits[d.id] == null) return d
      const { width, ...rest } = d
      return { ...rest, minWidth: fits[d.id] + 'px', weight: Math.round((fits[d.id] / least) * 100) / 100 }
    })
  }
  const least = Math.min(...growing.map((d) => d.weight))
  if (least >= 1 || least <= 0) return columns
  return columns.map((d) => typeof d.weight === 'number' ? { ...d, weight: Math.round((d.weight / least) * 100) / 100 } : d)
}

/** The columns WITHOUT the default sizing (only the widths they declare), for the tables that do
 *  not bind `tableLayout` — the search picker and the listing in an overlay keep oj-table's own
 *  content-based sizing in their narrower dialogs/drawers. */
export function withoutDefaultSizing(columns, listing) {
  const ids = (listing && listing.defaultSizedColumns) || []
  if (!ids.length) return columns
  return (columns || []).map((d) => {
    if (ids.indexOf(d.id) < 0) return d
    const { width, minWidth, maxWidth, weight, ...rest } = d
    return rest
  })
}

// a TEXT column with a fixed width (flexGrow 0) or with a tooltip: its cell is clipped with an ellipsis
// and the whole text (or that of the tooltipPath field) goes to the title
export function clipColumn(c) {
  return !c.editable && c.dataType !== 'actionGroup' && c.dataType !== 'status' && c.stereotype !== 'primary'
    && (!!c.tooltipPath || (!!columnWidthOf(c).maxWidth))
}

/** Each clippable column gets <id>__clipCell = {text, title, cls}: what the cell paints
 *  (VB CSP: the template cannot read a variable field of the row). The row stays intact. */
export function clipCellRows(rows, columns) {
  const cols = (columns || []).map((c) => c.metadata || c).filter(clipColumn)
  if (!cols.length) return rows
  const text = (v) => (v == null ? '' : (typeof v === 'object' ? (v.message || v.text || v.label || '') : String(v)))
  return rows.map((row) => {
    const out = { ...row }
    for (const c of cols) {
      const shown = text(valueLabelOf(c, row[c.id]))
      // tooltipPath to ANOTHER field (@Tooltip): a detail → the floating window; to itself (a fixed
      // width that clips): the whole text in the usual title
      const tip = c.tooltipPath && c.tooltipPath !== c.id ? text(row[c.tooltipPath]) : ''
      // only the fixed-width column is clipped; with tooltipPath and no width, the text stays whole
      // with @Tooltip(another field) the detail shows in the floating window (hover.mjs), not in the
      // browser's title: several lines and Redwood style; without it, the title shows what is clipped
      out[c.id + CLIP_CELL_SUFFIX] = { text: shown, title: tip ? '' : shown, hover: tip, cls: columnWidthOf(c).maxWidth ? 'mateu-cell-clip' : '' }
    }
    return out
  })
}

/** The cell of each primary column: {title, caption, leading} (empty if none). */
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

// Lifecycle words a REST API commonly answers with, by the badge they read as (the web's
// statusColumnRenderer): upper-cased, separators folded to `_`.
const STATUS_SUCCESS_WORDS = ['AVAILABLE', 'ACTIVE', 'RUNNING', 'SUCCEEDED', 'SUCCESS', 'OK', 'ENABLED',
  'READY', 'HEALTHY', 'COMPLETED', 'DONE', 'ATTACHED', 'UP']
const STATUS_WARNING_WORDS = ['PROVISIONING', 'UPDATING', 'PENDING', 'STARTING', 'STOPPING', 'IN_PROGRESS',
  'TERMINATING', 'DELETING', 'CREATING', 'MOVING', 'WAITING', 'ACCEPTED', 'WARNING', 'DEGRADED', 'RESTORING', 'SCALING']
const STATUS_DANGER_WORDS = ['FAILED', 'TERMINATED', 'ERROR', 'DELETED', 'STOPPED', 'DISABLED', 'UNHEALTHY',
  'DOWN', 'CANCELED', 'CANCELLED', 'REJECTED', 'INACTIVE']

/** A tone name (`success | warning | danger | error | info | neutral`) as a status type. */
export function statusTypeOfTone(tone) {
  switch (String(tone == null ? '' : tone).trim().toLowerCase()) {
    case 'success': return 'SUCCESS'
    case 'warning': return 'WARNING'
    case 'danger': case 'error': return 'DANGER'
    case 'info': return 'INFO'
    case 'neutral': case 'none': return 'NONE'
  }
  return undefined
}

/**
 * The status type of a PLAIN cell value (a REST API answers `"SHIPPED"`, not `{type, message}`):
 * the column's declared tone for the value (GridColumn.tones, from a field type) wins over the
 * lifecycle-word heuristics; anything else is neutral.
 */
export function statusTypeOfValue(value, tones) {
  const message = String(value)
  const declared = tones ? (tones[message] != null ? tones[message] : tones[message.trim().toUpperCase()]) : undefined
  const toned = declared ? statusTypeOfTone(declared) : undefined
  if (toned) return toned
  const word = message.trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (STATUS_SUCCESS_WORDS.indexOf(word) >= 0) return 'SUCCESS'
  if (STATUS_WARNING_WORDS.indexOf(word) >= 0) return 'WARNING'
  if (STATUS_DANGER_WORDS.indexOf(word) >= 0) return 'DANGER'
  return 'NONE'
}

/** A bare CONSTANT with no label, read as words — the server's enum humanizer ("IN_PROGRESS" → "In progress"). */
export function humanizeConstant(raw) {
  if (typeof raw !== 'string' || raw.length < 2 || !/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(raw)) return raw
  const words = raw.toLowerCase().replace(/_/g, ' ').replace(/([a-z])(\d)/g, '$1 $2')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function statusBadgeRows(rows, columns) {
  const statusCols = columns
    .map((col) => col.metadata || col)
    .filter((c) => c.dataType === 'status')
  if (!statusCols.length) return rows
  return rows.map((row) => {
    const out = { ...row }
    for (const c of statusCols) {
      const id = c.id
      const value = out[id]
      if (value && typeof value === 'object') {
        out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
      } else if (value != null && value !== '') {
        // a plain word (a REST row): its badge by the declared tone or the word; `plain` lets
        // selectedRowsOf hand the row back as it arrived
        // the tone by the RAW value, the badge text by the column's label for it (an enum's);
        // `raw` is what selectedRowsOf hands back
        const type = statusTypeOfValue(value, c.tones)
        const shown = valueLabelOf(c, value)
        // no label for it: a bare constant still reads as words (OUT_OF_STOCK → "Out of stock")
        out[id] = { type, message: shown === value && typeof value === 'string' ? humanizeConstant(value) : String(shown), badgeClass: STATUS_BADGE[type] || STATUS_BADGE.NONE, plain: true, raw: value }
      }
    }
    return out
  })
}

/**
 * ALL the filters the listing declares, each one already resolved to the widget it gets.
 *
 * Before, only the option ones came out, and only the first: a listing with a boolean, a
 * lookup, an enum and two dates showed a strip of loose chips with the enum's values
 * —without even saying which field they were— and the other four filters did not exist for the
 * user. In the Vaadin renderer all five come out.
 *
 * The `kind` is PRECOMPUTED here because VB templates run under CSP and cannot
 * evaluate expressions; the resolution order is the same as the shared bar's
 * (range → multi → options → boolean → text), so that the same listing offers the
 * same in both renderers.
 */
export function filtersOf(ctx) {
  const found = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    for (const f of ((node.metadata || {}).filters) || []) {
      // a readOnly filter is the listing's SCOPE (the :id of the master that contains it, the
      // context of a @Subresource): the route sets it, it is not a condition the user removes
      if (f.readOnly) continue
      found.push(filterDescriptorOf(f, ctx && ctx.data))
    }
    ;(node.children || []).forEach(walk)
  }
  walk(ctx && ctx.tree)
  return found
}

export function filterDescriptorOf(f, data) {
  // a @Lookup filter gets its options through its search (search-<field>, bridge.loadLookups):
  // they arrive at data[field] like those of a form field
  const options = optionsOf(f, data).map((o) => ({ value: o.value, label: o.label || o.value }))
  // 'bool' is emitted by the Java server and 'boolean' by .NET
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
    // the <input> type of the 'range' and 'text' kinds (a date is awful to type as text)
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
 * The filters as CHIPS: one per filter, applied or not.
 *
 * One per FILTER and not one per possible value, which is what was painted before: the eight
 * states of an enum came out as eight loose chips, without saying which field they were, and taking
 * the whole row the other four filters were meant to share. An unapplied chip opens its
 * editor; an applied one shows the value and is removed with the ✕.
 *
 * `keys` are the state keys that must be cleared to remove it — a range takes two, and
 * removing it halfway leaves the listing filtered by something no longer visible.
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
  // the selection by ids (?ids=…): only when applied — it is not a filter that is offered
  if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
    chips.unshift({ fieldId: IDS_PARAM, label: 'Ids', text: idsChipLabelOf(v[IDS_PARAM]), applied: true, keys: [IDS_PARAM] })
  }
  return chips
}

/**
 * The filters a route's query carries (`integration=MRU01&status=PROPOSED,APPROVED`) →
 * { field: value }. All the parameters, decoded (`+` is a space, as in a
 * form); empty ones do not filter, nor do the page and the sort. A multi-select takes the comma-separated list
 * (multiValuesOf), just as Vaadin writes it in the URL.
 */
/**
 * A requested navigation (route with or without ?query) versus the one on screen. `full` (route +
 * query) is what identifies it — the menu entry's id, the URL —; `filters` are
 * EXACTLY those of its query: none if it has none (going to /reservas from /reservas?vista=… removes the
 * filter). `same` = it is the one already there (the echo of the menu selection writeback): do not reload.
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

// the page and the sort also travel in a Vaadin listing's URL, but they are not filters
export const PAGING_PARAMS = { page: true, size: true, sort: true }

// ── Filters by URL: the declared ones, the free text and the selection by ids ─────────────────────
// Any declared filter of a listing is set from the URL with its field name (a range,
// with <field>_from / <field>_to; a multi-select, comma-separated). Plus two that nobody
// declares: the free text (`searchText`, or `q` as an alias when reading) and `ids`, the SELECTION — a
// concrete set of rows by their id (`?ids=4MBZS7,JXD3G6`), which the framework applies on the
// server to any listing. All of them come out as removable chips, and the URL reflects them.

/** The reserved filter of the selection by ids (the server applies it, no listing declares it). */
export const IDS_PARAM = 'ids'

export function idsTextsOf(lang) {
  const l = chromeLanguage(lang)
  return { few: chromeText('idsFew', null, l), many: (n) => chromeText('idsMany', { n }, l) }
}

/** The selection chip's caption: the ids if there are few (≤3), otherwise how many. */
export function idsChipLabelOf(ids, lang) {
  const list = multiValuesOf(ids)
  const texts = idsTextsOf(lang)
  return list.length <= 3 ? texts.few + list.join(', ') : texts.many(list.length)
}

/**
 * A query's filters (queryFiltersOf) split into the free text and the rest: `searchText`
 * (or its alias `q`, if searchText is absent) is what is searched, not a filter — it goes to the keyword chip.
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
 * The query reflecting a listing's applied filters (without '?'): each value with its key, the
 * lists comma-separated (as Vaadin writes them), the free text as `searchText`. Commas
 * are left readable; the rest, encoded.
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

/** The FULL route (with its query) of a listing with those filters: what goes to the URL. With
 *  `paging` ({page, sort}) also the page (if not the first) and the sort, with the contract of
 *  Vaadin and the static bundle: `page=N`, `sort=field:ascending,other:descending` — so coming back from
 *  a record, reloading or sharing the link keeps the page and the sort, not just the filters. */
export function listingUrlOf(route, values, searchText, paging) {
  const bare = String(route || '').split('?')[0]
  const parts = []
  const query = listingQueryOf(values, searchText)
  if (query) parts.push(query)
  const page = paging && Number(paging.page)
  if (page > 0) parts.push('page=' + page)
  const sort = paging && Array.isArray(paging.sort)
    ? paging.sort.filter((x) => x && x.field && x.direction).map((x) => x.field + ':' + x.direction).join(',')
    : ''
  if (sort) parts.push('sort=' + encodeURIComponent(sort).replace(/%2C/gi, ',').replace(/%3A/gi, ':'))
  return parts.length ? bare + '?' + parts.join('&') : bare
}

/** The page and sort a listing's query carries (`page=2&sort=name:descending`) →
 *  { page, sort: [{field, direction}] }; the first page and no sort if absent. */
export function listingUrlPagingOf(query) {
  const out = { page: 0, sort: [] }
  for (const part of String(query || '').replace(/^\?/, '').split('&')) {
    const eq = part.indexOf('=')
    if (eq <= 0) continue
    let value = part.slice(eq + 1)
    try { value = decodeURIComponent(value.replace(/\+/g, ' ')) } catch (e) { /* as it came */ }
    const key = part.slice(0, eq)
    if (key === 'page') {
      const n = parseInt(value, 10)
      if (n > 0) out.page = n
    } else if (key === 'sort') {
      out.sort = value.split(',').map((x) => {
        const [field, direction] = x.split(':')
        return field && (direction === 'ascending' || direction === 'descending') ? { field, direction } : null
      }).filter(Boolean)
    }
  }
  return out
}

export const declaresIds = (filters) => (filters || []).some((f) => f && f.fieldId === IDS_PARAM)

/** The values of a multi-select, which arrive as a list or as a comma-separated string. */
export function multiValuesOf(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.map(String)
  const text = String(value).trim()
  return text === '' ? [] : text.split(',').map((s) => s.trim()).filter((s) => s)
}

// ── Filters INSIDE the search header ────────────────────────────────────────────
// The filters travel through the `smartFilters` API of oj-sp-smart-filter-search, not in a row
// of their own below: the component paints its header (title + search box + filters) and, at the bottom, the
// Redwood colour strip. A filter row OUTSIDE the component ended up on the other side of
// the strip, which then looked like a loose illustration in the middle of the page.
//
// The API covers all of Mateu's kinds, each one with the editor the component itself opens
// in its popup (an oj-dynamic-form fed by `filtersMetadata`):
//   - `suggestionFilters`: the UNAPPLIED filters — one chip per declared filter under the
//     search box; the component removes from there those already applied.
//   - `value`: the applied ones — chips INSIDE the search field, with their ✕; the free text
//     travels right there as `keyword` chips.
//   - `filtersMetadata`: an oj-dynamic JsonMetadataProvider, polymorphic by `filter` (the
//     fieldId): the editor of each filter's value.

export const KEYWORD_FILTER = 'keyword'
export const BOOL_CHOICES = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]

/** The editor of a filter's value, in oj-dynamic's vocabulary (what the popup opens). */
export function smartFilterValueMetadataOf(f) {
  const labelHint = f.label
  if (f.isRange) {
    // gte/lte oj-input-date (string) or oj-input-number (number): with that exact shape the
    // component recognises the range and paints the chip as a formatted "from - to"
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
 * Raw `filtersMetadata` (oj-dynamic JSON): polymorphic by `filter`, one type per declared
 * filter. The component queries it with getMetadataByDiscriminator('filter', fieldId).
 */
export function smartFiltersMetadataOf(filters) {
  const polymorphicTypes = {}
  for (const f of filters || []) {
    polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
  }
  // the selection-by-ids chip can also open its editor: a text (comma-separated ids)
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

// Option filters carry `filterLabel` (the field name): the component puts the chosen option's
// label in `label` and the chip reads "Vista Llegadas hoy". A text or a range does NOT:
// with filterLabel the component shows the label instead of the typed value.
export const usesFilterLabel = (f) => f.isOptions || f.isMulti || f.isBool

/** The `suggestionFilters` chips: one per declared filter, without a value. */
export function smartFilterSuggestionsOf(filters) {
  return (filters || []).map((f) => {
    const chip = { filter: f.fieldId, label: f.label }
    if (usesFilterLabel(f)) chip.filterLabel = f.label
    // the popup form takes its fields from the value's keys: without them, a range
    // opens an empty popup
    if (f.isRange) chip.value = { gte: null, lte: null }
    return chip
  })
}

/** The component's `value` (the applied chips) from Mateu's state. */
export function smartFilterValueOf(filters, values, searchText) {
  const v = values || {}
  const out = []
  const text = searchText == null ? '' : String(searchText).trim()
  if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
  // the selection by ids: one more chip, removed like any other (no filterLabel: the caption
  // already says what it is)
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
 * The reverse: the component's applied chips → the searched text (the keywords, in order) and
 * the filter values that travel in the componentState. A chip just taken from the
 * suggestions has no value yet: it does not filter until one is chosen in its popup.
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
 * The suggestions that apply to a component fetch: out go those of already
 * applied filters (the criterion carries `{op:'$ne', value:{filters}}`) and, if there is text, those that do not
 * contain it. It is the contract of oj-sp's SuggestionFiltersDataProvider, which is REST; here the
 * suggestions are local.
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

/** A DataProvider (the part oj-sp-smart-filters uses) over the local suggestions. */
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
 * The rows of the search box's DROPDOWN (the `suggestions` property of oj-sp-smart-filters, a
 * SmartSuggestionChipsDataProvider): one per declared filter, each with its chip. On entering
 * the field the component opens them in its popup under the box; choosing one applies that filter and, since
 * it is a complex chip, opens its editor (oj-dynamic, filtersMetadata) — the same editor as the chips.
 * `category: 'suggestion'` is the component's box icon (the others are history and text).
 */
export function smartFilterDropdownRowsOf(filters) {
  return smartFilterSuggestionsOf(filters).map((chip) => ({ id: chip.filter, category: 'suggestion', chips: [chip] }))
}

/** The dropdown rows that apply: out go the already applied filters and, if there is text, those that do not contain it. */
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

/** A DataProvider (what the search box's popup uses) over the dropdown's local rows. */
export function suggestionsProviderOf(rows) {
  const all = rows || []
  return {
    // like a JET ArrayDataProvider: one block with the rows (done: false) and then the empty
    // end (done: true). A single block already «done» paints fine on the first fetch, but on
    // refiltering the popup's oj-list-view kept the previous rows with the new data
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
    // the filtering is done by the provider itself (text + applied): the component's
    // ListDataProviderView passes it through as is
    getCapability(name) { return name === 'filter' ? { operators: ['$and', '$ne'], textFilter: {} } : null },
    // the total depends on the filter: «unknown» (-1). With that of all the rows, the popup's
    // oj-list-view painted «Business key» six times when typing «busi»
    getTotalSize() { return Promise.resolve(-1) },
    isEmpty() { return all.length ? 'no' : 'yes' },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true },
  }
}

// oj-dynamic's JsonMetadataProvider: the AMD module sets it (the core does not depend on JET)
export let metadataProviderFactory = null
export function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

/**
 * The WHOLE `smart-filters` configuration for a listing: the filters dropdown, the
 * applied ones and each filter's editor. Without declared filters, only the text search box.
 *
 * Unapplied filters are offered in the DROPDOWN the search box opens on entering it
 * (`suggestions`), not as a row of buttons under the box (`suggestionFilters`, what there was
 * since 8af850e63): the listing's search box is once again a box with its filters menu.
 */
export async function smartFiltersOf(filters, values, searchText) {
  const config = { askHint: chromeText('search'), value: smartFilterValueOf(filters, values, searchText) }
  const hasIds = !isBlank((values || {})[IDS_PARAM])
  if ((!filters || !filters.length) && !hasIds) return config
  // without declared filters but with selection by ids: the chip needs its metadata, not suggestions
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
