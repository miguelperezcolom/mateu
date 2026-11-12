package io.mateu.core.infra;

import java.util.Locale;
import java.util.Map;

/**
 * The headers every Mateu server-sent-event stream carries, on every adapter and port, so a proxy
 * in front of the app passes each event on as it is written instead of holding the stream:
 *
 * <ul>
 *   <li>{@code X-Accel-Buffering: no} — nginx (and the proxies that copy its convention) turns
 *       response buffering off for this response; its default buffering is what delivered a {@code
 *       LongTask}'s progress all at once, at the end;
 *   <li>{@code Cache-Control: no-cache, no-transform} — nothing caches the stream, and nothing on
 *       the way compresses or rewrites it (a compressing proxy buffers to fill its blocks).
 * </ul>
 *
 * <p>A proxy's read timeout still applies: a task that sends nothing for longer than it ends the
 * stream.
 */
public final class SseHeaders {

  public static final String X_ACCEL_BUFFERING = "X-Accel-Buffering";
  public static final String CACHE_CONTROL = "Cache-Control";
  public static final String NO_BUFFERING = "no";
  public static final String NO_CACHE_NO_TRANSFORM = "no-cache, no-transform";

  /** The headers, in the order they are written. */
  public static final Map<String, String> HEADERS =
      Map.of(X_ACCEL_BUFFERING, NO_BUFFERING, CACHE_CONTROL, NO_CACHE_NO_TRANSFORM);

  private SseHeaders() {}

  /**
   * Whether {@code path} is one of Mateu's event streams: a streamed action ({@code
   * <baseUrl>/mateu/v3/sse/…}) or the development live-reload stream.
   */
  public static boolean isStream(String path) {
    if (path == null) {
      return false;
    }
    var clean =
        io.mateu.core.infra.security.JsonBodyGuard.canonicalPath(path).toLowerCase(Locale.ROOT);
    return clean.contains("/mateu/v3/sse/")
        || clean.endsWith("/mateu/v3/sse")
        || clean.endsWith(io.mateu.core.infra.dev.DevEndpoint.EVENTS_PATH);
  }
}
