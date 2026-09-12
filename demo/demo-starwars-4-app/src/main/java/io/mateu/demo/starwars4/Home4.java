package io.mateu.demo.starwars4;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The app shell. {@code @App(commandCenter = true)} adds the always-present command-center FAB — a
 * full-screen palette unifying navigation, recent screens and search — on top of the ordinary menu.
 * Each {@code @Menu} field is a routed screen. {@link HomeRouteSupplier} declares which one is the
 * landing route when the app opens at its root (here, the dashboard).
 */
@UI("")
@Title("Star Wars — app shell")
@App(commandCenter = true)
public class Home4 implements HomeRouteSupplier {

  @Menu GalaxyDashboard dashboard;

  @Menu Planets planets;

  @Override
  public String homeRoute() {
    return "dashboard";
  }
}
