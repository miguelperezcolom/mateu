package io.mateu.core.domain.out.fragmentmapper;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import java.util.regex.Pattern;

final class AnnotationPatternFinder {

  static Pattern findPattern(
      Object instance, Class<?> instanceClass, Object componentSupplier, String route) {
    Pattern pattern = null;
    if (instance != null && instanceClass.isAnnotationPresent(Route.class)) {
      for (Route routeAnnotation : instanceClass.getAnnotationsByType(Route.class)) {
        pattern = matchIfValid(routeAnnotation.value(), route);
      }
    }
    if (pattern == null
        && componentSupplier != null
        && componentSupplier.getClass().isAnnotationPresent(Route.class)) {
      for (Route routeAnnotation : componentSupplier.getClass().getAnnotationsByType(Route.class)) {
        pattern = matchIfValid(routeAnnotation.value(), route);
      }
    }
    if (pattern == null && instance != null && instance.getClass().isAnnotationPresent(UI.class)) {
      for (UI routeAnnotation : instance.getClass().getAnnotationsByType(UI.class)) {
        pattern = matchIfValid(routeAnnotation.value(), route);
      }
    }
    return pattern;
  }

  private static Pattern matchIfValid(String patternString, String route) {
    if (!patternString.endsWith(".*")) {
      patternString += ".*";
    }
    var pattern = Pattern.compile(patternString);
    return pattern.matcher(route).matches() ? pattern : null;
  }

  private AnnotationPatternFinder() {}
}
