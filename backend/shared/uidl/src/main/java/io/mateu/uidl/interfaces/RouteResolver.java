package io.mateu.uidl.interfaces;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

public interface RouteResolver {

  default boolean supportsRoute(String route) {
    return getMatchingPattern(route).isPresent();
  }

  default Optional<Pattern> getMatchingPattern(String route) {
    for (Pattern pattern :
        getSupportedRoutesPatterns().stream()
            .sorted(Comparator.comparingInt(pattern -> pattern.pattern().length()))
            .toList()) {
      if (pattern.matcher(route).matches()) {
        return Optional.of(pattern);
      }
    }
    return Optional.empty();
  }

  default int weight(String route) {
    if (route != null) {
      var matchingPattern = getMatchingPattern(route);
      if (matchingPattern.isPresent()) {
        return matchingPattern.get().pattern().length();
      }
    }
    return Integer.MAX_VALUE;
  }

  Class<?> resolveRoute(String route, HttpRequest httpRequest);

  List<Pattern> getSupportedRoutesPatterns();
}
