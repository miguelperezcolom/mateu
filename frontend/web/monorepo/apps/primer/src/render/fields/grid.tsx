import React, { useEffect, useRef, useState } from 'react'
import { modifiersMatch } from '@rn/core/keyShortcuts'
import { Button, Checkbox, IconButton, Label, Select, Text, TextInput, VisuallyHidden } from '@primer/react'
import { cellText as listingCellText } from '@rn/renderer/cellText'
import { cellTone } from '@rn/renderer/crudListing'
import { labelVariantOf } from '../looks'
import { PlusIcon, TrashIcon } from '@primer/octicons-react'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'

type Dict = Record<string, unknown>

export type GridColumn = Column

interface Column {
  id: string
  label: string
  dataType?: string
  stereotype?: string
  editable?: boolean
  editorType?: string
  editorOptions?: { value: unknown; label: string }[] | null
  /** a button column (`stereotype: button` or an actionId): its fixed text, else the cell's value */
  actionId?: string
  text?: string
  /** a status column's tone per raw value (`@Status` mappings), and an enum's labels */
  tones?: Record<string, string> | null
  valueLabels?: Record<string, string> | null
}

const NUMERIC = new Set(['integer', 'int', 'long', 'number', 'double', 'float', 'decimal', 'money'])

/** The grid's columns off the wire (GridColumn nodes, groups flattened); none → the first row's keys. */
export function gridColumnsOf(columns: unknown, rows: Dict[]): Column[] {
  const flat = flattenColumnGroups((columns as Dict[] | undefined) ?? [])
    .map((c) => ((c as Dict)['metadata'] as Dict | undefined) ?? (c as Dict))
    .filter((m) => m && typeof m['id'] === 'string')
    .map((m) => ({
      id: String(m['id']), label: String(m['label'] ?? m['id']),
      dataType: m['dataType'] as string | undefined, stereotype: m['stereotype'] as string | undefined,
      editable: m['editable'] === true, editorType: m['editorType'] as string | undefined,
      editorOptions: (m['editorOptions'] as Column['editorOptions']) ?? null,
      actionId: typeof m['actionId'] === 'string' && m['actionId'] ? String(m['actionId']) : undefined,
      text: typeof m['text'] === 'string' && m['text'] ? String(m['text']) : undefined,
      tones: (m['tones'] as Column['tones']) ?? null,
      valueLabels: (m['valueLabels'] as Column['valueLabels']) ?? null,
    }))
  const cols = flat.length ? flat : Object.keys(rows[0] ?? {}).map((k) => ({ id: k, label: k }))
  // internal columns (_select — the server-side detail editor's Edit —, _rowNumber…) are wire plumbing, not data
  return cols.filter((c) => !c.id.startsWith('_'))
}

const plainText = (v: unknown, c?: Column): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object' && ('message' in (v as Dict) || 'value' in (v as Dict))) return listingCellText(v, c?.valueLabels, c)
  if (typeof v === 'object') return String((v as Dict)['label'] ?? (v as Dict)['name'] ?? JSON.stringify(v))
  return listingCellText(v, c?.valueLabels, c)
}

/**
 * A grid field cell's value as the listing draws it: a STATUS (a `Status` object `{type, message}`,
 * a column's `tones`, a status word) is a Primer Label in its tone; the rest is text.
 */
export function GridCellValue({ value, column }: { value: unknown; column?: Column }) {
  const text = plainText(value, column)
  const tone = column ? cellTone(value, { tones: column.tones ?? null, dataType: column.dataType ?? '' }) : null
  if (tone) return <Label variant={labelVariantOf({ color: tone })}>{text}</Label>
  return <>{text}</>
}
const cellText = (v: unknown, c?: Column): string => plainText(v, c)

/**
 * A grid field (`@Stereotype(grid)`, a list of rows): a Primer-styled table. Editable columns
 * (`@InlineEditing`) edit in place, rows are added and removed; `@OnRowSelected` runs its action
 * with `_clickedRow` on a row click (read-only grids too).
 */
export function GridField({ label, columns, rows, editable, inlineEditing, onChange, onRowSelected, onCellAction, rowSelectionShortcut }: {
  label: string; columns: Column[]; rows: Dict[]; editable: boolean; inlineEditing: boolean
  onChange: (rows: Dict[]) => void; onRowSelected?: (row: Dict) => void
  /** a button column pressed: its action, the row as the parameters (the web's button cell) */
  onCellAction?: (actionId: string, row: Dict) => void
  /** @OnRowSelected(shortcut = "ctrl+shift"): the combination plus a digit selects that row */
  rowSelectionShortcut?: string
}) {
  const [selected, setSelected] = useState(-1)
  const current = useRef({ rows, onRowSelected })
  current.current = { rows, onRowSelected }
  useEffect(() => {
    if (!rowSelectionShortcut) return
    const onKey = (e: KeyboardEvent) => {
      const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)?.[1]
      if (!digit || !modifiersMatch(rowSelectionShortcut, e)) return
      const i = Number(digit) - 1
      const { rows: rs, onRowSelected: select } = current.current
      if (!select || !rs[i]) return
      e.preventDefault()
      setSelected(i)
      select(rs[i])
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [rowSelectionShortcut])
  const canEdit = (c: Column) => editable && (inlineEditing || c.editable === true) && c.editable !== false
  const anyEditable = editable && columns.some(canEdit)
  const put = (i: number, id: string, v: unknown) => onChange(rows.map((r, j) => (j === i ? { ...r, [id]: v } : r)))
  const add = () => onChange([...rows, Object.fromEntries(columns.map((c) => [c.id, null]))])
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i).map((r, j) => ('_rowNumber' in r ? { ...r, _rowNumber: j } : r)))

  const editor = (c: Column, row: Dict, i: number) => {
    const v = row[c.id]
    const name = `${c.label}, row ${i + 1}`
    const type = c.editorType ?? c.dataType ?? 'text'
    if (type === 'boolean' || type === 'bool' || typeof v === 'boolean') {
      return <Checkbox checked={v === true} aria-label={name} onChange={(e) => put(i, c.id, e.target.checked)} />
    }
    if ((type === 'select' || type === 'combobox' || c.editorOptions) && c.editorOptions?.length) {
      return (
        <Select aria-label={name} value={v == null ? '' : String(v)} onChange={(e) => put(i, c.id, c.editorOptions!.find((o) => String(o.value) === e.target.value)?.value ?? e.target.value)} size="small">
          <Select.Option value="">—</Select.Option>
          {c.editorOptions.map((o) => <Select.Option key={String(o.value)} value={String(o.value)}>{o.label}</Select.Option>)}
        </Select>
      )
    }
    const numeric = NUMERIC.has(type) || typeof v === 'number'
    const inputType = type === 'date' ? 'date' : type === 'time' ? 'time' : numeric ? 'number' : 'text'
    return (
      <TextInput
        aria-label={name}
        size="small"
        type={inputType}
        step={numeric && type !== 'integer' && type !== 'int' && type !== 'long' ? 'any' : undefined}
        value={v == null ? '' : String(v)}
        onChange={(e) => put(i, c.id, numeric ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
      />
    )
  }

  const cell = (c: Column, row: Dict, i: number): React.ReactNode => {
    if (c.actionId && (c.stereotype === 'button' || !canEdit(c))) {
      const text = c.text || cellText(row[c.id], c)
      return <Button size="small" variant="invisible" onClick={() => onCellAction?.(c.actionId!, row)}>{text || c.label}</Button>
    }
    return canEdit(c) ? editor(c, row, i) : <GridCellValue value={row[c.id]} column={c} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--base-size-8)' }}>
      <div className="mateu-grid-field">
        <table aria-label={label}>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.id} scope="col">{c.label}</th>)}
              {anyEditable && <th scope="col"><VisuallyHidden>Actions</VisuallyHidden></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + (anyEditable ? 1 : 0)}><Text style={{ color: 'var(--fgColor-muted)' }}>No rows</Text></td></tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={i}
                className={onRowSelected ? 'clickable' : undefined}
                aria-selected={onRowSelected ? i === selected : undefined}
                tabIndex={onRowSelected ? 0 : undefined}
                onClick={(e) => {
                  if (!onRowSelected || (e.target as HTMLElement).closest('input,select,button,label')) return
                  setSelected(i)
                  onRowSelected(row)
                }}
                onKeyDown={(e) => {
                  if (onRowSelected && e.key === 'Enter' && e.target === e.currentTarget) { setSelected(i); onRowSelected(row) }
                }}
              >
                {columns.map((c) => <td key={c.id}>{cell(c, row, i)}</td>)}
                {anyEditable && (
                  <td className="actions">
                    <IconButton icon={TrashIcon} size="small" variant="invisible" aria-label={`Remove row ${i + 1}`} onClick={() => remove(i)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {anyEditable && <div><Button size="small" leadingVisual={PlusIcon} onClick={add}>Add row</Button></div>}
    </div>
  )
}
