/**
 * Which query keys of the address bar belong to which listing.
 *
 * <p>A listing keeps its filters, page and sort in the query string (`?status=open&page=2`). With
 * ONE listing on the page that is the whole story, and the keys stay bare so links keep working.
 * Two listings on one page (a record page with two embedded listings, a listing in a drawer over
 * another) used to write the very same keys: paging the second one paged the first, and each
 * one's write looked to the other like "the URL asked for other filters", so it started over.
 *
 * <p>The first listing that asks keeps the bare keys; every other listing connected at the same
 * time prefixes its keys with its id (`orders.page=2`). The scope is decided once, on the first
 * use (after the commit that mounted it: a listing replaced by the next screen is gone by then),
 * and kept for the element's life.
 */

/** History entries a listing wrote carry this flag (mateu-ui: a move between two of them is the listing's). */
export const LISTING_ENTRY = '__mateuListing'

const connected: object[] = []

/** The listing is on the page. */
export const registerListing = (el: object): void => {
    if (!connected.includes(el)) connected.push(el)
}

/** The listing left the page. */
export const unregisterListing = (el: object): void => {
    const i = connected.indexOf(el)
    if (i >= 0) connected.splice(i, 1)
}

/**
 * Whether another listing is on the page too. Then a listing's search text and filters must stay
 * its OWN: they used to bubble (value-changed) into the state of the component around, which hands
 * that state to every listing it draws — searching one listing put its chip on the other, which
 * did not filter.
 */
export const sharesThePageWithAnotherListing = (el: object): boolean =>
    connected.some(o => o !== el)

const scopes = new WeakMap<object, string>()

/** The key prefix of this listing: '' for the first one on the page, `<id>.` for any other. */
export const listingUrlPrefix = (el: object, id: string | undefined): string => {
    const known = scopes.get(el)
    if (known !== undefined) return known
    const others = connected.filter(o => o !== el && scopes.get(o) === '')
    const prefix = others.length === 0 || !id ? '' : `${id}.`
    scopes.set(el, prefix)
    return prefix
}

/** The listing's own params (prefix removed) among {@code keys}; other listings' keys are left out. */
export const ownParams = (search: string, prefix: string, keys: Iterable<string>): URLSearchParams => {
    const all = new URLSearchParams(search)
    const own = new URLSearchParams()
    for (const key of keys) {
        const value = all.get(prefix + key)
        if (value !== null) own.set(key, value)
    }
    return own
}

/**
 * The query string with this listing's {@code keys} replaced by {@code values} (prefixed); every
 * other key — another listing's, the app's own — kept as it was.
 */
export const withOwnParams = (search: string, prefix: string, keys: Iterable<string>,
                              values: Record<string, string>): string => {
    const params = new URLSearchParams(search)
    for (const key of keys) params.delete(prefix + key)
    Object.entries(values).forEach(([key, value]) => params.set(prefix + key, value))
    return params.toString()
}

/** A stable text of this listing's own params, to tell "the URL moved for ME" from another listing's write. */
export const ownQueryText = (search: string, prefix: string, keys: Iterable<string>): string => {
    // in the listing's own key order: equal texts for the same params, and the same text the
    // listing writes when no other key is around
    return ownParams(search, prefix, keys).toString()
}

/** Tests only. */
export const resetListingScopesForTests = (): void => {
    connected.length = 0
}
