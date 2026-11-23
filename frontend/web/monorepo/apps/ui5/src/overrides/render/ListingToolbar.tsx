import { useState } from 'react'
import { Title, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react'
import { buttonActionId } from '@rn/core/uxRules'
import { withSelectionGate } from '@infra/ui/selectionGate.ts'
import { useController } from '@mr/render/ViewHost'
import { useButtonPress } from '@mr/render/useButtonPress'
import { ActionButton } from '@mr/views/render/PageRenderer'
import { type Dict, type Row } from '@mr/listing/rows'
import { ColumnChooser, useColumnPrefs } from '@mr/views/render/listing/ColumnChooser'
import { ImportDialog } from '@mr/views/render/listing/ImportDialog'
import { Model, Listing } from '@mr/views/render/CrudRenderer'
import { ListingSearch } from '@mr/views/render/ListingToolbar'
/** Above the rows: the search box, Filter, saved views, Columns and the listing's toolbar. */
export { ListingSearch }

export function ListingActions({ m, listing, scope, columnPrefs, state, selected, titleId, total }: {
  m: Model; listing: Listing; scope: string; columnPrefs: ReturnType<typeof useColumnPrefs>; state: Dict; selected: Row[]; titleId: string; total: number
}) {
  const controller = useController()
  const press = useButtonPress()
  const [importing, setImporting] = useState(false)
  const offersViews = (m.searchable || m.filters.length > 0) && !controller.windowless
  const tableLike = m.layout !== 'tree' && m.defs.length > 1
  const hasFilterArea = m.searchable || m.filters.length > 0 || offersViews
  if (!m.toolbar.length && !hasFilterArea && !tableLike && !m.title) return null
  return (
    <>
      {hasFilterArea && (
      <div className="mateu-listing-filterbar">
        <ListingSearch m={m} listing={listing} scope={scope} offersViews={offersViews} />
      </div>
      )}
      <Toolbar className="mateu-listing-toolbar" design="Transparent" accessibleNameRef={m.title ? titleId : undefined}>
        {m.title && <Title level="H2" size="H5" id={titleId}>{m.title}{total > 0 ? ` (${total})` : ''}</Title>}
        <ToolbarSpacer />
        <div className="mateu-listing-actions">
        {m.toolbar.map((raw, i) => {
          // a bulk action is disabled while no row is selected (the server's gate stays the backstop)
          const b = withSelectionGate(raw as never, selected) as Dict
          const run = () => {
            // Import (UploadEnabled): the file first, then `process-import` with its id
            if (buttonActionId(b as never) === 'import') return setImporting(true)
            void controller.runAction(buttonActionId(b as never), { crud_selected_items: selected })
          }
          const { onPress, disabled } = press(b, { state }, run, String(b['label'] ?? ''))
          return <ActionButton key={i} button={b} onPress={onPress} disabled={disabled} label={String(b['label'])} />
        })}
        {tableLike && <ColumnChooser defs={m.defs} prefs={columnPrefs.prefs} onChange={columnPrefs.update} />}
        </div>
      </Toolbar>
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onUploaded={(fileId) => { setImporting(false); void controller.runAction('process-import', { fileId }) }}
        />
      )}
    </>
  )
}
