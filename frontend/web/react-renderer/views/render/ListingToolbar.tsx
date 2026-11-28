import { useRef } from 'react'
import { Stack, TextInput } from '@kit'
import { SearchIcon } from '@kit/icons'
import { activeFilterCount } from '@rn/renderer/crudListing'
import { useController } from '@mr/render/ViewHost'
import { type Dict, type Row } from '@mr/listing/rows'
import { FilterPanel } from './listing/filters'
import { SavedViews } from './listing/SavedViews'
import { ColumnChooser, useColumnPrefs } from './listing/ColumnChooser'
import { Model, Listing, useAutoFocus, useDebounced } from './CrudRenderer'
import { tx } from '@mr/i18n/texts'
// Split out of CrudRenderer.tsx: a design system with its own markup for it overrides only this file.

/** Above the rows: the search box, Filter, saved views and Columns, in a row of their own (the
 *  listing's own actions sit beside its title — ListingButtons). */
export function ListingActions({ m, listing, scope, columnPrefs }: {
  m: Model; listing: Listing; scope: string; columnPrefs: ReturnType<typeof useColumnPrefs>; state: Dict; selected: Row[]
  /** The title's id and the row count (a design system whose toolbar carries the title uses them). */
  titleId?: string; total?: number
}) {
  const controller = useController()
  const offersViews = (m.searchable || m.filters.length > 0) && !controller.windowless
  const tableLike = m.layout !== 'tree' && m.defs.length > 1
  if (!offersViews && !tableLike && !m.searchable && !m.filters.length) return null
  return (
    <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center" className="mateu-listing-search">
      <ListingSearch m={m} listing={listing} scope={scope} offersViews={offersViews} />
      {tableLike && <ColumnChooser defs={m.defs} prefs={columnPrefs.prefs} onChange={columnPrefs.update} />}
    </Stack>
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
