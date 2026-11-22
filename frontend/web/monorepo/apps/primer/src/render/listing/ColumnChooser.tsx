import React, { useState } from 'react'
import { AnchoredOverlay, Button, Checkbox, FormControl, IconButton } from '@primer/react'
import { ArrowDownIcon, ArrowUpIcon, ColumnsIcon } from '@primer/octicons-react'
import { applyColumnPrefs, clearColumnPrefs, isProtectedColumn, readColumnPrefs, writeColumnPrefs, type ColumnPrefs } from '@infra/columnPrefsStore.ts'
import type { ColDef } from '@rn/renderer/crudListing'
import { tx } from '../../i18n/texts'

/** A column as the web store reads it (its id, whether it names the row, its type). */
const metaOf = (c: ColDef) => ({ id: c.fieldId, identifier: c.identifier, dataType: c.dataType })

/** The web store's rule over our column definitions (which name their id `fieldId`). */
const applied = (defs: ColDef[], prefs: ColumnPrefs | undefined): ColDef[] =>
  applyColumnPrefs(defs as unknown as { id?: string }[], prefs, (c) => metaOf(c as unknown as ColDef)) as unknown as ColDef[]

/**
 * The user's columns: the web renderer's store (localStorage `mateu-column-prefs`, one scope per
 * listing pathname) — hidden columns and their order, applied before drawing. The column that names
 * the row and the action / select columns cannot be hidden.
 */
export function useColumnPrefs(scope: string, defs: ColDef[]) {
  const [prefs, setPrefs] = useState<ColumnPrefs | undefined>(() => readColumnPrefs(scope))
  const visible = applied(defs, prefs)
  const update = (next: ColumnPrefs | undefined) => {
    if (next) writeColumnPrefs(scope, next)
    else clearColumnPrefs(scope)
    setPrefs(next ? readColumnPrefs(scope) : undefined)
  }
  return { visible, prefs, update }
}

export function ColumnChooser({ defs, prefs, onChange }: { defs: ColDef[]; prefs: ColumnPrefs | undefined; onChange: (p: ColumnPrefs | undefined) => void }) {
  const [open, setOpen] = useState(false)
  const hidden = new Set(prefs?.hidden ?? [])
  // the order the chooser lists: the user's order, hidden ones included where they were
  const ordered = applied(defs, { hidden: [], order: prefs?.order ?? [] })
  const ids = ordered.map((c) => c.fieldId)
  const toggle = (id: string, show: boolean) => {
    const next = new Set(hidden)
    if (show) next.delete(id)
    else next.add(id)
    onChange({ hidden: [...next], order: prefs?.order ?? [] })
  }
  const move = (id: string, delta: -1 | 1) => {
    const order = [...ids]
    const at = order.indexOf(id)
    const to = at + delta
    if (at < 0 || to < 0 || to >= order.length) return
    ;[order[at], order[to]] = [order[to]!, order[at]!]
    onChange({ hidden: [...hidden], order })
  }
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => <Button {...props} leadingVisual={ColumnsIcon} count={hidden.size || undefined}>{tx('columns')}</Button>}
      overlayProps={{ role: 'dialog', 'aria-label': tx('columns'), width: 'medium' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <div style={{ padding: 'var(--base-size-16)', display: 'grid', gap: 'var(--base-size-8)', maxHeight: '70vh', overflow: 'auto' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--base-size-4)' }}>
          {ordered.map((c, i) => {
            const locked = isProtectedColumn(metaOf(c))
            return (
              <li key={c.fieldId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-4)' }}>
                <FormControl disabled={locked} style={{ flex: 1 }}>
                  <Checkbox checked={locked || !hidden.has(c.fieldId)} onChange={(e) => toggle(c.fieldId, e.target.checked)} />
                  <FormControl.Label>{c.label || c.fieldId}</FormControl.Label>
                </FormControl>
                <IconButton icon={ArrowUpIcon} size="small" variant="invisible" aria-label={tx('moveColumnUp', { column: c.label })} disabled={i === 0} onClick={() => move(c.fieldId, -1)} />
                <IconButton icon={ArrowDownIcon} size="small" variant="invisible" aria-label={tx('moveColumnDown', { column: c.label })} disabled={i === ordered.length - 1} onClick={() => move(c.fieldId, 1)} />
              </li>
            )
          })}
        </ul>
        <div><Button variant="invisible" size="small" onClick={() => onChange(undefined)} disabled={!prefs}>{tx('resetColumns')}</Button></div>
      </div>
    </AnchoredOverlay>
  )
}
