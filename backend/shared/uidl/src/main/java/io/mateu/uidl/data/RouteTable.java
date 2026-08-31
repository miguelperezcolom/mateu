package io.mateu.uidl.data;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * A mount's route registry: the whole content of its {@code routes.yaml}.
 *
 * <p>Two producers feed the same table, which is what lets the code-first and the declarative paths
 * coexist instead of competing: the annotation processors emit entries for the
 * {@code @UI}/{@code @Route} classes they index, and an authored {@code routes.yaml} is merged on
 * top. <strong>The authored entry wins</strong> — explicit beats derived, the same rule the layout
 * and page inference already follow.
 */
public record RouteTable(List<RouteEntry> routes) {

  public RouteTable {
    routes = routes == null ? List.of() : List.copyOf(routes);
  }

  public static RouteTable empty() {
    return new RouteTable(List.of());
  }

  /**
   * Merges an authored table over a derived one, entry by entry and keyed by route. Authored
   * entries replace derived ones outright rather than being combined field by field: a
   * half-overridden route would be far harder to reason about than a replaced one.
   */
  public RouteTable mergedOver(RouteTable derived) {
    var byRoute = new java.util.LinkedHashMap<String, RouteEntry>();
    for (var entry : derived.routes()) {
      byRoute.put(entry.route(), entry);
    }
    for (var entry : routes) {
      byRoute.put(entry.route(), entry);
    }
    return new RouteTable(List.copyOf(byRoute.values()));
  }

  /**
   * The entry answering a concrete path, plus the path parameters read off it. Static routes are
   * tried before parameterised ones, so {@code orders/new} is never swallowed by {@code
   * orders/:id}; among parameterised matches the most specific (fewest parameters, then longest)
   * wins, so matching does not depend on declaration order.
   */
  public Optional<Match> match(String path) {
    var normalized = path == null ? "" : path.replaceAll("^/+", "").replaceAll("/+$", "");
    return routes.stream()
        .map(entry -> matchOne(entry, normalized))
        .flatMap(Optional::stream)
        .min(
            java.util.Comparator.comparingInt((Match match) -> match.pathParams().size())
                .thenComparing(match -> -match.entry().route().length()))
        .or(java.util.Optional::empty);
  }

  private static Optional<Match> matchOne(RouteEntry entry, String path) {
    var pattern = entry.route().replaceAll("^/+", "").replaceAll("/+$", "");
    var patternSegments = pattern.isEmpty() ? new String[0] : pattern.split("/");
    var pathSegments = path.isEmpty() ? new String[0] : path.split("/");
    if (patternSegments.length != pathSegments.length) {
      return Optional.empty();
    }
    var params = new java.util.LinkedHashMap<String, Object>();
    for (int i = 0; i < patternSegments.length; i++) {
      var patternSegment = patternSegments[i];
      if (patternSegment.startsWith(":") && patternSegment.length() > 1) {
        params.put(patternSegment.substring(1), pathSegments[i]);
      } else if (!patternSegment.equals(pathSegments[i])) {
        return Optional.empty();
      }
    }
    return Optional.of(new Match(entry, params));
  }

  /** A matched route: the entry that answered, and the path parameters read off the URL. */
  public record Match(RouteEntry entry, Map<String, Object> pathParams) {

    /** The effective parameters, with the entry's fixed ones winning over the path's. */
    public Map<String, Object> params(Map<String, Object> incoming) {
      var fromRequest = new java.util.LinkedHashMap<String, Object>();
      if (incoming != null) {
        fromRequest.putAll(incoming);
      }
      fromRequest.putAll(pathParams);
      return entry.resolveParams(fromRequest);
    }
  }
}
