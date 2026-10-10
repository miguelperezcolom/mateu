/**
 * The listing's pre-search content (`Crud.preSearch`, the Redwood smart filter search `dashboard`
 * slot): what a search-first listing shows BEFORE its first search. The rule is one line, but every
 * renderer has to agree on it, so it lives here: shown while the listing has received no rows
 * envelope at all; the first search answer replaces it for good — a later empty result is an empty
 * result, not a reason to bring the dashboard back.
 */
export const showsPreSearch = (
    metadata: { preSearch?: unknown[] | null } | undefined,
    listing: unknown,
): boolean => !!metadata?.preSearch?.length && listing === undefined
