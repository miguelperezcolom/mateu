package io.mateu.uidl.data;

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE — the request rides
 * in {@code source} (reusing {@link RestDataSource}), a 2xx shows {@code successMessage} as a
 * toast, {@code resultPath} (when set) points at the object in the JSON response to merge into the
 * form state, and {@code successRoute} (when set) is a route the client navigates to AFTER a
 * successful call — interpolated against the form state (with the merged response already applied),
 * so an edit form's Save can land on {@code people/${state.id}}, its own read-only view. The action
 * counterpart of {@code @RestOptions}/{@code @RestListing}.
 */
public record RestAction(
    RestDataSource source, String successMessage, String resultPath, String successRoute) {}
