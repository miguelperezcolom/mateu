import RestDataSource from "@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts";

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of
 * dispatching to the Mateu server: the renderer fetches `source` directly (url/headers/body
 * interpolated from the form state), shows `successMessage` as a toast on a 2xx response, and — when
 * `resultPath` is set — merges the object at that path in the JSON response into the form state.
 * When `successRoute` is set, the client navigates there after a 2xx (interpolated against the
 * state, with the merged response already applied) — so an edit form's Save lands on its view.
 */
export default interface RestActionDto {
    source: RestDataSource
    successMessage?: string | undefined
    resultPath?: string | undefined
    successRoute?: string | undefined
    // When true, run the call once per selected listing row (crud_selected_items), each row as the
    // interpolation scope — a per-id endpoint becomes a bulk operation over the checked rows.
    forEachSelectedRow?: boolean | undefined
}
