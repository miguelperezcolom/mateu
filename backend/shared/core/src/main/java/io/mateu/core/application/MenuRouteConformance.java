package io.mateu.core.application;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.RouteTable;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

/**
 * Conformance check for menu routes: every route a menu leaf points at must resolve to a known
 * route. A leaf is a route or a rule — a route leaf that points nowhere is the failure this
 * catches, recovering the safety a typed-class {@code @Menu} reference used to give at compile time
 * (the class had to exist) now that a leaf can carry a plain route string.
 *
 * <p>Pure over the built menu and the known route table so it mirrors 1:1 in the ports and can be
 * asserted in a test / CI check. Only leaves that actually navigate LOCALLY are checked: a rule
 * leaf (runs client-side), a separator, a remote leaf (a federated app, not resolvable here), an
 * external URL and an empty placeholder are all skipped.
 */
public final class MenuRouteConformance {

  private MenuRouteConformance() {}

  /**
   * The absolute routes of leaves that resolve to no entry in {@code knownRoutes}, in menu order.
   */
  public static List<String> danglingRoutes(List<MenuOptionDto> menu, RouteTable knownRoutes) {
    return danglingRoutes(menu, route -> knownRoutes.match(route).isPresent());
  }

  /**
   * The general form: a route is fine when {@code resolvable} says so. This is what a CI/boot check
   * runs against the LIVE route resolution (a {@code RoutedClassResolver}, which also serves the
   * derived routes and the CRUD sub-routes) so a menu authored against real apps is validated the
   * way it will actually resolve, not only against the authored table.
   */
  public static List<String> danglingRoutes(
      List<MenuOptionDto> menu, Predicate<String> resolvable) {
    var dangling = new ArrayList<String>();
    collect(menu, resolvable, dangling);
    return dangling;
  }

  private static void collect(
      List<MenuOptionDto> menu, Predicate<String> resolvable, List<String> out) {
    if (menu == null) {
      return;
    }
    for (var option : menu) {
      if (option == null) {
        continue;
      }
      var submenus = option.submenus();
      if (submenus != null && !submenus.isEmpty()) {
        collect(submenus, resolvable, out); // a group, not a leaf — recurse
        continue;
      }
      if (option.separator()) {
        continue;
      }
      if (option.rules() != null && !option.rules().isEmpty()) {
        continue; // a rule leaf: runs client-side, does not navigate
      }
      if (option.remote()) {
        continue; // a federated app: resolved by the remote, not against this table
      }
      var route = option.route();
      if (route == null || route.isBlank() || isExternal(route)) {
        continue; // a placeholder, or an external URL — not a Mateu route
      }
      if (!resolvable.test(route)) {
        out.add(route);
      }
    }
  }

  private static boolean isExternal(String route) {
    return route.startsWith("http:") || route.startsWith("https:") || route.startsWith("//");
  }
}
