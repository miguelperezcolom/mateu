/**
 * The arithmetic behind the pager, kept apart from the element so it can be reasoned about (and
 * tested) on its own — and because every answer it has to survive is one a backend can send.
 *
 * A listing page arrives as three numbers, and two of them are supplied by whoever implemented the
 * listing: a `pageSize` of 0 (a store that reports the rows THIS page happens to carry instead of
 * the size it was asked for, which is 0 rows once the requested page is past the end) used to reach
 * the template as `Math.ceil(total / 0)` — the reader saw "Page 3423 of Infinity", the next/last
 * buttons stayed enabled forever, and "last page" asked for page `Infinity`.
 */
export interface PaginationView {
  /** Pages the answer describes, or undefined when the page size makes it unknowable. */
  totalPages?: number
  /** The page to present, clamped into the range above when that range is known. */
  currentPage: number
  /** Worth drawing a pager at all. */
  multiPage: boolean
  isFirst: boolean
  isLast: boolean
}

const asCount = (value: number | undefined): number => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

export const computePagination = (
  totalElements: number | undefined,
  pageSize: number | undefined,
  pageNumber: number | undefined,
): PaginationView => {
  const total = asCount(totalElements)
  const size = asCount(pageSize)
  const asked = asCount(pageNumber)

  // No usable page size: how many pages there are cannot be derived, so the pager claims nothing.
  // It still offers the way back — the reader who deep-linked past the end would otherwise sit on
  // an empty page with no control to leave it.
  if (size === 0) {
    return {
      totalPages: undefined,
      currentPage: asked,
      multiPage: asked > 0,
      isFirst: asked === 0,
      isLast: true,
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size))
  const currentPage = Math.min(asked, totalPages - 1)
  return {
    totalPages,
    currentPage,
    multiPage: totalPages > 1,
    isFirst: currentPage === 0,
    isLast: currentPage >= totalPages - 1,
  }
}
