package io.mateu.mdd.demofrontoffice.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;

/**
 * The Front-Office Suite app shell: top menu with the four operational screens plus the two
 * application-context selectors — the persona switch ({@code Modo}, which drives every
 * {@code @Audience} projection because the field is named {@code audience}) and the active hotel.
 */
@UI("")
@Title("Front-Office Suite")
@io.mateu.uidl.annotations.HomeRoute("/bienvenida") // la home es la welcome page (Bienvenida)
@App(themeToggle = true) // variante AUTO: menú plano de RouteLinks → TABS (in-app navigation)
@io.mateu.uidl.annotations.Logo("/images/riu.svg")
@io.mateu.uidl.annotations.FavIcon("/images/riu.svg")
public class FrontOfficeSuite {

  public enum Modo {
    Staff,
    Cliente
  }

  public enum Hotel {
    PuntaCana,
    Bavaro,
    Aruba
  }

  // persona projection: naming this @AppContext field "audience" makes its value drive the
  // @Audience marks — unset → full view; Staff/Cliente → that audience's projection
  @AppContext(label = "Modo")
  Modo audience;

  @AppContext(label = "Hotel")
  Hotel hotel;

  @Menu
  RouteLink reservas =
      new RouteLink("/reservas", "Reservas").withIcon("vaadin:calendar-user");

  @Audience("Staff")
  @Menu
  RouteLink automatizaciones =
      new RouteLink("/automatizaciones", "Automatizaciones").withIcon("vaadin:tasks");
}
