package io.mateu.uidl;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.HeaderValue;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

/**
 * Pushes a new value of a header value ({@link HeaderValue}) to EVERY open session of the app — the
 * nightly close moving the business date, say. Apps opt in with {@code @App(liveUpdates = true)}:
 * each browser then keeps one event stream open (one per browser, not per tab — the tabs share it)
 * and repaints the header when a value is published here.
 *
 * <p>In-process: a publish reaches the sessions connected to THIS server. In a cluster, publish on
 * every node (e.g. from the message listener that learns about the change). The last value of each
 * id is kept, so a session that connects later — or reconnects — catches up.
 *
 * <pre>{@code
 * LiveHeaderValues.publish("businessDate", "13 Oct 2026");
 * }</pre>
 */
@Experimental("live header values (3.0-alpha, E2 patterns)")
public final class LiveHeaderValues {

  private static final Map<String, String> CURRENT = new ConcurrentHashMap<>();
  private static final List<Consumer<HeaderValue>> LISTENERS = new CopyOnWriteArrayList<>();

  private LiveHeaderValues() {}

  /** Publishes {@code value} for the header value {@code id} to every connected session. */
  public static void publish(String id, String value) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("a header value needs an id");
    }
    CURRENT.put(id, value != null ? value : "");
    var change = new HeaderValue(id, null, value != null ? value : "");
    for (var listener : LISTENERS) {
      try {
        listener.accept(change);
      } catch (RuntimeException ignored) {
        // one broken stream must not stop the others
      }
    }
  }

  /** The last value published for each id (what a session connecting now is sent first). */
  public static Map<String, String> current() {
    return Map.copyOf(CURRENT);
  }

  /**
   * Listens to every publish until the returned handle is closed. Used by the framework's event
   * stream; an app does not normally need it.
   */
  @io.mateu.uidl.annotations.Internal("the framework's live-updates event stream")
  public static AutoCloseable subscribe(Consumer<HeaderValue> listener) {
    LISTENERS.add(listener);
    return () -> LISTENERS.remove(listener);
  }

  /**
   * Forgets every published value. A <em>test</em> hook — it isolates the framework's own tests,
   * which share this process-wide state — and not API: an app that calls it wipes the values every
   * other session is catching up from. Outside the stability promise; it may move or disappear.
   */
  @io.mateu.uidl.annotations.Internal("test hook")
  public static void reset() {
    CURRENT.clear();
  }
}
