/**
 * Requests made BY a component for itself, which already shows its own loading state — never the
 * page's busy indicator.
 *
 * A remote combo searching its options spins its own overlay; raising the page veil (or Redwood's
 * busy bar) on top meant two spinners for one keystroke, and a whole screen dimmed while the user
 * only typed in one field. The page indicator is for what the USER started — an action, a
 * navigation — and keeps its delay for those.
 *
 * Local by id, the conventions the backend uses for them (FieldActionCollector):
 *  - `search-<field>` — a lookup's option search (combo, multi-combo, filter lookups), including the
 *    empty search that fills a select, and the type-ahead as the user types;
 *  - `code-<field>` — resolving the label of a code typed into a searchable field;
 *  - `__restfetch__` — a field's `@RestOptions` fetched through the server.
 *
 * Header widgets, the inbox badge and triggered polls already travel as `background`, and the
 * chat talks to the agent outside this transport — they never raised it either.
 */
export const isLocalRequest = (actionId: string | undefined): boolean =>
    !!actionId && (actionId.startsWith('search-') || actionId.startsWith('code-') || actionId === '__restfetch__')

/**
 * A listing's own read (`search`) while it has no rows on screen: the listing draws its skeleton
 * in place of the rows (mateu-table-crud's "awaiting rows" state), so the page veil on top of it
 * was a second "loading" for one wait — after 600ms a spinner appeared over the skeleton. It is
 * local, like a combo's option search.
 *
 * Only while the rows are NOT there: a re-search that keeps the old rows visible (Enter in the
 * filter bar, an infinite-scroll append, a refresh after an action) draws nothing of its own, and
 * the page indicator is still the only sign that the screen is about to change.
 */
export const isListingOwnLoad = (actionId: string | undefined, rowsOnScreen: boolean): boolean =>
    actionId === 'search' && !rowsOnScreen

/** Whether any listing in a component's data has rows to show (`{<listingId>: {page: {content}}}`). */
export const anyListingRows = (data: Record<string, unknown> | undefined): boolean =>
    Object.values(data ?? {}).some(entry =>
        !!((entry as { page?: { content?: unknown[] } } | null)?.page?.content?.length))

/**
 * `background` for an OnLoad trigger's call. A routed listing is filled by the OnLoad `search` of
 * the component around it, while the listing sits there drawing its skeleton — local (see
 * {@link isListingOwnLoad}). Anything else keeps the trigger's own flag.
 */
export const onLoadBackground = (trigger: { actionId?: string, background?: boolean },
                                 data: Record<string, unknown> | undefined): boolean | undefined =>
    isListingOwnLoad(trigger.actionId, anyListingRows(data)) ? true : trigger.background
