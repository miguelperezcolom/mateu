import { parse, stringify } from 'yaml'

/**
 * The REST source catalogue (`sources.yaml`, the "Services" of the plan's Phase 4): each external
 * endpoint named once — url (with `${state.…}` interpolation), method, where the items and the total
 * live — and referenced by name from listings (`rowsSource: {ref}`), fields (`optionsSource`),
 * routes (`data:`) and actions (`restAction.source`). Edited as a table; every key the table does
 * not show (headers, body, proxy, a field map…) is kept verbatim.
 */
export interface SourceRow {
    name: string
    description?: string
    url?: string
    method?: string
    itemsPath?: string
    totalPath?: string
    /** Other keys of the entry, verbatim. */
    extra: Record<string, unknown>
    /** Other keys of the entry's `source:` descriptor (headers, body, proxy, valuePath…), verbatim. */
    sourceExtra: Record<string, unknown>
}

export interface SourcesDoc {
    rows: SourceRow[]
    preamble: Record<string, unknown>
}

const ENTRY_KNOWN = ['name', 'description', 'source', 'totalPath']
const SOURCE_KNOWN = ['url', 'method', 'itemsPath']

export function parseSourcesDoc(yaml: string): SourcesDoc {
    let root: any
    try { root = parse(yaml) } catch { root = null }
    if (!root || typeof root !== 'object' || Array.isArray(root)) return { rows: [], preamble: {} }
    const { sources, ...preamble } = root
    const rows: SourceRow[] = (Array.isArray(sources) ? sources : []).map((e: any) => {
        const src = e?.source && typeof e.source === 'object' ? e.source : {}
        return {
            name: typeof e?.name === 'string' ? e.name : '',
            description: e?.description,
            url: src.url,
            method: src.method,
            itemsPath: src.itemsPath,
            totalPath: e?.totalPath,
            extra: pick(e ?? {}, ENTRY_KNOWN),
            sourceExtra: pick(src, SOURCE_KNOWN),
        }
    })
    return { rows, preamble }
}

export function serializeSourcesDoc(doc: SourcesDoc): string {
    const sources = doc.rows.map((r) => {
        const source: Record<string, unknown> = {}
        if (r.url) source.url = r.url
        if (r.method) source.method = r.method
        if (r.itemsPath) source.itemsPath = r.itemsPath
        Object.assign(source, r.sourceExtra)
        const out: Record<string, unknown> = { name: r.name }
        if (r.description) out.description = r.description
        if (Object.keys(source).length) out.source = source
        if (r.totalPath) out.totalPath = r.totalPath
        return { ...out, ...r.extra }
    })
    return stringify({ ...doc.preamble, sources })
}

function pick(obj: Record<string, unknown>, known: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj)) if (!known.includes(k)) out[k] = obj[k]
    return out
}
