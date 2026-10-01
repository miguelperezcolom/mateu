/**
 * How a search answer for a listing lands on the data a component already holds.
 *
 * A listing is either PAGED (a pager; every answer IS the page to show) or INFINITE-SCROLLING
 * (no pager; the grid's data provider slices one growing array by row index, so each answer
 * past the first is the next window and has to be appended). The old rule appended every answer
 * whose pageNumber was > 0, whatever the listing — so a paged listing relied on the crud wiping
 * its rows before asking, which only works while the crud and the component share the same page
 * object. Whenever they did not (a listing re-entered from the menu, a back/reload that fired the
 * search twice) the next page was glued under the previous one: twenty rows under a pager that
 * promised ten, starting with the page the reader had just left.
 */

/** Whether the listing with this id, somewhere in the component tree, scrolls infinitely. */
export const isInfiniteListing = (root: unknown, listingId: string): boolean => {
    const seen = new Set<unknown>()
    const walk = (node: unknown, depth: number): boolean => {
        if (!node || typeof node !== 'object' || seen.has(node) || depth > 40) return false
        seen.add(node)
        if (Array.isArray(node)) return node.some(child => walk(child, depth + 1))
        const n = node as Record<string, any>
        if (n.id === listingId && n.metadata && typeof n.metadata === 'object' && n.metadata.infiniteScrolling) {
            return true
        }
        for (const key of ['children', 'metadata', 'content', 'columns', 'tabs', 'components', 'header', 'footer']) {
            if (walk(n[key], depth + 1)) return true
        }
        return false
    }
    return walk(root, 0)
}

/**
 * The data map after a fragment's data lands: paged listings take the answer as it comes; an
 * infinite-scrolling listing's later window is appended to the rows before it — never twice (a
 * repeated answer for the same window replaces that window instead of doubling it).
 */
export const mergeListingData = (
    current: Record<string, any>,
    incoming: Record<string, any>,
    infinite: (listingId: string) => boolean,
): Record<string, any> => {
    const merged: Record<string, any> = { ...current }
    for (const key in incoming) {
        const value = incoming[key]
        const page = value?.page
        const previous = current?.[key]?.page?.content
        const pageNumber = Number(page?.pageNumber)
        if (pageNumber > 0 && Array.isArray(previous) && infinite(key)) {
            const size = Number(page.pageSize)
            const before = size > 0 && previous.length >= pageNumber * size
                ? previous.slice(0, pageNumber * size)
                : previous
            merged[key] = { ...value, page: { ...page, content: [...before, ...(page.content ?? [])] } }
        } else {
            merged[key] = value
        }
    }
    return merged
}
