import React, { useState } from 'react'
import { Button, Checkbox, IconButton, Select, Text, TextInput, VisuallyHidden } from '@primer/react'
import { PlusIcon, TrashIcon } from '@primer/octicons-react'
import { flattenColumnGroups } from '@rn/renderer/columnGroups'

type Dict = Record<string, unknown>

interface Column {
  id: string
  label: string
  dataType?: string
  stereotype?: string
  editable?: boolean
  editorType?: string
  editorOptions?: { value: unknown; label: string }[] | null
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
    }))
  const cols = flat.length ? flat : Object.keys(rows[0] ?? {}).map((k) => ({ id: k, label: k }))
  // internal columns (_select, _rowNumber…) are wire plumbing, not data
  return cols.filter((c) => !c.id.startsWith('_'))
}

const cellText = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object') return String((v as Dict)['label'] ?? (v as Dict)['name'] ?? JSON.stringify(v))
  return String(v)
}

/**
 * A grid field (`@Stereotype(grid)`, a list of rows): a Primer-styled table. Editable columns
 * (`@InlineEditing`) edit in place, rows are added and removed; `@OnRowSelected` runs its action
 * with `_clickedRow` on a row click (read-only grids too).
 */
export function GridField({ label, columns, rows, editable, inlineEditing, onChange, onRowSelected }: {
  label: string; columns: Column[]; rows: Dict[]; editable: boolean; inlineEditing: boolean
  onChange: (rows: Dict[]) => void; onRowSelected?: (row: Dict) => void
}) {
  const [selected, setSelected] = useState(-1)
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
                {columns.map((c) => <td key={c.id}>{canEdit(c) ? editor(c, row, i) : cellText(row[c.id])}</td>)}
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
