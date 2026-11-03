package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.ComponentState.setResolvedPath;

import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

public class HomeRouteResolver {

  public static Optional<Actionable> getSelectedOption(
      String appRoute,
      String route,
      Collection<? extends Actionable> menu,
      HttpRequest httpRequest) {
    return getSelectedOption(route, menu, httpRequest, appRoute);
  }

  public static Optional<Actionable> getSelectedOption(
      String route,
      Collection<? extends Actionable> actionables,
      HttpRequest httpRequest,
      String prefix) {
    if (route.startsWith(prefix)) {
      route = route.substring(prefix.length());
    }
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var token = route.split("/")[0];
    if (!"".equals(token)) {
      token = "/" + token;
      for (Actionable actionable : actionables) {
        if (token.equals(actionable.path())) {
          String cleanPrefix = !"".equals(prefix) && !"/".equals(prefix) ? prefix : "";
          if (actionable instanceof Menu menu) {
            return getSelectedOption(
                Arrays.stream(route.split("/")).skip(1).collect(Collectors.joining("/")),
                menu.submenu(),
                httpRequest,
                cleanPrefix + token);
          }
          if (actionable instanceof RemoteMenu remoteMenu) {
            return Optional.of(remoteMenu);
          }
          setResolvedPath(httpRequest, cleanPrefix + token);
          return Optional.of(actionable);
        }
      }
    }
    return Optional.empty();
  }

  /**
   * Like {@link #getSelectedOption} but for a route that points at a menu <em>group</em> itself (no
   * trailing leaf) — e.g. {@code /workflow}, whose children are {@code /workflow/...}. Returns the
   * {@link Menu} whose accumulated path equals the route, or empty if the route reaches a leaf or
   * matches nothing. Used to render a section-index page instead of "Not found".
   */
  public static Optional<Menu> getSelectedGroup(
      String route, Collection<? extends Actionable> actionables, String prefix) {
    if (route.startsWith(prefix)) {
      route = route.substring(prefix.length());
    }
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var token = route.split("/")[0];
    if (!"".equals(token)) {
      token = "/" + token;
      for (Actionable actionable : actionables) {
        if (actionable instanceof Menu menu && token.equals(groupPath(menu))) {
          var remaining = Arrays.stream(route.split("/")).skip(1).collect(Collectors.joining("/"));
          if (remaining.isBlank()) {
            return Optional.of(menu);
          }
          String cleanPrefix = !"".equals(prefix) && !"/".equals(prefix) ? prefix : "";
          return getSelectedGroup(remaining, menu.submenu(), cleanPrefix + token);
        }
      }
    }
    return Optional.empty();
  }

  /**
   * Whether a LEAF of the menu names {@code route} as its own, explicitly: a {@link RouteLink}
   * whose {@code route} is exactly it ({@code {type: RouteLink, label: All launches, route:
   * launches}}), at whatever depth it sits. A group's route is only derived (from its path or its
   * label), so when a leaf claims the same route — «Launches › All launches» going to {@code
   * /launches} — the leaf's page wins and the group's section index is not served there.
   *
   * <p>Both sides are compared mount-relative: an entry may spell its route with the app's own
   * route in front ({@code /covnav/reports}, the shape of a {@code @Menu String} field) or without
   * it ({@code reports}, the YAML shape). External URLs never claim an in-app route, and a {@link
   * RemoteMenu} is not descended into (what lies below it is the remote's to declare).
   */
  public static boolean isClaimedByLeafRoute(
      String route, Collection<? extends Actionable> actionables, String appRoute) {
    if (route == null || actionables == null) {
      return false;
    }
    var target = mountRelative(route, appRoute);
    return !target.isEmpty() && leafClaims(target, actionables, appRoute);
  }

  private static boolean leafClaims(
      String target, Collection<? extends Actionable> actionables, String appRoute) {
    for (Actionable actionable : actionables) {
      if (actionable instanceof Menu menu) {
        if (menu.submenu() != null && leafClaims(target, menu.submenu(), appRoute)) {
          return true;
        }
      } else if (actionable instanceof RouteLink link
          && link.route() != null
          && !link.route().isBlank()
          && !link.route().contains("://")
          && !link.route().startsWith("//")
          && target.equals(mountRelative(link.route(), appRoute))) {
        return true;
      }
    }
    return false;
  }

  /** The route without query, surrounding slashes and the app's own route in front. */
  private static String mountRelative(String route, String appRoute) {
    var path = route;
    var query = path.indexOf('?');
    if (query >= 0) {
      path = path.substring(0, query);
    }
    path = path.replaceAll("^/+", "").replaceAll("/+$", "");
    var mount = appRoute == null ? "" : appRoute.replaceAll("^/+", "").replaceAll("/+$", "");
    if (!mount.isEmpty()) {
      if (path.equals(mount)) {
        return "";
      }
      if (path.startsWith(mount + "/")) {
        return path.substring(mount.length() + 1);
      }
    }
    return path;
  }

  /**
   * The segment a group answers at: its path, or — a group authored as data ({@code type: Menu}
   * with only a {@code label}) has none — its label camel-cased, exactly what the menu sends
   * (AppMenuDtoBuilder.getPath: "Solar system" → {@code /solarSystem}). Matching only the declared
   * path left every data-authored group route "Page not found".
   */
  public static String groupPath(Menu menu) {
    var path =
        menu.path() != null ? menu.path() : io.mateu.uidl.Humanizer.toCamelCase(menu.label());
    return path == null || path.startsWith("/") ? path : "/" + path;
  }

  static String getHomeUriPrefix(Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.path();
    }
    return null;
  }

  static String getHomeConsumedRoute(
      String appRoute, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.consumedRoute();
    }
    return appRoute;
  }

  static String getHomeServerSideType(
      Object instance, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.serverSideType();
    }
    return null;
  }

  static String getHomeBaseUrl(String baseUrl, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.baseUrl();
    }
    return null;
  }

  static String getHomeRoute(
      Object instance, Optional<Actionable> selectedOption, HttpRequest httpRequest) {
    return getHomeRoute(instance, selectedOption, httpRequest, null);
  }

  static String getHomeRoute(
      Object instance,
      Optional<Actionable> selectedOption,
      HttpRequest httpRequest,
      String appRoute) {
    var prefix = "";
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      prefix = remoteMenu.path();
      return httpRequest.runActionRq().route();
    }
    if (instance instanceof HomeRouteSupplier homeRouteSupplier) {
      return homeRouteSupplier.homeRoute().substring(prefix.length());
    }
    if (instance instanceof AppShell app) {
      return app.homeRoute();
    }
    if (instance instanceof AppSupplier appSupplier) {
      return appSupplier.getApp(httpRequest).homeRoute();
    }
    // A record master declared as a route with CHILDREN in the registry: reached on its own
    // (/customers/7) it opens its default tab — the child its `defaultChild:` names, else the
    // first one — instead of an empty slot.
    var defaultChild =
        io.mateu.core.application.runaction.RouteChains.defaultChildPath(appRoute, httpRequest);
    if (defaultChild != null) {
      return defaultChild;
    }
    return "_no_home_route";
  }
}
