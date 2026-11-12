package io.mateu.core.infra.observability;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.MicroFrontendResolutionEvent;
import java.util.LinkedHashMap;

/**
 * One child span of the request's per micro frontend the host resolved (resolve = SERVER, content
 * slots): {@code mateu microfrontend <remote>}, recorded when its outcome is known with the time it
 * took — the call runs asynchronously, under a deadline, so the span is written after the fact.
 */
public final class MicroFrontendSpans {

  private MicroFrontendSpans() {}

  public static void record(HttpRequest request, MicroFrontendResolutionEvent event) {
    if (event == null) {
      return;
    }
    var attributes = new LinkedHashMap<String, Object>();
    attributes.put("mateu.remote.id", event.remoteId());
    attributes.put("url.full", event.url());
    attributes.put("mateu.content_slot", event.slotKey());
    attributes.put(
        "mateu.microfrontend.outcome",
        event.outcome() != null ? event.outcome().name().toLowerCase(java.util.Locale.ROOT) : null);
    attributes.put("mateu.microfrontend.degraded_to", event.degradedTo());
    attributes.put("mateu.correlation_id", event.correlationId());
    var failed =
        event.outcome() == MicroFrontendResolutionEvent.Outcome.ERROR
            || event.outcome() == MicroFrontendResolutionEvent.Outcome.TIMEOUT;
    Observability.recordChild(
        request,
        "mateu microfrontend " + (event.remoteId() != null ? event.remoteId() : "unregistered"),
        event.durationMillis(),
        attributes,
        failed ? (event.error() != null ? event.error() : event.outcome().name()) : null);
  }
}
