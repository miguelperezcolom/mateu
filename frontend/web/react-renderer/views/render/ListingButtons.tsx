import { useState } from 'react'
import { Stack } from '@kit'
import { buttonActionId } from '@rn/core/uxRules'
import { withSelectionGate } from '@infra/ui/selectionGate.ts'
import { useController } from '@mr/render/ViewHost'
import { useButtonPress } from '@mr/render/useButtonPress'
import { ActionButton } from './PageRenderer'
import { type Dict, type Row } from '@mr/listing/rows'
import { ImportDialog } from './listing/ImportDialog'
import type { Model } from './CrudRenderer'

/**
 * The listing's own actions (New, Delete selected, Import…): beside its title — in the page header
 * when the listing IS the page —, not mixed into the search row. Their own module, so a design
 * system that overrides the toolbar (ListingToolbar) keeps drawing them where it puts them.
 */
export function ListingButtons({ m, state, selected }: { m: Model; state: Dict; selected: Row[] }) {
  const controller = useController()
  const press = useButtonPress()
  const [importing, setImporting] = useState(false)
  if (!m.toolbar.length) return null
  return (
    <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center" className="mateu-listing-buttons">
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
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onUploaded={(fileId) => { setImporting(false); void controller.runAction('process-import', { fileId }) }}
        />
      )}
    </Stack>
  )
}
