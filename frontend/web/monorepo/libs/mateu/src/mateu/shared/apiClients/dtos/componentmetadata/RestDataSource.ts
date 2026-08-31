/**
 * Descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE: the renderer fetches
 * the URL directly and shapes the JSON response into the surface's expected form (a select's options
 * today). `url`/`headers`/`body` support `${state.x}` interpolation; `itemsPath` navigates to the
 * response array; `valuePath`/`labelPath` map each item.
 *
 * A descriptor says where to go in one of two ways: by REFERENCE (`ref` names an entry of the app's
 * catalogue, so the endpoint is declared once and a deployment can be re-pointed by editing the
 * catalogue) or INLINE (`url` and the paths). Whatever a surface declares here wins over the entry,
 * so it can point at a shared endpoint and still map the response its own way.
 */
export default interface RestDataSource {
    /** Name of a catalogue entry to take the endpoint from; absent/blank means this is inline. */
    ref?: string | undefined
    url?: string | undefined
    method?: string | undefined
    headers?: Record<string, string> | undefined
    body?: string | undefined
    itemsPath?: string | undefined
    valuePath?: string | undefined
    labelPath?: string | undefined
    /** Route the fetch through the Mateu server (no CORS, secrets injected server-side) instead of
     * fetching directly from the browser. The renderer dispatches the reserved `__restfetch__`
     * action instead of a direct `fetch`. */
    proxy?: boolean | undefined
}
