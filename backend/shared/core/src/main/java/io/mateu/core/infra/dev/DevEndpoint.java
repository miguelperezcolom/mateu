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
 *             changes when the server restarts (also a restart inside the JVM, {@link #enable}),
 *             which is how a client tells "the backend restarted, re-render" (its {@code
 *             server-restarted} case) from a dropped connection;
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

  /**
   * The boot id of this JVM's FIRST application start. A restart inside the same JVM (Quarkus dev
   * mode, Spring Boot devtools) gets a new one: read the current one with {@link #bootId()}.
   */
  public static final String BOOT_ID = UUID.randomUUID().toString();

  /**
   * Identifies the current application start: a client seeing it change knows the server restarted.
   * Mateu's jars are not reloaded by Quarkus dev mode or Spring Boot devtools — only the
   * application's classes are — so a constant was the same before and after their restarts, and the
   * browser never noticed one.
   */
  private static volatile String bootId = BOOT_ID;

  private static final java.util.concurrent.atomic.AtomicInteger STARTS =
      new java.util.concurrent.atomic.AtomicInteger();

  private static final java.util.concurrent.atomic.AtomicInteger CONNECTIONS =
      new java.util.concurrent.atomic.AtomicInteger();

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
    // hello LAST in the merge, so the stream is already listening to changes when the client reads
    // it: concat(hello, changes) subscribed to the changes only after the hello was written, and a
    // reload asked for right after it (what a client does as soon as it is connected) was lost
    return Flux.merge(changes, pings, Flux.defer(() -> Flux.just(hello())))
        .takeUntilOther(until)
        .doOnSubscribe(subscription -> CONNECTIONS.incrementAndGet())
        .doFinally(signal -> CONNECTIONS.decrementAndGet());
  }

  /**
   * How many event streams are open right now — a browser with live reload on is waiting. An
   * adapter whose framework only looks for code changes when a request arrives (Quarkus dev mode)
   * uses it to look for them on its own while somebody is watching.
   */
  public static int connections() {
    return CONNECTIONS.get();
  }

  /** The current application start's boot id (see {@link #BOOT_ID}). */
  public static String bootId() {
    return bootId;
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
    // the adapters call this once per application start: a second call in the same JVM is a
    // restart (Quarkus dev mode, Spring Boot devtools), and the browsers must see a new boot id
    if (STARTS.getAndIncrement() > 0) {
      bootId = UUID.randomUUID().toString();
    }
    DevMode.enable(specsDirs);
  }

  static String hello() {
    return "{\"type\":\"hello\",\"bootId\":\"" + bootId + "\"}";
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
