package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * What happened to one micro frontend the host tried to resolve: enough for whoever operates the
 * remote to diagnose a slow fragment without having written the screen.
 *
 * @param remoteId the registered remote it belongs to
 * @param url the url the host asked (base url + route)
 * @param slotKey the content slot key, for a {@code @ContentSlot}; null otherwise
 * @param durationMillis how long it took (until the answer, the failure or the deadline)
 * @param outcome what came of it
 * @param degradedTo what the page got instead when it was not embedded: {@code client} (the
 *     renderer asks the remote, as with {@code resolve = CLIENT}), {@code fallback} (a slot's
 *     fallback) or {@code nothing}; null when it was embedded
 * @param correlationId the correlation id sent to the remote
 * @param error why it failed, for {@link Outcome#ERROR}
 */
@Experimental
@Builder
public record MicroFrontendResolutionEvent(
    String remoteId,
    String url,
    String slotKey,
    long durationMillis,
    Outcome outcome,
    String degradedTo,
    String correlationId,
    String error) {

  public enum Outcome {
    /** The remote answered in time: embedded in the response. */
    EMBEDDED,
    /** Embedded from the host's cache, as the remote allowed. */
    FROM_CACHE,
    /** The remote did not answer within the budget; the call was cancelled. */
    TIMEOUT,
    /** The remote failed or answered an error. */
    ERROR,
    /** The remote answered with nothing to show (an empty content slot). */
    EMPTY
  }
}
