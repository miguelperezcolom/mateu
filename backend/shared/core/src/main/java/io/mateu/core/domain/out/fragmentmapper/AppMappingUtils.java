package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.CompiledRouteValue;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.List;
import java.util.regex.Pattern;

public class AppMappingUtils {

  public static int totalMenuOptions(List<MenuOptionDto> menu) {
    int total = 0;
    if (menu != null) {
      for (int index = 0; index < menu.size(); index++) {
        total++;
        var option = menu.get(index);
        total += totalMenuOptions(option.submenus());
      }
    }
    return total;
  }

  public static String getRoute(
      Object componentSupplier,
      Object instance,
      HttpRequest httpRequest,
      String route,
      String consumedRoute) {
    if (httpRequest.getAttribute("resolvedRoute") != null) {
      var resolvedRoute = (String) httpRequest.getAttribute("resolvedRoute");
      var baseUrl = (String) httpRequest.getAttribute("baseUrl");
      if (baseUrl != null && resolvedRoute.startsWith(baseUrl)) {
        return resolvedRoute.substring(baseUrl.length());
      }
      return resolvedRoute;
    }
    Class<?> instanceClass = instance.getClass();
    if (componentSupplier == null) {
      if (instance instanceof AppShell app) {
        if (app.serverSideType() != null && !"".equals(app.serverSideType())) {
          instanceClass = forName(app.serverSideType());
        }
      }
    }
    Pattern pattern = null;
    if (componentSupplier instanceof RouteResolver routeResolver) {
      pattern =
          routeResolver
              .matchingPattern(route, consumedRoute)
              .map(CompiledRouteValue::routeRegex)
              .orElse(null);
    }
    if (pattern == null) {
      pattern =
          AnnotationPatternFinder.findPattern(instance, instanceClass, componentSupplier, route);
    }
    if (pattern != null) {
      return RoutePatternAccumulator.accumulate(pattern, route);
    }
    return "/";
  }

  public static boolean isSelected(Actionable actionable, String appRoute, String route) {
    return isSelected(actionable, actionable.path(), appRoute, route);
  }

  /**
   * As {@link #isSelected(Actionable, String, String)}, comparing {@code path} — the entry's path
   * below its group, as the menu carries it — instead of the entry's own. An entry inside a group
   * is authored relative to it ({@code /roles} in {@code /users}); compared as authored, an entry
   * named like its group ({@code /users}) matched every route of the group and was selected on all
   * of them, and the others matched none.
   */
  public static boolean isSelected(
      Actionable actionable, String path, String appRoute, String route) {
    if (route != null && !route.isEmpty() && !appRoute.equals(route)) {
      if (path == null) {
        return false;
      }
      // The entry's path is relative to the app; a route that carries the app's own route (an
      // app reached at /e2-demo by a route /e2-demo/page) is compared below it, or no entry of a
      // non-root app is ever selected.
      // …and an entry authored WITH the app's route (/e2-demo/page, a code-authored AppShell's
      // natural spelling) is the same entry as its mount-relative spelling
      if (appRoute != null
          && !appRoute.isEmpty()
          && !"/".equals(appRoute)
          && path.startsWith(appRoute + "/")
          && matchesPath(path.substring(appRoute.length()), route)) {
        return true;
      }
      return matchesPath(path, route)
          || (appRoute != null
              && !appRoute.isEmpty()
              && !"/".equals(appRoute)
              && route.startsWith(appRoute + "/")
              && matchesPath(path, route.substring(appRoute.length())));
    }
    return actionable.selected();
  }

  private static boolean matchesPath(String path, String route) {
    return path.equals(route) || route.startsWith(path + "/");
  }
}
