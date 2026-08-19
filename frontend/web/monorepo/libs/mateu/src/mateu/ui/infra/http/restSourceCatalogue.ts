import type RestDataSource from '@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts'
import type RestSourceEntry from '@mateu/shared/apiClients/dtos/componentmetadata/RestSourceEntry.ts'

/**
 * The app's REST source catalogue, client side.
 *
 * A surface that references a source carries only its NAME, so the endpoint has to be looked up
 * here before any fetch can happen. Holding it in one module rather than threading it through every
 * component is what keeps the lookup at the single place the fetch already goes through.
 *
 * Two things feed it, and both are app-wide rather than per-screen: the app metadata (live backend)
 * and the static bundle's manifest (no backend). Whichever arrives is the whole catalogue — this is
 * a replace, not a merge, because a stale entry surviving a deployment change is exactly the failure
 * the indirection is meant to remove.
 *
 * A reference the catalogue does not carry is NOT resolved to something else: the descriptor is
 * returned as declared and the caller reports it. Silently fetching a half-resolved endpoint would
 * be worse than a visible failure.
 */

let entries: RestSourceEntry[] = []

/** Replaces the catalogue. Called when app metadata or a bundle manifest arrives. */
export const setRestSourceCatalogue = (incoming: RestSourceEntry[] | undefined): void => {
    entries = Array.isArray(incoming) ? incoming : []
}

/** The entry with this name, or undefined. */
export const getRestSource = (name: string | undefined): RestSourceEntry | undefined =>
    name ? entries.find((entry) => entry.name === name) : undefined

/** Everything currently in the catalogue — for diagnostics and tests. */
export const restSourceCatalogue = (): RestSourceEntry[] => entries

const blank = (value: string | undefined): boolean => value === undefined || value === null || value === ''

/**
 * A descriptor with its reference filled in from the catalogue. What the surface declares wins, so
 * it may point at a shared endpoint and still map the response its own way. An inline descriptor is
 * returned untouched, so nothing that worked before changes.
 */
export const resolveRestSource = (source: RestDataSource): RestDataSource => {
    if (!source?.ref) return source
    const entry = getRestSource(source.ref)
    if (!entry?.source) {
        console.warn(`mateu: no REST source named "${source.ref}" in the app's catalogue`)
        return source
    }
    const from = entry.source
    return {
        ...source,
        url: blank(source.url) ? from.url : source.url,
        method: blank(source.method) ? from.method : source.method,
        headers:
            source.headers && Object.keys(source.headers).length > 0 ? source.headers : from.headers,
        body: blank(source.body) ? from.body : source.body,
        itemsPath: blank(source.itemsPath) ? from.itemsPath : source.itemsPath,
        valuePath: blank(source.valuePath) ? from.valuePath : source.valuePath,
        labelPath: blank(source.labelPath) ? from.labelPath : source.labelPath,
        proxy: source.proxy || from.proxy,
    }
}

/**
 * The dot path to read a field by, honouring the referenced source's field map.
 *
 * This is the gap a surface cannot close on its own: a listing reads each column by its id used
 * directly as the path, and a column id cannot be `customer.name`. Declaring the mapping on the
 * source lets a nested response field be consumed under a flat name — once, for every screen that
 * consumes it. An unmapped name is its own path.
 */
export const pathOfField = (source: RestDataSource | undefined, fieldName: string): string => {
    const entry = getRestSource(source?.ref)
    const mapped = entry?.fields?.[fieldName]
    return mapped && mapped !== '' ? mapped : fieldName
}

/** The referenced source's total path, when it declares one paging server-side. */
export const totalPathOf = (source: RestDataSource | undefined): string | undefined =>
    getRestSource(source?.ref)?.totalPath || undefined
