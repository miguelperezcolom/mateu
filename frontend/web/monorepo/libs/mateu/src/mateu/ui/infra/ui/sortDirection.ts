/**
 * A sort direction read from a URL (`?sort=name:asc`): the wire knows `ascending` / `descending`
 * only (the server's `Direction.valueOf`), and a link typed or shared by hand says `asc`/`desc` or
 * mixes case. Anything else is dropped rather than sent — the server answered an unknown direction
 * with "Something went wrong". Redwood's listing reader applies the same rule.
 */
export const sortDirectionOf = (raw: string | undefined | null): 'ascending' | 'descending' | undefined => {
    const value = (raw ?? '').trim().toLowerCase()
    if (value === 'ascending' || value === 'asc') return 'ascending'
    if (value === 'descending' || value === 'desc') return 'descending'
    return undefined
}
