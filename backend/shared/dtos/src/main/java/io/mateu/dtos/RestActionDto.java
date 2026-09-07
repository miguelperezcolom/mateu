package io.mateu.dtos;

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE instead of
 * dispatching to the Mateu server: the renderer fetches {@code source} directly
 * (url/method/headers/ body interpolated from the form state), then applies the response — shows
 * {@code successMessage} as a toast and, when {@code resultPath} is set, merges the object at that
 * path in the JSON response into the form state (so bound fields refresh).
 *
 * <p>The action surface of the "decouple the UI from the Mateu backend" line, reusing the shared
 * {@link RestDataSourceDto} for the request.
 *
 * @param source the request descriptor (url/method/headers/body; the item/value/label paths are
 *     unused for actions)
 * @param successMessage a toast shown on a 2xx response (interpolated); blank shows none
 * @param resultPath a dot path to the object in the response to merge into the form state; blank
 *     merges nothing (fire-and-toast)
 * @param successRoute a route the client navigates to after a 2xx (interpolated against the state,
 *     with the merged response already applied); blank stays on the page
 * @param forEachSelectedRow when true, the call runs once per selected listing row ({@code
 *     crud_selected_items}), each row as the interpolation scope — a per-id endpoint becomes a bulk
 *     operation over the checked rows
 */
public record RestActionDto(
    RestDataSourceDto source,
    String successMessage,
    String resultPath,
    String successRoute,
    boolean forEachSelectedRow) {}
