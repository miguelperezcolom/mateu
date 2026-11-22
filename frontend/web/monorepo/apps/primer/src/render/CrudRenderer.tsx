import React, { useEffect, useState } from 'react'
import {
  ActionList, ActionMenu, Avatar, Button, Checkbox, CheckboxGroup, FormControl, IconButton, Label, Link, Select, Stack, Text,
  TextInput, Token, AnchoredOverlay, Flash,
} from '@primer/react'
import { Blankslate, DataTable, Table } from '@primer/react/experimental'
import { CheckIcon, FilterIcon, KebabHorizontalIcon, SearchIcon } from '@primer/octicons-react'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { buttonActionId } from '@rn/core/uxRules'
import { rowOpenOf, rowPressOf, rowRouteFields } from '@rn/core/rowOpen'
import { routeQueryOf } from '@rn/core/componentContext'
import { fetchExternalJson, getByPath, mapItemsToRows } from '@rn/core/restFetch'
import { restListingPage } from '@rn/core/restListing'
import {
  buildAggregateFooters, groupLabelColumnId, groupRowCellText, interleaveGroupRows, isGroupRow,
  type AggregatableColumn, type ListingData,
} from '@rn/core/listingGroups'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'
import { cellText } from '@rn/renderer/cellText'
import {
  activeFilterCount, applySearchToState, cardLayoutOf, cellTone, columnDefsOf, emptyMessageOf, extractListing, firstRowAction,
  isBlankFilterValue, listRowModel, normalizeCrudData, pagingOf, pictureUrlOf, type ColDef,
} from '@rn/renderer/crudListing'
import { useController } from './ViewHost'
import { useButtonPress } from './useButtonPress'
import { labelVariantOf } from './looks'
import { ActionButton } from './PageRenderer'
import { filterKeysOf, listingStateFromUrl, writeListingUrl } from './listingUrl'
import { dragMimeOf, publishDragSelection } from '@infra/ui/dragAndDrop.ts'

type Dict = Record<string, unknown>
type Row = Dict

const NUMERIC = new Set(['integer', 'int', 'number', 'money', 'double', 'decimal', 'long', 'float'])
const ROW_ACTION_TYPES = new Set(['actionGroup', 'menu', 'action'])

/**
 * A listing (Crud) as Primer's DataTable inside Table.Container: title, search box, filters and
 * toolbar above; the rows (a table, or cards / a list when the listing declares that layout); group
 * headers and totals; Table.Pagination. The listing LOGIC is the React Native renderer's, imported
 * in place — what a row opens, the columns, the paging, how search and filters are written into the
 * state, a REST source's rows (fetched whole and paged in memory, or paged by the server when the
 * source names a totalPath), groups and aggregates.
 */
export function CrudRenderer({ component, metadata, state, data }: { component: Dict; metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const press = useButtonPress()
  const id = String(component['id'] ?? 'crud')
  const title = interpolate(String(metadata['title'] ?? ''), { state })
  const subtitle = interpolate(String(metadata['subtitle'] ?? ''), { state })
  const searchable = metadata['searchable'] === true
  const columns = flattenColumnGroups((metadata['columns'] as Dict[] | undefined) ?? []) as { metadata?: Dict; id?: string }[]
  const columnMetas = columns.map((c) => (c.metadata ?? {}) as Dict)
  const rowOpen = rowOpenOf(metadata['rowRoute'], columnMetas)
  const defs = columnDefsOf(columns as never, rowOpen)
  const actionColumns = columnMetas.filter((cm) => ROW_ACTION_TYPES.has(String(cm['dataType'] ?? '')))
  const toolbar = ((metadata['toolbar'] as Dict[] | undefined) ?? []).filter((b) => b && b['label'])
  const selectable = metadata['rowsSelectionEnabled'] === true
  const filters = ((metadata['filters'] as Dict[] | undefined) ?? []).filter((f) => f && f['fieldId'])
  const groupBy = String(metadata['groupBy'] ?? '')
  const layout = String(metadata['gridLayout'] ?? metadata['listingType'] ?? 'auto')
  // @DragRows: rows travel to a DropZone (dragged, or — keyboard — the selection a zone offers to move)
  const dragType = typeof metadata['dragType'] === 'string' && metadata['dragType'] ? String(metadata['dragType']) : ''
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  useEffect(() => { if (dragType) publishDragSelection(dragType, selectedIds) }, [dragType, selectedIds])
  useEffect(() => () => { if (dragType) publishDragSelection(dragType, []) }, [dragType])

  // a top-level listing owns the address bar's query (an island or an overlay's listing does not)
  const ownsUrl = !controller.windowless
  const filterKeys = filterKeysOf(filters)
  const [fromUrl] = useState(() => (ownsUrl ? listingStateFromUrl(window.location.search, filterKeys) : null))
  const [live, setLive] = useState<unknown>(() => normalizeCrudData(data))
  const [searchText, setSearchText] = useState(fromUrl?.searchText ?? String(controller.currentComponentState['searchText'] ?? ''))
  // a filter the route or the URL names (a menu entry for one view of the listing, a shared link) starts set
  const [filterValues, setFilterValues] = useState<Dict>(() => {
    const query = routeQueryOf(controller.currentRoute)
    const fromRoute = Object.fromEntries(filters.filter((f) => query[String(f['fieldId'])] !== undefined).map((f) => [String(f['fieldId']), query[String(f['fieldId'])]]))
    return { ...fromRoute, ...(fromUrl?.filters ?? {}) }
  })
  useEffect(() => {
    const onData = (d: unknown) => setLive(normalizeCrudData(d))
    controller.registerDataHandler(id, onData)
    controller.registerDataHandler('crud', onData)
  }, [controller, id])

  // ---- a REST source (`rowsSource`): rows fetched in the browser (or through the server's proxy)
  const rowsSource = metadata['rowsSource'] as Dict | undefined
  const sources = controller.session.sources
  const resolved = rowsSource ? (sources.resolve(rowsSource) as Dict) : undefined
  const restTotalPath = rowsSource ? sources.serverTotalPath(rowsSource) : undefined
  const restPageSize = Number(metadata['pageSize'] ?? 0) || 0
  if (rowsSource && restTotalPath && restPageSize > 0) controller.currentComponentState['size'] ??= restPageSize
  const columnIds = [...new Set([
    ...columnMetas.map((cm) => String(cm['id'] ?? '')),
    ...columnMetas.flatMap((cm) => ['captionPath', 'leadingPath', 'tooltipPath'].map((k) => cm[k])),
    ...rowRouteFields(metadata['rowRoute']),
  ].filter((f): f is string => typeof f === 'string' && !!f))]
  const restState = () => ({ ...state, ...controller.currentComponentState })
  const restResolve = (t: unknown): string => interpolate(String(t ?? ''), { state: restState(), appState: controller.session.appState })
  const rowsUrl = resolved ? restResolve(resolved['url']) : ''
  const [restRows, setRestRows] = useState<Row[]>([])
  const [restRequest, setRestRequest] = useState(0)
  const [restError, setRestError] = useState<string | null>(null)
  const showRestPage = (rows: Row[]) => setLive({
    page: restListingPage(rows, { columnIds, filters: filters as never, state: controller.currentComponentState, pageSize: restPageSize }),
  })
  const refreshRest = () => (restTotalPath ? setRestRequest((n) => n + 1) : showRestPage(restRows))
  useEffect(() => {
    if (!rowsSource || !resolved) return
    let cancelled = false
    setRestError(null)
    const json = sources.viaProxy(rowsSource)
      ? controller.fetchViaProxy('rows', id)
      : fetchExternalJson(rowsSource, restResolve, (t) => interpolateUrl(String(t ?? ''), { state: restState(), appState: controller.session.appState }), sources)
    json.then((j) => {
      if (cancelled) return
      const rows = mapItemsToRows(j, resolved['itemsPath'] as string | undefined, columnIds, (f) => sources.pathOfField(rowsSource, f)) as Row[]
      setRestRows(rows)
      if (restTotalPath) {
        const total = Number(getByPath(j, restTotalPath))
        setLive({ page: {
          content: rows,
          totalElements: Number.isFinite(total) ? total : rows.length,
          pageSize: restPageSize || rows.length || 1,
          pageNumber: Number(controller.currentComponentState['page'] ?? 0) || 0,
        } })
      } else {
        showRestPage(rows)
      }
    }).catch((e: unknown) => { if (!cancelled) setRestError(e instanceof Error ? e.message : String(e)) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsUrl, restRequest])

  // ---- search, filters, sort, page: written into the state, then a search (or the REST rows again)
  const runSearch = () => {
    if (ownsUrl) writeListingUrl(controller.currentComponentState, filterKeys)
    if (rowsSource) return refreshRest()
    void controller.runAction('search')
  }
  // a link that asked for a search, filters, a page or a sort: applied once, on arrival
  useEffect(() => {
    if (!fromUrl) return
    if (!rowsSource) controller.seedSearchState()
    applySearchToState(controller.currentComponentState, fromUrl.searchText ?? '', fromUrl.filters)
    if (fromUrl.page) controller.currentComponentState['page'] = fromUrl.page
    if (fromUrl.sort) controller.currentComponentState['sort'] = fromUrl.sort
    if (rowsSource) return refreshRest()
    void controller.runAction('search')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const search = (values: Dict = filterValues, text: string = searchText) => {
    if (!rowsSource) controller.seedSearchState()
    applySearchToState(controller.currentComponentState, text, values)
    runSearch()
  }
  const setFilters = (values: Dict) => {
    for (const k of Object.keys(filterValues)) if (!(k in values)) delete controller.currentComponentState[k]
    setFilterValues(values)
    search(values)
  }
  const toPage = (pageIndex: number) => {
    if (!rowsSource) controller.seedSearchState()
    controller.currentComponentState['page'] = pageIndex
    runSearch()
  }
  const sortBy = (field: string, direction: 'ASC' | 'DESC') => {
    if (!rowsSource) controller.seedSearchState()
    const d = direction === 'ASC' ? 'ascending' : 'descending'
    controller.currentComponentState['sort'] = [{ field, direction: d, fieldId: field }]
    controller.currentComponentState['page'] = 0
    runSearch()
  }

  const openRow = (row: Row) => {
    if (rowOpen) {
      const p = rowPressOf(rowOpen, row)
      if (p?.kind === 'url') { if (/^https?:/i.test(p.url)) window.open(p.url, '_blank', 'noopener') }
      else if (p?.kind === 'route') controller.session.openView({ label: '', route: p.route, consumedRoute: '', serverSideType: '' })
      else if (p) void controller.runAction(p.actionId, withoutRowKey(p.parameters))
      return
    }
    const fallback = firstRowAction(columns as never, row)
    if (fallback) void controller.runAction(fallback, { _clickedRow: withoutRowKey(row) })
  }
  const opensRow = (row: Row) => !!rowOpen || !!firstRowAction(columns as never, row)

  const paging = pagingOf(live)
  const listing = extractListing<ListingData>(live)
  const dataRows = paging.rows.map((r, i) => ({ ...r, __mateuRowKey: rowKeyOf(r, i) }))
  const displayRows = interleaveGroupRows(dataRows, groupBy, listing?.groups) as Row[]
  const aggregatable = (c: ColDef): AggregatableColumn => ({ id: c.fieldId, dataType: c.dataType, stereotype: c.stereotype, aggregate: c.aggregate || undefined })
  const labelColumnId = groupLabelColumnId(groupBy, defs.map((c) => c.fieldId))
  const footers = buildAggregateFooters(defs.map(aggregatable), listing, groupBy)

  // the column that names the row opens it (Primer's pattern: the row header is a link)
  const linkColumn = defs.find((c) => c.identifier) ?? defs.find((c) => !c.display) ?? defs[0]
  const editorOf = (fieldId: string) => columnMetas.find((cm) => String(cm['id'] ?? '') === fieldId) ?? {}
  const cellOf = (row: Row, col: ColDef): React.ReactNode => {
    const value = row[col.fieldId]
    if (col.editable) return <EditableCell row={row} col={col} editor={editorOf(col.fieldId)} />
    const tone = cellTone(value, col)
    const text = cellText(value, col.valueLabels, col)
    if (col.stereotype === 'image') {
      const src = pictureUrlOf(value)
      return src ? <Avatar src={src} size={24} alt="" square /> : null
    }
    if (tone) return <Label variant={labelVariantOf({ color: tone })}>{text}</Label>
    // a boolean cell: a check or a dash, named for a screen reader (never "true"/"false")
    if (col.dataType === 'bool' || col.dataType === 'boolean' || typeof value === 'boolean') {
      const on = value === true || value === 'true'
      return on
        ? <span role="img" aria-label="Yes" style={{ color: 'var(--fgColor-success)' }}><CheckIcon /></span>
        : <span role="img" aria-label="No" style={{ color: 'var(--fgColor-muted)' }}>—</span>
    }
    if (col === linkColumn && dragType) {
      // the row's handle: the selection when this row is in it, else the row itself
      const rowId = String(row['id'] ?? '')
      return (
        <span
          draggable
          onDragStart={(e) => {
            const ids = selectedIds.includes(rowId) ? selectedIds : [rowId]
            e.dataTransfer.setData(dragMimeOf(dragType), JSON.stringify(ids))
            e.dataTransfer.effectAllowed = 'move'
          }}
          style={{ cursor: 'grab' }}
          title="Drag to move"
        >
          {opensRow(row) ? <Link as="button" type="button" onClick={() => openRow(row)} style={{ textAlign: 'start' }}>{text || 'Open'}</Link> : text}
        </span>
      )
    }
    if (col === linkColumn && opensRow(row)) {
      return <Link as="button" type="button" onClick={() => openRow(row)} style={{ textAlign: 'start' }}>{text || 'Open'}</Link>
    }
    if (col.cellAction) {
      return <Button size="small" onClick={() => void controller.runAction(col.cellAction, { ...withoutRowKey(row) })}>{text || col.label}</Button>
    }
    return text
  }

  const tableColumns: Dict[] = defs.map((col) => ({
    id: col.fieldId,
    header: col.label,
    field: col.fieldId,
    rowHeader: col === linkColumn,
    sortBy: col.sortable ? true : undefined,
    align: NUMERIC.has(col.dataType) ? 'end' : undefined,
    renderCell: (row: Row) => {
      if (isGroupRow(row)) {
        const t = groupRowCellText(row as never, aggregatable(col), labelColumnId)
        return t ? <Text weight="semibold">{t}</Text> : null
      }
      return cellOf(row, col)
    },
  }))
  if (actionColumns.length > 0) {
    tableColumns.push({
      id: '__mateuRowActions',
      header: () => <span className="sr-only">Actions</span>,
      align: 'end',
      width: 'auto',
      renderCell: (row: Row) => (isGroupRow(row) ? null : <RowActions row={row} actionColumns={actionColumns} />),
    })
  }

  const titleId = `${id}-title`
  const activeFilters = activeFilterCount(filterValues)
  const empty = dataRows.length === 0
  const footerText = footers
    ? defs.filter((c) => footers[c.fieldId] !== undefined).map((c, i) => (i === 0 && !c.aggregate ? footers[c.fieldId] : `${c.label}: ${footers[c.fieldId]}`)).join(' · ')
    : ''

  return (
    <Table.Container>
      {title && <Table.Title as="h2" id={titleId}>{title}</Table.Title>}
      {subtitle && <Table.Subtitle as="p" id={`${id}-subtitle`}>{subtitle}</Table.Subtitle>}
      {(toolbar.length > 0 || searchable || filters.length > 0) && (
        <Table.Actions>
          <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
            {searchable && (
              <form role="search" onSubmit={(e) => { e.preventDefault(); search() }}>
                <TextInput
                  leadingVisual={SearchIcon}
                  aria-label={`Search ${title || 'the list'}`}
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </form>
            )}
            {filters.length > 0 && <FilterPanel filters={filters} values={filterValues} onApply={setFilters} active={activeFilters} />}
            {toolbar.map((b, i) => {
              const { onPress, disabled } = press(b, { state }, () => void controller.runAction(buttonActionId(b as never)), String(b['label'] ?? ''))
              return <ActionButton key={i} button={b} onPress={onPress} disabled={disabled} label={String(b['label'])} />
            })}
          </Stack>
        </Table.Actions>
      )}
      {activeFilters > 0 && (
        <Stack direction="horizontal" gap="condensed" wrap="wrap" style={{ gridArea: 'filter', marginBottom: 'var(--base-size-8)' }}>
          {filterTokens(filters, filterValues).map((t) => (
            <Token key={t.key} text={t.text} onRemove={() => setFilters(t.without)} />
          ))}
          <Button variant="invisible" size="small" onClick={() => setFilters({})}>Clear filters</Button>
        </Stack>
      )}
      {restError ? (
        <Flash variant="danger" style={{ gridArea: 'table' }}>The rows could not be loaded: {restError}</Flash>
      ) : empty ? (
        <div style={{ gridArea: 'table' }}>
          <Blankslate border>
            <Blankslate.Heading>{emptyMessageOf(live, metadata, 'No data')}</Blankslate.Heading>
          </Blankslate>
        </div>
      ) : layout === 'cards' ? (
        <Cards rows={dataRows} defs={defs} cellOf={cellOf} />
      ) : layout === 'list' || layout === 'masterDetail' ? (
        <List rows={dataRows} defs={defs} onOpen={(r) => (opensRow(r) ? openRow(r) : undefined)} />
      ) : (
        <div style={{ gridArea: 'table' }}>
        <DataTable
          aria-labelledby={title ? titleId : undefined}
          data={displayRows as never[]}
          columns={tableColumns as never}
          getRowId={(r: Row) => String(isGroupRow(r) ? (r as unknown as Dict)['_rowNumber'] : r['__mateuRowKey'])}
          externalSorting
          {...initialSortOf(controller.currentComponentState['sort'] ?? fromUrl?.sort, defs)}
          onToggleSort={(columnId: unknown, direction: 'ASC' | 'DESC') => sortBy(String(columnId), direction)}
          rowSelection={selectable || !!dragType || undefined}
          onSelectionChange={selectable || dragType ? ({ selectedRows }: { selectedRows: Set<string | number> }) => {
            controller.currentComponentState['crud_selected_items'] = dataRows.filter((r) => selectedRows.has(String(r['__mateuRowKey']))).map(withoutRowKey)
            controller.currentComponentState[`${id}_selected_items`] = controller.currentComponentState['crud_selected_items']
            setSelectedIds(dataRows.filter((r) => selectedRows.has(String(r['__mateuRowKey']))).map((r) => String((r as Row)['id'] ?? '')).filter(Boolean))
          } : undefined}
        />
        {/* the totals of the whole filtered set (Crud aggregates), under the rows */}
        {footerText && (
          <Text as="p" weight="semibold" style={{ margin: 'var(--base-size-8) var(--base-size-16) 0', textAlign: 'end' }}>{footerText}</Text>
        )}
        </div>
      )}
      {paging.totalElements > paging.pageSize && paging.pageSize > 0 && (
        <Table.Pagination
          key={`${paging.pageNumber}-${paging.totalElements}`}
          aria-label={`Pages of ${title || 'the list'}`}
          pageSize={paging.pageSize}
          totalCount={paging.totalElements}
          defaultPageIndex={paging.pageNumber}
          onChange={({ pageIndex }: { pageIndex: number }) => toPage(pageIndex)}
        />
      )}
      {paging.totalElements > 0 && paging.totalElements <= paging.pageSize && (
        <Text as="p" size="small" style={{ gridArea: 'footer', color: 'var(--fgColor-muted)' }}>{paging.totalElements} {paging.totalElements === 1 ? 'item' : 'items'}</Text>
      )}
    </Table.Container>
  )
}

/**
 * An @InlineEditing cell: the editor its column asks for, committed on the user's own change event
 * (never on a value notification), for the row the edit started on, and only when the value really
 * changed — then the crud's `update-row` with `_editedRow` and `_editedField` (the server writes that
 * one cell over the stored record), and the listing searches again.
 */
function EditableCell({ row, col, editor }: { row: Row; col: ColDef; editor: Dict }) {
  const controller = useController()
  const original = row[col.fieldId]
  const [value, setValue] = useState<unknown>(original)
  useEffect(() => setValue(original), [original])
  const commit = async (v: unknown) => {
    if (String(v ?? '') === String(original ?? '')) return
    const edited = { ...withoutRowKey(row), [col.fieldId]: v }
    await controller.runAction('update-row', { _editedRow: edited, _editedField: col.fieldId })
    void controller.runAction('search')
  }
  const type = String(editor['editorType'] ?? col.dataType ?? 'string')
  const label = `${col.label}`
  const options = (((editor['editorOptions'] as Dict[] | undefined) ?? (editor['options'] as Dict[] | undefined)) ?? [])
    .map((o) => ({ value: String(o['value'] ?? ''), label: String(o['label'] ?? o['value'] ?? '') }))
  if (type === 'bool' || type === 'boolean' || typeof original === 'boolean') {
    return <Checkbox aria-label={label} checked={value === true || value === 'true'} onChange={(e) => { setValue(e.target.checked); void commit(e.target.checked) }} />
  }
  if (options.length > 0 || type === 'select' || type === 'enum') {
    return (
      <Select size="small" aria-label={label} value={String(value ?? '')} onChange={(e) => { setValue(e.target.value); void commit(e.target.value) }}>
        {options.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
      </Select>
    )
  }
  const numeric = NUMERIC.has(type) || typeof original === 'number'
  return (
    <TextInput
      size="small"
      aria-label={label}
      type={numeric ? 'number' : type === 'date' ? 'date' : 'text'}
      step={numeric ? 'any' : undefined}
      value={String(value ?? '')}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => void commit(numeric ? (value === '' ? null : Number(value)) : value)}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      style={{ width: '100%' }}
    />
  )
}

/** The row's actions (an action / actionGroup / menu column): a kebab menu, Primer's row-actions pattern. */
function RowActions({ row, actionColumns }: { row: Row; actionColumns: Dict[] }) {
  const controller = useController()
  const actions = actionColumns.flatMap((cm) => (((row[String(cm['id'] ?? '')] as Dict | undefined)?.['actions'] as Dict[] | undefined) ?? []))
  if (actions.length === 0) return null
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} variant="invisible" size="small" aria-label="Row actions" />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          {actions.map((a, i) => (
            <ActionList.Item
              key={i}
              variant={String(a['methodNameInCrud'] ?? '').toLowerCase().includes('delete') ? 'danger' : 'default'}
              onSelect={() => void controller.runAction(`action-on-row-${String(a['methodNameInCrud'] ?? a['actionId'] ?? '')}`, { _clickedRow: withoutRowKey(row) })}
            >
              {String(a['label'] ?? a['methodNameInCrud'] ?? '')}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

/** gridLayout = cards: one bordered box per row, its picture and title first (the title opens it). */
function Cards({ rows, defs, cellOf }: { rows: Row[]; defs: ColDef[]; cellOf: (r: Row, c: ColDef) => React.ReactNode }) {
  const { picture, columns } = cardLayoutOf(defs)
  const [head, ...rest] = columns
  return (
    <div style={{ gridArea: 'table', display: 'grid', gap: 'var(--stack-gap-normal)', gridTemplateColumns: 'repeat(auto-fill, minmax(min(16rem, 100%), 1fr))' }}>
      {rows.map((row) => {
        const src = picture ? pictureUrlOf(row[picture.fieldId]) : undefined
        return (
          <div key={String(row['__mateuRowKey'])} style={{ border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)', background: 'var(--bgColor-default)', overflow: 'hidden' }}>
            {src && <img src={src} alt="" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />}
            <div style={{ padding: 'var(--base-size-16)', display: 'grid', gap: 'var(--base-size-4)' }}>
              {head && <Text weight="semibold">{cellOf(row, head)}</Text>}
              {rest.map((c) => (
                <div key={c.fieldId} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--base-size-8)' }}>
                  <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{c.label}</Text>
                  <Text size="small">{cellOf(row, c)}</Text>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** gridLayout = list (and masterDetail's rail): Primer's ActionList, the row's headline, line and chips. */
function List({ rows, defs, onOpen }: { rows: Row[]; defs: ColDef[]; onOpen: (r: Row) => void }) {
  return (
    <div style={{ gridArea: 'table', border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)' }}>
      <ActionList showDividers>
        {rows.map((row) => {
          const model = listRowModel(row, defs, (v, c) => cellText(v, c.valueLabels, c as never))
          return (
            <ActionList.Item key={String(row['__mateuRowKey'])} onSelect={() => onOpen(row)}>
              {model.leading && <ActionList.LeadingVisual><Avatar src={model.leading} alt="" /></ActionList.LeadingVisual>}
              {model.headline}
              {model.supporting && <ActionList.Description variant="block">{model.supporting}</ActionList.Description>}
              {model.chips.length > 0 && (
                <ActionList.TrailingVisual>
                  <Stack direction="horizontal" gap="condensed">
                    {model.chips.map((c, i) => <Label key={i} variant={labelVariantOf({ color: c.tone })}>{c.label}</Label>)}
                  </Stack>
                </ActionList.TrailingVisual>
              )}
            </ActionList.Item>
          )
        })}
      </ActionList>
    </div>
  )
}

/**
 * The listing's filters: a Filter button opening a panel with one control per filter, each the
 * widget its type asks for (options → a select, multiSelect → checkboxes, boolean → Yes / No,
 * dateRange / numberRange → from–to, else a text input). Applied, they become the tokens above the
 * rows. The state keys are the crud's: `<field>`, `<field>_from` / `<field>_to`, a value list.
 */
function FilterPanel({ filters, values, onApply, active }: { filters: Dict[]; values: Dict; onApply: (v: Dict) => void; active: number }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Dict>(values)
  useEffect(() => { if (open) setDraft(values) }, [open, values])
  const set = (k: string, v: unknown) => setDraft((d) => {
    const next = { ...d }
    if (isBlankFilterValue(v) || (Array.isArray(v) && v.length === 0)) delete next[k]
    else next[k] = v
    return next
  })
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => (
        <Button {...props} leadingVisual={FilterIcon} count={active || undefined}>Filter</Button>
      )}
      overlayProps={{ role: 'dialog', 'aria-label': 'Filter', width: 'medium' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <form
        style={{ padding: 'var(--base-size-16)', display: 'grid', gap: 'var(--stack-gap-normal)', maxHeight: '70vh', overflow: 'auto' }}
        onSubmit={(e) => { e.preventDefault(); onApply(draft); setOpen(false) }}
      >
        {filters.map((f) => <FilterControl key={String(f['fieldId'])} filter={f} values={draft} set={set} />)}
        <Stack direction="horizontal" justify="end" gap="condensed">
          <Button type="button" variant="invisible" onClick={() => { onApply({}); setOpen(false) }}>Clear</Button>
          <Button type="submit" variant="primary">Apply</Button>
        </Stack>
      </form>
    </AnchoredOverlay>
  )
}

function FilterControl({ filter, values, set }: { filter: Dict; values: Dict; set: (k: string, v: unknown) => void }) {
  const fieldId = String(filter['fieldId'])
  const label = String(filter['label'] ?? fieldId)
  const stereotype = String(filter['stereotype'] ?? '')
  const dataType = String(filter['dataType'] ?? '')
  const options = optionsOf(filter)
  if (stereotype === 'dateRange' || stereotype === 'numberRange') {
    const type = stereotype === 'dateRange' ? (dataType === 'dateTime' || dataType === 'datetime' ? 'datetime-local' : 'date') : 'number'
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 'var(--base-text-weight-semibold)' as never, fontSize: 'var(--text-body-size-medium)', marginBottom: 'var(--base-size-4)' }}>{label}</legend>
        <Stack direction="horizontal" gap="condensed">
          <TextInput type={type} aria-label={`${label} from`} placeholder="From" value={String(values[`${fieldId}_from`] ?? '')} onChange={(e) => set(`${fieldId}_from`, e.target.value)} />
          <TextInput type={type} aria-label={`${label} to`} placeholder="To" value={String(values[`${fieldId}_to`] ?? '')} onChange={(e) => set(`${fieldId}_to`, e.target.value)} />
        </Stack>
      </fieldset>
    )
  }
  if (stereotype === 'multiSelect' && options.length > 0) {
    const chosen = multiValues(values[fieldId])
    return (
      <CheckboxGroup>
        <CheckboxGroup.Label>{label}</CheckboxGroup.Label>
        {options.map((o) => (
          <FormControl key={o.value}>
            <Checkbox value={o.value} checked={chosen.includes(o.value)} onChange={(e) => set(fieldId, e.target.checked ? [...chosen, o.value] : chosen.filter((v) => v !== o.value))} />
            <FormControl.Label>{o.label}</FormControl.Label>
          </FormControl>
        ))}
      </CheckboxGroup>
    )
  }
  if (dataType === 'bool' || dataType === 'boolean' || options.length > 0) {
    const opts = options.length > 0 ? options : [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]
    return (
      <FormControl>
        <FormControl.Label>{label}</FormControl.Label>
        <Select block value={String(values[fieldId] ?? '')} onChange={(e) => set(fieldId, e.target.value)}>
          <Select.Option value="">Any</Select.Option>
          {opts.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
        </Select>
      </FormControl>
    )
  }
  return (
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <TextInput block type={NUMERIC.has(dataType) ? 'number' : dataType === 'date' ? 'date' : 'text'} value={String(values[fieldId] ?? '')} onChange={(e) => set(fieldId, e.target.value)} />
    </FormControl>
  )
}

/** The applied filters as tokens ("Status: Open, Paid", "Date: 2026-01-01 – 2026-02-01"), each removable. */
function filterTokens(filters: Dict[], values: Dict): { key: string; text: string; without: Dict }[] {
  const out: { key: string; text: string; without: Dict }[] = []
  for (const f of filters) {
    const fieldId = String(f['fieldId'])
    const label = String(f['label'] ?? fieldId)
    const opts = optionsOf(f)
    const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? (v === 'true' ? 'Yes' : v === 'false' ? 'No' : v)
    const from = values[`${fieldId}_from`], to = values[`${fieldId}_to`]
    if (!isBlankFilterValue(from) || !isBlankFilterValue(to)) {
      const without = { ...values }
      delete without[`${fieldId}_from`]
      delete without[`${fieldId}_to`]
      out.push({ key: `${fieldId}_range`, text: `${label}: ${isBlankFilterValue(from) ? '…' : String(from)} – ${isBlankFilterValue(to) ? '…' : String(to)}`, without })
    }
    const v = values[fieldId]
    if (!isBlankFilterValue(v) && !(Array.isArray(v) && v.length === 0)) {
      const without = { ...values }
      delete without[fieldId]
      out.push({ key: fieldId, text: `${label}: ${multiValues(v).map(labelOf).join(', ')}`, without })
    }
  }
  return out
}

function optionsOf(filter: Dict): { value: string; label: string }[] {
  return (((filter['options'] as Dict[] | undefined) ?? []))
    .map((o) => ({ value: String(o['value'] ?? o['key'] ?? ''), label: String(o['label'] ?? o['value'] ?? '') }))
    .filter((o) => o.value !== '')
}

function multiValues(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string' && v) return v.split(',').map((s) => s.trim()).filter(Boolean)
  if (v === undefined || v === null || v === '') return []
  return [String(v)]
}

/** The sort the listing already has (a link, a Back): shown on its column header. */
function initialSortOf(sort: unknown, defs: ColDef[]): Dict {
  const first = (Array.isArray(sort) ? sort[0] : undefined) as Dict | undefined
  const field = String(first?.['fieldId'] ?? first?.['field'] ?? '')
  if (!field || !defs.some((d) => d.fieldId === field && d.sortable)) return {}
  return { initialSortColumn: field, initialSortDirection: first?.['direction'] === 'descending' ? 'DESC' : 'ASC' }
}

function rowKeyOf(row: Row, index: number): string {
  const id = row['id'] ?? row['_id'] ?? row['key']
  return id !== undefined && id !== null && id !== '' ? `${String(id)}#${index}` : `row-${index}`
}

function withoutRowKey(row: Row): Row {
  const { __mateuRowKey: _k, ...rest } = row
  return rest
}
