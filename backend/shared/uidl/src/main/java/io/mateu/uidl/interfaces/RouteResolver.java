package io.mateu.uidl.interfaces;

import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

public interface RouteResolver {

  default boolean supportsRoute(String route) {
    for (Pattern pattern :
        getSupportedRoutesPatterns().stream()
            .sorted(Comparator.comparingInt(pattern -> pattern.pattern().length()))
            .toList()) {
      if (pattern.matcher(route).matches()) {
        return true;
      }
    }
    return false;
  }

  default int weight(String route) {
    if (route != null) {
      return route.split("/").length;
    }
    return Integer.MIN_VALUE;
  }

  Class<?> resolveRoute(String route, HttpRequest httpRequest);

  List<Pattern> getSupportedRoutesPatterns();
}
