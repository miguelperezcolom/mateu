package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The correlation id of a request, propagated to every remote the host calls for it (header {@code
 * X-Mateu-Correlation-Id}) and written in the trace of each fragment, so whoever operates the
 * remote can follow a slow fragment back to the screen that asked for it.
 *
 * <p>Mateu's own reads {@code X-Mateu-Correlation-Id}, else the trace id of a W3C {@code
 * traceparent}, else makes one up; an application with its own tracing declares a bean of this
 * type.
 */
@Experimental
public interface CorrelationIdProvider {

  String correlationId(HttpRequest request);
}
