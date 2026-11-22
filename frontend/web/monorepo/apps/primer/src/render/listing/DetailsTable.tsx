import React, { useState } from 'react'
import { IconButton, Text } from '@primer/react'
import { Table } from '@primer/react/experimental'
import { ChevronDownIcon, ChevronRightIcon } from '@primer/octicons-react'
import type { ColDef } from '@rn/renderer/crudListing'
import { RowDetail } from './layouts'
import { NUMERIC, type Dict, type Row } from '@mr/listing/rows'
import { tx } from '@mr/i18n/texts'

/**
 * A listing whose rows carry @Details (`detailPath`): Primer's Table primitives, each row with a
 * disclosure that shows its detail on a line of its own, under it, across every column.
 */
export function DetailsTable({ rows, defs, detailPath, cellOf, actionsOf, labelledBy, state, data }: {
  rows: Row[]; defs: ColDef[]; detailPath: string; cellOf: (r: Row, c: ColDef) => React.ReactNode
  actionsOf?: (r: Row) => React.ReactNode; labelledBy?: string; state: Dict; data?: unknown
}) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (key: string) => setOpen((s) => {
    const next = new Set(s)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })
  const template = ['min-content', ...defs.map(() => 'minmax(max-content, 1fr)'), ...(actionsOf ? ['min-content'] : [])].join(' ')
  return (
    <div style={{ gridArea: 'table' }}>
      <Table aria-labelledby={labelledBy} gridTemplateColumns={template}>
        <Table.Head>
          <Table.Row>
            <Table.Header><span className="sr-only">{tx('details')}</span></Table.Header>
            {defs.map((c) => <Table.Header key={c.fieldId} align={NUMERIC.has(c.dataType) ? 'end' : undefined}>{c.label}</Table.Header>)}
            {actionsOf && <Table.Header><span className="sr-only">{tx('actions')}</span></Table.Header>}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((row, i) => {
            const key = String(row['__mateuRowKey'] ?? i)
            const expanded = open.has(key)
            const detail = row[detailPath]
            const hasDetail = detail !== undefined && detail !== null && detail !== ''
            return (
              <React.Fragment key={key}>
                <Table.Row>
                  <Table.Cell>
                    {hasDetail && (
                      <IconButton
                        icon={expanded ? ChevronDownIcon : ChevronRightIcon}
                        variant="invisible"
                        size="small"
                        aria-label={expanded ? tx('hideDetails') : tx('showDetails')}
                        aria-expanded={expanded}
                        onClick={() => toggle(key)}
                      />
                    )}
                  </Table.Cell>
                  {defs.map((c, ci) => (
                    <Table.Cell key={c.fieldId} scope={ci === 0 ? 'row' : undefined} align={NUMERIC.has(c.dataType) ? 'end' : undefined}>{cellOf(row, c)}</Table.Cell>
                  ))}
                  {actionsOf && <Table.Cell align="end">{actionsOf(row)}</Table.Cell>}
                </Table.Row>
                {expanded && hasDetail && (
                  <Table.Row>
                    <Table.Cell style={{ gridColumn: '1 / -1', background: 'var(--bgColor-muted)' }}>
                      {typeof detail === 'object' ? <RowDetail value={detail} state={state} data={data} /> : <Text as="div">{String(detail)}</Text>}
                    </Table.Cell>
                  </Table.Row>
                )}
              </React.Fragment>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
