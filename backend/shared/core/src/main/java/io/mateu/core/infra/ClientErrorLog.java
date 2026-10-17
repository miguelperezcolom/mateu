package io.mateu.core.infra;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The errors a renderer hit or showed, written to the server log — the single source for every
 * adapter that exposes {@code POST <baseUrl>/mateu/v3/client-log}.
 *
 * <p>Why: a message the user saw ("Your session is no longer valid", "The server could not complete
 * the request") used to leave no trace on the server when the request never reached the app (a
 * gateway rejecting it, the network dropping it) or when the failure was the browser's own. The
 * renderers now report each such error here, and each report becomes ONE log line on the logger
 * {@value #LOGGER_NAME}, at WARN, shaped {@code client-error {"kind":"unauthorized",...}} so a log
 * pipeline (Loki: {@code |= "client-error"}) can find and parse it.
 *
 * <p>The body is one report object or an array of them (a batch). Only known fields are kept,
 * strings are truncated, and the whole body is refused above {@value #MAX_BODY_BYTES} bytes. It
 * never fails towards the client with more than a 400: a broken report is the client's problem, not
 * a reason for a 500 that the reporter would then try to report.
 *
 * <p>On unless {@code mateu.client-log.enabled=false}; when off, the endpoint answers 404, which
 * the renderers read as "stop reporting for this page".
 */
public final class ClientErrorLog {

  /** Property that turns the endpoint off (it is on unless set to false). */
  public static final String ENABLED_PROPERTY = "mateu.client-log.enabled";

  /** Every UI's base URL followed by this is the endpoint. */
  public static final String PATH_SUFFIX = "/mateu/v3/client-log";

  /** Bodies above this are refused with 413. */
  public static final int MAX_BODY_BYTES = 16 * 1024;

  /** Reports beyond this many in one batch are dropped. */
  public static final int MAX_REPORTS_PER_BODY = 25;

  /** The dedicated logger, so it can be routed or silenced on its own. */
  public static final String LOGGER_NAME = "mateu.client";

  /** What every line starts with. */
  public static final String PREFIX = "client-error ";

  public static final int NO_CONTENT = 204;
  public static final int BAD_REQUEST = 400;
  public static final int NOT_FOUND = 404;
  public static final int PAYLOAD_TOO_LARGE = 413;
  public static final int TOO_MANY_REQUESTS = 429;

  /**
   * The setting capping how many reports one client (the authenticated user, else the client
   * address) may write per minute; beyond it the reports are dropped and the endpoint answers 429.
   */
  public static final String MAX_REPORTS_PER_MINUTE_PROPERTY =
      "mateu.client-log.max-reports-per-minute";

  /** The default cap: a page in trouble reports a handful of errors, not hundreds a minute. */
  public static final int DEFAULT_MAX_REPORTS_PER_MINUTE = 60;

  /** Clients tracked at once; beyond it the window starts over (the map stays bounded). */
  static final int MAX_TRACKED_CLIENTS = 10_000;

  /** The fixed one-minute windows: client key → reports written in the current one. */
  private static final java.util.concurrent.ConcurrentHashMap<String, int[]> WINDOW =
      new java.util.concurrent.ConcurrentHashMap<>();

  private static volatile long windowStartedAt = 0;

  /** The clock the windows run on (a test moves it). */
  static java.util.function.LongSupplier clock = System::currentTimeMillis;

  private static final Logger log = LoggerFactory.getLogger(LOGGER_NAME);
  private static final ObjectMapper mapper = new ObjectMapper();

  /** The string fields kept, with the length each is cut to. Order = order in the line. */
  private static final Map<String, Integer> STRING_FIELDS = new LinkedHashMap<>();

  /** The numeric fields kept. */
  private static final List<String> NUMBER_FIELDS = List.of("status", "count", "dropped");

  static {
    STRING_FIELDS.put("level", 10);
    STRING_FIELDS.put("kind", 40);
    STRING_FIELDS.put("renderer", 20);
    STRING_FIELDS.put("message", 1000);
    STRING_FIELDS.put("detail", 1000);
    STRING_FIELDS.put("url", 1000);
    STRING_FIELDS.put("route", 500);
    STRING_FIELDS.put("actionId", 200);
    STRING_FIELDS.put("pageUrl", 1000);
    STRING_FIELDS.put("source", 500);
    STRING_FIELDS.put("traceparent", 100);
    STRING_FIELDS.put("firstAt", 40);
    STRING_FIELDS.put("lastAt", 40);
    STRING_FIELDS.put("userAgent", 300);
    STRING_FIELDS.put("stack", 4000);
  }

  private ClientErrorLog() {}

  /** Whether {@code path} (the request URI, without query) is a client-log endpoint. */
  public static boolean isEndpoint(String path) {
    return path != null && path.endsWith(PATH_SUFFIX);
  }

  /** Whether a declared Content-Length already exceeds the limit (-1 = unknown). */
  public static boolean tooLarge(long contentLength) {
    return contentLength > MAX_BODY_BYTES;
  }

  /**
   * Logs the reports in {@code body} and answers the status to send back. {@code body} is what was
   * read, at most {@link #MAX_BODY_BYTES} + 1 bytes (one more marks it as too large); {@code user}
   * is the authenticated principal's name, or null.
   */
  public static int handle(byte[] body, String user) {
    return handle(body, user, null);
  }

  /**
   * As {@link #handle(byte[], String)}, rate-limited per client: {@code client} is the request's
   * remote address (used when there is no authenticated {@code user}). The endpoint is open to
   * anonymous callers — it has to be, a session that expired is one of the things it reports — so
   * without a cap anyone could fill the server log at will; over {@value
   * #DEFAULT_MAX_REPORTS_PER_MINUTE} reports a minute ({@value #MAX_REPORTS_PER_MINUTE_PROPERTY})
   * the rest are dropped with 429.
   */
  public static int handle(byte[] body, String user, String client) {
    if (body == null || body.length == 0) {
      return BAD_REQUEST;
    }
    if (body.length > MAX_BODY_BYTES) {
      return PAYLOAD_TOO_LARGE;
    }
    List<String> lines;
    try {
      lines = lines(new String(body, StandardCharsets.UTF_8), user);
    } catch (Exception e) {
      return BAD_REQUEST;
    }
    if (lines == null) {
      return BAD_REQUEST;
    }
    int allowed = admit(clientKey(user, client), lines.size());
    lines.stream().limit(allowed).forEach(log::warn);
    return allowed < lines.size() ? TOO_MANY_REQUESTS : NO_CONTENT;
  }

  private static String clientKey(String user, String client) {
    if (user != null && !user.isBlank()) {
      return "user:" + user;
    }
    return client != null && !client.isBlank() ? "addr:" + client : "anonymous";
  }

  /** How many of {@code wanted} reports {@code key} may still write in the current minute. */
  static int admit(String key, int wanted) {
    long now = clock.getAsLong();
    if (now - windowStartedAt >= 60_000 || WINDOW.size() > MAX_TRACKED_CLIENTS) {
      synchronized (WINDOW) {
        if (now - windowStartedAt >= 60_000 || WINDOW.size() > MAX_TRACKED_CLIENTS) {
          WINDOW.clear();
          windowStartedAt = now;
        }
      }
    }
    int cap = maxReportsPerMinute();
    var used = WINDOW.computeIfAbsent(key, k -> new int[1]);
    synchronized (used) {
      int granted = Math.max(0, Math.min(wanted, cap - used[0]));
      used[0] += granted;
      return granted;
    }
  }

  static int maxReportsPerMinute() {
    var configured = MateuSettings.get(MAX_REPORTS_PER_MINUTE_PROPERTY);
    if (configured != null) {
      try {
        return Math.max(0, Integer.parseInt(configured));
      } catch (NumberFormatException ignored) {
        // the default below
      }
    }
    return DEFAULT_MAX_REPORTS_PER_MINUTE;
  }

  /** Forgets every window (tests). */
  static void resetRateLimit() {
    WINDOW.clear();
    windowStartedAt = 0;
  }

  /** The log lines for a body, or null when it is not a report or a batch of them. */
  static List<String> lines(String body, String user) throws JsonProcessingException {
    JsonNode root = mapper.readTree(body);
    List<JsonNode> reports = new ArrayList<>();
    if (root == null) {
      return null;
    }
    if (root.isObject()) {
      reports.add(root);
    } else if (root.isArray()) {
      for (JsonNode node : root) {
        if (node.isObject() && reports.size() < MAX_REPORTS_PER_BODY) {
          reports.add(node);
        }
      }
    } else {
      return null;
    }
    List<String> lines = new ArrayList<>();
    for (JsonNode report : reports) {
      lines.add(PREFIX + mapper.writeValueAsString(fieldsOf(report, user)));
    }
    return lines;
  }

  private static Map<String, Object> fieldsOf(JsonNode report, String user) {
    Map<String, Object> out = new LinkedHashMap<>();
    // always first, so every line starts the same way: client-error {"level":...
    out.put("level", "error");
    STRING_FIELDS.forEach(
        (name, max) -> {
          JsonNode value = report.get(name);
          if (value != null && !value.isNull() && !value.isContainerNode()) {
            String text = value.asText();
            if (!text.isEmpty()) {
              out.put(name, truncate(text, max));
            }
          }
        });
    for (String name : NUMBER_FIELDS) {
      JsonNode value = report.get(name);
      if (value != null && value.canConvertToLong()) {
        out.put(name, value.asLong());
      }
    }
    if (user != null && !user.isBlank()) {
      out.put("user", truncate(user, 200));
    }
    return out;
  }

  private static String truncate(String text, int max) {
    return text.length() <= max ? text : text.substring(0, max) + "…";
  }
}
