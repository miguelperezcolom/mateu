package io.mateu.core.application;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.UI;

/**
 * The route a class declares (coherence-plan #5). A class may declare its base path with
 * {@code @UI("/path")} (the generic router) OR with {@code @App(route = "/path")} (the single
 * "declare an app" annotation). {@code @App(route)} WINS over {@code @UI(value)} when both are
 * present and non-blank; a value-less {@code @App} carries no route (its chrome decorates the
 * {@code @UI} route on the same class, exactly as before).
 */
public final class RouteAnnotations {

  private RouteAnnotations() {}

  /** The class's declared route, or {@code null} when it declares none. */
  public static String routeOf(Class<?> c) {
    var app = c.getAnnotation(App.class);
    if (app != null && app.route() != null && !app.route().isBlank()) {
      return app.route();
    }
    var ui = c.getAnnotation(UI.class);
    return ui != null ? ui.value() : null;
  }

  /** True when the class is routed — by {@code @UI}, or by {@code @App(route = ...)}. */
  public static boolean isRouted(Class<?> c) {
    return routeOf(c) != null;
  }
}
