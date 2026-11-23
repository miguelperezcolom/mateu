import React, { useEffect, useRef, useState } from 'react'
import { Button, Flash, Stack, Text, Token } from '@kit'
import { Blankslate, DataTable, Table } from '@kit'
import { interpolate } from '@rn/core/expressions'
import { rowOpenOf, rowPressOf } from '@rn/core/rowOpen'
import { groupRowCellText, type AggregatableColumn, type GroupRow } from '@rn/core/listingGroups'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'
import { activeFilterCount, columnDefsOf, emptyMessageOf, firstRowAction, pagingOf, type ColDef } from '@rn/renderer/crudListing'
import { publishDragSelection } from '@infra/ui/dragAndDrop.ts'
import { useController } from '@mr/render/ViewHost'
import { ComponentRenderer } from './ComponentRenderer'
import { ROW_ACTION_TYPES, rowKeyOf, withoutRowKey, type Dict, type Row } from '@mr/listing/rows'
import { filterTokens } from './listing/filters'
import { RowActions, useCellRenderer } from './listing/cells'
import { Cards, List, MasterDetail, TreeListing } from './listing/layouts'
import { DetailsTable } from './listing/DetailsTable'
import { useColumnPrefs } from './listing/ColumnChooser'
import { useListing } from '@mr/listing/useListing'
import { tableLookClasses } from './listing/geometry'
import { mayTakeFocusOnItsOwn, watchForInteraction } from '@infra/a11y/initialFocus.ts'
import { ListingActions } from './ListingToolbar'
import { ListingTable } from './ListingTable'
import { ListingPager, useLoadedRows } from './ListingPager'
import { ListingFrame } from './ListingFrame'
import { tx } from '@mr/i18n/texts'
import './listing/listing.css'
// a listing may put the focus in its search box only once the user has acted on the page
watchForInteraction()

export const aggregatable = (c: ColDef): AggregatableColumn => ({ id: c.fieldId, dataType: c.dataType, stereotype: c.stereotype, aggregate: c.aggregate || undefined })
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
export type Model = ReturnType<typeof listingModel>
type Controller = ReturnType<typeof useController>

/**
 * A listing (Crud): its frame (ListingFrame) with the title, the toolbar (ListingToolbar: search box,
 * filters, saved views, the column chooser, the listing's actions), the rows (a table — ListingTable,
 * with @Details rows when it has them —, cards, a list, a master/detail or a tree, as the listing
 * declares), group headers and totals, and the pages (ListingPager). Those four pieces are what a
 * design system draws its own way (each its own file, overridden alone). The listing LOGIC is the React Native renderer's and the web renderer's,
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
  const loaded = useLoadedRows(m.infinite, paging)
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
      <ListingFrame m={m} titleId={titleId}
        toolbar={<ListingActions m={m} listing={listing} scope={scope} columnPrefs={columnPrefs} state={state} selected={selection.rows} titleId={titleId} total={paging.totalElements} />}>
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
        <ListingPager m={m} paging={paging} loaded={dataRows.length} onPage={listing.toPage} />
      </ListingFrame>
      {m.footer.map((f, i) => <ComponentRenderer key={`f${i}`} component={f} state={state} data={data} />)}
    </>
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
export type Listing = ReturnType<typeof useListing>

/** The search box takes the focus once, after the page's own route focus — and only if the user has acted. */
export function useAutoFocus(on: boolean, ref: React.RefObject<HTMLInputElement | null>) {
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

export function useDebounced<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
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
    <Stack direction="horizontal" gap="condensed" wrap="wrap" style={{ gridArea: 'filter', marginBottom: 'var(--base-size-8)' }}>
      {filterTokens(m.filters, listing.filterValues).map((t) => (
        <Token key={t.key} text={t.text} onRemove={() => listing.setFilters(t.without)} />
      ))}
      <Button variant="invisible" size="small" onClick={() => listing.setFilters({})}>{tx('clearFilters')}</Button>
    </Stack>
  )
}

export interface BodyProps {
  m: Model; metadata: Dict; state: Dict; data?: unknown; defs: ColDef[]; rows: Row[]; live: unknown; restError: string | null
  cellOf: (r: Row, c: ColDef) => React.ReactNode; linkColumn?: ColDef; titleId: string
  openRow: (r: Row) => void; opensRow: (r: Row) => boolean; sort: unknown; onSort: (f: string, d: 'ASC' | 'DESC') => void; selection: Selection
  /** Loads that page (a design system that grows a table asks for the next one). */
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
export function GroupCell({ row, col, m, labelColumnId, lastColumnId }: { row: Row; col: ColDef; m: Model; labelColumnId?: string; lastColumnId?: string }) {
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

