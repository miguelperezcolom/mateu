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

  /**
   * Whether {@code route} matches the declared {@code pattern}, where a {@code :name} segment
   * matches any one segment and every other segment is LITERAL — a {@code .} in {@code /v1.0} is a
   * dot, not "any character". The compiled pattern is cached: the declared routes are a finite set
   * (one per routed class) and this runs for every provider on every request.
   */
  static boolean matches(String route, String pattern) {
    return COMPILED
        .computeIfAbsent(pattern, RouteAnnotationMatcher::compile)
        .matcher(route)
        .matches();
  }

  private static final java.util.Map<String, java.util.regex.Pattern> COMPILED =
      new java.util.concurrent.ConcurrentHashMap<>();

  static java.util.regex.Pattern compile(String pattern) {
    // "/" splits into NO tokens (String.split drops trailing empties): it is the root, the same as
    // "" — it used to reach deleteCharAt(-1) and throw on every request.
    var regex = new java.util.StringJoiner("/");
    for (var token : pattern.split("/")) {
      regex.add(token.startsWith(":") ? "([^/]+)" : java.util.regex.Pattern.quote(token));
    }
    return java.util.regex.Pattern.compile(regex.toString());
  }
}
