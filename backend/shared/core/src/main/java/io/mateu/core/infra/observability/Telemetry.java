package io.mateu.core.infra.observability;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * Where a request's spans and metrics go: OpenTelemetry when its API is on the classpath ({@link
 * OtelTelemetry}), nowhere otherwise ({@link #NOOP}). Every OpenTelemetry type is referenced from
 * {@link OtelTelemetry} only, so an application without the API never loads one.
 */
public interface Telemetry {

  /** The span of one request, started; {@link #NOOP_REQUEST} when nothing records it. */
  RequestSpan startRequest(RequestObservation observation, HttpRequest httpRequest);

  /** A child span of the request's, current on this thread until closed. */
  ChildSpan child(HttpRequest httpRequest, String name, Map<String, Object> attributes);

  /** A child span for something that already happened (it took {@code durationMillis}). */
  void recordChild(
      HttpRequest httpRequest,
      String name,
      long durationMillis,
      Map<String, Object> attributes,
      String error);

  interface RequestSpan {
    /** Makes the request's span current on this thread, until the returned scope closes. */
    AutoCloseable makeCurrent();

    /** Ends the span and records the request's metrics. */
    void end(RequestObservation observation);
  }

  interface ChildSpan extends AutoCloseable {
    void attribute(String key, Object value);

    void failed(String description);

    @Override
    void close();
  }

  RequestSpan NOOP_REQUEST =
      new RequestSpan() {
        @Override
        public AutoCloseable makeCurrent() {
          return () -> {};
        }

        @Override
        public void end(RequestObservation observation) {}
      };

  ChildSpan NOOP_CHILD =
      new ChildSpan() {
        @Override
        public void attribute(String key, Object value) {}

        @Override
        public void failed(String description) {}

        @Override
        public void close() {}
      };

  Telemetry NOOP =
      new Telemetry() {
        @Override
        public RequestSpan startRequest(RequestObservation observation, HttpRequest httpRequest) {
          return NOOP_REQUEST;
        }

        @Override
        public ChildSpan child(
            HttpRequest httpRequest, String name, Map<String, Object> attributes) {
          return NOOP_CHILD;
        }

        @Override
        public void recordChild(
            HttpRequest httpRequest,
            String name,
            long durationMillis,
            Map<String, Object> attributes,
            String error) {}
      };
}
