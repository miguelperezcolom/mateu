package io.mateu.core.application.microfrontends;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.CorrelationIdProvider;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * The request's {@code X-Mateu-Correlation-Id}, else the trace id of its W3C {@code traceparent},
 * else a fresh one — remembered on the request, so every remote called for it gets the same id.
 */
public final class DefaultCorrelationIdProvider implements CorrelationIdProvider {

  public static final String HEADER = "X-Mateu-Correlation-Id";
  private static final String ATTRIBUTE = "mateu.correlationId";
  private static final Pattern SAFE = Pattern.compile("[A-Za-z0-9._:-]{1,128}");
  private static final Pattern TRACEPARENT =
      Pattern.compile("[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}");

  @Override
  public String correlationId(HttpRequest request) {
    if (request == null) {
      return newId();
    }
    var known = request.getAttribute(ATTRIBUTE);
    if (known instanceof String id) {
      return id;
    }
    var id = fromHeaders(request);
    request.setAttribute(ATTRIBUTE, id);
    return id;
  }

  private static String fromHeaders(HttpRequest request) {
    var declared = request.getHeaderValue(HEADER);
    // a value we pass on to other services: only a sane token, never whatever the client wrote
    if (declared != null && SAFE.matcher(declared.trim()).matches()) {
      return declared.trim();
    }
    var traceparent = request.getHeaderValue("traceparent");
    if (traceparent != null) {
      var matcher = TRACEPARENT.matcher(traceparent.trim().toLowerCase());
      if (matcher.matches()) {
        return matcher.group(1);
      }
    }
    return newId();
  }

  private static String newId() {
    return UUID.randomUUID().toString();
  }
}
