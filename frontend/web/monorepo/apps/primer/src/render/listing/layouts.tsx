import React, { useState } from 'react'
import { ActionList, Avatar, Button, Label, Stack, Text, TreeView } from '@primer/react'
import { cellText } from '@rn/renderer/cellText'
import { cardLayoutOf, listColumns, listRowModel, pictureUrlOf, type ColDef } from '@rn/renderer/crudListing'
import { labelVariantOf } from '../looks'
import { ComponentRenderer } from '../ComponentRenderer'
import { childrenOf, type Dict, type Row } from './rows'

/** gridLayout = cards: one bordered box per row, its picture and title first (the title opens it). */
export function Cards({ rows, defs, cellOf }: { rows: Row[]; defs: ColDef[]; cellOf: (r: Row, c: ColDef) => React.ReactNode }) {
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
export function List({ rows, defs, onOpen }: { rows: Row[]; defs: ColDef[]; onOpen: (r: Row) => void }) {
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
 * gridLayout = masterDetail: the rows as a list (the compact columns), the selected row's every
 * column beside it — side by side where there is room, the detail under the list on a narrow screen.
 */
export function MasterDetail({ rows, defs, cellOf }: { rows: Row[]; defs: ColDef[]; cellOf: (r: Row, c: ColDef) => React.ReactNode }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selected = rows.find((r) => String(r['__mateuRowKey']) === selectedKey)
  const rail = listColumns(defs)
  const [head, ...rest] = rail
  return (
    <div style={{ gridArea: 'table', display: 'flex', flexWrap: 'wrap', border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)', minHeight: '20rem' }}>
      <div style={{ flex: '1 0 16rem', maxWidth: '100%', borderInlineEnd: 'var(--borderWidth-thin) solid var(--borderColor-default)' }}>
        <ActionList showDividers selectionVariant="single" role="listbox" aria-label="Rows">
          {rows.map((row) => {
            const key = String(row['__mateuRowKey'])
            return (
              <ActionList.Item key={key} role="option" selected={key === selectedKey} aria-selected={key === selectedKey} onSelect={() => setSelectedKey(key)}>
                {head ? cellText(row[head.fieldId], head.valueLabels, head as never) : key}
                {rest.length > 0 && (
                  <ActionList.Description variant="block">
                    {rest.map((c) => cellText(row[c.fieldId], c.valueLabels, c as never)).filter(Boolean).join(' · ')}
                  </ActionList.Description>
                )}
              </ActionList.Item>
            )
          })}
        </ActionList>
      </div>
      <section aria-label="Detail" style={{ flex: '1000 1 20rem', minWidth: 'min(20rem, 100%)', padding: 'var(--base-size-16)' }}>
        {selected ? (
          <dl style={{ margin: 0, display: 'grid', gap: 'var(--base-size-12)' }}>
            {defs.map((c) => (
              <div key={c.fieldId}>
                <dt><Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{c.label}</Text></dt>
                <dd style={{ margin: 0 }}>{cellOf(selected, c)}</dd>
              </div>
            ))}
          </dl>
        ) : <Text style={{ color: 'var(--fgColor-muted)' }}>Select a row to see its details.</Text>}
      </section>
    </div>
  )
}

/**
 * gridLayout = tree: rows that carry a self-referential `children` list, as Primer's TreeView —
 * each node the row's name with its other compact columns beside it; a node that opens (a row
 * action, a selector's Select) does so, the others unfold.
 */
export function TreeListing({ rows, defs, label, onOpen, opens, selectLabel }: {
  rows: Row[]; defs: ColDef[]; label: string; onOpen: (r: Row) => void; opens: (r: Row) => boolean; selectLabel?: string
}) {
  const [head, ...rest] = listColumns(defs)
  const node = (row: Row, path: string): React.ReactNode => {
    const kids = childrenOf(row)
    const name = head ? cellText(row[head.fieldId], head.valueLabels, head as never) : path
    const secondary = rest.map((c) => cellText(row[c.fieldId], c.valueLabels, c as never)).filter(Boolean).join(' · ')
    const canOpen = opens(row)
    return (
      <TreeView.Item key={path} id={path} defaultExpanded onSelect={canOpen && !selectLabel ? () => onOpen(row) : undefined}>
        {name || '—'}
        {(secondary || (canOpen && selectLabel)) && (
          <TreeView.TrailingVisual>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--base-size-8)' }}>
              {secondary && <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{secondary}</Text>}
              {canOpen && selectLabel && (
                <Button size="small" onClick={(e) => { e.stopPropagation(); onOpen(row) }} aria-label={`${selectLabel} ${name}`}>{selectLabel}</Button>
              )}
            </span>
          </TreeView.TrailingVisual>
        )}
        {kids.length > 0 && <TreeView.SubTree>{kids.map((k, i) => node(k, `${path}.${i}`))}</TreeView.SubTree>}
      </TreeView.Item>
    )
  }
  return (
    <div style={{ gridArea: 'table', border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)', padding: 'var(--base-size-8)' }}>
      <TreeView aria-label={label}>{rows.map((r, i) => node(r, String(r['__mateuRowKey'] ?? i)))}</TreeView>
    </div>
  )
}

/** A row's @Details: a component the server built (drawn as one), else its text. */
export function RowDetail({ value, state, data }: { value: unknown; state: Dict; data?: unknown }) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'object' && (value as Dict)['type']) return <ComponentRenderer component={value as Dict} state={state} data={data} />
  const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
  return <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 'var(--text-body-size-small)' }}>{text}</pre>
}
