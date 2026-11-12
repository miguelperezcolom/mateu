package io.mateu.core.infra.observability;

import io.mateu.uidl.audit.ActionOutcome;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * The LOW-CARDINALITY names a request is measured under. A metric attribute is a time series per
 * distinct value, so it never takes an id, a parameter value or whatever a client chose to write:
 *
 * <ul>
 *   <li>a route becomes its template — every segment that looks like an id (digits, a UUID, a long
 *       token with digits) is {@code :id}: {@code /products/42/edit} → {@code /products/:id/edit};
 *   <li>a load (empty action id) is {@code __load__};
 *   <li>a refused or not-found request is measured as {@value #OTHER} / {@value #OTHER}: its route
 *       and action are whatever the caller sent, and they must not mint series;
 *   <li>at most {@value #MAX_SERIES} distinct (route, action) pairs per process; after that, new
 *       ones are {@value #OTHER} too — a safety valve, never reached by an ordinary app.
 * </ul>
 *
 * Spans carry the concrete route as well: a span is one event, not a series.
 */
public final class TelemetryNames {

  public static final String OTHER = "_other";
  public static final String LOAD = "__load__";
  static final int MAX_SERIES = 1000;

  private static final Pattern NUMERIC = Pattern.compile("-?\\d+");
  private static final Pattern UUID =
      Pattern.compile(
          "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
  private static final Pattern HEX = Pattern.compile("[0-9a-fA-F]{12,}");
  private static final Pattern DIGIT = Pattern.compile(".*\\d.*");

  private static final Set<String> SERIES = ConcurrentHashMap.newKeySet();

  private TelemetryNames() {}

  /** The route's template: id-like segments replaced by {@code :id}, no query, no trailing '/'. */
  public static String routeTemplate(String route) {
    if (route == null || route.isBlank() || "_empty".equals(route)) {
      return "/";
    }
    var path = route;
    var query = path.indexOf('?');
    if (query >= 0) {
      path = path.substring(0, query);
    }
    var template = new StringBuilder();
    for (var segment : path.split("/")) {
      if (segment.isEmpty()) {
        continue;
      }
      template.append('/').append(idLike(segment) ? ":id" : segment);
    }
    return template.isEmpty() ? "/" : template.toString();
  }

  static boolean idLike(String segment) {
    return NUMERIC.matcher(segment).matches()
        || UUID.matcher(segment).matches()
        || HEX.matcher(segment).matches()
        || (segment.length() >= 8 && DIGIT.matcher(segment).matches())
        || segment.length() > 64;
  }

  /** The action as measured: {@value #LOAD} for a load. */
  public static String action(String actionId) {
    return actionId == null || actionId.isEmpty() ? LOAD : actionId;
  }

  /** The (route template, action) a request is measured under, bounded as the class says. */
  static String[] metricKey(String route, String actionId, ActionOutcome outcome) {
    if (outcome == ActionOutcome.FORBIDDEN || outcome == ActionOutcome.NOT_FOUND) {
      return new String[] {OTHER, OTHER};
    }
    var template = routeTemplate(route);
    var action = action(actionId);
    if (action.length() > 128) {
      action = OTHER;
    }
    var key = template + " " + action;
    if (!SERIES.contains(key)) {
      if (SERIES.size() >= MAX_SERIES) {
        return new String[] {OTHER, OTHER};
      }
      SERIES.add(key);
    }
    return new String[] {template, action};
  }

  /** For tests: forget the series seen so far. */
  static void reset() {
    SERIES.clear();
  }
}
