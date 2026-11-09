package io.mateu.explorer.examples.behaviour.menusincode;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import java.util.ArrayList;
import java.util.List;

/**
 * A menu computed at request time — from configuration, the user, a database — instead of static
 * {@code @Menu} fields: a {@link MenuSupplier} on the app class returns it. Its leaves point at
 * routes that are ALSO authored in code ({@link HotelRoutes}). The Explorer's own shell is built
 * the same way, from its catalogue.
 */
@UI("/x/behaviour/menus-in-code")
@Title("Hotel chain")
@App(AppVariant.MENU_ON_LEFT)
public class HotelChainApp implements MenuSupplier {

  /** "the database" */
  static final List<String[]> HOTELS =
      List.of(new String[] {"palma", "Palma"}, new String[] {"ibiza", "Ibiza"}, new String[] {"lisbon", "Lisbon"});

  @Override
  public List<Actionable> menu(HttpRequest httpRequest) {
    var hotels = new ArrayList<Actionable>();
    for (var hotel : HOTELS) {
      hotels.add(new RouteLink("/hotels/" + hotel[0], hotel[1]));
    }
    return List.of(new Menu("/hotels", "Hotels (" + HOTELS.size() + ")", hotels));
  }
}
