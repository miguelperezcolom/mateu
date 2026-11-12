package io.mateu.core.infra.observability;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * {@link Telemetry} on the OpenTelemetry API — API only: the application (its SDK, Spring Boot's or
 * Quarkus' OpenTelemetry support) or the OpenTelemetry Java agent provides the implementation and
 * the exporters. Without either, the API is a no-op and so is this.
 *
 * <p>The {@link OpenTelemetry} used is the container's bean when there is one (Spring Boot and
 * Quarkus declare it), else {@link GlobalOpenTelemetry} (what the Java agent and the SDK's
 * autoconfiguration install) — looked up the first time a request needs it, then remembered.
 */
final class OtelTelemetry implements Telemetry {

  static final String SCOPE = "io.mateu";

  static final AttributeKey<String> ROUTE = AttributeKey.stringKey("mateu.route");
  static final AttributeKey<String> ROUTE_TEMPLATE = AttributeKey.stringKey("mateu.route.template");
  static final AttributeKey<String> ACTION = AttributeKey.stringKey("mateu.action");
  static final AttributeKey<String> VIEW = AttributeKey.stringKey("mateu.view");
  static final AttributeKey<String> OUTCOME = AttributeKey.stringKey("mateu.outcome");
  static final AttributeKey<String> CORRELATION_ID = AttributeKey.stringKey("mateu.correlation_id");
  static final AttributeKey<String> ERROR_REFERENCE =
      AttributeKey.stringKey("mateu.error.reference");
  static final AttributeKey<Long> RECORD_COUNT = AttributeKey.longKey("mateu.record.count");
  static final AttributeKey<String> ERROR_TYPE = AttributeKey.stringKey("error.type");

  private static volatile OpenTelemetry global;
  private static volatile OtelTelemetry last;

  private final OpenTelemetry openTelemetry;
  private final Tracer tracer;
  private final DoubleHistogram duration;
  private final LongCounter errors;

  private OtelTelemetry(OpenTelemetry openTelemetry) {
    this.openTelemetry = openTelemetry;
    this.tracer = openTelemetry.getTracer(SCOPE);
    var meter = openTelemetry.getMeter(SCOPE);
    this.duration =
        meter
            .histogramBuilder("mateu.request.duration")
            .setUnit("s")
            .setDescription("Duration of Mateu requests (sync and sse), until their last answer")
            .build();
    this.errors =
        meter
            .counterBuilder("mateu.request.errors")
            .setDescription("Mateu requests that ended in an unexpected error")
            .build();
  }

  /** The telemetry for the OpenTelemetry in use now. */
  static Telemetry current() {
    var otel = openTelemetry();
    var known = last;
    if (known != null && known.openTelemetry == otel) {
      return known;
    }
    known = new OtelTelemetry(otel);
    last = known;
    return known;
  }

  private static OpenTelemetry openTelemetry() {
    try {
      if (MateuBeanProvider.isInitialized()) {
        // remembered per bean provider, an empty answer included: no lookup per request
        var beans = MateuBeanProvider.getSingletonBeans(OpenTelemetry.class);
        if (beans != null && !beans.isEmpty()) {
          return beans.iterator().next();
        }
      }
    } catch (RuntimeException noContainer) {
      // no container to ask: the global one
    }
    var known = global;
    if (known == null) {
      known = GlobalOpenTelemetry.get();
      global = known;
    }
    return known;
  }

  /** For tests: forget the remembered global and instruments. */
  static void reset() {
    global = null;
    last = null;
  }

  private static final TextMapGetter<HttpRequest> HEADERS =
      new TextMapGetter<>() {
        @Override
        public Iterable<String> keys(HttpRequest carrier) {
          return List.of();
        }

        @Override
        public String get(HttpRequest carrier, String key) {
          if (carrier == null) {
            return null;
          }
          try {
            return carrier.getHeaderValue(key);
          } catch (RuntimeException e) {
            return null;
          }
        }
      };

  @Override
  public RequestSpan startRequest(RequestObservation observation, HttpRequest httpRequest) {
    var parent = Context.current();
    var serverSpanExists = Span.fromContext(parent).getSpanContext().isValid();
    if (!serverSpanExists) {
      // no HTTP server instrumentation: continue the caller's trace from its traceparent
      parent =
          openTelemetry
              .getPropagators()
              .getTextMapPropagator()
              .extract(Context.root(), httpRequest, HEADERS);
    }
    var template = TelemetryNames.routeTemplate(observation.route);
    var action = TelemetryNames.action(observation.actionId);
    var span =
        tracer
            .spanBuilder("mateu " + spanAction(action) + " " + template)
            .setParent(parent)
            .setSpanKind(serverSpanExists ? SpanKind.INTERNAL : SpanKind.SERVER)
            .setAttribute(ROUTE, observation.route == null ? "" : observation.route)
            .setAttribute(ROUTE_TEMPLATE, template)
            .setAttribute(ACTION, action)
            .startSpan();
    if (observation.correlationId != null) {
      span.setAttribute(CORRELATION_ID, observation.correlationId);
    }
    var context = parent.with(span);
    observation.telemetryContext = context;
    return new RequestSpan() {
      @Override
      public AutoCloseable makeCurrent() {
        var scope = context.makeCurrent();
        return scope::close;
      }

      @Override
      public void end(RequestObservation ended) {
        var outcome = ended.outcome;
        if (ended.view != null) {
          span.setAttribute(VIEW, ended.view);
        }
        span.setAttribute(OUTCOME, outcome.attributeValue());
        var records = ended.recordIds().size();
        if (records > 0) {
          span.setAttribute(RECORD_COUNT, (long) records);
        }
        if (ended.errorType != null) {
          span.setAttribute(ERROR_TYPE, ended.errorType);
        }
        if (ended.errorReference != null) {
          span.setAttribute(ERROR_REFERENCE, ended.errorReference);
        }
        if (outcome == io.mateu.uidl.audit.ActionOutcome.ERROR) {
          span.setStatus(StatusCode.ERROR);
        }
        span.end();
        var key = TelemetryNames.metricKey(ended.route, ended.actionId, outcome);
        AttributesBuilder metric =
            Attributes.builder()
                .put(ROUTE_TEMPLATE, key[0])
                .put(ACTION, key[1])
                .put(OUTCOME, outcome.attributeValue());
        duration.record(ended.durationNanos() / 1_000_000_000d, metric.build(), context);
        if (outcome == io.mateu.uidl.audit.ActionOutcome.ERROR) {
          errors.add(
              1,
              Attributes.builder()
                  .put(ROUTE_TEMPLATE, key[0])
                  .put(ACTION, key[1])
                  .put(ERROR_TYPE, ended.errorType != null ? ended.errorType : "_unknown")
                  .build(),
              context);
        }
      }
    };
  }

  /** A span name takes no client-written text beyond a bounded action id. */
  private static String spanAction(String action) {
    return action.length() > 64 ? TelemetryNames.OTHER : action;
  }

  private static Context parentOf(HttpRequest httpRequest) {
    var observation = RequestObservation.of(httpRequest);
    if (observation != null && observation.telemetryContext instanceof Context context) {
      return context;
    }
    return Context.current();
  }

  @Override
  public ChildSpan child(HttpRequest httpRequest, String name, Map<String, Object> attributes) {
    var span =
        tracer
            .spanBuilder(name)
            .setParent(parentOf(httpRequest))
            .setSpanKind(SpanKind.CLIENT)
            .setAllAttributes(attributesOf(attributes))
            .startSpan();
    // current on this thread: an instrumented HTTP client (the Java agent's) nests its span here
    var scope = span.makeCurrent();
    return new ChildSpan() {
      @Override
      public void attribute(String key, Object value) {
        put(span, key, value);
      }

      @Override
      public void failed(String description) {
        span.setStatus(StatusCode.ERROR, description == null ? "" : description);
      }

      @Override
      public void close() {
        scope.close();
        span.end();
      }
    };
  }

  @Override
  public void recordChild(
      HttpRequest httpRequest,
      String name,
      long durationMillis,
      Map<String, Object> attributes,
      String error) {
    var end = Instant.now();
    var span =
        tracer
            .spanBuilder(name)
            .setParent(parentOf(httpRequest))
            .setSpanKind(SpanKind.CLIENT)
            .setStartTimestamp(
                end.minusMillis(Math.max(0, durationMillis)).toEpochMilli(), TimeUnit.MILLISECONDS)
            .setAllAttributes(attributesOf(attributes))
            .startSpan();
    if (error != null) {
      span.setStatus(StatusCode.ERROR, error);
    }
    span.end(end.toEpochMilli(), TimeUnit.MILLISECONDS);
  }

  private static Attributes attributesOf(Map<String, Object> attributes) {
    var builder = Attributes.builder();
    if (attributes != null) {
      attributes.forEach(
          (key, value) -> {
            if (key == null || value == null) {
              return;
            }
            if (value instanceof Long || value instanceof Integer) {
              builder.put(AttributeKey.longKey(key), ((Number) value).longValue());
            } else if (value instanceof Boolean flag) {
              builder.put(AttributeKey.booleanKey(key), flag);
            } else {
              builder.put(AttributeKey.stringKey(key), String.valueOf(value));
            }
          });
    }
    return builder.build();
  }

  private static void put(Span span, String key, Object value) {
    if (key == null || value == null) {
      return;
    }
    if (value instanceof Long || value instanceof Integer) {
      span.setAttribute(key, ((Number) value).longValue());
    } else if (value instanceof Boolean flag) {
      span.setAttribute(key, flag);
    } else {
      span.setAttribute(key, String.valueOf(value));
    }
  }
}
