import type RestDataSource from '@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts'

/**
 * Client-side consumption of an arbitrary (non-Mateu) REST endpoint for a field's select options —
 * the first surface of the "decouple the UI from the Mateu backend" line. The renderer fetches the
 * endpoint directly (no Mateu server mediating), navigates to the response array and maps each item
 * into an option. Pure helpers (`getByPath`/`mapItemsToOptions`) are vitest-tested; `fetch` is
 * injectable so `fetchExternalOptions` is too.
 */

export interface FetchedOption {
    value: unknown
    label: string
}

/** Navigate a dot path (`data.items`, `name.common`) into a JSON value; an empty path is identity. */
export function getByPath(obj: unknown, path?: string): unknown {
    if (!path) return obj
    return path.split('.').reduce<unknown>(
        (acc, key) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
        obj,
    )
}

/**
 * Shape a JSON response into options: navigate `itemsPath` to the array, then read `valuePath`/
 * `labelPath` from each item. A primitive array element becomes its own value and label; a missing
 * value falls back to the label (and vice-versa) so half-specified mappings still render.
 */
export function mapItemsToOptions(
    json: unknown,
    itemsPath?: string,
    valuePath: string = 'value',
    labelPath: string = 'label',
): FetchedOption[] {
    const arr = getByPath(json, itemsPath)
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
        if (item != null && typeof item === 'object') {
            const value = getByPath(item, valuePath)
            const label = getByPath(item, labelPath)
            return { value: value ?? label, label: String(label ?? value ?? '') }
        }
        return { value: item, label: String(item) }
    })
}

/**
 * Shape a JSON response into listing rows: navigate `itemsPath` to the array, then read each column
 * by its id as a dot path from each item (so a `Row(code, name)` reads `code`/`name`). Each row is a
 * plain object keyed by column id — the shape the listing renderer expects.
 */
export function mapItemsToRows(
    json: unknown,
    itemsPath: string | undefined,
    columnIds: string[],
): Record<string, unknown>[] {
    const arr = getByPath(json, itemsPath)
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
        const row: Record<string, unknown> = {}
        for (const id of columnIds) row[id] = getByPath(item, id)
        return row
    })
}

/** Interpolate the url/headers/body of a {@link RestDataSource} and fetch it — the shared leg of the
 * options, rows and action fetches. `resolve` interpolates `${state.x}` templates (pass the shared
 * `interpolate`); defaults to identity for tests. Throws on a non-2xx response. */
export async function fetchExternalJson(
    source: RestDataSource,
    resolve: (tpl: string | undefined) => string | undefined = (t) => t,
    fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
    const url = resolve(source.url) ?? source.url
    const method = (source.method || 'GET').toUpperCase()
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(source.headers ?? {})) headers[k] = resolve(v) ?? v
    const init: RequestInit = { method, headers }
    if (method !== 'GET' && method !== 'HEAD' && source.body) init.body = resolve(source.body) ?? source.body
    const res = await fetchImpl(url, init)
    if (!res.ok) throw new Error(`External REST fetch failed: ${res.status}`)
    return res.json()
}

/**
 * Fetch a field's options from its {@link RestDataSource}. `resolve` interpolates `${state.x}`
 * templates in the url/headers/body against the current field context (pass the shared
 * `interpolate`); it defaults to identity for tests. Throws on a non-2xx response.
 */
export async function fetchExternalOptions(
    source: RestDataSource,
    resolve: (tpl: string | undefined) => string | undefined = (t) => t,
    fetchImpl: typeof fetch = fetch,
): Promise<FetchedOption[]> {
    const json = await fetchExternalJson(source, resolve, fetchImpl)
    return mapItemsToOptions(json, source.itemsPath, source.valuePath, source.labelPath)
}

/**
 * Fetch a listing's rows from its {@link RestDataSource}, mapping each JSON item into a row keyed by
 * column id (see {@link mapItemsToRows}). `resolve` interpolates the url/headers/body — pass the
 * shared `interpolate` so `${searchText}`/`${page}`/`${size}` reach a server-side endpoint.
 */
export async function fetchExternalRows(
    source: RestDataSource,
    columnIds: string[],
    resolve: (tpl: string | undefined) => string | undefined = (t) => t,
    fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>[]> {
    const json = await fetchExternalJson(source, resolve, fetchImpl)
    return mapItemsToRows(json, source.itemsPath, columnIds)
}
