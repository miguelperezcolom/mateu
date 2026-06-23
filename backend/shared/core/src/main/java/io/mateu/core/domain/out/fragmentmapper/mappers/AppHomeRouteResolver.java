package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.SneakyThrows;

final class AppHomeRouteResolver {

  @SneakyThrows
  static String getHomeRoute(
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    // An embedded mediator (an orchestrator rendered as a form field) carries its own home route
    // and server-side type explicitly. Honour them verbatim so the host page's route context does
    // not leak in and the embedded <mateu-ux> loads the orchestrator's own route.
    if (app.homeServerSideType() != null && app.homeRoute() != null) {
      var embeddedRoute = app.homeRoute();
      if (httpRequest.runActionRq().route().contains("?")) {
        embeddedRoute = addQueryParams(embeddedRoute, httpRequest);
      }
      return embeddedRoute;
    }
    var effectiveRoute = route;
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu) {
      effectiveRoute = app.homeRoute();
    } else {
      if ("".equals(effectiveRoute)
          || "/".equals(effectiveRoute)
          || effectiveRoute.endsWith("_page")
          || effectiveRoute.endsWith("_no_home_route")
          || effectiveRoute.equals(appRoute)) {
        effectiveRoute = app.homeRoute();
        if (effectiveRoute == null
            || effectiveRoute.endsWith("_no_home_route")
            || effectiveRoute.equals(appRoute)) {
          if (app.serverSideType() != null) {
            Class<?> appClass = Class.forName(app.serverSideType());
            if (appClass.isAnnotationPresent(HomeRoute.class)) {
              return appClass.getAnnotation(HomeRoute.class).value();
            }
          }
          if (app.homeRoute() != null) {
            return app.homeRoute();
          }
        }
      } else {
        if (!effectiveRoute.startsWith(app.route())) {
          effectiveRoute = app.route() + effectiveRoute;
        }
      }
    }
    if (effectiveRoute == null) {
      effectiveRoute = appRoute;
    }
    if (effectiveRoute.endsWith("_no_home_route")) {
      effectiveRoute = "_page";
    }
    if (httpRequest.runActionRq().route().contains("?")) {
      effectiveRoute = addQueryParams(effectiveRoute, httpRequest);
    }
    return effectiveRoute;
  }

  static String getHomeConsumedRoute(
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeConsumedRoute() != null ? app.homeConsumedRoute() : appRoute;
  }

  static String getHomeBaseUrl(
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeBaseUrl() != null
        ? app.homeBaseUrl()
        : (String) httpRequest.getAttribute("baseUrl");
  }

  static String getHomeServerSideType(
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    var provided =
        app.homeServerSideType() != null ? app.homeServerSideType() : app.serverSideType();
    if (provided == null) {
      var resolvedApp = httpRequest.getAttribute("resolvedApp");
      if (resolvedApp != null) {
        return resolvedApp.getClass().getName();
      }
    }
    return provided;
  }

  static String getHomeUriPrefix(
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    return app.homeUriPrefix();
  }

  static String getAppServerSideType(
      ComponentTreeSupplier componentSupplier,
      AppShell app,
      String route,
      String appRoute,
      HttpRequest httpRequest,
      Optional<Actionable> selectedOption) {
    if (componentSupplier != null) {
      return componentSupplier.getClass().getName();
    }
    var provided = app.serverSideType();
    if (provided == null) {
      var resolvedApp = httpRequest.getAttribute("resolvedApp");
      if (resolvedApp != null) {
        return resolvedApp.getClass().getName();
      }
    }
    return provided;
  }

  static String addQueryParams(String route, HttpRequest httpRequest) {
    if (httpRequest.getParameterNames().isEmpty()) {
      return route;
    }
    return route
        + "?"
        + httpRequest.getParameterNames().stream()
            .map(name -> name + "=" + httpRequest.getParameterValue(name))
            .collect(Collectors.joining("&"));
  }
}
