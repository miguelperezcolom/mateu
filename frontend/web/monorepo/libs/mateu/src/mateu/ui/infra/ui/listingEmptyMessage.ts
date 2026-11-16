/**
 * What an empty listing says. The search answer carries the listing's own message next to its
 * page (`data[<crud id>].emptyStateMessage`, from the server's `ListingData`); a message seeded in
 * the component state is still read after it. The renderers used to read ONLY the state, so a
 * `new ListingData<>(page, "Pick a warehouse on the header")` kept showing the default text.
 * Blank counts as none (the renderer's own default then applies).
 */
const messageUnder = (holder: object | undefined | null, id: string | undefined): string | undefined => {
    if (!holder || !id) return undefined
    const entry = (holder as Record<string, unknown>)[id]
    const message = entry && typeof entry === 'object' ? (entry as Record<string, unknown>).emptyStateMessage : undefined
    return typeof message === 'string' && message.trim() ? message : undefined
}

export const listingEmptyMessage = (
    data: object | undefined | null,
    state: object | undefined | null,
    dataId: string | undefined,
    stateId: string | undefined = dataId,
): string | undefined => messageUnder(data, dataId) ?? messageUnder(state, stateId)
