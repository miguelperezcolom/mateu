package io.mateu.uidl.data;

/**
 * A button/action that calls an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE — the request rides
 * in {@code source} (reusing {@link RestDataSource}), a 2xx shows {@code successMessage} as a
 * toast, and {@code resultPath} (when set) points at the object in the JSON response to merge into
 * the form state. The action counterpart of {@code @RestOptions}/{@code @RestListing}.
 */
public record RestAction(RestDataSource source, String successMessage, String resultPath) {}
