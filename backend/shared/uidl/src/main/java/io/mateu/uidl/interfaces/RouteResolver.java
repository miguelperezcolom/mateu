package io.mateu.uidl.interfaces;


import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

public interface RouteResolver {

  default boolean supportsRoute(String route, String consumedRoute) {
    return matchingPattern(route, consumedRoute).isPresent();
  }

  default Optional<Pattern> matchingPattern(String route, String consumedRoute) {
    // System.out.println("" + getClass().getSimpleName() + "-> route: " + route + ", consumedRoute:
    // " + consumedRoute);
    for (Pair<Pattern, Pattern> pattern :
        supportedRoutesPatterns().stream()
            .sorted(Comparator.comparingInt(pattern -> pattern.first().pattern().length()))
            .toList()) {
      if (pattern.first().matcher(route).matches()
          && ("_empty".equals(consumedRoute)
              || pattern.second() == null
              || pattern.second().matcher(consumedRoute).matches())) {
        // System.out.println("" + getClass().getSimpleName() + "-> route: " + route + ",
        // consumedRoute: " + consumedRoute + " MATCHED");
        return Optional.of(pattern.first());
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
        return matchingPattern.get().pattern().length();
      }
    }
    return Integer.MAX_VALUE;
  }

  Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest);

  List<Pair<Pattern, Pattern>> supportedRoutesPatterns();
}
