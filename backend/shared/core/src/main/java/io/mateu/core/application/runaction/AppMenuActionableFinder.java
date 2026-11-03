package io.mateu.core.application.runaction;

import io.mateu.core.domain.out.componentmapper.HomeRouteResolver;
import io.mateu.uidl.data.Menu;
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

  /** The menu group a route points at (has children, no page of its own), or {@code null}. */
  static Menu findGroup(AppShell app, String route, String consumedRoute, HttpRequest httpRequest) {
    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();
    var cleanRoute = route;
    if (route.startsWith(consumedRoute)) {
      cleanRoute = route.substring(consumedRoute.length());
    }
    return HomeRouteResolver.getSelectedGroup(cleanRoute, app.menu(), resolvedRoute).orElse(null);
  }

  /**
   * Whether a leaf of the app's menu names this route as its own (see {@link
   * HomeRouteResolver#isClaimedByLeafRoute}): then the route is that entry's page, not the section
   * index of a group whose derived route happens to be the same.
   */
  static boolean isClaimedByLeaf(
      AppShell app, String route, String consumedRoute, HttpRequest httpRequest) {
    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();
    var cleanRoute = route;
    if (consumedRoute != null && route.startsWith(consumedRoute)) {
      cleanRoute = route.substring(consumedRoute.length());
    }
    return HomeRouteResolver.isClaimedByLeafRoute(cleanRoute, app.menu(), resolvedRoute)
        || HomeRouteResolver.isClaimedByLeafRoute(route, app.menu(), resolvedRoute);
  }

  private AppMenuActionableFinder() {}
}
