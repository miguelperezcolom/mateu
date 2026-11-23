import React, { useRef } from 'react'
import { type Row } from '@mr/listing/rows'
import { ShowMore, type PagerProps } from '@mr/views/render/ListingPager'

/**
 * Fiori grows a list ("More"), it never pages it: every page loaded so far stays on screen; page 0
 * starts over (a new search, sort or filter). Kept in a ref, written during render — idempotent for
 * a given page (a page's rows are re-read from the answer every time), so it never loops through an
 * effect.
 */
export function useLoadedRows(_infinite: boolean, paging: PagerProps['paging']): Row[] {
  const pages = useRef(new Map<number, Row[]>())
  if (paging.pageNumber === 0) pages.current = new Map()
  pages.current.set(paging.pageNumber, paging.rows as Row[])
  return [...pages.current.keys()].sort((a, b) => a - b).flatMap((k) => pages.current.get(k) ?? [])
}

/** A table grows through ui5-table's own growing button (ListingTable); the other layouts get "More". */
export function ListingPager({ m, paging, loaded, onPage }: PagerProps) {
  if ((m.layout === 'table' || m.layout === 'auto') && !m.detailPath) return null
  return loaded < paging.totalElements
    ? <ShowMore loaded={loaded} total={paging.totalElements} onMore={() => onPage(paging.pageNumber + 1)} />
    : null
}

export { ShowMore, type PagerProps }
