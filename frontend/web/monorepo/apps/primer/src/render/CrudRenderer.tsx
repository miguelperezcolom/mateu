import React, { useEffect, useState } from 'react'
import { Button, Label, Link, Stack, Text, TextInput } from '@primer/react'
import { Blankslate, DataTable, Table } from '@primer/react/experimental'
import { SearchIcon } from '@primer/octicons-react'
import { interpolate } from '@rn/core/expressions'
import { buttonActionId } from '@rn/core/uxRules'
import { rowOpenOf, rowPressOf } from '@rn/core/rowOpen'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'
import { cellText } from '@rn/renderer/cellText'
import {
  applySearchToState, cellTone, columnDefsOf, emptyMessageOf, firstRowAction, normalizeCrudData, pagingOf,
  type ColDef,
} from '@rn/renderer/crudListing'
import { useController } from './ViewHost'
import { useButtonPress } from './useButtonPress'
import { labelVariantOf } from './looks'
import { ActionButton } from './PageRenderer'

type Dict = Record<string, unknown>

/**
 * A listing (Crud) as Primer's DataTable inside Table.Container: title and toolbar above, the
 * search box, the table (sortable headers, row selection when the listing has bulk actions), and
 * Table.Pagination. The listing logic — what a row opens, the columns, the paging counters, how a
 * search is written into the state — is the React Native renderer's (crudListing.ts, rowOpen.ts).
 *
 * Server-side search only for now: a listing fed by a REST source (`rowsSource`) is a Standard-level item.
 */
export function CrudRenderer({ component, metadata, state, data }: { component: Dict; metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const press = useButtonPress()
  const id = String(component['id'] ?? 'crud')
  const title = interpolate(String(metadata['title'] ?? ''), { state })
  const subtitle = interpolate(String(metadata['subtitle'] ?? ''), { state })
  const searchable = metadata['searchable'] === true
  const columns = flattenColumnGroups((metadata['columns'] as Dict[] | undefined) ?? [])
  const rowOpen = rowOpenOf(metadata['rowRoute'], columns.map((c) => ((c as Dict)['metadata'] ?? {}) as Dict))
  const defs = columnDefsOf(columns as never, rowOpen)
  const toolbar = ((metadata['toolbar'] as Dict[] | undefined) ?? []).filter((b) => b && b['label'])
  const selectable = metadata['rowsSelectionEnabled'] === true

  const [live, setLive] = useState<unknown>(() => normalizeCrudData(data))
  const [searchText, setSearchText] = useState(String(controller.currentComponentState['searchText'] ?? ''))
  useEffect(() => {
    const onData = (d: unknown) => setLive(normalizeCrudData(d))
    controller.registerDataHandler(id, onData)
    controller.registerDataHandler('crud', onData)
  }, [controller, id])

  const paging = pagingOf(live)
  const rows = paging.rows.map((r, i) => ({ ...r, __mateuRowKey: rowKeyOf(r, i) }))

  const search = () => {
    controller.seedSearchState()
    applySearchToState(controller.currentComponentState, searchText, {})
    void controller.runAction('search')
  }
  const toPage = (pageIndex: number) => {
    controller.seedSearchState()
    controller.currentComponentState['page'] = pageIndex
    void controller.runAction('search')
  }
  const sortBy = (field: string, direction: 'ASC' | 'DESC') => {
    controller.seedSearchState()
    const d = direction === 'ASC' ? 'ascending' : 'descending'
    controller.currentComponentState['sort'] = [{ field, direction: d, fieldId: field }]
    controller.currentComponentState['page'] = 0
    void controller.runAction('search')
  }

  const openRow = (row: Dict) => {
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

  // the column that names the row opens it (Primer's pattern: the row header is a link)
  const linkColumn = defs.find((c) => c.identifier) ?? defs.find((c) => !c.display) ?? defs[0]

  const tableColumns = defs.map((col: ColDef) => ({
    id: col.fieldId,
    header: col.label,
    field: col.fieldId,
    rowHeader: col === linkColumn,
    sortBy: col.sortable ? true : undefined,
    align: ['integer', 'number', 'money', 'double', 'decimal', 'long'].includes(col.dataType) ? 'end' as const : undefined,
    renderCell: (row: Dict) => {
      const value = row[col.fieldId]
      const tone = cellTone(value, col)
      const text = cellText(value, col.valueLabels, col)
      if (tone) return <Label variant={labelVariantOf({ color: tone })}>{text}</Label>
      if (col === linkColumn && (rowOpen || firstRowAction(columns as never, row))) {
        return (
          <Link as="button" type="button" onClick={() => openRow(row)} aria-label={`Open ${text}`} style={{ textAlign: 'start' }}>
            {text || 'Open'}
          </Link>
        )
      }
      if (col.cellAction) {
        return <Button size="small" onClick={() => void controller.runAction(col.cellAction, { ...withoutRowKey(row) })}>{text || col.label}</Button>
      }
      return text
    },
  }))

  const titleId = `${id}-title`
  return (
    <Table.Container>
      {title && <Table.Title as="h2" id={titleId}>{title}</Table.Title>}
      {subtitle && <Table.Subtitle as="p" id={`${id}-subtitle`}>{subtitle}</Table.Subtitle>}
      {(toolbar.length > 0 || searchable) && (
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
            {toolbar.map((b, i) => {
              const { onPress, disabled } = press(b, { state }, () => void controller.runAction(buttonActionId(b as never)), String(b['label'] ?? ''))
              return <ActionButton key={i} button={b} onPress={onPress} disabled={disabled} label={String(b['label'])} />
            })}
          </Stack>
        </Table.Actions>
      )}
      {rows.length === 0 ? (
        <Blankslate border>
          <Blankslate.Heading>{emptyMessageOf(live, metadata, 'No data')}</Blankslate.Heading>
        </Blankslate>
      ) : (
        <DataTable
          aria-labelledby={title ? titleId : undefined}
          data={rows as never[]}
          columns={tableColumns as never}
          getRowId={(r: Dict) => String(r['__mateuRowKey'])}
          externalSorting
          onToggleSort={(columnId: unknown, direction: 'ASC' | 'DESC') => sortBy(String(columnId), direction)}
          rowSelection={selectable || undefined}
          onSelectionChange={selectable ? ({ selectedRows }: { selectedRows: Set<string | number> }) => {
            controller.currentComponentState['crud_selected_items'] = rows.filter((r) => selectedRows.has(String(r['__mateuRowKey']))).map(withoutRowKey)
          } : undefined}
        />
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
      {paging.totalElements > 0 && (
        <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)' }}>{paging.totalElements} {paging.totalElements === 1 ? 'item' : 'items'}</Text>
      )}
    </Table.Container>
  )
}

function rowKeyOf(row: Dict, index: number): string {
  const id = row['id'] ?? row['_id'] ?? row['key']
  return id !== undefined && id !== null && id !== '' ? `${String(id)}#${index}` : `row-${index}`
}

function withoutRowKey(row: Dict): Dict {
  const { __mateuRowKey: _k, ...rest } = row
  return rest
}
