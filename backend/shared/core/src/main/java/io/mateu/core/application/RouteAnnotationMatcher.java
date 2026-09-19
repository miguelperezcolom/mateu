package io.mateu.core.application;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.runaction.RunActionCommand;
import java.util.Optional;

/**
 * Matches a request route against a class's declared mount. A class declares its route with
 * {@code @UI("/path")} OR with {@code @App(route = "/path")} (coherence-plan #5) — resolved
 * uniformly by {@link RouteAnnotations#routeOf}. Inner routes are no longer annotations — they live
 * in {@code routes.yaml} and are resolved by the {@link RouteRegistry} (consulted first by {@code
 * DefaultRoutedClassResolver}).
 */
final class RouteAnnotationMatcher {

  static Optional<ResolvedRoute> matchesAbsolute(
      String route, Class<?> aClass, RunActionCommand command) {
    var pattern = RouteAnnotations.routeOf(aClass);
    if (pattern != null && matches(command.baseUrl() + command.route(), pattern)) {
      return Optional.of(new ResolvedRoute(route, pattern, aClass));
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matchesApp(
      String route, Class<?> aClass, RunActionCommand command) {
    var pattern = RouteAnnotations.routeOf(aClass);
    if (isApp(aClass, route) && pattern != null && matches(route, pattern)) {
      return Optional.of(new ResolvedRoute(route, pattern, aClass));
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matches(String route, Class<?> aClass, RunActionCommand command) {
    var cleanRoute = route;
    if (cleanRoute.startsWith(command.baseUrl())) {
      cleanRoute = cleanRoute.substring(command.baseUrl().length());
    }
    var pattern = RouteAnnotations.routeOf(aClass);
    if (pattern != null
        && (matches(command.httpRequest().getAttribute("baseUrl") + route, pattern)
            || (command.httpRequest().getAttribute("baseUrl") + cleanRoute).equals(pattern))) {
      return Optional.of(new ResolvedRoute(route, pattern, aClass));
    }
    return Optional.empty();
  }

  static boolean matches(String route, String pattern) {
    var regex = new StringBuilder();
    var tokens = pattern.split("/");
    for (var token : tokens) {
      if (token.startsWith(":")) {
        regex.append("([^/]+)");
      } else {
        regex.append(token);
      }
      regex.append("/");
    }
    regex.deleteCharAt(regex.length() - 1);
    return route.matches(regex.toString());
  }
}
