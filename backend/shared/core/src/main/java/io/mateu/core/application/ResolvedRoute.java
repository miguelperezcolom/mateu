package io.mateu.core.application;

import io.mateu.uidl.data.RouteEntry;

/**
 * A route resolved to the class that answers it.
 *
 * @param entry the registry entry that answered, or {@code null} when the route was resolved from
 *     annotations. Carried whole rather than as a pre-resolved parameter map because the two kinds
 *     of parameter it declares sit at OPPOSITE ends of the precedence order — defaults are the
 *     weakest source and fixed ones outrank even the state the client sends back — and a single
 *     merged map could no longer tell them apart. It also carries the entry's definition, which the
 *     layout lookup needs.
 */
public record ResolvedRoute(
    String route, String pattern, Class<?> resolvedClass, RouteEntry entry) {

  /**
   * The annotation-resolved case: no registry entry. Kept so the eight call sites in {@code
   * RouteAnnotationMatcher} stay as they were — this record is internal to route resolution and is
   * never reflected as a UI model, so a second constructor is harmless here.
   */
  public ResolvedRoute(String route, String pattern, Class<?> resolvedClass) {
    this(route, pattern, resolvedClass, null);
  }
}
