import React from 'react'
import { Label, Panel, Text } from '@ui5/webcomponents-react'
import type { ColDef } from '@rn/renderer/crudListing'
import { RowDetail } from '@mr/views/render/listing/layouts'
import { NUMERIC, type Dict, type Row } from '@mr/listing/rows'

/**
 * A listing whose rows carry @Details (`detailPath`): each row a Fiori expandable panel — its
 * columns as label/value pairs in the panel header, its detail in the panel body, collapsed until
 * the user opens it (a ui5-table row cannot span its columns for a detail line).
 */
export function DetailsTable({ rows, defs, detailPath, cellOf, actionsOf, labelledBy, state, data }: {
  rows: Row[]; defs: ColDef[]; detailPath: string; cellOf: (r: Row, c: ColDef) => React.ReactNode
  actionsOf?: (r: Row) => React.ReactNode; labelledBy?: string; state: Dict; data?: unknown
}) {
  return (
    <div className="mateu-details-list" role="list" aria-labelledby={labelledBy}>
      {rows.map((row, i) => {
        const key = String(row['__mateuRowKey'] ?? i)
        const detail = row[detailPath]
        const hasDetail = detail !== undefined && detail !== null && detail !== ''
        const header = (
          <div slot="header" className="mateu-details-head">
            {defs.map((c) => (
              <span key={c.fieldId} className={'mateu-details-cell' + (NUMERIC.has(c.dataType) ? ' is-numeric' : '')}>
                <Label showColon>{c.label}</Label> {cellOf(row, c)}
              </span>
            ))}
            {/* the row's own actions: a press (or its Enter / Space) acts on them, never on the panel's disclosure */}
            {actionsOf && (
              <span className="mateu-details-actions" onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation() }}>{actionsOf(row)}</span>
            )}
          </div>
        )
        return (
          <div role="listitem" key={key}>
            <Panel collapsed fixed={!hasDetail || undefined} header={header} noAnimation>
              {hasDetail && (typeof detail === 'object' ? <RowDetail value={detail} state={state} data={data} /> : <Text>{String(detail)}</Text>)}
            </Panel>
          </div>
        )
      })}
    </div>
  )
}
