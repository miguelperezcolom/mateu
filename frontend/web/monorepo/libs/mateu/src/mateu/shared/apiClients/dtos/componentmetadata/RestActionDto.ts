import RestDataSource from "@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts";

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of
 * dispatching to the Mateu server: the renderer fetches `source` directly (url/headers/body
 * interpolated from the form state), shows `successMessage` as a toast on a 2xx response, and — when
 * `resultPath` is set — merges the object at that path in the JSON response into the form state.
 */
export default interface RestActionDto {
    source: RestDataSource
    successMessage?: string | undefined
    resultPath?: string | undefined
}
