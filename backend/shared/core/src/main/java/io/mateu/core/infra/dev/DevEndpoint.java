package io.mateu.core.infra.dev;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * The HTTP side of live reload, framework neutral so every adapter serves it the same way (like the
 * MCP endpoint). Both paths exist ONLY in development mode ({@link DevMode}).
 *
 * <ul>
 *   <li>{@code GET} {@value #EVENTS_PATH} — {@code text/event-stream}; each event's {@code data:}
 *       is one JSON object:
 *       <ul>
 *         <li>{@code {"type":"hello","bootId":"…"}} first, on every (re)connection. The boot id
 *             changes when the server restarts, which is how a client tells "the backend restarted,
 *             re-render" (its {@code server-restarted} case) from a dropped connection;
 *         <li>{@code {"type":"specs-changed","files":[…],"scope":"page"|"app"}} when spec files
 *             changed;
 *         <li>{@code {"type":"reload","scope":"page"|"app"}} when someone asked for a re-render
 *             (the IDE, after a HotSwap);
 *         <li>{@code {"type":"ping"}} every {@value #PING_SECONDS} s, to keep proxies from closing
 *             an idle stream.
 *       </ul>
 *   <li>{@code POST} {@value #RELOAD_PATH}{@code [?scope=app]} — fires a {@code reload} event;
 *       answers 204.
 * </ul>
 */
public final class DevEndpoint {

  /** The event stream. */
  public static final String EVENTS_PATH = "/mateu/dev/events";

  /** The re-render trigger. */
  public static final String RELOAD_PATH = "/mateu/dev/reload";

  /** The property gating both (same as {@link DevMode#PROPERTY}). */
  public static final String ENABLED_PROPERTY = DevMode.PROPERTY;

  /** The specs-dir property (same as {@link DevMode#SPECS_DIR_PROPERTY}). */
  public static final String SPECS_DIR_PROPERTY = DevMode.SPECS_DIR_PROPERTY;

  /** HTTP 204, the answer to a reload. */
  public static final int NO_CONTENT = 204;

  static final int PING_SECONDS = 15;

  /** Identifies this JVM's run: a client seeing it change knows the server restarted. */
  public static final String BOOT_ID = UUID.randomUUID().toString();

  private static final ObjectMapper JSON = new ObjectMapper();

  /**
   * Fires when the JVM is going down. Every open stream completes on it: a graceful shutdown waits
   * for active requests, and an endless event stream is one — the old process held the browser's
   * stream for the whole grace period (30 s on Spring Boot), so the page neither noticed the
   * backend leave nor re-rendered against the restarted one until it ran out.
   */
  private static final Sinks.Empty<Void> SHUTTING_DOWN = Sinks.empty();

  static {
    try {
      Runtime.getRuntime()
          .addShutdownHook(new Thread(DevEndpoint::shutdown, "mateu-dev-events-shutdown"));
    } catch (IllegalStateException | SecurityException ignored) {
      // already shutting down, or not allowed: the streams end with the process
    }
  }

  private DevEndpoint() {}

  /** Completes every open event stream (the JVM shutdown hook calls it). */
  public static void shutdown() {
    SHUTTING_DOWN.tryEmitEmpty();
  }

  /**
   * The event payloads (JSON, one per SSE event) for one connection: hello, then every change, with
   * a ping every {@value #PING_SECONDS} s. Completes only when the server shuts down ({@link
   * #shutdown}) — the adapter must then end the response; it disposes it when the client goes away.
   */
  public static Flux<String> events() {
    return events(Duration.ofSeconds(PING_SECONDS));
  }

  static Flux<String> events(Duration pingEvery) {
    return events(pingEvery, SHUTTING_DOWN.asMono());
  }

  static Flux<String> events(Duration pingEvery, org.reactivestreams.Publisher<?> until) {
    var changes = DevSpecs.events().map(DevEndpoint::json);
    var pings = Flux.interval(pingEvery).map(i -> "{\"type\":\"ping\"}");
    return Flux.concat(Flux.just(hello()), Flux.merge(changes, pings)).takeUntilOther(until);
  }

  /** The SSE frame for one payload. */
  public static String sse(String json) {
    return "data: " + json + "\n\n";
  }

  /** Handles {@code POST /mateu/dev/reload}; {@code scope} may be null. */
  public static int reload(String scope) {
    DevSpecs.reload(scope);
    return NO_CONTENT;
  }

  /**
   * Called by each adapter when its configuration has {@value #ENABLED_PROPERTY}{@code =true}
   * (before serving the endpoints).
   */
  public static void enable(String specsDirs) {
    DevMode.enable(specsDirs);
  }

  static String hello() {
    return "{\"type\":\"hello\",\"bootId\":\"" + BOOT_ID + "\"}";
  }

  static String json(DevSpecs.DevEvent event) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("type", event.type());
    if (!event.files().isEmpty() || "specs-changed".equals(event.type())) {
      map.put("files", event.files());
    }
    map.put("scope", event.scope());
    try {
      return JSON.writeValueAsString(map);
    } catch (Exception e) {
      return "{\"type\":\"" + event.type() + "\",\"scope\":\"" + event.scope() + "\"}";
    }
  }
}
