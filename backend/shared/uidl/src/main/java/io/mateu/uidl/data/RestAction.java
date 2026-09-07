package io.mateu.uidl.data;

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE — the request rides
 * in {@code source} (reusing {@link RestDataSource}), a 2xx shows {@code successMessage} as a
 * toast, {@code resultPath} (when set) points at the object in the JSON response to merge into the
 * form state, and {@code successRoute} (when set) is a route the client navigates to AFTER a
 * successful call — interpolated against the form state (with the merged response already applied),
 * so an edit form's Save can land on {@code people/${state.id}}, its own read-only view. The action
 * counterpart of {@code @RestOptions}/{@code @RestListing}.
 *
 * <p>When {@code forEachSelectedRow} is true the call is run ONCE PER SELECTED ROW of the listing
 * (the {@code crud_selected_items} of the component state), with that row as the interpolation
 * scope — so a per-id endpoint like {@code DELETE people/${state.id}} becomes a bulk delete of the
 * checked rows. Pair it with {@code successRoute} pointing back at the listing to reload it.
 */
public record RestAction(
    RestDataSource source,
    String successMessage,
    String resultPath,
    String successRoute,
    boolean forEachSelectedRow) {}
