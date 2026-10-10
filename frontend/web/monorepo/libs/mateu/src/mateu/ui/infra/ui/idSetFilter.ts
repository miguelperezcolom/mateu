import { chromeText, chromeTextf } from './chromeTexts'

/**
 * The framework's reserved id-set filter: `?ids=A,B,C` on ANY listing's URL shows exactly those
 * rows — a link, or the assistant after finding some records with its tools, points at a concrete
 * set instead of at the whole listing. No listing declares it; the server applies it (see
 * SearchRequest.ids on the Java side). Here it is just one more filter key of the listing state:
 * restored from the URL, sent with every search, kept in the URL, shown as a removable chip.
 */
export const IDS_PARAM = 'ids'

/** The free-text search's URL key, and the short alias a hand-written link may use instead. */
export const SEARCH_PARAM = 'searchText'
export const SEARCH_ALIAS = 'q'

/** The ids of a state/URL value: a comma-joined string or a list; trimmed, blanks and repeats out. */
export function parseIds(raw: unknown): string[] {
    if (raw === undefined || raw === null) return []
    const items = Array.isArray(raw) ? raw : String(raw).split(',')
    const ids: string[] = []
    for (const item of items) {
        if (item === undefined || item === null) continue
        const id = String(item).trim()
        if (id && !ids.includes(id)) ids.push(id)
    }
    return ids
}


/**
 * The chip the id set shows as: the ids themselves while they are few enough to read
 * («Selección: 4MBZS7, JXD3G6»), a count beyond that. Undefined when no id is set.
 */
export function idsChip(raw: unknown, lang?: string): { label: string, display: string } | undefined {
    const ids = parseIds(raw)
    if (!ids.length) return undefined
    return {
        label: chromeText('selection', lang),
        display: ids.length <= 3 ? ids.join(', ') : chromeTextf('selectedItems', { count: ids.length }, lang),
    }
}
