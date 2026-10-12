package io.mateu.core.application.runaction;

import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;

import io.mateu.core.application.RouteAnnotations;
import io.mateu.core.infra.reflection.ClassLoaders;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.Humanizer;
import io.mateu.uidl.annotations.Menu;

/**
 * Routes inside a mount are RELATIVE to it: the app served at {@code /e2-demo} receives {@code
 * /page} for its {@code @Menu page} entry. A route that also carries the mount itself ({@code
 * /e2-demo/page}, the URL path a link, a {@code NavigateTo} or another client composed) names the
 * same place, but read relative to the mount it does not: the mount prefix resolves to the app (the
 * route matcher strips the base url for that comparison), so the app is answered for its own
 * content, its home is the route as it came — and the client, following that home, asks for the app
 * again. A non-root app looped on its menu entries that way, while a root app (whose base url is
 * empty) could not tell the two forms apart and never did.
 *
 * <p>So a mount-prefixed route sent to the mount's own controller is made relative before anything
 * resolves it — only when it is unambiguous:
 *
 * <ul>
 *   <li>the base url is a non-root path and the app the controller serves is mounted exactly there
 *       and IS an app;
 *   <li>the consumed route is relative too ({@code ""} / {@code _empty}) — a federated shell that
 *       mounts a remote with route AND consumed route both prefixed ({@code /remote/page}, {@code
 *       /remote}) already speaks one consistent frame and is left alone;
 *   <li>the request names no type, or names the app itself (a page's own actions are untouched);
 *   <li>no {@code @Menu} field of the app is called like the mount's segment, the one case in which
 *       {@code /e2-demo/...} could also be a route of its own inside the app.
 * </ul>
 */
final class MountPrefixedRoutes {

  private MountPrefixedRoutes() {}

  static RunActionCommand relativize(RunActionCommand command) {
    var relative = relativeRoute(command);
    return relative == null ? command : command.withRoute(relative);
  }

  /** The route relative to the mount, or null when it is not a mount-prefixed route to strip. */
  static String relativeRoute(RunActionCommand command) {
    var baseUrl = mountPath(command.baseUrl());
    var route = command.route();
    if (baseUrl == null || route == null || !route.startsWith(baseUrl + "/")) {
      return null;
    }
    var consumed = command.consumedRoute();
    if (consumed != null && !consumed.isEmpty() && !"_empty".equals(consumed)) {
      return null;
    }
    if (command.uiId() == null || command.uiId().isBlank()) {
      return null;
    }
    Class<?> app;
    try {
      app = ClassLoaders.forName(command.uiId());
    } catch (Throwable t) {
      return null;
    }
    var sst = command.serverSideType();
    if (sst != null && !sst.isEmpty() && !sst.equals(app.getName())) {
      return null;
    }
    var relative = route.substring(baseUrl.length());
    if (!baseUrl.equals(RouteAnnotations.routeOf(app)) || !isApp(app, relative)) {
      return null;
    }
    var segment = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
    if (hasMenuFieldNamed(app, segment)) {
      return null;
    }
    return relative;
  }

  /** The base url when it is a non-root PATH ({@code /e2-demo}), null otherwise. */
  private static String mountPath(String baseUrl) {
    if (baseUrl == null || baseUrl.contains("://")) {
      return null;
    }
    var path = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    return path.startsWith("/") && path.length() > 1 ? path : null;
  }

  private static boolean hasMenuFieldNamed(Class<?> app, String segment) {
    for (Class<?> type = app; type != null && type != Object.class; type = type.getSuperclass()) {
      for (var field : type.getDeclaredFields()) {
        if (MetaAnnotations.isPresent(field, Menu.class)
            && (field.getName().equals(segment)
                || Humanizer.toKebabCase(field.getName()).equals(segment))) {
          return true;
        }
      }
    }
    return false;
  }
}
