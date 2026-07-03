package io.mateu.uidl.interfaces;

import io.mateu.uidl.RouteConstants;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Matches an incoming request route against a set of compiled route patterns and resolves it to the
 * class to render. Implement {@link #supportedRoutesPatterns()} to declare the {@link
 * CompiledRouteValue} patterns this resolver handles and {@link #resolveRoute(String, String,
 * HttpRequest)} to produce the target class; the default {@link #matchingPattern}, {@link
 * #supportsRoute} and {@link #weight} methods select the best-matching (longest) pattern honouring
 * the parent (already-consumed) route.
 */
public interface RouteResolver {

  default boolean supportsRoute(String route, String consumedRoute) {
    return matchingPattern(route, consumedRoute).isPresent();
  }

  default Optional<CompiledRouteValue> matchingPattern(String route, String consumedRoute) {
    // System.out.println("" + getClass().getSimpleName() + "-> route: " + route + ", consumedRoute:
    // " + consumedRoute);
    for (CompiledRouteValue pattern :
        supportedRoutesPatterns().stream()
            .sorted(Comparator.comparingInt(pattern -> pattern.routeRegex().pattern().length()))
            .toList()) {
      if (pattern.routeRegex().matcher(route).matches()
          && ((RouteConstants.NO_PARENT_ROUTE.equals(consumedRoute)
                  && pattern.parentRoute().equals(RouteConstants.NO_PARENT_ROUTE))
              || (!RouteConstants.NO_PARENT_ROUTE.equals(consumedRoute)
                  && (pattern.parentRouteRegex().matcher(consumedRoute).matches())))) {
        // System.out.println("" + getClass().getSimpleName() + "-> route: " + route + ",
        // consumedRoute: " + consumedRoute + " MATCHED");
        return Optional.of(pattern);
      }
    }
    // System.out.println("" + getClass().getSimpleName() + "-> route: " + route + ", consumedRoute:
    // " + consumedRoute + " FAILED");
    return Optional.empty();
  }

  default int weight(String route, String consumedRoute) {
    if (route != null) {
      var matchingPattern = matchingPattern(route, consumedRoute);
      if (matchingPattern.isPresent()) {
        return matchingPattern.get().routeRegex().pattern().length();
      }
    }
    return Integer.MAX_VALUE;
  }

  Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest);

  List<CompiledRouteValue> supportedRoutesPatterns();
}
