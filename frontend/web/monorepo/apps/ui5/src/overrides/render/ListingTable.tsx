import React, { useState } from 'react'
import { Button, Text } from '@kit'
import { Table as Ui5Table, TableCell, TableGrowing, TableHeaderCell, TableHeaderRow, TableRow, TableSelectionMulti } from '@ui5/webcomponents-react'
import { buildAggregateFooters, groupLabelColumnId, interleaveGroupRows, isGroupRow, type ListingData } from '@rn/core/listingGroups'
import { emptyMessageOf, extractListing, pagingOf } from '@rn/renderer/crudListing'
import { initialSortOf, type Dict, type Row } from '@mr/listing/rows'
import { columnGeometry } from '@mr/views/render/listing/geometry'
import { aggregatable, BodyProps, GroupCell } from '@mr/views/render/CrudRenderer'

import { tx } from '@mr/i18n/texts'
/**
 * A table: Fiori's responsive table (ui5-table) — sortable column headers, the multi-selection
 * feature, group header rows (and their actions), the totals under it and growing with "More".
 */
export function ListingTable({ m, defs, rows, live, cellOf, titleId, sort, onSort, selection, actionsOf, metadata, opensRow, openRow, onMore }: BodyProps & { actionsOf?: (r: Row) => React.ReactNode }) {
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
