package io.mateu.uidl.interfaces;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
          && (("_empty".equals(consumedRoute) && "".equals(pattern.parentRoute())) || pattern.parentRouteRegex().matcher(consumedRoute).matches())) {
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
