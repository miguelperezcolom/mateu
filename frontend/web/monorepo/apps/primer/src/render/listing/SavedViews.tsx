import React, { useState } from 'react'
import { AnchoredOverlay, Button, IconButton, Stack, Text, TextInput } from '@primer/react'
import { BookmarkIcon, StarFillIcon, StarIcon, TrashIcon } from '@primer/octicons-react'
import { activeView, deleteView, listSavedViews, saveView, setDefaultView, type SavedView } from '@infra/savedViewsStore.ts'
import type { Dict } from './rows'
import { tx } from '../../i18n/texts'

/**
 * Saved views on the filter bar — the web renderer's store (localStorage `mateu-saved-views`, one
 * scope per listing pathname), so a view saved here is the same view in the Vaadin renderer: a named
 * snapshot of the search text and the applied filters; the starred one opens the listing when its
 * URL asks for nothing.
 */
export function SavedViews({ scope, values, onApply }: { scope: string; values: Dict; onApply: (values: Dict) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((n) => n + 1)
  const views = listSavedViews(scope)
  const current = activeView(views, values)
  const canSave = Object.values(values).some((v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
  const apply = (view: SavedView) => { onApply(view.values ?? {}); setOpen(false) }
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => <Button {...props} leadingVisual={BookmarkIcon}>{current ? current.name : tx('views')}</Button>}
      overlayProps={{ role: 'dialog', 'aria-label': tx('savedViews'), width: 'medium' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <div style={{ padding: 'var(--base-size-16)', display: 'grid', gap: 'var(--stack-gap-normal)' }}>
        {views.length === 0 && <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{tx('noSavedViews')}</Text>}
        {views.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--base-size-4)' }}>
            {views.map((v) => (
              <li key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-4)' }}>
                <Button variant="invisible" block alignContent="start" onClick={() => apply(v)} aria-current={current?.name === v.name || undefined}>{v.name}</Button>
                <IconButton
                  icon={v.isDefault ? StarFillIcon : StarIcon}
                  variant="invisible"
                  size="small"
                  aria-label={v.isDefault ? `${tx('unsetDefaultView')}: ${v.name}` : `${tx('openWithView')}: ${v.name}`}
                  aria-pressed={!!v.isDefault}
                  onClick={() => { setDefaultView(scope, v.name); refresh() }}
                />
                <IconButton icon={TrashIcon} variant="invisible" size="small" aria-label={tx('deleteViewNamed', { name: v.name })} onClick={() => { deleteView(scope, v.name); refresh() }} />
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); if (!name.trim() || !canSave) return; saveView(scope, { name, values }); setName(''); refresh() }}
        >
          <Stack direction="horizontal" gap="condensed">
            <TextInput aria-label={tx('viewName')} placeholder={canSave ? tx('saveViewAs') : tx('applyFiltersToSaveView')} value={name} onChange={(e) => setName(e.target.value)} disabled={!canSave} style={{ flex: 1 }} />
            <Button type="submit" disabled={!canSave || !name.trim()}>{tx('save')}</Button>
          </Stack>
        </form>
      </div>
    </AnchoredOverlay>
  )
}
