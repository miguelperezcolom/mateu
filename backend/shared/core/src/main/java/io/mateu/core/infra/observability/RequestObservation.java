package io.mateu.core.infra.observability;

import io.mateu.uidl.audit.ActionOutcome;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import org.reactivestreams.Publisher;

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

  /** Path segments of {@link #route} that name a record (a crud's {@code /:id}), or empty. */
  private final java.util.Set<String> recordSegments =
      java.util.concurrent.ConcurrentHashMap.newKeySet();

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
    if (type.getName().startsWith("io.mateu.dtos.") || instance instanceof Publisher<?>) {
      // what a route handler (a crud's record page) handed over is already the WIRE answer: the
      // view is still the view model that built it, named by the earlier call
      return;
    }
    if (instance instanceof io.mateu.uidl.interfaces.ComponentTreeSupplier tree) {
      // a bridge (a capability listing promoted to a crud, an adapted model) is named by the
      // view model it stands for, as on the wire
      try {
        var advertised = tree.serverSideType();
        if (advertised != null && !advertised.isBlank() && !advertised.contains("$$")) {
          observation.view = advertised;
          return;
        }
      } catch (RuntimeException ignored) {
        // named by its class below
      }
    }
    if (type.getName().contains("$$") && type.getSuperclass() != null) {
      type = type.getSuperclass();
    }
    observation.view = type.getName();
  }

  /**
   * The route names a record by this path segment (a crud's {@code /P-002} or {@code /P-002/edit}):
   * measured as {@code :id}, whatever it looks like — an id that does not look like one ({@code
   * P-002}) is still one series per record otherwise.
   */
  public static void recordSegment(HttpRequest httpRequest, String segment) {
    var observation = of(httpRequest);
    if (observation == null || segment == null) {
      return;
    }
    addRecordSegment(observation, segment);
  }

  /** The crud's own route words are never a record, whatever a record is called. */
  private static final java.util.Set<String> ROUTE_WORDS = java.util.Set.of("new", "edit", "view");

  private static void addRecordSegment(RequestObservation observation, String segment) {
    if (segment.isBlank() || segment.contains("/") || ROUTE_WORDS.contains(segment)) {
      return;
    }
    if (observation.recordSegments.size() < MAX_RECORD_IDS) {
      observation.recordSegments.add(segment);
    }
  }

  /** The route as measured: its template, with the segments known to name a record as ids. */
  String routeTemplate() {
    return TelemetryNames.routeTemplate(route, recordSegments);
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
          // the record an action acted on, named by the route it ran at (a save at /P-002/edit)
          addRecordSegment(observation, String.valueOf(id));
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
