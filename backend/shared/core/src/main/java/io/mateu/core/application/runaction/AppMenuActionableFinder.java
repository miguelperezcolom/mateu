package io.mateu.core.application.runaction;

import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;

final class AppMenuActionableFinder {

  static Actionable find(
      AppShell app, String route, String consumedRoute, HttpRequest httpRequest) {
    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();
    var cleanRoute = route;
    if (route.startsWith(consumedRoute)) {
      cleanRoute = route.substring(consumedRoute.length());
    }
    return AppMenuResolver.resolveMenu(
        resolvedRoute,
        app.menu(),
        cleanRoute,
        ("_empty".equals(consumedRoute) ? app.route() : "") + route,
        httpRequest);
  }

  private AppMenuActionableFinder() {}
}
