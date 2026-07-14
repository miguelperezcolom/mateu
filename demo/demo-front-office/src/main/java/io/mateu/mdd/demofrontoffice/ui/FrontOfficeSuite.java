package io.mateu.mdd.demofrontoffice.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;

/**
 * The Front-Office Suite app shell: top menu with the four operational screens plus the two
 * application-context selectors — the persona switch ({@code Modo}, which drives every
 * {@code @Audience} projection because the field is named {@code audience}) and the active hotel.
 */
@UI("")
@Title("Front-Office Suite")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
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

  @Menu RouteLink checkin = new RouteLink("/checkin", "Check-In");

  @Menu RouteLink checkout = new RouteLink("/checkout", "Check-Out");

  @Menu RouteLink enCasa = new RouteLink("/encasa", "En Casa");

  @Audience("Staff")
  @Menu
  RouteLink automatizaciones = new RouteLink("/automatizaciones", "Automatizaciones");

  @Label("")
  Component bienvenida =
      EmptyState.builder()
          .icon("🏨")
          .title("Front-Office Suite")
          .description(
              "Suite & Automation Engine — elige Check-In, Check-Out, En Casa o Automatizaciones"
                  + " en el menú.")
          .build();
}
