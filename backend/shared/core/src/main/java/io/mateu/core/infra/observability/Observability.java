package io.mateu.core.infra.observability;

import io.mateu.core.application.microfrontends.DefaultCorrelationIdProvider;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.audit.ActionAuditEvent;
import io.mateu.uidl.audit.ActionAuditListener;
import io.mateu.uidl.audit.ActionOutcome;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.CorrelationIdProvider;
import io.mateu.uidl.security.CallerIdentity;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;

/**
 * Observes every Mateu request: one span, two metrics and the {@link ActionAuditListener}s.
 *
 * <ul>
 *   <li><b>Tracing and metrics</b> go through the OpenTelemetry API when it is on the classpath —
 *       an OPTIONAL dependency of mateu-core, detected at runtime: an application that has it (the
 *       Java agent bridges it, Spring Boot's and Quarkus' OpenTelemetry support bring it) gets the
 *       spans, one that does not pays nothing. {@value #ENABLED} = false switches them off.
 *   <li><b>Audit</b>: every {@link ActionAuditListener} bean hears each request once it has ended.
 * </ul>
 *
 * With neither (no API, no listener) a request runs exactly as before: nothing is created for it.
 */
@Slf4j
public final class Observability {

  /** Switch off tracing and metrics even with OpenTelemetry present ({@code true} by default). */
  public static final String ENABLED = "mateu.telemetry.enabled";

  private static final boolean OTEL_PRESENT =
      IdentityResolver.present("io.opentelemetry.api.OpenTelemetry")
          && IdentityResolver.present("io.opentelemetry.context.Context");

  private static final Set<Class<?>> FAILED_LISTENERS = ConcurrentHashMap.newKeySet();

  private Observability() {}

  /** Where spans and metrics go for the request starting now. */
  public static Telemetry telemetry() {
    if (!OTEL_PRESENT || "false".equalsIgnoreCase(MateuSettings.get(ENABLED))) {
      return Telemetry.NOOP;
    }
    try {
      return OtelTelemetry.current();
    } catch (RuntimeException | LinkageError e) {
      // an OpenTelemetry API too old or broken: the request runs unobserved
      return Telemetry.NOOP;
    }
  }

  /**
   * The request's answers, observed: {@code handling} runs with the request's span current on the
   * subscribing thread (so what the action does synchronously nests under it), and when the stream
   * ends — completes, fails or is cancelled after the first answer of a sync request — the span
   * ends, the metrics are recorded and the audit listeners are called.
   */
  public static Flux<UIIncrementDto> observe(
      String route,
      String actionId,
      String serverSideType,
      HttpRequest httpRequest,
      Supplier<Flux<UIIncrementDto>> handling) {
    if (RequestObservation.of(httpRequest) != null) {
      // a request handled again inside itself (MCP → sync): observed once, by its outer call
      return Flux.defer(handling);
    }
    var telemetry = telemetry();
    var listeners = listeners();
    if (telemetry == Telemetry.NOOP && listeners.isEmpty()) {
      return Flux.defer(handling);
    }
    return Flux.defer(
        () -> {
          var observation = new RequestObservation(route, actionId);
          if (serverSideType != null && !serverSideType.isBlank()) {
            observation.view = serverSideType;
          }
          if (httpRequest != null) {
            try {
              httpRequest.setAttribute(RequestObservation.ATTRIBUTE, observation);
            } catch (RuntimeException noAttributes) {
              // a request with no attribute storage: observed without what the path tells
            }
          }
          observation.correlationId = correlationId(httpRequest);
          // resolved now, while the request is surely still there (a stream ends later)
          var caller = listeners.isEmpty() ? null : IdentityResolver.resolve(httpRequest);
          var span = telemetry.startRequest(observation, httpRequest);
          Publisher<UIIncrementDto> current =
              subscriber -> {
                try (var ignored = closeable(span.makeCurrent())) {
                  Flux.defer(handling).subscribe(subscriber);
                }
              };
          return Flux.from(current)
              .doOnError(error -> failed(observation, error))
              .doFinally(
                  signal -> {
                    try {
                      span.end(observation);
                    } catch (RuntimeException e) {
                      log.debug("Could not end the request span: {}", e.toString());
                    }
                    if (!listeners.isEmpty()) {
                      audit(listeners, eventOf(observation, caller));
                    }
                  });
        });
  }

  private static AutoCloseableScope closeable(AutoCloseable scope) {
    return () -> {
      try {
        scope.close();
      } catch (Exception e) {
        log.debug("Could not close the request scope: {}", e.toString());
      }
    };
  }

  private interface AutoCloseableScope extends AutoCloseable {
    @Override
    void close();
  }

  /** What escaped the error boundary: a refusal (403) or, on a reserved path, a failure. */
  private static void failed(RequestObservation observation, Throwable error) {
    if (MateuForbiddenException.find(error) != null) {
      observation.outcome = ActionOutcome.FORBIDDEN;
      return;
    }
    observation.outcome = ActionOutcome.ERROR;
    observation.errorType = error.getClass().getName();
  }

  /** A span as a child of the request's (see {@link Telemetry#child}). */
  public static Telemetry.ChildSpan child(
      HttpRequest httpRequest, String name, Map<String, Object> attributes) {
    return telemetry().child(httpRequest, name, attributes);
  }

  /** A child span of something that already happened (see {@link Telemetry#recordChild}). */
  public static void recordChild(
      HttpRequest httpRequest,
      String name,
      long durationMillis,
      Map<String, Object> attributes,
      String error) {
    telemetry().recordChild(httpRequest, name, durationMillis, attributes, error);
  }

  // ── correlation id ────────────────────────────────────────────────────────

  private static final CorrelationIdProvider DEFAULT_CORRELATION =
      new DefaultCorrelationIdProvider();

  private static String correlationId(HttpRequest httpRequest) {
    try {
      CorrelationIdProvider provider = DEFAULT_CORRELATION;
      if (MateuBeanProvider.isInitialized()) {
        var declared = MateuBeanProvider.getSingletonBeans(CorrelationIdProvider.class);
        if (declared != null && !declared.isEmpty()) {
          provider = declared.iterator().next();
        }
      }
      return provider.correlationId(httpRequest);
    } catch (RuntimeException e) {
      return null;
    }
  }

  // ── audit ─────────────────────────────────────────────────────────────────

  static Collection<ActionAuditListener> listeners() {
    if (!MateuBeanProvider.isInitialized()) {
      return List.of();
    }
    try {
      var found = MateuBeanProvider.getSingletonBeans(ActionAuditListener.class);
      return found != null ? found : List.of();
    } catch (RuntimeException noContainer) {
      return List.of();
    }
  }

  static ActionAuditEvent eventOf(RequestObservation observation, CallerIdentity caller) {
    return new ActionAuditEvent(
        caller,
        observation.route,
        observation.actionId,
        observation.view,
        observation.recordIds(),
        observation.at,
        observation.durationNanos() / 1_000_000,
        observation.outcome,
        observation.correlationId,
        observation.errorReference);
  }

  static void audit(Collection<ActionAuditListener> listeners, ActionAuditEvent event) {
    for (var listener : listeners) {
      try {
        listener.onAction(event);
      } catch (RuntimeException | LinkageError e) {
        // an audit trail that fails must not fail the request it reports on
        if (FAILED_LISTENERS.add(listener.getClass())) {
          log.warn(
              "ActionAuditListener {} failed (logged once; later failures at DEBUG): {}",
              listener.getClass().getName(),
              e.toString(),
              e);
        } else {
          log.debug("ActionAuditListener {} failed: {}", listener.getClass().getName(), e);
        }
      }
    }
  }
}
