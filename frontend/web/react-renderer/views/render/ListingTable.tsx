import React from 'react'
import { Text } from '@kit'
import { DataTable } from '@kit'
import { buildAggregateFooters, groupLabelColumnId, interleaveGroupRows, isGroupRow, type ListingData } from '@rn/core/listingGroups'
import { extractListing } from '@rn/renderer/crudListing'
import { initialSortOf, type Dict, type Row } from '@mr/listing/rows'
import { columnGeometry } from './listing/geometry'
import { aggregatable, BodyProps, GroupCell } from './CrudRenderer'

import { tx } from '@mr/i18n/texts'
// Split out of CrudRenderer.tsx: a design system with its own markup for it overrides only this file.

/** A table: Primer's DataTable, with server sort, selection, group headers (and their actions) and totals. */
export function ListingTable({ m, defs, rows, live, cellOf, linkColumn, titleId, sort, onSort, selection, actionsOf, metadata }: BodyProps & { actionsOf?: (r: Row) => React.ReactNode }) {
  const listing = extractListing<ListingData>(live)
  const displayRows = interleaveGroupRows(rows, m.groupBy, listing?.groups) as Row[]
  const labelColumnId = groupLabelColumnId(m.groupBy, defs.map((c) => c.fieldId))
  const lastColumnId = defs[defs.length - 1]?.fieldId ?? ''
  const footers = buildAggregateFooters(defs.map(aggregatable), listing, m.groupBy)
  const metaOf = (fieldId: string) => m.columnMetas.find((cm) => String(cm['id'] ?? '') === fieldId) ?? {}
  const tableColumns: Dict[] = defs.map((col) => {
    const g = columnGeometry(metaOf(col.fieldId), col.dataType)
    return {
      id: col.fieldId,
      header: col.label,
      field: col.fieldId,
      rowHeader: col === linkColumn,
      sortBy: col.sortable ? true : undefined,
      align: g.align,
      width: g.width,
      minWidth: g.minWidth,
      renderCell: (row: Row) => {
        if (isGroupRow(row)) return <GroupCell row={row} col={col} m={m} labelColumnId={labelColumnId} lastColumnId={lastColumnId} />
        return g.centered ? <span className="mateu-cell-centered">{cellOf(row, col)}</span> : cellOf(row, col)
      },
    }
  })
  if (actionsOf) {
    tableColumns.push({
      id: '__mateuRowActions',
      header: () => <span className="sr-only">{tx('actions')}</span>,
      align: 'end',
      width: 'auto',
      renderCell: (row: Row) => (isGroupRow(row) ? null : actionsOf(row)),
    })
  }
  const footerText = footers
    ? defs.filter((c) => footers[c.fieldId] !== undefined).map((c, i) => (i === 0 && !c.aggregate ? footers[c.fieldId] : `${c.label}: ${footers[c.fieldId]}`)).join(' · ')
    : ''
  return (
    <div style={{ gridArea: 'table', ...(m.contentHeight ? { maxHeight: m.contentHeight } : {}) }} className={['mateu-listing-table', m.looks, m.contentHeight ? 'mateu-listing-scroll' : ''].filter(Boolean).join(' ')}>
      <DataTable
        aria-labelledby={m.title ? titleId : undefined}
        data={displayRows as never[]}
        columns={tableColumns as never}
        cellPadding={metadata['compact'] === true ? 'condensed' : undefined}
        getRowId={(r: Row) => String(isGroupRow(r) ? (r as unknown as Dict)['_rowNumber'] : r['__mateuRowKey'])}
        externalSorting
        {...initialSortOf(sort, defs)}
        onToggleSort={(columnId: unknown, direction: 'ASC' | 'DESC') => onSort(String(columnId), direction)}
        rowSelection={selection.enabled || undefined}
        // a group header row is a heading, not a record: it has no checkbox
        isRowSelectable={(r: Row) => !isGroupRow(r)}
        onSelectionChange={selection.enabled ? ({ selectedRows }: { selectedRows: Set<string | number> }) => {
          selection.change(rows.filter((r) => selectedRows.has(String(r['__mateuRowKey']))))
        } : undefined}
      />
      {/* the totals of the whole filtered set (Crud aggregates), under the rows */}
      {footerText && <Text as="p" weight="semibold" style={{ margin: 'var(--base-size-8) var(--base-size-16) 0', textAlign: 'end' }}>{footerText}</Text>}
    </div>
  )
}
