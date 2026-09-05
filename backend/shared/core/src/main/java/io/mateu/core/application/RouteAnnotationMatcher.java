package io.mateu.core.application;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.UI;
import java.util.Optional;

/**
 * Matches a request route against a class's {@code @UI} mount. Inner routes are no longer
 * annotations — they live in {@code routes.yaml} and are resolved by the {@link RouteRegistry}
 * (consulted first by {@code DefaultRoutedClassResolver}), so the only annotation left to match
 * here is {@code @UI}.
 */
final class RouteAnnotationMatcher {

  static Optional<ResolvedRoute> matchesAbsolute(
      String route, Class<?> aClass, RunActionCommand command) {
    if (aClass.isAnnotationPresent(UI.class)
        && matches(command.baseUrl() + command.route(), aClass.getAnnotation(UI.class).value())) {
      return Optional.of(new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matchesApp(
      String route, Class<?> aClass, RunActionCommand command) {
    if (isApp(aClass, route)
        && aClass.isAnnotationPresent(UI.class)
        && matches(route, aClass.getAnnotation(UI.class).value())) {
      return Optional.of(new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matches(String route, Class<?> aClass, RunActionCommand command) {
    var cleanRoute = route;
    if (cleanRoute.startsWith(command.baseUrl())) {
      cleanRoute = cleanRoute.substring(command.baseUrl().length());
    }
    if (aClass.isAnnotationPresent(UI.class)
        && (matches(
                command.httpRequest().getAttribute("baseUrl") + route,
                aClass.getAnnotation(UI.class).value())
            || (command.httpRequest().getAttribute("baseUrl") + cleanRoute)
                .equals(aClass.getAnnotation(UI.class).value()))) {
      return Optional.of(new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
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
