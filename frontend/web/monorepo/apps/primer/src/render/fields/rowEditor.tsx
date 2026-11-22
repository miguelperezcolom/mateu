import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Checkbox, Dialog, IconButton, Stack, Text, VisuallyHidden } from '@primer/react'
import { ArrowDownIcon, ArrowUpIcon, DashIcon, PlusIcon } from '@primer/octicons-react'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { useController, ViewHost } from '../ViewHost'
import { GridCellValue, type GridColumn } from './grid'
import { tx } from '../../i18n/texts'

type Dict = Record<string, unknown>

type Column = GridColumn

type Delivered = { node: Dict; revision: number; view: MateuViewController | null }
const editors = new WeakMap<object, Record<string, Delivered>>()
function editorsOf(controller: object): Record<string, Delivered> {
  let e = editors.get(controller)
  if (!e) editors.set(controller, (e = {}))
  return e
}

const cellText = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? tx('yes') : tx('no')
  if (typeof v === 'object') return String((v as Dict)['label'] ?? (v as Dict)['name'] ?? JSON.stringify(v))
  return String(v)
}

/**
 * An editable list field WITHOUT @InlineEditing — the web renderer's master + server-side detail
 * editor: the rows (each with its «Edit»), a selection, and +, −, ↑, ↓; the SERVER answers the row
 * editor (`<field>_select`, `<field>_add`) as a component aimed at `<field>-container`, drawn here
 * (beside the rows, below them, or in a dialog — `formPosition`), whose Save / Cancel / Prev / Next
 * go to the form that holds the list with the edited row as their initiator state. Whether the
 * editor shows is the holder's state: `<field>_show_detail` / `_show_detail[<field>]`.
 */
export function RowEditorGrid({ fieldId, label, columns, rows, state, formPosition }: {
  fieldId: string; label: string; columns: Column[]; rows: Dict[]; state: Dict; formPosition?: string
}) {
  const controller = useController()
  const [, setTick] = useState(0)
  const delivered = editorsOf(controller)[fieldId]
  const editor = delivered?.node ?? null
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // the server matches rows by `_rowNumber` (the web grid stamps it on rows that arrive without one)
  rows.forEach((r, i) => { if (r && typeof r === 'object' && r['_rowNumber'] === undefined) r['_rowNumber'] = i })

  // the editor is kept per VIEW, not in this component: it arrives in the same answer as the state
  // that shows it, whose re-render remounts the field
  useEffect(() => controller.registerContainer(`${fieldId}-container`, (component, rowState) => {
    const kept = editorsOf(controller)[fieldId]
    if (component) {
      editorsOf(controller)[fieldId] = { node: component as Dict, revision: (kept?.revision ?? 0) + 1, view: null }
      setTick((t) => t + 1)
    } else if (rowState && kept?.view) {
      // Next / Prev: the editor stays, showing another row
      kept.view.applyIncrement({ fragments: [{ targetComponentId: kept.view.currentComponentId, action: 'Replace', component: null /* i18n-ok: a wire action */, state: rowState }] })
    }
  }), [controller, fieldId])

  const showDetail = state[`${fieldId}_show_detail`] === true
    || ((state['_show_detail'] as Dict | undefined)?.[fieldId] === true)

  const select = (next: Set<number>) => {
    setSelected(next)
    controller.currentComponentState[`${fieldId}_selected_items`] = rows.filter((r) => next.has(Number(r['_rowNumber'])))
  }
  const run = (suffix: string, parameters?: Dict) => void controller.runAction(`${fieldId}_${suffix}`, parameters)

  const table = (
    <div className="mateu-grid-field">
      <table aria-label={label}>
        <thead>
          <tr>
            <th scope="col" style={{ width: '2.5rem' }}><VisuallyHidden>{tx('selected')}</VisuallyHidden></th>
            {columns.map((c) => <th key={c.id} scope="col">{c.label}</th>)}
            <th scope="col" style={{ width: '4rem' }}><VisuallyHidden>{tx('edit')}</VisuallyHidden></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 2}><Text style={{ color: 'var(--fgColor-muted)' }}>No {label.toLowerCase() || 'items'} added yet.</Text></td></tr>
          )}
          {rows.map((row, i) => {
            const n = Number(row['_rowNumber'])
            const name = cellText(row[columns[0]?.id ?? '']) || `row ${i + 1}`
            return (
              <tr key={`${n}-${i}`} aria-selected={selected.has(n)}>
                <td>
                  <Checkbox aria-label={tx('selectNamed', { name })} checked={selected.has(n)} onChange={(e) => {
                    const next = new Set(selected)
                    if (e.target.checked) next.add(n); else next.delete(n)
                    select(next)
                  }} />
                </td>
                {columns.map((c) => <td key={c.id}><GridCellValue value={row[c.id]} column={c} /></td>)}
                <td><Button size="small" variant="invisible" aria-label={tx('editNamed', { name })} onClick={() => run('select', { ...row })}>{tx('edit')}</Button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
  const toolbar = (
    <Stack direction="horizontal" gap="condensed">
      <IconButton icon={PlusIcon} size="small" aria-label={tx('addTo', { name: label })} onClick={() => run('add')} />
      <IconButton icon={DashIcon} size="small" aria-label={tx('removeSelectedRows')} disabled={selected.size === 0} onClick={() => { run('remove'); select(new Set()) }} />
      <ButtonGroup>
        <IconButton icon={ArrowUpIcon} size="small" aria-label={tx('moveUp')} disabled={selected.size === 0} onClick={() => run('move-up')} />
        <IconButton icon={ArrowDownIcon} size="small" aria-label={tx('moveDown')} disabled={selected.size === 0} onClick={() => run('move-down')} />
      </ButtonGroup>
    </Stack>
  )
  const detail = showDetail && editor ? (
    <ViewHost
      key={`${String(editor['id'] ?? '')}#${delivered?.revision ?? 0}`}
      session={controller.session}
      serverSideNode={editor}
      embedded
      opener={{ route: controller.currentRoute, consumedRoute: controller.currentConsumedRoute, serverSideType: controller.currentServerSideType, controller }}
      onController={(c) => {
        c.bubbleTo = controller
        const kept = editorsOf(controller)[fieldId]
        if (kept) kept.view = c
      }}
    />
  ) : null

  if (formPosition?.startsWith('modal')) {
    return (
      <Stack gap="condensed">
        {table}
        {toolbar}
        {detail && (
          <Dialog title={label} onClose={() => run('cancel')} width="large">
            {detail}
          </Dialog>
        )}
      </Stack>
    )
  }
  const horizontal = formPosition === 'left' || formPosition === 'right'
  return (
    <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', gap: 'var(--base-size-16)', flexWrap: 'wrap' }}>
      <div style={{ flex: horizontal ? '1 1 20rem' : undefined, minWidth: 0, order: formPosition === 'left' ? 2 : 1 }}>
        <Stack gap="condensed">{table}{toolbar}</Stack>
      </div>
      {detail && (
        <section
          aria-label={`${label}: editor`}
          className="mateu-row-editor"
          style={{ flex: horizontal ? '1 1 20rem' : undefined, minWidth: 0, order: formPosition === 'left' ? 1 : 2 }}
        >
          {detail}
        </section>
      )}
    </div>
  )
}
