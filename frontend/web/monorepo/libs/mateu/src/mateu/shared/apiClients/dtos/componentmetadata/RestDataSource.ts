/**
 * Descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE: the renderer fetches
 * the URL directly and shapes the JSON response into the surface's expected form (a select's options
 * today). `url`/`headers`/`body` support `${state.x}` interpolation; `itemsPath` navigates to the
 * response array; `valuePath`/`labelPath` map each item.
 */
export default interface RestDataSource {
    url: string
    method?: string | undefined
    headers?: Record<string, string> | undefined
    body?: string | undefined
    itemsPath?: string | undefined
    valuePath?: string | undefined
    labelPath?: string | undefined
}
