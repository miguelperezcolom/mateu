package io.mateu.explorer.examples.behaviour.homeroutes;

import io.mateu.explorer.examples.behaviour.shellvariants.GuestsPage;
import io.mateu.explorer.examples.behaviour.shellvariants.RoomsPage;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The home is the screen an app opens on. A {@link HomeRouteSupplier} names it — here the SECOND
 * menu entry. Without one, the home is the first navigable menu leaf; a YAML mount says it with
 * {@code home: <route>}.
 */
@UI("/x/behaviour/home-routes")
@Title("Concierge")
@App(AppVariant.MENU_ON_TOP)
public class ConciergeApp implements HomeRouteSupplier {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Override
  public String homeRoute() {
    return "guests";
  }
}
