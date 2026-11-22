import React, { useEffect, useState } from 'react'
import { ActionList, ActionMenu, Avatar, Button, Checkbox, IconButton, Label, Link, Select, Text, TextInput } from '@primer/react'
import { CheckIcon, KebabHorizontalIcon } from '@primer/octicons-react'
import { cellText } from '@rn/renderer/cellText'
import { cellTone, pictureUrlOf, type ColDef } from '@rn/renderer/crudListing'
import { rowToneOf } from '@infra/ui/rowTone.ts'
import { dragMimeOf } from '@infra/ui/dragAndDrop.ts'
import { useController } from '@mr/render/ViewHost'
import { labelVariantOf } from '../looks'
import { NUMERIC, isBool, withoutRowKey, type Dict, type Row } from '@mr/listing/rows'
import { tx } from '@mr/i18n/texts'

export interface CellContext {
  /** The column that names the row: the row header, the link that opens it, the drag handle. */
  linkColumn?: ColDef
  editorOf: (fieldId: string) => Dict
  opensRow: (row: Row) => boolean
  openRow: (row: Row) => void
  /** @DragRows: the type rows travel as, and the selection a drag carries. */
  dragType: string
  selectedIds: string[]
  /** @RowStatus: the row field whose value tones the row. */
  rowStatusField: string
}

const TONE_FG: Record<string, string> = {
  success: 'var(--fgColor-success)', warning: 'var(--fgColor-attention)', danger: 'var(--fgColor-danger)',
  info: 'var(--fgColor-accent)', neutral: 'var(--fgColor-muted)',
}

/** A boolean cell: a check or a dash, named for a screen reader (never "true"/"false"). */
function BoolCell({ value }: { value: unknown }) {
  const on = value === true || value === 'true'
  return on
    ? <span role="img" aria-label={tx('yes')} style={{ color: 'var(--fgColor-success)' }}><CheckIcon /></span>
    : <span role="img" aria-label={tx('no')} style={{ color: 'var(--fgColor-muted)' }}>—</span>
}

/** What a cell shows: an editor, a picture, a status label, a check, the row's link, a cell action, or the text. */
export function useCellRenderer(ctx: CellContext) {
  const controller = useController()
  const plain = (row: Row, col: ColDef, text: string): React.ReactNode => {
    const value = row[col.fieldId]
    const tone = cellTone(value, col)
    if (tone) return <Label variant={labelVariantOf({ color: tone })}>{text}</Label>
    if (isBool(col.dataType, value)) return <BoolCell value={value} />
    if (col.cellAction) return <Button size="small" onClick={() => void controller.runAction(col.cellAction, { ...withoutRowKey(row) })}>{text || col.label}</Button>
    return text
  }
  const link = (row: Row, text: string): React.ReactNode =>
    ctx.opensRow(row) ? <Link as="button" type="button" onClick={() => ctx.openRow(row)} style={{ textAlign: 'start' }}>{text || tx('open')}</Link> : text
  const handle = (row: Row, content: React.ReactNode): React.ReactNode => {
    if (!ctx.dragType) return content
    const rowId = String(row['id'] ?? '')
    return (
      <span
        draggable
        onDragStart={(e) => {
          const ids = ctx.selectedIds.includes(rowId) ? ctx.selectedIds : [rowId]
          e.dataTransfer.setData(dragMimeOf(ctx.dragType), JSON.stringify(ids))
          e.dataTransfer.effectAllowed = 'move'
        }}
        style={{ cursor: 'grab' }}
        title={tx('dragToMove')}
      >{content}</span>
    )
  }
  // the row header: its picture (leadingPath), its link, its second line (captionPath), its status
  const header = (row: Row, col: ColDef, text: string): React.ReactNode => {
    const picture = col.leadingPath ? pictureUrlOf(row[col.leadingPath]) : undefined
    const caption = col.captionPath ? String(row[col.captionPath] ?? '') : ''
    const tone = rowToneOf(row, ctx.rowStatusField || undefined)
    const main = handle(row, link(row, text))
    if (!picture && !caption && !tone) return main
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--base-size-8)', minWidth: 0 }}>
        {tone && <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: TONE_FG[tone] }} />}
        {tone && <span className="sr-only">{tone}</span>}
        {picture && <Avatar src={picture} size={24} alt="" />}
        <span style={{ display: 'grid', minWidth: 0 }}>
          <span>{main}</span>
          {caption && <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{caption}</Text>}
        </span>
      </span>
    )
  }
  return (row: Row, col: ColDef): React.ReactNode => {
    const value = row[col.fieldId]
    if (col.editable) return <EditableCell row={row} col={col} editor={ctx.editorOf(col.fieldId)} />
    if (col.stereotype === 'image') {
      const src = pictureUrlOf(value)
      return src ? <Avatar src={src} size={24} alt="" square /> : null
    }
    const text = cellText(value, col.valueLabels, col)
    const shown = col === ctx.linkColumn ? header(row, col, text) : plain(row, col, text)
    const tip = col.tooltipPath ? String(row[col.tooltipPath] ?? '') : ''
    return tip ? <span title={tip}>{shown}</span> : shown
  }
}

/**
 * An @InlineEditing cell: the editor its column asks for, committed on the user's own change event
 * (never on a value notification), for the row the edit started on, and only when the value really
 * changed — then the crud's `update-row` with `_editedRow` and `_editedField` (the server writes that
 * one cell over the stored record), and the listing searches again.
 */
export function EditableCell({ row, col, editor }: { row: Row; col: ColDef; editor: Dict }) {
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
export function RowActions({ row, actionColumns }: { row: Row; actionColumns: Dict[] }) {
  const controller = useController()
  const actions = actionColumns.flatMap((cm) => (((row[String(cm['id'] ?? '')] as Dict | undefined)?.['actions'] as Dict[] | undefined) ?? []))
  if (actions.length === 0) return null
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} variant="invisible" size="small" aria-label={tx('rowActions')} />
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
