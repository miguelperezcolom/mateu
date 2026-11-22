import React, { useEffect, useRef, useState } from 'react'
import { Button, Flash, Stack, Text, TextInput, Token } from '@kit'
import { Blankslate } from '@kit'
import {
  Table as Ui5Table, TableCell, TableGrowing, TableHeaderCell, TableHeaderRow, TableRow, TableSelectionMulti, Title, Toolbar, ToolbarSpacer,
} from '@ui5/webcomponents-react'
import { SearchIcon } from '@kit'
import { interpolate } from '@rn/core/expressions'
import { buttonActionId } from '@rn/core/uxRules'
import { rowOpenOf, rowPressOf } from '@rn/core/rowOpen'
import {
  buildAggregateFooters, groupLabelColumnId, groupRowCellText, interleaveGroupRows, isGroupRow,
  type AggregatableColumn, type GroupRow, type ListingData,
} from '@rn/core/listingGroups'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'
import { activeFilterCount, columnDefsOf, emptyMessageOf, extractListing, firstRowAction, pagingOf, type ColDef } from '@rn/renderer/crudListing'
import { withSelectionGate } from '@infra/ui/selectionGate.ts'
import { publishDragSelection } from '@infra/ui/dragAndDrop.ts'
import { useController } from '@mr/render/ViewHost'
import { useButtonPress } from '@mr/render/useButtonPress'
import { ActionButton } from '@app/overrides/render/PageRenderer'
import { ComponentRenderer } from '@mr/views/render/ComponentRenderer'
import { ROW_ACTION_TYPES, initialSortOf, rowKeyOf, withoutRowKey, type Dict, type Row } from '@mr/listing/rows'
import { FilterPanel, filterTokens } from '@mr/views/render/listing/filters'
import { RowActions, useCellRenderer } from '@mr/views/render/listing/cells'
import { Cards, List, MasterDetail, TreeListing } from '@mr/views/render/listing/layouts'
import { DetailsTable } from '@app/overrides/render/listing/DetailsTable'
import { SavedViews } from '@mr/views/render/listing/SavedViews'
import { ColumnChooser, useColumnPrefs } from '@mr/views/render/listing/ColumnChooser'
import { useListing } from '@mr/listing/useListing'
import { columnGeometry, tableLookClasses } from '@mr/views/render/listing/geometry'
import { ImportDialog } from '@mr/views/render/listing/ImportDialog'
import { mayTakeFocusOnItsOwn, watchForInteraction } from '@infra/a11y/initialFocus.ts'
import '@mr/views/render/listing/listing.css'
import { tx } from '@mr/i18n/texts'

// a listing may put the focus in its search box only once the user has acted on the page
watchForInteraction()

const aggregatable = (c: ColDef): AggregatableColumn => ({ id: c.fieldId, dataType: c.dataType, stereotype: c.stereotype, aggregate: c.aggregate || undefined })
const strOf = (v: unknown): string => (typeof v === 'string' ? v : '')

/** What the listing declares, read once per render. */
function listingModel(component: Dict, metadata: Dict, state: Dict) {
  const columns = flattenColumnGroups((metadata['columns'] as Dict[] | undefined) ?? []) as { metadata?: Dict; id?: string }[]
  const columnMetas = columns.map((c) => (c.metadata ?? {}) as Dict)
  const rowOpen = rowOpenOf(metadata['rowRoute'], columnMetas)
  const layout = String(metadata['gridLayout'] ?? metadata['listingType'] ?? 'auto')
  return {
    id: String(component['id'] ?? 'crud'),
    title: interpolate(String(metadata['title'] ?? ''), { state }),
    subtitle: interpolate(String(metadata['subtitle'] ?? ''), { state }),
    searchable: metadata['searchable'] === true,
    columns,
    columnMetas,
    rowOpen,
    defs: columnDefsOf(columns as never, rowOpen),
    actionColumns: columnMetas.filter((cm) => ROW_ACTION_TYPES.has(String(cm['dataType'] ?? '')) && cm['id'] !== 'select'),
    // a selector listing (a lookup's dialog): its `select` column is how a row is chosen
    selector: columnMetas.some((cm) => cm['id'] === 'select'),
    toolbar: ((metadata['toolbar'] as Dict[] | undefined) ?? []).filter((b) => b?.['label']),
    selectable: metadata['rowsSelectionEnabled'] === true,
    filters: ((metadata['filters'] as Dict[] | undefined) ?? []).filter((f) => f?.['fieldId']),
    groupBy: String(metadata['groupBy'] ?? ''),
    groupActions: ((metadata['groupActions'] as Dict[] | undefined) ?? []).filter(Boolean),
    // gridLayout auto means a table (a listing that wants another layout says so)
    layout: layout === 'card' ? 'cards' : layout,
    // @DragRows: rows travel to a DropZone (dragged, or — keyboard — the selection a zone offers to move)
    dragType: strOf(metadata['dragType']),
    detailPath: strOf(metadata['detailPath']),
    rowStatusField: strOf(metadata['rowStatusField']),
    header: (metadata['header'] as unknown[] | undefined) ?? [],
    footer: (metadata['footer'] as unknown[] | undefined) ?? [],
    preSearch: (metadata['preSearch'] as unknown[] | undefined) ?? [],
    // autoFocusOnSearchText: focused by code once the user has acted (never on a fresh load: the
    // first Tab must reach the skip link); searchOnEnter false: the search runs as the user types
    autoFocus: metadata['autoFocusOnSearchText'] === true,
    searchAsYouType: metadata['searchOnEnter'] === false,
    // infiniteScrolling: a "Show more" appends the next page instead of the pager
    infinite: metadata['infiniteScrolling'] === true,
    looks: tableLookClasses(metadata),
    contentHeight: strOf(metadata['contentHeight']),
  }
}
type Model = ReturnType<typeof listingModel>
type Controller = ReturnType<typeof useController>

/**
 * A listing (Crud) as a Fiori list report: the search field, filters, saved views and the column
 * settings above (the filter area); the table toolbar with its title, the row count and the
 * listing's actions; the rows — Fiori's responsive table (ui5-table, multi-selection, growing with
 * "More" — Fiori pages by growing, never by page numbers), cards, a list, a master/detail, a tree,
 * as the listing declares —; group headers and totals. The listing LOGIC is the React Native renderer's and the web renderer's,
 * imported in place — what a row opens, the columns, the paging, how search and filters are written
 * into the state, a REST source's rows, groups and aggregates, saved views and column choices
 * (the web's stores, so both renderers share them), the selection gate of a bulk action.
 */
export function CrudRenderer({ component, metadata, state, data }: { component: Dict; metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const m = listingModel(component, metadata, state)
  const listing = useListing({ id: m.id, metadata, state, data, filters: m.filters, columnMetas: m.columnMetas })
  // the web renderer's scope (the pathname) for the screen's own listing; a listing embedded in an
  // island or an overlay also names itself, so two on one page keep their own choices
  const scope = controller.windowless ? `${window.location.pathname}#${controller.currentServerSideType || controller.currentRoute}#${m.id}` : window.location.pathname
  const columnPrefs = useColumnPrefs(scope, m.defs)
  const defs = columnPrefs.visible
  const selection = useSelection(m, controller, metadata)
  const { openRow, opensRow } = useRowOpening(m, controller)

  const paging = pagingOf(listing.live)
  // Fiori grows a list ("More"), it never pages it: every page loaded so far stays on screen
  const loaded = useLoadedRows(paging)
  const dataRows = loaded.map((r, i) => ({ ...r, __mateuRowKey: rowKeyOf(r, i) }))
  const linkColumn = defs.find((c) => c.identifier) ?? defs.find((c) => !c.display) ?? defs[0]
  const cellOf = useCellRenderer({
    linkColumn,
    editorOf: (fieldId) => m.columnMetas.find((cm) => String(cm['id'] ?? '') === fieldId) ?? {},
    opensRow,
    openRow,
    dragType: m.dragType,
    selectedIds: selection.ids,
    rowStatusField: m.rowStatusField,
  })
  const titleId = `${m.id}-title`
  const searched = useSearched(listing.live, data)
  const showPreSearch = m.preSearch.length > 0 && !searched

  return (
    <>
      {m.header.map((h, i) => <ComponentRenderer key={`h${i}`} component={h} state={state} data={data} />)}
      <section className="mateu-listing" aria-labelledby={m.title ? titleId : undefined}>
        <ListingActions m={m} listing={listing} scope={scope} columnPrefs={columnPrefs} state={state} selected={selection.rows} titleId={titleId} total={paging.totalElements} />
        {m.subtitle && <Text as="p" className="mateu-listing-subtitle" id={`${m.id}-subtitle`}>{m.subtitle}</Text>}
        <AppliedFilters m={m} listing={listing} />
        {showPreSearch ? (
          <div style={{ gridArea: 'table' }}>{m.preSearch.map((p, i) => <ComponentRenderer key={`p${i}`} component={p} state={state} data={data} />)}</div>
        ) : (
          <ListingBody
            m={m} metadata={metadata} state={state} data={data} defs={defs} rows={dataRows} live={listing.live}
            restError={listing.restError} cellOf={cellOf} linkColumn={linkColumn} titleId={titleId}
            openRow={openRow} opensRow={opensRow} sort={listing.initialSort} onSort={listing.sortBy} selection={selection} onMore={listing.toPage}
          />
        )}
        {m.layout !== 'table' && m.layout !== 'auto' && !m.detailPath
          ? <ShowMore loaded={dataRows.length} total={paging.totalElements} onMore={() => listing.toPage(paging.pageNumber + 1)} />
          : null}
      </section>
      {m.footer.map((f, i) => <ComponentRenderer key={`f${i}`} component={f} state={state} data={data} />)}
    </>
  )
}

/**
 * The rows on screen: every page loaded so far (Fiori grows a list, "More"); page 0 starts over (a
 * new search, sort or filter). Kept in a ref, written during render — idempotent for a given page
 * (a page's rows are re-read from the answer every time), so it never loops through an effect.
 */
function useLoadedRows(paging: ReturnType<typeof pagingOf>): Row[] {
  const pages = useRef(new Map<number, Row[]>())
  if (paging.pageNumber === 0) pages.current = new Map()
  pages.current.set(paging.pageNumber, paging.rows as Row[])
  return [...pages.current.keys()].sort((a, b) => a - b).flatMap((k) => pages.current.get(k) ?? [])
}

function ShowMore({ loaded, total, onMore }: { loaded: number; total: number; onMore: () => void }) {
  if (total <= 0) return null
  return (
    <div className="mateu-listing-more">
      {loaded < total
        ? <Button onClick={onMore}>{tx('showMore')} ({loaded} / {total})</Button>
        : null}
    </div>
  )
}

/** What opening a row does: its rowRoute / link column, a selector's Select, else its first row action. */
function useRowOpening(m: Model, controller: Controller) {
  const openRow = (row: Row) => {
    if (m.rowOpen) {
      const p = rowPressOf(m.rowOpen, row)
      if (p?.kind === 'url') { if (/^https?:/i.test(p.url)) window.open(p.url, '_blank', 'noopener') }
      else if (p?.kind === 'route') controller.session.openView({ label: '', route: p.route, consumedRoute: '', serverSideType: '' })
      else if (p) void controller.runAction(p.actionId, withoutRowKey(p.parameters))
      return
    }
    if (m.selector) return void controller.runAction('action-on-row-select', { _clickedRow: withoutRowKey(row) })
    const fallback = firstRowAction(m.columns as never, row)
    if (fallback) void controller.runAction(fallback, { _clickedRow: withoutRowKey(row) })
  }
  const opensRow = (row: Row) => !!m.rowOpen || m.selector || !!firstRowAction(m.columns as never, row)
  return { openRow, opensRow }
}

/** Whether the listing has rows to show yet (a preSearch slot stands in for them until then). */
function useSearched(live: unknown, initial: unknown): boolean {
  const first = useRef(live)
  const [searched, setSearched] = useState(() => pagingOf(initial).rows.length > 0)
  useEffect(() => { if (live !== first.current) setSearched(true) }, [live])
  return searched
}

/**
 * The selection: written where the server reads it (`crud_selected_items`, `<id>_selected_items`),
 * published to a DropZone (@DragRows), and announced to the server when the listing listens to it
 * (`onRowSelectionChangedActionId`).
 */
function useSelection(m: Model, controller: Controller, metadata: Dict) {
  const [rows, setRows] = useState<Row[]>([])
  const ids = rows.map((r) => String(r['id'] ?? '')).filter(Boolean)
  const idsKey = ids.join('|')
  useEffect(() => { if (m.dragType) publishDragSelection(m.dragType, ids) }, [m.dragType, idsKey]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (m.dragType) publishDragSelection(m.dragType, []) }, [m.dragType])
  const listened = strOf(metadata['onRowSelectionChangedActionId'])
  const change = (next: Row[]) => {
    const clean = next.map(withoutRowKey)
    controller.currentComponentState['crud_selected_items'] = clean
    controller.currentComponentState[`${m.id}_selected_items`] = clean
    setRows(clean)
    if (listened) void controller.runAction(listened)
  }
  return { rows, ids, change, enabled: m.selectable || !!m.dragType }
}
type Selection = ReturnType<typeof useSelection>
type Listing = ReturnType<typeof useListing>

/** Above the rows: the search box, Filter, saved views, Columns and the listing's toolbar. */
function ListingActions({ m, listing, scope, columnPrefs, state, selected, titleId, total }: {
  m: Model; listing: Listing; scope: string; columnPrefs: ReturnType<typeof useColumnPrefs>; state: Dict; selected: Row[]; titleId: string; total: number
}) {
  const controller = useController()
  const press = useButtonPress()
  const searchBox = useRef<HTMLInputElement>(null)
  useAutoFocus(m.autoFocus && m.searchable, searchBox)
  const typed = useDebounced((text: string) => listing.search(listing.filterValues, text), 300)
  const [importing, setImporting] = useState(false)
  const offersViews = (m.searchable || m.filters.length > 0) && !controller.windowless
  const tableLike = m.layout !== 'tree' && m.defs.length > 1
  const hasFilterArea = m.searchable || m.filters.length > 0 || offersViews
  if (!m.toolbar.length && !hasFilterArea && !tableLike && !m.title) return null
  const viewValues: Dict = { ...(listing.searchText ? { searchText: listing.searchText } : {}), ...listing.filterValues }
  return (
    <>
      {hasFilterArea && (
      <div className="mateu-listing-filterbar">
        {m.searchable && (
          <form role="search" onSubmit={(e) => { e.preventDefault(); listing.search() }}>
            <TextInput
              ref={searchBox}
              leadingVisual={SearchIcon}
              aria-label={tx('searchNamed', { name: m.title || tx('theList') })}
              placeholder={tx('search')}
              value={listing.searchText}
              onChange={(e) => {
                listing.setSearchText(e.target.value)
                if (m.searchAsYouType) typed(e.target.value)
              }}
            />
          </form>
        )}
        {m.filters.length > 0 && <FilterPanel filters={m.filters} values={listing.filterValues} onApply={listing.setFilters} active={activeFilterCount(listing.filterValues)} />}
        {offersViews && <SavedViews scope={scope} values={viewValues} onApply={listing.applyView} />}
      </div>
      )}
      <Toolbar className="mateu-listing-toolbar" design="Transparent" accessibleNameRef={m.title ? titleId : undefined}>
        {m.title && <Title level="H2" size="H5" id={titleId}>{m.title}{total > 0 ? ` (${total})` : ''}</Title>}
        <ToolbarSpacer />
        <div className="mateu-listing-actions">
        {m.toolbar.map((raw, i) => {
          // a bulk action is disabled while no row is selected (the server's gate stays the backstop)
          const b = withSelectionGate(raw as never, selected) as Dict
          const run = () => {
            // Import (UploadEnabled): the file first, then `process-import` with its id
            if (buttonActionId(b as never) === 'import') return setImporting(true)
            void controller.runAction(buttonActionId(b as never), { crud_selected_items: selected })
          }
          const { onPress, disabled } = press(b, { state }, run, String(b['label'] ?? ''))
          return <ActionButton key={i} button={b} onPress={onPress} disabled={disabled} label={String(b['label'])} />
        })}
        {tableLike && <ColumnChooser defs={m.defs} prefs={columnPrefs.prefs} onChange={columnPrefs.update} />}
        </div>
      </Toolbar>
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onUploaded={(fileId) => { setImporting(false); void controller.runAction('process-import', { fileId }) }}
        />
      )}
    </>
  )
}

/** The search box takes the focus once, after the page's own route focus — and only if the user has acted. */
function useAutoFocus(on: boolean, ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    if (!on) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      const input = ref.current
      const active = document.activeElement
      if (input?.isConnected && mayTakeFocusOnItsOwn() && !active?.classList.contains('mateu-skip-link')) input.focus({ preventScroll: true })
    }))
    return () => cancelAnimationFrame(id)
  }, [on]) // eslint-disable-line react-hooks/exhaustive-deps
}

function useDebounced<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef(fn)
  latest.current = fn
  useEffect(() => () => clearTimeout(timer.current), [])
  return (...args: A) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => latest.current(...args), ms)
  }
}

/** The applied filters as removable tokens, and Clear filters. */
function AppliedFilters({ m, listing }: { m: Model; listing: Listing }) {
  if (activeFilterCount(listing.filterValues) === 0) return null
  return (
    <Stack direction="horizontal" gap="condensed" wrap="wrap" style={{ gridArea: 'filter', marginBottom: '0.5rem' }}>
      {filterTokens(m.filters, listing.filterValues).map((t) => (
        <Token key={t.key} text={t.text} onRemove={() => listing.setFilters(t.without)} />
      ))}
      <Button variant="invisible" size="small" onClick={() => listing.setFilters({})}>{tx('clearFilters')}</Button>
    </Stack>
  )
}

interface BodyProps {
  m: Model; metadata: Dict; state: Dict; data?: unknown; defs: ColDef[]; rows: Row[]; live: unknown; restError: string | null
  cellOf: (r: Row, c: ColDef) => React.ReactNode; linkColumn?: ColDef; titleId: string
  openRow: (r: Row) => void; opensRow: (r: Row) => boolean; sort: unknown; onSort: (f: string, d: 'ASC' | 'DESC') => void; selection: Selection
  onMore: (page: number) => void
}

/** The rows, in the layout the listing declares. */
function ListingBody(p: BodyProps) {
  const { m, defs, rows, cellOf } = p
  if (p.restError) return <Flash variant="danger" style={{ gridArea: 'table' }}>The rows could not be loaded: {p.restError}</Flash>
  if (rows.length === 0) {
    return (
      <div style={{ gridArea: 'table' }}>
        <Blankslate border>
          <Blankslate.Heading>{emptyMessageOf(p.live, p.metadata, tx('noData'))}</Blankslate.Heading>
        </Blankslate>
      </div>
    )
  }
  const actionsOf = m.actionColumns.length > 0 ? (row: Row) => <RowActions row={row} actionColumns={m.actionColumns} /> : undefined
  switch (m.layout) {
    case 'cards': return <Cards rows={rows} defs={defs} cellOf={cellOf} />
    case 'list': return <List rows={rows} defs={defs} onOpen={(r) => (p.opensRow(r) ? p.openRow(r) : undefined)} />
    case 'masterDetail': return <MasterDetail rows={rows} defs={defs} cellOf={cellOf} />
    case 'tree':
      return <TreeListing rows={rows} defs={defs} label={m.title || tx('rows')} onOpen={p.openRow} opens={p.opensRow} selectLabel={m.selector ? tx('select') : undefined} />
    default:
      if (m.detailPath) {
        return <DetailsTable rows={rows} defs={defs} detailPath={m.detailPath} cellOf={cellOf} actionsOf={actionsOf} labelledBy={m.title ? p.titleId : undefined} state={p.state} data={p.data} />
      }
      return <ListingTable {...p} actionsOf={actionsOf} />
  }
}

/** A group header row's label column cell: its text, and on the last column its @GroupAction buttons. */
function GroupCell({ row, col, m, labelColumnId, lastColumnId }: { row: Row; col: ColDef; m: Model; labelColumnId?: string; lastColumnId?: string }) {
  const controller = useController()
  const t = groupRowCellText(row as never, aggregatable(col), labelColumnId)
  const group = (row as unknown as GroupRow).__mateuGroup as unknown as Dict
  const hidden = (group['hiddenActions'] as string[] | undefined) ?? []
  const actions = col.fieldId === lastColumnId ? m.groupActions.filter((a) => !hidden.includes(String(a['actionId'] ?? a['id'] ?? ''))) : []
  if (!actions.length) return t ? <Text weight="semibold">{t}</Text> : null
  return (
    <Stack direction="horizontal" gap="condensed" align="center" justify="end">
      {t && <Text weight="semibold">{t}</Text>}
      {actions.map((a, i) => (
        <Button key={i} size="small" variant="invisible" onClick={() => void controller.runAction(`action-on-row-${String(a['actionId'] ?? a['id'] ?? '')}`, { _groupValue: group['value'] })}>
          {String(a['label'] ?? a['caption'] ?? '')}
        </Button>
      ))}
    </Stack>
  )
}

/**
 * A table: Fiori's responsive table (ui5-table) — sortable column headers, the multi-selection
 * feature, group header rows (and their actions), the totals under it and growing with "More".
 */
function ListingTable({ m, defs, rows, live, cellOf, titleId, sort, onSort, selection, actionsOf, metadata, opensRow, openRow, onMore }: BodyProps & { actionsOf?: (r: Row) => React.ReactNode }) {
  const listing = extractListing<ListingData>(live)
  const paging = pagingOf(live)
  const displayRows = interleaveGroupRows(rows, m.groupBy, listing?.groups) as Row[]
  const labelColumnId = groupLabelColumnId(m.groupBy, defs.map((c) => c.fieldId))
  const lastColumnId = defs[defs.length - 1]?.fieldId ?? ''
  const footers = buildAggregateFooters(defs.map(aggregatable), listing, m.groupBy)
  const metaOf = (fieldId: string) => m.columnMetas.find((cm) => String(cm['id'] ?? '') === fieldId) ?? {}
  const sorted = initialSortOf(sort, defs) as { initialSortColumn?: string; initialSortDirection?: 'ASC' | 'DESC' }
  const [sortState, setSortState] = useState<{ col?: string; dir?: 'ASC' | 'DESC' }>({ col: sorted.initialSortColumn, dir: sorted.initialSortDirection })
  const keyOf = (r: Row) => String(isGroupRow(r) ? `g:${(r as unknown as Dict)['_rowNumber']}` : r['__mateuRowKey'])
  const selectedKeys = selection.rows.map((r) => rows.find((x) => String(x['id'] ?? '') === String(r['id'] ?? '') && String(r['id'] ?? '') !== '')).filter(Boolean).map((r) => keyOf(r!)).join(' ')
  const footerText = footers
    ? defs.filter((c) => footers[c.fieldId] !== undefined).map((c, i) => (i === 0 && !c.aggregate ? footers[c.fieldId] : `${c.label}: ${footers[c.fieldId]}`)).join(' · ')
    : ''
  const more = paging.totalElements > rows.length && paging.pageSize > 0
  return (
    <div className={['mateu-listing-table', m.looks, m.contentHeight ? 'mateu-listing-scroll' : ''].filter(Boolean).join(' ')} style={m.contentHeight ? { maxHeight: m.contentHeight } : undefined}>
      <Ui5Table
        accessibleNameRef={m.title ? titleId : undefined}
        overflowMode="Popin"
        alternateRowColors={metadata['rowStripes'] === true || undefined}
        className={metadata['compact'] === true ? 'mateu-compact-table' : undefined}
        onRowClick={(e: CustomEvent<{ row: HTMLElement }>) => {
          const row = displayRows.find((r) => keyOf(r) === e.detail.row.getAttribute('row-key'))
          if (row && !isGroupRow(row) && opensRow(row)) openRow(row)
        }}
        features={(
          <>
            {selection.enabled && (
              <TableSelectionMulti slot="features" selected={selectedKeys}
                onChange={(e: Event) => {
                  const keys = new Set(String((e.target as unknown as { selected?: string }).selected ?? '').split(' ').filter(Boolean))
                  selection.change(rows.filter((r) => keys.has(keyOf(r))))
                }} />
            )}
            {more && (
              <TableGrowing slot="features" mode="Button" text={tx('showMore')} subtext={`[${rows.length}/${paging.totalElements}]`}
                onLoadMore={() => onMore(paging.pageNumber + 1)} />
            )}
          </>
        )}
        headerRow={(
          <TableHeaderRow slot="headerRow" sticky>
            {defs.map((col) => {
              const g = columnGeometry(metaOf(col.fieldId), col.dataType)
              const dir = sortState.col === col.fieldId ? sortState.dir : undefined
              return (
                <TableHeaderCell key={col.fieldId} width={g.width === 'grow' ? undefined : g.width} minWidth={g.minWidth}
                  horizontalAlign={g.centered ? 'Center' : g.align === 'end' ? 'End' : 'Start'}
                  sortIndicator={dir === 'ASC' ? 'Ascending' : dir === 'DESC' ? 'Descending' : 'None'}
                  interactive={col.sortable || undefined}
                  onClick={col.sortable ? () => {
                    const next: 'ASC' | 'DESC' = dir === 'ASC' ? 'DESC' : 'ASC'
                    setSortState({ col: col.fieldId, dir: next })
                    onSort(col.fieldId, next)
                  } : undefined}
                  aria-sort={dir === 'ASC' ? 'ascending' : dir === 'DESC' ? 'descending' : undefined}>
                  {col.label}
                </TableHeaderCell>
              )
            })}
            {actionsOf && <TableHeaderCell width="auto" horizontalAlign="End"><span className="sr-only">{tx('actions')}</span></TableHeaderCell>}
          </TableHeaderRow>
        )}
        noData={<div slot="noData">{emptyMessageOf(live, metadata, tx('noData'))}</div>}
      >
        {displayRows.map((row) => {
          const group = isGroupRow(row)
          return (
            <TableRow key={keyOf(row)} rowKey={keyOf(row)} interactive={(!group && opensRow(row)) || undefined} className={group ? 'mateu-group-row' : undefined}>
              {defs.map((col) => {
                const g = columnGeometry(metaOf(col.fieldId), col.dataType)
                return (
                  <TableCell key={col.fieldId} horizontalAlign={g.centered ? 'Center' : g.align === 'end' ? 'End' : 'Start'}>
                    {group ? <GroupCell row={row} col={col} m={m} labelColumnId={labelColumnId} lastColumnId={lastColumnId} /> : cellOf(row, col)}
                  </TableCell>
                )
              })}
              {actionsOf && <TableCell horizontalAlign="End">{group ? null : actionsOf(row)}</TableCell>}
            </TableRow>
          )
        })}
      </Ui5Table>
      {/* the totals of the whole filtered set (Crud aggregates), under the rows */}
      {footerText && <Text as="p" weight="semibold" className="mateu-listing-totals">{footerText}</Text>}
    </div>
  )
}
