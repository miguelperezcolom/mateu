package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

final class AppHomeRouteResolver {

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
    // A mediator asked for a record INSIDE its listing has already worked out its own home route:
    // the whole path, id included. What arrives here as `route` is only the part route resolution
    // consumed — the listing — so preferring it drops the record the link names and opens the list.
    // Strictly more specific only: an equal route, or one that is not an extension of it, is left
    // to the rules below.
    if (app.homeRoute() != null
        && !"".equals(route)
        && app.homeRoute().startsWith(route)
        && app.homeRoute().length() > route.length()) {
      effectiveRoute = app.homeRoute();
    }
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
          // The home route is the app's first menu item (carried on app.homeRoute()); there is no
          // longer a @HomeRoute annotation to consult.
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
    // R2 (App ≠ its Home Screen, coherence-plan #5): the home is a Screen the App points at, not
    // the
    // App itself. When the effective home route resolves to a DIFFERENT routed class than the App
    // (a multi-screen app whose home is a distinct route), THAT class is the home Screen and the
    // home
    // fragment is typed with it. A single-screen app (home == the app), a home with no backing
    // Screen
    // (a bare menu link / statically-served route), or an unresolvable home keeps the App's own
    // type
    // — so this only de-conflates the case that actually has a separate home Screen; everything
    // else
    // is byte-identical.
    var homeClass =
        resolveHomeScreenClass(
            getHomeRoute(app, route, appRoute, httpRequest, selectedOption), httpRequest);
    if (homeClass != null && !homeClass.equals(app.serverSideType())) {
      return homeClass;
    }
    if (provided == null) {
      var resolvedApp = httpRequest.getAttribute("resolvedApp");
      if (resolvedApp != null) {
        return resolvedApp.getClass().getName();
      }
    }
    return provided;
  }

  /**
   * The fully-qualified class the home ROUTE resolves to (the home Screen), or {@code null} when
   * the home has no distinct backing Screen — a home-fragment sentinel ({@code _page}/{@code
   * _no_home_route}), a blank route, or a route no routed class answers. Never throws: a home that
   * cannot be typed must not break the app render, it just keeps the App's own type.
   */
  private static String resolveHomeScreenClass(String homeRoute, HttpRequest httpRequest) {
    if (homeRoute == null
        || homeRoute.isBlank()
        || homeRoute.endsWith("_page")
        || homeRoute.endsWith("_no_home_route")) {
      return null;
    }
    try {
      var resolver = MateuBeanProvider.getBean(RoutedClassResolver.class);
      if (resolver == null) {
        return null;
      }
      var baseUrl = (String) httpRequest.getAttribute("baseUrl");
      var command =
          new RunActionCommand(
              baseUrl != null ? baseUrl : "",
              null,
              homeRoute,
              null,
              null,
              Map.of(),
              Map.of(),
              null,
              httpRequest,
              null,
              null);
      return resolver
          .resolve(homeRoute, command)
          .map(ResolvedRoute::resolvedClass)
          .filter(Objects::nonNull)
          .map(Class::getName)
          .orElse(null);
    } catch (Throwable t) {
      return null;
    }
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
