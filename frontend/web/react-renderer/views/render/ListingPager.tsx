import React, { useEffect, useState } from 'react'
import { Button, Table, Text } from '@kit'
import { pagingOf } from '@rn/renderer/crudListing'
import { type Row } from '@mr/listing/rows'
import { tx } from '@mr/i18n/texts'

// Split out of CrudRenderer.tsx: how a listing moves through its pages — a design system that grows
// its lists instead of paging them (Fiori: "More") overrides only this file.

type Paging = ReturnType<typeof pagingOf>

/**
 * The rows on screen: the page — or, with infiniteScrolling, every page loaded so far (page 0
 * starts over: a new search, sort or filter).
 */
export function useLoadedRows(infinite: boolean, paging: Paging): Row[] {
  const [acc, setAcc] = useState<{ pages: Map<number, Row[]>; key: unknown }>({ pages: new Map(), key: null })
  useEffect(() => {
    if (!infinite) return
    setAcc((a) => {
      const pages = paging.pageNumber === 0 ? new Map<number, Row[]>() : new Map(a.pages)
      pages.set(paging.pageNumber, paging.rows as Row[])
      return { pages, key: paging.rows }
    })
  }, [infinite, paging.rows, paging.pageNumber])
  if (!infinite) return paging.rows as Row[]
  const pages = acc.key === paging.rows ? acc.pages : new Map([...acc.pages, [paging.pageNumber, paging.rows as Row[]]])
  return [...pages.keys()].sort((a, b) => a - b).flatMap((k) => pages.get(k) ?? [])
}

export interface PagerProps {
  /** What the listing declares: infiniteScrolling, its title, its layout, @Details rows. */
  m: { infinite: boolean; title: string; layout: string; detailPath?: unknown }
  paging: Paging
  /** The rows on screen now. */
  loaded: number
  onPage: (page: number) => void
}

/** Under the rows: "Show more" with infiniteScrolling, else the pages (Table.Pagination). */
export function ListingPager({ m, paging, loaded, onPage }: PagerProps) {
  if (m.infinite) return <ShowMore loaded={loaded} total={paging.totalElements} onMore={() => onPage(paging.pageNumber + 1)} />
  return <ListingPaging paging={paging} title={m.title} onPage={onPage} />
}

export function ShowMore({ loaded, total, onMore }: { loaded: number; total: number; onMore: () => void }) {
  if (total <= 0) return null
  return (
    <div className="mateu-listing-more">
      {loaded < total
        ? <Button onClick={onMore}>{tx('showMore')} ({loaded} / {total})</Button>
        : <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{total} {total === 1 ? 'item' : 'items'}</Text>}
    </div>
  )
}

function ListingPaging({ paging, title, onPage }: { paging: Paging; title: string; onPage: (i: number) => void }) {
  if (paging.totalElements > paging.pageSize && paging.pageSize > 0) {
    return (
      <Table.Pagination
        key={`${paging.pageNumber}-${paging.totalElements}`}
        aria-label={tx('pagesOf', { name: title || tx('theList') })}
        pageSize={paging.pageSize}
        totalCount={paging.totalElements}
        defaultPageIndex={paging.pageNumber}
        onChange={({ pageIndex }: { pageIndex: number }) => onPage(pageIndex)}
      />
    )
  }
  if (paging.totalElements <= 0) return null
  return <Text as="p" size="small" style={{ gridArea: 'footer', color: 'var(--fgColor-muted)' }}>{paging.totalElements} {paging.totalElements === 1 ? 'item' : 'items'}</Text>
}
