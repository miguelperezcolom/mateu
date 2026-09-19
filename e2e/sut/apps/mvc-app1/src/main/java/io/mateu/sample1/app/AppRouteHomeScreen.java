package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The distinct home Screen the {@code @App(route = "/appdemo")} app points at (coherence-plan #5,
 * App ≠ its Home Screen). It lives UNDER the app's own mount (/appdemo/screen) — an app's home
 * Screen is a route within the app — so the App shell mounts it in its content slot. Its own routed
 * class, so the app's home fragment is typed with THIS class, not the app.
 */
@UI("/appdemo/screen")
@Title("App route home screen")
public class AppRouteHomeScreen {
  public String note = "App route home content";
}
