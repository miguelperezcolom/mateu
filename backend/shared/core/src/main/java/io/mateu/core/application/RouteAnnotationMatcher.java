package io.mateu.core.application;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.annotations.UI;
import java.util.Arrays;
import java.util.Optional;

final class RouteAnnotationMatcher {

  static Optional<ResolvedRoute> matchesAbsolute(
      String route, Class<?> aClass, RunActionCommand command) {
    if (aClass.isAnnotationPresent(UI.class)) {
      if (matches(command.baseUrl() + command.route(), aClass.getAnnotation(UI.class).value())) {
        return Optional.of(
            new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
      }
    }
    if (aClass.isAnnotationPresent(Routes.class)) {
      for (Route annotation : aClass.getAnnotation(Routes.class).value()) {
        if (matches(route, annotation.value())
            && (annotation.parentRoute().equals(RouteConstants.NO_PARENT_ROUTE)
                || annotation.parentRoute().equals(command.consumedRoute()))
            && (annotation.uis().length == 0
                || Arrays.stream(annotation.uis()).anyMatch(u -> u.equals(command.baseUrl())))) {
          return Optional.of(new ResolvedRoute(route, annotation.value(), aClass));
        }
      }
    }
    if (aClass.isAnnotationPresent(Route.class)) {
      var annotation = aClass.getAnnotation(Route.class);
      if (matches(route, annotation.value())
          && (annotation.parentRoute().equals(RouteConstants.NO_PARENT_ROUTE)
              || annotation.parentRoute().equals(command.consumedRoute()))
          && (annotation.uis().length == 0
              || Arrays.stream(annotation.uis()).anyMatch(u -> u.equals(command.baseUrl())))) {
        return Optional.of(new ResolvedRoute(route, annotation.value(), aClass));
      }
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matchesApp(
      String route, Class<?> aClass, RunActionCommand command) {
    if (isApp(aClass, route)) {
      if (aClass.isAnnotationPresent(UI.class)) {
        if (matches(route, aClass.getAnnotation(UI.class).value())) {
          return Optional.of(
              new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
        }
      }
      if (aClass.isAnnotationPresent(Routes.class)) {
        for (Route annotation : aClass.getAnnotation(Routes.class).value()) {
          if (matches(route, annotation.value())) {
            return Optional.of(new ResolvedRoute(route, annotation.value(), aClass));
          }
        }
      }
      if (aClass.isAnnotationPresent(Route.class)) {
        if (matches(route, aClass.getAnnotation(Route.class).value())) {
          return Optional.of(
              new ResolvedRoute(route, aClass.getAnnotation(Route.class).value(), aClass));
        }
      }
    }
    return Optional.empty();
  }

  static Optional<ResolvedRoute> matches(String route, Class<?> aClass, RunActionCommand command) {
    var cleanRoute = route;
    if (cleanRoute.startsWith(command.baseUrl())) {
      cleanRoute = cleanRoute.substring(command.baseUrl().length());
    }
    if (aClass.isAnnotationPresent(UI.class)) {
      if (matches(
              command.httpRequest().getAttribute("baseUrl") + route,
              aClass.getAnnotation(UI.class).value())
          || (command.httpRequest().getAttribute("baseUrl") + cleanRoute)
              .equals(aClass.getAnnotation(UI.class).value())) {
        return Optional.of(
            new ResolvedRoute(route, aClass.getAnnotation(UI.class).value(), aClass));
      }
    }
    if (aClass.isAnnotationPresent(Routes.class)) {
      for (Route annotation : aClass.getAnnotation(Routes.class).value()) {
        if ((matches(route, annotation.value()) || cleanRoute.equals(annotation.value()))
            && (annotation.uis().length == 0
                || Arrays.stream(annotation.uis()).anyMatch(u -> u.equals(command.baseUrl())))) {
          return Optional.of(new ResolvedRoute(route, annotation.value(), aClass));
        }
      }
    }
    if (aClass.isAnnotationPresent(Route.class)) {
      if ((matches(route, aClass.getAnnotation(Route.class).value())
              || cleanRoute.equals(aClass.getAnnotation(Route.class).value()))
          && (aClass.getAnnotation(Route.class).uis().length == 0
              || Arrays.stream(aClass.getAnnotation(Route.class).uis())
                  .anyMatch(u -> u.equals(command.baseUrl())))) {
        return Optional.of(
            new ResolvedRoute(route, aClass.getAnnotation(Route.class).value(), aClass));
      }
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
