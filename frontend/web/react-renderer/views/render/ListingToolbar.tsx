import { useRef, useState } from 'react'
import { Stack, TextInput } from '@kit'
import { Table } from '@kit'
import { SearchIcon } from '@kit/icons'
import { buttonActionId } from '@rn/core/uxRules'
import { activeFilterCount } from '@rn/renderer/crudListing'
import { withSelectionGate } from '@infra/ui/selectionGate.ts'
import { useController } from '@mr/render/ViewHost'
import { useButtonPress } from '@mr/render/useButtonPress'
import { ActionButton } from './PageRenderer'
import { type Dict, type Row } from '@mr/listing/rows'
import { FilterPanel } from './listing/filters'
import { SavedViews } from './listing/SavedViews'
import { ColumnChooser, useColumnPrefs } from './listing/ColumnChooser'
import { ImportDialog } from './listing/ImportDialog'
import { Model, Listing, useAutoFocus, useDebounced } from './CrudRenderer'
import { tx } from '@mr/i18n/texts'
// Split out of CrudRenderer.tsx: a design system with its own markup for it overrides only this file.

/** Above the rows: the search box, Filter, saved views, Columns and the listing's toolbar. */
export function ListingActions({ m, listing, scope, columnPrefs, state, selected }: {
  m: Model; listing: Listing; scope: string; columnPrefs: ReturnType<typeof useColumnPrefs>; state: Dict; selected: Row[]
  /** The title's id and the row count (a design system whose toolbar carries the title uses them). */
  titleId?: string; total?: number
}) {
  const controller = useController()
  const press = useButtonPress()
  const [importing, setImporting] = useState(false)
  const offersViews = (m.searchable || m.filters.length > 0) && !controller.windowless
  const tableLike = m.layout !== 'tree' && m.defs.length > 1
  if (!m.toolbar.length && !offersViews && !tableLike && !m.searchable && !m.filters.length) return null
  return (
    <Table.Actions>
      <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
        <ListingSearch m={m} listing={listing} scope={scope} offersViews={offersViews} />
        {tableLike && <ColumnChooser defs={m.defs} prefs={columnPrefs.prefs} onChange={columnPrefs.update} />}
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
      </Stack>
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onUploaded={(fileId) => { setImporting(false); void controller.runAction('process-import', { fileId }) }}
        />
      )}
    </Table.Actions>
  )
}

/**
 * The search box, Filter and saved views: what every design system puts above a listing's rows the
 * same way (its own toolbar arranges them; this part is shared — ListingToolbar overrides keep it).
 */
export function ListingSearch({ m, listing, scope, offersViews }: { m: Model; listing: Listing; scope: string; offersViews: boolean }) {
  const searchBox = useRef<HTMLInputElement>(null)
  useAutoFocus(m.autoFocus && m.searchable, searchBox)
  const typed = useDebounced((text: string) => listing.search(listing.filterValues, text), 300)
  const viewValues: Dict = { ...(listing.searchText ? { searchText: listing.searchText } : {}), ...listing.filterValues }
  return (
    <>
      {m.searchable && (
        <form role="search" onSubmit={(e) => { e.preventDefault(); listing.search() }}>
          <TextInput
            ref={searchBox}
            leadingVisual={SearchIcon}
            aria-label={tx('searchNamed', { name: m.title || tx('theList') })}
            placeholder={tx('search')}
            value={listing.searchText}
            onChange={(e) => {
              listing.setSearchText(e.target.value)
              if (m.searchAsYouType) typed(e.target.value)
            }}
          />
        </form>
      )}
      {m.filters.length > 0 && <FilterPanel filters={m.filters} values={listing.filterValues} onApply={listing.setFilters} active={activeFilterCount(listing.filterValues)} />}
      {offersViews && <SavedViews scope={scope} values={viewValues} onApply={listing.applyView} />}
    </>
  )
}
