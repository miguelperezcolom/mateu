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
    /** SAMPLE data — the response the endpoint would return — answered instead of calling it in
     *  sample mode (always in the editor, mock bundles, apps that opt in). */
    sample?: unknown
    /** The same sample read from a JSON/YAML file relative to specs/ui. */
    sampleFile?: string
    /** Other keys of the entry, verbatim. */
    extra: Record<string, unknown>
    /** Other keys of the entry's `source:` descriptor (headers, body, proxy, valuePath…), verbatim. */
    sourceExtra: Record<string, unknown>
}

export interface SourcesDoc {
    rows: SourceRow[]
    preamble: Record<string, unknown>
}

const ENTRY_KNOWN = ['name', 'description', 'source', 'totalPath', 'sample', 'sampleFile']
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
            sample: e?.sample,
            sampleFile: e?.sampleFile,
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
        if (r.sample !== undefined && r.sample !== null) out.sample = r.sample
        if (r.sampleFile) out.sampleFile = r.sampleFile
        return { ...out, ...r.extra }
    })
    return stringify({ ...doc.preamble, sources })
}

function pick(obj: Record<string, unknown>, known: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj)) if (!known.includes(k)) out[k] = obj[k]
    return out
}

/** A sample as the editor shows it: YAML text ('' when there is none). */
export function sampleText(sample: unknown): string {
    return sample === undefined || sample === null ? '' : stringify(sample).trimEnd()
}

/** The text of the "Sample data" box as a sample: JSON or YAML; blank = no sample; an error when it
 *  does not parse (the editor keeps the previous sample and says why). */
export function parseSampleText(text: string): { sample?: unknown; error?: string } {
    if (!text.trim()) return { sample: undefined }
    try {
        return { sample: parse(text) }
    } catch (e) {
        return { error: (e as Error).message.split('\n')[0] }
    }
}
