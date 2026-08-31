import type RestDataSource from './RestDataSource.ts'

/**
 * One named entry of the app's REST source catalogue. A surface referencing a source carries only
 * its name; the endpoint itself travels once, here — which is what keeps the same endpoint from
 * being repeated in every screen that consumes it.
 */
export default interface RestSourceEntry {
    name: string
    source: RestDataSource
    /** Fields this source exposes, as `name -> dot path` into each item. A name absent from the map
     * is read as its own path, so a surface naming a response field directly still works. This is
     * what lets a nested field (`customer.name`) be consumed under a flat name (`customerName`),
     * which a listing cannot express by itself because a column id IS the path. */
    fields?: Record<string, string> | undefined
    /** Dot path to the total number of matching items, for a server-paged endpoint. */
    totalPath?: string | undefined
    /** `generate` when the project owes this endpoint, `existing` when somebody else serves it.
     * Build-time information — the renderer ignores it. */
    provenance?: string | undefined
    description?: string | undefined
}
