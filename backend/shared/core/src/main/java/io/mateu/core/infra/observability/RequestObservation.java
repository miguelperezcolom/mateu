package io.mateu.core.infra.observability;

import io.mateu.uidl.audit.ActionOutcome;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * What is known about ONE Mateu request while it runs, kept on the request (attribute {@value
 * #ATTRIBUTE}): the view it resolved to, how it ended, the records it acted on. Filled by the
 * request path (the error boundary, the not-found page, the CRUD handlers) and read when the
 * request ends, by its span, its metrics and the audit listeners. Never any field value.
 */
public final class RequestObservation {

  static final String ATTRIBUTE = "mateu.observation";
  private static final int MAX_RECORD_IDS = 1000;

  final long startNanos = System.nanoTime();
  final Instant at = Instant.now();
  final String route;
  final String actionId;
  volatile String view;
  volatile ActionOutcome outcome = ActionOutcome.OK;
  volatile String errorType;
  volatile String errorReference;
  volatile String correlationId;

  /** The telemetry context of the request's span (an OpenTelemetry {@code Context}), or null. */
  volatile Object telemetryContext;

  private final List<String> recordIds = new ArrayList<>();

  RequestObservation(String route, String actionId) {
    this.route = route;
    this.actionId = actionId == null ? "" : actionId;
  }

  /** The observation of this request, or null when it is not observed (a unit test's request). */
  public static RequestObservation of(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    try {
      return httpRequest.getAttribute(ATTRIBUTE) instanceof RequestObservation known ? known : null;
    } catch (RuntimeException noAttributes) {
      return null;
    }
  }

  /** The view the request resolved to (a container proxy is named by the class it proxies). */
  public static void view(HttpRequest httpRequest, Object instance) {
    var observation = of(httpRequest);
    if (observation == null || instance == null) {
      return;
    }
    Class<?> type = instance.getClass();
    if (type.getName().contains("$$") && type.getSuperclass() != null) {
      type = type.getSuperclass();
    }
    observation.view = type.getName();
  }

  /** The request ended in a message for the user, a not-found page or a bug. */
  public static void outcome(
      HttpRequest httpRequest, ActionOutcome outcome, Throwable error, String errorReference) {
    var observation = of(httpRequest);
    if (observation == null || outcome == null) {
      return;
    }
    observation.outcome = outcome;
    if (error != null) {
      observation.errorType = error.getClass().getName();
    }
    if (errorReference != null) {
      observation.errorReference = errorReference;
    }
  }

  /** The records the action acted on (their ids, as strings); nulls are skipped. */
  public static void recordIds(HttpRequest httpRequest, Collection<?> ids) {
    var observation = of(httpRequest);
    if (observation == null || ids == null) {
      return;
    }
    synchronized (observation.recordIds) {
      for (var id : ids) {
        if (id != null && observation.recordIds.size() < MAX_RECORD_IDS) {
          observation.recordIds.add(String.valueOf(id));
        }
      }
    }
  }

  /** One record the action acted on. */
  public static void recordId(HttpRequest httpRequest, Object id) {
    if (id != null) {
      recordIds(httpRequest, List.of(id));
    }
  }

  List<String> recordIds() {
    synchronized (recordIds) {
      return recordIds.stream().filter(Objects::nonNull).distinct().toList();
    }
  }

  long durationNanos() {
    return System.nanoTime() - startNanos;
  }
}
