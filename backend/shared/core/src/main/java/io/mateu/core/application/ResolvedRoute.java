package io.mateu.core.application;

import java.util.Map;

/**
 * A route resolved to the class that answers it.
 *
 * @param params the parameters the route carries — path parameters read off the URL, plus whatever
 *     the registry entry seeds or pins (see {@code RouteEntry}). Empty for routes resolved from
 *     annotations, which carry none.
 */
public record ResolvedRoute(
    String route, String pattern, Class<?> resolvedClass, Map<String, Object> params) {

  public ResolvedRoute {
    params = params == null ? Map.of() : Map.copyOf(params);
  }

  /**
   * The annotation-resolved case: no parameters. Kept so the eight call sites in {@code
   * RouteAnnotationMatcher} stay as they were — this record is internal to route resolution and is
   * never reflected as a UI model, so a second constructor is harmless here.
   */
  public ResolvedRoute(String route, String pattern, Class<?> resolvedClass) {
    this(route, pattern, resolvedClass, Map.of());
  }
}
